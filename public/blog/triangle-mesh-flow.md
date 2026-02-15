# Triangle Mesh Flow

Triangular mesh where invisible particles influence triangle colors via a flow field.

## Concept

- The canvas is subdivided into triangles (e.g. Delaunay or regular tiling).
- Particles move through a flow field but are not drawn; they only affect the mesh.
- Triangle color or shading is derived from nearby particle positions or density.
- Mouse or flow field motion drives the particles, so the mesh appears to flow.

## Technical notes

- Mesh can be built with a triangulation library or a simple regular grid of triangles.
- A pass over triangles assigns color based on particle positions (e.g. distance or count).
- Flow field and particle update logic match other particle sketches; only rendering differs.
