import React from 'react';

const LoadingSpinner = ({ size = 32, color = '#2563eb', trackColor = 'rgba(37, 99, 235, 0.15)', strokeWidth = 3.5 }) => {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
      <path d="M12 2 a10 10 0 0 1 10 10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" fill="none" />
    </svg>
  );
};

export default LoadingSpinner;
