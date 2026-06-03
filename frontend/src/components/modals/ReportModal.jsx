import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAppData } from '../../hooks/useAppData';
import { IconFlag } from '@tabler/icons-react';

const ReportModal = ({ isOpen, onClose, tutorName, skillName }) => {
  const { triggerToast } = useAppData();
  const [issueType, setIssueType] = useState("No-show (tutor didn't attend)");
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    triggerToast('Report submitted. Admin will review within 24h.');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ padding: '24px', border: '0.5px solid rgba(0, 0, 0, 0.08)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#222' }}>Report an issue</div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888', lineHeight: 1, outline: 'none' }}
          >
            ×
          </button>
        </div>

        <div style={{ fontSize: '12px', color: '#888', marginBottom: '14px' }}>
          Session: {skillName} · {tutorName}
        </div>

        <div 
          style={{
            background: '#FFF3CD',
            border: '1px solid #F0C040',
            borderRadius: '9px',
            padding: '9px 11px',
            fontSize: '12px',
            color: '#7A5800',
            marginBottom: '13px',
            lineHeight: 1.5
          }}
        >
          Your report will be reviewed by a college admin. Misuse of this feature may affect your trust score.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sfld">
            <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Issue type
            </label>
            <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
              <option>No-show (tutor didn't attend)</option>
              <option>Session ended early without refund</option>
              <option>Misleading skill description</option>
              <option>Unprofessional behaviour</option>
              <option>Payment dispute</option>
              <option>Other</option>
            </select>
          </div>

          <div className="sfld">
            <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '6px', fontWeight: 500 }}>
              Describe what happened
            </label>
            <textarea 
              placeholder="Give as much detail as possible..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ minHeight: '80px', resize: 'vertical' }}
              required
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="mgo" 
            style={{ background: '#E24B4A', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '4px' }}
          >
            <IconFlag /> Submit report
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ReportModal;
