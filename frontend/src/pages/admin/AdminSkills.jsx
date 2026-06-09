import React, { useState } from 'react';
import { IconSearch, IconStarFilled } from '@tabler/icons-react';
import { useAppData } from '../../context/AppDataContext';

const AdminSkills = () => {
  const { skills, adminRemoveSkill } = useAppData();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredSkills = skills.filter(skill => {
    if (activeFilter !== 'All' && skill.cat !== activeFilter) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !skill.name.toLowerCase().includes(q) &&
        !skill.teacher.name.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="fade-in">
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
            <select 
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.875rem', outline: 'none' }}
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Coding">Coding</option>
              <option value="Design">Design</option>
              <option value="Language">Language</option>
              <option value="Math">Math</option>
              <option value="Music">Music</option>
            </select>
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
            {filteredSkills.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center', padding: '48px', color: '#64748b' }}>
                  No skills found matching the criteria.
                </td>
              </tr>
            ) : (
              filteredSkills.map((skill) => (
                <tr key={skill.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{skill.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {skill.teacher.name} · {skill.teacher.year} · {skill.teacher.branch}
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-neutral">{skill.cat}</span>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 500 }}>
                    {skill.sessions}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 600, color: '#f59e0b' }}>
                      {skill.rating} <IconStarFilled size={14} />
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      className="admin-btn admin-btn-outline" 
                      style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#ef4444' }}
                      onClick={() => adminRemoveSkill(skill.id)}
                    >
                      Remove
                    </button>
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
