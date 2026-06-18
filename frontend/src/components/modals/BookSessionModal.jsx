import React, { useState } from 'react';
import { IconX, IconCheck, IconTrash } from '@tabler/icons-react';
import CustomTimeInput from '../common/CustomTimeInput';
import CustomSelect from '../common/CustomSelect';

const BookSessionModal = ({
  slots = [
    { id: '1', date: '26 MAY', time: '4:00 PM', label: 'Today', isPrimary: true },
    { id: '2', date: '27 MAY', time: '11:00 AM', label: 'Tomorrow', isPrimary: false },
    { id: '3', date: '29 MAY', time: '5:00 PM', label: 'Thu', isPrimary: false },
  ],
  selectedTutor,
  selectedSkill,
  isSwapRequest,
  listingRequestedSkills = [],
  userOfferedSkills = [],
  onContinue,
  onClose
}) => {
  const primarySlot = slots.find(s => s.isPrimary) || slots[0];
  const otherSlots = slots.filter(s => !s.isPrimary);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [message, setMessage] = useState('');
  
  const dropdownOptions = listingRequestedSkills.length > 0 ? listingRequestedSkills : userOfferedSkills;
  const [selectedOfferedSkill, setSelectedOfferedSkill] = useState(dropdownOptions.length > 0 ? (dropdownOptions[0].name || dropdownOptions[0]) : '');
  const [availableTimes, setAvailableTimes] = useState([]);
  const [newSlotDay, setNewSlotDay] = useState('Monday');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [preferredDuration, setPreferredDuration] = useState('60');

  const handleAddSlot = () => {
    if (newSlotDay && newSlotTime) {
      setAvailableTimes([...availableTimes, `${newSlotDay} at ${newSlotTime}`]);
      setNewSlotTime('');
    }
  };

  const handleRemoveSlot = (index) => {
    setAvailableTimes(availableTimes.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    if (onContinue) {
      const selectedSlot = slots.find(s => s.id === selectedSlotId);
      if (isSwapRequest) {
        onContinue(selectedSlot, message, selectedOfferedSkill, availableTimes, parseInt(preferredDuration, 10));
      } else {
        onContinue(selectedSlot, message, selectedOfferedSkill);
      }
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.4)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '16px', paddingTop: '80px'
    }} onClick={onClose}>
      <div style={{
        background: '#ffffff',
        width: '380px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'modalDropIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      }} onClick={e => e.stopPropagation()}>
        <style>{`
          @keyframes modalDropIn {
            from { opacity: 0; transform: translateY(-40px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .bsm-slot-card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 12px;
            display: flex;
            align-items: center;
            gap: 16px;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 12px;
            background: #ffffff;
            user-select: none;
          }
          .bsm-slot-card:hover {
            border-color: #d1d5db;
          }
          .bsm-slot-card.selected {
            border: 1.5px solid #2563eb;
            background: #eff6ff;
          }
          .bsm-date-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: transparent;
            border-radius: 10px;
            padding: 10px 0;
            width: 44px;
            box-sizing: border-box;
          }
          .bsm-slot-card.selected .bsm-date-box {
            background: #172554; /* Matches header */
          }
          .bsm-date-num {
            font-size: 15px;
            font-weight: 700;
            color: #111827;
            line-height: 1;
          }
          .bsm-slot-card.selected .bsm-date-num {
            color: #ffffff;
          }
          .bsm-date-month {
            font-size: 9px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            margin-top: 4px;
          }
          .bsm-slot-card.selected .bsm-date-month {
            color: rgba(255, 255, 255, 0.8);
          }
          .bsm-time-info {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 4px;
          }
          .bsm-time {
            font-size: 14px;
            font-weight: 700;
            color: #111827;
          }
          .bsm-label {
            font-size: 12px;
            color: #6b7280;
          }
          .bsm-btn {
            width: 100%;
            padding: 14px;
            border-radius: 10px;
            border: none;
            background: #93c5fd; 
            color: #ffffff;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            margin-top: 16px;
          }
          .bsm-btn.active-state {
            background: #2563eb;
          }
          .bsm-btn.active-state:hover {
            background: #1d4ed8;
          }
          .bsm-section-title {
            font-size: 11px;
            font-weight: 600;
            color: #9ca3af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 12px;
            margin-top: 24px;
          }
          .bsm-textarea {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            font-family: inherit;
            font-size: 14px;
            resize: none;
            box-sizing: border-box;
            background: #f9fafb;
            color: #111827;
          }
          .bsm-textarea:focus {
            outline: none;
            border-color: #3b82f6;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          .bsm-disclaimer {
            font-size: 11px;
            color: #6b7280;
            margin-top: 12px;
            line-height: 1.4;
            text-align: center;
          }
          .bsm-select {
            width: 100%;
            padding: 12px;
            border-radius: 10px;
            border: 1px solid #e5e7eb;
            font-family: inherit;
            font-size: 14px;
            box-sizing: border-box;
            background: #f9fafb;
            color: #111827;
            margin-bottom: 8px;
          }
          .bsm-select:focus {
            outline: none;
            border-color: #3b82f6;
            background: #ffffff;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
        `}</style>

        {/* Header */}
        <div style={{
          background: '#172554',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          color: '#ffffff'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
              {isSwapRequest ? 'Request a Skill Swap' : 'Request a Session'}
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>
              {selectedSkill} &middot; {selectedTutor}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: 0 }}>
            <IconX size={18} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', overflowY: 'auto', maxHeight: '60vh' }}>
          
          {primarySlot && (
            <>
              <div className="bsm-section-title" style={{ marginTop: 0 }}>Primary Slot</div>
              <div 
                className={`bsm-slot-card ${selectedSlotId === primarySlot.id ? 'selected' : ''}`}
                onClick={() => setSelectedSlotId(primarySlot.id)}
              >
                <div className="bsm-date-box">
                  <span className="bsm-date-num">{primarySlot.date.split(' ')[0]}</span>
                  <span className="bsm-date-month">{primarySlot.date.split(' ')[1]}</span>
                </div>
                <div className="bsm-time-info">
                  <div className="bsm-time">{primarySlot.time}</div>
                  <div className="bsm-label">{primarySlot.label}</div>
                </div>
                {selectedSlotId === primarySlot.id && <IconCheck size={20} color="#3b82f6" style={{ marginRight: '8px' }} />}
              </div>
            </>
          )}

          {otherSlots.length > 0 && (
            <>
              <div className="bsm-section-title">Other Available Slots</div>
              {otherSlots.map(slot => (
                <div 
                  key={slot.id}
                  className={`bsm-slot-card ${selectedSlotId === slot.id ? 'selected' : ''}`}
                  onClick={() => setSelectedSlotId(slot.id)}
                >
                  <div className="bsm-date-box">
                    <span className="bsm-date-num">{slot.date.split(' ')[0]}</span>
                    <span className="bsm-date-month">{slot.date.split(' ')[1]}</span>
                  </div>
                  <div className="bsm-time-info">
                    <div className="bsm-time">{slot.time}</div>
                    <div className="bsm-label">{slot.label}</div>
                  </div>
                  {selectedSlotId === slot.id && <IconCheck size={20} color="#3b82f6" style={{ marginRight: '8px' }} />}
                </div>
              ))}
            </>
          )}

          {isSwapRequest && (
            <>
              <div className="bsm-section-title" style={{ marginTop: 0 }}>Which skill are you offering to teach?</div>
              <CustomSelect 
                value={selectedOfferedSkill}
                onChange={val => setSelectedOfferedSkill(val)}
                options={dropdownOptions.map(s => ({ value: s.name || s, label: s.name || s }))}
                placeholder={dropdownOptions.length === 0 ? 'No skills available' : 'Select a skill...'}
              />

              <div className="bsm-section-title" style={{ marginTop: '16px' }}>Your Available Teaching Times</div>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
                <CustomSelect 
                  value={newSlotDay} 
                  onChange={val => setNewSlotDay(val)}
                  options={['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => ({ value: d, label: d }))}
                  placeholder="Day"
                />
                <CustomTimeInput value={newSlotTime} onChange={setNewSlotTime} style={{ height: '42px' }} />
                <button type="button" onClick={handleAddSlot} style={{padding: '0 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600, fontSize: '14px'}}>Add</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {availableTimes.map((s, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: i === 0 ? '#eff6ff' : '#fff', padding: '10px 12px', border: i === 0 ? '1px solid #bfdbfe' : '1px solid #e5e7eb', borderRadius: '10px', fontSize: '14px' }}>
                    <span>
                      <strong style={{ color: i === 0 ? '#1d4ed8' : '#6b7280', marginRight: '6px' }}>{i === 0 ? 'Primary:' : 'Alternate:'}</strong>
                      {s}
                    </span>
                    <button type="button" onClick={() => handleRemoveSlot(i)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', display: 'flex', alignItems: 'center'}}><IconTrash size={16}/></button>
                  </div>
                ))}
              </div>

              <div className="bsm-section-title" style={{ marginTop: '16px' }}>Preferred Duration</div>
              <CustomSelect 
                value={preferredDuration} 
                onChange={val => setPreferredDuration(val)}
                options={[
                  { value: '30', label: '30 minutes' },
                  { value: '60', label: '1 hour' },
                  { value: '90', label: '1.5 hours' },
                  { value: '120', label: '2 hours' }
                ]}
                placeholder="Select duration"
              />
            </>
          )}

          <div className="bsm-section-title" style={{ marginTop: isSwapRequest ? '12px' : '24px' }}>Message to Teacher (Optional)</div>
          <textarea
            className="bsm-textarea"
            rows="3"
            placeholder="Hi, I'd like to focus on..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          ></textarea>

          <button 
            className={`bsm-btn ${(!isSwapRequest && selectedSlotId) || (isSwapRequest && availableTimes.length > 0 && selectedSlotId) ? 'active-state' : ''}`}
            onClick={handleContinue}
            disabled={isSwapRequest ? (availableTimes.length === 0 || !selectedSlotId) : !selectedSlotId}
          >
            Send Request
          </button>
          <div className="bsm-disclaimer">
            If you would like to negotiate timings, please request to chat and ask them to update their availability.
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookSessionModal;
