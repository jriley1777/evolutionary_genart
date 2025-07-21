import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Hiroshi4 = ({ isFullscreen = false }) => {
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
      p5.background(255);
      
      // // Start the drawing process
      p5.beginClip();
      circleMask();
      p5.endClip();
      drawGradients(p5);
    };

     // Define the circle mask function
    const circleMask = () => {
      const centerX = p5.windowWidth / 2;
      const centerY = p5.windowHeight / 2;
      const radius = p5.windowWidth / 4; // Half the width of the canvas
      p5.circle(centerX, centerY, radius * 2);
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