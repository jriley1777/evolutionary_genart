# Smoke Trails Gen3: Emergent Interactions

## Overview

SmokeTrails Gen3 introduces a complex system of particle interactions, flocking behavior, and chemical reactions. This generation explores emergent behaviors where particles form connections, react with each other, and create dynamic patterns through collective behavior.

## Key Features

### Particle Interactions
- **Flocking Behavior**: Particles align, cohere, and separate based on proximity
- **Chemical Reactions**: Different particle types can combine to create new particles
- **Connection Visualization**: Lines show particle relationships and interactions

### Enhanced Particle Types
- **Plasma**: High-energy particles with triangular shapes and electric behavior
- **Ash**: Heavy particles affected by gravity with irregular shapes
- **Enhanced Fire/Steam/Smoke**: Improved behaviors and interactions

### Emergent Behaviors
- **Particle Networks**: Dynamic connections form between nearby particles
- **Reaction Chains**: Chemical reactions can trigger cascading effects
- **Collective Movement**: Particles move as groups while maintaining individual characteristics

## Technical Implementation

### Flocking Algorithm
The system implements Craig Reynolds' flocking algorithm with three main forces:
```javascript
// Alignment - match velocity of neighbors
alignment.add(other.vel);

// Cohesion - move toward center of neighbors  
cohesion.add(other.pos);

// Separation - avoid crowding
if (distance < 30) {
  const diff = p5.createVector(this.pos.x - other.pos.x, this.pos.y - other.pos.y);
  diff.normalize();
  diff.div(distance);
  separation.add(diff);
}
```

### Chemical Reaction System
Particles can react when they come close together:
- **Fire + Steam = Plasma**: Creates high-energy plasma particles
- **Fire + Smoke = Ash**: Produces heavy ash particles
- **Plasma + Plasma = Explosion**: Triggers multiple fire particles

### Connection Detection
Particles find nearby neighbors within a 100-pixel radius and track their relationships for both flocking and reaction systems.

## Artistic Direction

This generation explores the beauty of emergent complexity, where simple rules create rich, unpredictable behaviors. The visual language emphasizes connections and relationships, showing how individual particles become part of larger systems.

## References and Inspiration

- **Flocking Behavior**: Based on Craig Reynolds' Boids algorithm
- **Emergent Systems**: Inspired by cellular automata and complex systems theory
- **Chemical Reactions**: Influenced by real-world chemistry and particle physics
- **Network Visualization**: Drawing from social network and graph theory visualization

## Evolution from Gen2

Gen3 builds upon the multi-particle system by:
- Adding flocking behavior that creates organic movement patterns
- Introducing chemical reactions that transform particle types
- Creating visual connections that show particle relationships
- Adding new particle types (Plasma, Ash) with unique properties
- Implementing emergent behaviors that arise from simple rules

## Technical Challenges

### Performance Optimization
- Efficient neighbor detection using distance calculations
- Reaction cooldowns to prevent excessive particle creation
- Connection visualization with distance-based filtering

### Behavior Balancing
- Flocking forces must be carefully tuned to avoid chaotic movement
- Chemical reaction probabilities balanced for interesting but not overwhelming effects
- Particle type distributions adjusted for visual harmony

## Future Directions

This generation sets up the foundation for:
- More complex reaction chains and particle evolution
- Narrative elements and storytelling through particle interactions
- 3D space and depth perception
- Environmental storytelling and dramatic arcs
- Advanced visual effects and particle rendering 