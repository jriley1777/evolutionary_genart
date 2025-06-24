import React from "react";
import Sketch from "react-p5";

const SineWavePuddle = ({ isFullscreen = false }) => {
  let noiseOffset = 10;
  let numWaves = 60;
  const maxWaves = 100; // Maximum number of waves to prevent performance issues
  const numPoints = 1000; // Number of points in each wave
  let centerX = 0;
  let centerY = 0;
  let centerNoiseOffset = 0;
  let baseRadiusOffset = 0; // Track the growing radius
  let waveRadii = Array(maxWaves).fill(0); // Track individual wave radii
  let baseColor = 'aqua';

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    
    // Add fullscreen class if in fullscreen mode
    if (isFullscreen) {
      canvas.class('canvas-container fullscreen');
      canvas.elt.classList.add('fullscreen');
    } else {
      canvas.class('canvas-container');
    }
    
    p5.frameRate(60); // Set frame rate to 60 fps
    // Initialize center point at screen center
    centerX = p5.width / 2 - p5.random(-100,100);
    centerY = p5.height / 2 - p5.random(-400,400);
    // Initialize wave radii
    for (let i = 0; i < numWaves; i++) {
      waveRadii[i] = 70 + i * 30;
    }
  };

  const draw = (p5) => {
    // Draw background gradient
    p5.noStroke();
    for (let y = 0; y < p5.height; y++) {
      const gradientProgress = y / p5.height;
      const r = p5.lerp(0, 0, gradientProgress);
      const g = p5.lerp(0, 0, gradientProgress);
      const b = p5.lerp(0, 0, gradientProgress);
      p5.stroke(r, g, b);
      p5.line(0, y, p5.width, y);
    }
    
    p5.strokeWeight(2);
    p5.noFill();
    
    // Update center point position using Perlin noise
    // Map noise to a smaller range around the center
    const noiseRange = Math.min(p5.width, p5.height) * 0.2; // 20% of screen size
    const noiseX = p5.map(p5.noise(centerNoiseOffset), 0, 1, 
      p5.width/2 - noiseRange, p5.width/2 + noiseRange);
    const noiseY = p5.map(p5.noise(centerNoiseOffset + 1000), 0, 1,
      p5.height/2 - noiseRange, p5.height/2 + noiseRange);
    
    // Smoothly interpolate to new position
    centerX = p5.lerp(centerX, noiseX, 0.01);
    centerY = p5.lerp(centerY, noiseY, 0.01);
    
    // Increment noise offset for center movement
    centerNoiseOffset += 0.001;
    
    // First draw the outlines
    for (let wave = 0; wave < numWaves; wave++) {
      // Set black stroke for all waves
      p5.stroke(0);
      p5.noFill();

      p5.beginShape();
      for (let i = 0; i < numPoints; i++) {
        // Convert to polar coordinates
        const angle = p5.map(i, 0, numPoints, 0, p5.TWO_PI);
        
        // Base radius increases with each wave and time
        const baseRadius = waveRadii[wave] + baseRadiusOffset;
        
        // Calculate distance from center for noise intensity
        const distFromCenter = wave / numWaves;
        const noiseIntensity = p5.map(distFromCenter, 0, 100, 200, 50);
        
        // Add sine wave and noise to radius
        const noiseVal = p5.noise(
          p5.cos(angle) * 0.1 + noiseOffset,
          p5.sin(angle) * 0.1 + wave * 0.05
        ) * noiseIntensity;
        const sineVal = p5.sin(angle * 3 + p5.frameCount * 0.02 + wave * 0.5) * 20;
        
        // Calculate final radius
        const radius = baseRadius + sineVal + noiseVal;
        
        // Convert back to cartesian coordinates
        const x = centerX + p5.cos(angle) * radius;
        const y = centerY + p5.sin(angle) * radius;
        
        p5.vertex(x, y);
      }
      p5.endShape(p5.CLOSE);
    }

    // Then draw the fills in reverse order
    for (let wave = numWaves - 1; wave >= 0; wave--) {
      // Calculate color gradient (reversed)
      const gradientProgress = wave / (numWaves - 30);
      const r = p5.lerp(255, 0, gradientProgress);
      const g = p5.lerp(255, 0, gradientProgress);
      const b = p5.lerp(255, 0, gradientProgress);
      let adjustment = -50
      p5.stroke(r+adjustment, g+adjustment, b+adjustment, 100);
      p5.fill(r, g, b, 100); // Semi-transparent fill

      p5.beginShape();
      for (let i = 0; i < numPoints; i++) {
        // Convert to polar coordinates
        const angle = p5.map(i, 0, numPoints, 0, p5.TWO_PI);
        
        // Base radius increases with each wave and time
        const baseRadius = waveRadii[wave] + baseRadiusOffset;
        
        // Calculate distance from center for noise intensity
        const distFromCenter = wave / numWaves;
        const noiseIntensity = p5.map(distFromCenter, 0, 100, 20, 50);
        
        // Add sine wave and noise to radius
        const noiseVal = p5.noise(
          p5.cos(angle) * 0.1 + noiseOffset,
          p5.sin(angle) * 0.1 + wave * 0.05
        ) * noiseIntensity;
        const sineVal = p5.sin(angle * 3 + p5.frameCount * 0.02 + wave * 0.5) * 20;
        
        // Calculate final radius
        const radius = baseRadius + sineVal + noiseVal;
        
        // Convert back to cartesian coordinates
        const x = centerX + p5.cos(angle) * radius;
        const y = centerY + p5.sin(angle) * radius;
        
        p5.vertex(x, y);
      }
      p5.endShape(p5.CLOSE);
    }

    // Increment noise offset for animation
    noiseOffset += 0.005;
  };

  return <Sketch setup={setup} draw={draw} />;
};

export default SineWavePuddle; 