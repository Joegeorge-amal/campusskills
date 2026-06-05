import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import CreateSessionModal from '../components/modals/CreateSessionModal';
import StatCard from '../components/common/StatCard';
import SessionCard from '../components/common/SessionCard';
import ChatListItem from '../components/common/ChatListItem';
import SessionRequestPopup from '../components/common/SessionRequestPopup';
import { IconStar, IconSparkles, IconCheck, IconCurrencyRupee, IconArrowUpRight } from '@tabler/icons-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    bookedSessions, 
    conversations, 
    requests,
    acceptRequest,
    declineRequest
  } = useAppData();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
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

  // Get recent chats (limit to 3)
  const recentChats = conversations.slice(0, 3);

  // Filter for real incoming pending requests
  const pendingRequests = requests.filter(r => r.direction === 'incoming' && r.status === 'pending');
  const activeRequest = pendingRequests.length > 0 ? pendingRequests[0] : null;

  if (!user) return null;

  return (
    <div id="home" className="pg on" style={{ padding: '24px', background: '#f9fafb', minHeight: '100vh', position: 'relative' }}>
      
      {activeRequest && (
        <SessionRequestPopup 
          request={activeRequest}
          remainingCount={pendingRequests.length - 1}
          onAccept={() => acceptRequest(activeRequest.id)} 
          onDecline={() => declineRequest(activeRequest.id)}
        />
      )}

      {/* Welcome Banner */}
      <div style={{ background: '#3b368c', borderRadius: '16px', padding: '32px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '8px' }}>Welcome back</div>
          <div style={{ fontSize: '28px', fontWeight: 600, color: '#fff', marginBottom: '8px', letterSpacing: '-0.5px' }}>{user?.name || 'Arjun Kumar'}</div>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>{user?.meta || '3rd year · CSE · PESU Bengaluru'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
              {stats.trustScore} <IconStar size={20} color="#F0C040" fill="#F0C040" />
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '4px' }}>Trust score · Top 10%</div>
          </div>
          <button 
            onClick={() => setIsCreateSessionOpen(true)} 
            style={{ fontSize: '14px', padding: '10px 24px', borderRadius: '100px', border: 'none', background: '#ffffff', color: '#3b368c', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
          >
            Create Session
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard 
          variant="dashboard"
          icon={<IconSparkles size={16} />}
          iconBg="#f5f3ff"
          iconColor="#6d28d9"
          value={stats.skillsOffered}
          label="Skills offered"
          subText="Active"
          subIcon={<IconArrowUpRight size={12} />}
          subColor="#059669"
        />
        <StatCard 
          variant="dashboard"
          icon={<IconCheck size={16} />}
          iconBg="#dcfce7"
          iconColor="#16a34a"
          value={stats.sessionsDone}
          label="Sessions done"
          subText="+2 this week"
          subIcon={<IconArrowUpRight size={12} />}
          subColor="#059669"
        />
        <StatCard 
          variant="dashboard"
          icon={<IconStar size={16} strokeWidth={2} />}
          iconBg="#ffedd5"
          iconColor="#ea580c"
          value={stats.trustScore}
          label="Trust score"
          subText="Top 10%"
          subIcon={<IconArrowUpRight size={12} />}
          subColor="#059669"
        />
        <StatCard 
          variant="dashboard"
          icon={<IconCurrencyRupee size={16} />}
          iconBg="#d1fae5"
          iconColor="#059669"
          value={`₹${walletBalance}`}
          label="Wallet balance"
          subText={`${stats.swapsDone} swaps done`}
          subColor="#4f46e5"
        />
      </div>

      {/* Two Column Layout: Sessions & Messages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Upcoming Sessions Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Upcoming sessions</span>
            <button onClick={() => navigate('/app/sessions')} style={{ fontSize: '14px', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>See all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => (
              <SessionCard
                variant="dashboard"
                key={session.id || i}
                date={session.date || '--'}
                month={session.month || ''}
                title={session.title || 'Unknown session'}
                subtitle={session.time || ''}
                status={session.status === 'soon' ? 'soon' : 'upcoming'}
                actions={
                  session.status === 'soon' ? (
                    <button style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#6b7280', fontWeight: 600 }} disabled>Soon</button>
                  ) : (
                    <button style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#4f46e5', color: '#ffffff', cursor: 'pointer', fontWeight: 600 }} onClick={() => console.log('Join session', session.id)}>Join</button>
                  )
                }
              />
            )) : (
              <div style={{ fontSize: '13px', color: '#9ca3af', padding: '20px 0', textAlign: 'center' }}>No upcoming sessions.</div>
            )}
          </div>
        </div>

        {/* Recent Messages Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>Recent messages</span>
            <button onClick={() => navigate('/app/messages')} style={{ fontSize: '14px', color: '#4f46e5', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Open</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentChats.map(chat => (
              <ChatListItem
                variant="card"
                key={chat.id}
                avatarProps={{ initials: chat.init || 'U', bg: chat.bg, color: chat.col, size: '40px', fontSize: '14px' }}
                isOnline={chat.online}
                name={chat.name || 'Unknown User'}
                preview={chat.preview || chat.lastMsg || 'No messages'}
                time={chat.time || ''}
                unreadCount={chat.unread}
                onClick={() => navigate(`/app/messages?chatId=${chat.id}`)}
              />
            ))}
            {recentChats.length === 0 && (
              <div style={{ fontSize: '13px', color: '#9ca3af', padding: '20px 0', textAlign: 'center' }}>No recent messages.</div>
            )}
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
