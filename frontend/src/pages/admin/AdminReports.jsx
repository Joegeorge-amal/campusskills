import React from 'react';
import { useAppData } from '../../context/AppDataContext';
import { IconAlertTriangle, IconAlertCircle, IconBan, IconCurrencyRupee } from '@tabler/icons-react';

const AdminReports = () => {
  const { adminReports, adminWarnUser, adminSuspendStudent, adminIssueRefund, adminDismissReport } = useAppData();

  const openReports = adminReports.filter(r => r.status === 'open');

  return (
    <div id="adm-reports" className="pg on">
      <div style={{ fontSize: '12px', color: '#888', marginBottom: '10px' }}>
        {openReports.length} open report{openReports.length !== 1 ? 's' : ''} requiring review
      </div>
      
      {openReports.map(report => (
        <div key={report.id} style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', padding: '13px', marginBottom: '9px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '9px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: report.severity === 'High' ? '#FAECE7' : '#FFF3CD', color: report.severity === 'High' ? '#993C1D' : '#7A5800', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
              <IconAlertTriangle />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{report.title}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>{report.sub}</div>
            </div>
            <span style={{ fontSize: '10px', padding: '2px 7px', borderRadius: '20px', background: report.severity === 'High' ? '#FAECE7' : '#FFF3CD', color: report.severity === 'High' ? '#993C1D' : '#7A5800', fontWeight: 500 }}>
              {report.severity}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#555', background: '#F5F4FF', borderRadius: '8px', padding: '9px 11px', marginBottom: '10px', lineHeight: 1.5 }}>
            {report.desc}
          </div>
          <div style={{ display: 'flex', gap: '7px' }}>
            <button 
              onClick={() => adminWarnUser(report.target)} 
              style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '7px', border: 'none', background: '#FAEEDA', color: '#633806', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconAlertCircle style={{ fontSize: '11px' }} /> Warn user
            </button>
            <button 
              onClick={() => adminSuspendStudent(report.target)} 
              style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '7px', border: 'none', background: '#FAECE7', color: '#993C1D', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconBan style={{ fontSize: '11px' }} /> Suspend
            </button>
            <button 
              onClick={() => adminIssueRefund(report.id, report.amount, report.reporter)} 
              style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '7px', border: 'none', background: '#E1F5EE', color: '#0F6E56', cursor: 'pointer', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconCurrencyRupee style={{ fontSize: '11px' }} /> Issue refund
            </button>
            <button 
              onClick={() => adminDismissReport(report.id)} 
              style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#888', cursor: 'pointer' }}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}

      {openReports.length === 0 && (
        <div style={{ fontSize: '12px', color: '#888', padding: '20px 0', textAlign: 'center', background: '#fff', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.08)' }}>
          No open reports to review.
        </div>
      )}
    </div>
  );
};

export default AdminReports;
