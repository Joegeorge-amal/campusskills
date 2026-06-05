import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { IconWallet, IconBuildingBank, IconQrcode } from '@tabler/icons-react';

const Payment = () => {
  const navigate = useNavigate();
  const [payMethod, setPayMethod] = useState('wallet');
  const { payForSession, walletBalance } = useAppData();

  // In a real app, you would pass these via state or search params
  const skillName = 'React.js basics';
  const tutorName = 'Priya S.';
  const amount = 300;

  const handlePay = () => {
    const success = payForSession(amount, tutorName, skillName);
    if (success) {
      navigate('/app/dashboard');
    }
  };

  return (
    <div id="payment" className="pg on">
      <button 
        onClick={() => navigate(-1)} 
        style={{ fontSize: '12px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}
      >
        Back
      </button>
      
      <div className="mbg">
        <div className="modal">
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#222', marginBottom: '3px' }}>Pay for session</div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>{skillName} · {tutorName}</div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,.08)' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Duration</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>1 hour</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '0.5px solid rgba(0,0,0,.08)' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>Rate</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>₹{amount} / hr</span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>Total</span>
            <span style={{ fontSize: '15px', fontWeight: 500, color: '#3C3489' }}>₹{amount}</span>
          </div>
          
          <div style={{ marginTop: '24px' }}>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '12px' }}>Pay from</div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px' }}>
              <div 
                onClick={() => setPayMethod('wallet')}
                style={{ 
                  border: payMethod === 'wallet' ? '1.5px solid #534AB7' : '1px solid #e5e7eb',
                  background: payMethod === 'wallet' ? '#f5f4ff' : '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <IconWallet style={{ color: payMethod === 'wallet' ? '#534AB7' : '#9ca3af', marginBottom: '4px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: payMethod === 'wallet' ? '#534AB7' : '#4b5563' }}>Wallet</div>
                <div style={{ fontSize: '11px', color: payMethod === 'wallet' ? '#534AB7' : '#9ca3af' }}>₹{walletBalance.toFixed(0)}</div>
              </div>

              <div 
                onClick={() => setPayMethod('bank')}
                style={{ 
                  border: payMethod === 'bank' ? '1.5px solid #534AB7' : '1px solid #e5e7eb',
                  background: payMethod === 'bank' ? '#f5f4ff' : '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <IconBuildingBank style={{ color: payMethod === 'bank' ? '#534AB7' : '#9ca3af', marginBottom: '4px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: payMethod === 'bank' ? '#534AB7' : '#4b5563' }}>Bank</div>
                <div style={{ fontSize: '11px', color: payMethod === 'bank' ? '#534AB7' : '#9ca3af' }}>HDFC &bull;&bull;42</div>
              </div>

              <div 
                onClick={() => setPayMethod('upi')}
                style={{ 
                  border: payMethod === 'upi' ? '1.5px solid #534AB7' : '1px solid #e5e7eb',
                  background: payMethod === 'upi' ? '#f5f4ff' : '#ffffff',
                  borderRadius: '12px',
                  padding: '16px 8px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <IconQrcode style={{ color: payMethod === 'upi' ? '#534AB7' : '#9ca3af', marginBottom: '4px' }} />
                <div style={{ fontSize: '13px', fontWeight: 600, color: payMethod === 'upi' ? '#534AB7' : '#4b5563' }}>UPI QR</div>
                <div style={{ fontSize: '11px', color: payMethod === 'upi' ? '#534AB7' : '#9ca3af' }}>Scan</div>
              </div>
            </div>

            {payMethod === 'wallet' && walletBalance < amount && (
              <div style={{ fontSize: '12px', color: '#dc2626', marginBottom: '16px', textAlign: 'center' }}>
                Insufficient wallet balance. Please add money or select another method.
              </div>
            )}
            
            <button 
              onClick={handlePay}
              disabled={payMethod === 'wallet' && walletBalance < amount}
              style={{ 
                width: '100%',
                padding: '16px',
                borderRadius: '12px',
                border: 'none',
                background: '#534AB7',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: (payMethod === 'wallet' && walletBalance < amount) ? 'not-allowed' : 'pointer',
                opacity: (payMethod === 'wallet' && walletBalance < amount) ? 0.6 : 1,
                transition: 'background 0.2s'
              }}
            >
              Confirm & pay ₹{amount}/hr
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
