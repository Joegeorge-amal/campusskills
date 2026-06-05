import React from 'react';
import { Link } from 'react-router-dom';
import { IconChevronLeft, IconSearch, IconAdjustmentsHorizontal } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';
import '../../styles/admin.css';

const AdminReports = () => {
  const { adminReports, adminDismissReport } = useAppData();

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

      <div className="admin-search-bar">
        <div className="admin-search-input-wrapper">
          <IconSearch className="admin-search-icon" size={20} />
          <input 
            type="text" 
            className="admin-search-input" 
            placeholder="Search by student, tutor or reason..." 
          />
        </div>
        <button className="admin-filter-btn">
          <IconAdjustmentsHorizontal size={20} /> Filters
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {adminReports.length === 0 ? (
          <div className="admin-card" style={{ textAlign: 'center', padding: '48px', color: '#6b7280' }}>
            No disputes or reports found.
          </div>
        ) : (
          adminReports.map((report) => (
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
                {report.student} vs {report.tutor}
              </div>
              
              <div style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '24px' }}>
                {report.reason} · Amount: ₹{report.amount || 200}
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
