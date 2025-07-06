import React from 'react';
import { PhotoModeManager, DEFAULT_PHOTO_MODE_CONFIG } from '../../utils/photoModeUtils';

/**
 * Higher-order component that adds photo mode functionality to any sketch
 * @param {React.Component} SketchComponent - The sketch component to wrap
 * @param {Object} photoModeConfig - Configuration for photo mode
 * @returns {React.Component} Wrapped component with photo mode
 */
export const withPhotoMode = (SketchComponent, photoModeConfig = {}) => {
  return function PhotoModeWrappedComponent(props) {
    const { photoMode = false, isFullscreen = false, ...otherProps } = props;
    
    // Create photo mode manager
    const photoModeManager = React.useMemo(() => {
      return new PhotoModeManager({
        ...DEFAULT_PHOTO_MODE_CONFIG,
        ...photoModeConfig
      });
    }, [photoModeConfig]);

    // Initialize photo mode when prop changes
    React.useEffect(() => {
      if (photoMode) {
        photoModeManager.initPhotoMode();
      } else {
        photoModeManager.exitPhotoMode();
      }
    }, [photoMode, photoModeManager]);

    // Create a wrapper component that handles photo mode
    const PhotoModeSketch = React.useCallback(({ p5, ...sketchProps }) => {
      // Store the original draw function
      const originalDraw = sketchProps.draw;
      
      // Create a wrapper draw function that handles photo mode
      const photoModeDraw = (p5) => {
        if (photoModeManager.isActive()) {
          if (photoModeManager.isCapturingActive()) {
            // Draw live preview while capturing
            originalDraw(p5);
            
            // Update photo mode
            photoModeManager.update(p5, originalDraw);
            
            // Show capture progress
            photoModeManager.drawCaptureProgress(p5);
          } else {
            // Show static grid
            photoModeManager.drawPhotoGrid(p5);
          }
        } else {
          // Normal mode - just draw the original sketch
          originalDraw(p5);
        }
      };

      // Return the sketch with modified draw function
      return (
        <SketchComponent
          {...sketchProps}
          draw={photoModeDraw}
          isFullscreen={isFullscreen}
          photoMode={photoMode}
        />
      );
    }, [photoModeManager, photoMode, isFullscreen]);

    return <PhotoModeSketch {...otherProps} />;
  };
};

/**
 * Hook for using photo mode in a sketch
 * @param {Object} config - Photo mode configuration
 * @param {boolean} photoMode - Whether photo mode is active
 * @returns {Object} Photo mode utilities
 */
export const usePhotoMode = (config = {}, photoMode = false) => {
  const photoModeManager = React.useMemo(() => {
    return new PhotoModeManager({
      ...DEFAULT_PHOTO_MODE_CONFIG,
      ...config
    });
  }, [config]);

  // Initialize photo mode when prop changes
  React.useEffect(() => {
    if (photoMode) {
      photoModeManager.initPhotoMode();
    } else {
      photoModeManager.exitPhotoMode();
    }
  }, [photoMode, photoModeManager]);

  return {
    photoModeManager,
    isPhotoMode: photoModeManager.isActive(),
    isCapturing: photoModeManager.isCapturingActive(),
    state: photoModeManager.getState()
  };
};

export default withPhotoMode; 