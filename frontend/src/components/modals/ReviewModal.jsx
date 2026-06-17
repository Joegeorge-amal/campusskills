import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { IconX } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import api from '../../services/api';
import BackloggdStarSelector from '../common/BackloggdStarSelector';

const ReviewModal = ({ isOpen, onClose, session, onSubmit }) => {
  const { user } = useAuth();
  const { triggerToast } = useAppData();
  
  const [modalRating, setModalRating] = useState(5.0);
  const [modalComment, setModalComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !session) return null;

  const handleReviewSubmit = async () => {
    const rating = modalRating;
    const comment = modalComment.trim() || 'No written review.';
    try {
      setIsSubmitting(true);
      await api.post('/reviews', { sessionId: session.id, rating, comment });
      triggerToast('Review submitted successfully!');
      if (onSubmit) onSubmit();
      onClose();
    } catch (err) {
      if (err.message && (err.message.includes('CONFLICT') || err.message.includes('already reviewed'))) {
        triggerToast('You already reviewed this session');
        if (onSubmit) onSubmit();
        onClose();
      } else {
        triggerToast('Failed to submit review');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return ReactDOM.createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '16px'
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '24px',
        maxWidth: '420px',
        width: '100%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        boxSizing: 'border-box'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#111827' }}>Review Session</h3>
          <button 
            onClick={onClose} 
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: 0 }}
          >
            <IconX size={20} />
          </button>
        </div>
        
        <p style={{ fontSize: '13px', color: '#4b5563', margin: '0 0 16px', fontWeight: 500 }}>
          Review for <strong>{session.topic}</strong> with <strong>{session.name}</strong>.
        </p>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
            Rating (Required)
          </label>
          <BackloggdStarSelector value={modalRating} onChange={setModalRating} />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '8px' }}>
            Written Review (Optional)
          </label>
          <textarea 
            placeholder="Write feedback about this session (e.g. Explains concepts clearly)..." 
            value={modalComment} 
            onChange={(e) => setModalComment(e.target.value)}
            style={{ width: '100%', minHeight: '80px', borderRadius: '8px', border: '1px solid #d1d5db', padding: '10px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={onClose}
            disabled={isSubmitting}
            style={{ flex: 1, padding: '10px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
          >
            Cancel
          </button>
          <button 
            onClick={handleReviewSubmit}
            disabled={isSubmitting}
            style={{ flex: 1, padding: '10px', background: '#1d4ed8', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '13px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ReviewModal;
