import re

with open('frontend/src/components/modals/PromoteUserModal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# We need to detect if searchQuery is an email format and users is empty.
new_jsx = '''            {!selectedUser && users.length === 0 && searchQuery.includes('@') && !isSearching && (
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
'''

content = content.replace('            {!selectedUser && users.length > 0 && (', new_jsx + '\\n            {!selectedUser && users.length > 0 && (')

# Also update adminService in frontend/src/services/adminService.js
# But wait, let's write to PromoteUserModal first.
with open('frontend/src/components/modals/PromoteUserModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
