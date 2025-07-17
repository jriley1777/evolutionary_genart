import React from 'react';
import { ReactP5Wrapper } from "@p5-wrapper/react";

const SynthSpirograph3 = ({ isFullscreen = false }) => {
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
  let layerCount = 2; // Number of layered spirographs
  let mouseX = 0;
  let mouseY = 0;
  let isMousePressed = false;
  let physicsEnabled = true;

  class Spirograph {
    constructor(p5, layerIndex) {
      this.layerIndex = layerIndex;
      this.reset(p5);
    }

    reset(p5) {
      // Interactive spirograph parameters with physics
      
      // Base parameters with layer-based variation
      this.radius1 = p5.random(150, 300) + (this.layerIndex * 30);  // Fixed outer circle radius (R)
      this.radius2 = p5.random(80, 200); // Inner circle for more loops
      
      // Spiral pen placement within the inner circle
      const spiralAngle = p5.random(p5.TWO_PI); // Random starting angle on the spiral
      const spiralProgress = p5.random(0.1, 0.9); // How far along the spiral (0 = edge, 1 = center)
      
      // Spiral formula: radius decreases as angle increases
      const spiralRadius = this.radius2 * (1 - spiralProgress);
      this.penX = spiralRadius * p5.cos(spiralAngle);
      this.penY = spiralRadius * p5.sin(spiralAngle);
      
      // Speeds with layer-based variation and physics influence
      this.baseSpeed1 = p5.random(0.02, 0.08) + (this.layerIndex * 0.01); // Base fixed circle speed
      this.baseSpeed2 = p5.random(0.03, 0.2) + (this.layerIndex * 0.005); // Base moving circle speed
      this.speed1 = this.baseSpeed1;
      this.speed2 = this.baseSpeed2;
      
      // Physics properties
      this.mass = p5.random(0.5, 2.0); // Mass affects physics response
      this.damping = p5.random(0.95, 0.99); // Damping affects how quickly physics settle
      this.elasticity = p5.random(0.3, 0.8); // Elasticity affects bounce behavior
      
      // Layer-specific properties
      this.opacity = p5.map(this.layerIndex, 0, layerCount - 1, 255, 150); // Back layers more transparent
      this.strokeWeight = p5.map(this.layerIndex, 0, layerCount - 1, 2.5, 1.0); // Back layers thinner
      this.colorOffset = this.layerIndex * 60; // Color variation per layer
      
      // Physics state
      this.velocity1 = 0;
      this.velocity2 = 0;
      this.targetSpeed1 = this.baseSpeed1;
      this.targetSpeed2 = this.baseSpeed2;
      
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

    updatePhysics(p5) {
      if (!physicsEnabled) return;
      
      // Calculate distance from mouse
      const centerX = p5.width / 2;
      const centerY = p5.height / 2;
      const mouseDist = p5.dist(centerX, centerY, mouseX, mouseY);
      const maxInfluence = 200;
      
      if (mouseDist < maxInfluence) {
        // Mouse influence on speeds
        const influence = p5.map(mouseDist, 0, maxInfluence, 1, 0);
        const mouseSpeed = p5.map(mouseX, 0, p5.width, -0.1, 0.1);
        
        // Apply physics forces
        const force1 = (this.targetSpeed1 - this.speed1) * this.mass;
        const force2 = (this.targetSpeed2 - this.speed2) * this.mass;
        
        // Add mouse influence
        this.velocity1 += force1 + (mouseSpeed * influence * 0.1);
        this.velocity2 += force2 + (mouseSpeed * influence * 0.05);
        
        // Apply damping
        this.velocity1 *= this.damping;
        this.velocity2 *= this.damping;
        
        // Update speeds
        this.speed1 += this.velocity1;
        this.speed2 += this.velocity2;
        
        // Bounce off boundaries
        if (this.speed1 < 0) {
          this.speed1 = 0;
          this.velocity1 *= -this.elasticity;
        }
        if (this.speed2 < 0) {
          this.speed2 = 0;
          this.velocity2 *= -this.elasticity;
        }
      } else {
        // Return to base speeds when mouse is far
        this.speed1 = p5.lerp(this.speed1, this.baseSpeed1, 0.01);
        this.speed2 = p5.lerp(this.speed2, this.baseSpeed2, 0.01);
        this.velocity1 *= this.damping;
        this.velocity2 *= this.damping;
      }
    }

    update(p5) {
      if (!isDrawing) return;

      // Update physics
      this.updatePhysics(p5);

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
          
          // Add some variation to line opacity based on angle, layer, and physics
          let opacity = p5.map(p5.sin(this.angle1 * 0.5), -1, 1, this.opacity * 0.6, this.opacity);
          
          // Physics-based opacity variation
          if (physicsEnabled) {
            const speedFactor = p5.map(this.speed1 + this.speed2, 0, 0.3, 0.5, 1.5);
            opacity *= speedFactor;
          }
          
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
      // Draw layer info with physics data
      p5.push();
      p5.fill(255, 255, 255, 100);
      p5.noStroke();
      p5.textSize(12);
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.text(`Layer ${this.layerIndex + 1}`, 20, 20 + (this.layerIndex * 30));
      p5.text(`Speed: ${this.speed1.toFixed(3)}, ${this.speed2.toFixed(3)}`, 20, 40 + (this.layerIndex * 30));
      p5.text(`Physics: ${physicsEnabled ? 'ON' : 'OFF'}`, 20, 60 + (this.layerIndex * 30));
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
      } else if (p5.key === 'p' || p5.key === 'P') {
        // Toggle physics
        physicsEnabled = !physicsEnabled;
      }
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    };

    p5.mousePressed = () => {
      isMousePressed = true;
    };

    p5.mouseReleased = () => {
      isMousePressed = false;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
  };

  return (
    <ReactP5Wrapper sketch={sketch} />
  );
};

export default SynthSpirograph3; 