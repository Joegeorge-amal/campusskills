import React, { useState, useMemo } from 'react';

const Heatmap = ({ visible = true }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredCell, setHoveredCell] = useState(null);

  const heatmapData = useMemo(() => {
    return [...Array(24)].map(() => 
      [...Array(7)].map(() => {
        return { level: 0, opacity: 0.1 };
      })
    );
  }, []);

  if (!visible) return null;

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
      style={{ 
        position: 'absolute', right: '24px', top: '-22px', transform: 'translateY(-50%)', 
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', zIndex: 10,
        pointerEvents: 'auto',
        opacity: isHovered ? 1 : 0.15, transition: 'opacity 0.4s ease'
      }}>
      <div style={{ 
        position: 'relative', display: 'flex', gap: '4px',
        maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)'
      }}>
        {heatmapData.map((col, colIndex) => (
          <div key={colIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {col.map((cell, rowIndex) => (
              <div 
                key={rowIndex} 
                onMouseEnter={() => setHoveredCell({ colIndex, rowIndex, level: cell.level })}
                onMouseLeave={() => setHoveredCell(null)}
                style={{ 
                  position: 'relative',
                  width: '12px', 
                  height: '12px', 
                  backgroundColor: '#ffffff', 
                  opacity: hoveredCell?.colIndex === colIndex && hoveredCell?.rowIndex === rowIndex ? 1 : cell.opacity,
                  borderRadius: '2px',
                  cursor: 'pointer',
                  transition: 'opacity 0.2s'
                }} 
              >
                {hoveredCell?.colIndex === colIndex && hoveredCell?.rowIndex === rowIndex && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'calc(100% + 8px)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#111827',
                    color: '#fff',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    zIndex: 100,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    pointerEvents: 'none'
                  }}>
                    {cell.level === 0 ? 'No activity' : `${cell.level * 3} activities`} on this day
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>
        ACTIVITY (LAST 6 MONTHS)
      </div>
    </div>
  );
};

export default Heatmap;
