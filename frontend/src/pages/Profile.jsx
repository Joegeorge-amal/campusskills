import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import { IconStar, IconBuildingBank, IconQrcode } from '@tabler/icons-react';

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
    <div id="profile" className="pg on">
      {/* Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '13px', background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', padding: '14px', marginBottom: '12px' }}>
        <Avatar initials={initials} bg={avBg} color={avCol} backgroundImage={user?.avatarImg} size="52px" fontSize="17px" />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '15px', fontWeight: 500, color: '#222' }}>{user?.name || "Demo User"}</div>
          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{user ? `${user.year} · ${user.branch} · ${user.college}` : '3rd year · CSE · PESU Bengaluru'}</div>
          <div style={{ display: 'flex', gap: '5px', marginTop: '7px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: '#E1F5EE', color: '#0F6E56' }}>Teaching: DSA, C++</span>
            <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '20px', background: '#EEEDFE', color: '#3C3489' }}>Learning: Figma, Japanese</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '9px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '19px', fontWeight: 500, color: '#3C3489' }}>{stats.trustScore} <IconStar style={{ fontSize: '13px', color: '#BA7517' }} /></div>
            <div style={{ fontSize: '11px', color: '#aaa' }}>Trust score</div>
          </div>
          <button 
            onClick={() => navigate('/app/edit-profile')} 
            style={{ fontSize: '11px', padding: '5px 13px', borderRadius: '8px', border: '1.5px solid #AFA9EC', background: '#fff', color: '#534AB7', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
          >
            Edit profile
          </button>
        </div>
      </div>

      <div className="r2" style={{ marginBottom: '12px' }}>
        {/* Linked Banks */}
        <div className="card">
          <div className="ch">
            <span className="ct">Linked bank accounts</span>
            <button className="clink" onClick={() => navigate('/app/add-bank')}>+ Add bank</button>
          </div>
          <div className="bkcard">
            <div className="bkico"><IconBuildingBank /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>HDFC Bank <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '20px', background: '#E1F5EE', color: '#085041', marginLeft: '3px' }}>Default</span></div>
              <div style={{ fontSize: '11px', color: '#888' }}>Savings · ••••1942 · IFSC HDFC0001234</div>
            </div>
            <button style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#888', cursor: 'pointer' }}>Edit</button>
          </div>
          <div className="bkcard">
            <div className="bkico" style={{ background: '#EAF3DE', color: '#3B6D11' }}><IconBuildingBank /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>State Bank of India</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Savings · ••••3587 · IFSC SBIN0005678</div>
            </div>
            <button style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#888', cursor: 'pointer' }}>Edit</button>
          </div>
        </div>

        {/* UPI QR */}
        <div className="card">
          <div className="ch"><span className="ct">UPI & payment QR</span></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '11px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#FAEEDA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', color: '#633806' }}>
              <IconQrcode />
            </div>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>{user.upi}</div>
              <div style={{ fontSize: '11px', color: '#888' }}>Linked to HDFC ••42</div>
            </div>
          </div>
          <div style={{ border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '10px', padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '7px' }}>
            <svg width="84" height="84" viewBox="0 0 84 84" xmlns="http://www.w3.org/2000/svg">
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
            <div style={{ fontSize: '11px', color: '#888', textAlign: 'center' }}>Others scan this to pay you directly</div>
            <button 
              onClick={() => triggerToast('QR image saved!')} 
              style={{ fontSize: '11px', padding: '4px 11px', borderRadius: '7px', border: '0.5px solid rgba(0,0,0,.1)', background: 'none', color: '#888', cursor: 'pointer' }}
            >
              Download QR
            </button>
          </div>
        </div>
      </div>

      <div className="r2">
        {/* Skills */}
        <div className="card">
          <div className="ch"><span className="ct">Skills I'm offering</span><button className="clink" onClick={() => navigate('/app/edit-profile')}>+ Add</button></div>
          <div className="skcard" style={{ marginBottom: '7px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span className="cpill c-code">Coding</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#0F6E56' }}>₹300/hr</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>DSA</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#BA7517' }}><IconStar /> 4.9</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '20px', background: '#E1F5EE', color: '#085041' }}>Active</span>
            </div>
          </div>
          <div className="skcard">
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span className="cpill c-code">Coding</span>
              <span style={{ fontSize: '11px', fontWeight: 500, color: '#534AB7' }}>Swap only</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>C++ basics</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ fontSize: '11px', color: '#BA7517' }}><IconStar /> 4.7</span>
              <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '20px', background: '#EEEDFE', color: '#3C3489' }}>Active</span>
            </div>
          </div>
        </div>

        {/* Earnings */}
        <div className="card">
          <div className="ch"><span className="ct">Earnings</span></div>
          <div style={{ background: '#F5F4FF', borderRadius: '7px', padding: '9px 11px', marginBottom: '7px' }}>
            <div style={{ fontSize: '11px', color: '#888' }}>Total earned</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#0F6E56' }}>₹1,200</div>
          </div>
          <div style={{ background: '#F5F4FF', borderRadius: '7px', padding: '9px 11px', marginBottom: '7px' }}>
            <div style={{ fontSize: '11px', color: '#888' }}>Withdrawn to bank</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#185FA5' }}>₹500</div>
          </div>
          <div style={{ background: '#F5F4FF', borderRadius: '7px', padding: '9px 11px' }}>
            <div style={{ fontSize: '11px', color: '#888' }}>Swaps completed</div>
            <div style={{ fontSize: '18px', fontWeight: 500, color: '#534AB7' }}>{stats.swapsDone}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
