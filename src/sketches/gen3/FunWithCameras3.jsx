import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";
import simpleCameraManager from "../../utils/simpleCameraManager";

const FunWithCameras3 = ({ isFullscreen = false }) => {
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
    
    // Initialize camera using simple manager
    console.log('FunWithCameras3: setup - initializing camera');
    simpleCameraManager.initialize(p5);
    
    console.log('FunWithCameras3: setup complete');
  };

  const draw = (p5) => {
    // Clear background
    p5.background(0);
    
    // Get current video reference and camera state
    const videoRef = simpleCameraManager.getVideo();
    const isReady = simpleCameraManager.isReady();
    const cameraState = simpleCameraManager.getState();
    
    console.log('FunWithCameras3: draw - isReady:', isReady, 'video exists:', !!videoRef);
    
    if (isReady && videoRef) {
      // Draw the video feed (mirrored)
      p5.push();
      p5.translate(p5.width, 0);
      p5.scale(-1, 1);
      p5.image(videoRef, 0, 0, p5.width, p5.height);
      p5.pop();
      
      // Draw some basic UI
      p5.fill(255);
      p5.noStroke();
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textSize(16);
      p5.text('FunWithCameras3 - Debugged Singleton', 20, 20);
      p5.text(`Video size: ${videoRef.width} x ${videoRef.height}`, 20, 45);
      p5.text(`Canvas size: ${p5.width} x ${p5.height}`, 20, 70);
      p5.text(`Camera ready: ${isReady}`, 20, 95);
      p5.text(`Loading: ${cameraState.isLoading}`, 20, 120);
      p5.text(`Error: ${cameraState.error || 'None'}`, 20, 145);
    } else if (cameraState.error) {
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
      p5.textSize(16);
      p5.text(`Loading: ${cameraState.isLoading}`, p5.width / 2, p5.height / 2 + 40);
    }
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
  };

  return <Sketch setup={setup} draw={draw} windowResized={windowResized} />;
};

export default FunWithCameras3; 