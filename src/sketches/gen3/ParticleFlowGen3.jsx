import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const ParticleFlowGen3 = ({ isFullscreen = false }) => {
  let particles = [];
  let flowField = [];
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;
  let startTime = 0;
  let isRunning = true;
  let connections = [];

  // Fixed parameters
  const particleCount = 150;
  const connectionDistance = 80;
  const lineOpacity = 0.01;
  const evolutionSpeed = 1.0;
  const maxConnections = 3;
  const backgroundFadeOpacity = 0.0;

  class Particle {
    constructor(p5) {
      this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.vel = p5.createVector(0, 0);
      this.acc = p5.createVector(0, 0);
      this.maxSpeed = p5.random(2, 5);
      this.prevPos = this.pos.copy();
      this.life = 1.0;
      this.age = 0;
      this.maxAge = p5.random(400, 600);
      this.evolutionStage = 1;
      this.temperature = p5.random(0, 1);
      this.noiseOffset = p5.random(1000);
      this.connections = [];
      
      // Evolution parameters
      this.originalMaxSpeed = this.maxSpeed;
      this.originalSize = p5.random(1, 3);
      this.size = this.originalSize;
    }

    update(p5) {
      if (!isRunning) return;
      
      this.age++;
      this.life = 1.0 - (this.age / this.maxAge);
      
      // Evolution stages (similar to Gen2)
      if (this.age < this.maxAge * 0.3) {
        this.evolutionStage = 0; // Young - growing
        this.size = this.originalSize + (this.age / (this.maxAge * 0.3)) * 2;
      } else if (this.age < this.maxAge * 0.7) {
        this.evolutionStage = 1; // Mature - stable
        this.size = this.originalSize + 2;
      } else {
        this.evolutionStage = 2; // Old - shrinking
        this.size = this.originalSize + 2 - ((this.age - this.maxAge * 0.7) / (this.maxAge * 0.3)) * 2;
      }

      // Update temperature based on velocity
      const speed = this.vel.mag();
      this.temperature = p5.constrain(
        this.temperature + (speed * 0.01 * evolutionSpeed),
        0, 1
      );

      // Apply flow field forces
      this.applyFlowField(p5);

      // Update physics
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);

      // Update noise offset
      this.noiseOffset += 0.01;

      // Wrap around edges
      if (this.pos.x > p5.width) {
        this.pos.x = 0;
        this.prevPos.x = 0;
      }
      if (this.pos.x < 0) {
        this.pos.x = p5.width;
        this.prevPos.x = p5.width;
      }
      if (this.pos.y > p5.height) {
        this.pos.y = 0;
        this.prevPos.y = 0;
      }
      if (this.pos.y < 0) {
        this.pos.y = p5.height;
        this.prevPos.y = p5.height;
      }
    }

    applyFlowField(p5) {
      const x = p5.floor(this.pos.x / 20);
      const y = p5.floor(this.pos.y / 20);
      const index = x + y * p5.floor(p5.width / 20);
      
      if (index >= 0 && index < flowField.length) {
        const force = flowField[index];
        this.applyForce(force);
      }
    }

    applyForce(force) {
      this.acc.add(force);
    }

    show(p5) {
      // Calculate color based on temperature and evolution stage (Gen2 style)
      let hue, saturation, brightness;
      
      if (this.evolutionStage === 0) {
        // Young - cool blues to greens
        hue = p5.lerp(180, 120, this.temperature);
        saturation = 80;
        brightness = 90;
      } else if (this.evolutionStage === 1) {
        // Mature - warm yellows to oranges
        hue = p5.lerp(60, 30, this.temperature);
        saturation = 90;
        brightness = 95;
      } else {
        // Old - deep reds to purples
        hue = p5.lerp(0, 280, this.temperature);
        saturation = 70;
        brightness = 80;
      }

      // Draw particle trail (Gen2 style) - just the line, no points
      p5.stroke(hue, saturation, brightness, 0.01);
      p5.strokeWeight(p5.random(10,200));
      p5.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
      
      this.updatePrev();
    }

    updatePrev() {
      this.prevPos.x = this.pos.x;
      this.prevPos.y = this.pos.y;
    }

    isDead() {
      return this.life <= 0;
    }

    findConnections(p5) {
      this.connections = [];
      let connectionCount = 0;
      
      particles.forEach(otherParticle => {
        if (otherParticle !== this && connectionCount < maxConnections) {
          const distance = p5.dist(this.pos.x, this.pos.y, otherParticle.pos.x, otherParticle.pos.y);
          
          if (distance < connectionDistance) {
            // Calculate connection strength based on distance and life
            const strength = p5.map(distance, 0, connectionDistance, 1, 0);
            const avgLife = (this.life + otherParticle.life) / 2;
            
            this.connections.push({
              particle: otherParticle,
              strength: strength,
              life: avgLife
            });
            connectionCount++;
          }
        }
      });
      
      // Sort by strength and keep only the strongest connections
      this.connections.sort((a, b) => b.strength - a.strength);
      this.connections = this.connections.slice(0, maxConnections);
    }

    showConnections(p5) {
      this.connections.forEach(connection => {
        const otherParticle = connection.particle;
        const strength = connection.strength;
        const life = connection.life;
        
        // Calculate color for connection (blend of both particles)
        const thisHue = this.getHue(p5);
        const otherHue = otherParticle.getHue(p5);
        const avgHue = (thisHue + otherHue) / 2;
        
        p5.stroke(avgHue, 70, 80, life * 255 * lineOpacity * strength);
        p5.strokeWeight(0.01);
        p5.line(this.pos.x, this.pos.y, otherParticle.pos.x, otherParticle.pos.y);
      });
    }

    getHue(p5) {
      let hue;
      if (this.evolutionStage === 0) {
        hue = p5.lerp(180, 120, this.temperature);
      } else if (this.evolutionStage === 1) {
        hue = p5.lerp(60, 30, this.temperature);
      } else {
        hue = p5.lerp(0, 280, this.temperature);
      }
      return hue;
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
    
    p5.colorMode(p5.HSB, 360, 100, 100, 1);
    p5.background(0);
    
    startTime = p5.millis();
    initializeSystem(p5);
  };

  const initializeSystem = (p5) => {
    particles = [];
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(p5));
    }
  };

  const draw = (p5) => {
    time += 0.01;
    
    // Check if 1 minute has passed
    if (p5.millis() - startTime > 60000) { // 60 seconds
      isRunning = false;
      return;
    }
    
    // Optional background fade based on control
    if (backgroundFadeOpacity > 0) {
      p5.fill(0, 0, 0, backgroundFadeOpacity);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
    }

    // Update flow field with multiple noise layers (Gen2 style)
    const cols = p5.floor(p5.width / 20);
    const rows = p5.floor(p5.height / 20);
    flowField = new Array(cols * rows);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const index = x + y * cols;
        
        // Multiple noise layers for complex flow (Gen2 style)
        const angle1 = p5.noise(x * 0.1, y * 0.1, time * 0.05) * p5.TWO_PI * 2;
        const angle2 = p5.noise(x * 0.05, y * 0.05, time * 0.025) * p5.TWO_PI;
        const angle3 = p5.noise(x * 0.02, y * 0.02, time * 0.01) * p5.PI;
        
        // Combine noise layers
        const finalAngle = angle1 * 0.6 + angle2 * 0.3 + angle3 * 0.1;
        
        // Add mouse influence
        const mouseDist = p5.dist(x * 20, y * 20, mouseX, mouseY);
        const mouseInfluence = p5.map(mouseDist, 0, 200, p5.PI, 0, true);
        
        const finalAngleWithInfluence = finalAngle + mouseInfluence;
        
        // Create force vector
        const force = p5.createVector(p5.cos(finalAngleWithInfluence), p5.sin(finalAngleWithInfluence));
        force.mult(0.5);
        flowField[index] = force;
      }
    }

    // Update and show particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].update(p5);
      
      // Find connections for this particle
      particles[i].findConnections(p5);
      
      // Show connections first (behind particles)
      particles[i].showConnections(p5);
      
      // Show particle
      particles[i].show(p5);
      
      // Remove dead particles and add new ones (only if still running)
      if (particles[i].isDead() && isRunning) {
        particles.splice(i, 1);
        particles.push(new Particle(p5));
      }
    }
  };

  const mouseMoved = (p5) => {
    mouseX = p5.mouseX;
    mouseY = p5.mouseY;
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(0);
    startTime = p5.millis();
    isRunning = true;
    initializeSystem(p5);
  };

  return <Sketch setup={setup} draw={draw} mouseMoved={mouseMoved} windowResized={windowResized} />;
};

export default ParticleFlowGen3; 