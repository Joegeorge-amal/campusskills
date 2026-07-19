import React, { useState, useEffect } from 'react';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { sessionService } from '../../../services/sessionService';
import { useAppData } from '../../../context/AppDataContext';

const PaymentSection = ({ session }) => {
  const { user, triggerToast, fetchInitialData } = useAppData();
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [loadingInfo, setLoadingInfo] = useState(true);

  const raw = session.rawSession;
  const isStudent = raw.studentId === user?.userId;

  useEffect(() => {
    if (isStudent && raw.status === 'COMPLETED' && !raw.studentMarkedPaid) {
      const fetchInfo = async () => {
        try {
          const info = await sessionService.getPaymentInfo(session.id);
          setPaymentInfo(info);
        } catch (err) {
          triggerToast('Could not fetch payment info.');
        } finally {
          setLoadingInfo(false);
        }
      };
      fetchInfo();
    } else {
      setLoadingInfo(false);
    }
  }, [isStudent, raw.status, raw.studentMarkedPaid, session.id, triggerToast]);

  const handleMarkPaid = async () => {
    try {
      setLoading(true);
      await sessionService.markPaid(session.id);
      triggerToast('Marked as paid!');
      fetchInitialData();
    } catch (err) {
      triggerToast('Failed to mark as paid.');
    } finally {
      setLoading(false);
    }
  };

  const copyUpi = () => {
    if (paymentInfo?.upiId) {
      navigator.clipboard.writeText(paymentInfo.upiId);
      triggerToast('UPI ID copied to clipboard');
    }
  };

  if (!isStudent) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Waiting for the student to complete payment.
        </div>
      </div>
    );
  }

  if (raw.studentMarkedPaid) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <IconCheck size={32} color="#22c55e" stroke={3} />
        </div>
        <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          Payment Completed
        </div>
      </div>
    );
  }

  if (loadingInfo) {
    return <div style={{ textAlign: 'center', padding: '24px', color: '#6b7280' }}>Loading payment info...</div>;
  }

  if (!paymentInfo || !paymentInfo.upiId) {
    return (
      <div style={{ textAlign: 'center', padding: '16px 0', color: '#6b7280', fontSize: '14px' }}>
        No payment information available from the tutor.
        <br/><br/>
        <button
          onClick={handleMarkPaid}
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Marking...' : 'Mark as Paid Anyway'}
        </button>
      </div>
    );
  }

  const upiUrl = `upi://pay?pa=${paymentInfo.upiId}&pn=${encodeURIComponent(session.name)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

  return (
    <div style={{ textAlign: 'center', padding: '8px 0' }}>
      <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
        Scan QR Code to Pay
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <img src={qrUrl} alt="UPI QR Code" style={{ width: '200px', height: '200px', borderRadius: '8px', border: '1px solid var(--cs-border)', padding: '8px' }} />
      </div>

      <div style={{ background: 'var(--cs-bg-light)', border: '1px solid var(--cs-border)', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#6b7280', textAlign: 'left', marginBottom: '2px' }}>UPI ID</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{paymentInfo.upiId}</div>
        </div>
        <button onClick={copyUpi} style={{ background: 'var(--cs-bg-hover)', border: 'none', borderRadius: '6px', padding: '8px', color: '#1d4ed8', cursor: 'pointer', display: 'flex' }}>
          <IconCopy size={18} />
        </button>
      </div>

      <button
        onClick={handleMarkPaid}
        disabled={loading}
        style={{ width: '100%', padding: '14px', background: '#059669', color: '#ffffff', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
      >
        {loading ? 'Marking...' : 'I Have Paid'}
      </button>
    </div>
  );
};

export default PaymentSection;
