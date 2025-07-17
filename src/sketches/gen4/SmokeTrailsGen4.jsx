import React, { useState } from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const SmokeTrailsGen4 = ({ isFullscreen = false }) => {
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
  let storyPhase = 0; // 0: calm, 1: building, 2: storm, 3: aftermath
  let storyTimer = 0;
  let cameraZ = 0;
  let cameraAngle = 0;
  
  // Performance optimizations
  const MAX_PARTICLES = 150; // Reduced for 3D complexity
  const CONNECTION_RADIUS = 70; // Reduced from 100
  const MAX_CONNECTIONS = 6; // Reduced for 3D
  const Z_CONNECTION_RADIUS = 40; // Reduced from 50
  const PARTICLE_CREATION_RATE = 0.4; // Reduced for 3D

  // Particle types with narrative properties
  const PARTICLE_TYPES = {
    SMOKE: { name: 'smoke', charge: 0, mass: 1, reactivity: 0.1, story: 'witness' },
    FIRE: { name: 'fire', charge: 0.3, mass: 0.8, reactivity: 0.8, story: 'protagonist' },
    STEAM: { name: 'steam', charge: -0.2, mass: 0.6, reactivity: 0.3, story: 'guide' },
    PLASMA: { name: 'plasma', charge: 0.8, mass: 0.5, reactivity: 0.9, story: 'antagonist' },
    ASH: { name: 'ash', charge: -0.1, mass: 1.2, reactivity: 0.05, story: 'memory' },
    LIGHT: { name: 'light', charge: 0.5, mass: 0.3, reactivity: 0.2, story: 'hope' },
    VOID: { name: 'void', charge: -0.8, mass: 1.5, reactivity: 0.7, story: 'fear' }
  };
  const sketch = (p5) => {
    class Particle {
      constructor(p5, x, y, typeKey = 'SMOKE') {
        this.pos = p5.createVector(x, y);
        this.vel = p5.createVector(
          p5.random(-0.5, 0.5),
          p5.random(-2, -1)
        );
        this.acc = p5.createVector(0, 0);
        this.typeKey = typeKey;
        this.type = PARTICLE_TYPES[typeKey];
        this.lifespan = 255;
        this.size = p5.random(20, 40);
        this.maxSize = this.size * 2;
        this.growthRate = p5.random(0.1, 0.3);
        this.turbulence = p5.random(0.1, 0.3);
        this.noiseOffset = p5.random(1000);
        this.temperature = p5.random(0, 1);
        this.phase = p5.random(p5.TWO_PI);
        this.connections = [];
        this.reactionCooldown = 0;
        
        // 3D properties
        this.z = p5.random(-100, 100);
        this.depth = p5.random(0.5, 2);
        this.parallax = p5.random(0.8, 1.2);
        
        // Narrative properties
        this.emotion = p5.random(0, 1);
        this.memory = p5.random(0, 1);
        this.destiny = p5.random(0, 1);
        
        this.initializeType(p5);
      }

      initializeType(p5) {
        switch (this.typeKey) {
          case 'FIRE':
            this.lifespan = 180;
            this.size = p5.random(15, 30);
            this.maxSize = this.size * 1.5;
            this.growthRate = p5.random(0.2, 0.4);
            this.turbulence = p5.random(0.2, 0.4);
            this.vel.y = p5.random(-3, -1.5);
            this.z = p5.random(-50, 50);
            break;
          case 'STEAM':
            this.lifespan = 300;
            this.size = p5.random(10, 25);
            this.maxSize = this.size * 3;
            this.growthRate = p5.random(0.05, 0.15);
            this.turbulence = p5.random(0.05, 0.15);
            this.vel.y = p5.random(-1.5, -0.5);
            this.z = p5.random(-30, 30);
            break;
          case 'PLASMA':
            this.lifespan = 120;
            this.size = p5.random(8, 20);
            this.maxSize = this.size * 1.2;
            this.growthRate = p5.random(0.3, 0.5);
            this.turbulence = p5.random(0.4, 0.6);
            this.vel.y = p5.random(-4, -2);
            this.z = p5.random(-20, 20);
            break;
          case 'ASH':
            this.lifespan = 400;
            this.size = p5.random(5, 15);
            this.maxSize = this.size * 1.8;
            this.growthRate = p5.random(0.02, 0.08);
            this.turbulence = p5.random(0.02, 0.08);
            this.vel.y = p5.random(-0.5, 0.5);
            this.z = p5.random(-80, 80);
            break;
          case 'LIGHT':
            this.lifespan = 200;
            this.size = p5.random(12, 25);
            this.maxSize = this.size * 1.3;
            this.growthRate = p5.random(0.15, 0.25);
            this.turbulence = p5.random(0.1, 0.2);
            this.vel.y = p5.random(-2.5, -1);
            this.z = p5.random(-40, 40);
            break;
          case 'VOID':
            this.lifespan = 350;
            this.size = p5.random(25, 50);
            this.maxSize = this.size * 2.5;
            this.growthRate = p5.random(0.08, 0.18);
            this.turbulence = p5.random(0.3, 0.5);
            this.vel.y = p5.random(-1, 1);
            this.z = p5.random(-60, 60);
            break;
          default: // SMOKE
            this.lifespan = 255;
            this.size = p5.random(20, 40);
            this.maxSize = this.size * 2;
            this.growthRate = p5.random(0.1, 0.3);
            this.turbulence = p5.random(0.1, 0.3);
            this.vel.y = p5.random(-2, -1);
            this.z = p5.random(-70, 70);
            break;
        }
      }

      update(p5) {
        // Update story-based behavior
        this.updateStoryBehavior(p5);
        
        // Only find connections every few frames for performance
        if (p5.frameCount % 4 === 0) {
          this.findConnections(p5);
        }
        
        // Apply flocking behavior
        this.applyFlocking(p5);
        
        // Apply chemical reactions
        this.applyChemicalReactions(p5);
        
        // Add turbulence using Perlin noise
        const noiseX = p5.noise(this.noiseOffset) * 2 - 1;
        const noiseY = p5.noise(this.noiseOffset + 1000) * 2 - 1;
        const noiseZ = p5.noise(this.noiseOffset + 2000) * 2 - 1;
        this.acc.add(noiseX * this.turbulence, noiseY * this.turbulence);
        
        // Add 3D movement
        this.z += noiseZ * this.turbulence * 0.5;
        
        // Add wind effect
        this.acc.add(windX * 0.1, windY * 0.1);
        
        // Type-specific behavior
        this.updateTypeBehavior(p5);
        
        // Update velocity and position
        this.vel.add(this.acc);
        this.vel.limit(5);
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

      updateStoryBehavior(p5) {
        // Story phase affects particle behavior
        switch (storyPhase) {
          case 0: // Calm
            this.turbulence *= 0.8;
            this.vel.mult(0.95);
            break;
          case 1: // Building
            this.turbulence *= 1.2;
            this.emotion += 0.01;
            break;
          case 2: // Storm
            this.turbulence *= 1.5;
            this.vel.mult(1.1);
            this.emotion += 0.02;
            break;
          case 3: // Aftermath
            this.turbulence *= 0.6;
            this.vel.mult(0.9);
            this.memory += 0.01;
            break;
        }
        
        // Clamp values
        this.emotion = p5.constrain(this.emotion, 0, 1);
        this.memory = p5.constrain(this.memory, 0, 1);
      }

      findConnections(p5) {
        this.connections = [];
        let connectionCount = 0;
        
        for (let particle of particles) {
          if (particle !== this && connectionCount < MAX_CONNECTIONS) {
            const distance = p5.dist(this.pos.x, this.pos.y, particle.pos.x, particle.pos.y);
            const zDistance = Math.abs(this.z - particle.z);
            if (distance < CONNECTION_RADIUS && zDistance < Z_CONNECTION_RADIUS) {
              this.connections.push({ particle, distance, zDistance });
              connectionCount++;
            }
          }
        }
        
        // Sort by distance and keep only closest connections
        this.connections.sort((a, b) => a.distance - b.distance);
        this.connections = this.connections.slice(0, MAX_CONNECTIONS);
      }

      applyFlocking(p5) {
        if (this.connections.length === 0) return;
        
        let alignment = p5.createVector(0, 0);
        let cohesion = p5.createVector(0, 0);
        let separation = p5.createVector(0, 0);
        
        for (let connection of this.connections) {
          const other = connection.particle;
          const distance = connection.distance;
          
          // Alignment - match velocity of neighbors
          alignment.add(other.vel);
          
          // Cohesion - move toward center of neighbors
          cohesion.add(other.pos);
          
          // Separation - avoid crowding
          if (distance < 30) {
            const diff = p5.createVector(this.pos.x - other.pos.x, this.pos.y - other.pos.y);
            diff.normalize();
            diff.div(distance);
            separation.add(diff);
          }
        }
        
        // Apply flocking forces
        if (this.connections.length > 0) {
          alignment.div(this.connections.length);
          alignment.normalize();
          alignment.mult(0.1);
          this.acc.add(alignment);
          
          cohesion.div(this.connections.length);
          cohesion.sub(this.pos);
          cohesion.normalize();
          cohesion.mult(0.05);
          this.acc.add(cohesion);
          
          separation.normalize();
          separation.mult(0.2);
          this.acc.add(separation);
        }
      }

      applyChemicalReactions(p5) {
        if (this.reactionCooldown > 0) return;
        
        for (let connection of this.connections) {
          const other = connection.particle;
          const distance = connection.distance;
          
          if (distance < 20 && this.type.reactivity > 0.5 && other.type.reactivity > 0.5) {
            this.triggerReaction(p5, other);
            break;
          }
        }
      }

      triggerReaction(p5, other) {
        // Only create new particles if we're under the limit
        if (particles.length >= MAX_PARTICLES) return;
        
        const reactionType = `${this.typeKey}_${other.typeKey}`;
        
        switch (reactionType) {
          case 'FIRE_STEAM':
          case 'STEAM_FIRE':
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'PLASMA'));
            this.lifespan *= 0.5;
            other.lifespan *= 0.5;
            break;
          case 'FIRE_SMOKE':
          case 'SMOKE_FIRE':
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'ASH'));
            break;
          case 'PLASMA_PLASMA':
            const explosionCount = Math.min(3, MAX_PARTICLES - particles.length);
            for (let i = 0; i < explosionCount; i++) {
              particles.push(new Particle(p5, this.pos.x + p5.random(-20, 20), this.pos.y + p5.random(-20, 20), 'FIRE'));
            }
            break;
          case 'LIGHT_VOID':
          case 'VOID_LIGHT':
            // Light and void create a dramatic effect (limited)
            const plasmaCount = Math.min(2, MAX_PARTICLES - particles.length);
            for (let i = 0; i < plasmaCount; i++) {
              particles.push(new Particle(p5, this.pos.x + p5.random(-15, 15), this.pos.y + p5.random(-15, 15), 'PLASMA'));
            }
            break;
        }
        
        this.reactionCooldown = 30;
        other.reactionCooldown = 30;
      }

      updateTypeBehavior(p5) {
        switch (this.typeKey) {
          case 'FIRE':
            this.temperature = p5.noise(this.noiseOffset + 500) * 0.5 + 0.5;
            // Reduced spawn rate and only if under particle limit
            if (p5.random() < 0.008 && particles.length < MAX_PARTICLES) {
              particles.push(new Particle(p5, this.pos.x, this.pos.y, 'FIRE'));
            }
            break;
          case 'STEAM':
            this.turbulence *= (1 + humidity * 0.5);
            if (p5.random() < 0.01 && humidity > 0.7) {
              this.size *= 0.8;
            }
            break;
          case 'PLASMA':
            this.temperature = p5.noise(this.noiseOffset + 1000) * 0.8 + 0.2;
            if (p5.random() < 0.05) {
              this.vel.add(p5.random(-1, 1), p5.random(-1, 1));
            }
            break;
          case 'ASH':
            this.vel.y += 0.05;
            break;
          case 'LIGHT':
            // Light particles are drawn to other light particles
            this.emotion += 0.005;
            // Reduced spawn rate and only if under particle limit
            if (p5.random() < 0.005 && particles.length < MAX_PARTICLES) {
              particles.push(new Particle(p5, this.pos.x, this.pos.y, 'LIGHT'));
            }
            break;
          case 'VOID':
            // Void particles consume nearby particles
            this.memory += 0.01;
            if (p5.random() < 0.03) {
              this.size *= 1.05;
            }
            break;
          default: // SMOKE
            this.turbulence *= (1 + temperature * 0.3);
            break;
        }
      }

      show(p5) {
        p5.noStroke();
        
        // Calculate 3D position
        const screenX = this.pos.x + (this.z * 0.1);
        const screenY = this.pos.y + (this.z * 0.05);
        const screenSize = this.size * (1 + this.z * 0.001);
        
        const alpha = p5.map(this.lifespan, 0, 255, 0, 0.4) * (1 - Math.abs(this.z) * 0.001);
        
        let r, g, b;
        
        switch (this.typeKey) {
          case 'FIRE':
            const fireTemp = this.temperature;
            r = p5.lerp(255, 255, fireTemp);
            g = p5.lerp(100, 255, fireTemp);
            b = p5.lerp(0, 100, fireTemp);
            break;
          case 'STEAM':
            r = p5.lerp(200, 220, humidity);
            g = p5.lerp(220, 240, humidity);
            b = p5.lerp(255, 255, humidity);
            break;
          case 'PLASMA':
            const plasmaTemp = this.temperature;
            r = p5.lerp(100, 255, plasmaTemp);
            g = p5.lerp(150, 255, plasmaTemp);
            b = p5.lerp(255, 100, plasmaTemp);
            break;
          case 'ASH':
            const ashGray = p5.lerp(50, 100, this.temperature);
            r = g = b = ashGray;
            break;
          case 'LIGHT':
            const lightIntensity = this.emotion;
            r = p5.lerp(200, 255, lightIntensity);
            g = p5.lerp(220, 255, lightIntensity);
            b = p5.lerp(255, 255, lightIntensity);
            break;
          case 'VOID':
            const voidDepth = this.memory;
            r = p5.lerp(20, 0, voidDepth);
            g = p5.lerp(20, 0, voidDepth);
            b = p5.lerp(40, 0, voidDepth);
            break;
          default: // SMOKE
            const smokeTemp = this.temperature;
            r = p5.lerp(100, 200, smokeTemp);
            g = p5.lerp(100, 200, smokeTemp);
            b = p5.lerp(100, 200, smokeTemp);
            break;
        }
        
        p5.fill(r, g, b, alpha);
        
        // Different shapes for different types
        if (this.typeKey === 'FIRE') {
          p5.push();
          p5.translate(screenX, screenY);
          p5.rotate(this.phase);
          p5.rect(-screenSize/2, -screenSize/2, screenSize, screenSize);
          p5.pop();
        } else if (this.typeKey === 'PLASMA') {
          p5.push();
          p5.translate(screenX, screenY);
          p5.rotate(this.phase * 2);
          p5.triangle(-screenSize/2, screenSize/2, screenSize/2, screenSize/2, 0, -screenSize/2);
          p5.pop();
        } else if (this.typeKey === 'ASH') {
          p5.push();
          p5.translate(screenX, screenY);
          p5.rotate(this.phase * 0.5);
          p5.ellipse(0, 0, screenSize, screenSize * 0.6);
          p5.pop();
        } else if (this.typeKey === 'LIGHT') {
          // Light particles have a glow effect (simplified for performance)
          p5.push();
          p5.translate(screenX, screenY);
          p5.fill(r, g, b, alpha * 0.2);
          p5.circle(0, 0, screenSize * 1.5);
          p5.fill(r, g, b, alpha);
          p5.circle(0, 0, screenSize);
          p5.pop();
        } else if (this.typeKey === 'VOID') {
          // Void particles have a dark aura (simplified for performance)
          p5.push();
          p5.translate(screenX, screenY);
          p5.fill(0, 0, 0, alpha * 0.3);
          p5.circle(0, 0, screenSize * 1.3);
          p5.fill(r, g, b, alpha);
          p5.circle(0, 0, screenSize);
          p5.pop();
        } else {
          p5.circle(screenX, screenY, screenSize);
        }
        
        // Draw connections for flocking visualization (only every few frames)
        if (this.connections.length > 0 && p5.frameCount % 6 === 0) {
          p5.stroke(r, g, b, alpha * 0.15);
          p5.strokeWeight(1);
          for (let connection of this.connections) {
            if (connection.distance < 50) {
              const other = connection.particle;
              const otherScreenX = other.pos.x + (other.z * 0.1);
              const otherScreenY = other.pos.y + (other.z * 0.05);
              p5.line(screenX, screenY, otherScreenX, otherScreenY);
            }
          }
          p5.noStroke();
        }
      }

      isDead() {
        return this.lifespan <= 0;
      }
    }

    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.colorMode(p5.RGB, 255, 255, 255, 1);
      p5.background(0);
    };

    p5.draw = () => {
      time += 0.01;
      storyTimer += 1;
      
      // Update story progression
      updateStoryProgression(p5);
      
      // Update environmental conditions
      updateEnvironment(p5);
      
      // Update camera
      updateCamera(p5);
      
      // Fade background with story-based color
      const bgColor = getStoryBackgroundColor(p5);
      p5.fill(bgColor.r, bgColor.g, bgColor.b, 0.1);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);

      // Starter smoke at bottom center (reduced rate)
      if (starterSmokeActive && particles.length < MAX_PARTICLES * 0.7) {
        const centerX = p5.width / 2;
        const centerY = p5.height - 50;
        
        const randomX = centerX + p5.random(-20, 20);
        const randomY = centerY + p5.random(-10, 10);
        
        // Create different particle types based on story phase (reduced count)
        const particleCount = p5.floor(p5.random(1, 3));
        for (let i = 0; i < particleCount && particles.length < MAX_PARTICLES; i++) {
          let particleType = getStoryParticleType(p5);
          particles.push(new Particle(p5, randomX, randomY, particleType));
        }
      }

      // Add new particles when mouse is pressed (reduced rate)
      if (isMousePressed && particles.length < MAX_PARTICLES) {
        const mouseParticleCount = p5.floor(p5.random(1, 3));
        for (let i = 0; i < mouseParticleCount && particles.length < MAX_PARTICLES; i++) {
          let particleType = getStoryParticleType(p5);
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

    const updateStoryProgression = (p5) => {
      // Story phases change every 600 frames (10 seconds at 60fps)
      if (storyTimer > 600) {
        storyPhase = (storyPhase + 1) % 4;
        storyTimer = 0;
      }
    };

    const getStoryBackgroundColor = (p5) => {
      switch (storyPhase) {
        case 0: // Calm - cool blues
          return { r: 20, g: 40, b: 80 };
        case 1: // Building - warm oranges
          return { r: 80, g: 40, b: 20 };
        case 2: // Storm - intense reds
          return { r: 120, g: 20, b: 20 };
        case 3: // Aftermath - muted purples
          return { r: 40, g: 20, b: 60 };
        default:
          return { r: 0, g: 0, b: 0 };
      }
    };

    const getStoryParticleType = (p5) => {
      const rand = p5.random();
      
      switch (storyPhase) {
        case 0: // Calm - mostly smoke and steam
          if (rand < 0.7) return 'SMOKE';
          if (rand < 0.9) return 'STEAM';
          if (rand < 0.95) return 'LIGHT';
          return 'ASH';
        case 1: // Building - more fire and light
          if (rand < 0.5) return 'SMOKE';
          if (rand < 0.7) return 'FIRE';
          if (rand < 0.85) return 'LIGHT';
          if (rand < 0.95) return 'STEAM';
          return 'PLASMA';
        case 2: // Storm - intense fire, plasma, and void
          if (rand < 0.3) return 'FIRE';
          if (rand < 0.5) return 'PLASMA';
          if (rand < 0.7) return 'VOID';
          if (rand < 0.85) return 'SMOKE';
          return 'LIGHT';
        case 3: // Aftermath - ash, light, and memories
          if (rand < 0.4) return 'ASH';
          if (rand < 0.6) return 'LIGHT';
          if (rand < 0.8) return 'SMOKE';
          if (rand < 0.9) return 'STEAM';
          return 'VOID';
        default:
          return 'SMOKE';
      }
    };

    const updateEnvironment = (p5) => {
      // Temperature varies over time and story phase
      const baseTemp = p5.noise(time * 0.5) * 0.3 + 0.5;
      temperature = baseTemp + (storyPhase * 0.1);
      
      // Humidity varies over time
      humidity = p5.noise(time * 0.3 + 1000) * 0.4 + 0.3;
      
      // Wind varies over time and story phase
      const baseWindX = p5.noise(time * 0.8 + 2000) * 2 - 1;
      const baseWindY = p5.noise(time * 0.8 + 3000) * 2 - 1;
      windX = baseWindX * (1 + storyPhase * 0.5);
      windY = baseWindY * (1 + storyPhase * 0.5);
    };

    const updateCamera = (p5) => {
      // Camera gently moves in 3D space
      cameraZ = p5.sin(time * 0.2) * 20;
      cameraAngle = p5.sin(time * 0.1) * 0.1;
    };

    p5.mousePressed = () => {
      isMousePressed = true;
      starterSmokeActive = false;
    };

    p5.mouseReleased = () => {
      isMousePressed = false;
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
      isMousePressed = true;
      starterSmokeActive = false;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
  };

  return (
    <ReactP5Wrapper sketch={sketch}/>
  );
};

export default SmokeTrailsGen4; 