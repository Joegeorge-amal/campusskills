import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { IconStar } from '@tabler/icons-react';

const AdminSkills = () => {
  const { skills, adminRemoveSkill } = useAppData();
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Coding', 'Design', 'Language', 'Math', 'Music'];

  const filteredSkills = filter === 'All' 
    ? skills 
    : skills.filter(s => s.cat === filter);

  return (
    <div id="adm-skills" className="pg on">
      <div className="chiprow">
        {categories.map(cat => (
          <span 
            key={cat} 
            className={`chip ${filter === cat ? 'on' : ''}`} 
            onClick={() => setFilter(cat)}
          >
            {cat}
          </span>
        ))}
      </div>

      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '8px 12px', background: '#F5F4FF', fontSize: '11px', fontWeight: 500, color: '#888' }}>
          <span>Skill / Teacher</span>
          <span>Category</span>
          <span>Sessions</span>
          <span>Rating</span>
          <span>Action</span>
        </div>
        
        {filteredSkills.map(skill => (
          <div key={skill.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 80px', padding: '9px 12px', borderTop: '0.5px solid rgba(0,0,0,.05)', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{skill.name}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>
                {skill.teacher.name} · {skill.teacher.year} · {skill.teacher.branch}
              </div>
            </div>
            <div>
              <span className={`cpill ${skill.catCls}`}>{skill.cat}</span>
            </div>
            <span style={{ fontSize: '12px', color: '#555' }}>{skill.sessions}</span>
            <span style={{ fontSize: '12px', color: '#BA7517' }}>
              <IconStar /> {skill.rating}
            </span>
            <button 
              onClick={() => adminRemoveSkill(skill.id)} 
              style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#E24B4A', cursor: 'pointer' }}
            >
              Remove
            </button>
          </div>
        ))}

        {filteredSkills.length === 0 && (
          <div style={{ fontSize: '12px', color: '#888', padding: '20px 0', textAlign: 'center' }}>
            No skills found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSkills;
