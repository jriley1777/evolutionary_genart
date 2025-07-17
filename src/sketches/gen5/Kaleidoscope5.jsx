import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";

const Kaleidoscope5 = ({ isFullscreen = false }) => {
  // Kaleidoscope variables
  let rotationAngle = 0;
  let rotationSpeed = 0.02;
  let segments = 8;
  let time = 0;
  let mouseX = 0;
  let mouseY = 0;
  let centerX = 0;
  let centerY = 0;
  
  // Ultra-psychedelic variables
  let colorShift = 0;
  let pulsePhase = 0;
  let fractalZoom = 1;
  let zoomDirection = 1;
  let egoDissolution = 0;
  let glassWarp = 0;
  let recursionDepth = 4;
  let infiniteZoom = 0;

  const sketch = (p5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.background(0);
      p5.colorMode(p5.RGB);
      p5.frameRate(40); // Set to 40 fps for optimal motion
      
      centerX = p5.width / 2;
      centerY = p5.height / 2;
    };

    p5.draw = () => {
      time += 0.008;
      rotationAngle += rotationSpeed * 0.15;
      pulsePhase += 0.015;
      colorShift += 0.6;
      glassWarp = p5.sin(time * 0.05) * 0.5 + 0.8;
      egoDissolution += 0.008;
      infiniteZoom += 0.002 * zoomDirection;
      if (infiniteZoom > 2 || infiniteZoom < 0.5) zoomDirection *= -1;
      fractalZoom = 1 + p5.sin(infiniteZoom) * 0.2;
      
      mouseX = p5.mouseX - centerX;
      mouseY = p5.mouseY - centerY;
      
      // Clear background with glass fade
      p5.fill(0, 0, 0, 6);
      p5.rect(0, 0, p5.width, p5.height);
      
      // Draw recursive fractal kaleidoscope
      drawRecursiveKaleidoscope(p5, recursionDepth, fractalZoom);
      
      // Draw central ego dissolution core
      drawEgoDissolutionCore(p5);
      
      // Draw UI
      drawUI(p5);
    };

    const drawRecursiveKaleidoscope = (p5, depth, zoom) => {
      if (depth <= 0) return;
      p5.push();
      p5.translate(centerX, centerY);
      p5.scale(zoom);
      p5.rotate(rotationAngle * (6 - depth));
      
      for (let i = 0; i < segments; i++) {
        const segmentAngle = (i / segments) * p5.TWO_PI + rotationAngle;
        p5.push();
        p5.rotate(segmentAngle);
        drawFractalPattern(p5, i, depth);
        p5.pop();
      }
      p5.pop();
      // Recursive call for infinite zoom
      drawRecursiveKaleidoscope(p5, depth - 1, zoom * 0.7);
    };

    const drawFractalPattern = (p5, segmentIndex, depth) => {
      const maxRadius = p5.dist(0, 0, p5.width/2, p5.height/2) * (0.7 ** (recursionDepth - depth));
      for (let layer = 0; layer < 18; layer++) {
        const layerRadius = p5.map(layer, 0, 17, 10, maxRadius);
        const glassDistort = p5.sin(glassWarp * 10 + layer * 0.6) * 60 * layer;
        const ego = p5.sin(egoDissolution + layer * 0.3) * 40;
        p5.beginShape();
        const numPoints = 48;
        for (let j = 0; j <= numPoints; j++) {
          const angle = (j / numPoints) * (p5.PI / segments);
          const radius = layerRadius + glassDistort + ego;
          const x = p5.cos(angle) * radius;
          const y = p5.sin(angle) * radius;
          const glassRipple = p5.sin(angle * 30 + time * 8) * 18;
          const finalX = x + glassRipple * p5.cos(angle);
          const finalY = y + glassRipple * p5.sin(angle);
          const hue = (colorShift + segmentIndex * 60 + layer * 18 + depth * 40) % 360;
          const color = hslToRgb(p5, hue, 100, 60 + 20 * Math.sin(time + layer));
          if (j === 0) {
            p5.fill(color.r, color.g, color.b, 230);
          }
          p5.vertex(finalX, finalY);
        }
        p5.endShape(p5.CLOSE);
        // Fractal highlights
        if (layer % 4 === 0) {
          const highlightColor = hslToRgb(p5, (colorShift + 180) % 360, 100, 95);
          p5.fill(highlightColor.r, highlightColor.g, highlightColor.b, 180);
          p5.beginShape();
          for (let j = 0; j <= numPoints/4; j++) {
            const angle = (j / (numPoints/4)) * (p5.PI / segments);
            const radius = layerRadius * 0.6 + ego * 0.3;
            const x = p5.cos(angle) * radius;
            const y = p5.sin(angle) * radius;
            p5.vertex(x, y);
          }
          p5.endShape(p5.CLOSE);
        }
      }
    };

    const drawEgoDissolutionCore = (p5) => {
      const coreSize = 100 + p5.sin(pulsePhase) * 30;
      p5.push();
      p5.translate(centerX, centerY);
      p5.rotate(time * 2);
      // Inner core - colorful orbiting circles
      for (let i = 0; i < 20; i++) {
        const angle = (i / 20) * p5.TWO_PI + time * 1.5;
        const radius = coreSize * 2.8;
        const x = p5.cos(angle) * radius;
        const y = p5.sin(angle) * radius;
        const coreHighlight = hslToRgb(p5, (colorShift + i * 18) % 360, 100, 90);
        p5.fill(coreHighlight.r, coreHighlight.g, coreHighlight.b, 210);
        p5.circle(x, y, 14 + p5.sin(time * 2 + i) * 5);
      }
      p5.pop();
    };

    const hslToRgb = (p5, h, s, l) => {
      h = h / 360;
      s = s / 100;
      l = l / 100;
      let r, g, b;
      if (s === 0) {
        r = g = b = l;
      } else {
        const hue2rgb = (p, q, t) => {
          if (t < 0) t += 1;
          if (t > 1) t -= 1;
          if (t < 1/6) return p + (q - p) * 6 * t;
          if (t < 1/2) return q;
          if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
          return p;
        };
        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
      }
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    };

    const drawUI = (p5) => {
      p5.fill(255);
      p5.noStroke();
      p5.textSize(14);
      p5.text(`Fractal Zoom: ${fractalZoom.toFixed(2)}`, 10, 20);
      p5.text(`Ego Dissolution: ${egoDissolution.toFixed(2)}`, 10, 40);
      p5.text(`Glass Warp: ${glassWarp.toFixed(2)}`, 10, 60);
      p5.text(`Recursion Depth: ${recursionDepth}`, 10, 100);
    };

    p5.mousePressed = () => {
      segments = segments === 8 ? 12 : segments === 12 ? 6 : 8;
      recursionDepth = (recursionDepth % 6) + 2;
    };

    p5.mouseMoved = () => {
      // Implementation of mouseMoved function
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      centerX = p5.width / 2;
      centerY = p5.height / 2;
    };
  };

  return (
    <ReactP5Wrapper sketch={sketch}/>
  );
};

export default Kaleidoscope5; 