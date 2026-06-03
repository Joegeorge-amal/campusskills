import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';

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
    <div id="history" className="pg on">
      <div className="chiprow" style={{ marginBottom: '11px' }}>
        {filters.map(f => (
          <span 
            key={f} 
            className={`chip ${filter === f ? 'on' : ''}`} 
            onClick={() => setFilter(f)}
          >
            {f}
          </span>
        ))}
      </div>
      
      <div style={{ fontSize: '10px', fontWeight: 500, color: '#aaa', marginBottom: '6px', letterSpacing: '.05em', textTransform: 'uppercase' }}>
        May 2025
      </div>
      
      {filteredTx.map(tx => {
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

      {filteredTx.length === 0 && (
        <div style={{ fontSize: '12px', color: '#888', padding: '20px 0', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.08)' }}>
          No transactions found.
        </div>
      )}
    </div>
  );
};

export default History;
