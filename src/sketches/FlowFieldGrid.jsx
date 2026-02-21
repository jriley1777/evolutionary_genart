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
const ORB_SHADOW_OFFSET_X = 3;
const ORB_SHADOW_OFFSET_Y = 5;
const ORB_SHADOW_OPACITY = 0.4;
const ORB_SHADOW_RADIUS_SCALE = 1.05; // slightly larger than orb for soft edge
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
const COUNTER_OPACITY_HIGHLIGHT = 0.95;
const CELL_INDEX_FONT_SIZE = 10;
const CELL_INDEX_INSET = 6;
const GLOW_BLUR = 28;
const GLOW_STROKE_WEIGHT = 2;
const LEADER_ROW_COL_GLOW_BLUR = 64;
const LEADER_ROW_COL_OPACITY = 1;
const LEADER_ROW_COL_STROKE_WEIGHT = 2.5;
const LEADER_ROW_COL_BG_OPACITY = 0.12;
const LEADER_ROW_COL_MIN_BALLS = 5;
const PULSE_WAVE_OPACITY = 0.4;
const SCORING_ZONE_BOUNDS = [
  [0, 30],
  [31, 60],
  [61, 90]
];
const SCORING_ZONE_BG_OPACITY = 0.1;
const WINNING_CELL_BG_OPACITY = 0.28;
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
const WINNING_BALL_COUNT = 250;
const BALLS_PER_SPAWN_TIER = 100;
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
    let panelX = null;
    let panelY = null;
    let isDraggingPanel = false;
    let dragStartX = 0;
    let dragStartY = 0;
    let panelStartX = 0;
    let panelStartY = 0;
    let lastPanelRect = null;
    let prevCellDominant = null;
    let waveStartFrame = null;
    let prevWaveCellWithMostBalls = null;

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
        prevCellDominant = null;
        waveStartFrame = null;
        prevWaveCellWithMostBalls = null;
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

      if (prevCellDominant != null && prevCellDominant.length !== cols * rows) {
        prevCellDominant = null;
        waveStartFrame = null;
        prevWaveCellWithMostBalls = null;
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
        ORB_KEYS.forEach((k) => {
          if (counts[k] > maxCount) maxCount = counts[k];
        });
        const tiedKeys = ORB_KEYS.filter((k) => counts[k] === maxCount && maxCount > 0);
        let bestKey = null;
        if (tiedKeys.length === 0) {
          bestKey = null;
        } else if (tiedKeys.length === 1) {
          bestKey = tiedKeys[0];
        } else {
          if (prevCellDominant != null && tiedKeys.indexOf(prevCellDominant[idx]) !== -1) {
            bestKey = prevCellDominant[idx];
          } else {
            bestKey = tiedKeys[0];
          }
        }
        cellDominant[idx] = bestKey;
      }
      prevCellDominant = cellDominant.slice();

      const ballsPerCell = new Array(cellCounts.length).fill(0);
      circles.forEach((c) => {
        const idx = c.cellX + c.cellY * cols;
        if (idx >= 0 && idx < ballsPerCell.length) ballsPerCell[idx]++;
      });

      const leaderboard = { totalBalls: {}, winningPanels: {}, scoreWinning: {} };
      ORB_KEYS.forEach((k) => {
        leaderboard.totalBalls[k] = circles.filter((c) => c.color === ORB_COLORS[k]).length;
        leaderboard.winningPanels[k] = 0;
        leaderboard.scoreWinning[k] = 0;
      });
      let overallBalls = circles.length;
      let overallScore = 0;
      for (let idx = 0; idx < cellCounts.length; idx++) {
        const n = ballsPerCell[idx] || 0;
        const key = cellDominant[idx];
        if (key) {
          leaderboard.winningPanels[key]++;
          leaderboard.scoreWinning[key] += n;
        }
        overallScore += n;
      }
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

      const winningCols = new Set();
      const winningRows = new Set();
      const winningIndices = new Set();
      if (maxBallsInCell > 0) {
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const idx = x + y * cols;
            if ((ballsPerCell[idx] || 0) === maxBallsInCell) {
              winningCols.add(x);
              winningRows.add(y);
              winningIndices.add(idx);
            }
          }
        }
      }
      const zonesToHighlight = new Set();
      winningIndices.forEach((idx) => {
        SCORING_ZONE_BOUNDS.forEach(([lo, hi], zone) => {
          if (idx >= lo && idx <= hi) zonesToHighlight.add(zone);
        });
      });
      const isCellInHighlightedZone = (idx) => {
        for (let z = 0; z < SCORING_ZONE_BOUNDS.length; z++) {
          if (!zonesToHighlight.has(z)) continue;
          const [lo, hi] = SCORING_ZONE_BOUNDS[z];
          if (idx >= lo && idx <= hi) return true;
        }
        return false;
      };

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
        const dc = p5.drawingContext;
        dc.save();
        p5.noStroke();
        zonesToHighlight.forEach((zone) => {
          const [lo, hi] = SCORING_ZONE_BOUNDS[zone];
          p5.fill(0, 255, 120, SCORING_ZONE_BG_OPACITY);
          for (let idx = lo; idx <= hi && idx < cols * rows; idx++) {
            const x = idx % cols;
            const y = Math.floor(idx / cols);
            p5.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          }
        });
        winningIndices.forEach((idx) => {
          const x = idx % cols;
          const y = Math.floor(idx / cols);
          p5.fill(0, 255, 120, WINNING_CELL_BG_OPACITY);
          p5.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        });
        if (maxBallsInCell < LEADER_ROW_COL_MIN_BALLS) {
          prevWaveCellWithMostBalls = null;
        }
        if (maxBallsInCell >= LEADER_ROW_COL_MIN_BALLS) {
          p5.noStroke();
          p5.fill(255, 255, 255, LEADER_ROW_COL_BG_OPACITY);
          for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
              if (winningCols.has(x) || winningRows.has(y)) {
                p5.rect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
              }
            }
          }
          dc.shadowColor = "rgba(255, 255, 255, 1)";
          dc.shadowBlur = LEADER_ROW_COL_GLOW_BLUR;
          p5.noFill();
          p5.stroke(255, 255, 255, LEADER_ROW_COL_OPACITY);
          p5.strokeWeight(LEADER_ROW_COL_STROKE_WEIGHT);
          winningCols.forEach((x) => {
            p5.line(x * CELL_SIZE, 0, x * CELL_SIZE, p5.height);
            p5.line((x + 1) * CELL_SIZE, 0, (x + 1) * CELL_SIZE, p5.height);
          });
          winningRows.forEach((y) => {
            p5.line(0, y * CELL_SIZE, p5.width, y * CELL_SIZE);
            p5.line(0, (y + 1) * CELL_SIZE, p5.width, (y + 1) * CELL_SIZE);
          });
          if (cellWithMostBalls !== prevWaveCellWithMostBalls) {
            waveStartFrame = p5.frameCount;
            prevWaveCellWithMostBalls = cellWithMostBalls;
          }
          const rowToWinningCol = {};
          const colToWinningRow = {};
          winningIndices.forEach((idx) => {
            const row = Math.floor(idx / cols);
            const col = idx % cols;
            if (rowToWinningCol[row] == null) rowToWinningCol[row] = col;
            if (colToWinningRow[col] == null) colToWinningRow[col] = row;
          });
          const stepIndex = waveStartFrame != null ? p5.frameCount - waveStartFrame : 0;
          p5.noStroke();
          p5.fill(255, 255, 255, PULSE_WAVE_OPACITY);
          // Left → right along each winning row
          winningRows.forEach((y) => {
            const winningCol = rowToWinningCol[y];
            if (winningCol == null || stepIndex < 0 || stepIndex > winningCol) return;
            p5.rect(stepIndex * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          });
          // Right → left along each winning row
          winningRows.forEach((y) => {
            const winningCol = rowToWinningCol[y];
            if (winningCol == null || stepIndex < 0 || stepIndex > cols - 1 - winningCol) return;
            p5.rect((cols - 1 - stepIndex) * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          });
          // Top → bottom along each winning column
          winningCols.forEach((x) => {
            const winningRow = colToWinningRow[x];
            if (winningRow == null || stepIndex < 0 || stepIndex > winningRow) return;
            p5.rect(x * CELL_SIZE, stepIndex * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          });
          // Bottom → top along each winning column
          winningCols.forEach((x) => {
            const winningRow = colToWinningRow[x];
            if (winningRow == null || stepIndex < 0 || stepIndex > rows - 1 - winningRow) return;
            p5.rect(x * CELL_SIZE, (rows - 1 - stepIndex) * CELL_SIZE, CELL_SIZE, CELL_SIZE);
          });
        }
        dc.shadowBlur = 0;
        dc.restore();

        dc.save();
        dc.shadowColor = "rgba(0, 255, 120, 0.95)";
        dc.shadowBlur = GLOW_BLUR;
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
        dc.shadowBlur = 0;
        dc.restore();
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

      const counterFontSize = CELL_SIZE * COUNTER_FONT_SIZE_RATIO;
      const counterFontSizeThreeDigits = CELL_SIZE * COUNTER_FONT_SIZE_RATIO * 0.65;
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.noStroke();
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = x + y * cols;
          const n = ballsPerCell[idx] || 0;
          if (n > 0) {
            const highlighted = (maxBallsInCell >= LEADER_ROW_COL_MIN_BALLS && (winningCols.has(x) || winningRows.has(y))) || isCellInHighlightedZone(idx);
            const opacity = highlighted ? COUNTER_OPACITY_HIGHLIGHT : COUNTER_OPACITY;
            p5.textSize(n >= 100 ? counterFontSizeThreeDigits : counterFontSize);
            const key = cellDominant[idx];
            if (key) {
              const [r, g, b] = ORB_COLORS[key];
              p5.fill(r, g, b, opacity);
            } else {
              p5.fill(255, 255, 255, opacity);
            }
            const cx = x * CELL_SIZE + CELL_SIZE / 2;
            const cy = y * CELL_SIZE + CELL_SIZE / 2;
            p5.text(String(n), cx, cy);
          }
        }
      }

      p5.noStroke();
      shuffleArray(ORB_KEYS, () => p5.random()).forEach((key) => {
        const orb = orbs[key];
        const col = ORB_COLORS[key];
        const [r, g, b] = col;
        const dc = p5.drawingContext;
        dc.save();
        // Shadow underneath the orb (darker, offset)
        p5.fill(0, 0, 0, ORB_SHADOW_OPACITY);
        p5.circle(
          orb.x + ORB_SHADOW_OFFSET_X,
          orb.y + ORB_SHADOW_OFFSET_Y,
          RED_BALL_RADIUS * 2 * ORB_SHADOW_RADIUS_SCALE
        );
        // Orb with glow
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

      if (gameOver) {
        let winningColorKeyMsg = null;
        let maxScoreMsg = -1;
        ORB_KEYS.forEach((key) => {
          const s = leaderboard.scoreWinning[key] || 0;
          if (s > maxScoreMsg) {
            maxScoreMsg = s;
            winningColorKeyMsg = key;
          }
        });
        const winnerNameMsg = winningColorKeyMsg ? ORB_LABELS[winningColorKeyMsg] : "—";
        const msg = `Game Over — ${winnerNameMsg} wins!`;
        p5.textSize(28);
        p5.textAlign(p5.CENTER, p5.CENTER);
        const mw = p5.textWidth(msg);
        const msgX = p5.width / 2;
        const msgY = p5.height / 2;
        p5.noStroke();
        p5.fill(0, 0, 0, 0.8);
        p5.rect(msgX - mw / 2 - 20, msgY - 24, mw + 40, 48);
        p5.fill(255, 255, 255, 1);
        p5.text(msg, msgX, msgY);
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
      const panelW = lw + pad * 2;
      if (panelY == null) {
        panelX = LEADERBOARD_X;
        panelY = p5.height - panelH - LEADERBOARD_BOTTOM_MARGIN;
      }
      const leaderboardY = panelY;
      p5.fill(0, 0, 0, 1);
      p5.stroke(255, 255, 255, GRID_EDGE_OPACITY);
      p5.strokeWeight(1);
      p5.rect(panelX, leaderboardY, panelW, panelH);
      p5.noStroke();
      let ly = leaderboardY + pad;
      p5.textSize(LEADERBOARD_TITLE_FONT_SIZE);
      p5.fill(255, 255, 255, 0.95);
      p5.text("The Race to 250", panelX + pad, ly);
      ly += titleLineH;
      p5.textSize(fontSize);
      p5.fill(255, 255, 255, 0.7);
      p5.text(`Drop rate: ${currentRate} ball${currentRate !== 1 ? "s" : ""} per entry`, panelX + pad, ly);
      ly += lineH;
      p5.text(`${ballsToNextRate} more ball${ballsToNextRate !== 1 ? "s" : ""} until rate increases`, panelX + pad, ly);
      ly += lineH + 6;
      p5.fill(255, 255, 255, 0.95);
      p5.text("Leaderboard", panelX + pad, ly);
      ly += lineH;
      p5.fill(255, 255, 255, 0.6);
      p5.text("Color", panelX + pad + col1, ly);
      p5.text("Balls", panelX + pad + col2, ly);
      p5.text("Panels", panelX + pad + col3, ly);
      p5.text("Score", panelX + pad + col4, ly);
      ly += lineH;
      ORB_KEYS.forEach((key) => {
        const [r, g, b] = ORB_COLORS[key];
        p5.fill(r, g, b, 1);
        p5.text(ORB_LABELS[key], panelX + pad + col1, ly);
        p5.fill(255, 255, 255, 0.9);
        p5.text(String(leaderboard.totalBalls[key]), panelX + pad + col2, ly);
        p5.text(String(leaderboard.winningPanels[key]), panelX + pad + col3, ly);
        p5.text(String(leaderboard.scoreWinning[key]), panelX + pad + col4, ly);
        ly += lineH;
      });
      p5.stroke(255, 255, 255, 0.3);
      p5.strokeWeight(1);
      p5.line(panelX + pad, ly, panelX + lw, ly);
      ly += lineH;
      p5.noStroke();
      p5.fill(255, 255, 255, 0.95);
      p5.text("Total", panelX + pad + col1, ly);
      p5.text(String(overallBalls), panelX + pad + col2, ly);
      p5.text("—", panelX + pad + col3, ly);
      p5.text(String(overallScore), panelX + pad + col4, ly);
      ly += lineH;
      p5.fill(255, 255, 255, 0.7);
      p5.text(cellWithMostBalls >= 0 ? `Most balls: cell #${cellWithMostBalls}` : "Most balls: —", panelX + pad, ly);

      lastPanelRect = { x: panelX, y: panelY, w: panelW, h: panelH };

      const mx = p5.mouseX;
      const my = p5.mouseY;
      const overPanel = lastPanelRect && mx >= lastPanelRect.x && mx <= lastPanelRect.x + lastPanelRect.w && my >= lastPanelRect.y && my <= lastPanelRect.y + lastPanelRect.h;
      if (isDraggingPanel) {
        p5.cursor("grabbing");
      } else if (overPanel) {
        p5.cursor("grab");
      } else {
        p5.cursor("default");
      }

      if (gameOver) {
        ly = leaderboardY + panelH + 16;
        const btnW = 140;
        const btnX = panelX + panelW / 2 - btnW / 2;
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
      const mx = p5.mouseX;
      const my = p5.mouseY;
      const onRestartButton = gameOver && restartButton && mx >= restartButton.x && mx <= restartButton.x + restartButton.w && my >= restartButton.y && my <= restartButton.y + restartButton.h;
      if (onRestartButton) {
        const cols = p5.floor(p5.width / CELL_SIZE);
        const rows = p5.floor(p5.height / CELL_SIZE);
        circles = [];
        cellCounts = new Array(cols * rows).fill(0);
        gameOver = false;
        restartButton = null;
        prevCellDominant = null;
        waveStartFrame = null;
        prevWaveCellWithMostBalls = null;
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
        return;
      }
      const inPanel = lastPanelRect && mx >= lastPanelRect.x && mx <= lastPanelRect.x + lastPanelRect.w && my >= lastPanelRect.y && my <= lastPanelRect.y + lastPanelRect.h;
      if (inPanel) {
        isDraggingPanel = true;
        dragStartX = mx;
        dragStartY = my;
        panelStartX = panelX;
        panelStartY = panelY;
      }
    };

    p5.mouseDragged = () => {
      if (isDraggingPanel) {
        panelX = panelStartX + (p5.mouseX - dragStartX);
        panelY = panelStartY + (p5.mouseY - dragStartY);
      }
    };

    p5.mouseReleased = () => {
      isDraggingPanel = false;
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
