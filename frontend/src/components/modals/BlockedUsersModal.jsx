import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IconX } from '@tabler/icons-react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import Avatar from '../common/Avatar';

const BlockedUsersModal = ({ onClose }) => {
  const { user, fetchUser } = useAuth();
  const { triggerToast } = useAppData();
  const [blockedProfiles, setBlockedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlockedUsers = async () => {
      try {
        const blockedIds = user?.blockedUsers || [];
        if (blockedIds.length === 0) {
          setBlockedProfiles([]);
          setLoading(false);
          return;
        }

        const profiles = await Promise.all(
          blockedIds.map(async (id) => {
            try {
              const res = await userService.getPublicProfile(id);
              const data = res.data || res;
              return {
                userId: data.profile?.userId || data.userId || id,
                name: data.profile?.name || data.name || 'Unknown User',
                avatarImg: data.profile?.avatarImg || data.profile?.profilePicture || data.avatarImg
              };
            } catch (err) {
              return { userId: id, name: 'Unknown User' };
            }
          })
        );
        setBlockedProfiles(profiles);
      } catch (err) {
        triggerToast('Failed to load blocked users');
      } finally {
        setLoading(false);
      }
    };
    loadBlockedUsers();
  }, [user]);

  const handleUnblock = async (targetId) => {
    try {
      await userService.unblockUser(targetId);
      triggerToast('User unblocked');
      // Refresh context user to get updated blockedUsers list
      await fetchUser();
    } catch (err) {
      triggerToast('Failed to unblock user');
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        style={{ position: 'absolute', inset: 0, background: 'rgba(15, 23, 42, 0.20)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)' }}
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1, transition: { duration: 0.2, ease: 'easeOut' } }} exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.12, ease: 'easeOut' } }}
        style={{ width: '90%', maxWidth: '440px', background: '#fff', borderRadius: '24px', overflow: 'hidden', position: 'relative', zIndex: 1, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', display: 'flex', flexDirection: 'column', maxHeight: '80vh' }}
      >
        <div style={{ padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>Blocked Users</div>
          <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '100px', border: 'none', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}>
            <IconX size={18} />
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>Loading...</div>
          ) : blockedProfiles.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: '14px' }}>You haven't blocked anyone.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {blockedProfiles.map(p => (
                <div key={p.userId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '12px', background: '#f8fafc' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar 
                      initials={p.name ? p.name.substring(0, 2).toUpperCase() : 'U'} 
                      backgroundImage={p.avatarImg || p.profilePicture}
                      size="40px" 
                      fontSize="14px" 
                    />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>{p.name}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleUnblock(p.userId)}
                    style={{ padding: '6px 12px', borderRadius: '100px', border: '1px solid #cbd5e1', background: '#fff', color: '#334155', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Unblock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default BlockedUsersModal;
