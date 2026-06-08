import React, { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';

const AdminSessions = () => {
  const { adminSessions } = useAppData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredSessions = adminSessions.filter(session => {
    if (activeFilter !== 'All' && session.status.toLowerCase() !== activeFilter.toLowerCase()) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !session.title.toLowerCase().includes(q) &&
        !session.participants.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const getBadgeClass = (status) => {
    if (status === 'LIVE' || status === 'Active') return 'badge badge-success';
    if (status === 'Upcoming') return 'badge badge-info';
    if (status === 'Completed') return 'badge badge-neutral';
    return 'badge badge-warning';
  };

  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Live & Upcoming Sessions</h1>
          <p className="admin-page-subtitle">Monitor platform sessions, participants, and payments.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <div className="admin-search-wrapper">
            <IconSearch size={16} className="admin-search-icon" />
            <input 
              type="text" 
              className="admin-search-input" 
              placeholder="Search by skill, tutor or learner..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="admin-header-actions">
            <select 
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Live">Live</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Topic</th>
              <th>Participants</th>
              <th>Date & Time</th>
              <th style={{ textAlign: 'center' }}>Amount</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  No sessions found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{session.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Online</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#334155' }}>
                      {session.participants.replace('→', ' → ')}
                    </div>
                  </td>
                  <td style={{ color: '#64748b', fontSize: '0.875rem' }}>
                    {session.dateTime}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 600, color: '#0f172a' }}>
                    {session.amount === 'Swap' ? 'Swap' : `₹${session.amount.replace('₹', '')}`}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={getBadgeClass(session.status)}>
                      {session.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="admin-btn admin-btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444' }}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSessions;
