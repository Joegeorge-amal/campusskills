import React from 'react';
import { IconCalendarMonth, IconStarFilled, IconStar } from '@tabler/icons-react';

const StatsCards = ({ user, stats }) => {
  const cardStyle = {
    background: '#ffffff', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    display: 'flex', 
    flexDirection: 'column'
  };

  const getJoinDate = () => {
    if (!user?.createdAt) return 'Unknown';
    const date = new Date(user.createdAt);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  const rating = stats?.averageRating || 0;
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      <div className="glossy-card" style={cardStyle}>
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>Sessions</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{stats?.totalSessionsCompleted || 0}</div>
      </div>
      <div className="glossy-card" style={cardStyle}>
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>Rating</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{rating.toFixed(1)}</div>
          <div style={{ display: 'flex', color: '#f59e0b' }}>
            {[1, 2, 3, 4, 5].map(star => (
              star <= rating ? <IconStarFilled key={star} size={16} /> : <IconStar key={star} size={16} color="#d1d5db" />
            ))}
          </div>
        </div>
      </div>
      <div className="glossy-card" style={cardStyle}>
        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600, marginBottom: '8px' }}>Hours</div>
        <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827' }}>{stats?.totalHours || 0}<span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 600, marginLeft: '4px' }}>hrs</span></div>
      </div>
      <div className="glossy-card" style={{ ...cardStyle, background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <IconCalendarMonth size={16} color="#6b7280" />
          <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 600 }}>Joined</div>
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: '#374151' }}>{getJoinDate()}</div>
      </div>
    </div>
  );
};

export default StatsCards;
