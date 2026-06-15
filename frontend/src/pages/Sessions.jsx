import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import SessionsCardV2 from '../components/common/SessionsCardV2';
import ReportSessionModal from '../components/modals/ReportSessionModal';
import ActiveSessionModal from '../components/modals/ActiveSessionModal';

const Sessions = () => {
  const { sessionsData, isSessionsLoading, triggerToast } = useAppData();
  const [activeSession, setActiveSession] = useState(null);

  const handleBook = (name) => {
    triggerToast(`Booking request sent to ${name}!`);
  };

  const handleSwap = (name, skill) => {
    document.dispatchEvent(new CustomEvent('openExReq', { detail: { name, skill } }));
  };

  const handleRate = (name) => {
    triggerToast(`Opening rating modal for ${name}`);
  };

  const handleReport = (title) => {
    const target = title.split('·')[1]?.trim();
    const context = title.split('·')[0]?.trim();
    document.dispatchEvent(new CustomEvent('openReport', { detail: { target, context } }));
  };

  const btnJoin = { fontSize: '11px', padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#1d4ed8', color: '#ffffff', cursor: 'pointer', fontWeight: 600 };
  const btnRate = { fontSize: '11px', padding: '5px 12px', borderRadius: '100px', border: '1px solid #93c5fd', background: '#ffffff', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 };

  if (isSessionsLoading) {
    return (
      <div id="sessions" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>Loading sessions...</div>
      </div>
    );
  }

  const upcomingSessions = sessionsData.filter(s => s.status === 'SCHEDULED');
  const pastSessions = sessionsData.filter(s => s.status === 'COMPLETED' || s.status === 'CANCELLED');

  return (
    <div id="sessions" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <ReportSessionModal />
      <ActiveSessionModal 
        isOpen={!!activeSession} 
        session={activeSession} 
        onClose={() => setActiveSession(null)} 
      />
      <div style={{ display: 'flex', height: '100%' }}>

        <div style={{ flex: 1, padding: '24px', borderRight: '0.5px solid var(--cs-border)', overflowY: 'auto', background: 'var(--cs-bg-white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)' }}>All College Sessions</div>
            <button 
              onClick={() => document.dispatchEvent(new Event('openCreateSession'))} 
              style={{ fontSize: '13px', padding: '8px 16px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              New
            </button>
          </div>
          
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Explore</div>
          
          <SessionsCardV2
            date="26" month="MAY"
            title="React.js · Priya S." subtitle="4:00 PM · Online · ₹300/hr"
            actions={<button style={btnJoin} onClick={() => handleBook('Priya S.')}>Send Request</button>}
          />
          <SessionsCardV2
            date="26" month="MAY"
            title="Guitar basics · Sneha K." subtitle="6:00 PM · In-person · ₹150/hr"
            actions={<button style={btnJoin} onClick={() => handleBook('Sneha K.')}>Send Request</button>}
          />
        </div>

        <div style={{ width: '340px', flexShrink: 0, padding: '24px', overflowY: 'auto', backgroundColor: 'var(--cs-bg-light)', backgroundImage: 'radial-gradient(rgba(15, 23, 42, 0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '24px' }}>My Sessions</div>
          
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Upcoming</div>
          {upcomingSessions.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '24px' }}>No upcoming sessions.</div>
          ) : (
            upcomingSessions.map((s, idx) => (
              <SessionsCardV2
                key={s.id || idx}
                date={s.day} month={s.month}
                title={`${s.topic} · ${s.name}`}
                subtitle={`${s.time} · ${s.mode}`}
                actions={
                  <button style={btnJoin} onClick={() => setActiveSession(s)}>Join Room</button>
                }
              />
            ))
          )}

          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '24px 0 12px' }}>Past</div>
          {pastSessions.length === 0 ? (
            <div style={{ fontSize: '13px', color: '#9ca3af' }}>No past sessions.</div>
          ) : (
            pastSessions.map((s, idx) => (
              <SessionsCardV2
                key={s.id || idx}
                date={s.day} month={s.month}
                title={`${s.topic} · ${s.name}`}
                subtitle={`Completed · ${s.mode}`}
                actions={
                  <button style={btnRate} onClick={() => handleRate(s.name)}>Rate</button>
                }
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;