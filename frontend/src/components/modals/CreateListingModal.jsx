import React, { useState, useEffect } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { useAuth } from '../../context/AuthContext';
import { IconX, IconPlus, IconTrash, IconChevronDown } from '@tabler/icons-react';

const formatTime12hr = (time24) => {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hours = parseInt(h, 10);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${m} ${period}`;
};

import { listingService } from '../../services/listingService';
import MarketplaceCard from '../common/MarketplaceCard/MarketplaceCard';
import AutocompleteInput from '../AutocompleteInput';
import CustomSelect from '../common/CustomSelect';
import CustomTimeInput from '../common/CustomTimeInput';
import ModalWrapper from '../common/ModalWrapper';

const CreateListingModal = ({ isOpen, onClose, editData = null }) => {
  const { triggerToast } = useAppData();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [listingType, setListingType] = useState('TEACH');
  const [price, setPrice] = useState('');
  const [availability, setAvailability] = useState('ONLINE');
  const [topicsStr, setTopicsStr] = useState('');
  
  // Available Slots
  const [slots, setSlots] = useState([]);
  const [newSlotDay, setNewSlotDay] = useState('Monday');
  const [newSlotTime, setNewSlotTime] = useState('17:00');
  const [newSlotDuration, setNewSlotDuration] = useState('60');

  // Skills (now labeled Topics)
  const [offeredSkills, setOfferedSkills] = useState([]);
  const [requestedSkills, setRequestedSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('Beginner');
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [topicMap, setTopicMap] = useState({});

  React.useEffect(() => {
    import('../../services/topicService').then(({ getTopics }) => {
      getTopics().then(res => {
        const topics = res?.data || res;
        if (Array.isArray(topics)) {
          const map = {};
          topics.forEach(t => { map[t.name.toLowerCase()] = t.category; });
          setTopicMap(map);
        }
      }).catch(console.error);
    });
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      if (editData) {
        setTitle(editData.title || '');
        setDescription(editData.description || '');
        setListingType(editData.listingType || 'TEACH');
        setPrice(editData.price?.toString() || '');
        setAvailability(editData.availability || 'ONLINE');
        setSlots(editData.availableSlots || []);
        setOfferedSkills(editData.offeredSkills || []);
        setRequestedSkills(editData.requestedSkills || []);
        setTopicsStr(editData.topics?.join(', ') || '');
      } else {
        setTitle('');
        setDescription('');
        setListingType('TEACH');
        setPrice('');
        setAvailability('ONLINE');
        setSlots([]);
        setOfferedSkills([]);
        setRequestedSkills([]);
        setTopicsStr('');
      }
      setIsPreviewing(false);
      setIsSubmitting(false);
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const handleAddSlot = () => {
    setSlots([...slots, { dayOfWeek: newSlotDay, startTime: newSlotTime, durationMinutes: parseInt(newSlotDuration) }]);
  };

  const handleRemoveSlot = (index) => {
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleAddOfferedSkill = () => {
    if (newSkillName.trim()) {
      setOfferedSkills([...offeredSkills, { name: newSkillName.trim(), level: newSkillLevel }]);
      setNewSkillName('');
    }
  };

  const handleAddRequestedSkill = () => {
    const sel = document.getElementById('req-skill-select');
    const lev = document.getElementById('req-skill-level');
    if (sel && sel.value.trim()) {
      setRequestedSkills([...requestedSkills, { name: sel.value.trim(), level: lev.value }]);
      sel.value = '';
    }
  };

  const getAutoCategory = () => {
    const primarySkill = offeredSkills[0]?.name || requestedSkills[0]?.name;
    if (!primarySkill) return 'General';
    return topicMap[primarySkill.toLowerCase()] || 'General';
  };

  const handlePreview = (e) => {
    e.preventDefault();
    
    if (newSkillName) {
      triggerToast("Please click '+ Offer' to add the selected skill before previewing.");
      return;
    }
    
    const reqSelect = document.getElementById('req-skill-select');
    if (reqSelect && reqSelect.value) {
      triggerToast("Please click '+ Request' to add the selected skill before previewing.");
      return;
    }

    if ((listingType === 'TEACH' || listingType === 'SWAP' || listingType === 'TEACH_SWAP' || listingType === 'LEARN_SWAP') && offeredSkills.length === 0) {
      triggerToast("Please add at least one skill to offer.");
      return;
    }

    if ((listingType === 'LEARN' || listingType === 'SWAP' || listingType === 'TEACH_SWAP' || listingType === 'LEARN_SWAP') && requestedSkills.length === 0) {
      triggerToast("Please add at least one skill you are requesting.");
      return;
    }

    setIsPreviewing(true);
  };

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category: getAutoCategory(),
        listingType,
        active: true,
        price: price ? parseFloat(price) : 0,
        availability,
        availableSlots: slots.map(s => ({ dayOfWeek: s.dayOfWeek.toUpperCase(), startTime: s.startTime, durationMinutes: s.durationMinutes })),
        topics: topicsStr.split(',').map(t => t.trim()).filter(t => t).map(t => t ? t.charAt(0).toUpperCase() + t.slice(1) : ''),
        offeredSkills: (listingType === 'TEACH' || listingType === 'SWAP' || listingType === 'TEACH_SWAP' || listingType === 'LEARN_SWAP') 
          ? offeredSkills.map(s => ({ ...s, name: s.name ? s.name.charAt(0).toUpperCase() + s.name.slice(1) : '', level: s.level.toUpperCase() })) : [],
        requestedSkills: (listingType === 'LEARN' || listingType === 'SWAP' || listingType === 'TEACH_SWAP' || listingType === 'LEARN_SWAP') 
          ? requestedSkills.map(s => ({ ...s, name: s.name ? s.name.charAt(0).toUpperCase() + s.name.slice(1) : '', level: s.level ? s.level.toUpperCase() : 'BEGINNER' })) : [],
        ownerId: user?.userId || user?._id || user?.id
      };
      
      if (editData) {
        await listingService.updateListing(editData._id || editData.id, payload);
        triggerToast('Listing updated successfully!');
      } else {
        await listingService.createListing(payload);
        triggerToast('Listing created successfully!');
      }
      onClose();
    } catch (err) {
      triggerToast(editData ? 'Failed to update listing' : 'Failed to create listing');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ModalWrapper isOpen={isOpen} onClose={onClose} maxWidth="640px" zIndex={1000}>
      <style>{`
        .clm-wrapper {
          background: #ffffff;
          border-radius: 16px;
          width: 100%;
          max-width: 640px;
          max-height: 90vh;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }
        .clm-header {
          background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%);
          padding: 24px 32px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          color: #ffffff;
        }
        .clm-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .clm-field label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          color: #111827;
          margin-bottom: 8px;
        }
        .clm-input {
          width: 100%;
          padding: 10px 14px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 14px;
          color: #374151;
          outline: none;
          box-sizing: border-box;
        }
        .clm-row { display: grid; gap: 16px; }
        .clm-row-2 { grid-template-columns: 1fr 1fr; }
        .clm-pill-group {
          display: flex; flex-wrap: wrap; gap: 8px;
        }
        .clm-pill {
          padding: 6px 12px;
          background: #f3f4f6;
          border-radius: 100px;
          font-size: 13px;
          color: #374151;
          cursor: pointer;
        }
        .clm-pill.active {
          background: #1d4ed8; color: #fff;
        }
        .clm-submit {
          width: 100%; padding: 14px; background: #1d4ed8; color: #fff; border: none; border-radius: 100px; font-weight: 700; cursor: pointer;
        }
      `}</style>
      
      <div className="clm-wrapper" onClick={(e) => e.stopPropagation()}>
        <div className="clm-header">
          <div>
            <div style={{fontSize: '20px', fontWeight: 600}}>Create Listing</div>
            <div style={{fontSize: '13px', opacity: 0.8}}>Share your skills or request to learn</div>
          </div>
          <button onClick={onClose} style={{background:'none', border:'none', color:'#fff', cursor:'pointer'}}><IconX/></button>
        </div>

        {!isPreviewing ? (
          <form className="clm-body" onSubmit={handlePreview}>
          
          <div className="clm-row">
            <div className="clm-field">
              <label>Listing Type</label>
              <div className="clm-pill-group">
                {[
                  { value: 'TEACH', label: 'I want to Teach' },
                  { value: 'LEARN', label: 'I want to Learn' },
                  { value: 'SWAP', label: 'Skill Swap' },
                  { value: 'TEACH_SWAP', label: 'Teach or Swap' },
                  { value: 'LEARN_SWAP', label: 'Learn or Swap' }
                ].map(type => (
                  <div
                    key={type.value}
                    className={`clm-pill ${listingType === type.value ? 'active' : ''}`}
                    onClick={() => setListingType(type.value)}
                  >
                    {type.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="clm-field">
            <label>Title</label>
            <input type="text" className="clm-input" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="clm-field">
            <label>Description</label>
            <textarea className="clm-input" rows="3" value={description} onChange={(e) => setDescription(e.target.value)} required />
          </div>

          {(listingType !== 'SWAP') && (
            <div className="clm-field">
              <label>{listingType.startsWith('LEARN') ? 'Willing to pay per hour (₹) (Optional)' : 'Price per hour (₹) (Optional)'}</label>
              <input type="number" className="clm-input" value={price} onChange={(e) => setPrice(e.target.value)} min="0" placeholder="0 for Free" />
            </div>
          )}

          {/* Skills builder (now labeled Topics) */}
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Topics & Level</div>
            
            {(listingType === 'TEACH' || listingType === 'SWAP' || listingType === 'TEACH_SWAP' || listingType === 'LEARN_SWAP') && (
              <div>
                <label style={{fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-secondary)', marginBottom: '4px', display: 'block'}}>What are you offering?</label>
                {(!user?.skillsOffered || user.skillsOffered.length === 0) ? (
                  <div style={{ fontSize: '13px', color: '#dc2626', background: '#fef2f2', padding: '8px', borderRadius: '4px' }}>
                    You haven't added any skills to teach yet. Please go to your Profile and add a skill to your "I can teach" list first.
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <CustomSelect 
                      value={newSkillName} 
                      onChange={val => {
                        setNewSkillName(val);
                        const skillObj = user.skillsOffered.find(s => s.name === val);
                        if (skillObj) setNewSkillLevel(skillObj.level);
                      }}
                      options={(user.skillsOffered || []).map(s => ({ value: s.name, label: s.name }))}
                      placeholder="Select a skill from your profile..."
                      style={{flex: 2}}
                    />
                    <CustomSelect 
                      value={newSkillLevel} 
                      onChange={val => setNewSkillLevel(val)}
                      options={[
                        { value: 'Beginner', label: 'Beginner' },
                        { value: 'Intermediate', label: 'Intermediate' },
                        { value: 'Advanced', label: 'Advanced' }
                      ]}
                      placeholder="Level"
                      style={{flex: 1}}
                    />
                    <button type="button" onClick={() => {
                      if (!newSkillName) return;
                      setOfferedSkills([...offeredSkills, { name: newSkillName, level: newSkillLevel }]);
                      setNewSkillName('');
                    }} style={{padding: '0 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', height: '42px', fontWeight: 600, boxSizing: 'border-box'}}>+ Offer</button>
                  </div>
                )}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: offeredSkills.length ? '8px' : '0' }}>
                  {offeredSkills.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--cs-bg-white)', padding: '8px 12px', border: '1px solid var(--cs-border)', borderRadius: '6px', fontSize: '13px' }}>
                      <span><strong style={{color: '#1d4ed8'}}>Offering:</strong> {s.name} ({s.level})</span>
                      <button type="button" onClick={() => setOfferedSkills(offeredSkills.filter((_, idx) => idx !== i))} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}><IconTrash size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(listingType === 'LEARN' || listingType === 'SWAP' || listingType === 'TEACH_SWAP' || listingType === 'LEARN_SWAP') && (
              <div style={{marginTop: listingType === 'LEARN' ? '0' : '8px'}}>
                <label style={{fontSize: '12px', fontWeight: 600, color: 'var(--cs-text-secondary)', marginBottom: '4px', display: 'block'}}>What are you requesting to learn?</label>
                <AutocompleteInput 
                  allTopics={Object.keys(topicMap)} 
                  placeholder="e.g. Figma, Python, Guitar..."
                  onAddSkill={(skill) => {
                    if (!requestedSkills.find(s => s.name.toLowerCase() === skill.toLowerCase())) {
                      setRequestedSkills([...requestedSkills, { name: skill }]);
                    }
                  }} 
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: requestedSkills.length ? '8px' : '0' }}>
                  {requestedSkills.map((s, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--cs-bg-white)', padding: '8px 12px', border: '1px solid var(--cs-border)', borderRadius: '6px', fontSize: '13px' }}>
                      <span><strong style={{color: '#059669'}}>Requesting:</strong> {s.name}</span>
                      <button type="button" onClick={() => setRequestedSkills(requestedSkills.filter((_, idx) => idx !== i))} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}><IconTrash size={14}/></button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {!(listingType === 'LEARN' || listingType === 'LEARN_SWAP') && (
            <div className="clm-field">
              <label>Syllabus <span style={{fontWeight: 400, color: '#6b7280'}}>(optional)</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '6px 12px', border: '1px solid var(--cs-border)', borderRadius: '8px', minHeight: '42px', alignItems: 'center', background: 'var(--cs-bg-white)' }}>
                {topicsStr.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                  <div key={i} style={{ background: 'var(--cs-bg-hover)', color: '#3730a3', padding: '4px 10px', borderRadius: '100px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {t}
                    <IconX size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => {
                      const newTopics = topicsStr.split(',').map(t => t.trim()).filter(Boolean);
                      newTopics.splice(i, 1);
                      setTopicsStr(newTopics.join(', '));
                    }} />
                  </div>
                ))}
                <input 
                  type="text" 
                  placeholder={!topicsStr ? "Type topic and press comma to separate" : ""} 
                  style={{ border: 'none', outline: 'none', flex: 1, minWidth: '150px', background: 'transparent', fontSize: '14px', color: '#374151', padding: '4px 0' }}
                  onKeyDown={(e) => {
                    if (e.key === ',' || e.key === 'Enter') {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val) {
                        setTopicsStr(prev => prev ? `${prev}, ${val}` : val);
                        e.target.value = '';
                      }
                    } else if (e.key === 'Backspace' && !e.target.value) {
                      e.preventDefault();
                      const newTopics = topicsStr.split(',').map(t => t.trim()).filter(Boolean);
                      if (newTopics.length > 0) {
                        newTopics.pop();
                        setTopicsStr(newTopics.join(', '));
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* Availability Slots */}
          <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px' }}>Availability Slots</div>
            <div className="clm-row clm-row-2">
              <div className="clm-field">
                <label>Mode</label>
                <CustomSelect 
                  value={availability} 
                  onChange={val => setAvailability(val)}
                  options={[
                    { value: 'ONLINE', label: 'Online' },
                    { value: 'OFFLINE', label: 'In Person' },
                    { value: 'HYBRID', label: 'Either' }
                  ]}
                  placeholder="Select mode"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CustomSelect 
                value={newSlotDay} 
                onChange={val => setNewSlotDay(val)}
                options={['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'].map(d => ({ value: d, label: d }))}
                placeholder="Day"
                style={{flex: 1}}
              />
              <CustomTimeInput 
                value={newSlotTime} 
                onChange={val => setNewSlotTime(val)} 
                style={{flex: 1}}
              />
              <CustomSelect 
                value={newSlotDuration} 
                onChange={val => setNewSlotDuration(val)}
                options={[
                  { value: '30', label: '30 min' },
                  { value: '60', label: '60 min' },
                  { value: '90', label: '90 min' }
                ]}
                placeholder="Duration"
                style={{flex: 1}}
              />
              <button type="button" onClick={handleAddSlot} style={{padding: '0 16px', background: '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer'}}>Add</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {slots.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', background: i === 0 ? '#eff6ff' : '#fff', padding: '8px 12px', border: i === 0 ? '1px solid #bfdbfe' : '1px solid #e5e7eb', borderRadius: '6px', fontSize: '13px' }}>
                  <span>
                    <strong style={{ color: i === 0 ? '#1d4ed8' : '#6b7280', marginRight: '6px' }}>{i === 0 ? 'Primary:' : 'Alternate:'}</strong>
                    {s.dayOfWeek} at {formatTime12hr(s.startTime)} ({s.durationMinutes}m)
                  </span>
                  <button type="button" onClick={() => handleRemoveSlot(i)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer'}}><IconTrash size={14}/></button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="clm-submit" style={{cursor: 'pointer'}}>Preview Listing</button>
          </form>
        ) : (
          <div className="clm-body" style={{ alignItems: 'flex-start' }}>
            <h3 style={{marginTop: 0, marginBottom: '4px'}}>Review Listing Details</h3>
            <p style={{fontSize: '13px', color: '#6b7280', marginTop: 0, marginBottom: '16px'}}>Please review the details below before publishing.</p>
            
            <div style={{ width: '100%', background: '#f9fafb', borderRadius: '12px', padding: '20px', border: '1px solid var(--cs-border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{getAutoCategory()} • {listingType.replace('_', ' ')}</div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginTop: '4px' }}>{title || 'Untitled Listing'}</div>
                {listingType !== 'SWAP' && <div style={{ fontSize: '16px', fontWeight: 600, color: '#059669', marginTop: '8px' }}>{price ? (listingType.startsWith('LEARN') ? `Willing to pay: ₹${price}/hr` : `Price: ₹${price}/hr`) : 'Free'}</div>}
              </div>

              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Description</div>
                <div style={{ fontSize: '14px', color: 'var(--cs-text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{description || 'No description provided.'}</div>
              </div>

              {topicsStr && (
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '4px' }}>Syllabus / Topics</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {topicsStr.split(',').map(t => t.trim()).filter(Boolean).map((t, i) => (
                      <span key={i} style={{ background: 'var(--cs-bg-hover)', color: '#3730a3', padding: '4px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: 500 }}>{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {(offeredSkills.length > 0 || requestedSkills.length > 0) && (
                <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', background: 'var(--cs-bg-white)', padding: '16px', borderRadius: '8px', border: '1px solid var(--cs-border)' }}>
                  {offeredSkills.length > 0 && (
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Offering</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {offeredSkills.map((s, i) => (
                          <div key={i} style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#1d4ed8' }}></div>
                            {s.name} <span style={{ color: 'var(--cs-text-inactive)', fontSize: '12px' }}>({s.level})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {requestedSkills.length > 0 && (
                    <div style={{ flex: 1, minWidth: '200px' }}>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Requesting</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {requestedSkills.map((s, i) => (
                          <div key={i} style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#059669' }}></div>
                            {s.name} {s.level && <span style={{ color: 'var(--cs-text-inactive)', fontSize: '12px' }}>({s.level})</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Availability</div>
                <div style={{ fontSize: '13px', color: 'var(--cs-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: availability === 'ONLINE' ? '#10b981' : '#f59e0b' }}></div>
                  {availability === 'ONLINE' ? 'Online Mode' : availability === 'OFFLINE' ? 'In-Person Mode' : 'Online or In-Person'}
                </div>
                {slots.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {slots.map((s, i) => (
                      <div key={i} style={{ background: i === 0 ? '#eff6ff' : '#ffffff', border: i === 0 ? '1px solid #bfdbfe' : '1px solid #d1d5db', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', color: i === 0 ? '#1e3a8a' : '#374151', fontWeight: 500 }}>
                        <span style={{ fontWeight: 700, marginRight: '4px', color: i === 0 ? '#1d4ed8' : '#6b7280' }}>{i === 0 ? 'Primary:' : 'Alternate:'}</span>
                        {s.dayOfWeek} • {formatTime12hr(s.startTime)} ({s.durationMinutes}m)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '12px', width: '100%' }}>
              <button type="button" onClick={() => setIsPreviewing(false)} disabled={isSubmitting} style={{flex: 1, padding: '12px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer'}}>Back to Edit</button>
              <button type="button" onClick={handleConfirm} disabled={isSubmitting} style={{flex: 1, padding: '12px', background: isSubmitting ? '#9ca3af' : '#1d4ed8', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: isSubmitting ? 'not-allowed' : 'pointer'}}>
                {isSubmitting ? (editData ? 'Updating...' : 'Publishing...') : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        )}
      </div>
    </ModalWrapper>
  );
};

export default CreateListingModal;
