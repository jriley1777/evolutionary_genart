# Agent instructions

This repo is a **generative art sketch collection**. Currently the main focus is **particle flow** (particles + flow field or forces); other genres may be added later. Each new sketch can be a completely new idea; there is no evolutionary lineage requirement.

## Where to look

- **Core (all sketches):** `.cursor/rules/project-core.mdc` — registration, file structure, fullscreen, blog. Applies to any genre.
- **Particle flow:** `.cursor/rules/particle-flow-project.mdc` — output constraint for the particle-flow project root. `context/context.md` — creative brief, dimensions of variation (grids, physics, text, color, etc.), example prompts. Use `@context/context.md` when generating or refining particle flow ideas.
- **Pen plotter:** `.cursor/rules/plotter-project.mdc` — plottable SVG output for the pen-plotter project root. `context/plotter-context.md` — machine settings, export constraints, variation ideas. Use `@context/plotter-context.md` when building or refining plotter sketches.
- **When editing sketches or blog:** `.cursor/rules/sketch-components.mdc` (src/sketches/**/*.jsx), `.cursor/rules/blog-posts.mdc` (public/blog/**/*.md).

## What to do

- For **particle flow** sketches: propose and implement only particle flow field sketches under the particle-flow root; use dimensions in `context/context.md`. When adding one: follow `project-core.mdc` for steps and `particle-flow-project.mdc` for the constraint.
- For **pen plotter** sketches: register under the pen-plotter root; paths must export to SVG via `plotterExportRef` and `src/utils/plotterExport.js`. Follow `plotter-project.mdc` and `context/plotter-context.md`.
- For **other genres** (when added): follow `project-core.mdc` and the genre-specific rule and context for that project root.
- **Blog posts** for any sketch: simple format only — title, short intro, `## Concept` bullets, `## Technical notes` bullets. No code blocks or long sections. Reference: `public/blog/slow-flow-trails.md`.
- **Before every commit:** run the **catalog review** in `project-core.mdc` — check `src/data/projects.js` against `sketches.js` and any sketch/blog changes in the diff.
