import React from "react";
import Sketch from "react-p5";
import io from 'socket.io-client';
import "../Sketch.css";

const MultiDraw = () => {
  let socket;

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    canvas.class('canvas-container');
    p5.background(0);
    
    // Connect to the socket.io server
    socket = io('http://localhost:3000', {
      transports: ['websocket'],
      reconnection: true
    });

    // Connection event handlers
    socket.on('connect', () => {
      console.log('Connected to server:', socket.id);
    });

    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    // listen for other users' mouse events
    socket.on("mouse", (data) => {
      p5.fill(255);
      p5.stroke(255);
      p5.ellipse(data.x, data.y, 20, 20);
    });
  };

  const draw = (p5) => {
    // Keep the background in draw to prevent trails
  };

  const mouseDragged = (p5) => {
    p5.fill(255);
    p5.noStroke();
    p5.ellipse(p5.mouseX, p5.mouseY, 20, 20);
  
    // send my mouse position to the server
    const data = {
      x: p5.mouseX,
      y: p5.mouseY,
    };
    socket.emit("mouse", data);
  }

  return ( 
    <Sketch 
      setup={setup} 
      draw={draw} 
      mouseDragged={mouseDragged} 
    />
  );
};

export default MultiDraw;