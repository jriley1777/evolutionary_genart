import React from 'react';

const SplitFlapGrid = ({ children }) => {
  return (
    <div style={{
      border: '2px solid #666',
      borderRadius: '16px',
      padding: '10px',
      background: '#222',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      maxWidth: '100%',
      maxHeight: '100%',
      boxSizing: 'border-box'
    }}>
      {children}
    </div>
  );
};

export default SplitFlapGrid; 