---
layout: posts
title: "Vectorization: Why Your ML Code Is Slow"
date: 2026-09-01 09:00:00 -0700
tags: [machine-learning, python, numpy, performance]
excerpt: "A for loop that takes 10 seconds can often be rewritten as a vectorized operation that takes 0.05 seconds. Here's what's actually happening under the hood — and how to think about writing fast numerical code."
---

Early in my ML work I wrote a lot of loops. Loops over data points, loops over features, loops to compute distances. The code worked. It was also slow enough that training felt like waiting for a download from 2006. The fix, in almost every case, was vectorization — and once I understood why it worked, I stopped writing the slow version.

## The Problem With Python Loops

Python is not a fast language for numerical computation. Each iteration of a loop in Python carries significant overhead: the interpreter has to look up variable names, check types, manage reference counts, and dispatch to the appropriate operations. For a loop running a million times, that overhead accumulates.

Here's a concrete example. Computing the dot product of two vectors the loop way:

```python
def dot_loop(a, b):
    result = 0.0
    for i in range(len(a)):
        result += a[i] * b[i]
    return result
```

And the vectorized way with NumPy:

```python
import numpy as np
result = np.dot(a, b)
```

Let's time them on vectors of length 1,000,000:

```python
import numpy as np
import time

a = np.random.randn(1_000_000)
b = np.random.randn(1_000_000)

start = time.time()
dot_loop(a, b)
print(f"Loop: {time.time() - start:.3f}s")   # ~0.45s

start = time.time()
np.dot(a, b)
print(f"NumPy: {time.time() - start:.4f}s")  # ~0.002s
```

About 200x difference. For a computation that's called thousands of times during training, that gap compounds into the difference between a usable workflow and one that isn't.

## What NumPy Is Actually Doing

NumPy arrays are not Python lists. Under the hood, a NumPy array is a block of contiguous memory storing numbers in a fixed numeric type (float32, int64, etc.). When you call `np.dot(a, b)`, NumPy calls into a compiled C (or Fortran) library — often BLAS (Basic Linear Algebra Subprograms) — which runs the computation with no Python interpreter overhead whatsoever.

More importantly, those libraries exploit **SIMD** — Single Instruction, Multiple Data. Modern CPUs have special registers (256-bit or 512-bit wide) that can hold multiple floats at once and apply the same arithmetic operation to all of them in a single clock cycle. An AVX2-capable CPU can multiply 8 float32 values simultaneously. NumPy's underlying libraries are written to use these instructions, while a Python loop is not.

The result: NumPy's dot product runs at close to the theoretical peak speed of your CPU. Your Python loop runs at a small fraction of it.

## Thinking in Array Operations

The mindset shift is to stop thinking "iterate over elements" and start thinking "apply operations to entire arrays at once."

**Element-wise operations:** NumPy broadcasts basic operations over entire arrays.

```python
# Slow
result = [x**2 + 2*x + 1 for x in data]

# Fast
result = data**2 + 2*data + 1
```

**Aggregations:** sum, mean, max, argmax, all computed in compiled code.

```python
# Slow
total = sum(row[j] for row in matrix for j in range(len(row[0])))

# Fast
total = matrix.sum()
```

**Matrix operations:** the core of ML. Matrix multiplication, dot products, outer products.

```python
# Forward pass through a linear layer:
# Slow (loop over examples)
outputs = []
for x in batch:
    outputs.append(W @ x + b)

# Fast (matrix multiply the whole batch at once)
outputs = batch @ W.T + b
```

That last example is worth sitting with. Instead of processing one input vector at a time, you stack your batch into a matrix and multiply once. This is how deep learning frameworks process entire batches efficiently.

## Broadcasting

NumPy's **broadcasting** rules let you apply operations between arrays of different shapes without writing loops or allocating extra memory.

```python
# Subtract the column mean from each column of a matrix
X = np.random.randn(1000, 50)  # 1000 examples, 50 features
col_means = X.mean(axis=0)     # shape (50,)
X_centered = X - col_means     # shape (1000, 50) - broadcasting!
```

NumPy stretches `col_means` along the first axis automatically, subtracting the appropriate mean from each column. No loop needed.

Broadcasting rules:
1. If arrays have different numbers of dimensions, pad the smaller shape on the left with 1s.
2. Dimensions of size 1 are stretched to match the other array.
3. If neither dimension is 1 and they don't match, it's an error.

Getting comfortable with broadcasting eliminates a large class of loops that people write when they first start using NumPy.

## Where People Still Leave Performance on the Table

**Unnecessary copies.** NumPy operations like transpose and slicing create *views* — references to the original data, not copies. But some operations force a copy. If you're doing `X = X.T` in a tight loop, you may be copying large arrays repeatedly. Use `np.ascontiguousarray` deliberately and profile before assuming.

**Mixed dtypes.** Mixing float64 and float32 operations forces implicit conversions. Be explicit about your dtypes. For most ML work, float32 is sufficient and fits twice as many values in SIMD registers.

**Not using the right library for GPU work.** NumPy runs on the CPU. If you're training on a GPU, your array operations need to go through PyTorch or CuPy to stay on the GPU. Every time you call `.numpy()` to move a tensor back to the CPU, you're paying a transfer cost. The fast path is to keep everything on the GPU through the forward pass, loss computation, and backward pass.

**Tiny batches.** Batch size affects how well you utilize your hardware. Very small batches (1–4 examples) don't give the GPU or BLAS library enough work to saturate its parallelism. If training is slow and GPU utilization is low, try a larger batch.

## Profiling Before Optimizing

The rule I try to follow: profile first, optimize second. It's surprisingly common to spend time speeding up code that isn't the bottleneck.

For Python, `cProfile` gives you a call-by-call breakdown:

```python
import cProfile
cProfile.run('train_epoch(model, data)')
```

For NumPy/PyTorch, `line_profiler` or the PyTorch profiler (for GPU traces) give you more granular timing. Look for operations that take a lot of time relative to what they're computing — those are where vectorization or algorithmic changes pay off.

## Wrapping Up

Vectorization is about moving work from Python's interpreter into compiled, SIMD-optimized library code. The mental model is: express computation as array operations rather than loops, batch your data, and let NumPy or PyTorch handle the low-level execution. The gap between a loop and a vectorized equivalent isn't a constant factor — it's often 100x or more, which turns a training loop that takes hours into one that takes minutes.

Next month I'm looking at Bag of Words — an NLP technique old enough to feel unfashionable, but still surprisingly hard to beat on certain tasks.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
