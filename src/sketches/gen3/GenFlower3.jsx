import React, { useState } from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const GenFlower3 = ({ isFullscreen = false }) => {
  // 3D terrain and camera variables
  let cameraX = 0;
  let cameraY = 0;
  let cameraZ = 0;
  let cameraSpeed = 2;
  let terrainWidth = 2000;
  let terrainHeight = 1000;
  let terrainResolution = 50;
  let terrainPoints = [];
  let time = 0;
  let windX = 0;
  let windY = 0;
  let sunAngle = 0;
  let cloudCover = 0.3;
  
  // Terrain generation variables
  let noiseOffset = 0;
  let hillAmplitude = 200;
  let hillFrequency = 0.02;
  let detailNoise = 0.05;
  
  // Flying elements
  let birds = [];
  let clouds = [];
  let particles = [];
  
  // Camera movement
  let targetCameraY = 0;
  let cameraSmoothness = 0.05;
  let flightPath = [];
  let pathIndex = 0;

  class Bird {
    constructor(p5) {
      this.pos = p5.createVector(
        p5.random(-terrainWidth/2, terrainWidth/2),
        p5.random(50, 200),
        p5.random(-terrainHeight/2, terrainHeight/2)
      );
      this.vel = p5.createVector(
        p5.random(-1, 1),
        p5.random(-0.5, 0.5),
        p5.random(-1, 1)
      );
      this.wingAngle = 0;
      this.wingSpeed = p5.random(0.1, 0.3);
      this.size = p5.random(3, 8);
      this.color = p5.color(p5.random(200, 255), p5.random(150, 200), p5.random(100, 150));
    }

    update(p5) {
      // Update position
      this.pos.add(this.vel);
      
      // Add wind effect
      this.vel.x += windX * 0.1;
      this.vel.y += windY * 0.1;
      
      // Limit speed
      this.vel.limit(2);
      
      // Wrap around terrain
      if (this.pos.x < -terrainWidth/2) this.pos.x = terrainWidth/2;
      if (this.pos.x > terrainWidth/2) this.pos.x = -terrainWidth/2;
      if (this.pos.z < -terrainHeight/2) this.pos.z = terrainHeight/2;
      if (this.pos.z > terrainHeight/2) this.pos.z = -terrainHeight/2;
      
      // Update wing animation
      this.wingAngle += this.wingSpeed;
    }

    draw(p5) {
      // Convert 3D position to 2D screen coordinates
      const screenX = p5.map(this.pos.x - cameraX, -terrainWidth/2, terrainWidth/2, 0, p5.width);
      const screenY = p5.map(this.pos.z - cameraZ, -terrainHeight/2, terrainHeight/2, 0, p5.height);
      const scale = p5.map(this.pos.y, 0, 300, 0.5, 2);
      
      if (screenX >= -50 && screenX <= p5.width + 50 && screenY >= -50 && screenY <= p5.height + 50) {
        p5.push();
        p5.translate(screenX, screenY);
        p5.scale(scale);
        
        // Draw bird body
        p5.fill(this.color);
        p5.noStroke();
        p5.ellipse(0, 0, this.size, this.size * 0.6);
        
        // Draw wings
        const wingSpread = p5.sin(this.wingAngle) * 0.3 + 0.7;
        p5.fill(p5.red(this.color) * 0.8, p5.green(this.color) * 0.8, p5.blue(this.color) * 0.8);
        p5.ellipse(-this.size * 0.8, -this.size * 0.3 * wingSpread, this.size * 0.6, this.size * 0.4);
        p5.ellipse(this.size * 0.8, -this.size * 0.3 * wingSpread, this.size * 0.6, this.size * 0.4);
        
        p5.pop();
      }
    }
  }

  class Cloud {
    constructor(p5) {
      this.pos = p5.createVector(
        p5.random(-terrainWidth/2, terrainWidth/2),
        p5.random(100, 300),
        p5.random(-terrainHeight/2, terrainHeight/2)
      );
      this.vel = p5.createVector(p5.random(-0.5, 0.5), 0, p5.random(-0.5, 0.5));
      this.size = p5.random(30, 80);
      this.opacity = p5.random(0.3, 0.7);
      this.detail = p5.random(3, 6);
    }

    update(p5) {
      this.pos.add(this.vel);
      
      // Wrap around terrain
      if (this.pos.x < -terrainWidth/2) this.pos.x = terrainWidth/2;
      if (this.pos.x > terrainWidth/2) this.pos.x = -terrainWidth/2;
      if (this.pos.z < -terrainHeight/2) this.pos.z = terrainHeight/2;
      if (this.pos.z > terrainHeight/2) this.pos.z = -terrainHeight/2;
    }

    draw(p5) {
      const screenX = p5.map(this.pos.x - cameraX, -terrainWidth/2, terrainWidth/2, 0, p5.width);
      const screenY = p5.map(this.pos.z - cameraZ, -terrainHeight/2, terrainHeight/2, 0, p5.height);
      const scale = p5.map(this.pos.y, 0, 400, 0.3, 1.5);
      
      if (screenX >= -100 && screenX <= p5.width + 100 && screenY >= -100 && screenY <= p5.height + 100) {
        p5.push();
        p5.translate(screenX, screenY);
        p5.scale(scale);
        
        // Draw cloud as multiple overlapping circles
        p5.fill(255, 255, 255, this.opacity * 255);
        p5.noStroke();
        
        for (let i = 0; i < this.detail; i++) {
          const offsetX = p5.random(-this.size * 0.3, this.size * 0.3);
          const offsetY = p5.random(-this.size * 0.3, this.size * 0.3);
          const cloudSize = this.size * p5.random(0.6, 1.2);
          p5.circle(offsetX, offsetY, cloudSize);
        }
        
        p5.pop();
      }
    }
  }

  class TerrainParticle {
    constructor(p5, x, z) {
      this.x = x;
      this.z = z;
      this.y = 0;
      this.size = p5.random(2, 6);
      this.color = p5.color(
        p5.random(100, 150),
        p5.random(150, 200),
        p5.random(50, 100)
      );
      this.windEffect = p5.random(0.5, 1.5);
      this.life = 255;
      this.decay = p5.random(1, 3);
    }

    update(p5) {
      this.life -= this.decay;
      
      // Add wind effect
      this.x += windX * this.windEffect;
      this.z += windY * this.windEffect;
      
      // Update Y based on terrain height
      this.y = getTerrainHeight(p5, this.x, this.z);
    }

    draw(p5) {
      if (this.life > 0) {
        const screenX = p5.map(this.x - cameraX, -terrainWidth/2, terrainWidth/2, 0, p5.width);
        const screenY = p5.map(this.z - cameraZ, -terrainHeight/2, terrainHeight/2, 0, p5.height);
        
        if (screenX >= 0 && screenX <= p5.width && screenY >= 0 && screenY <= p5.height) {
          const alpha = p5.map(this.life, 0, 255, 0, 255);
          p5.fill(p5.red(this.color), p5.green(this.color), p5.blue(this.color), alpha);
          p5.noStroke();
          p5.circle(screenX, screenY, this.size);
        }
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
    
    p5.background(135, 206, 235); // Sky blue
    p5.colorMode(p5.RGB);
    
    // Initialize camera position
    cameraX = 0;
    cameraY = 150;
    cameraZ = 0;
    
    // Generate initial terrain
    generateTerrain(p5);
    
    // Initialize flying elements
    for (let i = 0; i < 15; i++) {
      birds.push(new Bird(p5));
    }
    
    for (let i = 0; i < 8; i++) {
      clouds.push(new Cloud(p5));
    }
    
    // Generate flight path
    generateFlightPath(p5);
  };

  const draw = (p5) => {
    // Update time and environment
    time += 0.01;
    updateEnvironment(p5);
    
    // Update camera position along flight path
    updateCamera(p5);
    
    // Clear background with sky gradient
    drawSky(p5);
    
    // Draw terrain
    drawTerrain(p5);
    
    // Update and draw flying elements
    birds.forEach(bird => {
      bird.update(p5);
      bird.draw(p5);
    });
    
    clouds.forEach(cloud => {
      cloud.update(p5);
      cloud.draw(p5);
    });
    
    // Update and draw particles
    particles = particles.filter(particle => {
      particle.update(p5);
      particle.draw(p5);
      return !particle.isDead();
    });
    
    // Add new particles occasionally
    if (p5.random() < 0.1) {
      const x = p5.random(-terrainWidth/2, terrainWidth/2);
      const z = p5.random(-terrainHeight/2, terrainHeight/2);
      particles.push(new TerrainParticle(p5, x, z));
    }
    
    // Draw sun
    drawSun(p5);
    
    // Draw UI elements
    drawUI(p5);
  };

  const generateTerrain = (p5) => {
    terrainPoints = [];
    
    for (let x = -terrainWidth/2; x <= terrainWidth/2; x += terrainResolution) {
      const row = [];
      for (let z = -terrainHeight/2; z <= terrainHeight/2; z += terrainResolution) {
        const y = getTerrainHeight(p5, x, z);
        row.push({ x, y, z });
      }
      terrainPoints.push(row);
    }
  };

  const getTerrainHeight = (p5, x, z) => {
    // Large hills
    const largeHills = p5.noise(x * hillFrequency, z * hillFrequency, noiseOffset) * hillAmplitude;
    
    // Medium detail
    const mediumDetail = p5.noise(x * detailNoise, z * detailNoise, noiseOffset + 1000) * 50;
    
    // Small detail
    const smallDetail = p5.noise(x * detailNoise * 2, z * detailNoise * 2, noiseOffset + 2000) * 20;
    
    return largeHills + mediumDetail + smallDetail;
  };

  const generateFlightPath = (p5) => {
    flightPath = [];
    const numPoints = 100;
    
    for (let i = 0; i < numPoints; i++) {
      const t = i / numPoints;
      const angle = t * p5.TWO_PI * 2; // Two full rotations
      
      const radius = 300 + p5.sin(t * p5.PI * 4) * 100; // Varying radius
      const x = p5.cos(angle) * radius;
      const z = p5.sin(angle) * radius;
      const y = 150 + p5.sin(t * p5.PI * 6) * 50; // Varying height
      
      flightPath.push({ x, y, z });
    }
  };

  const updateCamera = (p5) => {
    // Move along flight path
    pathIndex += 0.005;
    if (pathIndex >= flightPath.length) {
      pathIndex = 0;
    }
    
    const currentPoint = flightPath[Math.floor(pathIndex)];
    const nextPoint = flightPath[Math.floor(pathIndex + 1) % flightPath.length];
    
    // Interpolate between points for smooth movement
    const t = pathIndex % 1;
    cameraX = p5.lerp(currentPoint.x, nextPoint.x, t);
    cameraY = p5.lerp(currentPoint.y, nextPoint.y, t);
    cameraZ = p5.lerp(currentPoint.z, nextPoint.z, t);
    
    // Add terrain following
    const terrainY = getTerrainHeight(p5, cameraX, cameraZ);
    targetCameraY = terrainY + 100;
    cameraY = p5.lerp(cameraY, targetCameraY, cameraSmoothness);
  };

  const updateEnvironment = (p5) => {
    // Update wind
    windX = p5.noise(time * 0.5) * 2 - 1;
    windY = p5.noise(time * 0.5 + 1000) * 2 - 1;
    
    // Update sun angle
    sunAngle = p5.sin(time * 0.02) * 0.3;
    
    // Update terrain noise
    noiseOffset += 0.01;
  };

  const drawSky = (p5) => {
    // Sky gradient
    for (let y = 0; y < p5.height; y++) {
      const inter = p5.map(y, 0, p5.height, 0, 1);
      const c = p5.lerpColor(
        p5.color(135, 206, 235), // Sky blue
        p5.color(255, 255, 255), // White
        inter
      );
      p5.stroke(c);
      p5.line(0, y, p5.width, y);
    }
  };

  const drawTerrain = (p5) => {
    // Draw terrain as colored rectangles
    for (let i = 0; i < terrainPoints.length - 1; i++) {
      for (let j = 0; j < terrainPoints[i].length - 1; j++) {
        const p1 = terrainPoints[i][j];
        const p2 = terrainPoints[i + 1][j];
        const p3 = terrainPoints[i + 1][j + 1];
        const p4 = terrainPoints[i][j + 1];
        
        // Convert 3D points to 2D screen coordinates
        const screenX1 = p5.map(p1.x - cameraX, -terrainWidth/2, terrainWidth/2, 0, p5.width);
        const screenY1 = p5.map(p1.z - cameraZ, -terrainHeight/2, terrainHeight/2, 0, p5.height);
        const screenX2 = p5.map(p2.x - cameraX, -terrainWidth/2, terrainWidth/2, 0, p5.width);
        const screenY2 = p5.map(p2.z - cameraZ, -terrainHeight/2, terrainHeight/2, 0, p5.height);
        const screenX3 = p5.map(p3.x - cameraX, -terrainWidth/2, terrainWidth/2, 0, p5.width);
        const screenY3 = p5.map(p3.z - cameraZ, -terrainHeight/2, terrainHeight/2, 0, p5.height);
        const screenX4 = p5.map(p4.x - cameraX, -terrainWidth/2, terrainWidth/2, 0, p5.width);
        const screenY4 = p5.map(p4.z - cameraZ, -terrainHeight/2, terrainHeight/2, 0, p5.height);
        
        // Only draw if on screen
        if (screenX1 >= -100 && screenX1 <= p5.width + 100 && 
            screenY1 >= -100 && screenY1 <= p5.height + 100) {
          
          // Calculate average height for color
          const avgHeight = (p1.y + p2.y + p3.y + p4.y) / 4;
          
          // Color based on height
          let terrainColor;
          if (avgHeight < 50) {
            // Water/low areas
            terrainColor = p5.color(100, 150, 200);
          } else if (avgHeight < 100) {
            // Grass
            terrainColor = p5.color(100, 200, 100);
          } else if (avgHeight < 150) {
            // Forest
            terrainColor = p5.color(50, 150, 50);
          } else {
            // Mountain
            terrainColor = p5.color(150, 150, 150);
          }
          
          // Add lighting based on sun angle
          const lighting = p5.map(avgHeight, 0, 200, 0.3, 1.0);
          terrainColor = p5.color(
            p5.red(terrainColor) * lighting,
            p5.green(terrainColor) * lighting,
            p5.blue(terrainColor) * lighting
          );
          
          p5.fill(terrainColor);
          p5.noStroke();
          
          // Draw terrain quad
          p5.beginShape();
          p5.vertex(screenX1, screenY1);
          p5.vertex(screenX2, screenY2);
          p5.vertex(screenX3, screenY3);
          p5.vertex(screenX4, screenY4);
          p5.endShape(p5.CLOSE);
        }
      }
    }
  };

  const drawSun = (p5) => {
    const sunX = p5.width * 0.8;
    const sunY = p5.height * 0.2;
    
    // Sun glow
    p5.fill(255, 255, 200, 50);
    p5.circle(sunX, sunY, 100);
    
    // Sun core
    p5.fill(255, 255, 0);
    p5.circle(sunX, sunY, 40);
    
    // Sun rays
    p5.stroke(255, 255, 200, 100);
    p5.strokeWeight(2);
    
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * p5.PI + sunAngle;
      const length = 80;
      
      p5.push();
      p5.translate(sunX, sunY);
      p5.rotate(angle);
      p5.line(0, 0, length, 0);
      p5.pop();
    }
  };

  const drawUI = (p5) => {
    // Camera position info
    p5.fill(255);
    p5.noStroke();
    p5.textSize(14);
    p5.text(`Camera: (${Math.round(cameraX)}, ${Math.round(cameraY)}, ${Math.round(cameraZ)})`, 10, 20);
    p5.text(`Speed: ${cameraSpeed.toFixed(1)}`, 10, 40);
    p5.text(`Wind: (${windX.toFixed(2)}, ${windY.toFixed(2)})`, 10, 60);
  };

  const mousePressed = (p5) => {
    // Change camera speed on click
    cameraSpeed = cameraSpeed === 2 ? 4 : 2;
  };

  const mouseMoved = (p5) => {
    // Adjust flight path based on mouse position
    const mouseX = p5.mouseX - p5.width / 2;
    const mouseZ = p5.mouseY - p5.height / 2;
    
    // Influence flight path
    if (p5.mouseX < p5.width / 2) {
      cameraX += mouseX * 0.01;
    } else {
      cameraX += mouseX * 0.01;
    }
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

export default GenFlower3; 