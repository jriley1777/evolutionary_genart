import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";
import { getGridColor, gridColorSchemes, gridSystemColors } from "../../utils/gridSystemColors";

// Square class to handle individual grid squares
class Square {
  constructor(x, y, squareSize, p5, id) {
    this.x = x;
    this.y = y;
    this.squareSize = squareSize;
    this.p5 = p5;
    this.id = id; // Unique identifier for each square
    
    // Seed values for deterministic generation
    this.seeds = {
      squareColor: p5.random(),
      hasCircle: p5.random(),
      circleColor: p5.random(),
      hasSmallCircle: p5.random(),
      smallCircleColor: p5.random(),
      hasTriangle: p5.random(),
      triangleColor: p5.random(),
      triangleDirection: p5.random()
    };
    
    // Generate initial appearance
    this.generateFromSeeds();
  }
  
  // Generate appearance based on current seeds
  generateFromSeeds() {
    try {
      const colorNames = Object.keys(gridSystemColors);
      if (!colorNames || colorNames.length === 0) {
        console.error('gridSystemColors is not available');
        return;
      }
      
      const blackColor = getGridColor(this.p5, 'black'); // Cache black color
      
      // Square color
      this.squareColorName = colorNames[Math.floor(this.seeds.squareColor * colorNames.length)];
      this.squareColor = getGridColor(this.p5, this.squareColorName);
      this.blackColor = blackColor; // Store for reuse
      
      // Circle properties
      this.hasCircle = this.seeds.hasCircle < 0.15;
      if (this.hasCircle) {
        let circleColorName;
        let attempts = 0;
        do {
          circleColorName = colorNames[Math.floor(this.seeds.circleColor * colorNames.length)];
          attempts++;
          if (attempts > 10) break; // Prevent infinite loop
        } while (circleColorName === this.squareColorName);
        
        this.circleColorName = circleColorName;
        this.circleColor = getGridColor(this.p5, this.circleColorName);
      }
      
      // Small circle properties
      this.hasSmallCircle = this.seeds.hasSmallCircle < 0.25;
      if (this.hasSmallCircle) {
        let smallCircleColorName;
        let attempts = 0;
        do {
          smallCircleColorName = colorNames[Math.floor(this.seeds.smallCircleColor * colorNames.length)];
          attempts++;
          if (attempts > 10) break; // Prevent infinite loop
        } while (smallCircleColorName === this.squareColorName || smallCircleColorName === this.circleColorName);
        
        this.smallCircleColorName = smallCircleColorName;
        this.smallCircleColor = getGridColor(this.p5, this.smallCircleColorName);
      }
      
      // Triangle properties
      this.hasTriangle = this.seeds.hasTriangle < 0.15;
      if (this.hasTriangle) {
        let triangleColorName;
        let attempts = 0;
        do {
          triangleColorName = colorNames[Math.floor(this.seeds.triangleColor * colorNames.length)];
          attempts++;
          if (attempts > 10) break; // Prevent infinite loop
        } while (triangleColorName === this.squareColorName || triangleColorName === this.circleColorName || triangleColorName === this.smallCircleColorName);
        
        this.triangleColorName = triangleColorName;
        this.triangleColor = getGridColor(this.p5, this.triangleColorName);
        this.triangleDirection = this.seeds.triangleDirection < 0.5; // true = top-left to bottom-right
      }
    } catch (error) {
      console.error('Error in generateFromSeeds:', error);
      // Set fallback values
      this.squareColor = this.p5.color(0, 0, 50);
      this.blackColor = this.p5.color(0, 0, 0);
      this.hasCircle = false;
      this.hasSmallCircle = false;
      this.hasTriangle = false;
    }
  }
  
  // Generate new random seeds and regenerate appearance
  regenerate() {
    this.seeds = {
      squareColor: this.p5.random(),
      hasCircle: this.p5.random(),
      circleColor: this.p5.random(),
      hasSmallCircle: this.p5.random(),
      smallCircleColor: this.p5.random(),
      hasTriangle: this.p5.random(),
      triangleColor: this.p5.random(),
      triangleDirection: this.p5.random()
    };
    
    this.generateFromSeeds();
    // Don't call draw() here - let the main drawGrid() handle it
  }
  
  // Draw the square with all its elements
  draw() {
    // Draw square background
    this.p5.fill(this.squareColor);
    this.p5.stroke(this.blackColor); // Use cached black color
    this.p5.rect(this.x * this.squareSize, this.y * this.squareSize, this.squareSize, this.squareSize);
    
    // Draw circle if present
    if (this.hasCircle) {
      const circleRadius = this.squareSize * 0.3;
      const circleX = (this.x * this.squareSize) + this.squareSize / 2;
      const circleY = (this.y * this.squareSize) + this.squareSize / 2;
      
      this.p5.fill(this.circleColor);
      this.p5.stroke(this.blackColor);
      this.p5.circle(circleX, circleY, circleRadius * 2);
    }
    
    // Draw small circle if present
    if (this.hasSmallCircle) {
      const smallCircleRadius = this.squareSize * 0.15; // Half the size of the regular circle
      const smallCircleX = (this.x * this.squareSize) + this.squareSize / 2;
      const smallCircleY = (this.y * this.squareSize) + this.squareSize / 2;
      
      this.p5.fill(this.smallCircleColor);
      this.p5.stroke(this.blackColor);
      this.p5.circle(smallCircleX, smallCircleY, smallCircleRadius * 2);
    }
    
    // Draw triangle if present
    if (this.hasTriangle) {
      let x1, y1, x2, y2, x3, y3;
      
      if (this.triangleDirection) {
        // Triangle from top-left to bottom-right
        x1 = this.x * this.squareSize;
        y1 = this.y * this.squareSize;
        x2 = (this.x * this.squareSize) + this.squareSize;
        y2 = this.y * this.squareSize;
        x3 = (this.x * this.squareSize) + this.squareSize;
        y3 = (this.y * this.squareSize) + this.squareSize;
      } else {
        // Triangle from top-right to bottom-left
        x1 = (this.x * this.squareSize) + this.squareSize;
        y1 = this.y * this.squareSize;
        x2 = (this.x * this.squareSize) + this.squareSize;
        y2 = (this.y * this.squareSize) + this.squareSize;
        x3 = this.x * this.squareSize;
        y3 = (this.y * this.squareSize) + this.squareSize;
      }
      
      this.p5.fill(this.triangleColor);
      this.p5.stroke(this.blackColor);
      this.p5.triangle(x1, y1, x2, y2, x3, y3);
    }
  }
  
  // Check if mouse is over this square
  isMouseOver(mouseX, mouseY) {
    const squareX = this.x * this.squareSize;
    const squareY = this.y * this.squareSize;
    
    return mouseX >= squareX && mouseX < squareX + this.squareSize &&
           mouseY >= squareY && mouseY < squareY + this.squareSize;
  }
}

const GridSystem1 = ({ isFullscreen = false }) => {
  const sketch = (p5) => {
    let gridSize = 15; // Number of squares in height
    let squareSize = 0; // Will be calculated based on canvas height
    let numCols = 0; // Will be calculated based on canvas width
    let colorScheme; // Color scheme for the grid
    let squares = []; // Array of Square objects

    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      p5.frameRate(1); // Static grid, so low frame rate
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.colorMode(p5.HSB, 360, 100, 100, 1);
      
      // Use the grid system color palette
      colorScheme = gridColorSchemes.minimal;
      p5.background(getGridColor(p5, colorScheme.background));
      
      // Calculate grid dimensions
      calculateGridDimensions(p5);
      
            // Create squares
      createSquares(p5);
      
      // Draw the grid
      drawGrid(p5);
    };

    const calculateGridDimensions = (p5) => {
      // Calculate square size based on canvas height and desired number of rows
      squareSize = p5.height / gridSize;
      
      // Calculate number of columns needed to fill the width
      numCols = Math.ceil(p5.width / squareSize);
    };

    const createSquares = (p5) => {
      squares = [];
      let squareId = 0; // Counter for unique square IDs
      for (let x = 0; x < numCols; x++) {
        squares[x] = [];
        for (let y = 0; y < gridSize; y++) {
          squares[x][y] = new Square(x, y, squareSize, p5, squareId);
          squareId++; // Increment ID for next square
        }
      }
    };

    const drawGrid = (p5) => {
      p5.strokeWeight(1);
      
      // Draw all squares
      for (let x = 0; x < numCols; x++) {
        for (let y = 0; y < gridSize; y++) {
          squares[x][y].draw();
        }
      }
    };

        p5.draw = () => {
      // Redraw the entire grid on each frame to show any changes
      drawGrid(p5);
    };


    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(getGridColor(p5, colorScheme.background));
      calculateGridDimensions(p5);
      createSquares(p5);
      drawGrid(p5);
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default GridSystem1;
