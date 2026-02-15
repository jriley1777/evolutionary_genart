# Flow Field Grid

Visualizes the same divergence-free flow field used in Slow Flow Trails as a grid with arrows at each cell center.

## Concept

- Same stream-function flow field (toroidal, no sources/sinks) and cell size as Slow Flow Trails.
- Grid lines show cell boundaries; arrows show flow direction at the center of each cell.
- Mouse position influences the field so you can see how the arrows respond.
- No particles—purely a field visualization.

## Technical notes

- Flow field is computed each frame with the same getPsi / gradient logic as Slow Flow Trails.
- Arrows are drawn as a line plus a small V-shaped head; length is fixed for clarity.
- Grid uses a light stroke; arrow color is a single highlight (e.g. blue-white) for visibility on the dark background.
