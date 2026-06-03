import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';

const AdminSessions = () => {
  const { adminSessions } = useAppData();
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Upcoming', 'Completed', 'Reported'];

  const filteredSessions = filter === 'All' 
    ? adminSessions 
    : adminSessions.filter(s => s.status === filter);

  return (
    <div id="adm-sessions" className="pg on">
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

      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '8px 12px', background: '#F5F4FF', fontSize: '11px', fontWeight: 500, color: '#888' }}>
          <span>Skill</span>
          <span>Participants (Tutor → Student)</span>
          <span>Date &amp; Time</span>
          <span>Amount</span>
          <span>Status</span>
        </div>

        {filteredSessions.map(session => (
          <div key={session.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1fr 1fr', padding: '9px 12px', borderTop: '0.5px solid rgba(0,0,0,.05)', alignItems: 'center' }}>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{session.title}</div>
            <div style={{ fontSize: '12px', color: '#555' }}>{session.participants}</div>
            <div style={{ fontSize: '11px', color: '#888' }}>{session.dateTime}</div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: session.amount === 'Swap' ? '#534AB7' : '#0F6E56' }}>{session.amount}</div>
            <div>
              <span style={{ fontSize: '10px', padding: '3px 8px', borderRadius: '20px', background: session.status === 'Completed' ? '#E1F5EE' : session.status === 'Reported' ? '#FAECE7' : '#EEEDFE', color: session.status === 'Completed' ? '#085041' : session.status === 'Reported' ? '#993C1D' : '#3C3489' }}>
                {session.status}
              </span>
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <div style={{ fontSize: '12px', color: '#888', padding: '20px 0', textAlign: 'center' }}>
            No sessions found matching this filter.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSessions;
