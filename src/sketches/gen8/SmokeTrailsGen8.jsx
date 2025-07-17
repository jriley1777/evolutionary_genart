import React, { useState } from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const SmokeTrailsGen8 = ({ isFullscreen = false }) => {
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let isMousePressed = false;
  let starterSmokeActive = true;
  let time = 0;
  let quantumField = [];
  let waveFunction = [];
  let measurementActive = false;
  let entanglementPairs = [];
  let superpositionStates = [];
  let quantumPhase = 0; // 0: superposition, 1: measurement, 2: entanglement, 3: collapse
  let uncertainty = 0.5;
  let quantumEnergy = 1.0;
  
  // Performance optimizations
  const MAX_PARTICLES = 250; // Fewer particles for quantum precision
  const CONNECTION_RADIUS = 35; // Smaller radius for quantum interactions
  const MAX_CONNECTIONS = 4; // Limited connections for quantum states
  const WAVE_RESOLUTION = 50; // Wave function resolution

  // Quantum particle types
  const QUANTUM_TYPES = {
    PHOTON: { name: 'photon', charge: 0, mass: 0, spin: 1, wave: 'electromagnetic' },
    ELECTRON: { name: 'electron', charge: -1, mass: 0.511, spin: 0.5, wave: 'matter' },
    QUARK: { name: 'quark', charge: 0.33, mass: 2.3, spin: 0.5, wave: 'strong' },
    NEUTRINO: { name: 'neutrino', charge: 0, mass: 0.000001, spin: 0.5, wave: 'weak' },
    GLUON: { name: 'gluon', charge: 0, mass: 0, spin: 1, wave: 'strong' },
    HIGGS: { name: 'higgs', charge: 0, mass: 125, spin: 0, wave: 'scalar' }
  };

  const sketch = (p5) => {

    class QuantumParticle {
      constructor(p5, x, y, typeKey = 'PHOTON') {
        this.pos = p5.createVector(x, y);
        this.vel = p5.createVector(p5.random(-0.3, 0.3), p5.random(-0.3, 0.3));
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
        
        // Quantum properties
        this.waveFunction = p5.random(0, p5.TWO_PI);
        this.amplitude = p5.random(0.5, 1.0);
        this.frequency = p5.random(0.5, 2.0);
        this.uncertainty = p5.random(0.1, 0.9);
        this.spin = p5.random([-0.5, 0.5, -1, 1]);
        this.charge = 0;
        this.mass = 0;
        this.entangled = false;
        this.entanglementPartner = null;
        this.superposition = true;
        this.measured = false;
        this.quantumState = p5.random(['|0⟩', '|1⟩', '|+⟩', '|-⟩']);
        this.coherence = p5.random(0.5, 1.0);
        this.decoherence = 0;
        this.quantumEnergy = p5.random(0.3, 1.0);
        this.wavePacket = [];
        
        this.setupQuantumType(p5);
        this.initializeWavePacket(p5);
      }

      setupQuantumType(p5) {
        switch (this.typeKey) {
          case 'PHOTON':
            this.lifespan = 200;
            this.size = p5.random(2, 6);
            this.maxSize = this.size * 1.3;
            this.growthRate = p5.random(0.02, 0.06);
            this.turbulence = p5.random(0.03, 0.1);
            this.vel.y = p5.random(-0.8, 0.8);
            this.charge = 0;
            this.mass = 0;
            this.frequency = p5.random(1.0, 3.0);
            break;
          case 'ELECTRON':
            this.lifespan = 250;
            this.size = p5.random(3, 8);
            this.maxSize = this.size * 1.4;
            this.growthRate = p5.random(0.03, 0.08);
            this.turbulence = p5.random(0.02, 0.08);
            this.vel.y = p5.random(-0.6, 0.6);
            this.charge = -1;
            this.mass = 0.511;
            this.frequency = p5.random(0.8, 2.0);
            break;
          case 'QUARK':
            this.lifespan = 300;
            this.size = p5.random(4, 10);
            this.maxSize = this.size * 1.2;
            this.growthRate = p5.random(0.01, 0.05);
            this.turbulence = p5.random(0.01, 0.06);
            this.vel.y = p5.random(-0.4, 0.4);
            this.charge = 0.33;
            this.mass = 2.3;
            this.frequency = p5.random(0.5, 1.5);
            break;
          case 'NEUTRINO':
            this.lifespan = 180;
            this.size = p5.random(1, 4);
            this.maxSize = this.size * 1.5;
            this.growthRate = p5.random(0.04, 0.1);
            this.turbulence = p5.random(0.05, 0.15);
            this.vel.y = p5.random(-1.0, 1.0);
            this.charge = 0;
            this.mass = 0.000001;
            this.frequency = p5.random(2.0, 4.0);
            break;
          case 'GLUON':
            this.lifespan = 220;
            this.size = p5.random(2, 7);
            this.maxSize = this.size * 1.3;
            this.growthRate = p5.random(0.02, 0.07);
            this.turbulence = p5.random(0.03, 0.12);
            this.vel.y = p5.random(-0.7, 0.7);
            this.charge = 0;
            this.mass = 0;
            this.frequency = p5.random(1.5, 2.5);
            break;
          case 'HIGGS':
            this.lifespan = 350;
            this.size = p5.random(5, 12);
            this.maxSize = this.size * 1.1;
            this.growthRate = p5.random(0.005, 0.03);
            this.turbulence = p5.random(0.005, 0.04);
            this.vel.y = p5.random(-0.3, 0.3);
            this.charge = 0;
            this.mass = 125;
            this.frequency = p5.random(0.3, 1.0);
            break;
          default: // PHOTON
            this.lifespan = 200;
            this.size = p5.random(2, 6);
            this.maxSize = this.size * 1.3;
            this.growthRate = p5.random(0.02, 0.06);
            this.turbulence = p5.random(0.03, 0.1);
            this.vel.y = p5.random(-0.8, 0.8);
            this.charge = 0;
            this.mass = 0;
            this.frequency = p5.random(1.0, 3.0);
            break;
        }
      }

      initializeWavePacket(p5) {
        this.wavePacket = [];
        for (let i = 0; i < WAVE_RESOLUTION; i++) {
          this.wavePacket.push({
            x: this.pos.x + p5.random(-20, 20),
            y: this.pos.y + p5.random(-20, 20),
            amplitude: this.amplitude * p5.random(0.5, 1.0),
            phase: p5.random(0, p5.TWO_PI)
          });
        }
      }

      update(p5) {
        // Update quantum behavior
        this.updateQuantumBehavior(p5);
        
        // Only find connections every few frames for performance
        if (p5.frameCount % 6 === 0) {
          this.findConnections(p5);
        }
        
        // Apply quantum field effects
        this.applyQuantumFieldEffects(p5);
        
        // Update wave function
        this.updateWaveFunction(p5);
        
        // Add quantum uncertainty
        const uncertaintyX = p5.noise(this.noiseOffset) * 2 - 1;
        const uncertaintyY = p5.noise(this.noiseOffset + 1000) * 2 - 1;
        this.acc.add(uncertaintyX * this.uncertainty * 0.1, uncertaintyY * this.uncertainty * 0.1);
        
        // Add quantum tunneling effect
        if (p5.random() < 0.001) {
          this.quantumTunnel(p5);
        }
        
        // Type-specific quantum behavior
        this.updateQuantumTypeBehavior(p5);
        
        // Update velocity and position with quantum constraints
        this.vel.add(this.acc);
        this.vel.limit(1.5); // Lower limit for quantum precision
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
        this.noiseOffset += 0.02;
        
        // Update phase for animation
        this.phase += 0.15;
        
        // Update cooldowns
        if (this.reactionCooldown > 0) {
          this.reactionCooldown--;
        }
        
        // Update decoherence
        this.decoherence += 0.001;
        this.coherence = p5.max(0, 1 - this.decoherence);
      }

      updateQuantumBehavior(p5) {
        // Wave function evolution
        this.waveFunction += this.frequency * 0.1;
        
        // Superposition state changes
        if (p5.random() < 0.005) {
          this.quantumState = p5.random(['|0⟩', '|1⟩', '|+⟩', '|-⟩']);
        }
        
        // Entanglement effects
        if (measurementActive && p5.random() < 0.01) {
          this.measure(p5);
        }
        
        // Quantum energy fluctuations
        this.quantumEnergy += p5.random(-0.01, 0.01);
        this.quantumEnergy = p5.constrain(this.quantumEnergy, 0.1, 1.0);
      }

      applyEntanglementEffects(p5) {
        if (this.entanglementPartner && this.entanglementPartner.lifespan > 0) {
          // Synchronize quantum states
          const distance = p5.dist(this.pos.x, this.pos.y, 
                                  this.entanglementPartner.pos.x, this.entanglementPartner.pos.y);
          if (distance < 100) {
            // Entanglement correlation
            this.vel.add(p5.createVector(
              (this.entanglementPartner.pos.x - this.pos.x) * 0.001,
              (this.entanglementPartner.pos.y - this.pos.y) * 0.001
            ));
          }
        }
      }

      applyQuantumFieldEffects(p5) {
        // Interact with quantum field
        for (let field of quantumField) {
          const distance = p5.dist(this.pos.x, this.pos.y, field.x, field.y);
          if (distance < 50) {
            const force = (50 - distance) / 50;
            this.acc.add(
              (field.x - this.pos.x) * force * 0.001,
              (field.y - this.pos.y) * force * 0.001
            );
          }
        }
      }

      updateWaveFunction(p5) {
        // Update wave packet positions
        for (let i = 0; i < this.wavePacket.length; i++) {
          this.wavePacket[i].x += p5.random(-0.5, 0.5);
          this.wavePacket[i].y += p5.random(-0.5, 0.5);
          this.wavePacket[i].phase += this.frequency * 0.1;
        }
      }

      quantumTunnel(p5) {
        // Quantum tunneling effect
        const tunnelDistance = p5.random(20, 50);
        const tunnelAngle = p5.random(0, p5.TWO_PI);
        this.pos.x += p5.cos(tunnelAngle) * tunnelDistance;
        this.pos.y += p5.sin(tunnelAngle) * tunnelDistance;
      }

      measure(p5) {
        // Quantum measurement collapses superposition
        if (this.superposition) {
          this.superposition = false;
          this.measured = true;
          this.quantumState = p5.random() < 0.5 ? '|0⟩' : '|1⟩';
          this.coherence = 0.3; // Decoherence after measurement
        }
      }

      findConnections(p5) {
        this.connections = [];
        let connectionCount = 0;
        
        for (let particle of particles) {
          if (particle !== this && connectionCount < MAX_CONNECTIONS) {
            const distance = p5.dist(this.pos.x, this.pos.y, particle.pos.x, particle.pos.y);
            if (distance < CONNECTION_RADIUS) {
              // Check for quantum entanglement
              if (p5.random() < 0.01 && !this.entangled && !particle.entangled) {
                this.entangle(particle);
              }
              
              this.connections.push({ particle, distance });
              connectionCount++;
            }
          }
        }
        
        // Sort by distance and keep only closest connections
        this.connections.sort((a, b) => a.distance - b.distance);
        this.connections = this.connections.slice(0, MAX_CONNECTIONS);
      }

      entangle(partner) {
        this.entangled = true;
        this.entanglementPartner = partner;
        partner.entangled = true;
        partner.entanglementPartner = this;
        entanglementPairs.push({ particle1: this, particle2: partner });
      }

      updateQuantumTypeBehavior(p5) {
        switch (this.typeKey) {
          case 'PHOTON':
            // Photons travel at light speed (simplified)
            this.vel.limit(2.0);
            if (p5.random() < 0.002) {
              particles.push(new QuantumParticle(p5, this.pos.x, this.pos.y, 'ELECTRON'));
            }
            break;
          case 'ELECTRON':
            // Electrons can emit photons
            if (p5.random() < 0.001) {
              particles.push(new QuantumParticle(p5, this.pos.x, this.pos.y, 'PHOTON'));
            }
            break;
          case 'QUARK':
            // Quarks are confined
            this.vel.limit(0.8);
            break;
          case 'NEUTRINO':
            // Neutrinos rarely interact
            this.vel.limit(1.5);
            if (p5.random() < 0.0001) {
              particles.push(new QuantumParticle(p5, this.pos.x, this.pos.y, 'ELECTRON'));
            }
            break;
          case 'GLUON':
            // Gluons mediate strong force
            if (p5.random() < 0.003) {
              particles.push(new QuantumParticle(p5, this.pos.x, this.pos.y, 'QUARK'));
            }
            break;
          case 'HIGGS':
            // Higgs gives mass
            this.vel.limit(0.5);
            if (p5.random() < 0.001) {
              particles.push(new QuantumParticle(p5, this.pos.x, this.pos.y, 'ELECTRON'));
            }
            break;
          default: // PHOTON
            this.vel.limit(2.0);
            break;
        }
      }

      show(p5) {
        p5.noStroke();
        
        const alpha = p5.map(this.lifespan, 0, 255, 0, 0.9);
        const energyAlpha = p5.map(this.quantumEnergy, 0, 1, 0.4, 1.0);
        const coherenceAlpha = p5.map(this.coherence, 0, 1, 0.3, 1.0);
        
        let r, g, b;
        
        switch (this.typeKey) {
          case 'PHOTON':
            // Photon colors - bright whites and yellows
            const photonIntensity = p5.map(this.quantumEnergy, 0, 1, 0.6, 1.0);
            r = p5.lerp(200, 255, photonIntensity);
            g = p5.lerp(200, 255, photonIntensity);
            b = p5.lerp(150, 255, photonIntensity);
            break;
          case 'ELECTRON':
            // Electron colors - blues and cyans
            const electronCharge = p5.map(this.charge, -1, 1, 0.5, 1.0);
            r = p5.lerp(50, 150, electronCharge);
            g = p5.lerp(150, 255, electronCharge);
            b = p5.lerp(200, 255, electronCharge);
            break;
          case 'QUARK':
            // Quark colors - reds and magentas
            const quarkCharge = p5.map(this.charge, 0, 1, 0.4, 1.0);
            r = p5.lerp(150, 255, quarkCharge);
            g = p5.lerp(50, 150, quarkCharge);
            b = p5.lerp(100, 200, quarkCharge);
            break;
          case 'NEUTRINO':
            // Neutrino colors - purples and violets
            const neutrinoEnergy = p5.map(this.quantumEnergy, 0, 1, 0.3, 1.0);
            r = p5.lerp(100, 200, neutrinoEnergy);
            g = p5.lerp(50, 150, neutrinoEnergy);
            b = p5.lerp(150, 255, neutrinoEnergy);
            break;
          case 'GLUON':
            // Gluon colors - oranges and reds
            const gluonStrength = p5.map(this.quantumEnergy, 0, 1, 0.5, 1.0);
            r = p5.lerp(200, 255, gluonStrength);
            g = p5.lerp(100, 200, gluonStrength);
            b = p5.lerp(50, 150, gluonStrength);
            break;
          case 'HIGGS':
            // Higgs colors - golds and yellows
            const higgsMass = p5.map(this.mass, 0, 125, 0.4, 1.0);
            r = p5.lerp(200, 255, higgsMass);
            g = p5.lerp(150, 255, higgsMass);
            b = p5.lerp(50, 150, higgsMass);
            break;
          default: // PHOTON
            r = 255;
            g = 255;
            b = 255;
            break;
        }
        
        // Draw wave packet (quantum uncertainty)
        if (this.superposition && this.coherence > 0.5) {
          p5.fill(r, g, b, alpha * energyAlpha * coherenceAlpha * 0.1);
          for (let wave of this.wavePacket) {
            const waveSize = this.size * 0.5 * wave.amplitude;
            p5.circle(wave.x, wave.y, waveSize);
          }
        }
        
        // Draw main particle
        p5.fill(r, g, b, alpha * energyAlpha * coherenceAlpha);
        
        // Different shapes for different quantum particles
        if (this.typeKey === 'PHOTON') {
          // Photon - wave-like
          p5.push();
          p5.translate(this.pos.x, this.pos.y);
          p5.rotate(this.phase * 2);
          p5.ellipse(0, 0, this.size, this.size * 0.3);
          p5.pop();
        } else if (this.typeKey === 'ELECTRON') {
          // Electron - spherical
          p5.circle(this.pos.x, this.pos.y, this.size);
          // Draw charge
          if (this.charge < 0) {
            p5.fill(r, g, b, alpha * energyAlpha * 0.5);
            p5.circle(this.pos.x, this.pos.y, this.size * 0.6);
          }
        } else if (this.typeKey === 'QUARK') {
          // Quark - triangular
          p5.push();
          p5.translate(this.pos.x, this.pos.y);
          p5.rotate(this.phase);
          p5.triangle(-this.size/2, this.size/2, this.size/2, this.size/2, 0, -this.size/2);
          p5.pop();
        } else if (this.typeKey === 'NEUTRINO') {
          // Neutrino - small and fast
          p5.circle(this.pos.x, this.pos.y, this.size * 0.8);
        } else if (this.typeKey === 'GLUON') {
          // Gluon - connecting lines
          p5.push();
          p5.translate(this.pos.x, this.pos.y);
          p5.rotate(this.phase * 1.5);
          p5.line(-this.size/2, 0, this.size/2, 0);
          p5.pop();
        } else if (this.typeKey === 'HIGGS') {
          // Higgs - massive and slow
          p5.circle(this.pos.x, this.pos.y, this.size);
          p5.fill(r, g, b, alpha * energyAlpha * 0.3);
          p5.circle(this.pos.x, this.pos.y, this.size * 1.5);
        } else {
          // Default quantum particle
          p5.circle(this.pos.x, this.pos.y, this.size);
        }
        
        // Draw quantum state indicator
        if (this.measured) {
          p5.fill(255, 255, 255, alpha * 0.8);
          p5.textSize(8);
          p5.textAlign(p5.CENTER, p5.CENTER);
          p5.text(this.quantumState, this.pos.x, this.pos.y - this.size - 5);
        }
        
        // Draw entanglement connections
        if (this.entangled && this.entanglementPartner && this.entanglementPartner.lifespan > 0) {
          p5.stroke(r, g, b, alpha * energyAlpha * 0.3);
          p5.strokeWeight(0.5);
          p5.line(this.pos.x, this.pos.y, 
                  this.entanglementPartner.pos.x, this.entanglementPartner.pos.y);
          p5.noStroke();
        }
        
        // Draw quantum connections (only every few frames)
        if (this.connections.length > 0 && p5.frameCount % 12 === 0) {
          p5.stroke(r, g, b, alpha * energyAlpha * 0.1);
          p5.strokeWeight(0.2);
          for (let connection of this.connections) {
            if (connection.distance < 25) {
              const other = connection.particle;
              p5.line(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
            }
          }
          p5.noStroke();
        }
      }

      isDead() {
        return this.lifespan <= 0 || this.quantumEnergy <= 0;
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
      p5.background(5, 10, 15); // Deep space background
      
      // Initialize quantum field
      createQuantumField(p5);
    };

    const createQuantumField = (p5) => {
      quantumField = [];
      for (let i = 0; i < 100; i++) {
        quantumField.push({
          x: p5.random(p5.width),
          y: p5.random(p5.height),
          strength: p5.random(0.1, 0.5),
          type: p5.random(['electromagnetic', 'strong', 'weak', 'gravitational'])
        });
      }
    };

    p5.draw = () => {
      // Update quantum phase
      updateQuantumPhase(p5);
      
      // Draw quantum field background
      p5.fill(15, 20, 25, 0.05);
      for (let field of quantumField) {
        p5.circle(field.x, field.y, field.strength * 10);
      }
      
      // Update quantum environment
      updateQuantumEnvironment(p5);
      
      // Create particles based on quantum phase
      createParticles(p5);
      
      // Update and display particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(p5);
        particles[i].show(p5);
        
        if (particles[i].isDead()) {
          // Remove entanglement if partner exists
          if (particles[i].entanglementPartner) {
            particles[i].entanglementPartner.entangled = false;
            particles[i].entanglementPartner.entanglementPartner = null;
          }
          particles.splice(i, 1);
        }
      }
      
      // Draw UI elements
      drawUI(p5);
    };

    const updateQuantumPhase = (p5) => {
      // Cycle through quantum phases every 10 seconds
      const phaseTime = Math.floor(p5.frameCount / 600);
      quantumPhase = phaseTime % 4;
      
      // Update quantum parameters based on phase
      switch (quantumPhase) {
        case 0: // Superposition
          uncertainty = 0.8;
          measurementActive = false;
          break;
        case 1: // Measurement
          uncertainty = 0.3;
          measurementActive = true;
          break;
        case 2: // Entanglement
          uncertainty = 0.6;
          measurementActive = false;
          break;
        case 3: // Collapse
          uncertainty = 0.1;
          measurementActive = true;
          break;
      }
    };

    const updateQuantumEnvironment = (p5) => {
      // Environmental changes based on time
      time += 0.01;
      quantumEnergy = p5.noise(time) * 0.5 + 0.5;
      
      // Update quantum field
      for (let field of quantumField) {
        field.x += p5.noise(time + field.x) * 0.5 - 0.25;
        field.y += p5.noise(time + field.y) * 0.5 - 0.25;
        field.strength = p5.noise(time + field.x + field.y) * 0.5 + 0.1;
      }
    };

    const createParticles = (p5) => {
      // Starter particles
      if (starterSmokeActive && particles.length < MAX_PARTICLES) {
        if (p5.random() < 0.12) {
          const type = getQuantumParticleType(p5);
          particles.push(new QuantumParticle(p5, p5.width / 2, p5.height, type));
        }
      }
      
      // Mouse interaction
      if (isMousePressed && particles.length < MAX_PARTICLES) {
        if (p5.random() < 0.3) {
          const type = getQuantumParticleType(p5);
          particles.push(new QuantumParticle(p5, mouseX, mouseY, type));
        }
      }
    };

    const getQuantumParticleType = (p5) => {
      const rand = p5.random();
      
      switch (quantumPhase) {
        case 0: // Superposition - mostly photons and electrons
          if (rand < 0.4) return 'PHOTON';
          if (rand < 0.7) return 'ELECTRON';
          if (rand < 0.85) return 'NEUTRINO';
          if (rand < 0.95) return 'GLUON';
          return 'QUARK';
        case 1: // Measurement - diverse particles
          if (rand < 0.25) return 'PHOTON';
          if (rand < 0.45) return 'ELECTRON';
          if (rand < 0.6) return 'QUARK';
          if (rand < 0.75) return 'NEUTRINO';
          if (rand < 0.9) return 'GLUON';
          return 'HIGGS';
        case 2: // Entanglement - particles that can entangle
          if (rand < 0.3) return 'PHOTON';
          if (rand < 0.55) return 'ELECTRON';
          if (rand < 0.75) return 'NEUTRINO';
          if (rand < 0.9) return 'GLUON';
          return 'QUARK';
        case 3: // Collapse - massive particles
          if (rand < 0.2) return 'HIGGS';
          if (rand < 0.4) return 'QUARK';
          if (rand < 0.6) return 'ELECTRON';
          if (rand < 0.8) return 'GLUON';
          if (rand < 0.9) return 'PHOTON';
          return 'NEUTRINO';
        default:
          return 'PHOTON';
      }
    };

    const drawUI = (p5) => {
      // Draw quantum info
      p5.push();
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textSize(14);
      p5.fill(255, 255, 255, 0.9);
      
      const phaseNames = ['Superposition', 'Measurement', 'Entanglement', 'Collapse'];
      p5.text(`Quantum Field: ${phaseNames[quantumPhase]}`, 20, 20);
      p5.text(`Particles: ${particles.length}/${MAX_PARTICLES}`, 20, 40);
      p5.text(`Uncertainty: ${(uncertainty * 100).toFixed(0)}%`, 20, 60);
      p5.text(`Entangled Pairs: ${entanglementPairs.length}`, 20, 80);
      
      // Particle type breakdown
      const populations = {};
      for (let particle of particles) {
        populations[particle.typeKey] = (populations[particle.typeKey] || 0) + 1;
      }
      
      let yPos = 105;
      for (let type in populations) {
        p5.text(`${type}: ${populations[type]}`, 20, yPos);
        yPos += 15;
      }
      
      // Quantum state info
      let measuredCount = 0;
      let superpositionCount = 0;
      for (let particle of particles) {
        if (particle.measured) measuredCount++;
        if (particle.superposition) superpositionCount++;
      }
      
      p5.text(`Measured: ${measuredCount}`, 20, yPos + 10);
      p5.text(`Superposition: ${superpositionCount}`, 20, yPos + 25);
      
      p5.pop();
    };

    p5.mousePressed = () => {
      isMousePressed = true;
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    };

    p5.mouseReleased = () => {
      isMousePressed = false;
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      createQuantumField(p5);
    };
  };

  return (
    <ReactP5Wrapper sketch={sketch}/>
  );
};

export default SmokeTrailsGen8; 