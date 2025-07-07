import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const StaticLineArt2 = ({ isFullscreen = false }) => {
  let columns = [];
  let noiseOffset = 0;

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.frameRate(1); // Static art, so low frame rate
    
    if (isFullscreen) {
      canvas.class('canvas-container fullscreen');
      canvas.elt.classList.add('fullscreen');
    } else {
      canvas.class('canvas-container');
    }
    
    p5.colorMode(p5.HSB, 360, 100, 100, 1);
    p5.background(0, 0, 95); // Light grey background
    
    // Generate all columns in setup
    generateColumns(p5);
    
    // Draw everything once
    drawColumns(p5);
  };

  const generateColumns = (p5) => {
    columns = [];
    const columnWidth = 10;
    const numColumns = Math.floor(p5.width / columnWidth);
    
    // Add buffer columns on left and right to account for curve distortion
    const bufferColumns = 12; // Extra columns on each side for better coverage
    const totalColumns = numColumns + (bufferColumns * 2);
    
    for (let i = 0; i < totalColumns; i++) {
      // Shift columns left so we're looking at the middle of the pattern
      const x = (i - bufferColumns) * columnWidth;
      const noiseValue = p5.noise(i * 0.1, noiseOffset);
      
      // Generate natural forest colors using Perlin noise
      const naturalColors = [
        { hue: 120, sat: 60, bright: 40 },   // Forest green
        { hue: 30, sat: 70, bright: 35 },    // Brown
        { hue: 15, sat: 65, bright: 30 },    // Dark brown
        { hue: 180, sat: 50, bright: 45 },   // Dark teal
        { hue: 240, sat: 60, bright: 40 },   // Dark blue
        { hue: 280, sat: 55, bright: 35 },   // Dark purple
        { hue: 90, sat: 65, bright: 45 },    // Dark olive
        { hue: 200, sat: 70, bright: 40 }    // Deep blue-green
      ];
      
      const colorIndex = p5.floor(noiseValue * naturalColors.length);
      const baseColor = naturalColors[colorIndex];
      const complementaryColor = naturalColors[(colorIndex + 4) % naturalColors.length]; // Offset by 4 for variety
      
      // Create 4 pieces for this column
      const pieces = [];
      
      // Generate height variations ensuring full canvas coverage
      const minGreyHeight = 200;
      
      // Colored pieces with percentage-based heights positioned around midline
      const lightColorPercent = p5.random(0.02, 0.12); // 2-12% of canvas height
      const darkColorPercent = p5.random(0.02, 0.12); // 2-12% of canvas height
      
      const lightColorHeight = p5.height * lightColorPercent;
      const darkColorHeight = p5.height * darkColorPercent;
      
      // Calculate total colored piece height
      const totalColoredHeight = lightColorHeight + darkColorHeight;
      
      // Position colored pieces around midline with random offset
      const midlineOffset = p5.random(-totalColoredHeight * 0.3, totalColoredHeight * 0.3);
      const coloredStartY = (p5.height / 2) - (totalColoredHeight / 2) + midlineOffset;
      
      // Calculate grey piece heights to fill remaining space
      const topGreyHeight = coloredStartY;
      const bottomGreyHeight = p5.height - (coloredStartY + totalColoredHeight);
      
      // Fixed S-curve parameters - all columns identical
      const curveIntensity = 5.5; // Much stronger curve intensity for dramatic bend
      const curveDirection = 1; // Fixed direction for all columns
      
      // Top grey piece
      pieces.push({
        x: x,
        y: 0,
        w: columnWidth,
        h: topGreyHeight,
        color: p5.color(0, 0, 80), // Light grey
        curveIntensity: curveIntensity,
        curveDirection: curveDirection
      });
      
      // Light colored piece (brighter version of natural color)
      pieces.push({
        x: x,
        y: topGreyHeight,
        w: columnWidth,
        h: lightColorHeight,
        color: p5.color(complementaryColor.hue, complementaryColor.sat + 10, complementaryColor.bright + 30), // Brighter version
        curveIntensity: curveIntensity,
        curveDirection: curveDirection
      });
      
      // Dark colored piece (even darker natural forest color)
      pieces.push({
        x: x,
        y: topGreyHeight + lightColorHeight,
        w: columnWidth,
        h: darkColorHeight,
        color: p5.color(baseColor.hue, baseColor.sat, baseColor.bright * 0.6), // Much darker version
        curveIntensity: curveIntensity,
        curveDirection: curveDirection
      });
      
      // Bottom grey piece
      pieces.push({
        x: x,
        y: topGreyHeight + lightColorHeight + darkColorHeight,
        w: columnWidth,
        h: bottomGreyHeight,
        color: p5.color(0, 0, 80), // Light grey
        curveIntensity: curveIntensity,
        curveDirection: curveDirection
      });
      
      columns.push({
        x: x,
        pieces: pieces
      });
    }
  };



  const drawColumns = (p5) => {
    for (let column of columns) {
      // Draw the entire column as one S-curve, then slice into panels
      const curveIntensity = column.pieces[0].curveIntensity;
      const curveDirection = column.pieces[0].curveDirection;
      
      // Calculate the full column height
      const totalHeight = p5.height;
      const columnWidth = column.pieces[0].w;
      const columnX = column.pieces[0].x;
      
      // Draw each panel as a slice of the curved column
      for (let piece of column.pieces) {
        p5.fill(piece.color);
        p5.stroke(0, 0, 30, 0.3); // Dark grey stroke with reduced opacity
        p5.strokeWeight(1);
        
        // Draw this panel slice of the curved column
        drawCurvedPanel(p5, piece.x, piece.y, piece.w, piece.h, curveIntensity, curveDirection);
      }
    }
  };

  const drawCurvedPanel = (p5, x, y, w, h, curveIntensity, curveDirection) => {
    p5.beginShape();
    
    // Create a proper S-curve for the entire column
    const maxCurve = curveIntensity * w * curveDirection;
    
    // Calculate S-curve points for this panel slice
    const panelTopRatio = y / p5.height;
    const panelBottomRatio = (y + h) / p5.height;
    
    // S-curve function: creates an S shape from top to bottom
    const getSCurveOffset = (ratio) => {
      // Create S-curve: starts at 0, curves out, curves back, curves out again, ends at 0
      const t = ratio * 4 - 2; // Map 0-1 to -2 to 2
      const s1 = Math.sin(t * Math.PI) * Math.exp(-(t + 1) * (t + 1));
      const s2 = Math.sin((t - 2) * Math.PI) * Math.exp(-(t - 1) * (t - 1));
      return (s1 + s2) * maxCurve * 0.5;
    };
    
    // Get curve offsets for top and bottom of this panel
    const topOffset = getSCurveOffset(panelTopRatio);
    const bottomOffset = getSCurveOffset(panelBottomRatio);
    
    // Top edge - straight horizontal line with S-curve offset
    p5.vertex(x + topOffset, y);
    p5.vertex(x + w + topOffset, y);
    
    // Right edge - follow the S-curve
    const steps = 10;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const currentY = y + h * t;
      const currentRatio = (y + h * t) / p5.height;
      const currentOffset = getSCurveOffset(currentRatio);
      p5.vertex(x + w + currentOffset, currentY);
    }
    
    // Bottom edge - straight horizontal line with S-curve offset
    p5.vertex(x + w + bottomOffset, y + h);
    p5.vertex(x + bottomOffset, y + h);
    
    // Left edge - mirror of right edge
    for (let i = steps; i >= 0; i--) {
      const t = i / steps;
      const currentY = y + h * t;
      const currentRatio = (y + h * t) / p5.height;
      const currentOffset = getSCurveOffset(currentRatio);
      p5.vertex(x + currentOffset, currentY);
    }
    
    p5.endShape(p5.CLOSE);
  };

  const draw = (p5) => {
    // Static art - no animation needed
    // The drawing is done once in setup
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    generateColumns(p5);
    drawColumns(p5);
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

export default StaticLineArt2; 