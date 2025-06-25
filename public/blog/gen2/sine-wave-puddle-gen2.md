# SineWavePuddle Gen2: Walker-Based Fractal Ecosystems

*Exploring emergent behavior through autonomous walkers, fractal wave decomposition, and organic movement patterns*

## Concept

SineWavePuddle Gen2 has evolved into a sophisticated ecosystem simulation featuring autonomous walkers that create fractal wave patterns. This iteration explores the concept of **emergent behavior** - how complex, beautiful patterns can arise from simple rules and autonomous agents. The piece demonstrates how individual walkers, each following simple movement algorithms, can collectively create a living, breathing landscape of fractal waves.

## Key Features

### Autonomous Walker System
The piece features multiple autonomous walkers that:
- **Follow organic curved paths** using multiple sine waves and Perlin noise
- **Respond to mouse presence** with attraction/repulsion behaviors
- **Create waves periodically** as they move through the environment
- **Maintain safe distances** from each other and the mouse
- **Have unique personalities** with different movement speeds and exploration patterns

### Fractal Wave Decomposition
Each wave center generates complex fractal patterns with:
- **Multiple decomposition layers** (3-5 layers per wave)
- **Independent frequencies** (1.5-4.0) for varying detail levels
- **Layered noise systems** that create organic variation at different scales
- **Phase-independent animation** for complex interference patterns

### Interactive Ecosystem
The system responds to user interaction:
- **Mouse attraction**: Walkers are drawn to stationary mouse positions
- **Safe distance maintenance**: Walkers maintain minimum distances from mouse and each other
- **Exploration mode**: Walkers return to organic exploration when mouse is inactive
- **Dynamic wave creation**: Waves are generated based on walker movement patterns

## Technical Implementation

### Walker Behavior System
```javascript
class Walker {
  constructor(p5, x, y, color) {
    this.x = x;
    this.y = y;
    this.interestInMouse = p5.random(0.3, 0.8);
    this.explorationRadius = p5.random(0.2, 0.6);
    this.explorationSpeed = p5.random(0.008, 0.015);
    this.attractionSpeed = p5.random(0.015, 0.025);
    this.safeDistance = 100;
    this.walkerSafeDistance = 80;
  }

  update(p5, otherWalkers) {
    // Determine behavior based on mouse proximity and activity
    const distanceToMouse = p5.dist(this.x, this.y, mouseX, mouseY);
    const mouseStationaryTime = globalTime - lastMouseMoveTime;
    const shouldBeAttracted = this.attractionMode && 
                             mouseInCanvas &&
                             distanceToMouse < 400 &&
                             mouseStationaryTime < 300;
    
    if (shouldBeAttracted) {
      // Attraction mode - move toward mouse while maintaining safe distance
      const angleToMouse = p5.atan2(mouseY - this.y, mouseX - this.x);
      targetX = mouseX - p5.cos(angleToMouse) * this.safeDistance;
      targetY = mouseY - p5.sin(angleToMouse) * this.safeDistance;
    } else {
      // Exploration mode - create organic curved paths
      const time = globalTime * 0.01;
      const radius = p5.min(p5.width, p5.height) * this.explorationRadius;
      
      // Multiple sine waves for complex curved paths
      const primaryX = p5.cos(time * speedMultiplier + patternOffset) * radius * 0.4;
      const primaryY = p5.sin(time * speedMultiplier * 1.3 + patternOffset) * radius * 0.4;
      const secondaryX = p5.cos(time * speedMultiplier * 0.7 + patternOffset * 2) * radius * 0.3;
      const secondaryY = p5.sin(time * speedMultiplier * 0.9 + patternOffset * 1.5) * radius * 0.3;
      
      // Add Perlin noise for organic variation
      const noiseX = (p5.noise(this.noiseOffset + time * 0.5) - 0.5) * radius * 0.2;
      const noiseY = (p5.noise(this.noiseOffset + 1000 + time * 0.5) - 0.5) * radius * 0.2;
      
      targetX = centerX + primaryX + secondaryX + noiseX;
      targetY = centerY + primaryY + secondaryY + noiseY;
    }
  }
}
```

### Fractal Wave Generation
Each wave center creates complex fractal patterns:
```javascript
generateWave(p5, waveIndex) {
  const wavePoints = [];
  const numPoints = 30;
  const waveRadius = this.radius * (waveIndex / this.waveCount);
  
  for (let i = 0; i < numPoints; i++) {
    const angle = p5.map(i, 0, numPoints, 0, p5.TWO_PI);
    let radius = waveRadius;
    
    // Add fractal decomposition layers
    let fractalOffset = 0;
    this.fractalLayers.forEach(layer => {
      // Primary sine wave for this layer
      fractalOffset += p5.sin(
        angle * layer.frequency + 
        globalTime * 0.01 * layer.frequency + 
        layer.phase
      ) * layer.amplitude * 20;
      
      // Add noise detail scaled by layer
      fractalOffset += p5.noise(
        p5.cos(angle) * layer.noiseScale + this.noiseOffset,
        p5.sin(angle) * layer.noiseScale + waveIndex * 0.1
      ) * layer.amplitude * 15;
    });
    
    radius += fractalOffset;
    const x = this.x + p5.cos(angle) * radius;
    const y = this.y + p5.sin(angle) * radius;
    wavePoints.push({ x, y });
  }
  
  return wavePoints;
}
```

## Interaction

- **Mouse Movement**: Walkers are attracted to stationary mouse positions
- **Mouse Proximity**: Walkers maintain safe distances while being drawn to the mouse
- **Automatic Exploration**: Walkers return to organic exploration when mouse is inactive
- **Wave Creation**: Waves are automatically generated as walkers move

## Mathematical Foundation

The system demonstrates emergent behavior through:
- **Simple rules** creating complex patterns
- **Autonomous agents** with individual personalities
- **Collective behavior** emerging from individual actions
- **Fractal decomposition** creating infinite detail at multiple scales

Each walker follows simple movement algorithms, but their collective behavior creates a living ecosystem of fractal waves that responds to user interaction while maintaining organic, natural movement patterns.

## Visual Aesthetics

The piece creates:
- **Living landscapes** that feel alive and responsive
- **Organic movement** through curved paths and natural variation
- **Fractal complexity** with infinite detail at multiple scales
- **Interactive ecosystems** that respond to user presence
- **Emergent beauty** from simple underlying rules

## Performance Benefits

- **Efficient walker system** with optimized movement calculations
- **Reduced wave complexity** for smooth performance
- **Smart interaction detection** that minimizes computational overhead
- **Scalable architecture** that can handle multiple walkers and waves

This iteration demonstrates how focusing on emergent behavior and autonomous agents can create compelling generative art that feels alive and responsive while maintaining mathematical sophistication and visual beauty.

---

*This piece was created using p5.js and React. The full source code is available in the project repository.* 