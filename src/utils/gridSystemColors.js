// Grid System Color Palette
// Converted from SCSS RGB to p5.js HSB format for consistent use across the series

export const gridSystemColors = {
  // Convert RGBA to HSB for p5.js compatibility
  black: { h: 0, s: 0, b: 5 },      // rgba(7, 2, 13, 1) - Very dark blue-black
  aero: { h: 200, s: 58, b: 87 },   // rgba(93, 183, 222, 1) - Bright sky blue
  alabaster: { h: 40, s: 9, b: 95 }, // rgba(241, 233, 219, 1) - Warm off-white
  khaki: { h: 40, s: 15, b: 64 },   // rgba(163, 155, 139, 1) - Warm grey
  dimGray: { h: 40, s: 19, b: 44 }  // rgba(113, 106, 92, 1) - Dark warm grey
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
  // High contrast - black background with bright elements
  highContrast: {
    background: 'black',
    primary: 'aero',
    secondary: 'alabaster',
    accent: 'khaki'
  },
  
  // Soft and warm - alabaster background
  softWarm: {
    background: 'alabaster',
    primary: 'dimGray',
    secondary: 'khaki',
    accent: 'aero'
  },
  
  // Neutral - khaki background
  neutral: {
    background: 'khaki',
    primary: 'black',
    secondary: 'dimGray',
    accent: 'aero'
  },
  
  // Minimal - alabaster with subtle elements
  minimal: {
    background: 'alabaster',
    primary: 'dimGray',
    secondary: 'khaki',
    accent: 'black'
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
