import React, { useState } from 'react';
import { IconX } from '@tabler/icons-react';

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
  const [selectedSlotId, setSelectedSlotId] = useState(primarySlot?.id);

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
      background: 'rgba(0, 0, 0, 0.4)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        width: '420px',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.2s ease-out'
      }}>
        {/* Scoped CSS for the modal */}
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .bsm-slot-card {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 16px;
            display: flex;
            align-items: center;
            gap: 16px;
            cursor: pointer;
            transition: all 0.2s;
            margin-bottom: 12px;
          }
          .bsm-slot-card:hover {
            border-color: #d1d5db;
            background: #f9fafb;
          }
          .bsm-slot-card.selected {
            border-color: #534AB7;
            background: #f5f4ff;
          }
          .bsm-date-box {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: transparent;
          }
          .bsm-date-num {
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            line-height: 1;
          }
          .bsm-date-month {
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            margin-top: 4px;
          }
          .bsm-time-info {
            flex: 1;
            border-left: 1px solid #e5e7eb;
            padding-left: 16px;
          }
          .bsm-time {
            font-size: 16px;
            font-weight: 600;
            color: #111827;
          }
          .bsm-label {
            font-size: 13px;
            color: #6b7280;
            margin-top: 2px;
          }
          .bsm-btn {
            width: 100%;
            padding: 16px;
            border-radius: 12px;
            border: none;
            background: #b1a7ea; /* Lavender shade from PNG */
            color: #ffffff;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
            margin-top: 24px;
          }
          .bsm-btn:hover {
            background: #9f94de;
          }
          .bsm-btn.active-state {
            background: #534AB7;
          }
          .bsm-btn.active-state:hover {
            background: #4338ca;
          }
          .bsm-section-title {
            font-size: 12px;
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
          background: '#3b368c',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          color: '#ffffff'
        }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '6px' }}>Available Timings</div>
            <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>
              {selectedSkill} &middot; {selectedTutor}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '4px' }}>
            <IconX size={20} />
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
