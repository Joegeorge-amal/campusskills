import React from 'react';
import { useAppData } from '../../context/AppDataContext';
import ModerationCard from '../../components/common/ModerationCard';

const AdminReports = () => {
  const { adminReports, adminWarnUser, adminSuspendStudent, adminIssueRefund, adminDismissReport } = useAppData();

  const openReports = adminReports.filter(r => r.status === 'open');

  return (
    <div id="adm-reports" className="pg on">
      <div style={{ fontSize: '14px', color: 'var(--cs-text-inactive)', marginBottom: '16px', fontWeight: 500 }}>
        {openReports.length} open report{openReports.length !== 1 ? 's' : ''} requiring review
      </div>
      
      {openReports.map(report => (
        <ModerationCard 
          key={report.id}
          report={report}
          onWarn={adminWarnUser}
          onSuspend={adminSuspendStudent}
          onRefund={adminIssueRefund}
          onDismiss={adminDismissReport}
        />
      ))}

      {openReports.length === 0 && (
        <div style={{ fontSize: '14px', color: 'var(--cs-text-inactive)', padding: '40px 0', textAlign: 'center', background: 'var(--cs-bg-white)', borderRadius: 'var(--cs-radius-lg)', border: '0.5px solid var(--cs-border)' }}>
          No open reports to review.
        </div>
      )}
    </div>
  );
};

export default AdminReports;
