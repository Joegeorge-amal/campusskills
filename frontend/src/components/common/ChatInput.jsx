import React, { useState } from 'react';
import { IconPaperclip, IconSend } from '@tabler/icons-react';

const ChatInput = ({ onSend }) => {
  const [inputMsg, setInputMsg] = useState('');

  const handleSend = () => {
    if (inputMsg.trim()) {
      onSend(inputMsg);
      setInputMsg('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', borderTop: '0.5px solid var(--cs-border)', background: 'var(--cs-bg-white)' }}>
      <input 
        type="text" 
        placeholder="Type a message..."
        value={inputMsg}
        onChange={e => setInputMsg(e.target.value)}
        onKeyPress={handleKeyPress}
        style={{ flex: 1, padding: '12px 20px', borderRadius: '100px', border: '1px solid var(--cs-border)', background: '#f3f4f6', fontSize: '14px', color: 'var(--cs-text-main)', outline: 'none' }}
      />
      <button onClick={handleSend} style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', marginLeft: '4px' }}>
        <IconSend size={18} />
      </button>
    </div>
  );
};

export default ChatInput;
