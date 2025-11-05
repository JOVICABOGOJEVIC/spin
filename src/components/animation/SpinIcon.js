import React from 'react';
import './spinIcon.css';

const SpinIcon = ({ size = 28, className = '', style = {} }) => {
  return (
    <span 
      className={`spin-icon-inline ${className}`} 
      style={{ width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', ...style }}
    >
      <svg 
        viewBox="0 0 24 24" 
        fill="none"
        stroke="currentColor" 
        strokeWidth="2.2"
        strokeLinecap="round"
        className="spin-icon-svg"
        style={{ width: '100%', height: '100%' }}
      >
        {/* Prava spirala - puževa kućica gledana odozgo */}
        {/* Generišem tačke spirale koristeći polarnu formulu: r = a * e^(b*θ) */}
        <path d="M 12 12
                 L 12.2 11.8
                 L 12.5 11.3
                 L 12.9 10.6
                 L 13.4 9.8
                 L 14.1 8.9
                 L 14.9 7.9
                 L 15.9 6.8
                 L 17.1 5.6
                 L 18.4 4.4
                 L 19.8 3.2
                 L 21.3 2.1
                 L 22.8 1.2
                 L 24 0.5
                 Q 23 2 21.5 3.5
                 Q 19.8 5 17.8 6.5
                 Q 15.5 8 13 9.2
                 Q 10.2 10 7.5 10.3
                 Q 4.5 10.3 2 9.8
                 Q 0 9 0.5 7
                 Q 1.2 4.8 2.5 3
                 Q 4.2 1.5 6.5 0.8
                 Q 9.2 0.5 12 1
                 Q 14.8 1.8 17.2 3.2
                 Q 19.2 4.8 20.5 6.8
                 Q 21.2 8.8 21 11
                 Q 20.5 13.2 19.2 15
                 Q 17.5 16.5 15.2 17.2
                 Q 12.5 17.5 10 17
                 Q 7.5 16.2 5.5 14.8
                 Q 3.8 13.2 2.8 11.2
                 Q 2.2 9 2.5 6.8
                 Q 3.2 4.8 4.5 3.2
                 Q 6.2 2 8.5 1.5
                 Q 11 1.2 13.5 1.8
                 Q 15.8 2.8 17.5 4.5
                 Q 18.8 6.5 19.2 8.8
                 Q 19.2 11.2 18.5 13.2
                 Q 17.2 14.8 15.2 15.5
                 Q 12.8 16 10.5 15.2
                 Q 8.5 14 7.2 12.2
                 Q 6.5 10 6.8 7.8
                 Q 7.5 6 8.8 4.8
                 Q 10.5 4 12.5 4
                 Q 14.5 4.5 16 5.8
                 Q 17 7.5 17.2 9.5
                 Q 16.8 11.5 15.5 12.8
                 Q 13.8 13.5 12 13.2
                 Q 10.2 12.5 9 11.2
                 Q 8.2 9.5 8.5 7.8
                 Q 9.2 6.5 10.5 6
                 Q 12 6 13.2 7
                 Q 13.8 8.5 13.5 10
                 Q 12.8 11.2 11.8 11.8
                 L 12 12 Z" 
              fill="currentColor"
              opacity="0.9" />
      </svg>
    </span>
  );
};

export default SpinIcon;

