import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppData } from '../context/AppDataContext';

const SwapRequest = () => {
  const navigate = useNavigate();
  const { submitSwapProposal } = useAppData();

  // In a real app, these come from context or routing
  const targetTutor = 'Priya S.';
  const targetSkill = 'React.js basics';

  const [offerSkill, setOfferSkill] = useState('Data structures & algorithms');
  const [schedule, setSchedule] = useState('');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    submitSwapProposal(targetTutor, targetSkill, offerSkill, schedule, note);
    navigate('/app/dashboard');
  };

  return (
    <div id="exreq" className="pg on">
      <button 
        onClick={() => navigate(-1)} 
        style={{ fontSize: '12px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '12px' }}
      >
        Back
      </button>
      
      <div className="mbg">
        <div className="modal">
          <div style={{ fontSize: '14px', fontWeight: 500, color: '#222', marginBottom: '3px' }}>Propose a skill swap</div>
          <div style={{ fontSize: '12px', color: '#888', marginBottom: '13px' }}>To: {targetTutor}</div>
          
          <div style={{ background: '#F5F4FF', borderRadius: '8px', padding: '9px 11px', marginBottom: '11px', display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12px', color: '#888' }}>They teach you</span>
            <span style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{targetSkill}</span>
          </div>
          
          <div className="fld">
            <label>You'll teach in return</label>
            <select style={{ fontSize: '12px' }} value={offerSkill} onChange={e => setOfferSkill(e.target.value)}>
              <option>Data structures & algorithms</option>
              <option>C++ for beginners</option>
              <option>Figma basics</option>
            </select>
          </div>
          
          <div className="fld">
            <label>Preferred schedule</label>
            <input 
              type="text" 
              placeholder="e.g. Weekends 5–7 PM" 
              value={schedule}
              onChange={e => setSchedule(e.target.value)}
            />
          </div>
          
          <div className="fld" style={{ marginBottom: '9px' }}>
            <label>Note (optional)</label>
            <input 
              type="text" 
              placeholder="e.g. Complete beginner in this topic" 
              value={note}
              onChange={e => setNote(e.target.value)}
            />
          </div>
          
          <button className="mgo" onClick={handleSubmit}>
            Send swap request
          </button>
        </div>
      </div>
    </div>
  );
};

export default SwapRequest;
