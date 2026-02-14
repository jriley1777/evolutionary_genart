# Agent instructions

This repo is a **particle flow field sketch collection**. Every sketch is a particle flow field: particles (or particle-like agents) moving through a flow field or under forces, with optional interaction. Each new sketch can be a completely new idea; there is no evolutionary lineage requirement.

## Where to look

- **Creative brief and constraints:** `context/context.md` — project goal, output constraint, dimensions of variation (grids, physics, text, color, etc.), and example prompts. Use `@context/context.md` when generating or refining sketch ideas.
- **Conventions and registration:** `.cursor/rules/` — project rules that define how to add a new sketch and how sketch components should be built. These apply automatically when relevant.

## What to do

- Propose and implement **particle flow field** sketches only. Use the dimensions in `context/context.md` to vary flow, behavior, and rendering.
- When adding a sketch: create the component in `src/sketches/`, register it in `src/sketches/sketches.js` and `src/data/projects.js`, and ensure fullscreen (and PhotoMode when enabled) work. See `.cursor/rules/particle-flow-project.mdc` for the exact steps.
