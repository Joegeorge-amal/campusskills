import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconCalendarEvent, IconShieldCheck } from '@tabler/icons-react';

const BookSessionRequest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const { skillName = 'React.js basics', tutorName = 'Priya S.', price = '300', slot = '26 May · 4:00 PM' } = location.state || {};
  const [message, setMessage] = useState('');

  const handleSendRequest = () => {
    // There is no existing request creation workflow for paid sessions in AppDataContext.
    // Fallback: Show an alert and navigate to dashboard.
    alert('Session request sent to tutor!');
    navigate('/app/dashboard');
  };

  return (
    <div id="book-session-req" className="pg on">
      {/* Scoped styles to exactly match the PNG */}
      <style>{`
        .bsr-container {
          width: 100%;
          user-select: none;
        }
        .bsr-back-btn {
          font-size: 12px;
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          margin-bottom: 20px;
          font-weight: 500;
        }
        .bsr-back-btn:hover {
          color: #374151;
        }
        .bsr-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
        }
        .bsr-header-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 20px;
        }
        .bsr-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          background: #f5f4ff;
          color: #534AB7;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bsr-title {
          font-size: 15px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 2px;
        }
        .bsr-subtitle {
          font-size: 12px;
          color: #6b7280;
        }
        .bsr-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 0 -20px 20px -20px;
        }
        .bsr-section-title {
          font-size: 14px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }
        .bsr-section-desc {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 20px;
        }
        .bsr-field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 6px;
        }
        .bsr-field-label span {
          color: #9ca3af;
          font-weight: 400;
        }
        .bsr-input, .bsr-textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #111827;
          background: #f9fafb;
          transition: border-color 0.2s;
          user-select: auto;
        }
        .bsr-input:focus, .bsr-textarea:focus {
          outline: none;
          border-color: #534AB7;
          background: #ffffff;
        }
        .bsr-textarea {
          min-height: 70px;
          resize: vertical;
          margin-bottom: 20px;
        }
        .bsr-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: transparent;
          border-top: 1px solid #f3f4f6;
          margin: 0 -20px -20px -20px;
        }
        .bsr-footer-text {
          font-size: 12px;
          color: #9ca3af;
        }
        .bsr-secure {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          color: #059669;
        }
        .bsr-submit-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(to right, #1e3a8a, #3b82f6);
          color: #ffffff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .bsr-submit-btn:hover {
          background: #4338ca;
        }
      `}</style>

      <div className="bsr-container">
        <button className="bsr-back-btn" onClick={() => navigate(-1)}>
          &lt; Back
        </button>

        <div className="bsr-card">
          <div className="bsr-header-row">
            <div className="bsr-icon-box">
              <IconCalendarEvent size={18} stroke={2} />
            </div>
            <div>
              <div className="bsr-title">{skillName}</div>
              <div className="bsr-subtitle">{tutorName} &middot; ₹{price}/hr &middot; Online</div>
            </div>
          </div>

          <div className="bsr-divider"></div>

          <div className="bsr-section-title">Send Session Request</div>
          <div className="bsr-section-desc">
            Your request will be sent to the tutor. Payment is only required after they accept.
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label className="bsr-field-label">Preferred schedule</label>
            <input 
              type="text" 
              className="bsr-input" 
              value={slot}
              readOnly
              style={{ caretColor: 'transparent', cursor: 'default' }}
            />
          </div>

          <div>
            <label className="bsr-field-label">Message to tutor <span>(optional)</span></label>
            <textarea 
              className="bsr-textarea" 
              placeholder="e.g. I'm a complete beginner and want to learn the fundamentals first."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="bsr-footer">
            <span className="bsr-footer-text">No payment until request is accepted</span>
            <div className="bsr-secure">
              <IconShieldCheck size={14} stroke={2.5} />
              Secure
            </div>
          </div>
        </div>

        <button className="bsr-submit-btn" style={{ marginTop: '12px' }} onClick={handleSendRequest}>
          Send Request
        </button>
      </div>
    </div>
  );
};

export default BookSessionRequest;
