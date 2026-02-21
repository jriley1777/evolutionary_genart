# Agent instructions

This repo is a **generative art sketch collection**. Currently the main focus is **particle flow** (particles + flow field or forces); other genres may be added later. Each new sketch can be a completely new idea; there is no evolutionary lineage requirement.

## Where to look

- **Core (all sketches):** `.cursor/rules/project-core.mdc` — registration, file structure, fullscreen, blog. Applies to any genre.
- **Particle flow:** `.cursor/rules/particle-flow-project.mdc` — output constraint for the particle-flow project root. `context/context.md` — creative brief, dimensions of variation (grids, physics, text, color, etc.), example prompts. Use `@context/context.md` when generating or refining particle flow ideas.
- **When editing sketches or blog:** `.cursor/rules/sketch-components.mdc` (src/sketches/**/*.jsx), `.cursor/rules/blog-posts.mdc` (public/blog/**/*.md).

## What to do

- For **particle flow** sketches: propose and implement only particle flow field sketches under the particle-flow root; use dimensions in `context/context.md`. When adding one: follow `project-core.mdc` for steps and `particle-flow-project.mdc` for the constraint.
- For **other genres** (when added): follow `project-core.mdc` and the genre-specific rule and context for that project root.
- **Blog posts** for any sketch: simple format only — title, short intro, `## Concept` bullets, `## Technical notes` bullets. No code blocks or long sections. Reference: `public/blog/slow-flow-trails.md`.
