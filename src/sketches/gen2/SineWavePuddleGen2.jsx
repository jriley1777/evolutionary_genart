import React, { useState } from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const SineWavePuddleGen2 = ({ isFullscreen = false }) => {
  let waveCenters = [];
  let mouseX = 0;
  let mouseY = 0;
  let globalTime = 0;
  let mouseInCanvas = false;
  let lastMouseMoveTime = 0; // Track when mouse last moved
  let walkers = [];

  class Walker {
    constructor(p5, x, y, color) {
      this.x = x;
      this.y = y;
      this.targetX = x;
      this.targetY = y;
      this.angle = 0;
      this.speed = 0.02;
      this.noiseOffset = p5.random(1000);
      this.lastWaveTime = 0;
      this.waveInterval = p5.random(25, 35);
      this.attractionMode = false;
      this.safeDistance = 100; // Minimum distance from mouse
      this.walkerSafeDistance = 80; // Minimum distance from other walkers
      this.attractionSpeed = 0.02;
      this.normalSpeed = 0.015;
      this.color = color;
      this.id = Math.random(); // Unique identifier
      
      // Interest behavior
      this.interestInMouse = p5.random(0.3, 0.8); // How much this walker likes the mouse
      
      // Movement behavior variations
      this.explorationRadius = p5.random(0.2, 0.6); // How far they explore from center
      this.explorationSpeed = p5.random(0.008, 0.015); // Speed during normal movement
      this.attractionSpeed = p5.random(0.015, 0.025); // Speed when attracted
    }

    update(p5, otherWalkers) {
      // Update noise offset for smooth movement
      this.noiseOffset += 0.005;

      let targetX, targetY;
      
      // Determine if this walker should be attracted to mouse
      const distanceToMouse = p5.dist(this.x, this.y, mouseX, mouseY);
      const mouseStationaryTime = globalTime - lastMouseMoveTime;
      const shouldBeAttracted = this.attractionMode && 
                               mouseInCanvas &&
                               distanceToMouse < 400 && // Only attracted within 400px
                               mouseStationaryTime < 300; // Return to exploration if mouse hasn't moved in 5 seconds (300 frames)
      
      if (shouldBeAttracted) {
        // Attraction mode - move toward mouse while maintaining safe distance
        const angleToMouse = p5.atan2(mouseY - this.y, mouseX - this.x);
        targetX = mouseX - p5.cos(angleToMouse) * this.safeDistance;
        targetY = mouseY - p5.sin(angleToMouse) * this.safeDistance;
        
      } else {
        // Create organic curved paths and patterns
        const time = globalTime * 0.01;
        const radius = p5.min(p5.width, p5.height) * this.explorationRadius;
        
        // Walker has unique movement pattern
        const patternOffset = this.id * p5.PI;
        const speedMultiplier = 0.5 + this.id * 0.25;
        
        // Create organic curved paths using multiple sine waves and noise
        const centerX = p5.width / 2;
        const centerY = p5.height / 2;
        
        // Primary curved path with multiple frequencies
        const primaryX = p5.cos(time * speedMultiplier + patternOffset) * radius * 0.4;
        const primaryY = p5.sin(time * speedMultiplier * 1.3 + patternOffset) * radius * 0.4;
        
        // Secondary curved path with different frequency
        const secondaryX = p5.cos(time * speedMultiplier * 0.7 + patternOffset * 2) * radius * 0.3;
        const secondaryY = p5.sin(time * speedMultiplier * 0.9 + patternOffset * 1.5) * radius * 0.3;
        
        // Add Perlin noise for organic variation
        const noiseX = (p5.noise(this.noiseOffset + time * 0.5) - 0.5) * radius * 0.2;
        const noiseY = (p5.noise(this.noiseOffset + 1000 + time * 0.5) - 0.5) * radius * 0.2;
        
        // Combine all components for organic curved paths
        targetX = centerX + primaryX + secondaryX + noiseX;
        targetY = centerY + primaryY + secondaryY + noiseY;
      }

      // Apply walker-to-walker repulsion (for future use)
      otherWalkers.forEach(otherWalker => {
        if (otherWalker.id !== this.id) {
          const distance = p5.dist(this.x, this.y, otherWalker.x, otherWalker.y);
          if (distance < this.walkerSafeDistance) {
            // Gentle repulsion from other walker
            const angle = p5.atan2(this.y - otherWalker.y, this.x - otherWalker.x);
            const repelForce = (this.walkerSafeDistance - distance) * 0.05;
            targetX += p5.cos(angle) * repelForce;
            targetY += p5.sin(angle) * repelForce;
          }
        }
      });

      // Smooth interpolation to target with mode-specific speeds
      const currentSpeed = shouldBeAttracted ? this.attractionSpeed : this.explorationSpeed;
      this.x = p5.lerp(this.x, targetX, currentSpeed);
      this.y = p5.lerp(this.y, targetY, currentSpeed);
      
      // Wrap walker around canvas bounds
      if (this.x < 0) this.x = p5.width;
      if (this.x > p5.width) this.x = 0;
      if (this.y < 0) this.y = p5.height;
      if (this.y > p5.height) this.y = 0;
      
      // Create waves periodically
      if (globalTime - this.lastWaveTime > this.waveInterval) {
        waveCenters.push(new WaveCenter(p5, this.x, this.y));
        this.lastWaveTime = globalTime;
        this.waveInterval = p5.random(25, 35);
      }
    }

    draw(p5) {
      p5.push();
      p5.noStroke();
      
      // Always stay yellow regardless of mode
      p5.fill(this.color.h, this.color.s, this.color.b, 0.5);
      
      p5.circle(this.x, this.y, 8);
      p5.pop();
    }
  }

  class WaveCenter {
    constructor(p5, x, y) {
      this.x = x;
      this.y = y;
      this.radius = 0;
      this.maxRadius = p5.min(p5.width, p5.height) * 0.3;
      this.phase = p5.random(p5.TWO_PI);
      this.frequency = p5.random(0.5, 1.5);
      this.noiseOffset = p5.random(1000);
      this.life = 1.0;
      this.age = 0;
      this.maxAge = p5.random(150, 300); // Reduced lifespan for faster expansion and removal
      this.waveCount = p5.floor(p5.random(12, 25)); // Reduced wave count for performance
      
      // Fractal decomposition layers
      this.fractalLayers = [];
      this.initializeFractalLayers(p5);
    }

    initializeFractalLayers(p5) {
      // Create 3-4 fractal decomposition layers
      const numLayers = p5.floor(p5.random(3, 5));
      
      for (let i = 0; i < numLayers; i++) {
        this.fractalLayers.push({
          frequency: p5.random(1.5, 4.0), // Higher frequencies for detail
          amplitude: p5.random(0.2, 0.6),
          phase: p5.random(p5.TWO_PI),
          noiseScale: p5.random(0.05, 0.15),
          detailLevel: i + 1
        });
      }
    }

    update(p5) {
      this.age++;
      this.life = 1.0 - (this.age / this.maxAge);
      
      // Gentle movement with Perlin noise
      const noiseX = p5.noise(this.noiseOffset) * 2 - 1;
      const noiseY = p5.noise(this.noiseOffset + 1000) * 2 - 1;
      
      this.x += noiseX * 0.5;
      this.y += noiseY * 0.5;
      
      // Update radius
      this.radius = p5.lerp(this.radius, this.maxRadius, 0.02);
      
      // Update noise offset
      this.noiseOffset += 0.003;
    }

    generateWave(p5, waveIndex) {
      const wavePoints = [];
      const numPoints = 30; // Reduced point count for performance
      const waveRadius = this.radius * (waveIndex / this.waveCount);
      
      for (let i = 0; i < numPoints; i++) {
        const angle = p5.map(i, 0, numPoints, 0, p5.TWO_PI);
        
        // Base radius
        let radius = waveRadius;
        
        // Add fractal decomposition layers
        let fractalOffset = 0;
        this.fractalLayers.forEach(layer => {
          // Primary sine wave for this layer
          fractalOffset += p5.sin(
            angle * layer.frequency + 
            globalTime * 0.01 * layer.frequency + 
            layer.phase
          ) * layer.amplitude * 20;
          
          // Add noise detail scaled by layer
          fractalOffset += p5.noise(
            p5.cos(angle) * layer.noiseScale + this.noiseOffset,
            p5.sin(angle) * layer.noiseScale + waveIndex * 0.1
          ) * layer.amplitude * 15;
        });
        
        // Apply fractal offset
        radius += fractalOffset;
        
        // Convert to cartesian coordinates
        const x = this.x + p5.cos(angle) * radius;
        const y = this.y + p5.sin(angle) * radius;
        
        wavePoints.push({ x, y });
      }
      
      return wavePoints;
    }

    isDead() {
      return this.life <= 0;
    }
  }

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
      p5.background(0);
      
      // Initialize multiple walkers with different colors
      const walkerColors = [
        { h: 60, s: 100, b: 100 },   // Bright yellow
        { h: 200, s: 80, b: 100 },   // Bright blue
        { h: 320, s: 80, b: 100 }    // Bright magenta
      ];
      
      walkers = [];
      for (let i = 0; i < 3; i++) { // Changed to 3 walkers
        const x = p5.width * (0.25 + i * 0.25); // Spread them out horizontally
        const y = p5.height * (0.3 + p5.random(-0.2, 0.2));
        walkers.push(new Walker(p5, x, y, walkerColors[i]));
      }
      
      // Initialize wave centers
      waveCenters = [
        new WaveCenter(p5, p5.width * 0.3, p5.height * 0.3),
        new WaveCenter(p5, p5.width * 0.7, p5.height * 0.7),
      ];
    };

    p5.draw = () => {
      // Fade background
      p5.fill(0, 0, 0, 0.1);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
      
      globalTime = p5.frameCount;
      
      // Update all walkers
      walkers.forEach(walker => {
        walker.update(p5, walkers);
      });
      
      // Update wave centers
      for (let i = waveCenters.length - 1; i >= 0; i--) {
        waveCenters[i].update(p5);
        if (waveCenters[i].isDead()) {
          waveCenters.splice(i, 1);
        }
      }
      
      // Keep only the last 20 wave centers for trail effect
      if (waveCenters.length > 20) {
        waveCenters.splice(0, waveCenters.length - 20);
      }
      
      // Draw waves
      drawWaves(p5);
      
      // Draw all walkers
      walkers.forEach(walker => {
        walker.draw(p5);
      });
    };

    const drawWaves = (p5) => {
      waveCenters.forEach(center => {
        // Draw from outer to inner for proper layering
        for (let wave = center.waveCount - 1; wave >= 0; wave--) {
          const wavePoints = center.generateWave(p5, wave);
          
          // Simple color scheme based on wave progress and life
          const waveProgress = wave / center.waveCount;
          const hue = p5.lerp(180, 220, waveProgress);
          const saturation = p5.map(center.life, 0, 1, 0, 80);
          const brightness = p5.map(waveProgress, 0, 1, 20, 80);
          const alpha = p5.map(wave, 0, center.waveCount, 0.6, 0.1) * center.life;
          
          // Draw wave outline only - no fill
          p5.stroke(hue, saturation, brightness, alpha * 0.8);
          p5.strokeWeight(1);
          p5.noFill();
          
          p5.beginShape();
          wavePoints.forEach(point => {
            p5.vertex(point.x, point.y);
          });
          p5.endShape(p5.CLOSE);
        }
      });
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
      mouseInCanvas = true;
      lastMouseMoveTime = p5.frameCount;
      
      // Set all walkers to attraction mode
      walkers.forEach(walker => {
        walker.attractionMode = true;
      });
      
      // Create new wave center on mouse move (with throttling)
      if (p5.frameCount % 3 === 0) { // Create every 3 frames to avoid overwhelming
        waveCenters.push(new WaveCenter(p5, p5.mouseX, p5.mouseY));
      }
    };

    p5.mousePressed = () => {
      // Keep mousePressed for additional interaction if needed
      if (p5.mouseButton === p5.LEFT) {
        // Add new wave center
        waveCenters.push(new WaveCenter(p5, p5.mouseX, p5.mouseY));
      }
    };

    p5.mouseExited = () => {
      mouseInCanvas = false;
      // Set all walkers back to normal mode
      walkers.forEach(walker => {
        walker.attractionMode = false;
      });
    };

    p5.keyPressed = () => {
      if (p5.key === 'c' || p5.key === 'C') {
        // Clear all wave centers
        waveCenters = [];
      }
      if (p5.key === 'r' || p5.key === 'R') {
        // Reset to initial state
        waveCenters = [
          new WaveCenter(p5, p5.width * 0.3, p5.height * 0.3),
          new WaveCenter(p5, p5.width * 0.7, p5.height * 0.7),
        ];
      }
      if (p5.key === 's' || p5.key === 'S') {
        // Add wave center at random location
        waveCenters.push(new WaveCenter(p5, p5.random(p5.width), p5.random(p5.height)));
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

export default SineWavePuddleGen2; 