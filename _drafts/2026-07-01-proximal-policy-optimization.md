---
layout: posts
title: "Proximal Policy Optimization: How PPO Tames the Chaos of RL Training"
date: 2026-07-01 09:00:00 -0700
tags: [machine-learning, reinforcement-learning, deep-learning]
excerpt: "Training a reinforcement learning agent feels a lot like trying to teach someone to ride a bike by only telling them when they fall. PPO is the algorithm that makes this actually work at scale — here's how."
---

Training a reinforcement learning agent feels a lot like teaching someone to ride a bike by only telling them when they fall down. The feedback is sparse, delayed, and the student can easily overcorrect and make things worse. For a long time, making RL work reliably at scale was more black art than science. Proximal Policy Optimization (PPO) is the algorithm that changed that — and after using it in a recent project, I wanted to write up how it actually works and why it matters.

## The Problem With Naive Policy Gradient Methods

Before PPO, there was REINFORCE — the vanilla policy gradient method. The idea is elegant: run an agent through an environment, collect rewards, and nudge the policy in the direction of actions that got high rewards. Formally, you're trying to maximize the expected return:

```
J(θ) = E[Σ r_t]
```

To do that, you compute a gradient and take a step:

```
∇J(θ) = E[∇ log π_θ(a|s) · R_t]
```

The intuition is clean — increase the log-probability of actions that led to good outcomes, decrease it for bad ones. The problem is that this approach is wildly unstable in practice.

Here's why: the gradient is estimated from a batch of experience collected with the *current* policy. After you update the policy, that experience is stale — collected by a different policy than the one you just updated to. If you take a large gradient step, you can overshoot and land somewhere terrible. The new policy might be so different from the old one that all your experience is no longer representative, and the next gradient estimate is garbage. Training collapses.

This is sometimes called the **step size problem**, and it's not a minor issue. A step too small and training crawls; a step too large and you break the policy irreparably. There's no obvious way to know in advance which is which.

## Trust Region Policy Optimization (TRPO)

The theoretical solution came in 2015 with Trust Region Policy Optimization (TRPO). The insight was: instead of taking a gradient step of arbitrary size, enforce a constraint that the new policy can't be *too different* from the old one. Specifically, keep the KL divergence between the old and new policy below some threshold ε:

```
maximize: E[π_new(a|s) / π_old(a|s) · Â(s,a)]
subject to: KL(π_old || π_new) ≤ ε
```

Here `Â` is the **advantage function** — an estimate of how much better action `a` is compared to what the policy would do on average in state `s`. Using advantage instead of raw return reduces variance significantly.

TRPO works. It's stable, it respects the trust region, and it has nice theoretical guarantees. The downside is that solving the constrained optimization problem requires computing second-order derivatives (the Fisher information matrix), which is expensive and complicated to implement. It's not something you want to debug at 2am.

## PPO: The Practical Fix

PPO, introduced by Schulman et al. at OpenAI in 2017, achieves most of TRPO's stability without the implementation complexity. The key idea: instead of explicitly constraining the KL divergence, just *clip* the objective so that large updates become less rewarding.

The PPO clipped objective looks like this:

```
L_CLIP(θ) = E[ min(r_t(θ) · Â_t,  clip(r_t(θ), 1-ε, 1+ε) · Â_t) ]
```

Where `r_t(θ)` is the probability ratio between the new and old policy:

```
r_t(θ) = π_θ(a_t | s_t) / π_θ_old(a_t | s_t)
```

Let's unpack what the clipping does. If an action had a positive advantage (it was better than expected), you want to increase its probability — but the `clip` caps how much credit you can take for it if the new policy has already moved far from the old one (`r > 1+ε`). The `min` means the gradient becomes zero past that point, so you stop pushing. The same logic applies in reverse for actions with negative advantage.

In practice, ε is usually set to 0.2. This creates a kind of soft trust region without any constrained optimization — just a clipped loss function.

## Actor-Critic Architecture

In practice, PPO is almost always implemented as an **actor-critic** method. You have two networks (or one network with two heads):

- **Actor**: outputs a policy — a probability distribution over actions given the current state
- **Critic**: outputs a value estimate `V(s)` — the expected return from state `s`

The critic's job is to produce a baseline for computing the advantage. A common estimator is **Generalized Advantage Estimation (GAE)**:

```
Â_t = δ_t + (γλ)δ_{t+1} + (γλ)²δ_{t+2} + ...
```

Where `δ_t = r_t + γV(s_{t+1}) - V(s_t)` is the TD error. The hyperparameter λ controls the tradeoff between bias (low λ) and variance (high λ).

The full PPO loss combines three terms:

```
L = L_CLIP - c₁ · L_VF + c₂ · S[π_θ]
```

- `L_VF` is the value function loss (MSE between predicted and actual returns)
- `S[π_θ]` is an entropy bonus to encourage exploration
- `c₁` and `c₂` are coefficients you tune

## The Training Loop

PPO's training loop is where it becomes practical. Unlike on-policy methods that throw away data after one update, PPO reuses each batch of experience for K epochs of gradient updates. As long as the policy doesn't drift too far (enforced by the clipping), this is valid:

```python
for iteration in range(num_iterations):
    # Collect rollouts with current policy
    rollouts = collect_experience(env, actor, n_steps)
    
    # Compute advantages
    advantages = compute_gae(rollouts, critic)
    
    # Multiple epochs of updates on the same batch
    for epoch in range(K_epochs):
        for minibatch in sample_minibatches(rollouts):
            loss = ppo_loss(minibatch, advantages)
            optimizer.zero_grad()
            loss.backward()
            optimizer.step()
```

This reuse of data makes PPO significantly more sample-efficient than vanilla policy gradients.

## What I Learned From My Project

Implementing PPO on my own project taught me a few things that don't show up in the paper:

**Reward shaping matters more than the algorithm.** I spent hours tuning PPO hyperparameters when the real issue was that my reward signal was too sparse. Dense, informative rewards make training faster and more stable regardless of what algorithm you're using.

**Normalize your advantages.** Subtracting the mean and dividing by the standard deviation of the advantage estimates within each minibatch makes training dramatically more stable. It's one line of code and a huge difference in practice.

**Watch your entropy.** If the entropy of your policy collapses early in training, the agent has committed to a suboptimal behavior before it's explored enough. The entropy bonus coefficient `c₂` needs to be high enough to prevent premature convergence.

**The clip ratio ε = 0.2 is a good default, but not sacred.** For environments with high-variance rewards I found slightly lower values (0.1–0.15) worked better.

## Wrapping Up

PPO is popular for good reason. It solves a genuinely hard problem — stable policy gradient training — with a surprisingly simple mechanism: just clip the objective and stop rewarding large deviations from the old policy. It's not the theoretically cleanest algorithm, but it's robust, fast to implement, and works across a wide range of environments. That combination is hard to beat.

If you're getting into RL, PPO is the right place to start. The full paper is worth reading — it's short and clearly written. My implementation for this project is up on [GitHub](https://github.com/amunwes) if you want to poke at it.

Next month I'll be breaking down how neural networks actually learn — backpropagation, gradient descent, and why the math is less scary than it looks.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
