import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';
import { useAuth } from '../../context/AuthContext';
import StaffTable from './StaffTable';
import PromoteUserModal from '../../components/modals/PromoteUserModal';
import SuspendUserModal from '../../components/modals/SuspendUserModal';
import '../../styles/admin.css';

const AdminManagement = () => {
  const { user: currentUser } = useAuth();
  const [capabilities, setCapabilities] = useState(null);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [suspendModalOpen, setSuspendModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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
    return <div className="admin-dashboard"><div className="loading-spinner">Loading...</div></div>;
  }

  // Fallback for security: if no capabilities load, show nothing.
  if (!capabilities) {
    return <div className="admin-dashboard">Failed to load capabilities. Access denied.</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Staff Management</h2>
          <p className="text-secondary" style={{ marginTop: '0.25rem', marginBottom: '0' }}>
            Manage platform administrators and privileges securely.
          </p>
        </div>
        
        {capabilities?.canPromoteAdmins && (
          <button 
            className="btn btn-primary"
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', fontWeight: '500', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer' }}
            onClick={() => setPromoteModalOpen(true)}
          >
            + Promote User
          </button>
        )}
      </div>

      <div style={{ marginTop: '24px' }}>
        <StaffTable 
          staff={staff} 
          capabilities={capabilities} 
          onRefresh={fetchData}
          onSuspend={(u) => { setSelectedUser(u); setSuspendModalOpen(true); }}
        />
      </div>

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
