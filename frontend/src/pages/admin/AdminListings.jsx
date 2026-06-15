import React, { useState, useEffect } from 'react';
import { IconSearch, IconLoader2 } from '@tabler/icons-react';
import adminService from '../../services/adminService';
import ConfirmModal from '../../components/modals/ConfirmModal';

const AdminListings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    listingId: null,
    action: null
  });

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (searchQuery) params.q = searchQuery;
      if (activeFilter !== 'All') params.status = activeFilter;
      
      const res = await adminService.getListings(params);
      setListings(res?.data || []);
    } catch (err) {
      console.error('Failed to fetch listings:', err);
      setError('Failed to load listings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchListings();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, activeFilter]);

  const executeAction = async () => {
    const { listingId, action } = confirmModal;
    if (!listingId) return;

    try {
      const newStatus = action === 'disable' ? 'ADMIN_DISABLED' : 'ACTIVE';
      await adminService.updateListingStatus(listingId, newStatus);
      fetchListings();
    } catch (err) {
      console.error(`Failed to ${action} listing:`, err);
      alert(`Failed to ${action} listing.`);
    } finally {
      setConfirmModal({ isOpen: false, listingId: null, action: null });
    }
  };

  // Compute stats locally from fetched data
  const activeCount = listings.filter(s => s.status === 'ACTIVE' && s.active !== false).length;
  const disabledCount = listings.filter(s => s.status === 'ADMIN_DISABLED' || s.active === false).length;
  const pendingCount = listings.filter(s => s.status === 'PENDING').length;
  const totalCount = listings.length;

  return (
    <div className="admin-sessions-page fade-in">
      
      {/* Top Toolbar */}
      <div className="admin-sessions-toolbar">
        <div className="admin-u-search">
          <IconSearch size={18} color="#9ca3af" />
          <input 
            type="text" 
            placeholder="Search listings by title, owner..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="as-filter-pills">
          <button 
            className={`as-pill ${activeFilter === 'All' ? 'active' : ''}`}
            onClick={() => setActiveFilter('All')}
          >
            All
          </button>
          <button 
            className={`as-pill ${activeFilter === 'ACTIVE' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ACTIVE')}
          >
            Active
          </button>
          <button 
            className={`as-pill ${activeFilter === 'PENDING' ? 'active' : ''}`}
            onClick={() => setActiveFilter('PENDING')}
          >
            Pending
          </button>
          <button 
            className={`as-pill ${activeFilter === 'ADMIN_DISABLED' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ADMIN_DISABLED')}
          >
            Disabled
          </button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="admin-sessions-stats" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
        
        {/* Active / Pending Flip Card */}
        <div className="al-flip-container">
          <div className="al-flipper">
            <div className="al-front as-stat-card live" style={{ margin: 0, height: '100%' }}>
              <div className="as-stat-val">{activeCount}</div>
              <div className="as-stat-lbl">ACTIVE LISTINGS</div>
            </div>
            <div className="al-back as-stat-card upcoming" style={{ margin: 0, height: '100%' }}>
              <div className="as-stat-val">{pendingCount}</div>
              <div className="as-stat-lbl">PENDING LISTINGS</div>
            </div>
          </div>
        </div>

        {/* Total / Disabled Flip Card */}
        <div className="al-flip-container">
          <div className="al-flipper">
            <div className="al-front as-stat-card today" style={{ margin: 0, height: '100%' }}>
              <div className="as-stat-val">{totalCount}</div>
              <div className="as-stat-lbl">TOTAL LISTINGS</div>
            </div>
            <div className="al-back as-stat-card completed" style={{ margin: 0, height: '100%' }}>
              <div className="as-stat-val">{disabledCount}</div>
              <div className="as-stat-lbl">DISABLED LISTINGS</div>
            </div>
          </div>
        </div>

      </div>

      {/* Listings List */}
      <div className="admin-sessions-list">
        {loading ? (
          <div className="as-empty-state">
            <IconLoader2 className="spinner" size={24} style={{ marginBottom: '8px', color: '#3b82f6' }} />
            <div>Loading listings...</div>
          </div>
        ) : error ? (
          <div className="as-empty-state" style={{ color: '#ef4444' }}>{error}</div>
        ) : listings.length === 0 ? (
          <div className="as-empty-state">No listings found matching your criteria.</div>
        ) : (
          listings.map(listing => {
            const statusUpper = (listing.status || '').toUpperCase();
            const isDisabled = statusUpper === 'ADMIN_DISABLED' || listing.active === false;
            const timeStr = listing.createdAt ? new Date(listing.createdAt).toLocaleDateString() : 'Unknown date';
            const dotColor = isDisabled ? '#ef4444' : (statusUpper === 'ACTIVE' ? '#10b981' : '#3b82f6');
            
            return (
              <div key={listing.id} className="as-card">
                <div className="as-card-left">
                  <div className="as-dot" style={{ background: dotColor }}></div>
                  <div className="as-info">
                    <div className="as-title-row">
                      <span className="as-title">{listing.title || 'Untitled Listing'}</span>
                      {statusUpper === 'ACTIVE' && !isDisabled && <span className="as-status-pill done">ACTIVE</span>}
                      {isDisabled && <span className="as-status-pill live" style={{background: '#fee2e2', color: '#ef4444'}}>DISABLED</span>}
                      {statusUpper === 'PENDING' && !isDisabled && <span className="as-status-pill" style={{background: '#fef3c7', color: '#d97706'}}>PENDING</span>}
                    </div>
                    <div className="as-meta">
                      {listing.ownerName} &middot; {listing.category || 'General'} &middot; Created on {timeStr}
                    </div>
                  </div>
                </div>
                <div className="as-card-right">
                  {isDisabled ? (
                    <button 
                      className="as-cancel-btn"
                      style={{borderColor: '#10b981', color: '#10b981'}}
                      onClick={() => setConfirmModal({ isOpen: true, listingId: listing.id, action: 'activate' })}
                    >
                      Enable
                    </button>
                  ) : (
                    <button 
                      className="as-cancel-btn"
                      onClick={() => setConfirmModal({ isOpen: true, listingId: listing.id, action: 'disable' })}
                    >
                      Disable
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConfirmModal 
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, listingId: null, action: null })}
        onConfirm={executeAction}
        title={confirmModal.action === 'disable' ? "Disable Listing" : "Activate Listing"}
        message={`Are you sure you want to ${confirmModal.action} this listing?`}
        confirmText={confirmModal.action === 'disable' ? "Disable" : "Activate"}
        isDanger={confirmModal.action === 'disable'}
      />
    </div>
  );
};

export default AdminListings;
