import React, { useState, useRef, useEffect } from 'react';
import { IconSearch, IconAdjustmentsHorizontal, IconChevronDown, IconLoader2 } from '@tabler/icons-react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
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
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleRoleChange = async (user, newRole) => {
    if (!window.confirm(`Are you sure you want to change ${user.displayName}'s role to ${newRole}?`)) {
      return;
    }
    try {
      await adminService.updateUserRole(user.id, newRole);
      fetchUsers();
    } catch (err) {
      console.error('Failed to change role:', err);
      alert('Failed to update user role.');
    }
  };

  return (
    <div className="admin-users-page fade-in">
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
        
        <div className="admin-u-filter-custom" ref={filterRef}>
          <button 
            className="admin-u-filter-btn"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <IconAdjustmentsHorizontal size={18} /> 
            {activeFilter === 'All' ? 'Filters' : `Filter: ${activeFilter}`}
            <IconChevronDown size={16} />
          </button>

          {isFilterOpen && (
            <div className="admin-u-filter-menu">
              {['All', 'Active', 'Suspended'].map(filter => (
                <button
                  key={filter}
                  className={`admin-u-filter-option ${activeFilter === filter ? 'selected' : ''}`}
                  onClick={() => {
                    setActiveFilter(filter);
                    setIsFilterOpen(false);
                  }}
                >
                  {filter === 'All' ? 'All Users' : `${filter} Users`}
                </button>
              ))}
            </div>
          )}
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
                      {user.email} · {user.course || 'No course'}
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
                    {currentUser?.role === 'super_admin' && user.role !== 'SUPER_ADMIN' && (
                      user.role === 'ADMIN' ? (
                        <button className="au-btn-suspend" onClick={() => handleRoleChange(user, 'USER')}>Demote</button>
                      ) : (
                        <button className="au-btn-reinstate" onClick={() => handleRoleChange(user, 'ADMIN')}>Promote</button>
                      )
                    )}
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
