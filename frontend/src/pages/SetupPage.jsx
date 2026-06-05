import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconArrowLeft, IconSchool } from '@tabler/icons-react';

const SetupPage = () => {
  const [step, setStep] = useState(1);
  const [highestStep, setHighestStep] = useState(1);
  const navigate = useNavigate();
  const { register, updateProfile } = useAuth();

  // Step 1 states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [year, setYear] = useState('3rd year');
  const [branch, setBranch] = useState('CSE');
  const [college, setCollege] = useState('PESU Bengaluru');
  const [bio, setBio] = useState('');
  const [upi, setUpi] = useState('');
  const [avatarColor, setAvatarColor] = useState({ bg: '#EEEDFE', text: '#3C3489' });
  const [avatarImg, setAvatarImg] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  // Step 2 states
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');
  const [experience, setExperience] = useState('Intermediate');
  const [interests, setInterests] = useState('');
  const [category, setCategory] = useState('Technology');

  // Step 3 states
  const [availability, setAvailability] = useState(['Mon–Fri evenings', 'Weekend mornings']);
  const [prefTime, setPrefTime] = useState('Evening (5PM - 9PM)');
  const [sessionPref, setSessionPref] = useState('Online (Google Meet)');
  const [exchangePref, setExchangePref] = useState('Skill swap');

  const getInitials = () => {
    if (!firstName && !lastName) return 'AK';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validate Step 1 before proceeding
    if (step === 1) {
      if (!email.trim().toLowerCase().endsWith('@kristujayanti.com')) {
        setError('Only University emal adresses are allowed.');
        return;
      }
      if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
      }
    }

    if (step < 3) {
      setStep(step + 1);
      setHighestStep(h => Math.max(h, step + 1));
      window.scrollTo(0,0);
    } else {
      handleFinish();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    try {
      setError('');
      const displayName = `${firstName} ${lastName}`.trim();
      
      // Create user account via Auth V2
      await register(email, password, displayName);
      
      // Update profile with onboarding data via Profile Phase 1
      await updateProfile({
        year, 
        branch, 
        college, 
        bio, 
        upi,
        topicsOffered: teachSkills, 
        topicsWanted: learnSkills,
        avatarImg: avatarImg
      });
      
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Setup failed');
      // If setup fails, stay on page and show error
      if (err.message.includes('Email already exists')) {
        setStep(1); // Go back to step 1 to fix email
      }
    }
  };

  const addTeachSkill = (skill) => {
    if (skill && !teachSkills.includes(skill)) setTeachSkills([...teachSkills, skill]);
    setTeachInput('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarImg(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeTeachSkill = (skill) => {
    setTeachSkills(teachSkills.filter(s => s !== skill));
  };

  const addLearnSkill = (skill) => {
    if (skill && !learnSkills.includes(skill)) setLearnSkills([...learnSkills, skill]);
    setLearnInput('');
  };

  const removeLearnSkill = (skill) => {
    setLearnSkills(learnSkills.filter(s => s !== skill));
  };

  const toggleAvailability = (opt) => {
    if (availability.includes(opt)) {
      setAvailability(availability.filter(a => a !== opt));
    } else {
      setAvailability([...availability, opt]);
    }
  };

  const colors = [
    { bg: '#EEEDFE', text: '#3C3489' },
    { bg: '#E6F1FB', text: '#0C447C' },
    { bg: '#EAF3DE', text: '#27500A' },
    { bg: '#FAEEDA', text: '#633806' },
    { bg: '#FBEAF0', text: '#72243E' },
    { bg: '#534AB7', text: '#EEEDFE' },
  ];

  const availOptions = [
    'Mon–Fri evenings', 'Weekend mornings', 'Weekend afternoons',
    'Weekday afternoons', 'Anytime flexible', 'By appointment'
  ];

  return (
    <div id="setup" className="auth-page" style={{ flexDirection: 'column', padding: '48px 16px', justifyContent: 'flex-start', backgroundColor: '#f5f3ff' }}>
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      
      {step === 1 && (
        <button 
          type="button"
          onClick={() => navigate('/login')}
          style={{ position: 'absolute', top: '32px', left: '32px', background: 'none', border: 'none', display: 'flex', alignItems: 'center', gap: '6px', color: '#4b5563', fontSize: '14px', fontWeight: 500, cursor: 'pointer', zIndex: 10 }}
        >
          <IconArrowLeft size={18} /> Back to Login
        </button>
      )}

      {/* HEADER & STEPS OUTSIDE CARD */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '850px', margin: '0 auto 24px', zIndex: 2 }}>
        <div className="setup-logo" style={{ marginBottom: '16px' }}>
          <div className="setup-mark" style={{ borderRadius: '50%', background: 'transparent', width: '36px', height: '36px', padding: 0 }}>
            <img src="/src/assets/kju_campus_logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <IconSchool size={28} color="#534AB7" style={{ display: 'none', margin: 'auto' }} />
          </div>
          <div className="setup-brand" style={{ fontSize: '18px' }}>campus<span>skills</span></div>
        </div>
        <div className="setup-hdr">
          <div className="setup-title" style={{ color: '#1e1b4b', fontSize: '24px' }}>Set up your profile</div>
          <div className="setup-sub" style={{ color: '#6b7280' }}>Tell us about yourself to get matched with the right people</div>
        </div>

        {/* Step indicator */}
        <div className="step-prog-wrap" id="step-prog" style={{ width: '100%', maxWidth: '850px', margin: '32px 0 16px' }}>
          <div className="spw-item" onClick={() => highestStep >= 1 && setStep(1)} style={{ cursor: highestStep >= 1 ? 'pointer' : 'default' }}>
            <div className="spw-top">
              <div className="spw-line hidden"></div>
              <div className={`sp-dot ${step === 1 ? 'active' : 'done'}`}>1</div>
              <div className={`spw-line ${step > 1 ? 'done' : ''}`}></div>
            </div>
            <div className="sp-lbl">About you</div>
          </div>
          <div className="spw-item" onClick={() => highestStep >= 2 && setStep(2)} style={{ cursor: highestStep >= 2 ? 'pointer' : 'default' }}>
            <div className="spw-top">
              <div className={`spw-line ${step > 1 ? 'done' : ''}`}></div>
              <div className={`sp-dot ${step === 2 ? 'active' : (step > 2 ? 'done' : 'idle')}`}>2</div>
              <div className={`spw-line ${step > 2 ? 'done' : ''}`}></div>
            </div>
            <div className="sp-lbl">Your skills</div>
          </div>
          <div className="spw-item" onClick={() => highestStep >= 3 && setStep(3)} style={{ cursor: highestStep >= 3 ? 'pointer' : 'default' }}>
            <div className="spw-top">
              <div className={`spw-line ${step > 2 ? 'done' : ''}`}></div>
              <div className={`sp-dot ${step === 3 ? 'active' : 'idle'}`}>3</div>
              <div className="spw-line hidden"></div>
            </div>
            <div className="sp-lbl">Availability</div>
          </div>
        </div>
      </div>

      <div className="setup-card fade-in" style={{ width: '100%', maxWidth: '600px', margin: '0 auto', zIndex: 2, padding: '40px 48px' }}>
        <form onSubmit={handleNext}>
          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="setup-step on">
              <div>
                <div className="ch" style={{ marginBottom: '24px' }}>
                  <span className="ct" style={{ fontSize: '16px', color: '#111827', fontWeight: 700 }}>Create your account</span>
                </div>

                <div className="form-grid" style={{ marginBottom: '24px' }}>
                  <div className="sfld">
                    <label>Email *</label>
                    <input type="email" placeholder="yourname@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="sfld">
                    <label>Password *</label>
                    <input type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>

                <div style={{ height: '1px', background: '#e5e7eb', margin: '32px 0' }}></div>

                <div className="ch" style={{ marginBottom: '24px' }}>
                  <span className="ct" style={{ fontSize: '16px', color: '#111827', fontWeight: 700 }}>Basic information</span>
                </div>
                
                <div className="avatar-pick" style={{ marginBottom: '32px' }}>
                  <div className="av-wrap" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', width: '64px', height: '64px' }}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                    <div className="av-big" style={{ 
                      width: '64px', height: '64px', fontSize: '24px',
                      background: avatarColor.bg, color: avatarColor.text,
                      ...(avatarImg ? { backgroundImage: `url(${avatarImg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {})
                    }}>
                      {!avatarImg && getInitials()}
                    </div>
                    <div className="av-cam" style={{ width: '24px', height: '24px', bottom: '-4px', right: '-4px' }}>
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ width: '12px', height: '12px' }}><path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm7-13h-1.5l-1.7-2H8.2L6.5 2.5H5A3 3 0 0 0 2 5.5v13A3 3 0 0 0 5 21.5h14a3 3 0 0 0 3-3v-13A3 3 0 0 0 19 2.5z" fill="#fff"/></svg>
                    </div>
                  </div>
                  <div style={{ marginLeft: '12px' }}>
                    <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Choose avatar colour</span>
                      {avatarImg && (
                        <button type="button" onClick={(e) => { 
                          e.stopPropagation(); 
                          setAvatarImg(null); 
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }} style={{ background: 'none', border: 'none', color: '#E24B4A', fontSize: '12px', cursor: 'pointer', padding: 0 }}>Remove</button>
                      )}
                    </div>
                    <div className="av-colors">
                      {colors.map((c, i) => (
                        <div 
                          key={i}
                          className={`av-col ${avatarColor.bg === c.bg ? 'on' : ''}`} 
                          style={{ background: c.bg, borderColor: avatarColor.bg === c.bg ? '#534AB7' : 'transparent', width: '28px', height: '28px' }} 
                          onClick={() => setAvatarColor(c)}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '20px' }}>
                  <div className="sfld">
                    <label>First name *</label>
                    <input type="text" placeholder="Arjun" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="sfld">
                    <label>Last name *</label>
                    <input type="text" placeholder="Kumar" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="form-grid" style={{ marginBottom: '20px' }}>
                  <div className="sfld">
                    <label>Year *</label>
                    <select value={year} onChange={e => setYear(e.target.value)} required>
                      <option value="">Select year</option>
                      <option>1st year</option>
                      <option>2nd year</option>
                      <option>3rd year</option>
                      <option>4th year</option>
                    </select>
                  </div>
                  <div className="sfld">
                    <label>Branch *</label>
                    <select value={branch} onChange={e => setBranch(e.target.value)} required>
                      <option value="">Select branch</option>
                      <option>CSE</option>
                      <option>ECE</option>
                      <option>Mechanical</option>
                      <option>Civil</option>
                      <option>MBA</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div className="sfld" style={{ marginBottom: '20px' }}>
                  <label>College *</label>
                  <select value={college} onChange={e => setCollege(e.target.value)} required>
                    <option value="">Select your college</option>
                    <option>PESU Bengaluru</option>
                    <option>RVCE Bengaluru</option>
                    <option>BMS College</option>
                    <option>MSRIT</option>
                    <option>NIT Karnataka</option>
                    <option>Other</option>
                  </select>
                </div>

                <div className="sfld" style={{ marginBottom: '32px' }}>
                  <label>Bio (optional)</label>
                  <textarea placeholder="Tell others what you're passionate about..." value={bio} onChange={e => setBio(e.target.value)}></textarea>
                </div>

              </div>
              {error && <div style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '16px', background: '#FBEAF0', padding: '10px 14px', borderRadius: '8px', fontWeight: 500 }}>{error}</div>}
              <button type="submit" className="sbtn" style={{ padding: '16px', borderRadius: '12px', fontSize: '16px' }}>Continue</button>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="fade-in">
              <div style={{ marginBottom: '32px' }}>
                <div className="ch"><span className="ct">Skills you can teach</span></div>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Add skills you're confident in and can help others learn</p>
                <div className="skill-tags">
                  {teachSkills.map(s => (
                    <span key={s} className="stag">
                      {s} <button type="button" onClick={() => removeTeachSkill(s)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="skill-input-row">
                  <input type="text" placeholder="e.g. Python, Figma, Guitar..." value={teachInput} onChange={e => setTeachInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTeachSkill(teachInput))} />
                  <button type="button" className="skill-add-btn" onClick={() => addTeachSkill(teachInput)}>Add</button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '9px' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>Suggestions:</span>
                  {['Python', 'DSA', 'Figma', 'Guitar', 'React'].map(s => (
                    <span key={s} onClick={() => addTeachSkill(s)} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: '#F5F4FF', color: '#534AB7', cursor: 'pointer', border: '1px solid #E0DFF0' }}>{s}</span>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div className="ch"><span className="ct">Skills you want to learn</span></div>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Tell others what you're looking to pick up</p>
                <div className="skill-tags">
                  {learnSkills.map(s => (
                    <span key={s} className="stag">
                      {s} <button type="button" onClick={() => removeLearnSkill(s)}>×</button>
                    </span>
                  ))}
                </div>
                <div className="skill-input-row">
                  <input type="text" placeholder="e.g. Japanese, Machine Learning..." value={learnInput} onChange={e => setLearnInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addLearnSkill(learnInput))} />
                  <button type="button" className="skill-add-btn" onClick={() => addLearnSkill(learnInput)}>Add</button>
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '9px' }}>
                  <span style={{ fontSize: '11px', color: '#888' }}>Suggestions:</span>
                  {['Japanese', 'Figma', 'ML', 'Finance'].map(s => (
                    <span key={s} onClick={() => addLearnSkill(s)} style={{ fontSize: '11px', padding: '3px 9px', borderRadius: '20px', background: '#F5F4FF', color: '#534AB7', cursor: 'pointer', border: '1px solid #E0DFF0' }}>{s}</span>
                  ))}
                </div>
              </div>

              <div className="form-grid" style={{ marginBottom: '24px' }}>
                <div className="sfld">
                  <label>Experience Level *</label>
                  <select value={experience} onChange={e => setExperience(e.target.value)} required>
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Expert</option>
                  </select>
                </div>
                <div className="sfld">
                  <label>Categories *</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} required>
                    <option>Technology</option>
                    <option>Design</option>
                    <option>Business</option>
                    <option>Languages</option>
                    <option>Music & Arts</option>
                  </select>
                </div>
              </div>
              
              <div className="sfld" style={{ marginBottom: '32px' }}>
                <label>Other Interests <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                <input type="text" placeholder="e.g. Photography, Hiking..." value={interests} onChange={e => setInterests(e.target.value)} />
              </div>

              {error && <div style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '16px', background: '#FBEAF0', padding: '10px 14px', borderRadius: '8px', fontWeight: 500 }}>{error}</div>}
              <div className="sbtn-row">
                <button type="button" className="sbtn-back" onClick={handleBack}>Back</button>
                <button type="submit" className="sbtn">Continue</button>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="fade-in">
              <div style={{ marginBottom: '32px' }}>
                <div className="ch"><span className="ct">When are you free?</span></div>
                <p style={{ fontSize: '12px', color: '#888', marginBottom: '12px' }}>Help others know when to book sessions with you</p>
                <div className="avail-grid">
                  {availOptions.map(opt => (
                    <div key={opt} className={`avail-opt ${availability.includes(opt) ? 'on' : ''}`} onClick={() => toggleAvailability(opt)}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="form-grid" style={{ marginBottom: '24px' }}>
                <div className="sfld" style={{ marginBottom: 0 }}>
                  <label>Preferred Time *</label>
                  <select value={prefTime} onChange={e => setPrefTime(e.target.value)} required>
                    <option>Morning (8AM - 12PM)</option>
                    <option>Afternoon (12PM - 5PM)</option>
                    <option>Evening (5PM - 9PM)</option>
                    <option>Night (9PM onwards)</option>
                  </select>
                </div>
                <div className="sfld" style={{ marginBottom: 0 }}>
                  <label>Session Mode *</label>
                  <select value={sessionPref} onChange={e => setSessionPref(e.target.value)} required>
                    <option>Online (Google Meet)</option>
                    <option>In-person on campus</option>
                    <option>Either works</option>
                  </select>
                </div>
              </div>

              <div className="sfld" style={{ marginBottom: '20px' }}>
                <div className="ch"><span className="ct">Exchange preference</span></div>
                <div className="avail-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {['Skill swap', 'Paid (₹/hr)', 'Both'].map(opt => (
                    <div key={opt} className={`avail-opt ${exchangePref === opt ? 'on' : ''}`} onClick={() => setExchangePref(opt)}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="sfld" style={{ marginBottom: '24px' }}>
                <label>Bio <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                <textarea placeholder="Tell others what you're passionate about..." value={bio} onChange={e => setBio(e.target.value)}></textarea>
              </div>

              <div className="sfld" style={{ marginBottom: '32px' }}>
                <label>UPI ID <span style={{ color: '#aaa', fontWeight: 400 }}>(for payments)</span></label>
                <input type="text" placeholder="yourname@upi" value={upi} onChange={e => setUpi(e.target.value)} />
              </div>

              {error && <div style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '16px', background: '#FBEAF0', padding: '10px 14px', borderRadius: '8px', fontWeight: 500 }}>{error}</div>}
              <div className="sbtn-row">
                <button type="button" className="sbtn-back" onClick={handleBack}>Back</button>
                <button type="submit" className="sbtn">Go to Dashboard</button>
              </div>
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button type="button" onClick={handleFinish} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#aaa', cursor: 'pointer', textDecoration: 'underline' }}>
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default SetupPage;
