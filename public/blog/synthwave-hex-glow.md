# Synthwave Hex Glow

Synthwave-style hexagonal grid with particle illumination and neon glow effects.

## Concept

- A hexagonal grid covers the canvas; particles move across it.
- Particles “illuminate” nearby hexes, changing their color or brightness.
- Palette uses synthwave neon (pinks, purples, cyans) with smooth transitions.
- Glow is achieved by drawing soft highlights or adjusting fill based on particle proximity.

## Technical notes

- Hex grid is generated with consistent spacing and offset rows.
- Each hex’s color or brightness is computed from distances to nearby particles.
- Optional trail or motion blur can enhance the glow effect.
