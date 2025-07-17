import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const StaticLineArt6 = ({ isFullscreen = false }) => {
  let rows = [];
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
      
      // Generate all rows in setup
      generateRows(p5);
      
      // Draw everything once
      drawRows(p5);
    };

    const generateRows = (p5) => {
      rows = [];
      
      // Generate rows with fixed 10px height that fill the entire canvas
      const rowHeight = 10;
      const numRows = Math.ceil(p5.height / rowHeight);
      
      // Process each row
      for (let rectIndex = 0; rectIndex < numRows; rectIndex++) {
        const x = 0;
        const y = rectIndex * rowHeight;
        const w = p5.width;
        const h = rowHeight;
        
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
        
        // Create pieces for this row with increasing complexity towards bottom
        const pieces = [];
        
        // Number of colored panels increases towards bottom (2 to 8 panels)
        const rowProgress = rectIndex / numRows; // 0 to 1 from top to bottom
        const numColoredPanels = p5.floor(p5.map(rowProgress, 0, 1, 2, 8));
        
        // Generate colored panels at the start of the row
        generateColoredPanels(p5, x, y, w, h, baseColor, complementaryColor, numColoredPanels, pieces);
        
        rows.push({
          rectIndex: rectIndex,
          pieces: pieces
        });
      }
    };

    const generateColoredPanels = (p5, x, y, w, h, baseColor, complementaryColor, numPanels, pieces) => {
      // Generate random total width for colored panels (20% to 80% of row width)
      const minColoredPercent = p5.map(numPanels, 2, 8, 0.2, 0.4);
      const maxColoredPercent = p5.map(numPanels, 2, 8, 0.5, 0.8);
      const coloredWidthPercent = p5.random(minColoredPercent, maxColoredPercent);
      const totalColoredWidth = w * coloredWidthPercent;
      
      // Generate random panel widths that sum to totalColoredWidth
      const panelWidths = [];
      let remainingWidth = totalColoredWidth;
      
      // Generate random widths for all panels except the last one
      for (let i = 0; i < numPanels - 1; i++) {
        const minWidth = totalColoredWidth * 0.08; // Minimum 8% of total colored width
        const maxWidth = remainingWidth * 0.5; // Maximum 50% of remaining width
        const panelWidth = p5.random(minWidth, maxWidth);
        panelWidths.push(panelWidth);
        remainingWidth -= panelWidth;
      }
      
      // Last panel takes remaining width
      panelWidths.push(remainingWidth);
      
      // Generate colored panels at the start of the row with gradient from dark to light
      let currentX = x;
      for (let i = 0; i < numPanels; i++) {
        const panelWidth = panelWidths[i];
        
        // Calculate brightness gradient: darker on left, lighter on right
        const brightnessFactor = p5.map(i, 0, numPanels - 1, 0.4, 1.2);
        
        // Alternate between base and complementary colors with brightness variation
        const useBaseColor = i % 2 === 0;
        const color = useBaseColor ? 
          p5.color(baseColor.hue, baseColor.sat, baseColor.bright * brightnessFactor) :
          p5.color(complementaryColor.hue, complementaryColor.sat + 10, complementaryColor.bright * brightnessFactor);
        
        pieces.push({
          x: currentX,
          y: y,
          w: panelWidth,
          h: h,
          color: color,
          type: 'rect'
        });
        
        currentX += panelWidth;
      }
      
      // Add grey piece to fill remaining width
      const greyWidth = w - totalColoredWidth;
      if (greyWidth > 0) {
        pieces.push({
          x: x + totalColoredWidth,
          y: y,
          w: greyWidth,
          h: h,
          color: p5.color(0, 0, 80), // Light grey
          type: 'rect'
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

    const drawRows = (p5) => {
      for (let row of rows) {
        // Draw each piece of this row
        for (let piece of row.pieces) {
          drawRect(p5, piece.x, piece.y, piece.w, piece.h, piece.color);
        }
      }
    };

    p5.draw = () => {
      // Static art - no animation needed
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      generateRows(p5);
      drawRows(p5);
    };
  };

  return <ReactP5Wrapper sketch={sketch}/>;
};

export default StaticLineArt6; 