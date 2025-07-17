import React, { useState } from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const SmokeTrailsGen3 = ({ isFullscreen = false }) => {
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
  
  // Performance optimizations
  const MAX_PARTICLES = 200; // Limit total particles
  const CONNECTION_RADIUS = 80; // Reduced from 100
  const MAX_CONNECTIONS = 8; // Limit connections per particle
  const PARTICLE_CREATION_RATE = 0.5; // Reduce particle creation

  // Particle types with chemical properties
  const PARTICLE_TYPES = {
    SMOKE: { name: 'smoke', charge: 0, mass: 1, reactivity: 0.1 },
    FIRE: { name: 'fire', charge: 0.3, mass: 0.8, reactivity: 0.8 },
    STEAM: { name: 'steam', charge: -0.2, mass: 0.6, reactivity: 0.3 },
    PLASMA: { name: 'plasma', charge: 0.8, mass: 0.5, reactivity: 0.9 },
    ASH: { name: 'ash', charge: -0.1, mass: 1.2, reactivity: 0.05 }
  };

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
      this.connections = []; // For flocking behavior
      this.reactionCooldown = 0;
      
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
          break;
        case 'STEAM':
          this.lifespan = 300;
          this.size = p5.random(10, 25);
          this.maxSize = this.size * 3;
          this.growthRate = p5.random(0.05, 0.15);
          this.turbulence = p5.random(0.05, 0.15);
          this.vel.y = p5.random(-1.5, -0.5);
          break;
        case 'PLASMA':
          this.lifespan = 120;
          this.size = p5.random(8, 20);
          this.maxSize = this.size * 1.2;
          this.growthRate = p5.random(0.3, 0.5);
          this.turbulence = p5.random(0.4, 0.6);
          this.vel.y = p5.random(-4, -2);
          break;
        case 'ASH':
          this.lifespan = 400;
          this.size = p5.random(5, 15);
          this.maxSize = this.size * 1.8;
          this.growthRate = p5.random(0.02, 0.08);
          this.turbulence = p5.random(0.02, 0.08);
          this.vel.y = p5.random(-0.5, 0.5);
          break;
        default: // SMOKE
          this.lifespan = 255;
          this.size = p5.random(20, 40);
          this.maxSize = this.size * 2;
          this.growthRate = p5.random(0.1, 0.3);
          this.turbulence = p5.random(0.1, 0.3);
          this.vel.y = p5.random(-2, -1);
          break;
      }
    }

    update(p5) {
      // Only find connections every few frames for performance
      if (p5.frameCount % 3 === 0) {
        this.findConnections(p5);
      }
      
      // Apply flocking behavior
      this.applyFlocking(p5);
      
      // Apply chemical reactions
      this.applyChemicalReactions(p5);
      
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
      this.vel.limit(5); // Limit maximum velocity
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
          // Chemical reaction based on particle types
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
          // Fire + Steam = Plasma
          particles.push(new Particle(p5, this.pos.x, this.pos.y, 'PLASMA'));
          this.lifespan *= 0.5;
          other.lifespan *= 0.5;
          break;
        case 'FIRE_SMOKE':
        case 'SMOKE_FIRE':
          // Fire + Smoke = Ash
          particles.push(new Particle(p5, this.pos.x, this.pos.y, 'ASH'));
          break;
        case 'PLASMA_PLASMA':
          // Plasma + Plasma = Explosion (limited)
          const explosionCount = Math.min(3, MAX_PARTICLES - particles.length);
          for (let i = 0; i < explosionCount; i++) {
            particles.push(new Particle(p5, this.pos.x + p5.random(-20, 20), this.pos.y + p5.random(-20, 20), 'FIRE'));
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
          if (p5.random() < 0.01 && particles.length < MAX_PARTICLES) {
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
          // Plasma creates electric arcs
          this.temperature = p5.noise(this.noiseOffset + 1000) * 0.8 + 0.2;
          if (p5.random() < 0.05) {
            this.vel.add(p5.random(-1, 1), p5.random(-1, 1));
          }
          break;
        case 'ASH':
          // Ash particles are affected by gravity
          this.vel.y += 0.05;
          break;
        default: // SMOKE
          this.turbulence *= (1 + temperature * 0.3);
          break;
      }
    }

    show(p5) {
      p5.noStroke();
      const alpha = p5.map(this.lifespan, 0, 255, 0, 0.4);
      
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
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase);
        p5.rect(-this.size/2, -this.size/2, this.size, this.size);
        p5.pop();
      } else if (this.typeKey === 'PLASMA') {
        // Plasma particles are more energetic
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 2);
        p5.triangle(-this.size/2, this.size/2, this.size/2, this.size/2, 0, -this.size/2);
        p5.pop();
      } else if (this.typeKey === 'ASH') {
        // Ash particles are irregular
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.5);
        p5.ellipse(0, 0, this.size, this.size * 0.6);
        p5.pop();
      } else {
        p5.circle(this.pos.x, this.pos.y, this.size);
      }
      
      // Draw connections for flocking visualization (only every few frames)
      if (this.connections.length > 0 && p5.frameCount % 4 === 0) {
        p5.stroke(r, g, b, alpha * 0.2);
        p5.strokeWeight(1);
        for (let connection of this.connections) {
          if (connection.distance < 50) {
            p5.line(this.pos.x, this.pos.y, connection.particle.pos.x, connection.particle.pos.y);
          }
        }
        p5.noStroke();
      }
    }

    isDead() {
      return this.lifespan <= 0;
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
      
      p5.colorMode(p5.RGB, 255, 255, 255, 1);
      p5.background(0);
    };

    p5.draw = () => {
      time += 0.01;
      
      // Update environmental conditions
      updateEnvironment(p5);
      
      // Fade background
      p5.fill(0, 0, 0, 0.1);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);

      // Starter smoke at bottom center (reduced rate)
      if (starterSmokeActive && particles.length < MAX_PARTICLES * 0.8) {
        const centerX = p5.width / 2;
        const centerY = p5.height - 50;
        
        const randomX = centerX + p5.random(-20, 20);
        const randomY = centerY + p5.random(-10, 10);
        
        // Create different particle types based on conditions (reduced count)
        const particleCount = p5.floor(p5.random(1, 3));
        for (let i = 0; i < particleCount && particles.length < MAX_PARTICLES; i++) {
          let particleType = 'SMOKE';
          
          // High temperature can create fire
          if (temperature > 0.8 && p5.random() < 0.3) {
            particleType = 'FIRE';
          }
          // High humidity can create steam
          else if (humidity > 0.6 && p5.random() < 0.2) {
            particleType = 'STEAM';
          }
          // Very high temperature can create plasma
          else if (temperature > 0.9 && p5.random() < 0.1) {
            particleType = 'PLASMA';
          }
          
          particles.push(new Particle(p5, randomX, randomY, particleType));
        }
      }

      // Add new particles when mouse is pressed (reduced rate)
      if (isMousePressed && particles.length < MAX_PARTICLES) {
        const mouseParticleCount = p5.floor(p5.random(1, 3));
        for (let i = 0; i < mouseParticleCount && particles.length < MAX_PARTICLES; i++) {
          let particleType = 'SMOKE';
          
          // Mouse position affects particle type
          if (mouseY < p5.height * 0.3 && temperature > 0.7) {
            particleType = 'FIRE';
          } else if (mouseY > p5.height * 0.7 && humidity > 0.5) {
            particleType = 'STEAM';
          } else if (mouseY < p5.height * 0.2 && temperature > 0.85) {
            particleType = 'PLASMA';
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
      // Temperature varies over time
      temperature = p5.noise(time * 0.5) * 0.3 + 0.5;
      
      // Humidity varies over time
      humidity = p5.noise(time * 0.3 + 1000) * 0.4 + 0.3;
      
      // Wind varies over time
      windX = p5.noise(time * 0.8 + 2000) * 2 - 1;
      windY = p5.noise(time * 0.8 + 3000) * 2 - 1;
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

export default SmokeTrailsGen3; 