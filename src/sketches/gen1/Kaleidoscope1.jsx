import React, { useState } from "react";
import Sketch from "react-p5";

const Kaleidoscope1 = ({ isFullscreen = false }) => {
  // Kaleidoscope variables
  let rotationAngle = 0;
  let rotationSpeed = 0.005;
  let segments = 8; // Number of kaleidoscope segments
  let time = 0;
  let mouseX = 0;
  let mouseY = 0;
  let centerX = 0;
  let centerY = 0;
  
  // Light refraction variables
  let lightAngle = 0;
  let lightIntensity = 1.0;
  let refractionIndex = 1.5;
  let dispersionFactor = 0.3;
  
  // Pattern variables
  let patternScale = 1.0;
  let patternComplexity = 3;
  let colorShift = 0;
  let pulsePhase = 0;
  
  // Particle system for light effects
  let lightParticles = [];
  let maxParticles = 50;

  class LightParticle {
    constructor(p5) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.vel = p5.createVector(
        p5.random(-1, 1),
        p5.random(-1, 1)
      );
      this.life = 255;
      this.decay = p5.random(1, 3);
      this.size = p5.random(2, 8);
      this.color = p5.color(
        p5.random(200, 255),
        p5.random(150, 255),
        p5.random(200, 255)
      );
      this.refractionAngle = p5.random(-p5.PI/4, p5.PI/4);
    }

    update(p5) {
      this.pos.add(this.vel);
      this.life -= this.decay;
      
      // Add refraction effect
      this.vel.x += p5.sin(this.refractionAngle + time) * 0.1;
      this.vel.y += p5.cos(this.refractionAngle + time) * 0.1;
      
      // Wrap around screen
      if (this.pos.x < -p5.width/2) this.pos.x = p5.width/2;
      if (this.pos.x > p5.width/2) this.pos.x = -p5.width/2;
      if (this.pos.y < -p5.height/2) this.pos.y = p5.height/2;
      if (this.pos.y > p5.height/2) this.pos.y = -p5.height/2;
    }

    show(p5) {
      if (this.life > 0) {
        const alpha = p5.map(this.life, 0, 255, 0, 255);
        p5.fill(p5.red(this.color), p5.green(this.color), p5.blue(this.color), alpha);
        p5.noStroke();
        p5.circle(this.pos.x, this.pos.y, this.size);
        
        // Add glow effect
        p5.fill(p5.red(this.color), p5.green(this.color), p5.blue(this.color), alpha * 0.3);
        p5.circle(this.pos.x, this.pos.y, this.size * 3);
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
    
    // Initialize center position
    centerX = p5.width / 2;
    centerY = p5.height / 2;
    
    // Initialize light particles
    for (let i = 0; i < maxParticles; i++) {
      lightParticles.push(new LightParticle(p5));
    }
  };

  const draw = (p5) => {
    // Update time and variables
    time += 0.01;
    rotationAngle += rotationSpeed;
    pulsePhase += 0.02;
    colorShift += 0.5;
    
    // Update mouse position relative to center
    mouseX = p5.mouseX - centerX;
    mouseY = p5.mouseY - centerY;
    
    // Calculate light angle from mouse position
    lightAngle = p5.atan2(mouseY, mouseX);
    lightIntensity = p5.map(p5.dist(mouseX, mouseY, 0, 0), 0, p5.width/2, 1.5, 0.5);
    
    // Clear background with subtle fade
    p5.fill(0, 0, 0, 20);
    p5.rect(0, 0, p5.width, p5.height);
    
    // Draw kaleidoscope pattern
    drawKaleidoscope(p5);
    
    // Update and draw light particles
    lightParticles = lightParticles.filter(particle => {
      particle.update(p5);
      particle.show(p5);
      return !particle.isDead();
    });
    
    // Add new particles if needed
    while (lightParticles.length < maxParticles) {
      lightParticles.push(new LightParticle(p5));
    }
    
    // Draw central focal point
    drawFocalPoint(p5);
    
    // Draw UI
    drawUI(p5);
  };

  const drawKaleidoscope = (p5) => {
    p5.push();
    p5.translate(centerX, centerY);
    
    // Draw each segment
    for (let i = 0; i < segments; i++) {
      const segmentAngle = (i / segments) * p5.TWO_PI + rotationAngle;
      
      p5.push();
      p5.rotate(segmentAngle);
      
      // Draw triangular/prism pattern for this segment
      drawPrismPattern(p5, i);
      
      p5.pop();
    }
    
    p5.pop();
  };

  const drawPrismPattern = (p5, segmentIndex) => {
    const segmentWidth = p5.width / segments;
    const maxRadius = p5.dist(0, 0, p5.width/2, p5.height/2);
    
    // Create triangular pattern
    for (let layer = 0; layer < 15; layer++) {
      const layerRadius = p5.map(layer, 0, 14, 50, maxRadius);
      const layerHeight = p5.map(layer, 0, 14, 20, 100);
      
      // Calculate refraction effect
      const refractionOffset = p5.sin(lightAngle + layer * 0.2) * dispersionFactor * layer;
      const colorOffset = layer * 30 + colorShift + refractionOffset * 50;
      
      // Create triangular shape
      p5.beginShape();
      
      // Calculate triangle vertices with refraction
      const angle1 = 0 + refractionOffset * 0.1;
      const angle2 = p5.PI / segments + refractionOffset * 0.1;
      const angle3 = (p5.PI / segments) * 2 + refractionOffset * 0.1;
      
      const x1 = p5.cos(angle1) * layerRadius;
      const y1 = p5.sin(angle1) * layerRadius;
      const x2 = p5.cos(angle2) * layerRadius;
      const y2 = p5.sin(angle2) * layerRadius;
      const x3 = p5.cos(angle3) * layerRadius;
      const y3 = p5.sin(angle3) * layerRadius;
      
      // Calculate colors with refraction effects
      const hue1 = (colorOffset + segmentIndex * 45) % 360;
      const hue2 = (colorOffset + segmentIndex * 45 + 60) % 360;
      const hue3 = (colorOffset + segmentIndex * 45 + 120) % 360;
      
      // Convert HSL to RGB for realistic prism colors
      const color1 = hslToRgb(p5, hue1, 80, 60 + lightIntensity * 20);
      const color2 = hslToRgb(p5, hue2, 80, 60 + lightIntensity * 20);
      const color3 = hslToRgb(p5, hue3, 80, 60 + lightIntensity * 20);
      
      // Draw triangle with gradient fill
      p5.fill(color1.r, color1.g, color1.b, 200);
      p5.vertex(x1, y1);
      p5.fill(color2.r, color2.g, color2.b, 200);
      p5.vertex(x2, y2);
      p5.fill(color3.r, color3.g, color3.b, 200);
      p5.vertex(x3, y3);
      
      p5.endShape(p5.CLOSE);
      
      // Add inner detail triangles
      if (layer % 3 === 0) {
        const innerRadius = layerRadius * 0.7;
        const innerColor = hslToRgb(p5, (colorOffset + 180) % 360, 90, 70);
        
        p5.fill(innerColor.r, innerColor.g, innerColor.b, 150);
        p5.beginShape();
        p5.vertex(p5.cos(angle1) * innerRadius, p5.sin(angle1) * innerRadius);
        p5.vertex(p5.cos(angle2) * innerRadius, p5.sin(angle2) * innerRadius);
        p5.vertex(p5.cos(angle3) * innerRadius, p5.sin(angle3) * innerRadius);
        p5.endShape(p5.CLOSE);
      }
      
      // Add refraction lines
      if (layer % 2 === 0) {
        const lineColor = hslToRgb(p5, (colorOffset + 90) % 360, 100, 80);
        p5.stroke(lineColor.r, lineColor.g, lineColor.b, 100);
        p5.strokeWeight(1);
        p5.line(0, 0, p5.cos(lightAngle) * layerRadius, p5.sin(lightAngle) * layerRadius);
      }
    }
    
    // Add central geometric pattern
    drawCentralPattern(p5, segmentIndex);
  };

  const drawCentralPattern = (p5, segmentIndex) => {
    const centerSize = 80;
    const pulse = p5.sin(pulsePhase + segmentIndex) * 0.3 + 0.7;
    
    // Draw central geometric shape
    p5.push();
    p5.rotate(segmentIndex * p5.PI / 4);
    
    const centerColor = hslToRgb(p5, (colorShift + segmentIndex * 60) % 360, 90, 70);
    p5.fill(centerColor.r, centerColor.g, centerColor.b, 200 * pulse);
    p5.noStroke();
    
    // Create diamond/rhombus shape
    p5.beginShape();
    p5.vertex(0, -centerSize * pulse);
    p5.vertex(centerSize * pulse, 0);
    p5.vertex(0, centerSize * pulse);
    p5.vertex(-centerSize * pulse, 0);
    p5.endShape(p5.CLOSE);
    
    // Add inner detail
    const innerColor = hslToRgb(p5, (colorShift + segmentIndex * 60 + 180) % 360, 100, 90);
    p5.fill(innerColor.r, innerColor.g, innerColor.b, 150 * pulse);
    p5.beginShape();
    p5.vertex(0, -centerSize * 0.5 * pulse);
    p5.vertex(centerSize * 0.5 * pulse, 0);
    p5.vertex(0, centerSize * 0.5 * pulse);
    p5.vertex(-centerSize * 0.5 * pulse, 0);
    p5.endShape(p5.CLOSE);
    
    p5.pop();
  };

  const drawFocalPoint = (p5) => {
    // Draw central focal point with light refraction
    const focalSize = 20 + p5.sin(pulsePhase) * 10;
    const focalColor = hslToRgb(p5, colorShift % 360, 100, 90);
    
    // Outer glow
    p5.fill(focalColor.r, focalColor.g, focalColor.b, 50);
    p5.circle(centerX, centerY, focalSize * 4);
    
    // Inner glow
    p5.fill(focalColor.r, focalColor.g, focalColor.b, 100);
    p5.circle(centerX, centerY, focalSize * 2);
    
    // Core
    p5.fill(focalColor.r, focalColor.g, focalColor.b, 255);
    p5.circle(centerX, centerY, focalSize);
    
    // Light beam effect
    p5.stroke(focalColor.r, focalColor.g, focalColor.b, 150);
    p5.strokeWeight(2);
    p5.line(centerX, centerY, 
            centerX + p5.cos(lightAngle) * 100, 
            centerY + p5.sin(lightAngle) * 100);
  };

  const hslToRgb = (p5, h, s, l) => {
    // Convert HSL to RGB
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
    // Display kaleidoscope information
    p5.fill(255);
    p5.noStroke();
    p5.textSize(14);
    p5.text(`Segments: ${segments}`, 10, 20);
    p5.text(`Rotation Speed: ${(rotationSpeed * 1000).toFixed(1)}`, 10, 40);
    p5.text(`Light Angle: ${(lightAngle * 180 / p5.PI).toFixed(1)}°`, 10, 60);
    p5.text(`Light Intensity: ${lightIntensity.toFixed(2)}`, 10, 80);
    p5.text(`Particles: ${lightParticles.length}`, 10, 100);
  };

  const mousePressed = (p5) => {
    // Change number of segments on click
    segments = segments === 8 ? 12 : segments === 12 ? 6 : 8;
  };

  const mouseMoved = (p5) => {
    // Mouse movement is handled in the draw loop
    // This updates the light angle and intensity
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    centerX = p5.width / 2;
    centerY = p5.height / 2;
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

export default Kaleidoscope1; 