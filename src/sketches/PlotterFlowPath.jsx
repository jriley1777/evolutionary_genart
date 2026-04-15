import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "./Sketch.css";

const PATH_STEP = 2; // step along path for stroke gradient (smaller = smoother)
const POINT_RADIUS = 2; // slightly smaller so 20 points don’t overwhelm
const DRAW_DURATION_MIN_MS = 1800;  // each curve draws for this long (added to millis() at init)
const DRAW_DURATION_MAX_MS = 2600;
const S_CURVE_STRENGTH = 0.52; // rounder, floatier curves
const LENGTH_SAMPLES = 48;
// At waypoints: blend toward next direction (higher = smoother joins, less jagged)
const SMOOTH_JOIN_BLEND = 0.32;
// How far the path "loops out" before turning (bigger = more floaty and loopy)
const LOOP_OUT_STRENGTH = 0.92;
const OVERLAY_PEN_SPEED = 3;
// Thin strokes so paths read clearly inside each small grid cell
const OVERLAY_STROKE_RANGES = [[0.8, 2.2], [1.2, 3], [1.6, 3.8], [1.2, 3.2], [2, 4.5]];
const LINES_PER_CELL = 5; // Bezier pens per grid cell (stroke ranges cycle if this > ranges.length)
const OVERLAY_WAYPOINTS = 8;
const OVERLAY_MARGIN = 40;
const GRID_COLS = 10;
const GRID_ROWS = 8;
const GRID_CELL_COUNT = GRID_COLS * GRID_ROWS;
const BLANK_CELL_COUNT = 0; // random cells with no curves (set > 0; capped at grid size)
const COLUMN_LINE_RGB = [188, 188, 188];
const COLUMN_LINE_ALPHA = 85; // 0–255, lower = more transparent
const COLUMN_LINE_WEIGHT = 1;

// Evaluate cubic Bezier at exactly t in [0, 1] — no snapping to samples
const pointOnBezier = (seg, t) => {
  const u = 1 - t;
  const x = u * u * u * seg.p0.x + 3 * u * u * t * seg.p1.x + 3 * u * t * t * seg.p2.x + t * t * t * seg.p3.x;
  const y = u * u * u * seg.p0.y + 3 * u * u * t * seg.p1.y + 3 * u * t * t * seg.p2.y + t * t * t * seg.p3.y;
  return { x, y };
};

const sampleBezier = (p0, p1, p2, p3, numSamples) => {
  const pts = [];
  for (let i = 0; i <= numSamples; i++) {
    const t = i / numSamples;
    const u = 1 - t;
    const x = u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x;
    const y = u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y;
    pts.push({ x, y });
  }
  return pts;
};

const segmentLength = (seg) => {
  const pts = sampleBezier(seg.p0, seg.p1, seg.p2, seg.p3, LENGTH_SAMPLES);
  let len = 0;
  for (let i = 0; i < pts.length - 1; i++) {
    len += Math.hypot(pts[i + 1].x - pts[i].x, pts[i + 1].y - pts[i].y);
  }
  return len;
};

// Exact (x, y) at length L along path — smooth, no snapping
const positionAtPathLength = (path, segLengths, L) => {
  if (path.length === 0 || L <= 0) return null;
  let pos = 0;
  for (let i = 0; i < path.length; i++) {
    const len = segLengths[i];
    if (L <= pos + len) {
      const t = len > 0 ? (L - pos) / len : 0;
      return pointOnBezier(path[i], Math.min(1, Math.max(0, t)));
    }
    pos += len;
  }
  return pointOnBezier(path[path.length - 1], 1);
};

// S-curve Bezier from A to B (no previous segment): control points perpendicular to (B-A)
const makeSCurve = (p5, from, to) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const perpX = -dy / dist;
  const perpY = dx / dist;
  const k = dist * S_CURVE_STRENGTH;
  return {
    p0: from.copy(),
    p1: p5.createVector(from.x + perpX * k, from.y + perpY * k),
    p2: p5.createVector(to.x - perpX * k, to.y - perpY * k),
    p3: to.copy(),
  };
};

// Segment from current to dest with smooth join: loop out in incoming direction, then curve to dest
const makeSmoothSegment = (p5, from, to, prevSeg) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const toDestX = dx / dist;
  const toDestY = dy / dist;
  const perpX = -dy / dist;
  const perpY = dx / dist;
  const k2 = dist * S_CURVE_STRENGTH;

  let outX = toDestX;
  let outY = toDestY;
  let loopLen = dist * LOOP_OUT_STRENGTH;

  if (prevSeg) {
    const inX = from.x - prevSeg.p2.x;
    const inY = from.y - prevSeg.p2.y;
    const inLen = Math.hypot(inX, inY) || 1;
    const inDirX = inX / inLen;
    const inDirY = inY / inLen;
    const blendX = inDirX * (1 - SMOOTH_JOIN_BLEND) + toDestX * SMOOTH_JOIN_BLEND;
    const blendY = inDirY * (1 - SMOOTH_JOIN_BLEND) + toDestY * SMOOTH_JOIN_BLEND;
    const bl = Math.hypot(blendX, blendY) || 1;
    outX = blendX / bl;
    outY = blendY / bl;
  }

  return {
    p0: from.copy(),
    p1: p5.createVector(from.x + outX * loopLen, from.y + outY * loopLen),
    p2: p5.createVector(to.x - perpX * k2, to.y - perpY * k2),
    p3: to.copy(),
  };
};

const PlotterFlowPath = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let canvasW = 0;
    let canvasH = 0;
    let gridCells = [];

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
      p5.background(0, 0, 0);
      canvasW = w;
      canvasH = h;
      initAllGridCells(w, h);
    };

    const addSegmentToOverlay = (overlay) => {
      const dest = overlay.waypoints[overlay.nextWaypointIndex].copy();
      overlay.nextWaypointIndex = (overlay.nextWaypointIndex + 1) % overlay.waypoints.length;
      const prevSeg = overlay.path.length > 0 ? overlay.path[overlay.path.length - 1] : null;
      const seg = prevSeg
        ? makeSmoothSegment(p5, overlay.current, dest, prevSeg)
        : makeSCurve(p5, overlay.current, dest);
      overlay.path.push(seg);
      overlay.current = dest.copy();
    };

    const initOverlayCurvesForCell = (cw, ch) => {
      const margin = Math.max(2, Math.min(OVERLAY_MARGIN, cw * 0.08, ch * 0.08));
      const curves = [];
      for (let curveIndex = 0; curveIndex < LINES_PER_CELL; curveIndex++) {
        const waypoints = [];
        for (let i = 0; i < OVERLAY_WAYPOINTS; i++) {
          waypoints.push(p5.createVector(
            p5.random(margin, cw - margin),
            p5.random(margin, ch - margin)
          ));
        }
        const [strokeMin, strokeMax] = OVERLAY_STROKE_RANGES[curveIndex % OVERLAY_STROKE_RANGES.length];
        const overlay = {
          waypoints,
          path: [],
          current: p5.createVector(
            p5.random(margin, cw - margin),
            p5.random(margin, ch - margin)
          ),
          nextWaypointIndex: 0,
          drawHead: 0,
          color: (() => {
            const v = p5.random(55, 255); // varied grey → white on black
            return [v, v, v];
          })(),
          strokeMin,
          strokeMax,
          // Absolute deadline (millis since sketch start), not a duration — so click-redraw works after load
          drawUntilMs: p5.millis() + p5.random(DRAW_DURATION_MIN_MS, DRAW_DURATION_MAX_MS),
        };
        addSegmentToOverlay(overlay);
        curves.push(overlay);
      }
      return curves;
    };

    const initAllGridCells = (w, h) => {
      const cellW = w / GRID_COLS;
      const cellH = h / GRID_ROWS;
      gridCells = [];
      const blankCount = Math.min(BLANK_CELL_COUNT, GRID_CELL_COUNT);
      const blankIndices = new Set();
      while (blankIndices.size < blankCount) {
        blankIndices.add(Math.floor(p5.random(GRID_CELL_COUNT)));
      }
      for (let i = 0; i < GRID_CELL_COUNT; i++) {
        if (blankIndices.has(i)) {
          gridCells.push({ blank: true, overlayCurves: [] });
        } else {
          gridCells.push({ blank: false, overlayCurves: initOverlayCurvesForCell(cellW, cellH) });
        }
      }
      const eligibleForRed = [];
      for (let i = 0; i < GRID_CELL_COUNT; i++) {
        if (!blankIndices.has(i)) eligibleForRed.push(i);
      }
      if (eligibleForRed.length > 0) {
        const redCellIdx = eligibleForRed[Math.floor(p5.random(eligibleForRed.length))];
        for (const overlay of gridCells[redCellIdx].overlayCurves) {
          const r = p5.random(130, 255);
          const g = p5.random(0, 55);
          const b = p5.random(0, 55);
          overlay.color = [r, g, b];
        }
      }
    };

    p5.draw = () => {
      p5.background(0, 0, 0);
      const cellW = canvasW / GRID_COLS;
      const cellH = canvasH / GRID_ROWS;
      p5.noFill();
      p5.stroke(COLUMN_LINE_RGB[0], COLUMN_LINE_RGB[1], COLUMN_LINE_RGB[2], COLUMN_LINE_ALPHA);
      p5.strokeWeight(COLUMN_LINE_WEIGHT);
      for (let c = 1; c < GRID_COLS; c++) {
        const x = c * cellW;
        p5.line(x, 0, x, canvasH);
      }
      const now = p5.millis();
      const approachTh = Math.max(8, Math.min(100, (cellW + cellH) * 0.1));
      const penSpeed = Math.max(0.5, OVERLAY_PEN_SPEED * Math.min(1.4, cellW / 130));
      const strokeScale = Math.max(0.08, Math.min(0.32, cellW / 380));
      const pointR = Math.max(1, Math.min(POINT_RADIUS, cellW * 0.035));

      for (let idx = 0; idx < gridCells.length; idx++) {
        const cell = gridCells[idx];
        if (cell.blank) continue;
        const col = idx % GRID_COLS;
        const row = Math.floor(idx / GRID_COLS);
        const { overlayCurves } = cell;
        p5.push();
        p5.translate(col * cellW, row * cellH);

        for (const overlayCurve of overlayCurves) {
          if (!overlayCurve || overlayCurve.path.length === 0) continue;
          const stillDrawing = now < overlayCurve.drawUntilMs;
          const path = overlayCurve.path;
          let totalLength = 0;
          let segLengths = path.map((seg) => {
            const L = segmentLength(seg);
            totalLength += L;
            return L;
          });
          if (stillDrawing && totalLength > 0) {
            const remaining = totalLength - overlayCurve.drawHead;
            if (remaining <= approachTh) {
              addSegmentToOverlay(overlayCurve);
            }
            totalLength = 0;
            segLengths = overlayCurve.path.map((seg) => {
              const L = segmentLength(seg);
              totalLength += L;
              return L;
            });
            overlayCurve.drawHead = Math.min(overlayCurve.drawHead + penSpeed, totalLength);
          }
          const drawnLen = overlayCurve.drawHead;
          const [r, g, b] = overlayCurve.color;
          if (drawnLen > 0) {
            p5.noFill();
            p5.stroke(r, g, b);
            let len = 0;
            while (len < drawnLen) {
              const nextLen = Math.min(len + PATH_STEP, drawnLen);
              const p = len / drawnLen;
              const strokeW = (overlayCurve.strokeMin + (overlayCurve.strokeMax - overlayCurve.strokeMin) * Math.sin(p * Math.PI)) * strokeScale;
              p5.strokeWeight(strokeW);
              const a = positionAtPathLength(path, segLengths, len);
              const b = positionAtPathLength(path, segLengths, nextLen);
              if (a && b) p5.line(a.x, a.y, b.x, b.y);
              len = nextLen;
            }
          }
          const pt = positionAtPathLength(path, segLengths, overlayCurve.drawHead);
          if (pt && stillDrawing) {
            p5.noStroke();
            p5.fill(r, g, b);
            p5.circle(pt.x, pt.y, pointR * 2);
          }
        }
        p5.pop();
      }
    };

    p5.mousePressed = () => {
      p5.background(0, 0, 0);
      const w = canvasW || p5.width;
      const h = canvasH || p5.height;
      initAllGridCells(w, h);
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default PlotterFlowPath;
