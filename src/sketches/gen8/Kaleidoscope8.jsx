import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const Kaleidoscope8 = ({ isFullscreen = false }) => {
  // Camera variables
  let video = null;
  let videoLoaded = false;

  const sketch = (p5) => {

    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.colorMode(p5.RGB, 255);
      p5.background(0);
      
      // Initialize camera
      video = p5.createCapture(p5.VIDEO);
      video.size(320, 240);
      video.hide();
      
      video.elt.addEventListener('loadeddata', () => {
        videoLoaded = true;
        console.log('Camera feed loaded successfully!');
      });
    };

    p5.draw = () => {
      // Clear background
      p5.background(0);
      
      if (videoLoaded && video) {
        // Calculate dimensions for 2x2 grid
        const panelWidth = p5.width / 2;
        const panelHeight = p5.height / 2;
        const videoHeight = (panelWidth * video.height) / video.width;
        
        // Create a graphics buffer with the full video
        let videoBuffer = p5.createGraphics(panelWidth/2, panelHeight/2);
        videoBuffer.image(video, 0, 0, panelWidth, panelHeight/2.6);
        
        // Top left panel (original left half)
        p5.image(videoBuffer, 0, 0, panelWidth, videoHeight, 0, 0, panelWidth, panelHeight);
        
        // Top right panel (horizontal flip)
        p5.push();
        p5.translate(p5.width, 0);
        p5.scale(-1, 1);
        p5.image(videoBuffer, 0, 0, panelWidth, videoHeight, 0, 0, panelWidth, panelHeight);
        p5.pop();
        
        // Bottom left panel (vertical flip)
        p5.push();
        p5.translate(0, p5.height);
        p5.scale(1, -1);
        p5.image(videoBuffer, 0, 0, panelWidth, videoHeight, 0, 0, panelWidth, panelHeight);
        p5.pop();
        
        // Bottom right panel (both horizontal and vertical flip)
        p5.push();
        p5.translate(p5.width, p5.height);
        p5.scale(-1, -1);
        p5.image(videoBuffer, 0, 0, panelWidth, videoHeight, 0, 0, panelWidth, panelHeight);
        p5.pop();
      } else {
        // Loading message
        p5.fill(255);
        p5.noStroke();
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(24);
        p5.text('Loading Camera...', p5.width / 2, p5.height / 2);
      }
      
      // Draw UI
      drawUI(p5);
    };

    const drawUI = (p5) => {
      p5.fill(255);
      p5.noStroke();
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textSize(14);
      p5.text(`Simple Camera Mirror`, 20, 20);
      p5.text(`Camera: ${videoLoaded ? 'Active' : 'Loading...'}`, 20, 45);
      p5.text(`Left: Original | Right: Flipped`, 20, 70);
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
      p5.background(0);
    };
  };

  return (
    <ReactP5Wrapper sketch={sketch}/>
  );
};

export default Kaleidoscope8; 