import React, { useState } from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const GenFlower2 = ({ isFullscreen = false }) => {
  // Array to store multiple natural elements
  const vines = [];
  const pollen = [];
  const bioluminescent = [];
  let lastSpawnTime = 0;
  const SPAWN_INTERVAL = 800; // Spawn new elements every 0.8 seconds
  const TOTAL_RUNTIME = 60000; // 1 minute total runtime
  let startTime = 0;
  let isPaused = false;
  let elementCount = 0;
  let canopyNoiseOffset = 0;
  let currentCanopyIndex = 0;
  let elementsPerLayer = 35;
  let canopyLayers = [];
  let layerElements = [];
  let totalElementsDrawn = 0;
  const MAX_TOTAL_ELEMENTS = 25;
  
  // Rainforest environment variables
  let humidity = 0.7;
  let temperature = 0.8;
  let windX = 0;
  let windY = 0;
  let time = 0;
  let rainIntensity = 0.3;
  let sunlightAngle = 0;

  class Vine {
    constructor(p5, layerIndex = 0) {
      this.angle = 0;
      this.length = 0;
      this.layerIndex = layerIndex;
      this.noiseOffset = p5.random(1000);
      this.colorOffset = p5.random(1000);
      this.startTime = p5.millis();
      
      // Calculate position based on element count
      const maxOffset = p5.width / 2 - 150;
      const spacing = maxOffset / 4;
      const offset = p5.constrain(p5.random(0, Math.floor(elementCount / 4) * spacing), 0, p5.windowWidth/2);
      this.centerX = p5.constrain(
        elementCount % 2 === 0 ? offset : -offset,
        -maxOffset,
        maxOffset
      );
      this.baseY = p5.random(-100, -50);
      this.centerY = this.baseY;
      
      this.swayAngle = 0;
      this.verticalAngle = p5.random(p5.TWO_PI);
      this.points = [];
      
      // Vine-specific parameters
      this.swaySpeed = p5.random(0.02, 0.15);
      this.swayAmplitude = p5.random(20, 50);
      this.swayOffset = p5.random(p5.TWO_PI);
      this.growthSpeed = p5.random(0.5, 2.0);
      this.maxLength = p5.random(200, 400);
      this.thickness = p5.random(2, 6);
      this.leafSpacing = p5.random(30, 80);
      this.leafSize = p5.random(8, 20);
      
      elementCount++;
    }

    drawVine(p5) {
      // Calculate points along the vine path
      const steps = 150;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const currentLength = this.length * t;
        
        // Linear interpolation from vine top to current length
        const baseX = this.centerX;
        const y = p5.lerp(this.centerY, this.centerY + currentLength, t);
        
        // Add sine wave variation for natural sway
        const sineOffset = p5.sin(this.swayAngle * this.swaySpeed + this.swayOffset + t * p5.PI * 3) * this.swayAmplitude;
        
        // Add wind effect
        const windEffect = windX * t * 20;
        
        // Calculate layer-based color variation
        const layerProgress = this.layerIndex / 6;
        const baseHue = p5.map(layerProgress, 0, 1, 120, 140); // Green to blue-green
        const baseSaturation = p5.map(layerProgress, 0, 1, 70, 50);
        const baseBrightness = p5.map(layerProgress, 0, 1, 30, 60);
        
        // Calculate color based on position along vine
        const hue = p5.lerp(baseHue, baseHue + 15, t);
        const saturation = p5.lerp(baseSaturation, baseSaturation - 10, t);
        const brightness = p5.lerp(baseBrightness, baseBrightness + 30, t);
        
        p5.stroke(hue, saturation, brightness);
        p5.strokeWeight(this.thickness * (1 - t * 0.5)); // Thinner towards bottom
        
        // Draw point with combined effects
        p5.point(baseX + sineOffset + windEffect, y);
        
        // Add leaves at intervals
        if (i % Math.floor(this.leafSpacing) === 0 && t > 0.1) {
          this.drawLeaf(p5, baseX + sineOffset + windEffect, y, t);
        }
      }
      
      // Increment sway angle for animation
      this.swayAngle += 0.03;
    }

    drawLeaf(p5, x, y, t) {
      const leafAngle = p5.sin(this.swayAngle * 2 + this.swayOffset) * 0.3;
      const leafSize = this.leafSize * (1 - t * 0.3);
      
      // Leaf color - slightly different from vine
      const layerProgress = this.layerIndex / 6;
      const leafHue = p5.map(layerProgress, 0, 1, 110, 130);
      const leafSaturation = p5.map(layerProgress, 0, 1, 80, 60);
      const leafBrightness = p5.map(layerProgress, 0, 1, 50, 80);
      
      p5.push();
      p5.translate(x, y);
      p5.rotate(leafAngle);
      
      // Draw leaf as an oval
      p5.stroke(leafHue, leafSaturation, leafBrightness);
      p5.strokeWeight(1);
      p5.fill(leafHue, leafSaturation, leafBrightness + 10);
      p5.ellipse(0, 0, leafSize, leafSize * 0.6);
      
      // Add leaf vein
      p5.stroke(leafHue, leafSaturation, leafBrightness - 20);
      p5.strokeWeight(0.5);
      p5.line(0, -leafSize * 0.3, 0, leafSize * 0.3);
      
      p5.pop();
    }

    update(p5) {
      // Update vertical position with gentle sway
      this.verticalAngle += 0.015;
      this.centerY = this.baseY + p5.sin(this.verticalAngle) * 15;

      // Grow the vine
      if (this.length < this.maxLength) {
        this.length += this.growthSpeed;
      }

      // Calculate noise-based radius variation for vine segments
      const noiseVal = p5.noise(this.noiseOffset) * 30;
      const radiusVariation = p5.sin(this.angle * 0.3) * 20;
      
      // Calculate layer-based scaling
      const layerScale = p5.map(this.layerIndex, 0, 6, 0.4, 1.6);
      
      // Calculate current radius
      this.radius = (3 + this.angle * 0.3 + noiseVal + radiusVariation) * layerScale / 8;

      // Calculate base position on vine
      const baseX = this.centerX + this.radius * p5.cos(this.angle);
      const baseY = this.centerY + this.radius * p5.sin(this.angle);

      // Calculate layer-based brightness variation
      const layerProgress = this.layerIndex / 6;
      const baseBrightness = p5.map(layerProgress, 0, 1, 30, 90);
      
      // Calculate color based on angle and noise
      const hue = (this.angle * 3 + this.colorOffset) % 360;
      const saturation = 70 + p5.noise(this.noiseOffset + 100) * 30;
      const brightness = baseBrightness + p5.noise(this.noiseOffset + 200) * 25;
      
      // Store the point
      if (this.points.length < 250) {
        this.points.push({
          baseX: baseX,
          baseY: baseY,
          hue: hue,
          saturation: saturation,
          brightness: brightness
        });
      }

      // Draw all stored points with current sway
      this.points.forEach(point => {
        const swayAmount = p5.sin(this.swayAngle * this.swaySpeed + this.swayOffset) * this.swayAmplitude;
        p5.stroke(point.hue, point.saturation, point.brightness);
        p5.strokeWeight(this.thickness * 0.8);
        p5.point(point.baseX + swayAmount, point.baseY);
      });

      // Increment angle and noise offset
      this.angle -= 0.2;
      this.noiseOffset += 0.015;
      this.colorOffset += 0.8;

      return true;
    }
  }

  class Pollen {
    constructor(p5, layerIndex = 0) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.vel = p5.createVector(
        p5.random(-0.5, 0.5),
        p5.random(-0.3, 0.3)
      );
      this.acc = p5.createVector(0, 0);
      this.layerIndex = layerIndex;
      this.lifespan = 255;
      this.size = p5.random(2, 8);
      this.noiseOffset = p5.random(1000);
      this.phase = p5.random(p5.TWO_PI);
      this.rotationSpeed = p5.random(0.02, 0.08);
      this.glowIntensity = p5.random(0.3, 1.0);
      
      // Pollen-specific properties
      this.pollenType = p5.random(['dust', 'spore', 'fluff']);
      this.floatSpeed = p5.random(0.5, 2.0);
      this.windSensitivity = p5.random(0.5, 1.5);
    }

    update(p5) {
      // Add wind effect
      this.acc.add(windX * this.windSensitivity * 0.1, windY * this.windSensitivity * 0.1);
      
      // Add gentle floating motion
      const floatX = p5.sin(this.phase + this.noiseOffset) * 0.2;
      const floatY = p5.cos(this.phase + this.noiseOffset) * 0.2;
      this.acc.add(floatX, floatY);
      
      // Update velocity and position
      this.vel.add(this.acc);
      this.vel.limit(1.5);
      this.pos.add(this.vel);
      
      // Reset acceleration
      this.acc.mult(0);
      
      // Update noise and phase
      this.noiseOffset += 0.02;
      this.phase += this.rotationSpeed;
      
      // Decrease lifespan
      this.lifespan -= 0.5;
      
      // Wrap around screen
      if (this.pos.x < -p5.width/2) this.pos.x = p5.width/2;
      if (this.pos.x > p5.width/2) this.pos.x = -p5.width/2;
      if (this.pos.y < -p5.height/2) this.pos.y = p5.height/2;
      if (this.pos.y > p5.height/2) this.pos.y = -p5.height/2;
    }

    show(p5) {
      p5.noStroke();
      
      // Calculate color based on pollen type and layer
      let r, g, b;
      const layerProgress = this.layerIndex / 6;
      
      switch (this.pollenType) {
        case 'dust':
          // Golden dust
          r = p5.lerp(200, 255, this.glowIntensity);
          g = p5.lerp(180, 220, this.glowIntensity);
          b = p5.lerp(100, 150, this.glowIntensity);
          break;
        case 'spore':
          // Green spores
          r = p5.lerp(100, 150, this.glowIntensity);
          g = p5.lerp(200, 255, this.glowIntensity);
          b = p5.lerp(100, 150, this.glowIntensity);
          break;
        case 'fluff':
          // White fluff
          r = g = b = p5.lerp(200, 255, this.glowIntensity);
          break;
        default:
          r = g = b = 255;
      }
      
      const alpha = p5.map(this.lifespan, 0, 255, 0, 0.8);
      
      // Draw glow effect
      p5.fill(r, g, b, alpha * 0.3);
      p5.circle(this.pos.x, this.pos.y, this.size * 3);
      
      // Draw main particle
      p5.fill(r, g, b, alpha);
      p5.circle(this.pos.x, this.pos.y, this.size);
      
      // Add sparkle effect
      if (p5.random() < 0.1) {
        p5.fill(255, 255, 255, alpha * 0.8);
        p5.circle(this.pos.x + p5.random(-this.size, this.size), 
                  this.pos.y + p5.random(-this.size, this.size), 1);
      }
    }

    isDead() {
      return this.lifespan <= 0;
    }
  }

  class Bioluminescent {
    constructor(p5, layerIndex = 0) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.layerIndex = layerIndex;
      this.noiseOffset = p5.random(1000);
      this.phase = p5.random(p5.TWO_PI);
      this.pulseSpeed = p5.random(0.02, 0.06);
      this.pulseAmplitude = p5.random(0.3, 0.8);
      this.size = p5.random(4, 12);
      this.glowRadius = p5.random(20, 60);
      
      // Bioluminescent properties
      this.bioType = p5.random(['fungus', 'moss', 'flower']);
      this.colorShift = p5.random(0, 360);
      this.intensity = p5.random(0.5, 1.0);
    }

    update(p5) {
      // Update pulse
      this.phase += this.pulseSpeed;
      
      // Update noise offset
      this.noiseOffset += 0.01;
      
      // Gentle movement
      this.pos.x += p5.sin(this.phase * 0.5) * 0.3;
      this.pos.y += p5.cos(this.phase * 0.5) * 0.3;
    }

    show(p5) {
      const pulse = p5.sin(this.phase) * this.pulseAmplitude + 0.5;
      const currentSize = this.size * pulse;
      const currentGlow = this.glowRadius * pulse;
      
      // Calculate color based on bio type
      let r, g, b;
      const layerProgress = this.layerIndex / 6;
      
      switch (this.bioType) {
        case 'fungus':
          // Blue-green glow
          r = p5.lerp(50, 100, pulse);
          g = p5.lerp(150, 255, pulse);
          b = p5.lerp(200, 255, pulse);
          break;
        case 'moss':
          // Green glow
          r = p5.lerp(100, 150, pulse);
          g = p5.lerp(200, 255, pulse);
          b = p5.lerp(100, 150, pulse);
          break;
        case 'flower':
          // Pink-purple glow
          r = p5.lerp(200, 255, pulse);
          g = p5.lerp(100, 150, pulse);
          b = p5.lerp(200, 255, pulse);
          break;
        default:
          r = g = b = 255;
      }
      
      // Draw outer glow
      p5.fill(r, g, b, 0.1 * pulse);
      p5.circle(this.pos.x, this.pos.y, currentGlow);
      
      // Draw inner glow
      p5.fill(r, g, b, 0.3 * pulse);
      p5.circle(this.pos.x, this.pos.y, currentGlow * 0.5);
      
      // Draw core
      p5.fill(r, g, b, 0.8 * pulse);
      p5.circle(this.pos.x, this.pos.y, currentSize);
      
      // Add sparkle
      if (p5.random() < 0.05) {
        p5.fill(255, 255, 255, pulse);
        p5.circle(this.pos.x + p5.random(-currentSize, currentSize), 
                  this.pos.y + p5.random(-currentSize, currentSize), 2);
      }
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
    p5.strokeWeight(2);
    p5.noFill();
    p5.colorMode(p5.HSB);
    startTime = p5.millis();
    
    // Generate initial canopy data
    generateCanopyData(p5);
    
    // Initialize layer elements
    layerElements = [];
    for (let i = 0; i < canopyLayers.length; i++) {
      if (layerElements.length < MAX_TOTAL_ELEMENTS) {
        layerElements.push(createLayerElements(p5, i));
      }
    }
  };

  const draw = (p5) => {
    // Update environment
    updateEnvironment(p5);
    
    // Clear background with rainforest atmosphere
    p5.fill(0, 0, 0, 0.1);
    p5.rect(0, 0, p5.width, p5.height);
    
    // Regenerate canopy data for animation
    generateCanopyData(p5);
    
    // Draw layers from back to front
    for (let i = 0; i < canopyLayers.length; i++) {
      const canopyData = canopyLayers[i];
      
      // Draw the canopy layer
      drawCanopyLayer(p5, canopyData);
      
      // Draw elements for this layer
      if (layerElements[i]) {
        p5.push();
        p5.translate(p5.width / 2, p5.height / 2);
        drawLayerElements(p5, layerElements[i]);
        p5.pop();
      }
    }
    
    // Draw rain effect
    drawRain(p5);
    
    // Draw sunlight rays
    drawSunlight(p5);
    
    p5.strokeWeight(2);
    p5.noFill();

    // Check if we should pause
    if (!isPaused && p5.millis() - startTime > TOTAL_RUNTIME) {
      isPaused = true;
      return;
    }

    // If paused, don't draw anything new
    if (isPaused) {
      return;
    }

    // Spawn new elements every SPAWN_INTERVAL milliseconds
    if (p5.millis() - lastSpawnTime > SPAWN_INTERVAL) {
      const nextLayer = (currentCanopyIndex % canopyLayers.length);
      lastSpawnTime = p5.millis();
      currentCanopyIndex++;
    }
  };

  const generateCanopyData = (p5) => {
    canopyLayers = [];
    const numCanopies = 6;
    const canopySpacing = p5.height / (numCanopies + 1);
    
    for (let canopy = 0; canopy < numCanopies; canopy++) {
      const baseY = canopySpacing * (canopy + 1);
      const canopyHeight = p5.map(canopy, 0, numCanopies - 1, 0.9, 0.3);
      const amplitude = p5.height * 0.2 * canopyHeight;
      
      const canopyPoints = [];
      for (let x = 0; x <= p5.width; x += 3) {
        const normalizedX = x / p5.width;
        const sineWave = p5.sin(normalizedX * p5.PI * 3 + canopy * 0.8) * amplitude;
        const noiseVal = p5.noise(
          normalizedX * 4 + canopyNoiseOffset * 0.002, 
          canopy * 0.8 + canopyNoiseOffset * 0.003
        ) * amplitude * 0.4;
        const y = baseY + sineWave + noiseVal;
        canopyPoints.push({ x, y });
      }
      
      canopyLayers.push({
        points: canopyPoints,
        baseY: baseY,
        index: canopy
      });
    }
    
    canopyNoiseOffset += 0.5;
  };

  const drawCanopyLayer = (p5, canopyData) => {
    // Calculate fill color based on layer position (dark green at top, light green at bottom)
    const layerProgress = canopyData.index / (canopyLayers.length - 1);
    const canopyHue = p5.map(layerProgress, 0, 1, 130, 150); // Dark green to light green
    const canopySaturation = p5.map(layerProgress, 0, 1, 90, 60);
    const canopyBrightness = p5.map(layerProgress, 0, 1, 15, 50);
    
    // Draw the canopy curve
    p5.stroke(canopyHue, canopySaturation, canopyBrightness + 10);
    p5.strokeWeight(1);
    p5.fill(canopyHue, canopySaturation, canopyBrightness);
    
    p5.beginShape();
    p5.vertex(0, 0);
    canopyData.points.forEach(point => {
      p5.vertex(point.x, point.y);
    });
    p5.vertex(p5.width, p5.height);
    p5.vertex(0, p5.height);
    p5.endShape(p5.CLOSE);
    
    // Draw foliage on the canopy
    drawFoliageOnCanopy(p5, canopyData);
  };

  const drawFoliageOnCanopy = (p5, canopyData) => {
    const time = p5.millis() * 0.000002;
    const foliageSpacing = 3;
    const maxFoliageSize = 8;
    
    // Calculate foliage color based on layer
    const layerProgress = canopyData.index / (canopyLayers.length - 1);
    const foliageHue = p5.map(layerProgress, 0, 1, 120, 140);
    const foliageSaturation = p5.map(layerProgress, 0, 1, 80, 60);
    const foliageBrightness = p5.map(layerProgress, 0, 1, 30, 70);
    
    p5.stroke(foliageHue, foliageSaturation, foliageBrightness);
    p5.strokeWeight(1);
    
    // Draw foliage along the canopy contour
    for (let i = 0; i < canopyData.points.length; i += foliageSpacing) {
      const point = canopyData.points[i];
      if (!point) continue;
      
      // Calculate foliage properties
      const foliageSize = p5.random(maxFoliageSize * 0.5, maxFoliageSize);
      const swaySpeed = p5.random(0.01, 0.05);
      const swayAmplitude = p5.random(0.2, 1.0);
      const swayOffset = p5.random(p5.TWO_PI);
      
      // Calculate sway motion
      const swayX = p5.sin(time * swaySpeed + swayOffset) * swayAmplitude;
      
      // Draw the foliage as small circles
      p5.fill(foliageHue, foliageSaturation, foliageBrightness + 10);
      p5.circle(point.x + swayX, point.y, foliageSize);
      
      // Add highlight
      p5.fill(foliageHue, foliageSaturation, foliageBrightness + 30);
      p5.circle(point.x + swayX - foliageSize * 0.3, point.y - foliageSize * 0.3, foliageSize * 0.4);
    }
  };

  const createLayerElements = (p5, layerIndex) => {
    const layerElements = [];
    
    // Skip the first canopy layer (no elements on layer 0)
    if (layerIndex < 1) {
      return layerElements;
    }
    if (layerIndex > 5) {
      return layerElements;
    }
    
    for (let i = 0; i < elementsPerLayer; i++) {
      const elementType = p5.random(['vine', 'pollen', 'bioluminescent']);
      
      switch (elementType) {
        case 'vine':
          const vine = new Vine(p5, layerIndex);
          layerElements.push(vine);
          break;
        case 'pollen':
          const pollen = new Pollen(p5, layerIndex);
          layerElements.push(pollen);
          break;
        case 'bioluminescent':
          const bio = new Bioluminescent(p5, layerIndex);
          layerElements.push(bio);
          break;
      }
    }
    return layerElements;
  };

  const drawLayerElements = (p5, layerElements) => {
    layerElements.forEach(element => {
      if (element instanceof Vine) {
        element.update(p5);
        element.drawVine(p5);
      } else if (element instanceof Pollen) {
        element.update(p5);
        element.show(p5);
      } else if (element instanceof Bioluminescent) {
        element.update(p5);
        element.show(p5);
      }
    });
  };

  const updateEnvironment = (p5) => {
    time += 0.01;
    
    // Update environmental conditions
    humidity = p5.noise(time * 0.3) * 0.3 + 0.6;
    temperature = p5.noise(time * 0.2 + 1000) * 0.2 + 0.7;
    windX = p5.noise(time * 0.5 + 2000) * 0.5 - 0.25;
    windY = p5.noise(time * 0.5 + 3000) * 0.5 - 0.25;
    rainIntensity = p5.noise(time * 0.1 + 4000) * 0.4 + 0.2;
    sunlightAngle = p5.sin(time * 0.05) * 0.3;
  };

  const drawRain = (p5) => {
    if (rainIntensity > 0.1) {
      p5.stroke(200, 200, 255, rainIntensity * 0.3);
      p5.strokeWeight(1);
      
      for (let i = 0; i < 50 * rainIntensity; i++) {
        const x = p5.random(p5.width);
        const y = p5.random(p5.height);
        const length = p5.random(10, 30);
        const angle = p5.PI / 2 + p5.random(-0.1, 0.1);
        
        p5.push();
        p5.translate(x, y);
        p5.rotate(angle);
        p5.line(0, 0, 0, length);
        p5.pop();
      }
    }
  };

  const drawSunlight = (p5) => {
    const sunX = p5.width * 0.8;
    const sunY = p5.height * 0.2;
    
    p5.stroke(60, 20, 100, 0.1);
    p5.strokeWeight(2);
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * p5.PI + sunlightAngle;
      const length = p5.width * 0.8;
      
      p5.push();
      p5.translate(sunX, sunY);
      p5.rotate(angle);
      p5.line(0, 0, length, 0);
      p5.pop();
    }
  };

  const mousePressed = (p5) => {
    // Add interactive elements on click
    const mouseX = p5.mouseX - p5.width / 2;
    const mouseY = p5.mouseY - p5.height / 2;
    
    // Create a burst of pollen at click location
    for (let i = 0; i < 5; i++) {
      const pollen = new Pollen(p5, 3);
      pollen.pos.set(mouseX, mouseY);
      pollen.vel.set(p5.random(-2, 2), p5.random(-2, 2));
      layerElements[3].push(pollen);
    }
  };

  const mouseMoved = (p5) => {
    // Gentle wind effect based on mouse movement
    windX = (p5.mouseX - p5.width / 2) / p5.width * 0.1;
    windY = (p5.mouseY - p5.height / 2) / p5.height * 0.1;
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
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

export default GenFlower2; 