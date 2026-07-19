import React from 'react';
import { IconAlertTriangle } from '@tabler/icons-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirm", 
  cancelText = "Cancel", 
  isDanger = false,
  confirmDisabled = false,
  confirmLoadingText = "Processing..."
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ padding: '24px', maxWidth: '400px', width: '90%', borderRadius: '16px', background: 'var(--cs-bg-white)' }}
      >
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ 
            background: isDanger ? '#fee2e2' : '#e0e7ff', 
            color: isDanger ? '#ef4444' : '#4f46e5',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconAlertTriangle size={24} stroke={2} />
          </div>
          <div>
            <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px', fontWeight: 700 }}>{title}</h3>
            <p style={{ margin: '0 0 24px 0', color: 'var(--cs-text-secondary)', fontSize: '14px', lineHeight: '1.5' }}>{message}</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button 
            style={{ 
              padding: '10px 18px', 
              background: 'var(--cs-bg-light)', 
              border: 'none', 
              color: '#374151', 
              borderRadius: '8px',
              cursor: 'pointer', 
              fontWeight: 600,
              fontSize: '14px'
            }} 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            disabled={confirmDisabled}
            style={{ 
              padding: '10px 18px', 
              background: isDanger ? '#ef4444' : '#4f46e5', 
              color: '#fff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: confirmDisabled ? 'not-allowed' : 'pointer', 
              fontWeight: 600,
              fontSize: '14px',
              opacity: confirmDisabled ? 0.6 : 1
            }} 
            onClick={onConfirm}
          >
            {confirmDisabled ? confirmLoadingText : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
