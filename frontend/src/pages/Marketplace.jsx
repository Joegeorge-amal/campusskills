import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import { IconStar, IconUser, IconMessageCircle } from '@tabler/icons-react';

const Marketplace = () => {
  const { skills } = useAppData();
  const [filter, setFilter] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);

  const categories = ['All', 'Coding', 'Design', 'Language', 'Math', 'Music'];

  const filteredSkills = filter === 'All' 
    ? skills 
    : skills.filter(s => s.cat === filter);

  return (
    <div id="market" className="pg on" style={{ padding: 0 }}>
      {/* Split layout: left=grid, right=detail */}
      <div style={{ display: 'flex', height: '100%', minHeight: '560px' }}>
        
        {/* Left: skill list */}
        <div style={{ width: '320px', flexShrink: 0, padding: '13px', borderRight: '0.5px solid rgba(0,0,0,.08)', overflowY: 'auto' }}>
          
          <div className="chiprow">
            {categories.map(cat => (
              <span 
                key={cat} 
                className={`chip ${filter === cat ? 'on' : ''}`} 
                onClick={() => setFilter(cat)}
              >
                {cat === 'Language' ? 'Languages' : cat}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            {filteredSkills.map(skill => (
              <div 
                key={skill.id} 
                className="skcard" 
                onClick={() => setSelectedSkill(skill)}
                style={{ border: selectedSkill?.id === skill.id ? '1.5px solid #534AB7' : '0.5px solid rgba(0,0,0,.08)' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span className={`cpill ${skill.catCls}`}>{skill.cat}</span>
                  <span style={{ fontSize: '11px', fontWeight: 500, color: skill.type === 'swap' ? '#534AB7' : '#0F6E56' }}>
                    {skill.price}
                  </span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#222', marginBottom: '2px' }}>{skill.name}</div>
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '5px' }}>
                  {skill.teacher.name} · {skill.teacher.year} · {skill.teacher.branch}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '11px', color: '#BA7517' }}><IconStar /> {skill.rating}</span>
                  <span style={{ fontSize: '10px', color: '#aaa' }}>· {skill.sessions} sessions</span>
                  <span style={{ marginLeft: 'auto', fontSize: '10px', color: skill.mode === 'Online' ? '#1D9E75' : '#888' }}>
                    ● {skill.mode}
                  </span>
                </div>
              </div>
            ))}
            {filteredSkills.length === 0 && (
              <div style={{ fontSize: '12px', color: '#888', padding: '20px 0', textAlign: 'center' }}>
                No skills found in this category.
              </div>
            )}
          </div>
        </div>

        {/* Right: skill + profile detail */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          {selectedSkill ? (
            <div id="sd-content">
              {/* Teacher Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '20px' }}>
                <Avatar 
                  letters={selectedSkill.teacher.init} 
                  bgColor={selectedSkill.teacher.bg} 
                  textColor={selectedSkill.teacher.col} 
                  size="56px" 
                  fontSize="22px" 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#222' }}>{selectedSkill.teacher.name}</div>
                  <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {selectedSkill.teacher.year} · {selectedSkill.teacher.branch} · {selectedSkill.teacher.college}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '12px', color: '#BA7517', fontWeight: 500 }}><IconStar /> {selectedSkill.teacher.rating}</span>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>· {selectedSkill.teacher.sessions} sessions done</span>
                  </div>
                </div>
                <button 
                  style={{ padding: '8px 12px', borderRadius: '8px', border: '1.5px solid #E0DFF0', background: '#fff', color: '#555', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 500 }}
                  onClick={() => window.alert('Profile view coming soon')}
                >
                  <IconUser /> View Profile
                </button>
              </div>

              {/* Bio */}
              <div style={{ fontSize: '12px', lineHeight: 1.5, color: '#444', marginBottom: '24px', background: '#FAFAFA', padding: '12px', borderRadius: '8px', border: '0.5px solid rgba(0,0,0,.08)' }}>
                {selectedSkill.teacher.bio}
              </div>

              <div style={{ height: '0.5px', background: 'rgba(0,0,0,.08)', margin: '0 0 20px' }}></div>

              {/* Skill Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span className={`cpill ${selectedSkill.catCls}`}>{selectedSkill.cat}</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#222', marginBottom: '12px' }}>{selectedSkill.name}</div>
              <p style={{ fontSize: '13px', lineHeight: 1.5, color: '#555', marginBottom: '20px' }}>
                {selectedSkill.desc}
              </p>

              <div style={{ fontSize: '13px', fontWeight: 600, color: '#222', marginBottom: '10px' }}>What you'll learn:</div>
              <ul style={{ paddingLeft: '20px', fontSize: '13px', color: '#555', lineHeight: 1.6, marginBottom: '24px' }}>
                {selectedSkill.topics.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>

              {/* Booking Actions */}
              <div style={{ background: '#F5F4FF', border: '1px solid #E0DFF0', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#666' }}>Session rate</div>
                    <div style={{ fontSize: '18px', fontWeight: 600, color: selectedSkill.type === 'swap' ? '#534AB7' : '#0F6E56' }}>
                      {selectedSkill.price}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#666' }}>Format</div>
                    <div style={{ fontSize: '13px', fontWeight: 500, color: '#222' }}>{selectedSkill.mode}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {selectedSkill.type === 'paid' ? (
                    <button 
                      className="sbtn" 
                      onClick={() => window.alert('Payment flow coming soon')}
                    >
                      Book for {selectedSkill.priceNum}
                    </button>
                  ) : (
                    <button 
                      className="sbtn" 
                      style={{ background: '#fff', border: '1.5px solid #534AB7', color: '#534AB7' }}
                      onClick={() => window.alert('Swap Request flow coming soon')}
                    >
                      Propose Skill Swap
                    </button>
                  )}
                  <button 
                    style={{ width: '44px', height: '44px', borderRadius: '11px', border: '1.5px solid #E0DFF0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#555', flexShrink: 0 }}
                    onClick={() => window.alert('Chat coming soon')}
                  >
                    <IconMessageCircle style={{ fontSize: '20px' }} />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#888', fontSize: '13px' }}>
              Select a skill to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
