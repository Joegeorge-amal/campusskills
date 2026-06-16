import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IconSearch, IconUser, IconBook, IconMessageCircle, IconLoader2 } from '@tabler/icons-react';
import api from '../../../services/api';

const GlobalSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ users: [], listings: [], chats: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults({ users: [], listings: [], chats: [] });
      setIsOpen(false);
      return;
    }
    
    setIsSearching(true);
    setIsOpen(true);
    
    try {
      // Note: users uses /users/search
      // listings uses /listings?q=
      // chats uses /chats (filtered locally)
      const [usersRes, listingsRes, chatsRes] = await Promise.allSettled([
        api.get('/users/search', { params: { q, limit: 3 } }),
        api.get('/listings', { params: { q, limit: 3 } }),
        api.get('/chats')
      ]);

      let matchingChats = [];
      if (chatsRes.status === 'fulfilled') {
        const allChats = chatsRes.value.data?.data || chatsRes.value.data || [];
        matchingChats = allChats.filter(c => 
          c.otherParticipantName?.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3);
      }

      setResults({
        users: usersRes.status === 'fulfilled' ? (usersRes.value.data?.users || usersRes.value.data?.data?.users || []) : [],
        listings: listingsRes.status === 'fulfilled' ? (listingsRes.value.data?.data?.data || listingsRes.value.data?.data || []) : [],
        chats: matchingChats
      });
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, handleSearch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleItemClick = (path) => {
    setIsOpen(false);
    setQuery('');
    navigate(path);
  };

  const hasResults = results.users.length > 0 || results.listings.length > 0 || results.chats.length > 0;

  return (
    <div className="topbar-center-search" ref={dropdownRef} style={{ position: 'relative' }}>
      <div className="search-input-wrapper-yt">
        <IconSearch className="search-icon" size={18} color="#666" />
        <input 
          type="text" 
          placeholder="Search CampusSkills..." 
          className="search-input-yt"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
        />
        {isSearching && <IconLoader2 className="spinner" size={16} color="#666" style={{ position: 'absolute', right: '12px' }} />}
      </div>

      {isOpen && query.trim() && (
        <div className="global-search-dropdown fade-in" style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid #e5e7eb'
        }}>
          {!isSearching && !hasResults ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
              No results found for "{query}"
            </div>
          ) : (
            <>
              {results.users.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Users</div>
                  {results.users.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => handleItemClick(`/app/user/${u.id}`)}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <IconUser size={16} color="#3b82f6" />
                      <span style={{ fontSize: '14px', color: '#1f2937' }}>{u.displayName || u.name}</span>
                    </div>
                  ))}
                </div>
              )}

              {results.listings.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Listings</div>
                  {results.listings.map(l => (
                    <div 
                      key={l.id} 
                      onClick={() => handleItemClick(`/app/marketplace?highlight=${l.id}`)}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <IconBook size={16} color="#10b981" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: '#1f2937' }}>{l.title}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{l.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.chats.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Conversations</div>
                  {results.chats.map(c => (
                    <div 
                      key={c.id} 
                      onClick={() => handleItemClick(`/app/messages/${c.id}`)}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <IconMessageCircle size={16} color="#8b5cf6" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: '#1f2937' }}>With {c.otherParticipantName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
