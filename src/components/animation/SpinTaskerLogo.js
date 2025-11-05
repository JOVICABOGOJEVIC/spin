import React from 'react';
import './spinTaskerLogo.css';

const SpinTaskerLogo = ({ size = 'md', className = '', style = {} }) => {
  // Size variations
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl'
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40,
    xl: 52
  };

  const fontSize = sizeClasses[size] || sizeClasses.md;
  const iconSize = iconSizes[size] || iconSizes.md;

  return (
    <span className={`spin-tasker-logo ${fontSize} font-bold ${className}`} style={style}>
      SpinT
      <span className="spin-icon-inline" style={{ width: iconSize, height: iconSize }}>
        <svg 
          viewBox="0 0 24 24" 
          fill="none"
          stroke="currentColor" 
          strokeWidth="2.5"
          strokeLinecap="round"
          className="spin-icon-svg"
        >
          {/* Puževa kućica - spirala gledana odozgo, počinje od centra */}
          {/* Spiralna putanja koja se uvija od centra prema spolja */}
          <path d="M 12 12
                   A 0.5 0.5 0 0 1 12.35 11.65
                   A 1 1 0 0 1 13 10.5
                   A 1.5 1.5 0 0 1 14.5 9.5
                   A 2 2 0 0 1 16.5 9
                   A 2.5 2.5 0 0 1 18.5 10
                   A 3 3 0 0 1 20 12
                   A 3.5 3.5 0 0 1 20.5 14.5
                   A 4 4 0 0 1 20 17.5
                   A 4.5 4.5 0 0 1 18.5 19.5
                   A 5 5 0 0 1 16 20.5
                   A 5.5 5.5 0 0 1 12 21
                   A 5.5 5.5 0 0 1 8 20.5
                   A 5 5 0 0 1 5.5 19.5
                   A 4.5 4.5 0 0 1 4 17.5
                   A 4 4 0 0 1 3.5 14.5
                   A 3.5 3.5 0 0 1 4 12
                   A 3 3 0 0 1 5.5 10
                   A 2.5 2.5 0 0 1 7.5 9
                   A 2 2 0 0 1 9.5 9.5
                   A 1.5 1.5 0 0 1 11 10.5
                   A 1 1 0 0 1 11.65 11.65
                   A 0.5 0.5 0 0 1 12 12" 
                fill="currentColor" 
                opacity="0.85" />
        </svg>
      </span>
      sker
    </span>
  );
};

export default SpinTaskerLogo;

