# Plotter Flow Path

A single continuous line is drawn by a “pen” that follows a flow field. The path never crosses itself, so the result is suitable for plotter art or as a line you could imagine drawing with a pen plotter.

## Concept

- One agent (the pen) moves step-by-step according to the flow field; each step is drawn as a segment of the line.
- Before accepting a step, the sketch checks that the new segment would not cross any existing segment. If it would, it tries perpendicular or opposite directions, or a smaller step, until a valid move is found or the path stops.
- Flow field is noise-based with optional mouse influence, so the line meanders in a flow-driven way while staying self-avoiding.
- Aesthetic: off-white “paper” background and a single dark stroke, like a pen on paper.

## Technical notes

- Segment–segment intersection test (proper crossing only) used to reject moves that would cause self-intersection.
- Path is an array of points; each frame one new point is appended when a valid step is found; the entire path is redrawn so the line accumulates without fading.
- When no valid step exists (stuck), the path stops and the sketch no longer updates; reload to draw again.
