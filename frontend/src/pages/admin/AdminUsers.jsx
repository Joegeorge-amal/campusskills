import React, { useState, useEffect } from 'react';
import { IconSearch, IconLoader2 } from '@tabler/icons-react';
import adminService from '../../services/adminService';
import CustomSelect from '../../components/common/CustomSelect';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal from '../../components/modals/ConfirmModal';
import '../../styles/admin.css';

const bgColors = ['#f0fdf4', '#eff6ff', '#fdf2f8', '#fffbeb', '#fef2f2'];
const textColors = ['#166534', '#1e40af', '#9d174d', '#92400e', '#991b1b'];
const getAvatarProps = (name) => {
  const idx = (name || '').length % bgColors.length;
  return { bg: bgColors[idx], col: textColors[idx], init: (name || 'U').charAt(0).toUpperCase() };
};

const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [confirmRoleChange, setConfirmRoleChange] = useState({ isOpen: false, user: null, newRole: null });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getUsers({
        q: searchQuery || undefined,
        status: activeFilter !== 'All' ? activeFilter : undefined
      });
      setUsers(res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const handleToggleStatus = async (user) => {
    try {
      const isActive = user.status === 'ACTIVE';
      await adminService.updateUserStatus(user.id, !isActive);
      fetchUsers();
    } catch (err) {
      console.error('Failed to toggle status:', err);
      alert('Failed to update user status.');
    }
  };

  const executeRoleChange = async () => {
    const { user, newRole } = confirmRoleChange;
    if (!user || !newRole) return;
    try {
      await adminService.updateUserRole(user.id, newRole);
      fetchUsers();
    } catch (err) {
      console.error('Failed to change role:', err);
      alert('Failed to update user role.');
    } finally {
      setConfirmRoleChange({ isOpen: false, user: null, newRole: null });
    }
  };

  const handleRoleChange = (user, newRole) => {
    setConfirmRoleChange({ isOpen: true, user, newRole });
  };

  return (
    <div className="admin-users-page fade-in">
      <ConfirmModal 
        isOpen={confirmRoleChange.isOpen}
        onClose={() => setConfirmRoleChange({ isOpen: false, user: null, newRole: null })}
        onConfirm={executeRoleChange}
        title="Change User Role"
        message={`Are you sure you want to change ${confirmRoleChange.user?.displayName}'s role to ${confirmRoleChange.newRole}?`}
        isDanger={true}
        confirmText="Change Role"
      />
      <div className="admin-users-toolbar">
        <div className="admin-u-search">
          <IconSearch size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ width: '180px' }}>
          <CustomSelect 
            value={activeFilter} 
            onChange={val => setActiveFilter(val)}
            options={[
              { value: 'All', label: 'All Users' },
              { value: 'Active', label: 'Active Users' },
              { value: 'Suspended', label: 'Suspended Users' }
            ]}
          />
        </div>
      </div>

      <div className="admin-users-list">
        {loading ? (
          <div className="admin-users-empty">
            <IconLoader2 className="spinner" size={24} style={{ marginBottom: '8px', color: '#3b82f6' }} />
            <div>Loading users...</div>
          </div>
        ) : error ? (
          <div className="admin-users-empty" style={{ color: '#ef4444' }}>{error}</div>
        ) : users.length === 0 ? (
          <div className="admin-users-empty">No users found matching your criteria.</div>
        ) : (
          users.map((user, idx) => {
            const { bg, col, init } = getAvatarProps(user.displayName);
            const isActive = user.status === 'ACTIVE';
            return (
              <div key={user.id || idx} className="admin-user-row">
                <div className="au-row-left">
                  <div className="au-avatar" style={{ background: bg, color: col }}>
                    {init}
                  </div>
                  <div className="au-info">
                    <div className="au-name">{user.displayName} <span style={{fontSize:'0.7rem', color:'#6b7280', marginLeft:'8px'}}>{user.role}</span></div>
                    <div className="au-meta">
                      {user.rollNo ? user.rollNo.toUpperCase() : user.email} · {user.course || 'No course'}
                    </div>
                  </div>
                </div>
                <div className="au-row-right">
                  <div className="au-stats">
                    <div className="au-sessions">{user.sessionCount || 0} sessions</div>
                    <div className="au-trust">Trust {user.trustScore || 0}%</div>
                  </div>
                  <div className="au-status">
                    {isActive ? (
                      <span className="au-pill active">active</span>
                    ) : (
                      <span className="au-pill suspended">suspended</span>
                    )}
                  </div>
                  <div className="au-action" style={{ display: 'flex', gap: '8px' }}>
                    {isActive ? (
                      <button 
                        className="au-btn-suspend"
                        onClick={() => handleToggleStatus(user)}
                      >
                        Suspend
                      </button>
                    ) : (
                      <button 
                        className="au-btn-reinstate"
                        onClick={() => handleToggleStatus(user)}
                      >
                        Reinstate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
