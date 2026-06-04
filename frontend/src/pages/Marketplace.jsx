import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import MarketplaceCard from '../components/common/MarketplaceCard/MarketplaceCard';
import CategoryFilterTabs from '../components/common/CategoryFilterTabs/CategoryFilterTabs';
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
        <div style={{ width: '340px', flexShrink: 0, padding: '16px', borderRight: '0.5px solid var(--cs-border)', overflowY: 'auto', background: 'var(--cs-bg-light)' }}>
          
          <CategoryFilterTabs 
            categories={categories}
            activeCategory={filter}
            onSelectCategory={setFilter}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {filteredSkills.map(skill => (
              <MarketplaceCard
                key={skill.id}
                title={skill.name}
                category={skill.cat}
                price={skill.price}
                user={{ name: skill.teacher.name, year: skill.teacher.year, branch: skill.teacher.branch }}
                rating={skill.rating}
                sessionsCount={skill.sessions}
                mode={skill.mode}
                isSelected={selectedSkill?.id === skill.id}
                onClick={() => setSelectedSkill(skill)}
              />
            ))}
            {filteredSkills.length === 0 && (
              <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', padding: '24px 0', textAlign: 'center' }}>
                No skills found in this category.
              </div>
            )}
          </div>
        </div>

        {/* Right: skill + profile detail */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--cs-bg-white)' }}>
          {selectedSkill ? (
            <div id="sd-content" style={{ maxWidth: '700px', margin: '0 auto' }}>
              {/* Teacher Info */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '24px' }}>
                <Avatar 
                  initials={selectedSkill.teacher.init} 
                  bg={selectedSkill.teacher.bg} 
                  color={selectedSkill.teacher.col} 
                  size="64px" 
                  fontSize="24px" 
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{selectedSkill.teacher.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', marginTop: '4px' }}>
                    {selectedSkill.teacher.year} · {selectedSkill.teacher.branch} · {selectedSkill.teacher.college}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#F0C040', fontWeight: 600 }}><IconStar size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> {selectedSkill.teacher.rating}</span>
                    <span style={{ fontSize: '12px', color: 'var(--cs-text-inactive)' }}>· {selectedSkill.teacher.sessions} sessions done</span>
                  </div>
                </div>
                <button 
                  style={{ padding: '8px 16px', borderRadius: 'var(--cs-radius-sm)', border: '1px solid var(--cs-border)', background: 'var(--cs-bg-white)', color: 'var(--cs-text-main)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, transition: 'background 0.2s' }}
                  onClick={() => window.alert('Profile view coming soon')}
                  onMouseOver={(e) => e.currentTarget.style.background = 'var(--cs-bg-hover)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'var(--cs-bg-white)'}
                >
                  <IconUser size={16} /> View Profile
                </button>
              </div>

              {/* Bio */}
              <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--cs-text-secondary)', marginBottom: '32px', background: 'var(--cs-bg-hover)', padding: '16px', borderRadius: 'var(--cs-radius-md)', border: '0.5px solid var(--cs-border)' }}>
                {selectedSkill.teacher.bio}
              </div>

              <div style={{ height: '0.5px', background: 'var(--cs-border)', margin: '0 0 24px' }}></div>

              {/* Skill Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span className={`cpill ${selectedSkill.catCls}`}>{selectedSkill.cat}</span>
              </div>
              <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '16px' }}>{selectedSkill.name}</div>
              <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--cs-text-secondary)', marginBottom: '24px' }}>
                {selectedSkill.desc}
              </p>

              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '12px' }}>What you'll learn:</div>
              <ul style={{ paddingLeft: '24px', fontSize: '14px', color: 'var(--cs-text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
                {selectedSkill.topics.map((topic, i) => (
                  <li key={i}>{topic}</li>
                ))}
              </ul>

              {/* Booking Actions */}
              <div style={{ background: 'var(--cs-bg-hover)', border: '1px solid var(--cs-border)', borderRadius: 'var(--cs-radius-md)', padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Session rate</div>
                    <div style={{ fontSize: '20px', fontWeight: 600, color: selectedSkill.type === 'swap' ? 'var(--cs-primary)' : '#0F6E56' }}>
                      {selectedSkill.price}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', marginBottom: '4px' }}>Format</div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: 'var(--cs-text-main)' }}>{selectedSkill.mode}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {selectedSkill.type === 'paid' ? (
                    <button 
                      style={{ flex: 1, padding: '12px', borderRadius: 'var(--cs-radius-sm)', border: 'none', background: '#0F6E56', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => window.alert('Payment flow coming soon')}
                    >
                      Book for {selectedSkill.priceNum}
                    </button>
                  ) : (
                    <button 
                      style={{ flex: 1, padding: '12px', borderRadius: 'var(--cs-radius-sm)', border: '1.5px solid var(--cs-primary)', background: '#fff', color: 'var(--cs-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
                      onClick={() => window.alert('Swap Request flow coming soon')}
                    >
                      Propose Skill Swap
                    </button>
                  )}
                  <button 
                    style={{ width: '44px', height: '44px', borderRadius: 'var(--cs-radius-sm)', border: '1.5px solid var(--cs-border)', background: 'var(--cs-bg-white)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--cs-text-main)', flexShrink: 0 }}
                    onClick={() => window.alert('Chat coming soon')}
                  >
                    <IconMessageCircle size={20} />
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--cs-text-inactive)', fontSize: '14px' }}>
              Select a skill to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
