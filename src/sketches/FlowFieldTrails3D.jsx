import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import FollowCam3D from "../utils/FollowCam3D";
import "./Sketch.css";

// Simple 3D value noise (permutation + smooth)
const perm = (() => {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm256 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) perm256[i] = p[i & 255];
  return perm256;
})();

function fade(t) {
  return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a, b, t) {
  return a + t * (b - a);
}
function grad3D(hash, x, y, z) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}
function noise3D(x, y, z) {
  const X = Math.floor(x) & 255;
  const Y = Math.floor(y) & 255;
  const Z = Math.floor(z) & 255;
  x -= Math.floor(x);
  y -= Math.floor(y);
  z -= Math.floor(z);
  const u = fade(x);
  const v = fade(y);
  const w = fade(z);
  const A = (perm[X] + Y) & 511;
  const B = (perm[(X + 1) & 255] + Y) & 511;
  return lerp(
    lerp(
      lerp(
        grad3D(perm[(A + Z) & 511], x, y, z),
        grad3D(perm[(B + Z) & 511], x - 1, y, z),
        u
      ),
      lerp(
        grad3D(perm[(A + Z + 1) & 511], x, y, z - 1),
        grad3D(perm[(B + Z + 1) & 511], x - 1, y, z - 1),
        u
      ),
      w
    ),
    lerp(
      lerp(
        grad3D(perm[(A + 1 + Z) & 511], x, y - 1, z),
        grad3D(perm[(B + 1 + Z) & 511], x - 1, y - 1, z),
        u
      ),
      lerp(
        grad3D(perm[(A + 1 + Z + 1) & 511], x, y - 1, z - 1),
        grad3D(perm[(B + 1 + Z + 1) & 511], x - 1, y - 1, z - 1),
        u
      ),
      w
    ),
    v
  );
}

const BOUND = 3;
const PARTICLE_COUNT = 2480;
const TRAIL_LENGTH = 5;
const TRAIL_LINEWIDTH = 1;
const FLOW_SCALE = 0.65;
const PARTICLE_SPEED = 0.002;
const SEPARATION_DIST = 0.6;
const SEPARATION_STRENGTH = 0.45;
const GRID_DIVS = 3; // cubes within the cube, Rubik-like grid
const BG_COLOR = new THREE.Color(0x000000);
const CAMERA_FOLLOW_LERP = 0.01;
const CAMERA_LOOK_LERP = 0.003;
const CAMERA_FOLLOW_DISTANCE = 7;
const CAMERA_FOLLOW_HEIGHT = 2.2;
const CAMERA_BOX_MARGIN = 3;
const CAMERA_TARGET_DURATION = 1800; // ~30 seconds at 60fps (dt ~= 1)
const FOG_NEAR = 12;
const FOG_FAR = 42;
const PALETTE = [
  new THREE.Color(0xf72585),
  new THREE.Color(0x4361ee),
  new THREE.Color(0x4cc9f0),
  new THREE.Color(0x7209b7),
  new THREE.Color(0x4895ef),
];

function sampleFlow(x, y, z, t) {
  const scale = 0.12;
  const tt = t * 0.4; // slow temporal evolution of the field
  const nx = x * scale + tt;
  const ny = y * scale + tt * 0.7;
  const nz = z * scale + tt * 0.5;
  const dx = (noise3D(nx + 0.01, ny, nz) - noise3D(nx - 0.01, ny, nz)) * 0.5;
  const dy = (noise3D(nx, ny + 0.01, nz) - noise3D(nx, ny - 0.01, nz)) * 0.5;
  const dz = (noise3D(nx, ny, nz + 0.01) - noise3D(nx, ny, nz - 0.01)) * 0.5;
  return new THREE.Vector3(dx, dy, dz).normalize().multiplyScalar(FLOW_SCALE);
}

const FlowFieldTrails3D = ({ isFullscreen = false, photoMode, sketchType }) => {
  const containerRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const particlesRef = useRef([]);
  const clockRef = useRef(new THREE.Clock());
  const frameRef = useRef(0);
  const cameraTargetRef = useRef(null);
  const followCamRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const scene = new THREE.Scene();
    scene.background = BG_COLOR.clone();
    scene.fog = new THREE.Fog(0x080a14, FOG_NEAR, FOG_FAR);
    // Draw a subtle cube grid (Rubik's-cube-style) inside the bounding box
    const gridPositions = [];
    const step = (BOUND * 2) / GRID_DIVS;
    for (let i = 0; i <= GRID_DIVS; i++) {
      const x = -BOUND + i * step;
      // vertical lines on front and back faces
      gridPositions.push(x, -BOUND, -BOUND, x, BOUND, -BOUND);
      gridPositions.push(x, -BOUND, BOUND, x, BOUND, BOUND);
      // depth lines on bottom and top
      gridPositions.push(x, -BOUND, -BOUND, x, -BOUND, BOUND);
      gridPositions.push(x, BOUND, -BOUND, x, BOUND, BOUND);
    }
    for (let i = 0; i <= GRID_DIVS; i++) {
      const y = -BOUND + i * step;
      // horizontal lines on front and back faces
      gridPositions.push(-BOUND, y, -BOUND, BOUND, y, -BOUND);
      gridPositions.push(-BOUND, y, BOUND, BOUND, y, BOUND);
      // depth lines on left and right
      gridPositions.push(-BOUND, y, -BOUND, -BOUND, y, BOUND);
      gridPositions.push(BOUND, y, -BOUND, BOUND, y, BOUND);
    }
    for (let i = 0; i <= GRID_DIVS; i++) {
      const z = -BOUND + i * step;
      // vertical lines on left and right faces
      gridPositions.push(-BOUND, -BOUND, z, -BOUND, BOUND, z);
      gridPositions.push(BOUND, -BOUND, z, BOUND, BOUND, z);
      // horizontal lines on bottom and top faces
      gridPositions.push(-BOUND, -BOUND, z, BOUND, -BOUND, z);
      gridPositions.push(-BOUND, BOUND, z, BOUND, BOUND, z);
    }
    const gridGeometry = new THREE.BufferGeometry();
    gridGeometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(gridPositions, 3)
    );
    const gridMaterial = new THREE.LineBasicMaterial({
      color: 0x333a55,
      transparent: true,
      opacity: 0.05,
    });
    const gridLines = new THREE.LineSegments(gridGeometry, gridMaterial);
    scene.add(gridLines);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.5, 100);
    camera.position.set(0, 0, 0);
    cameraRef.current = camera;
    followCamRef.current = new FollowCam3D(camera, {
      followDistance: CAMERA_FOLLOW_DISTANCE,
      followHeight: CAMERA_FOLLOW_HEIGHT,
      followLerp: CAMERA_FOLLOW_LERP,
      lookLerp: CAMERA_LOOK_LERP,
      bound: BOUND,
      boxMargin: CAMERA_BOX_MARGIN
    });

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 2 * BOUND;
      const y = (Math.random() - 0.5) * 2 * BOUND;
      const z = (Math.random() - 0.5) * 2 * BOUND;
      const trail = [];
      for (let k = 0; k < TRAIL_LENGTH; k++) trail.push(new THREE.Vector3(x, y, z));

      const positions = [];
      trail.forEach((v) => {
        positions.push(v.x, v.y, v.z);
      });

      const geometry = new LineGeometry();
      geometry.setPositions(positions);

      const baseColor = PALETTE[i % PALETTE.length].clone();

      // Core trail
      const coreMaterial = new LineMaterial({
        color: baseColor,
        linewidth: TRAIL_LINEWIDTH,
        transparent: true,
        opacity: 0.6,
        vertexColors: false,
      });
      coreMaterial.resolution.set(width, height);
      const line = new Line2(geometry, coreMaterial);
      line.computeLineDistances();

      // Soft outer glow (thicker, lower opacity, additive blending)
      const glowMaterial = new LineMaterial({
        color: baseColor,
        linewidth: TRAIL_LINEWIDTH * 2.2,
        transparent: true,
        opacity: 0.22,
        vertexColors: false,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      glowMaterial.resolution.set(width, height);
      const glowLine = new Line2(geometry, glowMaterial);
      glowLine.computeLineDistances();

      scene.add(glowLine);
      scene.add(line);
      particles.push({
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3(0, 0, 0),
        trail,
        line,
        glowLine,
      });
    }
    particlesRef.current = particles;
    if (particles.length > 0) {
      cameraTargetRef.current = particles[Math.floor(Math.random() * particles.length)];
      if (followCamRef.current) {
        followCamRef.current.setTarget(cameraTargetRef.current);
      }
    }

    let time = 0;
    let timeSinceTargetChange = 0;
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(clockRef.current.getDelta() * 60, 3);
      time += dt * 0.015;
      timeSinceTargetChange += dt;

      // Gentle separation so trails avoid overlapping too much
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.pos.x - b.pos.x;
          const dy = a.pos.y - b.pos.y;
          const dz = a.pos.z - b.pos.z;
          const distSq = dx * dx + dy * dy + dz * dz;
          const minDistSq = SEPARATION_DIST * SEPARATION_DIST;
          if (distSq > 0 && distSq < minDistSq) {
            const dist = Math.sqrt(distSq);
            const strength = ((SEPARATION_DIST - dist) / SEPARATION_DIST) * SEPARATION_STRENGTH;
            const invDist = 1 / dist;
            const sx = dx * invDist * strength;
            const sy = dy * invDist * strength;
            const sz = dz * invDist * strength;
            a.vel.x += sx;
            a.vel.y += sy;
            a.vel.z += sz;
            b.vel.x -= sx;
            b.vel.y -= sy;
            b.vel.z -= sz;
          }
        }
      }

      particles.forEach((p) => {
        const force = sampleFlow(p.pos.x, p.pos.y, p.pos.z, time);
        p.vel.add(force);
        p.vel.clampLength(0, PARTICLE_SPEED);
        p.pos.add(p.vel);
        p.vel.multiplyScalar(0.985);
        p.pos.x = THREE.MathUtils.clamp(p.pos.x, -BOUND, BOUND);
        p.pos.y = THREE.MathUtils.clamp(p.pos.y, -BOUND, BOUND);
        p.pos.z = THREE.MathUtils.clamp(p.pos.z, -BOUND, BOUND);
        p.trail.shift();
        p.trail.push(p.pos.clone());
        const positions = [];
        p.trail.forEach((v) => {
          positions.push(v.x, v.y, v.z);
        });
        p.line.geometry.setPositions(positions);
        p.line.computeLineDistances();
      });

      // Depth-based opacity: closer trails appear brighter, farther ones more transparent
      const camPos = camera.position;
      const maxDist = BOUND * 2.0;
      const coreNear = 0.85;
      const coreFar = 0.25;
      const glowNear = 0.32;
      const glowFar = 0.06;
      particles.forEach((p) => {
        const d = camPos.distanceTo(p.pos);
        const t = THREE.MathUtils.clamp(d / maxDist, 0, 1); // 0 = very close, 1 = far
        const coreOpacity = THREE.MathUtils.lerp(coreNear, coreFar, t);
        p.line.material.opacity = coreOpacity;
        if (p.glowLine && p.glowLine.material) {
          const glowOpacity = THREE.MathUtils.lerp(glowNear, glowFar, t);
          p.glowLine.material.opacity = glowOpacity;
        }
      });

      // Pick a new target trail to follow every ~30 seconds
      if ((timeSinceTargetChange > CAMERA_TARGET_DURATION || !cameraTargetRef.current) && particles.length > 0) {
        cameraTargetRef.current = particles[Math.floor(Math.random() * particles.length)];
        timeSinceTargetChange = 0;
        if (followCamRef.current) {
          followCamRef.current.setTarget(cameraTargetRef.current);
        }
      }

      if (followCamRef.current) {
        followCamRef.current.update(dt);
      }
      camera.updateMatrixWorld();

      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      particlesRef.current.forEach((p) => {
        if (p.line.material.resolution) p.line.material.resolution.set(w, h);
        if (p.glowLine && p.glowLine.material.resolution) {
          p.glowLine.material.resolution.set(w, h);
        }
      });
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frameRef.current);
      particlesRef.current.forEach((p) => {
        p.line.geometry.dispose();
        if (p.line.material.dispose) p.line.material.dispose();
        if (p.glowLine && p.glowLine.material && p.glowLine.material.dispose) {
          p.glowLine.material.dispose();
        }
        scene.remove(p.line);
        if (p.glowLine) scene.remove(p.glowLine);
      });
      gridGeometry.dispose();
      gridMaterial.dispose();
      scene.remove(gridLines);
      renderer.dispose();
      if (container && renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isFullscreen]);

  return (
    <div
      ref={containerRef}
      className={isFullscreen ? "canvas-container fullscreen" : "canvas-container"}
      style={{ width: "100%", height: "100%", minHeight: "300px" }}
    />
  );
};

export default FlowFieldTrails3D;
