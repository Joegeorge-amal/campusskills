import os
import re

with open('frontend/src/components/modals/PromoteUserModal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add states
if 'const [inviteConfirm, setInviteConfirm]' not in content:
    content = content.replace('const [isSubmitting, setIsSubmitting] = useState(false);', 
                              'const [isSubmitting, setIsSubmitting] = useState(false);\n  const [inviteConfirm, setInviteConfirm] = useState(false);\n  const [inviteSuccess, setInviteSuccess] = useState(false);\n')

# Find the block and replace
pattern = r'\{\!selectedUser\s*&&\s*users\.length\s*===\s*0\s*&&\s*searchQuery\.includes\(\'@\'\)\s*&&\s*\!isSearching\s*&&\s*\(\s*<div.*?No existing CampusSkills user found.*?</div>\s*\)\}'

new_section = """{!selectedUser && users.length === 0 && searchQuery.includes('@') && !isSearching && !inviteConfirm && !inviteSuccess && (
                <div style={{ marginTop: '8px', padding: '16px', border: '1px dashed #d1d5db', borderRadius: '6px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 12px 0', color: '#4b5563', fontSize: '14px' }}>
                    No existing CampusSkills user found with this email.
                  </p>
                  <button 
                    type="button" 
                    onClick={() => setInviteConfirm(true)}
                    style={{
                      background: '#6366f1',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Send Administrator Invitation
                  </button>
                </div>
              )}

              {inviteConfirm && !inviteSuccess && (
                <div style={{ marginTop: '8px', padding: '16px', border: '1px solid #fbbf24', background: '#fef3c7', borderRadius: '6px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 12px 0', color: '#92400e', fontSize: '14px', fontWeight: '500' }}>
                    Are you sure you want to send an administrator invitation to {searchQuery}?
                  </p>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    <button 
                      type="button" 
                      onClick={() => setInviteConfirm(false)}
                      style={{ padding: '6px 12px', borderRadius: '4px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}
                    >
                      Cancel
                    </button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        try {
                          setIsSubmitting(true);
                          await adminService.inviteAdmin(searchQuery, role);
                          setInviteSuccess(true);
                        } catch(err) {
                          alert(err.response?.data?.error || "Failed to invite user");
                          setInviteConfirm(false);
                        } finally {
                          setIsSubmitting(false);
                        }
                      }}
                      disabled={isSubmitting}
                      style={{
                        background: '#d97706',
                        color: '#fff',
                        border: 'none',
                        padding: '6px 12px',
                        borderRadius: '4px',
                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                        fontWeight: '500'
                      }}
                    >
                      {isSubmitting ? 'Sending...' : 'Confirm Invite'}
                    </button>
                  </div>
                </div>
              )}

              {inviteSuccess && (
                <div style={{ marginTop: '8px', padding: '16px', border: '1px solid #10b981', background: '#d1fae5', borderRadius: '6px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 12px 0', color: '#065f46', fontSize: '14px', fontWeight: '500' }}>
                    Administrator invitation sent successfully to {searchQuery}!
                  </p>
                  <button 
                    type="button" 
                    onClick={() => onSuccess()}
                    style={{
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      padding: '6px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    Done
                  </button>
                </div>
              )}"""

content = re.sub(pattern, new_section, content, flags=re.DOTALL)
with open('frontend/src/components/modals/PromoteUserModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Regex replace finished")
