import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Hiroshi3 = ({ isFullscreen = false }) => {
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
      
      // Draw the gradient background
      p5.clip(pendulumMask);
      drawGradients(p5);

      // p5.background(255);
      // p5.stroke(0);
      // pendulumMask();
    };

    // Define double pendulum mask function
    const pendulumMask = () => {
      // Draw many pendulum paths across the canvas
      for (let pendulum = 0; pendulum < 100; pendulum++) {
        // Generate pendulum path points
        const centerX = p5.random(p5.windowWidth);
        const centerY = p5.random(p5.windowHeight);
        const length1 = p5.random(80, 150);
        const length2 = p5.random(60, 120);
        const thickness = p5.random(8, 25);
        
        // Simulate double pendulum motion with fixed angles for static result
        const angle1 = p5.sin(pendulum * 0.5) * 2 + p5.cos(pendulum * 0.3) * 1.5;
        const angle2 = p5.sin(pendulum * 0.7) * 3 + p5.cos(pendulum * 0.4) * 2;
        
        // Generate smooth pendulum path
        p5.beginShape();
        p5.noFill();

        // Create a smooth curve by sampling more points
        for (let t = 0; t <= 1; t += 0.01) {
          const chaos1 = p5.sin(t * 20 + pendulum * 2) * 15;
          const chaos2 = p5.cos(t * 15 + pendulum * 1.5) * 12;
          
          const interpAngle1 = p5.lerp(0, angle1, t);
          const interpAngle2 = p5.lerp(0, angle2, t);
          
          const px = centerX + p5.cos(interpAngle1) * (length1 * t) + chaos1;
          const py = centerY + p5.sin(interpAngle1) * (length1 * t) + chaos2;
          
          // Add thickness by creating parallel curves
          const dx = p5.cos(interpAngle1 + interpAngle2) * length2 * 0.1;
          const dy = p5.sin(interpAngle1 + interpAngle2) * length2 * 0.1;
          
          // Create points on both sides of the curve for thickness
          const leftX = px - dy * thickness * 0.5;
          const leftY = py + dx * thickness * 0.5;
          const rightX = px + dy * thickness * 0.5;
          const rightY = py - dx * thickness * 0.5;
          
          if (t === 0) {
            p5.vertex(leftX, leftY);
            p5.vertex(rightX, rightY);
          } else {
            p5.curveVertex(leftX, leftY);
            p5.curveVertex(rightX, rightY);
          }
        }
        
        // Close the shape smoothly
        p5.endShape(p5.CLOSE);
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

export default Hiroshi3; 