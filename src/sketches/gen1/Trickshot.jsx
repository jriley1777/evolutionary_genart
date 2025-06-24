import React from "react";
import Sketch from "react-p5";
import "../Sketch.css";

const Trickshot = ({ isFullscreen = false }) => {
  let ball;
  let isDragging = false;
  let startPoint = { x: 0, y: 0 };
  let endPoint = { x: 0, y: 0 };
  let velocity;
  let gravity = 0.5;
  let shotsRemaining = 10;
  let successfulShots = 0;
  let gameOver = false;
  let goal;
  let dragVector = { x: 0, y: 0 };
  let showMissMessage = false;
  let missMessage = "";
  let missMessageTimer = 0;
  let lastShotSuccessful = false;
  let missMeme = null;
  let missMemeLoaded = false;
  let gameOverGif = null;
  let gameOverGifLoaded = false;

  const missMessages = [
    "SKILL ISSUE",
    "GET GOOD",
    "L + RATIO",
    "TOUCH GRASS",
    "NOOB ALERT",
    "GIT GUD",
    "CRINGE",
    "BASED",
    "SHEEEESH",
    "BUSSIN",
    "NO CAP",
    "FR FR",
    "ON GOD",
    "LITERALLY",
    "VIBES",
    "SLAPS",
    "FIRE",
    "W",
    "L",
    "RATIO"
  ];

  class Goal {
    constructor(x, y, width, height, wallThickness) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.wallThickness = wallThickness;
      this.showCelebration = false;
      this.memeImage = null;
      this.memeLoaded = false;
    }

    preload(p5) {
      // Load the SpongeBob meme
      this.memeImage = p5.loadImage('https://media.giphy.com/media/3o7abKhOpu0NwenH3O/giphy.gif', () => {
        this.memeLoaded = true;
      });
    }

    draw(p5) {
      // Draw the cup
      p5.fill(200);
      p5.stroke(255);
      p5.strokeWeight(2);
      
      // Draw left wall
      p5.fill(255);
      p5.noStroke();
      p5.rect(this.x, this.y, this.wallThickness, this.height);
      
      // Draw bottom wall
      p5.rect(this.x, this.y + this.height - this.wallThickness, this.width, this.wallThickness);

      // Draw right wall
      p5.rect(this.x + this.width - this.wallThickness, this.y, this.wallThickness, this.height);

      // Draw celebration message and meme
      if (this.showCelebration) {
        // Draw semi-transparent overlay
        p5.fill(0, 0, 0, 150);
        p5.rect(0, 0, p5.width, p5.height);

        // Draw meme if loaded
        if (this.memeLoaded && this.memeImage) {
          const memeSize = 200;
          p5.image(
            this.memeImage,
            p5.width/2 - memeSize/2,
            p5.height/2 - memeSize/2 - 100,
            memeSize,
            memeSize
          );
        }

        // Draw text
        p5.push();
        p5.textAlign(p5.CENTER, p5.CENTER);
        p5.textSize(32);
        p5.fill(255, 215, 0); // Gold color
        p5.textStyle(p5.BOLD);
        p5.text("NICE SHOT FR FR", p5.width / 2, p5.height / 2 + 50);
        p5.textSize(24);
        p5.fill(255);
        p5.text("no cap, that was bussin", p5.width / 2, p5.height / 2 + 90);
        p5.textSize(20);
        p5.text("Press SPACE to continue", p5.width / 2, p5.height / 2 + 130);
        p5.pop();
      }
    }

    checkCollision(ball) {
      const isInsideCup = ball.x > this.x + this.wallThickness &&
                         ball.x < this.x + this.width - this.wallThickness &&
                         ball.y > this.y &&
                         ball.y < this.y + this.height - this.wallThickness;

      // Check top rim collisions first with continuous detection
      // Left rim
      if (ball.y - ball.radius < this.y + this.wallThickness &&
          ball.y + ball.radius > this.y &&
          ball.x > this.x - this.wallThickness &&
          ball.x < this.x + this.wallThickness * 2) {
        // Ensure ball is above the rim
        if (ball.y < this.y + this.wallThickness) {
          ball.y = this.y - ball.radius;
          // Dampen velocity while maintaining upward direction
          ball.velocity.y = -Math.abs(ball.velocity.y) * 0.7; // Dampen upward velocity
          ball.velocity.x *= 0.7; // Dampen horizontal velocity
          return true;
        }
      }

      // Right rim
      if (ball.y - ball.radius < this.y + this.wallThickness &&
          ball.y + ball.radius > this.y &&
          ball.x > this.x + this.width - this.wallThickness * 2 &&
          ball.x < this.x + this.width + this.wallThickness) {
        // Ensure ball is above the rim
        if (ball.y < this.y + this.wallThickness) {
          ball.y = this.y - ball.radius;
          // Dampen velocity while maintaining upward direction
          ball.velocity.y = -Math.abs(ball.velocity.y) * 0.7; // Dampen upward velocity
          ball.velocity.x *= 0.7; // Dampen horizontal velocity
          return true;
        }
      }

      // If ball is inside cup, only check inside wall collisions
      if (isInsideCup) {
        // Check inside left wall collision with continuous detection
        if (ball.x - ball.radius < this.x + this.wallThickness) {
          ball.x = this.x + this.wallThickness + ball.radius;
          ball.velocity.x *= -1; // Maintain full velocity in reverse
          return true;
        }

        // Check inside right wall collision with continuous detection
        if (ball.x + ball.radius > this.x + this.width - this.wallThickness) {
          ball.x = this.x + this.width - this.wallThickness - ball.radius;
          ball.velocity.x *= -1; // Maintain full velocity in reverse
          return true;
        }

        // Check inside bottom wall collision with continuous detection and improved logic
        const bottomWallY = this.y + this.height - this.wallThickness;
        const ballBottom = ball.y + ball.radius;
        const prevBallBottom = ball.prevY + ball.radius;
        
        // Check if ball crossed the bottom wall between frames
        if (ballBottom > bottomWallY && prevBallBottom <= bottomWallY) {
          ball.y = bottomWallY - ball.radius;
          // Strong dampening effect for bottom
          ball.velocity.y *= -0.3; // Much stronger dampening
          ball.velocity.x *= 0.5; // Reduce horizontal velocity
          
          // If velocity is very low, stop the ball and show celebration
          if (Math.abs(ball.velocity.y) < 0.5 && Math.abs(ball.velocity.x) < 0.5) {
            ball.velocity.y = 0;
            ball.velocity.x = 0;
            ball.isMoving = false;
            this.showCelebration = true;
            successfulShots++;
            return true;
          }
          return true;
        }
      } else {
        // If ball is outside cup, check outside wall collisions with continuous detection
        // Check outside left wall collision
        if (ball.x + ball.radius > this.x &&
            ball.x - ball.radius < this.x + this.wallThickness &&
            ball.y > this.y &&
            ball.y < this.y + this.height) {
          ball.x = this.x - ball.radius;
          ball.velocity.x *= -0.7; // Maintain full velocity in reverse
          return true;
        }

        // Check outside right wall collision
        if (ball.x - ball.radius < this.x + this.width &&
            ball.x + ball.radius > this.x + this.width - this.wallThickness &&
            ball.y > this.y &&
            ball.y < this.y + this.height) {
          ball.x = this.x + this.width + ball.radius;
          ball.velocity.x *= -0.7; // Maintain full velocity in reverse
          return true;
        }

        // Check outside bottom wall collision with continuous detection
        const bottomWallY = this.y + this.height;
        const ballBottom = ball.y + ball.radius;
        const prevBallBottom = ball.prevY + ball.radius;
        
        if (ballBottom > bottomWallY && prevBallBottom <= bottomWallY &&
            ball.x > this.x &&
            ball.x < this.x + this.width) {
          ball.y = bottomWallY + ball.radius;
          ball.velocity.y *= -0.7; // Maintain full velocity in reverse
          return true;
        }
      }

      return false;
    }
  }

  class Ball {
    constructor(p5) {
      this.radius = 20;
      this.x = this.radius + 50; // 50px from left edge
      this.y = p5.height - this.radius - 50; // 50px from bottom
      this.velocity = { x: 0, y: 0 };
      this.isMoving = false;
      this.prevX = this.x;
      this.prevY = this.y;
    }

    update(p5) {
      if (this.isMoving) {
        // Store previous position for collision detection
        this.prevX = this.x;
        this.prevY = this.y;
        
        // Apply gravity
        this.velocity.y += gravity;
        
        // Update position
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        // Check goal collision with continuous collision detection
        goal.checkCollision(this);

        // Basic boundary collision with continuous detection
        if (this.x + this.radius > p5.width) {
          this.x = p5.width - this.radius;
          this.velocity.x *= -0.7; // Bounce with energy loss
        }
        if (this.x - this.radius < 0) {
          this.x = this.radius;
          this.velocity.x *= -0.7;
        }
        if (this.y + this.radius > p5.height) {
          this.y = p5.height - this.radius;
          this.velocity.y *= -0.7;
        }
        // ball should be able to go above the ceiling
      }
    }

    draw(p5) {
      p5.fill(255);
      p5.stroke(255);
      p5.strokeWeight(2);
      p5.circle(this.x, this.y, this.radius * 2);
    }

    launch(velocity) {
      this.velocity = velocity;
      this.isMoving = true;
    }

    reset(p5) {
      this.x = this.radius + 50; // 50px from left edge
      this.y = p5.height - this.radius - 50; // 50px from bottom
      this.velocity = { x: 0, y: 0 };
      this.isMoving = false;
      this.prevX = this.x;
      this.prevY = this.y;
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
    
    ball = new Ball(p5);
    // Initial cup position in bottom half
    const cupX = p5.random(100, p5.width - 200);
    const cupY = p5.random(p5.height / 2, p5.height - 200);
    goal = new Goal(cupX, cupY, 150, 200, 15);
    goal.preload(p5);
    // Load miss meme
    missMeme = p5.loadImage('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExeWU4Mms5aGR3dXZxMDc2MzRsN2p4MnA2ZDhnYTg4YXE0MXdzcTgxcCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YaLyGY3YILpxfjdJFD/giphy.gif', () => {
      missMemeLoaded = true;
    });
    // Load game over gif
    gameOverGif = p5.loadImage('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExZWtsa2VyYjU5M3JvY290azU3ZHQ0Z3QxeTgwbnVrdGplbWYwanpiZCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/li9VMmjBDNWQcN1cih/giphy.gif', () => {
      gameOverGifLoaded = true;
    });
  };

  const draw = (p5) => {
    p5.background(0);

    // Draw the goal
    goal.draw(p5);

    // Draw the ball
    ball.update(p5);
    ball.draw(p5);

    // Draw the aiming line when dragging
    if (isDragging) {
      p5.stroke(255);
      p5.strokeWeight(2);
      p5.line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
      
      // Draw a circle at the start point
      p5.noFill();
      p5.circle(startPoint.x, startPoint.y, 10);
    }

    // Draw shots remaining and successful shots
    p5.fill(255);
    p5.noStroke();
    p5.textSize(24);
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.text(`Shots: ${shotsRemaining}`, 20, 20);
    p5.text(`Successful: ${successfulShots}`, 20, 50);

    // Draw miss message and meme
    if (showMissMessage) {
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(32);
      p5.fill(255, 0, 0); // Red color
      p5.text(missMessage, p5.width / 2, p5.height / 2 - 50);
      
      // Draw meme if loaded
      if (missMemeLoaded) {
        const memeSize = 200;
        p5.image(missMeme, 
          p5.width / 2 - memeSize / 2, 
          p5.height / 2 + 20, 
          memeSize, 
          memeSize
        );
      }
      
      missMessageTimer--;
      if (missMessageTimer <= 0) {
        showMissMessage = false;
      }
    }

    // Draw game over message and gif
    if (gameOver) {
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textSize(48);
      p5.fill(255);
      p5.text("Game Over!", p5.width / 2, p5.height / 2 - 100);
      p5.textSize(24);
      p5.text(`Final Score: ${successfulShots}`, p5.width / 2, p5.height / 2 - 40);
      p5.text("Press 'R' to restart", p5.width / 2, p5.height / 2 + 100);
      
      // Draw game over gif if loaded
      if (gameOverGifLoaded) {
        const gifSize = 300;
        p5.image(gameOverGif,
          p5.width / 2 - gifSize / 2,
          p5.height / 2 - gifSize / 2,
          gifSize,
          gifSize
        );
      }
    }
  };

  const mousePressed = (p5) => {
    if (!ball.isMoving && !gameOver && shotsRemaining > 0) {
      isDragging = true;
      startPoint = { x: p5.mouseX, y: p5.mouseY };
      endPoint = { x: p5.mouseX, y: p5.mouseY };
    }
  };

  const mouseDragged = (p5) => {
    if (isDragging) {
      endPoint = { x: p5.mouseX, y: p5.mouseY };
    }
  };

  const mouseReleased = (p5) => {
    if (isDragging && !gameOver && shotsRemaining > 0) {
      isDragging = false;
      
      // Calculate velocity based on drag distance and direction
      const dx = startPoint.x - endPoint.x;
      const dy = startPoint.y - endPoint.y;
      const distance = p5.sqrt(dx * dx + dy * dy);
      const maxDistance = 300; // Reduced from 200 to make it more sensitive
      const power = p5.map(p5.min(distance, maxDistance), 0, maxDistance, 0, 30);
      
      // Calculate angle and set velocity
      const angle = p5.atan2(dy, dx);
      const velocity = {
        x: p5.cos(angle) * power,
        y: p5.sin(angle) * power
      };
      
      ball.launch(velocity);
      shotsRemaining--;
      
      if (shotsRemaining === 0) {
        gameOver = true;
      }
    }
  };

  const resetCupPosition = (p5) => {
    // Position cup in bottom half of canvas
    const cupX = p5.random(100, p5.width - 200);
    const cupY = p5.random(p5.height/2, p5.height - 200);
    goal.x = cupX;
    goal.y = cupY;
  };

  const keyPressed = (p5) => {
    if (p5.key === 'r' || p5.key === 'R') {
      // Reset game state
      ball = new Ball(p5);
      shotsRemaining = 10;
      successfulShots = 0;
      gameOver = false;
      goal.showCelebration = false;
      showMissMessage = false;
      lastShotSuccessful = false;
      resetCupPosition(p5);
    } else if (p5.key === ' ') {
      if (ball.isMoving) {
        // Only show miss message if the last shot wasn't successful
        if (!lastShotSuccessful) {
          missMessage = missMessages[Math.floor(Math.random() * missMessages.length)];
          showMissMessage = true;
          missMessageTimer = 60; // Show for 1 second at 60fps
        }
        ball = new Ball(p5);
        ball.isMoving = false;
        goal.showCelebration = false;
        lastShotSuccessful = false;
        resetCupPosition(p5);
      } else if (goal.showCelebration) {
        // Reset after successful shot
        ball = new Ball(p5);
        ball.isMoving = false;
        goal.showCelebration = false;
        lastShotSuccessful = false;
        resetCupPosition(p5);
      }
    }
  };

  return (
    <Sketch
      setup={setup}
      draw={draw}
      mousePressed={mousePressed}
      mouseDragged={mouseDragged}
      mouseReleased={mouseReleased}
      keyPressed={keyPressed}
    />
  );
};

export default Trickshot; 