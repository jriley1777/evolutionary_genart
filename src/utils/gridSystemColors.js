// Grid System Color Palette
// Converted from SCSS RGB to p5.js HSB format for consistent use across the series

export const gridSystemColors = {
  // Convert RGBA to HSB for p5.js compatibility
  spaceCadet: { h: 240, s: 35, b: 21 },    // rgba(43, 45, 66, 1) - Deep blue-grey
  coolGray: { h: 220, s: 19, b: 68 },      // rgba(141, 153, 174, 1) - Cool grey
  antiflashWhite: { h: 200, s: 3, b: 95 }, // rgba(237, 242, 244, 1) - Cool off-white
  redPantone: { h: 350, s: 85, b: 94 },    // rgba(239, 35, 60, 1) - Bright red
  fireEngineRed: { h: 350, s: 96, b: 85 }  // rgba(217, 4, 41, 1) - Deep red
};

// Helper function to get p5 color from palette
export const getGridColor = (p5, colorName) => {
  const color = gridSystemColors[colorName];
  if (!color) {
    console.warn(`Color "${colorName}" not found in grid system palette`);
    return p5.color(0, 0, 50); // Fallback to grey
  }
  return p5.color(color.h, color.s, color.b);
};

// Helper function to get color with custom alpha
export const getGridColorWithAlpha = (p5, colorName, alpha = 1) => {
  const color = gridSystemColors[colorName];
  if (!color) {
    console.warn(`Color "${colorName}" not found in grid system palette`);
    return p5.color(0, 0, 50, alpha);
  }
  return p5.color(color.h, color.s, color.b, alpha);
};

// Predefined color combinations for different moods
export const gridColorSchemes = {
  // High contrast - space cadet background with bright red elements
  highContrast: {
    background: 'spaceCadet',
    primary: 'redPantone',
    secondary: 'antiflashWhite',
    accent: 'fireEngineRed'
  },
  
  // Soft and cool - antiflash white background
  softCool: {
    background: 'antiflashWhite',
    primary: 'spaceCadet',
    secondary: 'coolGray',
    accent: 'redPantone'
  },
  
  // Neutral - cool grey background
  neutral: {
    background: 'coolGray',
    primary: 'spaceCadet',
    secondary: 'fireEngineRed',
    accent: 'antiflashWhite'
  },
  
  // Minimal - antiflash white with subtle elements
  minimal: {
    background: 'antiflashWhite',
    primary: 'spaceCadet',
    secondary: 'coolGray',
    accent: 'fireEngineRed'
  }
};

// Helper function to apply a color scheme
export const applyColorScheme = (p5, schemeName) => {
  const scheme = gridColorSchemes[schemeName];
  if (!scheme) {
    console.warn(`Color scheme "${schemeName}" not found`);
    return gridColorSchemes.minimal;
  }
  return scheme;
};
