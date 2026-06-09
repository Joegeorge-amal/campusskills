import React from 'react';
import { IconAlertTriangle, IconAlertCircle, IconBan, IconCurrencyRupee } from '@tabler/icons-react';
import StatusBadge from './StatusBadge';

/**
 * ModerationCard
 * Presentation-only component for rendering a moderation report.
 */
const ModerationCard = ({ report, onWarn, onSuspend, onRefund, onDismiss }) => {
  const isHighSeverity = report.severity === 'High';

  return (
    <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '16px', marginBottom: '12px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ 
          width: '32px', height: '32px', borderRadius: 'var(--cs-radius-md)', 
          background: isHighSeverity ? 'var(--cs-danger-light)' : 'var(--cs-warning-light)', 
          color: isHighSeverity ? 'var(--cs-danger)' : 'var(--cs-warning)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center' 
        }}>
          <IconAlertTriangle size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{report.title}</div>
          <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)' }}>{report.sub}</div>
        </div>
        <StatusBadge status={report.severity} />
      </div>

      {/* Description Body */}
      <div style={{ fontSize: '13px', color: 'var(--cs-text-main)', background: 'var(--cs-bg-light)', borderRadius: 'var(--cs-radius-md)', padding: '12px 16px', marginBottom: '16px', lineHeight: 1.5 }}>
        {report.desc}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          onClick={() => onWarn && onWarn(report.target)} 
          style={{ fontSize: '12px', padding: '8px 12px', borderRadius: 'var(--cs-radius-md)', border: 'none', background: 'var(--cs-warning-light)', color: 'var(--cs-warning)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <IconAlertCircle size={14} /> Warn user
        </button>
        <button 
          onClick={() => onSuspend && onSuspend(report.target)} 
          style={{ fontSize: '12px', padding: '8px 12px', borderRadius: 'var(--cs-radius-md)', border: 'none', background: 'var(--cs-danger-light)', color: 'var(--cs-danger)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <IconBan size={14} /> Suspend
        </button>
        <button 
          onClick={() => onRefund && onRefund(report.id, report.amount, report.reporter)} 
          style={{ fontSize: '12px', padding: '8px 12px', borderRadius: 'var(--cs-radius-md)', border: 'none', background: 'var(--cs-success-light)', color: 'var(--cs-success)', cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <IconCurrencyRupee size={14} /> Issue refund
        </button>
        <button 
          onClick={() => onDismiss && onDismiss(report.id)} 
          style={{ fontSize: '12px', padding: '8px 12px', borderRadius: 'var(--cs-radius-md)', border: '1px solid var(--cs-border)', background: 'var(--cs-bg-white)', color: 'var(--cs-text-inactive)', cursor: 'pointer', fontWeight: 600 }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
};

export default ModerationCard;
