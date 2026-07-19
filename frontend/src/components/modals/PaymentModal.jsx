import React, { useState, useEffect } from 'react';
import { IconX, IconCopy } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';
import { sessionService } from '../../services/sessionService';
import ModalWrapper from '../common/ModalWrapper';

const PaymentModal = ({ isOpen, onClose, session, onMarkPaid }) => {
  const { triggerToast } = useAppData();
  
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && session?.id) {
      setIsLoading(true);
      sessionService.getPaymentInfo(session.id)
        .then(info => {
          setPaymentInfo(info);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch payment info", err);
          setIsLoading(false);
        });
    }
  }, [isOpen, session]);

  if (!isOpen || !session) return null;

  const handleCopy = (text) => {
    if (text) {
      navigator.clipboard.writeText(text);
      triggerToast('UPI ID copied to clipboard');
    }
  };

  const handleConfirmPaid = async () => {
    try {
      setIsSubmitting(true);
      await onMarkPaid(session.id);
    } catch (err) {
      // Error handling passed up
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper isOpen={true} onClose={onClose} maxWidth="400px" zIndex={1000}>
      <div style={{
        background: 'var(--cs-bg-white)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>Payment Required</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
          >
            <IconX size={20} />
          </button>
        </div>
        
        <p style={{ fontSize: '14px', color: 'var(--cs-text-secondary)', margin: '0 0 24px', lineHeight: 1.5 }}>
          Please complete your payment for <strong>{session.topic}</strong>. Scan the QR code below or use the UPI ID to pay.
        </p>

        {isLoading ? (
          <div style={{ padding: '40px 0', textAlign: 'center', color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>
            Loading payment details...
          </div>
        ) : paymentInfo ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ 
              background: 'var(--cs-bg-white)', 
              padding: '16px', 
              borderRadius: '12px', 
              border: '1px solid var(--cs-border)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`upi://pay?pa=${paymentInfo.upiId}&pn=${encodeURIComponent(session.name || 'Teacher')}`)}`} 
                alt="UPI QR Code" 
                style={{ width: '160px', height: '160px', marginBottom: '16px', borderRadius: '8px' }}
              />
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                gap: '8px', 
                background: '#f9fafb', 
                padding: '8px 16px', 
                borderRadius: '8px',
                width: '100%',
                boxSizing: 'border-box'
              }}>
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{paymentInfo.upiId}</span>
                <button 
                  onClick={() => handleCopy(paymentInfo.upiId)} 
                  style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  <IconCopy size={16} />
                </button>
              </div>
            </div>
            
            <p style={{ fontSize: '12px', color: '#6b7280', textAlign: 'center', margin: 0 }}>
              After paying in your UPI app, click the button below to notify the teacher.
            </p>
          </div>
        ) : (
          <div style={{ padding: '24px 16px', textAlign: 'center', color: '#ef4444', background: '#fee2e2', borderRadius: '12px', fontSize: '13px', fontWeight: 500, marginBottom: '24px' }}>
            Payment details could not be loaded. Please ensure the tutor has a registered UPI ID.
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            style={{ flex: 1, padding: '12px', background: 'var(--cs-bg-light)', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '14px' }}
          >
            I'll Pay Later
          </button>
          <button 
            onClick={handleConfirmPaid}
            disabled={isSubmitting || !paymentInfo}
            style={{ 
              flex: 1, 
              padding: '12px', 
              background: paymentInfo ? '#059669' : '#d1d5db', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: paymentInfo ? 'pointer' : 'not-allowed', 
              fontWeight: 600, 
              fontSize: '14px', 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center' 
            }}
          >
            {isSubmitting ? 'Confirming...' : "I've Paid"}
          </button>
        </div>
      </div>
    </ModalWrapper>
  );
};

export default PaymentModal;
