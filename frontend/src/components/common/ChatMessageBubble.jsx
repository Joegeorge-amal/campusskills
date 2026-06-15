import React, { memo, useState } from 'react';
import { Clock, Check, CheckCheck, AlertCircle, Reply } from 'lucide-react';
import { motion } from 'framer-motion';
import './ChatMessageBubble.css';

const ChatMessageBubble = ({
  isMe,
  avatarProps,
  payload,
  onAccept,
  onDecline,
  onRetry,
  onReply,
  onEdit,
  onDelete,
  replyToMessage
}) => {
  const msgType = payload.type || 'text';
  const status = payload.status;
  const [showMobileActions, setShowMobileActions] = useState(false);
  
  const renderStatus = () => {
    if (!isMe || !status) return null;
    
    return (
      <span className="msg-status">
        {status === 'sending' && <Clock size={10} color="#cbd5e1" />}
        {status === 'sent' && <Check size={12} color="#cbd5e1" />}
        {status === 'delivered' && <CheckCheck size={12} color="#cbd5e1" />}
        {status === 'read' && <CheckCheck size={12} className="msg-status-read" />}
        {status === 'failed' && <AlertCircle size={12} className="msg-status-failed" />}
      </span>
    );
  };

  const handleContainerClick = () => {
    // For mobile: tap to toggle actions
    setShowMobileActions(prev => !prev);
  };

  // Render Rich Bubble for Requests (Pay/Swap)
  if (msgType === 'pay' || msgType === 'swap') {
    return (
      <motion.div 
        className={`msg-row ${isMe ? 'msg-me' : 'msg-them'}`}
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <div className={`msg-rich-bubble ${status === 'sending' ? 'msg-bubble-sending' : ''}`}>
          <div className="msg-rich-title">{payload.title}</div>
          <div className="msg-rich-sub">{payload.sub}</div>
          {!isMe && (
            <div className="msg-rich-actions">
              <button className="msg-btn-accept" onClick={() => onAccept && onAccept(payload.reqId || Date.now())}>
                Accept
              </button>
              <button className="msg-btn-decline" onClick={() => onDecline && onDecline(payload.reqId || Date.now())}>
                Decline
              </button>
            </div>
          )}
          {(payload.time || isMe) && (
            <span className="msg-time">
              {payload.time} {renderStatus()}
              {status === 'failed' && (
                <button className="msg-retry-btn" onClick={() => onRetry && onRetry(payload)}>
                  Retry
                </button>
              )}
            </span>
          )}
        </div>
      </motion.div>
    );
  }

  const isDeleted = payload.isDeleted;

  // Render Standard Text Bubble
  return (
    <motion.div 
      className={`msg-row ${isMe ? 'msg-me' : 'msg-them'}`}
      initial={{ opacity: 0, y: 10, scale: 0.95, originX: isMe ? 1 : 0 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div 
        className={`msg-bubble-container ${showMobileActions ? 'show-actions' : ''}`}
        onClick={handleContainerClick}
      >
        <div className={`msg-bubble ${isMe ? 'msg-bubble-me' : 'msg-bubble-them'} selectable-text ${status === 'sending' ? 'msg-bubble-sending' : ''}`} style={isDeleted ? { opacity: 0.6, fontStyle: 'italic' } : {}}>
          
          {(payload.replyToMessageId || replyToMessage) && (
            <div className="msg-quote" onClick={(e) => { e.stopPropagation(); /* Scroll to original message in future */ }}>
              {replyToMessage ? (
                <>
                  <div className="msg-quote-name">{(isMe === (replyToMessage.senderId === payload.senderId)) ? 'You' : 'Them'}</div>
                  <div className="msg-quote-text" style={replyToMessage.isDeleted ? { fontStyle: 'italic', opacity: 0.6 } : {}}>
                    {replyToMessage.isDeleted ? "Original message unavailable" : replyToMessage.message}
                  </div>
                </>
              ) : (
                <div className="msg-quote-text" style={{ fontStyle: 'italic', opacity: 0.6 }}>Original message unavailable</div>
              )}
            </div>
          )}

          <span className={`msg-text ${payload.editedAt && !isDeleted ? 'msg-text-edited' : ''}`}>
            {isDeleted ? "This message was deleted." : payload.t}
          </span>
          {(payload.time || isMe) && (
              <span className="msg-time">
                {payload.time} 
                {payload.editedAt && !isDeleted && <span style={{ marginLeft: '4px', fontStyle: 'italic', opacity: 0.7 }}>(edited)</span>}
                {renderStatus()}
                {status === 'failed' && (
                  <button className="msg-retry-btn" onClick={(e) => { e.stopPropagation(); onRetry && onRetry(payload); }}>
                    Retry
                  </button>
                )}
              </span>
          )}
        </div>

        {!isDeleted && (
          <div className="msg-actions">
            {onReply && (
              <button className="msg-action-btn" onClick={(e) => { e.stopPropagation(); onReply(); setShowMobileActions(false); }} title="Reply">
                <Reply size={14} />
              </button>
            )}
            {isMe && onEdit && (
              <button className="msg-action-btn" onClick={(e) => { e.stopPropagation(); onEdit(); setShowMobileActions(false); }} title="Edit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
              </button>
            )}
            {isMe && onDelete && (
              <button className="msg-action-btn" onClick={(e) => { e.stopPropagation(); onDelete(); setShowMobileActions(false); }} title="Delete" style={{ color: '#ef4444' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Use React.memo so appending new messages doesn't re-render unchanged bubbles
export default memo(ChatMessageBubble);
