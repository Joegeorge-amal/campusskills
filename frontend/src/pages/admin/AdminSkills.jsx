import React, { useState, useEffect } from 'react';
import { IconSearch, IconStarFilled, IconLoader2 } from '@tabler/icons-react';
import adminService from '../../services/adminService';
import CustomSelect from '../../components/common/CustomSelect';
import ConfirmModal from '../../components/modals/ConfirmModal';

const AdminSkills = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [confirmRemove, setConfirmRemove] = useState({ isOpen: false, id: null });

  const fetchSkills = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getListings({
        q: searchQuery || undefined,
        status: activeFilter !== 'All' ? activeFilter : undefined
      });
      setSkills(res.data || []);
    } catch (err) {
      console.error('Failed to fetch skills:', err);
      setError('Failed to load skills. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchSkills();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const executeRemoveSkill = async () => {
    if (!confirmRemove.id) return;
    try {
      await adminService.updateListingStatus(confirmRemove.id, 'ADMIN_DISABLED');
      fetchSkills();
    } catch (err) {
      console.error('Failed to remove skill:', err);
      alert('Failed to remove skill.');
    } finally {
      setConfirmRemove({ isOpen: false, id: null });
    }
  };

  const handleRemoveSkill = (id) => {
    setConfirmRemove({ isOpen: true, id });
  };

  return (
    <div className="fade-in">
      <ConfirmModal 
        isOpen={confirmRemove.isOpen}
        onClose={() => setConfirmRemove({ isOpen: false, id: null })}
        onConfirm={executeRemoveSkill}
        title="Remove Skill"
        message="Are you sure you want to remove this skill?"
        isDanger={true}
        confirmText="Remove Skill"
      />
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Skills Marketplace</h1>
          <p className="admin-page-subtitle">Manage skill listings and offerings on the platform.</p>
        </div>
      </div>

      <div className="admin-table-container">
        <div className="admin-table-toolbar">
          <div className="admin-search-wrapper">
            <IconSearch size={16} className="admin-search-icon" />
            <input 
              type="text" 
              className="admin-search-input" 
              placeholder="Search by skill name or tutor..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="admin-header-actions">
            <CustomSelect 
              value={activeFilter} 
              onChange={val => setActiveFilter(val)}
              options={[
                { value: 'All', label: 'All Categories' },
                { value: 'Coding', label: 'Coding' },
                { value: 'Design', label: 'Design' },
                { value: 'Language', label: 'Language' },
                { value: 'Math', label: 'Math' },
                { value: 'Music', label: 'Music' }
              ]}
            />
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Skill / Tutor</th>
              <th>Category</th>
              <th style={{ textAlign: 'center' }}>Sessions</th>
              <th style={{ textAlign: 'center' }}>Rating</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--cs-text-secondary)' }}>
                  <IconLoader2 className="spinner" size={24} style={{ marginBottom: '8px', color: '#3b82f6' }} />
                  <div>Loading skills...</div>
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: '#ef4444' }}>
                  {error}
                </td>
              </tr>
            ) : skills.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: 'var(--cs-text-secondary)' }}>
                  No skills found matching the criteria.
                </td>
              </tr>
            ) : (
              skills.map((skill) => (
                <tr key={skill.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--cs-text-main)' }}>{skill.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cs-text-secondary)' }}>
                      {skill.ownerName} · {skill.status === 'ADMIN_DISABLED' ? 'Disabled' : 'Active'}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{skill.category}</span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 500 }}>
                    {skill.sessions || 0}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600, color: '#f59e0b' }}>
                      {skill.rating || 'New'} <IconStarFilled size={14} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {skill.status !== 'ADMIN_DISABLED' && (
                      <button 
                        className="admin-btn admin-btn-outline" 
                        style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444' }}
                        onClick={() => handleRemoveSkill(skill.id)}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminSkills;
