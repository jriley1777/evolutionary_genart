import React, { useState } from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const SmokeTrailsGen6 = ({ isFullscreen = false }) => {
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
  let muralMode = 'collaborative'; // 'collaborative', 'mural', 'installation'
  let canvasLayers = [];
  let artistCount = 3;
  let muralProgress = 0;
  let installationPhase = 0; // 0: setup, 1: creation, 2: interaction, 3: completion
  
  // Performance optimizations
  const MAX_PARTICLES = 160; // Optimized for mural complexity
  const CONNECTION_RADIUS = 80; // Increased for mural connections
  const MAX_CONNECTIONS = 8; // More connections for collaborative feel
  const PARTICLE_CREATION_RATE = 0.5; // Balanced for mural creation

  // Particle types inspired by urban art movements
  const PARTICLE_TYPES = {
    MURAL: { name: 'mural', charge: 0.2, mass: 1.3, reactivity: 0.3, technique: 'large-scale' },
    WHEATPASTE: { name: 'wheatpaste', charge: -0.1, mass: 1.4, reactivity: 0.1, technique: 'paste' },
    INSTALLATION: { name: 'installation', charge: 0.4, mass: 0.9, reactivity: 0.5, technique: '3D' },
    COLLABORATIVE: { name: 'collaborative', charge: 0.3, mass: 1.1, reactivity: 0.4, technique: 'multi-artist' },
    STREET: { name: 'street', charge: 0.1, mass: 1.0, reactivity: 0.2, technique: 'public' },
    GALLERY: { name: 'gallery', charge: -0.2, mass: 1.5, reactivity: 0.05, technique: 'curated' }
  };

  class Particle {
    constructor(p5, x, y, typeKey = 'MURAL') {
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
      this.artistId = Math.floor(p5.random(artistCount));
      this.muralSection = p5.random(['background', 'foreground', 'midground']);
      this.pasteLayer = p5.random(1, 5);
      this.installationDepth = p5.random(-50, 50);
      this.collaborationStrength = p5.random(0.3, 0.8);
      this.streetVisibility = p5.random(0.5, 1.0);
      this.galleryRefinement = p5.random(0.1, 0.6);
      
      this.setupType(p5);
    }

    setupType(p5) {
      switch (this.typeKey) {
        case 'WHEATPASTE':
          this.lifespan = 350;
          this.size = p5.random(25, 50);
          this.maxSize = this.size * 1.6;
          this.growthRate = p5.random(0.03, 0.12);
          this.turbulence = p5.random(0.01, 0.06);
          this.vel.y = p5.random(-0.8, 0.8);
          break;
        case 'INSTALLATION':
          this.lifespan = 300;
          this.size = p5.random(15, 35);
          this.maxSize = this.size * 2.2;
          this.growthRate = p5.random(0.08, 0.2);
          this.turbulence = p5.random(0.1, 0.4);
          this.vel.y = p5.random(-1.2, 1.2);
          break;
        case 'COLLABORATIVE':
          this.lifespan = 280;
          this.size = p5.random(20, 40);
          this.maxSize = this.size * 1.8;
          this.growthRate = p5.random(0.06, 0.16);
          this.turbulence = p5.random(0.05, 0.25);
          this.vel.y = p5.random(-1.5, -0.5);
          break;
        case 'STREET':
          this.lifespan = 250;
          this.size = p5.random(18, 38);
          this.maxSize = this.size * 1.7;
          this.growthRate = p5.random(0.07, 0.18);
          this.turbulence = p5.random(0.08, 0.3);
          this.vel.y = p5.random(-1.8, -0.8);
          break;
        case 'GALLERY':
          this.lifespan = 400;
          this.size = p5.random(30, 55);
          this.maxSize = this.size * 1.4;
          this.growthRate = p5.random(0.02, 0.1);
          this.turbulence = p5.random(0.01, 0.04);
          this.vel.y = p5.random(-0.5, 0.5);
          break;
        default: // MURAL
          this.lifespan = 320;
          this.size = p5.random(22, 45);
          this.maxSize = this.size * 1.9;
          this.growthRate = p5.random(0.05, 0.15);
          this.turbulence = p5.random(0.03, 0.12);
          this.vel.y = p5.random(-1.2, -0.6);
          break;
      }
    }

    update(p5) {
      // Update mural behavior
      this.updateMuralBehavior(p5);
      
      // Only find connections every few frames for performance
      if (p5.frameCount % 3 === 0) {
        this.findConnections(p5);
      }
      
      // Apply urban art techniques
      this.applyUrbanArtTechniques(p5);
      
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

    updateMuralBehavior(p5) {
      // Mural progress affects particle behavior
      const progressInfluence = muralProgress / 100;
      
      // Artist collaboration affects movement
      const collaborationForce = p5.createVector(
        p5.cos(this.artistId * p5.TWO_PI / artistCount) * this.collaborationStrength,
        p5.sin(this.artistId * p5.TWO_PI / artistCount) * this.collaborationStrength
      );
      this.acc.add(collaborationForce);
      
      // Mural section affects positioning
      switch (this.muralSection) {
        case 'background':
          this.vel.mult(0.9); // Slower background elements
          break;
        case 'foreground':
          this.vel.mult(1.1); // Faster foreground elements
          break;
        case 'midground':
          this.vel.mult(1.0); // Balanced midground
          break;
      }
      
      // Installation depth affects 3D positioning
      this.installationDepth += p5.random(-0.5, 0.5);
      this.installationDepth = p5.constrain(this.installationDepth, -100, 100);
    }

    applyUrbanArtTechniques(p5) {
      switch (this.typeKey) {
        case 'MURAL':
          // Mural particles create large-scale compositions
          if (this.muralSection === 'background') {
            this.size *= 1.02; // Background elements grow larger
          } else if (this.muralSection === 'foreground') {
            this.turbulence *= 1.1; // Foreground elements more dynamic
          }
          break;
        case 'WHEATPASTE':
          // Wheatpaste particles create layered effects
          this.vel.mult(1 - (this.pasteLayer * 0.1)); // Higher layers move slower
          if (p5.random() < 0.02) {
            this.size *= 0.95; // Occasional layer peeling
          }
          break;
        case 'INSTALLATION':
          // Installation particles create 3D effects
          this.vel.add(p5.random(-0.2, 0.2), p5.random(-0.2, 0.2));
          this.size *= (1 + Math.abs(this.installationDepth) * 0.001);
          break;
        case 'COLLABORATIVE':
          // Collaborative particles respond to other artists
          this.temperature = p5.noise(this.noiseOffset + this.artistId * 100) * 0.5 + 0.5;
          if (p5.random() < 0.01 && particles.length < MAX_PARTICLES) {
            const newArtist = (this.artistId + 1) % artistCount;
            const newParticle = new Particle(p5, this.pos.x, this.pos.y, 'COLLABORATIVE');
            newParticle.artistId = newArtist;
            particles.push(newParticle);
          }
          break;
        case 'STREET':
          // Street particles have high visibility
          this.streetVisibility = p5.noise(this.noiseOffset + 500) * 0.5 + 0.5;
          this.size *= (1 + this.streetVisibility * 0.1);
          break;
        case 'GALLERY':
          // Gallery particles are refined and controlled
          this.galleryRefinement = p5.noise(this.noiseOffset + 1000) * 0.5 + 0.1;
          this.turbulence *= (1 - this.galleryRefinement);
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
        case 'MURAL':
          // Mural particles create large compositions
          if (p5.random() < 0.005 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'WHEATPASTE'));
          }
          break;
        case 'WHEATPASTE':
          // Wheatpaste creates layered murals
          if (p5.random() < 0.003 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'MURAL'));
          }
          break;
        case 'INSTALLATION':
          // Installation creates 3D elements
          this.temperature = p5.noise(this.noiseOffset + 1500) * 0.8 + 0.2;
          if (p5.random() < 0.01 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'COLLABORATIVE'));
          }
          break;
        case 'COLLABORATIVE':
          // Collaborative particles work together
          if (p5.random() < 0.02 && particles.length < MAX_PARTICLES) {
            const newType = p5.random(['MURAL', 'STREET', 'GALLERY']);
            particles.push(new Particle(p5, this.pos.x, this.pos.y, newType));
          }
          break;
        case 'STREET':
          // Street particles create public art
          if (p5.random() < 0.01 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'WHEATPASTE'));
          }
          break;
        case 'GALLERY':
          // Gallery particles create refined art
          if (p5.random() < 0.002 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'INSTALLATION'));
          }
          break;
      }
    }

    show(p5) {
      p5.noStroke();
      
      const alpha = p5.map(this.lifespan, 0, 255, 0, 0.7);
      
      let r, g, b;
      
      switch (this.typeKey) {
        case 'MURAL':
          // Large-scale mural colors
          const muralHue = p5.map(this.artistId, 0, artistCount, 0, 360);
          p5.colorMode(p5.HSB, 360, 100, 100, 1);
          p5.fill(muralHue, 70, 90, alpha);
          p5.colorMode(p5.RGB, 255, 255, 255, 1);
          return; // Early return for HSB colors
        case 'WHEATPASTE':
          // Paper-like, layered colors
          const pasteLayer = this.pasteLayer;
          r = p5.lerp(200, 180, pasteLayer / 5);
          g = p5.lerp(190, 170, pasteLayer / 5);
          b = p5.lerp(180, 160, pasteLayer / 5);
          break;
        case 'INSTALLATION':
          // 3D installation colors
          const depth = p5.map(this.installationDepth, -100, 100, 0, 1);
          r = p5.lerp(100, 200, depth);
          g = p5.lerp(150, 100, depth);
          b = p5.lerp(200, 150, depth);
          break;
        case 'COLLABORATIVE':
          // Collaborative, vibrant colors
          const collabHue = p5.map(this.collaborationStrength, 0.3, 0.8, 0, 360);
          p5.colorMode(p5.HSB, 360, 100, 100, 1);
          p5.fill(collabHue, 80, 95, alpha);
          p5.colorMode(p5.RGB, 255, 255, 255, 1);
          return; // Early return for HSB colors
        case 'STREET':
          // High-visibility street colors
          const visibility = this.streetVisibility;
          r = p5.lerp(150, 255, visibility);
          g = p5.lerp(100, 200, visibility);
          b = p5.lerp(50, 150, visibility);
          break;
        case 'GALLERY':
          // Refined gallery colors
          const refinement = this.galleryRefinement;
          r = p5.lerp(180, 220, refinement);
          g = p5.lerp(170, 210, refinement);
          b = p5.lerp(160, 200, refinement);
          break;
        default: // MURAL
          // Default mural colors
          const muralTemp = this.temperature;
          r = p5.lerp(120, 220, muralTemp);
          g = p5.lerp(100, 200, muralTemp);
          b = p5.lerp(80, 180, muralTemp);
          break;
      }
      
      p5.fill(r, g, b, alpha);
      
      // Different shapes for different urban art types
      if (this.typeKey === 'MURAL') {
        // Large, bold shapes for murals
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.3);
        switch (this.muralSection) {
          case 'background':
            p5.rect(-this.size/2, -this.size/2, this.size, this.size);
            break;
          case 'foreground':
            p5.circle(0, 0, this.size);
            break;
          case 'midground':
            p5.ellipse(0, 0, this.size, this.size * 0.8);
            break;
        }
        p5.pop();
      } else if (this.typeKey === 'WHEATPASTE') {
        // Layered, textured shapes
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.2);
        p5.rect(-this.size/2, -this.size/2, this.size, this.size * 0.9);
        p5.pop();
      } else if (this.typeKey === 'INSTALLATION') {
        // 3D installation shapes
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.8);
        const depth = p5.map(this.installationDepth, -100, 100, 0.5, 1.5);
        p5.ellipse(0, 0, this.size * depth, this.size);
        p5.pop();
      } else if (this.typeKey === 'COLLABORATIVE') {
        // Collaborative, dynamic shapes
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * this.collaborationStrength);
        p5.triangle(-this.size/2, this.size/2, this.size/2, this.size/2, 0, -this.size/2);
        p5.pop();
      } else if (this.typeKey === 'STREET') {
        // High-visibility street shapes
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.6);
        p5.rect(-this.size/2, -this.size/2, this.size, this.size * 0.7);
        p5.pop();
      } else if (this.typeKey === 'GALLERY') {
        // Refined gallery shapes
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.4);
        p5.circle(0, 0, this.size);
        p5.pop();
      } else {
        // Default shapes
        p5.circle(this.pos.x, this.pos.y, this.size);
      }
      
      // Draw connections for urban art aesthetic (only every few frames)
      if (this.connections.length > 0 && p5.frameCount % 6 === 0) {
        p5.stroke(r, g, b, alpha * 0.15);
        p5.strokeWeight(1);
        for (let connection of this.connections) {
          if (connection.distance < 60) {
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
    p5.background(15, 20, 25); // Urban canvas background
    
    // Initialize canvas layers for mural feel
    createCanvasLayers(p5);
  };

  const createCanvasLayers = (p5) => {
    canvasLayers = [];
    for (let i = 0; i < 5; i++) {
      canvasLayers.push({
        y: p5.height * (i / 5),
        height: p5.height / 5,
        alpha: p5.map(i, 0, 4, 0.05, 0.2)
      });
    }
  };

  const draw = (p5) => {
    // Draw canvas layers
    p5.fill(25, 30, 35, 0.1);
    for (let layer of canvasLayers) {
      p5.rect(0, layer.y, p5.width, layer.height);
    }
    
    // Update environmental conditions
    updateEnvironment(p5);
    
    // Update mural mode
    updateMuralMode(p5);
    
    // Create particles based on mural mode
    createParticles(p5);
    
    // Update and display particles
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
    
    // Update mural progress
    muralProgress = p5.map(p5.frameCount % 1200, 0, 1200, 0, 100);
  };

  const updateMuralMode = (p5) => {
    // Cycle through mural modes every 20 seconds
    const modeTime = Math.floor(p5.frameCount / 1200);
    const modes = ['collaborative', 'mural', 'installation'];
    muralMode = modes[modeTime % modes.length];
    
    // Update installation phase
    installationPhase = Math.floor((p5.frameCount % 2400) / 600);
  };

  const createParticles = (p5) => {
    // Starter particles
    if (starterSmokeActive && particles.length < MAX_PARTICLES) {
      if (p5.random() < 0.08) {
        const type = getMuralParticleType(p5);
        particles.push(new Particle(p5, p5.width / 2, p5.height, type));
      }
    }
    
    // Mouse interaction
    if (isMousePressed && particles.length < MAX_PARTICLES) {
      if (p5.random() < 0.25) {
        const type = getMuralParticleType(p5);
        particles.push(new Particle(p5, mouseX, mouseY, type));
      }
    }
  };

  const getMuralParticleType = (p5) => {
    const rand = p5.random();
    
    switch (muralMode) {
      case 'collaborative':
        if (rand < 0.4) return 'COLLABORATIVE';
        if (rand < 0.6) return 'MURAL';
        if (rand < 0.8) return 'STREET';
        return 'GALLERY';
      case 'mural':
        if (rand < 0.5) return 'MURAL';
        if (rand < 0.7) return 'WHEATPASTE';
        if (rand < 0.9) return 'STREET';
        return 'COLLABORATIVE';
      case 'installation':
        if (rand < 0.4) return 'INSTALLATION';
        if (rand < 0.6) return 'COLLABORATIVE';
        if (rand < 0.8) return 'GALLERY';
        return 'MURAL';
      default:
        return 'MURAL';
    }
  };

  const drawUI = (p5) => {
    // Draw mural mode indicator
    p5.push();
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.textSize(16);
    p5.fill(255, 255, 255, 0.8);
    p5.text(`Mural Mode: ${muralMode.toUpperCase()}`, 20, 20);
    p5.text(`Progress: ${Math.round(muralProgress)}%`, 20, 45);
    p5.text(`Artists: ${artistCount}`, 20, 70);
    p5.text(`Phase: ${installationPhase}`, 20, 95);
    p5.text(`Particles: ${particles.length}/${MAX_PARTICLES}`, 20, 120);
    p5.pop();
  };

  const mousePressed = (p5) => {
    isMousePressed = true;
    mouseX = p5.mouseX;
    mouseY = p5.mouseY;
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
    createCanvasLayers(p5);
  };

  return (
    <Sketch
      setup={setup}
      draw={draw}
      mousePressed={mousePressed}
      mouseReleased={mouseReleased}
      mouseMoved={mouseMoved}
      windowResized={windowResized}
    />
  );
};

export default SmokeTrailsGen6; 