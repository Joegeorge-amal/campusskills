import React, { useState, useRef, useEffect } from 'react';
import { IconSearch, IconAdjustmentsHorizontal, IconChevronDown } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';
import '../../styles/admin.css';

const AdminUsers = () => {
  const { adminUsers, adminSuspendStudent } = useAppData();
  
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
    <div className="admin-users-page fade-in">
      {/* Top Search Bar */}
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

      {/* Users List */}
      <div className="admin-users-list">
        {filteredUsers.length === 0 ? (
          <div className="admin-users-empty">No users found matching your criteria.</div>
        ) : (
          filteredUsers.map((user, idx) => (
            <div key={idx} className="admin-user-row">
              <div className="au-row-left">
                <div className="au-avatar" style={{background: user.bg, color: user.col}}>
                  {user.init}
                </div>
                <div className="au-info">
                  <div className="au-name">{user.name}</div>
                  <div className="au-meta">
                    {user.name.toLowerCase().replace(' ', '.')}@college.edu · {user.meta}
                  </div>
                </div>
              </div>
              <div className="au-row-right">
                <div className="au-stats">
                  <div className="au-sessions">{user.sessions} sessions</div>
                  <div className="au-trust">Trust {Math.round(user.rating * 20)}%</div>
                </div>
                <div className="au-status">
                  {user.active ? (
                    <span className="au-pill active">active</span>
                  ) : (
                    <span className="au-pill suspended">suspended</span>
                  )}
                </div>
                <div className="au-action">
                  {user.active ? (
                    <button 
                      className="au-btn-suspend"
                      onClick={() => adminSuspendStudent(user.name)}
                    >
                      Suspend
                    </button>
                  ) : (
                    <button className="au-btn-reinstate">
                      Reinstate
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
