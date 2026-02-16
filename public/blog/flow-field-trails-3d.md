# Flow Field Trails 3D

A **Three.js** sketch that brings flow-field particle trails into 3D space, with a camera that slowly flies through the scene.

## Concept

- **3D flow field:** Particle motion is driven by a 3D Perlin-style noise field; each particle samples the flow at its position and follows it.
- **Trails:** Each particle draws a short trail (line strip) so you see flowing ribbons in space.
- **Flying camera:** The camera orbits and bobs gently through the volume so you feel like you’re moving through the trails, without fast or jarring motion.

## Technical notes

- Built with Three.js (no p5). Particles are updated every frame; flow is sampled via numerical derivatives of 3D noise.
- Camera path: circular orbit with a slow vertical wave. Speed and radius are tuned to keep the motion calm.
- Scene uses fog and a dark background; particle colors match the 2D flow-field palette (pink, blue, teal, purple).
