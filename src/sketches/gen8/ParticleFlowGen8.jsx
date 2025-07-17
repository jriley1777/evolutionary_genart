import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const ParticleFlowGen8 = ({ isFullscreen = false }) => {
  let particles = [];
  let rectangles = [];
  let flowField = [];
  let noiseOffset = 0;
  let synthwaveColors = [
    [255, 0, 255],   // Magenta
    [0, 255, 255],   // Cyan
    [255, 0, 128],   // Pink
    [128, 0, 255],   // Purple
    [0, 128, 255],   // Blue
    [255, 128, 0],   // Orange
  ];
  let colorTransitionSpeed = 0.02;
  let globalColorProgress = 0;
  let globalColorIndex = 0;

  const sketch = (p5) => {

    p5.setup = () => {
      console.log('Gen8 setup called');
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.frameRate(20);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.colorMode(p5.RGB, 255, 255, 255, 1);
      
      // Initialize rectangle packing
      initializeRectanglePacking(p5);
      console.log('Rectangles created:', rectangles.length);
      
      // Initialize flow field
      initializeFlowField(p5);
      console.log('Flow field created:', flowField.length, 'x', flowField[0]?.length);
      
      // Create initial particles
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle(p5, p5.random(p5.width), p5.random(p5.height)));
      }
      console.log('Particles created:', particles.length);
    };

    const initializeRectanglePacking = (p5) => {
      rectangles = [];
      
      // Define size variations for masonry layout
      const sizeVariations = [
        { w: 80, h: 60 },
        { w: 120, h: 80 },
        { w: 60, h: 120 },
        { w: 100, h: 100 },
        { w: 150, h: 50 },
        { w: 50, h: 150 },
        { w: 90, h: 90 },
        { w: 70, h: 70 },
        { w: 140, h: 70 },
        { w: 70, h: 140 },
        { w: 110, h: 60 },
        { w: 60, h: 110 }
      ];
      
      // Use a more efficient grid-based approach
      const gridSize = 40; // Smaller grid for more variety
      const cols = Math.ceil(p5.width / gridSize);
      const rows = Math.ceil(p5.height / gridSize);
      
      // Create a grid of potential starting points
      let grid = Array(rows).fill().map(() => Array(cols).fill(true));
      
      // Fill the entire canvas with varied rectangles
      let attempts = 0;
      const maxAttempts = 2000;
      
      while (attempts < maxAttempts) {
        // Find an available grid position
        let gridX = -1, gridY = -1;
        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            if (grid[row][col]) {
              gridX = col;
              gridY = row;
              break;
            }
          }
          if (gridX !== -1) break;
        }
        
        // If no available positions found, we're done
        if (gridX === -1) break;
        
        // Choose a random size variation
        let size = p5.random(sizeVariations);
        let w = size.w;
        let h = size.h;
        
        // Calculate actual pixel position
        let startX = gridX * gridSize;
        let startY = gridY * gridSize;
        
        // Try to fit the rectangle
        let canFit = true;
        
        // Check if rectangle fits within canvas bounds
        if (startX + w > p5.width || startY + h > p5.height) {
          canFit = false;
        }
        
        // Check if rectangle overlaps with existing rectangles
        if (canFit) {
          for (let rect of rectangles) {
            if (startX < rect.x + rect.w && startX + w > rect.x &&
                startY < rect.y + rect.h && startY + h > rect.y) {
              canFit = false;
              break;
            }
          }
        }
        
        // If rectangle fits, add it and mark grid as used
        if (canFit) {
          // Mark grid positions as used
          let gridCols = Math.ceil(w / gridSize);
          let gridRows = Math.ceil(h / gridSize);
          
          for (let row = gridY; row < Math.min(gridY + gridRows, rows); row++) {
            for (let col = gridX; col < Math.min(gridX + gridCols, cols); col++) {
              grid[row][col] = false;
            }
          }
          
          rectangles.push({
            x: startX,
            y: startY,
            w: w,
            h: h,
            center: { x: startX + w / 2, y: startY + h / 2 },
            particleCount: 0,
            pattern: 0, // 0 = stroke-only, 1 = polka dot, 2 = striped, 3 = filled
            color: null
          });
        } else {
          // Mark this grid position as unavailable
          grid[gridY][gridX] = false;
        }
        
        attempts++;
      }
      
      console.log('Canvas size:', p5.width, 'x', p5.height);
      console.log('Total rectangles created:', rectangles.length);
    };

    const initializeFlowField = (p5) => {
      flowField = [];
      let cols = Math.ceil(p5.width / 20);
      let rows = Math.ceil(p5.height / 20);
      
      for (let i = 0; i < cols; i++) {
        flowField[i] = [];
        for (let j = 0; j < rows; j++) {
          let x = i * 20;
          let y = j * 20;
          let angle = p5.noise(x * 0.01, y * 0.01) * p5.TWO_PI;
          flowField[i][j] = {
            x: Math.cos(angle),
            y: Math.sin(angle),
            strength: p5.noise(x * 0.02, y * 0.02)
          };
        }
      }
    };

    class Particle {
      constructor(p5, x, y) {
        this.pos = { x: x, y: y };
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.maxSpeed = 3;
        this.maxForce = 0.1;
        this.life = 255;
        this.decay = 0.5;
      }

      update(p5) {
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        
        // Limit velocity
        let speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        if (speed > this.maxSpeed) {
          this.vel.x = (this.vel.x / speed) * this.maxSpeed;
          this.vel.y = (this.vel.y / speed) * this.maxSpeed;
        }
        
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        
        // Screen wrapping
        if (this.pos.x < 0) this.pos.x = p5.width;
        if (this.pos.x > p5.width) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = p5.height;
        if (this.pos.y > p5.height) this.pos.y = 0;
        
        // Reset acceleration
        this.acc.x = 0;
        this.acc.y = 0;
        
        // Decay life
        this.life -= this.decay;
      }

      applyForce(force) {
        this.acc.x += force.x;
        this.acc.y += force.y;
      }

      followFlowField(p5) {
        // Handle screen wrapping for flow field lookup
        let lookupX = this.pos.x;
        let lookupY = this.pos.y;
        
        // Wrap coordinates for flow field lookup
        if (lookupX < 0) lookupX = p5.width + lookupX;
        if (lookupX >= p5.width) lookupX = lookupX - p5.width;
        if (lookupY < 0) lookupY = p5.height + lookupY;
        if (lookupY >= p5.height) lookupY = lookupY - p5.height;
        
        let x = Math.floor(lookupX / 20);
        let y = Math.floor(lookupY / 20);
        
        if (x >= 0 && x < flowField.length && y >= 0 && y < flowField[0].length) {
          let flow = flowField[x][y];
          let force = {
            x: flow.x * flow.strength * 0.5,
            y: flow.y * flow.strength * 0.5
          };
          this.applyForce(force);
        }
      }

      isDead() {
        return this.life <= 0;
      }
    }

    const updateFlowField = (p5) => {
      noiseOffset += 0.01;
      
      for (let i = 0; i < flowField.length; i++) {
        for (let j = 0; j < flowField[i].length; j++) {
          let x = i * 20;
          let y = j * 20;
          let angle = p5.noise(x * 0.01, y * 0.01, noiseOffset) * p5.TWO_PI;
          flowField[i][j] = {
            x: Math.cos(angle),
            y: Math.sin(angle),
            strength: p5.noise(x * 0.02, y * 0.02, noiseOffset)
          };
        }
      }
    };

    const updateRectanglePatterns = (p5) => {
      // Reset all rectangles
      for (let rect of rectangles) {
        rect.particleCount = 0;
        
        // Decay current color (slower decay)
        if (rect.color) {
          let currentRed = p5.red(rect.color);
          let currentGreen = p5.green(rect.color);
          let currentBlue = p5.blue(rect.color);
          let currentAlpha = p5.alpha(rect.color);
          
          let newRed = p5.lerp(currentRed, 0, 0.02); // Much slower decay
          let newGreen = p5.lerp(currentGreen, 0, 0.02);
          let newBlue = p5.lerp(currentBlue, 0, 0.02);
          let newAlpha = p5.lerp(currentAlpha, 0, 0.01);
          
          rect.color = p5.color(newRed, newGreen, newBlue, newAlpha);
        } else {
          rect.color = null;
        }
      }
      
      // Count particles in each rectangle
      for (let particle of particles) {
        for (let rect of rectangles) {
          // More precise rectangle collision detection
          if (particle.pos.x >= rect.x && particle.pos.x <= rect.x + rect.w &&
              particle.pos.y >= rect.y && particle.pos.y <= rect.y + rect.h) {
            rect.particleCount++;
          }
        }
      }
      
      // Update patterns and colors based on particle count (0-4 scale)
      for (let rect of rectangles) {
        // Clamp particle count to 0-4 range
        rect.particleCount = Math.min(rect.particleCount, 4);
        
        // Determine pattern based on particle count (0-4 scale)
        if (rect.particleCount >= 4) {
          rect.pattern = 4; // Complete fill
        } else if (rect.particleCount >= 3) {
          rect.pattern = 3; // Polka dot
        } else if (rect.particleCount >= 2) {
          rect.pattern = 2; // Striped
        } else if (rect.particleCount >= 1) {
          rect.pattern = 1; // Stroke color change
        } else {
          rect.pattern = 0; // Default (no color)
        }
        
        // Calculate synthwave color for all patterns
        if (rect.particleCount > 0) {
          // Use noise for natural color progression like Gen6
          const noiseScale = 0.01;
          const colorNoise = p5.noise(rect.center.x * noiseScale, rect.center.y * noiseScale);
          const colorIndex = p5.floor(colorNoise * synthwaveColors.length);
          const colorProgress = (colorNoise * synthwaveColors.length) % 1;
          
          // Smooth color transition between synthwave colors
          const color1 = synthwaveColors[colorIndex];
          const color2 = synthwaveColors[(colorIndex + 1) % synthwaveColors.length];
          
          let r = p5.lerp(color1[0], color2[0], colorProgress);
          let g = p5.lerp(color1[1], color2[1], colorProgress);
          let b = p5.lerp(color1[2], color2[2], colorProgress);
          
          // Make brightness responsive to particle count (0-4 scale)
          let brightness = p5.map(rect.particleCount, 0, 4, 0.3, 1.0);
          r *= brightness;
          g *= brightness;
          b *= brightness;
          
          let targetColor = p5.color(r, g, b, 0.9);
          if (rect.color === null) {
            rect.color = targetColor;
          } else {
            rect.color = p5.lerpColor(rect.color, targetColor, 0.5);
          }
          
          // Debug: Log color values
          if (p5.frameCount % 120 === 0 && rect.particleCount > 0) {
            console.log('Color debug:', r, g, b, 'Target:', targetColor.toString());
          }
        }
      }
    };

    const drawRectanglePatterns = (p5) => {
      for (let rect of rectangles) {
        if (rect.color && p5.alpha(rect.color) > 0.01) {
          p5.push();
          
          switch (rect.pattern) {
            case 1: // Stroke color change
              p5.noFill();
              p5.stroke(rect.color);
              p5.strokeWeight(3);
              p5.rect(rect.x, rect.y, rect.w, rect.h);
              break;
              
            case 2: // Striped
              p5.fill(rect.color);
              p5.noStroke();
              p5.rect(rect.x, rect.y, rect.w, rect.h);
              
              // Draw stripes with synthwave accent color
              let accentColor = p5.color(255, 255, 255, 0.4);
              let stripeWidth = 8;
              for (let x = rect.x; x < rect.x + rect.w; x += stripeWidth * 2) {
                p5.fill(accentColor);
                p5.rect(x, rect.y, stripeWidth, rect.h);
              }
              break;
              
            case 3: // Polka dot
              p5.fill(rect.color);
              p5.noStroke();
              p5.rect(rect.x, rect.y, rect.w, rect.h);
              
              // Draw polka dots with synthwave accent color
              let dotColor = p5.color(255, 255, 255, 0.4);
              let dotSize = 4;
              let spacing = 12;
              for (let x = rect.x + spacing; x < rect.x + rect.w - spacing; x += spacing) {
                for (let y = rect.y + spacing; y < rect.y + rect.h - spacing; y += spacing) {
                  p5.fill(dotColor);
                  p5.ellipse(x, y, dotSize, dotSize);
                }
              }
              break;
              
            case 4: // Complete fill
              p5.fill(rect.color);
              p5.noStroke();
              p5.rect(rect.x, rect.y, rect.w, rect.h);
              break;
          }
          
          p5.pop();
        }
      }
      

    };

    p5.draw = () => {
      p5.background(0);
      
      // Update flow field
      updateFlowField(p5);
      
      // Update rectangle patterns based on particles
      updateRectanglePatterns(p5);
      
      // Draw all rectangles with dark grey strokes as base
      p5.stroke(60, 60, 60);
      p5.strokeWeight(1);
      p5.noFill();
      
      for (let rect of rectangles) {
        p5.rect(rect.x, rect.y, rect.w, rect.h);
      }
      
      // Draw rectangle patterns with colors on top
      drawRectanglePatterns(p5);
      
      // Update and draw particles (invisible)
      for (let i = particles.length - 1; i >= 0; i--) {
        let particle = particles[i];
        
        // Apply flow field forces
        particle.followFlowField(p5);
        
        // Add some noise for organic movement
        let noise = {
          x: p5.noise(particle.pos.x * 0.01, p5.frameCount * 0.01) * 2 - 1,
          y: p5.noise(particle.pos.y * 0.01, p5.frameCount * 0.01) * 2 - 1
        };
        particle.applyForce({ x: noise.x * 0.1, y: noise.y * 0.1 });
        
        particle.update(p5);
        
        // Particles are invisible - they only affect rectangle colors
        
        // Remove dead particles
        if (particle.isDead()) {
          particles.splice(i, 1);
        }
      }
      
      // Add new particles
      if (particles.length < 100) {
        particles.push(new Particle(p5, p5.random(p5.width), p5.random(p5.height)));
      }
      

    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      initializeRectanglePacking(p5);
      initializeFlowField(p5);
    };
  };

  return <ReactP5Wrapper sketch={sketch}/>;
};

export default ParticleFlowGen8; 