import React, { useState, useEffect, useRef } from 'react';
import { IconPaperclip, IconSend, IconX, IconEdit } from '@tabler/icons-react';
import { Reply } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ChatInput = ({ onSend, onChange, replyingTo, onCancelReply, editingMessage, onCancelEdit }) => {
  const [inputMsg, setInputMsg] = useState('');
  const { user } = useAuth();
  const textareaRef = useRef(null);

  useEffect(() => {
    if (editingMessage) {
      setInputMsg(editingMessage.message || '');
    } else {
      setInputMsg('');
    }
  }, [editingMessage]);

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (!el) return;
    
    const scrollTop = el.scrollTop;
    const prevHeight = el.dataset.prevHeight || '44';
    
    el.style.transition = 'none';
    el.style.height = '44px';
    
    const scrollHeight = el.scrollHeight;
    const targetHeight = Math.min(scrollHeight, 120);
    
    if (String(targetHeight) === prevHeight) {
      el.style.height = prevHeight + 'px';
      el.scrollTop = scrollTop;
      return;
    }
    
    el.style.height = prevHeight + 'px';
    el.offsetHeight; // force reflow
    
    el.style.transition = 'height 0.15s ease-out';
    el.style.height = targetHeight + 'px';
    el.dataset.prevHeight = targetHeight;
    el.scrollTop = scrollTop;
  };

  React.useLayoutEffect(() => {
    adjustHeight();
  }, [inputMsg]);

  const handleSend = () => {
    if (inputMsg.trim()) {
      onSend(inputMsg);
      setInputMsg('');
      if (onChange) onChange({ target: { value: '' } });
      
      // Reset height after sending
      if (textareaRef.current) {
        textareaRef.current.style.transition = 'none';
        textareaRef.current.style.height = '44px';
        textareaRef.current.dataset.prevHeight = '44';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Natural newline
      } else {
        e.preventDefault();
        handleSend();
      }
    }
  };

  const handleChange = (e) => {
    setInputMsg(e.target.value);
    if (onChange) onChange(e);
  };

  const isReplyingToMe = replyingTo?.senderId === user?.userId;
  const replyName = isReplyingToMe ? 'You' : (replyingTo?.senderName || 'Them');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderTop: '0.5px solid var(--cs-border)', background: 'var(--cs-bg-white)' }}>
      {replyingTo && !editingMessage && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px 0 24px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #1d4ed8', flex: 1 }}>
            <Reply size={16} color="#64748b" />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#1d4ed8' }}>Replying to {replyName}</span>
              <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {replyingTo.message}
              </span>
            </div>
          </div>
          <button onClick={onCancelReply} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '8px', color: '#94a3b8' }}>
            <IconX size={18} />
          </button>
        </div>
      )}
      
      {editingMessage && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 24px 0 24px' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '8px', borderLeft: '3px solid #10b981', flex: 1 }}>
            <IconEdit size={16} color="#64748b" />
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#10b981' }}>Editing message</span>
              <span style={{ fontSize: '12px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {editingMessage.message}
              </span>
            </div>
          </div>
          <button onClick={onCancelEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', marginLeft: '8px', color: '#94a3b8' }}>
            <IconX size={18} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '12px', padding: '16px 24px' }}>
        <textarea 
          ref={textareaRef}
          className="chat-input-textarea"
          placeholder="Type a message..."
          value={inputMsg}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          rows={1}
          style={{ 
            flex: 1, 
            padding: '12px 20px', 
            borderRadius: '24px', 
            border: '1px solid var(--cs-border)', 
            background: '#f3f4f6', 
            fontSize: '14px', 
            color: 'var(--cs-text-main)', 
            outline: 'none',
            resize: 'none',
            overflowY: 'auto',
            minHeight: '44px',
            lineHeight: '20px',
            fontFamily: 'inherit',
            boxSizing: 'border-box'
          }}
        />
        <button onClick={handleSend} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', marginLeft: '4px', flexShrink: 0, marginBottom: '2px' }}>
          <IconSend size={18} />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
