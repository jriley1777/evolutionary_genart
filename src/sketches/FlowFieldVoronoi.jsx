import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "./Sketch.css";

const NUM_SEEDS = 50;
const CIRCLES_PER_CELL = 50;
const CIRCLE_RADIUS = 4;
const CIRCLE_SPEED = 0.8;
const DAMP = 0.96;
const COLLISION_ITERATIONS = 8;
const COLLISION_SEPARATION = 0.4;
const RED_BALL_RADIUS = 10;
const RED_BALL_SPEED = 0.8;
const COUNTER_OPACITY = 0.14;
const GLOW_BLUR = 28;
const GLOW_STROKE_WEIGHT = 2;

function pointInPolygon(px, py, poly) {
  let inside = false;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = poly[i][0];
    const yi = poly[i][1];
    const xj = poly[j][0];
    const yj = poly[j][1];
    if (yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

function clipPolygonByBisector(poly, ax, ay, bx, by) {
  const out = [];
  const K = bx * bx + by * by - ax * ax - ay * ay;
  const nx = 2 * (bx - ax);
  const ny = 2 * (by - ay);
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const v0 = poly[j];
    const v1 = poly[i];
    const d0 = nx * v0[0] + ny * v0[1] < K;
    const d1 = nx * v1[0] + ny * v1[1] < K;
    if (d1) {
      if (!d0) {
        const dvx = v1[0] - v0[0];
        const dvy = v1[1] - v0[1];
        const denom = nx * dvx + ny * dvy;
        if (Math.abs(denom) > 1e-10) {
          const t = (K - nx * v0[0] - ny * v0[1]) / denom;
          out.push([v0[0] + t * dvx, v0[1] + t * dvy]);
        }
      }
      out.push(v1);
    } else if (d0) {
      const dvx = v1[0] - v0[0];
      const dvy = v1[1] - v0[1];
      const denom = nx * dvx + ny * dvy;
      if (Math.abs(denom) > 1e-10) {
        const t = (K - nx * v0[0] - ny * v0[1]) / denom;
        out.push([v0[0] + t * dvx, v0[1] + t * dvy]);
      }
    }
  }
  return out;
}

function centroid(poly) {
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < poly.length; i++) {
    sx += poly[i][0];
    sy += poly[i][1];
  }
  const n = poly.length;
  return { x: sx / n, y: sy / n };
}

function distToSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  let t = (apx * abx + apy * aby) / (abx * abx + aby * aby + 1e-10);
  t = Math.max(0, Math.min(1, t));
  const qx = ax + t * abx;
  const qy = ay + t * aby;
  return Math.hypot(px - qx, py - qy);
}

function closestPointOnSegment(px, py, ax, ay, bx, by) {
  const abx = bx - ax;
  const aby = by - ay;
  const apx = px - ax;
  const apy = py - ay;
  let t = (apx * abx + apy * aby) / (abx * abx + aby * aby + 1e-10);
  t = Math.max(0, Math.min(1, t));
  return [ax + t * abx, ay + t * aby];
}

function distanceToPolygonEdge(px, py, poly) {
  let d = Infinity;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const t = distToSegment(px, py, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);
    if (t < d) d = t;
  }
  return d;
}

function nearestPointOnPolygonBoundary(px, py, poly) {
  let best = [px, py];
  let bestD = Infinity;
  const n = poly.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const q = closestPointOnSegment(px, py, poly[j][0], poly[j][1], poly[i][0], poly[i][1]);
    const d = Math.hypot(px - q[0], py - q[1]);
    if (d < bestD) {
      bestD = d;
      best = q;
    }
  }
  return best;
}

function buildVoronoiCell(seedIndex, seeds, w, h) {
  const ax = seeds[seedIndex].x;
  const ay = seeds[seedIndex].y;
  let poly = [
    [0, 0],
    [w, 0],
    [w, h],
    [0, h]
  ];
  for (let j = 0; j < seeds.length; j++) {
    if (j === seedIndex) continue;
    const bx = seeds[j].x;
    const by = seeds[j].y;
    poly = clipPolygonByBisector(poly, ax, ay, bx, by);
    if (poly.length < 3) return null;
  }
  return poly;
}

function findCellIndex(x, y, seeds) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < seeds.length; i++) {
    const d = (x - seeds[i].x) ** 2 + (y - seeds[i].y) ** 2;
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

function randomPointInPolygon(poly, p5) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (let i = 0; i < poly.length; i++) {
    minX = Math.min(minX, poly[i][0]);
    maxX = Math.max(maxX, poly[i][0]);
    minY = Math.min(minY, poly[i][1]);
    maxY = Math.max(maxY, poly[i][1]);
  }
  for (let tries = 0; tries < 200; tries++) {
    const x = minX + p5.random(maxX - minX);
    const y = minY + p5.random(maxY - minY);
    if (pointInPolygon(x, y, poly)) return [x, y];
  }
  const c = centroid(poly);
  return [c.x, c.y];
}

const FlowFieldVoronoi = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let seeds = [];
    let cells = [];
    let flowField = [];
    let circles = [];
    let redBall = null;
    let cellCounts = [];
    let redBallPrevCell = null;
    let lastW = 0;
    let lastH = 0;

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
      const w = isFullscreen ? window.innerWidth : p5.windowWidth;
      const h = isFullscreen ? window.innerHeight : p5.windowHeight;
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
      p5.background(0, 0, 0);
      const w = p5.width;
      const h = p5.height;

      if (seeds.length !== NUM_SEEDS || w !== lastW || h !== lastH) {
        lastW = w;
        lastH = h;
        seeds = [];
        const margin = 20;
        for (let i = 0; i < NUM_SEEDS; i++) {
          seeds.push({
            x: margin + p5.random(w - 2 * margin),
            y: margin + p5.random(h - 2 * margin)
          });
        }
        cells = [];
        for (let i = 0; i < NUM_SEEDS; i++) {
          const poly = buildVoronoiCell(i, seeds, w, h);
          cells.push(poly);
        }
        flowField = [];
        const t = p5.frameCount * 0.0008;
        const noiseScale = 1.2;
        for (let i = 0; i < NUM_SEEDS; i++) {
          const sx = seeds[i].x / w;
          const sy = seeds[i].y / h;
          const nx = Math.cos(sx * Math.PI * 2) * noiseScale + Math.cos(sy * Math.PI * 2) * noiseScale;
          const ny = Math.sin(sx * Math.PI * 2) * noiseScale + Math.sin(sy * Math.PI * 2) * noiseScale;
          const psi = p5.noise(nx, ny, t);
          const psiR = p5.noise(nx + 0.01, ny, t);
          const psiD = p5.noise(nx, ny + 0.01, t);
          const u = psiD - psi;
          const v = psi - psiR;
          let force = p5.createVector(u, v);
          const mag = force.mag();
          if (mag > 0.0001) force.normalize().mult(0.2);
          else force = p5.createVector(0.5, 0).mult(0.2);
          flowField[i] = force;
        }
        circles = [];
        cellCounts = new Array(NUM_SEEDS).fill(0);
        redBallPrevCell = null;
        for (let i = 0; i < NUM_SEEDS; i++) {
          const poly = cells[i];
          if (!poly || poly.length < 3) continue;
          for (let k = 0; k < CIRCLES_PER_CELL; k++) {
            const pt = randomPointInPolygon(poly, p5);
            circles.push({ x: pt[0], y: pt[1], vx: 0, vy: 0, cellIndex: i });
          }
        }
      }

      const t = p5.frameCount * 0.0008;
      const noiseScale = 1.2;
      for (let i = 0; i < NUM_SEEDS; i++) {
        const sx = seeds[i].x / w;
        const sy = seeds[i].y / h;
        const nx = Math.cos(sx * Math.PI * 2) * noiseScale + Math.cos(sy * Math.PI * 2) * noiseScale;
        const ny = Math.sin(sx * Math.PI * 2) * noiseScale + Math.sin(sy * Math.PI * 2) * noiseScale;
        const psi = p5.noise(nx, ny, t);
        const psiR = p5.noise(nx + 0.01, ny, t);
        const psiD = p5.noise(nx, ny + 0.01, t);
        const u = psiD - psi;
        const v = psi - psiR;
        let force = p5.createVector(u, v);
        const mag = force.mag();
        if (mag > 0.0001) force.normalize().mult(0.2);
        else force = p5.createVector(0.5, 0).mult(0.2);
        flowField[i] = force;
      }

      if (redBall == null) {
        redBall = { x: w / 2, y: h / 2, vx: 0, vy: 0 };
      }
      const wrappedX = ((redBall.x % w) + w) % w;
      const wrappedY = ((redBall.y % h) + h) % h;
      const rbCell = findCellIndex(wrappedX, wrappedY, seeds);
      const rbPoly = cells[rbCell];
      let fullyInOneCell = false;
      let fullCellIndex = -1;
      if (rbPoly && pointInPolygon(wrappedX, wrappedY, rbPoly)) {
        const distToEdge = distanceToPolygonEdge(wrappedX, wrappedY, rbPoly);
        if (distToEdge >= RED_BALL_RADIUS) {
          fullyInOneCell = true;
          fullCellIndex = rbCell;
        }
      }
      if (fullyInOneCell) {
        if (redBallPrevCell == null || fullCellIndex !== redBallPrevCell) {
          cellCounts[fullCellIndex] = (cellCounts[fullCellIndex] || 0) + 1;
        }
        redBallPrevCell = fullCellIndex;
      } else {
        redBallPrevCell = null;
      }
      if (flowField[rbCell]) {
        const force = flowField[rbCell];
        redBall.vx += force.x * RED_BALL_SPEED;
        redBall.vy += force.y * RED_BALL_SPEED;
      }
      redBall.vx *= DAMP;
      redBall.vy *= DAMP;
      redBall.x += redBall.vx;
      redBall.y += redBall.vy;
      redBall.x = ((redBall.x % w) + w) % w;
      redBall.y = ((redBall.y % h) + h) % h;

      const maxCount = cellCounts.length ? Math.max(...cellCounts.map((c) => c || 0)) : 0;
      const cellFontSize = Math.min(w, h) / (NUM_SEEDS * 0.5);
      p5.textSize(cellFontSize);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.noStroke();
      p5.fill(255, 255, 255, COUNTER_OPACITY);
      for (let i = 0; i < NUM_SEEDS; i++) {
        const n = cellCounts[i] || 0;
        if (n > 0 && cells[i] && cells[i].length >= 3) {
          const c = centroid(cells[i]);
          p5.text(String(n), c.x, c.y);
        }
      }

      p5.stroke(255, 255, 255, 0.12);
      p5.strokeWeight(1);
      for (let i = 0; i < cells.length; i++) {
        const poly = cells[i];
        if (!poly || poly.length < 3) continue;
        p5.beginShape();
        for (let k = 0; k < poly.length; k++) p5.vertex(poly[k][0], poly[k][1]);
        p5.endShape(p5.CLOSE);
      }

      if (maxCount > 0) {
        const d = p5.drawingContext;
        d.save();
        d.shadowColor = "rgba(0, 255, 120, 0.95)";
        d.shadowBlur = GLOW_BLUR;
        p5.noFill();
        p5.stroke(0, 255, 120);
        p5.strokeWeight(GLOW_STROKE_WEIGHT);
        for (let i = 0; i < NUM_SEEDS; i++) {
          if ((cellCounts[i] || 0) === maxCount && cells[i] && cells[i].length >= 3) {
            p5.beginShape();
            for (let k = 0; k < cells[i].length; k++) {
              p5.vertex(cells[i][k][0], cells[i][k][1]);
            }
            p5.endShape(p5.CLOSE);
          }
        }
        d.shadowBlur = 0;
        d.restore();
      }

      circles.forEach((c) => {
        const poly = cells[c.cellIndex];
        if (!poly || !flowField[c.cellIndex]) return;
        const force = flowField[c.cellIndex];
        c.vx += force.x * CIRCLE_SPEED;
        c.vy += force.y * CIRCLE_SPEED;
        c.vx *= DAMP;
        c.vy *= DAMP;
        c.x += c.vx;
        c.y += c.vy;
        if (!pointInPolygon(c.x, c.y, poly)) {
          const q = nearestPointOnPolygonBoundary(c.x, c.y, poly);
          c.x = q[0];
          c.y = q[1];
        }
      });

      for (let iter = 0; iter < COLLISION_ITERATIONS; iter++) {
        const byCell = Array(NUM_SEEDS)
          .fill(null)
          .map(() => []);
        circles.forEach((c, i) => {
          if (c.cellIndex >= 0 && c.cellIndex < byCell.length) byCell[c.cellIndex].push(i);
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
          const poly = cells[c.cellIndex];
          if (!poly) return;
          if (!pointInPolygon(c.x, c.y, poly)) {
            const q = nearestPointOnPolygonBoundary(c.x, c.y, poly);
            c.x = q[0];
            c.y = q[1];
          }
        });
      }

      p5.noStroke();
      p5.fill(255, 255, 255, 0.9);
      circles.forEach((c) => p5.circle(c.x, c.y, CIRCLE_RADIUS * 2));

      p5.noStroke();
      p5.fill(220, 60, 60, 1);
      p5.circle(redBall.x, redBall.y, RED_BALL_RADIUS * 2);

      p5.stroke(0.4 * 255, 0.6 * 255, 1 * 255, 0.85);
      p5.strokeWeight(1.5);
      p5.noFill();
      for (let i = 0; i < NUM_SEEDS; i++) {
        if (cells[i] && cells[i].length >= 3 && flowField[i]) {
          const c = centroid(cells[i]);
          drawArrow(p5, c.x, c.y, flowField[i]);
        }
      }
    };

    p5.windowResized = () => {
      const w = isFullscreen ? window.innerWidth : p5.windowWidth;
      const h = isFullscreen ? window.innerHeight : p5.windowHeight;
      p5.resizeCanvas(w, h);
      lastW = 0;
      lastH = 0;
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default FlowFieldVoronoi;
