# Flow Field Trails

Flow field particle system with mouse-responsive forces and HSB color gradients.

## Concept

- Particles follow a flow field built from Perlin noise; the field updates over time.
- Mouse position influences the field so particles react to the cursor.
- Trails are drawn by connecting each particle’s current and previous position.
- HSB color mode is used for a consistent purple-to-blue palette.

## Technical notes

- Flow field is a grid of force vectors; particles sample the cell at their position.
- Edge wrapping keeps particles on the canvas.
- Background fade each frame controls trail length.
- Particle count scales with canvas size.
