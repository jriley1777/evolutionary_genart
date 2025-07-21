import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Hiroshi2 = ({ isFullscreen = false }) => {
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
      p5.background(200);
      
      // Draw the gradient background
      drawGradients(p5);

      // p5.beginClip();
      // Create multiple clips, each with a single shape
      p5.stroke(255);
      p5.strokeWeight(3);
      for (let curve = 0; curve < 80; curve++) {
        singleFluidCurve(curve);
      }
      // p5.endClip();
    };

    // Define single fluid curve function
    const singleFluidCurve = (curveIndex) => {
      const startX = p5.random(p5.windowWidth);
      const startY = p5.random(p5.windowHeight);
      const curveLength = p5.random(150, 400);
      const maxWidth = p5.random(15, 35);
      
      const numSegments = p5.random(8, 15);
      const controlPoints = [];
      
      // Create irregular control points
      for (let j = 0; j < numSegments; j++) {
        const progress = j / (numSegments - 1);
        const baseX = startX + p5.cos(progress * p5.TWO_PI + curveIndex * 0.1) * curveLength * 0.3;
        const baseY = startY + p5.sin(progress * p5.TWO_PI + curveIndex * 0.2) * curveLength * 0.3;
        
        // Add irregularity with noise and sine waves
        const noiseX = p5.noise(j * 0.5, curveIndex * 0.1) * 100 - 50;
        const noiseY = p5.noise(j * 0.3, curveIndex * 0.15) * 100 - 50;
        const sineX = p5.sin(j * 0.7 + curveIndex * 0.3) * 60;
        const sineY = p5.cos(j * 0.5 + curveIndex * 0.4) * 60;
        
        controlPoints.push({
          x: baseX + noiseX + sineX,
          y: baseY + noiseY + sineY,
          width: maxWidth * (0.3 + 0.7 * p5.noise(j * 0.2, curveIndex * 0.05))
        });
      }
      
      // Create smooth curve by interpolating between control points
      for (let j = 0; j < controlPoints.length - 1; j++) {
        const current = controlPoints[j];
        const next = controlPoints[j + 1];
        
        // Sample points along the curve
        for (let t = 0; t <= 1; t += 0.05) {
          const x = p5.lerp(current.x, next.x, t);
          const y = p5.lerp(current.y, next.y, t);
          const width = p5.lerp(current.width, next.width, t);
          
          // Add subtle irregularity to the path
          const irregularityX = p5.sin(t * 10 + curveIndex * 0.5) * 8;
          const irregularityY = p5.cos(t * 8 + curveIndex * 0.6) * 8;
          
          const finalX = x + irregularityX;
          const finalY = y + irregularityY;
          // Draw a point at this position with varying size
          p5.circle(finalX, finalY, 1);
        }
      }
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

    p5.draw = () => {
      // No continuous drawing - artwork is static once complete
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      // Redraw the artwork when window is resized
      p5.setup();
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default Hiroshi2; 