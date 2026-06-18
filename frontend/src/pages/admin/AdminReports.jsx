import React, { useState, useEffect } from 'react';
import { IconSearch, IconLoader2, IconAlertTriangle, IconChevronDown, IconChevronUp, IconShieldCheck } from '@tabler/icons-react';
import adminService from '../../services/adminService';
import CustomSelect from '../../components/common/CustomSelect';

const AdminReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Modals state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  // Resolve Form State
  const [resolutionStatus, setResolutionStatus] = useState('UNDER_REVIEW');
  const [adminNotes, setAdminNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getReports({
        q: searchQuery || undefined,
        status: activeFilter !== 'All' ? activeFilter : undefined
      });
      setReports(res.data?.data || []);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError('Failed to load reports. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const openResolveModal = (report) => {
    setSelectedReport(report);
    setResolutionStatus(report.status === 'OPEN' ? 'UNDER_REVIEW' : report.status);
    setAdminNotes(report.adminNotes || '');
    setResolveModalOpen(true);
  };

  const handleResolveSubmit = async () => {
    try {
      setIsSubmitting(true);
      await adminService.updateReportStatus(selectedReport.id, { 
        status: resolutionStatus,
        adminNotes 
      });
      setResolveModalOpen(false);
      fetchReports();
    } catch (err) {
      console.error('Failed to update report status:', err);
      alert('Failed to update report status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-disputes-page fade-in">
      
      {/* Top Toolbar */}
      <div className="admin-reports-toolbar">
        <div className="admin-u-search">
          <IconSearch size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search by reason..." 
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
            className={`ar-pill ${activeFilter === 'OPEN' ? 'active' : ''}`}
            onClick={() => setActiveFilter('OPEN')}
          >
            Open
          </button>
          <button 
            className={`ar-pill ${activeFilter === 'UNDER_REVIEW' ? 'active' : ''}`}
            onClick={() => setActiveFilter('UNDER_REVIEW')}
          >
            Reviewing
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="admin-reports-list">
        {loading ? (
          <div className="ar-empty-state">
            <IconLoader2 className="spinner" size={24} style={{ marginBottom: '8px', color: '#3b82f6' }} />
            <div>Loading reports...</div>
          </div>
        ) : error ? (
          <div className="ar-empty-state" style={{ color: '#ef4444' }}>{error}</div>
        ) : reports.length === 0 ? (
          <div className="ar-empty-state">
            <div className="ar-empty-illustration">
              <div className="ar-empty-icon-ring">
                <IconShieldCheck size={48} strokeWidth={1.5} />
              </div>
            </div>
            <h3 className="ar-empty-title">All Clear!</h3>
            <p className="ar-empty-desc">No reports found matching your criteria.</p>
          </div>
        ) : (
          reports.map(report => {
            const isExpanded = expandedIds.has(report.id);
            
            return (
              <div key={report.id} className="ar-card">
                <div className="ar-card-header">
                  <div className="ar-badges">
                    <span className="ar-id-pill">#{report.id.substring(0, 8)}</span>
                    <span className={`ar-status-pill ${report.status?.toLowerCase() || 'open'}`}>{report.status || 'OPEN'}</span>
                  </div>
                  <div className="ar-header-actions">
                    <button onClick={() => openResolveModal(report)} className="ar-resolve-btn">Manage Report</button>
                    <button onClick={() => toggleExpand(report.id)} className="ar-view-details">
                      {isExpanded ? (
                        <>Hide details <IconChevronUp size={16} /></>
                      ) : (
                        <>View details <IconChevronDown size={16} /></>
                      )}
                    </button>
                  </div>
                </div>
                
                <div className="ar-card-body">
                  <div className="ar-parties-grid">
                    <div className="ar-party">
                      <span className="ar-party-label">Reporter</span>
                      <span className="ar-party-name">{report.reporterName || report.reporterId || 'Unknown'}</span>
                    </div>
                    <div className="ar-party">
                      <span className="ar-party-label">Reported User</span>
                      <span className="ar-party-name">{report.reportedName || report.reportedUserId || 'Unknown'}</span>
                    </div>
                    <div className="ar-party">
                      <span className="ar-party-label">Created Date</span>
                      <span className="ar-party-value">{new Date(report.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {report.adminNotes && (
                    <div className="ar-resolution-banner">
                      <strong>Admin Notes: </strong>
                      <p className="ar-notes">"{report.adminNotes}"</p>
                    </div>
                  )}

                  {isExpanded && (
                    <div className="ar-description-block fade-in">
                      <div className="ar-desc-section">
                        <h4>Reason</h4>
                        <p>{report.reason || 'No reason provided.'}</p>
                      </div>
                      <div className="ar-desc-section">
                        <h4>Details</h4>
                        <p>{report.details || 'No details provided.'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModalOpen && selectedReport && (
        <div className="admin-modal-overlay">
          <div className="admin-modal fade-in">
            <h3>Manage Report #{selectedReport.id.substring(0,8)}</h3>
            <div className="admin-modal-content">
              <div className="form-group">
                <label>Status</label>
                <CustomSelect 
                  value={resolutionStatus} 
                  onChange={val => setResolutionStatus(val)}
                  options={[
                    { value: 'OPEN', label: 'OPEN' },
                    { value: 'UNDER_REVIEW', label: 'UNDER REVIEW' },
                    { value: 'RESOLVED', label: 'RESOLVED' },
                    { value: 'DISMISSED', label: 'DISMISSED' }
                  ]}
                />
              </div>
              <div className="form-group">
                <label>Admin Notes</label>
                <textarea 
                  rows="4" 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter detailed reasoning..."
                />
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={() => setResolveModalOpen(false)} disabled={isSubmitting}>Cancel</button>
              <button className="btn-primary" onClick={handleResolveSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReports;
