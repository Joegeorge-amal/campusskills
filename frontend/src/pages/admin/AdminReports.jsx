import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconSearch, IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';
import '../../styles/admin.css';

const AdminReports = () => {
  const { adminReports, adminDismissReport } = useAppData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Composite Filter & Search Logic
  const filteredReports = adminReports.filter(report => {
    // Filter State
    if (activeFilter !== 'All' && report.status.toLowerCase() !== activeFilter.toLowerCase()) return false;

    // Search Query (id, reporter, target, title, desc)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const reportIdStr = `d-${String(report.id).padStart(3, '0')}`;
      if (
        !reportIdStr.includes(q) &&
        !(report.reporter && report.reporter.toLowerCase().includes(q)) &&
        !(report.target && report.target.toLowerCase().includes(q)) &&
        !(report.title && report.title.toLowerCase().includes(q)) &&
        !(report.desc && report.desc.toLowerCase().includes(q))
      ) {
        return false;
      }
    }
    return true;
  });

  // For the UI, we'll map the status strings to match the design aesthetics
  const getBadgeStyle = (status) => {
    if (status === 'open') {
      return { background: '#fee2e2', color: '#b91c1c' };
    }
    if (status === 'reviewing') {
      return { background: '#fef3c7', color: '#d97706' };
    }
    return { background: '#f3f4f6', color: '#4b5563' };
  };

  return (
    <div className="admin-reports fade-in">
      <div className="admin-page-header">
        <h1 className="admin-page-title">
          <Link to="/admin/dashboard" className="admin-back-btn">
            <IconChevronLeft size={20} /> Back
          </Link>
          Disputes & Reports
        </h1>
      </div>

      <div className="admin-search-bar" style={{ position: 'relative' }}>
        <div className="admin-search-input-wrapper">
          <IconSearch className="admin-search-icon" size={20} />
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Search by student, tutor or reason..." 
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
              {['All', 'Open', 'Reviewing', 'Resolved'].map(filterOption => (
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
        {filteredReports.length === 0 ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            No disputes or reports found matching the criteria.
          </div>
        ) : (
          filteredReports.map((report) => (
            <div key={report.id} className="admin-card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>
                  {`D-${String(report.id).padStart(3, '0')}`}
                </span>
                <span style={{ 
                  padding: '4px 10px', 
                  borderRadius: '100px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600,
                  textTransform: 'lowercase',
                  ...getBadgeStyle(report.status)
                }}>
                  {report.status}
                </span>
              </div>
              
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                {report.reporter} vs {report.target}
              </div>
              
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '24px', lineHeight: 1.5 }}>
                <span style={{ fontWeight: 600, color: '#374151' }}>{report.title}</span><br/>
                {report.desc} <br/>
                <span style={{ display: 'inline-block', marginTop: '6px' }}>Amount: ₹{report.amount || 200}</span>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button style={{ 
                  flex: 1, 
                  padding: '10px', 
                  background: '#ffffff', 
                  border: '1px solid #4f46e5', 
                  color: '#111827', 
                  borderRadius: '8px', 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}>
                  <span style={{ color: '#111827' }}>Message Student</span>
                </button>
                <button 
                  onClick={() => adminDismissReport(report.id)}
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    background: '#ffffff', 
                    border: '1px solid #e5e7eb', 
                    color: '#111827', 
                    borderRadius: '8px', 
                    fontSize: '0.9rem', 
                    fontWeight: 600, 
                    cursor: 'pointer' 
                  }}
                >
                  Dismiss
                </button>
                <button style={{ 
                  flex: 1, 
                  padding: '10px', 
                  background: '#ffffff', 
                  border: '1px solid #e5e7eb', 
                  color: '#111827', 
                  borderRadius: '8px', 
                  fontSize: '0.9rem', 
                  fontWeight: 600, 
                  cursor: 'pointer' 
                }}>
                  Escalate
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminReports;
