import React, { useState, useEffect } from 'react';
import FullscreenOverlay from '../FullscreenOverlay/FullscreenOverlay';
import { getFullscreenState, addFullscreenToUrl, removeFullscreenFromUrl } from '../../utils/urlUtils';

const SketchWithFullscreen = ({ SketchComponent, title, description }) => {
  const [isFullscreen, setIsFullscreen] = useState(getFullscreenState);
  const [sketchKey, setSketchKey] = useState(0);

  // Update URL when fullscreen state changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const newUrl = isFullscreen ? addFullscreenToUrl() : removeFullscreenFromUrl();
      window.history.replaceState({}, '', newUrl);
    }
  }, [isFullscreen]);

  // Handle browser back button when in fullscreen
  useEffect(() => {
    const handlePopState = () => {
      if (isFullscreen) {
        // If we're in fullscreen and the back button is pressed, exit fullscreen
        setSketchKey(prev => prev + 1);
        setIsFullscreen(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isFullscreen]);

  const toggleFullscreen = () => {
    if (isFullscreen) {
      // When minimizing from fullscreen, force a reload
      setSketchKey(prev => prev + 1);
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      {/* Regular view with fullscreen button */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div key={sketchKey}>
          <SketchComponent isFullscreen={isFullscreen} />
        </div>
        
        {/* Fullscreen button */}
        <button
          onClick={toggleFullscreen}
          style={{
            position: 'absolute',
            bottom: '40px',
            right: '10px',
            background: 'rgba(0, 0, 0, 0.7)',
            border: '2px solid rgba(255, 255, 255, 0.5)',
            borderRadius: '8px',
            padding: '8px 12px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            zIndex: 1000,
            fontFamily: 'Press Start 2P, monospace',
          }}
          onMouseEnter={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.9)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = 'rgba(0, 0, 0, 0.7)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
          }}
        >
          <span style={{ fontSize: '16px' }}>⛶</span>
          Fullscreen
        </button>
      </div>

      {/* Fullscreen overlay */}
      <FullscreenOverlay 
        isFullscreen={isFullscreen} 
        onToggleFullscreen={toggleFullscreen}
      >
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Title in fullscreen */}
          {title && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              color: 'white',
              fontFamily: 'Press Start 2P, monospace',
              fontSize: '16px',
              zIndex: 1000001,
            }}>
              {title}
            </div>
          )}
          
          {/* Sketch in fullscreen */}
          <div style={{ 
            width: '100%', 
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div key={`fullscreen-${sketchKey}`}>
              <SketchComponent isFullscreen={isFullscreen} />
            </div>
          </div>
        </div>
      </FullscreenOverlay>
    </>
  );
};

export default SketchWithFullscreen; 