import React from "react";
import Sketch from "react-p5";

const Kaleidoscope6 = ({ isFullscreen = false }) => {
  // Kaleidoscope variables
  let rotationAngle = 0;
  let rotationSpeed = 0.02;
  let segments = 8;
  let time = 0;
  let mouseX = 0;
  let mouseY = 0;
  let centerX = 0;
  let centerY = 0;
  
  // Wireframe psychedelic variables
  let colorShift = 0;
  let pulsePhase = 0;
  let fractalZoom = 1;
  let zoomDirection = 1;
  let egoDissolution = 0;
  let glassWarp = 0;
  let recursionDepth = 4;
  let infiniteZoom = 0;
  let lineThickness = 2;
  let wireframeOpacity = 180;

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    
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

  const draw = (p5) => {
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
    
    // Clear background with wireframe fade - increased opacity for shorter trails
    p5.fill(0, 0, 0, 20);
    p5.rect(0, 0, p5.width, p5.height);
    
    // Draw recursive wireframe kaleidoscope
    drawRecursiveWireframeKaleidoscope(p5, recursionDepth, fractalZoom);
    
    // Draw central wireframe ego dissolution core
    drawWireframeEgoDissolutionCore(p5);
    
    // Draw UI
    drawUI(p5);
  };

  const drawRecursiveWireframeKaleidoscope = (p5, depth, zoom) => {
    if (depth <= 0) return;
    p5.push();
    p5.translate(centerX, centerY);
    p5.scale(zoom);
    p5.rotate(rotationAngle * (6 - depth));
    
    for (let i = 0; i < segments; i++) {
      const segmentAngle = (i / segments) * p5.TWO_PI + rotationAngle;
      p5.push();
      p5.rotate(segmentAngle);
      drawWireframePattern(p5, i, depth);
      p5.pop();
    }
    p5.pop();
    // Recursive call for infinite zoom
    drawRecursiveWireframeKaleidoscope(p5, depth - 1, zoom * 0.7);
  };

  const drawWireframePattern = (p5, segmentIndex, depth) => {
    const maxRadius = p5.dist(0, 0, p5.width/2, p5.height/2) * (0.7 ** (recursionDepth - depth));
    
    for (let layer = 0; layer < 18; layer++) {
      const layerRadius = p5.map(layer, 0, 17, 10, maxRadius);
      const glassDistort = p5.sin(glassWarp * 10 + layer * 0.6) * 60 * layer;
      const ego = p5.sin(egoDissolution + layer * 0.3) * 40;
      
      const numPoints = 32;
      const points = [];
      
      // Calculate all points first
      for (let j = 0; j <= numPoints; j++) {
        const angle = (j / numPoints) * (p5.PI / segments);
        const radius = layerRadius + glassDistort + ego;
        const x = p5.cos(angle) * radius;
        const y = p5.sin(angle) * radius;
        const glassRipple = p5.sin(angle * 30 + time * 8) * 18;
        const finalX = x + glassRipple * p5.cos(angle);
        const finalY = y + glassRipple * p5.sin(angle);
        points.push({ x: finalX, y: finalY });
      }
      
      // Draw wireframe outline
      const hue = (colorShift + segmentIndex * 60 + layer * 18 + depth * 40) % 360;
      const color = hslToRgb(p5, hue, 100, 60 + 20 * Math.sin(time + layer));
      
      p5.stroke(color.r, color.g, color.b, wireframeOpacity);
      p5.strokeWeight(lineThickness);
      p5.noFill();
      
      // Draw main wireframe shape with smooth wave closure
      p5.beginShape();
      for (let point of points) {
        p5.vertex(point.x, point.y);
      }
      
      // Add smooth wave closure instead of straight line
      const startPoint = points[0];
      const endPoint = points[points.length - 1];
      const midAngle = (p5.PI / segments) / 2; // Halfway between start and end
      const midRadius = layerRadius + glassDistort + ego;
      const midX = p5.cos(midAngle) * midRadius;
      const midY = p5.sin(midAngle) * midRadius;
      const midRipple = p5.sin(midAngle * 30 + time * 8) * 18;
      const finalMidX = midX + midRipple * p5.cos(midAngle);
      const finalMidY = midY + midRipple * p5.sin(midAngle);
      
      // Add midpoint with wave distortion for smooth closure
      p5.vertex(finalMidX, finalMidY);
      
      p5.endShape(p5.CLOSE);
      
      // Draw internal wireframe structure - reduced frequency
      if (layer % 4 === 0) {
        const internalPoints = [];
        for (let j = 0; j <= numPoints/3; j++) {
          const angle = (j / (numPoints/3)) * (p5.PI / segments);
          const radius = layerRadius * 0.5 + ego * 0.3;
          const x = p5.cos(angle) * radius;
          const y = p5.sin(angle) * radius;
          internalPoints.push({ x, y });
        }
        
        const highlightColor = hslToRgb(p5, (colorShift + 180) % 360, 100, 95);
        p5.stroke(highlightColor.r, highlightColor.g, highlightColor.b, wireframeOpacity * 0.6);
        p5.strokeWeight(lineThickness * 0.5);
        
        p5.beginShape();
        for (let point of internalPoints) {
          p5.vertex(point.x, point.y);
        }
        
        // Add smooth closure for internal structure too
        if (internalPoints.length > 0) {
          const startInternal = internalPoints[0];
          const endInternal = internalPoints[internalPoints.length - 1];
          const midInternalAngle = (p5.PI / segments) / 2;
          const midInternalRadius = layerRadius * 0.5 + ego * 0.3;
          const midInternalX = p5.cos(midInternalAngle) * midInternalRadius;
          const midInternalY = p5.sin(midInternalAngle) * midInternalRadius;
          p5.vertex(midInternalX, midInternalY);
        }
        
        p5.endShape(p5.CLOSE);
      }
      
      // Draw connecting lines between layers - reduced frequency
      if (layer > 0 && layer % 6 === 0) {
        const prevLayerRadius = p5.map(layer - 1, 0, 17, 10, maxRadius);
        const prevGlassDistort = p5.sin(glassWarp * 10 + (layer - 1) * 0.6) * 60 * (layer - 1);
        const prevEgo = p5.sin(egoDissolution + (layer - 1) * 0.3) * 40;
        
        for (let j = 0; j <= numPoints; j += 12) {
          const angle = (j / numPoints) * (p5.PI / segments);
          
          // Current layer point
          const radius = layerRadius + glassDistort + ego;
          const x1 = p5.cos(angle) * radius;
          const y1 = p5.sin(angle) * radius;
          
          // Previous layer point
          const prevRadius = prevLayerRadius + prevGlassDistort + prevEgo;
          const x2 = p5.cos(angle) * prevRadius;
          const y2 = p5.sin(angle) * prevRadius;
          
          const connectionColor = hslToRgb(p5, (colorShift + j * 7.5) % 360, 100, 80);
          p5.stroke(connectionColor.r, connectionColor.g, connectionColor.b, wireframeOpacity * 0.4);
          p5.strokeWeight(lineThickness * 0.3);
          p5.line(x1, y1, x2, y2);
        }
      }
    }
  };

  const drawWireframeEgoDissolutionCore = (p5) => {
    const coreSize = 100 + p5.sin(pulsePhase) * 30;
    p5.push();
    p5.translate(centerX, centerY);
    p5.rotate(time * 2);
    
    // Wireframe orbiting circles - reduced number
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * p5.TWO_PI + time * 1.5;
      const radius = coreSize * 2.8;
      const x = p5.cos(angle) * radius;
      const y = p5.sin(angle) * radius;
      const coreHighlight = hslToRgb(p5, (colorShift + i * 30) % 360, 100, 90);
      
      p5.stroke(coreHighlight.r, coreHighlight.g, coreHighlight.b, wireframeOpacity);
      p5.strokeWeight(lineThickness);
      p5.noFill();
      p5.circle(x, y, 14 + p5.sin(time * 2 + i) * 5);
    }
    
    // Wireframe central structure
    const coreColor = hslToRgb(p5, colorShift % 360, 100, 98);
    p5.stroke(coreColor.r, coreColor.g, coreColor.b, wireframeOpacity);
    p5.strokeWeight(lineThickness * 1.5);
    p5.noFill();
    
    p5.beginShape();
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * p5.TWO_PI;
      const radius = coreSize + p5.sin(angle * 7 + time * 3.5) * 20;
      p5.vertex(p5.cos(angle) * radius, p5.sin(angle) * radius);
    }
    p5.endShape(p5.CLOSE);
    
    // Internal wireframe structure - reduced density
    p5.stroke(coreColor.r, coreColor.g, coreColor.b, wireframeOpacity * 0.5);
    p5.strokeWeight(lineThickness * 0.6);
    
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * p5.TWO_PI + time;
      const radius = coreSize * 0.5;
      const x = p5.cos(angle) * radius;
      const y = p5.sin(angle) * radius;
      
      p5.beginShape();
      for (let j = 0; j < 4; j++) {
        const innerAngle = (j / 4) * p5.TWO_PI + angle;
        const innerRadius = radius * 0.3;
        p5.vertex(p5.cos(innerAngle) * innerRadius, p5.sin(innerAngle) * innerRadius);
      }
      p5.endShape(p5.CLOSE);
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
    p5.text(`Wireframe Zoom: ${fractalZoom.toFixed(2)}`, 10, 20);
    p5.text(`Ego Dissolution: ${egoDissolution.toFixed(2)}`, 10, 40);
    p5.text(`Glass Warp: ${glassWarp.toFixed(2)}`, 10, 60);
    p5.text(`Line Thickness: ${lineThickness}`, 10, 80);
    p5.text(`Recursion Depth: ${recursionDepth}`, 10, 100);
  };

  const mousePressed = (p5) => {
    segments = segments === 8 ? 12 : segments === 12 ? 6 : 8;
    recursionDepth = (recursionDepth % 6) + 2;
    lineThickness = lineThickness === 2 ? 3 : lineThickness === 3 ? 1 : 2;
  };

  const mouseMoved = (p5) => {
    // Implementation of mouseMoved function
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    centerX = p5.width / 2;
    centerY = p5.height / 2;
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

export default Kaleidoscope6; 