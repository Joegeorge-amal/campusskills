import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import MarketplaceCard from '../components/common/MarketplaceCard/MarketplaceCard';
import CategoryFilterTabs from '../components/common/CategoryFilterTabs/CategoryFilterTabs';
import BookSessionModal from '../components/modals/BookSessionModal';
import { IconStar, IconUser, IconMessageCircle } from '@tabler/icons-react';

const Marketplace = () => {
  const navigate = useNavigate();
  const { skills } = useAppData();
  const [filter, setFilter] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState(skills[0]);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const categories = ['All', 'Coding', 'Design', 'Language', 'Math', 'Music'];

  const filteredSkills = filter === 'All' 
    ? skills 
    : skills.filter(s => s.cat === filter);

  return (
    <div id="market" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Split layout: left=grid, right=detail */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        
        {/* Left: skill list */}
        <div style={{ width: '300px', flexShrink: 0, padding: '16px', borderRight: '0.5px solid var(--cs-border)', overflowY: 'auto', background: 'var(--cs-bg-light)', height: '100%' }}>
          
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
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', background: 'var(--cs-bg-white)', height: '100%' }}>
              {selectedSkill ? (
            <div id="sd-content" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
              
              {/* Header: Title and Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>{selectedSkill.name}</div>
                  <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, maxWidth: '500px' }}>
                    {selectedSkill.desc}
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 600, color: selectedSkill.type === 'swap' ? '#1d4ed8' : '#0F6E56', whiteSpace: 'nowrap', marginTop: '2px' }}>
                  {selectedSkill.price}
                </div>
              </div>

              {/* User Block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Avatar 
                  initials={selectedSkill.teacher.init} 
                  bg={selectedSkill.teacher.bg} 
                  color={selectedSkill.teacher.col} 
                  size="40px" 
                  fontSize="14px" 
                />
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{selectedSkill.teacher.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                    {selectedSkill.teacher.year} · {selectedSkill.teacher.branch}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px', color: '#d97706', fontWeight: 600 }}><IconStar size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} fill="currentColor" /> {selectedSkill.teacher.rating}</span>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>· {selectedSkill.teacher.sessions} sessions completed</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px' }}>
                {selectedSkill.type === 'paid' ? (
                  <button 
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => setIsBookModalOpen(true)}
                    onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#1d4ed8'}
                  >
                    Book session
                  </button>
                ) : (
                  <button 
                    style={{ flex: 1, padding: '10px 16px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                    onClick={() => window.alert('Swap Request flow coming soon')}
                    onMouseOver={(e) => e.currentTarget.style.background = '#1e40af'}
                    onMouseOut={(e) => e.currentTarget.style.background = '#1d4ed8'}
                  >
                    Propose Skill Swap
                  </button>
                )}
                <button 
                  style={{ flex: 1, padding: '10px 16px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                  onClick={() => window.alert('Chat coming soon')}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f9fafb'}
                  onMouseOut={(e) => e.currentTarget.style.background = '#ffffff'}
                >
                  Message
                </button>
              </div>

              {/* Attribute List */}
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Category</span>
                  <span style={{ color: '#111827', fontSize: '13px', fontWeight: 500 }}>{selectedSkill.cat}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Mode</span>
                  <span style={{ color: '#111827', fontSize: '13px', fontWeight: 500 }}>{selectedSkill.mode}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Sessions completed</span>
                  <span style={{ color: '#111827', fontSize: '13px', fontWeight: 500 }}>{selectedSkill.sessions}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280', fontSize: '13px' }}>Average rating</span>
                  <span style={{ color: '#111827', fontSize: '13px', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedSkill.rating} <IconStar size={14} fill="#d97706" color="#d97706" />
                  </span>
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
            navigate('/app/book-request', {
              state: {
                skillName: selectedSkill.name,
                tutorName: selectedSkill.teacher.name,
                price: selectedSkill.priceNum,
                slot: `${slot.date} · ${slot.time}`
              }
            });
          }}
        />
      )}
    </div>
  );
};

export default Marketplace;
