import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Hiroshi1 = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let mouseX = 0;
    let mouseY = 0;

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
      
      // Reduced to 3 passes for better performance
      drawGradients(p5);
    };

    const drawGradients = (p5) => {
      const panelWidth = p5.width / 2;
      
      // Beach Sunrise Panel
      for (let x = 0; x < panelWidth; x += 5) { // Skip every other pixel for performance
        for (let y = 0; y < p5.height; y += 5) { // Skip every other pixel for performance
          const gradientProgress = y / p5.height;
          const hue = p5.lerp(25, 35, gradientProgress); // Light peach to orange
          const saturation = p5.lerp(100, 0, gradientProgress); // Slightly reduced saturation at top
          const brightness = p5.lerp(95, 100, gradientProgress); // Dark to bright white
          p5.stroke(hue, saturation, brightness);
          const noise = p5.random(-0.25, 0.25);
          p5.stroke(255);
          p5.strokeWeight(0.5);
          p5.fill(hue, saturation, brightness);
          p5.rect(x + noise, y + noise, 5, 5);
        }
      }

      // Purple-Pink Panel
      for (let x = panelWidth; x < p5.width; x += 5) { // Skip every other pixel for performance
        for (let y = 0; y < p5.height; y += 5) { // Skip every other pixel for performance
          const gradientProgress = y / p5.height;
          const hue = p5.lerp(260, 350, gradientProgress); // More vibrant purple to pink
          const saturation = p5.lerp(100, 0, gradientProgress); // High to very low saturation
          const brightness = p5.lerp(95, 100, gradientProgress); // Dark to bright white
          p5.stroke(hue, saturation, brightness);
          const noise = p5.random(-0.25, 0.25);
          p5.stroke(255);
          p5.fill(hue, saturation, brightness);
          p5.circle(x + noise, y + noise, 6);
        }
      }
    };

    p5.draw = () => {
      // Apply invert effect around mouse position
      if (mouseX > 0 && mouseY > 0) {
        p5.push();
        p5.blendMode(p5.OVERLAY);
        p5.noStroke();
        p5.fill(255, 255, 255, 0.3);
        p5.circle(mouseX, mouseY, 50); // 10px radius = 20px diameter
        p5.pop();
      }
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default Hiroshi1;