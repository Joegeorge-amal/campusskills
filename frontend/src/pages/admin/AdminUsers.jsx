import React, { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';

const AdminUsers = () => {
  const { adminUsers, adminSuspendStudent } = useAppData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredUsers = adminUsers.filter(user => {
    if (activeFilter === 'Active' && !user.active) return false;
    if (activeFilter === 'Suspended' && user.active) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const email = `${user.name.toLowerCase().replace(' ', '.')}@college.edu`;
      if (
        !user.name.toLowerCase().includes(q) &&
        !email.includes(q) &&
        !(user.meta && user.meta.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">User Management</h1>
          <p className="admin-page-subtitle">Manage student accounts, suspensions, and trust scores.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <div className="admin-search-wrapper">
            <IconSearch size={16} className="admin-search-icon" />
            <input 
              type="text" 
              className="admin-search-input" 
              placeholder="Search users..." 
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
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Branch / Year</th>
              <th style={{ textAlign: 'center' }}>Sessions</th>
              <th style={{ textAlign: 'center' }}>Trust Score</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, idx) => (
                <tr key={idx}>
                  <td>
                    <div className="admin-user-cell">
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: user.bg, color: user.col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600 }}>
                        {user.init}
                      </div>
                      <div className="admin-user-meta">
                        <span className="admin-user-name">{user.name}</span>
                        <span className="admin-user-sub">{user.name.toLowerCase().replace(' ', '.')}@college.edu</span>
                      </div>
                    </div>
                  </td>
                  <td>{user.meta}</td>
                  <td style={{ textAlign: 'center', fontWeight: 500 }}>{user.sessions}</td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ color: user.rating >= 4.5 ? '#10b981' : user.rating >= 3.5 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
                      {Math.round(user.rating * 20)}%
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {user.active ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-danger">Suspended</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {user.active ? (
                      <button 
                        className="admin-btn admin-btn-outline" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444' }}
                        onClick={() => adminSuspendStudent(user.name)}
                      >
                        Suspend
                      </button>
                    ) : (
                      <button 
                        className="admin-btn admin-btn-outline" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#10b981' }}
                      >
                        Reinstate
                      </button>
                    )}
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

export default AdminUsers;
