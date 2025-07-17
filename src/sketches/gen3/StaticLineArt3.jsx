import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const StaticLineArt3 = ({ isFullscreen = false }) => {
  let columns = [];
  let noiseOffset = 0;

  const sketch = (p5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
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
      
      // Generate random rows with fixed 10px height that fill the canvas
      const rows = [];
      
      // Calculate how many rows we need to fill the canvas
      const numRows = Math.ceil(p5.height / 10);
      
      // Create rows that fill the entire canvas
      for (let i = 0; i < numRows; i++) {
        const y = i * 10;
        rows.push({
          x: 0,
          y: y,
          w: p5.width,
          h: 10,
          type: 'row'
        });
      }
      
      // Process each row
      for (let rectIndex = 0; rectIndex < rows.length; rectIndex++) {
        const rect = rows[rectIndex];
        const x = rect.x;
        const y = rect.y;
        const w = rect.w;
        const h = rect.h;
        
        const noiseValue = p5.noise(rectIndex * 0.1, noiseOffset);
        
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
        const complementaryColor = naturalColors[(colorIndex + 4) % naturalColors.length];
        
        // Create 4 pieces for this row
        const pieces = [];
        
        // Since rows are wide, we'll use horizontal split (4 vertical panels)
        // Create diagonal flow: middle moves from upper left to bottom right
        const rowProgress = rectIndex / rows.length; // 0 to 1 from top to bottom
        
        // Add randomness to the piece widths while maintaining diagonal flow
        const baseLightPercent = p5.map(rowProgress, 0, 1, 0.05, 0.25);
        const baseDarkPercent = p5.map(rowProgress, 0, 1, 0.05, 0.25);
        
        // Add random variation to piece widths
        const lightColorPercent = baseLightPercent + p5.random(-0.05, 0.05);
        const darkColorPercent = baseDarkPercent + p5.random(-0.05, 0.05);
        
        const lightColorWidth = w * lightColorPercent;
        const darkColorWidth = w * darkColorPercent;
        
        // Calculate total colored piece width
        const totalColoredWidth = lightColorWidth + darkColorWidth;
        
        // Position colored pieces to create diagonal flow with randomness
        // Top rows: colored pieces start more to the left
        // Bottom rows: colored pieces start more to the right
        const diagonalOffset = p5.map(rowProgress, 0, 1, -w * 0.3, w * 0.3);
        const randomOffset = p5.random(-totalColoredWidth * 0.3, totalColoredWidth * 0.3);
        const coloredStartX = x + (w / 2) - (totalColoredWidth / 2) + diagonalOffset + randomOffset;
        
        // Calculate grey piece widths to fill remaining space (no minimum constraints)
        const leftGreyWidth = Math.max(0, coloredStartX - x);
        const rightGreyWidth = Math.max(0, (x + w) - (coloredStartX + totalColoredWidth));
        
        // Left grey piece (can be 0 width)
        if (leftGreyWidth > 0) {
          pieces.push({
            x: x,
            y: y,
            w: leftGreyWidth,
            h: h,
            color: p5.color(0, 0, 80), // Light grey
            type: 'rect'
          });
        }
        
        // Dark colored piece (first)
        pieces.push({
          x: coloredStartX,
          y: y,
          w: darkColorWidth,
          h: h,
          color: p5.color(baseColor.hue, baseColor.sat, baseColor.bright * 0.6),
          type: 'rect'
        });
        
        // Light colored piece (second)
        pieces.push({
          x: coloredStartX + darkColorWidth,
          y: y,
          w: lightColorWidth,
          h: h,
          color: p5.color(complementaryColor.hue, complementaryColor.sat + 10, complementaryColor.bright + 30),
          type: 'rect'
        });
        
        // Right grey piece (can be 0 width)
        if (rightGreyWidth > 0) {
          pieces.push({
            x: coloredStartX + darkColorWidth + lightColorWidth,
            y: y,
            w: rightGreyWidth,
            h: h,
            color: p5.color(0, 0, 80), // Light grey
            type: 'rect'
          });
        }
        
        columns.push({
          rectIndex: columns.length,
          pieces: pieces
        });
      }
    };

    const drawRect = (p5, x, y, w, h, color) => {
      p5.fill(color);
      p5.stroke(0, 0, 30, 0.3);
      p5.strokeWeight(1);
      
      // Draw rectangle
      p5.rect(x, y, w, h);
    };

    const drawColumns = (p5) => {
      for (let column of columns) {
        // Draw each piece of this rectangle
        for (let piece of column.pieces) {
          drawRect(p5, piece.x, piece.y, piece.w, piece.h, piece.color);
        }
      }
    };

    p5.draw = () => {
      // Static art - no animation needed
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      generateColumns(p5);
      drawColumns(p5);
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default StaticLineArt3; 