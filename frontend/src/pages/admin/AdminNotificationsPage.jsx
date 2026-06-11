import React from 'react';
import { mockNotifications } from '../../data/adminDashboardData';
import { IconBell, IconUsers, IconCalendarEvent, IconCurrencyRupee, IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';

const AdminNotificationsPage = () => {
  const getIcon = (type) => {
    switch (type) {
      case 'user': return <IconUsers size={20} color="#3b82f6" />;
      case 'session': return <IconCalendarEvent size={20} color="#10b981" />;
      case 'payment': return <IconCurrencyRupee size={20} color="#8b5cf6" />;
      case 'dispute': return <IconAlertTriangle size={20} color="#f59e0b" />;
      case 'success': return <IconCircleCheck size={20} color="#10b981" />;
      default: return <IconBell size={20} color="#6b7280" />;
    }
  };

  return (
    <div className="admin-page fade-in" style={{ padding: '24px' }}>
      <h2 style={{ marginBottom: '24px', color: '#0f172a' }}>All Notifications</h2>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 8px 30px rgba(0,0,0,0.04)' }}>
        {mockNotifications.map(notif => (
          <div key={notif.id} style={{ display: 'flex', gap: '16px', padding: '16px 0', borderBottom: '1px solid #f1f5f9' }}>
            <div style={{ padding: '10px', background: '#f8fafc', borderRadius: '50%', height: 'fit-content', border: '1px solid #e2e8f0' }}>
              {getIcon(notif.type)}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#0f172a', marginBottom: '4px' }}>{notif.title}</div>
              <div style={{ color: '#475569', fontSize: '14px', marginBottom: '8px' }}>{notif.message}</div>
              <div style={{ color: '#94a3b8', fontSize: '12px', fontWeight: 500 }}>{notif.time}</div>
            </div>
          </div>
        ))}
        {mockNotifications.length === 0 && (
          <div style={{ color: '#64748b', textAlign: 'center', padding: '24px' }}>No notifications to display</div>
        )}
      </div>
    </div>
  );
};

export default AdminNotificationsPage;
