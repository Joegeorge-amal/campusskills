import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import StatCard from '../components/common/StatCard';
import { IconStar, IconBuildingBank, IconQrcode, IconArrowDownRight, IconArrowUpRight, IconArrowsExchange } from '@tabler/icons-react';

const Profile = () => {
  const { user, avBg, avCol } = useAuth();
  const { triggerToast } = useAppData();
  const navigate = useNavigate();

  if (!user) return null;

  // Mock stats since they are not in AppDataContext
  const stats = {
    trustScore: user?.trustScore || '4.8',
    swapsDone: 8
  };

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AK';

  return (
    <div id="profile" className="pg on" style={{ padding: '24px', background: 'var(--cs-bg-light)', minHeight: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px' }}>
        <Avatar initials={initials} bg={avBg} color={avCol} backgroundImage={user?.avatarImg} size="64px" fontSize="20px" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{user?.name || "Demo User"}</div>
          <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', marginTop: '4px' }}>{user ? `${user.year} · ${user.branch} · ${user.college}` : '3rd year · CSE · PESU Bengaluru'}</div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
            {(user?.topicsOffered?.length > 0) && (
              <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: '#E1F5EE', color: '#0F6E56', fontWeight: 500 }}>
                Teaching: {user.topicsOffered.join(', ')}
              </span>
            )}
            {(user?.topicsWanted?.length > 0) && (
              <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '20px', background: 'var(--cs-primary-light)', color: 'var(--cs-primary-dark)', fontWeight: 500 }}>
                Learning: {user.topicsWanted.join(', ')}
              </span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '24px', fontWeight: 600, color: 'var(--cs-primary)' }}>{stats.trustScore} <IconStar style={{ fontSize: '16px', color: '#BA7517' }} /></div>
            <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)' }}>Trust score</div>
          </div>
          <button 
            onClick={() => navigate('/app/edit-profile')} 
            style={{ fontSize: '13px', padding: '8px 16px', borderRadius: 'var(--cs-radius-sm)', border: '1.5px solid var(--cs-primary-light)', background: 'var(--cs-bg-white)', color: 'var(--cs-primary)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          >
            Edit profile
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        
        {/* Linked Banks */}
        <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Linked bank accounts</span>
            <button style={{ fontSize: '13px', color: 'var(--cs-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/app/add-bank')}>+ Add bank</button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: '0.5px solid var(--cs-border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--cs-radius-sm)', background: 'var(--cs-bg-light)', color: 'var(--cs-text-inactive)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBuildingBank size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>HDFC Bank <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#E1F5EE', color: '#0F6E56', marginLeft: '6px', fontWeight: 500 }}>Default</span></div>
              <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)' }}>Savings · ••••1942 · IFSC HDFC0001234</div>
            </div>
            <button style={{ fontSize: '12px', padding: '4px 10px', borderRadius: 'var(--cs-radius-sm)', border: '0.5px solid var(--cs-border)', background: 'none', color: 'var(--cs-text-inactive)', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--cs-radius-sm)', background: '#EAF3DE', color: '#3B6D11', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconBuildingBank size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>State Bank of India</div>
              <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)' }}>Savings · ••••3587 · IFSC SBIN0005678</div>
            </div>
            <button style={{ fontSize: '12px', padding: '4px 10px', borderRadius: 'var(--cs-radius-sm)', border: '0.5px solid var(--cs-border)', background: 'none', color: 'var(--cs-text-inactive)', cursor: 'pointer', fontWeight: 500 }}>Edit</button>
          </div>
        </div>

        {/* UPI QR */}
        <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '16px' }}>UPI & payment QR</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--cs-radius-sm)', background: '#FAEEDA', color: '#633806', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconQrcode size={20} />
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{user.upi}</div>
              <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)' }}>Linked to HDFC ••42</div>
            </div>
          </div>
          <div style={{ border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-md)', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="100" height="100" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg">
              <rect width="84" height="84" fill="#fff"/>
              <g fill="#222">
                <rect x="4" y="4" width="28" height="28" rx="3" fill="none" stroke="#222" strokeWidth="2.5"/>
                <rect x="9" y="9" width="18" height="18" rx="1.5"/>
                <rect x="52" y="4" width="28" height="28" rx="3" fill="none" stroke="#222" strokeWidth="2.5"/>
                <rect x="57" y="9" width="18" height="18" rx="1.5"/>
                <rect x="4" y="52" width="28" height="28" rx="3" fill="none" stroke="#222" strokeWidth="2.5"/>
                <rect x="9" y="57" width="18" height="18" rx="1.5"/>
                <rect x="39" y="4" width="5" height="5"/><rect x="39" y="12" width="5" height="5"/><rect x="39" y="20" width="5" height="5"/>
                <rect x="4" y="39" width="5" height="5"/><rect x="12" y="39" width="5" height="5"/><rect x="20" y="39" width="5" height="5"/>
                <rect x="39" y="39" width="5" height="5"/><rect x="47" y="39" width="5" height="5"/><rect x="55" y="39" width="5" height="5"/>
                <rect x="63" y="39" width="5" height="5"/><rect x="71" y="39" width="5" height="5"/>
                <rect x="39" y="47" width="5" height="5"/><rect x="55" y="47" width="5" height="5"/><rect x="71" y="47" width="5" height="5"/>
                <rect x="47" y="55" width="5" height="5"/><rect x="63" y="55" width="5" height="5"/>
                <rect x="39" y="63" width="5" height="5"/><rect x="47" y="63" width="5" height="5"/><rect x="55" y="63" width="5" height="5"/>
                <rect x="63" y="71" width="5" height="5"/><rect x="71" y="63" width="5" height="5"/><rect x="71" y="71" width="5" height="5"/>
              </g>
            </svg>
            <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', textAlign: 'center' }}>Others scan this to pay you directly</div>
            <button 
              onClick={() => triggerToast('QR image saved!')} 
              style={{ fontSize: '12px', padding: '6px 14px', borderRadius: 'var(--cs-radius-sm)', border: '0.5px solid var(--cs-border)', background: 'var(--cs-bg-light)', color: 'var(--cs-text-inactive)', cursor: 'pointer', fontWeight: 500 }}
            >
              Download QR
            </button>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Skills */}
        <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Skills I'm offering</span>
            <button style={{ fontSize: '13px', color: 'var(--cs-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }} onClick={() => navigate('/app/edit-profile')}>+ Add</button>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {(!user?.topicsOffered || user.topicsOffered.length === 0) ? (
               <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', padding: '16px 0' }}>No skills offered yet.</div>
            ) : (
              user.topicsOffered.map((topic, i) => (
                <div key={i} style={{ border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-md)', padding: '16px', background: 'var(--cs-bg-light)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', background: 'var(--cs-bg-white)', color: 'var(--cs-text-inactive)', border: '0.5px solid var(--cs-border)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Topic</span>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-primary)' }}>Available</span>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>{topic}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
                    <span style={{ fontSize: '12px', color: '#BA7517', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 500 }}><IconStar size={14} /> New</span>
                    <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: '#E1F5EE', color: '#0F6E56', fontWeight: 500 }}>Active</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Earnings */}
        <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '16px' }}>Earnings</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <StatCard 
              icon={<IconArrowDownRight size={16} />}
              iconBg="#E1F5EE"
              iconColor="#0F6E56"
              value="₹1,200"
              label="Total earned"
            />
            <StatCard 
              icon={<IconArrowUpRight size={16} />}
              iconBg="#E6F1FB"
              iconColor="#185FA5"
              value="₹500"
              label="Withdrawn to bank"
            />
            <StatCard 
              icon={<IconArrowsExchange size={16} />}
              iconBg="var(--cs-primary-light)"
              iconColor="var(--cs-primary)"
              value={stats.swapsDone}
              label="Swaps completed"
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;
