import React, { useState } from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const SmokeTrailsGen2 = ({ isFullscreen = false }) => {
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let isMousePressed = false;
  let starterSmokeActive = true;
  let temperature = 0.5; // Global temperature affects particle behavior
  let humidity = 0.3; // Humidity affects steam formation
  let windX = 0;
  let windY = 0;
  let time = 0; // For smoother environmental changes
  
  // Performance optimizations
  const MAX_PARTICLES = 180; // Limit total particles
  const PARTICLE_CREATION_RATE = 0.6; // Reduce particle creation

  // Particle types
  const PARTICLE_TYPES = {
    SMOKE: 'smoke',
    FIRE: 'fire',
    STEAM: 'steam'
  };

  class Particle {
    constructor(p5, x, y, type = PARTICLE_TYPES.SMOKE) {
      this.pos = p5.createVector(x, y);
      this.type = type;
      this.vel = p5.createVector(
        p5.random(-0.3, 0.3), // Reduced horizontal movement
        p5.random(-1.5, -0.8) // Reduced vertical movement
      );
      this.acc = p5.createVector(0, 0);
      this.lifespan = 255;
      this.size = p5.random(20, 40);
      this.maxSize = this.size * 2;
      this.growthRate = p5.random(0.1, 0.3);
      this.turbulence = p5.random(0.1, 0.3);
      this.noiseOffset = p5.random(1000);
      this.temperature = p5.random(0, 1);
      this.phase = p5.random(p5.TWO_PI);
      
      // Type-specific properties
      this.initializeType(p5);
    }

    initializeType(p5) {
      switch (this.type) {
        case PARTICLE_TYPES.FIRE:
          this.lifespan = 180; // Shorter lifespan
          this.size = p5.random(15, 30);
          this.maxSize = this.size * 1.5;
          this.growthRate = p5.random(0.15, 0.3); // Reduced growth rate
          this.turbulence = p5.random(0.15, 0.3); // Reduced turbulence
          this.vel.y = p5.random(-2.5, -1.2); // Slower upward movement
          break;
        case PARTICLE_TYPES.STEAM:
          this.lifespan = 300; // Longer lifespan
          this.size = p5.random(10, 25);
          this.maxSize = this.size * 3;
          this.growthRate = p5.random(0.05, 0.15);
          this.turbulence = p5.random(0.05, 0.15);
          this.vel.y = p5.random(-1.2, -0.4); // Slower upward movement
          break;
        default: // SMOKE
          this.lifespan = 255;
          this.size = p5.random(20, 40);
          this.maxSize = this.size * 2;
          this.growthRate = p5.random(0.1, 0.3);
          this.turbulence = p5.random(0.1, 0.3);
          this.vel.y = p5.random(-1.5, -0.8); // Slower upward movement
          break;
      }
    }

    update(p5) {
      // Add turbulence using Perlin noise (reduced intensity)
      const noiseX = p5.noise(this.noiseOffset) * 2 - 1;
      const noiseY = p5.noise(this.noiseOffset + 1000) * 2 - 1;
      this.acc.add(noiseX * this.turbulence * 0.7, noiseY * this.turbulence * 0.7); // Reduced turbulence effect
      
      // Add wind effect (reduced intensity)
      this.acc.add(windX * 0.05, windY * 0.05); // Reduced wind effect
      
      // Type-specific behavior
      this.updateTypeBehavior(p5);
      
      // Update velocity and position
      this.vel.add(this.acc);
      this.vel.limit(3); // Limit maximum velocity for smoother movement
      this.pos.add(this.vel);
      
      // Reset acceleration
      this.acc.mult(0);
      
      // Grow particle
      if (this.size < this.maxSize) {
        this.size += this.growthRate;
      }
      
      // Decrease lifespan
      this.lifespan -= 1;
      
      // Update noise offset (slower for smoother movement)
      this.noiseOffset += 0.005; // Reduced from 0.01
      
      // Update phase for animation (slower rotation)
      this.phase += 0.05; // Reduced from 0.1
    }

    updateTypeBehavior(p5) {
      switch (this.type) {
        case PARTICLE_TYPES.FIRE:
          // Fire flickers and changes temperature
          this.temperature = p5.noise(this.noiseOffset + 500) * 0.5 + 0.5;
          // Fire particles can spawn smaller fire particles (reduced rate)
          if (p5.random() < 0.005 && particles.length < MAX_PARTICLES) { // Reduced from 0.02
            particles.push(new Particle(p5, this.pos.x, this.pos.y, PARTICLE_TYPES.FIRE));
          }
          break;
        case PARTICLE_TYPES.STEAM:
          // Steam responds to humidity
          this.turbulence *= (1 + humidity * 0.3); // Reduced humidity effect
          // Steam can condense into water droplets
          if (p5.random() < 0.01 && humidity > 0.7) {
            this.size *= 0.8;
          }
          break;
        default: // SMOKE
          // Smoke responds to temperature
          this.turbulence *= (1 + temperature * 0.2); // Reduced temperature effect
          break;
      }
    }

    show(p5) {
      p5.noStroke();
      const alpha = p5.map(this.lifespan, 0, 255, 0, 0.35); // Reduced alpha for softer appearance
      
      let r, g, b;
      
      switch (this.type) {
        case PARTICLE_TYPES.FIRE:
          // Fire colors based on temperature
          const fireTemp = this.temperature;
          r = p5.lerp(255, 255, fireTemp);
          g = p5.lerp(100, 255, fireTemp);
          b = p5.lerp(0, 100, fireTemp);
          break;
        case PARTICLE_TYPES.STEAM:
          // Steam colors based on humidity
          const steamHue = p5.lerp(200, 220, humidity);
          r = p5.lerp(200, 220, humidity);
          g = p5.lerp(220, 240, humidity);
          b = p5.lerp(255, 255, humidity);
          break;
        default: // SMOKE
          // Smoke colors based on temperature
          const smokeTemp = this.temperature;
          r = p5.lerp(100, 200, smokeTemp);
          g = p5.lerp(100, 200, smokeTemp);
          b = p5.lerp(100, 200, smokeTemp);
          break;
      }
      
      p5.fill(r, g, b, alpha);
      
      // Different shapes for different types
      if (this.type === PARTICLE_TYPES.FIRE) {
        // Fire particles are more angular
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase);
        p5.rect(-this.size/2, -this.size/2, this.size, this.size);
        p5.pop();
      } else {
        p5.circle(this.pos.x, this.pos.y, this.size);
      }
    }

    isDead() {
      return this.lifespan <= 0;
    }
  }

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    
    if (isFullscreen) {
      canvas.class('canvas-container fullscreen');
      canvas.elt.classList.add('fullscreen');
    } else {
      canvas.class('canvas-container');
    }
    
    p5.colorMode(p5.RGB, 255, 255, 255, 1);
    p5.background(0);
  };

  const draw = (p5) => {
    time += 0.005; // Slower time progression for smoother changes
    
    // Update environmental conditions
    updateEnvironment(p5);
    
    // Fade background
    p5.fill(0, 0, 0, 0.08); // Reduced fade rate for smoother trails
    p5.noStroke();
    p5.rect(0, 0, p5.width, p5.height);

    // Starter smoke at bottom center (reduced rate)
    if (starterSmokeActive && particles.length < MAX_PARTICLES * 0.8) {
      const centerX = p5.width / 2;
      const centerY = p5.height - 50;
      
      const randomX = centerX + p5.random(-20, 20);
      const randomY = centerY + p5.random(-10, 10);
      
      // Create different particle types based on conditions (reduced count)
      const particleCount = p5.floor(p5.random(1, 3)); // Reduced from 2-4
      for (let i = 0; i < particleCount && particles.length < MAX_PARTICLES; i++) {
        let particleType = PARTICLE_TYPES.SMOKE;
        
        // High temperature can create fire (reduced probability)
        if (temperature > 0.85 && p5.random() < 0.2) { // Increased threshold, reduced probability
          particleType = PARTICLE_TYPES.FIRE;
        }
        // High humidity can create steam
        else if (humidity > 0.6 && p5.random() < 0.2) {
          particleType = PARTICLE_TYPES.STEAM;
        }
        
        particles.push(new Particle(p5, randomX, randomY, particleType));
      }
    }

    // Add new particles when mouse is pressed (reduced rate)
    if (isMousePressed && particles.length < MAX_PARTICLES) {
      const mouseParticleCount = p5.floor(p5.random(1, 3)); // Reduced from 3
      for (let i = 0; i < mouseParticleCount && particles.length < MAX_PARTICLES; i++) {
        let particleType = PARTICLE_TYPES.SMOKE;
        
        // Mouse position affects particle type (reduced fire probability)
        if (mouseY < p5.height * 0.3 && temperature > 0.8 && p5.random() < 0.3) { // Added random check
          particleType = PARTICLE_TYPES.FIRE;
        } else if (mouseY > p5.height * 0.7 && humidity > 0.5) {
          particleType = PARTICLE_TYPES.STEAM;
        }
        
        particles.push(new Particle(p5, mouseX, mouseY, particleType));
      }
    }

    // Update and show particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(p5);
      particles[i].show(p5);
      
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }
  };

  const updateEnvironment = (p5) => {
    // Temperature varies over time (slower and smoother)
    temperature = p5.noise(time * 0.3) * 0.3 + 0.5; // Reduced frequency
    
    // Humidity varies over time (slower and smoother)
    humidity = p5.noise(time * 0.2 + 1000) * 0.4 + 0.3; // Reduced frequency
    
    // Wind varies over time (slower and smoother)
    windX = p5.noise(time * 0.4 + 2000) * 2 - 1; // Reduced frequency
    windY = p5.noise(time * 0.4 + 3000) * 2 - 1; // Reduced frequency
  };

  const mousePressed = (p5) => {
    isMousePressed = true;
    starterSmokeActive = false;
  };

  const mouseReleased = (p5) => {
    isMousePressed = false;
  };

  const mouseMoved = (p5) => {
    mouseX = p5.mouseX;
    mouseY = p5.mouseY;
    isMousePressed = true;
    starterSmokeActive = false;
  };

  return (
    <Sketch 
      setup={setup} 
      draw={draw} 
      mousePressed={mousePressed}
      mouseReleased={mouseReleased}
      mouseMoved={mouseMoved}
    />
  );
};

export default SmokeTrailsGen2; 