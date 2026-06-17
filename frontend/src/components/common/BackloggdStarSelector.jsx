import React, { useState } from 'react';

const BackloggdStarSelector = ({ value, onChange }) => {
  const [hoverValue, setHoverValue] = useState(null);
  const displayValue = hoverValue !== null ? hoverValue : value;
  const stars = [1, 2, 3, 4, 5];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: '16px 0' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        {stars.map(starIndex => {
          const leftVal = starIndex - 0.5;
          const rightVal = starIndex;
          const isLeftFilled = displayValue >= leftVal;
          const isRightFilled = displayValue >= rightVal;

          return (
            <div 
              key={starIndex} 
              style={{ position: 'relative', width: '36px', height: '36px', display: 'inline-block' }}
            >
              {/* Left half clickable zone */}
              <div 
                onClick={() => onChange(leftVal)}
                onMouseEnter={() => setHoverValue(leftVal)}
                onMouseLeave={() => setHoverValue(null)}
                style={{ position: 'absolute', left: 0, top: 0, width: '18px', height: '36px', zIndex: 5, cursor: 'pointer' }}
              />
              {/* Right half clickable zone */}
              <div 
                onClick={() => onChange(rightVal)}
                onMouseEnter={() => setHoverValue(rightVal)}
                onMouseLeave={() => setHoverValue(null)}
                style={{ position: 'absolute', right: 0, top: 0, width: '18px', height: '36px', zIndex: 5, cursor: 'pointer' }}
              />

              <svg viewBox="0 0 24 24" style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                <defs>
                  <linearGradient id={`star-grad-${starIndex}-${displayValue}`}>
                    <stop offset="50%" stopColor={isLeftFilled ? '#1d4ed8' : '#e5e7eb'} />
                    <stop offset="50%" stopColor={isRightFilled ? '#1d4ed8' : '#e5e7eb'} />
                  </linearGradient>
                </defs>
                <path
                  d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  fill={`url(#star-grad-${starIndex}-${displayValue})`}
                  stroke={displayValue >= starIndex - 0.5 ? '#1e40af' : '#d1d5db'}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: '16px', fontWeight: 800, color: '#1d4ed8' }}>
        {displayValue.toFixed(1)} <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>/ 5.0</span>
      </div>
    </div>
  );
};

export default BackloggdStarSelector;
