import React from 'react';
import { useAppData } from '../context/AppDataContext';

const Sessions = () => {
  const { bookedSessions, triggerToast } = useAppData();

  const handleBook = (name) => {
    triggerToast(`Booking request sent to ${name}!`);
  };

  const handleSwap = (name, skill) => {
    // For now, trigger swap proposal modal or just show toast
    document.dispatchEvent(new CustomEvent('openExReq', { detail: { name, skill } }));
  };

  return (
    <div id="sessions" className="pg on" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', height: '100%', minHeight: '560px' }}>

        {/* LEFT: All college sessions */}
        <div style={{ flex: 1, padding: '13px', borderRight: '0.5px solid rgba(0,0,0,.08)', overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '11px' }}>
            <div style={{ fontSize: '13px', fontWeight: 500, color: '#222' }}>All College Sessions</div>
            <button 
              onClick={() => document.dispatchEvent(new Event('openCreateSession'))} 
              style={{ fontSize: '11px', padding: '5px 12px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#fff', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              New
            </button>
          </div>
          
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '7px' }}>Today · 26 May</div>
          
          <div className="sesscard">
            <div className="sddt"><div className="sdd">26</div><div className="sdm">MAY</div></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>React.js · Priya S.</div>
              <div style={{ fontSize: '11px', color: '#888' }}>4:00 PM · Online · ₹300/hr</div>
            </div>
            <button className="jbtn" onClick={() => handleBook('Priya S.')}>Book</button>
          </div>
          
          <div className="sesscard">
            <div className="sddt"><div className="sdd">26</div><div className="sdm">MAY</div></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>Guitar basics · Sneha K.</div>
              <div style={{ fontSize: '11px', color: '#888' }}>6:00 PM · In-person · ₹150/hr</div>
            </div>
            <button className="jbtn" onClick={() => handleBook('Sneha K.')}>Book</button>
          </div>
          
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.05em', margin: '10px 0 7px' }}>Upcoming · 27–31 May</div>
          
          <div className="sesscard">
            <div className="sddt"><div className="sdd">27</div><div className="sdm">MAY</div></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>Figma UI · Rohan M.</div>
              <div style={{ fontSize: '11px', color: '#888' }}>3:00 PM · Online · ₹250/hr</div>
            </div>
            <button className="jbtn" onClick={() => handleBook('Rohan M.')}>Book</button>
          </div>
          
          <div className="sesscard">
            <div className="sddt"><div className="sdd">28</div><div className="sdm">MAY</div></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>Linear Algebra · Vikram N.</div>
              <div style={{ fontSize: '11px', color: '#888' }}>5:00 PM · Either · ₹200/hr</div>
            </div>
            <button className="jbtn" onClick={() => handleBook('Vikram N.')}>Book</button>
          </div>
          
          <div className="sesscard">
            <div className="sddt"><div className="sdd">29</div><div className="sdm">MAY</div></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>Japanese N5 · Aisha T.</div>
              <div style={{ fontSize: '11px', color: '#888' }}>4:30 PM · Online · Swap only</div>
            </div>
            <button 
              style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', border: 'none', background: '#EEEDFE', color: '#3C3489', cursor: 'pointer', fontWeight: 500 }} 
              onClick={() => handleSwap('Aisha T.', 'Japanese N5')}
            >
              Swap
            </button>
          </div>
          
          <div className="sesscard">
            <div className="sddt"><div className="sdd">30</div><div className="sdm">MAY</div></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>Python & Data · Dev R.</div>
              <div style={{ fontSize: '11px', color: '#888' }}>2:00 PM · Online · Swap only</div>
            </div>
            <button 
              style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', border: 'none', background: '#EEEDFE', color: '#3C3489', cursor: 'pointer', fontWeight: 500 }} 
              onClick={() => handleSwap('Dev R.', 'Python & Data Analysis')}
            >
              Swap
            </button>
          </div>
        </div>

        {/* RIGHT: My upcoming sessions only */}
        <div style={{ width: '300px', flexShrink: 0, padding: '13px', overflowY: 'auto', background: '#FAFAFE' }}>
          <div style={{ fontSize: '13px', fontWeight: 500, color: '#222', marginBottom: '11px' }}>My Upcoming Sessions</div>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '7px' }}>Booked</div>
          
          {bookedSessions.filter(s => s.status !== 'completed').map(session => (
            <div className="sesscard" key={session.id}>
              <div className="sddt"><div className="sdd">{session.date}</div><div className="sdm">{session.month}</div></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{session.title}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{session.time}</div>
              </div>
              {session.status === 'soon' ? (
                <button style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#aaa' }}>Soon</button>
              ) : (
                <button className="jbtn">Join</button>
              )}
            </div>
          ))}

          <div className="sep"></div>
          
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#aaa', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '7px' }}>Past sessions</div>
          
          {bookedSessions.filter(s => s.status === 'completed').map(session => (
            <div className="sesscard" key={session.id}>
              <div className="sddt" style={{ background: '#F5F4FF' }}>
                <div className="sdd" style={{ color: '#888' }}>{session.date}</div>
                <div className="sdm" style={{ color: '#aaa' }}>{session.month}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{session.title}</div>
                <div style={{ fontSize: '11px', color: '#888' }}>{session.time}</div>
              </div>
              <div style={{ display: 'flex', gap: '5px' }}>
                {session.reviewed ? (
                  <button style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#888', cursor: 'pointer' }}>Reviewed</button>
                ) : (
                  <button style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#534AB7', cursor: 'pointer' }}>Rate</button>
                )}
                <button 
                  onClick={() => document.dispatchEvent(new CustomEvent('openReport', { detail: { target: session.title.split('·')[1]?.trim(), context: session.title.split('·')[0]?.trim() } }))} 
                  style={{ fontSize: '11px', padding: '4px 9px', borderRadius: '7px', border: '0.5px solid #FAECE7', background: '#FAECE7', color: '#993C1D', cursor: 'pointer', fontWeight: 500 }}
                >
                  Report
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
