import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { listingService } from '../services/listingService';
import CreateListingModal from '../components/modals/CreateListingModal';
import Avatar from '../components/common/Avatar';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { 
  IconSparkles, 
  IconCheck, 
  IconStarFilled, 
  IconStar,
  IconTrophy,
  IconCalendarMonth,
  IconArrowsRightLeft,
  IconActivity
} from '@tabler/icons-react';

const Dashboard = () => {
  const [isCreateSessionOpen, setIsCreateSessionOpen] = React.useState(false);
  const { user } = useAuth();
  const { 
    sessionsData = [], 
    requestsData = [],
    isSessionsLoading,
    isRequestsLoading
  } = useAppData();
  const navigate = useNavigate();

  // Get completed sessions
  const completedSessions = sessionsData.filter(s => s.status === 'COMPLETED');

  // Fetch real active listing count
  const [activeListingCount, setActiveListingCount] = useState(0);
  useEffect(() => {
    const userId = user?.userId || user?.id || user?._id;
    if (userId) {
      listingService.searchListings({ ownerId: userId })
        .then(res => {
          const listings = res?.listings || res?.data || (Array.isArray(res) ? res : []);
          setActiveListingCount(listings.length);
        })
        .catch(() => setActiveListingCount(0));
    }
  }, [user?.userId, user?.id, user?._id]);

  // Stats
  const stats = {
    trustScore: user?.stats?.ratingAvg?.toFixed(1) || '0.0',
    sessionsDone: completedSessions.length
  };

  // Get upcoming sessions for the dashboard (limit to 3)
  const upcomingSessions = sessionsData.filter(s => s.status === 'SCHEDULED').slice(0, 3);

  // Filter for real incoming pending requests
  const pendingRequests = requestsData.filter(r => r.direction === 'incoming' && r.status === 'pending');

  // Build Recent Activity items from existing local context
  const activities = [];
  completedSessions.slice(0, 2).forEach(s => {
    activities.push({
      id: `session-${s.id}`,
      icon: '✓',
      bg: '#ecfdf5',
      color: '#10b981',
      text: `Session completed with ${s.name}`,
      time: s.date || 'Completed'
    });
  });
  if (user?.stats?.ratingCount > 0) {
    activities.push({
      id: 'rating-stat',
      icon: '⭐',
      bg: '#fffbeb',
      color: '#f59e0b',
      text: `Maintained a ${stats.trustScore} community rating`,
      time: `Based on ${user.stats.ratingCount} reviews`
    });
  }
  if (user?.verifiedSkills && user.verifiedSkills.length > 0) {
    user.verifiedSkills.slice(0, 2).forEach((skill, idx) => {
      const skillName = typeof skill === 'string' ? skill : (skill.name || 'Skill');
      activities.push({
        id: `skill-${idx}`,
        icon: '✓',
        bg: '#eff6ff',
        color: '#3b82f6',
        text: `${skillName} skill verified`,
        time: 'Profile'
      });
    });
  }

  if (!user) return null;

  return (
    <div id="home" className="pg on" style={{ padding: '24px', background: 'linear-gradient(180deg, #fafafa 0%, #f8f9ff 100%)', minHeight: '100%', boxSizing: 'border-box', position: 'relative', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1e40af', margin: '0 0 20px 4px', letterSpacing: '-0.5px' }}>Dashboard</h1>
        
        {/* Hero Banner */}
        <div className="dashboard-hero desktop-hero" style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)', 
          borderRadius: '16px', 
          padding: '24px 28px', 
          marginBottom: '20px', 
          color: '#ffffff', 
          boxShadow: '0 10px 30px -5px rgba(37, 99, 233, 0.25)', 
          flexShrink: 0, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '4px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Welcome back</div>
            <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '4px', letterSpacing: '-0.3px' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>{user?.year ? `${user.year} · ${user.programme || ''}` : ''}</div>
            

          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '12px', 
              padding: '8px 18px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '22px', fontWeight: 800, marginBottom: '2px' }}>
                {stats.trustScore} <IconStarFilled size={18} style={{ color: '#facc15' }} />
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Trust score
              </div>
            </div>
            <button 
              onClick={() => setIsCreateSessionOpen(true)}
              style={{ padding: '10px 20px', background: '#ffffff', color: '#1e40af', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
            >
              + Create Listing
            </button>
          </div>
        </div>

        <div className="dashboard-hero mobile-hero" style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)', 
          borderRadius: '16px', 
          marginBottom: '20px', 
          color: '#ffffff', 
          boxShadow: '0 10px 30px -5px rgba(37, 99, 233, 0.25)', 
          flexShrink: 0, 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'stretch', 
          padding: '20px',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="hero-left">
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)', marginBottom: '2px', fontWeight: 600, textTransform: 'uppercase' }}>Welcome back</div>
              <div style={{ fontSize: '20px', fontWeight: 800, marginBottom: '2px', letterSpacing: '-0.2px' }}>{user?.name || 'User'}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.85)', fontWeight: 500 }}>{user?.year ? `${user.year} · ${user.programme || ''}` : ''}</div>
            </div>
            <div className="hero-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div className="hero-trust-box" style={{ 
                background: 'rgba(255, 255, 255, 0.1)', 
                border: '1px solid rgba(255, 255, 255, 0.2)', 
                borderRadius: '10px', 
                padding: '6px 14px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '18px', fontWeight: 800, marginBottom: '1px' }}>
                  {stats.trustScore} <IconStarFilled size={14} style={{ color: '#facc15' }} />
                </div>
                <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 600, textTransform: 'uppercase' }}>
                  Trust score
                </div>
              </div>
            </div>
          </div>

          <button 
            className="hero-create-btn"
            onClick={() => setIsCreateSessionOpen(true)}
            style={{ padding: '8px 16px', background: '#ffffff', color: '#1e40af', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
          >
            + Create Listing
          </button>
        </div>

        {/* Stats Grid — 4 columns */}
        {(() => {
          const verifiedCount = user?.verifiedSkills?.length || 0;
        
        return (
        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px', width: '100%' }}>
          
          {/* Active Listings */}
          <div className="glossy-card" onClick={() => navigate('/app/marketplace')} style={{ background: '#ffffff', padding: '20px 12px', minHeight: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#f0f6ff', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 8px rgba(37, 99, 235, 0.12)' }}>
              <IconSparkles size={22} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: '4px' }}>{activeListingCount}</div>
              <div style={{ fontSize: '12px', color: '#4b5563', fontWeight: 700, lineHeight: 1.3 }}>Active Listings</div>
            </div>
          </div>

          {/* Sessions Completed */}
          <div className="glossy-card" onClick={() => navigate('/app/sessions')} style={{ background: '#ffffff', padding: '20px 12px', minHeight: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#ecfdf5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 8px rgba(16, 185, 129, 0.12)' }}>
              <IconCheck size={22} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: '4px' }}>{stats.sessionsDone}</div>
              <div style={{ fontSize: '12px', color: '#4b5563', fontWeight: 700, lineHeight: 1.3 }}>Sessions Completed</div>
            </div>
          </div>

          {/* Community Rating */}
          <div className="glossy-card" onClick={() => navigate('/app/profile', { state: { scrollToReviews: true } })} style={{ background: '#ffffff', padding: '20px 12px', minHeight: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 8px rgba(234, 179, 8, 0.12)' }}>
              <IconStar size={22} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: '4px' }}>{stats.trustScore}</div>
              <div style={{ fontSize: '12px', color: '#4b5563', fontWeight: 700, lineHeight: 1.3 }}>Community Rating</div>
              <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500, lineHeight: 1.3 }}>Based on {user?.stats?.ratingCount || 0} reviews</div>
            </div>
          </div>

          {/* Verified Skills */}
          <div className="glossy-card" onClick={() => navigate('/app/profile', { state: { scrollToVerified: true } })} style={{ background: '#ffffff', padding: '20px 12px', minHeight: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '10px', cursor: 'pointer' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 4px 8px rgba(37, 99, 235, 0.12)' }}>
              <IconTrophy size={22} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.1, marginBottom: '4px' }}>{verifiedCount}</div>
              <div style={{ fontSize: '12px', color: '#4b5563', fontWeight: 700, lineHeight: 1.3 }}>Verified Skills</div>
            </div>
          </div>

        </div>
        );
        })()}

        {/* Two Column Layout: Sessions & Pending Requests */}
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '20px' }}>
          
          {/* Upcoming Sessions Card */}
          <div className="glossy-card" style={{ background: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827', display: 'block' }}>Upcoming sessions</span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, display: 'block', marginTop: '2px' }}>Manage your scheduled skill exchanges.</span>
              </div>
              <button onClick={() => navigate('/app/sessions')} style={{ fontSize: '12px', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>See all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
              {isSessionsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <LoadingSpinner />
                </div>
              ) : upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => (
                <div key={session.id || i} style={{ border: '1px solid rgba(29, 78, 216, 0.08)', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(to bottom right, rgba(239, 246, 255, 0.4) 0%, rgba(255, 255, 255, 0.6) 100%)' }}>
                  <div style={{ background: '#1d4ed8', borderRadius: '14px', width: '48px', height: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.3)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 800, lineHeight: 1.1 }}>{session.day || '22'}</div>
                    <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>{session.month || 'MAY'}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>
                      {session.topic}
                    </div>
                    <div style={{ fontSize: '12px', color: '#4b5563', fontWeight: 600, marginBottom: '2px' }}>
                      Partner: {session.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>
                      {session.time} · {session.mode}
                    </div>
                  </div>
                  <div>
                    <button onClick={() => navigate('/app/sessions')} style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '12px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>Open</button>
                  </div>
                </div>
              )) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center' }}>
                  <IconCalendarMonth size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>No upcoming sessions</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', maxWidth: '280px' }}>Ready to exchange skills? Browse the marketplace to connect with peers.</div>
                  <button onClick={() => navigate('/app/marketplace')} style={{ padding: '8px 16px', borderRadius: '10px', background: '#2563eb', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Browse Marketplace</button>
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className="glossy-card" style={{ background: '#ffffff', padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827', display: 'block' }}>Pending Requests</span>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, display: 'block', marginTop: '2px' }}>Review incoming requests.</span>
              </div>
              <button onClick={() => navigate('/app/requests')} style={{ fontSize: '12px', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Open</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto' }}>
              {isRequestsLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                  <LoadingSpinner />
                </div>
              ) : pendingRequests.length > 0 ? pendingRequests.map((req, i) => {
                let reqType = 'Session Request';
                if (req.type?.toLowerCase().includes('swap')) {
                  reqType = 'Swap Request';
                } else if (req.type?.toLowerCase().includes('chat')) {
                  reqType = 'Chat Request';
                } else if (req.otherUserExtras?.listingType === 'TEACH' || req.otherUserExtras?.listingType === 'TEACH_SWAP') {
                  reqType = 'Teach Request';
                } else if (req.otherUserExtras?.listingType === 'LEARN' || req.otherUserExtras?.listingType === 'LEARN_SWAP') {
                  reqType = 'Learn Request';
                }

                const listingTitle = req.otherUserExtras?.listingTitle || 'Skill Session';
                const participantName = req.name || 'Unknown User';

                return (
                  <div key={req.id || i} style={{ border: '1px solid rgba(0,0,0,0.04)', borderRadius: '16px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', boxShadow: '0 2px 8px rgba(0,0,0,0.01)' }}>
                    <Avatar initials={req.init || 'U'} bg={req.bg || '#e0e7ff'} color={req.col || '#1e40af'} size="38px" fontSize="13px" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--cs-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        {reqType}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                        {listingTitle} • {participantName}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 16px', textAlign: 'center' }}>
                  <IconArrowsRightLeft size={28} style={{ color: '#94a3b8', marginBottom: '8px' }} />
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '4px' }}>No pending requests</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '16px', maxWidth: '280px' }}>Your incoming skill requests and proposals will show up here.</div>
                  <button onClick={() => setIsCreateSessionOpen(true)} style={{ padding: '8px 16px', borderRadius: '10px', background: '#1d4ed8', color: '#fff', border: 'none', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>Share a Skill</button>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Recent Activity Widget */}
        <div className="glossy-card" style={{ background: '#ffffff', padding: '20px', marginBottom: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <IconActivity size={20} style={{ color: '#1e40af' }} />
            <div>
              <span style={{ fontSize: '16px', fontWeight: 800, color: '#111827', display: 'block' }}>Recent Activity</span>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, display: 'block', marginTop: '2px' }}>Recent updates and achievements.</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isSessionsLoading ? (
              <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
                <LoadingSpinner />
              </div>
            ) : activities.length > 0 ? activities.map((act) => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '8px 12px', borderRadius: '12px', background: '#f8fafc' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: act.bg, color: act.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                  {act.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937' }}>{act.text}</div>
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af', fontWeight: 500 }}>{act.time}</div>
              </div>
            )) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 0', textAlign: 'center', color: '#9ca3af' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#6b7280', marginBottom: '2px' }}>Nothing here yet</div>
                <div style={{ fontSize: '12px' }}>Your recent achievements and activity will appear here.</div>
              </div>
            )}
          </div>
        </div>

      </div>

      <CreateListingModal 
        isOpen={isCreateSessionOpen} 
        onClose={() => setIsCreateSessionOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
