---
layout: posts
title: "Curriculum Learning: Training Agents the Way Humans Teach"
date: 2027-03-02 09:00:00 -0700
tags: [machine-learning, reinforcement-learning, deep-learning, training]
excerpt: "A good teacher doesn't start with the hardest problems. They build up from simple cases to complex ones. It turns out this intuition applies directly to training neural networks and RL agents — and ignoring it can make training fail entirely."
---

When you train a reinforcement learning agent from scratch in a complex environment, you often run into a wall. The environment is too hard. The agent wanders randomly, never accidentally achieves the goal, gets no positive reward signal, and learns nothing. You can let it run for days and it makes no progress. Curriculum learning is the most practical solution I've found for this problem — and it turns out the intuition behind it mirrors what good teachers have always known.

## The Core Problem: Sparse Rewards

In a simple environment — a gridworld with a visible goal — an agent exploring randomly will stumble into the goal state fairly quickly and start learning. In a complex environment — a robot that needs to pick up an object, open a door, and place the object in a specific room — random exploration never reaches the rewarding state at all. The probability of achieving the full task by chance is essentially zero.

This is the **sparse reward problem**. Without any reward signal, the agent has nothing to learn from. Gradient descent requires a signal to follow. No signal, no learning.

Two standard approaches:

**Reward shaping:** Add dense intermediate rewards that guide the agent toward the goal. Works, but requires careful hand-engineering — poorly designed intermediate rewards can lead the agent to optimize for the proxy rather than the actual goal.

**Curriculum learning:** Structure the training process. Start the agent in situations where it can succeed, build competence incrementally, and progressively expose it to harder cases.

## What Curriculum Learning Is

A curriculum is a sequence of tasks or environments, ordered from easy to hard. The agent trains on the simple versions first, develops basic competencies, and then those competencies transfer to the harder versions.

The formal intuition: if you train on a population of tasks sampled uniformly from easy to hard, most samples early in training are too hard and produce no useful signal. A curriculum focuses early training on tasks where the agent can make progress — where the gradient is informative — and only introduces harder tasks as competence develops.

This mirrors how humans learn. You don't teach calculus before algebra. You don't teach sight-reading a Beethoven sonata before scales. Scaffolding — building knowledge on top of previous knowledge — is the efficient path.

## Automatic Curriculum Generation

The naive approach is to manually define a sequence of tasks. This works but requires domain knowledge and effort. More robust approaches generate the curriculum automatically.

### Self-Play

Self-play, used famously in AlphaGo and OpenAI Five, is a curriculum in disguise. The agent plays against a copy of itself from a previous checkpoint. As the agent improves, so does the opponent — creating a continuously calibrated challenge. Neither too easy (the agent always wins) nor too hard (the agent never wins).

```python
# Pseudocode for self-play curriculum
population = [initial_policy]

for generation in range(max_generations):
    current_agent = population[-1]
    
    # Sample opponents from past policies (slightly easier opponents dominate early)
    opponent = sample_opponent(population)
    
    # Collect rollouts playing against sampled opponent
    rollouts = collect_rollouts(current_agent, opponent, n_episodes=1000)
    
    # Update current agent
    current_agent = ppo_update(current_agent, rollouts)
    
    # Periodically add to population
    if generation % checkpoint_every == 0:
        population.append(current_agent.copy())
```

### Automatic Domain Randomization with Difficulty Tracking

For robotics and physical environments, you can parameterize the environment's difficulty (mass of objects, friction, obstacle count, goal distance) and automatically adjust it based on the agent's success rate.

A simple adaptive curriculum:

```python
class AdaptiveCurriculum:
    def __init__(self, initial_difficulty=0.1, target_success_rate=0.5):
        self.difficulty = initial_difficulty
        self.target = target_success_rate
        self.recent_successes = []
    
    def update(self, success: bool):
        self.recent_successes.append(success)
        if len(self.recent_successes) > 100:
            self.recent_successes.pop(0)
        
        if len(self.recent_successes) < 20:
            return  # not enough data yet
        
        current_rate = sum(self.recent_successes) / len(self.recent_successes)
        
        if current_rate > self.target + 0.1:
            self.difficulty = min(1.0, self.difficulty + 0.05)
        elif current_rate < self.target - 0.1:
            self.difficulty = max(0.0, self.difficulty - 0.05)
    
    def get_env_config(self):
        return {
            "goal_distance": 1.0 + self.difficulty * 9.0,  # 1m to 10m
            "n_obstacles": int(self.difficulty * 10),
            "wind_strength": self.difficulty * 0.5
        }
```

The agent gets an environment whose difficulty is calibrated to keep it at roughly 50% success rate — always challenged, never overwhelmed.

### PAIRED and Adversarial Curricula

More sophisticated approaches use a second agent (the "teacher") to generate tasks that are challenging for the student. The teacher is rewarded for creating tasks that the student fails on but a reference agent can succeed at — this prevents the teacher from creating impossible tasks.

This is the approach used in PAIRED (Protagonist Antagonist Induced Regret Environment Design) and related work. The resulting curricula are often more diverse and more targeted than hand-designed ones.

## Practical Observations

**Start simpler than you think necessary.** The most common curriculum design mistake is underestimating how hard the simplest version of the task is. When my agent wasn't learning, I kept making the task harder incrementally. Eventually I simplified all the way back to: the goal is right next to the spawn point. The agent learned that in minutes, and I could build up from there.

**Don't progress too fast.** If you increase difficulty before the agent has truly mastered the current level, you get catastrophic forgetting — the agent abandons what it learned in favor of partially adapting to the new difficulty. Track not just recent success rate but variance. A 50% success rate with high variance is a different situation than 50% success rate with low variance.

**Replay easy tasks.** Once you advance to harder tasks, still occasionally sample easy ones. This is similar to spaced repetition in human learning — periodic review prevents forgetting. In practice this means sampling from a mixture of all past difficulty levels, weighted toward the current level.

**Curriculum and reward shaping compound.** Combining a curriculum with shaped rewards gives you the best of both. The curriculum ensures the agent is in states where the shaped reward fires; the shaped reward gives signal within each curriculum stage.

## Where It Applies Beyond RL

Curriculum learning transfers to supervised learning too. When training on a hard dataset (imbalanced classes, noisy labels, rare examples), ordering your training data can matter:

- **Easy examples first:** start with high-confidence, clean examples to learn basic representations, then introduce noisy or ambiguous ones.
- **Hard example mining:** identify the examples the model is currently failing on and oversample them.
- **Progressive training:** start with a simpler model architecture or lower-resolution inputs, then scale up.

The theoretical justification is that the loss landscape for hard examples early in training pushes the model into poor regions of parameter space. Easy examples first gives the model a better initialization from which to then handle the hard cases.

## Wrapping Up

Curriculum learning is the insight that *how* you present training data matters as much as what data you use. By ordering tasks from easy to hard, maintaining a target success rate, and mixing in reviews of past material, you can train agents and models on problems that naive random training never makes progress on. It's one of the most practically impactful techniques I've used for RL problems with sparse rewards.

Next month I'm switching to game dev one last time: multithreading in games, and how modern engines keep frame rates alive by doing many things at once.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
