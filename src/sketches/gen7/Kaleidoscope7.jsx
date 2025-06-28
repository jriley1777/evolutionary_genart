import React from "react";
import Sketch from "react-p5";

const Kaleidoscope7 = ({ isFullscreen = false }) => {
  // Kaleidoscope variables
  let rotationAngle = 0;
  let rotationSpeed = 0.008;
  let segments = 8;
  let time = 0;
  let mouseX = 0;
  let mouseY = 0;
  let centerX = 0;
  let centerY = 0;
  
  // Image kaleidoscope variables
  let shrekImage;
  let imageLoaded = false;
  let colorShift = 0;
  let pulsePhase = 0;
  let imageScale = 1;
  let scaleDirection = 1;
  let imageRotation = 0;
  let kaleidoscopeDepth = 4;
  let imageOpacity = 255;
  let distortionAmount = 0;
  let expansionFactor = 1;

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
    p5.frameRate(40);
    
    centerX = p5.width / 2;
    centerY = p5.height / 2;
    
    // Load PNG Shrek image with transparent background
    shrekImage = p5.loadImage('/images/shrek.png', () => {
      imageLoaded = true;
      console.log('Shrek PNG image loaded successfully!');
    }, (err) => {
      console.error('Failed to load Shrek PNG image:', err);
      // Create a fallback colored rectangle if image fails to load
      createFallbackImage(p5);
    });
  };

  const createFallbackImage = (p5) => {
    // Create a simple fallback image if Shrek doesn't load
    shrekImage = p5.createImage(200, 200);
    shrekImage.loadPixels();
    for (let i = 0; i < shrekImage.pixels.length; i += 4) {
      shrekImage.pixels[i] = 34;     // R - green
      shrekImage.pixels[i + 1] = 139; // G - green
      shrekImage.pixels[i + 2] = 34;  // B - green
      shrekImage.pixels[i + 3] = 255; // A
    }
    shrekImage.updatePixels();
    imageLoaded = true;
  };

  const draw = (p5) => {
    time += 0.015;
    rotationAngle += rotationSpeed;
    pulsePhase += 0.03;
    colorShift += 0.8;
    imageRotation += 0.008;
    distortionAmount = p5.sin(time * 0.1) * 0.4 + 0.8;
    expansionFactor = 1 + p5.sin(time * 0.05) * 0.3;
    
    // Scale animation
    imageScale += 0.002 * scaleDirection;
    if (imageScale > 1.8 || imageScale < 0.6) scaleDirection *= -1;
    
    mouseX = p5.mouseX - centerX;
    mouseY = p5.mouseY - centerY;
    
    // Clear background with fade effect
    p5.fill(0, 0, 0, 12);
    p5.rect(0, 0, p5.width, p5.height);
    
    if (imageLoaded && shrekImage) {
      // Draw expansive image kaleidoscope
      drawExpansiveImageKaleidoscope(p5, kaleidoscopeDepth, imageScale);
      
      // Draw central image core
      drawImageCore(p5);
    }
    
    // Draw UI
    drawUI(p5);
  };

  const drawExpansiveImageKaleidoscope = (p5, depth, scale) => {
    if (depth <= 0) return;
    
    p5.push();
    p5.translate(centerX, centerY);
    p5.scale(scale * expansionFactor);
    p5.rotate(rotationAngle * (5 - depth));
    
    // Calculate maximum radius to fill screen
    const maxScreenRadius = p5.dist(0, 0, p5.width, p5.height) * 0.8;
    
    for (let i = 0; i < segments; i++) {
      const segmentAngle = (i / segments) * p5.TWO_PI + rotationAngle;
      p5.push();
      p5.rotate(segmentAngle);
      drawExpansiveImageSegment(p5, i, depth, maxScreenRadius);
      p5.pop();
    }
    p5.pop();
    
    // Recursive call for layered effect with more depth
    if (depth > 1) {
      drawExpansiveImageKaleidoscope(p5, depth - 1, scale * 0.75);
    }
  };

  const drawExpansiveImageSegment = (p5, segmentIndex, depth, maxRadius) => {
    // Create multiple layers that expand outward
    const numLayers = 8;
    const baseImageSize = 120;
    
    for (let layer = 0; layer < numLayers; layer++) {
      const layerRadius = p5.map(layer, 0, numLayers - 1, 50, maxRadius);
      const imageSize = baseImageSize + layer * 20;
      
      // Calculate dynamic position and distortion
      const distortionX = p5.sin(distortionAmount * 15 + segmentIndex * 0.8 + layer * 0.3) * 30;
      const distortionY = p5.cos(distortionAmount * 12 + segmentIndex * 0.6 + layer * 0.4) * 25;
      const layerRotation = imageRotation * (segmentIndex + 1) + layer * 0.1;
      
      // Apply color effects with more variation
      const hue = (colorShift + segmentIndex * 60 + layer * 25 + depth * 40) % 360;
      const saturation = 85 + p5.sin(time + segmentIndex + layer) * 15;
      const brightness = 75 + p5.sin(pulsePhase + segmentIndex + layer) * 25;
      
      p5.push();
      p5.translate(distortionX, distortionY);
      p5.rotate(layerRotation);
      
      // Position images in expanding spiral pattern
      const spiralAngle = layer * 0.5 + segmentIndex * 0.3;
      const spiralRadius = layerRadius + p5.sin(time * 0.1 + layer) * 20;
      const x = p5.cos(spiralAngle) * spiralRadius;
      const y = p5.sin(spiralAngle) * spiralRadius;
      
      p5.translate(x, y);
      
      // Set image mode and tint
      p5.imageMode(p5.CENTER);
      p5.tint(
        p5.red(p5.color(hue, saturation, brightness)),
        p5.green(p5.color(hue, saturation, brightness)),
        p5.blue(p5.color(hue, saturation, brightness)),
        imageOpacity * (0.9 ** (kaleidoscopeDepth - depth)) * (0.8 ** layer)
      );
      
      // Draw the image segment with varying scales
      const finalImageSize = imageSize * (1 + p5.sin(time * 0.2 + layer) * 0.2);
      p5.image(shrekImage, 0, 0, finalImageSize, finalImageSize);
      
      p5.pop();
    }
  };

  const drawImageCore = (p5) => {
    const coreSize = 180;
    const coreDistortion = p5.sin(time * 0.3) * 15;
    
    p5.push();
    p5.translate(centerX + coreDistortion, centerY);
    p5.rotate(imageRotation * 3);
    p5.scale(1 + p5.sin(pulsePhase) * 0.15);
    
    // Core image with special effects
    p5.imageMode(p5.CENTER);
    p5.tint(255, 255, 255, imageOpacity * 0.95);
    p5.image(shrekImage, 0, 0, coreSize, coreSize);
    
    // Add glow effect
    p5.drawingContext.shadowBlur = 25;
    p5.drawingContext.shadowColor = p5.color(0, 255, 0, 120);
    p5.image(shrekImage, 0, 0, coreSize * 1.15, coreSize * 1.15);
    p5.drawingContext.shadowBlur = 0;
    
    p5.pop();
  };

  const drawUI = (p5) => {
    p5.fill(255);
    p5.textSize(16);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(`Kaleidoscope 7: Shrek Edition`, 20, 20);
    p5.text(`Segments: ${segments} | Depth: ${kaleidoscopeDepth}`, 20, 45);
    p5.text(`Click to change segments`, 20, 70);
    p5.text(`Mouse to influence distortion`, 20, 95);
  };

  const mousePressed = (p5) => {
    // Cycle through segment configurations
    const segmentOptions = [6, 8, 12, 16, 20];
    const currentIndex = segmentOptions.indexOf(segments);
    segments = segmentOptions[(currentIndex + 1) % segmentOptions.length];
    
    // Also cycle depth
    kaleidoscopeDepth = kaleidoscopeDepth === 4 ? 5 : 4;
  };

  const mouseMoved = (p5) => {
    // Influence distortion based on mouse position
    const mouseDist = p5.dist(p5.mouseX, p5.mouseY, centerX, centerY);
    distortionAmount = p5.map(mouseDist, 0, p5.width/2, 0.4, 1.5);
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    centerX = p5.width / 2;
    centerY = p5.height / 2;
  };

  return <Sketch setup={setup} draw={draw} mousePressed={mousePressed} mouseMoved={mouseMoved} windowResized={windowResized} />;
};

export default Kaleidoscope7; 