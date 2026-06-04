import React from 'react';
import { useAppData } from '../../context/AppDataContext';
import Avatar from '../../components/common/Avatar';
import AdminTable from '../../components/common/AdminTable';
import { IconStar } from '@tabler/icons-react';

const AdminUsers = () => {
  const { adminUsers, adminSuspendStudent } = useAppData();

  const columns = ['Student', 'Year / Branch', 'Sessions', 'Trust score', 'Action'];
  const gridTemplate = '2fr 1fr 1fr 1fr 80px';

  return (
    <div id="adm-users" className="pg on">
      <AdminTable columns={columns} gridTemplate={gridTemplate} emptyText="No users found.">
        {adminUsers.map((user, idx) => (
          <div key={idx}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar letters={user.init} bgColor={user.bg} textColor={user.col} size="32px" fontSize="12px" />
              <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>
                {user.name} {!user.active && <span style={{ fontSize: '11px', color: 'var(--cs-danger)', marginLeft: '6px', fontWeight: 500 }}>(Suspended)</span>}
              </span>
            </div>
            <span style={{ fontSize: '13px', color: 'var(--cs-text-inactive)' }}>{user.meta}</span>
            <span style={{ fontSize: '13px', color: 'var(--cs-text-main)' }}>{user.sessions}</span>
            <span style={{ fontSize: '13px', color: 'var(--cs-warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconStar size={16} /> {user.rating}
            </span>
            
            {user.active ? (
              <button 
                onClick={() => adminSuspendStudent(user.name)} 
                style={{ fontSize: '12px', padding: '6px 12px', borderRadius: 'var(--cs-radius-sm)', border: 'none', background: 'var(--cs-danger-light)', color: 'var(--cs-danger)', cursor: 'pointer', fontWeight: 600 }}
              >
                Suspend
              </button>
            ) : (
              <span style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', fontStyle: 'italic' }}>Suspended</span>
            )}
          </div>
        ))}
      </AdminTable>
    </div>
  );
};

export default AdminUsers;
