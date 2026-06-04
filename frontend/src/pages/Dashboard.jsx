import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import CreateSessionModal from '../components/modals/CreateSessionModal';
import StatCard from '../components/common/StatCard';
import SessionCard from '../components/common/SessionCard';
import ChatListItem from '../components/common/ChatListItem';
import { IconStar, IconSparkles, IconCheck, IconCurrencyRupee, IconArrowUpRight } from '@tabler/icons-react';

const Dashboard = () => {
  const { user } = useAuth();
  const { 
    bookedSessions, 
    conversations, 
  } = useAppData();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const navigate = useNavigate();

  // Mock stats
  const stats = {
    trustScore: user?.trustScore || '4.8',
    skillsOffered: user?.skillsOffered?.length || 2,
    sessionsDone: 14,
    swapsDone: 8
  };
  const walletBalance = user?.walletBalance || 840;

  // Get upcoming sessions for the dashboard (limit to 2)
  const upcomingSessions = bookedSessions.filter(s => s.status === 'join' || s.status === 'soon').slice(0, 2);

  // Get recent chats (limit to 3)
  const recentChats = conversations.slice(0, 3);

  if (!user) return null;

  return (
    <div id="home" className="pg on" style={{ padding: '24px', background: 'var(--cs-bg-light)', minHeight: '100vh' }}>
      {/* Welcome Banner */}
      <div style={{ background: 'var(--cs-primary-gradient)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '4px' }}>Welcome back</div>
          <div style={{ fontSize: '24px', fontWeight: 600, color: '#fff' }}>{user?.name || 'Demo User'}</div>
          <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.8)', marginTop: '4px' }}>{user?.meta || 'Student'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '28px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {stats.trustScore} <IconStar size={20} color="#F0C040" fill="#F0C040" />
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>Trust score · Top 10%</div>
          </div>
          <button 
            onClick={() => setIsCreateSessionOpen(true)} 
            style={{ fontSize: '14px', padding: '10px 20px', borderRadius: 'var(--cs-radius-md)', border: 'none', background: 'var(--cs-bg-white)', color: 'var(--cs-primary-dark)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap' }}
          >
            Create Session
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard 
          icon={<IconSparkles size={16} />}
          iconBg="var(--cs-primary-light)"
          iconColor="var(--cs-primary)"
          value={stats.skillsOffered}
          label="Skills offered"
          subText="Active"
          subIcon={<IconArrowUpRight size={12} />}
          subColor="#0F6E56"
        />
        <StatCard 
          icon={<IconCheck size={16} />}
          iconBg="#E1F5EE"
          iconColor="#0F6E56"
          value={stats.sessionsDone}
          label="Sessions done"
          subText="+2 this week"
          subIcon={<IconArrowUpRight size={12} />}
          subColor="#0F6E56"
        />
        <StatCard 
          icon={<IconStar size={16} fill="#854F0B" />}
          iconBg="#FAEEDA"
          iconColor="#854F0B"
          value={stats.trustScore}
          label="Trust score"
          subText="Top 10%"
          subColor="#0F6E56"
        />
        <StatCard 
          icon={<IconCurrencyRupee size={16} />}
          iconBg="#E1F5EE"
          iconColor="#0F6E56"
          value={`₹${walletBalance}`}
          label="Wallet balance"
          subText={`${stats.swapsDone} swaps done`}
          subColor="var(--cs-primary)"
        />
      </div>

      {/* Two Column Layout: Sessions & Messages */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        
        {/* Upcoming Sessions Card */}
        <div style={{ background: 'var(--cs-bg-white)', borderRadius: 'var(--cs-radius-lg)', padding: '20px', border: '0.5px solid var(--cs-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Upcoming sessions</span>
            <button onClick={() => navigate('/app/sessions')} style={{ fontSize: '13px', color: 'var(--cs-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>See all</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => (
              <SessionCard
                key={session.id || i}
                date={session.date || '--'}
                month={session.month || ''}
                title={session.title || 'Unknown session'}
                subtitle={session.time || ''}
                status={session.status === 'soon' ? 'soon' : 'upcoming'}
                actions={
                  session.status === 'soon' ? (
                    <button style={{ fontSize: '11px', padding: '6px 12px', borderRadius: 'var(--cs-radius-sm)', border: '0.5px solid var(--cs-border)', background: 'var(--cs-bg-light)', color: 'var(--cs-text-inactive)', fontWeight: 500 }} disabled>Soon</button>
                  ) : (
                    <button style={{ fontSize: '12px', padding: '6px 14px', borderRadius: 'var(--cs-radius-sm)', border: 'none', background: 'var(--cs-primary)', color: 'var(--cs-bg-white)', cursor: 'pointer', fontWeight: 600 }} onClick={() => console.log('Join session', session.id)}>Join</button>
                  )
                }
              />
            )) : (
              <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', padding: '20px 0', textAlign: 'center' }}>No upcoming sessions.</div>
            )}
          </div>
        </div>

        {/* Recent Messages Card */}
        <div style={{ background: 'var(--cs-bg-white)', borderRadius: 'var(--cs-radius-lg)', padding: '20px', border: '0.5px solid var(--cs-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Recent messages</span>
            <button onClick={() => navigate('/app/messages')} style={{ fontSize: '13px', color: 'var(--cs-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>Open</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {recentChats.map(chat => (
              <ChatListItem
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
              <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', padding: '20px 0', textAlign: 'center' }}>No recent messages.</div>
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
