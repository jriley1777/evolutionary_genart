import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import { usePhotoMode } from '../../components/PhotoModeWrapper/PhotoModeWrapper';

const FunWithCameras5 = ({ isFullscreen = false, photoMode = false }) => {
  let cam;
  let threshold = 1.25;
  let canvasWidth = 0;
  let canvasHeight = 0;

  // Photo mode utilities
  const { photoModeManager } = usePhotoMode({
    maxPanels: 12,
    captureInterval: 500,
    gridCols: 4,
    gridRows: 3
  }, photoMode);

  const sketch = (p5) => {
    p5.setup = () => {
      canvasWidth = p5.windowWidth;
      canvasHeight = p5.windowHeight;
      const canvas = p5.createCanvas(canvasWidth, canvasHeight);
      p5.frameRate(30);

      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }

      p5.pixelDensity(1);
      cam = p5.createCapture(p5.VIDEO);
      cam.size(p5.width, p5.height);
      cam.hide();
      p5.background(220);
    };

    const drawEdgeDetection = (p5) => {
        if (!cam || !cam.pixels) return;
        cam.loadPixels();
        p5.loadPixels();
        
        for (let y = 1; y < cam.height - 1; y++) {
            for (let x = 1; x < cam.width - 1; x++) {
            // Mirror the x coordinate to flip the image horizontally
            let mirrorX = cam.width - 1 - x;
            let i = (x + y * cam.width) * 4;
            let mirrorI = (mirrorX + y * cam.width) * 4;
            
            // Compare brightness with the right pixel (using mirrored coordinates)
            let b = p5.brightness(p5.color(cam.pixels[mirrorI], cam.pixels[mirrorI + 1], cam.pixels[mirrorI + 2]));
            let bRight = p5.brightness(p5.color(cam.pixels[mirrorI + 4], cam.pixels[mirrorI + 5], cam.pixels[mirrorI + 6]));
            let bDown = p5.brightness(p5.color(cam.pixels[mirrorI + cam.width * 4], cam.pixels[mirrorI + cam.width * 4 + 1], cam.pixels[mirrorI + cam.width * 4 + 2]));
            
            // Edge if brightness difference is above threshold
            let edge = p5.abs(b - bRight) > threshold || p5.abs(b - bDown) > threshold;
            let col = edge ? 0 : 220;
            
            p5.pixels[i] = col;
            p5.pixels[i + 1] = col;
            p5.pixels[i + 2] = col;
            p5.pixels[i + 3] = 220;
            }
        }
        
        p5.updatePixels();
    }

    p5.draw = () => {
      // Check if camera is ready for photo mode
      const cameraReady = cam && cam.width > 0 && cam.height > 0;

      // Handle photo mode
      if (photoMode) {
        if (photoModeManager.isCapturingActive()) {
          // Only draw and capture if camera is ready
          if (cameraReady) {
            drawEdgeDetection(p5);

            // Update photo mode with pure function
            photoModeManager.update(p5, drawEdgeDetection, cameraReady);
            
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
            drawEdgeDetection(p5);
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

    p5.keyPressed = () => {
      if (p5.keyCode === p5.UP_ARROW) {
        threshold = p5.min(100, threshold + 5);
      }
      if (p5.keyCode === p5.DOWN_ARROW) {
        threshold = p5.max(5, threshold - 5);
      }
    };

    p5.windowResized = () => {
        // Update canvas and camera dimensions on window resize
        canvasWidth = p5.windowWidth;
        canvasHeight = p5.windowHeight;
        p5.resizeCanvas(canvasWidth, canvasHeight);
        
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

export default FunWithCameras5; 