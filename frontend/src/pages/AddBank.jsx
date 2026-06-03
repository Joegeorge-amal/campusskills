import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { IconShieldCheck } from '@tabler/icons-react';

const AddBank = () => {
  const navigate = useNavigate();
  const { triggerToast } = useAppData();
  
  const [holderName, setHolderName] = useState('');
  const [bank, setBank] = useState('HDFC Bank');
  const [accNumber, setAccNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [accType, setAccType] = useState('Savings');

  const handleLink = () => {
    if (!holderName || !accNumber || !ifsc) {
      triggerToast('Please fill all fields');
      return;
    }
    
    triggerToast('Bank linked! Verifying via ₹1 penny drop...');
    setTimeout(() => {
      navigate('/app/profile');
    }, 1500);
  };

  return (
    <div id="addbank" className="pg on">
      <button 
        onClick={() => navigate('/app/profile')} 
        style={{ fontSize: '12px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}
      >
        Back to profile
      </button>
      
      <div className="mbg">
        <div className="modal">
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#222', marginBottom: '3px' }}>Link a bank account</div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '13px' }}>Used for withdrawals and direct payments</div>
          
          <div className="fld">
            <label>Account holder name</label>
            <input 
              type="text" 
              placeholder="As per bank records" 
              value={holderName}
              onChange={e => setHolderName(e.target.value)}
            />
          </div>
          
          <div className="fld">
            <label>Bank</label>
            <select style={{ fontSize: '12px' }} value={bank} onChange={e => setBank(e.target.value)}>
              <option>HDFC Bank</option>
              <option>State Bank of India</option>
              <option>ICICI Bank</option>
              <option>Axis Bank</option>
              <option>Kotak Mahindra</option>
              <option>Other</option>
            </select>
          </div>
          
          <div className="fld">
            <label>Account number</label>
            <input 
              type="text" 
              placeholder="Enter account number" 
              value={accNumber}
              onChange={e => setAccNumber(e.target.value)}
            />
          </div>
          
          <div className="fld">
            <label>IFSC code</label>
            <input 
              type="text" 
              placeholder="e.g. HDFC0001234" 
              value={ifsc}
              onChange={e => setIfsc(e.target.value)}
            />
          </div>
          
          <div className="fld" style={{ marginBottom: '9px' }}>
            <label>Account type</label>
            <select style={{ fontSize: '12px' }} value={accType} onChange={e => setAccType(e.target.value)}>
              <option>Savings</option>
              <option>Current</option>
            </select>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F5F4FF', borderRadius: '8px', padding: '8px 10px', marginBottom: '9px', fontSize: '11px', color: '#888' }}>
            <IconShieldCheck style={{ fontSize: '14px', color: '#0F6E56', flexShrink: 0 }} /> 
            Verified via penny drop · ₹1 test deposit, auto-refunded
          </div>
          
          <button className="mgo" onClick={handleLink}>
            Link account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddBank;
