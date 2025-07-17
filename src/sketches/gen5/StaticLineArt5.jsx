import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const StaticLineArt5 = ({ isFullscreen = false }) => {
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
      
      // Generate rows with varied heights that fill the entire canvas
      let currentY = 0;
      const numRows = Math.ceil(p5.height / 8); // Slightly more rows for varied heights
      
      // Process each row
      for (let rectIndex = 0; rectIndex < numRows; rectIndex++) {
        const rowProgress = rectIndex / numRows; // 0 to 1 from top to bottom
        
        // Varied row heights - more variation towards bottom
        const baseHeight = 8 + (rowProgress * 12); // 8px to 20px
        const heightVariation = p5.random(-2, 2);
        const h = Math.max(6, baseHeight + heightVariation);
        
        const x = 0;
        const y = currentY;
        const w = p5.width;
        
        // Update currentY for next row
        currentY += h;
        
        // Stop if we've filled the canvas
        if (y >= p5.height) break;
        
        const noiseValue = p5.noise(rectIndex * 0.1, noiseOffset);
        
        // Multiple color palettes for layered depth
        const forestPalette = [
          { hue: 120, sat: 60, bright: 40 },   // Forest green
          { hue: 30, sat: 70, bright: 35 },    // Brown
          { hue: 15, sat: 65, bright: 30 },    // Dark brown
          { hue: 180, sat: 50, bright: 45 },   // Dark teal
          { hue: 240, sat: 60, bright: 40 },   // Dark blue
          { hue: 280, sat: 55, bright: 35 },   // Dark purple
          { hue: 90, sat: 65, bright: 45 },    // Dark olive
          { hue: 200, sat: 70, bright: 40 }    // Deep blue-green
        ];
        
        const desertPalette = [
          { hue: 25, sat: 80, bright: 50 },    // Warm sand
          { hue: 15, sat: 70, bright: 40 },    // Terracotta
          { hue: 45, sat: 60, bright: 35 },    // Ochre
          { hue: 5, sat: 75, bright: 45 },     // Burnt orange
          { hue: 35, sat: 65, bright: 30 },    // Dark earth
          { hue: 55, sat: 70, bright: 40 },    // Golden brown
          { hue: 20, sat: 80, bright: 35 },    // Rust
          { hue: 10, sat: 65, bright: 25 }     // Deep rust
        ];
        
        const oceanPalette = [
          { hue: 200, sat: 70, bright: 45 },   // Ocean blue
          { hue: 190, sat: 60, bright: 40 },   // Deep teal
          { hue: 210, sat: 65, bright: 35 },   // Navy
          { hue: 180, sat: 75, bright: 50 },   // Turquoise
          { hue: 220, sat: 55, bright: 30 },   // Deep blue
          { hue: 170, sat: 80, bright: 45 },   // Sea green
          { hue: 230, sat: 60, bright: 40 },   // Royal blue
          { hue: 160, sat: 70, bright: 35 }    // Deep green
        ];
        
        // Choose palette based on row position for layered effect
        const paletteChoice = p5.floor(p5.map(rectIndex, 0, numRows, 0, 3));
        let selectedPalette;
        switch (paletteChoice) {
          case 0:
            selectedPalette = forestPalette;
            break;
          case 1:
            selectedPalette = desertPalette;
            break;
          case 2:
            selectedPalette = oceanPalette;
            break;
          default:
            selectedPalette = forestPalette;
        }
        
        const colorIndex = p5.floor(noiseValue * selectedPalette.length);
        const baseColor = selectedPalette[colorIndex];
        const complementaryColor = selectedPalette[(colorIndex + 4) % selectedPalette.length];
        
        // Create pieces for this row with diagonal flow
        const pieces = [];
        
        // Create diagonal flow: middle moves from bottom left to upper right
        // Invert the rowProgress for bottom-left to upper-right flow
        const diagonalProgress = 1 - rowProgress; // 1 to 0 from top to bottom
        
        // Add randomness to the piece widths while maintaining diagonal flow
        const baseLightPercent = p5.map(diagonalProgress, 0, 1, 0.05, 0.25);
        const baseDarkPercent = p5.map(diagonalProgress, 0, 1, 0.05, 0.25);
        
        // Add random variation to piece widths
        const lightColorPercent = baseLightPercent + p5.random(-0.05, 0.05);
        const darkColorPercent = baseDarkPercent + p5.random(-0.05, 0.05);
        
        const lightColorWidth = w * lightColorPercent;
        const darkColorWidth = w * darkColorPercent;
        
        // Calculate total colored piece width
        const totalColoredWidth = lightColorWidth + darkColorWidth;
        
        // Position colored pieces to create diagonal flow from bottom left to upper right
        // Bottom rows: colored pieces start more to the left
        // Top rows: colored pieces start more to the right
        const diagonalOffset = p5.map(diagonalProgress, 0, 1, -w * 0.3, w * 0.3);
        const randomOffset = p5.random(-totalColoredWidth * 0.3, totalColoredWidth * 0.3);
        const coloredStartX = x + (w / 2) - (totalColoredWidth / 2) + diagonalOffset + randomOffset;
        
        // Calculate grey piece widths to fill remaining space
        const leftGreyWidth = Math.max(0, coloredStartX - x);
        const rightGreyWidth = Math.max(0, (x + w) - (coloredStartX + totalColoredWidth));
        
        // Left grey piece (can be 0 width) - with subtle transparency
        if (leftGreyWidth > 0) {
          pieces.push({
            x: x,
            y: y,
            w: leftGreyWidth,
            h: h,
            color: p5.color(0, 0, 80), // Light grey
            type: 'rect',
            transparency: 0.8
          });
        }
        
        // Dark colored piece (first) - with subtle transparency
        pieces.push({
          x: coloredStartX,
          y: y,
          w: darkColorWidth,
          h: h,
          color: p5.color(baseColor.hue, baseColor.sat, baseColor.bright * 0.6),
          type: 'rect',
          transparency: 0.9
        });
        
        // Light colored piece (second) - with subtle transparency
        pieces.push({
          x: coloredStartX + darkColorWidth,
          y: y,
          w: lightColorWidth,
          h: h,
          color: p5.color(complementaryColor.hue, complementaryColor.sat + 10, complementaryColor.bright + 30),
          type: 'rect',
          transparency: 0.85
        });
        
        // Right grey piece (can be 0 width) - with subtle transparency
        if (rightGreyWidth > 0) {
          pieces.push({
            x: coloredStartX + darkColorWidth + lightColorWidth,
            y: y,
            w: rightGreyWidth,
            h: h,
            color: p5.color(0, 0, 80), // Light grey
            type: 'rect',
            transparency: 0.8
          });
        }
        
        rows.push({
          rectIndex: rectIndex,
          pieces: pieces
        });
      }
    };

    const drawRect = (p5, x, y, w, h, color, transparency) => {
      // Apply transparency
      const alpha = transparency || 1;
      const transparentColor = p5.color(p5.hue(color), p5.saturation(color), p5.brightness(color), alpha);
      
      p5.fill(transparentColor);
      p5.stroke(0, 0, 30, 0.3 * alpha);
      p5.strokeWeight(1);
      
      // Draw rectangle
      p5.rect(x, y, w, h);
    };

    const drawRows = (p5) => {
      for (let row of rows) {
        // Draw each piece of this row
        for (let piece of row.pieces) {
          drawRect(p5, piece.x, piece.y, piece.w, piece.h, piece.color, piece.transparency);
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

  return <ReactP5Wrapper sketch={sketch} />;
};

export default StaticLineArt5; 