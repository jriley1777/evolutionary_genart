import React from "react";
import Sketch from "react-p5";

const Kaleidoscope5 = ({ isFullscreen = false }) => {
  // Kaleidoscope variables
  let rotationAngle = 0;
  let rotationSpeed = 0.02;
  let segments = 8;
  let time = 0;
  let mouseX = 0;
  let mouseY = 0;
  let centerX = 0;
  let centerY = 0;
  
  // Ultra-psychedelic variables
  let colorShift = 0;
  let pulsePhase = 0;
  let fractalZoom = 1;
  let zoomDirection = 1;
  let egoDissolution = 0;
  let glassWarp = 0;
  let recursionDepth = 4;
  let infiniteZoom = 0;
  
  // Particle system for liquid glass effects
  let glassParticles = [];
  let maxParticles = 200;
  let glassField = [];

  class GlassParticle {
    constructor(p5) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.vel = p5.createVector(
        p5.random(-4, 4),
        p5.random(-4, 4)
      );
      this.life = 255;
      this.decay = p5.random(0.2, 5);
      this.size = p5.random(1, 25);
      this.phase = p5.random(p5.TWO_PI);
      this.frequency = p5.random(0.1, 6);
      this.amplitude = p5.random(10, 120);
    }

    update(p5) {
      // Apply glass field forces
      const fieldX = Math.floor((this.pos.x + p5.width/2) / 18);
      const fieldY = Math.floor((this.pos.y + p5.height/2) / 18);
      
      if (fieldX >= 0 && fieldX < glassField.length && 
          fieldY >= 0 && fieldY < glassField[0].length) {
        const fieldForce = glassField[fieldX][fieldY];
        this.vel.add(fieldForce);
      }
      
      // Add liquid glass movement
      this.vel.x += p5.sin(this.phase + time * this.frequency) * 0.7;
      this.vel.y += p5.cos(this.phase + time * this.frequency) * 0.7;
      
      // Ego dissolution effect
      this.vel.x += p5.sin(egoDissolution + this.pos.y * 0.03) * 1.2;
      this.vel.y += p5.cos(egoDissolution + this.pos.x * 0.03) * 1.2;
      
      this.vel.limit(8);
      this.pos.add(this.vel);
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
        const size = this.size + p5.sin(this.phase + time * 4) * 6;
        
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase + time * 2);
        
        // Draw liquid glass droplet
        const hue = (colorShift + this.phase * 120) % 360;
        const color = hslToRgb(p5, hue, 100, 90);
        p5.fill(color.r, color.g, color.b, alpha * 0.7);
        p5.noStroke();
        p5.beginShape();
        for (let i = 0; i < 10; i++) {
          const angle = (i / 10) * p5.TWO_PI;
          const radius = size + p5.sin(glassWarp + angle * 7) * 8;
          p5.vertex(p5.cos(angle) * radius, p5.sin(angle) * radius);
        }
        p5.endShape(p5.CLOSE);
        
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
    
    // Initialize glass field
    initializeGlassField(p5);
    
    // Initialize glass particles
    for (let i = 0; i < maxParticles; i++) {
      glassParticles.push(new GlassParticle(p5));
    }
  };

  const initializeGlassField = (p5) => {
    const cols = Math.floor(p5.width / 18);
    const rows = Math.floor(p5.height / 18);
    
    glassField = [];
    for (let x = 0; x < cols; x++) {
      glassField[x] = [];
      for (let y = 0; y < rows; y++) {
        glassField[x][y] = p5.createVector(0, 0);
      }
    }
  };

  const updateGlassField = (p5) => {
    const cols = glassField.length;
    const rows = glassField[0].length;
    
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const worldX = (x - cols/2) * 18;
        const worldY = (y - rows/2) * 18;
        
        // Create glass warp patterns
        const angle = p5.noise(worldX * 0.01, worldY * 0.01, time * 0.2) * p5.TWO_PI * 16;
        const force = p5.noise(worldX * 0.02, worldY * 0.02, time * 0.1) * glassWarp;
        
        glassField[x][y] = p5.createVector(
          p5.cos(angle) * force,
          p5.sin(angle) * force
        );
      }
    }
  };

  const draw = (p5) => {
    time += 0.05;
    rotationAngle += rotationSpeed;
    pulsePhase += 0.06;
    colorShift += 4;
    glassWarp = p5.sin(time * 0.25) * 1.2 + 0.8;
    egoDissolution += 0.04;
    infiniteZoom += 0.01 * zoomDirection;
    if (infiniteZoom > 2 || infiniteZoom < 0.5) zoomDirection *= -1;
    fractalZoom = 1 + p5.sin(infiniteZoom) * 0.7;
    
    mouseX = p5.mouseX - centerX;
    mouseY = p5.mouseY - centerY;
    
    // Update glass field
    updateGlassField(p5);
    
    // Clear background with glass fade
    p5.fill(0, 0, 0, 6);
    p5.rect(0, 0, p5.width, p5.height);
    
    // Draw recursive fractal kaleidoscope
    drawRecursiveKaleidoscope(p5, recursionDepth, fractalZoom);
    
    // Update and draw glass particles
    glassParticles = glassParticles.filter(particle => {
      particle.update(p5);
      particle.show(p5);
      return !particle.isDead();
    });
    
    while (glassParticles.length < maxParticles) {
      glassParticles.push(new GlassParticle(p5));
    }
    
    // Draw central ego dissolution core
    drawEgoDissolutionCore(p5);
    
    // Draw UI
    drawUI(p5);
  };

  const drawRecursiveKaleidoscope = (p5, depth, zoom) => {
    if (depth <= 0) return;
    p5.push();
    p5.translate(centerX, centerY);
    p5.scale(zoom);
    p5.rotate(rotationAngle * (6 - depth));
    
    for (let i = 0; i < segments; i++) {
      const segmentAngle = (i / segments) * p5.TWO_PI + rotationAngle;
      p5.push();
      p5.rotate(segmentAngle);
      drawFractalPattern(p5, i, depth);
      p5.pop();
    }
    p5.pop();
    // Recursive call for infinite zoom
    drawRecursiveKaleidoscope(p5, depth - 1, zoom * 0.7);
  };

  const drawFractalPattern = (p5, segmentIndex, depth) => {
    const maxRadius = p5.dist(0, 0, p5.width/2, p5.height/2) * (0.7 ** (recursionDepth - depth));
    for (let layer = 0; layer < 18; layer++) {
      const layerRadius = p5.map(layer, 0, 17, 10, maxRadius);
      const glassDistort = p5.sin(glassWarp * 10 + layer * 0.6) * 60 * layer;
      const ego = p5.sin(egoDissolution + layer * 0.3) * 40;
      p5.beginShape();
      const numPoints = 48;
      for (let j = 0; j <= numPoints; j++) {
        const angle = (j / numPoints) * (p5.PI / segments);
        const radius = layerRadius + glassDistort + ego;
        const x = p5.cos(angle) * radius;
        const y = p5.sin(angle) * radius;
        const glassRipple = p5.sin(angle * 30 + time * 8) * 18;
        const finalX = x + glassRipple * p5.cos(angle);
        const finalY = y + glassRipple * p5.sin(angle);
        const hue = (colorShift + segmentIndex * 60 + layer * 18 + depth * 40) % 360;
        const color = hslToRgb(p5, hue, 100, 60 + 20 * Math.sin(time + layer));
        if (j === 0) {
          p5.fill(color.r, color.g, color.b, 230);
        }
        p5.vertex(finalX, finalY);
      }
      p5.endShape(p5.CLOSE);
      // Fractal highlights
      if (layer % 4 === 0) {
        const highlightColor = hslToRgb(p5, (colorShift + 180) % 360, 100, 95);
        p5.fill(highlightColor.r, highlightColor.g, highlightColor.b, 120);
        p5.beginShape();
        for (let j = 0; j <= numPoints/4; j++) {
          const angle = (j / (numPoints/4)) * (p5.PI / segments);
          const radius = layerRadius * 0.6 + ego * 0.3;
          const x = p5.cos(angle) * radius;
          const y = p5.sin(angle) * radius;
          p5.vertex(x, y);
        }
        p5.endShape(p5.CLOSE);
      }
    }
  };

  const drawEgoDissolutionCore = (p5) => {
    const coreSize = 100 + p5.sin(pulsePhase) * 50;
    const coreColor = hslToRgb(p5, colorShift % 360, 100, 98);
    p5.push();
    p5.translate(centerX, centerY);
    p5.rotate(time * 5);
    // Outer core
    p5.fill(coreColor.r, coreColor.g, coreColor.b, 18);
    p5.circle(0, 0, coreSize * 10);
    // Inner core
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * p5.TWO_PI + time * 3;
      const radius = coreSize * 2.8;
      const x = p5.cos(angle) * radius;
      const y = p5.sin(angle) * radius;
      const coreHighlight = hslToRgb(p5, (colorShift + i * 18) % 360, 100, 90);
      p5.fill(coreHighlight.r, coreHighlight.g, coreHighlight.b, 210);
      p5.circle(x, y, 14 + p5.sin(time * 4 + i) * 7);
    }
    // Central core
    p5.fill(coreColor.r, coreColor.g, coreColor.b, 255);
    p5.beginShape();
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * p5.TWO_PI;
      const radius = coreSize + p5.sin(angle * 7 + time * 7) * 30;
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
    p5.text(`Fractal Zoom: ${fractalZoom.toFixed(2)}`, 10, 20);
    p5.text(`Ego Dissolution: ${egoDissolution.toFixed(2)}`, 10, 40);
    p5.text(`Glass Warp: ${glassWarp.toFixed(2)}`, 10, 60);
    p5.text(`Glass Particles: ${glassParticles.length}`, 10, 80);
    p5.text(`Recursion Depth: ${recursionDepth}`, 10, 100);
  };

  const mousePressed = (p5) => {
    segments = segments === 8 ? 12 : segments === 12 ? 6 : 8;
    recursionDepth = (recursionDepth % 6) + 2;
  };

  const mouseMoved = (p5) => {
    // Implementation of mouseMoved function
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    centerX = p5.width / 2;
    centerY = p5.height / 2;
    initializeGlassField(p5);
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

export default Kaleidoscope5; 