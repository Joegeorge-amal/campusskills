import React from 'react';

const StatCard = ({
  icon,
  iconBg = '#EEEDFE',
  iconColor = '#534AB7',
  value,
  label,
  subText = null,
  subColor = '#0F6E56',
  subIcon = null
}) => {
  return (
    <div className="scard">
      <div 
        style={{
          width: '27px',
          height: '27px',
          borderRadius: '7px',
          background: iconBg,
          color: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '13px',
          marginBottom: '7px'
        }}
      >
        <i className={icon}></i>
      </div>
      <div style={{ fontSize: '19px', fontWeight: 500, color: '#222' }}>{value}</div>
      <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>{label}</div>
      {subText && (
        <div style={{ fontSize: '11px', color: subColor, marginTop: '4px' }}>
          {subIcon && <i className={subIcon} style={{ marginRight: '2px' }}></i>}
          {subText}
        </div>
      )}
    </div>
  );
};

export default StatCard;
