import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import StaffTable from './StaffTable';
import PromoteUserModal from '../../components/modals/PromoteUserModal';
import SuspendUserModal from '../../components/modals/SuspendUserModal';
import AdminAuditLog from './AdminAuditLog';
import { IconUsers, IconHistory, IconUserPlus } from '@tabler/icons-react';
import '../../styles/admin.css';

const AdminManagement = () => {
  const { user: currentUser } = useAuth();
  const [capabilities, setCapabilities] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Tabs state
  const [activeTab, setActiveTab] = useState('staff'); // 'staff', 'audit', or future 'invite'

  const fetchData = async () => {
    try {
      setLoading(true);
      const capRes = await adminService.getCapabilities();
      setCapabilities(capRes);
      
      const staffRes = await adminService.getStaff();
      setStaff(staffRes);
    } catch (err) {
      console.error('Failed to load admin management data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="admin-management-container"><div className="loading-spinner">Loading...</div></div>;
  }

  // Fallback for security: if no capabilities load, show nothing.
  if (!capabilities) {
    return <div className="admin-management-container">Failed to load capabilities. Access denied.</div>;
  }

  const renderStaffTab = () => (
    <div className="admin-card">
      <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--cs-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#111827' }}>Existing Administrators</h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>Manage roles and privileges of your administrative team.</p>
        </div>
        {capabilities?.canPromoteAdmins && (
          <button 
            className="btn btn-primary"
            style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: '500', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
            onClick={() => setPromoteModalOpen(true)}
          >
            <IconUserPlus size={18} /> Add Administrator
          </button>
        )}
      </div>

      <StaffTable 
        staff={staff} 
        capabilities={capabilities} 
        onRefresh={fetchData}
        onSuspend={(u) => { setSelectedUser(u); setSuspendModalOpen(true); }}
      />
    </div>
  );

  return (
    <div className="admin-management-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: '700', color: '#111827' }}>Admin Management</h1>
        <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: 'var(--cs-text-secondary)' }}>
          Centralized control for staff privileges and audit history.
        </p>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--cs-border)', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('staff')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            background: 'none', border: 'none', borderBottom: activeTab === 'staff' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'staff' ? '#3b82f6' : '#6b7280', fontSize: '15px', fontWeight: activeTab === 'staff' ? '600' : '500',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          <IconUsers size={20} /> Staff
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px',
            background: 'none', border: 'none', borderBottom: activeTab === 'audit' ? '2px solid #3b82f6' : '2px solid transparent',
            color: activeTab === 'audit' ? '#3b82f6' : '#6b7280', fontSize: '15px', fontWeight: activeTab === 'audit' ? '600' : '500',
            cursor: 'pointer', transition: 'all 0.2s ease'
          }}
        >
          <IconHistory size={20} /> Audit Log
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {activeTab === 'staff' && renderStaffTab()}
        {activeTab === 'audit' && (
          <div style={{ margin: '-24px' }}>
            <AdminAuditLog isEmbedded={true} />
          </div>
        )}
      </div>

      {/* Modals */}
      {promoteModalOpen && (
        <PromoteUserModal 
          capabilities={capabilities}
          onClose={() => setPromoteModalOpen(false)}
          onSuccess={() => {
            setPromoteModalOpen(false);
            fetchData();
          }}
        />
      )}

      {suspendModalOpen && selectedUser && (
        <SuspendUserModal 
          user={selectedUser}
          capabilities={capabilities}
          onClose={() => {
            setSuspendModalOpen(false);
            setSelectedUser(null);
          }}
          onSuccess={() => {
            setSuspendModalOpen(false);
            setSelectedUser(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
};

export default AdminManagement;
