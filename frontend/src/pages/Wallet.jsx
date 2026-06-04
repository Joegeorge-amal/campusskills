import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/common/StatCard';
import TransactionListItem from '../components/common/TransactionListItem';
import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react';

const Wallet = () => {
  const { transactions } = useAppData();
  const { user } = useAuth();
  const navigate = useNavigate();

  const walletBalance = user?.walletBalance || 840;

  // Get recent 3 transactions
  const recentTx = transactions.slice(0, 3);

  return (
    <div id="wallet" className="pg on" style={{ padding: '24px', background: 'var(--cs-bg-light)', minHeight: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Wallet Banner */}
      <div style={{ background: 'var(--cs-primary-gradient)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>CampusSkills wallet</div>
          <div style={{ fontSize: '32px', fontWeight: 600, color: '#fff' }}>₹{walletBalance.toFixed(2)}</div>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>Linked: HDFC ••42 · SBI ••87</div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => navigate('/app/add-money')} 
            style={{ fontSize: '14px', padding: '10px 20px', borderRadius: 'var(--cs-radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600, background: 'var(--cs-bg-white)', color: 'var(--cs-primary-dark)' }}
          >
            + Add money
          </button>
          <button 
            onClick={() => navigate('/app/withdraw')} 
            style={{ fontSize: '14px', padding: '10px 20px', borderRadius: 'var(--cs-radius-md)', border: 'none', cursor: 'pointer', fontWeight: 600, background: 'rgba(255, 255, 255, 0.2)', color: '#fff' }}
          >
            Withdraw to bank
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <StatCard 
          icon={<IconArrowDownRight size={16} />}
          iconBg="#E1F5EE"
          iconColor="#0F6E56"
          value="₹1,200"
          label="Earned this month"
        />
        <StatCard 
          icon={<IconArrowUpRight size={16} />}
          iconBg="#FAECE7"
          iconColor="#993C1D"
          value="₹360"
          label="Spent this month"
        />
      </div>

      {/* Transactions List */}
      <div style={{ background: 'var(--cs-bg-white)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', border: '0.5px solid var(--cs-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Recent transactions</span>
          <button 
            onClick={() => navigate('/app/history')}
            style={{ fontSize: '13px', color: 'var(--cs-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
          >
            Full history
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {recentTx.map(tx => (
            <TransactionListItem
              key={tx.id}
              type={tx.type}
              title={tx.title}
              desc={tx.desc}
              amount={tx.amount}
              date={tx.date}
            />
          ))}

          {recentTx.length === 0 && (
            <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', padding: '32px 0', textAlign: 'center' }}>
              No transactions yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default Wallet;
