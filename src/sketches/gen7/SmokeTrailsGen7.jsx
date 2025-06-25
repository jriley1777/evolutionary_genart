import React, { useState } from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const SmokeTrailsGen7 = ({ isFullscreen = false }) => {
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
  let ecosystemPhase = 0; // 0: birth, 1: growth, 2: competition, 3: evolution
  let digitalEnvironment = [];
  let evolutionTimer = 0;
  let mutationRate = 0.01;
  
  // Performance optimizations
  const MAX_PARTICLES = 300; // More particles for ecosystem simulation
  const CONNECTION_RADIUS = 40; // Smaller radius for small particles
  const MAX_CONNECTIONS = 6; // Limited connections for ecosystem balance
  const PARTICLE_CREATION_RATE = 0.8; // Higher rate for ecosystem growth

  // Particle types inspired by digital life
  const PARTICLE_TYPES = {
    CELL: { name: 'cell', charge: 0.1, mass: 0.8, reactivity: 0.3, life: 'basic' },
    VIRUS: { name: 'virus', charge: -0.2, mass: 0.5, reactivity: 0.7, life: 'parasitic' },
    BACTERIA: { name: 'bacteria', charge: 0.3, mass: 1.0, reactivity: 0.4, life: 'prokaryotic' },
    ALGAE: { name: 'algae', charge: 0.2, mass: 0.9, reactivity: 0.2, life: 'photosynthetic' },
    FUNGUS: { name: 'fungus', charge: -0.1, mass: 1.2, reactivity: 0.1, life: 'decomposer' },
    PROTOZOA: { name: 'protozoa', charge: 0.4, mass: 0.7, reactivity: 0.6, life: 'predator' }
  };

  class Particle {
    constructor(p5, x, y, typeKey = 'CELL') {
      this.pos = p5.createVector(x, y);
      this.vel = p5.createVector(p5.random(-0.5, 0.5), p5.random(-0.5, 0.5));
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
      
      // Digital life properties
      this.dna = p5.random(1000);
      this.energy = p5.random(0.3, 1.0);
      this.age = 0;
      this.generation = 1;
      this.mutationCount = 0;
      this.reproductionCooldown = 0;
      this.divisionRate = p5.random(0.001, 0.01);
      this.metabolism = p5.random(0.5, 1.5);
      this.adaptation = p5.random(0, 1);
      this.survivalInstinct = p5.random(0.3, 0.8);
      
      this.setupType(p5);
    }

    setupType(p5) {
      switch (this.typeKey) {
        case 'VIRUS':
          this.lifespan = 180;
          this.size = p5.random(3, 8);
          this.maxSize = this.size * 1.2;
          this.growthRate = p5.random(0.02, 0.08);
          this.turbulence = p5.random(0.05, 0.15);
          this.vel.y = p5.random(-0.8, 0.8);
          this.divisionRate = p5.random(0.005, 0.02);
          break;
        case 'BACTERIA':
          this.lifespan = 220;
          this.size = p5.random(4, 10);
          this.maxSize = this.size * 1.4;
          this.growthRate = p5.random(0.03, 0.1);
          this.turbulence = p5.random(0.02, 0.12);
          this.vel.y = p5.random(-0.6, 0.6);
          this.divisionRate = p5.random(0.003, 0.015);
          break;
        case 'ALGAE':
          this.lifespan = 280;
          this.size = p5.random(5, 12);
          this.maxSize = this.size * 1.6;
          this.growthRate = p5.random(0.02, 0.09);
          this.turbulence = p5.random(0.01, 0.08);
          this.vel.y = p5.random(-0.5, 0.5);
          this.divisionRate = p5.random(0.002, 0.01);
          break;
        case 'FUNGUS':
          this.lifespan = 320;
          this.size = p5.random(6, 14);
          this.maxSize = this.size * 1.3;
          this.growthRate = p5.random(0.01, 0.06);
          this.turbulence = p5.random(0.005, 0.05);
          this.vel.y = p5.random(-0.4, 0.4);
          this.divisionRate = p5.random(0.001, 0.008);
          break;
        case 'PROTOZOA':
          this.lifespan = 200;
          this.size = p5.random(4, 9);
          this.maxSize = this.size * 1.5;
          this.growthRate = p5.random(0.04, 0.12);
          this.turbulence = p5.random(0.03, 0.15);
          this.vel.y = p5.random(-0.7, 0.7);
          this.divisionRate = p5.random(0.004, 0.018);
          break;
        default: // CELL
          this.lifespan = 250;
          this.size = p5.random(3, 9);
          this.maxSize = this.size * 1.4;
          this.growthRate = p5.random(0.03, 0.1);
          this.turbulence = p5.random(0.02, 0.1);
          this.vel.y = p5.random(-0.6, 0.6);
          this.divisionRate = p5.random(0.002, 0.012);
          break;
      }
    }

    update(p5) {
      // Update digital life behavior
      this.updateDigitalLife(p5);
      
      // Only find connections every few frames for performance
      if (p5.frameCount % 5 === 0) {
        this.findConnections(p5);
      }
      
      // Apply ecosystem behaviors
      this.applyEcosystemBehaviors(p5);
      
      // Add turbulence using Perlin noise
      const noiseX = p5.noise(this.noiseOffset) * 2 - 1;
      const noiseY = p5.noise(this.noiseOffset + 1000) * 2 - 1;
      this.acc.add(noiseX * this.turbulence, noiseY * this.turbulence);
      
      // Add wind effect
      this.acc.add(windX * 0.05, windY * 0.05);
      
      // Type-specific behavior
      this.updateTypeBehavior(p5);
      
      // Update velocity and position
      this.vel.add(this.acc);
      this.vel.limit(2); // Limit maximum velocity for small particles
      this.pos.add(this.vel);
      
      // Reset acceleration
      this.acc.mult(0);
      
      // Grow particle
      if (this.size < this.maxSize) {
        this.size += this.growthRate;
      }
      
      // Decrease lifespan
      this.lifespan -= 1;
      
      // Update age
      this.age += 1;
      
      // Update noise offset
      this.noiseOffset += 0.01;
      
      // Update phase for animation
      this.phase += 0.1;
      
      // Update cooldowns
      if (this.reactionCooldown > 0) {
        this.reactionCooldown--;
      }
      if (this.reproductionCooldown > 0) {
        this.reproductionCooldown--;
      }
    }

    updateDigitalLife(p5) {
      // Energy consumption
      this.energy -= 0.001 * this.metabolism;
      
      // Age affects energy
      this.energy -= this.age * 0.0001;
      
      // Reproduction attempt
      if (this.reproductionCooldown <= 0 && this.energy > 0.5 && particles.length < MAX_PARTICLES) {
        if (p5.random() < this.divisionRate) {
          this.reproduce(p5);
        }
      }
      
      // Mutation
      if (p5.random() < mutationRate) {
        this.mutate(p5);
      }
      
      // Death from low energy
      if (this.energy <= 0) {
        this.lifespan = 0;
      }
    }

    reproduce(p5) {
      const offspring = new Particle(p5, this.pos.x, this.pos.y, this.typeKey);
      offspring.dna = this.dna + p5.random(-10, 10);
      offspring.generation = this.generation + 1;
      offspring.energy = this.energy * 0.8;
      offspring.mutationCount = this.mutationCount;
      offspring.adaptation = this.adaptation + p5.random(-0.1, 0.1);
      offspring.adaptation = p5.constrain(offspring.adaptation, 0, 1);
      
      particles.push(offspring);
      this.reproductionCooldown = 100;
      this.energy *= 0.7;
    }

    mutate(p5) {
      this.mutationCount++;
      this.dna += p5.random(-50, 50);
      this.adaptation += p5.random(-0.2, 0.2);
      this.adaptation = p5.constrain(this.adaptation, 0, 1);
      this.divisionRate *= p5.random(0.8, 1.2);
    }

    applyEcosystemBehaviors(p5) {
      switch (this.typeKey) {
        case 'VIRUS':
          // Viruses seek hosts
          this.vel.add(p5.random(-0.1, 0.1), p5.random(-0.1, 0.1));
          break;
        case 'BACTERIA':
          // Bacteria consume resources
          if (p5.random() < 0.01) {
            this.energy += 0.1;
          }
          break;
        case 'ALGAE':
          // Algae photosynthesize
          if (p5.random() < 0.02) {
            this.energy += 0.05;
          }
          break;
        case 'FUNGUS':
          // Fungi decompose
          this.vel.mult(0.95); // Slow movement
          break;
        case 'PROTOZOA':
          // Protozoa hunt
          this.vel.add(p5.random(-0.2, 0.2), p5.random(-0.2, 0.2));
          break;
        default: // CELL
          // Basic cell behavior
          this.energy += 0.001;
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
        case 'VIRUS':
          // Viruses can infect other particles
          if (p5.random() < 0.005 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'CELL'));
          }
          break;
        case 'BACTERIA':
          // Bacteria can divide rapidly
          this.temperature = p5.noise(this.noiseOffset + 500) * 0.5 + 0.5;
          break;
        case 'ALGAE':
          // Algae can create oxygen
          if (p5.random() < 0.003 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'CELL'));
          }
          break;
        case 'FUNGUS':
          // Fungi can spread spores
          if (p5.random() < 0.002 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'FUNGUS'));
          }
          break;
        case 'PROTOZOA':
          // Protozoa can hunt
          this.temperature = p5.noise(this.noiseOffset + 1000) * 0.8 + 0.2;
          if (p5.random() < 0.01 && particles.length < MAX_PARTICLES) {
            particles.push(new Particle(p5, this.pos.x, this.pos.y, 'CELL'));
          }
          break;
        default: // CELL
          this.turbulence *= (1 + temperature * 0.2);
          break;
      }
    }

    show(p5) {
      p5.noStroke();
      
      const alpha = p5.map(this.lifespan, 0, 255, 0, 0.8);
      const energyAlpha = p5.map(this.energy, 0, 1, 0.3, 1.0);
      
      let r, g, b;
      
      switch (this.typeKey) {
        case 'VIRUS':
          // Viral colors - reds and purples
          const virusIntensity = p5.map(this.energy, 0, 1, 0.5, 1.0);
          r = p5.lerp(150, 255, virusIntensity);
          g = p5.lerp(50, 100, virusIntensity);
          b = p5.lerp(100, 200, virusIntensity);
          break;
        case 'BACTERIA':
          // Bacterial colors - blues and greens
          const bacteriaHealth = p5.map(this.energy, 0, 1, 0.3, 1.0);
          r = p5.lerp(50, 150, bacteriaHealth);
          g = p5.lerp(100, 200, bacteriaHealth);
          b = p5.lerp(150, 255, bacteriaHealth);
          break;
        case 'ALGAE':
          // Algal colors - greens
          const algaeGrowth = p5.map(this.energy, 0, 1, 0.4, 1.0);
          r = p5.lerp(50, 100, algaeGrowth);
          g = p5.lerp(150, 255, algaeGrowth);
          b = p5.lerp(50, 150, algaeGrowth);
          break;
        case 'FUNGUS':
          // Fungal colors - browns and yellows
          const fungusAge = p5.map(this.age, 0, 320, 0.5, 1.0);
          r = p5.lerp(150, 200, fungusAge);
          g = p5.lerp(100, 150, fungusAge);
          b = p5.lerp(50, 100, fungusAge);
          break;
        case 'PROTOZOA':
          // Protozoan colors - purples and pinks
          const protozoaActivity = p5.map(this.energy, 0, 1, 0.4, 1.0);
          r = p5.lerp(150, 255, protozoaActivity);
          g = p5.lerp(100, 200, protozoaActivity);
          b = p5.lerp(200, 255, protozoaActivity);
          break;
        default: // CELL
          // Cell colors - whites and grays
          const cellVitality = p5.map(this.energy, 0, 1, 0.3, 1.0);
          r = p5.lerp(100, 220, cellVitality);
          g = p5.lerp(100, 220, cellVitality);
          b = p5.lerp(100, 220, cellVitality);
          break;
      }
      
      p5.fill(r, g, b, alpha * energyAlpha);
      
      // Different shapes for different life forms
      if (this.typeKey === 'VIRUS') {
        // Viral shapes - small, angular
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 2);
        p5.triangle(-this.size/2, this.size/2, this.size/2, this.size/2, 0, -this.size/2);
        p5.pop();
      } else if (this.typeKey === 'BACTERIA') {
        // Bacterial shapes - rod-like
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase);
        p5.ellipse(0, 0, this.size, this.size * 0.6);
        p5.pop();
      } else if (this.typeKey === 'ALGAE') {
        // Algal shapes - circular with internal structure
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.5);
        p5.circle(0, 0, this.size);
        p5.fill(r, g, b, alpha * energyAlpha * 0.5);
        p5.circle(0, 0, this.size * 0.6);
        p5.pop();
      } else if (this.typeKey === 'FUNGUS') {
        // Fungal shapes - branching
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 0.3);
        p5.rect(-this.size/2, -this.size/2, this.size, this.size * 0.8);
        p5.pop();
      } else if (this.typeKey === 'PROTOZOA') {
        // Protozoan shapes - amoeboid
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase * 1.5);
        p5.ellipse(0, 0, this.size * 1.2, this.size);
        p5.pop();
      } else {
        // Default cell circles
        p5.circle(this.pos.x, this.pos.y, this.size);
      }
      
      // Draw connections for ecosystem visualization (only every few frames)
      if (this.connections.length > 0 && p5.frameCount % 10 === 0) {
        p5.stroke(r, g, b, alpha * energyAlpha * 0.1);
        p5.strokeWeight(0.3);
        for (let connection of this.connections) {
          if (connection.distance < 30) {
            const other = connection.particle;
            p5.line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
          }
        }
        p5.noStroke();
      }
    }

    isDead() {
      return this.lifespan <= 0 || this.energy <= 0;
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
    p5.background(10, 15, 20); // Dark digital environment
    
    // Initialize digital environment
    createDigitalEnvironment(p5);
  };

  const createDigitalEnvironment = (p5) => {
    digitalEnvironment = [];
    for (let i = 0; i < 200; i++) {
      digitalEnvironment.push({
        x: p5.random(p5.width),
        y: p5.random(p5.height),
        size: p5.random(1, 2),
        alpha: p5.random(0.05, 0.15),
        type: p5.random(['data', 'energy', 'matter'])
      });
    }
  };

  const draw = (p5) => {
    // Update ecosystem phase
    updateEcosystemPhase(p5);
    
    // Draw digital environment
    p5.fill(20, 25, 30, 0.1);
    for (let env of digitalEnvironment) {
      p5.circle(env.x, env.y, env.size);
    }
    
    // Update environmental conditions
    updateEnvironment(p5);
    
    // Create particles based on ecosystem phase
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

  const updateEcosystemPhase = (p5) => {
    // Cycle through ecosystem phases every 8 seconds
    const phaseTime = Math.floor(p5.frameCount / 480);
    ecosystemPhase = phaseTime % 4;
    
    // Update mutation rate based on phase
    switch (ecosystemPhase) {
      case 0: // Birth
        mutationRate = 0.005;
        break;
      case 1: // Growth
        mutationRate = 0.01;
        break;
      case 2: // Competition
        mutationRate = 0.02;
        break;
      case 3: // Evolution
        mutationRate = 0.03;
        break;
    }
  };

  const updateEnvironment = (p5) => {
    // Environmental changes based on time
    time += 0.01;
    temperature = p5.noise(time) * 0.5 + 0.5;
    humidity = p5.noise(time + 1000) * 0.5 + 0.3;
    windX = p5.noise(time + 2000) * 0.1 - 0.05;
    windY = p5.noise(time + 3000) * 0.1 - 0.05;
  };

  const createParticles = (p5) => {
    // Starter particles
    if (starterSmokeActive && particles.length < MAX_PARTICLES) {
      if (p5.random() < 0.15) {
        const type = getEcosystemParticleType(p5);
        particles.push(new Particle(p5, p5.width / 2, p5.height, type));
      }
    }
    
    // Mouse interaction
    if (isMousePressed && particles.length < MAX_PARTICLES) {
      if (p5.random() < 0.4) {
        const type = getEcosystemParticleType(p5);
        particles.push(new Particle(p5, mouseX, mouseY, type));
      }
    }
  };

  const getEcosystemParticleType = (p5) => {
    const rand = p5.random();
    
    switch (ecosystemPhase) {
      case 0: // Birth - mostly cells
        if (rand < 0.7) return 'CELL';
        if (rand < 0.85) return 'BACTERIA';
        if (rand < 0.95) return 'ALGAE';
        return 'VIRUS';
      case 1: // Growth - diverse life
        if (rand < 0.3) return 'CELL';
        if (rand < 0.5) return 'BACTERIA';
        if (rand < 0.7) return 'ALGAE';
        if (rand < 0.85) return 'FUNGUS';
        if (rand < 0.95) return 'PROTOZOA';
        return 'VIRUS';
      case 2: // Competition - predators and parasites
        if (rand < 0.2) return 'CELL';
        if (rand < 0.4) return 'BACTERIA';
        if (rand < 0.6) return 'PROTOZOA';
        if (rand < 0.8) return 'VIRUS';
        if (rand < 0.9) return 'FUNGUS';
        return 'ALGAE';
      case 3: // Evolution - all types with high mutation
        if (rand < 0.2) return 'CELL';
        if (rand < 0.35) return 'BACTERIA';
        if (rand < 0.5) return 'PROTOZOA';
        if (rand < 0.65) return 'VIRUS';
        if (rand < 0.8) return 'ALGAE';
        return 'FUNGUS';
      default:
        return 'CELL';
    }
  };

  const drawUI = (p5) => {
    // Draw ecosystem info
    p5.push();
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.textSize(14);
    p5.fill(255, 255, 255, 0.8);
    
    const phaseNames = ['Birth', 'Growth', 'Competition', 'Evolution'];
    p5.text(`Digital Ecosystem: ${phaseNames[ecosystemPhase]}`, 20, 20);
    p5.text(`Particles: ${particles.length}/${MAX_PARTICLES}`, 20, 40);
    p5.text(`Mutation Rate: ${(mutationRate * 100).toFixed(1)}%`, 20, 60);
    
    // Population breakdown
    const populations = {};
    for (let particle of particles) {
      populations[particle.typeKey] = (populations[particle.typeKey] || 0) + 1;
    }
    
    let yPos = 85;
    for (let type in populations) {
      p5.text(`${type}: ${populations[type]}`, 20, yPos);
      yPos += 15;
    }
    
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
    createDigitalEnvironment(p5);
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

export default SmokeTrailsGen7; 