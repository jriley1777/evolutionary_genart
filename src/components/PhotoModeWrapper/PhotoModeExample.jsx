import React from 'react';
import { withPhotoMode } from './PhotoModeWrapper';

/**
 * Example of how to wrap any sketch with photo mode functionality
 */

// Example sketch component
const ExampleSketch = ({ draw, isFullscreen, photoMode, ...props }) => {
  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.colorMode(p5.RGB, 255);
    p5.background(0);
  };

  const drawFunction = (p5, panelParams = {}) => {
    // This is the core sketch logic that will be captured in photo mode
    p5.background(0);
    
    // Apply panel-specific transformations if provided
    if (panelParams.rotation) {
      p5.push();
      p5.translate(p5.width/2, p5.height/2);
      p5.rotate(panelParams.rotation);
      p5.translate(-p5.width/2, -p5.height/2);
    }
    
    // Example sketch content
    p5.fill(255, 100, 100);
    p5.noStroke();
    p5.ellipse(p5.width/2, p5.height/2, 100, 100);
    
    p5.fill(100, 255, 100);
    p5.rect(p5.width/4, p5.height/4, 50, 50);
    
    p5.fill(100, 100, 255);
    p5.triangle(p5.width * 0.75, p5.height * 0.75, 
                p5.width * 0.85, p5.height * 0.6, 
                p5.width * 0.65, p5.height * 0.6);
    
    if (panelParams.rotation) {
      p5.pop();
    }
  };

  const draw = (p5) => {
    drawFunction(p5);
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return (
    <div>
      {React.createElement(draw, { setup, draw, windowResized, ...props })}
    </div>
  );
};

// Wrap the sketch with photo mode functionality
const ExampleSketchWithPhotoMode = withPhotoMode(ExampleSketch, {
  maxPanels: 6,
  captureInterval: 15,
  gridCols: 3,
  gridRows: 2
});

export default ExampleSketchWithPhotoMode; 