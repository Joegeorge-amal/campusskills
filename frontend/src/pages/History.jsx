import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import TransactionListItem from '../components/common/TransactionListItem';
import CategoryFilterTabs from '../components/common/CategoryFilterTabs/CategoryFilterTabs';

const History = () => {
  const { transactions } = useAppData();
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Received', 'Paid out', 'Swaps', 'Withdrawals'];

  const filteredTx = filter === 'All' 
    ? transactions 
    : transactions.filter(tx => {
        if (filter === 'Received') return tx.type === 'received';
        if (filter === 'Paid out') return tx.type === 'paid';
        if (filter === 'Swaps') return tx.type === 'swap';
        if (filter === 'Withdrawals') return tx.type === 'withdrawn';
        return true;
      });

  return (
    <div id="history" className="pg on" style={{ padding: '24px', background: 'var(--cs-bg-light)', minHeight: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ marginBottom: '24px' }}>
        <CategoryFilterTabs 
          categories={filters}
          activeCategory={filter}
          onSelectCategory={setFilter}
        />
      </div>
      
      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', marginBottom: '16px', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
        May 2025
      </div>
      
      <div style={{ background: 'var(--cs-bg-white)', borderRadius: 'var(--cs-radius-lg)', padding: '0 24px', border: '0.5px solid var(--cs-border)' }}>
        {filteredTx.map(tx => (
          <TransactionListItem
            key={tx.id}
            type={tx.type}
            title={tx.title}
            desc={tx.desc}
            amount={tx.amount}
            date={tx.date}
          />
        ))}

        {filteredTx.length === 0 && (
          <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', padding: '48px 0', textAlign: 'center' }}>
            No transactions found.
          </div>
        )}
      </div>

    </div>
  );
};

export default History;
