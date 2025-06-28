import React from "react";
import Sketch from "react-p5";

const Kaleidoscope4 = ({ isFullscreen = false }) => {
  // Kaleidoscope variables
  let rotationAngle = 0;
  let rotationSpeed = 0.015;
  let segments = 8;
  let time = 0;
  let mouseX = 0;
  let mouseY = 0;
  let centerX = 0;
  let centerY = 0;
  
  // Extreme psychedelic variables
  let colorShift = 0;
  let pulsePhase = 0;
  let realityDistortion = 0;
  let timeDilation = 0;
  let cosmicConsciousness = 0;
  let egoDissolution = 0;
  let dimensionalShift = 0;
  
  // Cosmic/quantum variables
  let quantumEntanglement = [];
  let maxEntangled = 50;
  let dimensionalLayers = 5;
  let realityFragments = [];
  
  // Particle system for cosmic effects
  let cosmicParticles = [];
  let maxParticles = 150;
  let realityField = [];

  class CosmicParticle {
    constructor(p5) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.vel = p5.createVector(
        p5.random(-3, 3),
        p5.random(-3, 3)
      );
      this.life = 255;
      this.decay = p5.random(0.3, 4);
      this.size = p5.random(1, 20);
      this.particleType = p5.random(['quantum', 'consciousness', 'reality', 'dimension', 'ego']);
      this.phase = p5.random(p5.TWO_PI);
      this.frequency = p5.random(0.2, 5);
      this.amplitude = p5.random(5, 100);
      this.dimension = p5.random([0, 1, 2, 3, 4]);
    }

    update(p5) {
      // Apply reality field forces
      const fieldX = Math.floor((this.pos.x + p5.width/2) / 25);
      const fieldY = Math.floor((this.pos.y + p5.height/2) / 25);
      
      if (realityField && realityField.length > 0 && realityField[0] && 
          fieldX >= 0 && fieldX < realityField.length && 
          fieldY >= 0 && fieldY < realityField[0].length) {
        const fieldForce = realityField[fieldX][fieldY];
        this.vel.add(fieldForce);
      }
      
      // Add cosmic movement
      this.vel.x += p5.sin(this.phase + time * this.frequency) * 0.5;
      this.vel.y += p5.cos(this.phase + time * this.frequency) * 0.5;
      
      // Reality distortion effects
      if (this.particleType === 'reality') {
        this.vel.x += p5.sin(realityDistortion + this.pos.y * 0.02) * 1;
        this.vel.y += p5.cos(realityDistortion + this.pos.x * 0.02) * 1;
      }
      
      // Time dilation effects
      if (this.particleType === 'quantum') {
        this.vel.x += p5.sin(timeDilation * 10 + this.pos.y * 0.01) * 0.8;
        this.vel.y += p5.cos(timeDilation * 10 + this.pos.x * 0.01) * 0.8;
      }
      
      this.vel.limit(6);
      this.pos.add(this.vel);
      this.life -= this.decay;
      
      // Dimensional wrapping
      if (this.pos.x < -p5.width/2) this.pos.x = p5.width/2;
      if (this.pos.x > p5.width/2) this.pos.x = -p5.width/2;
      if (this.pos.y < -p5.height/2) this.pos.y = p5.height/2;
      if (this.pos.y > p5.height/2) this.pos.y = -p5.height/2;
    }

    show(p5) {
      if (this.life > 0) {
        const alpha = p5.map(this.life, 0, 255, 0, 255);
        const size = this.size + p5.sin(this.phase + time * 3) * 5;
        
        p5.push();
        p5.translate(this.pos.x, this.pos.y);
        p5.rotate(this.phase + time * 2);
        
        if (this.particleType === 'quantum') {
          // Draw quantum particle with superposition
          const hue = (colorShift + this.phase * 100) % 360;
          const color = hslToRgb(p5, hue, 100, 80);
          p5.fill(color.r, color.g, color.b, alpha);
          p5.noStroke();
          
          // Draw quantum superposition states
          for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * p5.TWO_PI + time;
            const radius = size + p5.sin(time * 5 + i) * 8;
            p5.circle(p5.cos(angle) * radius, p5.sin(angle) * radius, 4);
          }
          
        } else if (this.particleType === 'consciousness') {
          // Draw consciousness particle
          const hue = (colorShift + 180) % 360;
          const color = hslToRgb(p5, hue, 100, 90);
          p5.fill(color.r, color.g, color.b, alpha);
          p5.noStroke();
          
          // Draw consciousness spiral
          p5.beginShape();
          for (let i = 0; i < 20; i++) {
            const t = i / 20;
            const angle = t * p5.TWO_PI * 3 + cosmicConsciousness;
            const radius = size * t + p5.sin(time * 2 + i) * 3;
            p5.vertex(p5.cos(angle) * radius, p5.sin(angle) * radius);
          }
          p5.endShape(p5.CLOSE);
          
        } else if (this.particleType === 'reality') {
          // Draw reality fragment
          const hue = (colorShift + 90) % 360;
          const color = hslToRgb(p5, hue, 100, 70);
          p5.stroke(color.r, color.g, color.b, alpha);
          p5.strokeWeight(2);
          p5.noFill();
          
          // Draw reality distortion
          p5.beginShape();
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * p5.TWO_PI;
            const radius = size + p5.sin(realityDistortion + angle * 4) * 10;
            p5.vertex(p5.cos(angle) * radius, p5.sin(angle) * radius);
          }
          p5.endShape(p5.CLOSE);
          
        } else if (this.particleType === 'dimension') {
          // Draw dimensional portal
          const hue = (colorShift + 270) % 360;
          const color = hslToRgb(p5, hue, 100, 60);
          p5.fill(color.r, color.g, color.b, alpha);
          p5.noStroke();
          
          // Draw dimensional layers
          for (let layer = 0; layer < 3; layer++) {
            const layerSize = size * (1 - layer * 0.3);
            p5.beginShape();
            for (let i = 0; i < 6; i++) {
              const angle = (i / 6) * p5.TWO_PI + dimensionalShift + layer;
              const radius = layerSize + p5.sin(time * 3 + i) * 5;
              p5.vertex(p5.cos(angle) * radius, p5.sin(angle) * radius);
            }
            p5.endShape(p5.CLOSE);
          }
          
        } else {
          // Draw ego dissolution
          const hue = (colorShift + 45) % 360;
          const color = hslToRgb(p5, hue, 100, 85);
          p5.fill(color.r, color.g, color.b, alpha);
          p5.noStroke();
          
          // Draw dissolving ego
          p5.beginShape();
          for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * p5.TWO_PI;
            const radius = size + p5.sin(egoDissolution + angle * 6) * 8;
            p5.vertex(p5.cos(angle) * radius, p5.sin(angle) * radius);
          }
          p5.endShape(p5.CLOSE);
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
    p5.frameRate(40); // Set to 40 fps for optimal motion
    
    centerX = p5.width / 2;
    centerY = p5.height / 2;
    
    // Initialize reality field
    initializeRealityField(p5);
    
    // Initialize quantum entanglement
    for (let i = 0; i < maxEntangled; i++) {
      quantumEntanglement.push({
        x: p5.random(-p5.width/2, p5.width/2),
        y: p5.random(-p5.height/2, p5.height/2),
        partner: null,
        phase: p5.random(p5.TWO_PI)
      });
    }
    
    // Initialize reality fragments
    for (let i = 0; i < 20; i++) {
      realityFragments.push({
        x: p5.random(-p5.width/2, p5.width/2),
        y: p5.random(-p5.height/2, p5.height/2),
        size: p5.random(10, 50),
        rotation: p5.random(p5.TWO_PI),
        dimension: p5.random([0, 1, 2, 3, 4])
      });
    }
    
    // Initialize cosmic particles
    for (let i = 0; i < maxParticles; i++) {
      cosmicParticles.push(new CosmicParticle(p5));
    }
  };

  const initializeRealityField = (p5) => {
    const cols = Math.floor(p5.width / 25);
    const rows = Math.floor(p5.height / 25);
    
    realityField = [];
    for (let x = 0; x < cols; x++) {
      realityField[x] = [];
      for (let y = 0; y < rows; y++) {
        realityField[x][y] = p5.createVector(0, 0);
      }
    }
  };

  const updateRealityField = (p5) => {
    if (!realityField || realityField.length === 0 || !realityField[0]) {
      initializeRealityField(p5);
      return;
    }
    
    const cols = realityField.length;
    const rows = realityField[0].length;
    
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        const worldX = (x - cols/2) * 25;
        const worldY = (y - rows/2) * 25;
        
        // Create reality distortion field
        const angle = p5.noise(worldX * 0.03, worldY * 0.03, time * 0.2) * p5.TWO_PI * 8;
        const force = p5.noise(worldX * 0.015, worldY * 0.015, time * 0.1) * 1.2;
        
        realityField[x][y] = p5.createVector(
          p5.cos(angle) * force,
          p5.sin(angle) * force
        );
      }
    }
  };

  const draw = (p5) => {
    time += 0.02;
    rotationAngle += rotationSpeed * 0.4;
    pulsePhase += 0.025;
    colorShift += 1.5;
    realityDistortion = p5.sin(time * 0.1) * 0.8 + 0.2;
    timeDilation = p5.sin(time * 0.075) * 0.5 + 0.5;
    cosmicConsciousness += 0.01;
    egoDissolution += 0.015;
    dimensionalShift += 0.005;
    
    mouseX = p5.mouseX - centerX;
    mouseY = p5.mouseY - centerY;
    
    // Update reality field
    updateRealityField(p5);
    
    // Clear background with cosmic fade
    p5.fill(0, 0, 0, 8);
    p5.rect(0, 0, p5.width, p5.height);
    
    // Draw dimensional layers
    for (let dimension = 0; dimension < dimensionalLayers; dimension++) {
      drawDimensionalLayer(p5, dimension);
    }
    
    // Draw extreme psychedelic kaleidoscope
    drawExtremeKaleidoscope(p5);
    
    // Update and draw cosmic particles
    cosmicParticles = cosmicParticles.filter(particle => {
      particle.update(p5);
      particle.show(p5);
      return !particle.isDead();
    });
    
    while (cosmicParticles.length < maxParticles) {
      cosmicParticles.push(new CosmicParticle(p5));
    }
    
    // Draw quantum entanglement
    drawQuantumEntanglement(p5);
    
    // Draw reality fragments
    drawRealityFragments(p5);
    
    // Draw central cosmic core
    drawCosmicCore(p5);
    
    // Draw UI
    drawUI(p5);
  };

  const drawDimensionalLayer = (p5, dimension) => {
    const layerAlpha = p5.map(dimension, 0, dimensionalLayers - 1, 50, 10);
    const layerScale = p5.map(dimension, 0, dimensionalLayers - 1, 1, 0.3);
    
    p5.push();
    p5.translate(centerX, centerY);
    p5.scale(layerScale);
    p5.rotate(dimensionalShift + dimension * 0.5);
    
    // Draw dimensional grid
    p5.stroke(255, 255, 255, layerAlpha);
    p5.strokeWeight(1);
    p5.noFill();
    
    const gridSize = 200;
    for (let i = -gridSize; i <= gridSize; i += 20) {
      p5.line(i, -gridSize, i, gridSize);
      p5.line(-gridSize, i, gridSize, i);
    }
    
    p5.pop();
  };

  const drawExtremeKaleidoscope = (p5) => {
    p5.push();
    p5.translate(centerX, centerY);
    
    for (let i = 0; i < segments; i++) {
      const segmentAngle = (i / segments) * p5.TWO_PI + rotationAngle;
      
      p5.push();
      p5.rotate(segmentAngle);
      
      drawExtremePattern(p5, i);
      
      p5.pop();
    }
    
    p5.pop();
  };

  const drawExtremePattern = (p5, segmentIndex) => {
    const maxRadius = p5.dist(0, 0, p5.width/2, p5.height/2);
    
    // Draw extreme psychedelic layers
    for (let layer = 0; layer < 30; layer++) {
      const layerRadius = p5.map(layer, 0, 29, 15, maxRadius);
      
      // Calculate extreme distortion
      const distortion = p5.sin(realityDistortion * 20 + layer * 0.5) * 50 * layer;
      const timeWarp = p5.sin(timeDilation * 15 + layer * 0.4) * 0.8;
      const consciousness = p5.sin(cosmicConsciousness + layer * 0.3) * 30;
      const ego = p5.sin(egoDissolution + layer * 0.2) * 25;
      
      // Calculate extreme psychedelic colors for this layer
      const hue = (colorShift + segmentIndex * 45 + layer * 12) % 360;
      const saturation = 100;
      const lightness = 40 + p5.sin(time * 3 + layer) * 40;
      const color = hslToRgb(p5, hue, saturation, lightness);
      
      // Create extreme shape
      p5.beginShape();
      
      const numPoints = 40;
      for (let j = 0; j <= numPoints; j++) {
        const angle = (j / numPoints) * (p5.PI / segments);
        const radius = layerRadius + distortion + consciousness + ego;
        
        const x = p5.cos(angle) * radius;
        const y = p5.sin(angle) * radius;
        
        // Add extreme effects
        const realityRipple = p5.sin(angle * 20 + time * 6) * 15;
        const timeEffect = p5.sin(timeWarp + angle * 8) * 10;
        const consciousnessEffect = p5.sin(cosmicConsciousness + angle * 12) * 8;
        const finalX = x + realityRipple * p5.cos(angle) + timeEffect + consciousnessEffect;
        const finalY = y + realityRipple * p5.sin(angle) + timeEffect + consciousnessEffect;
        
        if (j === 0) {
          p5.fill(color.r, color.g, color.b, 220);
        }
        
        p5.vertex(finalX, finalY);
      }
      
      p5.endShape(p5.CLOSE);
      
      // Add extreme highlights
      if (layer % 3 === 0) {
        const highlightColor = hslToRgb(p5, (hue + 180) % 360, 100, 95);
        p5.fill(highlightColor.r, highlightColor.g, highlightColor.b, 180);
        p5.beginShape();
        
        for (let j = 0; j <= numPoints/4; j++) {
          const angle = (j / (numPoints/4)) * (p5.PI / segments);
          const radius = layerRadius * 0.6 + consciousness * 0.3;
          const x = p5.cos(angle) * radius;
          const y = p5.sin(angle) * radius;
          p5.vertex(x, y);
        }
        
        p5.endShape(p5.CLOSE);
      }
    }
    
    // Draw cosmic spirals
    drawCosmicSpirals(p5, segmentIndex, maxRadius);
  };

  const drawCosmicSpirals = (p5, segmentIndex, maxRadius) => {
    const numSpirals = 4;
    
    for (let spiral = 0; spiral < numSpirals; spiral++) {
      const spiralOffset = (spiral / numSpirals) * (p5.PI / segments);
      const spiralRadius = maxRadius * 0.5;
      
      p5.push();
      p5.rotate(spiralOffset);
      
      // Draw cosmic spiral
      for (let i = 0; i < 150; i++) {
        const t = i / 150;
        const angle = t * p5.TWO_PI * 6 + cosmicConsciousness;
        const radius = spiralRadius * t;
        
        const x = p5.cos(angle) * radius;
        const y = p5.sin(angle) * radius;
        
        // Cosmic spiral colors
        const hue = (colorShift + segmentIndex * 60 + i * 2) % 360;
        const color = hslToRgb(p5, hue, 100, 70);
        
        // Draw cosmic points
        p5.stroke(color.r, color.g, color.b, 200);
        p5.strokeWeight(2 + t * 3);
        p5.point(x, y);
        
        // Add cosmic connections
        if (i % 15 === 0) {
          const nextAngle = ((i + 15) / 150) * p5.TWO_PI * 6 + cosmicConsciousness;
          const nextRadius = ((i + 15) / 150) * spiralRadius;
          const nextX = p5.cos(nextAngle) * nextRadius;
          const nextY = p5.sin(nextAngle) * nextRadius;
          
          p5.stroke(255, 255, 255, 100);
          p5.strokeWeight(1);
          p5.line(x, y, nextX, nextY);
        }
      }
      
      p5.pop();
    }
  };

  const drawQuantumEntanglement = (p5) => {
    p5.push();
    p5.translate(centerX, centerY);
    
    // Update quantum entanglement
    for (let i = 0; i < quantumEntanglement.length; i++) {
      const particle = quantumEntanglement[i];
      
      // Add quantum movement
      particle.x += p5.sin(time + particle.phase) * 1;
      particle.y += p5.cos(time + particle.phase) * 1;
      
      // Wrap around
      if (particle.x < -p5.width/2) particle.x = p5.width/2;
      if (particle.x > p5.width/2) particle.x = -p5.width/2;
      if (particle.y < -p5.height/2) particle.y = p5.height/2;
      if (particle.y > p5.height/2) particle.y = -p5.height/2;
    }
    
    // Draw entanglement connections
    for (let i = 0; i < quantumEntanglement.length; i++) {
      const particle = quantumEntanglement[i];
      const entangled = quantumEntanglement[particle.entangled];
      
      if (entangled) {
        const dist = p5.dist(particle.x, particle.y, entangled.x, entangled.y);
        const alpha = p5.map(dist, 0, 200, 255, 0);
        
        const hue = (colorShift + i * 15) % 360;
        const color = hslToRgb(p5, hue, 100, 80);
        
        p5.stroke(color.r, color.g, color.b, alpha);
        p5.strokeWeight(2);
        p5.line(particle.x, particle.y, entangled.x, entangled.y);
      }
      
      // Draw quantum particle
      const hue = (colorShift + i * 25) % 360;
      const color = hslToRgb(p5, hue, 100, 90);
      p5.fill(color.r, color.g, color.b, 200);
      p5.noStroke();
      p5.circle(particle.x, particle.y, 6 + p5.sin(time * 2 + i) * 3);
    }
    
    p5.pop();
  };

  const drawRealityFragments = (p5) => {
    p5.push();
    p5.translate(centerX, centerY);
    
    for (let fragment of realityFragments) {
      fragment.rotation += 0.02;
      
      const hue = (colorShift + fragment.dimension * 72) % 360;
      const color = hslToRgb(p5, hue, 100, 70);
      
      p5.push();
      p5.translate(fragment.x, fragment.y);
      p5.rotate(fragment.rotation);
      
      // Draw reality fragment
      p5.fill(color.r, color.g, color.b, 150);
      p5.noStroke();
      p5.beginShape();
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * p5.TWO_PI;
        const radius = fragment.size + p5.sin(realityDistortion + i) * 10;
        p5.vertex(p5.cos(angle) * radius, p5.sin(angle) * radius);
      }
      p5.endShape(p5.CLOSE);
      
      p5.pop();
    }
    
    p5.pop();
  };

  const drawCosmicCore = (p5) => {
    const coreSize = 80 + p5.sin(pulsePhase) * 40;
    const coreColor = hslToRgb(p5, colorShift % 360, 100, 95);
    
    p5.push();
    p5.translate(centerX, centerY);
    p5.rotate(time * 4);
    
    // Inner cosmic layers
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * p5.TWO_PI + time * 2;
      const radius = coreSize * 2.5;
      const x = p5.cos(angle) * radius;
      const y = p5.sin(angle) * radius;
      
      const cosmicColor = hslToRgb(p5, (colorShift + i * 22.5) % 360, 100, 85);
      p5.fill(cosmicColor.r, cosmicColor.g, cosmicColor.b, 200);
      p5.circle(x, y, 10 + p5.sin(time * 3 + i) * 6);
    }
    
    // Central cosmic consciousness
    p5.fill(coreColor.r, coreColor.g, coreColor.b, 255);
    p5.beginShape();
    for (let i = 0; i < 20; i++) {
      const angle = (i / 20) * p5.TWO_PI;
      const radius = coreSize + p5.sin(angle * 5 + time * 5) * 20;
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
    p5.text(`Reality Distortion: ${(realityDistortion * 100).toFixed(0)}%`, 10, 20);
    p5.text(`Time Dilation: ${(timeDilation * 100).toFixed(0)}%`, 10, 40);
    p5.text(`Cosmic Consciousness: ${cosmicConsciousness.toFixed(2)}`, 10, 60);
    p5.text(`Ego Dissolution: ${egoDissolution.toFixed(2)}`, 10, 80);
    p5.text(`Cosmic Particles: ${cosmicParticles.length}`, 10, 100);
    p5.text(`Quantum Entangled: ${quantumEntanglement.length}`, 10, 120);
    p5.text(`Dimensional Layers: ${dimensionalLayers}`, 10, 140);
  };

  const mousePressed = (p5) => {
    segments = segments === 8 ? 12 : segments === 12 ? 6 : 8;
    dimensionalLayers = (dimensionalLayers + 1) % 8;
  };

  const mouseMoved = (p5) => {
    // Implementation of mouseMoved function
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    centerX = p5.width / 2;
    centerY = p5.height / 2;
    initializeRealityField(p5);
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

export default Kaleidoscope4; 