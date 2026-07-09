import React, { useState, useEffect } from 'react';
import { 
  IconSearch, IconFilter, IconHistory, IconEye, 
  IconChevronLeft, IconChevronRight, IconFileSad 
} from '@tabler/icons-react';
import adminService from '../../services/adminService';
import Toast from '../../components/common/Toast';
import AuditLogDetailsModal from '../../components/modals/AuditLogDetailsModal';
import { formatDistanceToNow } from 'date-fns';

const AdminAuditLog = ({ isEmbedded = false }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page,
        limit,
        ...(searchQuery && { q: searchQuery }),
        ...(actionFilter && { action: actionFilter })
      };
      
      const res = await adminService.getAuditLogs(params);
      setLogs(res.data);
      setTotalPages(res.pagination.pages);
      setTotalRecords(res.pagination.total);
    } catch (err) {
      console.error('Failed to fetch audit logs:', err);
      setError('Failed to load audit logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, limit, actionFilter]);

  // Debounced Search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (page !== 1) setPage(1);
      else fetchLogs();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const absolute = date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
    const relative = formatDistanceToNow(date, { addSuffix: true });
    return (
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '13px', color: '#111827', fontWeight: '500' }}>{relative}</span>
        <span style={{ fontSize: '11px', color: '#6b7280' }}>{absolute}</span>
      </div>
    );
  };

  const getActionBadge = (action) => {
    let style = { bg: '#f3f4f6', color: '#4b5563', border: '#e5e7eb' };
    switch(action) {
      case 'PROMOTE_USER': style = { bg: '#fdf4ff', color: '#a21caf', border: '#f5d0fe' }; break;
      case 'DEMOTE_USER': style = { bg: '#fff7ed', color: '#c2410c', border: '#ffedd5' }; break;
      case 'SUSPEND_USER': style = { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' }; break;
      case 'UNSUSPEND_USER': style = { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' }; break;
    }
    return (
      <span style={{
        padding: '4px 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '600',
        background: style.bg, color: style.color, border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap'
      }}>
        {action}
      </span>
    );
  };

  return (
    <div className={isEmbedded ? '' : 'admin-management-container'}>
      {!isEmbedded && (
        <div className="admin-header-section">
          <div className="admin-header-title">
            <div className="admin-header-icon"><IconHistory size={24} /></div>
            <div>
              <h1>Audit Log</h1>
              <p>Immutable record of privileged administrative actions.</p>
            </div>
          </div>
        </div>
      )}

      {error && <Toast message={error} type="error" />}

      <div className={isEmbedded ? 'admin-card' : 'admin-card'} style={isEmbedded ? { margin: '24px' } : {}}>
        {/* Filters Bar */}
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: '300px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <IconSearch size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <input 
                type="text" 
                placeholder="Search actor or target name/email..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 12px 10px 40px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              />
            </div>
            
            <div style={{ position: 'relative' }}>
              <IconFilter size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
              <select 
                value={actionFilter}
                onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
                style={{ padding: '10px 32px 10px 40px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', appearance: 'none', background: 'white', cursor: 'pointer', minWidth: '150px' }}
              >
                <option value="">All Actions</option>
                <option value="PROMOTE_USER">Promote User</option>
                <option value="DEMOTE_USER">Demote User</option>
                <option value="SUSPEND_USER">Suspend User</option>
                <option value="UNSUSPEND_USER">Unsuspend User</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#4b5563' }}>
            Rows per page:
            <select 
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              style={{ padding: '6px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', cursor: 'pointer' }}
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <tr>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Time</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Actor</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Action</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Target</th>
                <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Loading audit logs...</td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#9ca3af' }}>
                      <IconFileSad size={48} stroke={1.5} style={{ marginBottom: '16px' }} />
                      <h3 style={{ fontSize: '16px', color: '#374151', fontWeight: '500', margin: '0 0 8px 0' }}>No Audit Logs Found</h3>
                      <p style={{ fontSize: '14px', margin: 0 }}>There are no records matching your current filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} style={{ borderBottom: '1px solid #e5e7eb', transition: 'background-color 0.15s' }}>
                    <td style={{ padding: '16px 20px' }}>
                      {formatTimestamp(log.timestamp)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{log.actorName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{log.actorEmail}</div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      {getActionBadge(log.action)}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{log.targetName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{log.targetEmail}</div>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button 
                        onClick={() => setSelectedLog(log)}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#e5e7eb'}
                        onMouseLeave={(e) => e.currentTarget.style.background = '#f3f4f6'}
                      >
                        <IconEye size={16} /> View
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!loading && logs.length > 0 && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Showing <span style={{ fontWeight: '500', color: '#111827' }}>{((page - 1) * limit) + 1}</span> to <span style={{ fontWeight: '500', color: '#111827' }}>{Math.min(page * limit, totalRecords)}</span> of <span style={{ fontWeight: '500', color: '#111827' }}>{totalRecords}</span> entries
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '6px 10px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', color: page === 1 ? '#9ca3af' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <IconChevronLeft size={18} />
              </button>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{ padding: '6px 10px', background: 'white', border: '1px solid #d1d5db', borderRadius: '6px', color: page === totalPages ? '#9ca3af' : '#374151', cursor: page === totalPages ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <IconChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedLog && (
        <AuditLogDetailsModal 
          log={selectedLog} 
          onClose={() => setSelectedLog(null)} 
        />
      )}
    </div>
  );
};

export default AdminAuditLog;
