import React from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconSearch, IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';
import Avatar from '../../components/common/Avatar';
import '../../styles/admin.css';

const AdminUsers = () => {
  const { adminUsers, adminSuspendStudent } = useAppData();

  return (
    <div className="admin-users fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <Link to="/admin/dashboard" className="admin-back-btn">
            <IconChevronLeft size={20} /> Back
          </Link>
          User Management
        </h1>
      </div>

      <div className="admin-search-bar">
        <div className="admin-search-input-wrapper">
          <IconSearch className="admin-search-icon" size={20} />
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Search by name or email..." 
          />
        </div>
        <button className="admin-filter-btn">
          <IconAdjustmentsHorizontal size={20} /> Filters
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {adminUsers.map((user, idx) => (
          <div 
            key={idx} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between', 
              padding: '20px 24px',
              borderBottom: idx < adminUsers.length - 1 ? '1px solid #e5e7eb' : 'none'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Avatar letters={user.init} bgColor={user.bg} textColor={user.col} size="48px" fontSize="16px" />
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                  {user.name.toLowerCase().replace(' ', '.')}@college.edu · {user.meta}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>
                  {user.sessions} sessions
                </div>
                <div style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  Trust: {user.rating * 20}%
                </div>
              </div>

              {user.active ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '160px', justifyContent: 'flex-end' }}>
                  <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                    active
                  </span>
                  <button 
                    onClick={() => adminSuspendStudent(user.name)}
                    style={{ padding: '6px 16px', background: '#ffffff', border: '1px solid #fca5a5', color: '#ef4444', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Suspend
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '160px', justifyContent: 'flex-end' }}>
                  <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: '100px', fontSize: '0.75rem', fontWeight: 600 }}>
                    suspended
                  </span>
                  <button 
                    style={{ padding: '6px 16px', background: '#ffffff', border: '1px solid #86efac', color: '#10b981', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Reinstate
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUsers;
