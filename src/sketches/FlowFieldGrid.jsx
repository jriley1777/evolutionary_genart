import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "./Sketch.css";

const CELL_SIZE = 110;
const CIRCLE_RADIUS = 4;
const CIRCLE_MARGIN = CIRCLE_RADIUS + 2;
const CIRCLE_SPEED = 0.8;
const DAMP = 0.96;
const COLLISION_ITERATIONS = 8;
const COLLISION_SEPARATION = 0.4;
const RED_BALL_RADIUS = 10;
const RED_BALL_SPEED = 0.8;
const ORB_MIN_DIST = 2 * RED_BALL_RADIUS + 8;
const ORB_COLLISION_ITERATIONS = 6;
const ORB_GLOW_BLUR = 24;
// amber-gold #ffbe0b, blaze-orange #fb5607, neon-pink #ff006e, blue-violet #8338ec, azure-blue #3a86ff
const ORB_COLORS = {
  red: [251, 86, 7],      // blaze-orange
  yellow: [255, 190, 11], // amber-gold
  teal: [58, 134, 255],   // azure-blue
  orange: [255, 0, 110],  // neon-pink
  purple: [131, 56, 236]  // blue-violet
};
const COUNTER_FONT_SIZE_RATIO = 0.82;
const COUNTER_OPACITY = 0.5;
const CELL_INDEX_FONT_SIZE = 10;
const CELL_INDEX_INSET = 6;
const GLOW_BLUR = 28;
const GLOW_STROKE_WEIGHT = 2;
const GRID_GLOW_BLUR = 12;
const GRID_EDGE_OPACITY = 0.2;
const ORB_KEYS = ["red", "yellow", "teal", "orange", "purple"];
const ORB_LABELS = { red: "Blaze", yellow: "Amber", teal: "Azure", orange: "Pink", purple: "Violet" };
const LEADERBOARD_X = 14;
const LEADERBOARD_BOTTOM_MARGIN = 24;
const LEADERBOARD_PAD = 14;
const LEADERBOARD_TITLE_FONT_SIZE = 17;
const LEADERBOARD_FONT_SIZE = 11;
const LEADERBOARD_GO_FONT_SIZE = 15;
const LEADERBOARD_GO_SCALE = 1.35;
const RESTART_BUTTON_PAD = 12;
const RESTART_BUTTON_HEIGHT = 36;
const WINNING_BALL_COUNT = 100;
const BALLS_PER_SPAWN_TIER = 250;
const ORB_SPAWN_MARGIN = 50;
function shuffleArray(arr, randomFn) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const FlowFieldGrid = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let flowField = [];
    let circles = [];
    let orbs = null;
    let cellCounts = [];
    let gameOver = false;
    let restartButton = null;

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
      p5.background(0, 0, 0);

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

      if (cellCounts.length !== cols * rows) {
        cellCounts = new Array(cols * rows).fill(0);
        circles = [];
        gameOver = false;
      }
      if (orbs == null) {
        const w = p5.width;
        const h = p5.height;
        const margin = ORB_SPAWN_MARGIN;
        const x0 = margin;
        const y0 = margin;
        const x1 = w - margin;
        const y1 = h - margin;
        orbs = {
          red: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null },
          yellow: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null },
          teal: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null },
          orange: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null },
          purple: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null }
        };
      }

      if (!gameOver) {
        const orbOrder = shuffleArray(ORB_KEYS, () => p5.random());
        orbOrder.forEach((key) => {
          const orb = orbs[key];
          const wrappedX = ((orb.x % p5.width) + p5.width) % p5.width;
          const wrappedY = ((orb.y % p5.height) + p5.height) % p5.height;
          const ocx = p5.constrain(p5.floor(wrappedX / CELL_SIZE), 0, cols - 1);
          const ocy = p5.constrain(p5.floor(wrappedY / CELL_SIZE), 0, rows - 1);
          const orbIndex = ocx + ocy * cols;

          const cellLeft = p5.floor((wrappedX - RED_BALL_RADIUS) / CELL_SIZE);
          const cellRight = p5.floor((wrappedX + RED_BALL_RADIUS) / CELL_SIZE);
          const cellTop = p5.floor((wrappedY - RED_BALL_RADIUS) / CELL_SIZE);
          const cellBottom = p5.floor((wrappedY + RED_BALL_RADIUS) / CELL_SIZE);
          const fullyInOneCell =
            cellLeft === cellRight &&
            cellTop === cellBottom &&
            cellLeft >= 0 &&
            cellLeft < cols &&
            cellTop >= 0 &&
            cellTop < rows;
          const fullCellX = fullyInOneCell ? cellLeft : -1;
          const fullCellY = fullyInOneCell ? cellTop : -1;
          if (fullyInOneCell) {
            const idx = fullCellX + fullCellY * cols;
            if (
              orb.prevCell == null ||
              fullCellX !== orb.prevCell.x ||
              fullCellY !== orb.prevCell.y
            ) {
              cellCounts[idx] = (cellCounts[idx] || 0) + 1;
              const margin = CIRCLE_MARGIN;
              const inner = CELL_SIZE - 2 * margin;
              const baseX = fullCellX * CELL_SIZE + margin;
              const baseY = fullCellY * CELL_SIZE + margin;
              const spawnCount = 1 + Math.floor(circles.length / BALLS_PER_SPAWN_TIER);
              for (let s = 0; s < spawnCount; s++) {
                circles.push({
                  x: baseX + p5.random(inner),
                  y: baseY + p5.random(inner),
                  vx: 0,
                  vy: 0,
                  cellX: fullCellX,
                  cellY: fullCellY,
                  color: ORB_COLORS[key]
                });
              }
            }
            orb.prevCell = { x: fullCellX, y: fullCellY };
          } else {
            orb.prevCell = null;
          }
          if (orbIndex >= 0 && orbIndex < flowField.length) {
            const force = flowField[orbIndex];
            orb.vx += force.x * RED_BALL_SPEED;
            orb.vy += force.y * RED_BALL_SPEED;
          }
          orb.vx *= DAMP;
          orb.vy *= DAMP;
          orb.x += orb.vx;
          orb.y += orb.vy;
          orb.x = ((orb.x % p5.width) + p5.width) % p5.width;
          orb.y = ((orb.y % p5.height) + p5.height) % p5.height;
        });

        for (let iter = 0; iter < ORB_COLLISION_ITERATIONS; iter++) {
          ORB_KEYS.forEach((keyA, i) => {
            ORB_KEYS.forEach((keyB, j) => {
              if (i >= j) return;
              const a = orbs[keyA];
              const b = orbs[keyB];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const d = p5.sqrt(dx * dx + dy * dy);
              if (d < ORB_MIN_DIST && d > 1e-6) {
                const overlap = ORB_MIN_DIST - d;
                const ux = dx / d;
                const uy = dy / d;
                a.x -= (overlap * 0.5) * ux;
                a.y -= (overlap * 0.5) * uy;
                b.x += (overlap * 0.5) * ux;
                b.y += (overlap * 0.5) * uy;
              }
            });
          });
          ORB_KEYS.forEach((key) => {
            const orb = orbs[key];
            orb.x = ((orb.x % p5.width) + p5.width) % p5.width;
            orb.y = ((orb.y % p5.height) + p5.height) % p5.height;
          });
        }
      }

      const cellDominant = [];
      for (let idx = 0; idx < cols * rows; idx++) {
        const counts = {};
        ORB_KEYS.forEach((k) => (counts[k] = 0));
        circles.forEach((c) => {
          if (c.cellX + c.cellY * cols !== idx) return;
          ORB_KEYS.forEach((k) => {
            if (c.color === ORB_COLORS[k]) counts[k]++;
          });
        });
        let maxCount = 0;
        let bestKey = null;
        ORB_KEYS.forEach((k) => {
          if (counts[k] > maxCount) {
            maxCount = counts[k];
            bestKey = k;
          }
        });
        cellDominant[idx] = bestKey;
      }

      const leaderboard = { totalBalls: {}, winningPanels: {}, scoreWinning: {} };
      ORB_KEYS.forEach((k) => {
        leaderboard.totalBalls[k] = circles.filter((c) => c.color === ORB_COLORS[k]).length;
        leaderboard.winningPanels[k] = 0;
        leaderboard.scoreWinning[k] = 0;
      });
      let overallBalls = circles.length;
      let overallScore = 0;
      const ballsPerCell = new Array(cellCounts.length).fill(0);
      for (let idx = 0; idx < cellCounts.length; idx++) {
        const n = cellCounts[idx] || 0;
        overallScore += n;
        const key = cellDominant[idx];
        if (key) {
          leaderboard.winningPanels[key]++;
          leaderboard.scoreWinning[key] += n;
        }
      }
      circles.forEach((c) => {
        const idx = c.cellX + c.cellY * cols;
        if (idx >= 0 && idx < ballsPerCell.length) ballsPerCell[idx]++;
      });
      let cellWithMostBalls = -1;
      let maxBallsInCell = 0;
      ballsPerCell.forEach((count, idx) => {
        if (count > maxBallsInCell) {
          maxBallsInCell = count;
          cellWithMostBalls = idx;
        }
      });
      if (maxBallsInCell >= WINNING_BALL_COUNT) {
        gameOver = true;
      }

      const counterFontSize = CELL_SIZE * COUNTER_FONT_SIZE_RATIO;
      p5.textSize(counterFontSize);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.noStroke();
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = x + y * cols;
          const n = ballsPerCell[idx] || 0;
          if (n > 0) {
            const key = cellDominant[idx];
            if (key) {
              const [r, g, b] = ORB_COLORS[key];
              p5.fill(r, g, b, COUNTER_OPACITY);
            } else {
              p5.fill(255, 255, 255, COUNTER_OPACITY);
            }
            const cx = x * CELL_SIZE + CELL_SIZE / 2;
            const cy = y * CELL_SIZE + CELL_SIZE / 2;
            p5.text(String(n), cx, cy);
          }
        }
      }

      p5.textSize(CELL_INDEX_FONT_SIZE);
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.fill(255, 255, 255, 0.4);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = x + y * cols;
          const tx = x * CELL_SIZE + CELL_INDEX_INSET;
          const ty = y * CELL_SIZE + CELL_INDEX_INSET;
          p5.text(String(idx), tx, ty);
        }
      }

      const d = p5.drawingContext;
      d.save();
      d.shadowColor = "rgba(180, 220, 255, 0.6)";
      d.shadowBlur = GRID_GLOW_BLUR;
      p5.stroke(255, 255, 255, GRID_EDGE_OPACITY);
      p5.strokeWeight(1.5);
      for (let x = 0; x <= cols; x++) {
        p5.line(x * CELL_SIZE, 0, x * CELL_SIZE, p5.height);
      }
      for (let y = 0; y <= rows; y++) {
        p5.line(0, y * CELL_SIZE, p5.width, y * CELL_SIZE);
      }
      d.shadowBlur = 0;
      d.restore();

      if (maxBallsInCell > 0) {
        const d = p5.drawingContext;
        d.save();
        d.shadowColor = "rgba(0, 255, 120, 0.95)";
        d.shadowBlur = GLOW_BLUR;
        p5.noFill();
        p5.stroke(0, 255, 120);
        p5.strokeWeight(GLOW_STROKE_WEIGHT);
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = x + y * cols;
            if ((ballsPerCell[idx] || 0) === maxBallsInCell) {
              p5.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
            }
          }
        }
        d.shadowBlur = 0;
        d.restore();
      }

      const left = (cx) => cx * CELL_SIZE + CIRCLE_RADIUS;
      const right = (cx) => (cx + 1) * CELL_SIZE - CIRCLE_RADIUS;
      const top = (cy) => cy * CELL_SIZE + CIRCLE_RADIUS;
      const bottom = (cy) => (cy + 1) * CELL_SIZE - CIRCLE_RADIUS;

      if (!gameOver) {
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
      }

      p5.noStroke();
      circles.forEach((c) => {
        const col = c.color;
        if (col) {
          p5.fill(col[0], col[1], col[2], 0.9);
        } else {
          p5.fill(255, 255, 255, 0.9);
        }
        p5.circle(c.x, c.y, CIRCLE_RADIUS * 2);
      });

      p5.noStroke();
      shuffleArray(ORB_KEYS, () => p5.random()).forEach((key) => {
        const orb = orbs[key];
        const col = ORB_COLORS[key];
        const [r, g, b] = col;
        const dc = p5.drawingContext;
        dc.save();
        dc.shadowColor = `rgba(${r},${g},${b},0.9)`;
        dc.shadowBlur = ORB_GLOW_BLUR;
        p5.fill(r, g, b, 1);
        p5.circle(orb.x, orb.y, RED_BALL_RADIUS * 2);
        dc.shadowBlur = 0;
        dc.restore();
      });

      p5.stroke(255, 255, 255, GRID_EDGE_OPACITY);
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

      p5.textAlign(p5.LEFT, p5.TOP);
      const isGO = gameOver;
      const fontSize = isGO ? LEADERBOARD_GO_FONT_SIZE : LEADERBOARD_FONT_SIZE;
      const lw = isGO ? Math.round(172 * LEADERBOARD_GO_SCALE) : 172;
      const lineH = fontSize + 4;
      const pad = isGO ? LEADERBOARD_PAD + 4 : LEADERBOARD_PAD;
      const col1 = 0;
      const col2 = isGO ? 70 : 52;
      const col3 = isGO ? 132 : 98;
      const col4 = isGO ? 188 : 138;
      const currentRate = 1 + Math.floor(circles.length / BALLS_PER_SPAWN_TIER);
      const nextTierAt = (Math.floor(circles.length / BALLS_PER_SPAWN_TIER) + 1) * BALLS_PER_SPAWN_TIER;
      const ballsToNextRate = nextTierAt - circles.length;
      const titleLineH = LEADERBOARD_TITLE_FONT_SIZE + 4;
      const titleBlockH = titleLineH + lineH * 2 + 6;
      const panelH = titleBlockH + (ORB_KEYS.length + 4) * lineH + pad * 2;
      const leaderboardY = p5.height - panelH - LEADERBOARD_BOTTOM_MARGIN;
      p5.fill(0, 0, 0, 1);
      p5.stroke(255, 255, 255, GRID_EDGE_OPACITY);
      p5.strokeWeight(1);
      p5.rect(LEADERBOARD_X, leaderboardY, lw + pad * 2, panelH);
      p5.noStroke();
      let ly = leaderboardY + pad;
      p5.textSize(LEADERBOARD_TITLE_FONT_SIZE);
      p5.fill(255, 255, 255, 0.95);
      p5.text("The Race to 100", LEADERBOARD_X + pad, ly);
      ly += titleLineH;
      p5.textSize(fontSize);
      p5.fill(255, 255, 255, 0.7);
      p5.text(`Drop rate: ${currentRate} ball${currentRate !== 1 ? "s" : ""} per entry`, LEADERBOARD_X + pad, ly);
      ly += lineH;
      p5.text(`${ballsToNextRate} more ball${ballsToNextRate !== 1 ? "s" : ""} until rate increases`, LEADERBOARD_X + pad, ly);
      ly += lineH + 6;
      p5.fill(255, 255, 255, 0.95);
      p5.text("Leaderboard", LEADERBOARD_X + pad, ly);
      ly += lineH;
      p5.fill(255, 255, 255, 0.6);
      p5.text("Color", LEADERBOARD_X + pad + col1, ly);
      p5.text("Balls", LEADERBOARD_X + pad + col2, ly);
      p5.text("Panels", LEADERBOARD_X + pad + col3, ly);
      p5.text("Score", LEADERBOARD_X + pad + col4, ly);
      ly += lineH;
      ORB_KEYS.forEach((key) => {
        const [r, g, b] = ORB_COLORS[key];
        p5.fill(r, g, b, 1);
        p5.text(ORB_LABELS[key], LEADERBOARD_X + pad + col1, ly);
        p5.fill(255, 255, 255, 0.9);
        p5.text(String(leaderboard.totalBalls[key]), LEADERBOARD_X + pad + col2, ly);
        p5.text(String(leaderboard.winningPanels[key]), LEADERBOARD_X + pad + col3, ly);
        p5.text(String(leaderboard.scoreWinning[key]), LEADERBOARD_X + pad + col4, ly);
        ly += lineH;
      });
      p5.stroke(255, 255, 255, 0.3);
      p5.strokeWeight(1);
      p5.line(LEADERBOARD_X + pad, ly, LEADERBOARD_X + lw, ly);
      ly += lineH;
      p5.noStroke();
      p5.fill(255, 255, 255, 0.95);
      p5.text("Total", LEADERBOARD_X + pad + col1, ly);
      p5.text(String(overallBalls), LEADERBOARD_X + pad + col2, ly);
      p5.text("—", LEADERBOARD_X + pad + col3, ly);
      p5.text(String(overallScore), LEADERBOARD_X + pad + col4, ly);
      ly += lineH;
      p5.fill(255, 255, 255, 0.7);
      p5.text(cellWithMostBalls >= 0 ? `Most balls: cell #${cellWithMostBalls}` : "Most balls: —", LEADERBOARD_X + pad, ly);

      if (gameOver) {
        let winningColorKey = null;
        let maxScore = -1;
        ORB_KEYS.forEach((key) => {
          const s = leaderboard.scoreWinning[key] || 0;
          if (s > maxScore) {
            maxScore = s;
            winningColorKey = key;
          }
        });
        const winnerName = winningColorKey ? ORB_LABELS[winningColorKey] : "—";
        const msg = `Game Over — ${winnerName} wins!`;
        p5.textSize(28);
        p5.textAlign(p5.CENTER, p5.CENTER);
        const mw = p5.textWidth(msg);
        const mx = p5.width / 2;
        const my = p5.height / 2;
        p5.noStroke();
        p5.fill(0, 0, 0, 0.8);
        p5.rect(mx - mw / 2 - 20, my - 24, mw + 40, 48);
        p5.fill(255, 255, 255, 1);
        p5.text(msg, mx, my);

        ly = leaderboardY + panelH + 16;
        const btnW = 140;
        const btnX = LEADERBOARD_X + (lw + pad * 2) / 2 - btnW / 2;
        const btnY = ly;
        restartButton = { x: btnX, y: btnY, w: btnW, h: RESTART_BUTTON_HEIGHT };
        p5.noStroke();
        p5.fill(60, 60, 80, 0.95);
        p5.rect(btnX, btnY, btnW, RESTART_BUTTON_HEIGHT, 6);
        p5.fill(255, 255, 255, 1);
        p5.textSize(16);
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.text("Restart", btnX + btnW / 2, btnY + RESTART_BUTTON_HEIGHT / 2);
      } else {
        restartButton = null;
      }
    };

    p5.mousePressed = () => {
      if (!gameOver || !restartButton) return;
      const mx = p5.mouseX;
      const my = p5.mouseY;
      const r = restartButton;
      if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
        const cols = p5.floor(p5.width / CELL_SIZE);
        const rows = p5.floor(p5.height / CELL_SIZE);
        circles = [];
        cellCounts = new Array(cols * rows).fill(0);
        gameOver = false;
        restartButton = null;
        const w = p5.width;
        const h = p5.height;
        const margin = ORB_SPAWN_MARGIN;
        const x0 = margin;
        const y0 = margin;
        const x1 = w - margin;
        const y1 = h - margin;
        orbs = {
          red: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null },
          yellow: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null },
          teal: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null },
          orange: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null },
          purple: { x: x0 + p5.random(x1 - x0), y: y0 + p5.random(y1 - y0), vx: 0, vy: 0, prevCell: null }
        };
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
