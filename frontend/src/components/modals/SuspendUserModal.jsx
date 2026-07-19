import React, { useState } from 'react';
import adminService from '../../services/adminService';

const SuspendUserModal = ({ user, capabilities, onClose, onSuccess }) => {
  const isCurrentlyActive = user.isActive;
  
  const [category, setCategory] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isCurrentlyActive && !category) {
      alert("Please select a suspension category.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      // If active, we suspend (isActive = false). If suspended, we reinstate (isActive = true).
      await adminService.updateUserStatus(user.id, !isCurrentlyActive, category, reason);
      onSuccess();
    } catch (err) {
      alert(err.response?.data?.error || `Failed to ${isCurrentlyActive ? 'suspend' : 'reinstate'} user`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div 
        className="modal-content" 
        onClick={e => e.stopPropagation()} 
        style={{ padding: '24px', maxWidth: '500px', width: '90%', borderRadius: '16px', background: 'var(--cs-bg-white)' }}
      >
        <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 'bold' }}>
          {isCurrentlyActive ? 'Suspend User' : 'Reinstate User'}
        </h3>
        
        <p style={{ margin: '0 0 24px 0', color: '#6b7280', fontSize: '14px' }}>
          {isCurrentlyActive 
            ? `You are about to suspend ${user.firstName} ${user.lastName}. They will not be able to log in or use the platform.`
            : `You are about to reinstate ${user.firstName} ${user.lastName}. Their access to the platform will be restored.`}
        </p>

        <form onSubmit={handleSubmit}>
          {isCurrentlyActive && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Suspension Category <span style={{color: '#ef4444'}}>*</span></label>
              <select 
                value={category} 
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--cs-border)' }}
                required
              >
                <option value="">Select a category...</option>
                <option value="Spam">Spam / Scams</option>
                <option value="Harassment">Harassment / Bullying</option>
                <option value="Fake Profile">Fake Profile / Impersonation</option>
                <option value="Academic Misconduct">Academic Misconduct</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Admin Note (Optional)
            </label>
            <textarea 
              placeholder={isCurrentlyActive ? "Additional details about this suspension..." : "Reason for reinstatement..."}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--cs-border)', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--cs-border)', background: 'var(--cs-bg-white)', cursor: 'pointer', fontWeight: '500' }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || (isCurrentlyActive && !category)}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '6px', 
                border: 'none', 
                background: isCurrentlyActive ? '#ef4444' : '#10b981', 
                color: '#fff', 
                cursor: 'pointer', 
                fontWeight: '500', 
                opacity: (isSubmitting || (isCurrentlyActive && !category)) ? 0.7 : 1 
              }}
            >
              {isSubmitting 
                ? 'Processing...' 
                : (isCurrentlyActive ? 'Suspend User' : 'Reinstate User')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SuspendUserModal;
