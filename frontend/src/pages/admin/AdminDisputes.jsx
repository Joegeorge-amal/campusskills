import React, { useState, useEffect } from 'react';
import { IconSearch, IconLoader2, IconAlertTriangle, IconChevronDown, IconChevronUp, IconShieldCheck } from '@tabler/icons-react';
import adminService from '../../services/adminService';
import CustomSelect from '../../components/common/CustomSelect';

const AdminDisputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [expandedIds, setExpandedIds] = useState(new Set());

  // Modals state
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [forceCompleteModalOpen, setForceCompleteModalOpen] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  
  // Resolve Form State
  const [resolutionType, setResolutionType] = useState('WARNING_ISSUED');
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

  const openResolveModal = (dispute) => {
    setSelectedDispute(dispute);
    setResolutionType('WARNING_ISSUED');
    setAdminNotes(dispute.adminNotes || '');
    setResolveModalOpen(true);
  };

  const openForceCompleteModal = (dispute) => {
    setSelectedDispute(dispute);
    setForceCompleteModalOpen(true);
  };

  const handleResolveSubmit = async () => {
    if (!adminNotes.trim()) {
      alert("Admin notes are required for resolution.");
      return;
    }
    try {
      setIsSubmitting(true);
      await adminService.updateDisputeStatus(selectedDispute._id, { 
        status: 'RESOLVED',
        resolutionType,
        adminNotes 
      });
      setResolveModalOpen(false);
      fetchDisputes();
    } catch (err) {
      console.error('Failed to resolve dispute:', err);
      alert('Failed to resolve dispute.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForceComplete = async () => {
    try {
      setIsSubmitting(true);
      await adminService.forceCompleteSession(selectedDispute.sessionId);
      
      // Auto resolve the dispute too
      await adminService.updateDisputeStatus(selectedDispute._id, { 
        status: 'RESOLVED',
        resolutionType: 'FORCE_COMPLETE',
        adminNotes: 'Auto-resolved via Force Complete Session action.' 
      });
      
      setForceCompleteModalOpen(false);
      fetchDisputes();
    } catch (err) {
      console.error('Failed to force complete session:', err);
      alert(err.response?.data?.error || 'Failed to force complete session.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReasonColor = (reason) => {
    switch (reason) {
      case 'PAYMENT_EVASION': return '#ef4444'; // Red
      case 'QUALITY_ISSUE': return '#f97316'; // Orange
      case 'NO_SHOW': return '#eab308'; // Yellow
      case 'CONDUCT_VIOLATION': return '#a855f7'; // Purple
      case 'MISREPRESENTATION': return '#e11d48'; // Crimson
      default: return '#64748b'; // Gray
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
            className={`ar-pill ${activeFilter === 'OPEN' ? 'active' : ''}`}
            onClick={() => setActiveFilter('OPEN')}
          >
            Open
          </button>
          <button 
            className={`ar-pill ${activeFilter === 'IN_REVIEW' ? 'active' : ''}`}
            onClick={() => setActiveFilter('IN_REVIEW')}
          >
            Reviewing
          </button>
        </div>
      </div>

      {/* Disputes List */}
      <div className="admin-disputes-list">
        {loading ? (
          <div className="as-empty-state">
            <IconLoader2 className="spinner" size={24} style={{ marginBottom: '8px', color: '#3b82f6' }} />
            <div>Loading disputes...</div>
          </div>
        ) : error ? (
          <div className="as-empty-state" style={{ color: '#ef4444' }}>{error}</div>
        ) : disputes.length === 0 ? (
          <div className="as-empty-state">No disputes found matching your criteria.</div>
        ) : (
          disputes.map(disp => {
            const isExpanded = expandedIds.has(disp._id);
            const reasonColor = getReasonColor(disp.reasonType);
            
            const sessionData = disp.session || {};
            const sessionStatus = sessionData.status || 'UNKNOWN';
            const showForceComplete = sessionStatus !== 'COMPLETED' && disp.reasonType === 'PAYMENT_EVASION';
            
            const reporter = disp.reporter || {};
            const reported = disp.reported || {};

            return (
              <div key={disp._id} className="ar-card">
                <div className="ar-card-header">
                  <div className="ar-badges">
                    <span className="ar-id-pill">#{disp._id.substring(0, 8)}</span>
                    <span className="ar-reason-badge" style={{ backgroundColor: `${reasonColor}15`, color: reasonColor, border: `1px solid ${reasonColor}30` }}>
                      {disp.reasonType?.replace(/_/g, ' ') || 'OTHER'}
                    </span>
                    <span className={`ar-status-pill ${disp.status?.toLowerCase() || 'open'}`}>{disp.status || 'OPEN'}</span>
                  </div>
                  <div className="ar-header-actions">
                    {disp.status !== 'RESOLVED' && disp.status !== 'CLOSED' && (
                      <button onClick={() => openResolveModal(disp)} className="ar-resolve-btn">Resolve Dispute</button>
                    )}
                    {showForceComplete && (
                      <button onClick={() => openForceCompleteModal(disp)} className="ar-force-btn">
                        Force Complete Session
                      </button>
                    )}
                    <button onClick={() => toggleExpand(disp._id)} className="ar-view-details">
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
                      <span className="ar-party-name">{reporter.name || reporter.email || 'Unknown'}</span>
                    </div>
                    <div className="ar-party">
                      <span className="ar-party-label">Reported User</span>
                      <span className="ar-party-name">{reported.name || reported.email || 'Unknown'}</span>
                    </div>
                    <div className="ar-party">
                      <span className="ar-party-label">Session ID</span>
                      <span className="ar-party-value">{disp.sessionId.substring(0, 8)} <span className={`sess-status ${sessionStatus.toLowerCase()}`}>{sessionStatus}</span></span>
                    </div>
                    <div className="ar-party">
                      <span className="ar-party-label">Created Date</span>
                      <span className="ar-party-value">{new Date(disp.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {disp.status === 'RESOLVED' && (
                    <div className="ar-resolution-banner">
                      <strong>Resolution: </strong> {disp.resolutionType?.replace(/_/g, ' ')}
                      {disp.adminNotes && <p className="ar-notes">"{disp.adminNotes}"</p>}
                    </div>
                  )}

                  {isExpanded && (
                    <div className="ar-description-block fade-in">
                      <div className="ar-desc-section">
                        <h4>Description</h4>
                        <p>{disp.description || 'No description provided.'}</p>
                      </div>
                      
                      <div className="ar-desc-section">
                        <h4>Session Confirmation State</h4>
                        <div className="ar-confirm-state">
                          <span>Student ({sessionData.studentId?.substring(0,6) || 'Unknown'}): {sessionData.confirmedBy?.includes(sessionData.studentId) ? '✅' : '❌'}</span>
                          <span>Tutor ({sessionData.teacherId?.substring(0,6) || 'Unknown'}): {sessionData.confirmedBy?.includes(sessionData.teacherId) ? '✅' : '❌'}</span>
                        </div>
                      </div>

                      <div className="ar-desc-section">
                        <h4>Evidence</h4>
                        <div className="ar-evidence-placeholder">
                          <IconAlertTriangle size={16} /> No attachments uploaded for this dispute.
                        </div>
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
      {resolveModalOpen && selectedDispute && (
        <div className="admin-modal-overlay">
          <div className="admin-modal fade-in">
            <h3>Resolve Dispute #{selectedDispute._id.substring(0,8)}</h3>
            <div className="admin-modal-content">
              <div className="form-group">
                <label>Resolution Type</label>
                <CustomSelect 
                  value={resolutionType} 
                  onChange={val => setResolutionType(val)}
                  options={[
                    { value: 'FORCE_COMPLETE', label: 'FORCE COMPLETE' },
                    { value: 'REFUND_ISSUED', label: 'REFUND ISSUED' },
                    { value: 'WARNING_ISSUED', label: 'WARNING ISSUED' },
                    { value: 'NO_ACTION', label: 'NO ACTION' },
                    { value: 'REJECTED', label: 'REJECTED' }
                  ]}
                />
              </div>
              <div className="form-group">
                <label>Admin Notes</label>
                <textarea 
                  rows="4" 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Enter detailed reasoning for this resolution..."
                />
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={() => setResolveModalOpen(false)} disabled={isSubmitting}>Cancel</button>
              <button className="btn-primary" onClick={handleResolveSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Resolving...' : 'Confirm Resolution'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Complete Warning Modal */}
      {forceCompleteModalOpen && selectedDispute && (
        <div className="admin-modal-overlay">
          <div className="admin-modal warning-modal fade-in">
            <div className="warning-header">
              <IconAlertTriangle size={32} color="#ef4444" />
              <h3>Force Complete Session</h3>
            </div>
            <div className="admin-modal-content">
              <div className="warning-info">
                <p><strong>Session ID:</strong> {selectedDispute.sessionId}</p>
                <p><strong>Reporter:</strong> {selectedDispute.reporter?.name || selectedDispute.reporter?.email || 'Unknown'}</p>
                <p><strong>Reported:</strong> {selectedDispute.reported?.name || selectedDispute.reported?.email || 'Unknown'}</p>
                <p><strong>Reason:</strong> <span style={{color: '#ef4444', fontWeight: 600}}>{selectedDispute.reasonType}</span></p>
              </div>
              <div className="warning-text-box">
                <p>
                  Force Completing this session will mark it as COMPLETED and immediately allow the payment QR code to be generated. This action should only be used after reviewing the evidence.
                </p>
              </div>
            </div>
            <div className="admin-modal-actions">
              <button className="btn-cancel" onClick={() => setForceCompleteModalOpen(false)} disabled={isSubmitting}>Cancel</button>
              <button className="btn-danger" onClick={handleForceComplete} disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : 'Force Complete Session'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDisputes;
