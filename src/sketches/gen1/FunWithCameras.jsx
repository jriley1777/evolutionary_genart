import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";
import { usePhotoMode } from "../../components/PhotoModeWrapper/PhotoModeWrapper";

const FunWithCameras = ({ isFullscreen = false, photoMode = false }) => {
  let canvasRef = React.useRef();
  let trailFrames = []; // Array to store previous frames
  let maxTrailLength = 9; // Number of frames to keep in trail
  let video = null;

  // Photo mode utilities - use time-based capture (150ms intervals)
  const { photoModeManager } = usePhotoMode({
    maxPanels: 12,
    captureInterval: 750, // 150ms per panel
    gridCols: 4,
    gridRows: 3
  }, photoMode);

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.frameRate(5);
    if (isFullscreen) {
      canvas.class('canvas-container fullscreen');
      canvas.elt.classList.add('fullscreen');
    } else {
      canvas.class('canvas-container');
    }
    
    p5.colorMode(p5.RGB);
    
    // Create camera capture directly
    video = p5.createCapture(p5.VIDEO);
    video.size(640, 480);
    video.hide();
    
    // Initialize trail frames array
    for (let i = 0; i < maxTrailLength; i++) {
      trailFrames.push(p5.createGraphics(p5.windowWidth, p5.windowHeight));
    }
  };

  // Pure function for photo mode - doesn't modify shared state
  const drawCameraTrailPure = (p5, panelParams = {}) => {
    // Clear background
    p5.background(0);
    
    // Only process video if it's available and p5 is properly initialized
    if (video && p5 && p5.width && p5.height) {
      // Draw trail frames with color burn and brightening effects
      for (let i = 0; i < trailFrames.length; i++) {
        let intensity = p5.map(i, 0, trailFrames.length - 1, 3.0, 0.3);
        
        // Apply different blend modes based on frame age
        if (i === 0) {
          // Current frame - bright normal
          p5.blendMode(p5.SCREEN);
          p5.tint(255, 255, 255, intensity * 555);
          p5.image(trailFrames[i], 0, 0);

        } else if (i < 5) {

          p5.blendMode(p5.SCREEN);
          p5.tint(255, 255, 255, intensity * 555);
          p5.image(trailFrames[i], 0, 0);

          // Recent frames - bright color burn effect
          p5.blendMode(p5.LIGHTEST);
          p5.tint(255, 255, 220, intensity * 255); // Brighter warm tint
          p5.image(trailFrames[i], 0, 0);
          
          // Add bright overlay
          p5.blendMode(p5.BURN);
          p5.tint(255, 255, 200, intensity * 550); // Bright overlay
          p5.image(trailFrames[i], 0, 0);

        } else {
          // Old frames - bright overlay with color distortion
          p5.blendMode(p5.HARD_LIGHT);
          p5.tint(255, 220, 255, intensity * 255); // Bright purple tint
          p5.image(trailFrames[i], 0, 0);
        }
      }
    }
    
    // Reset blend mode and tint
    p5.blendMode(p5.BLEND);
    p5.noTint();
  };

  // Main draw function for the camera trail effect (modifies shared state)
  const drawCameraTrail = (p5, panelParams = {}) => {
    // Clear background
    p5.background(0);
    
    // Only process video if it's available and p5 is properly initialized
    if (video && p5 && p5.width && p5.height) {
      // Shift trail frames (remove oldest, add new)
      trailFrames.shift();
      let newFrame = p5.createGraphics(p5.width, p5.height);
      
      // Draw current video frame to new graphics buffer (mirrored)
      newFrame.push();
      newFrame.translate(p5.width, 0);
      newFrame.scale(-1, 1);
      newFrame.image(video, 0, 0, p5.width, p5.height);
      newFrame.pop();
      
      trailFrames.push(newFrame);
    }
    
    // Draw the trail effect (pure function)
    drawCameraTrailPure(p5, panelParams);
  };

  const draw = (p5) => {
    // Check if camera is ready for photo mode
    const cameraReady = video && video.width > 0 && video.height > 0;
    
    // Handle photo mode
    if (photoMode) {
      if (photoModeManager.isCapturingActive()) {
        // Only draw and capture if camera is ready
        if (cameraReady) {
          // Draw live preview while capturing
          drawCameraTrail(p5);
          
          // Update photo mode with pure function (doesn't modify shared state)
          photoModeManager.update(p5, drawCameraTrailPure, cameraReady);
          
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
      // Normal mode - always run the trail effect
      drawCameraTrail(p5);
    }
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    
    // Recreate trail frames for new canvas size
    trailFrames = [];
    for (let i = 0; i < maxTrailLength; i++) {
      trailFrames.push(p5.createGraphics(p5.windowWidth, p5.windowHeight));
    }
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

export default FunWithCameras; 