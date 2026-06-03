import React from 'react';
import { useAppData } from '../../context/AppDataContext';
import Avatar from '../../components/common/Avatar';
import { IconStar } from '@tabler/icons-react';

const AdminUsers = () => {
  const { adminUsers, adminSuspendStudent } = useAppData();

  return (
    <div id="adm-users" className="pg on">
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '8px 12px', background: '#F5F4FF', fontSize: '11px', fontWeight: 500, color: '#888' }}>
          <span>Student</span>
          <span>Year / Branch</span>
          <span>Sessions</span>
          <span>Trust score</span>
          <span>Action</span>
        </div>

        {adminUsers.map((user, idx) => (
          <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '9px 12px', borderTop: '0.5px solid rgba(0,0,0,.05)', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Avatar letters={user.init} bgColor={user.bg} textColor={user.col} size="28px" fontSize="10px" />
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>
                {user.name} {!user.active && <span style={{ fontSize: '10px', color: '#E24B4A', marginLeft: '4px' }}>(Suspended)</span>}
              </span>
            </div>
            <span style={{ fontSize: '11px', color: '#888' }}>{user.meta}</span>
            <span style={{ fontSize: '12px', color: '#555' }}>{user.sessions}</span>
            <span style={{ fontSize: '12px', color: '#BA7517' }}><IconStar /> {user.rating}</span>
            
            {user.active ? (
              <button 
                onClick={() => adminSuspendStudent(user.name)} 
                style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#E24B4A', cursor: 'pointer' }}
              >
                Suspend
              </button>
            ) : (
              <span style={{ fontSize: '11px', color: '#aaa', fontStyle: 'italic' }}>Suspended</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
