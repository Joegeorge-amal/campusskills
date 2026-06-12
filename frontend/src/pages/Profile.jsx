import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../components/common/Avatar';
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
  IconTrash
} from '@tabler/icons-react';
import SkillQuizModal from '../components/modals/SkillQuizModal';
import CreateListingModal from '../components/modals/CreateListingModal';
import MarketplaceCard from '../components/common/MarketplaceCard/MarketplaceCard';
import { listingService } from '../services/listingService';
import { getTopics } from '../services/topicService';
import AutocompleteInput from '../components/AutocompleteInput';
import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCards from '../components/profile/StatsCards';
import TrustScore from '../components/profile/TrustScore';
import VerifiedSkills from '../components/profile/VerifiedSkills';
const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { triggerToast } = useAppData();
  const navigate = useNavigate();

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
  const [allTopicsList, setAllTopicsList] = useState([]);
  const [topicMap, setTopicMap] = useState({});

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
    const userId = user?._id || user?.id;
    if (userId) {
      listingService.searchListings({ ownerId: userId })
        .then(res => setMyListings(res.data || []))
        .catch(console.error);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user?.id]);
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
    return [...Array(24)].map(() => 
      [...Array(7)].map(() => {
        return { level: 0, opacity: 0.1 };
      })
    );
  }, []);

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
  
  const verifiedSkills = user?.verifiedSkills || [];
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
      
      // Scroll to pending verification area
      setTimeout(() => {
        if (pendingVerificationRef.current) {
          pendingVerificationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
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
  
  // Deduplicate for safe counting in case database already has duplicates
  const uniqueVerified = Array.from(new Set(verifiedSkills));
  const verifiedCount = uniqueVerified.length;
  
  const rawPercent = totalSkills > 0 ? Math.round((verifiedCount / totalSkills) * 100) : 0;
  const trustScorePercent = Math.min(rawPercent, 100);
  const isProfileVerified = totalSkills > 0 && verifiedCount >= totalSkills;

  const [isFlyingUp, setIsFlyingUp] = useState(false);
  const prevScoreRef = useRef(trustScorePercent);
  const pendingVerificationRef = useRef(null);

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

      {/* Profile Header */}
      <ProfileHeader 
        user={user} 
        isOwner={true} 
        onEditProfile={() => navigate('/app/edit-profile')} 
      />

      <div style={{ maxWidth: '1000px', margin: '40px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div></div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={() => setIsCreateSessionOpen(true)}
              style={{ padding: '8px 16px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconPlus size={16} /> Create Session
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
                {user?.programme || 'Not specified'} • {user?.year || 'Unknown year'}
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

        <StatsCards user={user} stats={user?.stats} />

        {/* Verification Trust Score Card */}
        {(!isProfileVerified || isFlyingUp) && (
          <TrustScore 
            trustScorePercent={trustScorePercent}
            isProfileVerified={isProfileVerified}
            totalSkills={totalSkills}
            verifiedCount={verifiedCount}
          />
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
        <div style={{ marginBottom: '32px' }}>
          <VerifiedSkills 
            verifiedSkills={uniqueVerified} 
            pendingSkills={pendingSkills} 
            topicMap={topicMap} 
            isOwner={true}
            onRemoveSkill={(skill) => setSkillToRemove(skill)}
            onRetakeQuiz={(skill) => handleQuizStart(skill)}
          />
        </div>

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
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ pointerEvents: 'none' }}>
                      <MarketplaceCard 
                        title={listing.title}
                        category={listing.category}
                        price={listing.listingType === 'SWAP' ? 'Skill Swap' : (listing.price ? `₹${listing.price}/hr` : 'Free')}
                        user={{ name: user?.name || 'You', year: user?.year || 'Unknown', branch: user?.programme || 'Not specified' }}
                        rating={user?.stats?.ratingAvg?.toFixed(1) || '5.0'}
                        sessionsCount={user?.stats?.sessionsCompleted || 0}
                        mode={listing.availability === 'ONLINE' ? 'Online' : 'In-person'}
                        isVerified={isVerified}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setEditingListing(listing)}
                        style={{ flex: 1, padding: '8px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={async () => {
                          if (window.confirm('Are you sure you want to delete this listing?')) {
                            await listingService.deactivateListing(listing.id);
                            fetchMyListings();
                            triggerToast('Listing deleted successfully');
                          }
                        }}
                        style={{ flex: 1, padding: '8px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', fontWeight: 600, fontSize: '12px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
