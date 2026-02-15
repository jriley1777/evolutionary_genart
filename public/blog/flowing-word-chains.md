# Flowing Word Chains

Text-based particle system where letters move through a flow field and can form words or chains.

## Concept

- Each character is a particle with position, velocity, and optional target positions.
- Flow field and mouse influence move letters around the canvas.
- Letters can seek target positions to form words, or scatter for more abstract layouts.
- Size, color, or opacity can change over each letter’s “life” for a simple evolution effect.

## Technical notes

- A dedicated text-particle class holds character, position, and evolution state.
- Flow field forces are applied the same way as in other particle sketches.
- Target-seeking is done with a force toward the target position.
- Text is drawn with p5’s text API (size, alignment, color).
