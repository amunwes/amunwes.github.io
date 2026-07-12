---
layout: posts
title:  "Post Title Here"
date:   YYYY-MM-DD HH:MM:SS -0700
tags: [tag1, tag2, tag3]
excerpt: "One or two sentence summary that shows in post previews and LinkedIn shares. Make it a hook."
header:
  teaser: /images/your-teaser-image.jpg   # optional: 500x300px image for post card
---

<!-- 
  POST WRITING GUIDE
  ==================
  Target length: 1200–2000 words
  Reading time: ~7–10 min
  Tone: Technical but conversational. Write like you're explaining to a smart friend
        who doesn't know this specific topic yet. First person is fine.
  
  Structure that works well for both ML and Game Dev posts:
  
  1. HOOK (1–2 paragraphs)
     - Open with the problem, a surprising fact, or a concrete scenario
     - Don't start with "In this post I will..." — just start
  
  2. THE CONCEPT (2–4 paragraphs)
     - Explain what it is, from first principles
     - One concrete analogy goes a long way
     - For ML: avoid walls of math. Explain the intuition first, then the equation
     - For game dev: show a short code snippet or screenshot if it helps
  
  3. WHY IT MATTERS / THE PROBLEM IT SOLVES (1–2 paragraphs)
     - What breaks without this? What was the alternative?
     - This gives the reader the "aha" of why they should care
  
  4. HOW IT WORKS (the bulk — 4–8 paragraphs)
     - Go deeper. This is the meat.
     - Use headers (##) to break it up if it gets long
     - Code snippets, diagrams, or equations belong here
     - Drop in a GIF or interactive demo at the moment the concept "clicks" — not as decoration, but as the explanation itself
  
  5. PRACTICAL NOTES / WHAT I LEARNED (1–3 paragraphs)
     - Personal experience, gotchas, tips from doing this yourself
     - This is what distinguishes your post from a Wikipedia article
  
  6. WRAP UP (1 paragraph)
     - One sentence summary of the key idea
     - Point to what's next (next post, related resource, your GitHub)
     - Optional: call to action ("Let me know what you think on LinkedIn")

  ─────────────────────────────────────────
  VISUAL AIDS: GIFS + BROWSER DEMOS
  ─────────────────────────────────────────

  GIFs — when to use and where to find them:
  
  - Use a GIF when the thing you're explaining is fundamentally about movement or iteration
    (gradient descent converging, a signal propagating through a network, an agent exploring a maze).
    A static diagram here is a downgrade.
  - Embed with standard markdown: ![alt text](url-or-relative-path)
    Hosted GIFs are fine; for anything you want to keep long-term, download and commit to /images/.
  
  Good sources:
    - 3Blue1Brown (YouTube) — screenshots or linked clips for neural net / linear algebra concepts
    - distill.pub — publication-quality interactive ML explanations, often linkable
    - Towards Data Science / Medium — search "neural network gif", "gradient descent animation"
    - Google for "[concept] animation gif site:github.io OR site:distill.pub"
    - makeagif.com or ezgif.com to trim/convert a screen recording of your own demo
  
  Browser-runnable demos — when to use:
  
  - Use a live demo when the reader should be able to *play* with the concept, not just watch it.
    One slider that changes learning rate is worth five paragraphs.
  - Keep demos small and self-contained. If it needs a backend, it's too big for inline.
  
  Option A — Inline HTML/JS block (simplest, no external dependency):
  
    <div style="border:1px solid #ccc; padding:1rem; border-radius:4px;">
      <canvas id="demo" width="400" height="200"></canvas>
      <script>
        // vanilla JS — no imports needed
        const canvas = document.getElementById('demo');
        // ... your demo code
      </script>
    </div>
  
  Option B — CodePen embed (good for longer interactive demos):
  
    1. Build the demo at codepen.io
    2. Click Share → Embed → copy the <iframe> snippet
    3. Paste the <iframe> directly into the markdown file — Jekyll passes HTML through

    Example iframe:
    <iframe height="400" style="width:100%;" scrolling="no"
      src="https://codepen.io/YOUR_PEN/embed/HASH?default-tab=result"
      frameborder="no" allowfullscreen>
    </iframe>
  
  Option C — p5.js sketch (great for ML visualizations — neural nets, search, agents):
  
    Load p5 from a CDN and write your sketch inline:

    <script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js"></script>
    <div id="sketch-holder"></div>
    <script>
      new p5(function(p) {
        p.setup = function() { p.createCanvas(400, 300).parent('sketch-holder'); };
        p.draw  = function() { /* your sketch */ };
      });
    </script>

  Checklist before publishing any visual:
    [ ] Does it actually load (test in Jekyll serve)?
    [ ] Is there an alt-text or caption for screen readers / no-JS users?
    [ ] Is the GIF / embed source stable (not a Twitter link or temp upload)?
-->

## Section 1

Your content here.

## Section 2

Your content here.

```python
# Code snippets use fenced code blocks with the language specified
# for syntax highlighting
example = "like this"
```

## Wrapping Up

Summary and next steps.

---
*If you found this useful or have questions, connect with me on [LinkedIn](https://www.linkedin.com/in/andrew-munro-west/).*
