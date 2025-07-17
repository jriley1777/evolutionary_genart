import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Hiroshi3 = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let iterationCount = 0;
    let isDrawingComplete = false;

    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.colorMode(p5.HSB, 360, 100, 100, 1);
      p5.background(255);
      
      // Start the drawing process
      drawCompleteArtwork(p5);
    };

    const drawCompleteArtwork = (p5) => {
      // Layer 1: Draw the gradient background
      drawGradients(p5);
      
      // Layer 2: Create white canvas with clipping masks
      createWhiteCanvasWithCutouts(p5);
      
      isDrawingComplete = true;
    };

    const drawGradients = (p5) => {
      const panelWidth = p5.width / 2;
      
      // Beach Sunrise Panel
      for (let x = 0; x < panelWidth; x += 5) {
        for (let y = 0; y < p5.height; y += 5) {
          const gradientProgress = y / p5.height;
          const hue = p5.lerp(25, 35, gradientProgress); // Light peach to orange
          const saturation = p5.lerp(100, 0, gradientProgress);
          const brightness = p5.lerp(95, 100, gradientProgress);
          const noise = p5.random(-0.25, 0.25);
          p5.stroke(255);
          p5.strokeWeight(0.5);
          p5.fill(hue, saturation, brightness);
          p5.rect(x + noise, y + noise, 5, 5);
        }
      }

      // Purple-Pink Panel
      for (let x = panelWidth; x < p5.width; x += 5) {
        for (let y = 0; y < p5.height; y += 5) {
          const gradientProgress = y / p5.height;
          const hue = p5.lerp(260, 350, gradientProgress); // More vibrant purple to pink
          const saturation = p5.lerp(100, 0, gradientProgress);
          const brightness = p5.lerp(95, 100, gradientProgress);
          const noise = p5.random(-0.25, 0.25);
          p5.stroke(255);
          p5.fill(hue, saturation, brightness);
          p5.circle(x + noise, y + noise, 6);
        }
      }
    };

    const createWhiteCanvasWithCutouts = (p5) => {
      // Create a white canvas
      p5.push();
      p5.fill(255);
      p5.rect(0, 0, p5.width, p5.height);
      p5.pop();
      
      // Draw 20 iterations of pendulum cutouts using clipping
      for (let iteration = 0; iteration < 20; iteration++) {
        drawPendulumCutouts(p5, iteration);
      }
    };

    const drawPendulumCutouts = (p5, iteration) => {
      p5.push();
      
      // Create clipping mask for this pendulum using proper p5.js clip() with callback
      p5.clip(() => {
        // Generate pendulum path points
        const centerX = p5.random(p5.width);
        const centerY = p5.random(p5.height);
        const length1 = p5.random(80, 150);
        const length2 = p5.random(60, 120);
        const thickness = p5.random(8, 25);
        
        // Simulate double pendulum motion with fixed angles for static result
        const angle1 = p5.sin(iteration * 0.5) * 2 + p5.cos(iteration * 0.3) * 1.5;
        const angle2 = p5.sin(iteration * 0.7) * 3 + p5.cos(iteration * 0.4) * 2;
        
        // Calculate pendulum positions
        const x1 = centerX + p5.cos(angle1) * length1;
        const y1 = centerY + p5.sin(angle1) * length1;
        const x2 = x1 + p5.cos(angle1 + angle2) * length2;
        const y2 = y1 + p5.sin(angle1 + angle2) * length2;
        
        // Generate points along the pendulum path
        const pathPoints = [];
        for (let t = 0; t < 1; t += 0.02) {
          const chaos1 = p5.sin(t * 20 + iteration * 2) * 15;
          const chaos2 = p5.cos(t * 15 + iteration * 1.5) * 12;
          
          const interpAngle1 = p5.lerp(0, angle1, t);
          const interpAngle2 = p5.lerp(0, angle2, t);
          
          const px = centerX + p5.cos(interpAngle1) * (length1 * t) + chaos1;
          const py = centerY + p5.sin(interpAngle1) * (length1 * t) + chaos2;
          
          pathPoints.push({ x: px, y: py });
        }
        
        // Draw the clipping shape
        p5.beginShape();
        for (let i = 0; i < pathPoints.length - 1; i++) {
          const current = pathPoints[i];
          const next = pathPoints[i + 1];
          
          // Calculate perpendicular direction for width
          const dx = next.x - current.x;
          const dy = next.y - current.y;
          const length = p5.sqrt(dx * dx + dy * dy);
          
          if (length > 0) {
            const perpX = -dy / length;
            const perpY = dx / length;
            
            // Add points on both sides of the path
            p5.vertex(current.x + perpX * thickness * 0.5, current.y + perpY * thickness * 0.5);
            p5.vertex(current.x - perpX * thickness * 0.5, current.y - perpY * thickness * 0.5);
          }
        }
        p5.endShape(p5.CLOSE);
      });
      
      // Clear the clipped area to create the "hole"
      p5.clear();
      
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

export default Hiroshi3; 