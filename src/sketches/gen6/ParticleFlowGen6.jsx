import React, { useEffect } from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const ParticleFlowGen6 = ({ isFullscreen = false }) => {
  let flowField = [];
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;
  let hexagons = [];
  let hexSize = 20;
  let flowParticles = []; // Virtual particles that only affect hexagon lighting
  let influencedHexagons = new Set(); // Track all hexagons currently being influenced
  let synthwaveColors = [
    [255, 0, 255],   // Magenta
    [0, 255, 255],   // Cyan
    [255, 0, 128],   // Pink
    [128, 0, 255],   // Purple
    [0, 128, 255],   // Blue
    [255, 128, 0],   // Orange
  ];
  let colorTransitionSpeed = 0.02;
  let globalColorProgress = 0;
  let globalColorIndex = 0;

  class Hexagon {
    constructor(p5, x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.defaultSize = size;
      this.currentSize = size;
      this.targetSize = size;
      this.illumination = 0; // 0 to 1
      this.targetIllumination = 0;
      this.flowIntensity = 0;
      this.lastFlowTime = 0;
      this.vertices = this.calculateVertices();
      
      // Use noise for natural color progression across the grid
      const noiseScale = 0.01; // Controls how quickly colors change across space
      const colorNoise = p5.noise(x * noiseScale, y * noiseScale);
      this.colorIndex = p5.floor(colorNoise * synthwaveColors.length);
      this.colorProgress = (colorNoise * synthwaveColors.length) % 1;
      
      this.isInfluenced = false; // Track if hexagon is currently being influenced
    }

    calculateVertices() {
      const vertices = [];
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const x = this.x + this.currentSize * Math.cos(angle);
        const y = this.y + this.currentSize * Math.sin(angle);
        vertices.push({ x, y });
      }
      return vertices;
    }

    update(p5) {
      // Smooth size transition
      this.currentSize = p5.lerp(this.currentSize, this.targetSize, 0.1);
      
      // Smooth illumination transition
      this.illumination = p5.lerp(this.illumination, this.targetIllumination, 0.1);
      
      // Update color transition
      this.colorProgress += colorTransitionSpeed;
      if (this.colorProgress >= 1) {
        this.colorProgress = 0;
        this.colorIndex = (this.colorIndex + 1) % synthwaveColors.length;
      }
      
      // Actively shrink if no recent particle interaction
      if (p5.frameCount - this.lastFlowTime > 10) {
        this.shrink();
      }
      
      // Ensure values don't go below minimum
      this.targetIllumination = Math.max(0, this.targetIllumination);
      this.targetSize = Math.max(this.defaultSize, this.targetSize);
      
      // Update vertices with new size
      this.vertices = this.calculateVertices();
    }

    illuminate(intensity) {
      this.targetIllumination = Math.max(this.targetIllumination, intensity);
      this.flowIntensity = intensity;
      this.lastFlowTime = p5.frameCount;
      this.isInfluenced = true; // Mark as influenced when illuminated
    }

    grow(intensity) {
      // Increase size based on particle intensity
      const maxGrowth = this.defaultSize * 1.5; // Reduced from 2x to 1.5x
      const growthAmount = this.defaultSize + (intensity * maxGrowth);
      this.targetSize = Math.max(this.targetSize, growthAmount);
      this.lastFlowTime = p5.frameCount;
      this.isInfluenced = true; // Mark as influenced when growing
    }

    shrink() {
      // Actively shrink back to default size
      this.targetSize = this.defaultSize;
      this.targetIllumination *= 0.95; // Gradually reduce illumination
      this.isInfluenced = false; // Return to uninfluenced state (dark grey)
    }

    show(p5) {
      // Calculate size ratio and alpha for glow intensity
      const sizeRatio = this.currentSize / this.defaultSize;
      const glowIntensity = this.illumination * 0.8 + (sizeRatio - 1) * 0.4;
      let alpha = glowIntensity * 255;
      
      // Add some variation to opacity based on position and time (like spirograph)
      alpha += p5.sin(this.x * 0.01 + time) * 20;
      alpha = p5.constrain(alpha, 0, 255);
      
      // Choose color based on influence state
      let r, g, b;
      if (this.isInfluenced) {
        // Smooth color transition like spirograph for influenced hexagons
        const color1 = synthwaveColors[this.colorIndex];
        const color2 = synthwaveColors[(this.colorIndex + 1) % synthwaveColors.length];
        
        r = p5.lerp(color1[0], color2[0], this.colorProgress);
        g = p5.lerp(color1[1], color2[1], this.colorProgress);
        b = p5.lerp(color1[2], color2[2], this.colorProgress);
      } else {
        // Dark grey for uninfluenced hexagons
        r = 40;
        g = 40;
        b = 40;
      }
      
      // Neon glow effect with multiple stroke layers
      p5.noFill();
      
      // Outer glow (largest, most transparent)
      p5.stroke(r, g, b, 1);
      p5.strokeWeight(1);
      p5.beginShape();
      this.vertices.forEach(vertex => {
        p5.vertex(vertex.x, vertex.y);
      });
      p5.endShape(p5.CLOSE);
      
      // Middle glow
      p5.stroke(r, g, b, 0.1);
      p5.beginShape();
      this.vertices.forEach(vertex => {
        p5.vertex(vertex.x, vertex.y);
      });
      p5.endShape(p5.CLOSE);
      
      // Inner glow (brightest, thinnest)
      p5.stroke(r, g, b, 0.1);
      // p5.strokeWeight(2 + (sizeRatio - 1) * 1);
      p5.beginShape();
      this.vertices.forEach(vertex => {
        p5.vertex(vertex.x, vertex.y);
      });
      p5.endShape(p5.CLOSE);
    }

    containsPoint(x, y) {
      // Check if point is inside hexagon
      let inside = false;
      for (let i = 0, j = this.vertices.length - 1; i < this.vertices.length; j = i++) {
        const xi = this.vertices[i].x;
        const yi = this.vertices[i].y;
        const xj = this.vertices[j].x;
        const yj = this.vertices[j].y;
        
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
          inside = !inside;
        }
      }
      return inside;
    }
  }

  class FlowParticle {
    constructor(p5) {
      this.pos = p5.createVector(p5.random(p5.width), p5.random(p5.height));
      this.vel = p5.createVector(0, 0);
      this.acc = p5.createVector(0, 0);
      this.maxSpeed = p5.random(2, 4);
      this.life = 1.0;
      this.age = 0;
      this.maxAge = p5.random(200, 400);
      this.influencedHexagons = new Set(); // Track which hexagons this particle influences
    }

    update(p5) {
      this.age++;
      this.life = 1.0 - (this.age / this.maxAge);

      // Clear previous influence tracking
      this.influencedHexagons.clear();

      // Apply flow field forces
      this.applyFlowField(p5);

      // Update physics
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);

      // Illuminate nearby hexagons
      this.illuminateHexagons(p5);

      // Wrap around edges
      if (this.pos.x > p5.width) this.pos.x = 0;
      if (this.pos.x < 0) this.pos.x = p5.width;
      if (this.pos.y > p5.height) this.pos.y = 0;
      if (this.pos.y < 0) this.pos.y = p5.height;
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

    illuminateHexagons(p5) {
      const illuminationRadius = hexSize * 2; // Increased radius for smaller hexagons
      
      hexagons.forEach(hex => {
        const dist = p5.dist(this.pos.x, this.pos.y, hex.x, hex.y);
        if (dist < illuminationRadius) {
          const intensity = this.life * p5.map(dist, 0, illuminationRadius, 1, 0, true);
          hex.illuminate(intensity);
          hex.grow(intensity); // Add size growth effect
          this.influencedHexagons.add(hex); // Track this hexagon as influenced
        }
      });
    }

    isDead() {
      return this.life <= 0;
    }
  }

  const createHexagonalGrid = (p5) => {
    hexagons = [];
    const hexWidth = hexSize * 2;
    const hexHeight = hexSize * Math.sqrt(3);
    
    for (let y = 0; y < p5.height + hexHeight; y += hexHeight * 0.75) {
      for (let x = 0; x < p5.width + hexWidth; x += hexWidth * 0.75) {
        const offsetX = (y % (hexHeight * 1.5) < hexHeight * 0.75) ? 0 : hexWidth * 0.375;
        const hexX = x + offsetX;
        const hexY = y;
        
        // Only add hexagons that are at least partially visible
        if (hexX > -hexSize && hexX < p5.width + hexSize && 
            hexY > -hexSize && hexY < p5.height + hexSize) {
          hexagons.push(new Hexagon(p5, hexX, hexY, hexSize * 0.2)); // Reduced from 0.3 to 0.2
        }
      }
    }
  };

  const createTriangularGrid = (p5) => {
    gridPoints = [];
    const triSize = gridSize;
    const triHeight = triSize * Math.sqrt(3) / 2;
    
    for (let y = 0; y < p5.height + triHeight; y += triHeight) {
      for (let x = 0; x < p5.width + triSize; x += triSize) {
        // Upward triangle
        gridPoints.push({
          x: x,
          y: y,
          type: 'tri-up'
        });
        
        // Downward triangle
        gridPoints.push({
          x: x + triSize / 2,
          y: y + triHeight / 2,
          type: 'tri-down'
        });
      }
    }
  };

  const createCircularGrid = (p5) => {
    gridPoints = [];
    const centerX = p5.width / 2;
    const centerY = p5.height / 2;
    const maxRadius = Math.max(p5.width, p5.height) / 2;
    
    // Create concentric circles
    for (let radius = gridSize; radius < maxRadius; radius += gridSize) {
      const circumference = 2 * Math.PI * radius;
      const pointsOnCircle = Math.floor(circumference / gridSize);
      
      for (let i = 0; i < pointsOnCircle; i++) {
        const angle = (i / pointsOnCircle) * Math.PI * 2;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        gridPoints.push({
          x: x,
          y: y,
          type: 'circle',
          radius: radius,
          angle: angle
        });
      }
    }
  };

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    
    if (isFullscreen) {
      canvas.class('canvas-container fullscreen');
      canvas.elt.classList.add('fullscreen');
    } else {
      canvas.class('canvas-container');
    }
    
    p5.frameRate(10); // Slow down animation for more gradual transitions
    p5.colorMode(p5.RGB, 255, 255, 255, 1);
    p5.background(0, 0, 0);
    
    // Create hexagonal grid
    createHexagonalGrid(p5);
    
    // Initialize flow particles
    for (let i = 0; i < 100; i++) {
      flowParticles.push(new FlowParticle(p5));
    }
  };

  const draw = (p5) => {
    // Redraw canvas at initial state each frame - pure black for neon effect
    p5.background(0, 0, 0);

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

    // Update flow particles (invisible, only affect hexagon lighting)
    influencedHexagons.clear(); // Clear previous frame's influence tracking
    
    for (let i = flowParticles.length - 1; i >= 0; i--) {
      flowParticles[i].update(p5);
      
      // Add this particle's influenced hexagons to the global set
      flowParticles[i].influencedHexagons.forEach(hex => {
        influencedHexagons.add(hex);
      });
      
      // Remove dead particles and add new ones
      if (flowParticles[i].isDead()) {
        flowParticles.splice(i, 1);
        flowParticles.push(new FlowParticle(p5));
      }
    }

    // Update and show hexagons
    hexagons.forEach(hex => {
      // If hexagon is not being influenced by any particle, force it to shrink
      if (!influencedHexagons.has(hex)) {
        hex.shrink();
      }
      hex.update(p5);
      hex.show(p5);
    });

    time += 0.02;
  };

  const drawHexagon = (p5, x, y, size) => {
    p5.beginShape();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const px = x + Math.cos(angle) * size;
      const py = y + Math.sin(angle) * size;
      p5.vertex(px, py);
    }
    p5.endShape(p5.CLOSE);
  };

  const drawTriangle = (p5, x, y, size, upward) => {
    p5.beginShape();
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2 + (upward ? 0 : Math.PI);
      const px = x + Math.cos(angle) * size;
      const py = y + Math.sin(angle) * size;
      p5.vertex(px, py);
    }
    p5.endShape(p5.CLOSE);
  };

  const mouseMoved = (p5) => {
    mouseX = p5.mouseX;
    mouseY = p5.mouseY;
  };

  return <Sketch setup={setup} draw={draw} mouseMoved={mouseMoved} />;
};

export default ParticleFlowGen6; 