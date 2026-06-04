import React, { useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import AdminTable from '../../components/common/AdminTable';
import CategoryFilterTabs from '../../components/common/CategoryFilterTabs/CategoryFilterTabs';
import StatusBadge from '../../components/common/StatusBadge';
import { IconStar } from '@tabler/icons-react';

const AdminSkills = () => {
  const { skills, adminRemoveSkill } = useAppData();
  const [filter, setFilter] = useState('All');

  const categories = ['All', 'Coding', 'Design', 'Language', 'Math', 'Music'];

  const filteredSkills = filter === 'All' 
    ? skills 
    : skills.filter(s => s.cat === filter);

  const columns = ['Skill / Teacher', 'Category', 'Sessions', 'Rating', 'Action'];
  const gridTemplate = '2fr 1fr 1fr 1fr 80px';

  return (
    <div id="adm-skills" className="pg on">
      <div style={{ marginBottom: '16px' }}>
        <CategoryFilterTabs 
          categories={categories}
          activeCategory={filter}
          onSelectCategory={setFilter}
        />
      </div>

      <AdminTable columns={columns} gridTemplate={gridTemplate} emptyText="No skills found.">
        {filteredSkills.map(skill => (
          <div key={skill.id}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{skill.name}</div>
              <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', marginTop: '4px' }}>
                {skill.teacher.name} · {skill.teacher.year} · {skill.teacher.branch}
              </div>
            </div>
            <div>
              <StatusBadge status={skill.cat} />
            </div>
            <span style={{ fontSize: '13px', color: 'var(--cs-text-main)' }}>{skill.sessions}</span>
            <span style={{ fontSize: '13px', color: 'var(--cs-warning)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconStar size={16} /> {skill.rating}
            </span>
            <button 
              onClick={() => adminRemoveSkill(skill.id)} 
              style={{ fontSize: '12px', padding: '6px 12px', borderRadius: 'var(--cs-radius-sm)', border: 'none', background: 'var(--cs-danger-light)', color: 'var(--cs-danger)', cursor: 'pointer', fontWeight: 600 }}
            >
              Remove
            </button>
          </div>
        ))}
      </AdminTable>
    </div>
  );
};

export default AdminSkills;
