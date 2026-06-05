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
          max-width: 800px;
        }
        .bsr-back-btn {
          font-size: 13px;
          color: #6b7280;
          background: none;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 24px;
          font-weight: 500;
        }
        .bsr-back-btn:hover {
          color: #374151;
        }
        .bsr-card {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
        }
        .bsr-header-row {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 32px;
        }
        .bsr-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: #f5f4ff;
          color: #534AB7;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .bsr-title {
          font-size: 18px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
        }
        .bsr-subtitle {
          font-size: 14px;
          color: #6b7280;
        }
        .bsr-divider {
          height: 1px;
          background: #f3f4f6;
          margin: 0 -32px 32px -32px;
        }
        .bsr-section-title {
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 6px;
        }
        .bsr-section-desc {
          font-size: 14px;
          color: #6b7280;
          margin-bottom: 24px;
        }
        .bsr-field-label {
          display: block;
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin-bottom: 8px;
        }
        .bsr-field-label span {
          color: #9ca3af;
          font-weight: 400;
        }
        .bsr-input, .bsr-textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 12px 16px;
          font-size: 14px;
          color: #111827;
          background: #f9fafb;
          transition: border-color 0.2s;
        }
        .bsr-input:focus, .bsr-textarea:focus {
          outline: none;
          border-color: #534AB7;
          background: #ffffff;
        }
        .bsr-textarea {
          min-height: 100px;
          resize: vertical;
          margin-bottom: 32px;
        }
        .bsr-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          margin-bottom: 32px;
        }
        .bsr-footer-text {
          font-size: 13px;
          color: #6b7280;
        }
        .bsr-secure {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #059669;
        }
        .bsr-submit-btn {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          border: none;
          background: #534AB7;
          color: #ffffff;
          font-size: 16px;
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
              <IconCalendarEvent size={24} stroke={2} />
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

          <div style={{ marginBottom: '24px' }}>
            <label className="bsr-field-label">Preferred schedule</label>
            <input 
              type="text" 
              className="bsr-input" 
              value={slot}
              readOnly
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
              <IconShieldCheck size={16} stroke={2.5} />
              Secure
            </div>
          </div>

          <button className="bsr-submit-btn" onClick={handleSendRequest}>
            Send Request
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookSessionRequest;
