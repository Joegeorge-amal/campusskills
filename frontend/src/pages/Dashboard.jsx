import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import SessionRequestPopup from '../components/common/SessionRequestPopup';
import CreateListingModal from '../components/modals/CreateListingModal';
import Avatar from '../components/common/Avatar';
import { 
  IconSparkles, 
  IconCheck, 
  IconStarFilled, 
  IconStar
} from '@tabler/icons-react';

const Dashboard = () => {
  const [isCreateSessionOpen, setIsCreateSessionOpen] = React.useState(false);
  const { user } = useAuth();
  const { 
    sessionsData = [], 
    requestsData = [],
    acceptRequest,
    declineRequest
  } = useAppData();
  const navigate = useNavigate();

  // Get completed sessions
  const completedSessions = sessionsData.filter(s => s.status === 'COMPLETED');

  // Mock stats
  const stats = {
    trustScore: user?.stats?.ratingAvg?.toFixed(1) || '0.0',
    skillsOffered: user?.skillsOffered?.length || 0,
    sessionsDone: completedSessions.length
  };

  // Get upcoming sessions for the dashboard (limit to 2 or 3)
  const upcomingSessions = sessionsData.filter(s => s.status === 'SCHEDULED').slice(0, 3);

  // Filter for real incoming pending requests
  const pendingRequests = requestsData.filter(r => r.direction === 'incoming' && r.status === 'pending');
  const activeRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  if (!user) return null;

  return (
    <div id="home" className="pg on" style={{ padding: '20px 24px', backgroundColor: 'var(--cs-bg-light)', backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px)', backgroundSize: '24px 24px', minHeight: '100%', boxSizing: 'border-box', position: 'relative', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      
      {activeRequest && (
        <SessionRequestPopup 
          request={activeRequest}
          remainingCount={pendingRequests.length - 1}
          onAccept={() => acceptRequest(activeRequest.id)} 
          onDecline={() => declineRequest(activeRequest.id)}
        />
      )}

      <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: '#1e40af', margin: '0 0 24px 8px', letterSpacing: '-0.5px' }}>Dashboard</h1>
        {/* Hero Banner */}
        <div className="dashboard-hero desktop-hero" style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)', 
          borderRadius: '12px', 
          padding: '20px 28px', 
          marginBottom: '16px', 
          color: '#ffffff', 
          boxShadow: '0 4px 16px rgba(47, 95, 233, 0.15)', 
          flexShrink: 0, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px', fontWeight: 500 }}>Welcome back</div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.3px' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>{user?.year ? `${user.year} · ${user.programme || ''}` : ''}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.1)', 
              border: '1px solid rgba(255, 255, 255, 0.2)', 
              borderRadius: '10px', 
              padding: '8px 16px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '20px', fontWeight: 700, marginBottom: '2px' }}>
                {stats.trustScore} <IconStarFilled size={16} style={{ color: '#facc15' }} />
              </div>
              <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                Trust score
              </div>
            </div>
            <button 
              onClick={() => setIsCreateSessionOpen(true)}
              style={{ padding: '8px 20px', background: '#ffffff', color: '#1e40af', border: 'none', borderRadius: '12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              + Create Listing
            </button>
          </div>
        </div>

        <div className="dashboard-hero mobile-hero" style={{ 
          background: 'linear-gradient(135deg, #2563eb 0%, #4338ca 100%)', 
          borderRadius: '12px', 
          marginBottom: '16px', 
          color: '#ffffff', 
          boxShadow: '0 4px 16px rgba(47, 95, 233, 0.15)', 
          flexShrink: 0, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          padding: '16px 20px' 
        }}>
          <div className="hero-left">
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.55)', marginBottom: '2px', fontWeight: 500 }}>Welcome back</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '2px', letterSpacing: '-0.2px' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>{user?.year ? `${user.year} · ${user.programme || ''}` : ''}</div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '18px', fontWeight: 700, marginBottom: '1px' }}>
                {stats.trustScore} <IconStarFilled size={14} style={{ color: '#facc15' }} />
              </div>
              <div style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 500 }}>
                Trust score
              </div>
            </div>
            <button 
              className="hero-create-btn"
              onClick={() => setIsCreateSessionOpen(true)}
              style={{ padding: '6px 16px', background: '#ffffff', color: '#1e40af', border: 'none', borderRadius: '10px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              + Create Listing
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', flexShrink: 0 }}>
          
          {/* Stat 1 */}
          <div className="glossy-card sc-card sc-skills" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f0f6ff', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 2px rgba(0, 0, 0, 0.15)' }}>
              <IconSparkles size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1 }}>{stats.skillsOffered}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Skills offered</div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="glossy-card sc-card sc-sessions" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#ecfdf5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 2px rgba(0, 0, 0, 0.15)' }}>
              <IconCheck size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1 }}>{stats.sessionsDone}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Sessions done</div>
            </div>
          </div>

          {/* Stat 3 - Trust Score */}
          <div 
            className="glossy-card ts-card" 
            onClick={() => navigate('/app/profile', { state: { scrollToReviews: true } })}
            style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '10px', cursor: 'pointer' }}
          >
            <div className="tsc-icon" style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 2px rgba(0, 0, 0, 0.15)' }}>
              <IconStar size={24} strokeWidth={1.5} />
            </div>
            <div className="tsc-body" style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="tsc-score" style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1 }}>{stats.trustScore}</div>
              <div className="tsc-label" style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '2px' }}>Trust score</div>
              <div className="tsc-based" style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Based on {user?.stats?.ratingCount || 0} reviews</div>
            </div>
          </div>

        </div>

        {/* Two Column Layout: Sessions & Pending Requests */}
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          
          {/* Upcoming Sessions Card */}
          <div className="glossy-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Upcoming sessions</span>
              <button onClick={() => navigate('/app/sessions')} style={{ fontSize: '12px', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>See all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => (
                <div key={session.id || i} style={{ border: '1px solid #dbeafe', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(to bottom right, rgba(239, 246, 255, 0.6) 0%, rgba(255, 255, 255, 0.6) 100%)' }}>
                  <div style={{ background: '#1d4ed8', borderRadius: '14px', width: '48px', height: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: '0 4px 12px rgba(29, 78, 216, 0.4)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.1 }}>{session.day || '22'}</div>
                    <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>{session.month || 'MAY'}</div>
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
                    <button onClick={() => navigate('/app/sessions')} style={{ fontSize: '12px', padding: '8px 20px', borderRadius: '14px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>Open</button>
                  </div>
                </div>
              )) : (
                <div style={{ fontSize: '12px', color: '#9ca3af', padding: '16px 0', textAlign: 'center' }}>No upcoming sessions.</div>
              )}
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className="glossy-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Pending Requests</span>
              <button onClick={() => navigate('/app/requests')} style={{ fontSize: '12px', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Open</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {pendingRequests.length > 0 ? pendingRequests.map((req, i) => {
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
                  <div key={req.id || i} style={{ border: '1px solid #f3f4f6', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff' }}>
                    <Avatar initials={req.init || 'U'} bg={req.bg || '#e0e7ff'} color={req.col || '#1e40af'} size="38px" fontSize="13px" />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cs-primary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                        {reqType}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                        {listingTitle} • {participantName}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ fontSize: '12px', color: '#9ca3af', padding: '16px 0', textAlign: 'center' }}>No pending requests.</div>
              )}
            </div>
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
