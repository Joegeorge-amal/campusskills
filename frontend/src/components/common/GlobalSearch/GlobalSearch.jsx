import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IconSearch, IconUser, IconBook, IconMessageCircle, IconCalendarEvent, IconGitPullRequest, IconLoader2 } from '@tabler/icons-react';
import api from '../../../services/api';
import { useAppData } from '../../../context/AppDataContext';

const GlobalSearch = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  // Global search query from AppDataContext for contextual page filtering
  const { 
    searchQuery: globalQuery, 
    setSearchQuery: setGlobalQuery,
    sessionsData,
    requestsData,
    chats
  } = useAppData();

  // Local state for dashboard/admin dropdown search
  const [localQuery, setLocalQuery] = useState('');
  const [results, setResults] = useState({ listings: [], sessions: [], requests: [], chats: [], adminUsers: [], adminReports: [], adminListings: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const path = location.pathname;
  const isContextualPage = path.includes('/app/marketplace') || 
                           path.includes('/app/sessions') || 
                           path.includes('/app/requests') || 
                           path.includes('/app/messages');

  const isAdminPage = path.startsWith('/admin');

  // Input placeholder depending on context
  const getPlaceholder = () => {
    if (path.includes('/app/marketplace')) return 'Search listings...';
    if (path.includes('/app/sessions')) return 'Search sessions...';
    if (path.includes('/app/requests')) return 'Search requests...';
    if (path.includes('/app/messages')) return 'Search conversations...';
    if (isAdminPage) return 'Search admin portal...';
    return 'Search CampusSkills...';
  };

  const handleSearch = useCallback(async (q) => {
    if (!q.trim()) {
      setResults({ listings: [], sessions: [], requests: [], chats: [], adminUsers: [], adminReports: [], adminListings: [] });
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    setIsOpen(true);

    try {
      if (isAdminPage) {
        // Admin Search: match users, reports, listings
        const [usersRes, reportsRes, listingsRes] = await Promise.allSettled([
          api.get('/admin/users', { params: { q, limit: 3 } }),
          api.get('/admin/reports', { params: { q, limit: 3 } }),
          api.get('/admin/listings', { params: { q, limit: 3 } })
        ]);

        setResults({
          listings: [], sessions: [], requests: [], chats: [],
          adminUsers: usersRes.status === 'fulfilled' ? (usersRes.value.data?.users || usersRes.value.data?.data?.users || []) : [],
          adminReports: reportsRes.status === 'fulfilled' ? (reportsRes.value.data?.reports || reportsRes.value.data?.data?.reports || []) : [],
          adminListings: listingsRes.status === 'fulfilled' ? (listingsRes.value.data?.listings || listingsRes.value.data?.data?.listings || []) : []
        });
      } else {
        // Dashboard Search: group results (listings, sessions, requests, chats)
        const listingsRes = await api.get('/listings', { params: { q, limit: 3 } });
        const matchingListings = listingsRes.data?.data?.data || listingsRes.data?.data || [];

        const matchingSessions = sessionsData.filter(s =>
          s.topic?.toLowerCase().includes(q.toLowerCase()) ||
          s.name?.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3);

        const matchingRequests = requestsData.filter(r =>
          r.otherUserExtras?.listingTitle?.toLowerCase().includes(q.toLowerCase()) ||
          r.name?.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3);

        const matchingChats = chats.filter(c =>
          c.name?.toLowerCase().includes(q.toLowerCase())
        ).slice(0, 3);

        setResults({
          listings: matchingListings,
          sessions: matchingSessions,
          requests: matchingRequests,
          chats: matchingChats,
          adminUsers: [], adminReports: [], adminListings: []
        });
      }
    } catch (err) {
      console.error('Search failed', err);
    } finally {
      setIsSearching(false);
    }
  }, [isAdminPage, sessionsData, requestsData, chats]);

  // Debounce for dropdown search (Dashboard / Admin only)
  useEffect(() => {
    if (isContextualPage) return;
    const delayDebounceFn = setTimeout(() => {
      handleSearch(localQuery);
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [localQuery, handleSearch, isContextualPage]);

  // Click outside to close dropdown
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

  const handleItemClick = (targetPath) => {
    setIsOpen(false);
    setLocalQuery('');
    navigate(targetPath);
  };

  const hasResults = results.listings.length > 0 || 
                     results.sessions.length > 0 || 
                     results.requests.length > 0 || 
                     results.chats.length > 0 ||
                     results.adminUsers.length > 0 ||
                     results.adminReports.length > 0 ||
                     results.adminListings.length > 0;

  return (
    <div className="topbar-center-search" ref={dropdownRef} style={{ position: 'relative' }}>
      <div className="search-input-wrapper-yt">
        <IconSearch className="search-icon" size={18} color="#666" />
        <input 
          type="text" 
          placeholder={getPlaceholder()} 
          className="search-input-yt"
          value={isContextualPage ? globalQuery : localQuery}
          onChange={(e) => {
            if (isContextualPage) {
              setGlobalQuery(e.target.value);
            } else {
              setLocalQuery(e.target.value);
              if (e.target.value.trim()) {
                setIsOpen(true);
              }
            }
          }}
          onFocus={() => {
            if (!isContextualPage && localQuery.trim()) {
              setIsOpen(true);
            }
          }}
        />
        {isSearching && <IconLoader2 className="spinner" size={16} color="#666" style={{ position: 'absolute', right: '12px' }} />}
      </div>

      {/* Render Dropdown ONLY on non-contextual pages like Dashboard and Admin */}
      {isOpen && !isContextualPage && (localQuery.trim() || isAdminPage) && localQuery.trim() && (
        <div className="global-search-dropdown fade-in" style={{
          position: 'absolute',
          top: '110%',
          left: 0,
          right: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderRadius: '12px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.12)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto',
          border: '1px solid rgba(255, 255, 255, 0.5)'
        }}>
          {!isSearching && !hasResults ? (
            <div style={{ padding: '16px', textAlign: 'center', color: '#6b7280', fontSize: '13px' }}>
              No results found for "{localQuery}"
            </div>
          ) : (
            <>
              {/* --- Dashboard Results --- */}
              {results.listings.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Listings</div>
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
                        <span style={{ fontSize: '14px', color: 'var(--cs-text-main)' }}>{l.title}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{l.category} · {l.listingType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.sessions.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Sessions</div>
                  {results.sessions.map(s => (
                    <div 
                      key={s.id} 
                      onClick={() => handleItemClick(`/app/sessions`)}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <IconCalendarEvent size={16} color="#3b82f6" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: 'var(--cs-text-main)' }}>{s.topic}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>With {s.name} · {s.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.requests.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Requests</div>
                  {results.requests.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => handleItemClick(`/app/requests`)}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <IconGitPullRequest size={16} color="#f59e0b" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: 'var(--cs-text-main)' }}>{r.title}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{r.type} · {r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.chats.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Chats</div>
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
                        <span style={{ fontSize: '14px', color: 'var(--cs-text-main)' }}>With {c.name}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>{c.preview}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* --- Admin Results --- */}
              {results.adminUsers.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Users</div>
                  {results.adminUsers.map(u => (
                    <div 
                      key={u.id} 
                      onClick={() => handleItemClick(`/admin/users?highlight=${u.id}`)}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <IconUser size={16} color="#3b82f6" />
                      <span style={{ fontSize: '14px', color: 'var(--cs-text-main)' }}>{u.displayName || u.name} ({u.email})</span>
                    </div>
                  ))}
                </div>
              )}

              {results.adminReports.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Reports</div>
                  {results.adminReports.map(r => (
                    <div 
                      key={r.id} 
                      onClick={() => handleItemClick(`/admin/reports`)}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <IconGitPullRequest size={16} color="#ef4444" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: 'var(--cs-text-main)' }}>{r.title || r.reason}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Status: {r.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {results.adminListings.length > 0 && (
                <div className="search-section">
                  <div style={{ padding: '8px 12px', fontSize: '11px', fontWeight: 600, color: 'var(--cs-text-inactive)', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#f9fafb' }}>Listings</div>
                  {results.adminListings.map(l => (
                    <div 
                      key={l.id} 
                      onClick={() => handleItemClick(`/admin/listings`)}
                      style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <IconBook size={16} color="#10b981" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '14px', color: 'var(--cs-text-main)' }}>{l.title}</span>
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>Type: {l.listingType}</span>
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
