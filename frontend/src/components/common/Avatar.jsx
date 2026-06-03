import React from 'react';

const Avatar = ({
  initials,
  bg = '#EEEDFE',
  color = '#3C3489',
  backgroundImage = null,
  size = '27px',
  fontSize = '10px',
  onClick = null,
  style = {}
}) => {
  const avatarStyle = {
    width: size,
    height: size,
    backgroundColor: backgroundImage ? 'transparent' : bg,
    color: color,
    fontSize: fontSize,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    border: style.border || 'none',
    cursor: onClick ? 'pointer' : 'default',
    ...style
  };

  return (
    <div className="avr" style={avatarStyle} onClick={onClick}>
      {!backgroundImage && initials}
    </div>
  );
};

export default Avatar;
