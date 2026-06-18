import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '../components/common/Avatar';
import MarketplaceCard from '../components/common/MarketplaceCard/MarketplaceCard';
import CategoryFilterTabs from '../components/common/CategoryFilterTabs/CategoryFilterTabs';
import BookSessionModal from '../components/modals/BookSessionModal';
import InitialMessageModal from '../components/modals/InitialMessageModal';
import { IconStar, IconUser, IconMessageCircle, IconRefresh } from '@tabler/icons-react';
import { motion, AnimatePresence } from 'framer-motion';
import { listingService } from '../services/listingService';
import { exchangeService } from '../services/exchangeService';
import { chatRequestService } from '../services/chatRequestService';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';

// Simple global cache to instantly load listings when navigating back
let cachedListings = null;

const Marketplace = () => {
  const navigate = useNavigate();
  const { triggerToast, searchQuery } = useAppData();
  const { user } = useAuth();
  const [skills, setSkills] = useState(cachedListings || []);
  const [pendingSkills, setPendingSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(!cachedListings);
  const [refreshSpin, setRefreshSpin] = useState(0);
  const [filter, setFilter] = useState('All');
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [requestMode, setRequestMode] = useState('TUTORING'); // 'TUTORING' or 'SWAP'
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  // Handle Escape key to close details
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedSkill) {
        setSelectedSkill(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSkill]);

  // Derive unique categories from available skills
  const dynamicCategories = React.useMemo(() => {
    const cats = new Set(skills.map(s => s.category).filter(Boolean));
    return ['All', ...Array.from(cats)].sort((a, b) => {
      if (a === 'All') return -1;
      if (b === 'All') return 1;
      return a.localeCompare(b);
    });
  }, [skills]);

  const fetchListings = async (isBackground = false) => {
    try {
      if (!cachedListings && !isBackground) {
        setIsLoading(true);
      }
      // Add mode mapping logic based on filter if needed, currently fetches all
      const res = await listingService.searchListings({ limit: 50 });
      const rawFetchedSkills = res?.listings || res?.data || (Array.isArray(res) ? res : []);
      
      const fetchedSkills = rawFetchedSkills.filter(skill => {
        if (!user) return true;
        const ownerId = skill.owner?.userId || skill.ownerId || skill.owner?._id || skill.owner?.id;
        const myId = user.userId || user._id || user.id;
        return String(ownerId) !== String(myId);
      });
      
      if (!isBackground) {
        setSkills(fetchedSkills);
        cachedListings = fetchedSkills;
        setPendingSkills([]);
      } else {
        // Background check for new listings
        if (fetchedSkills.length > 0) {
          const currentTopId = cachedListings && cachedListings.length > 0 ? (cachedListings[0]._id || cachedListings[0].id) : null;
          const fetchedTopId = fetchedSkills[0]._id || fetchedSkills[0].id;
          if (currentTopId && fetchedTopId && currentTopId !== fetchedTopId) {
            setPendingSkills(fetchedSkills);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch listings", err);
    } finally {
      if (!isBackground) setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasCache = !!cachedListings;
    fetchListings(hasCache);
  }, []);

  const handleShowNewListings = () => {
    setSkills(pendingSkills);
    cachedListings = pendingSkills;
    setPendingSkills([]);
    const container = document.getElementById('marketplace-scroll-container');
    if (container) container.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filteredSkills = (filter === 'All' 
    ? skills 
    : skills.filter(s => s.category === filter)
  ).filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const titleMatch = s.title?.toLowerCase().includes(q);
    const descMatch = s.description?.toLowerCase().includes(q);
    const catMatch = s.category?.toLowerCase().includes(q);
    
    const offeredMatch = s.offeredSkills?.some(tag => {
      const tagStr = (typeof tag === 'string' ? tag : tag?.name) || '';
      return tagStr.toLowerCase().includes(q);
    });
    const requestedMatch = s.requestedSkills?.some(tag => {
      const tagStr = (typeof tag === 'string' ? tag : tag?.name) || '';
      return tagStr.toLowerCase().includes(q);
    });
    
    const creatorNameMatch = s.creatorName?.toLowerCase().includes(q) || s.creatorDisplayName?.toLowerCase().includes(q) || (s.creatorProfile && s.creatorProfile.name?.toLowerCase().includes(q));
    
    return titleMatch || descMatch || catMatch || offeredMatch || requestedMatch || creatorNameMatch;
  });

  const featuredSkills = filter === 'All' 
    ? [...skills]
        .filter(s => (s.requestCount || 0) > 0)
        .sort((a, b) => {
          if ((b.requestCount || 0) !== (a.requestCount || 0)) {
            return (b.requestCount || 0) - (a.requestCount || 0);
          }
          return (b.createdAt || 0) - (a.createdAt || 0);
        })
        .slice(0, 3)
    : [];

  const regularSkills = filteredSkills;

  const renderSkillCard = (skill, i) => (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: selectedSkill ? 0 : 0.05 * Math.min(i, 10) }} key={skill._id || skill.id}>
      <MarketplaceCard
        title={skill.title}
        description={skill.description}
        skills={skill.offeredSkills?.length > 0 ? skill.offeredSkills : skill.requestedSkills}
        category={skill.category}
        typeLabel={
          skill.listingType === 'SWAP' ? 'Skill Swap' : 
          skill.listingType === 'TEACH' ? 'Offering' : 
          skill.listingType === 'LEARN' ? 'Requesting' : 
          skill.listingType === 'TEACH_SWAP' ? 'Offering / Swap' : 
          skill.listingType === 'LEARN_SWAP' ? 'Requesting / Swap' : 
          skill.listingType
        }
        price={(() => {
          if (skill.listingType === 'SWAP') return 'Swap only';
          const isFree = !skill.price || skill.price === 0;
          const priceText = isFree ? 'Free' : `₹${skill.price}/hr`;
          return (skill.listingType === 'TEACH_SWAP' || skill.listingType === 'LEARN_SWAP') ? `${priceText} or Swap` : priceText;
        })()}
        user={{ name: skill.owner?.name || 'Unknown', year: skill.owner?.year || '', branch: skill.owner?.branch || '', id: skill.owner?.userId || skill.ownerId }}
        rating={skill.averageRating || 0}
        sessionsCount={skill.reviewCount || 0}
        mode={skill.availability || 'ONLINE'}
        isVerified={skill.owner?.verifiedSkills?.map(s => (s.name || s).trim().toLowerCase())?.includes(
          (skill.offeredSkills?.[0]?.name || skill.requestedSkills?.[0]?.name || 'Unknown').trim().toLowerCase()
        ) || false}
        isSelected={(selectedSkill?._id || selectedSkill?.id) === (skill._id || skill.id)}
        onClick={() => setSelectedSkill(skill)}
        variant="marketplace"
      />
    </motion.div>
  );

  return (
    <div id="market" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Split layout: left=grid, right=detail */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>
        
        {/* Left: skill list */}
        <div id="marketplace-scroll-container" style={{ width: '100%', flexShrink: 0, padding: selectedSkill ? '16px' : '24px 32px', overflowY: 'auto', background: 'linear-gradient(180deg, #fafafa 0%, #f8f9ff 100%)', height: '100%' }}>
          
          <div style={{ width: selectedSkill ? '320px' : '100%', maxWidth: '1200px', margin: selectedSkill ? '0' : '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <CategoryFilterTabs 
                  categories={dynamicCategories}
                  activeCategory={filter}
                  onSelectCategory={setFilter}
                  variant="marketplace"
                />
              </div>
              {!selectedSkill && (
                <button 
                  onClick={() => {
                    setRefreshSpin(prev => prev + 1);
                    fetchListings(false);
                  }} 
                  style={{ flexShrink: 0, height: '28px', background: '#fff', border: '1px solid #e5e7eb', padding: '0 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 600, color: '#374151', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                  onMouseOver={(e) => { e.currentTarget.style.background = '#f9fafb'; }}
                  onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; }}
                >
                  <motion.div animate={{ rotate: refreshSpin * -360 }} transition={{ duration: 0.6, ease: "easeOut" }} style={{ display: 'flex' }}>
                    <IconRefresh size={14} />
                  </motion.div>
                  Refresh
                </button>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <AnimatePresence>
                {pendingSkills.length > 0 && (
                  <motion.div
                    initial={{ y: -40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -40, opacity: 0 }}
                    style={{ position: 'absolute', top: '-12px', left: '0', right: '0', display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}
                  >
                    <button 
                      onClick={handleShowNewListings}
                      style={{ pointerEvents: 'auto', background: 'var(--cs-primary)', color: 'white', border: 'none', borderRadius: '100px', padding: '8px 24px', fontSize: '13px', fontWeight: 600, boxShadow: '0 4px 12px rgba(13, 148, 136, 0.3)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      ↑ New Listings Available
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {!selectedSkill && filter === 'All' && !searchQuery && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Most Requested
                  </div>
                  {featuredSkills.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {featuredSkills.map((skill, i) => renderSkillCard(skill, i))}
                    </div>
                  ) : (
                    <div style={{ fontSize: '15px', color: 'var(--cs-text-inactive)', padding: '24px 0', textAlign: 'center', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                      No listings have been requested yet.
                    </div>
                  )}
                  <div style={{ height: '1px', background: '#e5e7eb', marginTop: '32px' }} />
                </div>
              )}
              
              {!selectedSkill && filter === 'All' && !searchQuery && regularSkills.length > 0 && (
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
                  All Listings
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: selectedSkill ? '320px' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', marginTop: selectedSkill ? '12px' : '0' }}>
              <AnimatePresence mode="popLayout">
            {isLoading && skills.length === 0 ? (
              <motion.div key="loading" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ gridColumn: '1 / -1', padding: '64px 0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                  <circle cx="12" cy="12" r="10" stroke="rgba(37, 99, 235, 0.15)" strokeWidth="3.5" fill="none" />
                  <path d="M12 2 a10 10 0 0 1 10 10" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" fill="none" />
                </svg>
              </motion.div>
            ) : filteredSkills.length === 0 ? (
              <motion.div key="empty" layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ gridColumn: '1 / -1', fontSize: '15px', color: 'var(--cs-text-inactive)', padding: '64px 0', textAlign: 'center' }}>
                No skills found in this category.
              </motion.div>
            ) : (
              (selectedSkill ? filteredSkills : regularSkills).map((skill, i) => renderSkillCard(skill, i))
            )}
            </AnimatePresence>
              </div>
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
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                    {(() => {
                      const primarySkillName = (selectedSkill.offeredSkills?.[0]?.name || selectedSkill.requestedSkills?.[0]?.name || 'Unknown').trim().toLowerCase();
                      const isDetailVerified = selectedSkill.owner?.verifiedSkills?.map(s => (s.name || s).trim().toLowerCase())?.includes(primarySkillName) || false;
                      const isDetailRequesting = selectedSkill.listingType === 'LEARN' || selectedSkill.listingType === 'LEARN_SWAP';
                      return (
                        <span style={{ 
                          padding: '4px 12px', 
                          background: (isDetailVerified || isDetailRequesting) ? 'var(--cs-primary-light)' : '#fefce8', 
                          color: (isDetailVerified || isDetailRequesting) ? 'var(--cs-primary-dark)' : '#b45309', 
                          border: (isDetailVerified || isDetailRequesting) ? '1px solid transparent' : '1px solid #fde047',
                          borderRadius: '100px', 
                          fontSize: '13px', 
                          fontWeight: 600 
                        }}>
                          {selectedSkill.category || 'General'} • {
                               selectedSkill.listingType === 'TEACH' ? 'Offering' : 
                               selectedSkill.listingType === 'LEARN' ? 'Requesting' : 
                               selectedSkill.listingType === 'TEACH_SWAP' ? 'Offering / Swap' : 
                               selectedSkill.listingType === 'LEARN_SWAP' ? 'Requesting / Swap' : 'Swap'
                          }
                        </span>
                      );
                    })()}
                  </div>
                </div>
                
                {/* Price */}
                <div style={{ fontSize: '20px', fontWeight: 800, color: selectedSkill.listingType === 'SWAP' ? '#1d4ed8' : '#0F6E56', whiteSpace: 'nowrap', marginTop: '4px', background: selectedSkill.listingType === 'SWAP' ? '#eff6ff' : '#ecfdf5', padding: '8px 16px', borderRadius: '12px' }}>
                  {(() => {
                    if (selectedSkill.listingType === 'SWAP') return 'Swap only';
                    const isFree = !selectedSkill.price || selectedSkill.price === 0;
                    const priceText = isFree ? 'Free' : `₹${selectedSkill.price}/hr`;
                    return (selectedSkill.listingType === 'TEACH_SWAP' || selectedSkill.listingType === 'LEARN_SWAP') ? `${priceText} or Swap` : priceText;
                  })()}
                </div>
              </div>

              {/* 2. User Block */}
              <div 
                className="user-block" 
                style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', cursor: (selectedSkill.owner?.userId || selectedSkill.ownerId) ? 'pointer' : 'default', transition: 'background 0.2s', border: '1px solid #e2e8f0' }}
                onClick={() => {
                  const targetId = selectedSkill.owner?.userId || selectedSkill.ownerId;
                  if (targetId) navigate('/app/user/' + targetId);
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                onMouseOut={(e) => e.currentTarget.style.background = '#f8fafc'}
              >
                <Avatar 
                  initials={selectedSkill.owner?.name ? selectedSkill.owner.name.substring(0, 2).toUpperCase() : 'U'} 
                  backgroundImage={selectedSkill.owner?.avatarImg || selectedSkill.owner?.profilePicture}
                  size="64px" 
                  fontSize="24px" 
                />
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {selectedSkill.owner?.name || 'Unknown User'}
                    {(() => {
                      const profileSkills = selectedSkill.owner?.skillsOffered || [];
                      const userVerifiedSkills = selectedSkill.owner?.verifiedSkills || [];
                      if (profileSkills.length === 0) return null;
                      const isProfileVerified = profileSkills.every(skillName => 
                        userVerifiedSkills.map(vs => (vs.name || vs).trim().toLowerCase())
                          .includes((skillName.name || skillName).trim().toLowerCase())
                      );
                      return isProfileVerified ? (
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '100px', border: '1px solid #a7f3d0' }}>
                          ✓ Verified Profile
                        </span>
                      ) : null;
                    })()}
                  </div>
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
                    {selectedSkill.offeredSkills?.map((s, i) => {
                      const isSkillVerified = selectedSkill.owner?.verifiedSkills?.map(vs => (vs.name || vs).trim().toLowerCase())?.includes((s.name || s).trim().toLowerCase()) || false;
                      return (
                        <span key={`off-${i}`} style={{ display: 'inline-flex', alignItems: 'stretch', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}>
                          <span style={{ padding: '6px 14px', background: '#eff6ff', color: '#1d4ed8', display: 'flex', alignItems: 'center', border: '1px solid #bfdbfe', borderRight: 'none', borderTopLeftRadius: '100px', borderBottomLeftRadius: '100px' }}>
                            {s.name ? s.name.charAt(0).toUpperCase() + s.name.slice(1) : ''} <span style={{ opacity: 0.8, marginLeft: '4px', fontSize: '11px', fontWeight: 500 }}>{s.level}</span>
                          </span>
                          {isSkillVerified ? (
                            <span style={{ padding: '6px 12px', background: '#ecfdf5', color: '#059669', fontSize: '11px', display: 'flex', alignItems: 'center', border: '1px solid #a7f3d0', borderTopRightRadius: '100px', borderBottomRightRadius: '100px' }}>✓ Verified</span>
                          ) : (
                            <span style={{ padding: '6px 12px', background: '#fefce8', color: '#b45309', fontSize: '11px', display: 'flex', alignItems: 'center', border: '1px solid #fde047', borderTopRightRadius: '100px', borderBottomRightRadius: '100px' }}>⚠️ Unverified</span>
                          )}
                        </span>
                      )
                    })}
                    {selectedSkill.requestedSkills?.map((s, i) => {
                      return (
                      <span key={`req-${i}`} style={{ display: 'inline-flex', alignItems: 'stretch', borderRadius: '100px', fontSize: '13px', fontWeight: 600 }}>
                        <span style={{ padding: '6px 14px', background: '#fef2f2', color: '#b91c1c', display: 'flex', alignItems: 'center', border: '1px solid #fecaca', borderRadius: '100px' }}>
                          {s.name ? s.name.charAt(0).toUpperCase() + s.name.slice(1) : ''} <span style={{ opacity: 0.8, marginLeft: '4px', fontSize: '11px', fontWeight: 500 }}>{s.level} (Requested)</span>
                        </span>
                      </span>
                    )})}
                  </div>
                  {selectedSkill.offeredSkills?.some(s => {
                    return !(selectedSkill.owner?.verifiedSkills?.map(vs => (vs.name || vs).trim().toLowerCase())?.includes((s.name || s).trim().toLowerCase()) || false);
                  }) && (
                    <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, marginTop: '4px', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <span style={{ fontWeight: 600, color: '#4b5563' }}>Note:</span> This skill has not been verified by CampusSkills. You can still continue with this request, but we recommend reviewing the user's ratings, completed sessions, and profile information before accepting.
                    </div>
                  )}
                </div>
              )}

              {/* 4. Syllabus */}
              {selectedSkill.topics && selectedSkill.topics.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#1e293b' }}>Syllabus</div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedSkill.topics.map((t, i) => (
                      <span key={i} style={{ padding: '6px 14px', background: '#f1f5f9', color: '#334155', borderRadius: '100px', fontSize: '13px', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                        {t ? t.charAt(0).toUpperCase() + t.slice(1) : ''}
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
                {selectedSkill.listingType === 'TEACH' || selectedSkill.listingType === 'TEACH_SWAP' ? (
                  <button 
                    style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)' }}
                    onClick={() => { setRequestMode('TUTORING'); setIsBookModalOpen(true); }}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Request Session
                  </button>
                ) : null}

                {selectedSkill.listingType === 'LEARN' || selectedSkill.listingType === 'LEARN_SWAP' ? (
                  <button 
                    style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.2)' }}
                    onClick={() => window.alert('Teach Request flow coming soon')}
                    onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Offer to Teach
                  </button>
                ) : null}
                
                {selectedSkill.listingType === 'SWAP' || selectedSkill.listingType === 'TEACH_SWAP' || selectedSkill.listingType === 'LEARN_SWAP' ? (
                  <button 
                    style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', border: selectedSkill.listingType === 'SWAP' ? 'none' : '1px solid #1d4ed8', background: selectedSkill.listingType === 'SWAP' ? '#1d4ed8' : '#fff', color: selectedSkill.listingType === 'SWAP' ? '#fff' : '#1d4ed8', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', boxShadow: selectedSkill.listingType === 'SWAP' ? '0 4px 12px rgba(29, 78, 216, 0.2)' : 'none' }}
                    onClick={() => { setRequestMode('SWAP'); setIsBookModalOpen(true); }}
                    onMouseOver={(e) => { e.currentTarget.style.background = selectedSkill.listingType === 'SWAP' ? '#1e40af' : '#eff6ff'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = selectedSkill.listingType === 'SWAP' ? '#1d4ed8' : '#fff'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    Propose Skill Swap
                  </button>
                ) : null}

                <button 
                  style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '14px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  onClick={() => setIsMessageModalOpen(true)}
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
                    {selectedSkill.availableSlots.map((slot, idx) => (
                      <div key={slot.id || idx} style={{ display: 'flex', alignItems: 'center', background: idx === 0 ? '#eff6ff' : '#fff', border: idx === 0 ? '1px solid #bfdbfe' : '1px solid #cbd5e1', borderRadius: '12px', overflow: 'hidden' }}>
                        <div style={{ padding: '8px 12px', background: idx === 0 ? '#dbeafe' : '#f8fafc', fontWeight: 700, fontSize: '13px', color: idx === 0 ? '#1e3a8a' : '#0f172a', borderRight: idx === 0 ? '1px solid #bfdbfe' : '1px solid #cbd5e1' }}>
                          {idx === 0 ? '★ ' : ''}{slot.dayOfWeek.toUpperCase()}
                        </div>
                        <div style={{ padding: '8px 12px', fontSize: '14px', color: '#334155', fontWeight: 500 }}>
                          {slot.startTime} <span style={{ color: '#94a3b8', fontSize: '12px' }}>({slot.durationMinutes}m)</span>
                        </div>
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
                  <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600 }}>{selectedSkill.reviewCount || 0}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px' }}>
                  <span style={{ color: '#64748b', fontSize: '14px', fontWeight: 500 }}>Average rating</span>
                  <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {selectedSkill.averageRating || 0} <IconStar size={16} fill="#d97706" color="#d97706" />
                  </span>
                </div>
              </div>

            </div>
          )}
        </div>
      </motion.div>
    </div>

      {/* Book Session Modal Overlay */}
      {isBookModalOpen && selectedSkill && (
        <BookSessionModal 
          selectedSkill={selectedSkill.title}
          selectedTutor={selectedSkill.owner?.name || 'Unknown User'}
          isSwapRequest={requestMode === 'SWAP'}
          listingRequestedSkills={selectedSkill.requestedSkills}
          userOfferedSkills={user?.skillsOffered || []}
          slots={selectedSkill.availableSlots && selectedSkill.availableSlots.length > 0 ? selectedSkill.availableSlots.map((s, i) => ({
            id: String(i),
            date: s.dayOfWeek,
            time: `${s.startTime} (${s.durationMinutes}m)`,
            label: s.dayOfWeek,
            isPrimary: i === 0
          })) : undefined}
          onClose={() => setIsBookModalOpen(false)}
          onContinue={async (slot, message, offeredSkillName, availableTimes, preferredDuration) => {
            try {
              setIsBookModalOpen(false);
              const isSwap = requestMode === 'SWAP';

              // Compute next occurrence timestamp for the chosen slot
              let proposedStartTime;
              if (!isSwap && slot) {
                const days = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
                const targetDay = days.indexOf((slot.date || '').toLowerCase());
                // Match HH:MM, optionally followed by AM/PM (handles both 12h and 24h formats)
                const timeMatch = (slot.time || '').match(/(\d{1,2}):(\d{2})(?:\s*(AM|PM))?/i);
                if (targetDay !== -1 && timeMatch) {
                  let hrs = parseInt(timeMatch[1]);
                  const mins = parseInt(timeMatch[2]);
                  const ampm = timeMatch[3];
                  if (ampm) {
                    if (ampm.toUpperCase() === 'PM' && hrs < 12) hrs += 12;
                    if (ampm.toUpperCase() === 'AM' && hrs === 12) hrs = 0;
                  }
                  const now = new Date();
                  const next = new Date(now);
                  next.setHours(hrs, mins, 0, 0);
                  let daysUntil = targetDay - now.getDay();
                  if (daysUntil <= 0 || (daysUntil === 0 && next <= now)) daysUntil += 7;
                  next.setDate(next.getDate() + daysUntil);
                  proposedStartTime = next.getTime();
                }
              }

              const exchangeData = {
                listingId: selectedSkill._id || selectedSkill.id,
                receiverId: selectedSkill.owner?.userId || selectedSkill.ownerId,
                type: isSwap ? 'SWAP' : 'TUTORING',
                proposedSessions: isSwap ? undefined : [{ startTime: slot.date + ' ' + slot.time, endTime: '', topic: selectedSkill.title }],
                message: isSwap && slot ? `[Prefers your slot: ${slot.date} ${slot.time}]\n\n${message}` : message,
                offeredSkillName: isSwap ? offeredSkillName : undefined,
                requesterAvailableTimes: isSwap ? availableTimes : undefined,
                preferredDurationMinutes: isSwap ? preferredDuration : undefined,
                proposedStartTime: isSwap ? undefined : proposedStartTime
              };
              await exchangeService.createExchange(exchangeData);
              triggerToast('Session request sent successfully!');
            } catch (err) {
              console.error(err);
              triggerToast('Failed to send session request');
            }
          }}
        />
      )}

      {/* Initial Message Modal Overlay */}
      {isMessageModalOpen && selectedSkill && (
        <InitialMessageModal 
          selectedTutor={selectedSkill.owner?.name || 'Unknown User'}
          onClose={() => setIsMessageModalOpen(false)}
          onSend={async (messageText) => {
            try {
              await chatRequestService.createRequest({
                receiverId: selectedSkill.owner?.userId || selectedSkill.ownerId,
                message: messageText
              });
              triggerToast('Message request sent successfully!');
            } catch (err) {
              const serverError = err.response?.data?.error || err.message || '';
              if (serverError.includes('FORBIDDEN')) {
                triggerToast('Cannot send message request to this user.');
              } else if (serverError.includes('already pending')) {
                 triggerToast('A message request already exists.');
              } else if (serverError.includes('already have an active chat')) {
                 triggerToast('You already have an active chat with this user.');
              } else if (serverError.includes('Invalid receiverId')) {
                 triggerToast('You cannot send a request to yourself.');
              } else {
                triggerToast(serverError || 'Failed to send message request');
              }
              throw err;
            }
          }}
        />
      )}
    </div>
  );
};

export default Marketplace;
