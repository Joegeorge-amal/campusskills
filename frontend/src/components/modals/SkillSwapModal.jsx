import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { IconArrowsRightLeft, IconX } from '@tabler/icons-react';
import Avatar from '../common/Avatar';

const SkillSwapModal = ({ isOpen, onClose, request, onConfirm }) => {
  const [schedule, setSchedule] = useState('');
  const [step, setStep] = useState('form');

  if (!isOpen || !request) return null;

  // Attempt to parse what they offer vs what they want from request.sub
  // E.g. "He offers Guitar · Wants C++" or "Wants Python · Offers C++"
  let theyOffer = 'Their skill';
  let youTeach = 'Your skill';
  
  if (request.sub) {
    const parts = request.sub.split('·').map(p => p.trim());
    parts.forEach(p => {
      const lower = p.toLowerCase();
      if (lower.includes('offers')) {
        theyOffer = p.replace(/he offers|she offers|they offer|offers/i, '').trim();
      } else if (lower.includes('wants')) {
        youTeach = p.replace(/he wants|she wants|they want|wants/i, '').trim();
      }
    });
  }

  const handleConfirm = () => {
    onConfirm(request.id, schedule);
    setStep('success');
  };

  const handleDone = () => {
    setStep('form');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <style>{`
        .ssm-wrapper {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 460px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
          animation: modalDropIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .ssm-header {
          background: #1e3a8a;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          color: #ffffff;
        }
        .ssm-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 2px;
        }
        .ssm-subtitle {
          font-size: 12px;
          color: #bfdbfe;
        }
        .ssm-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          display: flex;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s, background 0.2s;
        }
        .ssm-close:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }
        .ssm-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
      `}</style>
      
      <div className="ssm-wrapper" onClick={(e) => e.stopPropagation()} style={{ maxWidth: step === 'success' ? '400px' : '460px' }}>
        {step === 'form' ? (
          <>
            <div className="ssm-header">
          <div>
            <div className="ssm-title">Skill Swap Request</div>
            <div className="ssm-subtitle">{request.name}</div>
          </div>
          <button className="ssm-close" onClick={onClose}>
            <IconX size={18} />
          </button>
        </div>

        <div className="ssm-body">
          <div style={{
            background: '#eff6ff',
            borderRadius: '12px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Avatar initials={request.init} bg={request.bg || '#fef3c7'} color={request.col || '#92400e'} size="40px" fontSize="14px" />
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{request.name}</div>
              <div style={{ fontSize: '13px', color: '#6b7280' }}>wants to swap skills with you</div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            marginTop: '24px'
          }}>
            <div style={{
              flex: 1,
              background: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>THEY OFFER</div>
              <div style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: 700 }}>{theyOffer}</div>
            </div>
            
            <IconArrowsRightLeft size={16} color="#6b7280" />
            
            <div style={{
              flex: 1,
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '8px',
              padding: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>YOU TEACH</div>
              <div style={{ fontSize: '14px', color: '#047857', fontWeight: 700 }}>{youTeach}</div>
            </div>
          </div>

          <div style={{ marginTop: '24px' }}>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>
              Agree on a schedule
            </label>
            <input 
              type="text" 
              placeholder="e.g. Sat 4pm, alternate weeks"
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#111827',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{
            marginTop: '16px',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '12px',
            color: '#d97706'
          }}>
            No money changes hands — this is a pure skill exchange!
          </div>

          <button 
            onClick={handleConfirm}
            style={{
              marginTop: '24px',
              width: '100%',
              background: '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              padding: '14px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af' }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8' }}
          >
            Confirm Swap
            </button>
          </div>
        </>
        ) : (
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#dbeafe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <IconArrowsRightLeft size={32} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Swap Confirmed!
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.5 }}>
              {request.name} will be notified. You'll teach {youTeach} and learn {theyOffer}.
            </div>
            <button 
              onClick={handleDone}
              style={{
                width: '100%',
                background: '#1d4ed8',
                color: '#ffffff',
                border: 'none',
                padding: '12px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af' }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default SkillSwapModal;
