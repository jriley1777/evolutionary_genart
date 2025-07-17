import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const ParticleFlow = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let particles = [];
    let flowField = [];
    let mouseX = 0;
    let mouseY = 0;

    class Particle {
      constructor(p5) {
        this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
        this.vel = p5.createVector(0, 0);
        this.acc = p5.createVector(0, 0);
        this.maxSpeed = p5.random(2, 4);
        this.prevPos = this.pos.copy();
        this.color = p5.color(
          p5.random(180, 280), // Hue - purple to blue range
          p5.random(70, 90),   // Saturation
          p5.random(80, 100)   // Brightness
        );
      }

      update(p5) {
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);

        // Wrap around edges and update prevPos to prevent lines
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

      follow(p5, flowField) {
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
        p5.stroke(this.color);
        p5.strokeWeight(1);
        p5.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        this.updatePrev();
      }

      updatePrev() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
      }
    }

    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      // Add fullscreen class if in fullscreen mode
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.colorMode(p5.HSB, 360, 100, 100, 1);
      p5.background(0);
      
      // Initialize particles
      const particleCount = p5.floor((p5.width * p5.height) / 100);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(p5));
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
          
          // Calculate angle based on mouse position and noise
          const angle = p5.noise(x * 0.1, y * 0.1, p5.frameCount * 0.01) * p5.TWO_PI * 2;
          
          // Add mouse influence
          const mouseDist = p5.dist(x * 20, y * 20, mouseX, mouseY);
          const mouseInfluence = p5.map(mouseDist, 0, 200, p5.PI, 0, true);
          
          // Combine noise and mouse influence
          const finalAngle = angle + mouseInfluence;
          
          // Create force vector
          const force = p5.createVector(p5.cos(finalAngle), p5.sin(finalAngle));
          force.mult(0.5);
          flowField[index] = force;
        }
      }

      // Update and show particles
      particles.forEach(particle => {
        particle.follow(p5, flowField);
        particle.update(p5);
        particle.show(p5);
      });
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default ParticleFlow; 