import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Kaleidoscope3 = ({ isFullscreen = false }) => {
  // Kaleidoscope variables
  let rotationAngle = 0;
  let rotationSpeed = 0.012;
  let segments = 8;
  let time = 0;
  let mouseX = 0;
  let mouseY = 0;
  let centerX = 0;
  let centerY = 0;
  
  // Psychedelic variables
  let colorShift = 0;
  let pulsePhase = 0;
  let trippyMode = 0;
  let acidLevel = 0;
  let morphingFactor = 0;
  let dnaSpiral = 0;
  
  // Organic/biological variables
  let organicGrowth = 0;
  let cellDivision = 0;
  let neuralConnections = [];
  let maxNeurons = 100;
  
  // Particle system for psychedelic effects
  let psychedelicParticles = [];
  let maxParticles = 120;
  let energyField = [];

  const sketch = (p5) => {
    class PsychedelicParticle {
      constructor(p5) {
        this.pos = p5.createVector(
          p5.random(-p5.width/2, p5.width/2),
          p5.random(-p5.height/2, p5.height/2)
        );
        this.vel = p5.createVector(
          p5.random(-2, 2),
          p5.random(-2, 2)
        );
        this.life = 255;
        this.decay = p5.random(0.5, 3);
        this.size = p5.random(2, 15);
        this.particleType = p5.random(['energy', 'neuron', 'dna', 'cosmic']);
        this.phase = p5.random(p5.TWO_PI);
        this.frequency = p5.random(0.5, 3);
        this.amplitude = p5.random(10, 50);
      }

      update(p5) {
        // Apply energy field forces
        const fieldX = Math.floor((this.pos.x + p5.width/2) / 30);
        const fieldY = Math.floor((this.pos.y + p5.height/2) / 30);
        
        if (energyField && energyField.length > 0 && energyField[0] && 
            fieldX >= 0 && fieldX < energyField.length && 
            fieldY >= 0 && fieldY < energyField[0].length) {
          const fieldForce = energyField[fieldX][fieldY];
          this.vel.add(fieldForce);
        }
        
        // Add psychedelic movement
        this.vel.x += p5.sin(this.phase + time * this.frequency) * 0.3;
        this.vel.y += p5.cos(this.phase + time * this.frequency) * 0.3;
        
        // DNA spiral movement
        if (this.particleType === 'dna') {
          this.vel.x += p5.sin(dnaSpiral + this.pos.y * 0.01) * 0.5;
          this.vel.y += p5.cos(dnaSpiral + this.pos.x * 0.01) * 0.5;
        }
        
        this.vel.limit(4);
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
          const size = this.size + p5.sin(this.phase + time * 2) * 3;
          
          p5.push();
          p5.translate(this.pos.x, this.pos.y);
          p5.rotate(this.phase + time);
          
          if (this.particleType === 'energy') {
            // Draw energy particle
            const hue = (colorShift + this.phase * 50) % 360;
            const color = hslToRgb(p5, hue, 100, 70);
            p5.fill(color.r, color.g, color.b, alpha);
            p5.noStroke();
            
            // Draw energy burst
            for (let i = 0; i < 8; i++) {
              const angle = (i / 8) * p5.TWO_PI;
              const radius = size + p5.sin(time * 3 + i) * 5;
              p5.circle(p5.cos(angle) * radius, p5.sin(angle) * radius, 3);
            }
            
          } else if (this.particleType === 'neuron') {
            // Draw neural connection
            const hue = (colorShift + 120) % 360;
            const color = hslToRgb(p5, hue, 90, 80);
            p5.stroke(color.r, color.g, color.b, alpha);
            p5.strokeWeight(size * 0.3);
            p5.line(-size, 0, size, 0);
            p5.line(0, -size, 0, size);
            
            // Neural node
            p5.fill(color.r, color.g, color.b, alpha);
            p5.circle(0, 0, size);
            
          } else if (this.particleType === 'dna') {
            // Draw DNA helix
            const hue = (colorShift + 240) % 360;
            const color = hslToRgb(p5, hue, 100, 60);
            p5.stroke(color.r, color.g, color.b, alpha);
            p5.strokeWeight(2);
            
            for (let i = 0; i < 20; i++) {
              const t = i / 20;
              const x = p5.sin(t * p5.TWO_PI + dnaSpiral) * size;
              const y = p5.cos(t * p5.TWO_PI + dnaSpiral) * size;
              p5.point(x, y);
            }
            
          } else {
            // Draw cosmic particle
            const hue = (colorShift + 180) % 360;
            const color = hslToRgb(p5, hue, 100, 90);
            p5.fill(color.r, color.g, color.b, alpha);
            p5.noStroke();
            
            // Draw star shape
            p5.beginShape();
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * p5.TWO_PI;
              const radius = size + p5.sin(time + i) * 2;
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

    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.background(0);
      p5.colorMode(p5.RGB);
      p5.frameRate(40);
      
      centerX = p5.width / 2;
      centerY = p5.height / 2;
      
      // Initialize energy field
      initializeEnergyField(p5);
      
      // Initialize neural connections
      for (let i = 0; i < maxNeurons; i++) {
        neuralConnections.push({
          x: p5.random(-p5.width/2, p5.width/2),
          y: p5.random(-p5.height/2, p5.height/2),
          connections: []
        });
      }
      
      // Initialize psychedelic particles
      for (let i = 0; i < maxParticles; i++) {
        psychedelicParticles.push(new PsychedelicParticle(p5));
      }
    };

    const initializeEnergyField = (p5) => {
      const cols = Math.floor(p5.width / 30);
      const rows = Math.floor(p5.height / 30);
      
      energyField = [];
      for (let x = 0; x < cols; x++) {
        energyField[x] = [];
        for (let y = 0; y < rows; y++) {
          energyField[x][y] = p5.createVector(0, 0);
        }
      }
    };

    const updateEnergyField = (p5) => {
      if (!energyField || energyField.length === 0 || !energyField[0]) {
        initializeEnergyField(p5);
        return;
      }
      
      const cols = energyField.length;
      const rows = energyField[0].length;
      
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const worldX = (x - cols/2) * 30;
          const worldY = (y - rows/2) * 30;
          
          // Create psychedelic energy flow
          const angle = p5.noise(worldX * 0.02, worldY * 0.02, time * 0.3) * p5.TWO_PI * 6;
          const force = p5.noise(worldX * 0.01, worldY * 0.01, time * 0.2) * 0.8;
          
          energyField[x][y] = p5.createVector(
            p5.cos(angle) * force,
            p5.sin(angle) * force
          );
        }
      }
    };

    p5.draw = () => {
      time += 0.015;
      rotationAngle += rotationSpeed * 0.5;
      pulsePhase += 0.02;
      colorShift += 1;
      acidLevel = p5.sin(time * 0.15) * 0.5 + 0.5;
      morphingFactor += 0.015;
      dnaSpiral += 0.05;
      organicGrowth += 0.01;
      cellDivision += 0.005;
      trippyMode = p5.sin(time * 0.2) * 0.5 + 0.5;
      
      mouseX = p5.mouseX - centerX;
      mouseY = p5.mouseY - centerY;
      
      // Update energy field
      updateEnergyField(p5);
      
      // Clear background with psychedelic fade
      p5.fill(0, 0, 0, 10);
      p5.rect(0, 0, p5.width, p5.height);
      
      // Draw psychedelic kaleidoscope
      drawPsychedelicKaleidoscope(p5);
      
      // Update and draw psychedelic particles
      psychedelicParticles = psychedelicParticles.filter(particle => {
        particle.update(p5);
        particle.show(p5);
        return !particle.isDead();
      });
      
      while (psychedelicParticles.length < maxParticles) {
        psychedelicParticles.push(new PsychedelicParticle(p5));
      }
      
      // Draw neural network
      drawNeuralNetwork(p5);
      
      // Draw central consciousness core
      drawConsciousnessCore(p5);
      
      // Draw UI
      drawUI(p5);
    };

    const drawPsychedelicKaleidoscope = (p5) => {
      p5.push();
      p5.translate(centerX, centerY);
      
      for (let i = 0; i < segments; i++) {
        const segmentAngle = (i / segments) * p5.TWO_PI + rotationAngle;
        
        p5.push();
        p5.rotate(segmentAngle);
        
        drawPsychedelicPattern(p5, i);
        
        p5.pop();
      }
      
      p5.pop();
    };

    const drawPsychedelicPattern = (p5, segmentIndex) => {
      const maxRadius = p5.dist(0, 0, p5.width/2, p5.height/2);
      
      // Draw organic layers
      for (let layer = 0; layer < 25; layer++) {
        const layerRadius = p5.map(layer, 0, 24, 20, maxRadius);
        
        // Calculate psychedelic distortion
        const distortion = p5.sin(acidLevel * 10 + layer * 0.4) * 30 * layer;
        const morphing = p5.sin(morphingFactor + layer * 0.3) * 0.5;
        const organic = p5.sin(organicGrowth + layer * 0.2) * 20;
        
        // Calculate intense psychedelic colors for this layer
        const hue = (colorShift + segmentIndex * 60 + layer * 15) % 360;
        const saturation = 100;
        const lightness = 50 + p5.sin(time * 2 + layer) * 30;
        const color = hslToRgb(p5, hue, saturation, lightness);
        
        // Create organic shape
        p5.beginShape();
        
        const numPoints = 32;
        for (let j = 0; j <= numPoints; j++) {
          const angle = (j / numPoints) * (p5.PI / segments);
          const radius = layerRadius + distortion + organic + morphing * 30;
          
          const x = p5.cos(angle) * radius;
          const y = p5.sin(angle) * radius;
          
          // Add psychedelic ripple effect
          const ripple = p5.sin(angle * 12 + time * 4) * 8;
          const dnaEffect = p5.sin(dnaSpiral + angle * 6) * 5;
          const finalX = x + ripple * p5.cos(angle) + dnaEffect;
          const finalY = y + ripple * p5.sin(angle) + dnaEffect;
          
          if (j === 0) {
            p5.fill(color.r, color.g, color.b, 200);
          }
          
          p5.vertex(finalX, finalY);
        }
        
        p5.endShape(p5.CLOSE);
        
        // Add psychedelic highlights
        if (layer % 2 === 0) {
          const highlightColor = hslToRgb(p5, (hue + 180) % 360, 100, 90);
          p5.fill(highlightColor.r, highlightColor.g, highlightColor.b, 150);
          p5.beginShape();
          
          for (let j = 0; j <= numPoints/3; j++) {
            const angle = (j / (numPoints/3)) * (p5.PI / segments);
            const radius = layerRadius * 0.7 + organic * 0.5;
            const x = p5.cos(angle) * radius;
            const y = p5.sin(angle) * radius;
            p5.vertex(x, y);
          }
          
          p5.endShape(p5.CLOSE);
        }
      }
      
      // Draw DNA spirals
      drawDNASpirals(p5, segmentIndex, maxRadius);
    };

    const drawDNASpirals = (p5, segmentIndex, maxRadius) => {
      const numSpirals = 3;
      
      for (let spiral = 0; spiral < numSpirals; spiral++) {
        const spiralOffset = (spiral / numSpirals) * (p5.PI / segments);
        const spiralRadius = maxRadius * 0.4;
        
        p5.push();
        p5.rotate(spiralOffset);
        
        // Draw DNA double helix
        for (let i = 0; i < 100; i++) {
          const t = i / 100;
          const angle = t * p5.TWO_PI * 4 + dnaSpiral;
          const radius = spiralRadius * t;
          
          const x1 = p5.cos(angle) * radius;
          const y1 = p5.sin(angle) * radius;
          const x2 = p5.cos(angle + p5.PI) * radius;
          const y2 = p5.sin(angle + p5.PI) * radius;
          
          // DNA strand colors
          const hue1 = (colorShift + segmentIndex * 90) % 360;
          const hue2 = (colorShift + segmentIndex * 90 + 180) % 360;
          
          const color1 = hslToRgb(p5, hue1, 100, 70);
          const color2 = hslToRgb(p5, hue2, 100, 70);
          
          // Draw DNA strands
          p5.stroke(color1.r, color1.g, color1.b, 200);
          p5.strokeWeight(3);
          p5.point(x1, y1);
          
          p5.stroke(color2.r, color2.g, color2.b, 200);
          p5.point(x2, y2);
          
          // Draw connecting bonds
          if (i % 10 === 0) {
            p5.stroke(255, 255, 255, 100);
            p5.strokeWeight(1);
            p5.line(x1, y1, x2, y2);
          }
        }
        
        p5.pop();
      }
    };

    const drawNeuralNetwork = (p5) => {
      p5.push();
      p5.translate(centerX, centerY);
      
      // Update neural connections
      for (let i = 0; i < neuralConnections.length; i++) {
        const neuron = neuralConnections[i];
        
        // Add some movement
        neuron.x += p5.sin(time + i) * 0.5;
        neuron.y += p5.cos(time + i) * 0.5;
        
        // Wrap around
        if (neuron.x < -p5.width/2) neuron.x = p5.width/2;
        if (neuron.x > p5.width/2) neuron.x = -p5.width/2;
        if (neuron.y < -p5.height/2) neuron.y = p5.height/2;
        if (neuron.y > p5.height/2) neuron.y = -p5.height/2;
        
        // Find connections
        neuron.connections = [];
        for (let j = 0; j < neuralConnections.length; j++) {
          if (i !== j) {
            const other = neuralConnections[j];
            const dist = p5.dist(neuron.x, neuron.y, other.x, other.y);
            if (dist < 100) {
              neuron.connections.push(j);
            }
          }
        }
      }
      
      // Draw connections
      for (let i = 0; i < neuralConnections.length; i++) {
        const neuron = neuralConnections[i];
        
        // Draw connections
        for (let j of neuron.connections) {
          const other = neuralConnections[j];
          const dist = p5.dist(neuron.x, neuron.y, other.x, other.y);
          const alpha = p5.map(dist, 0, 100, 255, 0);
          
          const hue = (colorShift + i * 10) % 360;
          const color = hslToRgb(p5, hue, 100, 70);
          
          p5.stroke(color.r, color.g, color.b, alpha);
          p5.strokeWeight(1);
          p5.line(neuron.x, neuron.y, other.x, other.y);
        }
        
        // Draw neuron
        const hue = (colorShift + i * 20) % 360;
        const color = hslToRgb(p5, hue, 100, 80);
        p5.fill(color.r, color.g, color.b, 200);
        p5.noStroke();
        p5.circle(neuron.x, neuron.y, 5 + p5.sin(time + i) * 2);
      }
      
      p5.pop();
    };

    const drawConsciousnessCore = (p5) => {
      const coreSize = 60 + p5.sin(pulsePhase) * 30;
      const coreColor = hslToRgb(p5, colorShift % 360, 100, 90);
      
      p5.push();
      p5.translate(centerX, centerY);
      p5.rotate(time * 3);
      
      // Inner consciousness layers
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * p5.TWO_PI + time;
        const radius = coreSize * 2;
        const x = p5.cos(angle) * radius;
        const y = p5.sin(angle) * radius;
        
        const consciousnessColor = hslToRgb(p5, (colorShift + i * 30) % 360, 100, 80);
        p5.fill(consciousnessColor.r, consciousnessColor.g, consciousnessColor.b, 200);
        p5.circle(x, y, 8 + p5.sin(time * 2 + i) * 4);
      }
      
      // Central consciousness
      p5.fill(coreColor.r, coreColor.g, coreColor.b, 255);
      p5.beginShape();
      for (let i = 0; i < 16; i++) {
        const angle = (i / 16) * p5.TWO_PI;
        const radius = coreSize + p5.sin(angle * 4 + time * 4) * 15;
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
      p5.text(`Acid Level: ${(acidLevel * 100).toFixed(0)}%`, 10, 20);
      p5.text(`Organic Growth: ${organicGrowth.toFixed(2)}`, 10, 40);
      p5.text(`DNA Spiral: ${dnaSpiral.toFixed(2)}`, 10, 60);
      p5.text(`Psychedelic Particles: ${psychedelicParticles.length}`, 10, 80);
      p5.text(`Neural Connections: ${neuralConnections.length}`, 10, 100);
      p5.text(`Trippy Mode: ${(trippyMode * 100).toFixed(0)}%`, 10, 120);
    };

    p5.mousePressed = () => {
      segments = segments === 8 ? 12 : segments === 12 ? 6 : 8;
    };

    p5.mouseMoved = () => {
      // Implementation of mouseMoved function
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      centerX = p5.width / 2;
      centerY = p5.height / 2;
      initializeEnergyField(p5);
    };
  };

  return (
    <ReactP5Wrapper sketch={sketch} />
  );
};

export default Kaleidoscope3; 