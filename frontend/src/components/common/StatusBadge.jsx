import React from 'react';

const StatusBadge = ({ status, className = '' }) => {
  let bgColor = 'var(--cs-bg-light)';
  let textColor = 'var(--cs-text-main)';

  const normalized = status.toLowerCase();

  switch (normalized) {
    case 'completed':
    case 'approved':
      bgColor = 'var(--cs-success-light)';
      textColor = 'var(--cs-success)';
      break;
    case 'reported':
    case 'suspended':
    case 'rejected':
      bgColor = 'var(--cs-danger-light)';
      textColor = 'var(--cs-danger)';
      break;
    case 'pending':
      bgColor = 'var(--cs-warning-light)';
      textColor = 'var(--cs-warning)';
      break;
    // For specific categories found in AdminSkills / AdminOverview
    case 'coding':
      bgColor = '#E6F1FB';
      textColor = '#0C447C';
      break;
    case 'design':
      bgColor = '#FBEAF0';
      textColor = '#72243E';
      break;
    case 'language':
      bgColor = '#EAF3DE';
      textColor = '#27500A';
      break;
    default:
      // default relies on fallback variables initialized above
      break;
  }

  return (
    <span 
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 8px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: 600,
        background: bgColor,
        color: textColor,
      }}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
