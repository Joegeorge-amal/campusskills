import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IconCheck } from '@tabler/icons-react';
import { reportService } from '../../services/reportService';
import { useAppData } from '../../context/AppDataContext';

const ReportSessionModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState('');
  const [context, setContext] = useState('');
  const [step, setStep] = useState('form'); // 'form', 'success'
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { triggerToast } = useAppData();

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description.trim()) return;

    try {
      setLoading(true);
      await reportService.createReport({
        targetUser: target,
        context: context,
        description: description
      });
      setStep('success');
    } catch (err) {
      triggerToast('Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', paddingTop: '80px'
    }} onClick={handleClose}>
      <style>{`
        .rsm-wrapper {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 440px;
          padding: 0;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalDropIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        @keyframes modalDropIn {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div 
        className="rsm-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Report Session</div>
            <button 
              onClick={handleClose} 
              style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#9ca3af', lineHeight: 1 }}
            >
              ×
            </button>
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            {context} · {target}
          </div>
        </div>
        
        <div style={{ padding: '24px' }}>
          {step === 'form' ? (
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
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: '#dc2626', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '24px', 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                {loading ? 'Submitting...' : 'Submit Report'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', padding: '8px 0' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#dcfce7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px'
              }}>
                <IconCheck size={32} color="#22c55e" stroke={3} />
              </div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>Report submitted</div>
              <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '32px', lineHeight: 1.5 }}>
                Our team will review and follow up within 24 hours.
              </div>
              <button 
                onClick={handleClose}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  background: '#1d4ed8', 
                  color: '#ffffff', 
                  border: 'none', 
                  borderRadius: '10px', 
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
      </div>
    </div>,
    document.body
  );
};

export default ReportSessionModal;
