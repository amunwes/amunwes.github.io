---
layout: posts
title: "What Are Shaders and How Do You Use Them?"
date: 2026-08-04 09:00:00 -0700
tags: [game-dev, graphics, shaders, glsl]
excerpt: "Shaders are the reason real-time 3D graphics look the way they do. They're small programs that run on the GPU millions of times per frame — and once you understand the model, they're surprisingly accessible."
---

The first time I tried to read shader code, it looked like gibberish. `gl_FragCoord`, `uniform sampler2D`, `mix(a, b, t)`. I closed the tab and moved on. A few months later I sat down and actually learned what was happening, and it turned out to be one of the most satisfying things I've done in game dev. Shaders are simple in concept, and once you internalize the model, a whole category of visual effects goes from mysterious to obvious.

## What a Shader Actually Is

A shader is a small program that runs on the GPU. Instead of running once, sequentially, it runs *in parallel* — the same program executes simultaneously across thousands of processing cores. This parallelism is what makes real-time 3D graphics feasible: you need to process millions of pixels at 60 frames per second, and you can only do that if you process many of them at the same time.

There are two shaders you need to understand first:

**Vertex shaders** run once per vertex. Their job is to transform 3D positions in your scene into 2D screen coordinates. They're how a cube defined in world space becomes a quadrilateral on your monitor. The output of the vertex shader is a 2D position (plus any data you want to pass along to the next stage).

**Fragment shaders** (sometimes called pixel shaders) run once per fragment — roughly, once per pixel that a triangle covers on screen. Their job is to determine the color of that pixel. This is where almost all the interesting visual effects live: texturing, lighting, fog, outlines, glows.

The pipeline looks like this:

```
3D geometry → Vertex Shader → Rasterization → Fragment Shader → Screen
```

Rasterization is the step where the GPU figures out which fragments (pixels) are covered by each triangle. It interpolates values from the three vertices across the surface of the triangle, so if you output a value from the vertex shader, the fragment shader receives a smoothly blended version of that value across the triangle.

## A Minimal Fragment Shader in GLSL

GLSL (OpenGL Shading Language) is the most common shader language for web and cross-platform work. Here's the simplest possible fragment shader:

```glsl
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}
```

This outputs pure red (RGBA: 1, 0, 0, 1) for every pixel on the surface. That's it. `vec4` is a four-component vector — GLSL has built-in types for 2D, 3D, and 4D vectors, and most shader code is manipulating these.

A more interesting example: use the UV coordinates of the surface to create a gradient.

```glsl
varying vec2 vUv;  // passed in from the vertex shader

void main() {
    gl_FragColor = vec4(vUv.x, vUv.y, 0.0, 1.0);
}
```

`vUv` contains the UV coordinates for this fragment — values between (0,0) at one corner of the mesh and (1,1) at the opposite corner. The red channel increases left to right; the green channel increases bottom to top. You get a colorful gradient from the geometry's UV map, with zero texture lookups.

## How Texture Sampling Works

Most shaders sample from textures at some point. Here's what that looks like:

```glsl
uniform sampler2D uTexture;
varying vec2 vUv;

void main() {
    vec4 texColor = texture2D(uTexture, vUv);
    gl_FragColor = texColor;
}
```

`uniform` variables are values passed in from the CPU (your game code) that stay constant across all fragments in a draw call — things like texture handles, time values, or light positions. `texture2D` samples the texture at the given UV coordinate and returns the RGBA color stored there.

From this base, you can start compositing, tinting, blending multiple textures, applying masks — the whole visual toolkit starts from these building blocks.

## A Practical Example: Rim Lighting

Rim lighting (also called backlit glow) is a common effect: objects appear to glow around their silhouette when there's a light source behind them. It's used everywhere in stylized games to make characters pop from the background.

The math is simple: compare the surface normal to the view direction. Where they're perpendicular (at the silhouette), the dot product is near zero — that's where you add the rim glow.

```glsl
varying vec3 vNormal;
varying vec3 vViewDir;
uniform vec3 rimColor;
uniform float rimStrength;

void main() {
    float rim = 1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0);
    rim = pow(rim, rimStrength);  // sharpen the falloff
    
    vec3 color = vec3(0.2, 0.2, 0.8);  // base color
    gl_FragColor = vec4(color + rim * rimColor, 1.0);
}
```

Thirty lines, a novel visual effect. That's the appeal of shaders.

## The GPU Programming Model

Understanding *why* shaders work the way they do makes them easier to write. A few key points:

**No communication between fragments.** Each fragment shader invocation is completely independent. You can't read the color of an adjacent pixel (for that, you need a post-processing effect with a framebuffer). This isolation is what enables the parallelism.

**Uniforms vs. varyings vs. attributes.** Data flows into shaders in three ways: *uniforms* are per-draw-call constants from the CPU; *attributes* are per-vertex values (position, UVs, normals); *varyings* are interpolated values passed from the vertex shader to the fragment shader. Getting this distinction wrong is a common source of confusion early on.

**Everything is floats.** GPU math is single-precision floating point. Integer operations exist but are a second-class citizen. If something is behaving strangely at edges, precision is often the culprit.

## Things That Tripped Me Up

**Coordinate spaces.** A 3D position can be in object space (relative to the mesh's origin), world space (relative to the scene origin), view space (relative to the camera), or clip space (ready for the screen). Vertex shaders transform between these. Mixing up which space you're in when computing lighting or effects is a very common bug.

**Normals don't transform like positions.** If you scale a mesh non-uniformly, the normal vectors get squashed. The fix is to multiply normals by the *inverse transpose* of the model matrix, not the model matrix itself. This is one of those things you memorize after getting burned by it.

**Alpha blending requires sorting.** Transparent objects need to be rendered back-to-front for blending to look correct. GPUs don't know draw order — that's on you to manage. Most engines handle this automatically, but it bites you when you write custom shaders for transparent objects.

**Shader compilation happens at runtime.** Shader code is compiled by the driver when you first use it. Syntax errors show up as runtime errors, not compile-time errors, which makes debugging feel different from normal code. In engines like Godot and Unity, the editor usually surfaces these, but in raw OpenGL you're reading logs.

## Wrapping Up

Shaders are small programs that run on the GPU in massive parallel — vertex shaders transform geometry, fragment shaders color pixels. Once you understand that model, the syntax unlocks and you can start building effects rather than decoding gibberish. Rim lighting, dissolve effects, water, cel shading, color grading — they all reduce to the same operations: sample a texture, do some vector math, output a color.

Next month I'm back in ML territory: vectorization, and why a naive implementation of your model might be 100x slower than it needs to be.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
