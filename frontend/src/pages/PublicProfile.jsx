import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { IconMapPin, IconCalendarMonth, IconMessageCircle, IconDotsVertical } from '@tabler/icons-react';
import ModalWrapper from '../components/common/ModalWrapper';

import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCards from '../components/profile/StatsCards';
import TrustScore from '../components/profile/TrustScore';
import VerifiedSkills from '../components/profile/VerifiedSkills';
import ReviewSection from '../components/profile/ReviewSection';
import MarketplaceCard from '../components/common/MarketplaceCard/MarketplaceCard';
import ReportUserModal from '../components/modals/ReportUserModal';

import { userService } from '../services/userService';
import { listingService } from '../services/listingService';
import { getTopics } from '../services/topicService';
import { chatService } from '../services/chatService';
import { chatRequestService } from '../services/chatRequestService';
import InitialMessageModal from '../components/modals/InitialMessageModal';

const PublicProfile = () => {
  const { rollNo } = useParams();
  const navigate = useNavigate();
  const { chats, triggerToast } = useAppData();
  const { user: currentUser } = useAuth();
  const { lastMessage } = useWebSocket();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [listings, setListings] = useState([]);

  // Deduplicate WS events so we don't process the same lastMessage twice
  const processedWsRef = useRef(null);

  // Listen for realtime profile stat updates
  useEffect(() => {
    if (!lastMessage || lastMessage.type !== 'PROFILE_UPDATED') return;
    if (processedWsRef.current === lastMessage) return;
    processedWsRef.current = lastMessage;

    const { userId, data } = lastMessage.payload || {};
    if (!userId || !data) return;
    // Only update if this profile is currently displayed
    if (userId !== profileData?.userId) return;

    setStatsData(prev => {
      if (!prev) return prev;
      const next = { ...prev };
      if (data.ratingAvg !== undefined) next.ratingAvg = data.ratingAvg;
      if (data.ratingCount !== undefined) next.ratingCount = data.ratingCount;
      if (data.sessionsCompleted !== undefined) next.sessionsCompleted = data.sessionsCompleted;
      if (data.totalMinutes !== undefined) next.totalMinutes = data.totalMinutes;
      return next;
    });

    if (data.verifiedSkills) {
      setProfileData(prev => {
        if (!prev) return prev;
        return { ...prev, verifiedSkills: Array.isArray(data.verifiedSkills) ? data.verifiedSkills : prev.verifiedSkills };
      });
    }
  }, [lastMessage, profileData?.userId]);
  
  const [topicMap, setTopicMap] = useState({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  const handleChatClick = () => {
    if (!profileData?.userId) return;
    
    // Check if an active chat already exists
    const existingChat = chats.find(c => c.otherId === profileData.userId);
    if (existingChat) {
      navigate(`/app/messages/${existingChat.id || existingChat._id}`);
      return;
    }
    
    // Otherwise open request modal
    setIsMessageModalOpen(true);
  };

  const [showBlockConfirm, setShowBlockConfirm] = useState(false);

  const handleBlockUser = () => {
    setIsMenuOpen(false);
    setShowBlockConfirm(true);
  };

  const isViewingSelf = currentUser?.userId === profileData?.userId || currentUser?.rollNo?.toLowerCase() === rollNo?.toLowerCase();

  const publicActions = isViewingSelf ? null : (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
      <button 
        onClick={handleChatClick}
        style={{ 
          background: '#2563eb', color: '#fff', border: 'none', 
          padding: '8px 16px', borderRadius: '8px', fontWeight: 600, 
          cursor: 'pointer', display: 'flex', 
          alignItems: 'center', gap: '6px'
        }}
      >
        <IconMessageCircle size={18} /> Chat with User
      </button>

      <button 
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        style={{ 
          background: '#f1f5f9', border: 'none', color: '#475569', 
          width: '36px', height: '36px', borderRadius: '8px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' 
        }}
      >
        <IconDotsVertical size={20} />
      </button>

      {isMenuOpen && (
        <>
          <div 
            onClick={() => setIsMenuOpen(false)} 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 90 }}
          />
          <div style={{ 
            position: 'absolute', top: '100%', right: 0, marginTop: '8px', 
            background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '12px', 
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)', minWidth: '150px', 
            zIndex: 100, overflow: 'hidden' 
          }}>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                setIsReportModalOpen(true);
              }}
              style={{ 
                width: '100%', textAlign: 'left', padding: '12px 16px', 
                background: 'none', border: 'none', color: '#ef4444', 
                fontSize: '14px', fontWeight: 500, cursor: 'pointer' 
              }}
              onMouseOver={(e) => e.target.style.background = '#fef2f2'}
              onMouseOut={(e) => e.target.style.background = 'none'}
            >
              Report User
            </button>
            <button 
              onClick={handleBlockUser}
              style={{ 
                width: '100%', textAlign: 'left', padding: '12px 16px', 
                background: 'none', border: 'none', color: '#ef4444', 
                fontSize: '14px', fontWeight: 500, cursor: 'pointer' 
              }}
              onMouseOver={(e) => e.target.style.background = '#fef2f2'}
              onMouseOut={(e) => e.target.style.background = 'none'}
            >
              Block User
            </button>
          </div>
        </>
      )}
    </div>
  );

  useEffect(() => {
    getTopics().then(res => {
      const topics = res?.data || res;
      if (Array.isArray(topics) && topics.length > 0) {
        const map = {};
        topics.forEach(t => { map[t.name] = t.category; });
        setTopicMap(map);
      }
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await userService.getPublicProfile(rollNo);
        const data = response.data || response;
        
        setProfileData(data.profile);
        setStatsData(data.stats);

        if (data.profile?.userId) {
          const listingsRes = await listingService.searchListings({ ownerId: data.profile.userId });
          setListings(listingsRes?.listings || listingsRes?.data || (Array.isArray(listingsRes) ? listingsRes : []));
        }
      } catch (err) {
        console.error("Failed to load public profile", err);
        triggerToast("Profile not found or is private.");
        navigate("/app/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rollNo, navigate]);

  if (loading || !profileData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc' }}>
        <svg width="32" height="32" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ animation: 'spin 0.8s linear infinite' }}>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <circle cx="12" cy="12" r="10" stroke="rgba(37, 99, 235, 0.15)" strokeWidth="3.5" fill="none" />
          <path d="M12 2 a10 10 0 0 1 10 10" stroke="#2563eb" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  const skillsOfferedObjects = profileData.skillsOffered || [];
  const skillsOffered = skillsOfferedObjects.map(s => s.name || s);
  
  const verifiedSkills = profileData.verifiedSkills || [];
  const pendingSkills = skillsOffered.filter(skill => !verifiedSkills.includes(skill));

  const uniqueVerified = Array.from(new Set(verifiedSkills));
  const verifiedCount = uniqueVerified.length;
  const totalSkills = skillsOffered.length;
  const rawPercent = totalSkills > 0 ? Math.round((verifiedCount / totalSkills) * 100) : 0;
  const trustScorePercent = Math.min(rawPercent, 100);
  const isProfileVerified = totalSkills > 0 && verifiedCount >= totalSkills;

  return (
    <div className="pg on" style={{ padding: 0, background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      <ProfileHeader user={profileData} isOwner={false} publicActions={publicActions} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
        {/* Name and Basic Info */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            {profileData.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconMapPin size={18} />
              {profileData.programme || 'Programme not specified'} • {profileData.year || 'Year not specified'}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconCalendarMonth size={18} />
              Joined: {profileData.createdAt ? new Date(profileData.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Not available'}
            </div>
          </div>
          
          {profileData.bio && (
            <div style={{ marginTop: '16px', fontSize: '15px', color: '#4b5563', lineHeight: '1.6', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #f3f4f6' }}>
              {profileData.bio}
            </div>
          )}
        </div>

        <StatsCards user={profileData} stats={statsData} />

        <TrustScore 
          trustScorePercent={trustScorePercent} 
          isProfileVerified={isProfileVerified} 
          totalSkills={totalSkills} 
          verifiedCount={verifiedCount} 
          variant="blue"
        />

        <div style={{ marginBottom: '40px' }}>
          <VerifiedSkills 
            verifiedSkills={uniqueVerified} 
            pendingSkills={pendingSkills} 
            topicMap={topicMap} 
            isOwner={false} 
          />
        </div>

        {listings.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', marginBottom: '20px' }}>Active Listings</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {listings.map(listing => (
                <MarketplaceCard 
                  key={listing._id}
                  title={listing.title}
                  description={listing.description}
                  category={listing.category}
                  typeLabel={listing.listingType === 'SWAP' ? 'Skill Swap' : (listing.listingType === 'TEACH' ? 'Offering' : 'Requesting')}
                  price={listing.listingType === 'SWAP' ? 'Skill Swap' : (listing.price ? `₹${listing.price}/hr` : 'Free')}
                  user={{ name: profileData?.name || 'Unknown', year: profileData?.year || '', branch: profileData?.programme || '' }}
                  rating={statsData?.ratingAvg?.toFixed(1) || '5.0'}
                  sessionsCount={statsData?.sessionsCompleted || 0}
                  mode={listing.availability === 'ONLINE' ? 'Online' : (listing.availability || 'In-person')}
                  isVerified={uniqueVerified.includes(listing.title)}
                  variant="profile"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Reviews Section */}
        <div style={{ marginBottom: '40px' }}>
          <ReviewSection 
            userId={profileData.userId} 
            averageRating={statsData?.ratingAvg}
            reviewCount={statsData?.ratingCount}
          />
        </div>
      </div>

      <ReportUserModal 
        isOpen={isReportModalOpen} 
        onClose={() => setIsReportModalOpen(false)} 
        userName={profileData.name} 
      />

      {isMessageModalOpen && (
        <InitialMessageModal 
          selectedTutor={profileData?.name || 'Unknown User'}
          onClose={() => setIsMessageModalOpen(false)}
          onSend={async (messageText) => {
            try {
              await chatRequestService.createRequest({
                receiverId: profileData.userId,
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
              } else {
                 triggerToast(serverError || 'Failed to send request.');
              }
            }
          }}
        />
      )}
      <ModalWrapper isOpen={showBlockConfirm} onClose={() => setShowBlockConfirm(false)} maxWidth="320px" zIndex={10000}>
        <div style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600, color: '#0f172a' }}>Block {profileData?.name}?</h3>
          <p style={{ margin: '0 0 24px 0', fontSize: '14px', color: '#64748b', lineHeight: '1.4' }}>Are you sure you want to block this user? They will not be able to message you or view your listings.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowBlockConfirm(false)} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
            <button
              onClick={async () => {
                setShowBlockConfirm(false);
                try {
                  await userService.blockUser(profileData.userId);
                  triggerToast('User blocked successfully.');
                  navigate('/app/dashboard');
                } catch (err) {
                  console.error('Block user error:', err);
                  triggerToast('Failed to block user');
                }
              }}
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
            >
              Block
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
};

export default PublicProfile;
