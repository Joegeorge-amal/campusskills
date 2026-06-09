import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import SessionCard from '../components/common/SessionCard'; // Kept just in case, but unused
import SessionsCardV2 from '../components/common/SessionsCardV2';
import ReportSessionModal from '../components/modals/ReportSessionModal';
import ActiveSessionModal from '../components/modals/ActiveSessionModal';

const Sessions = () => {
  const { bookedSessions, triggerToast } = useAppData();
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

  // Pre-defined generic button styles
  const btnJoin = { fontSize: '11px', padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#1d4ed8', color: '#ffffff', cursor: 'pointer', fontWeight: 600 };
  const btnSoon = { fontSize: '12px', padding: '6px 14px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#9ca3af', fontWeight: 700 };
  const btnSwap = { fontSize: '12px', padding: '6px 14px', borderRadius: '100px', border: '1px solid #1d4ed8', background: 'transparent', color: '#1d4ed8', cursor: 'pointer', fontWeight: 700 };
  const btnRate = { fontSize: '11px', padding: '5px 12px', borderRadius: '100px', border: '1px solid #93c5fd', background: '#ffffff', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 };
  const btnReviewed = { fontSize: '11px', padding: '5px 12px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#9ca3af', fontWeight: 600 };
  const btnReport = { fontSize: '11px', padding: '5px 12px', borderRadius: '100px', border: '1px solid #fca5a5', background: '#ffffff', color: '#ef4444', cursor: 'pointer', fontWeight: 600 };

  return (
    <div id="sessions" className="pg on" style={{ padding: 0, height: 'calc(100vh - 60px)', overflow: 'hidden' }}>
      <ReportSessionModal />
      <ActiveSessionModal 
        isOpen={!!activeSession} 
        session={activeSession} 
        onClose={() => setActiveSession(null)} 
      />
      <div style={{ display: 'flex', height: '100%' }}>

        {/* LEFT: All college sessions */}
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
          
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Today · 26 May</div>
          
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
          
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '24px 0 12px' }}>Upcoming · 27–31 May</div>
          
          <SessionsCardV2
            date="27" month="MAY"
            title="Figma UI · Rohan M." subtitle="3:00 PM · Online · ₹250/hr"
            actions={<button style={btnJoin} onClick={() => handleBook('Rohan M.')}>Send Request</button>}
          />
          <SessionsCardV2
            date="28" month="MAY"
            title="Linear Algebra · Vikram N." subtitle="5:00 PM · Either · ₹200/hr"
            actions={<button style={btnJoin} onClick={() => handleBook('Vikram N.')}>Send Request</button>}
          />
          <SessionsCardV2
            date="29" month="MAY"
            title="Japanese N5 · Aisha T." subtitle="4:30 PM · Online · Swap only"
            actions={<button style={btnSwap} onClick={() => handleSwap('Aisha T.', 'Japanese N5')}>Send Request</button>}
          />
          <SessionsCardV2
            date="30" month="MAY"
            title="Python & Data · Dev R." subtitle="2:00 PM · Online · Swap only"
            actions={<button style={btnSwap} onClick={() => handleSwap('Dev R.', 'Python & Data Analysis')}>Send Request</button>}
          />
        </div>

        {/* RIGHT: My upcoming sessions only */}
        <div style={{ width: '340px', flexShrink: 0, padding: '24px', overflowY: 'auto', background: '#f9fafb' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '24px' }}>My Upcoming Sessions</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Booked</div>
          
          {bookedSessions.filter(s => s.status !== 'completed').map(session => (
            <SessionsCardV2
              key={session.id}
              date={session.date}
              month={session.month}
              title={session.title}
              subtitle={
                <>
                  {session.time} ·<br />
                  {session.info ? session.info.split(' · ').pop() : ''}
                </>
              }
              status={session.status === 'soon' ? 'soon' : 'upcoming'}
              actions={
                session.status === 'soon' ? (
                  <button style={btnSoon} disabled>Soon</button>
                ) : (
                  <button style={btnJoin} onClick={() => setActiveSession(session)}>Join</button>
                )
              }
            />
          ))}

          <div style={{ height: '1px', background: '#e5e7eb', margin: '24px 0' }}></div>
          
          <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Past sessions</div>
          
          {bookedSessions.filter(s => s.status === 'completed').map(session => (
            <SessionsCardV2
              key={session.id}
              date={session.date}
              month={session.month}
              title={session.title}
              subtitle={session.time}
              status="completed"
              actions={
                <>
                  {session.reviewed ? (
                    <button style={btnReviewed} disabled>Reviewed</button>
                  ) : (
                    <button style={btnRate} onClick={() => handleRate(session.title)}>Rate</button>
                  )}
                  <button style={btnReport} onClick={() => handleReport(session.title)}>Report</button>
                </>
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
