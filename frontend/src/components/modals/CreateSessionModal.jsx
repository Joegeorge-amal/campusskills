import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useAppData } from '../../hooks/useAppData';

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
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ padding: '24px', border: '0.5px solid rgba(0, 0, 0, 0.08)', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ fontSize: '15px', fontWeight: '600', color: '#222' }}>Create a session</div>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888', lineHeight: 1, outline: 'none' }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sfld">
            <label>Session Title</label>
            <input 
              type="text" 
              placeholder="e.g. Intro to Binary Trees" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              required
            />
          </div>

          <div className="sfld">
            <label>Skill / Topic</label>
            <select value={skill} onChange={(e) => setSkill(e.target.value)}>
              <option>Data Structures & Algorithms</option>
              <option>C++ for beginners</option>
              <option>Python basics</option>
            </select>
          </div>

          <div className="sfld">
            <label>Select Student</label>
            <select value={student} onChange={(e) => setStudent(e.target.value)} required>
              <option value="" disabled>-- Choose a pending request --</option>
              <option>Priya S. (Needs DSA help)</option>
              <option>Rahul M. (Needs C++)</option>
            </select>
          </div>

          <div className="sfrow">
            <div className="sfld">
              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="sfld">
              <label>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
          </div>

          <div className="sfld">
            <label>Duration</label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>1.5 hours</option>
              <option>2 hours</option>
            </select>
          </div>

          <div className="sfld">
            <label>Mode</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
              {['Online', 'In-person', 'Either'].map((m) => (
                <div 
                  key={m}
                  onClick={() => setMode(m)}
                  style={{
                    padding: '7px',
                    borderRadius: '8px',
                    border: mode === m ? '1.5px solid #534AB7' : '1.5px solid #E0DFF0',
                    background: mode === m ? '#EEEDFE' : '#fff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: mode === m ? '#3C3489' : '#555',
                    fontWeight: mode === m ? '600' : '400'
                  }}
                >
                  {m}
                </div>
              ))}
            </div>
          </div>

          <div className="sfld">
            <label>Session type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              {['Paid session', 'Skill swap'].map((t) => (
                <div 
                  key={t}
                  onClick={() => setType(t)}
                  style={{
                    padding: '7px',
                    borderRadius: '8px',
                    border: type === t ? '1.5px solid #534AB7' : '1.5px solid #E0DFF0',
                    background: type === t ? '#EEEDFE' : '#fff',
                    textAlign: 'center',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: type === t ? '#3C3489' : '#555',
                    fontWeight: type === t ? '600' : '400'
                  }}
                >
                  {t}
                </div>
              ))}
            </div>
          </div>

          <div className="sfld">
            <label>Description</label>
            <textarea 
              placeholder="e.g. We will cover chapter 3 and do some practice problems..." 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button 
            type="submit"
            className="sbtn"
            style={{ marginTop: '4px' }}
          >
            Create & send invite
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default CreateSessionModal;
