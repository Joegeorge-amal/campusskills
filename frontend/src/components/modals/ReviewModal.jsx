import React, { useState } from 'react';
import { IconX } from '@tabler/icons-react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import api from '../../services/api';
import BackloggdStarSelector from '../common/BackloggdStarSelector';
import ModalWrapper from '../common/ModalWrapper';

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
      window.dispatchEvent(new CustomEvent('markNotificationAsRead', { 
        detail: { sourceType: 'SESSION', sourceId: session.id } 
      }));
      if (onSubmit) onSubmit();
      onClose();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || '';
      const status = err.response?.status;
      console.log('[ReviewModal] Error:', { status, errorMsg, sessionId: session?.id });
      if (errorMsg.includes('CONFLICT') || errorMsg.includes('already reviewed')) {
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

  return (
    <ModalWrapper isOpen={true} onClose={onClose} maxWidth="420px" zIndex={1000}>
      <div style={{
        background: 'var(--cs-bg-white)',
        borderRadius: '16px',
        padding: '24px',
        width: '100%',
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
        
        <p style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', margin: '0 0 16px', fontWeight: 500 }}>
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
            style={{ width: '100%', minHeight: '80px', borderRadius: '8px', border: '1px solid var(--cs-border)', padding: '10px', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
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
    </ModalWrapper>
  );
};

export default ReviewModal;
