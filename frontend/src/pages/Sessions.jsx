import React from 'react';
import { useAppData } from '../context/AppDataContext';
import SessionCard from '../components/common/SessionCard';

const Sessions = () => {
  const { bookedSessions, triggerToast } = useAppData();

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
  const btnJoin = { fontSize: '12px', padding: '6px 14px', borderRadius: 'var(--cs-radius-sm)', border: 'none', background: 'var(--cs-primary)', color: 'var(--cs-bg-white)', cursor: 'pointer', fontWeight: 600 };
  const btnSoon = { fontSize: '11px', padding: '6px 12px', borderRadius: 'var(--cs-radius-sm)', border: '0.5px solid var(--cs-border)', background: 'var(--cs-bg-light)', color: 'var(--cs-text-inactive)', fontWeight: 500 };
  const btnSwap = { fontSize: '12px', padding: '6px 14px', borderRadius: 'var(--cs-radius-sm)', border: 'none', background: 'var(--cs-primary-light)', color: 'var(--cs-primary-dark)', cursor: 'pointer', fontWeight: 600 };
  const btnRate = { fontSize: '12px', padding: '6px 14px', borderRadius: 'var(--cs-radius-sm)', border: '0.5px solid var(--cs-border)', background: 'var(--cs-bg-white)', color: 'var(--cs-primary)', cursor: 'pointer', fontWeight: 500 };
  const btnReviewed = { fontSize: '12px', padding: '6px 14px', borderRadius: 'var(--cs-radius-sm)', border: '0.5px solid var(--cs-border)', background: 'var(--cs-bg-light)', color: 'var(--cs-text-inactive)', fontWeight: 500 };
  const btnReport = { fontSize: '12px', padding: '6px 14px', borderRadius: 'var(--cs-radius-sm)', border: '0.5px solid #FAECE7', background: '#FAECE7', color: '#993C1D', cursor: 'pointer', fontWeight: 500 };

  return (
    <div id="sessions" className="pg on" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: '100%', minHeight: '560px' }}>

        {/* LEFT: All college sessions */}
        <div style={{ flex: 1, padding: '24px', borderRight: '0.5px solid var(--cs-border)', overflowY: 'auto', background: 'var(--cs-bg-white)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)' }}>All College Sessions</div>
            <button 
              onClick={() => document.dispatchEvent(new Event('openCreateSession'))} 
              style={{ fontSize: '13px', padding: '8px 16px', borderRadius: 'var(--cs-radius-sm)', border: 'none', background: 'var(--cs-primary)', color: '#fff', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              New
            </button>
          </div>
          
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Today · 26 May</div>
          
          <SessionCard
            date="26" month="MAY"
            title="React.js · Priya S." subtitle="4:00 PM · Online · ₹300/hr"
            actions={<button style={btnJoin} onClick={() => handleBook('Priya S.')}>Book</button>}
          />
          <SessionCard
            date="26" month="MAY"
            title="Guitar basics · Sneha K." subtitle="6:00 PM · In-person · ₹150/hr"
            actions={<button style={btnJoin} onClick={() => handleBook('Sneha K.')}>Book</button>}
          />
          
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '24px 0 12px' }}>Upcoming · 27–31 May</div>
          
          <SessionCard
            date="27" month="MAY"
            title="Figma UI · Rohan M." subtitle="3:00 PM · Online · ₹250/hr"
            actions={<button style={btnJoin} onClick={() => handleBook('Rohan M.')}>Book</button>}
          />
          <SessionCard
            date="28" month="MAY"
            title="Linear Algebra · Vikram N." subtitle="5:00 PM · Either · ₹200/hr"
            actions={<button style={btnJoin} onClick={() => handleBook('Vikram N.')}>Book</button>}
          />
          <SessionCard
            date="29" month="MAY"
            title="Japanese N5 · Aisha T." subtitle="4:30 PM · Online · Swap only"
            actions={<button style={btnSwap} onClick={() => handleSwap('Aisha T.', 'Japanese N5')}>Swap</button>}
          />
          <SessionCard
            date="30" month="MAY"
            title="Python & Data · Dev R." subtitle="2:00 PM · Online · Swap only"
            actions={<button style={btnSwap} onClick={() => handleSwap('Dev R.', 'Python & Data Analysis')}>Swap</button>}
          />
        </div>

        {/* RIGHT: My upcoming sessions only */}
        <div style={{ width: '340px', flexShrink: 0, padding: '24px', overflowY: 'auto', background: 'var(--cs-bg-light)' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '24px' }}>My Upcoming Sessions</div>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Booked</div>
          
          {bookedSessions.filter(s => s.status !== 'completed').map(session => (
            <SessionCard
              key={session.id}
              date={session.date}
              month={session.month}
              title={session.title}
              subtitle={session.time}
              status={session.status === 'soon' ? 'soon' : 'upcoming'}
              actions={
                session.status === 'soon' ? (
                  <button style={btnSoon} disabled>Soon</button>
                ) : (
                  <button style={btnJoin} onClick={() => console.log('Join session', session.id)}>Join</button>
                )
              }
            />
          ))}

          <div style={{ height: '1px', background: 'var(--cs-border)', margin: '24px 0' }}></div>
          
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>Past sessions</div>
          
          {bookedSessions.filter(s => s.status === 'completed').map(session => (
            <SessionCard
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
