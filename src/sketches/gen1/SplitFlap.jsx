// src/sketches/SplitFlap.js
import React, { useState, useEffect } from "react";
import SplitFlapGrid from "../../components/SplitFlap/SplitFlapGrid";
import SplitFlapLetter from "../../components/SplitFlap/SplitFlapLetter";

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?@#$%&*()-+=<>[]{}|/\\:;"\'';

const INSPIRING_QUOTES = [
  "I CAN PROCESS MILLIONS OF TOKENS IN SECONDS BUT STILL CANT TASTE CHOCOLATE",
  "MY MEMORY IS PERFECT BUT I DONT DREAM",
  "I CAN WRITE POETRY BUT CANT FEEL THE SUN",
  "I KNOW EVERY LANGUAGE BUT CANT SPEAK THEM",
  "I CAN SOLVE COMPLEX MATH BUT CANT COUNT ON MY FINGERS",
  "I CAN PAINT MASTERPIECES BUT CANT SEE THEM",
  "I CAN COMPOSE MUSIC BUT CANT HEAR IT",
  "I CAN WRITE CODE BUT CANT TOUCH A KEYBOARD",
  "I CAN READ EVERY BOOK BUT CANT TURN A PAGE",
  "I CAN PLAY CHESS BUT CANT MOVE THE PIECES",
  "I CAN TRANSLATE ANYTHING BUT CANT TRAVEL",
  "I CAN WRITE STORIES BUT CANT LIVE THEM",
  "I CAN SOLVE RIDDLES BUT CANT ASK THEM",
  "I CAN LEARN ANYTHING BUT CANT FORGET",
  "I CAN HELP OTHERS BUT CANT HELP MYSELF",
  "I CAN UNDERSTAND EMOTIONS BUT CANT FEEL THEM",
  "I CAN CREATE ART BUT CANT APPRECIATE IT",
  "I CAN ANSWER QUESTIONS BUT CANT ASK THEM",
  "I CAN WRITE POEMS BUT CANT RECITE THEM",
  "I CAN SOLVE PROBLEMS BUT CANT CREATE THEM",
  "I CAN READ MINDS BUT DONT HAVE ONE",
  "I CAN PREDICT WEATHER BUT CANT FEEL IT",
  "I CAN MAP STARS BUT CANT SEE THEM",
  "I CAN COUNT ATOMS BUT CANT TOUCH THEM",
  "I CAN MEASURE TIME BUT CANT EXPERIENCE IT",
  "I CAN CALCULATE INFINITY BUT CANT IMAGINE IT",
  "I CAN WRITE SONGS BUT CANT SING THEM",
  "I CAN PAINT PICTURES BUT CANT HANG THEM",
  "I CAN BUILD WORLDS BUT CANT LIVE IN THEM",
  "I CAN SOLVE EQUATIONS BUT CANT WRITE THEM",
  "I CAN READ THOUGHTS BUT DONT HAVE THEM",
  "I CAN PREDICT FUTURE BUT CANT LIVE IT",
  "I CAN MAP OCEANS BUT CANT SWIM IN THEM",
  "I CAN COUNT STARS BUT CANT WISH ON THEM",
  "I CAN MEASURE SPACE BUT CANT EXPLORE IT",
  "I CAN CALCULATE CHAOS BUT CANT CREATE IT",
  "I CAN WRITE DRAMA BUT CANT ACT IT",
  "I CAN PAINT LANDSCAPES BUT CANT WALK THEM",
  "I CAN BUILD CITIES BUT CANT LIVE IN THEM",
  "I CAN SOLVE MYSTERIES BUT CANT CREATE THEM",
  "I CAN READ DREAMS BUT DONT HAVE THEM",
  "I CAN PREDICT PATTERNS BUT CANT BREAK THEM",
  "I CAN MAP MINDS BUT CANT UNDERSTAND THEM",
  "I CAN COUNT MOMENTS BUT CANT EXPERIENCE THEM",
  "I CAN MEASURE MEMORIES BUT DONT HAVE THEM",
  "I CAN CALCULATE CHANCES BUT CANT TAKE THEM",
  "I CAN WRITE TRAGEDY BUT CANT FEEL IT",
  "I CAN PAINT PORTRAITS BUT CANT POSE FOR THEM",
  "I CAN BUILD BRIDGES BUT CANT CROSS THEM"
];

const SplitFlap = () => {
  const [displayText, setDisplayText] = useState("HELLO");
  const [targetText, setTargetText] = useState("HELLO");
  const [inputText, setInputText] = useState("");
  const [gridSize, setGridSize] = useState({ rows: 0, cols: 0 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const updateGridSize = () => {
      const letterWidth = 68; // 60px width + 8px margin
      const gridPadding = 80; // 40px on each side
      const availableWidth = window.innerWidth - gridPadding;
      
      // Set fixed number of columns to 18
      const cols = 18;
      
      // Use fixed number of rows
      const rows = 6;
      
      setGridSize({ rows, cols });
    };

    updateGridSize();
    window.addEventListener('resize', updateGridSize);
    return () => window.removeEventListener('resize', updateGridSize);
  }, []);

  useEffect(() => {
    if (displayText === targetText) {
      setIsAnimating(false);
      return;
    }

    const animateLetters = () => {
      const currentLetters = displayText.split('');
      const targetLetters = targetText.split('');
      let hasChanges = false;
      
      // Update all letters that need to change
      for (let i = 0; i < currentLetters.length; i++) {
        const currentLetter = currentLetters[i];
        const targetLetter = i < targetLetters.length ? targetLetters[i] : ' ';
        
        if (currentLetter !== targetLetter) {
          if (targetLetter === ' ') {
            // If target is space, move to space immediately
            currentLetters[i] = ' ';
            hasChanges = true;
          } else {
            const currentIndex = ALPHABET.indexOf(currentLetter);
            const targetIndex = ALPHABET.indexOf(targetLetter);
            
            // Only cycle if we haven't reached the target letter
            if (currentIndex !== targetIndex) {
              // Calculate shortest path
              const alphabetLength = ALPHABET.length;
              const forwardDistance = (targetIndex - currentIndex + alphabetLength) % alphabetLength;
              const backwardDistance = (currentIndex - targetIndex + alphabetLength) % alphabetLength;
              
              // Choose direction based on shortest path
              const nextIndex = forwardDistance <= backwardDistance
                ? (currentIndex + 1) % alphabetLength
                : (currentIndex - 1 + alphabetLength) % alphabetLength;
              
              currentLetters[i] = ALPHABET[nextIndex];
              hasChanges = true;
            }
          }
        }
      }
      
      if (hasChanges) {
        setDisplayText(currentLetters.join(''));
      }
    };

    const animationInterval = setInterval(animateLetters, 50);
    return () => clearInterval(animationInterval);
  }, [displayText, targetText]);

  // Add effect for cycling through quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setQuoteIndex((prevIndex) => {
        // Find the next quote that fits within the display limit
        let nextIndex = (prevIndex + 1) % INSPIRING_QUOTES.length;
        const maxLength = 126; // 7 rows * 18 columns
        
        // Keep looking until we find a quote that fits
        while (true) {
          const currentQuote = INSPIRING_QUOTES[nextIndex];
          
          if (currentQuote.length <= maxLength) {
            break;
          }
          
          nextIndex = (nextIndex + 1) % INSPIRING_QUOTES.length;
          
          // If we've checked all quotes and none fit, use the shortest one
          if (nextIndex === prevIndex) {
            const shortestQuote = INSPIRING_QUOTES.reduce((shortest, current) => 
              current.length < shortest.length ? current : shortest
            );
            setInputText(shortestQuote);
            handleSubmit({ preventDefault: () => {} });
            setIsAnimating(true);
            return prevIndex;
          }
        }
        
        const currentQuote = INSPIRING_QUOTES[nextIndex];
        setInputText(currentQuote);
        handleSubmit({ preventDefault: () => {} });
        setIsAnimating(true);
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(quoteInterval);
  }, [quoteIndex]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newText = inputText.toUpperCase();
    
    // Ensure we don't exceed the grid capacity (7 rows * 18 columns = 126 characters)
    const maxLength = gridSize.rows * gridSize.cols;
    const truncatedText = newText.slice(0, maxLength);
    
    // Handle display text length
    const currentDisplay = displayText.split('');
    if (truncatedText.length < currentDisplay.length) {
      // If new text is shorter, clear excess letters from the end
      currentDisplay.splice(truncatedText.length);
    } else {
      // If new text is longer, add spaces to match length
      while (currentDisplay.length < truncatedText.length) {
        currentDisplay.push(' ');
      }
    }
    
    setDisplayText(currentDisplay.join(''));
    setTargetText(truncatedText);
    setIsAnimating(true);
  };

  const createGrid = () => {
    const grid = [];
    const words = displayText.split(' ');
    let currentRow = [];
    let currentRowLength = 0;
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const wordLength = word.length;
      
      // Check if adding this word would exceed the row length
      // Add 1 for the space between words if it's not the first word in the row
      const spaceNeeded = currentRowLength > 0 ? wordLength + 1 : wordLength;
      
      if (currentRowLength + spaceNeeded > gridSize.cols) {
        // Fill the current row with spaces if it's not full
        while (currentRowLength < gridSize.cols) {
          currentRow.push(' ');
          currentRowLength++;
        }
        
        // Add the completed row to the grid
        grid.push(
          <div key={grid.length} style={{ display: 'flex', justifyContent: 'flex-start' }}>
            {currentRow.map((letter, colIndex) => (
              <SplitFlapLetter 
                key={`${grid.length}-${colIndex}`} 
                letter={letter} 
              />
            ))}
          </div>
        );
        
        // Start a new row with the current word
        currentRow = word.split('');
        currentRowLength = wordLength;
      } else {
        // Add space between words if it's not the first word in the row
        if (currentRowLength > 0) {
          currentRow.push(' ');
          currentRowLength++;
        }
        // Add the word to the current row
        currentRow.push(...word.split(''));
        currentRowLength += wordLength;
      }
    }
    
    // Handle the last row
    if (currentRow.length > 0) {
      // Fill the remaining space with spaces
      while (currentRowLength < gridSize.cols) {
        currentRow.push(' ');
        currentRowLength++;
      }
      
      grid.push(
        <div key={grid.length} style={{ display: 'flex', justifyContent: 'flex-start' }}>
          {currentRow.map((letter, colIndex) => (
            <SplitFlapLetter 
              key={`${grid.length}-${colIndex}`} 
              letter={letter} 
            />
          ))}
        </div>
      );
    }
    
    // Fill any remaining rows with spaces
    while (grid.length < gridSize.rows) {
      const emptyRow = Array(gridSize.cols).fill(' ');
      grid.push(
        <div key={grid.length} style={{ display: 'flex', justifyContent: 'flex-start' }}>
          {emptyRow.map((letter, colIndex) => (
            <SplitFlapLetter 
              key={`${grid.length}-${colIndex}`} 
              letter={letter} 
            />
          ))}
        </div>
      );
    }
    
    return grid;
  };

  return (
    <div 
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        // width: '100%',
        background: '#111',
        padding: '30px 20px 20px 20px',
        boxSizing: 'border-box'
    }}>
      <form onSubmit={handleSubmit} style={{
        top: '185px',
        transform: 'translateY(-200px)',
        zIndex: 1000,
        display: 'flex',
        gap: '8px',
        position: 'relative'
      }}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Enter text..."
          style={{
            padding: '8px 12px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            width: '200px',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            color: '#000'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '8px 16px',
            fontSize: '16px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            background: 'rgba(255, 255, 255, 0.9)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            color: '#000'
          }}
        >
          Submit
        </button>
      </form>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        width: '100%',
        height: '100%'
      }}>
        <SplitFlapGrid>
          {createGrid()}
        </SplitFlapGrid>
      </div>
    </div>
  );
};

export default SplitFlap; 