import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";
import { usePhotoMode } from "../../components/PhotoModeWrapper/PhotoModeWrapper";

const FunWithCameras2 = ({ isFullscreen = false, photoMode = false }) => {
  let canvasRef = React.useRef();
  let video = null;
  let layout = {
    numSlices: 30,
    sliceWidths: [],
    sliceGaps: [],
    totalWidth: 0
  };

  // Photo mode utilities
  const { photoModeManager } = usePhotoMode({
    maxPanels: 12,
    captureInterval: 15,
    gridCols: 4,
    gridRows: 3
  }, photoMode);

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    p5.frameRate(30);
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
    
    // Generate slice layout
    generateSliceLayout(p5);
  };

  const generateSliceLayout = (p5) => {
    const sliceWidths = [];
    const sliceGaps = [];
    let totalWidth = 0;
    
    // Generate 30 slices with varying widths and gaps
    for (let i = 0; i < layout.numSlices; i++) {
      // Width varies from 8 to 25 pixels
      const width = 8 + p5.sin(i * 0.3) * 8 + p5.cos(i * 0.2) * 4;
      sliceWidths.push(Math.max(4, Math.min(30, width)));
      
      // Gap varies from 2 to 8 pixels
      const gap = 2 + p5.sin(i * 0.4) * 3 + p5.cos(i * 0.3) * 2;
      sliceGaps.push(Math.max(1, Math.min(10, gap)));
      
      totalWidth += width + gap;
    }
    
    // Remove the last gap
    totalWidth -= sliceGaps[sliceGaps.length - 1];
    
    // Update layout state
    layout = {
      numSlices: layout.numSlices,
      sliceWidths,
      sliceGaps,
      totalWidth
    };
  };

  // Main draw function for the barcode effect
  const drawBarcodeEffect = (p5, panelParams = {}) => {
    if (video && layout.sliceWidths.length > 0) {
      const scaleFactor = p5.width / layout.totalWidth;
      let currentX = 0;
      
      for (let i = 0; i < layout.numSlices; i++) {
        const currentWidth = layout.sliceWidths[i] * scaleFactor;
        const videoX = (i / (layout.numSlices - 1)) * video.width;
        p5.image(video, currentX, 0, currentWidth, p5.height, videoX, 0, currentWidth, video.height);
        currentX += currentWidth + (layout.sliceGaps[i] * scaleFactor);
      }
    }
  };

  const draw = (p5) => {
    // Clear background
    p5.background(0);
    
    // Check if camera is ready for photo mode
    const cameraReady = video && video.width > 0 && video.height > 0;
    
    // Handle photo mode
    if (photoMode) {
      if (photoModeManager.isCapturingActive()) {
        // Only draw and capture if camera is ready
        if (cameraReady) {
          // Draw live preview while capturing
          drawBarcodeEffect(p5);
          
          // Update photo mode with camera ready state
          photoModeManager.update(p5, drawBarcodeEffect, cameraReady);
          
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
      // Normal mode
      if (cameraReady) {
        drawBarcodeEffect(p5);
      } else {
        // Loading message but still show barcode effect
        drawBarcodeEffect(p5);
        
        // Overlay loading message
        p5.fill(255);
        p5.noStroke();
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(24);
        p5.text('Loading Camera...', p5.width / 2, p5.height / 2);
      }
      
      // Draw simple UI
      drawUI(p5);
    }
  };

  const drawUI = (p5) => {
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.textSize(14);
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(0);
    // Regenerate layout for new window size
    generateSliceLayout(p5);
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

export default FunWithCameras2; 