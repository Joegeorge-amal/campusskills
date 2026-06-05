import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconSearch, IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';
import Avatar from '../../components/common/Avatar';
import '../../styles/admin.css';

const AdminUsers = () => {
  const { adminUsers, adminSuspendStudent } = useAppData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Composite Filter & Search Logic
  const filteredUsers = adminUsers.filter(user => {
    // Filter State
    if (activeFilter === 'Active' && !user.active) return false;
    if (activeFilter === 'Suspended' && user.active) return false;

    // Search Query (name, email, meta)
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
    <div className="admin-users fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <Link to="/admin/dashboard" className="admin-back-btn">
            <IconChevronLeft size={20} /> Back
          </Link>
          User Management
        </h1>
      </div>

      <div className="admin-search-bar" style={{ position: 'relative' }}>
        <div className="admin-search-input-wrapper">
          <IconSearch className="admin-search-icon" size={20} />
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Search by name, email or branch..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div style={{ position: 'relative' }}>
          <button 
            className="admin-filter-btn" 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            style={{ position: 'relative', zIndex: 10 }}
          >
            <IconAdjustmentsHorizontal size={20} /> 
            {activeFilter === 'All' ? 'Filters' : `Filter: ${activeFilter}`}
          </button>
          
          {isFilterOpen && (
            <div style={{
              position: 'absolute',
              top: '110%',
              right: '0',
              width: '180px',
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 50,
              padding: '8px 0',
              overflow: 'hidden'
            }}>
              {['All', 'Active', 'Suspended'].map(filterOption => (
                <div 
                  key={filterOption}
                  onClick={() => { setActiveFilter(filterOption); setIsFilterOpen(false); }}
                  style={{
                    padding: '10px 16px',
                    fontSize: '0.9rem',
                    fontWeight: activeFilter === filterOption ? 600 : 500,
                    color: activeFilter === filterOption ? '#4f46e5' : '#374151',
                    background: activeFilter === filterOption ? '#f9fafb' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (activeFilter !== filterOption) e.target.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    if (activeFilter !== filterOption) e.target.style.background = 'transparent';
                  }}
                >
                  {filterOption}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '0.95rem' }}>
            No users match the current search and filter criteria.
          </div>
        ) : (
          filteredUsers.map((user, idx) => (
            <div 
              key={idx} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                padding: '20px 24px',
                borderBottom: idx < filteredUsers.length - 1 ? '1px solid #e5e7eb' : 'none'
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
          ))
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
