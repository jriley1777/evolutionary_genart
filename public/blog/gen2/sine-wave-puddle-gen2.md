# SineWavePuddle Gen2: Fractal Decomposition

## Concept

SineWavePuddle Gen2 explores the mathematical beauty of **fractal decomposition** - the process of breaking down complex wave patterns into simpler, self-similar components. This iteration focuses on the core concept of how waves can be decomposed into multiple layers of detail, each contributing to the overall organic form.

## Key Features

### Fractal Decomposition Layers
Each wave center generates 3-5 fractal layers, each with its own:
- **Frequency**: Higher frequencies (1.5-4.0) create finer detail
- **Amplitude**: Controls the strength of each layer's contribution
- **Phase**: Independent timing creates complex interference patterns
- **Noise Scale**: Perlin noise adds organic variation at different scales

### Simplified Performance
- **Reduced Complexity**: Removed interference field calculations and energy systems
- **Optimized Rendering**: 200 points per wave (vs 1000) for smooth performance
- **Streamlined Color**: Simple HSB color scheme based on wave progress and life
- **Focused Interaction**: Direct wave center creation without complex source systems

### Organic Movement
- **Gentle Drift**: Wave centers move slowly with Perlin noise
- **Life Cycles**: Each center has a natural lifespan (400-800 frames)
- **Layered Animation**: Each fractal layer animates independently

## Technical Implementation

### Fractal Layer Structure
```javascript
this.fractalLayers.push({
  frequency: p5.random(1.5, 4.0),    // Detail level
  amplitude: p5.random(0.2, 0.6),    // Contribution strength
  phase: p5.random(p5.TWO_PI),       // Timing offset
  noiseScale: p5.random(0.05, 0.15), // Organic variation
  detailLevel: i + 1                 // Layer hierarchy
});
```

### Wave Generation
Each wave combines multiple fractal layers:
1. **Base Radius**: Foundation wave size
2. **Sine Components**: Primary wave patterns at different frequencies
3. **Noise Detail**: Organic variation scaled by layer
4. **Combined Offset**: All layers contribute to final radius

### Performance Optimizations
- **Reduced Point Count**: 200 points vs 1000 for smooth rendering
- **Simplified Color**: Direct HSB mapping without complex calculations
- **Efficient Updates**: Minimal per-frame computations
- **Streamlined Rendering**: Single draw pass for outlines and fills

## Interaction

- **Click**: Add new wave center at mouse position
- **C Key**: Clear all wave centers
- **R Key**: Reset to initial state
- **S Key**: Add random wave center

## Mathematical Foundation

The fractal decomposition follows the principle that complex waveforms can be expressed as the sum of simpler components:

```
Wave(θ) = Σ(Layer_i(θ))
Layer_i(θ) = A_i * sin(f_i * θ + φ_i) + N_i(θ)
```

Where:
- `A_i` = amplitude of layer i
- `f_i` = frequency of layer i  
- `φ_i` = phase of layer i
- `N_i(θ)` = noise component for layer i

This creates waves that exhibit both mathematical precision and organic complexity, with each layer contributing to the overall form while maintaining its own character.

## Visual Aesthetics

The simplified approach creates:
- **Clean Forms**: Focus on wave structure without visual clutter
- **Depth Through Layering**: Multiple wave rings create natural depth
- **Organic Variation**: Noise and phase differences create natural asymmetry
- **Temporal Evolution**: Waves grow, move, and fade naturally

## Performance Benefits

- **60 FPS**: Smooth animation even with multiple wave centers
- **Responsive Interaction**: Immediate feedback to user input
- **Scalable**: Can handle 10+ wave centers without performance degradation
- **Memory Efficient**: Minimal object creation and cleanup

This iteration demonstrates how focusing on a single concept (fractal decomposition) while optimizing for performance can create compelling generative art that's both mathematically interesting and visually engaging.

---

*This piece was created using p5.js and React. The full source code is available in the project repository.* 