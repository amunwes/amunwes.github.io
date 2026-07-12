---
layout: posts
title: "Game AI: From Finite State Machines to Neural Agents"
date: 2027-02-02 09:00:00 -0700
tags: [game-dev, ai, game-ai, design]
excerpt: "Game AI and academic AI are almost entirely separate fields. Game AI cares about performance, predictability, and feeling fun — not optimality. Here's how it actually works, from FSMs to neural agents."
---

When people hear "game AI" they often imagine AlphaGo or an agent that learned to play Dota at superhuman levels. Those examples exist, but they're not representative of how AI works in the games you've actually played. Skyrim's NPCs aren't running neural networks. The enemies in Halo aren't trained with reinforcement learning. Most game AI is FSMs and behavior trees, and that's the right choice for most problems.

## What Game AI Is Actually Trying to Do

Academic AI optimization is about finding optimal solutions. Game AI optimization is about something quite different: **creating the illusion of intelligence while feeling fun to play against**.

This leads to counterintuitive design decisions:

- Enemies that could see the player at extreme range intentionally don't, so the player has time to react
- Chess AI that plays at a difficulty level below its actual ceiling, with calibrated mistakes
- Patrol NPCs that take predictable routes, so stealth players can learn and exploit them

An NPC that played with perfect information and optimal strategy would be impossible to beat and not fun. Game AI is often *intentionally imperfect* — it's theater, not optimization.

## Finite State Machines

The oldest and still widely used approach. An FSM defines a set of states (Idle, Patrol, Alert, Attack, Flee) and transitions between them (e.g., `Patrol → Alert` when player is within hearing range, `Alert → Attack` when player is in line of sight).

```python
class EnemyFSM:
    def __init__(self):
        self.state = "patrol"
        self.player_visible = False
        self.health = 100
    
    def update(self, player_distance, player_visible):
        self.player_visible = player_visible
        
        if self.state == "patrol":
            if player_distance < 10 and not player_visible:
                self.state = "alert"
            elif player_visible:
                self.state = "attack"
        
        elif self.state == "alert":
            if player_visible:
                self.state = "attack"
            elif player_distance > 20:
                self.state = "patrol"
        
        elif self.state == "attack":
            if self.health < 20:
                self.state = "flee"
            elif not player_visible and player_distance > 15:
                self.state = "alert"
        
        elif self.state == "flee":
            if self.health > 50:
                self.state = "patrol"
        
        return self.state
```

FSMs are easy to understand, easy to debug, and completely predictable — which is exactly what you want for game AI. You can trace exactly why an NPC made a decision by following the state transitions. Players can learn the FSM and feel clever for exploiting it.

The limitation is combinatorial explosion. A complex NPC with many states and conditions becomes a tangle of transitions. This is where behavior trees help.

## Behavior Trees

Behavior trees (BTs) replaced FSMs as the dominant approach for complex character AI in the mid-2000s (Halo 2 was an early prominent user). They organize decisions as a tree of nodes, each of which returns Success, Failure, or Running.

Node types:
- **Selector** (`?`): tries children left to right, succeeds as soon as one succeeds
- **Sequence** (`→`): runs children left to right, succeeds only if all succeed
- **Leaf nodes**: conditions (`IsPlayerVisible?`) or actions (`AttackPlayer`)

A simple enemy AI tree might look like:

```
Selector
├── Sequence (Attack behavior)
│   ├── IsPlayerVisible?
│   ├── IsInAttackRange?
│   └── AttackPlayer
├── Sequence (Chase behavior)
│   ├── IsPlayerVisible?
│   └── MoveTowardsPlayer
├── Sequence (Alert behavior)
│   ├── HeardNoise?
│   └── InvestigateNoise
└── Patrol
```

Every frame, this tree is ticked from the root. The Selector tries each child in order, picking the first that succeeds. If the player is visible and in range, the attack sequence runs. If visible but not in range, the enemy chases. If a noise was heard, it investigates. Otherwise it patrols.

BTs compose more cleanly than FSMs for complex behavior — you can build reusable subtrees (a "CombatBehavior" subtree that can be dropped into any enemy) and the tree structure makes the intent readable.

## Goal-Oriented Action Planning (GOAP)

For more autonomous-feeling AI, **GOAP** lets NPCs plan sequences of actions to achieve goals. The NPC has a world state (a set of facts about the world), a set of goals (desired world states), and a set of actions (each with preconditions and effects). The planner finds a sequence of actions to get from the current world state to the goal.

F.E.A.R. (2005) used GOAP to great effect — its enemies would coordinate flanking maneuvers, use cover, and react to the player in ways that felt genuinely tactical. The system didn't require hand-authoring every tactical scenario; the planner discovered them from the available actions.

The tradeoff: GOAP is more expensive to run (planning is a search problem) and harder to author than behavior trees. It's the right choice when you want emergent, adaptive behavior and can afford the complexity.

## When Neural Networks Make Sense in Games

Rarely, in commercial games — but the cases where they do are interesting:

**Procedural animation.** Machine learning (specifically motion matching and learned inverse kinematics) is increasingly used to produce natural-looking character movement without hand-authoring every animation. Games like FIFA use learned models for physically plausible player motion.

**Opponent modeling.** Learning a model of how a specific player plays and adapting difficulty accordingly is a natural ML application. This is different from making an AI that "plays optimally" — it's making an AI that responds to the individual.

**Content generation.** Learned models for generating terrain, dialogue variation, or enemy behaviors that adapt to player style are active research areas.

The reason ML isn't the default for game AI: determinism and performance. A neural network has non-deterministic behavior that's hard to debug, and running inference on complex networks for hundreds of NPCs every frame is expensive. FSMs and BTs run in microseconds. This gap is closing but it still matters.

## Practical Lessons

The game AI projects I've worked on taught me a few things that don't show up in academic treatments:

**Perception is the hard part.** Most "AI" problems in games are actually perception problems — figuring out what the NPC should know. Line-of-sight checks, hearing radius, memory of last-seen positions, communication between NPCs. The decision-making given correct perception is usually straightforward. The challenge is making perception feel natural (not omniscient, not blind) and believable.

**Failure states are features.** An enemy that can be confused, fooled, or distracted is more interesting than one that behaves optimally. Design your AI with intentional failure modes that give players agency.

**Budget everything.** In a frame of 16ms, AI can't have an unlimited share. Profile early, set per-character budgets, and use level-of-detail techniques (simpler AI for NPCs far from the player, full AI only for nearby/important characters).

## Wrapping Up

Game AI is a separate discipline from academic AI, with different goals and different constraints. FSMs and behavior trees dominate because they're performant, debuggable, and produce predictable behavior that designers can tune. Neural networks are increasingly relevant for specific problems — procedural animation, adaptive difficulty — but they're not the default, and usually not the right choice for core NPC decision-making.

Next month I'm back in ML with curriculum learning — a training technique that mirrors how humans teach, and why starting with the hard problems first usually backfires.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
