import React, { useState, useEffect } from 'react';
import { IconSearch, IconLoader2 } from '@tabler/icons-react';
import adminService from '../../services/adminService';

const AdminReports = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchDisputes = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getDisputes({
        q: searchQuery || undefined,
        status: activeFilter !== 'All' ? activeFilter : undefined
      });
      setDisputes(res.data || []);
    } catch (err) {
      console.error('Failed to fetch disputes:', err);
      setError('Failed to load disputes. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchDisputes();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const handleResolve = async (id) => {
    try {
      await adminService.updateDisputeStatus(id, { status: 'RESOLVED' });
      fetchDisputes();
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
      alert('Failed to resolve dispute.');
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
        {loading ? (
          <div className="ar-empty-state">
            <IconLoader2 className="spinner" size={24} style={{ marginBottom: '8px', color: '#3b82f6' }} />
            <div>Loading disputes...</div>
          </div>
        ) : error ? (
          <div className="ar-empty-state" style={{ color: '#ef4444' }}>{error}</div>
        ) : disputes.length === 0 ? (
          <div className="ar-empty-state">No disputes found matching your criteria.</div>
        ) : (
          disputes.map(disp => {
            const displayParties = disp.participants || disp.parties || 'Unknown Parties';
            const displayDesc = disp.reason || disp.description || 'No reason provided';
            const displayMeta = disp.amount ? `${disp.currency || 'INR'} ${disp.amount}` : (disp.meta || '');
            const displayId = disp.id ? disp.id.substring(0, 8) : 'Unknown';
            return (
              <div key={disp.id} className="ar-card">
                <div className="ar-card-header">
                  <div className="ar-badges">
                    <span className="ar-id-pill">#{displayId}</span>
                    <span className={`ar-status-pill ${disp.status?.toLowerCase() || 'open'}`}>{disp.status || 'open'}</span>
                  </div>
                  <div className="ar-header-actions">
                    <button onClick={() => handleResolve(disp.id)} className="ar-resolve-btn" style={{ marginRight: '16px', background: 'transparent', border: 'none', color: '#10b981', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>Resolve</button>
                    <button onClick={() => toggleExpand(disp.id)} className="ar-view-details" style={{ background: 'transparent', border: 'none', color: '#3b82f6', fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem' }}>
                      {expandedIds.has(disp.id) ? 'Hide details \u2191' : 'View details \u2192'}
                    </button>
                  </div>
                </div>
                
                <div className="ar-card-body">
                  <h3 className="ar-parties">{displayParties}</h3>
                  <p className="ar-meta">{displayMeta}</p>
                  {expandedIds.has(disp.id) && (
                    <div className="ar-description-block" style={{ animation: 'adminSlideUpFade 0.3s ease forwards', color: '#475569' }}>
                      <strong>Dispute Report:</strong><br/><br/>
                      {displayDesc}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default AdminReports;
