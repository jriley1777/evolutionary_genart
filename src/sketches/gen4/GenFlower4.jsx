import React, { useState } from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const GenFlower4 = ({ isFullscreen = false }) => {
  // Night environment variables
  let time = 0;
  let moonPhase = 0;
  let windX = 0;
  let windY = 0;
  let humidity = 0.8;
  let temperature = 0.6;
  
  // Firefly system
  let fireflies = [];
  let fireflySwarms = [];
  let maxFireflies = 80;
  
  // Atmospheric elements
  let stars = [];
  let clouds = [];
  let particles = [];
  let lightning = [];
  
  // Background elements
  let trees = [];
  let grass = [];
  let water = [];
  
  // Lighting and atmosphere
  let ambientLight = 0.1;
  let moonBrightness = 0.8;
  let starTwinkle = 0;
  let fogDensity = 0.3;

  class Firefly {
    constructor(p5) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.vel = p5.createVector(
        p5.random(-0.5, 0.5),
        p5.random(-0.5, 0.5)
      );
      this.acc = p5.createVector(0, 0);
      this.maxSpeed = p5.random(1, 3);
      this.maxForce = 0.1;
      
      // Firefly-specific properties
      this.glowIntensity = p5.random(0.3, 1.0);
      this.glowColor = p5.random(['yellow', 'green', 'blue', 'white']);
      this.pulseSpeed = p5.random(0.02, 0.08);
      this.pulsePhase = p5.random(p5.TWO_PI);
      this.size = p5.random(2, 6);
      this.life = 255;
      this.decay = p5.random(0.5, 2);
      
      // Behavior properties
      this.swarmRadius = p5.random(50, 150);
      this.attractionStrength = p5.random(0.5, 1.5);
      this.repulsionRadius = p5.random(10, 30);
      this.windSensitivity = p5.random(0.3, 1.0);
    }

    update(p5) {
      // Update pulse
      this.pulsePhase += this.pulseSpeed;
      
      // Apply wind
      this.acc.add(windX * this.windSensitivity * 0.1, windY * this.windSensitivity * 0.1);
      
      // Apply swarm behavior
      this.applySwarmBehavior(p5);
      
      // Apply repulsion from other fireflies
      this.applyRepulsion(p5);
      
      // Update velocity and position
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      
      // Reset acceleration
      this.acc.mult(0);
      
      // Wrap around screen
      if (this.pos.x < -p5.width/2) this.pos.x = p5.width/2;
      if (this.pos.x > p5.width/2) this.pos.x = -p5.width/2;
      if (this.pos.y < -p5.height/2) this.pos.y = p5.height/2;
      if (this.pos.y > p5.height/2) this.pos.y = -p5.height/2;
      
      // Decrease life
      this.life -= this.decay;
      
      // Regenerate if dead
      if (this.life <= 0) {
        this.regenerate(p5);
      }
    }

    applySwarmBehavior(p5) {
      // Find nearby fireflies
      let nearbyCount = 0;
      let nearbyCenter = p5.createVector(0, 0);
      
      fireflies.forEach(other => {
        if (other !== this) {
          const distance = p5.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
          if (distance < this.swarmRadius) {
            nearbyCenter.add(other.pos);
            nearbyCount++;
          }
        }
      });
      
      if (nearbyCount > 0) {
        nearbyCenter.div(nearbyCount);
        const desired = p55.sub(nearbyCenter, this.pos);
        desired.normalize();
        desired.mult(this.maxSpeed);
        const steer = p5.sub(desired, this.vel);
        steer.limit(this.maxForce * this.attractionStrength);
        this.acc.add(steer);
      }
    }

    applyRepulsion(p5) {
      fireflies.forEach(other => {
        if (other !== this) {
          const distance = p5.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
          if (distance < this.repulsionRadius && distance > 0) {
            const repel = p5.sub(this.pos, other.pos);
            repel.normalize();
            repel.div(distance);
            repel.mult(this.maxForce);
            this.acc.add(repel);
          }
        }
      });
    }

    regenerate(p5) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.life = 255;
      this.glowIntensity = p5.random(0.3, 1.0);
    }

    show(p5) {
      const pulse = p5.sin(this.pulsePhase) * 0.3 + 0.7;
      const currentGlow = this.glowIntensity * pulse;
      const alpha = p5.map(this.life, 0, 255, 0, 255);
      
      // Calculate color based on glow type
      let r, g, b;
      switch (this.glowColor) {
        case 'yellow':
          r = 255;
          g = 255;
          b = 150;
          break;
        case 'green':
          r = 150;
          g = 255;
          b = 150;
          break;
        case 'blue':
          r = 150;
          g = 200;
          b = 255;
          break;
        case 'white':
          r = 255;
          g = 255;
          b = 255;
          break;
        default:
          r = g = b = 255;
      }
      
      // Draw outer glow
      p5.fill(r, g, b, alpha * 0.1 * currentGlow);
      p5.circle(this.pos.x, this.pos.y, this.size * 8);
      
      // Draw inner glow
      p5.fill(r, g, b, alpha * 0.3 * currentGlow);
      p5.circle(this.pos.x, this.pos.y, this.size * 4);
      
      // Draw core
      p5.fill(r, g, b, alpha * currentGlow);
      p5.circle(this.pos.x, this.pos.y, this.size);
      
      // Add sparkle effect
      if (p5.random() < 0.05) {
        p5.fill(255, 255, 255, alpha * 0.8);
        p5.circle(this.pos.x + p5.random(-this.size, this.size), 
                  this.pos.y + p5.random(-this.size, this.size), 1);
      }
    }
  }

  class FireflySwarm {
    constructor(p5, centerX, centerY) {
      this.center = p5.createVector(centerX, centerY);
      this.radius = p5.random(100, 300);
      this.swarmFireflies = [];
      this.swarmPhase = p5.random(p5.TWO_PI);
      this.swarmSpeed = p5.random(0.01, 0.03);
      
      // Create fireflies for this swarm
      const swarmCount = p5.random(5, 15);
      for (let i = 0; i < swarmCount; i++) {
        const angle = (i / swarmCount) * p5.TWO_PI;
        const distance = p5.random(0, this.radius);
        const x = this.center.x + p5.cos(angle) * distance;
        const y = this.center.y + p5.sin(angle) * distance;
        
        const firefly = new Firefly(p5);
        firefly.pos.set(x, y);
        firefly.swarmRadius = this.radius * 0.5;
        this.swarmFireflies.push(firefly);
      }
    }

    update(p5) {
      this.swarmPhase += this.swarmSpeed;
      
      // Update swarm center movement
      this.center.x += p5.sin(this.swarmPhase) * 0.5;
      this.center.y += p5.cos(this.swarmPhase) * 0.5;
      
      // Update fireflies
      this.swarmFireflies.forEach(firefly => {
        firefly.update(p5);
      });
    }

    show(p5) {
      this.swarmFireflies.forEach(firefly => {
        firefly.show(p5);
      });
    }
  }

  class Star {
    constructor(p5) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.brightness = p5.random(0.3, 1.0);
      this.twinkleSpeed = p5.random(0.01, 0.05);
      this.twinklePhase = p5.random(p5.TWO_PI);
      this.size = p5.random(1, 3);
      this.color = p5.random(['white', 'blue', 'yellow', 'red']);
    }

    update(p5) {
      this.twinklePhase += this.twinkleSpeed;
    }

    show(p5) {
      const twinkle = p5.sin(this.twinklePhase) * 0.3 + 0.7;
      const currentBrightness = this.brightness * twinkle;
      
      let r, g, b;
      switch (this.color) {
        case 'white':
          r = g = b = 255;
          break;
        case 'blue':
          r = 150; g = 200; b = 255;
          break;
        case 'yellow':
          r = 255; g = 255; b = 150;
          break;
        case 'red':
          r = 255; g = 150; b = 150;
          break;
        default:
          r = g = b = 255;
      }
      
      p5.fill(r, g, b, currentBrightness * 255);
      p5.noStroke();
      p5.circle(this.pos.x, this.pos.y, this.size);
      
      // Add twinkle effect
      if (p5.random() < 0.01) {
        p5.fill(255, 255, 255, currentBrightness * 100);
        p5.circle(this.pos.x + p5.random(-2, 2), this.pos.y + p5.random(-2, 2), 1);
      }
    }
  }

  class Tree {
    constructor(p5) {
      this.pos = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.height = p5.random(50, 150);
      this.width = p5.random(20, 60);
      this.trunkHeight = this.height * 0.3;
      this.swayAngle = 0;
      this.swaySpeed = p5.random(0.01, 0.03);
      this.swayAmplitude = p5.random(0.02, 0.05);
    }

    update(p5) {
      this.swayAngle += this.swaySpeed;
    }

    show(p5) {
      const sway = p5.sin(this.swayAngle) * this.swayAmplitude;
      
      p5.push();
      p5.translate(this.pos.x, this.pos.y);
      p5.rotate(sway);
      
      // Draw trunk
      p5.fill(80, 50, 20);
      p5.noStroke();
      p5.rect(-this.width * 0.1, 0, this.width * 0.2, this.trunkHeight);
      
      // Draw foliage
      p5.fill(20, 60, 20, 150);
      p5.circle(0, -this.trunkHeight * 0.5, this.width);
      p5.circle(-this.width * 0.3, -this.trunkHeight * 0.3, this.width * 0.7);
      p5.circle(this.width * 0.3, -this.trunkHeight * 0.3, this.width * 0.7);
      
      p5.pop();
    }
  }

  class Lightning {
    constructor(p5) {
      this.start = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        -p5.height/2
      );
      this.end = p5.createVector(
        p5.random(-p5.width/2, p5.width/2),
        p5.random(-p5.height/2, p5.height/2)
      );
      this.life = 255;
      this.decay = p5.random(5, 15);
      this.branches = [];
      this.generateBranches(p5);
    }

    generateBranches(p5) {
      const numBranches = p5.random(2, 5);
      for (let i = 0; i < numBranches; i++) {
        const t = p5.random(0.3, 0.8);
        const branchStart = p5.lerp(this.start.x, this.end.x, t);
        const branchStartY = p5.lerp(this.start.y, this.end.y, t);
        const branchEnd = p5.createVector(
          branchStart + p5.random(-100, 100),
          branchStartY + p5.random(20, 80)
        );
        this.branches.push({
          start: p5.createVector(branchStart, branchStartY),
          end: branchEnd
        });
      }
    }

    update(p5) {
      this.life -= this.decay;
    }

    show(p5) {
      if (this.life > 0) {
        const alpha = p5.map(this.life, 0, 255, 0, 255);
        
        // Draw main lightning
        p5.stroke(255, 255, 255, alpha);
        p5.strokeWeight(3);
        p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
        
        // Draw branches
        this.branches.forEach(branch => {
          p5.line(branch.start.x, branch.start.y, branch.end.x, branch.end.y);
        });
        
        // Lightning glow
        p5.stroke(200, 200, 255, alpha * 0.3);
        p5.strokeWeight(8);
        p5.line(this.start.x, this.start.y, this.end.x, this.end.y);
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
    
    p5.background(10, 20, 40); // Dark blue night sky
    p5.colorMode(p5.RGB);
    
    // Initialize fireflies
    for (let i = 0; i < maxFireflies; i++) {
      fireflies.push(new Firefly(p5));
    }
    
    // Initialize firefly swarms
    for (let i = 0; i < 3; i++) {
      const centerX = p5.random(-p5.width/2, p5.width/2);
      const centerY = p5.random(-p5.height/2, p5.height/2);
      fireflySwarms.push(new FireflySwarm(p5, centerX, centerY));
    }
    
    // Initialize stars
    for (let i = 0; i < 100; i++) {
      stars.push(new Star(p5));
    }
    
    // Initialize trees
    for (let i = 0; i < 15; i++) {
      trees.push(new Tree(p5));
    }
  };

  const draw = (p5) => {
    // Update time and environment
    time += 0.01;
    updateEnvironment(p5);
    
    // Clear background with night sky gradient
    drawNightSky(p5);
    
    // Draw stars
    stars.forEach(star => {
      star.update(p5);
      star.show(p5);
    });
    
    // Draw moon
    drawMoon(p5);
    
    // Draw clouds
    drawClouds(p5);
    
    // Draw trees
    trees.forEach(tree => {
      tree.update(p5);
      tree.show(p5);
    });
    
    // Update and draw lightning
    lightning = lightning.filter(bolt => {
      bolt.update(p5);
      bolt.show(p5);
      return !bolt.isDead();
    });
    
    // Add lightning occasionally
    if (p5.random() < 0.002) {
      lightning.push(new Lightning(p5));
    }
    
    // Update and draw firefly swarms
    fireflySwarms.forEach(swarm => {
      swarm.update(p5);
      swarm.show(p5);
    });
    
    // Update and draw individual fireflies
    fireflies.forEach(firefly => {
      firefly.update(p5);
      firefly.show(p5);
    });
    
    // Draw atmospheric effects
    drawFog(p5);
    drawAtmosphericGlow(p5);
    
    // Draw UI
    drawUI(p5);
  };

  const updateEnvironment = (p5) => {
    // Update wind
    windX = p5.noise(time * 0.3) * 2 - 1;
    windY = p5.noise(time * 0.3 + 1000) * 2 - 1;
    
    // Update moon phase
    moonPhase = p5.sin(time * 0.01) * 0.3;
    
    // Update star twinkle
    starTwinkle = p5.sin(time * 0.5) * 0.3 + 0.7;
    
    // Update atmospheric conditions
    humidity = p5.noise(time * 0.2) * 0.3 + 0.6;
    temperature = p5.noise(time * 0.2 + 2000) * 0.2 + 0.5;
    fogDensity = p5.noise(time * 0.1 + 3000) * 0.4 + 0.2;
  };

  const drawNightSky = (p5) => {
    // Night sky gradient
    for (let y = 0; y < p5.height; y++) {
      const inter = p5.map(y, 0, p5.height, 0, 1);
      const c = p5.lerpColor(
        p5.color(10, 20, 40), // Dark blue
        p5.color(20, 40, 80), // Lighter blue
        inter
      );
      p5.stroke(c);
      p5.line(0, y, p5.width, y);
    }
  };

  const drawMoon = (p5) => {
    const moonX = p5.width * 0.8;
    const moonY = p5.height * 0.2;
    
    // Moon glow
    p5.fill(255, 255, 200, 30);
    p5.circle(moonX, moonY, 120);
    
    // Moon core
    p5.fill(255, 255, 200, moonBrightness * 255);
    p5.circle(moonX, moonY, 60);
    
    // Moon craters
    p5.fill(200, 200, 150, 100);
    p5.circle(moonX - 15, moonY - 10, 8);
    p5.circle(moonX + 10, moonY + 15, 6);
    p5.circle(moonX + 5, moonY - 20, 4);
  };

  const drawClouds = (p5) => {
    // Draw night clouds
    p5.fill(30, 30, 50, 100);
    p5.noStroke();
    
    for (let i = 0; i < 5; i++) {
      const x = p5.width * (0.2 + i * 0.15);
      const y = p5.height * (0.1 + p5.sin(time * 0.02 + i) * 0.1);
      const size = 40 + p5.sin(time * 0.01 + i) * 20;
      
      p5.circle(x, y, size);
      p5.circle(x + size * 0.5, y, size * 0.8);
      p5.circle(x - size * 0.5, y, size * 0.8);
    }
  };

  const drawFog = (p5) => {
    // Draw atmospheric fog
    p5.fill(100, 100, 150, fogDensity * 50);
    p5.noStroke();
    
    for (let i = 0; i < 20; i++) {
      const x = p5.random(p5.width);
      const y = p5.random(p5.height);
      const size = p5.random(50, 150);
      p5.circle(x, y, size);
    }
  };

  const drawAtmosphericGlow = (p5) => {
    // Draw subtle atmospheric glow from fireflies
    p5.fill(255, 255, 200, 5);
    p5.noStroke();
    
    fireflies.forEach(firefly => {
      const glowSize = firefly.size * 20;
      p5.circle(firefly.pos.x, firefly.pos.y, glowSize);
    });
  };

  const drawUI = (p5) => {
    // Environment info
    p5.fill(255);
    p5.noStroke();
    p5.textSize(12);
    p5.text(`Fireflies: ${fireflies.length}`, 10, 20);
    p5.text(`Swarms: ${fireflySwarms.length}`, 10, 35);
    p5.text(`Lightning: ${lightning.length}`, 10, 50);
    p5.text(`Humidity: ${humidity.toFixed(2)}`, 10, 65);
    p5.text(`Temperature: ${temperature.toFixed(2)}`, 10, 80);
  };

  const mousePressed = (p5) => {
    // Create firefly swarm at click location
    const mouseX = p5.mouseX - p5.width / 2;
    const mouseY = p5.mouseY - p5.height / 2;
    fireflySwarms.push(new FireflySwarm(p5, mouseX, mouseY));
  };

  const mouseMoved = (p5) => {
    // Influence wind with mouse movement
    windX = (p5.mouseX - p5.width / 2) / p5.width * 0.5;
    windY = (p5.mouseY - p5.height / 2) / p5.height * 0.5;
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

export default GenFlower4; 