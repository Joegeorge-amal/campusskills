import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

const SetupPage = () => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

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
  const fileInputRef = useRef(null);

  // Step 2 states
  const [teachSkills, setTeachSkills] = useState([]);
  const [learnSkills, setLearnSkills] = useState([]);
  const [teachInput, setTeachInput] = useState('');
  const [learnInput, setLearnInput] = useState('');

  // Step 3 states
  const [availability, setAvailability] = useState(['Mon–Fri evenings', 'Weekend mornings', 'Anytime flexible']);
  const [sessionPref, setSessionPref] = useState('Online (Google Meet)');
  const [exchangePref, setExchangePref] = useState('Skill swap');

  const getInitials = () => {
    if (!firstName && !lastName) return 'AK';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    if (step < 3) setStep(step + 1);
    else handleFinish();
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setError('');
    setIsLoading(true);
    try {
      const displayName = `${firstName} ${lastName}`.trim();
      await register(email, password, displayName);
      
      // Map frontend fields to backend SkillProfile array format
      const skillsOffered = teachSkills.map(s => ({ name: s, level: 'INTERMEDIATE', isSystemSkill: false }));
      const skillsWanted = learnSkills.map(s => ({ name: s, level: 'BEGINNER', isSystemSkill: false }));

      // Persist onboarding profile data
      await profileService.updateMe({
        bio,
        year,
        department: branch,
        profilePicture: avatarImg || JSON.stringify(avatarColor),
        skillsOffered,
        skillsWanted
      });

      // Successfully authenticated and profile persisted
      navigate('/app/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
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
    <div id="setup" className="auth-page">
      <div className="bg-circle bg-circle-1"></div>
      <div className="bg-circle bg-circle-2"></div>
      
      <div className="setup-card fade-in">
          <div className="setup-logo">
            <div className="setup-mark">cs</div>
            <div className="setup-brand">campus<span>skills</span></div>
          </div>
        <div className="setup-hdr">
          <div className="setup-title">Set up your profile</div>
          <div className="setup-sub">Tell us about yourself to get matched with the right people</div>
        </div>

        {/* Step indicator */}
        <div className="step-prog-wrap" id="step-prog">
          <div className="spw-item">
            <div className="spw-top">
              <div className="spw-line hidden"></div>
              <div className={`sp-dot ${step === 1 ? 'active' : 'done'}`}>1</div>
              <div className={`spw-line ${step > 1 ? 'done' : ''}`}></div>
            </div>
            <div className="sp-lbl">About you</div>
          </div>
          <div className="spw-item">
            <div className="spw-top">
              <div className={`spw-line ${step > 1 ? 'done' : ''}`}></div>
              <div className={`sp-dot ${step === 2 ? 'active' : (step > 2 ? 'done' : 'idle')}`}>2</div>
              <div className={`spw-line ${step > 2 ? 'done' : ''}`}></div>
            </div>
            <div className="sp-lbl">Your skills</div>
          </div>
          <div className="spw-item">
            <div className="spw-top">
              <div className={`spw-line ${step > 2 ? 'done' : ''}`}></div>
              <div className={`sp-dot ${step === 3 ? 'active' : 'idle'}`}>3</div>
              <div className="spw-line hidden"></div>
            </div>
            <div className="sp-lbl">Availability</div>
          </div>
        </div>

        <form onSubmit={handleNext}>
          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="setup-step on">
              <div>
                <div className="ch"><span className="ct">Create your account</span></div>
                <div className="form-grid">
                  <div className="sfld">
                    <label>Email *</label>
                    <input type="email" placeholder="yourname@college.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="sfld">
                    <label>Password *</label>
                    <input type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>
                <div style={{ height: '1px', background: '#E8E7F5', margin: '4px 0 16px' }}></div>
                <div className="ch"><span className="ct">Basic information</span></div>
                
                <div className="avatar-pick">
                  <div className="av-wrap" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                    <div className="av-big" style={{ 
                      background: avatarColor.bg, color: avatarColor.text,
                      ...(avatarImg ? { backgroundImage: `url(${avatarImg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {})
                    }}>
                      {!avatarImg && getInitials()}
                    </div>
                    <div className="av-cam">
                      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm7-13h-1.5l-1.7-2H8.2L6.5 2.5H5A3 3 0 0 0 2 5.5v13A3 3 0 0 0 5 21.5h14a3 3 0 0 0 3-3v-13A3 3 0 0 0 19 2.5z" fill="#fff"/></svg>
                    </div>
                  </div>
                  <div>
                    <div style={{ fontSize: '12px', color: '#555', marginBottom: '8px', fontWeight: 500, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Choose avatar colour</span>
                      {avatarImg && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); setAvatarImg(null); }} style={{ background: 'none', border: 'none', color: '#E24B4A', fontSize: '11px', cursor: 'pointer', padding: 0 }}>Remove</button>
                      )}
                    </div>
                    <div className="av-colors">
                      {colors.map((c, i) => (
                        <div 
                          key={i}
                          className={`av-col ${avatarColor.bg === c.bg ? 'on' : ''}`} 
                          style={{ background: c.bg, borderColor: avatarColor.bg === c.bg ? '#534AB7' : 'transparent' }} 
                          onClick={() => setAvatarColor(c)}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="sfld">
                    <label>First name *</label>
                    <input type="text" placeholder="Arjun" value={firstName} onChange={e => setFirstName(e.target.value)} required />
                  </div>
                  <div className="sfld">
                    <label>Last name *</label>
                    <input type="text" placeholder="Kumar" value={lastName} onChange={e => setLastName(e.target.value)} required />
                  </div>
                </div>

                <div className="form-grid">
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

                <div className="sfld">
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

                <div className="sfld">
                  <label>Bio <span style={{ color: '#aaa', fontWeight: 400 }}>(optional)</span></label>
                  <textarea placeholder="Tell others what you're passionate about..." value={bio} onChange={e => setBio(e.target.value)}></textarea>
                </div>

                <div className="sfld" style={{ marginBottom: 0 }}>
                  <label>UPI ID <span style={{ color: '#aaa', fontWeight: 400 }}>(for payments)</span></label>
                  <input type="text" placeholder="yourname@upi" value={upi} onChange={e => setUpi(e.target.value)} />
                </div>
              </div>
              <button type="submit" className="sbtn">Continue</button>
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

              <div style={{ marginBottom: '32px' }}>
                <div className="ch"><span className="ct">Session preference</span></div>
                <div className="avail-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  {['Online (Google Meet)', 'In-person on campus', 'Either works'].map(opt => (
                    <div key={opt} className={`avail-opt ${sessionPref === opt ? 'on' : ''}`} onClick={() => setSessionPref(opt)}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '32px' }}>
                <div className="ch"><span className="ct">Exchange preference</span></div>
                <div className="avail-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {['Skill swap', 'Paid (₹/hr)', 'Both'].map(opt => (
                    <div key={opt} className={`avail-opt ${exchangePref === opt ? 'on' : ''}`} onClick={() => setExchangePref(opt)}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="sbtn-row">
                <button type="button" className="sbtn-back" onClick={handleBack} disabled={isLoading}>Back</button>
                <button type="submit" className="sbtn" disabled={isLoading}>
                  {isLoading ? 'Creating Account...' : 'Go to Dashboard'}
                </button>
              </div>
              
              {error && (
                <div style={{ color: '#E24B4A', background: '#FCECEC', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginTop: '16px', textAlign: 'center', border: '1px solid #F8D0D0' }}>
                  {error}
                </div>
              )}

              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <button type="button" onClick={handleFinish} disabled={isLoading} style={{ background: 'none', border: 'none', fontSize: '12px', color: '#aaa', cursor: 'pointer', textDecoration: 'underline' }}>
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
