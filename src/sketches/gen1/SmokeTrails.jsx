import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const SmokeTrails = ({ isFullscreen = false }) => {
  let particles = [];
  let mouseX = 0;
  let mouseY = 0;
  let isMousePressed = false;
  let starterSmokeActive = true; // Control for starter smoke

  class Particle {
    constructor(p5, x, y) {
      this.pos = p5.createVector(x, y);
      this.vel = p5.createVector(
        p5.random(-0.5, 0.5),
        p5.random(-2, -1)
      );
      this.acc = p5.createVector(0, 0);
      this.lifespan = 255;
      this.size = p5.random(20, 40);
      this.maxSize = this.size * 2;
      this.growthRate = p5.random(0.1, 0.3);
      this.turbulence = p5.random(0.1, 0.3);
      this.noiseOffset = p5.random(1000);
    }

    update(p5) {
      // Add turbulence using Perlin noise
      const noiseX = p5.noise(this.noiseOffset) * 2 - 1;
      const noiseY = p5.noise(this.noiseOffset + 1000) * 2 - 1;
      this.acc.add(noiseX * this.turbulence, noiseY * this.turbulence);
      
      // Update velocity and position
      this.vel.add(this.acc);
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
    }

    show(p5) {
      p5.noStroke();
      const alpha = p5.map(this.lifespan, 0, 255, 0, 0.3);
      p5.fill(200, 200, 200, alpha);
      p5.circle(this.pos.x, this.pos.y, this.size);
    }

    isDead() {
      return this.lifespan <= 0;
    }
  }

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    
    // Add fullscreen class if in fullscreen mode
    if (isFullscreen) {
      canvas.class('canvas-container fullscreen');
      canvas.elt.classList.add('fullscreen');
    } else {
      canvas.class('canvas-container');
    }
    
    p5.colorMode(p5.RGB, 255, 255, 255, 1);
    p5.background(0);
  };

  const draw = (p5) => {
    // Fade background
    p5.fill(0, 0, 0, 0.1);
    p5.noStroke();
    p5.rect(0, 0, p5.width, p5.height);

    // Starter smoke at bottom center
    if (starterSmokeActive) {
      const centerX = p5.width / 2;
      const centerY = p5.height - 50; // 50px from bottom
      
      // Add some randomness to the starter smoke position
      const randomX = centerX + p5.random(-20, 20);
      const randomY = centerY + p5.random(-10, 10);
      
      // Create 2-3 particles per frame for starter smoke
      for (let i = 0; i < p5.floor(p5.random(2, 4)); i++) {
        particles.push(new Particle(p5, randomX, randomY));
      }
    }

    // Add new particles when mouse is pressed
    if (isMousePressed) {
      for (let i = 0; i < 3; i++) {
        particles.push(new Particle(p5, mouseX, mouseY));
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
  };

  const mousePressed = (p5) => {
    isMousePressed = true;
    // Stop starter smoke when user starts interacting
    starterSmokeActive = false;
  };

  const mouseReleased = (p5) => {
    isMousePressed = false;
  };

  const mouseMoved = (p5) => {
    mouseX = p5.mouseX;
    mouseY = p5.mouseY;
    isMousePressed = true;
    // Stop starter smoke when user starts interacting
    starterSmokeActive = false;
  };

  return (
    <Sketch 
      setup={setup} 
      draw={draw} 
      mousePressed={mousePressed}
      mouseReleased={mouseReleased}
      mouseMoved={mouseMoved}
    />
  );
};

export default SmokeTrails; 