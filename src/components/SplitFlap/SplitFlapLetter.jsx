import React from 'react';

const SplitFlapLetter = ({ letter }) => {
  return (
    <div style={{
      display: 'inline-block',
      width: '60px',
      height: '80px',
      margin: '0 4px',
      border: '2px solid #666',
      borderRadius: '8px',
      boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
      overflow: 'hidden',
      background: '#333',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90%',
        background: '#222',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '58px',
        fontFamily: 'monospace',
        textShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)',
        lineHeight: '1',
        paddingTop: '2px'
      }}>
        {letter}
      </div>
    </div>
  );
};

export default SplitFlapLetter; 