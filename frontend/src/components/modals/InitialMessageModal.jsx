import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { IconX } from '@tabler/icons-react';

const InitialMessageModal = ({ selectedTutor, onClose, onSend }) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSend(message);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        style={{ width: '90%', maxWidth: '440px', background: '#fff', borderRadius: '24px', overflow: 'hidden', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Message {selectedTutor}</div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '100px', border: 'none', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <IconX size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#334155', marginBottom: '8px' }}>
            Add an introductory note
          </div>
          <textarea 
            placeholder="Hi, I wanted to know if evenings work for you."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ width: '100%', height: '120px', padding: '16px', borderRadius: '16px', border: '1px solid #cbd5e1', background: '#f8fafc', fontSize: '15px', resize: 'none', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
          />

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
            <button 
              onClick={onClose}
              style={{ flex: 1, padding: '12px', borderRadius: '100px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || message.trim().length === 0}
              style={{ flex: 1, padding: '12px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: (isSubmitting || message.trim().length === 0) ? 'not-allowed' : 'pointer', opacity: (isSubmitting || message.trim().length === 0) ? 0.7 : 1 }}
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default InitialMessageModal;
