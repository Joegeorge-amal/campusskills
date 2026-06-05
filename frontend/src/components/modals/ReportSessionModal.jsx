import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IconCircleCheckFilled } from '@tabler/icons-react';

const ReportSessionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState('');
  const [context, setContext] = useState('');
  const [step, setStep] = useState('form'); // 'form', 'success'
  const [description, setDescription] = useState('');

  useEffect(() => {
    const handleOpen = (e) => {
      setTarget(e.detail.target);
      setContext(e.detail.context);
      setStep('form');
      setDescription('');
      setIsOpen(true);
    };

    document.addEventListener('openReport', handleOpen);
    return () => document.removeEventListener('openReport', handleOpen);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setStep('success');
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }} onClick={handleClose}>
      <div 
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '400px',
          padding: '24px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'form' ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#111827' }}>Report session</div>
              <button 
                onClick={handleClose} 
                style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '24px' }}>
              {context} · {target}
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '24px' }}>
                <textarea 
                  placeholder="Describe the issue..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  style={{ 
                    width: '100%', 
                    minHeight: '120px', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    border: '1px solid #e5e7eb', 
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    boxSizing: 'border-box'
                  }}
                  required
                />
              </div>

              <button 
                type="submit" 
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: '#dc2626', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '24px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}
              >
                Submit Report
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <IconCircleCheckFilled size={64} style={{ color: '#059669', marginBottom: '16px' }} />
            <div style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Report submitted</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px', lineHeight: 1.5 }}>
              We've received your report for {context} · {target} and will review it shortly.
            </div>
            <button 
              onClick={handleClose}
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: '#534AB7', 
                color: '#ffffff', 
                border: 'none', 
                borderRadius: '24px', 
                fontSize: '14px', 
                fontWeight: 600, 
                cursor: 'pointer' 
              }}
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

export default ReportSessionModal;
