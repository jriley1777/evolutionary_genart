# Particle Flow Gen6: Non-Square Grids with Geometric Patterns

*Exploring alternative grid systems with hexagonal, triangular, and circular patterns to create unique particle behaviors*

## Overview

Particle Flow Gen6 breaks away from traditional square grid systems by implementing alternative geometric patterns including hexagonal, triangular, and circular grids. Each grid type creates unique particle behaviors and visual patterns, with particles being influenced by the nearest grid points. This piece demonstrates how different grid geometries can fundamentally change the character and flow of particle systems.

## What Makes It Unique

This piece represents a significant departure from traditional grid-based systems:

- **Hexagonal grid system**: Creates honeycomb-like particle clustering
- **Triangular grid system**: Forms triangular tessellation patterns
- **Circular grid system**: Generates radial and concentric particle flows
- **Grid influence physics**: Particles are attracted to nearest grid points
- **Geometric pattern rendering**: Grid points are visualized as geometric shapes
- **Dynamic grid switching**: System can switch between different grid types

The result is a piece that explores how fundamental geometric structures can influence particle behavior and create distinct visual aesthetics.

## Core Techniques

### 1. GridParticle Class

The piece introduces a specialized particle class for grid-based interactions:

```javascript
class GridParticle {
  constructor(p5) {
    this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
    this.vel = p5.createVector(0, 0);
    this.acc = p5.createVector(0, 0);
    this.maxSpeed = p5.random(2, 5);
    this.prevPos = this.pos.copy();
    this.life = 1.0;
    this.age = 0;
    this.maxAge = p5.random(300, 500);
    this.evolutionStage = 0;
    this.temperature = p5.random(0, 1);
    this.noiseOffset = p5.random(1000);
    this.nearestGridPoint = null;
    this.gridInfluence = 0;
    
    // Evolution parameters
    this.originalMaxSpeed = this.maxSpeed;
    this.originalSize = p5.random(1, 3);
    this.size = this.originalSize;
  }
}
```

Each particle tracks its nearest grid point and grid influence strength.

### 2. Hexagonal Grid Generation

The hexagonal grid creates a honeycomb-like pattern:

```javascript
const createHexagonalGrid = (p5) => {
  gridPoints = [];
  const hexSize = gridSize;
  const hexWidth = hexSize * 2;
  const hexHeight = hexSize * Math.sqrt(3);
  
  for (let y = 0; y < p5.height + hexHeight; y += hexHeight * 0.75) {
    for (let x = 0; x < p5.width + hexWidth; x += hexWidth * 0.75) {
      const offsetX = (y % (hexHeight * 1.5) < hexHeight * 0.75) ? 0 : hexWidth * 0.375;
      gridPoints.push({
        x: x + offsetX,
        y: y,
        type: 'hex'
      });
    }
  }
};
```

The hexagonal pattern uses offset positioning to create proper tessellation.

### 3. Triangular Grid Generation

The triangular grid creates alternating triangular patterns:

```javascript
const createTriangularGrid = (p5) => {
  gridPoints = [];
  const triSize = gridSize;
  const triHeight = triSize * Math.sqrt(3) / 2;
  
  for (let y = 0; y < p5.height + triHeight; y += triHeight) {
    for (let x = 0; x < p5.width + triSize; x += triSize) {
      // Upward triangle
      gridPoints.push({
        x: x,
        y: y,
        type: 'tri-up'
      });
      
      // Downward triangle
      gridPoints.push({
        x: x + triSize / 2,
        y: y + triHeight / 2,
        type: 'tri-down'
      });
    }
  }
};
```

The triangular grid creates both upward and downward pointing triangles.

### 4. Circular Grid Generation

The circular grid creates concentric circle patterns:

```javascript
const createCircularGrid = (p5) => {
  gridPoints = [];
  const centerX = p5.width / 2;
  const centerY = p5.height / 2;
  const maxRadius = Math.max(p5.width, p5.height) / 2;
  
  // Create concentric circles
  for (let radius = gridSize; radius < maxRadius; radius += gridSize) {
    const circumference = 2 * Math.PI * radius;
    const pointsOnCircle = Math.floor(circumference / gridSize);
    
    for (let i = 0; i < pointsOnCircle; i++) {
      const angle = (i / pointsOnCircle) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      gridPoints.push({
        x: x,
        y: y,
        type: 'circle',
        radius: radius,
        angle: angle
      });
    }
  }
};
```

The circular grid creates points along concentric circles with proper spacing.

### 5. Grid Influence System

Particles are influenced by their nearest grid points:

```javascript
findNearestGridPoint(p5) {
  let minDist = Infinity;
  this.nearestGridPoint = null;
  
  gridPoints.forEach(point => {
    const dist = p5.dist(this.pos.x, this.pos.y, point.x, point.y);
    if (dist < minDist) {
      minDist = dist;
      this.nearestGridPoint = point;
      this.gridInfluence = p5.map(dist, 0, gridSize, 1, 0, true);
    }
  });
}

applyGridInfluence(p5) {
  if (this.nearestGridPoint) {
    const attractForce = p5.createVector(
      this.nearestGridPoint.x - this.pos.x,
      this.nearestGridPoint.y - this.pos.y
    );
    attractForce.mult(0.001 * this.gridInfluence);
    this.applyForce(attractForce);
  }
}
```

Particles are attracted to grid points with strength based on distance.

## Generative Art Features

### Alternative Grid Systems

The system creates:
- **Hexagonal tessellation**: Honeycomb-like particle clustering
- **Triangular patterns**: Alternating triangular arrangements
- **Circular arrays**: Radial and concentric particle flows
- **Geometric influence**: Particles follow grid geometry
- **Pattern visualization**: Grid points rendered as geometric shapes

### Grid-Based Particle Physics

The physics system features:
- **Nearest point attraction**: Particles are drawn to closest grid points
- **Distance-based influence**: Influence strength varies with distance
- **Grid geometry following**: Particles follow the underlying grid pattern
- **Flow field combination**: Grid influence combines with flow field forces
- **Pattern emergence**: Grid patterns emerge through particle clustering

### Geometric Pattern Rendering

The rendering system includes:
- **Hexagon visualization**: Grid points rendered as hexagons
- **Triangle rendering**: Upward and downward triangles
- **Circle visualization**: Grid points as simple circles
- **Subtle grid display**: Grid patterns shown with low opacity
- **Pattern recognition**: Visual feedback for grid structure

### Dynamic Grid Influence

The influence system features:
- **Real-time calculation**: Nearest grid points calculated each frame
- **Smooth attraction**: Gradual attraction to grid points
- **Influence mapping**: Distance mapped to influence strength
- **Force combination**: Grid forces combined with flow field
- **Pattern formation**: Particles naturally form grid patterns

## Building Your Own

To create a similar grid-based particle system:

1. **Design grid geometries**: Plan different grid patterns and their properties
2. **Implement grid generation**: Create algorithms for different grid types
3. **Add grid influence physics**: Develop attraction systems for grid points
4. **Create pattern visualization**: Render grid patterns for visual feedback
5. **Optimize grid calculations**: Ensure efficient nearest point finding

## Related Techniques and Examples

- **Geometric Patterns**: Explore [M.C. Escher's tessellations](https://en.wikipedia.org/wiki/M._C._Escher)
- **Grid Systems**: Check out [Sol LeWitt's grid-based art](https://en.wikipedia.org/wiki/Sol_LeWitt)
- **Hexagonal Patterns**: Similar to [Buckminster Fuller's geodesic structures](https://en.wikipedia.org/wiki/Buckminster_Fuller)
- **Circular Arrays**: Inspired by [Robert Smithson's spiral works](https://en.wikipedia.org/wiki/Robert_Smithson)
- **Particle Grids**: Explore [Karl Sims's cellular automata](https://en.wikipedia.org/wiki/Karl_Sims)

## Technical Challenges and Solutions

### Challenge: Grid Generation
**Solution**: Use mathematical formulas for proper tessellation and spacing

### Challenge: Nearest Point Finding
**Solution**: Efficient distance calculation with early termination

### Challenge: Grid Influence Physics
**Solution**: Smooth force mapping with distance-based influence

### Challenge: Pattern Visualization
**Solution**: Efficient geometric shape rendering with proper scaling

## Conclusion

Particle Flow Gen6 demonstrates how fundamental geometric structures can fundamentally change particle behavior and visual aesthetics. By implementing alternative grid systems, we can create distinct particle behaviors that follow the underlying geometric patterns, resulting in unique visual compositions.

The key insights are:
- **Grid geometry matters**: Different grid types create fundamentally different behaviors
- **Geometric influence is powerful**: Grid patterns naturally emerge through particle attraction
- **Pattern visualization helps**: Visual feedback makes grid structure apparent
- **Efficient algorithms enable complexity**: Fast grid calculations allow for complex patterns
- **Geometric beauty emerges**: Natural patterns arise from mathematical grid structures

This approach can be extended to create many other types of grid-based generative art, from cellular automata to geometric tessellations to pattern-based animations, all while maintaining the signature ParticleFlow aesthetic and technical excellence. 