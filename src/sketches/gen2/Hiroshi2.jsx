import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Hiroshi2 = ({ isFullscreen = false }) => {
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
      
      // Draw 20 iterations of fluid curve cutouts using clipping
      for (let iteration = 0; iteration < 20; iteration++) {
        drawFluidCurveCutouts(p5, iteration);
      }
    };

    const drawFluidCurveCutouts = (p5, iteration) => {
      p5.push();
      
      // Create clipping mask for this curve using proper p5.js clip() with callback
      p5.clip(() => {
        // Generate control points for fluid curve
        const startX = p5.random(p5.width);
        const startY = p5.random(p5.height);
        const curveLength = p5.random(150, 400);
        const maxWidth = p5.random(15, 35);
        
        const numSegments = p5.random(8, 15);
        const controlPoints = [];
        
        // Create irregular control points
        for (let j = 0; j < numSegments; j++) {
          const progress = j / (numSegments - 1);
          const baseX = startX + p5.cos(progress * p5.TWO_PI + iteration * 0.1) * curveLength * 0.3;
          const baseY = startY + p5.sin(progress * p5.TWO_PI + iteration * 0.2) * curveLength * 0.3;
          
          // Add irregularity with noise and sine waves
          const noiseX = p5.noise(j * 0.5, iteration * 0.1) * 100 - 50;
          const noiseY = p5.noise(j * 0.3, iteration * 0.15) * 100 - 50;
          const sineX = p5.sin(j * 0.7 + iteration * 0.3) * 60;
          const sineY = p5.cos(j * 0.5 + iteration * 0.4) * 60;
          
          controlPoints.push({
            x: baseX + noiseX + sineX,
            y: baseY + noiseY + sineY,
            width: maxWidth * (0.3 + 0.7 * p5.noise(j * 0.2, iteration * 0.05))
          });
        }
        
        // Draw the clipping shape
        p5.beginShape();
        for (let j = 0; j < controlPoints.length - 1; j++) {
          const current = controlPoints[j];
          const next = controlPoints[j + 1];
          
          for (let t = 0; t <= 1; t += 0.1) {
            const x = p5.lerp(current.x, next.x, t);
            const y = p5.lerp(current.y, next.y, t);
            const width = p5.lerp(current.width, next.width, t);
            
            // Add subtle irregularity to the path
            const irregularityX = p5.sin(t * 10 + iteration * 0.5) * 8;
            const irregularityY = p5.cos(t * 8 + iteration * 0.6) * 8;
            
            const finalX = x + irregularityX;
            const finalY = y + irregularityY;
            
            // Calculate perpendicular direction for width
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            const length = p5.sqrt(dx * dx + dy * dy);
            
            if (length > 0) {
              const perpX = -dy / length;
              const perpY = dx / length;
              
              // Add points on both sides of the curve
              p5.vertex(finalX + perpX * width * 0.1, finalY + perpY * width * 0.1);
              p5.vertex(finalX - perpX * width * 0.1, finalY - perpY * width * 0.1);
            }
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

export default Hiroshi2; 