import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "./Sketch.css";

const CELL_SIZE = 110;
const CIRCLES_PER_CELL = 50;
const CIRCLE_RADIUS = 4;
const CIRCLE_SPEED = 0.8;
const DAMP = 0.96;
const COLLISION_ITERATIONS = 8;
const COLLISION_SEPARATION = 0.4;

const FlowFieldGrid = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let flowField = [];
    let circles = [];

    const sizeToFullCells = (w, h) => {
      const cw = Math.floor(w / CELL_SIZE) * CELL_SIZE;
      const ch = Math.floor(h / CELL_SIZE) * CELL_SIZE;
      return { w: Math.max(CELL_SIZE, cw), h: Math.max(CELL_SIZE, ch) };
    };

    const drawArrow = (p5, cx, cy, force, len = 28) => {
      const mag = force.mag();
      if (mag < 0.0001) return;
      const dir = force.copy().normalize();
      const endX = cx + dir.x * len;
      const endY = cy + dir.y * len;
      const headSize = 6;
      const back = dir.copy().mult(-headSize);
      const perp = p5.createVector(-dir.y, dir.x).mult(headSize * 0.6);
      p5.line(cx, cy, endX, endY);
      p5.line(endX, endY, endX + back.x + perp.x, endY + back.y + perp.y);
      p5.line(endX, endY, endX + back.x - perp.x, endY + back.y - perp.y);
    };

    p5.setup = () => {
      const rawW = isFullscreen ? window.innerWidth : p5.windowWidth;
      const rawH = isFullscreen ? window.innerHeight : p5.windowHeight;
      const { w, h } = sizeToFullCells(rawW, rawH);
      const canvas = p5.createCanvas(w, h);
      if (isFullscreen) {
        canvas.class("canvas-container fullscreen");
        canvas.elt.classList.add("fullscreen");
      } else {
        canvas.class("canvas-container");
      }
      p5.colorMode(p5.RGB, 255, 255, 255, 1);
    };

    p5.draw = () => {
      p5.background(10, 8, 20);

      const cols = p5.floor(p5.width / CELL_SIZE);
      const rows = p5.floor(p5.height / CELL_SIZE);
      flowField = new Array(cols * rows);
      const t = p5.frameCount * 0.0008;

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
            force.normalize().mult(0.2);
          } else {
            force = p5.createVector(0.5, 0).mult(0.2);
          }
          flowField[index] = force;
        }
      }

      p5.stroke(255, 255, 255, 0.12);
      p5.strokeWeight(1);
      for (let x = 0; x <= cols; x++) {
        p5.line(x * CELL_SIZE, 0, x * CELL_SIZE, p5.height);
      }
      for (let y = 0; y <= rows; y++) {
        p5.line(0, y * CELL_SIZE, p5.width, y * CELL_SIZE);
      }

      const expectedCircles = cols * rows * CIRCLES_PER_CELL;
      if (circles.length !== expectedCircles) {
        circles = [];
        const margin = CIRCLE_RADIUS + 2;
        const inner = CELL_SIZE - 2 * margin;
        for (let cy = 0; cy < rows; cy++) {
          for (let cx = 0; cx < cols; cx++) {
            const baseX = cx * CELL_SIZE + margin;
            const baseY = cy * CELL_SIZE + margin;
            for (let k = 0; k < CIRCLES_PER_CELL; k++) {
              circles.push({
                x: baseX + p5.random(inner),
                y: baseY + p5.random(inner),
                vx: 0,
                vy: 0,
                cellX: cx,
                cellY: cy
              });
            }
          }
        }
      }

      const left = (cx) => cx * CELL_SIZE + CIRCLE_RADIUS;
      const right = (cx) => (cx + 1) * CELL_SIZE - CIRCLE_RADIUS;
      const top = (cy) => cy * CELL_SIZE + CIRCLE_RADIUS;
      const bottom = (cy) => (cy + 1) * CELL_SIZE - CIRCLE_RADIUS;

      circles.forEach((c) => {
        const cx = c.cellX;
        const cy = c.cellY;
        const index = cx + cy * cols;
        if (index < 0 || index >= flowField.length) return;
        const force = flowField[index];
        c.vx += force.x * CIRCLE_SPEED;
        c.vy += force.y * CIRCLE_SPEED;
        c.vx *= DAMP;
        c.vy *= DAMP;
        c.x += c.vx;
        c.y += c.vy;
        c.x = p5.constrain(c.x, left(cx), right(cx));
        c.y = p5.constrain(c.y, top(cy), bottom(cy));
      });

      for (let iter = 0; iter < COLLISION_ITERATIONS; iter++) {
        const byCell = Array(cols * rows)
          .fill(null)
          .map(() => []);
        circles.forEach((c, i) => {
          const idx = c.cellX + c.cellY * cols;
          if (idx >= 0 && idx < byCell.length) byCell[idx].push(i);
        });
        byCell.forEach((indices) => {
          for (let a = 0; a < indices.length; a++) {
            for (let b = a + 1; b < indices.length; b++) {
              const i = indices[a];
              const j = indices[b];
              const ci = circles[i];
              const cj = circles[j];
              const dx = cj.x - ci.x;
              const dy = cj.y - ci.y;
              const d = p5.sqrt(dx * dx + dy * dy);
              const minDist = CIRCLE_RADIUS * 2 + COLLISION_SEPARATION;
              if (d < minDist && d > 1e-6) {
                const overlap = minDist - d;
                const ux = dx / d;
                const uy = dy / d;
                ci.x -= (overlap * 0.5) * ux;
                ci.y -= (overlap * 0.5) * uy;
                cj.x += (overlap * 0.5) * ux;
                cj.y += (overlap * 0.5) * uy;
              }
            }
          }
        });
        circles.forEach((c) => {
          c.x = p5.constrain(c.x, left(c.cellX), right(c.cellX));
          c.y = p5.constrain(c.y, top(c.cellY), bottom(c.cellY));
        });
      }

      p5.noStroke();
      p5.fill(255, 255, 255, 0.9);
      circles.forEach((c) => p5.circle(c.x, c.y, CIRCLE_RADIUS * 2));

      p5.stroke(0.4 * 255, 0.6 * 255, 1 * 255, 0.85);
      p5.strokeWeight(1.5);
      p5.noFill();
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const index = x + y * cols;
          const force = flowField[index];
          const cx = x * CELL_SIZE + CELL_SIZE / 2;
          const cy = y * CELL_SIZE + CELL_SIZE / 2;
          drawArrow(p5, cx, cy, force);
        }
      }
    };

    p5.windowResized = () => {
      const rawW = isFullscreen ? window.innerWidth : p5.windowWidth;
      const rawH = isFullscreen ? window.innerHeight : p5.windowHeight;
      const { w, h } = sizeToFullCells(rawW, rawH);
      p5.resizeCanvas(w, h);
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default FlowFieldGrid;
