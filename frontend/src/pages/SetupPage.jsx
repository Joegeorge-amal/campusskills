import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { IconArrowLeft, IconSchool } from '@tabler/icons-react';
import { getTopics } from '../services/topicService';
import AutocompleteInput from '../components/AutocompleteInput';
import OtpVerificationModal from '../components/modals/OtpVerificationModal';
import { APP_CONFIG } from '../config';

const SetupPage = () => {
  const [initData] = useState(() => {
    try {
      const saved = localStorage.getItem('setup_form_data');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.avatarColor && data.avatarColor.bg === '#EEEDFE') {
           data.avatarColor = { bg: '#1d4ed8', text: '#EEEDFE' };
        }
        return data;
      }
      return {};
    } catch(e) { return {}; }
  });

  const [step, setStep] = useState(initData.step || 1);
  const [highestStep, setHighestStep] = useState(initData.highestStep || 1);
  const navigate = useNavigate();
  const { register, login, updateProfile } = useAuth();

  // Step 1 states
  const [email, setEmail] = useState(initData.email || '');
  const [password, setPassword] = useState(initData.password || '');
  const [firstName, setFirstName] = useState(initData.firstName || '');
  const [lastName, setLastName] = useState(initData.lastName || '');
  const [countryCode, setCountryCode] = useState(initData.countryCode || '+91');
  const [phoneNumber, setPhoneNumber] = useState(initData.phoneNumber || '');
  const [year, setYear] = useState(initData.year || '');
  const [programme, setProgramme] = useState(initData.programme || '');
  const [bio, setBio] = useState(initData.bio || '');
  const [upi, setUpi] = useState(initData.upi || '');
  const [avatarColor, setAvatarColor] = useState(initData.avatarColor || { bg: '#1d4ed8', text: '#EEEDFE' });
  const [avatarImg, setAvatarImg] = useState(initData.avatarImg || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [error, setError] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const fileInputRef = useRef(null);

  // Step 2 states
  const [teachSkills, setTeachSkills] = useState(initData.teachSkills || []);
  const [learnSkills, setLearnSkills] = useState(initData.learnSkills || []);
  const [teachInput, setTeachInput] = useState(''); 
  const [learnInput, setLearnInput] = useState(''); 
  const [experience, setExperience] = useState(initData.experience || 'Beginner');
  const [category, setCategory] = useState(initData.category || 'Technology');
  const [interests, setInterests] = useState(initData.interests || '');
  const [allTopicsList, setAllTopicsList] = useState([]);

  useEffect(() => {
    if (step === 2 && allTopicsList.length === 0) {
      getTopics().then(res => {
        const topics = res?.data || res;
        if (Array.isArray(topics) && topics.length > 0) {
          setAllTopicsList(topics.map(t => t.name));
        } else {
          setAllTopicsList(['Python', 'Java', 'React', 'Figma', 'Graphic Design', 'TypeScript', 'Node.js']);
        }
      }).catch(err => {
        console.error("Failed to load topics", err);
        setAllTopicsList(['Python', 'Java', 'React', 'Figma', 'Graphic Design', 'TypeScript', 'Node.js']);
      });
    }
  }, [step, allTopicsList.length]);

  // Step 3 states
  const [availability, setAvailability] = useState(initData.availability || ['Mon–Fri evenings', 'Weekend mornings']);
  const [prefTime, setPrefTime] = useState(initData.prefTime || 'Evening (5PM - 9PM)');
  const [sessionPref, setSessionPref] = useState(initData.sessionPref || 'Online (Google Meet)');
  const [exchangePref, setExchangePref] = useState(initData.exchangePref || 'Skill swap');
  const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);

  useEffect(() => {
    const data = {
      step, highestStep, email, password, firstName, lastName, countryCode, phoneNumber, year, programme, bio, upi, avatarColor, teachSkills, learnSkills, experience, category, interests, availability, prefTime, sessionPref, exchangePref
    };
    localStorage.setItem('setup_form_data', JSON.stringify(data));
  }, [step, highestStep, email, password, firstName, lastName, countryCode, phoneNumber, year, programme, bio, upi, avatarColor, teachSkills, learnSkills, experience, category, interests, availability, prefTime, sessionPref, exchangePref]);

  const handleOtpSuccess = () => {
    localStorage.removeItem('setup_form_data');
    setIsOtpModalOpen(false);
    navigate('/app/dashboard');
  };

  const getInitials = () => {
    if (!firstName && !lastName) return 'AK';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    setError('');

    // Validate Step 1 before proceeding
    if (step === 1) {
      if (!email.trim()) {
        setError('Please enter your university username.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        setError('Please meet all password requirements.');
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    if (isFinishing) return;
    try {
      setIsFinishing(true);
      setError('');
      const name = `${firstName} ${lastName}`.trim();
      const fullEmail = `${email.trim()}${APP_CONFIG.DEFAULT_DOMAIN}`;
      
      let userData;
      try {
        userData = await register(fullEmail, password, name);
      } catch (regErr) {
        if (regErr.message && regErr.message.includes('Email already exists')) {
          try {
            userData = await login(fullEmail, password);
          } catch (loginErr) {
            throw new Error('Account exists, but login failed: ' + loginErr.message);
          }
        } else {
          throw regErr;
        }
      }
      
      let finalAvatarUrl = avatarImg;
      if (avatarFile) {
        try {
          const { imageService } = await import('../services/imageService');
          const signatureData = await imageService.getSignature('avatar');
          finalAvatarUrl = await imageService.uploadToCloudinary(avatarFile, signatureData);
        } catch (uploadErr) {
          console.error("Failed to upload avatar to Cloudinary during setup", uploadErr);
        }
      }
      
      await updateProfile({
        phoneNumber: `${countryCode} ${phoneNumber}`.trim(),
        year, 
        programme: programme, 
        bio, 
        upi,
        skillsOffered: teachSkills.map(s => ({ name: s, level: 'BEGINNER' })), 
        skillsWanted: learnSkills,
        avatarImg: finalAvatarUrl,
        avatarColor: avatarColor,
        preferredTimes: availability,
        sessionPreference: sessionPref,
        exchangePreference: exchangePref
      });
      
      if (userData && userData.emailVerified === false) {
        setIsOtpModalOpen(true);
      } else {
        localStorage.removeItem('setup_form_data');
        navigate('/app/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Setup failed');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (err.message.includes('Email already exists')) {
        setStep(1);
      }
    } finally {
      setIsFinishing(false);
    }
  };

  const addTeachSkill = (skill) => {
    if (skill && !teachSkills.includes(skill)) setTeachSkills([...teachSkills, skill]);
    setTeachInput('');
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    try {
      setIsUploadingImage(true);
      setError('');
      
      const { compressImage } = await import('../utils/imageUtils');

      const compressedFile = await compressImage(file, 512, 512, 0.8);
      
      setAvatarFile(compressedFile);
      setAvatarImg(URL.createObjectURL(compressedFile));
    } catch (err) {
      console.error('Image processing failed:', err);
      setError(err.message || 'Failed to process image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
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
    { bg: '#1d4ed8', text: '#EEEDFE' },
    { bg: '#EEEDFE', text: '#3C3489' },
    { bg: '#E6F1FB', text: '#0C447C' },
    { bg: '#EAF3DE', text: '#27500A' },
    { bg: '#FAEEDA', text: '#633806' },
    { bg: '#FBEAF0', text: '#72243E' },
  ];

  const availOptions = [
    'Mon–Fri evenings', 'Weekend mornings', 'Weekend afternoons',
    'Weekday afternoons', 'Anytime flexible', 'By appointment'
  ];

  const hasMinLen = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const allCriteriaMet = hasMinLen && hasUpper && hasNumber;

  const visibleRules = [];
  if (password.length > 0 && !allCriteriaMet) {
    visibleRules.push({ label: 'At least 8 characters', checked: hasMinLen });
    if (hasMinLen) {
      visibleRules.push({ label: 'One uppercase letter', checked: hasUpper });
      if (hasUpper) {
        visibleRules.push({ label: 'One number', checked: hasNumber });
      }
    }
  }

  const CheckItem = ({ label, checked }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: checked ? '#00d26a' : '#6b7280', marginBottom: '6px' }}>
      <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: checked ? '#e6fbf0' : '#f3f4f6', color: checked ? '#00d26a' : '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', flexShrink: 0 }}>
        ✓
      </div>
      {label}
    </div>
  );

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
          <div className="setup-mark" style={{ borderRadius: '50%', background: '#ffffff', width: '44px', height: '44px', padding: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
            <img src="/src/assets/kju_campus_logo.png" alt="logo" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '50%' }} onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='block'; }} />
            <IconSchool size={28} color="#1d4ed8" style={{ display: 'none', margin: 'auto' }} />
          </div>
          <div className="setup-brand" style={{ fontSize: '20px' }}>campus<span>skills</span></div>
        </div>
        <div className="setup-hdr">
          <div className="setup-title" style={{ color: '#1e1b4b', fontSize: '22px', marginBottom: '6px' }}>Set up your profile</div>
          <div className="setup-sub" style={{ color: '#6b7280', fontSize: '13px' }}>Tell us about yourself to get matched with the right people</div>
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
            <div className="sp-lbl">Your topics</div>
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

      <div className="fade-in" style={{ position: 'relative', width: '100%', maxWidth: '580px', margin: '0 auto', zIndex: 2 }}>
        {error && <div className="setup-error" style={{ color: '#E24B4A', fontSize: '13px', marginBottom: '24px', background: '#FBEAF0', padding: '12px 16px', borderRadius: '8px', fontWeight: 500, border: '1px solid #f9d0e0' }}>{error}</div>}
        <form onSubmit={handleNext}>
          {/* Step 1: Basic info */}
          {step === 1 && (
            <div className="setup-step on fade-in">
              <div className="setup-card" style={{ padding: '24px 32px', marginBottom: '16px', borderRadius: '16px', maxWidth: '100%', width: '100%', position: 'relative' }}>
                <div className="ch" style={{ marginBottom: '24px' }}>
                  <span className="ct" style={{ fontSize: '14px', color: '#111827', fontWeight: 600 }}>Create your account</span>
                </div>

                <div className="form-grid" style={{ marginBottom: password.length > 0 ? '16px' : '24px' }}>
                  <div className="sfld">
                    <label>Username *</label>
                    <div className="email-composite">
                      <input type="text" placeholder="24cpeb04" value={email} onChange={e => setEmail(e.target.value.toLowerCase().replace(/\s/g, ''))} required />
                      <div className="email-domain-suffix">{APP_CONFIG.DEFAULT_DOMAIN}</div>
                    </div>
                  </div>
                  <div className="sfld">
                    <label>Password *</label>
                    <input type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                </div>

                {password.length > 0 && !allCriteriaMet && (
                  <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '16px', marginBottom: '24px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '12px' }}>Password must contain:</div>
                    {visibleRules.map((rule, idx) => (
                      <CheckItem key={idx} label={rule.label} checked={rule.checked} />
                    ))}
                  </div>
                )}

                <div style={{ height: '1px', background: '#e5e7eb', margin: '32px 0' }}></div>

                <div className="ch" style={{ marginBottom: '24px' }}>
                  <span className="ct" style={{ fontSize: '14px', color: '#111827', fontWeight: 600 }}>Basic information</span>
                </div>
                
                <div className="avatar-pick" style={{ marginBottom: '32px' }}>
                  <div className="av-wrap" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', width: '80px', height: '80px' }}>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      style={{ display: 'none' }} 
                      accept="image/*" 
                      onChange={handleImageChange}
                    />
                    <div className="av-big" style={{ 
                      width: '80px', height: '80px', fontSize: '32px',
                      ...(avatarImg 
                        ? { backgroundImage: `url(${avatarImg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent', backgroundColor: 'transparent' }
                        : { backgroundColor: avatarColor.bg, color: avatarColor.text })
                    }}>
                      {!avatarImg && getInitials()}
                    </div>
                    <div className="av-cam" style={{ width: '28px', height: '28px', bottom: '0px', right: '0px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>
                      <svg viewBox="0 0 24 24" fill="#fff" style={{ width: '15px', height: '15px', display: 'block' }}>
                        <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
                        <path fillRule="evenodd" d="M9.344 3.071a49.52 49.52 0 015.312 0c.967.052 1.83.585 2.332 1.39l.821 1.317c.24.383.645.643 1.11.71.386.054.77.113 1.152.177 1.432.239 2.429 1.493 2.429 2.909V18a3 3 0 01-3 3h-15a3 3 0 01-3-3V9.574c0-1.416.997-2.67 2.429-2.909.382-.064.766-.123 1.151-.178a1.56 1.56 0 001.11-.71l.822-1.315a2.942 2.942 0 012.332-1.39zM6.75 12.75a5.25 5.25 0 1110.5 0 5.25 5.25 0 01-10.5 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div style={{ marginLeft: '12px' }}>
                    {isUploadingImage ? (
                      <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--cs-primary)' }}>Uploading...</span>
                    ) : avatarImg ? (
                      <div style={{ fontSize: '13px', color: '#4b5563', fontWeight: 500 }}>
                        <button type="button" onClick={(e) => { 
                          e.stopPropagation(); 
                          setAvatarImg(null); 
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }} style={{ background: 'none', border: 'none', color: '#E24B4A', fontSize: '13px', cursor: 'pointer', padding: 0, fontWeight: 600 }}>Remove photo</button>
                      </div>
                    ) : (
                      <>
                        <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px', fontWeight: 500 }}>
                          <span>Choose avatar colour</span>
                        </div>
                        <div className="av-colors">
                          {colors.map((c, i) => (
                            <div 
                              key={i}
                              className={`av-col ${avatarColor.bg === c.bg ? 'on' : ''}`} 
                              style={{ background: c.bg, borderColor: avatarColor.bg === c.bg ? '#1d4ed8' : 'transparent', width: '28px', height: '28px' }} 
                              onClick={() => setAvatarColor(c)}
                            ></div>
                          ))}
                        </div>
                      </>
                    )}
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

                <div className="sfld" style={{ marginBottom: '20px' }}>
                  <label>Phone number *</label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <select 
                      value={countryCode} 
                      onChange={e => setCountryCode(e.target.value)} 
                      style={{ width: '120px', flexShrink: 0 }}
                    >
                      <option value="+91">IN +91</option>
                      <option value="+1">US +1</option>
                      <option value="+44">UK +44</option>
                    </select>
                    <input 
                      type="tel" 
                      placeholder="9876543210" 
                      value={phoneNumber} 
                      onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
                      required 
                      style={{ flexGrow: 1 }}
                    />
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
                    <label>Programme *</label>
                    <input type="text" placeholder="e.g. BCA, B.Tech CSE" value={programme} onChange={e => setProgramme(e.target.value)} required />
                  </div>
                </div>

                <div className="sfld" style={{ marginBottom: '16px' }}>
                  <label>Bio (optional)</label>
                  <textarea placeholder="Tell others what you're passionate about..." value={bio} onChange={e => setBio(e.target.value)} rows="3" style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
                </div>

                <div className="sfld" style={{ marginBottom: '24px' }}>
                  <label>UPI ID <span style={{ color: '#aaa', fontWeight: 400 }}>(for payments)</span></label>
                  <input type="text" placeholder="yourname@upi" value={upi} onChange={e => setUpi(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '12px', background: '#1d4ed8', color: '#fff', border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Continue</button>
              </div>
            </div>
          )}

          {/* Step 2: Skills */}
          {step === 2 && (
            <div className="fade-in">
              <div className="setup-card" style={{ padding: '24px 32px', marginBottom: '20px', borderRadius: '16px', position: 'relative', maxWidth: '100%', width: '100%' }}>
                <button type="button" onClick={() => { setStep(3); setHighestStep(h => Math.max(h, 3)); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={{ position: 'absolute', top: '24px', right: '28px', background: 'none', border: 'none', fontSize: '13px', color: '#6b7280', cursor: 'pointer', fontWeight: 500 }}>Skip</button>
                <div style={{ marginBottom: 0 }}>
                  <div className="ch"><span className="ct" style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'block', marginBottom: '2px' }}>Topics you can teach</span></div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Add topics you're confident in and can help others learn</p>
                  <div className="skill-tags">
                    {teachSkills.map(s => (
                      <span key={s} className="stag">
                        {s} <button type="button" onClick={() => removeTeachSkill(s)}>×</button>
                      </span>
                    ))}
                  </div>
                  <AutocompleteInput 
                    allTopics={allTopicsList} 
                    onAddSkill={addTeachSkill} 
                    placeholder="e.g. Python, Figma, Guitar..." 
                  />
                </div>
              </div>

              <div className="setup-card" style={{ padding: '24px 32px', marginBottom: '20px', borderRadius: '16px', position: 'relative', maxWidth: '100%', width: '100%' }}>
                <div className="ch"><span className="ct" style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'block', marginBottom: '2px' }}>Topics you want to learn</span></div>
                <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Tell others what you're looking to pick up</p>
                <div className="skill-tags">
                  {learnSkills.map(s => (
                    <span key={s} className="stag">
                      {s} <button type="button" onClick={() => removeLearnSkill(s)}>×</button>
                    </span>
                  ))}
                </div>

                <div style={{ marginBottom: 0 }}>
                   <label style={{ fontSize: '12px', color: '#4b5563', fontWeight: 500, display: 'block', marginBottom: '6px' }}>Pick or type a skill</label>
                   <AutocompleteInput 
                     allTopics={allTopicsList} 
                     onAddSkill={addLearnSkill} 
                     placeholder="e.g. Graphic Design, French..." 
                   />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <button type="button" onClick={handleBack} style={{ flex: '0 0 auto', padding: '14px 28px', borderRadius: '12px', background: '#fff', border: '1px solid #e5e7eb', fontSize: '15px', fontWeight: 600, color: '#4b5563', cursor: 'pointer' }}>Back</button>
                <button type="submit" style={{ flexGrow: 1, padding: '14px', borderRadius: '12px', background: '#1d4ed8', color: '#fff', border: 'none', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>Continue</button>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="fade-in">
              <div className="setup-card" style={{ padding: '24px 32px', marginBottom: '16px', borderRadius: '16px', maxWidth: '100%', width: '100%' }}>
                <div style={{ marginBottom: 0 }}>
                  <div className="ch"><span className="ct" style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'block', marginBottom: '2px' }}>When are you free?</span></div>
                  <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '16px' }}>Help others know when to book sessions with you</p>
                  <div className="avail-grid">
                    {availOptions.map(opt => (
                      <div key={opt} className={`avail-opt ${availability.includes(opt) ? 'on' : ''}`} onClick={() => toggleAvailability(opt)}>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="setup-card" style={{ padding: '24px 32px', marginBottom: '16px', borderRadius: '16px', maxWidth: '100%', width: '100%' }}>
                <div className="ch"><span className="ct" style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'block', marginBottom: '16px' }}>Session preference</span></div>
                <div className="avail-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                  {['Online (Google Meet)', 'In-person on campus', 'Either works'].map(opt => (
                    <div key={opt} className={`avail-opt ${sessionPref === opt ? 'on' : ''}`} onClick={() => setSessionPref(opt)}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div className="setup-card" style={{ padding: '24px 32px', marginBottom: '24px', borderRadius: '16px', maxWidth: '100%', width: '100%' }}>
                <div className="ch"><span className="ct" style={{ fontSize: '16px', fontWeight: 600, color: '#111827', display: 'block', marginBottom: '16px' }}>Exchange preference</span></div>
                <div className="avail-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                  {['Skill swap', 'Paid (₹/hr)', 'Both'].map(opt => (
                    <div key={opt} className={`avail-opt ${exchangePref === opt ? 'on' : ''}`} onClick={() => setExchangePref(opt)}>
                      {opt}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <button type="button" onClick={handleBack} disabled={isFinishing} style={{ flex: '0 0 auto', padding: '14px 28px', borderRadius: '12px', background: '#fff', border: '1px solid #e5e7eb', fontSize: '15px', fontWeight: 600, color: '#4b5563', cursor: isFinishing ? 'not-allowed' : 'pointer', opacity: isFinishing ? 0.5 : 1 }}>Back</button>
                <button type="submit" disabled={isFinishing} style={{ flexGrow: 1, padding: '14px', borderRadius: '12px', background: '#1d4ed8', color: '#fff', border: 'none', fontSize: '15px', fontWeight: 600, cursor: isFinishing ? 'not-allowed' : 'pointer', opacity: isFinishing ? 0.8 : 1 }}>{isFinishing ? 'Creating Account...' : 'Go to Dashboard'}</button>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button type="button" onClick={handleFinish} disabled={isFinishing} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '14px', fontWeight: 500, cursor: isFinishing ? 'not-allowed' : 'pointer', textDecoration: 'underline', opacity: isFinishing ? 0.5 : 1 }}>Skip for now</button>
              </div>
            </div>
          )}
        </form>
      </div>

      <OtpVerificationModal
        isOpen={isOtpModalOpen}
        onClose={() => setIsOtpModalOpen(false)}
        onSuccess={handleOtpSuccess}
        email={`${email.trim()}${APP_CONFIG.DEFAULT_DOMAIN}`}
      />
    </div>
  );
};

export default SetupPage;
