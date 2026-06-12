import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';
import { IconMapPin, IconCalendarMonth } from '@tabler/icons-react';

import ProfileHeader from '../components/profile/ProfileHeader';
import StatsCards from '../components/profile/StatsCards';
import TrustScore from '../components/profile/TrustScore';
import VerifiedSkills from '../components/profile/VerifiedSkills';
import MarketplaceCard from '../components/common/MarketplaceCard/MarketplaceCard';

import { userService } from '../services/userService';
import { listingService } from '../services/listingService';
import { getTopics } from '../services/topicService';

const PublicProfile = () => {
  const { rollNo } = useParams();
  const navigate = useNavigate();
  const { triggerToast } = useAppData();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [statsData, setStatsData] = useState(null);
  const [listings, setListings] = useState([]);
  
  const [topicMap, setTopicMap] = useState({});

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
          setListings(listingsRes.data || []);
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
      <ProfileHeader user={profileData} isOwner={false} />

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 24px' }}>
        {/* Name and Basic Info */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
            {profileData.name}
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', color: '#6b7280', fontSize: '15px', fontWeight: 500 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <IconMapPin size={18} />
              {profileData.programme || 'Programme not set'} • {profileData.year || 'Year not set'}
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
                <MarketplaceCard key={listing._id} listing={listing} currentUser={null} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfile;
