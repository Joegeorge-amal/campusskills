import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import SessionRequestPopup from '../components/common/SessionRequestPopup';
import CreateSessionModal from '../components/modals/CreateSessionModal';
import Avatar from '../components/common/Avatar';
import { 
  IconSparkles, 
  IconCheck, 
  IconStarFilled, 
  IconStar,
  IconArrowUpRight 
} from '@tabler/icons-react';

const Dashboard = () => {
  const [isCreateSessionOpen, setIsCreateSessionOpen] = React.useState(false);
  const { user } = useAuth();
  const { 
    bookedSessions, 
    conversations, 
    requests,
    acceptRequest,
    declineRequest
  } = useAppData();
  const navigate = useNavigate();

  // Mock stats
  const stats = {
    trustScore: user?.trustScore || '4.8',
    skillsOffered: user?.skillsOffered?.length || 2,
    sessionsDone: 11
  };

  // Get upcoming sessions for the dashboard (limit to 2)
  const upcomingSessions = bookedSessions.filter(s => s.status === 'join' || s.status === 'soon').slice(0, 2);

  // Get recent chats (limit to 2)
  const recentChats = conversations.slice(0, 2);

  // Filter for real incoming pending requests
  const pendingRequests = requests.filter(r => r.direction === 'incoming' && r.status === 'pending');
  const activeRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  if (!user) return null;

  return (
    <div id="home" className="pg on" style={{ padding: '20px 24px', background: '#F4F5F9', minHeight: '100%', boxSizing: 'border-box', position: 'relative', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
      
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
        <div style={{ 
          background: 'linear-gradient(105deg, #1e3a8a 0%, #3b82f6 55%, #1e3a8a 100%)', 
          borderRadius: '12px', 
          padding: '20px 28px', 
          marginBottom: '16px', 
          color: '#ffffff', 
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.15)', 
          flexShrink: 0, 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center' 
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px', fontWeight: 500 }}>Welcome back</div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.3px' }}>{user?.name || 'Arjun Kumar'}</div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: 400 }}>{user?.meta || '3rd year · CSE · PESU Bengaluru'}</div>
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
                Trust score · Top 10%
              </div>
            </div>
            <button 
              onClick={() => setIsCreateSessionOpen(true)}
              style={{ padding: '8px 20px', background: '#ffffff', color: '#1e40af', border: 'none', borderRadius: '100px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              + Create Session
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px', flexShrink: 0 }}>
          
          {/* Stat 1 */}
          <div className="glossy-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#f0f6ff', color: '#1e3a8a', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 2px rgba(0, 0, 0, 0.15)' }}>
              <IconSparkles size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1 }}>{stats.skillsOffered}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Skills offered</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
              <IconArrowUpRight size={12} strokeWidth={2.5} /> Active
            </div>
          </div>

          {/* Stat 2 */}
          <div className="glossy-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#ecfdf5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 2px rgba(0, 0, 0, 0.15)' }}>
              <IconCheck size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1 }}>{stats.sessionsDone}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Sessions done</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
              <IconArrowUpRight size={12} strokeWidth={2.5} /> +2 this week
            </div>
          </div>

          {/* Stat 3 */}
          <div className="glossy-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: '#fef3c7', color: '#92400e', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 2px rgba(0, 0, 0, 0.15)' }}>
              <IconStar size={24} strokeWidth={1.5} />
            </div>
            <div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '2px', lineHeight: 1 }}>{stats.trustScore}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Trust score</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#059669', marginTop: '2px' }}>
              <IconArrowUpRight size={12} strokeWidth={2.5} /> Top 10%
            </div>
          </div>

        </div>

        {/* Two Column Layout: Sessions & Messages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          
          {/* Upcoming Sessions Card */}
          <div className="glossy-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Upcoming sessions</span>
              <button onClick={() => navigate('/app/sessions')} style={{ fontSize: '12px', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>See all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => (
                <div key={session.id || i} style={{ border: '1px solid #dbeafe', borderRadius: '16px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '16px', background: 'linear-gradient(to bottom right, rgba(239, 246, 255, 0.6) 0%, rgba(255, 255, 255, 0.6) 100%)' }}>
                  <div style={{ background: session.status === 'soon' ? '#3b82f6' : '#1d4ed8', borderRadius: '14px', width: '48px', height: '56px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#ffffff', boxShadow: session.status === 'soon' ? '0 4px 12px rgba(59, 130, 246, 0.4)' : '0 4px 12px rgba(29, 78, 216, 0.4)' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.1 }}>{session.date?.split(' ')[0] || '22'}</div>
                    <div style={{ fontSize: '10px', fontWeight: 600, textTransform: 'uppercase' }}>{session.month || 'MAY'}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{session.title || 'React.js'}{session.partner ? ` · ${session.partner}` : ''}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>{session.time || '4:00 PM'} · {session.type === 'swap' ? 'Swap' : 'Online'}</div>
                  </div>
                  <div>
                    {session.status === 'soon' ? (
                      <button style={{ fontSize: '12px', padding: '8px 20px', borderRadius: '14px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#9ca3af', fontWeight: 700 }} disabled>Soon</button>
                    ) : (
                      <button style={{ fontSize: '12px', padding: '8px 20px', borderRadius: '14px', border: 'none', background: '#1e3a8a', color: '#ffffff', cursor: 'pointer', fontWeight: 700 }}>Join</button>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ fontSize: '12px', color: '#9ca3af', padding: '16px 0', textAlign: 'center' }}>No upcoming sessions.</div>
              )}
            </div>
          </div>

          {/* Recent Messages Card */}
          <div className="glossy-card" style={{ background: '#ffffff', borderRadius: '12px', padding: '16px', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Recent messages</span>
              <button onClick={() => navigate('/app/messages')} style={{ fontSize: '12px', color: '#1d4ed8', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>Open</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {recentChats.map((chat, idx) => (
                <div key={chat.id} onClick={() => navigate(`/app/messages?chatId=${chat.id}`)} style={{ border: '1px solid #f3f4f6', borderRadius: '10px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', cursor: 'pointer' }}>
                  <div style={{ position: 'relative' }}>
                    <Avatar initials={chat.init || 'U'} bg={chat.bg || '#e0e7ff'} color={chat.col || '#1e40af'} size="38px" fontSize="13px" />
                    {idx === 0 && (
                      <div style={{ position: 'absolute', bottom: '0px', right: '0px', width: '10px', height: '10px', background: '#10b981', border: '2px solid #ffffff', borderRadius: '50%' }}></div>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{chat.name || 'Unknown User'}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>{chat.preview || chat.lastMsg || 'No messages'}</div>
                  </div>
                  {chat.unread > 0 && (
                    <div style={{ background: '#1d4ed8', color: '#ffffff', fontSize: '10px', fontWeight: 700, width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {chat.unread}
                    </div>
                  )}
                </div>
              ))}
              {recentChats.length === 0 && (
                <div style={{ fontSize: '12px', color: '#9ca3af', padding: '16px 0', textAlign: 'center' }}>No recent messages.</div>
              )}
            </div>
          </div>

        </div>
      </div>

      <CreateSessionModal 
        isOpen={isCreateSessionOpen} 
        onClose={() => setIsCreateSessionOpen(false)} 
      />
    </div>
  );
};

export default Dashboard;
