import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";
import "p5.sound";
import soundManager from "../../utils/soundManager";

const FunWithSounds = ({ isFullscreen = false }) => {
  // Audio state from persistent manager
  const [audioState, setAudioState] = React.useState({
    audioContext: null,
    gainNode: null,
    isConnected: false,
    hasError: false
  });
  
  let playing = false;
  let time = 0;
  let lastBeatTime = 0;
  let bpm = 240;
  let beatInterval = 60 / bpm; // seconds per beat
  
  // Drum pattern (1 = hit, 0 = rest)
  let kickPattern = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]; // Kick on beats 1 and 5
  let snarePattern = [0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1]; // Snare on beats 3 and 7
  let hihatPattern = [1, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Hi-hat on every beat
  let patternLength = 16;
  let currentBeat = 0;

  // Sprite animation system
  let kickSprite = null;
  let snareSprite = null;
  let hihatSprite = null;
  
  // Animation states
  let kickAnim = null;
  let snareAnim = null;
  let hihatAnim = null;

  // Dance floor and zombies - use refs to persist across re-renders
  const danceFloorRef = React.useRef([]);
  const zombiesRef = React.useRef([]);
  const floorNoiseOffsetRef = React.useRef(0);

  class SpriteAnimation {
    constructor(spriteSheet, totalFrames, frameWidth, frameHeight, gridCols = 4, gridRows = 3) {
      this.spriteSheet = spriteSheet;
      this.totalFrames = totalFrames;
      this.frameWidth = frameWidth;
      this.frameHeight = frameHeight;
      this.gridCols = gridCols;
      this.gridRows = gridRows;
      this.currentFrame = 0;
      this.frameDelay = 0;
      this.maxFrameDelay = 15; // Frames to wait before advancing (slower animation)
      this.isPlaying = false;
    }

    advanceFrame() {
      this.currentFrame = (this.currentFrame + 1) % this.totalFrames;
      this.frameDelay = 0;
      this.isPlaying = true;
    }

    update() {
      // Only animate if music is playing
      if (this.isPlaying && playing) {
        this.frameDelay++;
        if (this.frameDelay >= this.maxFrameDelay) {
          this.advanceFrame();
        }
      }
    }

    draw(p5, x, y, scale = 1) {
      if (!this.spriteSheet) return;
      
      // Calculate grid position from frame number
      const col = this.currentFrame % this.gridCols;
      const row = Math.floor(this.currentFrame / this.gridCols);
      
      const sx = col * this.frameWidth;
      const sy = row * this.frameHeight;
      
      p5.push();
      p5.translate(x, y);
      p5.scale(scale);
      p5.imageMode(p5.CENTER);
      
      // Draw the sprite frame
      p5.image(
        this.spriteSheet, 
        0, 0, 
        this.frameWidth, this.frameHeight,
        sx, sy, 
        this.frameWidth, this.frameHeight
      );
      
      p5.pop();
    }

    reset() {
      this.currentFrame = 0;
      this.frameDelay = 0;
      this.isPlaying = false;
    }
  }

  class Zombie {
    constructor(p5, x, y, spriteSheet, frameWidth, frameHeight) {
      this.pos = p5.createVector(x, y);
      this.animation = new SpriteAnimation(spriteSheet, 12, frameWidth, frameHeight, 4, 3);
      this.scale = p5.random(0.2, 0.3);
      this.colorOffset = p5.random(360);
    }

    update() {
      this.animation.update();
    }

    draw(p5) {
      this.animation.draw(p5, this.pos.x, this.pos.y, this.scale);
    }

    triggerDance() {
      this.animation.advanceFrame();
    }
  }

  class DanceFloorTile {
    constructor(p5, x, y, size, gridX, gridY) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.gridX = gridX;
      this.gridY = gridY;
      this.noiseOffset = 0;
    }

    update(p5) {
      this.noiseOffset += 0.01; // Slower animation
    }

    draw(p5, isPlaying = false) {
      if (!isPlaying) {
        // Static dark colors when not playing
        p5.fill(0, 0, 20);
      } else {
        // Use grid position for Perlin noise to create smooth color gradients
        const noiseX = this.gridX * 0.1; // Scale grid position for noise
        const noiseY = this.gridY * 0.1;
        const noiseTime = this.noiseOffset;
        
        // Create smooth color gradients across the grid
        const noiseVal1 = p5.noise(noiseX, noiseY, noiseTime);
        const noiseVal2 = p5.noise(noiseX + 10, noiseY + 10, noiseTime + 100);
        
        const hue = (noiseVal1 * 360) % 360;
        const saturation = 60 + noiseVal2 * 40;
        const brightness = 30 + noiseVal1 * 50;
        
        p5.fill(hue, saturation, brightness);
      }
      
      p5.stroke(0, 0, 100, 0.3); // Transparent white border
      p5.strokeWeight(2);
      p5.rect(this.x, this.y, this.size, this.size);
    }
  }

  const setup = (p5, canvasParentRef) => {
    const canvas = p5.createCanvas(800, 600).parent(canvasParentRef);
    
    if (isFullscreen) {
      canvas.class('canvas-container fullscreen');
      canvas.elt.classList.add('fullscreen');
    } else {
      canvas.class('canvas-container');
    }
    
    p5.colorMode(p5.HSB, 360, 100, 100, 1);
    p5.background(0);
    
    // Initialize audio using persistent manager
    soundManager.initializeAudio(p5).then((success) => {
      if (success) {
        const state = soundManager.getState();
        // Create gain node for volume control
        const gainNode = state.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.3, state.audioContext.currentTime);
        gainNode.connect(state.audioContext.destination);
        
        setAudioState({
          audioContext: state.audioContext,
          gainNode: gainNode,
          isConnected: state.isConnected,
          hasError: state.hasError
        });
      }
    });

    // Load sprite sheets (placeholder images for now)
    loadSpriteSheets(p5);
    
    // Initialize dance floor
    createDanceFloor(p5);
  };

  const createDanceFloor = (p5) => {
    danceFloorRef.current = [];
    const tileSize = 40; // Larger tiles
    const gridWidth = Math.ceil(p5.width / tileSize);
    const gridHeight = Math.ceil(p5.height / tileSize);
    
    for (let i = 0; i < gridWidth; i++) {
      for (let j = 0; j < gridHeight; j++) {
        const x = i * tileSize;
        const y = j * tileSize;
        danceFloorRef.current.push(new DanceFloorTile(p5, x, y, tileSize, i, j));
      }
    }
  };

  const createZombies = (p5, spriteSheet, frameWidth, frameHeight) => {
    zombiesRef.current = [];
    
    // Add the three main zombies (kick, snare, hihat)
    zombiesRef.current.push(new Zombie(p5, p5.width/4, p5.height/2, spriteSheet, frameWidth, frameHeight));
    zombiesRef.current.push(new Zombie(p5, p5.width/2, p5.height/2, spriteSheet, frameWidth, frameHeight));
    zombiesRef.current.push(new Zombie(p5, 3*p5.width/4, p5.height/2, spriteSheet, frameWidth, frameHeight));
    
    // Add 10 more random zombies across the full canvas
    for (let i = 0; i < 10; i++) {
      const x = p5.random(50, p5.width - 50);
      const y = p5.random(50, p5.height - 50);
      zombiesRef.current.push(new Zombie(p5, x, y, spriteSheet, frameWidth, frameHeight));
    }
  };

  const loadSpriteSheets = (p5) => {
    // Create placeholder sprites immediately as fallback
    createPlaceholderSprites(p5);
    
    // Load the zombie-walking sprite sheet for all instruments
    const zombieSprite = p5.loadImage('/images/zombie1_walking.png', () => {
      console.log('Zombie sprite sheet loaded successfully!');
      
      // 4x3 grid layout: 4 columns, 3 rows = 12 total frames
      const gridCols = 4;
      const gridRows = 3;
      const totalFrames = gridCols * gridRows; // 12 frames
      
      const frameWidth = zombieSprite.width / gridCols;
      const frameHeight = zombieSprite.height / gridRows;
      
      // Use the same sprite sheet for all three instruments
      kickSprite = zombieSprite;
      snareSprite = zombieSprite;
      hihatSprite = zombieSprite;
      
      // Initialize animation objects with the correct frame dimensions and grid layout
      kickAnim = new SpriteAnimation(kickSprite, totalFrames, frameWidth, frameHeight, gridCols, gridRows);
      snareAnim = new SpriteAnimation(snareSprite, totalFrames, frameWidth, frameHeight, gridCols, gridRows);
      hihatAnim = new SpriteAnimation(hihatSprite, totalFrames, frameWidth, frameHeight, gridCols, gridRows);
      
      // Create all zombies
      createZombies(p5, zombieSprite, frameWidth, frameHeight);
      
      console.log(`Sprite dimensions: ${frameWidth}x${frameHeight} pixels per frame`);
      console.log(`Grid layout: ${gridCols}x${gridRows} = ${totalFrames} total frames`);
    });
    
    // Fallback in case image fails to load
    zombieSprite.onerror = () => {
      console.error('Failed to load zombie sprite sheet');
      // Placeholder sprites are already created, so we're good
    };
  };

  const createPlaceholderSprites = (p5) => {
    // Create placeholder colored rectangles as fallback (4x3 grid)
    const gridCols = 4;
    const gridRows = 3;
    const totalFrames = gridCols * gridRows; // 12 frames
    const frameWidth = 64;
    const frameHeight = 64;
    
    kickSprite = p5.createGraphics(gridCols * frameWidth, gridRows * frameHeight);
    kickSprite.colorMode(p5.HSB, 360, 100, 100, 1);
    for (let i = 0; i < totalFrames; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = col * frameWidth;
      const y = row * frameHeight;
      
      kickSprite.fill(0, 80, 80, 0.8);
      kickSprite.noStroke();
      kickSprite.rect(x, y, frameWidth, frameHeight);
      kickSprite.fill(0, 60, 100);
      kickSprite.circle(x + frameWidth/2, y + frameHeight/2, 20 + i * 2);
    }

    snareSprite = p5.createGraphics(gridCols * frameWidth, gridRows * frameHeight);
    snareSprite.colorMode(p5.HSB, 360, 100, 100, 1);
    for (let i = 0; i < totalFrames; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = col * frameWidth;
      const y = row * frameHeight;
      
      snareSprite.fill(200, 80, 80, 0.8);
      snareSprite.noStroke();
      snareSprite.rect(x, y, frameWidth, frameHeight);
      snareSprite.fill(200, 60, 100);
      snareSprite.rect(x + 16, y + 16, 32, 32);
    }

    hihatSprite = p5.createGraphics(gridCols * frameWidth, gridRows * frameHeight);
    hihatSprite.colorMode(p5.HSB, 360, 100, 100, 1);
    for (let i = 0; i < totalFrames; i++) {
      const col = i % gridCols;
      const row = Math.floor(i / gridCols);
      const x = col * frameWidth;
      const y = row * frameHeight;
      
      hihatSprite.fill(60, 80, 80, 0.8);
      hihatSprite.noStroke();
      hihatSprite.rect(x, y, frameWidth, frameHeight);
      snareSprite.fill(60, 60, 100);
      snareSprite.triangle(
        x + frameWidth/2, y + 16,
        x + 16, y + 48,
        x + 48, y + 48
      );
    }

    kickAnim = new SpriteAnimation(kickSprite, totalFrames, frameWidth, frameHeight, gridCols, gridRows);
    snareAnim = new SpriteAnimation(snareSprite, totalFrames, frameWidth, frameHeight, gridCols, gridRows);
    hihatAnim = new SpriteAnimation(hihatSprite, totalFrames, frameWidth, frameHeight, gridCols, gridRows);
    
    // Create zombies with placeholder sprites
    createZombies(p5, kickSprite, frameWidth, frameHeight);
  };

  const createDrumSound = (type, frequency, duration, volume = 0.5) => {
    if (!audioState.audioContext) return;
    
    const oscillator = audioState.audioContext.createOscillator();
    const gainNode = audioState.audioContext.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioState.audioContext.currentTime);
    
    // Create envelope
    gainNode.gain.setValueAtTime(0, audioState.audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioState.audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioState.audioContext.currentTime + duration);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioState.audioContext.destination);
    
    oscillator.start();
    oscillator.stop(audioState.audioContext.currentTime + duration);
  };

  const playKick = () => {
    createDrumSound('sine', 60, 0.1);
    if (kickAnim) kickAnim.advanceFrame();
          // Make some random zombies dance
      for (let i = 0; i < 3; i++) {
        const randomZombie = zombiesRef.current[Math.floor(Math.random() * zombiesRef.current.length)];
        if (randomZombie) randomZombie.triggerDance();
      }
  };

  const playSnare = () => {
    createDrumSound('triangle', 100, 0.2);
    if (snareAnim) snareAnim.advanceFrame();
    // Make some random zombies dance
    for (let i = 0; i < 2; i++) {
      const randomZombie = zombiesRef.current[Math.floor(Math.random() * zombiesRef.current.length)];
      if (randomZombie) randomZombie.triggerDance();
    }
  };

  const playHihat = () => {
    createDrumSound('square', 200, 0.05, 0.1);
    if (hihatAnim) hihatAnim.advanceFrame();
    // Make some random zombies dance
    for (let i = 0; i < 1; i++) {
      const randomZombie = zombiesRef.current[Math.floor(Math.random() * zombiesRef.current.length)];
      if (randomZombie) randomZombie.triggerDance();
    }
  };

  const draw = (p5) => {
    time += 1/60; // Assuming 60fps
    
    // Update audio state from manager
    const currentState = soundManager.getState();
    if (currentState.isConnected !== audioState.isConnected || 
        currentState.hasError !== audioState.hasError) {
      setAudioState(prevState => ({
        ...prevState,
        isConnected: currentState.isConnected,
        hasError: currentState.hasError
      }));
    }
    
    // Fade background
    p5.fill(0, 0, 0, 0.1);
    p5.noStroke();
    p5.rect(0, 0, p5.width, p5.height);
    
    // Update dance floor
    danceFloorRef.current.forEach(tile => {
      tile.update(p5);
      tile.draw(p5, playing);
    });
    
    // Beat detection and playback
    if (playing && time - lastBeatTime >= beatInterval) {
      lastBeatTime = time;
      
      // Play drums based on pattern
      if (kickPattern[currentBeat]) {
        playKick();
      }
      
      if (snarePattern[currentBeat]) {
        playSnare();
      }
      
      if (hihatPattern[currentBeat]) {
        playHihat();
      }
      
      // Visual beat indicator
      p5.fill(0, 0, 100, 0.5);
      p5.noStroke();
      p5.circle(p5.width - 30, 30, 20);
      
      // Move to next beat
      currentBeat = (currentBeat + 1) % patternLength;
    }
    
    // Update animations
    if (kickAnim) kickAnim.update();
    if (snareAnim) snareAnim.update();
    if (hihatAnim) hihatAnim.update();
    
    // Update and draw zombies
    zombiesRef.current.forEach(zombie => {
      zombie.update();
      zombie.draw(p5);
    });
    
    // Draw instructions
    drawInstructions(p5);
  };

  const drawInstructions = (p5) => {
    p5.fill(0, 0, 100, 0.8);
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.textSize(14);
    p5.text('Click to start/stop zombie dance party', 20, 20);
    p5.text(`BPM: ${bpm}`, 20, 40);
    p5.text(`Zombies: ${zombiesRef.current.length}`, 20, 60);
  };

  const mousePressed = (p5) => {
    if (playing) {
      playing = false;
    } else {
      // Resume audio context if suspended
      if (audioState.audioContext && audioState.audioContext.state === 'suspended') {
        audioState.audioContext.resume();
      }
      
      playing = true;
      time = 0;
      lastBeatTime = 0;
      currentBeat = 0;
      
      // Reset animations
      if (kickAnim) kickAnim.reset();
      if (snareAnim) snareAnim.reset();
      if (hihatAnim) hihatAnim.reset();
    }
  };

  const windowResized = (p5) => {
    p5.resizeCanvas(800, 600);
    p5.background(0);
  };

  return (
    <Sketch 
      setup={setup} 
      draw={draw} 
      mousePressed={mousePressed}
      windowResized={windowResized}
    />
  );
};

export default FunWithSounds; 