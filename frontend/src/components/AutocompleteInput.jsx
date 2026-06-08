import React, { useState, useEffect, useRef } from 'react';
import { getBestMatch, getSuggestions } from '../utils/fuzzy';

const AutocompleteInput = ({ allTopics, onAddSkill, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const [bestMatch, setBestMatch] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setBestMatch(null);
      setSuggestions(allTopics.slice(0, 5));
      return;
    }
    
    const match = getBestMatch(inputValue, allTopics);
    setBestMatch(match);
    
    setSuggestions(getSuggestions(inputValue, allTopics, 5));
  }, [inputValue, allTopics]);

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (bestMatch) {
        e.preventDefault();
        setInputValue(bestMatch.item);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      commitSkill();
    }
  };

  const commitSkill = () => {
    if (inputValue.trim() !== '') {
      // If there's a close match, normalize to it. Otherwise add custom.
      if (bestMatch && bestMatch.distance <= 2) {
        onAddSkill(bestMatch.item);
      } else {
        onAddSkill(inputValue.trim());
      }
      setInputValue('');
    }
  };

  const suffix = (bestMatch && bestMatch.isPrefix && bestMatch.item.length > inputValue.length) 
    ? bestMatch.item.substring(inputValue.length) 
    : '';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '4px', background: '#fff', marginBottom: '12px' }}>
        
        {/* Overlay for suffix */}
        {suffix && (
          <div style={{ 
            position: 'absolute', 
            top: '4px', 
            left: '4px', 
            bottom: '4px', 
            right: '80px', /* Leave space for button */
            padding: '8px 12px', 
            pointerEvents: 'none', 
            display: 'flex', 
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            <span style={{ visibility: 'hidden', whiteSpace: 'pre', fontSize: '14px', fontFamily: 'inherit' }}>{inputValue}</span>
            <span style={{ color: '#9ca3af', fontSize: '14px', whiteSpace: 'pre', fontFamily: 'inherit' }}>{suffix}</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          style={{ flexGrow: 1, border: 'none', outline: 'none', padding: '8px 12px', background: 'transparent', fontSize: '14px', position: 'relative', zIndex: 1, width: '100%' }}
        />
        <button type="button" onClick={commitSkill} style={{ background: '#534AB7', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', zIndex: 2 }}>Add</button>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', color: '#6b7280' }}>Suggestions:</span>
        {suggestions.length > 0 ? suggestions.map(s => (
          <span key={s} onClick={() => { onAddSkill(s); setInputValue(''); }} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#F5F4FF', color: '#534AB7', cursor: 'pointer', border: '1px solid #E0DFF0' }}>{s}</span>
        )) : (
          <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>Press Enter to add custom skill</span>
        )}
      </div>
    </div>
  );
};

export default AutocompleteInput;
