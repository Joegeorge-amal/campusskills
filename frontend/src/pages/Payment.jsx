import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { IconBrandGoogle, IconDeviceMobile, IconQrcode } from '@tabler/icons-react';

const Payment = () => {
  const navigate = useNavigate();
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
          
          <div style={{ background: '#F5F4FF', border: '1px solid #E0DFF0', borderRadius: '8px', padding: '10px 12px', marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>CampusSkills Wallet</span>
              <span style={{ fontSize: '12px', color: walletBalance >= amount ? '#0F6E56' : '#A32D2D', fontWeight: 500 }}>
                Bal: ₹{walletBalance.toFixed(2)}
              </span>
            </div>
            {walletBalance < amount && (
              <div style={{ fontSize: '11px', color: '#A32D2D', marginBottom: '8px' }}>Insufficient balance. Please add money.</div>
            )}
            
            <div style={{ fontSize: '11px', color: '#888', marginBottom: '5px' }}>Or pay directly via UPI:</div>
            <div style={{ display: 'flex', gap: '5px' }}>
              <div style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.1)', textAlign: 'center', cursor: 'pointer', fontSize: '11px', color: '#888' }}>
                <IconBrandGoogle style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }} />GPay<br/><span style={{ fontSize: '10px' }}>App</span>
              </div>
              <div style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.1)', textAlign: 'center', cursor: 'pointer', fontSize: '11px', color: '#888' }}>
                <IconDeviceMobile style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }} />PhonePe<br/><span style={{ fontSize: '10px' }}>App</span>
              </div>
              <div style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.1)', textAlign: 'center', cursor: 'pointer', fontSize: '11px', color: '#888' }}>
                <IconQrcode style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }} />UPI QR<br/><span style={{ fontSize: '10px' }}>Scan</span>
              </div>
            </div>
          </div>
          
          <button 
            className="mgo" 
            onClick={handlePay}
            disabled={walletBalance < amount}
            style={{ opacity: walletBalance < amount ? 0.6 : 1, cursor: walletBalance < amount ? 'not-allowed' : 'pointer' }}
          >
            Confirm & pay ₹{amount}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Payment;
