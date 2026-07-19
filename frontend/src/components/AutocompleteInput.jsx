import React, { useState, useEffect, useRef } from 'react';
import { getBestMatch, getSuggestions, getBestFuzzyMatch } from '../utils/fuzzy';

const AutocompleteInput = ({ allTopics = [], onAddSkill, placeholder }) => {
  const [inputValue, setInputValue] = useState('');
  const [bestMatch, setBestMatch] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [pending, setPending] = useState(null);
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

  const tryAdd = (raw) => {
    const val = raw.trim();
    if (!val) return;

    const exact = allTopics.find(t => t.toLowerCase() === val.toLowerCase());
    if (exact) {
      onAddSkill(exact);
      setInputValue('');
      return;
    }

    const fuzzy = getBestFuzzyMatch(val, allTopics);
    if (fuzzy) {
      setPending({ input: val, match: fuzzy });
    } else {
      setPending({ input: val, match: null });
    }
  };

  const useSuggestion = () => {
    if (pending && pending.match) {
      onAddSkill(pending.match.item);
    }
    setPending(null);
    setInputValue('');
    inputRef.current?.focus();
  };

  const addCustom = () => {
    if (pending) {
      onAddSkill(pending.input);
    }
    setPending(null);
    setInputValue('');
    inputRef.current?.focus();
  };

  const cancelPending = () => {
    setPending(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      if (bestMatch) {
        e.preventDefault();
        setInputValue(bestMatch.item);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (pending) {
        addCustom();
      } else {
        tryAdd(inputValue);
      }
    }
  };

  const suffix = (bestMatch && bestMatch.isPrefix && bestMatch.item.length > inputValue.length)
    ? bestMatch.item.substring(inputValue.length)
    : '';

  return (
    <div style={{ width: '100%' }}>
      <div style={{ position: 'relative', display: 'flex', border: '1px solid var(--cs-border)', borderRadius: '10px', padding: '4px', background: 'var(--cs-bg-white)', marginBottom: '12px' }}>

        {suffix && (
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            bottom: '4px',
            right: '80px',
            padding: '8px 12px',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden'
          }}>
            <span style={{ visibility: 'hidden', whiteSpace: 'pre', fontSize: '14px', fontFamily: 'inherit' }}>{inputValue}</span>
            <span style={{ color: 'var(--cs-text-inactive)', fontSize: '14px', whiteSpace: 'pre', fontFamily: 'inherit' }}>{suffix}</span>
          </div>
        )}

        <input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={e => { if (!pending) setInputValue(e.target.value); }}
          onKeyDown={handleKeyDown}
          style={{ flexGrow: 1, border: 'none', outline: 'none', padding: '8px 12px', background: 'transparent', fontSize: '14px', position: 'relative', zIndex: 1, width: '100%' }}
        />
        <button
          type="button"
          onClick={() => { if (pending) { addCustom(); } else { tryAdd(inputValue); } }}
          style={{ background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', padding: '8px 20px', fontWeight: 600, fontSize: '14px', cursor: 'pointer', zIndex: 2 }}
        >
          {pending ? 'Add Anyway' : 'Add'}
        </button>
      </div>

      {pending ? (
        <div style={{ background: 'var(--cs-bg-light)', border: '1px solid var(--cs-border)', borderRadius: '10px', padding: '16px', marginBottom: '12px' }}>
          {pending.match ? (
            <>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                Did you mean "{pending.match.item}"?
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                "{pending.input}" isn't a recognized skill, but you can still add it.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={useSuggestion} style={{ padding: '6px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Use "{pending.match.item}"
                </button>
                <button onClick={addCustom} style={{ padding: '6px 14px', background: 'var(--cs-bg-white)', color: '#374151', border: '1px solid var(--cs-border)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                  Add "{pending.input}"
                </button>
                <button onClick={cancelPending} style={{ padding: '6px 14px', background: 'transparent', color: '#6b7280', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>
                "{pending.input}" isn't a recognized skill.
              </div>
              <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                You can still add it as a custom skill.
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={addCustom} style={{ padding: '6px 14px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>
                  Add "{pending.input}"
                </button>
                <button onClick={cancelPending} style={{ padding: '6px 14px', background: 'transparent', color: '#6b7280', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: '#6b7280' }}>Suggestions:</span>
          {suggestions.length > 0 ? suggestions.map(s => (
            <span key={s} onClick={() => { onAddSkill(s); setInputValue(''); }} style={{ fontSize: '12px', padding: '3px 10px', borderRadius: '20px', background: '#eef2ff', color: '#1d4ed8', cursor: 'pointer', border: '1px solid #dbeafe' }}>{s}</span>
          )) : (
            <span style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', fontStyle: 'italic' }}>Press Enter to add custom skill</span>
          )}
        </div>
      )}
    </div>
  );
};

export default AutocompleteInput;
