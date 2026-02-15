# Rectangle Pack Flow

Rectangle packing with particle-driven pattern changes and synthwave-style color transitions.

## Concept

- Rectangles are packed on the canvas (e.g. by size or space-filling rules).
- Particles move through a flow field and affect the rectangles they pass near.
- Rectangle color or state can change with particle proximity or density.
- Palette and transitions give a synthwave look.

## Technical notes

- Packing can be random, grid-based, or use a simple layout algorithm.
- Each rectangle’s appearance is updated from particle positions (distance or count).
- Flow field drives particle motion; rectangle updates are read from the same particle list.
