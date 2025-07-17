import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const ParticleFlowGen5 = ({ isFullscreen = false }) => {
  let particles = [];
  let flowField = [];
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;
  let evolutionTimer = 0;
  let mutationRate = 0.001;
  let generation = 0;

  // Visual DNA system - particles inherit and mutate traits
  class VisualDNA {
    constructor(p5, parentDNA = null) {
      if (parentDNA) {
        // Inherit from parent with mutation
        this.shapeType = this.mutateValue(parentDNA.shapeType, ['circle', 'square', 'triangle', 'star', 'cross']);
        this.colorHue = this.mutateRange(parentDNA.colorHue, 0, 360, 20);
        this.size = this.mutateRange(parentDNA.size, 0.5, 8, 0.5);
        this.speed = this.mutateRange(parentDNA.speed, 0.5, 4, 0.3);
        this.lifespan = this.mutateRange(parentDNA.lifespan, 100, 600, 50);
        this.behavior = this.mutateValue(parentDNA.behavior, ['flow', 'swarm', 'orbit', 'pulse', 'spiral']);
        this.specialAbility = this.mutateValue(parentDNA.specialAbility, ['none', 'attract', 'repel', 'multiply', 'transform']);
      } else {
        // Random initial DNA
        this.shapeType = p5.random(['circle', 'square', 'triangle', 'star', 'cross']);
        this.colorHue = p5.random(360);
        this.size = p5.random(0.5, 8);
        this.speed = p5.random(0.5, 4);
        this.lifespan = p5.random(100, 600);
        this.behavior = p5.random(['flow', 'swarm', 'orbit', 'pulse', 'spiral']);
        this.specialAbility = p5.random(['none', 'attract', 'repel', 'multiply', 'transform']);
      }
    }

    mutateValue(value, options) {
      if (Math.random() < mutationRate) {
        return options[Math.floor(Math.random() * options.length)];
      }
      return value;
    }

    mutateRange(value, min, max, range) {
      if (Math.random() < mutationRate) {
        return Math.max(min, Math.min(max, value + (Math.random() - 0.5) * range));
      }
      return value;
    }
  }

  class EvolvingParticle {
    constructor(p5, x, y, parentDNA = null) {
      this.pos = p5.createVector(x || p5.random(p5.width), y || p5.random(p5.height));
      this.vel = p5.createVector(0, 0);
      this.acc = p5.createVector(0, 0);
      this.prevPos = this.pos.copy();
      
      // Visual DNA determines particle traits
      this.dna = new VisualDNA(p5, parentDNA);
      this.maxSpeed = this.dna.speed;
      this.maxAge = this.dna.lifespan;
      
      // Evolution tracking
      this.age = 0;
      this.life = 1.0;
      this.evolutionStage = 0;
      this.generation = generation;
      this.mutationCount = 0;
      this.offspringCount = 0;
      
      // Behavior-specific properties
      this.phase = p5.random(p5.TWO_PI);
      this.orbitRadius = p5.random(20, 100);
      this.pulseFrequency = p5.random(0.02, 0.1);
      this.spiralAngle = 0;
      
      // Special ability cooldowns
      this.abilityCooldown = 0;
      this.attractionRadius = 50;
      this.repulsionRadius = 30;
    }

    update(p5) {
      this.age++;
      this.life = 1.0 - (this.age / this.maxAge);
      
      // Evolution stages
      if (this.age < this.maxAge * 0.3) {
        this.evolutionStage = 0; // Young - learning
      } else if (this.age < this.maxAge * 0.7) {
        this.evolutionStage = 1; // Mature - reproducing
      } else {
        this.evolutionStage = 2; // Old - passing on knowledge
      }

      // Apply behavior-specific movement
      this.applyBehavior(p5);
      
      // Apply flow field forces
      this.applyFlowField(p5);
      
      // Apply special abilities
      this.applySpecialAbility(p5);

      // Update physics
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);

      // Update behavior-specific properties
      this.phase += this.pulseFrequency;
      this.spiralAngle += 0.1;

      // Wrap around edges
      if (this.pos.x > p5.width) this.pos.x = 0;
      if (this.pos.x < 0) this.pos.x = p5.width;
      if (this.pos.y > p5.height) this.pos.y = 0;
      if (this.pos.y < 0) this.pos.y = p5.height;

      // Reduce ability cooldown
      if (this.abilityCooldown > 0) this.abilityCooldown--;

      // Reproduction chance (mature particles)
      if (this.evolutionStage === 1 && this.offspringCount < 3 && Math.random() < 0.001) {
        this.reproduce(p5);
      }
    }

    applyBehavior(p5) {
      switch (this.dna.behavior) {
        case 'flow':
          // Standard flow field behavior
          break;
        case 'swarm':
          // Swarm towards nearby particles
          this.swarmBehavior(p5);
          break;
        case 'orbit':
          // Orbit around a central point
          this.orbitBehavior(p5);
          break;
        case 'pulse':
          // Pulsing movement
          this.pulseBehavior(p5);
          break;
        case 'spiral':
          // Spiral outward movement
          this.spiralBehavior(p5);
          break;
      }
    }

    swarmBehavior(p5) {
      let centerX = 0, centerY = 0, count = 0;
      particles.forEach(other => {
        if (other !== this && p5.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < 100) {
          centerX += other.pos.x;
          centerY += other.pos.y;
          count++;
        }
      });
      if (count > 0) {
        centerX /= count;
        centerY /= count;
        const desired = p5.createVector(centerX - this.pos.x, centerY - this.pos.y);
        desired.normalize();
        desired.mult(0.5);
        this.acc.add(desired);
      }
    }

    orbitBehavior(p5) {
      const center = p5.createVector(p5.width / 2, p5.height / 2);
      const toCenter = p5.createVector(center.x - this.pos.x, center.y - this.pos.y);
      const distance = toCenter.mag();
      const desiredDistance = this.orbitRadius;
      
      if (Math.abs(distance - desiredDistance) > 10) {
        toCenter.normalize();
        toCenter.mult(distance > desiredDistance ? 0.5 : -0.5);
        this.acc.add(toCenter);
      }
      
      // Add perpendicular force for orbital motion
      const perpendicular = p5.createVector(-toCenter.y, toCenter.x);
      perpendicular.mult(0.3);
      this.acc.add(perpendicular);
    }

    pulseBehavior(p5) {
      const pulse = p5.sin(this.phase) * 2;
      const pulseVector = p5.createVector(p5.cos(this.phase), p5.sin(this.phase));
      pulseVector.mult(pulse);
      this.acc.add(pulseVector);
    }

    spiralBehavior(p5) {
      const spiralRadius = 20 + this.spiralAngle * 0.5;
      const spiralX = p5.cos(this.spiralAngle) * spiralRadius;
      const spiralY = p5.sin(this.spiralAngle) * spiralRadius;
      const spiralVector = p5.createVector(spiralX, spiralY);
      spiralVector.mult(0.1);
      this.acc.add(spiralVector);
    }

    applyFlowField(p5) {
      const x = p5.floor(this.pos.x / 20);
      const y = p5.floor(this.pos.y / 20);
      const index = x + y * p5.floor(p5.width / 20);
      
      if (index >= 0 && index < flowField.length) {
        const force = flowField[index];
        this.acc.add(force);
      }
    }

    applySpecialAbility(p5) {
      if (this.abilityCooldown > 0) return;

      switch (this.dna.specialAbility) {
        case 'attract':
          this.attractNearby(p5);
          break;
        case 'repel':
          this.repelNearby(p5);
          break;
        case 'multiply':
          if (Math.random() < 0.01) this.multiply(p5);
          break;
        case 'transform':
          if (Math.random() < 0.005) this.transform(p5);
          break;
      }
    }

    attractNearby(p5) {
      particles.forEach(other => {
        if (other !== this && p5.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < this.attractionRadius) {
          const force = p5.createVector(this.pos.x - other.pos.x, this.pos.y - other.pos.y);
          force.normalize();
          force.mult(0.2);
          other.acc.add(force);
        }
      });
      this.abilityCooldown = 30;
    }

    repelNearby(p5) {
      particles.forEach(other => {
        if (other !== this && p5.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y) < this.repulsionRadius) {
          const force = p5.createVector(other.pos.x - this.pos.x, other.pos.y - this.pos.y);
          force.normalize();
          force.mult(0.3);
          other.acc.add(force);
        }
      });
      this.abilityCooldown = 20;
    }

    multiply(p5) {
      if (particles.length < 200) {
        const offspring = new EvolvingParticle(p5, this.pos.x, this.pos.y, this.dna);
        offspring.mutationCount = this.mutationCount + 1;
        particles.push(offspring);
        this.offspringCount++;
        this.abilityCooldown = 60;
      }
    }

    transform(p5) {
      // Randomly change one DNA trait
      const traits = ['shapeType', 'colorHue', 'size', 'speed', 'behavior', 'specialAbility'];
      const trait = traits[Math.floor(Math.random() * traits.length)];
      
      switch (trait) {
        case 'shapeType':
          this.dna.shapeType = p5.random(['circle', 'square', 'triangle', 'star', 'cross']);
          break;
        case 'colorHue':
          this.dna.colorHue = p5.random(360);
          break;
        case 'size':
          this.dna.size = p5.random(0.5, 8);
          break;
        case 'speed':
          this.dna.speed = p5.random(0.5, 4);
          this.maxSpeed = this.dna.speed;
          break;
        case 'behavior':
          this.dna.behavior = p5.random(['flow', 'swarm', 'orbit', 'pulse', 'spiral']);
          break;
        case 'specialAbility':
          this.dna.specialAbility = p5.random(['none', 'attract', 'repel', 'multiply', 'transform']);
          break;
      }
      this.abilityCooldown = 120;
    }

    reproduce(p5) {
      if (particles.length < 200) {
        const offspring = new EvolvingParticle(p5, this.pos.x, this.pos.y, this.dna);
        particles.push(offspring);
        this.offspringCount++;
      }
    }

    show(p5) {
      // Calculate color based on DNA and evolution stage
      let hue = this.dna.colorHue;
      let saturation = 80;
      let brightness = 90;
      
      // Evolution stage affects color
      if (this.evolutionStage === 0) {
        // Young - brighter
        brightness = 95;
      } else if (this.evolutionStage === 1) {
        // Mature - saturated
        saturation = 90;
      } else {
        // Old - darker
        brightness = 70;
      }

      // Special abilities add visual effects
      if (this.dna.specialAbility !== 'none') {
        saturation = Math.min(100, saturation + 10);
        brightness = Math.min(100, brightness + 5);
      }

      p5.push();
      p5.translate(this.pos.x, this.pos.y);
      
      // Draw shape based on DNA
      p5.fill(hue, saturation, brightness, this.life * 255);
      p5.noStroke();
      
      switch (this.dna.shapeType) {
        case 'circle':
          p5.circle(0, 0, this.dna.size * 2);
          break;
        case 'square':
          p5.rect(-this.dna.size, -this.dna.size, this.dna.size * 2, this.dna.size * 2);
          break;
        case 'triangle':
          p5.triangle(-this.dna.size, this.dna.size, this.dna.size, this.dna.size, 0, -this.dna.size);
          break;
        case 'star':
          this.drawStar(p5, 0, 0, this.dna.size, this.dna.size * 0.5, 5);
          break;
        case 'cross':
          p5.rect(-this.dna.size * 0.3, -this.dna.size, this.dna.size * 0.6, this.dna.size * 2);
          p5.rect(-this.dna.size, -this.dna.size * 0.3, this.dna.size * 2, this.dna.size * 0.6);
          break;
      }
      
      // Draw evolution indicator
      if (this.evolutionStage === 1) {
        p5.fill(hue, saturation, brightness + 10, this.life * 100);
        p5.circle(0, 0, this.dna.size * 3);
      }
      
      p5.pop();
    }

    drawStar(p5, x, y, outerRadius, innerRadius, points) {
      p5.beginShape();
      for (let i = 0; i < points * 2; i++) {
        const angle = (i * p5.PI) / points;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const px = x + p5.cos(angle) * radius;
        const py = y + p5.sin(angle) * radius;
        p5.vertex(px, py);
      }
      p5.endShape(p5.CLOSE);
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
      
      initializeEcosystem(p5);
    };

    const initializeEcosystem = (p5) => {
      particles = [];
      const initialCount = 50;
      
      for (let i = 0; i < initialCount; i++) {
        particles.push(new EvolvingParticle(p5));
      }
    };

    p5.draw = () => {
      // Fade background
      p5.fill(0, 0, 0, 0.1);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);

      // Update flow field
      const cols = p5.floor(p5.width / 20);
      const rows = p5.floor(p5.height / 20);
      flowField = new Array(cols * rows);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const index = x + y * cols;
          
          // Multiple noise layers for complex flow
          const angle1 = p5.noise(x * 0.1, y * 0.1, time * 0.01) * p5.TWO_PI * 2;
          const angle2 = p5.noise(x * 0.05, y * 0.05, time * 0.005) * p5.TWO_PI;
          const angle3 = p5.noise(x * 0.02, y * 0.02, time * 0.002) * p5.PI;
          
          // Combine noise layers
          const finalAngle = angle1 * 0.6 + angle2 * 0.3 + angle3 * 0.1;
          
          // Add mouse influence
          const mouseDist = p5.dist(x * 20, y * 20, mouseX, mouseY);
          const mouseInfluence = p5.map(mouseDist, 0, 200, p5.PI, 0, true);
          
          const finalAngleWithInfluence = finalAngle + mouseInfluence;
          
          // Create force vector
          const force = p5.createVector(p5.cos(finalAngleWithInfluence), p5.sin(finalAngleWithInfluence));
          force.mult(0.4);
          flowField[index] = force;
        }
      }

      // Update and show particles
      for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update(p5);
        particles[i].show(p5);
        
        // Remove dead particles
        if (particles[i].isDead()) {
          particles.splice(i, 1);
        }
      }

      // Evolution timer
      evolutionTimer++;
      if (evolutionTimer > 600) { // Every 10 seconds
        evolutionTimer = 0;
        generation++;
        mutationRate = Math.min(0.01, mutationRate + 0.0001); // Increase mutation rate over time
      }

      // Add new particles if population is low
      if (particles.length < 30) {
        for (let i = 0; i < 5; i++) {
          particles.push(new EvolvingParticle(p5));
        }
      }

      time += 0.02;
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    };

    p5.mousePressed = () => {
      // Click to add new particle with random DNA
      particles.push(new EvolvingParticle(p5, p5.mouseX, p5.mouseY));
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(0);
      initializeEcosystem(p5);
    };
  };

  return (
    <ReactP5Wrapper sketch={sketch}/>
  );
};

export default ParticleFlowGen5; 