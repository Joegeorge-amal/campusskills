import React, { useState } from 'react';
import { IconSearch } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';

const AdminReports = () => {
  const { adminReports, adminDismissReport } = useAppData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredReports = adminReports.filter(report => {
    if (activeFilter !== 'All' && report.status.toLowerCase() !== activeFilter.toLowerCase()) return false;

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

  const getBadgeClass = (status) => {
    if (status === 'open') return 'badge badge-danger';
    if (status === 'reviewing') return 'badge badge-warning';
    return 'badge badge-neutral';
  };

  return (
    <div className="fade-in">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Disputes & Reports</h1>
          <p className="admin-page-subtitle">Manage session disputes and user reports.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <div className="admin-search-wrapper">
            <IconSearch size={16} className="admin-search-icon" />
            <input 
              type="text" 
              className="admin-search-input" 
              placeholder="Search by ID, user, or reason..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="admin-header-actions">
            <select 
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Reviewing">Reviewing</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Parties Involved</th>
              <th>Issue Description</th>
              <th style={{ textAlign: 'center' }}>Amount</th>
              <th style={{ textAlign: 'center' }}>Status</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReports.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  No disputes or reports found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredReports.map((report) => (
                <tr key={report.id}>
                  <td style={{ fontWeight: 600, color: '#0f172a' }}>
                    D-{String(report.id).padStart(3, '0')}
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#0f172a' }}>{report.reporter}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>vs {report.target}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500, color: '#0f172a' }}>{report.title}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {report.desc}
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 500 }}>
                    ₹{report.amount || 200}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={getBadgeClass(report.status)}>
                      {report.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {report.status !== 'resolved' && (
                        <button 
                          className="admin-btn admin-btn-success" 
                          style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                          onClick={() => adminDismissReport(report.id)}
                        >
                          Resolve
                        </button>
                      )}
                      <button 
                        className="admin-btn admin-btn-outline" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReports;
