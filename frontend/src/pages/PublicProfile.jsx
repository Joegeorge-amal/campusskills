import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { useAuth } from '../context/AuthContext';
import { IconMapPin, IconCalendarMonth, IconMessageCircle, IconDotsVertical } from '@tabler/icons-react';

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

const PublicProfile = () => {
  const { rollNo } = useParams();
  const navigate = useNavigate();
  const { triggerToast } = useAppData();
  const { user: currentUser } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [listings, setListings] = useState([]);
  
  const [topicMap, setTopicMap] = useState({});
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatting, setIsChatting] = useState(false);

  const handleChatClick = async () => {
    if (!profileData?.userId) return;
    setIsChatting(true);
    try {
      const res = await chatService.createChat({ participants: [profileData.userId] });
      const chatId = res.id || res._id;
      navigate(`/app/messages/${chatId}`);
    } catch (err) {
      triggerToast('Failed to start chat. Please try again later.');
    } finally {
      setIsChatting(false);
    }
  };

  const handleBlockUser = async () => {
    if (!profileData?.userId) return;
    if (window.confirm('Are you sure you want to block this user?')) {
      try {
        await userService.blockUser(profileData.userId);
        triggerToast('User blocked successfully.');
        navigate('/app/dashboard');
      } catch (err) {
        console.error('Block user error:', err);
        triggerToast('Failed to block user');
      }
    }
    setIsMenuOpen(false);
  };

  const isViewingSelf = currentUser?.userId === profileData?.userId || currentUser?.rollNo?.toLowerCase() === rollNo?.toLowerCase();

  const publicActions = isViewingSelf ? null : (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
      <button 
        onClick={handleChatClick}
        disabled={isChatting}
        style={{ 
          background: '#2563eb', color: '#fff', border: 'none', 
          padding: '8px 16px', borderRadius: '8px', fontWeight: 600, 
          cursor: isChatting ? 'not-allowed' : 'pointer', display: 'flex', 
          alignItems: 'center', gap: '6px', opacity: isChatting ? 0.7 : 1
        }}
      >
        <IconMessageCircle size={18} /> {isChatting ? 'Starting...' : 'Chat with User'}
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
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', 
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', minWidth: '150px', 
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
  }, [rollNo, navigate, triggerToast]);

  if (loading || !profileData) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="spinner">Loading...</div>
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
    </div>
  );
};

export default PublicProfile;
