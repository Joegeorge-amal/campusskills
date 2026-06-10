import React from 'react';
import { adminPaymentStats, adminTransactions } from '../../data/adminDashboardData';
import '../../styles/admin.css';

const AdminPayments = () => {
  return (
    <div className="admin-payments-page fade-in">
      
      {/* Top Stat Cards */}
      <div className="ap-stats-row">
        <div className="ap-stat-card ap-card-blue">
          <div className="ap-stat-label">TOTAL REVENUE</div>
          <div className="ap-stat-val">{adminPaymentStats.totalRevenue.value}</div>
          <div className="ap-stat-sub">{adminPaymentStats.totalRevenue.sub}</div>
        </div>
        
        <div className="ap-stat-card ap-card-yellow">
          <div className="ap-stat-label">PENDING PAYOUTS</div>
          <div className="ap-stat-val">{adminPaymentStats.pendingPayouts.value}</div>
          <div className="ap-stat-sub">{adminPaymentStats.pendingPayouts.sub}</div>
        </div>

        <div className="ap-stat-card ap-card-green">
          <div className="ap-stat-label">COMPLETED PAYOUTS</div>
          <div className="ap-stat-val">{adminPaymentStats.completedPayouts.value}</div>
          <div className="ap-stat-sub">{adminPaymentStats.completedPayouts.sub}</div>
        </div>
      </div>

      {/* Transactions List Area */}
      <div className="ap-transactions-panel">
        <div className="ap-panel-header">
          <h3>Recent Transactions</h3>
          <button className="ap-time-filter">Last 7 days</button>
        </div>
        
        <div className="ap-transaction-list">
          {adminTransactions.map(txn => (
            <div key={txn.id} className="ap-txn-row">
              <div className="ap-txn-left">
                <div className="ap-txn-path">{txn.path}</div>
                <div className="ap-txn-meta">{txn.meta}</div>
              </div>
              <div className="ap-txn-right">
                <div className="ap-txn-amount">{txn.amount}</div>
                <div className={`ap-status-pill ${txn.status}`}>{txn.status}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default AdminPayments;
