import React, { useState, useEffect } from 'react';
import FullscreenOverlay from '../FullscreenOverlay/FullscreenOverlay';
import { getFullscreenState, addFullscreenToUrl, removeFullscreenFromUrl } from '../../utils/urlUtils';

const SketchWithFullscreen = ({ 
  SketchComponent, 
  title, 
  description, 
  availableGenerations = [], 
  currentGeneration = '', 
  onGenerationChange = null,
  project = null,
  forceFullscreen = null
}) => {
  const [isFullscreen, setIsFullscreen] = useState(getFullscreenState);
  const [isPhotoMode, setIsPhotoMode] = useState(false);
  const [sketchKey, setSketchKey] = useState(0);

  // Helper function to enter browser fullscreen
  const enterBrowserFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (document.documentElement.webkitRequestFullscreen) {
        await document.documentElement.webkitRequestFullscreen();
      } else if (document.documentElement.msRequestFullscreen) {
        await document.documentElement.msRequestFullscreen();
      }
    } catch (error) {
      console.log('Fullscreen request failed:', error);
    }
  };

  // Helper function to exit browser fullscreen
  const exitBrowserFullscreen = async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        await document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        await document.msExitFullscreen();
      }
    } catch (error) {
      console.log('Exit fullscreen failed:', error);
    }
  };

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
        exitBrowserFullscreen();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isFullscreen]);

  // Handle browser fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isBrowserFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
      );
      
      // If browser fullscreen was exited externally, update our state
      if (!isBrowserFullscreen && isFullscreen) {
        setIsFullscreen(false);
        setSketchKey(prev => prev + 1);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  // Helper function to check if browser is in fullscreen
  const isBrowserInFullscreen = () => {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  };

  // Handle forceFullscreen prop changes
  useEffect(() => {
    if (forceFullscreen !== null && forceFullscreen !== isFullscreen) {
      if (forceFullscreen) {
        // If we're forcing fullscreen and browser is already in fullscreen, just update state
        if (isBrowserInFullscreen()) {
          setIsFullscreen(true);
        } else {
          enterFullscreenMode();
        }
      } else {
        exitFullscreenMode();
      }
    }
  }, [forceFullscreen]);

  // Method to programmatically enter fullscreen
  const enterFullscreenMode = async () => {
    setIsFullscreen(true);
    
    // Only enter browser fullscreen if it's not already active
    if (!isBrowserInFullscreen()) {
      await enterBrowserFullscreen();
    }
  };

  // Method to programmatically exit fullscreen
  const exitFullscreenMode = async () => {
    setSketchKey(prev => prev + 1);
    setIsFullscreen(false);
    
    // Check if browser fullscreen is active and exit it
    if (isBrowserInFullscreen()) {
      await exitBrowserFullscreen();
    }
  };

  const toggleFullscreen = async () => {
    if (isFullscreen) {
      await exitFullscreenMode();
    } else {
      await enterFullscreenMode();
    }
  };

  const togglePhotoMode = () => {
    if (isFullscreen) {
      setSketchKey(prev => prev + 1);
      setIsPhotoMode(!isPhotoMode);
    } else {
      setSketchKey(prev => prev + 1);
      setIsPhotoMode(!isPhotoMode);
    }
  };

  // Create a unique key that changes when fullscreen mode changes
  const uniqueSketchKey = `${project ? `${project.type}-${project.slug}` : 'default'}-${isFullscreen ? 'fullscreen' : 'normal'}-${sketchKey}`;

  return (
    <>
      {/* Regular view with fullscreen and photo mode buttons */}
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <div key={uniqueSketchKey}>
          <SketchComponent isFullscreen={isFullscreen} photoMode={isPhotoMode} />
        </div>
        
        {/* Photo Mode button */}
        {project && project.showPhotoMode === true && (
          <button
            onClick={togglePhotoMode}
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '140px',
              background: isPhotoMode ? 'rgba(255, 255, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)',
              border: '2px solid rgba(255, 255, 255, 0.5)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: isPhotoMode ? 'black' : 'white',
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
              e.target.style.background = isPhotoMode ? 'rgba(255, 255, 0, 0.9)' : 'rgba(0, 0, 0, 0.9)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.8)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = isPhotoMode ? 'rgba(255, 255, 0, 0.7)' : 'rgba(0, 0, 0, 0.7)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
          >
            <span style={{ fontSize: '16px' }}>📸</span>
            {isPhotoMode ? 'Photo Mode ON' : 'Photo Mode'}
          </button>
        )}
        
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
        availableGenerations={availableGenerations}
        currentGeneration={currentGeneration}
        onGenerationChange={(generationId) => onGenerationChange(generationId, true)}
        photoMode={isPhotoMode}
        onTogglePhotoMode={togglePhotoMode}
        showPhotoMode={project && project.showPhotoMode === true}
      >
        <div style={{ 
          width: '100%', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/* Title and generation info in fullscreen */}
          {project && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              color: 'white',
              fontFamily: 'Press Start 2P, monospace',
              zIndex: 1000001,
            }}>
              <div style={{ fontSize: '16px', marginBottom: '4px' }}>
                {project.title}
              </div>
              {project.type && (
                <div style={{ 
                  fontSize: '12px', 
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
                }}>
                  Generation: {project.type}
                </div>
              )}
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
            <div key={uniqueSketchKey}>
              <SketchComponent isFullscreen={isFullscreen} photoMode={isPhotoMode} />
            </div>
          </div>
        </div>
      </FullscreenOverlay>
    </>
  );
};

export default SketchWithFullscreen; 