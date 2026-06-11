import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import MarketplaceCard from '../components/common/MarketplaceCard/MarketplaceCard';
import CategoryFilterTabs from '../components/common/CategoryFilterTabs/CategoryFilterTabs';
import BookSessionModal from '../components/modals/BookSessionModal';
import { IconStar, IconUser, IconMessageCircle } from '@tabler/icons-react';
import { motion } from 'framer-motion';
import { listingService } from '../services/listingService';

const Marketplace = () => {
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);

  const categories = ['All', 'Coding', 'Design', 'Language', 'Math', 'Music'];

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        // Add mode mapping logic based on filter if needed, currently fetches all
        const res = await listingService.searchListings({ limit: 50 });
        setSkills(res.data || []);
        if (res.data && res.data.length > 0) {
          // setSelectedSkill(res.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch listings", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, []);

  const filteredSkills = filter === 'All' 
    ? skills 
    : skills.filter(s => s.category === filter);

  return (
    <div id="market" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Split layout: left=grid, right=detail */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        
        {/* Left: skill list */}
        <div style={{ width: '100%', flexShrink: 0, padding: selectedSkill ? '16px' : '24px 32px', overflowY: 'auto', background: 'var(--cs-bg-light)', height: '100%' }}>
          
          <div style={{ width: selectedSkill ? '320px' : '100%', maxWidth: '1200px', margin: selectedSkill ? '0' : '0 auto' }}>
            <CategoryFilterTabs 
              categories={categories}
              activeCategory={filter}
              onSelectCategory={setFilter}
              variant="marketplace"
            />

            <div style={{ display: 'grid', gridTemplateColumns: selectedSkill ? '320px' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: selectedSkill ? '12px' : '24px' }}>
            {isLoading ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#6b7280' }}>Loading listings...</div>
            ) : filteredSkills.map(skill => (
              <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: selectedSkill ? 0 : 0.05 }} key={skill._id || skill.id}>
                <MarketplaceCard
                  title={skill.title}
                  category={skill.category}
                  typeLabel={
                    skill.listingType === 'SWAP' ? 'Skill Swap' : 
                    skill.listingType === 'TEACH' ? 'Offering' : 
                    skill.listingType === 'LEARN' ? 'Requesting' : 
                    skill.listingType === 'TEACH_SWAP' ? 'Offering / Swap' : 
                    skill.listingType === 'LEARN_SWAP' ? 'Requesting / Swap' : 
                    skill.listingType
                  }
                  price={skill.listingType === 'SWAP' ? 'Swap only' : (skill.listingType === 'TEACH_SWAP' || skill.listingType === 'LEARN_SWAP' ? `₹${skill.price}/hr or Swap` : `₹${skill.price}/hr`)}
                  user={{ name: skill.owner?.name || 'Unknown', year: skill.owner?.year || '', branch: skill.owner?.branch || '' }}
                  rating={skill.owner?.averageRating || 0}
                  sessionsCount={skill.owner?.reviewCount || 0}
                  mode={skill.availability || 'ONLINE'}
                  isVerified={skill.owner?.verifiedSkills?.includes(skill.category)}
                  isSelected={(selectedSkill?._id || selectedSkill?.id) === (skill._id || skill.id)}
                  onClick={() => setSelectedSkill(skill)}
                />
              </motion.div>
            ))}
            {filteredSkills.length === 0 && (
              <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', padding: '24px 0', textAlign: 'center' }}>
                No skills found in this category.
              </div>
            )}
            </div>
          </div>
        </div>

        {/* Right: skill + profile detail */}
        <motion.div initial={false} animate={{ opacity: selectedSkill ? 1 : 0, x: selectedSkill ? 0 : '100%' }} transition={{ type: 'spring', bounce: 0, duration: 0.45, delay: selectedSkill ? 0.15 : 0 }} style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 'calc(100% - 352px)', overflowY: 'auto', background: 'var(--cs-bg-white)', pointerEvents: selectedSkill ? 'auto' : 'none', borderLeft: '1px solid var(--cs-border)', zIndex: 10, boxShadow: selectedSkill ? '-10px 0 30px rgba(0,0,0,0.05)' : 'none' }}>
          <div style={{ padding: '24px', width: '100%', boxSizing: 'border-box' }}>
            {selectedSkill && (
              <div id="sd-content" style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', color: '#64748b', fontSize: '14px', fontWeight: 600, width: 'fit-content' }} onClick={() => setSelectedSkill(null)} onMouseOver={(e) => e.target.style.color='#0f172a'} onMouseOut={(e) => e.target.style.color='#64748b'}>
                  ← Back to Marketplace
                </div>
              
              {/* 1. Header: Title, Category Badge, Price */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>{selectedSkill.title}</div>
                  
                  {/* Topic / Category Badge */}
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '100px', fontSize: '13px', fontWeight: 700 }}>
                    {selectedSkill.category} 
                    <span style={{ color: '#93c5fd' }}>•</span> 
                    {selectedSkill.listingType === 'SWAP' ? 'Skill Swap' : 
                     selectedSkill.listingType === 'TEACH' ? 'Offering' : 
                     selectedSkill.listingType === 'LEARN' ? 'Requesting' : 
                     selectedSkill.listingType === 'TEACH_SWAP' ? 'Offering / Swap' : 
                     selectedSkill.listingType === 'LEARN_SWAP' ? 'Requesting / Swap' : 
                     selectedSkill.listingType}
                  </div>
                </div>
                
                {/* Price */}
                <div style={{ fontSize: '20px', fontWeight: 800, color: selectedSkill.listingType === 'SWAP' ? '#1d4ed8' : '#0F6E56', whiteSpace: 'nowrap', marginTop: '4px', background: selectedSkill.listingType === 'SWAP' ? '#eff6ff' : '#ecfdf5', padding: '8px 16px', borderRadius: '12px' }}>
                  {selectedSkill.listingType === 'SWAP' ? 'Swap only' : 
                   (selectedSkill.listingType === 'TEACH_SWAP' || selectedSkill.listingType === 'LEARN_SWAP' ? 
                     (selectedSkill.price ? `₹${selectedSkill.price}/hr or Swap` : 'Free or Swap') : 
                     (selectedSkill.price ? `₹${selectedSkill.price}/hr` : 'Free'))}
                </div>
              </div>

              {/* 2. User Block */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <Avatar 
                  initials={selectedSkill.owner?.name ? selectedSkill.owner.name.substring(0, 2).toUpperCase() : 'U'} 
                  backgroundImage={selectedSkill.owner?.avatarImg || selectedSkill.owner?.profilePicture}
                  size="48px" 
                  fontSize="16px" 
                />
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>{selectedSkill.owner?.name || 'Unknown User'}</div>
                  <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
                    {selectedSkill.owner?.year || ''} {selectedSkill.owner?.branch ? `· ${selectedSkill.owner.branch}` : ''}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#d97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconStar size={14} fill="currentColor" /> {selectedSkill.owner?.averageRating || 0}
                    </span>
                    <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500 }}>· {selectedSkill.owner?.reviewCount || 0} sessions completed</span>
                  </div>
                </div>
              </div>

              {/* 3. Topics (Skill) */}
              {(selectedSkill.offeredSkills?.length > 0 || selectedSkill.requestedSkills?.length > 0) && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Topic (Skill)</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedSkill.offeredSkills?.map((s, i) => (
                      <span key={`off-${i}`} style={{ padding: '6px 14px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '100px', fontSize: '13px', fontWeight: 600, border: '1px solid #bfdbfe' }}>
                        {s.name} <span style={{ opacity: 0.8, marginLeft: '4px', fontSize: '11px', fontWeight: 500 }}>{s.level}</span>
                      </span>
                    ))}
                    {selectedSkill.requestedSkills?.map((s, i) => (
                      <span key={`req-${i}`} style={{ padding: '6px 14px', background: '#fef2f2', color: '#b91c1c', borderRadius: '100px', fontSize: '13px', fontWeight: 600, border: '1px solid #fecaca' }}>
                        {s.name} <span style={{ opacity: 0.8, marginLeft: '4px', fontSize: '11px', fontWeight: 500 }}>{s.level} (Requested)</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. Syllabus */}
              {selectedSkill.topics && selectedSkill.topics.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Syllabus</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedSkill.topics.map((t, i) => (
                      <span key={i} style={{ padding: '6px 14px', background: '#f1f5f9', color: '#334155', borderRadius: '100px', fontSize: '13px', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Description */}
              <div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#374151', marginBottom: '10px' }}>Description</div>
                <div style={{ fontSize: '15px', color: '#4b5563', lineHeight: 1.6, maxWidth: '650px', whiteSpace: 'pre-line' }}>
                  {selectedSkill.description}
                </div>
              </div>

              {/* 5. Action Buttons */}
              <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                {selectedSkill.listingType !== 'SWAP' && selectedSkill.listingType !== 'LEARN' ? (
                  <button 
                    style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)' }}
                    onClick={() => setIsBookModalOpen(true)}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Book session
                  </button>
                ) : null}
                
                {selectedSkill.listingType === 'SWAP' || selectedSkill.listingType === 'TEACH_SWAP' || selectedSkill.listingType === 'LEARN_SWAP' ? (
                  <button 
                    style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)' }}
                    onClick={() => window.alert('Swap Request flow coming soon')}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Propose Skill Swap
                  </button>
                ) : null}

                <button 
                  style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => window.alert('Chat coming soon')}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#d1d5db'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  <IconMessageCircle size={18} /> Message
                </button>
              </div>

              {/* 6. Rest of the stuff - Available Slots */}
              {selectedSkill.availableSlots && selectedSkill.availableSlots.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b' }}>Available Timings</div>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {selectedSkill.availableSlots.map((s, i) => (
                      <div key={i} style={{ padding: '10px 16px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', color: '#475569', fontWeight: 500, boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
                        <span style={{ color: '#0f172a', fontWeight: 700 }}>{s.dayOfWeek}</span> <span style={{ color: '#cbd5e1', margin: '0 4px' }}>|</span> {s.startTime} <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '2px' }}>({s.durationMinutes}m)</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. Attribute List */}
              <div style={{ display: 'flex', flexDirection: 'column', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Category</span>
                  <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>{selectedSkill.category}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Mode</span>
                  <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>{selectedSkill.availability || 'ONLINE'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Sessions completed</span>
                  <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>{selectedSkill.owner?.reviewCount || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Average rating</span>
                  <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedSkill.owner?.averageRating || 0} <IconStar size={16} fill="#d97706" color="#d97706" />
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>

      {/* Book Session Modal Overlay */}
      {isBookModalOpen && (
        <BookSessionModal 
          selectedSkill={selectedSkill.title}
          selectedTutor={selectedSkill.owner?.displayName || 'Unknown User'}
          slots={selectedSkill.availableSlots && selectedSkill.availableSlots.length > 0 ? selectedSkill.availableSlots.map((s, i) => ({
            id: String(i),
            date: s.dayOfWeek,
            time: `${s.startTime} (${s.durationMinutes}m)`,
            label: s.dayOfWeek,
            isPrimary: i === 0
          })) : undefined}
          onClose={() => setIsBookModalOpen(false)}
          onContinue={(slot) => {
            setIsBookModalOpen(false);
            navigate('/app/book-request', {
              state: {
                skillName: selectedSkill.title,
                tutorName: selectedSkill.owner?.displayName || 'Unknown User',
                price: selectedSkill.price,
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
