import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const FunWithCameras = ({ isFullscreen = false }) => {
  let video;
  let canvasRef = React.useRef();
  let trailFrames = []; // Array to store previous frames
  let maxTrailLength = 9; // Number of frames to keep in trail

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
    
    // Create video capture
    video = p5.createCapture(p5.VIDEO);
    video.size(p5.windowWidth, p5.windowHeight); // Set video to canvas size
    video.hide(); // Hide the default video element
    
    // Initialize trail frames array
    for (let i = 0; i < maxTrailLength; i++) {
      trailFrames.push(p5.createGraphics(p5.windowWidth, p5.windowHeight));
    }
  };

  const draw = (p5) => {
    // Clear background
    p5.background(0);
    
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
    
    // Draw trail frames with color burn and brightening effects
    for (let i = 0; i < trailFrames.length; i++) {
      let intensity = p5.map(i, 0, trailFrames.length - 1, 3.0, 0.3);
      
      // Apply different blend modes based on frame age
      if (i === 0) {
        // Current frame - bright normal
        p5.blendMode(p5.OVERLAY);
        p5.tint(255, 255, 255, intensity * 255);
        p5.image(trailFrames[i], 0, 0);

      } else if (i < 5) {
        // Recent frames - bright color burn effect
        p5.blendMode(p5.MULTIPLY);
        p5.tint(255, 255, 220, intensity * 255); // Brighter warm tint
        p5.image(trailFrames[i], 0, 0);
        
        // Add bright overlay
        p5.blendMode(p5.SCREEN);
        p5.tint(255, 255, 200, intensity * 150); // Bright overlay
        p5.image(trailFrames[i], 0, 0);
      } else {
        // Old frames - bright overlay with color distortion
        p5.blendMode(p5.OVERLAY);
        p5.tint(255, 220, 255, intensity * 255); // Bright purple tint
        p5.image(trailFrames[i], 0, 0);
      }
    }
    
    // Reset blend mode and tint
    p5.blendMode(p5.NORMAL);
    p5.noTint();
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    if (video) {
      video.size(p5.windowWidth, p5.windowHeight); // Resize video to new canvas size
    }
    
    // Recreate trail frames for new canvas size
    trailFrames = [];
    for (let i = 0; i < maxTrailLength; i++) {
      trailFrames.push(p5.createGraphics(p5.windowWidth, p5.windowHeight));
    }
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

export default FunWithCameras; 