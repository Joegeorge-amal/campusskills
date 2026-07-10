import React, { useState, useEffect } from 'react';
import adminService from '../../services/adminService';

const PromoteUserModal = ({ capabilities, onClose, onSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  
  const [role, setRole] = useState('ADMIN');
  const [reason, setReason] = useState('');
  
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!searchQuery) {
      setUsers([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await adminService.getUsers({ q: searchQuery, limit: 10 });
        // Filter out users who are already SUPER_ADMIN, as they cannot be promoted further
        setUsers((res.data || []).filter(u => u.role !== 'SUPER_ADMIN'));
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) {
      alert("Please select a user to promote.");
      return;
    }
    if (!reason.trim()) {
      alert("A reason is required for the audit log.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await adminService.promoteUser(selectedUser.id, role, reason);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to promote user");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ padding: '24px', maxWidth: '500px', width: '90%', borderRadius: '16px', background: '#fff' }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}>Promote User to Admin</h3>
        <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>
          Select a standard user and elevate their privileges to Administrator. This action will be logged.
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Search User (Email or Roll No)</label>
            <input 
              type="text" 
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={selectedUser !== null}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
            {isSearching && <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Searching...</div>}
            
            {!selectedUser && users.length === 0 && searchQuery.includes('@') && !isSearching && (
              <div style={{ marginTop: '8px', padding: '16px', border: '1px dashed #d1d5db', borderRadius: '6px', textAlign: 'center' }}>
                <p style={{ margin: '0 0 12px 0', color: '#4b5563', fontSize: '14px' }}>
                  No existing CampusSkills user found with this email.
                </p>
                <button 
                  type="button" 
                  onClick={async () => {
                    try {
                      setIsSubmitting(true);
                      await adminService.inviteAdmin(searchQuery, role);
                      onSuccess();
                    } catch(err) {
                      alert(err.response?.data?.error || "Failed to invite user");
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  disabled={isSubmitting}
                  style={{
                    background: '#6366f1',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    fontWeight: '500'
                  }}
                >
                  {isSubmitting ? 'Inviting...' : 'Send Administrator Invitation'}
                </button>
              </div>
            )}
            {!selectedUser && users.length > 0 && (
              <div style={{ marginTop: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', maxHeight: '150px', overflowY: 'auto' }}>
                {users.map(u => (
                  <div 
                    key={u.id} 
                    onClick={() => setSelectedUser(u)}
                    style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6', background: '#f9fafb' }}
                  >
                    <div style={{ fontWeight: '500' }}>{u.displayName} {u.rollNo ? `(${u.rollNo})` : ''}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{u.email} - Role: {u.role}</div>
                  </div>
                ))}
              </div>
            )}

            {selectedUser && (
              <div style={{ marginTop: '8px', padding: '12px', background: '#e0e7ff', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: '600', color: '#3730a3' }}>{selectedUser.displayName} {selectedUser.rollNo ? `(${selectedUser.rollNo})` : ''}</div>
                  <div style={{ fontSize: '12px', color: '#4f46e5' }}>{selectedUser.email} - Role: {selectedUser.role}</div>
                </div>
                <button type="button" onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', color: '#4338ca', cursor: 'pointer', fontWeight: '500' }}>Change</button>
              </div>
            )}
          </div>



          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Reason (Required for Audit Log)</label>
            <input 
              type="text" 
              placeholder="e.g. Needs access to moderation tools"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontWeight: '500' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !selectedUser || !reason.trim()}
              style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#4f46e5', color: '#fff', cursor: 'pointer', fontWeight: '500', opacity: (isSubmitting || !selectedUser || !reason.trim()) ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Promoting...' : 'Promote User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoteUserModal;
