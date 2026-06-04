import React from 'react';
import { 
  IconCurrencyRupee, 
  IconBuildingBank, 
  IconCreditCard, 
  IconArrowsExchange, 
  IconReceipt 
} from '@tabler/icons-react';
import './TransactionListItem.css';

const TransactionListItem = ({
  type,
  title,
  desc,
  amount,
  date
}) => {
  // Determine styles and icon based on transaction type
  let bg = 'var(--cs-bg-light)';
  let color = 'var(--cs-text-inactive)';
  let IconComponent = IconReceipt;
  let amtClass = '';

  switch (type) {
    case 'received':
      bg = '#E1F5EE';
      color = '#0F6E56';
      IconComponent = IconCurrencyRupee;
      amtClass = 'tx-amt-cr';
      break;
    case 'withdrawn':
      bg = '#E6F1FB';
      color = '#185FA5';
      IconComponent = IconBuildingBank;
      amtClass = 'tx-amt-dr';
      break;
    case 'paid':
      bg = '#FAECE7';
      color = '#993C1D';
      IconComponent = IconCreditCard;
      amtClass = 'tx-amt-dr';
      break;
    case 'swap':
      bg = 'var(--cs-primary-light)';
      color = 'var(--cs-primary)';
      IconComponent = IconArrowsExchange;
      amtClass = 'tx-amt-ex';
      break;
    default:
      break;
  }

  return (
    <div className="tx-list-item">
      <div className="tx-icon" style={{ background: bg, color: color }}>
        <IconComponent size={20} />
      </div>
      <div className="tx-info">
        <div className="tx-title">{title}</div>
        <div className="tx-desc">{desc}</div>
      </div>
      <div className="tx-meta">
        <div className={`tx-amount ${amtClass}`}>{amount}</div>
        <div className="tx-date">{date}</div>
      </div>
    </div>
  );
};

export default TransactionListItem;
