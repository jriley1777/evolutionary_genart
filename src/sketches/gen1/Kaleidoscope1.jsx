import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const Kaleidoscope1 = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let rotationAngle = 0;
    let rotationSpeed = 0.02;
    let segments = 8;
    let time = 0;
    let mouseX = 0;
    let mouseY = 0;
    let centerX = 0;
    let centerY = 0;

    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.background(0);
      p5.colorMode(p5.HSB, 360, 100, 100, 1);
      p5.frameRate(60);
      
      centerX = p5.width / 2;
      centerY = p5.height / 2;
    };

    p5.draw = () => {
      time += 0.01;
      rotationAngle += rotationSpeed;
      
      mouseX = p5.mouseX - centerX;
      mouseY = p5.mouseY - centerY;
      
      // Clear background with fade
      p5.fill(0, 0, 0, 0.1);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
      
      // Draw kaleidoscope
      p5.push();
      p5.translate(centerX, centerY);
      
      for (let i = 0; i < segments; i++) {
        p5.push();
        p5.rotate((p5.TWO_PI / segments) * i + rotationAngle);
        
        // Draw mirrored pattern
        drawMirroredPattern(p5);
        
        p5.pop();
      }
      
      p5.pop();
    };

    const drawMirroredPattern = (p5) => {
      // Create flowing lines based on mouse position and time
      const numLines = 20;
      
      for (let i = 0; i < numLines; i++) {
        const progress = i / numLines;
        const x = p5.lerp(-p5.width/2, p5.width/2, progress);
        const y = p5.sin(time + progress * p5.PI) * 100 + mouseY * 0.1;
        
        // Color based on position and time
        const hue = (progress * 360 + time * 50) % 360;
        const saturation = 80 + p5.sin(time + progress) * 20;
        const brightness = 80 + p5.cos(time + progress * 2) * 20;
        
        p5.stroke(hue, saturation, brightness, 0.8);
        p5.strokeWeight(2);
        p5.line(x, y, x + 50, y + p5.sin(time + progress) * 30);
      }
    };

    p5.mousePressed = () => {
      segments = segments === 8 ? 12 : segments === 12 ? 6 : 8;
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      centerX = p5.width / 2;
      centerY = p5.height / 2;
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default Kaleidoscope1; 