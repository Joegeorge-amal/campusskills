import React from 'react';
import { 
  IconCurrencyRupee, 
  IconBuildingBank, 
  IconCreditCard, 
  IconArrowsExchange, 
  IconReceipt 
} from '@tabler/icons-react';

const WalletTransactionItem = ({ type, title, desc, amount, date }) => {
  let bg = '#f3f4f6';
  let color = '#6b7280';
  let IconComponent = IconReceipt;
  let amtColor = '#111827';

  switch (type) {
    case 'received':
      bg = '#d1fae5'; // pale green
      color = '#059669'; // green
      IconComponent = IconCurrencyRupee;
      amtColor = '#059669'; // green
      break;
    case 'withdrawn':
      bg = '#e0f2fe'; // pale blue
      color = '#0284c7'; // blue
      IconComponent = IconBuildingBank;
      amtColor = '#dc2626'; // red
      break;
    case 'paid':
      bg = '#ffedd5'; // pale orange
      color = '#ea580c'; // orange/red
      IconComponent = IconCreditCard;
      amtColor = '#dc2626'; // red
      break;
    case 'swap':
      bg = '#e0e7ff'; // pale indigo
      color = '#4f46e5'; // indigo
      IconComponent = IconArrowsExchange;
      amtColor = '#4f46e5'; // indigo
      break;
    default:
      break;
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '16px',
      background: '#ffffff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      marginBottom: '12px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '8px',
        background: bg,
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: '16px',
        flexShrink: 0
      }}>
        <IconComponent size={20} stroke={2} />
      </div>
      
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: '#6b7280' }}>{desc}</div>
      </div>
      
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '14px', fontWeight: 600, color: amtColor, marginBottom: '2px' }}>{amount}</div>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>{date === '20 May' ? 'Today' : date}</div> {/* Small hack to match PNG today if needed, or just display date */}
      </div>
    </div>
  );
};

export default WalletTransactionItem;
