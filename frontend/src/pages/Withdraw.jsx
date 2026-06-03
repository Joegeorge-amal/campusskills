import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

const Withdraw = () => {
  const navigate = useNavigate();
  const { withdrawMoney } = useAppData();
  const { user } = useAuth();
  
  const walletBalance = user?.walletBalance ?? 840;
  
  const [amount, setAmount] = useState('500');
  const [bank, setBank] = useState('HDFC Bank · Savings ••••1942 (default)');

  const handleWithdraw = () => {
    const numAmount = parseInt(amount) || 0;
    if (numAmount < 1) return;
    
    const success = withdrawMoney(numAmount, bank.split('·')[0].trim());
    if (success) {
      navigate('/app/wallet');
    }
  };

  if (!user) return null;

  return (
    <div id="withdraw" className="pg on" style={{ display: 'none' }}>
      {ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => navigate('/app/wallet')}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px', border: '0.5px solid rgba(0, 0, 0, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#222' }}>Withdraw to bank account</div>
              <button 
                onClick={() => navigate('/app/wallet')} 
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888', lineHeight: 1 }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: '12px', color: '#888', marginBottom: '13px' }}>Available: ₹{walletBalance.toFixed(2)}</div>
            
            <div className="fld">
              <label>Withdraw to</label>
              <select style={{ fontSize: '12px' }} value={bank} onChange={e => setBank(e.target.value)}>
                <option>HDFC Bank · Savings ••••1942 (default)</option>
                <option>SBI · Savings ••••3587</option>
              </select>
            </div>
            
            <div className="fld">
              <label>Amount (₹)</label>
              <input 
                type="number" 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                min="1" 
                max={Math.floor(walletBalance)} 
              />
            </div>
            
            <button className="mgo" onClick={handleWithdraw}>
              Withdraw ₹{amount || 0}
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Withdraw;
