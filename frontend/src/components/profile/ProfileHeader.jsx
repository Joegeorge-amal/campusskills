import React, { useState, useEffect } from 'react';
import Avatar from '../common/Avatar';
import Heatmap from './Heatmap';

const ProfileHeader = ({ 
  user, 
  isOwner = false, 
  onEditProfile,
  onImageChange,
  onRemovePhoto
}) => {
  const [isBannerHovered, setIsBannerHovered] = useState(false);
  const [bannerGradient, setBannerGradient] = useState(null);

  useEffect(() => {
    if (user?.avatarColor) {
      const getLuminance = (hex) => {
        if (!hex) return 255;
        const rgb = parseInt(hex.replace('#', ''), 16);
        return 0.299 * ((rgb >> 16) & 255) + 0.587 * ((rgb >> 8) & 255) + 0.114 * (rgb & 255);
      };
      const bgLum = getLuminance(user.avatarColor.bg);
      const textLum = getLuminance(user.avatarColor.text);
      
      if (bgLum < textLum) {
        const rightColor = user.avatarColor.bg.toLowerCase() === '#1d4ed8' ? '#2563eb' : '#111827';
        setBannerGradient(`linear-gradient(105deg, ${user.avatarColor.bg} 0%, ${rightColor} 100%)`);
      } else {
        setBannerGradient(`linear-gradient(105deg, ${user.avatarColor.bg} 0%, ${user.avatarColor.text} 100%)`);
      }
    } else {
      const colors = ['#2563eb', '#db2777', '#059669', '#d97706', '#7c3aed', '#0891b2'];
      const charCode = user?.name ? user.name.charCodeAt(0) : 0;
      setBannerGradient(`linear-gradient(105deg, ${colors[charCode % colors.length]} 0%, #111827 100%)`);
    }
  }, [user?.avatarColor, user?.name]);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <>
      <div 
        onMouseEnter={() => setIsBannerHovered(true)} 
        onMouseLeave={() => setIsBannerHovered(false)}
        style={{ 
          height: '180px', 
          backgroundImage: user?.bannerImg ? `linear-gradient(to right, rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${user?.bannerImg})` : (bannerGradient || 'linear-gradient(105deg, #2563eb 0%, #312e81 100%)'), 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          width: '100%', 
          position: 'relative',
          transition: 'background-image 0.5s ease'
        }}
      >
      </div>

      <div style={{ margin: '-68px auto 0', padding: '0 24px', position: 'relative', pointerEvents: 'none' }}>
        <Heatmap visible={user?.heatmapVisibility !== false} />

        <div style={{ pointerEvents: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div 
              style={{ 
                width: '128px', height: '128px', borderRadius: '50%', background: '#fff', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                boxShadow: '0 12px 32px rgba(0,0,0,0.15)', position: 'relative' 
              }}
            >
              <Avatar initials={initials} bg={user?.avatarColor?.bg || "#eef2ff"} color={user?.avatarColor?.text || "#1d4ed8"} backgroundImage={user?.avatarImg} size="120px" fontSize="44px" />
            </div>
            
            {isOwner && (
              <div style={{ display: 'flex', gap: '12px', marginTop: '80px' }}>
                <button 
                  onClick={onEditProfile} 
                  className="btn-secondary"
                  style={{ background: '#fff', border: '1px solid #e5e7eb', color: '#374151', padding: '8px 16px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}
                >
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
