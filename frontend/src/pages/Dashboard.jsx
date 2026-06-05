import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import SessionRequestPopup from '../components/common/SessionRequestPopup';
import Avatar from '../components/common/Avatar';
import { 
  IconSparkles, 
  IconCheck, 
  IconStarFilled, 
  IconCurrencyRupee, 
  IconArrowUpRight 
} from '@tabler/icons-react';

const Dashboard = () => {
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
    sessionsDone: 11,
    swapsDone: 3
  };
  const walletBalance = user?.walletBalance || 840;

  // Get upcoming sessions for the dashboard (limit to 2)
  const upcomingSessions = bookedSessions.filter(s => s.status === 'join' || s.status === 'soon').slice(0, 2);

  // Get recent chats (limit to 2)
  const recentChats = conversations.slice(0, 2);

  // Filter for real incoming pending requests
  const pendingRequests = requests.filter(r => r.direction === 'incoming' && r.status === 'pending');
  const activeRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  if (!user) return null;

  return (
    <div id="home" className="pg on" style={{ padding: '24px 32px', background: '#F4F5F9', height: '100%', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}>
      
      {activeRequest && (
        <div style={{ position: 'absolute', top: '24px', right: '32px', zIndex: 10 }}>
          <SessionRequestPopup 
            request={activeRequest}
            remainingCount={pendingRequests.length - 1}
            onAccept={() => acceptRequest(activeRequest.id)} 
            onDecline={() => declineRequest(activeRequest.id)}
          />
        </div>
      )}

      <div style={{ maxWidth: '1100px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Hero Banner */}
        <div style={{ background: '#4A3E9C', borderRadius: '12px', padding: '24px 32px', marginBottom: '20px', color: '#ffffff', boxShadow: '0 4px 20px rgba(74, 62, 156, 0.15)', flexShrink: 0 }}>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px', fontWeight: 500 }}>Welcome back</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginBottom: '4px', letterSpacing: '-0.3px' }}>{user?.name || 'Arjun Kumar'}</div>
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: 400 }}>{user?.meta || '3rd year · CSE · PESU Bengaluru'}</div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px', flexShrink: 0 }}>
          
          {/* Stat 1 */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#e0e7ff', color: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <IconSparkles size={14} strokeWidth={2} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{stats.skillsOffered}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>Skills offered</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#059669' }}>
              <IconArrowUpRight size={12} strokeWidth={2.5} /> Active
            </div>
          </div>

          {/* Stat 2 */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <IconCheck size={14} strokeWidth={2.5} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{stats.sessionsDone}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>Sessions done</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#059669' }}>
              <IconArrowUpRight size={12} strokeWidth={2.5} /> +2 this week
            </div>
          </div>

          {/* Stat 3 */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#ffedd5', color: '#ea580c', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <IconStarFilled size={14} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>{stats.trustScore}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>Trust score</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#059669' }}>
              <IconArrowUpRight size={12} strokeWidth={2.5} /> Top 10%
            </div>
          </div>

          {/* Stat 4 */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: '#d1fae5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <IconCurrencyRupee size={14} strokeWidth={2} />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>₹{walletBalance}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px', fontWeight: 500 }}>Wallet balance</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 600, color: '#4f46e5' }}>
              {stats.swapsDone} swaps done
            </div>
          </div>

        </div>

        {/* Two Column Layout: Sessions & Messages */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', flex: 1, minHeight: 0 }}>
          
          {/* Upcoming Sessions Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Upcoming sessions</span>
              <button onClick={() => navigate('/app/sessions')} style={{ fontSize: '12px', color: '#534AB7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>See all</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => (
                <div key={session.id || i} style={{ border: '1px solid #f3f4f6', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff' }}>
                  <div style={{ background: '#f5f4ff', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#534AB7' }}>
                    <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1.2 }}>{session.date?.split(' ')[0] || '22'}</div>
                    <div style={{ fontSize: '9px', fontWeight: 600, textTransform: 'uppercase' }}>{session.month || 'MAY'}</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{session.title || 'React.js'} · {session.partner || 'Priya S.'}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{session.time || '4:00 PM'} · {session.type === 'swap' ? 'Swap' : 'Online'}</div>
                  </div>
                  <div>
                    {session.status === 'soon' ? (
                      <button style={{ fontSize: '11px', padding: '6px 16px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#6b7280', fontWeight: 600 }} disabled>Soon</button>
                    ) : (
                      <button style={{ fontSize: '11px', padding: '6px 16px', borderRadius: '6px', border: 'none', background: '#534AB7', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }}>Join</button>
                    )}
                  </div>
                </div>
              )) : (
                <div style={{ fontSize: '12px', color: '#9ca3af', padding: '20px 0', textAlign: 'center' }}>No upcoming sessions.</div>
              )}
            </div>
          </div>

          {/* Recent Messages Card */}
          <div style={{ background: '#ffffff', borderRadius: '12px', padding: '20px', border: '1px solid #E5E7EB', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>Recent messages</span>
              <button onClick={() => navigate('/app/messages')} style={{ fontSize: '12px', color: '#534AB7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Open</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
              {recentChats.map(chat => (
                <div key={chat.id} onClick={() => navigate(`/app/messages?chatId=${chat.id}`)} style={{ border: '1px solid #f3f4f6', borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#ffffff', cursor: 'pointer' }}>
                  <Avatar initials={chat.init || 'U'} bg={chat.bg} color={chat.col} size="36px" fontSize="13px" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827', marginBottom: '2px' }}>{chat.name || 'Unknown User'}</div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>{chat.preview || chat.lastMsg || 'No messages'}</div>
                  </div>
                  {chat.unread > 0 && (
                    <div style={{ background: '#534AB7', color: '#ffffff', fontSize: '10px', fontWeight: 700, width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {chat.unread}
                    </div>
                  )}
                </div>
              ))}
              {recentChats.length === 0 && (
                <div style={{ fontSize: '12px', color: '#9ca3af', padding: '20px 0', textAlign: 'center' }}>No recent messages.</div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
