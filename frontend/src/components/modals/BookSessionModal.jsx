import React, { useState } from 'react';
import { IconX, IconCheck } from '@tabler/icons-react';

const BookSessionModal = ({
  slots = [
    { id: '1', date: '26 MAY', time: '4:00 PM', label: 'Today', isPrimary: true },
    { id: '2', date: '27 MAY', time: '11:00 AM', label: 'Tomorrow', isPrimary: false },
    { id: '3', date: '29 MAY', time: '5:00 PM', label: 'Thu', isPrimary: false },
  ],
  selectedTutor,
  selectedSkill,
  onContinue,
  onClose
}) => {
  const primarySlot = slots.find(s => s.isPrimary) || slots[0];
  const otherSlots = slots.filter(s => !s.isPrimary);
  const [selectedSlotId, setSelectedSlotId] = useState(null); // No slot selected by default to match screenshot state

  const handleContinue = () => {
    if (onContinue) {
      const selectedSlot = slots.find(s => s.id === selectedSlotId);
      onContinue(selectedSlot);
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
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Available Timings</div>
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

          <button 
            className={`bsm-btn ${selectedSlotId ? 'active-state' : ''}`}
            onClick={handleContinue}
            disabled={!selectedSlotId}
          >
            Continue with this slot
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookSessionModal;
