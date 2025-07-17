import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const StaticLineArt1 = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let columns = [];
    let noiseOffset = 0;

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
      const columnWidth = 10;
      const numColumns = Math.floor(p5.width / columnWidth);
      
      for (let i = 0; i < numColumns; i++) {
        const x = i * columnWidth;
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
        
        // Top grey piece
        pieces.push({
          x: x,
          y: 0,
          w: columnWidth,
          h: topGreyHeight,
          color: p5.color(0, 0, 80) // Light grey
        });
        
        // Light colored piece (brighter version of natural color)
        pieces.push({
          x: x,
          y: topGreyHeight,
          w: columnWidth,
          h: lightColorHeight,
          color: p5.color(complementaryColor.hue, complementaryColor.sat + 10, complementaryColor.bright + 30) // Brighter version
        });
        
        // Dark colored piece (even darker natural forest color)
        pieces.push({
          x: x,
          y: topGreyHeight + lightColorHeight,
          w: columnWidth,
          h: darkColorHeight,
          color: p5.color(baseColor.hue, baseColor.sat, baseColor.bright * 0.6) // Much darker version
        });
        
        // Bottom grey piece
        pieces.push({
          x: x,
          y: topGreyHeight + lightColorHeight + darkColorHeight,
          w: columnWidth,
          h: bottomGreyHeight,
          color: p5.color(0, 0, 80) // Light grey
        });
        
        columns.push({
          x: x,
          pieces: pieces
        });
      }
    };

    const drawColumns = (p5) => {
      for (let column of columns) {
        for (let piece of column.pieces) {
          p5.fill(piece.color);
          p5.stroke(0, 0, 30, 0.3); // Dark grey stroke with reduced opacity
          p5.strokeWeight(1);
          p5.rect(piece.x, piece.y, piece.w, piece.h);
        }
      }
    };

    p5.draw = () => {
      // Static art - no continuous drawing needed
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(0, 0, 95);
      generateColumns(p5);
      drawColumns(p5);
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default StaticLineArt1; 