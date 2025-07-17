# Photo Mode System

A generalized photo mode system that can be applied to any p5.js sketch to create photo booth effects with multiple "frozen moments" displayed in a grid.

## Overview

The photo mode system consists of:

1. **PhotoModeManager** - Core utility class that handles panel creation and grid display
2. **withPhotoMode** - Higher-order component that wraps any sketch with photo mode functionality
3. **usePhotoMode** - React hook for direct integration

## Quick Start

### Option 1: Using the Higher-Order Component (Recommended)

```jsx
import { withPhotoMode } from './PhotoModeWrapper/PhotoModeWrapper';

// Your existing sketch component
const MySketch = ({ draw, isFullscreen, photoMode, ...props }) => {
  const setup = (p5, canvasParentRef) => {
    // Your setup code
  };

  const drawFunction = (p5, panelParams = {}) => {
    // Your sketch logic - this will be captured in photo mode
    // panelParams contains unique parameters for each panel
    p5.background(0);
    
    // Apply panel-specific transformations if provided
    if (panelParams.rotation) {
      p5.push();
      p5.translate(p5.width/2, p5.height/2);
      p5.rotate(panelParams.rotation);
      p5.translate(-p5.width/2, -p5.height/2);
    }
    
    // Your sketch content here
    p5.fill(255);
    p5.ellipse(p5.width/2, p5.height/2, 100, 100);
    
    if (panelParams.rotation) {
      p5.pop();
    }
  };

  const draw = (p5) => {
    drawFunction(p5);
  };

  return <ReactP5Wrapper setup={setup} draw={draw} />;
};

// Wrap your sketch with photo mode
const MySketchWithPhotoMode = withPhotoMode(MySketch, {
  maxPanels: 12,
  captureInterval: 10,
  gridCols: 4,
  gridRows: 3
});

// Use in your app
<MySketchWithPhotoMode photoMode={true} isFullscreen={false} />
```

### Option 2: Using the Hook Directly

```jsx
import { usePhotoMode } from './PhotoModeWrapper/PhotoModeWrapper';

const MySketch = ({ isFullscreen = false, photoMode = false }) => {
  const { photoModeManager } = usePhotoMode({
    maxPanels: 12,
    captureInterval: 10
  });

  const drawFunction = (p5, panelParams = {}) => {
    // Your sketch logic
  };

  const draw = (p5) => {
    if (photoMode) {
      if (photoModeManager.isCapturingActive()) {
        // Draw live preview while capturing
        drawFunction(p5);
        photoModeManager.update(p5, drawFunction);
        photoModeManager.drawCaptureProgress(p5);
      } else {
        // Show static grid
        photoModeManager.drawPhotoGrid(p5);
      }
    } else {
      // Normal mode
      drawFunction(p5);
    }
  };

  return <ReactP5Wrapper setup={setup} draw={draw} />;
};
```

## Configuration Options

### PhotoModeManager Options

```javascript
{
  maxPanels: 12,           // Number of panels to create
  captureInterval: 10,      // Frames between captures
  gridCols: 4,             // Grid columns
  gridRows: 3,             // Grid rows
  panelGap: 15             // Gap between panels in pixels
}
```

### Panel Parameters

Each panel gets unique parameters automatically generated:

```javascript
{
  rotation: 0.05,          // Rotation in radians
  scale: 1.02,             // Scale factor
  offset: 0.1,             // Time offset
  colorShift: 15,          // Color shift in degrees
  brightness: 1.05,        // Brightness multiplier
  hue: 30,                 // Hue shift
  saturation: 85,          // Saturation adjustment
  timeOffset: 0.1,         // Animation time offset
  noiseOffset: 100         // Noise function offset
}
```

## How It Works

1. **Capture Phase**: When photo mode is activated, the system captures frames at intervals
2. **Panel Creation**: Each captured frame becomes a panel with unique transformations
3. **Grid Display**: Once all panels are created, they're displayed in a grid layout
4. **Unique Moments**: Each panel represents a "frozen moment" with different parameters

## Integration Tips

1. **Separate Draw Logic**: Extract your main sketch logic into a function that accepts `panelParams`
2. **Handle Transformations**: Use `panelParams` to apply unique transformations to each panel
3. **Error Handling**: Add proper error handling for camera or other external inputs
4. **Performance**: Avoid creating new graphics buffers in the main draw loop

## Example: Camera-Based Sketch

```jsx
const CameraSketch = ({ isFullscreen, photoMode }) => {
  let video = null;
  
  const drawFunction = (p5, panelParams = {}) => {
    if (video) {
      // Apply panel-specific transformations
      if (panelParams.rotation) {
        p5.push();
        p5.translate(p5.width/2, p5.height/2);
        p5.rotate(panelParams.rotation);
        p5.translate(-p5.width/2, -p5.height/2);
      }
      
      // Draw video with panel-specific effects
      p5.image(video, 0, 0, p5.width, p5.height);
      
      if (panelParams.rotation) {
        p5.pop();
      }
    }
  };

  // ... rest of sketch implementation
};
```

## Benefits

- **Reusable**: Apply to any sketch with minimal code changes
- **Configurable**: Customize panel count, grid layout, capture timing
- **Unique**: Each panel has different parameters creating variety
- **Performance**: Efficient buffer management and rendering
- **Flexible**: Works with any p5.js sketch including camera, audio, or pure graphics 