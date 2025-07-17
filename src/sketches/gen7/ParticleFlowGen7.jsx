import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const ParticleFlowGen7 = ({ isFullscreen = false }) => {
  let particles = [];
  let triangles = [];
  let flowField = [];
  let gridSize = 40;
  let noiseOffset = 0;

  const sketch = (p5) => {

    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.frameRate(35);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.colorMode(p5.HSB, 360, 100, 100, 1);
      
      // Initialize triangular mesh
      initializeTriangularMesh(p5);
      
      // Initialize flow field
      initializeFlowField(p5);
      
      // Create initial particles
      for (let i = 0; i < 100; i++) {
        particles.push(new Particle(p5, p5.random(p5.width), p5.random(p5.height)));
      }
    };

    const initializeTriangularMesh = (p5) => {
      triangles = [];
      
      const steps = 34;
      const s = p5.width / steps;
      const matrix = [];
      
      // Create matrix of points with slight randomization
      for (let i = 1; i < steps; i++) {
        const line = [];
        for (let j = 1; j < steps; j++) {
          const x = p5.map(i, 0, steps, 0, p5.width) + (j % 2 == 0 ? -s / 2 : 0) + p5.lerp(-1, 1, p5.random()) * s / 3;
          const y = p5.map(j, 0, steps, 0, p5.height) + p5.lerp(-1, 1, p5.random()) * s / 3;
          line.push({ x, y });
        }
        matrix.push(line);
      }
      
      // Create non-overlapping triangles using alternating pattern
      for (let i = 0; i < steps - 2; i++) {
        for (let j = 0; j < steps - 2; j++) {
          // First triangle
          let triangle1 = {
            points: [
              matrix[j][i],
              matrix[j + 1][i],
              matrix[j + (i % 2 == 0 ? 1 : 0)][i + 1]
            ],
            center: {
              x: (matrix[j][i].x + matrix[j + 1][i].x + matrix[j + (i % 2 == 0 ? 1 : 0)][i + 1].x) / 3,
              y: (matrix[j][i].y + matrix[j + 1][i].y + matrix[j + (i % 2 == 0 ? 1 : 0)][i + 1].y) / 3
            },
            particleCount: 0,
            color: p5.color(0)
          };
          triangles.push(triangle1);
          
          // Second triangle
          let triangle2 = {
            points: [
              matrix[j + (i % 2 == 1 ? 1 : 0)][i],
              matrix[j][i + 1],
              matrix[j + 1][i + 1]
            ],
            center: {
              x: (matrix[j + (i % 2 == 1 ? 1 : 0)][i].x + matrix[j][i + 1].x + matrix[j + 1][i + 1].x) / 3,
              y: (matrix[j + (i % 2 == 1 ? 1 : 0)][i].y + matrix[j][i + 1].y + matrix[j + 1][i + 1].y) / 3
            },
            particleCount: 0,
            color: p5.color(0)
          };
          triangles.push(triangle2);
        }
      }
    };

    const initializeFlowField = (p5) => {
      flowField = [];
      let cols = Math.ceil(p5.width / 10);
      let rows = Math.ceil(p5.height / 10);
      
      for (let i = 0; i < cols; i++) {
        flowField[i] = [];
        for (let j = 0; j < rows; j++) {
          let x = i * 10;
          let y = j * 10;
          let angle = p5.noise(x * 0.01, y * 0.01) * p5.TWO_PI;
          flowField[i][j] = {
            x: Math.cos(angle),
            y: Math.sin(angle),
            strength: p5.noise(x * 0.02, y * 0.02)
          };
        }
      }
    };

    class Particle {
      constructor(p5, x, y) {
        this.pos = { x: x, y: y };
        this.vel = { x: 0, y: 0 };
        this.acc = { x: 0, y: 0 };
        this.maxSpeed = 3;
        this.maxForce = 0.1;
        this.life = 255;
        this.decay = 0.5;
        this.size = 2;
      }

      update(p5) {
        this.vel.x += this.acc.x;
        this.vel.y += this.acc.y;
        
        // Limit velocity
        let speed = Math.sqrt(this.vel.x * this.vel.x + this.vel.y * this.vel.y);
        if (speed > this.maxSpeed) {
          this.vel.x = (this.vel.x / speed) * this.maxSpeed;
          this.vel.y = (this.vel.y / speed) * this.maxSpeed;
        }
        
        this.pos.x += this.vel.x;
        this.pos.y += this.vel.y;
        
        // Screen wrapping
        if (this.pos.x < 0) this.pos.x = p5.width;
        if (this.pos.x > p5.width) this.pos.x = 0;
        if (this.pos.y < 0) this.pos.y = p5.height;
        if (this.pos.y > p5.height) this.pos.y = 0;
        
        // Reset acceleration
        this.acc.x = 0;
        this.acc.y = 0;
        
        // Decay life
        this.life -= this.decay;
      }

      applyForce(force) {
        this.acc.x += force.x;
        this.acc.y += force.y;
      }

      followFlowField(p5) {
        let x = Math.floor(this.pos.x / 10);
        let y = Math.floor(this.pos.y / 10);
        
        if (x >= 0 && x < flowField.length && y >= 0 && y < flowField[0].length) {
          let flow = flowField[x][y];
          let force = {
            x: flow.x * flow.strength * 0.5,
            y: flow.y * flow.strength * 0.5
          };
          this.applyForce(force);
        }
      }

      draw(p5) {
        // Particles are invisible - they only affect triangle colors
      }

      isDead() {
        return this.life <= 0;
      }
    }

    const updateFlowField = (p5) => {
      noiseOffset += 0.01;
      
      for (let i = 0; i < flowField.length; i++) {
        for (let j = 0; j < flowField[i].length; j++) {
          let x = i * 10;
          let y = j * 10;
          let angle = p5.noise(x * 0.01, y * 0.01, noiseOffset) * p5.TWO_PI;
          flowField[i][j] = {
            x: Math.cos(angle),
            y: Math.sin(angle),
            strength: p5.noise(x * 0.02, y * 0.02, noiseOffset)
          };
        }
      }
    };

    const isPointInTriangle = (point, trianglePoints) => {
      // Barycentric coordinate method to check if point is inside triangle
      let p0 = trianglePoints[0];
      let p1 = trianglePoints[1];
      let p2 = trianglePoints[2];
      
      let A = 1/2 * (-p1.y * p2.x + p0.y * (-p1.x + p2.x) + p0.x * (p1.y - p2.y) + p1.x * p2.y);
      let sign = A < 0 ? -1 : 1;
      let s = (p0.y * p2.x - p0.x * p2.y + (p2.y - p0.y) * point.x + (p0.x - p2.x) * point.y) * sign;
      let t = (p0.x * p1.y - p0.y * p1.x + (p0.y - p1.y) * point.x + (p1.x - p0.x) * point.y) * sign;
      
      return s > 0 && t > 0 && (s + t) < 2 * A * sign;
    };

    const updateTriangleColors = (p5) => {
      // Update all triangles with decay effect
      for (let triangle of triangles) {
        triangle.particleCount = 0;
        
        // Decay the current color back to base
        if (triangle.color) {
          let currentHue = p5.hue(triangle.color);
          let currentSat = p5.saturation(triangle.color);
          let currentBright = p5.brightness(triangle.color);
          let currentAlpha = p5.alpha(triangle.color);
          
          // Decay brightness and saturation
          let newBright = p5.lerp(currentBright, 0, 0.1); // Quick decay to black
          let newSat = p5.lerp(currentSat, 0, 0.05); // Moderate decay saturation to 0
          let newAlpha = p5.lerp(currentAlpha, 0, 0.05); // Decay alpha to transparent
          
          triangle.color = p5.color(currentHue, newSat, newBright, newAlpha);
        } else {
          triangle.color = p5.color(0, 0, 0, 0); // Completely transparent/black
        }
      }
      
      // Count particles in each triangle and update colors
      for (let particle of particles) {
        for (let triangle of triangles) {
          if (isPointInTriangle(particle.pos, triangle.points)) {
            triangle.particleCount++;
            
            // Calculate brightness and saturation based on particle count
            let brightness = p5.map(triangle.particleCount, 0, 10, 90, 100);
            let saturation = p5.map(triangle.particleCount, 0, 10, 60, 100);
            
            // Use flow field for hue - purple to blue range like Gen1
            let x = Math.floor(triangle.center.x / 10);
            let y = Math.floor(triangle.center.y / 10);
            
            if (x >= 0 && x < flowField.length && y >= 0 && y < flowField[0].length) {
              let flow = flowField[x][y];
              let angle = Math.atan2(flow.y, flow.x);
              // Map angle to purple-blue range (180-280) like Gen1
              let hue = p5.map(angle, -Math.PI, Math.PI, 180, 280);
              
              // Blend with current color for smooth transition
              let currentColor = triangle.color;
              let targetColor = p5.color(hue, saturation, brightness, 0.8);
              
              // Smooth interpolation
              let newHue = p5.lerp(p5.hue(currentColor), hue, 0.3);
              let newSat = p5.lerp(p5.saturation(currentColor), saturation, 0.3);
              let newBright = p5.lerp(p5.brightness(currentColor), brightness, 0.3);
              let newAlpha = p5.lerp(p5.alpha(currentColor), 0.8, 0.3);
              
              triangle.color = p5.color(newHue, newSat, newBright, newAlpha);
            }
          }
        }
      }
    };

    const drawTriangularMesh = (p5) => {
      p5.push();
      
      for (let triangle of triangles) {
        p5.noFill();
        p5.stroke(triangle.color);
        p5.strokeWeight(2);
        
        p5.beginShape();
        for (let point of triangle.points) {
          p5.vertex(point.x, point.y);
        }
        p5.endShape(p5.CLOSE);
      }
      
      p5.pop();
    };

    p5.draw = () => {
      p5.background(0, 20);
      
      // Update flow field
      updateFlowField(p5);
      
      // Update triangle colors based on flow field
      updateTriangleColors(p5);
      
      // Draw triangular mesh
      drawTriangularMesh(p5);
      
      // Update and draw particles
      for (let i = particles.length - 1; i >= 0; i--) {
        let particle = particles[i];
        
        // Apply flow field forces
        particle.followFlowField(p5);
        
        // Add some noise for organic movement
        let noise = {
          x: p5.noise(particle.pos.x * 0.01, p5.frameCount * 0.01) * 2 - 1,
          y: p5.noise(particle.pos.y * 0.01, p5.frameCount * 0.01) * 2 - 1
        };
        particle.applyForce({ x: noise.x * 0.1, y: noise.y * 0.1 });
        
        particle.update(p5);
        // particle.draw(p5); // Particles are invisible
        
        // Remove dead particles
        if (particle.isDead()) {
          particles.splice(i, 1);
        }
      }
      
      // Add new particles
      if (particles.length < 50) {
        particles.push(new Particle(p5, p5.random(p5.width), p5.random(p5.height)));
      }
      
      // Draw UI
      drawUI(p5);
    };

    const drawUI = (p5) => {
      p5.fill(255);
      p5.noStroke();
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textSize(14);
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      initializeTriangularMesh(p5);
      initializeFlowField(p5);
    };
  };

  return <ReactP5Wrapper sketch={sketch}/>;
};

export default ParticleFlowGen7; 