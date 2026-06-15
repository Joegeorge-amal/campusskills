import React from 'react';
import ReactDOM from 'react-dom';
import { IconBell, IconX } from '@tabler/icons-react';

const SessionReminderOverlay = ({ session, onDismiss, onProposePostponement }) => {
  if (!session) return null;

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#ffffff',
      borderRadius: '16px',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      width: '320px',
      zIndex: 2000,
      border: '1px solid #e5e7eb',
      overflow: 'hidden',
      animation: 'slideUp 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      <div style={{ background: '#fef3c7', padding: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <div style={{ background: '#f59e0b', color: '#fff', padding: '6px', borderRadius: '50%', flexShrink: 0 }}>
          <IconBell size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#92400e', marginBottom: '4px' }}>
            Did your session start?
          </div>
          <div style={{ fontSize: '13px', color: '#b45309', marginBottom: '12px' }}>
            {session.topic} with {session.name}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={() => onDismiss(session.id)}
              style={{ padding: '8px', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Started
            </button>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => onDismiss(session.id)}
                style={{ flex: 1, padding: '8px', background: 'transparent', color: '#92400e', border: '1px solid #d97706', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Not Yet
              </button>
              <button
                onClick={() => {
                  onDismiss(session.id);
                  onProposePostponement(session);
                }}
                style={{ flex: 1, padding: '8px', background: 'transparent', color: '#92400e', border: '1px solid #d97706', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Postpone
              </button>
            </div>
          </div>
        </div>
        <button onClick={() => onDismiss(session.id)} style={{ background: 'none', border: 'none', color: '#d97706', cursor: 'pointer', padding: 0 }}>
          <IconX size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default SessionReminderOverlay;
