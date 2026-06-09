import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { IconVideo, IconHourglassHigh, IconCheck, IconX, IconUsers, IconCalendarEvent, IconSparkles, IconArrowsExchange } from '@tabler/icons-react';

const ActiveSessionModal = ({ isOpen, onClose, session }) => {
  const [step, setStep] = useState('join');

  useEffect(() => {
    if (isOpen) {
      setStep('join');
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (step === 'waiting-join') {
      timer = setTimeout(() => {
        setStep('in-progress');
      }, 2500);
    } else if (step === 'waiting-confirm') {
      timer = setTimeout(() => {
        setStep('completed');
      }, 2500);
    }
    return () => clearTimeout(timer);
  }, [step]);

  if (!isOpen || !session) return null;

  const topic = session.title ? session.title.split('·')[0].trim() : 'Session';
  const otherPerson = session.title && session.title.includes('·') ? session.title.split('·')[1].trim() : 'User';
  const mode = session.time ? session.time.split('·')[1]?.trim() : 'Online';
  const isSwap = session.info && session.info.toLowerCase().includes('swap');
  const isOnline = mode.toLowerCase() === 'online';
  const isTeaching = topic.toLowerCase().includes('teaching');
  const roleLabel = isTeaching ? 'Student' : 'Tutor';

  const renderContent = () => {
    switch (step) {
      case 'join':
        return (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px', background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
            }}>
              {isOnline ? <IconVideo size={32} color="#1d4ed8" /> : <IconUsers size={32} color="#1d4ed8" />}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              {roleLabel}: {otherPerson}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '32px' }}>
              {isOnline ? 'Ready to join the Google Meet session?' : 'Ready to start the in-person session?'}
            </div>
            <button
              onClick={() => setStep('waiting-join')}
              style={{
                width: '100%', padding: '14px', background: '#1d4ed8', color: '#ffffff',
                border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {!isOnline && <IconSparkles size={18} />}
              {isOnline ? 'Join Google Meet' : 'Start Session'}
            </button>
          </div>
        );
      case 'waiting-join':
        return (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #f59e0b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px'
            }}>
              <IconHourglassHigh size={28} color="#d97706" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Waiting for {otherPerson}.
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
              {isOnline ? "They'll join the meeting shortly..." : "They'll confirm when ready..."}
            </div>
            <div className="loading-dots">
              <span>•</span><span>•</span><span>•</span>
            </div>
          </div>
        );
      case 'in-progress':
        return (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #10b981',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <IconCheck size={32} color="#10b981" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Session in Progress
            </div>
            <div style={{ display: 'inline-block', background: '#d1fae5', color: '#059669', padding: '4px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, marginBottom: '24px' }}>
              • Both participants joined
            </div>
            
            {isOnline && (
              <div style={{ textAlign: 'left', marginBottom: '24px' }}>
                <div style={{ fontSize: '10px', fontWeight: 700, color: '#1d4ed8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  MEET LINK:
                </div>
                <div style={{ background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '12px 16px', fontSize: '13px', color: '#6b7280', fontFamily: 'monospace' }}>
                  https://meet.google.com/abc-defg-hij
                </div>
              </div>
            )}

            <button
              onClick={() => setStep('waiting-confirm')}
              style={{
                width: '100%', padding: '14px', background: '#059669', color: '#ffffff',
                border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              Mark Session as Complete
            </button>
          </div>
        );
      case 'waiting-confirm':
        return (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', border: '2px solid #8b5cf6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px',
              background: '#f5f3ff'
            }}>
              <IconHourglassHigh size={28} color="#7c3aed" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Waiting for {otherPerson}.
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px', lineHeight: 1.5 }}>
              You've marked the session as complete.<br/>Waiting for them to confirm...
            </div>
            <div className="loading-dots" style={{ color: '#8b5cf6' }}>
              <span>•</span><span>•</span><span>•</span>
            </div>
          </div>
        );
      case 'completed':
        return (
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ position: 'relative', display: 'inline-block', margin: '0 auto 16px' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%', background: '#22c55e',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <IconCheck size={32} color="#ffffff" stroke={3} />
              </div>
              {isSwap && (
                <div style={{
                  position: 'absolute', top: '-4px', right: '-4px', background: '#3b82f6',
                  borderRadius: '50%', padding: '4px', display: 'flex', border: '2px solid #ffffff'
                }}>
                  <IconArrowsExchange size={14} color="#ffffff" stroke={3} />
                </div>
              )}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Session Completed!
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '24px' }}>
              Both participants confirmed completion
            </div>
            
            {isSwap ? (
              <div style={{
                background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '12px',
                padding: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', textAlign: 'left'
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', background: '#1d4ed8',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative'
                }}>
                  <IconCalendarEvent size={20} color="#ffffff" />
                  <div style={{ position: 'absolute', bottom: '6px', fontSize: '8px', color: '#1d4ed8', background: '#ffffff', padding: '0 4px', borderRadius: '4px', fontWeight: 700 }}>17</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>Next: Schedule Your Session</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{otherPerson} will now teach you in return</div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                  Scan QR Code to Pay
                </div>
                
                <div style={{
                  background: '#eff6ff', border: '1px dashed #93c5fd', borderRadius: '12px',
                  padding: '32px 16px', marginBottom: '16px', color: '#6b7280', fontSize: '12px'
                }}>
                  No QR code uploaded by tutor
                </div>
                
                <div style={{
                  background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '8px',
                  padding: '16px', textAlign: 'left', marginBottom: '24px'
                }}>
                  <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px' }}>Amount to pay:</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#1d4ed8' }}>₹300/hr</div>
                </div>
              </>
            )}

            <button
              onClick={onClose}
              style={{
                width: '100%', padding: '14px', background: isSwap ? '#1d4ed8' : '#059669', color: '#ffffff',
                border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}
            >
              {isSwap && <IconCalendarEvent size={18} />}
              {isSwap ? 'Schedule Return Session' : 'Done'}
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <style>{`
        .asm-wrapper {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalDropIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }
        .asm-header {
          background: linear-gradient(105deg, #1e3a8a 0%, #3b82f6 55%, #1e3a8a 100%);
          padding: 20px 24px;
          position: relative;
          color: #ffffff;
        }
        .asm-title {
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .asm-tag {
          display: inline-flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.2);
          padding: 2px 8px;
          border-radius: 100px;
          font-size: 10px;
          font-weight: 600;
        }
        .asm-tag-dot {
          width: 6px; height: 6px; border-radius: 50%; background: #4ade80; margin-right: 6px;
        }
        .asm-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          display: flex;
          padding: 4px;
          border-radius: 50%;
          transition: background 0.2s;
        }
        .asm-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #ffffff;
        }
        .loading-dots {
          font-size: 24px;
          color: #3b82f6;
          letter-spacing: 4px;
        }
        .loading-dots span {
          animation: blink 1.4s infinite both;
        }
        .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
        .loading-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
      `}</style>
      <div className="asm-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="asm-header">
          <div className="asm-title">{topic}</div>
          <div className="asm-tag">
            <div style={{ background: isTeaching ? '#3b82f6' : '#4ade80', width: '6px', height: '6px', borderRadius: '50%', marginRight: '6px' }}></div>
            {isTeaching ? 'Teaching' : 'Learning'} · {mode}
          </div>
          <button className="asm-close" onClick={onClose}>
            <IconX size={16} />
          </button>
        </div>
        <div style={{ padding: '24px' }}>
          {renderContent()}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ActiveSessionModal;
