import React, { useState, useMemo } from 'react';
import { IconArrowsRightLeft, IconX, IconClock, IconCheck, IconCalendar } from '@tabler/icons-react';
import Avatar from '../common/Avatar';
import ModalWrapper from '../common/ModalWrapper';

// Helper: given a dayOfWeek string (e.g. "MONDAY") and a startTime (e.g. "17:00"),
// compute the next occurrence of that day/time from today.
const getNextOccurrence = (dayOfWeek, startTime) => {
  const dayMap = { SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6 };
  const targetDay = dayMap[dayOfWeek.toUpperCase()];
  if (targetDay === undefined) return null;

  const now = new Date();
  const [hours, minutes] = (startTime || '00:00').split(':').map(Number);
  
  const today = now.getDay();
  let daysAhead = targetDay - today;
  if (daysAhead < 0) daysAhead += 7;
  if (daysAhead === 0) {
    const todayTarget = new Date(now);
    todayTarget.setHours(hours, minutes, 0, 0);
    if (todayTarget <= now) daysAhead = 7;
  }

  const result = new Date(now);
  result.setDate(result.getDate() + daysAhead);
  result.setHours(hours, minutes, 0, 0);
  return result;
};

// Format a date object to a readable string: "Monday, Jun 16 at 5:00 PM"
const formatDate = (d) => {
  if (!d) return '';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }) + ' at ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
};

// Parse a slot string like "MONDAY 17:00 (60m)" or "MONDAY at 17:00" into {dayOfWeek, startTime, durationMinutes}
const parseSlotString = (str) => {
  if (!str) return null;
  // Match: "MONDAY 17:00 (60m)" or "Monday at 17:00" or "MONDAY 5:00 PM (60m)"
  const match = str.match(/^(\w+)\s+(?:at\s+)?(\d{1,2}:\d{2})\s*([APMapm]{0,2})\s*(?:\((\d+)\s*m(?:in)?\))?/i);
  if (!match) return null;
  
  let [, day, time, ampm, dur] = match;
  day = day.toUpperCase();
  
  if (ampm && ampm.length > 0) {
    let [h, mins] = time.split(':').map(Number);
    if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
    if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
    time = `${String(h).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  }
  
  return {
    dayOfWeek: day,
    startTime: time,
    durationMinutes: parseInt(dur) || 60
  };
};

// Format a slot object for display: "Monday at 5:00 PM (60 min)"
const formatSlotLabel = (slot) => {
  const day = slot.dayOfWeek.charAt(0) + slot.dayOfWeek.slice(1).toLowerCase();
  const [h, m] = (slot.startTime || '00:00').split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  const timeStr = `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
  const dur = slot.durationMinutes || 60;
  return `${day} at ${timeStr} (${dur} min)`;
};

const SkillSwapModal = ({ isOpen, onClose, request, user, onConfirm }) => {
  const [iGoFirst, setIGoFirst] = useState(true);
  const [selectedTheirSlotIdx, setSelectedTheirSlotIdx] = useState(null);
  const [step, setStep] = useState('form');
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen || !request) return null;

  const { otherUserExtras, rawReq, otherUser } = request;
  console.log('[SkillSwapModal] rawReq:', JSON.stringify(rawReq, null, 2));
  console.log('[SkillSwapModal] rawReq.requesterAvailableTimes:', rawReq?.requesterAvailableTimes);
  const listingOfferedSkill = otherUserExtras?.offeredSkillName;
  const listingRequestedSkill = otherUserExtras?.listingRequestedSkill;
  const explicitOfferedSkill = rawReq?.offeredSkillName;

  let theyOffer = explicitOfferedSkill || listingRequestedSkill || 'Unknown Skill';
  let youTeach = listingOfferedSkill || 'Unknown Skill';

  const isTheirOfferVerified = theyOffer ? otherUser?.verifiedSkills?.map(s => (s.name || s).trim().toLowerCase())?.includes(theyOffer.trim().toLowerCase()) : false;
  const isMyOfferVerified = youTeach ? user?.verifiedSkills?.map(s => (s.name || s).trim().toLowerCase())?.includes(youTeach.trim().toLowerCase()) : false;

  const otherName = (otherUser?.name || request.name || 'User').split(' ')[0];

  // Parse the requester's chosen slot from the message (embedded as [Prefers your slot: ...])
  const chosenMySlot = useMemo(() => {
    const msg = rawReq?.message || '';
    const match = msg.match(/\[Prefers your slot: (.*?)\]/);
    if (match) {
      return parseSlotString(match[1]);
    }
    return null;
  }, [rawReq?.message]);

  // Their availability = requesterAvailableTimes (strings that need parsing)
  const theirSlots = useMemo(() => {
    const rawTimes = rawReq?.requesterAvailableTimes || [];
    return rawTimes.map(t => parseSlotString(t)).filter(Boolean);
  }, [rawReq?.requesterAvailableTimes]);

  // Clean message (without the [Prefers your slot: ...] prefix)
  const cleanMessage = useMemo(() => {
    const msg = rawReq?.message || '';
    return msg.replace(/\[Prefers your slot: .*?\]\s*/g, '').trim();
  }, [rawReq?.message]);

  const renderVerificationPill = (isVerified) => {
    if (isVerified) {
      return <span style={{ marginTop: '8px', padding: '2px 8px', background: '#ecfdf5', color: '#059669', fontSize: '11px', display: 'flex', alignItems: 'center', borderRadius: '100px', fontWeight: 700, border: '1px solid #a7f3d0' }}>✓ Verified</span>;
    }
    return <span style={{ marginTop: '8px', padding: '2px 8px', background: '#fefce8', color: '#b45309', fontSize: '11px', display: 'flex', alignItems: 'center', borderRadius: '100px', fontWeight: 700, border: '1px solid #fde047' }}>⚠️ Unverified</span>;
  };

  // Compute session dates based on selections
  const getSessionInfo = () => {
    if (!chosenMySlot) return null;
    
    const selectedTheirSlot = selectedTheirSlotIdx !== null ? theirSlots[selectedTheirSlotIdx] : null;
    if (!selectedTheirSlot) return null;

    const myDate = getNextOccurrence(chosenMySlot.dayOfWeek, chosenMySlot.startTime);
    const theirDate = getNextOccurrence(selectedTheirSlot.dayOfWeek, selectedTheirSlot.startTime);

    if (!myDate || !theirDate) return null;

    let firstDate, secondDate, firstSkill, secondSkill;
    if (iGoFirst) {
      firstDate = myDate; secondDate = theirDate;
      firstSkill = youTeach; secondSkill = theyOffer;
    } else {
      firstDate = theirDate; secondDate = myDate;
      firstSkill = theyOffer; secondSkill = youTeach;
    }

    // Ensure first is before second
    if (firstDate > secondDate) {
      secondDate = new Date(secondDate.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return {
      firstDate, secondDate, firstSkill, secondSkill,
      firstFormatted: formatDate(firstDate),
      secondFormatted: formatDate(secondDate),
    };
  };

  const sessionInfo = getSessionInfo();

  const handleConfirm = async () => {
    if (!chosenMySlot) {
      alert("The requester hasn't selected a slot from your listing. Please negotiate via chat.");
      return;
    }
    if (selectedTheirSlotIdx === null) {
      alert("Please select one of their available timings.");
      return;
    }
    if (!sessionInfo) {
      alert("Could not compute session dates. Please try again.");
      return;
    }

    const firstSessionStart = sessionInfo.firstDate.getTime();
    const secondSessionStart = sessionInfo.secondDate.getTime();

    try {
      setIsConfirming(true);
      await onConfirm(request.id, { firstSessionStart, secondSessionStart, iGoFirst });
      setStep('success');
    } catch (e) {
      console.error(e);
      alert("Failed to accept swap. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  const handleDone = () => {
    setStep('form');
    setSelectedTheirSlotIdx(null);
    onClose();
  };

  return (
    <ModalWrapper isOpen={true} onClose={() => { if (!isConfirming) onClose(); }} maxWidth="520px" zIndex={1000}>
      <style>{`
        .ssm-wrapper {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 520px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .ssm-header {
          background: #1e3a8a;
          padding: 20px 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          color: #ffffff;
        }
        .ssm-title { font-size: 16px; font-weight: 600; margin-bottom: 2px; }
        .ssm-close {
          background: none; border: none; color: rgba(255,255,255,0.6);
          cursor: pointer; display: flex; padding: 4px; border-radius: 4px;
          transition: color 0.2s, background 0.2s;
        }
        .ssm-close:hover { color: #ffffff; background: rgba(255,255,255,0.1); }
        .ssm-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .ssm-slot-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid #e5e7eb;
          background: #ffffff;
          cursor: pointer;
          transition: all 0.15s ease;
          text-align: left;
          font-size: 13px;
          font-weight: 500;
          color: #374151;
        }
        .ssm-slot-btn:hover {
          border-color: #93c5fd;
          background: #f8fafc;
        }
        .ssm-slot-btn.selected {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #1d4ed8;
          font-weight: 600;
        }
      `}</style>
      
      <div className="ssm-wrapper" onClick={(e) => e.stopPropagation()}>
        {step === 'form' ? (
          <>
            <div className="ssm-header">
              <div>
                <div className="ssm-title">Skill Swap Request</div>
                <div style={{ fontSize: '12px', color: '#bfdbfe' }}>{otherName} wants to swap skills</div>
              </div>
              <button className="ssm-close" onClick={() => { if (!isConfirming) onClose(); }}>
                <IconX size={18} />
              </button>
            </div>

            <div className="ssm-body">
              {/* Skill Exchange Display */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                gap: '12px'
              }}>
                <div style={{
                  flex: 1, background: '#f0f9ff', border: '1px solid #bae6fd',
                  borderRadius: '8px', padding: '16px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: '#3b82f6', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>THEY OFFER</div>
                  <div style={{ fontSize: '14px', color: '#1d4ed8', fontWeight: 700 }}>{theyOffer}</div>
                  {renderVerificationPill(isTheirOfferVerified)}
                </div>
                
                <IconArrowsRightLeft size={16} color="#6b7280" />
                
                <div style={{
                  flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0',
                  borderRadius: '8px', padding: '16px', textAlign: 'center',
                  display: 'flex', flexDirection: 'column', alignItems: 'center'
                }}>
                  <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>YOU TEACH</div>
                  <div style={{ fontSize: '14px', color: '#047857', fontWeight: 700 }}>{youTeach}</div>
                  {renderVerificationPill(isMyOfferVerified)}
                </div>
              </div>

              {/* The slot the requester already chose from your listing (read-only) */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#047857', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {otherName} chose from your listing
                </div>
                {chosenMySlot ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', borderRadius: '8px', background: '#f0fdf4',
                    border: '1px solid #bbf7d0'
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px', background: '#dcfce7',
                      color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                    }}>
                      <IconCheck size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>{formatSlotLabel(chosenMySlot)}</div>
                      {(() => {
                        const d = getNextOccurrence(chosenMySlot.dayOfWeek, chosenMySlot.startTime);
                        return d ? <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Next: {formatDate(d)}</div> : null;
                      })()}
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '13px', color: '#92400e' }}>
                    No slot was selected. You may need to coordinate via chat.
                  </div>
                )}
              </div>

              {/* Their availability (requester's teaching times) — pick one */}
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1d4ed8', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {otherName}'s Available Teaching Times — pick one
                </div>
                {theirSlots.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {theirSlots.map((slot, idx) => {
                      const nextDate = getNextOccurrence(slot.dayOfWeek, slot.startTime);
                      return (
                        <button
                          key={idx}
                          className={`ssm-slot-btn${selectedTheirSlotIdx === idx ? ' selected' : ''}`}
                          onClick={() => setSelectedTheirSlotIdx(idx)}
                        >
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '6px',
                            background: selectedTheirSlotIdx === idx ? '#dbeafe' : '#f1f5f9',
                            color: selectedTheirSlotIdx === idx ? '#1d4ed8' : '#94a3b8',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {selectedTheirSlotIdx === idx ? <IconCheck size={16} /> : <IconClock size={16} />}
                          </div>
                          <div>
                            <div>{formatSlotLabel(slot)}</div>
                            {nextDate && <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '2px' }}>Next: {formatDate(nextDate)}</div>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#fef3c7', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '13px', color: '#92400e' }}>
                    No preferred times were specified. You may need to coordinate via chat.
                  </div>
                )}
              </div>

              {/* Who teaches first */}
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
                  Who teaches first?
                </label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: iGoFirst ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    background: iGoFirst ? '#eff6ff' : '#ffffff',
                    fontSize: '13px', fontWeight: iGoFirst ? 600 : 400, transition: 'all 0.15s'
                  }}>
                    <input type="radio" checked={iGoFirst} onChange={() => setIGoFirst(true)} style={{ accentColor: '#1d4ed8' }} />
                    I teach {youTeach} first
                  </label>
                  <label style={{
                    flex: 1, display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: !iGoFirst ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    background: !iGoFirst ? '#eff6ff' : '#ffffff',
                    fontSize: '13px', fontWeight: !iGoFirst ? 600 : 400, transition: 'all 0.15s'
                  }}>
                    <input type="radio" checked={!iGoFirst} onChange={() => setIGoFirst(false)} style={{ accentColor: '#1d4ed8' }} />
                    {otherName} teaches first
                  </label>
                </div>
              </div>

              {/* Auto-computed session schedule preview */}
              {sessionInfo && (
                <div style={{
                  background: 'var(--cs-bg-light)', border: '1px solid var(--cs-border)',
                  borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--cs-text-main)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Session Schedule
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '10px', background: '#f0fdf4', borderRadius: '8px', border: '1px solid #bbf7d0'
                  }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: '#dcfce7',
                      color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, flexShrink: 0
                    }}>1</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                        {sessionInfo.firstSkill}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <IconCalendar size={14} />
                        {sessionInfo.firstFormatted}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px',
                    padding: '10px', background: 'var(--cs-bg-hover)', borderRadius: '8px', border: '1px solid #bfdbfe'
                  }}>
                    <div style={{
                      width: '28px', height: '28px', borderRadius: '50%', background: '#dbeafe',
                      color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '13px', fontWeight: 700, flexShrink: 0
                    }}>2</div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                        {sessionInfo.secondSkill}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <IconCalendar size={14} />
                        {sessionInfo.secondFormatted}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Clean message from requester */}
              {cleanMessage && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Message from {otherName}
                  </div>
                  <div style={{ padding: '12px', background: 'var(--cs-bg-light)', borderRadius: '8px', fontSize: '13px', color: '#374151', lineHeight: 1.5 }}>
                    {cleanMessage}
                  </div>
                </div>
              )}

              {/* Info banner */}
              <div style={{
                background: 'var(--cs-bg-white)', border: '1px solid #fde68a',
                borderRadius: '8px', padding: '12px', fontSize: '12px', color: '#d97706'
              }}>
                No money changes hands — this is a pure skill exchange!
              </div>

              {/* Confirm button */}
              <button 
                onClick={handleConfirm}
                disabled={selectedTheirSlotIdx === null || !chosenMySlot || isConfirming}
                style={{
                  width: '100%',
                  background: (selectedTheirSlotIdx !== null && chosenMySlot && !isConfirming) ? '#1d4ed8' : '#94a3b8',
                  color: '#ffffff',
                  border: 'none',
                  padding: '14px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: (selectedTheirSlotIdx !== null && chosenMySlot && !isConfirming) ? 'pointer' : 'not-allowed',
                  transition: 'background 0.2s',
                  opacity: isConfirming ? 0.6 : 1
                }}
                onMouseOver={(e) => { if (selectedTheirSlotIdx !== null && chosenMySlot && !isConfirming) e.currentTarget.style.background = '#1e40af' }}
                onMouseOut={(e) => { if (selectedTheirSlotIdx !== null && chosenMySlot && !isConfirming) e.currentTarget.style.background = '#1d4ed8' }}
              >
                {isConfirming ? 'Accepting...' : 'Confirm Swap'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ padding: '32px 24px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%', background: '#dbeafe',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'
            }}>
              <IconArrowsRightLeft size={32} color="#3b82f6" />
            </div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
              Swap Confirmed!
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.5 }}>
              {otherName} will be notified. You'll teach {youTeach} and learn {theyOffer}.
            </div>
            <button 
              onClick={handleDone}
              style={{
                width: '100%', background: '#1d4ed8', color: '#ffffff', border: 'none',
                padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: 600,
                cursor: 'pointer', transition: 'background 0.2s'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af' }}
              onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8' }}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default SkillSwapModal;
