---
layout: posts
title: "What even are Neural Networks?"
date: 2026-07-07 09:00:00 -0700
tags: [machine-learning, deep-learning, neural-networks]
excerpt: "Backpropagation sounds intimidating until you realize it's just the chain rule applied repeatedly. Here's how a neural network actually updates its weights — and why it works."
---

Everyone who's ever dipped a toe into machine learning or tried to learn about AI has probably heard of a neural network. But what actually is a neural network, and how does the machine learn? 
I feel like I should be able to explain that and so as an exercise decided to take a crack at it in my own words — partly to help myself really understand it, partly in case it helps someone else too.


## What Is a Neuron?

At its core, a neuron is a node for passing signals. 

In the human brain, it's a cell that receives an electrical impulse and transmits that inpulse to nearby neurons. In machine learning, it's a function, it takes an input transforms it and passes the output to other neighboring neurons with varying strength.

A simplified neuron can be represented by the following function:

$$
y = w_1x_1 + w_2x_2 + \dots + w_nx_n + b
$$

That weighted sum is the raw signal a neuron computes from its inputs and passes to it's neighboring neurons as input. 
Depending on how the network is trained, that sum could represent litterally anything: 
- how "cat-like" an image looks 
- How much static in an audio clip resembles rain vs a crowd
- Or it could represent nothing interpretable at all! Just some tangled combination of edges, textures, and statistical quirks that only makes sense in combination with a thousand other neurons.

An individual neuron essentially captures a vibe that will nudge the network in the right direction.


## Neuron Layers

Much like Ogres, Neural Networks have layers.

You may have guessed this by now, but a single neuron itself isnt very powerful. The human brain contains 86 billion neurons for a reason. 

When you touch something, hear something, see something, your related sensory cells provide input to the the related neurons. Depending on how they've learned to interpret those signals those neurons begin firing and sending signals to their neighbors. Causing a cascade of information we understand as thought. 

A Neural network copies this idea in a more 2 dimensional fashion. Instead of a 3-dimensional cloud of neighboring neurons we create inter-connected layers of neurons.

> We are only talking about basic Neural networks here, I'll talk about layerless and sparse neural networks in another post. 
More complex network architectures like NEAT and BDH, connect neurons more similarly to an organic brain 

### The Input Layer
TODO: add pics


A bio neuron takes an electrical impulse delivered from a sensory organ like your eyes, ears, nose, or skin. This input helps our brain perceive the world outside our body and decide how to react. 

Much the same way, an artificial neuron receives input from us. When building the neural network we define what the input represents: pixels, words, categories, board-state whatever the problem calls for. These are typically refered to as features.

This is the input layer, our set of neurons that take input from whatever observable variables we are trying to use to inform the machines decision. As the entry point for the network each neuron is responsible for taking input from only a single feature.

### The Output Layer

The Output layer is the group of Neurons that map to the result of our machines decision. Just like the input we need 1 neuron for every variable we are expecting to get. This is the networks final answer: a classification, a predicted value, a decision, a word, a group of settings. This is the moment the raw sensory noise has been distilled down to a single conclusion. 

### The Hidden Layers

Hidden Layers sit between input and output. This is where the real work happens: each layer takes what the previous layer handed it and combines it into something more abstract. Raw pixels become edges, edges become shapes, shapes become object parts. This is where the neurons really start to lose their identity and instead start representing vibes.

## The Activation Function

A bio neuron doesn't just pass its input along untouched. It decides when to fire based on how strong and how frequently the incoming signal is received.
That decision is nonlinear, a neuron may learn to hold back or fire with strength not proportional to the input or do something else.

This non-linearity is very important.
Consider the layers of neurons we've introduced: if every neuron were just a weighted sum (`y = wx + b`), stacking layers wouldn't capture non-linear behavior very well and we would run into issues during training. Mathematically, stacking linear functions will always result in a linear function so the network won't be able to answer correctly if the answer doesn't follow a straight line or flat plane from the input.

An **activation function** is the fix. It takes a neuron's raw weighted sum and decides how much of it actually gets passed on to the next layer critically, it does that in a non-straight-line way. Bend the signal even a little at every single neuron, and stacking layers stops being pointless: each layer can bend the data a bit further than the last, until the network can approximate wildly complicated shapes instead of just straight lines and flat planes.

For a single neuron, the fuller computation looks like this:

```
output = activation(w₁x₁ + w₂x₂ + ... + wₙxₙ + b)
```

A couple of the popular choices for how a neuron "decides to fire":

TODO: insert pics of functions
- **Sigmoid** — squashes anything into a smooth range between 0 and 1. Closer to how a biological neuron gradually ramps up its firing rate.
- **ReLU** — much blunter: if the signal's negative, fire nothing; if it's positive, pass it through untouched. Dumber than sigmoid, but it turns out to work great in practice, and it's cheap to compute.

Either way, the effect is the same: every neuron gets a little bit of "personality" in how it reacts, and that's what gives the whole network the flexibility to learn something more interesting than a straight line.

## Training

Now that we know what a network looks like structurally, how does it actually learn to do anything? Right now, every weight in this thing is just a random number. A freshly initialized network is basically all noise.

Training is the process of nudging those weights from "random garbage" to "something useful," one example at a time. Show the network an input, look at what it guessed, compare that to the answer you actually wanted, and adjust the weights that were responsible for the mistake. Do that enough times across enough examples and the noise starts to organize itself into something that reacts correctly.

The question is: how do you set the weights so that the network produces useful outputs?

## The Loss Function

You can't set weights by hand for anything beyond a toy problem. Instead, you define a **loss function** — a number that measures how wrong the network's final outputs are and then you work to minimize that loss.

For regression, that's often mean squared error and for classification, it's usually cross-entropy loss. As the problem being solved gets more abstract the loss function tends toward some quantifiable part of the output. ie. blunders in a game of chess, score in a video game.

The details vary, but the point is the same: a loss of zero means perfect predictions; higher loss means worse predictions. Your goal is to find the weights that minimize this number.

## Gradient Descent

In order to minimize our loss we often employ a technique known as gradient descent. The idea behind gradient descent involves thinking about our inputs to the network like an n-dimensional grid, where every point on the grid has a height representing the output of our loss function for those inputs.

The way you move downhill on this grid is called a **gradient descent**. The gradient of the loss with respect to the weights tells you which direction is uphill — so you step in the opposite direction:

```
w ← w - α · ∂L/∂w
```

Here α is the **learning rate** — a hyperparameter controlling step size. Too large and you may overshoot. The algorithm may bounce around jumping past the local minima and shooting back up the hill, oscilating up and downhill never reaching the local minima. Too small and training takes forever or may get stuck in local minima missing out on a much more optimal global minimum. 

The gradient tells you how much changing each weight would change the loss. If `∂L/∂w` is large and positive for some weight, increasing that weight makes things worse, so you decrease it. If it's large and negative, you increase it. The network slowly adjusts every weight to reduce its mistakes.

In practice you don't compute the gradient over your entire dataset at once (that's expensive). Instead you use **mini-batch stochastic gradient descent**: compute the gradient on a small random batch of examples, take a step, move to the next batch, repeat. This introduces noise but is dramatically faster and, counter-intuitively, often generalizes better.

## Backpropagation

The hard part is computing `∂L/∂w` for every weight in a network that might have millions of parameters. This is what backpropagation does.

Backprop is an application of the **chain rule** from calculus. The chain rule says: if you have a composition of functions f(g(x)), the derivative is:

```
d/dx f(g(x)) = f'(g(x)) · g'(x)
```

A neural network is exactly a composition of functions, each layer transforms the previous layer's output. The loss is a function of the final layer's output, which is a function of the second-to-last layer, which is a function of... all the way back to the inputs.

Backprop works in two passes:

**Forward pass:** compute the output of every layer, store the intermediate activations. This is just a normal prediction.

**Backward pass:** starting from the loss, propagate gradients backward through the network layer by layer, applying the chain rule at each step. Each layer computes how much its inputs contributed to the loss and passes that signal backward.

For a layer with weights `W` and input `x`:

```
∂L/∂W = ∂L/∂output · ∂output/∂W = δ · xᵀ
```

Where `δ` is the gradient flowing in from the layer ahead. Each layer accumulates a gradient for its weights, and at the end of the backward pass you have `∂L/∂w` for every parameter in the network.

## Practical Things That Actually Matter

**Vanishing and exploding gradients.** The chain rule multiplies many small (or large) numbers together as gradients flow backward through layers. If those numbers are consistently less than 1, the gradients shrink exponentially. The weights near the input barely update. This is the vanishing gradient problem. If those numbers are instead not properly bounded and are allowed to go far above 1 then we encounter the exploding gradient problem.

Back in 2010, the ReLU activation function became popular for it's ability to solve the vanishing gradient problem unlocking major advances in training deep neural networks. 
Since ReLu passes positive signals through untouched, its slope is a constant 1, so multiplying by it at every layer doesn't shrink the gradient. The signal can travel back through many layers without fading out.
Other modern fixes to the vanishing/exploding gradient problem include: residual connections (ResNets), batch normalization, and careful weight initialization schemes like He or Glorot initialization.

**Weight initialization.** Starting all weights at zero is a bad idea. Every neuron computes the same thing and updates identically, so the network never differentiates. Random initialization breaks this symmetry. The scale of the initialization matters: too large and activations saturate early; too small and the signal dies out in the forward pass.

**Batch normalization.** Normalizing the inputs to each layer during training. Zero mean, unit variance  keeps the activations in a range where gradients flow cleanly. In practice it dramatically speeds up training and makes networks less sensitive to the learning rate.

**Learning rate schedules.** A fixed learning rate is rarely optimal. Starting high (for fast progress early) and decaying it over time (for precise convergence later) is standard practice. Warmup + cosine decay is a common schedule for training large models.


## Wrapping Up

I think Neural networks are so incredibly interesting, they are a fundamental piece of most modern machine learning algorithms/models. When people talk about training a model or AI they are almost always talking about tuning and optimizing the weights in a neural network. 

Neural networks learn by repeatedly asking: "how wrong am I, and what should i tweak to be less wrong?" Backpropagation computes the answer, gradient descent takes the step, and after enough iterations across enough data, the network has weights that make useful predictions. It's not magic — it's calculus, applied at scale.

Thanks for reading this far and humoring me in this exercise. I'm hoping to start doing a monthly tech/personal interest piece

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
