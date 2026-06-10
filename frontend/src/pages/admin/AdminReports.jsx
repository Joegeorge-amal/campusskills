import React, { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';
import { adminDisputesDetailed } from '../../data/adminDashboardData';

const AdminReports = () => {
  const { adminDismissReport } = useAppData();
  
  // Use new detailed mock data, but preserve local state so we can 'resolve' them
  const [localDisputes, setLocalDisputes] = useState(adminDisputesDetailed);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredDisputes = localDisputes.filter(disp => {
    if (activeFilter !== 'All' && disp.status.toLowerCase() !== activeFilter.toLowerCase()) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !disp.id.toLowerCase().includes(q) &&
        !disp.parties.toLowerCase().includes(q) &&
        !disp.meta.toLowerCase().includes(q) &&
        !disp.description.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleResolve = (id) => {
    // 1. Remove from local detailed UI state
    setLocalDisputes(prev => prev.filter(d => d.id !== id));
    
    // 2. Preserve existing moderation callback workflow
    // If the ID format matches what the context expects, this will clean up the global state too.
    // In our mock data, IDs are like 'D-041'. If context expects numeric, we can parse it, 
    // but calling it guarantees we don't regress workflows.
    const numericId = parseInt(id.replace('D-', ''), 10);
    if (!isNaN(numericId)) {
      adminDismissReport(numericId);
    }
  };

  return (
    <div className="admin-disputes-page fade-in">
      
      {/* Top Toolbar */}
      <div className="admin-reports-toolbar">
        <div className="ar-search-wrapper">
          <IconSearch size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search by student, tutor or reason..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="ar-filter-pills">
          <button 
            className={`ar-pill ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </button>
          <button 
            className={`ar-pill ${activeFilter === 'Open' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Open')}
          >
            Open
          </button>
          <button 
            className={`ar-pill ${activeFilter === 'Reviewing' ? 'active' : ''}`}
            onClick={() => setActiveFilter('Reviewing')}
          >
            Reviewing
          </button>
        </div>
      </div>

      {/* Disputes List */}
      <div className="admin-reports-list">
        {filteredDisputes.length === 0 ? (
          <div className="ar-empty-state">No disputes found matching your criteria.</div>
        ) : (
          filteredDisputes.map(disp => (
            <div key={disp.id} className="ar-card">
              <div className="ar-card-header">
                <div className="ar-badges">
                  <span className="ar-id-pill">{disp.id}</span>
                  <span className={`ar-status-pill ${disp.status}`}>{disp.status}</span>
                </div>
                <div className="ar-header-actions">
                  {/* Keep resolve workflow via a subtle action or as part of details view */}
                  <button onClick={() => handleResolve(disp.id)} className="ar-resolve-btn" style={{ marginRight: '16px', background: 'transparent', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Resolve</button>
                  <button className="ar-view-details">View details &rarr;</button>
                </div>
              </div>
              
              <div className="ar-card-body">
                <h3 className="ar-parties">{disp.parties}</h3>
                <p className="ar-meta">{disp.meta}</p>
                <div className="ar-description-block">
                  {disp.description}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default AdminReports;
