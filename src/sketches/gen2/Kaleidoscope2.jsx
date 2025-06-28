import React from "react";
import Sketch from "react-p5";

const Kaleidoscope2 = ({ isFullscreen = false }) => {
  // Kaleidoscope variables
  let rotationAngle = 0;
  let rotationSpeed = 0.008;
  let segments = 8;
  let time = 0;
  let mouseX = 0;
  let mouseY = 0;
  let centerX = 0;
  let centerY = 0;
  
  // Liquid/fluid variables
  let liquidFlow = 0;
  let morphingFactor = 0;
  let waveAmplitude = 50;
  let waveFrequency = 0.02;
  let viscosity = 0.3;
  
  // Psychedelic variables
  let colorShift = 0;
  let pulsePhase = 0;
  let trippyMode = 0;
  let fractalDepth = 3;
  let distortionFactor = 0.5;
  
  // Particle system for fluid effects
  let fluidParticles = [];
  let maxParticles = 80;
  let fluidField = [];

  class FluidParticle {
    constructor(p5) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.vel = p5.createVector(0, 0);
      this.acc = p5.createVector(0, 0);
      this.life = 255;
      this.decay = p5.random(0.5, 2);
      this.size = p5.random(3, 12);
      this.color = p5.color(
        p5.random(100, 255),
        p5.random(100, 255),
        p5.random(100, 255)
      );
      this.fluidType = p5.random(['droplet', 'bubble', 'stream']);
      this.morphingPhase = p5.random(p5.TWO_PI);
    }

    update(p5) {
      // Apply fluid field forces
      const fieldX = Math.floor((this.pos.x + p5.width/2) / 20);
      const fieldY = Math.floor((this.pos.y + p5.height/2) / 20);
      
      if (fluidField && fluidField.length > 0 && fluidField[0] && 
          fieldX >= 0 && fieldX < fluidField.length && 
          fieldY >= 0 && fieldY < fluidField[0].length) {
        const fieldForce = fluidField[fieldX][fieldY];
        this.acc.add(fieldForce);
      }
      
      // Add morphing effect
      this.acc.x += p5.sin(this.morphingPhase + time) * 0.2;
      this.acc.y += p5.cos(this.morphingPhase + time) * 0.2;
      
      // Apply viscosity
      this.acc.mult(viscosity);
      
      this.vel.add(this.acc);
      this.vel.limit(3);
      this.pos.add(this.vel);
      this.acc.mult(0);
      this.life -= this.decay;
      
      // Wrap around screen
      if (this.pos.x < -p5.width/2) this.pos.x = p5.width/2;
      if (this.pos.x > p5.width/2) this.pos.x = -p5.width/2;
      if (this.pos.y < -p5.height/2) this.pos.y = p5.height/2;
      if (this.pos.y > p5.height/2) this.pos.y = -p5.height/2;
    }

    show(p5) {
      if (this.life > 0) {
        const alpha = p5.map(this.life, 0, 255, 0, 255);
        const size = this.size + p5.sin(this.morphingPhase + time * 2) * 2;
        
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.morphingPhase + time);
        
        if (this.fluidType === 'droplet') {
          // Draw droplet shape
          p5.fill(p5.red(this.color), p5.green(this.color), p5.blue(this.color), alpha);
          p5.noStroke();
          p5.beginShape();
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * p5.TWO_PI;
            const radius = size + p5.sin(angle * 3 + time) * 3;
            p5.vertex(p5.cos(angle) * radius, p5.sin(angle) * radius);
          }
          p5.endShape(p5.CLOSE);
        } else if (this.fluidType === 'bubble') {
          // Draw bubble with highlight
          p5.fill(p5.red(this.color), p5.green(this.color), p5.blue(this.color), alpha * 0.3);
          p5.circle(0, 0, size * 2);
          p5.fill(p5.red(this.color), p5.green(this.color), p5.blue(this.color), alpha);
          p5.circle(-size * 0.3, -size * 0.3, size * 0.6);
        } else {
          // Draw stream
          p5.stroke(p5.red(this.color), p5.green(this.color), p5.blue(this.color), alpha);
          p5.strokeWeight(size * 0.5);
          p5.line(-size, 0, size, 0);
        }
        
        p5.pop();
      }
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
    
    p5.background(0);
    p5.colorMode(p5.RGB);
    
    centerX = p5.width / 2;
    centerY = p5.height / 2;
    
    // Initialize fluid field
    initializeFluidField(p5);
    
    // Initialize fluid particles
    for (let i = 0; i < maxParticles; i++) {
      fluidParticles.push(new FluidParticle(p5));
    }
  };

  const initializeFluidField = (p5) => {
    const cols = Math.floor(p5.width / 20);
    const rows = Math.floor(p5.height / 20);
    
    fluidField = [];
    for (let x = 0; x < cols; x++) {
      fluidField[x] = [];
      for (let y = 0; y < rows; y++) {
        fluidField[x][y] = p5.createVector(0, 0);
      }
    }
  };

  const updateFluidField = (p5) => {
    if (!fluidField || fluidField.length === 0 || !fluidField[0]) {
      initializeFluidField(p5);
      return;
    }
    
    const cols = fluidField.length;
    const rows = fluidField[0].length;
    
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const worldX = (x - cols/2) * 20;
        const worldY = (y - rows/2) * 20;
        
        // Create swirling fluid motion
        const angle = p5.noise(worldX * 0.01, worldY * 0.01, time * 0.5) * p5.TWO_PI * 4;
        const force = p5.noise(worldX * 0.02, worldY * 0.02, time * 0.3) * 0.5;
        
        fluidField[x][y] = p5.createVector(
          p5.cos(angle) * force,
          p5.sin(angle) * force
        );
      }
    }
  };

  const draw = (p5) => {
    time += 0.02;
    rotationAngle += rotationSpeed;
    pulsePhase += 0.03;
    colorShift += 1;
    liquidFlow += 0.01;
    morphingFactor += 0.02;
    trippyMode = p5.sin(time * 0.5) * 0.5 + 0.5;
    
    mouseX = p5.mouseX - centerX;
    mouseY = p5.mouseY - centerY;
    
    // Update fluid field
    updateFluidField(p5);
    
    // Clear background with fluid fade
    p5.fill(0, 0, 0, 15);
    p5.rect(0, 0, p5.width, p5.height);
    
    // Draw liquid kaleidoscope
    drawLiquidKaleidoscope(p5);
    
    // Update and draw fluid particles
    fluidParticles = fluidParticles.filter(particle => {
      particle.update(p5);
      particle.show(p5);
      return !particle.isDead();
    });
    
    while (fluidParticles.length < maxParticles) {
      fluidParticles.push(new FluidParticle(p5));
    }
    
    // Draw central fluid core
    drawFluidCore(p5);
    
    // Draw UI
    drawUI(p5);
  };

  const drawLiquidKaleidoscope = (p5) => {
    p5.push();
    p5.translate(centerX, centerY);
    
    for (let i = 0; i < segments; i++) {
      const segmentAngle = (i / segments) * p5.TWO_PI + rotationAngle;
      
      p5.push();
      p5.rotate(segmentAngle);
      
      drawLiquidPattern(p5, i);
      
      p5.pop();
    }
    
    p5.pop();
  };

  const drawLiquidPattern = (p5, segmentIndex) => {
    const maxRadius = p5.dist(0, 0, p5.width/2, p5.height/2);
    
    // Draw liquid layers
    for (let layer = 0; layer < 20; layer++) {
      const layerRadius = p5.map(layer, 0, 19, 30, maxRadius);
      const layerThickness = p5.map(layer, 0, 19, 15, 5);
      
      // Calculate liquid distortion
      const distortion = p5.sin(liquidFlow + layer * 0.3) * distortionFactor * layer;
      const morphing = p5.sin(morphingFactor + layer * 0.2) * 0.3;
      const wave = p5.sin(layerRadius * waveFrequency + time) * waveAmplitude;
      
      // Calculate psychedelic colors for this layer
      const hue = (colorShift + segmentIndex * 45 + layer * 20) % 360;
      const saturation = 80 + trippyMode * 20;
      const lightness = 60 + p5.sin(time + layer) * 20;
      const color = hslToRgb(p5, hue, saturation, lightness);
      
      // Create liquid shape
      p5.beginShape();
      
      const numPoints = 24;
      for (let j = 0; j <= numPoints; j++) {
        const angle = (j / numPoints) * (p5.PI / segments);
        const radius = layerRadius + wave + distortion + morphing * 20;
        
        const x = p5.cos(angle) * radius;
        const y = p5.sin(angle) * radius;
        
        // Add liquid ripple effect
        const ripple = p5.sin(angle * 8 + time * 3) * 5;
        const finalX = x + ripple * p5.cos(angle);
        const finalY = y + ripple * p5.sin(angle);
        
        if (j === 0) {
          p5.fill(color.r, color.g, color.b, 180);
        }
        
        p5.vertex(finalX, finalY);
      }
      
      p5.endShape(p5.CLOSE);
      
      // Add liquid highlights
      if (layer % 3 === 0) {
        const highlightColor = hslToRgb(p5, (hue + 180) % 360, 100, 90);
        p5.fill(highlightColor.r, highlightColor.g, highlightColor.b, 100);
        p5.beginShape();
        
        for (let j = 0; j <= numPoints/2; j++) {
          const angle = (j / (numPoints/2)) * (p5.PI / segments);
          const radius = layerRadius * 0.8 + wave * 0.5;
          const x = p5.cos(angle) * radius;
          const y = p5.sin(angle) * radius;
          p5.vertex(x, y);
        }
        
        p5.endShape(p5.CLOSE);
      }
    }
    
    // Draw fractal liquid details
    drawFractalLiquid(p5, segmentIndex, maxRadius);
  };

  const drawFractalLiquid = (p5, segmentIndex, maxRadius) => {
    const drawFractal = (depth, radius, angle) => {
      if (depth <= 0) return;
      
      const x = p5.cos(angle) * radius;
      const y = p5.sin(angle) * radius;
      
      // Draw fractal droplet
      const dropletSize = radius * 0.1;
      const hue = (colorShift + segmentIndex * 60 + depth * 30) % 360;
      const color = hslToRgb(p5, hue, 90, 70);
      
      p5.fill(color.r, color.g, color.b, 150);
      p5.noStroke();
      p5.circle(x, y, dropletSize);
      
      // Recursive fractal branches
      const numBranches = 3;
      for (let i = 0; i < numBranches; i++) {
        const branchAngle = angle + (i / numBranches) * p5.PI + p5.sin(time + depth) * 0.5;
        const branchRadius = radius * 0.6;
        drawFractal(depth - 1, branchRadius, branchAngle);
      }
    };
    
    // Start fractal from multiple points
    for (let i = 0; i < 5; i++) {
      const startAngle = (i / 5) * (p5.PI / segments) + time * 0.1;
      const startRadius = maxRadius * 0.3;
      drawFractal(fractalDepth, startRadius, startAngle);
    }
  };

  const drawFluidCore = (p5) => {
    const coreSize = 40 + p5.sin(pulsePhase) * 20;
    const coreColor = hslToRgb(p5, colorShift % 360, 100, 90);
    
    // Draw fluid core with morphing
    p5.push();
    p5.translate(centerX, centerY);
    p5.rotate(time * 2);
    
    // Outer fluid ring
    p5.fill(coreColor.r, coreColor.g, coreColor.b, 50);
    p5.circle(0, 0, coreSize * 4);
    
    // Inner fluid shapes
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * p5.TWO_PI + time;
      const radius = coreSize * 1.5;
      const x = p5.cos(angle) * radius;
      const y = p5.sin(angle) * radius;
      
      const dropletColor = hslToRgb(p5, (colorShift + i * 45) % 360, 100, 80);
      p5.fill(dropletColor.r, dropletColor.g, dropletColor.b, 200);
      p5.circle(x, y, 10 + p5.sin(time + i) * 5);
    }
    
    // Central fluid core
    p5.fill(coreColor.r, coreColor.g, coreColor.b, 255);
    p5.beginShape();
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * p5.TWO_PI;
      const radius = coreSize + p5.sin(angle * 3 + time * 3) * 10;
      p5.vertex(p5.cos(angle) * radius, p5.sin(angle) * radius);
    }
    p5.endShape(p5.CLOSE);
    
    p5.pop();
  };

  const hslToRgb = (p5, h, s, l) => {
    h = h / 360;
    s = s / 100;
    l = l / 100;
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const drawUI = (p5) => {
    p5.fill(255);
    p5.noStroke();
    p5.textSize(14);
    p5.text(`Liquid Flow: ${liquidFlow.toFixed(2)}`, 10, 20);
    p5.text(`Morphing: ${morphingFactor.toFixed(2)}`, 10, 40);
    p5.text(`Trippy Mode: ${(trippyMode * 100).toFixed(0)}%`, 10, 60);
    p5.text(`Fluid Particles: ${fluidParticles.length}`, 10, 80);
    p5.text(`Fractal Depth: ${fractalDepth}`, 10, 100);
  };

  const mousePressed = (p5) => {
    segments = segments === 8 ? 12 : segments === 12 ? 6 : 8;
    fractalDepth = (fractalDepth + 1) % 5;
  };

  const mouseMoved = (p5) => {
    // Implementation of mouseMoved function
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    centerX = p5.width / 2;
    centerY = p5.height / 2;
    initializeFluidField(p5);
  };

  return (
    <Sketch
      setup={setup}
      draw={draw}
      mousePressed={mousePressed}
      mouseMoved={mouseMoved}
      windowResized={windowResized}
    />
  );
};

export default Kaleidoscope2; 