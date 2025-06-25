# Smoke Trails Gen2: Multi-Particle Ecosystem

## Overview

SmokeTrails Gen2 evolves the original smoke simulation into a rich multi-particle ecosystem where different particle types interact with dynamic environmental conditions. This generation introduces fire, steam, and enhanced smoke particles that respond to temperature, humidity, and wind patterns.

## Key Features

### Multi-Particle Types
- **Smoke**: The foundational particle type with balanced properties
- **Fire**: High-energy particles with shorter lifespans and angular shapes
- **Steam**: Long-lived particles that respond to humidity and condense

### Environmental System
- **Temperature**: Affects particle behavior and color intensity
- **Humidity**: Influences steam formation and condensation
- **Wind**: Dynamic air currents that affect all particle movement

### Visual Enhancements
- **Color Temperature**: Particles change color based on environmental conditions
- **Shape Variation**: Different particle types have distinct visual forms
- **Environmental Response**: Background and particle behavior adapt to conditions

## Technical Implementation

### Particle Type System
Each particle type has unique properties:
```javascript
const PARTICLE_TYPES = {
  SMOKE: { name: 'smoke', charge: 0, mass: 1, reactivity: 0.1 },
  FIRE: { name: 'fire', charge: 0.3, mass: 0.8, reactivity: 0.8 },
  STEAM: { name: 'steam', charge: -0.2, mass: 0.6, reactivity: 0.3 }
};
```

### Environmental Conditions
The system uses Perlin noise to create smooth, organic variations in environmental conditions:
- Temperature varies over time affecting particle behavior
- Humidity influences steam formation and condensation
- Wind patterns create dynamic air movement

### Type-Specific Behavior
- **Fire particles** flicker and can spawn additional fire particles
- **Steam particles** respond to humidity and can condense
- **Smoke particles** are affected by temperature variations

## Artistic Direction

This generation explores the relationship between different states of matter and environmental conditions. The visual language emphasizes the fluid nature of these transformations, with particles that can change behavior based on their surroundings.

## References and Inspiration

- **Fire Simulation**: Inspired by traditional fire effects in computer graphics
- **Steam Physics**: Based on real-world steam behavior and condensation
- **Environmental Art**: Influenced by artists who work with natural phenomena

## Evolution from Gen1

Gen2 builds upon the original smoke simulation by:
- Adding multiple particle types with distinct behaviors
- Introducing environmental conditions that affect all particles
- Creating a more complex and dynamic visual system
- Maintaining the core smoke aesthetic while expanding the palette

## Future Directions

This generation sets up the foundation for:
- Particle interactions and chemical reactions
- More complex environmental systems
- Narrative elements and storytelling through particle behavior
- 3D space and depth perception 