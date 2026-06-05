import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAppData } from '../../context/AppDataContext';
import { IconX } from '@tabler/icons-react';

const CreateSessionModal = ({ isOpen, onClose }) => {
  const { triggerToast, createSession } = useAppData();
  const [title, setTitle] = useState('');
  const [skill, setSkill] = useState('Data Structures & Algorithms');
  const [student, setStudent] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState('1 hour');
  const [mode, setMode] = useState('Online');
  const [type, setType] = useState('Paid session');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (createSession) {
      createSession({ title, skill, student, date, time, duration, mode, type, description });
    }
    triggerToast('Session created! Invite sent to student.');
    onClose();
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose} style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <style>{`
        .csm-wrapper {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 560px;
          max-height: 90vh;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          display: flex;
          flex-direction: column;
        }
        .csm-header {
          background: #3b368c;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          color: #ffffff;
        }
        .csm-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 4px;
        }
        .csm-subtitle {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.8);
        }
        .csm-close {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
          display: flex;
          padding: 4px;
          border-radius: 4px;
          transition: color 0.2s, background 0.2s;
        }
        .csm-close:hover {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.1);
        }
        .csm-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .csm-field label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin-bottom: 8px;
        }
        .csm-input {
          width: 100%;
          padding: 12px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
          outline: none;
          transition: border-color 0.2s;
          background: #ffffff;
          box-sizing: border-box;
          font-family: inherit;
        }
        .csm-input:focus {
          border-color: #534AB7;
        }
        .csm-row {
          display: grid;
          gap: 16px;
        }
        .csm-row-2 { grid-template-columns: 1fr 1fr; }
        .csm-row-3 { grid-template-columns: 1fr 1fr 1fr; }
        
        .csm-pill-group {
          display: flex;
          background: #f9fafb;
          border-radius: 8px;
          padding: 4px;
          border: 1px solid #e5e7eb;
        }
        .csm-pill {
          flex: 1;
          padding: 8px 4px;
          text-align: center;
          font-size: 12px;
          font-weight: 500;
          color: #6b7280;
          cursor: pointer;
          border-radius: 6px;
          transition: all 0.2s;
        }
        .csm-pill.active {
          background: #ffffff;
          color: #534AB7;
          font-weight: 600;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .csm-submit {
          width: 100%;
          background: #b4ace5;
          color: #ffffff;
          border: none;
          padding: 14px;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
          margin-top: 4px;
        }
        .csm-submit:hover {
          background: #9d94d1;
        }
        @media (max-width: 600px) {
          .csm-row-2, .csm-row-3 { grid-template-columns: 1fr; gap: 20px; }
          .csm-pill-group { flex-direction: column; }
        }
      `}</style>
      
      <div className="csm-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="csm-header">
          <div>
            <div className="csm-title">Create a Session</div>
            <div className="csm-subtitle">List your availability for students to book</div>
          </div>
          <button className="csm-close" onClick={onClose}>
            <IconX size={20} />
          </button>
        </div>

        <form className="csm-body" onSubmit={handleSubmit}>
          
          <div className="csm-field">
            <label>Session Title</label>
            <input 
              type="text" 
              className="csm-input"
              placeholder="e.g. Intro to Binary Trees" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
          </div>

          <div className="csm-row csm-row-2">
            <div className="csm-field">
              <label>Skill / Subject</label>
              <select className="csm-input" value={skill} onChange={(e) => setSkill(e.target.value)}>
                <option>Data Structures & Algorithms</option>
                <option>C++ for beginners</option>
                <option>Python basics</option>
              </select>
            </div>
            <div className="csm-field">
              <label>Select Student</label>
              <select className="csm-input" value={student} onChange={(e) => setStudent(e.target.value)} required>
                <option value="" disabled>-- Choose pending request --</option>
                <option>Priya S. (Needs DSA help)</option>
                <option>Rahul M. (Needs C++)</option>
              </select>
            </div>
          </div>

          <div className="csm-row csm-row-2">
            <div className="csm-field">
              <label>Availability Date</label>
              <input type="date" className="csm-input" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>
            <div className="csm-field">
              <label>Start Time</label>
              <input type="time" className="csm-input" value={time} onChange={(e) => setTime(e.target.value)} required />
            </div>
          </div>

          <div className="csm-row csm-row-3">
            <div className="csm-field">
              <label>Duration (hrs)</label>
              <select className="csm-input" value={duration} onChange={(e) => setDuration(e.target.value)}>
                <option>30 mins</option>
                <option>1 hour</option>
                <option>1.5 hours</option>
                <option>2 hours</option>
              </select>
            </div>
            <div className="csm-field">
              <label>Rate / Type</label>
              <div className="csm-pill-group">
                {['Paid session', 'Skill swap'].map((t) => (
                  <div 
                    key={t}
                    className={`csm-pill ${type === t ? 'active' : ''}`}
                    onClick={() => setType(t)}
                  >
                    {t === 'Paid session' ? 'Paid' : 'Swap'}
                  </div>
                ))}
              </div>
            </div>
            <div className="csm-field">
              <label>Mode</label>
              <div className="csm-pill-group">
                {['Online', 'In-person'].map((m) => (
                  <div 
                    key={m}
                    className={`csm-pill ${mode === m ? 'active' : ''}`}
                    onClick={() => setMode(m)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="csm-field">
            <label style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Description (optional)</span>
            </label>
            <textarea 
              className="csm-input"
              rows={3}
              style={{ resize: 'vertical' }}
              placeholder="What will you cover in this session?" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="csm-submit">
            List Session
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateSessionModal;
