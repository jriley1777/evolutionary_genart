import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Hiroshi4 = ({ isFullscreen = false }) => {
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;
  let iterationCount = 0;
  let isDrawingComplete = false;

  const sketch = (p5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.colorMode(p5.HSB, 360, 100, 100, 1);
      p5.background(255); // White background
      
      // Start the drawing process
      drawCompleteArtwork(p5);
    };

    const drawCompleteArtwork = (p5) => {
      // White background
      p5.background(255);
      
      // Draw 20 iterations of fractal shapes containing gradients
      for (let iteration = 0; iteration < 20; iteration++) {
        drawFractalShapes(p5, iteration);
      }
      
      isDrawingComplete = true;
    };

    const drawFractalShapes = (p5, iteration) => {
      p5.push();
      
      // Set blend mode for color burn effect
      p5.blendMode(p5.BURN);
      
      // Create multiple fractal-inspired shapes with gradients
      for (let i = 0; i < 5; i++) {
        const centerX = p5.random(p5.width);
        const centerY = p5.random(p5.height);
        const size = p5.random(100, 300);
        const thickness = p5.random(5, 20);
        
        // Create gradient for this fractal
        const gradientHue = p5.random(0, 360);
        const gradientSat = p5.random(80, 100);
        
        p5.strokeWeight(thickness);
        p5.noFill();
        
        // Draw fractal-like irregular shapes with gradients
        p5.beginShape();
        const numPoints = p5.random(8, 15);
        for (let j = 0; j < numPoints; j++) {
          const angle = (j / numPoints) * p5.TWO_PI;
          const radius = size * (0.3 + 0.7 * p5.noise(j * 0.5, iteration * 0.1));
          
          // Add chaotic variations
          const chaosX = p5.sin(angle * 3 + iteration * 2) * 30;
          const chaosY = p5.cos(angle * 2 + iteration * 1.5) * 25;
          
          const x = centerX + p5.cos(angle) * radius + chaosX;
          const y = centerY + p5.sin(angle) * radius + chaosY;
          
          // Create gradient effect along the fractal perimeter
          const gradientProgress = j / numPoints;
          const brightness = p5.lerp(20, 40, gradientProgress);
          const alpha = p5.lerp(0.7, 0.9, gradientProgress);
          
          p5.stroke(gradientHue, gradientSat, brightness, alpha);
          p5.vertex(x, y);
        }
        p5.endShape(p5.CLOSE);
        
        // Add inner fractal details with different gradient
        p5.beginShape();
        for (let j = 0; j < numPoints; j++) {
          const angle = (j / numPoints) * p5.TWO_PI + p5.sin(iteration * 0.5) * 0.5;
          const radius = size * 0.4 * (0.2 + 0.8 * p5.noise(j * 0.3, iteration * 0.2));
          
          const x = centerX + p5.cos(angle) * radius;
          const y = centerY + p5.sin(angle) * radius;
          
          // Inner gradient with different characteristics
          const innerGradientProgress = j / numPoints;
          const innerBrightness = p5.lerp(15, 25, innerGradientProgress);
          const innerAlpha = p5.lerp(0.5, 0.7, innerGradientProgress);
          
          p5.stroke(gradientHue, gradientSat, innerBrightness, innerAlpha);
          p5.vertex(x, y);
        }
        p5.endShape(p5.CLOSE);
      }
      
      p5.pop();
    };

    p5.draw = () => {
      // No continuous drawing - artwork is static once complete
      if (!isDrawingComplete) {
        drawCompleteArtwork(p5);
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      // Redraw the artwork when window is resized
      isDrawingComplete = false;
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default Hiroshi4; 