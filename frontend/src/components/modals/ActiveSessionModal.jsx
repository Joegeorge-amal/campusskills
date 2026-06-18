import React from 'react';
import { IconX, IconCheck, IconCalendarEvent } from '@tabler/icons-react';
import HandshakeSection from './active-session/HandshakeSection';
import PaymentSection from './active-session/PaymentSection';
import RescheduleSection from './active-session/RescheduleSection';
import { useAppData } from '../../context/AppDataContext';
import ModalWrapper from '../common/ModalWrapper';

const ActiveSessionModal = ({ isOpen, onClose, session }) => {
  const { user } = useAppData();
  if (!isOpen || !session) return null;

  const topic = session.topic || session.title?.split('·')[0].trim() || 'Session';
  const otherPerson = session.name || session.title?.split('·')[1].trim() || 'User';
  const mode = session.mode || session.time?.split('·')[1]?.trim() || 'Online';
  const isOnline = mode.toLowerCase() === 'online';
  const isTeaching = session.role === 'Teaching';
  
  const raw = session.rawSession;
  const isSwap = !!raw?.swapGroupId;
  const isFree = raw?.price === 0 || !raw?.price; // Assuming no price or 0 price means free, though price is removed. Wait, user said money is external and only for non-swap paid. If swap, we don't pay. If non-swap, it's paid. But wait, earlier the user said it can be Free or Paid. For simplicity, we just check if it's paid or free based on some flag. Let's assume non-swap is paid unless explicitly free. Actually, the user's philosophy document says "For paid non-swap sessions: Fetch payment information". We'll just check if it's a swap. If it's not a swap, we try to show payment unless there's no amount (but amount isn't shown anyway). We can just show PaymentSection for non-swaps.

  const renderContent = () => {
    if (raw.status === 'SCHEDULED') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <HandshakeSection session={session} />
          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '24px' }}>
            <RescheduleSection session={session} />
          </div>
        </div>
      );
    }

    if (raw.status === 'COMPLETED') {
      if (!isSwap) {
        return <PaymentSection session={session} />;
      } else {
        // Swap completed state
        return (
          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <IconCheck size={32} color="#22c55e" stroke={3} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Session Completed!
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
              You've successfully completed this half of the swap.
            </div>
            <button
              onClick={onClose}
              style={{ width: '100%', padding: '14px', background: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
              <IconCalendarEvent size={18} />
              Schedule Return Session
            </button>
          </div>
        );
      }
    }

    return (
      <div style={{ textAlign: 'center', padding: '16px 0', color: '#6b7280' }}>
        This session is {raw.status.toLowerCase()}.
      </div>
    );
  };

  return (
    <ModalWrapper isOpen={true} onClose={onClose} maxWidth="400px" zIndex={1000}>
      <style>{`
        .asm-wrapper {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 400px;
          overflow: hidden;
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
        @keyframes modalDropIn {
          from { opacity: 0; transform: translateY(-40px); }
          to { opacity: 1; transform: translateY(0); }
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
    </ModalWrapper>
  );
};

export default ActiveSessionModal;
