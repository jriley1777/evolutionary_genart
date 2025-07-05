import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const FunWithCameras2 = ({ isFullscreen = false }) => {
  // Camera variables
  let video = null;
  let videoLoaded = false;
  let videoError = false;
  
  // Static barcode layout
  const numSlices = 30;
  const sliceWidths = [];
  const sliceGaps = [];
  let totalWidth = 0;

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    
    if (isFullscreen) {
      canvas.class('canvas-container fullscreen');
      canvas.elt.classList.add('fullscreen');
    } else {
      canvas.class('canvas-container');
    }
    
    p5.colorMode(p5.RGB, 255);
    p5.background(0);
    
    // Initialize camera with error handling
    try {
      video = p5.createCapture(p5.VIDEO);
      video.size(320, 240);
      video.hide();
      
      video.elt.addEventListener('loadeddata', () => {
        videoLoaded = true;
        videoError = false;
        console.log('Camera feed loaded successfully!');
      });
      
      video.elt.addEventListener('error', () => {
        videoError = true;
        videoLoaded = false;
        console.log('Camera feed error!');
      });
      
    } catch (error) {
      console.log('Camera initialization failed:', error);
      videoError = true;
    }
    
    // Generate static slice widths and gaps
    generateSliceLayout(p5);
  };

  const generateSliceLayout = (p5) => {
    sliceWidths.length = 0;
    sliceGaps.length = 0;
    totalWidth = 0;
    
    // Generate 30 slices with varying widths and gaps
    for (let i = 0; i < numSlices; i++) {
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
  };

  const draw = (p5) => {
    // Clear background
    p5.background(0);
    
    if (videoLoaded && video && !videoError) {
      // Calculate scale factor to fit full canvas width
      const scaleFactor = p5.width / totalWidth;
      let currentX = 0; // Start at left edge
      
      // Draw vertical slices like a barcode
      for (let i = 0; i < numSlices; i++) {
        const currentWidth = sliceWidths[i] * scaleFactor;
        
        // Calculate which part of the video to sample for this slice
        const videoX = (i / (numSlices - 1)) * video.width;
        
        // Draw the video slice directly without creating buffers
        p5.image(video, currentX, 0, currentWidth, p5.height, videoX, 0, currentWidth, video.height);
        
        // Move to next position
        currentX += currentWidth + (sliceGaps[i] * scaleFactor);
      }
    } else if (videoError) {
      // Error message
      p5.fill(255, 0, 0);
      p5.noStroke();
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(24);
      p5.text('Camera Error', p5.width / 2, p5.height / 2);
      p5.textSize(16);
      p5.text('Please check camera permissions', p5.width / 2, p5.height / 2 + 40);
    } else {
      // Loading message
      p5.fill(255);
      p5.noStroke();
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(24);
      p5.text('Loading Camera...', p5.width / 2, p5.height / 2);
    }
    
    // Draw simple UI
    drawUI(p5);
  };

  const drawUI = (p5) => {
    p5.fill(255);
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.textSize(14);
    p5.text(`Camera Barcode Effect`, 20, 20);
    p5.text(`Camera: ${videoError ? 'Error' : videoLoaded ? 'Active' : 'Loading...'}`, 20, 45);
    p5.text(`Slices: ${numSlices} | Total Width: ${Math.round(totalWidth)}px`, 20, 70);
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    p5.background(0);
    // Regenerate layout for new window size
    generateSliceLayout(p5);
  };

  return (
    <Sketch 
      setup={setup} 
      draw={draw} 
      windowResized={windowResized}
    />
  );
};

export default FunWithCameras2; 