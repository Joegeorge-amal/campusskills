import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
  const { transactions } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const walletBalance = user?.walletBalance || 840;

  // Get recent 3 transactions
  const recentTx = transactions.slice(0, 3);

  const getIconColor = (type) => {
    switch (type) {
      case 'received': return { bg: '#E1F5EE', color: '#0F6E56', icon: 'ti-currency-rupee', amtClass: 'cr' };
      case 'withdrawn': return { bg: '#E6F1FB', color: '#185FA5', icon: 'ti-building-bank', amtClass: 'dr' };
      case 'paid': return { bg: '#FAECE7', color: '#993C1D', icon: 'ti-credit-card', amtClass: 'dr' };
      case 'swap': return { bg: '#EEEDFE', color: '#534AB7', icon: 'ti-arrows-exchange', amtClass: 'ex' };
      default: return { bg: '#FAFAFA', color: '#888', icon: 'ti-receipt', amtClass: '' };
    }
  };

  return (
    <div id="wallet" className="pg on">
      <div className="wbar">
        <div style={{ fontSize: '11px', color: '#AFA9EC', marginBottom: '3px' }}>CampusSkills wallet</div>
        <div style={{ fontSize: '25px', fontWeight: 500, color: '#EEEDFE' }}>₹{walletBalance.toFixed(2)}</div>
        <div style={{ fontSize: '11px', color: '#AFA9EC', marginTop: '3px' }}>Linked: HDFC ••42 · SBI ••87</div>
        <div style={{ display: 'flex', gap: '7px', marginTop: '10px' }}>
          <button 
            onClick={() => navigate('/app/add-money')} 
            style={{ fontSize: '12px', padding: '5px 13px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500, background: '#EEEDFE', color: '#3C3489' }}
          >
            + Add money
          </button>
          <button 
            onClick={() => navigate('/app/withdraw')} 
            style={{ fontSize: '12px', padding: '5px 13px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 500, background: 'rgba(255,255,255,.15)', color: '#EEEDFE' }}
          >
            Withdraw to bank
          </button>
        </div>
      </div>

      <div className="r2" style={{ marginBottom: '11px' }}>
        <div className="scard">
          <div style={{ fontSize: '11px', color: '#888' }}>Earned this month</div>
          <div style={{ fontSize: '19px', fontWeight: 500, color: '#0F6E56' }}>₹1,200</div>
        </div>
        <div className="scard">
          <div style={{ fontSize: '11px', color: '#888' }}>Spent this month</div>
          <div style={{ fontSize: '19px', fontWeight: 500, color: '#A32D2D' }}>₹360</div>
        </div>
      </div>

      <div className="ch">
        <span className="ct">Recent transactions</span>
        <button className="clink" onClick={() => navigate('/app/history')}>Full history</button>
      </div>

      {recentTx.map(tx => {
        const style = getIconColor(tx.type);
        return (
          <div className="hrow" key={tx.id}>
            <div className="hico" style={{ background: style.bg, color: style.color }}>
              <i className={`ti ${style.icon}`}></i>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{tx.title}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{tx.desc}</div>
            </div>
            <div>
              <div className={`hamt ${style.amtClass}`}>{tx.amount}</div>
              <div style={{ fontSize: '10px', color: '#aaa', textAlign: 'right' }}>{tx.date}</div>
            </div>
          </div>
        );
      })}

      {recentTx.length === 0 && (
        <div style={{ fontSize: '12px', color: '#888', padding: '20px 0', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.08)' }}>
          No transactions yet.
        </div>
      )}
    </div>
  );
};

export default Wallet;
