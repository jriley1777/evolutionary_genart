# ParticleFlow Gen7: Fractal Grid Systems

## Concept

ParticleFlow Gen7 introduces **fractal grid systems** - a recursive approach to particle organization that creates self-similar patterns at multiple scales. This generation explores how mathematical fractals can guide particle behavior, creating emergent complexity from simple recursive rules.

## Evolution from Gen6

While Gen6 explored non-Euclidean geometries (hexagons, triangles, circles), Gen7 takes the grid concept into the realm of **self-similarity** and **recursive subdivision**. The grid itself becomes a fractal object, with particles responding to multiple levels of organization simultaneously.

## Key Features

### Fractal Grid Architecture
- **Recursive Subdivision**: Grid cells can subdivide into smaller grids, creating nested levels of organization
- **Depth-Based Behavior**: Particles respond differently based on which fractal level they inhabit
- **Self-Similar Attractors**: Each grid level creates attractors that influence particle movement
- **Dynamic Subdivision**: Grids subdivide probabilistically, creating organic, non-uniform patterns

### Particle-Fractal Interaction
- **Multi-Scale Awareness**: Particles can sense and respond to multiple grid levels simultaneously
- **Depth-Dependent Coloring**: Particle appearance changes based on fractal depth
- **Hierarchical Forces**: Attractors at different depths exert different strengths
- **Emergent Complexity**: Simple rules create complex, evolving patterns

### Visual Design
- **Rainbow Depth Mapping**: Each fractal level gets a distinct color palette
- **Transparent Grid Overlay**: Shows the fractal structure without overwhelming the particles
- **Size Variation**: Particles scale with fractal depth
- **Organic Movement**: Noise-based forces create natural, flowing motion

## Technical Implementation

### Grid Generation
```javascript
// Recursive subdivision with probability
for (let depth = 1; depth <= maxDepth; depth++) {
  for (let cell of gridLevels[depth - 1].cells) {
    if (p5.random() < 0.3) { // 30% subdivision chance
      let subGrid = createGrid(cell.x, cell.y, cell.w, cell.h, 2, 2);
      newLevel.push(...subGrid.cells);
    }
  }
}
```

### Particle Depth Detection
```javascript
getCurrentDepth(p5) {
  // Find which fractal cell the particle is in
  for (let level = gridLevels.length - 1; level >= 0; level--) {
    for (let cell of gridLevels[level].cells) {
      if (this.pos.x >= cell.x && this.pos.x < cell.x + cell.w &&
          this.pos.y >= cell.y && this.pos.y < cell.y + cell.h) {
        return level;
      }
    }
  }
  return 0;
}
```

## Artistic Philosophy

Gen7 embodies the principle that **complexity emerges from simple recursive rules**. The fractal grid serves as both a visual structure and a behavioral guide, creating a system where:

- **Self-Similarity** creates visual harmony across scales
- **Recursive Organization** provides multiple levels of particle interaction
- **Emergent Behavior** arises from the interaction between particles and fractal structure
- **Mathematical Beauty** manifests through geometric self-reference

## Influences

- **Mandelbrot's Fractals**: Mathematical foundation for self-similar patterns
- **Cellular Automata**: Grid-based systems with emergent behavior
- **Recursive Art**: Self-referential visual structures
- **Complex Systems**: Multi-scale interactions and emergent complexity

## Future Directions

This fractal approach opens possibilities for:
- **Infinite Recursion**: Unlimited depth levels with performance optimization
- **Interactive Fractals**: User-controlled subdivision and modification
- **Fractal Evolution**: Grids that evolve and mutate over time
- **Cross-Scale Communication**: Particles that bridge multiple fractal levels

The fractal grid system represents a fundamental shift from static geometric organization to dynamic, self-referential structures that guide particle behavior through mathematical beauty. 