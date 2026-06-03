import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import CreateSessionModal from '../components/modals/CreateSessionModal';
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
    <div id="home" className="pg on">
      {/* Welcome Banner */}
      <div style={{ background: 'linear-gradient(135deg,#534AB7,#3C3489)', borderRadius: '12px', padding: '14px 16px', marginBottom: '13px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#AFA9EC', marginBottom: '3px' }}>Welcome back</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>{user?.name || 'Demo User'}</div>
          <div style={{ fontSize: '11px', color: '#AFA9EC', marginTop: '2px' }}>{user?.meta || 'Student'}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '22px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {stats.trustScore} <IconStar size={14} color="#f0c040" fill="#f0c040" />
            </div>
            <div style={{ fontSize: '11px', color: '#AFA9EC' }}>Trust score · Top 10%</div>
          </div>
          <button 
            onClick={() => setIsCreateSessionOpen(true)} 
            style={{ fontSize: '12px', padding: '6px 14px', borderRadius: '8px', border: 'none', background: '#fff', color: '#3C3489', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
          >
            Create Session
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="sgrid">
        <div className="scard">
          <div style={{ width: '27px', height: '27px', borderRadius: '7px', background: '#EEEDFE', color: '#534AB7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '7px' }}>
            <IconSparkles size={13} />
          </div>
          <div style={{ fontSize: '19px', fontWeight: 500, color: '#222' }}>{stats.skillsOffered}</div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>Skills offered</div>
          <div style={{ fontSize: '11px', color: '#0F6E56', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}><IconArrowUpRight size={11} /> Active</div>
        </div>
        <div className="scard">
          <div style={{ width: '27px', height: '27px', borderRadius: '7px', background: '#E1F5EE', color: '#0F6E56', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '7px' }}>
            <IconCheck size={13} />
          </div>
          <div style={{ fontSize: '19px', fontWeight: 500, color: '#222' }}>{stats.sessionsDone}</div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>Sessions done</div>
          <div style={{ fontSize: '11px', color: '#0F6E56', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}><IconArrowUpRight size={11} /> +2 this week</div>
        </div>
        <div className="scard">
          <div style={{ width: '27px', height: '27px', borderRadius: '7px', background: '#FAEEDA', color: '#854F0B', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '7px' }}>
            <IconStar size={13} fill="#854F0B" />
          </div>
          <div style={{ fontSize: '19px', fontWeight: 500, color: '#222' }}>{stats.trustScore}</div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>Trust score</div>
          <div style={{ fontSize: '11px', color: '#0F6E56', marginTop: '4px' }}>Top 10%</div>
        </div>
        <div className="scard">
          <div style={{ width: '27px', height: '27px', borderRadius: '7px', background: '#E1F5EE', color: '#0F6E56', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '7px' }}>
            <IconCurrencyRupee size={13} />
          </div>
          <div style={{ fontSize: '19px', fontWeight: 500, color: '#222' }}>₹{walletBalance}</div>
          <div style={{ fontSize: '11px', color: '#888', marginTop: '1px' }}>Wallet balance</div>
          <div style={{ fontSize: '11px', color: '#534AB7', marginTop: '4px' }}>{stats.swapsDone} swaps done</div>
        </div>
      </div>

      {/* Two Column Layout: Sessions & Messages */}
      <div className="r2">
        <div className="card">
          <div className="ch">
            <span className="ct">Upcoming sessions</span>
            <button className="clink" onClick={() => navigate('/app/sessions')}>See all</button>
          </div>
          {upcomingSessions.length > 0 ? upcomingSessions.map((session, i) => (
            <div className="sesscard" key={session.id || i}>
              <div className="sddt">
                <div className="sdd">{session.date || '--'}</div>
                <div className="sdm">{(session.month || '').toUpperCase()}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{session.title || 'Unknown session'}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{session.time || ''}</div>
              </div>
              {session.status === 'soon' ? (
                <button style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#aaa' }}>Soon</button>
              ) : (
                <button className="jbtn">Join</button>
              )}
            </div>
          )) : (
            <div style={{ fontSize: '12px', color: '#888', padding: '10px 0' }}>No upcoming sessions.</div>
          )}
        </div>

        <div className="card">
          <div className="ch">
            <span className="ct">Recent messages</span>
            <button className="clink" onClick={() => navigate('/app/messages')}>Open</button>
          </div>
          <div>
            {recentChats.map(chat => (
              <div 
                key={chat.id} 
                className="ci" 
                style={{ padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '9px', borderBottom: '1px solid #f5f5f5' }}
                onClick={() => navigate(`/app/messages?chatId=${chat.id}`)}
              >
                <div style={{ position: 'relative' }}>
                  <Avatar letters={chat.init || 'U'} bgColor={chat.bg || '#eee'} textColor={chat.col || '#333'} size="33px" fontSize="11px" />
                  {chat.online && <div className="dot-on"></div>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{chat.name || 'Unknown User'}</div>
                  <div style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                    {chat.preview || chat.lastMsg || 'No messages'}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <div style={{ fontSize: '10px', color: '#aaa' }}>{chat.time || ''}</div>
                  {chat.unread > 0 && (
                    <div style={{ width: '16px', height: '16px', background: '#534AB7', color: '#EEEDFE', borderRadius: '50%', fontSize: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 500 }}>
                      {chat.unread}
                    </div>
                  )}
                </div>
              </div>
            ))}
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
