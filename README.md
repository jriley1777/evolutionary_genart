# Evolutionary Generative Art

A React-based generative art application featuring interactive sketches and creative visual experiments.

## Features

- Interactive generative art sketches using p5.js
- React-based UI with modern styling
- Blog documentation for each piece
- Responsive design

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

### Netlify Deployment

This app is configured for easy deployment to Netlify:

1. **Connect your GitHub repository** to Netlify
2. **Build settings** are already configured in `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Deploy** - Netlify will automatically build and deploy your React app

### Alternative Deployment Options

- **Vercel**: Connect your GitHub repo and deploy with zero configuration
- **GitHub Pages**: Use the `gh-pages` package for static hosting
- **Firebase Hosting**: Deploy to Google's Firebase platform

## Project Structure

- `src/sketches/` - Generative art pieces
- `src/components/` - React components
- `src/pages/` - Page components
- `public/blog/` - Blog documentation

## Technologies

- React 19
- Vite
- p5.js (via react-p5)
- React Router
- React Markdown
