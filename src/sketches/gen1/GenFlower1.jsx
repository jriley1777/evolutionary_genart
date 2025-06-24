import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const GenFlower1 = ({ isFullscreen = false }) => {
  // Array to store multiple spirals
  const spirals = [];
  let lastSpawnTime = 0;
  const SPAWN_INTERVAL = 1000; // Spawn new spiral every 3 seconds
  const TOTAL_RUNTIME = 60000; // 1 minute total runtime
  let startTime = 0;
  let isPaused = false;
  let spiralCount = 0; // Track number of spirals for positioning
  let hillNoiseOffset = 0; // For animated hills
  let currentHillIndex = 0; // Track which hill we're drawing
  let spiralsPerLayer = 40; // Number of spirals per hill layer
  let hillLayers = []; // Store hill data for layering
  let layerSpirals = []; // Store spirals organized by layer
  let totalSpiralsDrawn = 0; // Track total spirals drawn
  const MAX_TOTAL_SPIRALS = 20; // Maximum total spirals to draw

  class Spiral {
    constructor(p5, layerIndex = 0) {
      this.angle = -30;
      this.radius = 0;
      this.layerIndex = layerIndex; // Store layer index for radius scaling
      this.noiseOffset = p5.random(1000);
      this.colorOffset = p5.random(1000);
      this.startTime = p5.millis();
      
      // Calculate position based on spiral count
      const maxOffset = p5.width / 2 - 100; // Leave some margin from edges
      const spacing = maxOffset / 3; // Divide available space into 3 sections
      const offset = p5.constrain(p5.random(0,Math.floor(spiralCount / 3) * spacing), 0, p5.windowWidth/2);
      this.centerX = p5.constrain(
        spiralCount % 2 === 0 ? offset : -offset,
        -maxOffset,
        maxOffset
      );
      this.baseY = p5.random(0, 0);
      this.centerY = this.baseY;
      
      this.stemAngle = 0;
      this.verticalAngle = p5.random(p5.TWO_PI); // Random starting phase for vertical motion
      this.points = []; // Array to store all points
      
      // Add unique sway parameters for independent motion
      this.swaySpeed = p5.random(0.01, 0.3); // Different sway speeds
      this.swayAmplitude = p5.random(15, 35); // Different sway amplitudes
      this.swayOffset = p5.random(p5.TWO_PI); // Random phase offset
      this.swayNoiseOffset = p5.random(1000); // Unique noise offset for sway
      
      spiralCount++;
    }

    drawStem(p5) {
      // Calculate points along the stem path
      const steps = 100;
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        // Linear interpolation from spiral center to bottom of canvas
        const baseX = this.centerX;
        const y = p5.lerp(this.centerY, p5.height/2, t);
        
        // Add sine wave variation with unique parameters
        const sineOffset = p5.sin(this.stemAngle * this.swaySpeed + this.swayOffset + t * p5.PI * 2)/2 * this.swayAmplitude;
        
        // Add some noise for organic feel with unique offset
        // const noise = p5.noise(this.swayNoiseOffset + i * 0.1) * 10 - 5;
        const noise = 0;
        
        // Calculate layer-based color variation
        // Early layers (lower index) have darker green, later layers have lighter green
        const layerProgress = this.layerIndex / 6; // Normalize layer index to 0-1
        const baseHue = p5.map(layerProgress, 0, 1, 100, 120); // Dark green to light green
        const baseSaturation = p5.map(layerProgress, 0, 1, 80, 60); // Higher saturation for darker layers
        const baseBrightness = p5.map(layerProgress, 0, 1, 40, 80); // Lower brightness for darker layers
        
        // Calculate color based on position along stem - slight variation from base layer color
        const hue = p5.lerp(baseHue, baseHue + 10, t); // Slight hue shift along stem
        const saturation = p5.lerp(baseSaturation, baseSaturation - 10, t); // Desaturate towards bottom
        const brightness = p5.lerp(baseBrightness, baseBrightness + 20, t); // Brighten towards bottom
        p5.stroke(hue, saturation, brightness);
        p5.strokeWeight(2); // Increased stroke weight for better visibility
        
        // Draw point with combined sine and noise offset
        p5.point(baseX + sineOffset + noise, y);
      }
      
      // Increment stem angle for animation
      this.stemAngle += 0.02;
    }

    update(p5) {
      // Update vertical position with gentle sway
      this.verticalAngle += 0.01;
      this.centerY = this.baseY + p5.sin(this.verticalAngle) * 10;

      // Calculate noise-based radius variation
      const noiseVal = p5.noise(this.noiseOffset) * 50;
      const radiusVariation = p5.sin(this.angle * 0.5) * 30;
      
      // Calculate layer-based radius scaling
      // Early layers (lower index) have smaller radius, later layers have larger radius
      const layerScale = p5.map(this.layerIndex, 0, 6, 0.3, 1.5); // Scale from 0.3x to 1.5x
      
      // Calculate current radius with noise, sine variation, and layer scaling
      this.radius = (5 + this.angle * 0.5 + noiseVal + radiusVariation) * layerScale/5;

      // Calculate base position on spiral
      const baseX = this.centerX + this.radius * p5.cos(this.angle);
      const baseY = this.centerY + this.radius * p5.sin(this.angle);

      // Calculate layer-based brightness variation
      // Early layers (lower index) have darker spirals, later layers have brighter spirals
      const layerProgress = this.layerIndex / 6; // Normalize layer index to 0-1
      const baseBrightness = p5.map(layerProgress, 0, 1, 40, 100); // Dark to bright
      
      // Calculate color based on angle and noise with layer-based brightness
      const hue = (this.angle * 2 + this.colorOffset) % 360;
      const saturation = 80 + p5.noise(this.noiseOffset + 100) * 20;
      const brightness = baseBrightness + p5.noise(this.noiseOffset + 200) * 20;
      
      // Store the point with its base position and color
      if(this.points.length < 200) {
        this.points.push({
        baseX: baseX,
        baseY: baseY,
        hue: hue,
        saturation: saturation,
        brightness: brightness
      });
    }

      // Draw all stored points with current sway
      this.points.forEach(point => {
        const swayAmount = p5.sin(this.stemAngle * this.swaySpeed + this.swayOffset) * this.swayAmplitude;
        p5.stroke(point.hue, point.saturation, point.brightness + 20); // Increased brightness
        p5.strokeWeight(2); // Increased stroke weight for better visibility
        p5.point(point.baseX + swayAmount, point.baseY);
      });

      // Increment angle and noise offset
      this.angle -= 0.15;
      this.noiseOffset += 0.01;
      this.colorOffset += 0.5;

      // Spirals now live forever - no lifetime check
      return true;
    }
  }

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight).parent(canvasParentRef);
    
    // Add fullscreen class if in fullscreen mode
    if (isFullscreen) {
      canvas.class('canvas-container fullscreen');
      canvas.elt.classList.add('fullscreen');
    } else {
      canvas.class('canvas-container');
    }
    
    p5.background(0);
    p5.strokeWeight(2);
    p5.noFill();
    p5.colorMode(p5.HSB);
    startTime = p5.millis();
    
    // Generate initial hill data
    generateHillData(p5);
    
    // Initialize layer spirals
    layerSpirals = [];
    for (let i = 0; i < hillLayers.length; i++) {
      if(layerSpirals.length < MAX_TOTAL_SPIRALS) {
        layerSpirals.push(createLayerSpirals(p5, i));
      }
    }
  };

  const draw = (p5) => {
    // Clear background
    p5.background(0);
    
    // Regenerate hill data for animation
    generateHillData(p5);
    
    // Draw layers from back to front in alternating batches
    for (let i = 0; i < hillLayers.length; i++) {
      const hillData = hillLayers[i];
      
      // Draw the hill layer with black fill
      drawHillLayer(p5, hillData);
      
      // Draw spirals for this layer (in front of the hill)
      if (layerSpirals[i]) {
        // Center the drawing for spirals
        p5.push();
        p5.translate(p5.width / 2, p5.height / 2);
        drawLayerSpirals(p5, layerSpirals[i]);
        p5.pop();
      }
    }
    
    p5.strokeWeight(2);
    p5.noFill();

    // Check if we should pause
    if (!isPaused && p5.millis() - startTime > TOTAL_RUNTIME) {
      isPaused = true;
      return;
    }

    // If paused, don't draw anything new
    if (isPaused) {
      return;
    }

    // Spawn new spiral every SPAWN_INTERVAL milliseconds
    if (p5.millis() - lastSpawnTime > SPAWN_INTERVAL) {
      // Create new spirals for the next layer
      const nextLayer = (currentHillIndex % hillLayers.length);
      // layerSpirals[nextLayer] = createLayerSpirals(p5, nextLayer);
      lastSpawnTime = p5.millis();
      currentHillIndex++;
    }
  };

  // Function to generate hill data
  const generateHillData = (p5) => {
    hillLayers = [];
    const numHills = 8;
    const hillSpacing = p5.height / (numHills + 1);
    
    for (let hill = 0; hill < numHills; hill++) {
      const baseY = hillSpacing * (hill + 1);
      const hillHeight = p5.map(hill, 0, numHills - 1, 0.8, 0.2);
      const amplitude = p5.height * 0.15 * hillHeight;
      
      const hillPoints = [];
      for (let x = 0; x <= p5.width; x += 2) {
        const normalizedX = x / p5.width;
        const sineWave = p5.sin(normalizedX * p5.PI * 2 + hill * 0.5) * amplitude;
        const noiseVal = p5.noise(
          normalizedX * 3 + hillNoiseOffset * 0.001, 
          hill * 0.5 + hillNoiseOffset * 0.002
        ) * amplitude * 0.3;
        const y = baseY + sineWave + noiseVal;
        hillPoints.push({ x, y });
      }
      
      hillLayers.push({
        points: hillPoints,
        baseY: baseY,
        index: hill
      });
    }
  };

  // Function to draw a single hill with fill
  const drawHillLayer = (p5, hillData) => {
    // Calculate fill color based on layer position (dark green at top, light muted green at bottom)
    const layerProgress = hillData.index / (hillLayers.length - 1); // 0 to 1
    const hillHue = p5.map(layerProgress, 0, 1, 100, 110); // Dark green to light green
    const hillSaturation = p5.map(layerProgress, 0, 1, 80, 40); // High saturation to muted
    const hillBrightness = p5.map(layerProgress, 0, 1, 20, 70); // Dark to light
    
    // Draw the hill curve
    p5.stroke(hillHue, hillSaturation, hillBrightness + 10); // Slightly brighter stroke
    p5.strokeWeight(1);
    p5.fill(hillHue, hillSaturation, hillBrightness); // Green gradient fill
    
    p5.beginShape();
    // Add top-left corner
    p5.vertex(0, 0);
    // Add hill points
    hillData.points.forEach(point => {
      p5.vertex(point.x, point.y);
    });
    // Add bottom-right corner and close shape
    p5.vertex(p5.width, p5.height);
    p5.vertex(0, p5.height);
    p5.endShape(p5.CLOSE);
    
    // Draw grass on the hill
    drawGrassOnHill(p5, hillData);
  };

  // Function to draw swaying grass blades on a hill
  const drawGrassOnHill = (p5, hillData) => {
    const time = p5.millis() * 0.000001; // Much slower time multiplier for very gentle animation
    const grassSpacing = 2; // Reduced spacing for more condensed grass
    const maxGrassHeight = 6; // Slightly reduced height for more subtle effect
    
    // Calculate grass color based on layer with consistent brightness layering
    const layerProgress = hillData.index / (hillLayers.length - 1);
    const grassHue = p5.map(layerProgress, 0, 1, 100, 120); // Green to blue-green
    const grassSaturation = p5.map(layerProgress, 0, 1, 80, 60); // Higher saturation for darker layers
    const grassBrightness = p5.map(layerProgress, 0, 1, 40, 90); // Dark to bright - consistent with stems/spirals
    
    p5.stroke(grassHue, grassSaturation, grassBrightness);
    p5.strokeWeight(1);
    
    // Draw grass blades along the hill contour
    for (let i = 0; i < hillData.points.length; i += grassSpacing) {
      const point = hillData.points[i];
      if (!point) continue;
      
      // Calculate grass blade properties with very minimal animation
      const bladeHeight = p5.random(maxGrassHeight * 0.6, maxGrassHeight);
      const swaySpeed = p5.random(0.02, 0.08); // Very slow sway speeds
      const swayAmplitude = p5.random(0.1, 0.5); // Very small sway amplitudes
      const swayOffset = p5.random(p5.TWO_PI);
      
      // Calculate sway motion
      const swayX = p5.sin(time * swaySpeed + swayOffset) * swayAmplitude;
      
      // Draw the grass blade as a curved line
      p5.beginShape();
      p5.noFill();
      
      // Start at the hill surface
      p5.vertex(point.x, point.y);
      
      // Create a curved blade with minimal sway
      const segments = 4; // Reduced segments for simpler blades
      for (let j = 1; j <= segments; j++) {
        const t = j / segments;
        const height = bladeHeight * t;
        const sway = swayX * t * 0.2; // Very minimal sway effect
        
        // Add subtle natural curve to the blade
        const curveOffset = p5.sin(t * p5.PI) * 0.5; // Very subtle curve
        
        p5.vertex(
          point.x + sway + curveOffset,
          point.y - height
        );
      }
      
      p5.endShape();
    }
  };

  // Function to create spirals for a specific layer
  const createLayerSpirals = (p5, layerIndex) => {
    const layerSpirals = [];
    
    // Skip the first hill layer (no spirals on layer 0)
    if (layerIndex < 1) {
      return layerSpirals;
    }
    if (layerIndex > 6) {
      return layerSpirals;
    }
    
    for (let i = 0; i < spiralsPerLayer; i++) {
      // Position spiral centers around the height of the prior hill layer
      const targetHillIndex = layerIndex - 1;
      const targetHillY = hillLayers[targetHillIndex] ? hillLayers[targetHillIndex].baseY : p5.height * 0.3;
      
      // Random position across screen width
      const spiralX = p5.random(100, p5.width - 100);
      // Position Y around the target hill height with some variation
      const spiralY = targetHillY + p5.random(-50, 50);
      
      // Create a spiral at this position
      const spiral = new Spiral(p5, layerIndex);
      spiral.centerX = spiralX - p5.width / 2; // Adjust for translation
      spiral.centerY = spiralY - p5.height / 2;
      spiral.baseY = spiralY - p5.height / 2.3;
      layerSpirals.push(spiral);
    }
    return layerSpirals;
  };

  // Function to draw spirals for a layer
  const drawLayerSpirals = (p5, layerSpirals) => {
    layerSpirals.forEach(spiral => {
      spiral.update(p5);
      spiral.drawStem(p5);
      // Spirals now live forever - no removal logic
    });
  };

  return (
    <>
      <Sketch
        className="gen-flower-1"
        setup={setup} 
        draw={draw}
      />
      <div className="progressive-blur-container">
        <div className="blur-filter"></div>
        <div className="blur-filter"></div>
        <div className="blur-filter"></div>
        <div className="blur-filter"></div>
        <div className="blur-filter"></div>
      </div>
    </>
  );
};

export default GenFlower1; 