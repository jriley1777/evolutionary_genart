import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "./Sketch.css";

// Palette from CSS vars: neon pink → sky aqua
const PALETTE = [
  "#f72585",
  "#b5179e",
  "#7209b7",
  "#560bad",
  "#480ca8",
  "#3a0ca3",
  "#3f37c9",
  "#4361ee",
  "#4895ef",
  "#4cc9f0",
];

const SlowFlowTrails = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let particles = [];
    let flowField = [];
    let mouseX = 0;
    let mouseY = 0;

    class Particle {
      constructor(p5, spawnX = null, spawnY = null) {
        const x = spawnX != null ? spawnX : p5.random(p5.width);
        const y = spawnY != null ? spawnY : p5.random(p5.height);
        this.pos = p5.createVector(x, y);
        this.vel = p5.createVector(0, 0);
        this.acc = p5.createVector(0, 0);
        this.maxSpeed = p5.random(0.4, 1);
        this.prevPos = this.pos.copy();
        const hex = PALETTE[Math.floor(p5.random(PALETTE.length))];
        this.color = p5.color(hex);
        this.headShape = "diamond";
        this.headAngle = 0;
        this.angularVel = 0;
        this.collided = false;
      }

      static createJustOffScreen(p5, offset = 25) {
        const edge = Math.floor(p5.random(4));
        let x, y;
        if (edge === 0) {
          x = -offset;
          y = p5.random(p5.height);
        } else if (edge === 1) {
          x = p5.width + offset;
          y = p5.random(p5.height);
        } else if (edge === 2) {
          x = p5.random(p5.width);
          y = -offset;
        } else {
          x = p5.random(p5.width);
          y = p5.height + offset;
        }
        return new Particle(p5, x, y);
      }

      update(p5) {
        const newVel = this.vel.copy().add(this.acc);
        if (this.collided) {
          const targetAngle = p5.atan2(newVel.y, newVel.x) + p5.PI / 2;
          let delta = targetAngle - this.headAngle;
          while (delta > p5.PI) delta -= p5.TWO_PI;
          while (delta < -p5.PI) delta += p5.TWO_PI;
          this.angularVel += delta * 0.012;
          this.collided = false;
        }
        this.vel.add(this.acc);
        this.vel.limit(this.maxSpeed);
        this.pos.add(this.vel);
        this.acc.mult(0);
        this.headAngle += this.angularVel;
        this.angularVel *= 0.82;
      }

      isOffScreen(p5, margin = 80) {
        return (
          this.pos.x < -margin ||
          this.pos.x > p5.width + margin ||
          this.pos.y < -margin ||
          this.pos.y > p5.height + margin
        );
      }

      follow(p5, flowField) {
        const cellSize = 28;
        const cols = p5.floor(p5.width / cellSize);
        const rows = p5.floor(p5.height / cellSize);
        let x = p5.floor(this.pos.x / cellSize);
        let y = p5.floor(this.pos.y / cellSize);
        x = p5.max(0, p5.min(cols - 1, x));
        y = p5.max(0, p5.min(rows - 1, y));
        const index = x + y * cols;
        if (index >= 0 && index < flowField.length) {
          this.applyForce(flowField[index]);
        }
      }

      applyForce(force) {
        this.acc.add(force);
      }

      repelFromOthers(p5, others, minDist = 24, strength = 0.5) {
        others.forEach((other) => {
          if (other === this) return;
          const d = p5.dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
          if (d > 0 && d < minDist) {
            const away = p5.createVector(
              this.pos.x - other.pos.x,
              this.pos.y - other.pos.y
            );
            away.normalize();
            const magnitude = (strength * (minDist - d)) / minDist;
            away.mult(magnitude);
            this.acc.add(away);
            this.collided = true;
            const toOther = p5.createVector(other.pos.x - this.pos.x, other.pos.y - this.pos.y);
            const cross = toOther.x * this.vel.y - toOther.y * this.vel.x;
            this.angularVel += (cross / (d * d + 1)) * magnitude * 0.006;
          }
        });
      }

      show(p5) {
        const trailAlpha = 0.55;
        const headAlpha = 0.85;
        const trailColor = p5.color(
          p5.red(this.color),
          p5.green(this.color),
          p5.blue(this.color),
          trailAlpha
        );
        const headColor = p5.color(
          p5.red(this.color),
          p5.green(this.color),
          p5.blue(this.color),
          headAlpha
        );
        p5.stroke(trailColor);
        p5.strokeWeight(1);
        p5.line(this.pos.x, this.pos.y, this.prevPos.x, this.prevPos.y);
        p5.noStroke();
        p5.fill(headColor);
        const headSize = 30;
        const r = headSize / 2.5;
        const x = this.pos.x;
        const y = this.pos.y;
        if (this.headShape === "circle") {
          p5.circle(x, y, headSize);
        } else if (this.headShape === "square") {
          p5.rectMode(p5.CENTER);
          p5.rect(x, y, headSize, headSize);
          p5.rectMode(p5.CORNER);
        } else {
          p5.push();
          p5.translate(x, y);
          p5.rotate(this.headAngle);
          p5.beginShape();
          p5.vertex(0, -r);
          p5.vertex(r, 0);
          p5.vertex(0, r);
          p5.vertex(-r, 0);
          p5.endShape(p5.CLOSE);
          p5.pop();
        }
        p5.noStroke();
        this.updatePrev();
      }

      updatePrev() {
        this.prevPos.x = this.pos.x;
        this.prevPos.y = this.pos.y;
      }
    }

    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      if (isFullscreen) {
        canvas.class("canvas-container fullscreen");
        canvas.elt.classList.add("fullscreen");
      } else {
        canvas.class("canvas-container");
      }
      p5.colorMode(p5.RGB, 255, 255, 255, 1);
      p5.background(10, 8, 20);
      const particleCount = p5.floor((p5.width * p5.height) / 800);
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(p5));
      }
    };

    p5.draw = () => {
      // Very slow fade = long visible trails
      p5.fill(0, 0, 0, 0.045);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);

      const cellSize = 110;
      const cols = p5.floor(p5.width / cellSize);
      const rows = p5.floor(p5.height / cellSize);
      flowField = new Array(cols * rows);
      const t = p5.frameCount * 0.002;

      // Divergence-free flow from stream function: no sources/sinks, every zone has entry/exit
      const thetaScale = (2 * p5.PI) / cols;
      const phiScale = (2 * p5.PI) / rows;
      const noiseScale = 1.2;
      const getPsi = (cx, cy) => {
        const theta = (cx % cols) * thetaScale;
        const phi = (cy % rows) * phiScale;
        const nx = p5.cos(theta) * noiseScale + p5.cos(phi) * noiseScale;
        const ny = p5.sin(theta) * noiseScale + p5.sin(phi) * noiseScale;
        return p5.noise(nx, ny, t);
      };
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const index = x + y * cols;
          const psi = getPsi(x, y);
          const psiRight = getPsi(x + 1, y);
          const psiDown = getPsi(x, y + 1);
          const u = psiDown - psi;
          const v = psi - psiRight;
          let force = p5.createVector(u, v);
          const mag = force.mag();
          if (mag > 0.0001) {
            force.normalize().mult(0.35);
          } else {
            force = p5.createVector(0.5, 0).mult(0.35);
          }
          const mouseDist = p5.dist(x * cellSize, y * cellSize, mouseX, mouseY);
          const mouseInfluence = p5.map(mouseDist, 0, 250, p5.PI, 0, true);
          const mouseVec = p5.createVector(p5.cos(mouseInfluence), p5.sin(mouseInfluence));
          force.add(mouseVec.mult(0.15));
          if (force.mag() > 0.0001) force.normalize().mult(0.35);
          flowField[index] = force;
        }
      }

      particles.forEach((particle) => {
        particle.follow(p5, flowField);
        particle.repelFromOthers(p5, particles);
        particle.update(p5);
        particle.show(p5);
      });

      const cullMargin = 100;
      const before = particles.length;
      particles = particles.filter((p) => !p.isOffScreen(p5, cullMargin));
      const removed = before - particles.length;
      for (let i = 0; i < removed; i++) {
        particles.push(Particle.createJustOffScreen(p5));
      }
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default SlowFlowTrails;
