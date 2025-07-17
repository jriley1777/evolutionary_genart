import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";
import { usePhotoMode } from "../../components/PhotoModeWrapper/PhotoModeWrapper";

const FunWithCameras4 = ({ isFullscreen = false, photoMode = false }) => {
  // Double fisheye effect variables
  let cam;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let pixelSkip = 0; // Performance optimization: skip pixels

  // Photo mode utilities
  const { photoModeManager } = usePhotoMode({
    maxPanels: 12,
    captureInterval: 500,
    gridCols: 4,
    gridRows: 3
  }, photoMode);

  const sketch = (p5) => {
    p5.setup = () => {
      // Use full viewport dimensions
      canvasWidth = p5.windowWidth;
      canvasHeight = p5.windowHeight;
      const canvas = p5.createCanvas(canvasWidth, canvasHeight);
      p5.frameRate(10);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
        // Increase pixel skip for better performance at fullscreen
        pixelSkip = Math.max(1, Math.floor(Math.min(canvasWidth, canvasHeight) / 800));
      } else {
        canvas.class('canvas-container');
        pixelSkip = 1;
      }
      
      p5.colorMode(p5.RGB);
      p5.pixelDensity(1);
      
      // Initialize camera with reduced resolution for better performance
      const camWidth = Math.min(canvasWidth, 640);
      const camHeight = Math.min(canvasHeight, 480);
      cam = p5.createCapture(p5.VIDEO);
      cam.size(camWidth, camHeight);
      cam.hide(); // hide the native video
    };

    // Pure function for double fisheye effect (for photo mode)
    const drawDoubleFisheyeEffect = (p5, panelParams = {}) => {
      // Fisheye effect implementation
      cam.loadPixels();
      p5.loadPixels();

      let w = canvasWidth;
      let h = canvasHeight;
      let centerX = w / 2;
      let centerY = h / 2;
      
      // Pre-calculate constants for performance
      const camW = cam.width;
      const camH = cam.height;
      const distortionPower = 2.3;
      const radiusDivisor = 1.25;

      // Define two eye-level distortion zones
      const eyeLevel = h * 0.5; // Position at 40% from top (eye level)
      const eyeSpacing = w * 0.035; // Distance between eyes (reduced from 0.15 to 0.08)
      const eyeRadius = Math.min(w, h) * 0.5; // Size of each eye distortion
      
      const leftEyeX = centerX - eyeSpacing;
      const rightEyeX = centerX + eyeSpacing;
      const eyeY = eyeLevel;

      // Define chin shrinking distortion zone
      const chinLevel = h * 0.55; // Position at 75% from top (chin area)
      const chinRadius = Math.min(w, h) * 0.4; // Size of chin distortion
      const chinX = centerX; // Center of chin distortion

      // Define lower shrinking distortion zone (halfway between chin and bottom)
      const lowerLevel = chinLevel + (h - chinLevel) * -0.8; // Halfway between chin and bottom
      const lowerRadius = Math.min(w, h) * 0.3; // Size of lower distortion
      const lowerX = centerX; // Center of lower distortion

      // Process pixels with skipping for performance
      for (let y = 0; y < h; y += pixelSkip) {
        for (let x = 0; x < w; x += pixelSkip) {
          let finalX = x;
          let finalY = y;
          
          // Check if pixel is within chin shrinking distortion zone (APPLY FIRST)
          const chinDist = Math.sqrt((x - chinX) * (x - chinX) + (y - chinLevel) * (y - chinLevel));
          if (chinDist < chinRadius) {
            const angle = Math.atan2(y - chinLevel, x - chinX);
            const normalizedDist = chinDist / chinRadius;
            // Reverse fisheye effect (pincushion) - shrinks instead of expands
            const distortedDist = Math.pow(normalizedDist, 0.5) * chinRadius; // Power < 1 creates shrinking
            finalX = chinX + Math.cos(angle) * distortedDist;
            finalY = chinLevel + Math.sin(angle) * distortedDist;
          }

          // Check if pixel is within lower shrinking distortion zone (APPLY SECOND)
          const lowerDist = Math.sqrt((finalX - lowerX) * (finalX - lowerX) + (finalY - lowerLevel) * (finalY - lowerLevel));
          if (lowerDist < lowerRadius) {
            const angle = Math.atan2(finalY - lowerLevel, finalX - lowerX);
            const normalizedDist = lowerDist / lowerRadius;
            // Reverse fisheye effect (pincushion) - shrinks instead of expands
            const distortedDist = Math.pow(normalizedDist, 0.5) * lowerRadius; // Power < 1 creates shrinking
            finalX = lowerX + Math.cos(angle) * distortedDist;
            finalY = lowerLevel + Math.sin(angle) * distortedDist;
          }
          
          // Check if pixel is within left eye distortion zone (APPLY THIRD)
          const leftEyeDist = Math.sqrt((finalX - leftEyeX) * (finalX - leftEyeX) + (finalY - eyeY) * (finalY - eyeY));
          if (leftEyeDist < eyeRadius) {
            const angle = Math.atan2(finalY - eyeY, finalX - leftEyeX);
            const normalizedDist = leftEyeDist / eyeRadius;
            const distortedDist = Math.pow(normalizedDist, distortionPower) * eyeRadius;
            finalX = leftEyeX + Math.cos(angle) * distortedDist;
            finalY = eyeY + Math.sin(angle) * distortedDist;
          }
          
          // Check if pixel is within right eye distortion zone (APPLY FOURTH)
          const rightEyeDist = Math.sqrt((finalX - rightEyeX) * (finalX - rightEyeX) + (finalY - eyeY) * (finalY - eyeY));
          if (rightEyeDist < eyeRadius) {
            const angle = Math.atan2(finalY - eyeY, finalX - rightEyeX);
            const normalizedDist = rightEyeDist / eyeRadius;
            const distortedDist = Math.pow(normalizedDist, distortionPower) * eyeRadius;
            finalX = rightEyeX + Math.cos(angle) * distortedDist;
            finalY = eyeY + Math.sin(angle) * distortedDist;
          }

          // Scale source coordinates to camera resolution
          let camSx = Math.floor((finalX / w) * camW);
          let camSy = Math.floor((finalY / h) * camH);

          if (camSx >= 0 && camSx < camW && camSy >= 0 && camSy < camH) {
            let srcIndex = (camSy * camW + camSx) * 4;
            let dstIndex = (y * w + x) * 4;

            p5.pixels[dstIndex] = cam.pixels[srcIndex];       // R
            p5.pixels[dstIndex + 1] = cam.pixels[srcIndex + 1]; // G
            p5.pixels[dstIndex + 2] = cam.pixels[srcIndex + 2]; // B
            p5.pixels[dstIndex + 3] = 255;                      // A
          }
        }
      }

      p5.updatePixels();
      
      // Apply vignette effect
      applyVignette(p5);
      
      // Apply CRT effect
      applyCRTEffect(p5);
    };

    // Apply vignette effect to darken edges
    const applyVignette = (p5) => {
      p5.loadPixels();
      
      const w = p5.width;
      const h = p5.height;
      const centerX = w / 2;
      const centerY = h / 2;
      const maxRadiusX = w / 2;
      const maxRadiusY = h / 2;
      
      for (let y = 0; y < h; y += pixelSkip) {
        for (let x = 0; x < w; x += pixelSkip) {
          const dx = x - centerX;
          const dy = y - centerY;
          
          // Create elliptical vignette
          const normalizedDistanceX = Math.abs(dx) / maxRadiusX;
          const normalizedDistanceY = Math.abs(dy) / maxRadiusY;
          const ellipticalDistance = Math.sqrt(normalizedDistanceX * normalizedDistanceX + normalizedDistanceY * normalizedDistanceY);
          
          // Create lighter, more gradual vignette curve
          const vignetteStrength = Math.pow(ellipticalDistance, 5.8);
          const vignetteFactor = Math.max(0.3, 1 - vignetteStrength * 0.4); // Lighter effect, minimum 0.3 brightness
          
          const index = (y * w + x) * 4;
          
          // Apply vignette darkening
          p5.pixels[index] *= vignetteFactor;     // R
          p5.pixels[index + 1] *= vignetteFactor; // G
          p5.pixels[index + 2] *= vignetteFactor; // B
        }
      }
      
      p5.updatePixels();
    };

    // Apply CRT effect with scanlines and curvature
    const applyCRTEffect = (p5) => {
      p5.loadPixels();
      
      const w = p5.width;
      const h = p5.height;
      
      for (let y = 0; y < h; y += pixelSkip) {
        for (let x = 0; x < w; x += pixelSkip) {
          const index = (y * w + x) * 4;
          
          // Get current colors (no position changes)
          let r = p5.pixels[index];
          let g = p5.pixels[index + 1];
          let b = p5.pixels[index + 2];
          
          // Scanlines effect
          const scanlineIntensity = 0.4;
          const scanlineFrequency = 20;
          if (y % scanlineFrequency === 0) {
            r *= (1 - scanlineIntensity);
            g *= (1 - scanlineIntensity);
            b *= (1 - scanlineIntensity);
          }
          
          // Subtle color bleeding (CRT color artifacts) - only affects current pixel
          const colorBleed = 0.1;
          if (x > 0) {
            const leftIndex = (y * w + (x - 1)) * 4;
            r = r * (1 - colorBleed) + p5.pixels[leftIndex] * colorBleed;
          }
          if (x < w - 1) {
            const rightIndex = (y * w + (x + 1)) * 4;
            b = b * (1 - colorBleed) + p5.pixels[rightIndex + 2] * colorBleed;
          }
          
          // Slight brightness boost for CRT glow
          const glowFactor = 1.1;
          r = Math.min(255, r * glowFactor);
          g = Math.min(255, g * glowFactor);
          b = Math.min(255, b * glowFactor);
          
          // Apply to current pixel
          p5.pixels[index] = r;
          p5.pixels[index + 1] = g;
          p5.pixels[index + 2] = b;
        }
      }
      
      p5.updatePixels();
    };

    p5.draw = () => {
      // Clear background
      p5.background(0);
      
      // Check if camera is ready for photo mode
      const cameraReady = cam && cam.width > 0 && cam.height > 0;
      
      // Handle photo mode
      if (photoMode) {
        if (photoModeManager.isCapturingActive()) {
          // Only draw and capture if camera is ready
          if (cameraReady) {
            // Draw live preview while capturing
            drawDoubleFisheyeEffect(p5);
            
            // Update photo mode with pure function
            photoModeManager.update(p5, drawDoubleFisheyeEffect, cameraReady);
            
            // Show capture progress
            photoModeManager.drawCaptureProgress(p5);
          } else {
            // Show loading message while camera is not ready
            p5.background(0);
            p5.fill(255);
            p5.noStroke();
            p5.textAlign(p5.CENTER, p5.CENTER);
            p5.textSize(24);
            p5.text('Loading Camera for Photo Mode...', p5.width / 2, p5.height / 2);
          }
        } else {
          // Show static grid
          photoModeManager.drawPhotoGrid(p5);
        }
      } else {
        // Normal mode - always run the double fisheye effect
        if (cameraReady) {
          drawDoubleFisheyeEffect(p5);
        } else {
          // Show loading message
          p5.background(0);
          p5.fill(255);
          p5.noStroke();
          p5.textAlign(p5.CENTER, p5.CENTER);
          p5.textSize(24);
          p5.text('Loading Camera...', p5.width / 2, p5.height / 2);
        }
      }
    };

    p5.windowResized = () => {
      // Update canvas and camera dimensions on window resize
      canvasWidth = p5.windowWidth;
      canvasHeight = p5.windowHeight;
      p5.resizeCanvas(canvasWidth, canvasHeight);
      
      // Update performance settings based on new size
      if (isFullscreen) {
        pixelSkip = Math.max(1, Math.floor(Math.min(canvasWidth, canvasHeight) / 800));
      } else {
        pixelSkip = 1;
      }
      
      // Update camera size to match new canvas dimensions (with performance limits)
      if (cam) {
        const camWidth = Math.min(canvasWidth, 640);
        const camHeight = Math.min(canvasHeight, 480);
        cam.size(camWidth, camHeight);
      }
    };
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default FunWithCameras4; 