import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAppData } from '../../context/AppDataContext';
import { IconFlag, IconX } from '@tabler/icons-react';
import CustomSelect from '../common/CustomSelect';

const ReportUserModal = ({ isOpen, onClose, userName }) => {
  const { triggerToast } = useAppData();
  const [issueType, setIssueType] = useState('Harassment');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerToast('Report submitted. Admin will review within 24h.');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div 
        className="modal-content" 
        style={{ padding: '24px', border: '0.5px solid rgba(0, 0, 0, 0.08)', maxWidth: '400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#111827' }}>Report User</div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <IconX size={20} />
          </button>
        </div>

        <div style={{ fontSize: '14px', color: 'var(--cs-text-secondary)', marginBottom: '16px' }}>
          Reporting <strong style={{ color: '#111827' }}>{userName}</strong>
        </div>

        <div 
          style={{
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '13px',
            color: '#991b1b',
            marginBottom: '20px',
            lineHeight: 1.5
          }}
        >
          Your report will be reviewed by a college admin. False reports may affect your trust score.
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Reason for reporting
            </label>
            <CustomSelect 
              value={issueType} 
              onChange={val => setIssueType(val)}
              options={[
                { value: 'Harassment', label: 'Harassment' },
                { value: 'Inappropriate behavior', label: 'Inappropriate behavior' },
                { value: 'Spam', label: 'Spam' },
                { value: 'Fake identity', label: 'Fake identity' },
                { value: 'Other', label: 'Other' }
              ]}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '13px', color: '#374151', display: 'block', marginBottom: '6px', fontWeight: 600 }}>
              Description
            </label>
            <textarea 
              placeholder="Provide details about the issue..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ 
                width: '100%',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid var(--cs-border)',
                fontSize: '14px',
                outline: 'none',
                minHeight: '100px', 
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%',
              background: '#ef4444', 
              color: '#fff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '8px', 
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 600,
              fontSize: '14px',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#dc2626'}
            onMouseOut={(e) => e.target.style.background = '#ef4444'}
          >
            <IconFlag size={18} /> Submit Report
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReportUserModal;
