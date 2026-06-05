import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import MarketplaceCard from '../components/common/MarketplaceCard/MarketplaceCard';
import CategoryFilterTabs from '../components/common/CategoryFilterTabs/CategoryFilterTabs';
import BookSessionModal from '../components/modals/BookSessionModal';
import { IconStar, IconUser, IconMessageCircle } from '@tabler/icons-react';

const Marketplace = () => {
  const { skills } = useAppData();
  const [filter, setFilter] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

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
            variant="marketplace"
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
            <div id="sd-content" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header: Title and Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '28px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>{selectedSkill.name}</div>
                  <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, maxWidth: '500px' }}>
                    {selectedSkill.desc}
                  </div>
                </div>
                <div style={{ fontSize: '20px', fontWeight: 600, color: selectedSkill.type === 'swap' ? '#534AB7' : '#0F6E56', whiteSpace: 'nowrap', marginTop: '4px' }}>
                  {selectedSkill.price}
                </div>
              </div>

              {/* User Block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Avatar 
                  initials={selectedSkill.teacher.init} 
                  bg={selectedSkill.teacher.bg} 
                  color={selectedSkill.teacher.col} 
                  size="56px" 
                  fontSize="20px" 
                />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{selectedSkill.teacher.name}</div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '2px' }}>
                    {selectedSkill.teacher.year} · {selectedSkill.teacher.branch}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '14px', color: '#d97706', fontWeight: 600 }}><IconStar size={16} style={{ display: 'inline', verticalAlign: 'text-bottom' }} fill="currentColor" /> {selectedSkill.teacher.rating}</span>
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>· {selectedSkill.teacher.sessions} sessions completed</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '16px' }}>
                {selectedSkill.type === 'paid' ? (
                  <button 
                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#534AB7', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => setIsBookModalOpen(true)}
                    onMouseOver={(e) => e.currentTarget.style.background = '#4338ca'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#534AB7'}
                  >
                    Book session
                  </button>
                ) : (
                  <button 
                    style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#534AB7', color: '#fff', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => window.alert('Swap Request flow coming soon')}
                    onMouseOver={(e) => e.currentTarget.style.background = '#4338ca'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#534AB7'}
                  >
                    Propose Skill Swap
                  </button>
                )}
                <button 
                  style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '15px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                  onClick={() => window.alert('Chat coming soon')}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  Message
                </button>
              </div>

              {/* Attribute List */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Category</span>
                  <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>{selectedSkill.cat}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Mode</span>
                  <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>{selectedSkill.mode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Sessions completed</span>
                  <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500 }}>{selectedSkill.sessions}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '14px' }}>Average rating</span>
                  <span style={{ color: '#111827', fontSize: '14px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedSkill.rating} <IconStar size={16} fill="#d97706" color="#d97706" />
                  </span>
                </div>
              </div>

              {/* Appended Features (Preserving UX) */}
              <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '24px', border: '1px solid #f3f4f6' }}>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>What you'll learn</div>
                <ul style={{ paddingLeft: '20px', fontSize: '14px', color: '#4b5563', lineHeight: 1.7, marginBottom: '24px' }}>
                  {selectedSkill.topics.map((topic, i) => (
                    <li key={i}>{topic}</li>
                  ))}
                </ul>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#111827', marginBottom: '8px' }}>About {selectedSkill.teacher.name.split(' ')[0]}</div>
                <div style={{ fontSize: '14px', lineHeight: 1.6, color: '#4b5563' }}>
                  {selectedSkill.teacher.bio}
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

      {/* Book Session Modal Overlay */}
      {isBookModalOpen && (
        <BookSessionModal 
          selectedSkill={selectedSkill.name}
          selectedTutor={selectedSkill.teacher.name}
          onClose={() => setIsBookModalOpen(false)}
          onContinue={(slot) => {
            setIsBookModalOpen(false);
            window.alert('Payment flow coming soon');
          }}
        />
      )}
    </div>
  );
};

export default Marketplace;
