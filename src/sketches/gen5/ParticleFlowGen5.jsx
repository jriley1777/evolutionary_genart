import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const ParticleFlowGen5 = ({ isFullscreen = false }) => {
  let particles = [];
  let flowField = [];
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;
  let layers = [];
  let layerCount = 5;

  class LayeredParticle {
    constructor(p5, layerIndex) {
      this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.vel = p5.createVector(0, 0);
      this.acc = p5.createVector(0, 0);
      this.maxSpeed = p5.random(1, 4);
      this.prevPos = this.pos.copy();
      this.life = 1.0;
      this.age = 0;
      this.maxAge = p5.random(200, 400);
      this.evolutionStage = 0;
      this.temperature = p5.random(0, 1);
      this.noiseOffset = p5.random(1000);
      this.layerIndex = layerIndex;
      this.layerOpacity = 1.0 - (layerIndex / layerCount);
      this.lineCount = p5.random(3, 8);
      this.lineLength = p5.random(5, 15);
      this.rotation = p5.random(p5.TWO_PI);
      this.rotationSpeed = p5.random(-0.05, 0.05);
      
      // Evolution parameters
      this.originalMaxSpeed = this.maxSpeed;
      this.originalSize = p5.random(0.5, 2);
      this.size = this.originalSize;
    }

    update(p5) {
      this.age++;
      this.life = 1.0 - (this.age / this.maxAge);
      
      // Evolution stages
      if (this.age < this.maxAge * 0.3) {
        this.evolutionStage = 0; // Young - growing
        this.size = this.originalSize + (this.age / (this.maxAge * 0.3)) * 1;
      } else if (this.age < this.maxAge * 0.7) {
        this.evolutionStage = 1; // Mature - stable
        this.size = this.originalSize + 1;
      } else {
        this.evolutionStage = 2; // Old - shrinking
        this.size = this.originalSize + 1 - ((this.age - this.maxAge * 0.7) / (this.maxAge * 0.3)) * 1;
      }

      // Update temperature based on velocity
      const speed = this.vel.mag();
      this.temperature = p5.constrain(
        this.temperature + (speed * 0.01),
        0, 1
      );

      // Apply flow field forces
      this.applyFlowField(p5);

      // Update physics
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);

      // Update rotation
      this.rotation += this.rotationSpeed;

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
      // Calculate color based on temperature and evolution stage
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

      // Draw multiple small lines with opacity layering
      p5.push();
      p5.translate(this.pos.x, this.pos.y);
      p5.rotate(this.rotation);
      
      for (let i = 0; i < this.lineCount; i++) {
        const angle = (i / this.lineCount) * p5.TWO_PI;
        const opacity = this.layerOpacity * this.life * (1 - i / this.lineCount);
        
        p5.stroke(hue, saturation, brightness, opacity * 255);
        p5.strokeWeight(this.size);
        
        const startX = p5.cos(angle) * 2;
        const startY = p5.sin(angle) * 2;
        const endX = p5.cos(angle) * this.lineLength;
        const endY = p5.sin(angle) * this.lineLength;
        
        p5.line(startX, startY, endX, endY);
      }
      
      p5.pop();
    }

    isDead() {
      return this.life <= 0;
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
    
    // Initialize layered particles
    initializeLayeredParticles(p5);
  };

  const initializeLayeredParticles = (p5) => {
    particles = [];
    const particleCount = p5.floor((p5.width * p5.height) / 1000);
    
    for (let i = 0; i < particleCount; i++) {
      const layerIndex = p5.floor(p5.random(layerCount));
      particles.push(new LayeredParticle(p5, layerIndex));
    }
  };

  const draw = (p5) => {
    // Fade background with different opacity for each layer
    for (let layer = 0; layer < layerCount; layer++) {
      const layerOpacity = 0.05 - (layer * 0.01);
      p5.fill(0, 0, 0, layerOpacity);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);
    }

    // Update flow field with layer-specific variations
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

    // Update and show particles by layer
    for (let layer = 0; layer < layerCount; layer++) {
      const layerParticles = particles.filter(p => p.layerIndex === layer);
      
      for (let i = layerParticles.length - 1; i >= 0; i--) {
        layerParticles[i].update(p5);
        layerParticles[i].show(p5);
        
        // Remove dead particles and add new ones
        if (layerParticles[i].isDead()) {
          const index = particles.indexOf(layerParticles[i]);
          if (index > -1) {
            particles.splice(index, 1);
            addNewLayeredParticle(p5, layer);
          }
        }
      }
    }

    time += 0.02;
  };

  const addNewLayeredParticle = (p5, layerIndex) => {
    const particle = new LayeredParticle(p5, layerIndex);
    particles.push(particle);
  };

  const mouseMoved = (p5) => {
    mouseX = p5.mouseX;
    mouseY = p5.mouseY;
  };

  return <Sketch setup={setup} draw={draw} mouseMoved={mouseMoved} />;
};

export default ParticleFlowGen5; 