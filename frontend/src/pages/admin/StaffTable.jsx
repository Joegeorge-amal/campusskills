import React, { useState } from 'react';
import adminService from '../../services/adminService';
import ConfirmModal from '../../components/modals/ConfirmModal';

const bgColors = ['#f0fdf4', '#eff6ff', '#fdf2f8', '#fffbeb', '#fef2f2'];
const textColors = ['#166534', '#1e40af', '#9d174d', '#92400e', '#991b1b'];
const getAvatarProps = (name) => {
  const idx = (name || '').length % bgColors.length;
  return { bg: bgColors[idx], col: textColors[idx], init: (name || 'U').charAt(0).toUpperCase() };
};

const StaffTable = ({ staff, capabilities, onRefresh, onSuspend }) => {
  const [demoteConfirmOpen, setDemoteConfirmOpen] = useState(false);
  const [demoteTarget, setDemoteTarget] = useState(null);
  const [demoteReason, setDemoteReason] = useState('');
  const [isDemoting, setIsDemoting] = useState(false);

  const handleDemoteClick = (user) => {
    setDemoteTarget(user);
    setDemoteReason('');
    setDemoteConfirmOpen(true);
  };

  const executeDemote = async () => {
    if (!demoteTarget) return;
    if (!demoteReason.trim()) {
      alert("A reason is required for the audit log.");
      return;
    }
    
    try {
      setIsDemoting(true);
      await adminService.demoteUser(demoteTarget.id, demoteReason);
      setDemoteConfirmOpen(false);
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to demote user');
    } finally {
      setIsDemoting(false);
    }
  };

  return (
    <div className="bg-white" style={{ borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb', textAlign: 'left' }}>
          <tr>
            <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Staff Member</th>
            <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Role</th>
            <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px' }}>Status</th>
            <th style={{ padding: '12px 16px', color: '#6b7280', fontWeight: '500', fontSize: '14px', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {staff.map((user) => {
            const avatar = getAvatarProps(user.firstName);
            
            // Capability checks for rendering action buttons
            const canDemote = 
              (user.role === 'ADMIN' && capabilities.canPromoteAdmins) || 
              (user.role === 'SUPER_ADMIN' && capabilities.canDemoteSuperAdmins);
              
            const canSuspend = capabilities.canSuspendAdmins; 
            
            return (
              <tr key={user.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: avatar.bg, color: avatar.col,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: '600', fontSize: '14px'
                    }}>
                      {avatar.init}
                    </div>
                    <div>
                      <div style={{ fontWeight: '500', color: '#111827' }}>
                        {user.firstName} {user.lastName} {user.isBootstrap && <span style={{ fontSize: '12px', color: '#8b5cf6', marginLeft: '4px' }}>(Bootstrap)</span>}
                      </div>
                      <div style={{ color: '#6b7280', fontSize: '14px' }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    padding: '2px 8px', borderRadius: '999px', fontSize: '12px', fontWeight: '500',
                    background: user.role === 'SUPER_ADMIN' ? '#fdf4ff' : '#f0fdf4',
                    color: user.role === 'SUPER_ADMIN' ? '#a21caf' : '#16a34a',
                    border: `1px solid ${user.role === 'SUPER_ADMIN' ? '#f5d0fe' : '#bbf7d0'}`
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {user.isActive ? (
                    <span style={{ color: '#16a34a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span> Active
                    </span>
                  ) : (
                    <span style={{ color: '#dc2626', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626' }}></span> Suspended
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {canDemote && !user.isBootstrap && (
                      <button 
                        onClick={() => handleDemoteClick(user)}
                        style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}
                      >
                        Demote
                      </button>
                    )}
                    
                    {canSuspend && !user.isBootstrap && (
                      <button 
                        onClick={() => onSuspend(user)}
                        style={{ padding: '6px 12px', fontSize: '13px', borderRadius: '4px', border: user.isActive ? '1px solid #fecaca' : '1px solid #bbf7d0', background: user.isActive ? '#fef2f2' : '#f0fdf4', color: user.isActive ? '#dc2626' : '#16a34a', cursor: 'pointer' }}
                      >
                        {user.isActive ? 'Suspend' : 'Unsuspend'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
          {staff.length === 0 && (
            <tr>
              <td colSpan="4" style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>
                No staff members found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {demoteConfirmOpen && (
        <ConfirmModal
          isOpen={demoteConfirmOpen}
          onClose={() => setDemoteConfirmOpen(false)}
          onConfirm={executeDemote}
          title={`Demote ${demoteTarget?.firstName}?`}
          message={`Are you sure you want to demote ${demoteTarget?.firstName} ${demoteTarget?.lastName}? They will be downgraded to the role of ${demoteTarget?.role === 'SUPER_ADMIN' ? 'ADMIN' : 'USER'}.`}
          confirmText="Yes, Demote"
          isLoading={isDemoting}
        >
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Reason (Required for Audit Log)</label>
            <input 
              type="text" 
              value={demoteReason}
              onChange={(e) => setDemoteReason(e.target.value)}
              placeholder="e.g. No longer needs admin access"
              style={{ width: '100%', padding: '8px', border: '1px solid #d1d5db', borderRadius: '4px' }}
            />
          </div>
        </ConfirmModal>
      )}
    </div>
  );
};

export default StaffTable;
