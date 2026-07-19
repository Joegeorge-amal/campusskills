import React from 'react';
import { motion } from 'framer-motion';
import { IconX, IconAlertTriangle } from '@tabler/icons-react';

const DeleteChatModal = ({ onClose, onConfirm, isDeleting }) => {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.20)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12, ease: 'easeOut' } }}
        style={{ width: '90%', maxWidth: '400px', background: 'var(--cs-bg-white)', borderRadius: '24px', overflow: 'hidden', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--cs-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <IconAlertTriangle size={24} color="#ef4444" />
            Delete Chat
          </div>
          <button onClick={onClose} disabled={isDeleting} style={{ width: '32px', height: '32px', borderRadius: '100px', border: 'none', background: 'var(--cs-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--cs-text-secondary)' }}>
            <IconX size={18} />
          </button>
        </div>

        <div style={{ padding: '24px' }}>
          <div style={{ fontSize: '15px', color: 'var(--cs-text-main)', lineHeight: '1.5', marginBottom: '24px' }}>
            All the messages in this chat will be deleted, it cannot be recovered.
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={onClose}
              disabled={isDeleting}
              style={{ flex: 1, padding: '12px', borderRadius: '100px', border: '1px solid #cbd5e1', background: 'var(--cs-bg-white)', color: 'var(--cs-text-secondary)', fontSize: '15px', fontWeight: 700, cursor: 'pointer', opacity: isDeleting ? 0.7 : 1 }}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={isDeleting}
              style={{ flex: 1, padding: '12px', borderRadius: '100px', border: 'none', background: '#ef4444', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: isDeleting ? 'not-allowed' : 'pointer', opacity: isDeleting ? 0.7 : 1 }}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DeleteChatModal;
