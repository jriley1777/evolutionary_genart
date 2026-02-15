# Flow Field Voronoi

Same flow-field idea as Flow Field Grid but with a Voronoi tessellation instead of a square grid: 50 seed points define cells, with arrows, balls, and collision inside each cell.

## Concept

- **Voronoi cells**: 50 random seeds; each cell is the set of points closer to that seed than to any other. Cells are computed in p5 with half-plane clipping (no external library).
- **Flow, arrows, balls**: One flow vector per cell (stream function from seed position); arrow at cell centroid; 50 balls per cell that stay inside the cell and collide with each other.
- **Red ball**: One red ball moves with the flow, crosses cell boundaries, and screen-wraps. A counter in each cell increments when the red ball is fully inside that cell; the cell with the highest count gets a neon green glow.

## Technical notes

- Voronoi: clip the canvas rectangle by each perpendicular bisector (Sutherland–Hodgman) to get each cell polygon.
- Balls are clamped to the cell polygon (nearest point on boundary if they leave). Collision is per-cell with multiple iterations.
- Red ball “fully inside” means its center is in the cell and the distance from center to the cell edge is at least the red ball radius.
