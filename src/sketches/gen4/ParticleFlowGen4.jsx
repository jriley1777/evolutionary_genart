import React from "react";
import { ReactP5Wrapper } from "@p5-wrapper/react";
import "../Sketch.css";

const ParticleFlowGen4 = ({ isFullscreen = false }) => {
  let flowField = [];
  let mouseX = 0;
  let mouseY = 0;
  let time = 0;
  let wordChains = [];
  let currentText = "PARTICLE FLOW GENERATIVE ART";
  let wordIndex = 0;
  let fontLoaded = false;
  let fontPreloaded = false;
  let letterPool = [];
  let maxPoolSize = 1000;

  // Preload font to avoid repeated API calls
  const preloadFont = () => {
    if (fontPreloaded) return;
    
    // Create a hidden canvas to preload the font
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = '40px "Bitcount Grid Double"';
    ctx.fillText('A', 0, 0);
    fontPreloaded = true;
  };

  // Object pooling for better performance
  const getLetterFromPool = (p5, char, x, y) => {
    if (letterPool.length > 0) {
      const letter = letterPool.pop();
      letter.reset(p5, char, x, y);
      return letter;
    }
    return new LetterParticle(p5, char, x, y);
  };

  const returnLetterToPool = (letter) => {
    if (letterPool.length < maxPoolSize) {
      letterPool.push(letter);
    }
  };

  class LetterParticle {
    constructor(p5, char, x, y) {
      this.char = char;
      this.pos = p5.createVector(x, y);
      this.vel = p5.createVector(0, 0);
      this.acc = p5.createVector(0, 0);
      this.maxSpeed = p5.random(1, 3);
      this.life = 1.0;
      this.age = 0;
      this.maxAge = p5.random(400, 600);
      this.evolutionStage = 0;
      this.temperature = p5.random(0, 1);
      this.size = p5.random(14, 20);
      this.originalSize = this.size;
      this.rotation = p5.random(p5.TWO_PI);
      this.rotationSpeed = p5.random(-0.05, 0.05);
      this.opacity = 1.0;
      this.next = null; // Link to next letter
      this.prev = null; // Link to previous letter
      this.chainIndex = 0; // Position in the word chain
      this.cachedGraphics = null; // Cache for rendered text
    }

    reset(p5, char, x, y) {
      this.char = char;
      this.pos.set(x, y);
      this.vel.set(0, 0);
      this.acc.set(0, 0);
      this.maxSpeed = p5.random(1, 3);
      this.life = 1.0;
      this.age = 0;
      this.maxAge = p5.random(400, 600);
      this.evolutionStage = 0;
      this.temperature = p5.random(0, 1);
      this.size = p5.random(14, 20);
      this.originalSize = this.size;
      this.rotation = p5.random(p5.TWO_PI);
      this.rotationSpeed = p5.random(-0.05, 0.05);
      this.opacity = 1.0;
      this.next = null;
      this.prev = null;
      this.chainIndex = 0;
      this.cachedGraphics = null;
    }

    update(p5) {
      this.age++;
      this.life = 1.0 - (this.age / this.maxAge);
      
      // Evolution stages
      if (this.age < this.maxAge * 0.3) {
        this.evolutionStage = 0; // Young - growing
        this.size = this.originalSize + (this.age / (this.maxAge * 0.3)) * 4;
      } else if (this.age < this.maxAge * 0.7) {
        this.evolutionStage = 1; // Mature - stable
        this.size = this.originalSize + 4;
      } else {
        this.evolutionStage = 2; // Old - shrinking
        this.size = this.originalSize + 4 - ((this.age - this.maxAge * 0.7) / (this.maxAge * 0.3)) * 4;
      }

      // Update temperature based on velocity
      const speed = this.vel.mag();
      this.temperature = p5.constrain(
        this.temperature + (speed * 0.01),
        0, 1
      );

      // Apply flow field forces
      this.applyFlowField(p5);

      // Apply chain forces (linked list behavior)
      this.applyChainForces(p5);

      // Update physics
      this.vel.add(this.acc);
      this.vel.limit(this.maxSpeed);
      this.pos.add(this.vel);
      this.acc.mult(0);

      // Update rotation
      this.rotation += this.rotationSpeed;

      // Update opacity based on life
      this.opacity = this.life;

      // Wrap around edges with proper boundary handling
      if (this.pos.x > p5.width + 50) {
        this.pos.x = -50;
      }
      if (this.pos.x < -50) {
        this.pos.x = p5.width + 50;
      }
      if (this.pos.y > p5.height + 50) {
        this.pos.y = -50;
      }
      if (this.pos.y < -50) {
        this.pos.y = p5.height + 50;
      }
    }

    applyFlowField(p5) {
      const x = p5.floor(this.pos.x / 90); // Match 90px font size
      const y = p5.floor(this.pos.y / 90);
      const index = x + y * p5.floor(p5.width / 90);
      
      if (index >= 0 && index < flowField.length) {
        const force = flowField[index];
        this.applyForce(force);
      }
    }

    applyChainForces(p5) {
      // Follow the previous letter in the chain
      if (this.prev) {
        const followForce = p5.createVector(
          this.prev.pos.x - this.pos.x,
          this.prev.pos.y - this.pos.y
        );
        const distance = followForce.mag();
        
        // Maintain tighter chain spacing
        const desiredDistance = 60 + this.chainIndex * 5; // Adjusted for 90px font
        if (distance > desiredDistance) {
          followForce.normalize();
          followForce.mult(0.15);
          this.applyForce(followForce);
        }
      }

      // Lead the next letter in the chain
      if (this.next) {
        const leadForce = p5.createVector(
          this.pos.x - this.next.pos.x,
          this.pos.y - this.next.pos.y
        );
        const distance = leadForce.mag();
        
        // Maintain tighter chain spacing
        const desiredDistance = 60 + this.next.chainIndex * 5; // Adjusted for 90px font
        if (distance > desiredDistance) {
          leadForce.normalize();
          leadForce.mult(0.1);
          this.next.applyForce(leadForce);
        }
      }
    }

    applyForce(force) {
      this.acc.add(force);
    }

    show(p5) {
      // Only render if opacity is significant
      if (this.opacity < 0.1) return;
      
      p5.push();
      p5.translate(this.pos.x, this.pos.y);
      p5.rotate(this.rotation);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(90);

      p5.fill(0, 0, 0, this.opacity * 255);
      p5.stroke(255);
      p5.strokeWeight(4);
      p5.text(this.char, 0, 0);
      p5.pop();
    }

    isDead() {
      return this.life <= 0;
    }
  }

  class WordChain {
    constructor(p5, word, startX, startY) {
      this.word = word;
      this.letters = [];
      this.head = null;
      this.tail = null;
      this.isDead = false;
      
      // Create linked list of letters
      for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const x = startX + i * 80; // Increased spacing for 90px font
        const y = startY + p5.random(-10, 10);
        
        const letter = getLetterFromPool(p5, char, x, y);
        letter.chainIndex = i;
        
        // Link to previous letter
        if (this.tail) {
          letter.prev = this.tail;
          this.tail.next = letter;
        } else {
          this.head = letter;
        }
        
        this.tail = letter;
        this.letters.push(letter);
      }
    }

    update(p5) {
      // Update all letters in the chain
      for (let i = this.letters.length - 1; i >= 0; i--) {
        this.letters[i].update(p5);
        
        // Remove dead letters
        if (this.letters[i].isDead()) {
          const removedLetter = this.letters.splice(i, 1)[0];
          
          // Update links properly
          if (removedLetter.prev && removedLetter.next) {
            // Letter was in the middle
            removedLetter.prev.next = removedLetter.next;
            removedLetter.next.prev = removedLetter.prev;
          } else if (removedLetter.prev) {
            // Letter was at the end
            removedLetter.prev.next = null;
            this.tail = removedLetter.prev;
          } else if (removedLetter.next) {
            // Letter was at the beginning
            removedLetter.next.prev = null;
            this.head = removedLetter.next;
          } else {
            // Letter was the only one
            this.head = null;
            this.tail = null;
          }
          
          // Update chain indices for remaining letters
          for (let j = i; j < this.letters.length; j++) {
            this.letters[j].chainIndex = j;
          }
        }
      }
      
      // Mark chain as dead if no letters remain
      if (this.letters.length === 0) {
        this.isDead = true;
      }
    }

    show(p5) {
      // Show all letters in the chain
      this.letters.forEach(letter => letter.show(p5));
    }
  }

  const sketch = (p5) => {
    p5.setup = () => {
      const canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
      
      if (isFullscreen) {
        canvas.class('canvas-container fullscreen');
        canvas.elt.classList.add('fullscreen');
      } else {
        canvas.class('canvas-container');
      }
      
      p5.colorMode(p5.RGB, 255, 255, 255, 1);
      p5.background(255);
      p5.textFont('Bitcount Grid Double');
      
      // Preload font for better performance
      preloadFont();
      
      // Initialize word chains
      initializeWordChains(p5);
    };

    const initializeWordChains = (p5) => {
      wordChains = [];
      const words = currentText.split(' ');
      
      // Create initial word chains
      for (let i = 0; i < 5; i++) {
        const word = words[i % words.length];
        const startX = p5.random(p5.width);
        const startY = p5.random(p5.height);
        
        const chain = new WordChain(p5, word, startX, startY);
        wordChains.push(chain);
      }
    };

    p5.draw = () => {
      // Fade background
      p5.fill(235, 235, 235, 0.2);
      p5.noStroke();
      p5.rect(0, 0, p5.width, p5.height);

      // Update flow field less frequently for better performance
      if (p5.frameCount % 3 === 0) {
        const cols = p5.floor(p5.width / 90); // Match 90px font size
        const rows = p5.floor(p5.height / 90);
        flowField = new Array(cols * rows);

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const index = x + y * cols;
            
            // Simplified noise calculation for better performance
            const angle = p5.noise(x * 0.05, y * 0.05, time * 0.005) * p5.TWO_PI;
            
            // Add mouse influence
            const mouseDist = p5.dist(x * 90, y * 90, mouseX, mouseY);
            const mouseInfluence = p5.map(mouseDist, 0, 200, p5.PI, 0, true);
            
            const finalAngle = angle + mouseInfluence;
            
            // Create force vector
            const force = p5.createVector(p5.cos(finalAngle), p5.sin(finalAngle));
            force.mult(0.4);
            flowField[index] = force;
          }
        }
      }

      // Update and show word chains
      for (let i = wordChains.length - 1; i >= 0; i--) {
        wordChains[i].update(p5);
        wordChains[i].show(p5);
        
        // Remove dead chains and add new ones
        if (wordChains[i].isDead) {
          wordChains.splice(i, 1);
          addNewWordChain(p5);
        }
      }

      time += 0.02;
    };

    const addNewWordChain = (p5) => {
      const words = currentText.split(' ');
      const word = words[wordIndex % words.length];
      const startX = p5.random(p5.width);
      const startY = p5.random(p5.height);
      
      const chain = new WordChain(p5, word, startX, startY);
      wordChains.push(chain);
      wordIndex++;
    };

    p5.mouseMoved = () => {
      mouseX = p5.mouseX;
      mouseY = p5.mouseY;
    };

    p5.windowResized = () => {
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight);
    }
  };

  return <ReactP5Wrapper sketch={sketch} />;
};

export default ParticleFlowGen4; 