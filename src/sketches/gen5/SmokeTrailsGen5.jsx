import React, { useState } from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const SmokeTrailsGen5 = ({ isFullscreen = false }) => {
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let isMousePressed = false;
  let starterSmokeActive = true;
  let temperature = 0.5;
  let humidity = 0.3;
  let windX = 0;
  let windY = 0;
  let time = 0;
  let sprayMode = 'freehand'; // Keep only freehand mode
  let stencilActive = false;
  let stencilPattern = 'circle'; // 'circle', 'square', 'star', 'text'
  let sprayPressure = 0.7; // Set to freehand pressure
  let canvasTexture = [];
  
  // Session control variables
  let sessionStartTime = 0;
  let sessionDuration = 5; // 5 seconds
  let isSessionActive = true;
  let sessionComplete = false;
  
  // Performance optimizations
  const MAX_PARTICLES = 180; // Optimized for street art effects
  const CONNECTION_RADIUS = 60; // Reduced for spray patterns
  const MAX_CONNECTIONS = 5; // Limited for street art aesthetic
  const PARTICLE_CREATION_RATE = 0.6; // Balanced for spray effects

  // Particle types inspired by street art techniques
  const PARTICLE_TYPES = {
    SPRAY: { name: 'spray', charge: 0, mass: 1, reactivity: 0.2, technique: 'aerosol' },
    TAG: { name: 'tag', charge: 0.3, mass: 0.8, reactivity: 0.4, technique: 'handstyle' },
    WHEATPASTE: { name: 'wheatpaste', charge: -0.2, mass: 1.5, reactivity: 0.05, technique: 'paste' },
    CHALK: { name: 'chalk', charge: 0.2, mass: 0.6, reactivity: 0.3, technique: 'temporary' },
    MARKER: { name: 'marker', charge: 0.4, mass: 0.7, reactivity: 0.6, technique: 'permanent' }
  };

  class Particle {
    constructor(p5, x, y, typeKey = 'SPRAY') {
      this.pos = p5.createVector(x, y);
      this.vel = p5.createVector(p5.random(-1, 1), p5.random(-1, 1));
      this.acc = p5.createVector(0, 0);
      this.typeKey = typeKey;
      this.lifespan = 255;
      this.size = 0;
      this.maxSize = 0;
      this.growthRate = 0;
      this.turbulence = 0;
      this.noiseOffset = p5.random(1000);
      this.phase = 0;
      this.connections = [];
      this.reactionCooldown = 0;
      this.temperature = p5.random(0, 1);
      this.sprayAngle = p5.random(p5.TWO_PI);
      this.spraySpread = p5.random(0.1, 0.5);
      this.stencilMask = p5.random() > 0.5;
      this.tagStyle = p5.random(['bubble', 'wildstyle', 'simple']);
      this.pasteAdhesion = p5.random(0.3, 0.8);
      this.chalkDust = p5.random(0.1, 0.4);
      this.markerBleed = p5.random(0.05, 0.2);
      
      this.setupType(p5);
    }

    setupType(p5) {
      switch (this.typeKey) {
        case 'TAG':
          this.lifespan = 280;
          this.size = p5.random(10, 25);
          this.maxSize = this.size * 2.2;
          this.growthRate = p5.random(0.08, 0.2);
          this.turbulence = p5.random(0.1, 0.4);
          this.vel.y = p5.random(-1, 1);
          break;
        case 'WHEATPASTE':
          this.lifespan = 400;
          this.size = p5.random(20, 45);
          this.maxSize = this.size * 1.8;
          this.growthRate = p5.random(0.03, 0.12);
          this.turbulence = p5.random(0.01, 0.05);
          this.vel.y = p5.random(-0.5, 0.5);
          break;
        case 'CHALK':
          this.lifespan = 200;
          this.size = p5.random(8, 20);
          this.maxSize = this.size * 1.3;
          this.growthRate = p5.random(0.1, 0.25);
          this.turbulence = p5.random(0.15, 0.5);
          this.vel.y = p5.random(-1.5, -0.5);
          break;
        case 'MARKER':
          this.lifespan = 320;
          this.size = p5.random(12, 28);
          this.maxSize = this.size * 1.9;
          this.growthRate = p5.random(0.06, 0.18);
          this.turbulence = p5.random(0.05, 0.2);
          this.vel.y = p5.random(-1.2, 0.8);
          break;
        default: // SPRAY
          this.lifespan = 255;
          this.size = p5.random(18, 38);
          this.maxSize = this.size * 2;
          this.growthRate = p5.random(0.1, 0.3);
          this.turbulence = p5.random(0.1, 0.3);
          this.vel.y = p5.random(-2, -1);
          break;
      }
    }

    update(p5) {
      // Update spray behavior
      this.updateSprayBehavior(p5);
      
      // Only find connections every few frames for performance
      if (p5.frameCount % 4 === 0) {
        this.findConnections(p5);
      }
      
      // Apply street art techniques
      this.applyStreetArtTechniques(p5);
      
      // Add turbulence using Perlin noise
      const noiseX = p5.noise(this.noiseOffset) * 2 - 1;
      const noiseY = p5.noise(this.noiseOffset + 1000) * 2 - 1;
      this.acc.add(noiseX * this.turbulence, noiseY * this.turbulence);
      
      // Add wind effect
      this.acc.add(windX * 0.1, windY * 0.1);
      
      // Type-specific behavior
      this.updateTypeBehavior(p5);
      
      // Update velocity and position
      this.vel.add(this.acc);
      this.vel.limit(4); // Limit maximum velocity
      this.pos.add(this.vel);
      
      // Reset acceleration
      this.acc.mult(0);
      
      // Grow particle
      if (this.size < this.maxSize) {
        this.size += this.growthRate;
      }
      
      // Decrease lifespan
      this.lifespan -= 1;
      
      // Update noise offset
      this.noiseOffset += 0.01;
      
      // Update phase for animation
      this.phase += 0.1;
      
      // Update reaction cooldown
      if (this.reactionCooldown > 0) {
        this.reactionCooldown--;
      }
    }

    updateSprayBehavior(p5) {
      // Spray angle affects particle movement
      const sprayForce = p5.createVector(
        p5.cos(this.sprayAngle) * this.spraySpread,
        p5.sin(this.sprayAngle) * this.spraySpread
      );
      this.acc.add(sprayForce);
      
      // Spray pressure affects particle creation
      if (p5.random() < 0.02 * sprayPressure && particles.length < MAX_PARTICLES) {
        const newParticle = new Particle(p5, this.pos.x, this.pos.y, this.typeKey);
        newParticle.sprayAngle = this.sprayAngle + p5.random(-0.5, 0.5);
        particles.push(newParticle);
      }
    }

    applyStreetArtTechniques(p5) {
      switch (this.typeKey) {
        case 'TAG':
          // Tag particles have style-specific behavior
          switch (this.tagStyle) {
            case 'bubble':
              this.size *= 1.02; // Growing bubbles
              break;
            case 'wildstyle':
              this.vel.add(p5.random(-0.5, 0.5), p5.random(-0.5, 0.5));
              break;
            case 'simple':
              this.turbulence *= 0.8; // Clean lines
              break;
          }
          break;
        case 'WHEATPASTE':
          // Wheatpaste particles stick to surfaces
          this.vel.mult(this.pasteAdhesion);
          break;
        case 'CHALK':
          // Chalk particles create dust
          if (p5.random() < 0.1) {
            this.size *= (1 - this.chalkDust);
          }
          break;
        case 'MARKER':
          // Marker particles bleed
          this.size *= (1 + this.markerBleed * 0.01);
          break;
      }
    }

    findConnections(p5) {
      this.connections = [];
      let connectionCount = 0;
      
      for (let particle of particles) {
        if (particle !== this && connectionCount < MAX_CONNECTIONS) {
          const distance = p5.dist(this.pos.x, this.pos.y, particle.pos.x, particle.pos.y);
          if (distance < CONNECTION_RADIUS) {
            this.connections.push({ particle, distance });
            connectionCount++;
          }
        }
      }
      
      // Sort by distance and keep only closest connections
      this.connections.sort((a, b) => a.distance - b.distance);
      this.connections = this.connections.slice(0, MAX_CONNECTIONS);
    }

    updateTypeBehavior(p5) {
      switch (this.typeKey) {
        case 'TAG':
          // Tag particles create handstyles
          this.temperature = p5.noise(this.noiseOffset + 500) * 0.5 + 0.5;
          if (p5.random() < 0.02 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'MARKER'));
          }
          break;
        case 'WHEATPASTE':
          // Wheatpaste creates layered effects
          if (p5.random() < 0.005 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'TAG'));
          }
          break;
        case 'CHALK':
          // Chalk creates temporary marks
          this.turbulence *= (1 + humidity * 0.3);
          if (p5.random() < 0.03) {
            this.size *= 0.9;
          }
          break;
        case 'MARKER':
          // Marker creates permanent lines
          this.temperature = p5.noise(this.noiseOffset + 1000) * 0.8 + 0.2;
          if (p5.random() < 0.01) {
            this.vel.add(p5.random(-0.3, 0.3), p5.random(-0.3, 0.3));
          }
          break;
        default: // SPRAY
          this.turbulence *= (1 + temperature * 0.3);
          break;
      }
    }

    show(p5) {
      p5.noStroke();
      
      const alpha = p5.map(this.lifespan, 0, 255, 0, 0.6);
      
      let r, g, b;
      
      switch (this.typeKey) {
        case 'TAG':
          // Vibrant colors for tags
          const tagHue = p5.map(this.temperature, 0, 1, 0, 360);
          p5.colorMode(p5.HSB, 360, 100, 100, 1);
          p5.fill(tagHue, 80, 90, alpha);
          p5.colorMode(p5.RGB, 255, 255, 255, 1);
          return; // Early return for HSB colors
        case 'WHEATPASTE':
          // Muted, paper-like colors
          r = p5.lerp(180, 220, this.pasteAdhesion);
          g = p5.lerp(170, 210, this.pasteAdhesion);
          b = p5.lerp(160, 200, this.pasteAdhesion);
          break;
        case 'MARKER':
          // Bold, saturated colors
          const markerIntensity = p5.lerp(100, 255, this.markerBleed);
          r = p5.lerp(150, 255, this.temperature);
          g = p5.lerp(100, 200, this.temperature);
          b = p5.lerp(50, 150, this.temperature);
          break;
        default: // SPRAY
          // Aerosol spray colors
          const sprayTemp = this.temperature;
          r = p5.lerp(100, 200, sprayTemp);
          g = p5.lerp(100, 200, sprayTemp);
          b = p5.lerp(100, 200, sprayTemp);
          break;
      }
      
      p5.fill(r, g, b, alpha);
      
      // Different shapes for different techniques
      if (this.typeKey === 'TAG') {
        // Stylized shapes for tags
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase);
        switch (this.tagStyle) {
          case 'bubble':
            p5.circle(0, 0, this.size);
            break;
          case 'wildstyle':
            p5.triangle(-this.size/2, this.size/2, this.size/2, this.size/2, 0, -this.size/2);
            break;
          case 'simple':
            p5.rect(-this.size/2, -this.size/2, this.size, this.size);
            break;
        }
        p5.pop();
      } else if (this.typeKey === 'WHEATPASTE') {
        // Layered, textured shapes
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.3);
        p5.ellipse(0, 0, this.size, this.size * 0.8);
        p5.pop();
      } else if (this.typeKey === 'CHALK') {
        // Soft, dusty shapes - simplified to avoid expanding circles
        p5.circle(this.pos.x, this.pos.y, this.size);
      } else if (this.typeKey === 'MARKER') {
        // Bold, defined shapes
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.7);
        p5.rect(-this.size/2, -this.size/2, this.size, this.size * 0.6);
        p5.pop();
      } else {
        // Default spray circles
        p5.circle(this.pos.x, this.pos.y, this.size);
      }
      
      // Draw connections for street art aesthetic (only every few frames)
      if (this.connections.length > 0 && p5.frameCount % 8 === 0) {
        p5.stroke(r, g, b, alpha * 0.1);
        p5.strokeWeight(0.5);
        for (let connection of this.connections) {
          if (connection.distance < 40) {
            const other = connection.particle;
            p5.line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
          }
        }
        p5.noStroke();
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
    p5.background(20, 25, 30); // Urban background color
    
    // Initialize canvas texture for street art feel
    createCanvasTexture(p5);
    
    // Initialize session
    sessionStartTime = p5.millis();
    isSessionActive = true;
    sessionComplete = false;
    particles = [];
  };

  const createCanvasTexture = (p5) => {
    canvasTexture = [];
    for (let i = 0; i < 100; i++) {
      canvasTexture.push({
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        size: p5.random(1, 3),
        alpha: p5.random(0.1, 0.3)
      });
    }
  };

  const draw = (p5) => {
    // Check session timer
    const currentTime = p5.millis();
    const sessionElapsed = (currentTime - sessionStartTime) / 1000; // Convert to seconds
    
    if (sessionElapsed >= sessionDuration && isSessionActive) {
      isSessionActive = false;
      sessionComplete = true;
      p5.noLoop(); // Stop the draw loop completely
    }
    
    // Draw canvas texture
    p5.fill(30, 35, 40, 0.1);
    for (let texture of canvasTexture) {
      p5.circle(texture.x, texture.y, texture.size);
    }
    
    // Update environmental conditions
    updateEnvironment(p5);
    
    // Create particles based on spray mode (only if session is active)
    if (isSessionActive) {
      createParticles(p5);
    }
    
    // Update and display particles (always continue existing particles)
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(p5);
      particles[i].show(p5);
      
      if (particles[i].isDead()) {
        particles.splice(i, 1);
      }
    }
    
    // Draw UI elements
    drawUI(p5);
  };

  const updateEnvironment = (p5) => {
    // Environmental changes based on time
    time += 0.01;
    temperature = p5.noise(time) * 0.5 + 0.5;
    humidity = p5.noise(time + 1000) * 0.5 + 0.3;
    windX = p5.noise(time + 2000) * 0.2 - 0.1;
    windY = p5.noise(time + 3000) * 0.2 - 0.1;
  };

  const createParticles = (p5) => {
    // Starter smoke
    if (starterSmokeActive && particles.length < MAX_PARTICLES) {
      if (p5.random() < 0.1) {
        const type = getSprayParticleType(p5);
        particles.push(new Particle(p5, p5.width / 2, p5.height, type));
      }
    }
    
    // Mouse interaction
    if (isMousePressed && particles.length < MAX_PARTICLES) {
      if (p5.random() < 0.3) {
        const type = getSprayParticleType(p5);
        particles.push(new Particle(p5, mouseX, mouseY, type));
      }
    }
  };

  const getSprayParticleType = (p5) => {
    const rand = p5.random();
    
    // Focus on freehand techniques - spray, marker, chalk, and tags
    if (rand < 0.5) return 'SPRAY';      // 50% spray - the main freehand technique
    if (rand < 0.7) return 'MARKER';     // 20% marker - bold lines
    if (rand < 0.85) return 'CHALK';     // 15% chalk - temporary marks
    if (rand < 0.95) return 'TAG';       // 10% tags - handstyles
    return 'WHEATPASTE';                 // 5% wheatpaste - occasional layers
  };

  const drawUI = (p5) => {
    // Calculate session time
    const currentTime = p5.millis();
    const sessionElapsed = (currentTime - sessionStartTime) / 1000;
    const timeRemaining = Math.max(0, sessionDuration - sessionElapsed);
    
    // Draw UI elements
    p5.push();
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.textSize(16);
    p5.fill(255, 255, 255, 0.8);
    p5.text(`Freehand Street Art`, 20, 20);
    p5.text(`Particles: ${particles.length}/${MAX_PARTICLES}`, 20, 45);
    
    // Session status
    if (isSessionActive) {
      p5.fill(100, 255, 100, 0.8); // Green for active
      p5.text(`Session Active: ${timeRemaining.toFixed(1)}s remaining`, 20, 70);
    } else if (sessionComplete) {
      p5.fill(255, 255, 100, 0.8); // Yellow for complete
      p5.text(`Session Complete! Click to reset`, 20, 70);
    }
    
    p5.pop();
  };

  const mousePressed = (p5) => {
    // Reset session if complete
    if (sessionComplete) {
      // Clear all particles
      particles = [];
      
      // Reset session state
      sessionStartTime = p5.millis();
      isSessionActive = true;
      sessionComplete = false;
      
      // Clear canvas
      p5.background(20, 25, 30);
      
      // Recreate canvas texture
      createCanvasTexture(p5);
      
      // Restart the draw loop
      p5.loop();
      
      return; // Don't process normal mouse press for session reset
    }
    
    // Normal mouse interaction (only if session is active)
    if (isSessionActive) {
      isMousePressed = true;
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    }
  };

  const mouseReleased = (p5) => {
    isMousePressed = false;
  };

  const mouseMoved = (p5) => {
    mouseX = p5.mouseX;
    mouseY = p5.mouseY;
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    createCanvasTexture(p5);
  };

  return (
    <div className="sketch-container">
      <Sketch
        setup={setup}
        draw={draw}
        mousePressed={mousePressed}
        mouseReleased={mouseReleased}
        mouseMoved={mouseMoved}
        windowResized={windowResized}
      />
    </div>
  );
};

export default SmokeTrailsGen5; 