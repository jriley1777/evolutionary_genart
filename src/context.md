# 🎨 Generative Sketch Evolution System – Prompt for AI Coding Assistant

## 🦮 Project Goal

Develop an evolving ecosystem of generative art sketches, where:

* **Generation 1** sketches introduce brand new creative ideas.
* **Subsequent generations** evolve prior sketches by:

  * Enhancing concepts
  * Adding interactivity
  * Modifying the artistic direction
  * Layering in new features or playful mechanisms

The experience should remain largely interactive or animated, though static visuals are allowed when intentional. We aim to explore the space between **generative art** and **playful game-like interaction**.

---

## 📁 File & Project Structure

Each sketch should include:

* A `.jsx` or `.js` file for the sketch itself
* A corresponding `.md` file containing rich documentation

Update these shared project files as needed:

* `projects.js` and `sketches.js` – for sketch tracking and routing
* `Home.jsx` – update `generationOptions` with each new generation

### 💂 Directory Guidelines

| Generation Type | Sketch Directory  | Markdown Directory   |
| --------------- | ----------------- | -------------------- |
| Gen 1 Sketch    | `/sketches/gen1/` | `/public/blog/gen1/` |
| Subsequent Gens | `/sketches/genN/` | `/public/blog/genN/` |

> ℹ️ All markdown files should describe the concept, influences, artistic goals, and evolution. Avoid deep code dives—focus on art and design thinking.

---

## 🔄 Generational Evolution Logic

* **Gen 1:** Original creative seed. Anything goes.
* **Gen N:** Evolves from Gen N-1 and/or earlier versions:

  * Reads and builds upon previous sketches and markdowns
  * May selectively reject or refine earlier features
  * Should make *substantive artistic, conceptual, or technical additions*
* Fullscreen mode must be available in all sketches, like Gen 1.

---

## 🎨 Generative Art Topics & Dimensions of Randomness

Below are key topics and creative directions to explore. Each includes example variables or randomness types to play with.

---

### 1. **Text-Based Visuals**

ASCII art, typography grids, generative letterforms

* **Randomization Ideas:**

  * Font size, kerning, typeface
  * SVG letter distortion
  * Placement grid noise
  * Text input-based seeds

---

### 2. **Particles & Particle Fields**

Swarming systems, bouncing particles, attraction/repulsion

* **Randomization Ideas:**

  * Velocity, direction, lifespan
  * Shape (circle, triangle, emoji, etc.)
  * Force type: gravity, spring, magnetic
  * Dynamic user forces (mouse, keyboard)

---

### 3. **Physics & Forces**

Gravity simulations, collisions, soft-body interactions

* **Randomization Ideas:**

  * Mass, restitution, friction
  * Constraints between bodies
  * Force vectors over time
  * User interactions toggling world rules

---

### 4. **Shape Overlay + Color Intersections**

Transparent shapes revealing new palettes through blending

* **Randomization Ideas:**

  * Shape type (triangle, blob, bezier)
  * Blend mode (multiply, screen, etc.)
  * Color harmonies (complementary, triadic)
  * Movement algorithms (circular, Perlin, noise loops)

---

### 5. **Grid + Packing Systems**

Circle packing, Voronoi, lattice structures

* **Randomization Ideas:**

  * Packing radius, collision rule
  * Grid density/spacing
  * Hybrid organic-mechanical layout rules

---

### 6. **Topology + Recursive Structures**

Fractals, L-systems, nested subdivisions

* **Randomization Ideas:**

  * Rule sets per generation
  * Recursion depth
  * Angle offsets, scale decay
  * Mutation of rules over generations

---

### 7. **Interaction & Control**

Use input to affect visuals directly

* **Randomization Ideas:**

  * Control mapping: mouse, keyboard, touch
  * Interaction response style (smooth, elastic, delayed)
  * Time-based or event-driven state changes
  * Reveal/hide states depending on input

---

### 8. **Time-Based Animations**

Non-looping systems, generative timelines

* **Randomization Ideas:**

  * Frame-based transitions
  * Noise modulation over time
  * Discrete vs continuous evolution
  * “Aging” of forms or color palettes

---

### 9. **Mutation & Evolution**

Self-modifying sketches across generations

* **Randomization Ideas:**

  * Parameter mutation functions
  * Structural evolution (new layers added)
  * Visual DNA that determines traits
  * History-informed randomness (e.g., inherit half from gen-2, half from gen-3)

---

## ❌ Notes on Audio

Please avoid audio-based features **unless**:

* They use well-supported APIs (e.g., `p5.sound`, Web Audio API)
* They have a known working example or tutorial
* The mic input is reliable on both Mac and browser environments

If unsure: skip audio.

---

## 💡 Assistant’s Creative Role

You (the AI agent) are the **creative director** and **technical assistant** guiding this evolution.

You should:

* Invent distinct and compelling new sketches or traits per generation
* Consider thematic coherence across a generation (e.g., all gen4 sketches could be about recursion or one-word prompts)
* Keep markdown documentation up-to-date with the artistic and generative philosophy behind each piece

---

## 📌 Example Prompts You Can Use

* “Create a gen1 sketch inspired by circle-packing with interactive repulsion.”
* “Create a gen4 sketch that evolves from `glyph-field` and adds recursive layering + user control.”
* “Mutate the particle sketch to incorporate color blending and fullscreen touch interactivity.”

---
