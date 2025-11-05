import React, { useState, useEffect } from 'react';
import './snowflakes.css';

const Snowflakes = () => {
  const [showSnow, setShowSnow] = useState(false);

  useEffect(() => {
    const checkDate = () => {
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12 (January = 1, December = 12)
      const currentDay = today.getDate();

      // December 20 to December 31
      const isDecemberPeriod = currentMonth === 12 && currentDay >= 20;
      
      // January 1 to January 20
      const isJanuaryPeriod = currentMonth === 1 && currentDay <= 20;

      // Show snow if we're in the holiday period (Dec 20 - Jan 20)
      setShowSnow(isDecemberPeriod || isJanuaryPeriod);
    };

    checkDate();
    // Check once per day to handle date changes
    const interval = setInterval(checkDate, 3600000); // Check every hour

    return () => clearInterval(interval);
  }, []);

  // Generate multiple snowflakes with random properties
  const snowflakes = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    size: Math.random() * 2 + 1, // 1-3px (sitnije)
    left: Math.random() * 100, // 0-100%
    animationDuration: Math.random() * 20 + 20, // 20-40s (sporije)
    animationDelay: Math.random() * 10, // 0-10s
    opacity: Math.random() * 0.3 + 0.1, // 0.1-0.4 (nežnije)
  }));

  // Only render snowflakes if we're in the holiday period
  if (!showSnow) {
    return null;
  }

  return (
    <div className="snowflakes-container">
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="snowflake"
          style={{
            left: `${flake.left}%`,
            width: `${flake.size}px`,
            height: `${flake.size}px`,
            animationDuration: `${flake.animationDuration}s`,
            animationDelay: `${flake.animationDelay}s`,
            opacity: flake.opacity,
          }}
        >
          ❄
        </div>
      ))}
    </div>
  );
};

export default Snowflakes;

