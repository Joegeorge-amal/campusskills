import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { IconBuildingBank, IconQrcode, IconCreditCard } from '@tabler/icons-react';

const AddMoney = () => {
  const navigate = useNavigate();
  const { depositMoney } = useAppData();
  const { user } = useAuth();
  
  const walletBalance = user?.walletBalance || 840;
  
  const [amount, setAmount] = useState('500');
  const [method, setMethod] = useState('netbanking');

  const handleAdd = () => {
    const numAmount = parseInt(amount) || 0;
    if (numAmount < 100) return; // Min 100
    
    depositMoney(numAmount);
    navigate('/app/dashboard');
  };

  if (!user) return null;

  return (
    <div id="addmoney" className="pg on" style={{ display: 'none' }}>
      {ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => navigate('/app/dashboard')}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px', border: '0.5px solid rgba(0, 0, 0, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>Add money to wallet</div>
              <button 
                onClick={() => navigate('/app/dashboard')} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '11px' }}>Current balance: ₹{walletBalance.toFixed(2)}</div>
            
            <div style={{ display: 'flex', gap: '6px', marginBottom: '11px' }}>
              <div 
                onClick={() => setMethod('netbanking')}
                style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: method === 'netbanking' ? '0.5px solid #534AB7' : '0.5px solid rgba(0,0,0,.1)', background: method === 'netbanking' ? '#EEEDFE' : 'transparent', textAlign: 'center', cursor: 'pointer', fontSize: '11px', color: method === 'netbanking' ? '#3C3489' : '#888', fontWeight: 500 }}
              >
                <IconBuildingBank style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }} />Net banking
              </div>
              <div 
                onClick={() => setMethod('upi')}
                style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: method === 'upi' ? '0.5px solid #534AB7' : '0.5px solid rgba(0,0,0,.1)', background: method === 'upi' ? '#EEEDFE' : 'transparent', textAlign: 'center', cursor: 'pointer', fontSize: '11px', color: method === 'upi' ? '#3C3489' : '#888', fontWeight: 500 }}
              >
                <IconQrcode style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }} />UPI
              </div>
              <div 
                onClick={() => setMethod('card')}
                style={{ flex: 1, padding: '8px 4px', borderRadius: '8px', border: method === 'card' ? '0.5px solid #534AB7' : '0.5px solid rgba(0,0,0,.1)', background: method === 'card' ? '#EEEDFE' : 'transparent', textAlign: 'center', cursor: 'pointer', fontSize: '11px', color: method === 'card' ? '#3C3489' : '#888', fontWeight: 500 }}
              >
                <IconCreditCard style={{ fontSize: '14px', display: 'block', marginBottom: '2px' }} />Card
              </div>
            </div>
            
            <div className="fld">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                min="100" 
              />
            </div>
            
            <div style={{ display: 'flex', gap: '5px', marginBottom: '11px' }}>
              <button 
                onClick={() => setAmount('200')} 
                style={{ flex: 1, padding: '5px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', fontSize: '11px', color: '#888', cursor: 'pointer' }}
              >
                ₹200
              </button>
              <button 
                onClick={() => setAmount('500')} 
                style={{ flex: 1, padding: '5px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', fontSize: '11px', color: '#888', cursor: 'pointer' }}
              >
                ₹500
              </button>
              <button 
                onClick={() => setAmount('1000')} 
                style={{ flex: 1, padding: '5px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', fontSize: '11px', color: '#888', cursor: 'pointer' }}
              >
                ₹1000
              </button>
            </div>
            
            <button className="mgo" onClick={handleAdd}>
              Add to wallet
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AddMoney;
