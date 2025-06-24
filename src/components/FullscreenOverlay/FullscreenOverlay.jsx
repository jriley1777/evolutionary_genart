import React, { useState, useEffect } from 'react';

const FullscreenOverlay = ({ children, isFullscreen, onToggleFullscreen }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isFullscreen) {
      setIsVisible(true);
    } else {
      // Add a small delay to allow for smooth transition
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);

  if (!isVisible) return null;

  return (
    <div 
      className={`fullscreen-overlay ${isFullscreen ? 'active' : ''}`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        zIndex: 999999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'opacity 0.3s ease-in-out',
        opacity: isFullscreen ? 1 : 0,
      }}
    >
      {/* Close button */}
      <button
        onClick={onToggleFullscreen}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'rgba(255, 255, 255, 0.01)',
          width: '50px',
          height: '50px',
          color: 'white',
          fontSize: '24px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          zIndex: 1000000,
        }}
        onMouseEnter={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.2)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.target.style.background = 'rgba(255, 255, 255, 0.01)';
          e.target.style.borderColor = 'rgba(255, 255, 255, 0.01)';
        }}
      >
        ✕
      </button>

      {/* Fullscreen content */}
      <div 
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default FullscreenOverlay; 