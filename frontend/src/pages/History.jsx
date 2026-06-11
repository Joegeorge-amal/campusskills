import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import TransactionListItem from '../components/common/TransactionListItem';
import CategoryFilterTabs from '../components/common/CategoryFilterTabs/CategoryFilterTabs';

const History = () => {
  const { transactions } = useAppData();

  return (
    <div id="history" className="pg on" style={{ padding: '32px 40px', backgroundColor: 'var(--cs-bg-light)', backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', minHeight: '100vh', boxSizing: 'border-box' }}>
      
      <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827', marginBottom: '24px' }}>
        Transaction history
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {transactions.map(tx => (
          <TransactionListItem
            key={tx.id}
            type={tx.type}
            title={tx.title}
            desc={tx.desc}
            amount={tx.amount}
            date={tx.date}
          />
        ))}

        {transactions.length === 0 && (
          <div style={{ fontSize: '14px', color: '#6b7280', padding: '48px 0', textAlign: 'center', background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            No transactions found.
          </div>
        )}
      </div>

    </div>
  );
};

export default History;
