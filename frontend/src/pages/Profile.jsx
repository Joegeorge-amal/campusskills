import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import ModalWrapper from '../components/common/ModalWrapper';
import ReviewSection from '../components/profile/ReviewSection';
import { 
  IconCheck, 
  IconCalendarMonth, 
  IconStarFilled, 
  IconStar,
  IconSparkles, 
  IconShieldCheck,
  IconShieldCheckFilled,
  IconPlus,
  IconMapPin,
  IconCircle,
  IconCamera,
  IconTrash,
  IconX,
  IconPencil
} from '@tabler/icons-react';
import SkillQuizModal from '../components/modals/SkillQuizModal';
import CreateListingModal from '../components/modals/CreateListingModal';
import MarketplaceCard from '../components/common/MarketplaceCard/MarketplaceCard';
import { listingService } from '../services/listingService';
import { getTopics } from '../services/topicService';
import AutocompleteInput from '../components/AutocompleteInput';

const Profile = () => {
  const { user, updateProfile, fetchProfile } = useAuth();
  const { triggerToast, sessionsData } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const [reviewsLoaded, setReviewsLoaded] = useState(false);
  const [hasReviews, setHasReviews] = useState(false);
  const hasScrolledRef = useRef(false);

  const handleReviewsLoaded = (items) => {
    setHasReviews(items && items.length > 0);
    setReviewsLoaded(true);
  };

  useEffect(() => {
    if (location.state?.scrollToVerified) {
      setTimeout(() => {
        const el = document.getElementById('verified-skills-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }, [location.state]);

  useEffect(() => {
    if (location.state?.scrollToReviews && reviewsLoaded && !hasScrolledRef.current) {
      hasScrolledRef.current = true;
      setTimeout(() => {
        const el = document.getElementById('reviews-section');
        const mainContent = document.querySelector('.main');
        if (el && mainContent) {
          if (hasReviews) {
            const rect = el.getBoundingClientRect();
            const mainRect = mainContent.getBoundingClientRect();
            const scrollTop = mainContent.scrollTop + rect.top - mainRect.top - 10;
            mainContent.scrollTo({ top: scrollTop, behavior: 'smooth' });
          } else {
            mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' });
          }
        }
      }, 100);
    }
  }, [location.state, reviewsLoaded, hasReviews]);

  const [newSkill, setNewSkill] = useState('');
  const [activeQuizSkill, setActiveQuizSkill] = useState(null);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [isAvatarHovered, setIsAvatarHovered] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [skillToRemove, setSkillToRemove] = useState(null);
  const [hoveredCell, setHoveredCell] = useState(null);
  const [myListings, setMyListings] = useState([]);
  const [editingListing, setEditingListing] = useState(null);
  const [listingToDelete, setListingToDelete] = useState(null);
  const [allTopicsList, setAllTopicsList] = useState([]);
  const [topicMap, setTopicMap] = useState({});

  const completedSessions = React.useMemo(() =>
    (sessionsData || []).filter(s => s.rawSession?.status === 'COMPLETED' || s.status === 'COMPLETED'),
    [sessionsData]
  );
  const sessionsCount = completedSessions.length || user?.stats?.sessionsCompleted || 0;
  const totalMinutes = React.useMemo(() => {
    if (completedSessions.length > 0) {
      return completedSessions.reduce((sum, s) => {
        const sess = s.rawSession || s;
        if (sess.scheduledEnd && sess.scheduledStart) {
          return sum + (sess.scheduledEnd - sess.scheduledStart) / 60000;
        }
        return sum;
      }, 0);
    }
    return user?.stats?.totalMinutes || 0;
  }, [completedSessions, user?.stats?.totalMinutes]);

  useEffect(() => {
    getTopics().then(res => {
      const topics = res?.data || res;
      if (Array.isArray(topics) && topics.length > 0) {
        setAllTopicsList(topics.map(t => t.name));
        const map = {};
        topics.forEach(t => {
          map[t.name] = t.category;
        });
        setTopicMap(map);
      } else {
        setAllTopicsList(['Python', 'Java', 'React', 'Figma', 'Graphic Design', 'TypeScript', 'Node.js']);
      }
    }).catch(err => {
      console.error("Failed to load topics", err);
      setAllTopicsList(['Python', 'Java', 'React', 'Figma', 'Graphic Design', 'TypeScript', 'Node.js']);
    });
  }, []);

  const fetchMyListings = async () => {
    const userId = user?.userId || user?.id || user?._id;
    if (userId) {
      listingService.searchListings({ ownerId: userId })
        .then(res => {
          const listingsArray = res?.listings || res?.data || (Array.isArray(res) ? res : []);
          setMyListings(listingsArray);
        })
        .catch(console.error);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user?.userId, user?.id, user?._id]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const mainContent = document.querySelector('.main');
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const heatmapData = React.useMemo(() => {
    const data = [...Array(24)].map(() => [...Array(7)].map(() => ({ level: 0, opacity: 0.1, count: 0 })));
    if (!user?.stats?.activityTimestamps || !Array.isArray(user.stats.activityTimestamps)) return data;
    
    const timestamps = user.stats.activityTimestamps;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const counts = {};
    timestamps.forEach(ts => {
      const d = new Date(ts);
      d.setHours(0, 0, 0, 0);
      const diffTime = today.getTime() - d.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays >= 0 && diffDays < 24 * 7) {
        counts[diffDays] = (counts[diffDays] || 0) + 1;
      }
    });

    const todayDayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    
    for (let i = 0; i < 24 * 7; i++) {
      const colIndex = 23 - Math.floor(i / 7);
      let rowIndex = (todayDayOfWeek - (i % 7)) % 7;
      if (rowIndex < 0) rowIndex += 7;

      const count = counts[i] || 0;
      let level = 0;
      let opacity = 0.1;
      if (count > 0) {
        level = Math.min(count, 4);
        opacity = 0.25 + (level * 0.15); // max 0.85 opacity
      }
      data[colIndex][rowIndex] = { level, opacity, count };
    }
    
    return data;
  }, [user?.stats?.activityTimestamps]);

  const [bannerGradient, setBannerGradient] = useState(null);

  useEffect(() => {
    if (user?.avatarColor) {
      const getLuminance = (hex) => {
        if (!hex) return 255;
        const rgb = parseInt(hex.replace('#', ''), 16);
        return 0.299 * ((rgb >> 16) & 255) + 0.587 * ((rgb >> 8) & 255) + 0.114 * (rgb & 255);
      };
      const bgLum = getLuminance(user.avatarColor.bg);
      const textLum = getLuminance(user.avatarColor.text);
      
      if (bgLum < textLum) {
        // Dark themes: bg is dark, text is too light for white heatmap.
        // For Royal Blue (#1d4ed8), fade to medium blue to match original banner.
        // For all other dark themes, fade to elegant slate-black (#111827) for high contrast.
        const rightColor = user.avatarColor.bg.toLowerCase() === '#1d4ed8' ? '#2563eb' : '#111827';
        setBannerGradient(`linear-gradient(105deg, ${user.avatarColor.bg} 0%, ${rightColor} 100%)`);
      } else {
        // Normal themes: light avatar background to dark text.
        setBannerGradient(`linear-gradient(105deg, ${user.avatarColor.bg} 0%, ${user.avatarColor.text} 100%)`);
      }
    } else {
      // Absolute fallback if no custom color
      const colors = ['#2563eb', '#db2777', '#059669', '#d97706', '#7c3aed', '#0891b2'];
      const charCode = user?.name ? user.name.charCodeAt(0) : 0;
      setBannerGradient(`linear-gradient(105deg, ${colors[charCode % colors.length]} 0%, #111827 100%)`);
    }
  }, [user?.avatarColor, user?.name]);

  if (!user) return null;

  const skillsOfferedObjects = user?.skillsOffered || [];
  const skillsOffered = skillsOfferedObjects.map(s => s.name || s);
  
  const verifiedSkills = Array.from(new Set(user?.verifiedSkills || []));
  const pendingSkills = skillsOffered.filter(skill => !verifiedSkills.includes(skill));

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  const handleAddSkill = async (skillNameInput) => {
    const finalSkill = typeof skillNameInput === 'string' ? skillNameInput : newSkill;
    if (!finalSkill || !finalSkill.trim()) return;
    if (skillsOffered.includes(finalSkill.trim())) {
      triggerToast('Skill already added!');
      return;
    }
    
    try {
      await updateProfile({
        skillsOffered: [...skillsOfferedObjects, { name: finalSkill.trim(), level: 'BEGINNER' }]
      });
      setNewSkill('');
      setIsAddingSkill(false);
      triggerToast('Skill added to pending verification!');
    } catch (err) {
      triggerToast('Failed to add skill.');
    }
  };

  const confirmRemoveSkill = async () => {
    if (!skillToRemove) return;
    try {
      const currentSkills = user?.skillsOffered || [];
      const newSkillsOffered = currentSkills.filter(s => (s.name || s) !== skillToRemove);
      const newVerifiedSkills = user?.verifiedSkills?.filter(s => s !== skillToRemove) || [];
      
      await updateProfile({
        skillsOffered: newSkillsOffered,
        verifiedSkills: newVerifiedSkills
      });
      triggerToast(`${skillToRemove} removed successfully!`);
      setSkillToRemove(null);
    } catch (err) {
      console.error('Remove skill error:', err);
      if (err.response) {
        console.error('BACKEND ERROR RESPONSE:', err.response.data);
      }
      triggerToast('Failed to remove skill.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        await updateProfile({
          ...user,
          avatarImg: reader.result
        });
        triggerToast('Profile photo updated successfully!');
      } catch (err) {
        triggerToast('Failed to update profile photo.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async (e) => {
    e.stopPropagation();
    try {
      await updateProfile({
        ...user,
        avatarImg: null
      });
      triggerToast('Profile photo removed!');
    } catch (err) {
      triggerToast('Failed to remove profile photo.');
    }
  };

  const handleQuizStart = (skill) => {
    setActiveQuizSkill(skill);
  };

  const handleQuizComplete = (skill, score, domain) => {
    updateProfile({
      verifiedSkills: Array.from(new Set([...verifiedSkills, skill]))
    }).then(() => {
      fetchProfile();
      setActiveQuizSkill(null);
      triggerToast(`${skill} has been verified successfully!`);
      
      // Scroll to the top so the user can see the verification animation
      setTimeout(() => {
        const mainEl = document.querySelector('.main');
        if (mainEl) {
          mainEl.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 150);
    });
  };

  const totalSkills = skillsOffered.length;
  const verifiedCount = verifiedSkills.length;
  const trustScorePercent = totalSkills > 0 ? Math.round((verifiedCount / totalSkills) * 100) : 0;
  const isProfileVerified = totalSkills > 0 && verifiedCount === totalSkills;

  const [isFlyingUp, setIsFlyingUp] = useState(false);
  const prevScoreRef = useRef(trustScorePercent);

  useEffect(() => {
    if (prevScoreRef.current < 100 && trustScorePercent === 100 && totalSkills > 0) {
      setIsFlyingUp(true);
      setTimeout(() => {
        setIsFlyingUp(false);
      }, 800);
    }
    prevScoreRef.current = trustScorePercent;
  }, [trustScorePercent, totalSkills]);

  // Common card style scaled down
  const cardStyle = {
    background: '#ffffff', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    display: 'flex', 
    flexDirection: 'column'
  };

  return (
    <div id="profile" className="pg on" style={{ padding: 0, background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      
      <SkillQuizModal 
        isOpen={!!activeQuizSkill}
        skillName={activeQuizSkill}
        onClose={() => setActiveQuizSkill(null)}
        onComplete={handleQuizComplete}
      />
      
      <CreateListingModal 
        isOpen={isCreateSessionOpen || !!editingListing} 
        editData={editingListing}
        onClose={() => {
            setIsCreateSessionOpen(false);
            setEditingListing(null);
            fetchMyListings();
        }} 
      />

        <ModalWrapper isOpen={!!listingToDelete} onClose={() => setListingToDelete(null)} maxWidth="400px" zIndex={1000}>
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#111827' }}>Delete Listing</h3>
              <button onClick={() => setListingToDelete(null)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex' }}><IconX size={20} /></button>
            </div>
            <p style={{ margin: '0 0 16px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>Are you sure you want to delete <strong style={{color: '#111827'}}>{listingToDelete?.title}</strong>? This action cannot be undone.</p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setListingToDelete(null)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
              <button onClick={async () => {
                try {
                  await listingService.deactivateListing(listingToDelete._id || listingToDelete.id);
                  setListingToDelete(null);
                  fetchMyListings();
                  triggerToast('Listing deleted successfully');
                } catch (err) {
                  console.error(err);
                  triggerToast('Failed to delete listing');
                }
              }} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Delete</button>
            </div>
          </div>
        </ModalWrapper>
        

      {/* Blue Banner */}
      <div 
        onMouseEnter={() => setIsBannerHovered(true)} 
        onMouseLeave={() => setIsBannerHovered(false)}
        style={{ 
          height: '180px', 
          backgroundImage: user?.bannerImg ? `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${user?.bannerImg})` : (bannerGradient || 'linear-gradient(105deg, #2563eb 0%, #312e81 100%)'), 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%', 
          position: 'relative',
          transition: 'background-image 0.5s ease'
        }}
      >
      </div>

      <div style={{ margin: '-68px auto 0', padding: '0 24px', position: 'relative', pointerEvents: 'none' }}>
        
        {/* Mockup Heatmap moved here so it isn't blocked by this container's invisible bounds */}
        {user?.showHeatmap !== false && (
          <div 
            onMouseEnter={() => setIsBannerHovered(true)} 
            onMouseLeave={() => setIsBannerHovered(false)}
            style={{ 
              position: 'absolute', right: '24px', top: '-22px', transform: 'translateY(-50%)', 
              display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px', zIndex: 10,
              pointerEvents: 'auto',
              opacity: isBannerHovered ? 1 : 0.15, transition: 'opacity 0.4s ease'
            }}>
            <div style={{ 
              position: 'relative', display: 'flex', gap: '4px',
              maskImage: 'linear-gradient(to right, transparent 0%, black 30%)',
              WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 30%)'
            }}>
              {heatmapData.map((col, colIndex) => (
                <div key={colIndex} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {col.map((cell, rowIndex) => (
                    <div 
                      key={rowIndex} 
                      onMouseEnter={() => setHoveredCell({ colIndex, rowIndex, level: cell.level, count: cell.count })}
                      onMouseLeave={() => setHoveredCell(null)}
                      style={{ 
                        position: 'relative',
                        width: '12px', 
                        height: '12px', 
                        backgroundColor: '#ffffff', 
                        opacity: hoveredCell?.colIndex === colIndex && hoveredCell?.rowIndex === rowIndex ? 1 : cell.opacity,
                        borderRadius: '2px',
                        cursor: 'pointer',
                        transition: 'opacity 0.2s'
                      }} 
                    >
                      {hoveredCell?.colIndex === colIndex && hoveredCell?.rowIndex === rowIndex && (
                        <div style={{
                          position: 'absolute',
                          bottom: 'calc(100% + 8px)',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#111827',
                          color: '#fff',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          whiteSpace: 'nowrap',
                          zIndex: 100,
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                          pointerEvents: 'none'
                        }}>
                          {cell.count === 0 ? 'No activity' : `${cell.count} ${cell.count === 1 ? 'activity' : 'activities'}`} on this day
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
            
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.5px' }}>
              ACTIVITY (LAST 6 MONTHS)
            </div>
          </div>
        )}

          {/* Avatar, Buttons, and Info Wrapper - Re-enables pointer events */}
          <div style={{ pointerEvents: 'auto' }}>
            {/* Avatar and Buttons Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div 
            style={{ 
              width: '128px', height: '128px', borderRadius: '50%', background: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: '0 12px 32px rgba(0,0,0,0.15)', position: 'relative' 
            }}
          >
            <Avatar initials={initials} bg={user?.avatarColor?.bg || "#eef2ff"} color={user?.avatarColor?.text || "#1d4ed8"} backgroundImage={user?.avatarImg} size="120px" fontSize="44px" />
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginTop: '80px' }}>
            <button 
              onClick={() => navigate('/app/edit-profile')} 
              style={{ padding: '8px 16px', borderRadius: '12px', border: '1px solid #93c5fd', background: '#ffffff', color: '#2563eb', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Edit Profile
            </button>
            <button 
              onClick={() => setIsCreateSessionOpen(true)}
              style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconPlus size={16} /> Create Listing
            </button>
          </div>
        </div>

        {/* User Info */}
        <div style={{ marginBottom: '24px', marginLeft: '2px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{user?.name || "Anonymous"}</div>
            {isProfileVerified && (
              <div className={isFlyingUp ? 'badge-pop-in' : ''} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '100px', color: '#059669', fontSize: '11px', fontWeight: 600 }}>
                <IconCheck size={12} strokeWidth={3} /> Verified
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconMapPin size={16} strokeWidth={2.5} style={{ color: '#9ca3af' }} />
                {(() => { const r = user?.rollNo || (user?.email?.split('@')[0]?.toLowerCase() || ''); return r ? `${r.toUpperCase()} · ` : ''; })()}{user?.programme || 'Not specified'} • {user?.year || 'Unknown year'}
              </span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#d1d5db' }}></span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <IconCalendarMonth size={16} strokeWidth={2.5} style={{ color: '#9ca3af' }} />
                Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
              </span>
            </div>
          {user?.bio && (
            <div style={{ marginTop: '16px', fontSize: '14px', color: '#374151', lineHeight: '1.6', maxWidth: '600px', fontWeight: 500 }}>
              {user.bio}
            </div>
          )}
        </div>

        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="glossy-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <IconCalendarMonth size={20} strokeWidth={2} style={{ color: '#3b82f6' }} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{sessionsCount}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Sessions</div>
          </div>
          <div className="glossy-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <IconStar size={20} strokeWidth={2} style={{ color: '#eab308' }} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{user?.stats?.ratingAvg?.toFixed(1) || '0.0'}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Rating</div>
          </div>
          <div className="glossy-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#faf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <IconSparkles size={20} strokeWidth={2} style={{ color: '#a855f7' }} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{totalMinutes > 0 ? (totalMinutes / 60).toFixed(1) : '0.0'}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Hours</div>
          </div>
          <div className="glossy-card" style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '14px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <IconShieldCheck size={20} strokeWidth={2} style={{ color: '#22c55e' }} />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{verifiedCount}</div>
            <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: 500 }}>Verified</div>
          </div>
        </div>

        {/* Verification Trust Score Card */}
        {(!isProfileVerified || isFlyingUp) && (
        <div className={isFlyingUp ? 'fly-up-away' : ''} style={{ background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)', borderRadius: '24px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', color: '#fff', boxShadow: '0 8px 24px rgba(67, 56, 202, 0.25)' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconShieldCheck size={32} color="#fff" strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '16px', fontWeight: 400, opacity: 0.9, marginBottom: '4px' }}>Verification Trust Score</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '36px', fontWeight: 700 }}>{trustScorePercent}%</span>
              <span style={{ fontSize: '14px', opacity: 0.9, fontWeight: 400 }}>{verifiedCount} / {totalSkills} verified</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '100px' }}>
              <div style={{ width: `${trustScorePercent}%`, height: '100%', background: '#fff', borderRadius: '100px' }}></div>
            </div>
          </div>
        </div>
        )}

        {/* My Skills Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>My Skills</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Verify your skills to boost your profile credibility and attract more students.</div>
          </div>
          {!isAddingSkill && (
            <button 
              onClick={() => setIsAddingSkill(true)}
              style={{ padding: '8px 16px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)' }}
            >
              <IconPlus size={14} strokeWidth={2.5} /> Add Skill
            </button>
          )}
        </div>

        {/* Add Skill Flow Inline */}
        {isAddingSkill && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #f3f4f6', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)' }}>
            <div style={{ flex: 1 }}>
              <AutocompleteInput 
                allTopics={allTopicsList} 
                onAddSkill={(val) => { handleAddSkill(val); }} 
                placeholder="e.g. Python, Figma, Guitar..." 
              />
            </div>
            <button 
              onClick={() => setIsAddingSkill(false)}
              style={{ height: 'fit-content', padding: '8px 16px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#4b5563', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', alignSelf: 'flex-start' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Verified Skills Section */}
        <div id="verified-skills-section" style={{ marginBottom: '32px', scrollMarginTop: '100px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '24px', height: '24px', background: '#ecfdf5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCheck size={14} strokeWidth={3} style={{ color: '#22c55e' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Verified Skills</span>
            <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{verifiedCount}</span>
          </div>

          {verifiedCount === 0 ? (
            <div style={{ ...cardStyle, padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
              You haven't verified any skills yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {verifiedSkills.map((skill, i) => {
                const score = user?.verificationScores?.[skill];
                const meta = { domain: topicMap[skill] || 'General', confidence: score ?? 100 };
                return (
                  <div key={i} className="glossy-card" style={{ ...cardStyle, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }}></div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{skill}</div>
                      </div>
                      <button onClick={() => setSkillToRemove(skill)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px', transition: 'color 0.2s' }}>
                        <IconTrash size={16} />
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: '#1d4ed8', marginBottom: '20px', marginLeft: '14px', fontWeight: 600 }}>{meta.domain}</div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Confidence Score</span>
                        <span style={{ fontSize: '11px', color: '#22c55e', fontWeight: 700 }}>{meta.confidence}%</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${meta.confidence}%`, height: '100%', background: '#22c55e', borderRadius: '2px' }}></div>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleQuizStart(skill)}
                        style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Retake Quiz →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Verification Section */}
        {pendingSkills.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '24px', height: '24px', background: '#fef3c7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCircle size={14} strokeWidth={3} style={{ color: '#f59e0b' }} />
            </div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Pending Verification</span>
              <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{pendingSkills.length}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {pendingSkills.map((skill, i) => (
                <div key={i} className="glossy-card" style={{ ...cardStyle, border: '1px solid #fde047', background: '#fffbeb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }}></div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{skill}</div>
                    </div>
                    <button onClick={() => setSkillToRemove(skill)} style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' }}>
                      <IconTrash size={16} />
                    </button>
                  </div>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', marginBottom: '16px', marginLeft: '14px', fontWeight: 600 }}>{topicMap[skill] || 'General'}</div>
                  
                  <div style={{ fontSize: '11px', color: '#d97706', marginBottom: '24px', marginLeft: '14px', fontWeight: 600 }}>Not Verified</div>

                  <div style={{ marginTop: 'auto' }}>
                    <button 
                      onClick={() => handleQuizStart(skill)}
                      style={{ width: '100%', padding: '12px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8' }}
                    >
                      Start Verification Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Listings Section */}
        <div style={{ marginTop: '40px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>My Active Listings</span>
              <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{myListings.length}</span>
            </div>
            <button 
              onClick={() => setIsCreateSessionOpen(true)}
              style={{ padding: '8px 16px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <IconPlus size={14} strokeWidth={2.5} /> Create Listing
            </button>
          </div>

          {myListings.length === 0 ? (
            <div style={{ ...cardStyle, padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
              You don't have any active listings. Create one to start sharing your skills!
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {myListings.map((listing, i) => {
                const primarySkill = listing.offeredSkills?.[0]?.name || listing.requestedSkills?.[0]?.name || 'Unknown';
                const isVerified = user?.verifiedSkills?.includes(primarySkill) || false;
                return (
                  <div key={i}>
                    <MarketplaceCard 
                      title={listing.title}
                      category={listing.category}
                      price={listing.listingType === 'SWAP' ? 'Skill Swap' : (listing.price ? `₹${listing.price}/hr` : 'Free')}
                      user={{ name: user?.name || 'You', year: user?.year || 'Unknown', branch: user?.programme || 'Not specified' }}
                      rating={listing.averageRating || 0}
                      sessionsCount={listing.reviewCount || 0}
                      mode={listing.availability === 'ONLINE' ? 'Online' : 'In-person'}
                      isVerified={isVerified}
                      actionButtons={
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setEditingListing(listing); }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#475569', transition: 'color 0.2s', padding: 0, display: 'flex', alignItems: 'center' }}
                            title="Edit Listing"
                          >
                            <IconPencil size={18} strokeWidth={2} />
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setListingToDelete(listing); }}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', transition: 'color 0.2s', padding: 0, display: 'flex', alignItems: 'center' }}
                            title="Delete Listing"
                          >
                            <IconTrash size={18} strokeWidth={2} />
                          </button>
                        </>
                      }
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews History Section */}
        <div style={{ marginTop: '40px' }}>
          <ReviewSection 
            userId={user?.userId || user?.id || user?._id}
            averageRating={user?.stats?.ratingAvg}
            reviewCount={user?.stats?.ratingCount}
            onLoaded={handleReviewsLoaded}
          />
        </div>
      </div>
      </div>

      {skillToRemove && (
        <div className="modal-overlay" onClick={() => setSkillToRemove(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ padding: '24px', maxWidth: '400px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#111827' }}>Remove Skill</h3>
            <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#4b5563', lineHeight: '1.5' }}>
              Are you sure you want to remove <strong>{skillToRemove}</strong>? You will lose any verification progress for this skill.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button 
                onClick={() => setSkillToRemove(null)}
                style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                onClick={confirmRemoveSkill}
                style={{ padding: '8px 16px', borderRadius: '100px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
