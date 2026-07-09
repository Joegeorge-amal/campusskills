import React from 'react';
import { IconX, IconClock, IconUser, IconTarget, IconInfoCircle } from '@tabler/icons-react';

const AuditLogDetailsModal = ({ log, onClose }) => {
  if (!log) return null;

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getBadgeColor = (action) => {
    switch(action) {
      case 'PROMOTE_USER': return { bg: '#fdf4ff', color: '#a21caf', border: '#f5d0fe' };
      case 'DEMOTE_USER': return { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' };
      case 'SUSPEND_USER': return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
      case 'UNSUSPEND_USER': return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
      default: return { bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb' };
    }
  };

  const badgeStyle = getBadgeColor(log.action);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white', borderRadius: '12px', width: '100%', maxWidth: '650px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827', display: 'flex', alignItems: 'center', gap: '12px' }}>
              Audit Record Details
              <span style={{
                padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
                background: badgeStyle.bg, color: badgeStyle.color, border: `1px solid ${badgeStyle.border}`
              }}>
                {log.action}
              </span>
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px' }}>
            <IconX size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Timestamp & IP */}
          <div style={{ display: 'flex', gap: '24px', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <IconClock size={14} /> Timestamp
              </div>
              <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>
                {formatDate(log.timestamp)}
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: '500', textTransform: 'uppercase', marginBottom: '4px' }}>
                IP Address
              </div>
              <div style={{ fontSize: '14px', color: '#111827', fontFamily: 'monospace' }}>
                {log.ipAddress || 'Unknown'}
              </div>
            </div>
          </div>

          {/* Actor vs Target */}
          <div style={{ display: 'flex', gap: '24px' }}>
            {/* Actor */}
            <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '13px', color: '#4f46e5', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconUser size={16} /> Actor (Performed Action)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Name</div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{log.actorName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Email</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>{log.actorEmail}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>ID</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>{log.actorId}</div>
                </div>
              </div>
            </div>

            {/* Target */}
            <div style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '13px', color: '#ea580c', fontWeight: '600', textTransform: 'uppercase', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconTarget size={16} /> Target (Affected User)
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Name</div>
                  <div style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{log.targetName}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Email</div>
                  <div style={{ fontSize: '14px', color: '#111827' }}>{log.targetEmail}</div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>ID</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', fontFamily: 'monospace' }}>{log.targetId}</div>
                </div>
              </div>
            </div>
          </div>

          {/* State Changes & Reason */}
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px' }}>
            <div style={{ fontSize: '13px', color: '#111827', fontWeight: '600', textTransform: 'uppercase', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconInfoCircle size={16} /> Action Details
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Previous State</div>
                <div style={{ padding: '8px 12px', background: '#f3f4f6', borderRadius: '6px', fontSize: '14px', fontFamily: 'monospace', color: '#374151' }}>
                  {log.previousState || 'N/A'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>New State</div>
                <div style={{ padding: '8px 12px', background: '#f0fdf4', borderRadius: '6px', fontSize: '14px', fontFamily: 'monospace', color: '#166534', border: '1px solid #bbf7d0' }}>
                  {log.newState || 'N/A'}
                </div>
              </div>
            </div>

            {log.reason && (
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Reason / Notes</div>
                <div style={{ padding: '12px', background: '#fffbeb', borderRadius: '6px', fontSize: '14px', color: '#92400e', border: '1px solid #fef3c7', whiteSpace: 'pre-wrap' }}>
                  {log.reason}
                </div>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetailsModal;
