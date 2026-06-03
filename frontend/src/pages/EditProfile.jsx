import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
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
  
  const [teachSkills, setTeachSkills] = useState(['DSA', 'C++']);
  const [learnSkills, setLearnSkills] = useState(['Figma', 'Japanese']);
  const [teachInp, setTeachInp] = useState('');
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
    { bg: '#534AB7', text: '#EEEDFE' }
  ];

  const getInitials = () => {
    if (!firstName && !lastName) return 'AK';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  };

  const handleSave = () => {
    updateProfile({
      name: `${firstName} ${lastName}`,
      college,
      year,
      branch,
      bio,
      upi,
      meta: `${year} · ${branch} · ${college}`,
      avatar: getInitials(),
      avatarImg
    });
    triggerToast('Profile updated successfully!');
    navigate('/app/profile');
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

  const addTeach = () => {
    if (teachInp && !teachSkills.includes(teachInp)) {
      setTeachSkills([...teachSkills, teachInp]);
      setTeachInp('');
    }
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

  return (
    <div id="editprofile" className="pg on">
      <button 
        onClick={() => navigate('/app/profile')} 
        style={{ fontSize: '12px', color: '#888', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '14px' }}
      >
        Back to profile
      </button>

      {/* Avatar section */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', padding: '16px', marginBottom: '11px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#222', marginBottom: '12px', display: 'flex', justifyContent: 'space-between' }}>
          <span>Profile photo &amp; avatar</span>
          {avatarImg && (
            <button onClick={handleRemovePhoto} style={{ background: 'none', border: 'none', color: '#E24B4A', fontSize: '11px', cursor: 'pointer' }}>Remove photo</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="ep-av-wrap" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleImageChange}
            />
            <div className="avr" style={{ 
              width: '64px', height: '64px', background: avatarColor.bg, color: avatarColor.text, fontSize: '22px', border: '3px solid #534AB7', flexShrink: 0,
              ...(avatarImg ? { backgroundImage: `url(${avatarImg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {})
            }}>
              {!avatarImg && getInitials()}
            </div>
            <div className="ep-av-cam">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm7-13h-1.5l-1.7-2H8.2L6.5 2.5H5A3 3 0 0 0 2 5.5v13A3 3 0 0 0 5 21.5h14a3 3 0 0 0 3-3v-13A3 3 0 0 0 19 2.5z" fill="#fff"/></svg>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px', fontWeight: 500 }}>Pick a colour</div>
            <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
              {colors.map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => setAvatarColor(c)}
                  style={{ width: '26px', height: '26px', borderRadius: '50%', background: c.bg, border: `2px solid ${avatarColor.bg === c.bg ? '#222' : 'transparent'}`, cursor: 'pointer' }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Basic info */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', padding: '16px', marginBottom: '11px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#222', marginBottom: '12px' }}>Basic information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px', marginBottom: '11px' }}>
          <div className="fld"><label>First name</label><input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
          <div className="fld"><label>Last name</label><input type="text" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
        </div>
        <div className="fld"><label>College / University</label><input type="text" value={college} onChange={e => setCollege(e.target.value)} /></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px', marginBottom: '11px' }}>
          <div className="fld">
            <label>Year</label>
            <select style={{ fontSize: '12px' }} value={year} onChange={e => setYear(e.target.value)}>
              <option>1st year</option><option>2nd year</option><option>3rd year</option><option>4th year</option>
            </select>
          </div>
          <div className="fld"><label>Branch / Department</label><input type="text" value={branch} onChange={e => setBranch(e.target.value)} /></div>
        </div>
        <div className="fld" style={{ marginBottom: 0 }}>
          <label>Bio</label>
          <textarea 
            style={{ width: '100%', padding: '9px 11px', borderRadius: '10px', border: '1.5px solid #E0DFF0', background: '#FAFAFA', fontSize: '12px', outline: 'none', fontFamily: 'inherit', resize: 'vertical', minHeight: '64px', color: '#222' }}
            value={bio} onChange={e => setBio(e.target.value)}
          ></textarea>
        </div>
      </div>

      {/* Skills */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', padding: '16px', marginBottom: '11px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#222', marginBottom: '12px' }}>Skills</div>
        
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#555', marginBottom: '6px' }}>Skills I can teach</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '7px' }}>
          {teachSkills.map(s => (
            <span key={s} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: '#EEEDFE', color: '#3C3489', border: '1px solid #AFA9EC', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {s} <button onClick={() => setTeachSkills(teachSkills.filter(ts => ts !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#534AB7', fontSize: '13px', lineHeight: 1, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '7px', marginBottom: '13px' }}>
          <input type="text" placeholder="Add a skill you teach…" value={teachInp} onChange={e => setTeachInp(e.target.value)} onKeyPress={e => e.key === 'Enter' && addTeach()} style={{ flex: 1, padding: '8px 11px', borderRadius: '10px', border: '1.5px solid #E0DFF0', background: '#FAFAFA', fontSize: '12px', outline: 'none' }}/>
          <button onClick={addTeach} style={{ padding: '8px 13px', borderRadius: '10px', border: 'none', background: '#534AB7', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>Add</button>
        </div>
        
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#555', marginBottom: '6px' }}>Skills I want to learn</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '7px' }}>
          {learnSkills.map(s => (
            <span key={s} style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: '#EEEDFE', color: '#3C3489', border: '1px solid #AFA9EC', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {s} <button onClick={() => setLearnSkills(learnSkills.filter(ls => ls !== s))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#534AB7', fontSize: '13px', lineHeight: 1, padding: 0 }}>×</button>
            </span>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '7px' }}>
          <input type="text" placeholder="Add a skill you want to learn…" value={learnInp} onChange={e => setLearnInp(e.target.value)} onKeyPress={e => e.key === 'Enter' && addLearn()} style={{ flex: 1, padding: '8px 11px', borderRadius: '10px', border: '1.5px solid #E0DFF0', background: '#FAFAFA', fontSize: '12px', outline: 'none' }}/>
          <button onClick={addLearn} style={{ padding: '8px 13px', borderRadius: '10px', border: 'none', background: '#534AB7', color: '#fff', fontSize: '12px', cursor: 'pointer', fontWeight: 500, whiteSpace: 'nowrap' }}>Add</button>
        </div>
      </div>

      {/* Availability */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', padding: '16px', marginBottom: '11px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#222', marginBottom: '12px' }}>Availability &amp; preferences</div>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#555', marginBottom: '7px' }}>When are you free?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '13px' }}>
          {['Weekday mornings', 'Weekday evenings', 'Weekend mornings', 'Weekend afternoons', 'Weekends anytime', 'Flexible / on-demand'].map(opt => (
            <div key={opt} className={`avail-opt ${availability.includes(opt) ? 'on' : ''}`} onClick={() => toggleAvail(opt)}>{opt}</div>
          ))}
        </div>
        <div style={{ fontSize: '11px', fontWeight: 500, color: '#555', marginBottom: '7px' }}>Session mode preference</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px' }}>
          {['Online', 'In-person', 'Either'].map(opt => (
            <div key={opt} className={`avail-opt ${mode === opt ? 'on' : ''}`} onClick={() => setMode(opt)}>{opt}</div>
          ))}
        </div>
      </div>

      {/* UPI */}
      <div style={{ background: '#fff', border: '0.5px solid rgba(0,0,0,.08)', borderRadius: '11px', padding: '16px', marginBottom: '11px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#222', marginBottom: '12px' }}>UPI &amp; payment</div>
        <div className="fld" style={{ marginBottom: 0 }}>
          <label>UPI ID</label>
          <input type="text" value={upi} onChange={e => setUpi(e.target.value)} placeholder="yourname@upi" />
        </div>
      </div>

      {/* Save / Cancel */}
      <div style={{ display: 'flex', gap: '9px', marginBottom: '4px' }}>
        <button onClick={handleSave} style={{ flex: 1, padding: '12px', borderRadius: '11px', border: 'none', background: '#534AB7', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
          <IconCheck style={{ fontSize: '13px', verticalAlign: '-1px' }} /> Save changes
        </button>
        <button onClick={() => navigate('/app/profile')} style={{ padding: '12px 20px', borderRadius: '11px', border: '1.5px solid #E0DFF0', background: '#fff', color: '#555', fontSize: '13px', cursor: 'pointer' }}>Cancel</button>
      </div>
    </div>
  );
};

export default EditProfile;
