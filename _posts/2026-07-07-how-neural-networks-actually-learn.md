---
layout: posts
title: "What even are Neural Networks?"
date: 2026-07-07 09:00:00 -0700
tags: [machine-learning, deep-learning, neural-networks]
excerpt: "Backpropagation sounds intimidating until you realize it's just the chain rule applied repeatedly. Here's how a neural network actually updates its weights — and why it works."
---

Everyone who's ever dipped a toe into machine learning or tried to learn about AI has probably heard of a neural network. But what actually is a neural network? and how does the machine learn? 
I feel like I should be able to explain that and so as an exercise decided to take a crack at it in my own words — partly to help myself really understand it, partly in case it helps someone else too.


## What Is a Neuron?

Let's start with what a neuron in the __**Neural**__ Network is.

At its core, a neuron is a node for passing signals. In the human brain, it's a cell that receives input and decides whether to pass that signal on to other neurons. In machine learning, it's a function, it takes an input transforms it and passes the output to other neighboring neurons — the same basic idea, minus the biology.


At its core a machine learning Neuron is a generic function of weights and bias that takes an input and produces an output.

$$
y = w_1x_1 + w_2x_2 + \dots + w_nx_n + b
$$

That weighted sum is the raw signal a neuron computes from its inputs and sends off. That sum could represent literally anything depending on how the network is trained. It could be a neuron that represents: 
- how "cat-like" an image looks 
- the probability the next word in a sentence is a name
- How much a paragraph reads like it was written at 2am
- How much static in an audio clip resembles rain vs a crowd
- How "urgent" an email sounds
- Or it could represent nothing interpretable at all — some tangled combination of edges, textures, and statistical quirks that only makes sense in combination with a thousand other neurons.

Neurons are essentially vibes.


## Neuron Layers

Much like Ogres, Neural Networks have layers.

You may have guessed this by now, but a single neuron itself isnt very powerful. The human brain contains 86 billion neurons for a reason. 

When your brain gets a sensory signal the neurons related to that sense all start firing off and talking to their neighboring neurons. Passing the signal off and from neighbor to neighbor each neuron reacting how they have learned to respond to that signal and causing cascading reactions. 

A Neural network copies this idea in a more organized fashion, instead of a 3-dimensional cloud of neighboring neurons we create inter connected layers of neurons. 
> We are only talking about basic Neural networks here, I'll talk about layerless and sparse neural networks in another post. If interested NEAT and BDH are 2 algorithms used to design neural networks that learn and work more similarly to the synaptic processes in a biological brain.

### The Input Layer
TODO: add pics


To push the bio analogy: a biological neuron may take in sensory input — sight, sound, touch — An artificial neuron works the same way. Instead of just sensory input, we define what the input represents — pixels, words, categories —, whatever the problem calls for.

This is what we call the input layer, our set of neurons that take input from whatever observable variables we are trying to use to inform the machines decision. As this is the entry point for the network each neuron must be mapped 1-1 with each observable variable (our features)

### The Output Layer

The Output layer is the group of Neurons that map to the result of our machines decision. Just like the input we need 1 neuron for every variable we are expecting to get out of the model. This is the networks final answer: a classification, a predicted value, a decision, a word, a group of settings. This is the moment the raw sensory noise has been distilled down to a single conclusion. 

### The Hidden Layers

Hidden Layers sit between input and output. This is where the real work happens: each layer takes what the previous layer handed it and combines it into something more abstract. Raw pixels become edges, edges become shapes, shapes become object parts. This is where the neurons really start to lose their identity and instead start representing vibes.

## The Activation Function

Back to the biology for a second: a real neuron doesn't just pass its input along untouched. It decides — based on how strong the incoming signal is — whether to fire at all, and how strongly. A weak signal might do nothing. A strong one might fire hard. That decision is nonlinear: it's not a straight-line reaction to the input.

Now that we've got layers stacked on top of each other, here's why that matters: if every neuron were just a weighted sum (`y = wx + b`), stacking layers wouldn't buy you anything. Mathematically, a pile of straight lines is still just a straight line — no matter how many layers deep you go, a network built only out of weighted sums can only ever learn relationships that look like a straight line or a flat plane, which is not exactly the kind of pattern most interesting problems need.

An **activation function** is the fix. It takes a neuron's raw weighted sum and decides how much of it actually gets passed on to the next layer — and critically, it does that in a non-straight-line way. Bend the signal even a little at every single neuron, and stacking layers stops being pointless: each layer can bend the data a bit further than the last, until the network can approximate wildly complicated shapes instead of just straight lines and flat planes.

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

Now that we know what a network looks like structurally — layers of neurons, each with its own nonlinear kick from an activation function — how does it actually get good at anything? Right now, every weight in this thing is just a random number. A freshly initialized network is basically all noise.

Training is the process of nudging those weights from "random garbage" to "something useful," one example at a time. Show the network an input, look at what it guessed, compare that to the answer you actually wanted, and adjust the weights that were responsible for the mistake. Do that enough times across enough examples and the noise starts to organize itself into something that reacts correctly.

The question is: how do you set the weights so that the network produces useful outputs?

## The Loss Function

You can't set weights by hand for anything beyond a toy problem. Instead, you define a **loss function** — a number that measures how wrong the network's final outputs are and then you work to minimize that loss.

For regression, that's often mean squared error and for classification, it's usually cross-entropy loss. As the problem being solved gets more abstract the loss function tends toward some quantifiable part of the output. ie. blunders in a game of chess, score in a video game.

The details vary, but the point is the same: a loss of zero means perfect predictions; higher loss means worse predictions. Your goal is to find the weights that minimize this number.

## Gradient Descent

In order to minimize our loss we often employ a technique known as gradient descent. The idea behind gradient descent involves thinking about our inputs to the network like an n-dimensional grid, every point on the grid has a height representing the output of our loss function for those inputs.

The way you move downhill on this grid is called **gradient descent**. The gradient of the loss with respect to the weights tells you which direction is uphill — so you step in the opposite direction:

```
w ← w - α · ∂L/∂w
```

Here α is the **learning rate** — a hyperparameter controlling step size. Too large and you overshoot and can bounce around oscilating up and down hill never reaching the local minima. Too small and training takes forever or may get stuck in local minima missing out on a much more optimal global minimum. 

The gradient tells you how much changing each weight would change the loss. If `∂L/∂w` is large and positive for some weight, increasing that weight makes things worse, so you decrease it. If it's large and negative, you increase it. The network slowly adjusts every weight to reduce its mistakes.

In practice you don't compute the gradient over your entire dataset at once (that's expensive). Instead you use **mini-batch stochastic gradient descent**: compute the gradient on a small random batch of examples, take a step, move to the next batch, repeat. This introduces noise but is dramatically faster and, counter-intuitively, often generalizes better.

## Backpropagation

The hard part is computing `∂L/∂w` for every weight in a network that might have millions of parameters. This is what backpropagation does.

Backprop is an application of the **chain rule** from calculus. The chain rule says: if you have a composition of functions f(g(x)), the derivative is:

```
d/dx f(g(x)) = f'(g(x)) · g'(x)
```

A neural network is exactly a composition of functions — each layer transforms the previous layer's output. The loss is a function of the final layer's output, which is a function of the second-to-last layer, which is a function of... all the way back to the inputs.

Backprop works in two passes:

**Forward pass:** compute the output of every layer, store the intermediate activations. This is just a normal prediction.

**Backward pass:** starting from the loss, propagate gradients backward through the network layer by layer, applying the chain rule at each step. Each layer computes how much its inputs contributed to the loss and passes that signal backward.

For a layer with weights `W` and input `x`:

```
∂L/∂W = ∂L/∂output · ∂output/∂W = δ · xᵀ
```

Where `δ` is the gradient flowing in from the layer ahead. Each layer accumulates a gradient for its weights, and at the end of the backward pass you have `∂L/∂w` for every parameter in the network.

## Practical Things That Actually Matter

**Vanishing and exploding gradients.** The chain rule multiplies many small (or large) numbers together as gradients flow backward through layers. If those numbers are consistently less than 1, the gradients shrink exponentially — the weights near the input barely update. This is the vanishing gradient problem. Modern fixes include residual connections (ResNets), batch normalization, and careful weight initialization schemes like He or Glorot initialization.

**Weight initialization.** Starting all weights at zero is a bad idea — every neuron computes the same thing and updates identically, so the network never differentiates. Random initialization breaks this symmetry. The scale of the initialization matters: too large and activations saturate early; too small and the signal dies out in the forward pass.

**Batch normalization.** Normalizing the inputs to each layer during training — zero mean, unit variance — keeps the activations in a range where gradients flow cleanly. In practice it dramatically speeds up training and makes networks less sensitive to the learning rate. Understanding *why* it works is still an active research area, but the empirical evidence is overwhelming.

**Learning rate schedules.** A fixed learning rate is rarely optimal. Starting high (for fast progress early) and decaying it over time (for precise convergence later) is standard practice. Warmup + cosine decay is a common schedule for training large models.


## Wrapping Up

I think Neural networks are so incredibly interesting, they are a fundamental piece of most modern machine learning algorithms/models. When people talk about training a model or an ai they are almost always talking about tuning and optimizing the weights in a neural network. 

Neural networks learn by repeatedly asking: "how wrong am I, and what should i tweak to be less wrong?" Backpropagation computes the answer, gradient descent takes the step, and after enough iterations across enough data, the network has weights that make useful predictions. It's not magic — it's calculus, applied at scale.

Thanks for reading this far and humoring me in this exercise. I'm hoping to start doing a monthly tech/personal interest piece

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
