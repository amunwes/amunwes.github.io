---
layout: posts
title: "Pixel Art: The Craft Behind the Aesthetic"
date: 2026-11-03 09:00:00 -0700
tags: [game-dev, pixel-art, art, design]
excerpt: "Pixel art looks simple. It's not. The constraints of working at low resolution force deliberate decisions about every pixel — and those constraints are exactly what makes it compelling."
---

Pixel art gets dismissed sometimes as a low-effort aesthetic — slap some big squares together and call it retro. People who've actually tried to make good pixel art know that's backwards. The constraint of working at low resolution forces you to be deliberate about every single pixel. There's no hiding behind detail. Every mark is a decision. That's what makes it hard, and what makes it satisfying.

## Why Constraints Are a Feature

A 16×16 sprite has 256 pixels. That's all you get to convey a character — their silhouette, their personality, their state (idle, running, hurt). Working within that constraint teaches you something that higher-resolution art doesn't demand as immediately: every element must earn its place.

The discipline of pixel art is fundamentally about information density. You're encoding a character's whole visual identity into a grid that fits on a postage stamp. The best pixel artists are extraordinary at prioritizing — knowing which details read at small sizes and which ones just become noise.

This is also why pixel art ages well. A well-made 16×16 sprite from 1990 is still legible, still charming. The constraints force clarity, and clarity doesn't expire.

## Resolution and Scale

The foundational choice in any pixel art project is your base resolution. Common choices:

- **8×8 or 16×16**: single characters, icons, items. Forces extreme economy.
- **32×32 or 48×48**: richer characters with more readable detail, still readable small.
- **64×64+**: approaching HD pixel art; more room for nuance, more risk of the "messy" look.

Your resolution affects everything downstream: animation frame counts, tile sizes, camera zoom, screen resolution. Decide it early and stick to it. Mixing scales — a 16px character walking on 32px tiles — usually looks wrong unless done deliberately.

**Upscaling** matters too. Pixel art is typically rendered at integer scale multiples (1x, 2x, 3x) to preserve the sharp pixel edges. Nearest-neighbor filtering in your renderer is essential — bilinear filtering blurs the pixels and destroys the aesthetic. Most engines have an option for this; use it.

## Color Palettes

Nothing marks beginner pixel art faster than inconsistent or over-saturated color choices. Professional pixel artists almost always work with a restricted palette — often 8 to 32 colors — for reasons that go beyond nostalgia.

A restricted palette forces cohesion. When all your sprites are drawing from the same 16 colors, the world feels unified. Objects from different scenes feel like they belong in the same universe.

Good palette design for pixel art typically involves:
- **Hue shifting**: shadows aren't just darker versions of the base color — they shift toward a cooler hue. Highlights shift toward a warmer one. This creates a more luminous, natural-looking gradient.
- **Limited value steps**: most sprites need 3–5 shades of each color. More than that and small sprites look noisy.
- **Avoiding pure black and white**: pure black (#000000) is rarely used for outlines in polished work; a very dark version of the character's main color reads more naturally.

Popular pre-made palettes like **PICO-8's 16-color palette**, **DB16**, or **Lospec's community palettes** are excellent starting points. Constraints from someone else's palette can help you develop taste before building your own.

## Lines and Anti-Aliasing

In high-resolution digital art, anti-aliasing smooths jagged edges. In pixel art, you work *with* the grid — curves are approximated by careful stairstepping patterns, and the goal is to make those steps look intentional.

The principle is **consistent stepping**: curves should use a regular progression (e.g., 1px step, 2px step, 3px step, 3px step, 2px step, 1px step) rather than irregular jumps. Irregular steps make curves look lumpy; consistent steps read as smooth even at low resolution.

**Pillow shading** is a common beginner mistake: shading around the outline of a sprite regardless of the light source, producing a uniform dark border. It flattens the form. Better approach: shade based on a defined light direction, even if the light source isn't in the scene.

## Animation at Low Resolution

Animating pixel art is about prioritizing motion over detail. A full walk cycle might be 4–8 frames at 16×16; you have no room for subtle weight shifts. What you focus on instead:

**Squash and stretch.** Even one pixel of squash on a landing frame reads as weight and impact. The exaggeration has to be strong enough to read at the scale.

**Anticipation.** A tiny backward lean before a jump tells the eye what's coming. At 16×16, one frame of anticipation is often enough.

**Smear frames.** Fast motion often uses a single "smear" frame that elongates the sprite in the direction of motion. It looks wrong on a single frame but creates a sense of speed in animation.

**Frame count economy.** Each additional frame is a significant investment at any resolution. Learn to get the motion reading right in 4 frames before adding a 5th. The constraint improves timing.

## Tools

**Aseprite** is the industry standard for pixel art. It has a native animation timeline, onion skinning, palette management, and all the tiling tools you'll need. It's worth the small price tag.

**LibreSprite** is a free fork of an older Aseprite version, if you want to start without spending anything.

For quick iterations, some artists use **Photoshop** with pencil tool (1px, no anti-aliasing) and a limited palette. It works, but lacks the animation tools.

The tool matters less than the practice. Pick one and do the reps.

## What I Took Away

The thing pixel art taught me that carries into other work: constraints are a design tool, not just a limitation. Every creative medium has constraints — polygon budgets in 3D, word counts in writing, frame rates in animation. The artists who are good at their medium have learned to work *with* the constraints rather than around them. Pixel art makes this obvious because the constraints are so extreme. You can't hide bad decisions behind complexity.

Next month I'm back in ML territory with semantic search — how embedding models let you search by meaning rather than keywords.

---
*Questions or corrections? Connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
