import React from 'react';
import { ReactP5Wrapper } from "@p5-wrapper/react";

const SynthSpirograph2 = ({ isFullscreen = false }) => {
  let spirographs = [];
  let isDrawing = false;
  let currentAngle = 0;
  let drawingComplete = false;
  let animationSpeed = 0.02;
  let synthwaveColors = [
    [255, 0, 255],   // Magenta
    [0, 255, 255],   // Cyan
    [255, 0, 128],   // Pink
    [128, 0, 255],   // Purple
    [0, 128, 255],   // Blue
    [255, 128, 0],   // Orange
  ];
  let currentColorIndex = 0;
  let colorTransitionSpeed = 0.01;
  let colorProgress = 0;
  let startTime = 0;
  let resetInterval = 120000; // 2 minutes in milliseconds
  let layerCount = 3; // Number of layered spirographs

  class Spirograph {
    constructor(p5, layerIndex) {
      this.layerIndex = layerIndex;
      this.reset(p5);
    }

    reset(p5) {
      // Multi-layered spirograph parameters
      
      // Base parameters with layer-based variation
      this.radius1 = p5.random(150, 300) + (this.layerIndex * 20);  // Fixed outer circle radius (R)
      this.radius2 = p5.random(80, 200); // Inner circle for more loops
      
      // Spiral pen placement within the inner circle
      const spiralAngle = p5.random(p5.TWO_PI); // Random starting angle on the spiral
      const spiralProgress = p5.random(0.1, 0.9); // How far along the spiral (0 = edge, 1 = center)
      
      // Spiral formula: radius decreases as angle increases
      const spiralRadius = this.radius2 * (1 - spiralProgress);
      this.penX = spiralRadius * p5.cos(spiralAngle);
      this.penY = spiralRadius * p5.sin(spiralAngle);
      
      // Speeds with layer-based variation
      this.speed1 = p5.random(0.02, 0.08) + (this.layerIndex * 0.01); // Fixed circle speed
      this.speed2 = p5.random(0.03, 0.2) + (this.layerIndex * 0.005); // Moving circle speed
      
      // Layer-specific properties
      this.opacity = p5.map(this.layerIndex, 0, layerCount - 1, 255, 100); // Back layers more transparent
      this.strokeWeight = p5.map(this.layerIndex, 0, layerCount - 1, 2, 0.5); // Back layers thinner
      this.colorOffset = this.layerIndex * 60; // Color variation per layer
      
      // Add some randomness to make it more interesting
      this.radius2 += p5.random(-15, 15); // Small variation
      
      this.angle1 = 0;
      this.angle2 = 0;
      
      // Randomize color with layer offset
      currentColorIndex = p5.floor(p5.random(synthwaveColors.length));
      colorProgress = 0;
      
      // Reset drawing state
      currentAngle = 0;
      drawingComplete = false;
      isDrawing = true;
    }

    // Calculate point on fixed outer circle
    getFixedPathPoint(p5, angle) {
      const centerX = p5.width / 2;
      const centerY = p5.height / 2;
      
      return {
        x: centerX + this.radius1 * p5.cos(angle),
        y: centerY + this.radius1 * p5.sin(angle)
      };
    }

    update(p5) {
      if (!isDrawing) return;

      // Draw multiple points per frame to speed up pattern development
      const pointsPerFrame = 3; // Draw 3 points per frame
      
      for (let i = 0; i < pointsPerFrame; i++) {
        // Update angles
        this.angle1 += this.speed1;
        this.angle2 += this.speed2;

        // Calculate spirograph point using the fixed outer circle
        const fixedPoint = this.getFixedPathPoint(p5, this.angle1);
        
        // Position of the inner circle center
        const x2 = fixedPoint.x + this.radius2 * p5.cos(this.angle2);
        const y2 = fixedPoint.y + this.radius2 * p5.sin(this.angle2);
        
        // Final pen position - rotate the spiral pen offset by the inner circle's angle
        const rotatedPenX = this.penX * p5.cos(this.angle2) - this.penY * p5.sin(this.angle2);
        const rotatedPenY = this.penX * p5.sin(this.angle2) + this.penY * p5.cos(this.angle2);
        
        const finalX = x2 + rotatedPenX;
        const finalY = y2 + rotatedPenY;

        // Draw the line directly without storing points
        if (this.angle1 > 0.1) { // Skip first few frames to avoid jumps
          p5.push();
          p5.strokeWeight(this.strokeWeight);
          p5.noFill();
          
          // Interpolate between colors with layer offset
          const color1 = synthwaveColors[(currentColorIndex + this.colorOffset) % synthwaveColors.length];
          const color2 = synthwaveColors[(currentColorIndex + this.colorOffset + 1) % synthwaveColors.length];
          
          const r = p5.lerp(color1[0], color2[0], colorProgress);
          const g = p5.lerp(color1[1], color2[1], colorProgress);
          const b = p5.lerp(color1[2], color2[2], colorProgress);
          
          // Add some variation to line opacity based on angle and layer
          let opacity = p5.map(p5.sin(this.angle1 * 0.5), -1, 1, this.opacity * 0.6, this.opacity);
          
          p5.stroke(r, g, b, opacity);
          
          // Draw line from previous point to current point
          const prevX = this.prevX || finalX;
          const prevY = this.prevY || finalY;
          p5.line(prevX, prevY, finalX, finalY);
          
          p5.pop();
          
          // Store current point for next iteration
          this.prevX = finalX;
          this.prevY = finalY;
        } else {
          this.prevX = finalX;
          this.prevY = finalY;
        }

        // Update color transition
        colorProgress += colorTransitionSpeed;
        if (colorProgress >= 1) {
          colorProgress = 0;
          currentColorIndex = (currentColorIndex + 1) % synthwaveColors.length;
        }
      }
    }

    draw(p5) {
      // Draw layer info
      p5.push();
      p5.fill(255, 255, 255, 100);
      p5.noStroke();
      p5.textSize(12);
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.text(`Layer ${this.layerIndex + 1}`, 20, 20 + (this.layerIndex * 20));
      p5.text(`R: ${Math.round(this.radius1)}, r: ${Math.round(this.radius2)}`, 20, 40 + (this.layerIndex * 20));
      p5.text(`Pen: (${Math.round(this.penX)}, ${Math.round(this.penY)})`, 20, 60 + (this.layerIndex * 20));
      p5.pop();
    }
  }

  const sketch = (p5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      // Add fullscreen class if in fullscreen mode
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      // Draw initial background gradient
      p5.push();
      p5.noFill();
      p5.strokeWeight(2);
      
      // Create gradient background
      for (let i = 0; i < p5.height; i++) {
        const inter = p5.map(i, 0, p5.height, 0, 1);
        const c = p5.lerpColor(
          p5.color(10, 0, 20),   // Dark purple
          p5.color(20, 0, 40),   // Slightly lighter purple
          inter
        );
        p5.stroke(c);
        p5.line(0, i, p5.width, i);
      }
      p5.pop();
      
      // Initialize multiple spirographs
      spirographs = [];
      for (let i = 0; i < layerCount; i++) {
        spirographs.push(new Spirograph(p5, i));
      }
      startTime = Date.now(); // Initialize start time
    };

    p5.draw = () => {
      // Check if 2 minutes have passed
      if (Date.now() - startTime > resetInterval) {
        // Clear canvas and redraw background for new pattern
        p5.push();
        p5.noFill();
        p5.strokeWeight(2);
        
        // Create gradient background
        for (let i = 0; i < p5.height; i++) {
          const inter = p5.map(i, 0, p5.height, 0, 1);
          const c = p5.lerpColor(
            p5.color(10, 0, 20),   // Dark purple
            p5.color(20, 0, 40),   // Slightly lighter purple
            inter
          );
          p5.stroke(c);
          p5.line(0, i, p5.width, i);
        }
        p5.pop();
        
        // Reset all spirographs
        spirographs.forEach(spirograph => spirograph.reset(p5));
        startTime = Date.now(); // Reset timer
      }
      
      // Update and draw all spirographs
      spirographs.forEach(spirograph => {
        spirograph.update(p5);
        spirograph.draw(p5);
      });
      
      // Add subtle glow effect for all layers
      p5.push();
      p5.blendMode(p5.ADD);
      p5.noFill();
      spirographs.forEach(spirograph => {
        if (spirograph.prevX && spirograph.prevY) {
          p5.stroke(255, 0, 255, 5);
          p5.strokeWeight(2);
          p5.circle(spirograph.prevX, spirograph.prevY, 15);
        }
      });
      p5.pop();
    };

    p5.mouseClicked = () => {
      // Clear canvas and redraw background
      p5.push();
      p5.noFill();
      p5.strokeWeight(2);
      
      // Create gradient background
      for (let i = 0; i < p5.height; i++) {
        const inter = p5.map(i, 0, p5.height, 0, 1);
        const c = p5.lerpColor(
          p5.color(10, 0, 20),   // Dark purple
          p5.color(20, 0, 40),   // Slightly lighter purple
          inter
        );
        p5.stroke(c);
        p5.line(0, i, p5.width, i);
      }
      p5.pop();
      
      // Reset all spirographs
      spirographs.forEach(spirograph => spirograph.reset(p5));
      startTime = Date.now(); // Reset timer on manual click
    };

    p5.keyPressed = () => {
      if (p5.key === 'r' || p5.key === 'R') {
        // Reset all spirographs
        spirographs.forEach(spirograph => spirograph.reset(p5));
        startTime = Date.now(); // Reset timer on R key press
      }
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
  };

  return (
    <ReactP5Wrapper sketch={sketch} />
  );
};

export default SynthSpirograph2; 