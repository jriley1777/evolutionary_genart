import React from 'react';
import { ReactP5Wrapper } from '@p5-wrapper/react';
import { usePhotoMode } from '../../components/PhotoModeWrapper/PhotoModeWrapper';

const FunWithCameras6 = ({ isFullscreen = false, photoMode = false }) => {
  let cam;
  let threshold = 1;
  let canvasWidth = 0;
  let canvasHeight = 0;
  let edgeVertices = [];
  let previousVertices = [];
  let tweenProgress = 0;
  let tweenSpeed = 0.1;
  let lastCapturedVertices = []; // Store vertices for photo mode
  let flyingTriangles = []; // Store triangles that are flying away
  let previousTriangles = []; // Track previous triangles for disappearance detection
  let triangleLifetimes = new Map(); // Track how long each triangle has existed
  let minTriangleLifetime = 1; // Minimum frames a triangle must exist before flying
  let stableConnections = new Map(); // Store stable connections between vertices
  let connectionThreshold = 50; // Distance threshold for connections

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
      p5.frameRate(25);

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

    // Detect edges and convert to vertices
    const detectEdgeVertices = (p5) => {
      if (!cam || !cam.pixels) return [];
      
      cam.loadPixels();
      let vertices = [];
      
      for (let y = 2; y < cam.height - 2; y += 20) { // Sample every 4th pixel for performance
        for (let x = 2; x < cam.width - 2; x += 20) {
          let i = (x + y * cam.width) * 4;
          
          let b = p5.brightness(p5.color(cam.pixels[i], cam.pixels[i + 1], cam.pixels[i + 2]));
          let bRight = p5.brightness(p5.color(cam.pixels[i + 4], cam.pixels[i + 5], cam.pixels[i + 6]));
          let bDown = p5.brightness(p5.color(cam.pixels[i + cam.width * 4], cam.pixels[i + cam.width * 4 + 1], cam.pixels[i + cam.width * 4 + 2]));
          
          let edge = p5.abs(b - bRight) > threshold || p5.abs(b - bDown) > threshold;
          
          if (edge) {
            let mirrorX = cam.width - 1 - x;
            let screenX = (mirrorX / cam.width) * p5.width;
            let screenY = (y / cam.height) * p5.height;
            
            let tooClose = false;
            for (let v of vertices) {
              let dist = p5.dist(screenX, screenY, v.x, v.y);
              if (dist < 20) { // Minimum distance between vertices
                tooClose = true;
                break;
              }
            }
            
            if (!tooClose) {
              // Create a stable ID based on position
              let gridX = Math.floor(screenX / 20) * 20;
              let gridY = Math.floor(screenY / 20) * 20;
              let stableId = `${gridX}-${gridY}`;
              
              vertices.push({
                x: screenX,
                y: screenY,
                strength: p5.abs(b - bRight) + p5.abs(b - bDown),
                stableId: stableId
              });
            }
          }
        }
      }
      return vertices;
    };

    // Tween between two sets of vertices
    const tweenVertices = (p5, fromVertices, toVertices, progress) => {
      let tweenedVertices = [];
      
      // Create a map of closest vertices
      let vertexMap = new Map();
      
      // Map each vertex from 'from' to closest vertex in 'to'
      for (let i = 0; i < fromVertices.length; i++) {
        let closestIndex = -1;
        let closestDist = Infinity;
        
        for (let j = 0; j < toVertices.length; j++) {
          let dist = p5.dist(fromVertices[i].x, fromVertices[i].y, toVertices[j].x, toVertices[j].y);
          if (dist < closestDist) {
            closestDist = dist;
            closestIndex = j;
          }
        }
        
        if (closestIndex !== -1) {
          vertexMap.set(i, closestIndex);
        }
      }
      
      // Tween between mapped vertices
      for (let i = 0; i < fromVertices.length; i++) {
        let fromV = fromVertices[i];
        let toIndex = vertexMap.get(i);
        
        if (toIndex !== undefined) {
          let toV = toVertices[toIndex];
          let tweenedX = p5.lerp(fromV.x, toV.x, progress);
          let tweenedY = p5.lerp(fromV.y, toV.y, progress);
          let tweenedStrength = p5.lerp(fromV.strength, toV.strength, progress);
          
          tweenedVertices.push({
            x: tweenedX,
            y: tweenedY,
            strength: tweenedStrength
          });
        } else {
          // No match found, fade out
          tweenedVertices.push({
            x: fromV.x,
            y: fromV.y,
            strength: fromV.strength * (1 - progress)
          });
        }
      }
      
      // Add new vertices that don't have matches
      for (let j = 0; j < toVertices.length; j++) {
        let hasMatch = false;
        for (let mappedIndex of vertexMap.values()) {
          if (mappedIndex === j) {
            hasMatch = true;
            break;
          }
        }
        
        if (!hasMatch) {
          // Fade in new vertex
          let toV = toVertices[j];
          tweenedVertices.push({
            x: toV.x,
            y: toV.y,
            strength: toV.strength * progress
          });
        }
      }
      
      return tweenedVertices;
    };

    // Draw vertices with connecting lines
    const drawVertices = (p5, vertices) => {
      // Create a map of vertices by stable ID for easy lookup
      let vertexMap = new Map();
      for (let i = 0; i < vertices.length; i++) {
        vertexMap.set(vertices[i].stableId, i);
      }
      
      // Update stable connections based on current vertices
      let newConnections = [];
      let connectionCounts = new Array(vertices.length).fill(0);
      let maxConnections = 3;
      
      // First, preserve existing connections that are still valid
      for (let [connectionKey, connection] of stableConnections) {
        let [id1, id2] = connectionKey.split('|');
        let index1 = vertexMap.get(id1);
        let index2 = vertexMap.get(id2);
        
        if (index1 !== undefined && index2 !== undefined) {
          let dist = p5.dist(vertices[index1].x, vertices[index1].y, vertices[index2].x, vertices[index2].y);
          if (dist < connectionThreshold && connectionCounts[index1] < maxConnections && connectionCounts[index2] < maxConnections) {
            newConnections.push({
              from: index1,
              to: index2,
              distance: dist
            });
            connectionCounts[index1]++;
            connectionCounts[index2]++;
          }
        }
      }
      
      // Then, add new connections for vertices that don't have enough
      for (let i = 0; i < vertices.length; i++) {
        if (connectionCounts[i] >= maxConnections) continue;
        
        let vertexConnections = [];
        for (let j = 0; j < vertices.length; j++) {
          if (i === j) continue;
          if (connectionCounts[j] >= maxConnections) continue;
          
          let dist = p5.dist(vertices[i].x, vertices[i].y, vertices[j].x, vertices[j].y);
          if (dist < connectionThreshold) {
            vertexConnections.push({
              index: j,
              distance: dist,
              strength: vertices[j].strength
            });
          }
        }
        
        vertexConnections.sort((a, b) => {
          if (Math.abs(a.distance - b.distance) < 5) {
            return b.strength - a.strength;
          }
          return a.distance - b.distance;
        });
        
        let connectionsMade = 0;
        for (let connection of vertexConnections) {
          if (connectionCounts[i] >= maxConnections) break;
          if (connectionCounts[connection.index] >= maxConnections) continue;
          
          newConnections.push({
            from: i,
            to: connection.index,
            distance: connection.distance
          });
          
          connectionCounts[i]++;
          connectionCounts[connection.index]++;
          connectionsMade++;
          
          if (connectionsMade >= maxConnections) break;
        }
      }
      
      // Update stable connections map
      stableConnections.clear();
      for (let connection of newConnections) {
        let id1 = vertices[connection.from].stableId;
        let id2 = vertices[connection.to].stableId;
        let key = [id1, id2].sort().join('|');
        stableConnections.set(key, connection);
      }
      
      // Detect and fill triangles FIRST (before lines)
      let triangles = detectTriangles(vertices, newConnections);
      
      // Update triangle lifetimes
      let currentTriangleIds = new Set();
      for (let triangle of triangles) {
        currentTriangleIds.add(triangle.id);
        if (triangleLifetimes.has(triangle.id)) {
          triangleLifetimes.set(triangle.id, triangleLifetimes.get(triangle.id) + 1);
        } else {
          triangleLifetimes.set(triangle.id, 1);
        }
      }
      
      // Clean up lifetimes for triangles that no longer exist
      for (let [id, lifetime] of triangleLifetimes) {
        if (!currentTriangleIds.has(id)) {
          triangleLifetimes.delete(id);
        }
      }
      
      // Check for disappearing triangles and add them to flying list
      checkDisappearingTriangles(p5, triangles);
      
      // Update flying triangles physics
      updateFlyingTriangles(p5);
      
      // Test: Add a simple triangle if no triangles are found
      if (triangles.length === 0 && vertices.length >= 3) {
        triangles = [{
          v1: vertices[0],
          v2: vertices[1], 
          v3: vertices[2],
          id: 'test-triangle'
        }];
      }
      
      for (let triangle of triangles) {
        // Create a semi-transparent colored fill using RGB
        let r = p5.random(100, 255);
        let g = p5.random(100, 255);
        let b = p5.random(100, 255);
        p5.fill(r, g, b, 80); // 80 alpha for semi-transparent
        p5.noStroke();
        
        // Draw the triangle
        p5.beginShape();
        p5.vertex(triangle.v1.x, triangle.v1.y);
        p5.vertex(triangle.v2.x, triangle.v2.y);
        p5.vertex(triangle.v3.x, triangle.v3.y);
        p5.endShape(p5.CLOSE);
      }
      
      // Draw flying triangles (after current triangles)
      drawFlyingTriangles(p5);
      
      // SECOND: Draw connecting lines
      p5.stroke(0);
      p5.strokeWeight(2);
      p5.noFill();
      
      // Draw all stable connections
      for (let connection of newConnections) {
        let alpha = p5.map(connection.distance, 0, connectionThreshold, 255, 50);
        p5.stroke(0, alpha);
        p5.line(vertices[connection.from].x, vertices[connection.from].y, 
                 vertices[connection.to].x, vertices[connection.to].y);
      }
    };

    // Detect triangles from vertex connections
    const detectTriangles = (vertices, connections) => {
      let triangles = [];
      
      // Create adjacency map
      let adjacencyMap = new Map();
      for (let connection of connections) {
        if (!adjacencyMap.has(connection.from)) {
          adjacencyMap.set(connection.from, new Set());
        }
        if (!adjacencyMap.has(connection.to)) {
          adjacencyMap.set(connection.to, new Set());
        }
        adjacencyMap.get(connection.from).add(connection.to);
        adjacencyMap.get(connection.to).add(connection.from);
      }
      
      // Find triangles (three vertices all connected to each other)
      for (let [vertex1, neighbors1] of adjacencyMap) {
        for (let vertex2 of neighbors1) {
          if (vertex2 > vertex1) { // Avoid duplicate triangles
            let neighbors2 = adjacencyMap.get(vertex2);
            if (neighbors2) {
              for (let vertex3 of neighbors2) {
                if (vertex3 > vertex2 && neighbors1.has(vertex3)) {
                  // Found a triangle!
                  triangles.push({
                    v1: vertices[vertex1],
                    v2: vertices[vertex2],
                    v3: vertices[vertex3],
                    id: `${vertex1}-${vertex2}-${vertex3}` // Unique ID for tracking
                  });
                }
              }
            }
          }
        }
      }
      
      return triangles;
    };

    // Update flying triangles physics
    const updateFlyingTriangles = (p5) => {
      for (let i = flyingTriangles.length - 1; i >= 0; i--) {
        let triangle = flyingTriangles[i];
        
        // Update physics
        triangle.x += triangle.vx;
        triangle.y += triangle.vy;
        triangle.rotation += triangle.rotationSpeed;
        triangle.alpha *= 0.99; // Slower fade out
        
        // Remove if off screen or too faded
        if (triangle.alpha < 0.1 || 
            triangle.x < -200 || triangle.x > p5.width + 200 ||
            triangle.y < -200 || triangle.y > p5.height + 200) {
          flyingTriangles.splice(i, 1);
        }
      }
    };

    // Draw flying triangles
    const drawFlyingTriangles = (p5) => {
      for (let triangle of flyingTriangles) {
        p5.push();
        p5.translate(triangle.x, triangle.y);
        p5.rotate(triangle.rotation);
        
        // Create flying triangle color with fade
        let r = triangle.color.r;
        let g = triangle.color.g;
        let b = triangle.color.b;
        
        // Draw fill
        p5.fill(r, g, b, triangle.alpha * 255);
        p5.noStroke();
        
        // Draw the flying triangle fill
        p5.beginShape();
        p5.vertex(triangle.v1.x - triangle.x, triangle.v1.y - triangle.y);
        p5.vertex(triangle.v2.x - triangle.x, triangle.v2.y - triangle.y);
        p5.vertex(triangle.v3.x - triangle.x, triangle.v3.y - triangle.y);
        p5.endShape(p5.CLOSE);
        
        // Draw black border with lighter alpha
        p5.stroke(0, triangle.alpha * 100); // Lighter alpha for border
        p5.strokeWeight(1);
        p5.noFill();
        
        // Draw the flying triangle border
        p5.beginShape();
        p5.vertex(triangle.v1.x - triangle.x, triangle.v1.y - triangle.y);
        p5.vertex(triangle.v2.x - triangle.x, triangle.v2.y - triangle.y);
        p5.vertex(triangle.v3.x - triangle.x, triangle.v3.y - triangle.y);
        p5.endShape(p5.CLOSE);
        
        p5.pop();
      }
    };

    // Check for disappearing triangles and add them to flying list
    const checkDisappearingTriangles = (p5, currentTriangles) => {
      // Create a set of current triangle IDs
      let currentTriangleIds = new Set(currentTriangles.map(t => t.id));
      
      // Check previous triangles that are no longer present
      for (let prevTriangle of previousTriangles) {
        if (!currentTriangleIds.has(prevTriangle.id)) {
          // Check if this triangle existed long enough to become flying
          let lifetime = triangleLifetimes.get(prevTriangle.id) || 0;
          if (lifetime >= minTriangleLifetime) {
            // This triangle disappeared and existed long enough! Make it fly away
            let centerX = (prevTriangle.v1.x + prevTriangle.v2.x + prevTriangle.v3.x) / 3;
            let centerY = (prevTriangle.v1.y + prevTriangle.v2.y + prevTriangle.v3.y) / 3;
            
            // Calculate direction to nearest screen edge
            let edgeX = centerX < p5.width / 2 ? -100 : p5.width + 100;
            let edgeY = centerY < p5.height / 2 ? -100 : p5.height + 100;
            let dirX = edgeX - centerX;
            let dirY = edgeY - centerY;
            let distance = p5.dist(centerX, centerY, edgeX, edgeY);
            
            // Normalize and set speed
            let speed = 8; // Quick speed toward edge
            let vx = (dirX / distance) * speed;
            let vy = (dirY / distance) * speed;
            
            flyingTriangles.push({
              ...prevTriangle,
              x: centerX,
              y: centerY,
              vx: vx,
              vy: vy,
              rotation: 0,
              rotationSpeed: p5.random(-0.05, 0.05), // Slower rotation
              alpha: 0.9, // Start with high alpha
              color: {
                r: p5.random(100, 255),
                g: p5.random(100, 255),
                b: p5.random(100, 255)
              }
            });
          }
          // Remove from lifetimes regardless
          triangleLifetimes.delete(prevTriangle.id);
        }
      }
      
      // Update previous triangles for next frame
      previousTriangles = [...currentTriangles];
    };

    // Create a simple capture function for photo mode (no parameters)
    const drawVerticesAndEdges = (p5) => {
      // Detect new vertices
      let newVertices = detectEdgeVertices(p5);
            
      // Tween between previous and new vertices
      if (previousVertices.length > 0) {
        edgeVertices = tweenVertices(p5, previousVertices, newVertices, tweenProgress);
        tweenProgress += tweenSpeed;
        
        if (tweenProgress >= 1) {
          tweenProgress = 0;
          previousVertices = [...newVertices];
        }
      } else {
        edgeVertices = newVertices;
        previousVertices = [...newVertices];
      }
      
      // Draw the vertices
      p5.background(220);
      drawVertices(p5, edgeVertices);
    };

    p5.draw = () => {
      // Check if camera is ready for photo mode
      const cameraReady = cam && cam.width > 0 && cam.height > 0;

      // Handle photo mode
      if (photoMode) {
        if (photoModeManager.isCapturingActive()) {
          // Only draw and capture if camera is ready
          if (cameraReady) {
            
            drawVerticesAndEdges(p5);
            // Update photo mode with simple capture function
            photoModeManager.update(p5, drawVerticesAndEdges, cameraReady);
            
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
        // Normal mode - always run the vertex-based edge detection
        if (cameraReady) {
          drawVerticesAndEdges(p5);
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
      if (p5.key === 't' || p5.key === 'T') {
        tweenSpeed = p5.constrain(tweenSpeed + 0.02, 0.01, 0.3);
      }
      if (p5.key === 'r' || p5.key === 'R') {
        tweenSpeed = p5.constrain(tweenSpeed - 0.02, 0.01, 0.3);
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

export default FunWithCameras6; 