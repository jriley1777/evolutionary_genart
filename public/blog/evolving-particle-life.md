# Evolving Particle Life

Advanced particle system with attractors, audio reactivity, and particle evolution.

## Concept

- Particles have a lifecycle: they age, change size and color, and are replaced when they “die.”
- Multiple noise layers drive the flow field for more varied motion.
- Color reflects evolution stage (e.g. cool when young, warm when mature, deep when old).
- Optional audio input can influence the system.

## Technical notes

- Lifecycle is age-based with distinct young / mature / old stages.
- Dead particles are removed and new ones spawned to keep population stable.
- Flow field combines several noise frequencies.
- Rendering uses trails with opacity tied to remaining life.
