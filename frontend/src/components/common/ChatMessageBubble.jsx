import React, { memo } from 'react';
import './ChatMessageBubble.css';

/**
 * Expected Payload Structure for `payload` prop:
 * {
 *   type?: 'text' | 'pay' | 'swap', // Defaults to 'text' if omitted
 *   t?: string,                     // The text content (if type is text)
 *   title?: string,                 // Rich bubble title (if type is pay/swap)
 *   sub?: string,                   // Rich bubble subtitle (if type is pay/swap)
 *   reqId?: number | string         // Request ID to pass to onAccept/onDecline
 * }
 */

const ChatMessageBubble = ({
  isMe,
  avatarProps,
  payload,
  onAccept,
  onDecline
}) => {
  const msgType = payload.type || 'text';

  // Render Rich Bubble for Requests (Pay/Swap)
  if (msgType === 'pay' || msgType === 'swap') {
    return (
      <div className={`msg-row ${isMe ? 'msg-me' : 'msg-them'}`}>
        {!isMe && avatarProps && (
          <div 
            className="msg-avatar" 
            style={{ background: avatarProps.bgColor, color: avatarProps.textColor }}
          >
            {avatarProps.letters}
          </div>
        )}
        <div className="msg-rich-bubble">
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
        </div>
      </div>
    );
  }

  // Render Standard Text Bubble
  return (
    <div className={`msg-row ${isMe ? 'msg-me' : 'msg-them'}`}>
      {!isMe && avatarProps && (
        <div 
          className="msg-avatar" 
          style={{ background: avatarProps.bgColor, color: avatarProps.textColor }}
        >
          {avatarProps.letters}
        </div>
      )}
      <div className={`msg-bubble ${isMe ? 'msg-bubble-me' : 'msg-bubble-them'}`}>
        {payload.t}
      </div>
    </div>
  );
};

// Use React.memo so appending new messages doesn't re-render unchanged bubbles
export default memo(ChatMessageBubble);
