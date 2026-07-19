import React from 'react';

const AdminLineChart = ({ data }) => {
  // SVG dimensions
  const width = 800;
  const height = 300;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  // Find max value for Y scale (rounding up to nearest 100 for grid lines)
  const maxValue = Math.max(...data.map(d => d.value));
  const yMax = Math.ceil(maxValue / 100) * 100;
  
  const yTicks = [];
  for (let i = 0; i <= yMax; i += 100) {
    yTicks.push(i);
  }

  // Scaling functions
  const getX = (index) => padding.left + (index * (innerWidth / (data.length - 1)));
  const getY = (value) => height - padding.bottom - ((value / yMax) * innerHeight);

  // Generate SVG path commands
  const pathD = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`).join(' ');
  const areaPathD = `${pathD} L ${getX(data.length - 1)} ${height - padding.bottom} L ${padding.left} ${height - padding.bottom} Z`;

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        
        {/* Y-Axis Grid Lines & Labels */}
        {yTicks.map(tick => {
          const y = getY(tick);
          return (
            <g key={tick}>
              <line 
                x1={padding.left} 
                y1={y} 
                x2={width - padding.right} 
                y2={y} 
                stroke="#e2e8f0" 
                strokeWidth="1" 
              />
              <text 
                x={padding.left - 10} 
                y={y + 4} 
                textAnchor="end" 
                fill="#94a3b8" 
                fontSize="12px"
                fontFamily="Inter, sans-serif"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* X-Axis Labels */}
        {data.map((d, i) => (
          <text 
            key={i} 
            x={getX(i)} 
            y={height - 10} 
            textAnchor="middle" 
            fill="#64748b" 
            fontSize="12px"
            fontFamily="Inter, sans-serif"
          >
            {d.month}
          </text>
        ))}

        {/* Area Fill */}
        <path 
          d={areaPathD} 
          fill="rgba(59, 130, 246, 0.1)" 
        />

        {/* Line */}
        <path 
          d={pathD} 
          fill="none" 
          stroke="#2563eb" 
          strokeWidth="3" 
        />

        {/* Data Points */}
        {data.map((d, i) => (
          <circle 
            key={i} 
            cx={getX(i)} 
            cy={getY(d.value)} 
            r="5" 
            fill="#2563eb" 
            stroke="#ffffff" 
            strokeWidth="2" 
          />
        ))}

      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingLeft: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '24px', height: '4px', background: '#2563eb', borderRadius: '2px' }}></div>
          <span style={{ fontSize: '12px', color: 'var(--cs-text-secondary)', fontWeight: 500 }}>Student Registrations</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--cs-text-inactive)' }}>Hover over data points for details</span>
      </div>
    </div>
  );
};

export default AdminLineChart;
