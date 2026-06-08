import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { IconCheck } from '@tabler/icons-react';

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const { triggerToast } = useAppData();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || '');
  const [college, setCollege] = useState(user?.college || 'PESU Bengaluru');
  const [year, setYear] = useState(user?.year || '3rd year');
  const [branch, setBranch] = useState(user?.branch || 'CSE');
  const [bio, setBio] = useState(user?.bio || '');
  const [upi, setUpi] = useState(user?.upi || 'arjunkumar@upi');
  const [avatarImg, setAvatarImg] = useState(user?.avatarImg || null);
  const fileInputRef = useRef(null);
  
  const [learnSkills, setLearnSkills] = useState(user?.topicsWanted || []);
  const [learnInp, setLearnInp] = useState('');

  const [availability, setAvailability] = useState(['Weekday mornings', 'Weekend mornings', 'Weekends anytime']);
  const [mode, setMode] = useState('Online');

  const [avatarColor, setAvatarColor] = useState({ bg: '#EEEDFE', text: '#3C3489' });

  const colors = [
    { bg: '#EEEDFE', text: '#3C3489' },
    { bg: '#E6F1FB', text: '#0C447C' },
    { bg: '#EAF3DE', text: '#27500A' },
    { bg: '#FAEEDA', text: '#633806' },
    { bg: '#FBEAF0', text: '#72243E' },
    { bg: '#1d4ed8', text: '#eff6ff' }
  ];

  const getInitials = () => {
    if (!firstName && !lastName) return 'AK';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        name: `${firstName} ${lastName}`,
        college,
        year,
        branch,
        bio,
        upi,
        topicsOffered: user?.topicsOffered || [],
        topicsWanted: learnSkills,
        avatarImg
      });
      triggerToast('Profile updated successfully!');
      navigate('/app/profile');
    } catch (err) {
      triggerToast('Failed to update profile');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setAvatarImg(null);
  };

  const addLearn = () => {
    if (learnInp && !learnSkills.includes(learnInp)) {
      setLearnSkills([...learnSkills, learnInp]);
      setLearnInp('');
    }
  };

  const toggleAvail = (opt) => {
    if (availability.includes(opt)) {
      setAvailability(availability.filter(a => a !== opt));
    } else {
      setAvailability([...availability, opt]);
    }
  };

  const inputStyle = { width: '100%', padding: '10px 14px', borderRadius: 'var(--cs-radius-md)', border: '1px solid var(--cs-border)', background: 'var(--cs-bg-light)', fontSize: '14px', color: 'var(--cs-text-main)', outline: 'none', transition: 'border-color 0.2s' };
  const labelStyle = { display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)', marginBottom: '6px' };

  return (
    <div id="editprofile" className="pg on" style={{ padding: '24px', background: 'var(--cs-bg-light)', minHeight: '100vh', width: '100%' }}>
      <button 
        onClick={() => navigate('/app/profile')} 
        style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontWeight: 500 }}
      >
        ← Back to profile
      </button>

      {/* Avatar section */}
      <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Profile photo &amp; avatar</span>
          {avatarImg && (
            <button onClick={handleRemovePhoto} style={{ background: 'none', border: 'none', color: '#E24B4A', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>Remove photo</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div className="ep-av-wrap" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleImageChange}
            />
            <div style={{ 
              width: '80px', height: '80px', borderRadius: '50%', background: avatarColor.bg, color: avatarColor.text, fontSize: '28px', border: '3px solid var(--cs-primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
              ...(avatarImg ? { backgroundImage: `url(${avatarImg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {})
            }}>
              {!avatarImg && getInitials()}
            </div>
            <div style={{ position: 'absolute', bottom: '0', right: '0', width: '24px', height: '24px', background: 'var(--cs-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--cs-bg-white)' }}>
              <svg viewBox="0 0 24 24" width="12" height="12" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm7-13h-1.5l-1.7-2H8.2L6.5 2.5H5A3 3 0 0 0 2 5.5v13A3 3 0 0 0 5 21.5h14a3 3 0 0 0 3-3v-13A3 3 0 0 0 19 2.5z" fill="#fff"/></svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', marginBottom: '12px', fontWeight: 500 }}>Pick a colour</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {colors.map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => setAvatarColor(c)}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: c.bg, border: `2px solid ${avatarColor.bg === c.bg ? 'var(--cs-text-main)' : 'transparent'}`, cursor: 'pointer', transition: 'border-color 0.2s' }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '20px' }}>Basic information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={labelStyle}>First name</label><input style={inputStyle} type="text" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
          <div><label style={labelStyle}>Last name</label><input style={inputStyle} type="text" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: '16px' }}><label style={labelStyle}>College / University</label><input style={inputStyle} type="text" value={college} onChange={e => setCollege(e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Year</label>
            <select style={{ ...inputStyle, cursor: 'pointer' }} value={year} onChange={e => setYear(e.target.value)}>
              <option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option>
            </select>
          </div>
          <div><label style={labelStyle}>Branch / Department</label><input style={inputStyle} type="text" value={branch} onChange={e => setBranch(e.target.value)} /></div>
        </div>
        <div>
          <label style={labelStyle}>Bio</label>
          <textarea 
            style={{ ...inputStyle, resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
            value={bio} onChange={e => setBio(e.target.value)}
          ></textarea>
        </div>
      </div>

      {/* Skills */}
      <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '24px' }}>Learning Interests</div>

        
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-text-inactive)', marginBottom: '12px' }}>Skills I want to learn</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {learnSkills.map(s => (
            <span key={s} style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '20px', background: 'var(--cs-primary-light)', color: 'var(--cs-primary)', border: '1px solid var(--cs-primary-light)', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500 }}>
              {s} <button onClick={() => setLearnSkills(learnSkills.filter(ls => ls !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--cs-primary)', fontSize: '16px', lineHeight: 1, padding: 0 }}>&times;</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <input type="text" placeholder="Add a skill you want to learn…" value={learnInp} onChange={e => setLearnInp(e.target.value)} onKeyPress={e => e.key === 'Enter' && addLearn()} style={inputStyle}/>
          <button onClick={addLearn} style={{ padding: '0 20px', borderRadius: '100px', border: 'none', background: 'var(--cs-primary)', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 700, whiteSpace: 'nowrap' }}>Add</button>
        </div>
      </div>

      {/* Availability */}
      <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '20px' }}>Availability &amp; preferences</div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-text-inactive)', marginBottom: '12px' }}>When are you free?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px', marginBottom: '24px' }}>
          {['Weekday mornings', 'Weekday evenings', 'Weekend mornings', 'Weekend afternoons', 'Weekends anytime', 'Flexible / on-demand'].map(opt => (
            <div key={opt} 
                 onClick={() => toggleAvail(opt)}
                 style={{ padding: '12px', borderRadius: 'var(--cs-radius-md)', border: `1px solid ${availability.includes(opt) ? 'var(--cs-primary)' : 'var(--cs-border)'}`, background: availability.includes(opt) ? 'var(--cs-primary-light)' : 'var(--cs-bg-light)', color: availability.includes(opt) ? 'var(--cs-primary)' : 'var(--cs-text-main)', fontSize: '13px', fontWeight: 500, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              {opt}
            </div>
          ))}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-text-inactive)', marginBottom: '12px' }}>Session mode preference</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
          {['Online', 'In-person', 'Either'].map(opt => (
            <div key={opt} 
                 onClick={() => setMode(opt)}
                 style={{ padding: '12px', borderRadius: 'var(--cs-radius-md)', border: `1px solid ${mode === opt ? 'var(--cs-primary)' : 'var(--cs-border)'}`, background: mode === opt ? 'var(--cs-primary-light)' : 'var(--cs-bg-light)', color: mode === opt ? 'var(--cs-primary)' : 'var(--cs-text-main)', fontSize: '13px', fontWeight: 500, textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}>
              {opt}
            </div>
          ))}
        </div>
      </div>

      {/* UPI */}
      <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '20px' }}>UPI &amp; payment</div>
        <div>
          <label style={labelStyle}>UPI ID</label>
          <input style={inputStyle} type="text" value={upi} onChange={e => setUpi(e.target.value)} placeholder="yourname@upi" />
        </div>
      </div>

      {/* Save / Cancel */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button onClick={handleSave} style={{ flex: 1, padding: '14px', borderRadius: '100px', border: 'none', background: 'var(--cs-primary)', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <IconCheck size={18} /> Save changes
        </button>
        <button onClick={() => navigate('/app/profile')} style={{ padding: '14px 24px', borderRadius: '100px', border: '1px solid var(--cs-border)', background: 'var(--cs-bg-white)', color: 'var(--cs-text-main)', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EditProfile;
