---
layout: posts
title: "Multithreading in Games: Keeping the Frame Rate Alive"
date: 2027-04-06 09:00:00 -0700
tags: [game-dev, performance, multithreading, engine]
excerpt: "A modern game frame packs physics, AI, rendering, animation, and audio into 16 milliseconds. The only way to fit it all in is to do multiple things at once. Here's how game engines handle concurrency."
---

A 60fps game has 16.67 milliseconds per frame. In that window, the engine needs to process player input, run AI for every NPC, simulate physics, evaluate animations, submit draw calls to the GPU, and handle audio. On a single thread, sequentially, this is impossible for any non-trivial game. Multithreading is how modern engines make it work — and it's a different kind of concurrency problem than most software engineering contexts prepare you for.

## Why Games Are Hard to Parallelize

The obvious approach — take each system (physics, AI, rendering) and run it in its own thread — runs into an immediate problem: these systems share data. The physics system moves a character; the animation system needs to know where the character is; the rendering system needs the final position to draw the character. If all three run simultaneously and read/write position concurrently, you get data races.

Game state is deeply interconnected. An NPC's AI reads its own position and the player's position; its physics simulation depends on the AI output; its animation depends on the physics result; and the renderer reads the final transform. This is a dependency chain that can't easily run in parallel.

The solution game engines use is not "run everything in parallel" — it's "identify what *can* run in parallel and structure the frame around those opportunities."

## The Classic Game Loop

Before multithreading, the game loop was strictly sequential:

```
while running:
    process_input()
    update_ai()
    update_physics()
    update_animations()
    submit_render()
    wait_for_frame_end()
```

This is still the conceptual model. Each system runs one after another, so dependencies are implicit and safe. The performance ceiling is whatever a single CPU core can do in 16ms.

## The Job System

Modern engines (Unreal, Unity's DOTS, id Tech, Frostbite) use a **job system** — a pool of worker threads that pull tasks from a queue.

Instead of "run physics," the physics system submits hundreds of small independent jobs — "simulate this rigid body," "solve this constraint," "detect collision between these two objects." These jobs go into a queue, worker threads pull from it, and the results feed into the next phase.

```python
# Conceptual pseudocode — real implementations use C++ atomics, fibers, etc.

class JobSystem:
    def __init__(self, num_threads):
        self.queue = ConcurrentQueue()
        self.workers = [WorkerThread(self.queue) for _ in range(num_threads)]
    
    def submit(self, jobs):
        fence = Fence(len(jobs))
        for job in jobs:
            self.queue.push((job, fence))
        return fence
    
    def wait(self, fence):
        fence.wait_until_complete()

# Frame update
def update_frame(entities):
    # Kick off independent jobs
    ai_fence = job_system.submit([AIJob(e) for e in entities])
    
    # Wait for AI to finish (physics depends on AI output)
    job_system.wait(ai_fence)
    
    # Now submit physics jobs (can run in parallel for each entity)
    physics_fence = job_system.submit([PhysicsJob(e) for e in entities])
    job_system.wait(physics_fence)
    
    # Animations can start as soon as physics finishes per entity,
    # but in practice are batched for cache efficiency
    anim_fence = job_system.submit([AnimJob(e) for e in entities])
    job_system.wait(anim_fence)
    
    render(entities)  # submit draw calls
```

The key insight: within each phase (AI, physics, animations), the work for each entity is independent and can run fully parallel across all CPU cores. You get a massive speedup without any of those jobs needing to synchronize with each other.

## Frame Pipelining

Another technique: overlap different phases of *consecutive frames*.

Frame N and Frame N+1 don't have to wait for each other entirely. While the GPU is rendering Frame N (which takes several milliseconds), the CPU can start the simulation work for Frame N+1.

```
CPU: [Simulate N] → [Simulate N+1] → [Simulate N+2] →
GPU:              → [Render N]     → [Render N+1]   →
```

This overlap introduces one frame of latency (the input you process this frame doesn't appear on screen until the next frame), which is acceptable for most games but not for VR (where latency must be minimized). Modern engines use double- or triple-buffering of game state to enable this without data hazards.

## ECS and Cache Coherence

A structural approach to enabling parallelism is **Entity Component System (ECS)** architecture. Instead of objects that own their data, data is stored in contiguous arrays organized by component type.

All position components are stored in one array. All velocity components in another. All AI state in another. When the physics system runs, it streams through the position and velocity arrays sequentially — every access is a cache hit. When the AI system runs, it touches AI state and position — again, sequential array accesses.

This matters because memory access patterns are often the bottleneck in game simulation. Cache misses (accessing memory that isn't in the CPU's cache) can cost 100-200 cycles each. If your 1000 NPCs are scattered across memory in separate heap-allocated objects, iterating over them involves 1000 cache misses. If they're in a contiguous array, it's one cache warm-up and then sequential streaming.

ECS enables parallelism because systems operate on specific component combinations, and if two systems don't share components, they can run fully in parallel.

```
// Pseudocode: two systems with no shared components run simultaneously
parallel:
    AISystem(reads: Position, writes: AIState)
    ParticleSystem(reads: ParticleState, writes: ParticleState)
```

## Race Conditions in Games

The hardest part of game threading is avoiding data races without killing performance. The tools:

**Read-write separation.** Physics writes entity positions during simulation; the renderer reads positions for draw calls. Instead of locking, many engines maintain two copies of the transform data: the "game state" (written this frame) and the "render state" (read this frame, copied from last frame's game state). The renderer is always one frame behind — acceptable for most cases.

**Atomic operations.** For simple counters and flags (health points, enemy count), `std::atomic` types in C++ provide thread-safe reads and writes without locks.

**Lock-free job dependencies.** Job systems use atomic fence counters (decrement when a job completes, trigger dependent jobs when counter hits zero) rather than mutex-based synchronization. Locks block threads; lock-free designs keep workers running.

**No shared mutable state within a phase.** The strongest guarantee: within a given parallel phase (e.g., "update all AI"), each job only reads shared input and writes to its own output. No two jobs write to the same memory. Structuring code this way eliminates the possibility of races within a phase.

## Things That Bite You

**Non-determinism.** Multithreaded code is non-deterministic in the order jobs complete. If your game logic depends on execution order, bugs will appear only sometimes, only on certain hardware, and be nearly impossible to reproduce. ECS and job dependencies enforce a deterministic result even from parallel execution — worth the architectural investment.

**Overhead of spawning threads.** Thread creation is expensive. Job systems amortize this by keeping a fixed pool of workers alive for the whole session. Never create a thread per frame or per entity.

**False sharing.** Two threads writing to variables that happen to share a cache line will force each other's caches to invalidate — even though they're writing to "different" variables. Align hot per-thread data to cache line boundaries (typically 64 bytes).

## Wrapping Up

Multithreading in games is about finding parallelism in the frame budget — and that parallelism is mostly within phases (per-entity AI, physics, animation jobs) and across frames (CPU/GPU overlap). The job system is the workhorse: a pool of threads, a task queue, and atomic fences for dependency ordering. ECS data layout maximizes cache efficiency and makes parallel safety explicit. The result is a frame budget that scales with CPU core count, which is the only way to keep modern games running at 60fps.

That wraps up the core planned series. More posts are coming — attention mechanisms, procedural generation, ECS in depth, and plenty more. If there's something you'd like to see covered first, let me know on LinkedIn.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
