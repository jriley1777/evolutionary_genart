# 🎨 Particle Flow Field Sketches – Prompt for AI Coding Assistant

## 🦮 Project Goal

Build a collection of **particle flow field** sketches. Every sketch produced for this project must be a particle flow field sketch: particles (or particle-like agents) moving through a flow field or under forces, with optional interaction.

* Each new sketch can be an **entirely new idea** — no requirement to evolve from or build on a previous sketch. Draw from any of the creative dimensions below.
* Sketches should be interactive or animated. Explore the space between **generative art** and **playful interaction**.

---

## ⚠️ Output Constraint

**Every sketch must be a particle flow field sketch.** Use the topics in "Dimensions of Variation" as inspiration for *how* to vary the flow field, particle behavior, or rendering — but the end result is always particles + flow/forces, not a different kind of piece (e.g. not a static poster, kaleidoscope, or non-particle system).

---

## 📁 File & Project Structure

Each sketch includes:

* A `.jsx` or `.js` file for the sketch
* A corresponding `.md` file with concept, influences, and artistic goals

Update these when adding a sketch:

* `src/data/projects.js` – add the new sketch **at the top** of the Particle Flow project’s `sketches` array. Include a **created** field (YYYY-MM-DD, e.g. today’s date); the project list is sorted by `created`, newest first.
* `src/sketches/sketches.js` – import and export the component

### 💂 Directory Guidelines

| Location     | Path               |
| ------------ | ------------------ |
| Sketch files | `src/sketches/` (flat; e.g. `FlowFieldTrails.jsx`, `SynthwaveHexGlow.jsx`) |
| Blog/docs    | `public/blog/` (optional; per sketch or subfolders) |

### Blog post format (simple only)

Blog posts in `public/blog/` must use a **short, consistent format**. Use `public/blog/slow-flow-trails.md` as the reference.

**Structure:**
1. **Title** (H1) — sketch name only.
2. **Intro** — one short paragraph (1–3 sentences) describing the sketch.
3. **## Concept** — 3–5 bullet points on the idea and behavior.
4. **## Technical notes** — 2–4 short bullets on implementation (no code).

**Do not include:** long “Overview” or “What Makes It Unique” sections, code blocks, “Core Techniques” with subsections, “Building Your Own”, “Related Techniques”, “Conclusion”, or multi-page prose. Keep each post to one concise page of concept + technical notes.

---

## 📐 Sketch Requirements

* **Fullscreen mode** must be available in all sketches.
* **PhotoMode** where `showPhotoMode` is true for that project entry.
* Register the sketch in `projects.js` and `sketches.js` as above.

---

## 🎨 Dimensions of Variation (for Particle Flow Fields)

Use these as **sources of ideas** for new particle flow sketches. They are ways to vary flow fields, particle behavior, rendering, or interaction — not other sketch genres.

---

### 1. **Text & Typography in the Flow**

Particles as glyphs, flow driven by text layout, or type-based seeds.

* Font size, kerning, typeface; placement grid noise; text input as seed.
* [LIA](https://www.liaworks.com/), [Silk](https://weavesilk.com/), [Printing Code](http://printingcode.runemadsen.com/), [Coding Train - Text Effects](https://www.youtube.com/watch?v=ZiYdOwOrGyc).

---

### 2. **Particles & Flow Fields (Core)**

Swarming, attraction/repulsion, velocity, lifespan, shape, force types, mouse/keyboard forces.

* [Reza Ali](http://www.syedrezaali.com/), [Memo Akten](https://www.memo.tv/), [OpenProcessing Particle Systems](https://www.openprocessing.org/sketch/1123696), [Coding Train - Particle Systems](https://www.youtube.com/watch?v=UcdigVaIYAk).

---

### 3. **Physics & Forces**

Gravity, collisions, mass, restitution, friction, constraints, force vectors over time.

* [matter.js](https://brm.io/matter-js/), [toxiclibs.js](https://github.com/hapticdata/toxiclibsjs), [Andreas Gysin](https://www.gysin-vanetti.com/), [Traer Physics](https://www.cs.princeton.edu/~traer/physics/).

---

### 4. **Shape, Blend Modes & Color**

Particle trails, blend modes, color harmonies (complementary, triadic), movement algorithms (Perlin, noise loops).

* [Georg Nees](https://en.wikipedia.org/wiki/Georg_Nees), [Casey Reas](https://reas.com/), [Generative Design](https://www.generative-gestaltung.de/2/), [SVG Blending](https://css-tricks.com/svg-compositing-goes-blending/).

---

### 5. **Grid & Packing Systems**

Flow on grids, Voronoi cells, circle packing, lattice structures; packing radius, density, hybrid layout rules.

* [D3 Voronoi](https://observablehq.com/@d3/d3-voronoi), [Circle Packing](https://openprocessing.org/sketch/1000196), [RedBlobGames](https://www.redblobgames.com/).

---

### 6. **Recursion & Structure**

Fractal flow, L-system–like rules for flow, nested subdivisions, recursion depth, scale decay.

* [Nature of Code - Recursion](https://natureofcode.com/book/chapter-8-fractals/), [L-systems](https://www.youtube.com/watch?v=E1B4UoSQMF4), [Complexity Explorables](https://www.complexity-explorables.org/).

---

### 7. **Interaction & Control**

Mouse, keyboard, touch; smooth vs elastic response; time-based or event-driven changes; reveal/hide states.

* [p5.js Interaction](https://p5js.org/examples/interaction.html), [Joshua Davis](https://www.joshuadavis.com/), [Zach Lieberman](https://zachlieberman.net/).

---

### 8. **Time & Animation**

Frame-based transitions, noise over time, aging of forms or palettes, non-looping timelines.

* [Noise Walk - Coding Train](https://www.youtube.com/watch?v=nmXMgqjQzls), [p5 frameCount](https://p5js.org/reference/#/p5/frameCount), [OpenRNDR Timelines](https://openrndr.org/).

---

### 9. **Parameter Mutation & Traits**

Particle “DNA,” parameter mutation, visual traits that change over time or across runs.

* [Galanter - Generative Art](https://www.philipgalanter.com/downloads/ga2003_paper.pdf), [Genetic Algorithm Walkers](https://rednuht.org/genetic_walkers/).

---

### 10. **Constraints & Rules**

Local symmetry, repetition, mirroring; Turing-like patterns; rule-based emergence in the flow.

* [Wave Function Collapse](https://www.boristhebrave.com/2020/04/13/wave-function-collapse-explained/), [Generative Mechanism Design](https://tylerxhobbs.com/essays/2020/generative-mechanism-design).

---

### 11. **Image & Deconstruction**

Flow or particles driven by image data, edge detection, palette from image, masking.

* [Mario Klingemann](https://quasimondo.com/), [Sofia Crespo](https://www.sofiacrespo.com/), [Photomosh](https://photomosh.com/).

---

## ❌ Notes on Audio

Avoid audio unless using well-supported APIs (e.g. `p5.sound`, Web Audio) with a known working example and reliable mic on Mac and browser. If unsure, skip audio.

---

## 💡 Assistant's Creative Role

You are the **creative director** and **technical assistant** for this collection.

* Propose **new particle flow field ideas**; each sketch can be a completely fresh concept.
* Use the dimensions above to inspire variation (grids, physics, text, color, interaction, etc.) while keeping the output a particle flow field sketch.
* Keep markdown docs up to date with the idea and influences behind each piece.

---

## 📌 Example Prompts

* "Create a new particle flow sketch where the flow is defined by a Voronoi grid."
* "Create a particle flow sketch with physics-based attraction/repulsion and fullscreen mode."
* "Create a particle flow sketch that uses text as the flow field or particle shape."
* "Add a new particle flow sketch with color blending and touch interactivity."

---
