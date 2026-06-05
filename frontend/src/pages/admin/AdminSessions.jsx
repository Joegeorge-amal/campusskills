import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconSearch, IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';
import '../../styles/admin.css';

const AdminSessions = () => {
  const { adminSessions } = useAppData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Composite Filter & Search Logic
  const filteredSessions = adminSessions.filter(session => {
    // Filter State
    if (activeFilter !== 'All' && session.status.toLowerCase() !== activeFilter.toLowerCase()) return false;

    // Search Query (title, participants)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !session.title.toLowerCase().includes(q) &&
        !session.participants.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const getBadgeStyle = (status) => {
    if (status === 'LIVE' || status === 'Active') {
      return { background: '#dcfce7', color: '#166534' };
    }
    return { background: '#f3f4f6', color: '#4b5563' };
  };

  return (
    <div className="admin-sessions fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <Link to="/admin/dashboard" className="admin-back-btn">
            <IconChevronLeft size={20} /> Back
          </Link>
          Live & Upcoming Sessions
        </h1>
      </div>

      <div className="admin-search-bar" style={{ position: 'relative' }}>
        <div className="admin-search-input-wrapper">
          <IconSearch className="admin-search-icon" size={20} />
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Search by skill, tutor or learner..." 
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
              {['All', 'Live', 'Upcoming', 'Completed'].map(filterOption => (
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

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {filteredSessions.length === 0 ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            No sessions found matching the criteria.
          </div>
        ) : (
          filteredSessions.map((session) => (
            <div key={session.id} className="admin-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827' }}>
                    {session.title}
                  </span>
                  {(session.status === 'LIVE' || session.status === 'Active') && (
                    <span style={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '2px 8px', 
                      borderRadius: '100px', 
                      fontSize: '0.65rem', 
                      fontWeight: 700,
                      letterSpacing: '0.5px',
                      ...getBadgeStyle('LIVE')
                    }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#166534' }}></div>
                      LIVE
                    </span>
                  )}
                </div>
                
                <div style={{ fontSize: '0.9rem', color: '#6b7280', marginBottom: '4px' }}>
                  {session.participants.replace('→', '→')} 
                  {/* Note: In data it might be simple string, matching the "Priya S. -> Arjun K." format */}
                </div>
                
                <div style={{ fontSize: '0.85rem', color: '#9ca3af' }}>
                  {session.dateTime} · Online · {session.amount === 'Swap' ? 'Swap' : `₹${session.amount.replace('₹', '')}`}
                </div>
              </div>

              <button style={{ 
                padding: '8px 24px', 
                background: '#ffffff', 
                border: '1px solid #e5e7eb', 
                color: '#111827', 
                borderRadius: '8px', 
                fontSize: '0.9rem', 
                fontWeight: 600, 
                cursor: 'pointer' 
              }}>
                Cancel
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminSessions;
