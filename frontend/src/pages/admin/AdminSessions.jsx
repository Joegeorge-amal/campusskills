import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import AdminTable from '../../components/common/AdminTable';
import CategoryFilterTabs from '../../components/common/CategoryFilterTabs/CategoryFilterTabs';
import StatusBadge from '../../components/common/StatusBadge';

const AdminSessions = () => {
  const { adminSessions } = useAppData();
  const [filter, setFilter] = useState('All');

  const filters = ['All', 'Upcoming', 'Completed', 'Reported'];

  const filteredSessions = filter === 'All' 
    ? adminSessions 
    : adminSessions.filter(s => s.status === filter);

  const columns = ['Skill', 'Participants (Tutor → Student)', 'Date & Time', 'Amount', 'Status'];
  const gridTemplate = '2fr 1.5fr 1fr 1fr 1fr';

  return (
    <div id="adm-sessions" className="pg on">
      <div style={{ marginBottom: '16px' }}>
        <CategoryFilterTabs 
          categories={filters}
          activeCategory={filter}
          onSelectCategory={setFilter}
        />
      </div>

      <AdminTable columns={columns} gridTemplate={gridTemplate} emptyText="No sessions found matching this filter.">
        {filteredSessions.map(session => (
          <div key={session.id}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{session.title}</div>
            <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)' }}>{session.participants}</div>
            <div style={{ fontSize: '13px', color: 'var(--cs-text-main)' }}>{session.dateTime}</div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: session.amount === 'Swap' ? 'var(--cs-primary)' : 'var(--cs-success)' }}>{session.amount}</div>
            <div>
              <StatusBadge status={session.status} />
            </div>
          </div>
        ))}
      </AdminTable>
    </div>
  );
};

export default AdminSessions;
