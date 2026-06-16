import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import { IconCheck } from '@tabler/icons-react';
import { HexColorPicker } from "react-colorful";
import BlockedUsersModal from '../components/modals/BlockedUsersModal';
import CustomSelect from '../components/common/CustomSelect';

const EditProfile = () => {
  const { user, updateProfile } = useAuth();
  const { triggerToast } = useAppData();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState(user?.name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name?.split(' ')[1] || '');
  const [year, setYear] = useState(user?.year || '');
  const [programme, setProgramme] = useState(user?.programme || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  // Parse existing phone number (e.g. "+91 9876543210")
  const existingPhone = user?.phoneNumber || '';
  const parsedCountryCode = existingPhone.includes(' ') ? existingPhone.split(' ')[0] : '+91';
  const parsedPhone = existingPhone.includes(' ') ? existingPhone.split(' ')[1] : existingPhone;
  
  const [countryCode, setCountryCode] = useState(parsedCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(parsedPhone);
  
  const [upi, setUpi] = useState(user?.upi || '');
  const [avatarImg, setAvatarImg] = useState(user?.avatarImg || null);
  const fileInputRef = useRef(null);
  const [bannerImg, setBannerImg] = useState(user?.bannerImg || null);
  const bannerInputRef = useRef(null);
  const [showHeatmap, setShowHeatmap] = useState(user?.showHeatmap !== false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customSwatchColor, setCustomSwatchColor] = useState(null);
  
  const [learnSkills, setLearnSkills] = useState((user?.skillsWanted || []).map(s => s.name || s));
  const [learnInp, setLearnInp] = useState('');

  const [availability, setAvailability] = useState(['Weekday mornings', 'Weekend mornings', 'Weekends anytime']);
  const [mode, setMode] = useState('Online');

  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || { bg: '#EEEDFE', text: '#3C3489' });
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);

  useEffect(() => {
    const mainContent = document.querySelector('.main');
    if (mainContent) {
      mainContent.scrollTo(0, 0);
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  const handleBack = () => {
    const hasChanges = 
      firstName !== (user?.name?.split(' ')[0] || '') ||
      lastName !== (user?.name?.split(' ')[1] || '') ||
      year !== (user?.year || '') ||
      programme !== (user?.programme || '') ||
      bio !== (user?.bio || '') ||
      countryCode !== parsedCountryCode ||
      phoneNumber !== parsedPhone ||
      upi !== (user?.upi || '') ||
      avatarImg !== (user?.avatarImg || null) ||
      bannerImg !== (user?.bannerImg || null) ||
      showHeatmap !== (user?.showHeatmap !== false) ||
      JSON.stringify(learnSkills) !== JSON.stringify((user?.skillsWanted || []).map(s => s.name || s)) ||
      avatarColor?.bg !== (user?.avatarColor?.bg || '#EEEDFE') ||
      avatarColor?.text !== (user?.avatarColor?.text || '#3C3489') ||
      customSwatchColor !== null;

    if (hasChanges) {
      setShowSavePrompt(true);
    } else {
      navigate('/app/profile');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showColorPicker) {
          setShowColorPicker(false);
        } else if (!showSavePrompt) {
          handleBack();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  const colors = [
    // Light themes
    { bg: '#EEEDFE', text: '#3C3489' }, // Purple
    { bg: '#E6F1FB', text: '#0C447C' }, // Blue
    { bg: '#EAF3DE', text: '#27500A' }, // Green
    { bg: '#FAEEDA', text: '#633806' }, // Orange
    { bg: '#FBEAF0', text: '#72243E' }, // Pink
    // Dark themes
    { bg: '#1d4ed8', text: '#eff6ff' }, // Royal Blue
    { bg: '#b91c1c', text: '#fef2f2' }, // Crimson
    { bg: '#047857', text: '#ecfdf5' }, // Emerald
    { bg: '#6d28d9', text: '#f5f3ff' }, // Violet
    { bg: '#be185d', text: '#fdf2f8' }, // Rose
    { bg: '#0f766e', text: '#f0fdfa' }, // Teal
    { bg: '#b45309', text: '#fffbeb' }  // Amber
  ];

  const handleCustomColorChange = (hex) => {
    const rgb = parseInt(hex.replace('#', ''), 16);
    const lum = 0.299 * ((rgb >> 16) & 255) + 0.587 * ((rgb >> 8) & 255) + 0.114 * (rgb & 255);
    // If background is very light, use dark slate text, else off-white text
    const text = lum > 140 ? '#1e293b' : '#f8fafc';
    setCustomSwatchColor({ bg: hex, text });
  };

  const getInitials = () => {
    if (!firstName && !lastName) return 'AK';
    return `${firstName.charAt(0) || ''}${lastName.charAt(0) || ''}`.toUpperCase();
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const newSkillsWanted = learnSkills;

      const finalAvatarColor = customSwatchColor || avatarColor;

      await updateProfile({
        name: `${firstName} ${lastName}`.trim(),
        phoneNumber: `${countryCode} ${phoneNumber}`.trim(),
        year,
        programme,
        bio,
        upi,
        skillsOffered: user?.skillsOffered || [],
        skillsWanted: newSkillsWanted,
        avatarImg,
        avatarColor: finalAvatarColor,
        bannerImg,
        showHeatmap
      });
      triggerToast('Profile updated successfully!');
      setIsSaving(false);
      navigate('/app/profile');
    } catch (err) {
      setIsSaving(false);
      triggerToast('Failed to update profile');
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('Please select an image file');
      return;
    }

    try {
      setIsUploadingAvatar(true);
      const { compressImage } = await import('../utils/imageUtils');
      const { imageService } = await import('../services/imageService');

      const compressedFile = await compressImage(file, 512, 512, 0.8);
      const signatureData = await imageService.getSignature('avatar');
      const url = await imageService.uploadToCloudinary(compressedFile, signatureData);
      
      setAvatarImg(url);
      triggerToast('Profile picture uploaded successfully');
    } catch (err) {
      console.error('Image upload failed:', err);
      triggerToast(err.message || 'Failed to upload image');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleRemovePhoto = (e) => {
    e.stopPropagation();
    setAvatarImg(null);
  };

  const handleBannerChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      triggerToast('Please select an image file');
      return;
    }

    try {
      setIsUploadingBanner(true);
      const { compressImage } = await import('../utils/imageUtils');
      const { imageService } = await import('../services/imageService');

      const compressedFile = await compressImage(file, 1200, 400, 0.8);
      const signatureData = await imageService.getSignature('banner');
      const url = await imageService.uploadToCloudinary(compressedFile, signatureData);
      
      setBannerImg(url);
      triggerToast('Banner uploaded successfully');
    } catch (err) {
      console.error('Banner upload failed:', err);
      triggerToast(err.message || 'Failed to upload banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveBanner = (e) => {
    e.stopPropagation();
    setBannerImg(null);
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
      {showSavePrompt && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '16px', width: '320px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px', color: '#111827' }}>Unsaved Changes</div>
            <div style={{ fontSize: '14px', color: '#4b5563', marginBottom: '24px' }}>Do you want to save your changes?</div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', alignItems: 'center' }}>
              <button disabled={isSaving} onClick={() => navigate('/app/profile')} style={{ background: 'none', border: 'none', color: isSaving ? '#fca5a5' : '#ef4444', fontSize: '14px', fontWeight: 600, cursor: isSaving ? 'default' : 'pointer', marginRight: 'auto' }}>Discard</button>
              <button disabled={isSaving} onClick={() => setShowSavePrompt(false)} style={{ padding: '8px 16px', background: '#f3f4f6', border: 'none', borderRadius: '8px', color: isSaving ? '#9ca3af' : '#374151', fontSize: '14px', fontWeight: 600, cursor: isSaving ? 'default' : 'pointer' }}>Cancel</button>
              <button disabled={isSaving} onClick={handleSave} style={{ padding: '8px 16px', background: isSaving ? '#93c5fd' : 'var(--cs-primary)', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px', fontWeight: 600, cursor: isSaving ? 'default' : 'pointer', minWidth: '70px' }}>{isSaving ? 'Saving...' : 'Yes'}</button>
            </div>
          </div>
        </div>
      )}

      <button 
        onClick={handleBack} 
        style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', fontWeight: 500 }}
      >
        ← Back to profile
      </button>

      {/* Appearance section */}
      <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '20px' }}>
          Appearance
        </div>
        
        {/* Banner Section */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', fontWeight: 500 }}>Banner Picture</div>
            {bannerImg && (
              <button onClick={handleRemoveBanner} style={{ background: 'none', border: 'none', color: '#E24B4A', fontSize: '13px', cursor: 'pointer', fontWeight: 500 }}>Remove banner</button>
            )}
          </div>
          <div onClick={() => bannerInputRef.current?.click()} style={{ width: '100%', height: '120px', borderRadius: 'var(--cs-radius-md)', border: '2px dashed var(--cs-border)', background: bannerImg ? `url(${bannerImg}) center/cover` : 'var(--cs-bg-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative', overflow: 'hidden' }}>
             <input type="file" ref={bannerInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleBannerChange} />
             {!bannerImg && <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-primary)' }}>{isUploadingBanner ? 'Uploading...' : '+ Upload Banner'}</span>}
             {bannerImg && <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = 1} onMouseLeave={e => e.currentTarget.style.opacity = 0}><span style={{ color: '#fff', fontSize: '13px', fontWeight: 600 }}>{isUploadingBanner ? 'Uploading...' : 'Change Banner'}</span></div>}
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--cs-border)', margin: '24px 0' }}></div>

        {/* Avatar and Theme row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '32px', flexWrap: 'wrap' }}>
          {/* Avatar Component */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', fontWeight: 500 }}>Profile Photo</div>
              {avatarImg && (
                <button onClick={handleRemovePhoto} style={{ background: 'none', border: 'none', color: '#E24B4A', fontSize: '12px', cursor: 'pointer', fontWeight: 500 }}>Remove</button>
              )}
            </div>
            <div className="ep-av-wrap" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer', position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
              <input 
                type="file" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                accept="image/*" 
                onChange={handleImageChange}
              />
              <div style={{ 
                width: '80px', height: '80px', borderRadius: '50%', backgroundColor: avatarImg ? 'var(--cs-bg-white)' : avatarColor.bg, color: avatarColor.text, fontSize: '28px', border: '3px solid var(--cs-primary)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600,
                ...(avatarImg ? { backgroundImage: `url(${avatarImg})`, backgroundSize: 'cover', backgroundPosition: 'center', color: 'transparent' } : {})
              }}>
                {!avatarImg && getInitials()}
              </div>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s', ...(isUploadingAvatar ? { opacity: 1 } : {}) }} className="ep-av-overlay">
                <span style={{ color: '#fff', fontSize: '11px', fontWeight: 600, textAlign: 'center' }}>
                  {isUploadingAvatar ? 'Wait...' : 'Change'}
                </span>
              </div>
              <div style={{ position: 'absolute', bottom: '0', right: '0', width: '24px', height: '24px', background: 'var(--cs-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid var(--cs-bg-white)' }}>
                <svg viewBox="0 0 24 24" width="12" height="12" xmlns="http://www.w3.org/2000/svg"><path d="M12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7zm7-13h-1.5l-1.7-2H8.2L6.5 2.5H5A3 3 0 0 0 2 5.5v13A3 3 0 0 0 5 21.5h14a3 3 0 0 0 3-3v-13A3 3 0 0 0 19 2.5z" fill="#fff"/></svg>
              </div>
            </div>
          </div>

          {/* Theme Component */}
          <div style={{ flexGrow: 1 }}>
            <div style={{ fontSize: '13px', color: 'var(--cs-text-inactive)', marginBottom: '12px', fontWeight: 500 }}>Profile Theme</div>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
              {colors.map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => setAvatarColor(c)}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', background: c.bg, border: `2px solid ${avatarColor.bg === c.bg ? 'var(--cs-text-main)' : 'transparent'}`, cursor: 'pointer', transition: 'border-color 0.2s' }}
                ></div>
              ))}
              
              <div style={{ width: '1px', height: '24px', background: 'var(--cs-border)', margin: '0 4px' }}></div>
              
              {customSwatchColor && (
                <>
                  <div 
                    onClick={() => setAvatarColor(customSwatchColor)}
                    style={{ width: '32px', height: '32px', borderRadius: '50%', background: customSwatchColor.bg, border: `2px solid ${avatarColor.bg === customSwatchColor.bg ? 'var(--cs-text-main)' : 'transparent'}`, cursor: 'pointer', transition: 'border-color 0.2s', position: 'relative' }}
                  >
                  </div>
                  <div style={{ width: '1px', height: '24px', background: 'var(--cs-border)', margin: '0 4px' }}></div>
                </>
              )}
              
              {/* Custom Color Picker */}
              <div style={{ position: 'relative' }}>
                <div onClick={() => setShowColorPicker(!showColorPicker)} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <div style={{ position: 'relative', width: '32px', height: '32px', borderRadius: '50%', border: '2px dashed var(--cs-border)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}></div>
                  </div>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-inactive)' }}>Custom</span>
                </div>
                
                {showColorPicker && (
                  <div style={{ position: 'absolute', top: '100%', left: '0', zIndex: 100, marginTop: '8px', padding: '16px', background: 'var(--cs-bg-white)', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', border: '1px solid var(--cs-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Custom Theme</span>
                      <button onClick={() => setShowColorPicker(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--cs-text-inactive)', lineHeight: 1 }}>&times;</button>
                    </div>
                    <HexColorPicker color={customSwatchColor?.bg || '#ffffff'} onChange={handleCustomColorChange} />
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>

        <div style={{ height: '1px', background: 'var(--cs-border)', margin: '24px 0' }}></div>

        {/* Heatmap Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Show Activity Heatmap</div>
            <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)' }}>Display your 6-month activity chart on your banner</div>
          </div>
          <div style={{ width: '40px', height: '24px', background: showHeatmap ? 'var(--cs-primary)' : 'var(--cs-border)', borderRadius: '12px', position: 'relative', transition: 'background 0.3s' }}>
            <input type="checkbox" checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} style={{ display: 'none' }} />
            <div style={{ width: '18px', height: '18px', background: '#fff', borderRadius: '50%', position: 'absolute', top: '3px', left: showHeatmap ? '19px' : '3px', transition: 'left 0.3s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}></div>
          </div>
        </label>
      </div>

      {/* Basic info */}
      <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '20px' }}>Basic information</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div><label style={labelStyle}>First name</label><input style={inputStyle} type="text" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
          <div><label style={labelStyle}>Last name</label><input style={inputStyle} type="text" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>Phone number</label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <CustomSelect 
              value={countryCode} 
              onChange={val => setCountryCode(val)} 
              style={{ width: '120px', flexShrink: 0 }}
              options={[
                { value: '+91', label: 'IN +91' },
                { value: '+1', label: 'US +1' },
                { value: '+44', label: 'UK +44' }
              ]}
              placeholder="Code"
            />
            <input 
              type="tel" 
              placeholder="9876543210" 
              value={phoneNumber} 
              onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, ''))} 
              style={{ ...inputStyle, flexGrow: 1 }}
            />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Year</label>
            <CustomSelect 
              value={year} 
              onChange={val => setYear(val)}
              options={[
                { value: '1st year', label: '1st year' },
                { value: '2nd year', label: '2nd year' },
                { value: '3rd year', label: '3rd year' },
                { value: '4th year', label: '4th year' },
                { value: 'Alumni', label: 'Alumni' },
                { value: 'Faculty', label: 'Faculty' }
              ]}
              placeholder="Select year"
            />
          </div>
          <div><label style={labelStyle}>Programme / Department</label><input style={inputStyle} type="text" value={programme} onChange={e => setProgramme(e.target.value)} /></div>
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

      {/* Privacy */}
      <div style={{ background: 'var(--cs-bg-white)', border: '0.5px solid var(--cs-border)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', marginBottom: '24px' }}>
        <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '20px' }}>Privacy &amp; Safety</div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Blocked Users</div>
            <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', marginTop: '4px' }}>Manage people you have blocked</div>
          </div>
          <button 
            onClick={() => setShowBlockedModal(true)}
            style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--cs-border)', background: 'var(--cs-bg-light)', color: 'var(--cs-text-main)', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
          >
            Manage
          </button>
        </div>
      </div>

      {/* Save / Cancel */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <button disabled={isSaving} onClick={handleSave} style={{ flex: 1, padding: '14px', borderRadius: '100px', border: 'none', background: isSaving ? '#93c5fd' : 'var(--cs-primary)', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: isSaving ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <IconCheck size={20} /> {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={() => navigate('/app/profile')} style={{ padding: '14px 24px', borderRadius: '100px', border: '1px solid var(--cs-border)', background: 'var(--cs-bg-white)', color: 'var(--cs-text-main)', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      {showBlockedModal && (
        <BlockedUsersModal onClose={() => setShowBlockedModal(false)} />
      )}
    </div>
  );
};

export default EditProfile;
