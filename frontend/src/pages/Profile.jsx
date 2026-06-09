import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import { 
  IconCheck, 
  IconCalendarEvent, 
  IconStarFilled, 
  IconSparkles, 
  IconShieldCheck,
  IconShieldCheckFilled,
  IconPlus,
  IconMapPin,
  IconCircle,
  IconCamera
} from '@tabler/icons-react';
import SkillQuizModal from '../components/modals/SkillQuizModal';
import CreateSessionModal from '../components/modals/CreateSessionModal';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { triggerToast } = useAppData();
  const navigate = useNavigate();

  const [newSkill, setNewSkill] = useState('');
  const [activeQuizSkill, setActiveQuizSkill] = useState(null);
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const fileInputRef = useRef(null);

  if (!user) return null;

  // Local mapping to avoid dirtying global state. 
  const [verifiedMap, setVerifiedMap] = useState({
    'React.js': { confidence: 85, domain: 'Frontend' },
    'TypeScript': { confidence: 96, domain: 'Language' }
  });

  const topicsOffered = user?.topicsOffered || [];
  
  // Create a default pending set for the UI if user hasn't added much
  const defaultSkills = topicsOffered.length > 0 ? topicsOffered : ['React.js', 'TypeScript', 'Node.js', 'Python'];
  
  const verifiedSkills = defaultSkills.filter(skill => verifiedMap[skill]);
  const pendingSkills = defaultSkills.filter(skill => !verifiedMap[skill]);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AK';

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    if (defaultSkills.includes(newSkill.trim())) {
      triggerToast('Skill already added!');
      return;
    }
    
    try {
      await updateProfile({
        ...user,
        topicsOffered: [...defaultSkills, newSkill.trim()]
      });
      setNewSkill('');
      setIsAddingSkill(false);
      triggerToast('Skill added to pending verification!');
    } catch (err) {
      triggerToast('Failed to add skill.');
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
    reader.onloadend = async () => {
      try {
        await updateProfile({
          ...user,
          avatarImg: reader.result
        });
        triggerToast('Profile photo updated successfully!');
      } catch (err) {
        triggerToast('Failed to update profile photo.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = async (e) => {
    e.stopPropagation();
    try {
      await updateProfile({
        ...user,
        avatarImg: null
      });
      triggerToast('Profile photo removed!');
    } catch (err) {
      triggerToast('Failed to remove profile photo.');
    }
  };

  const handleQuizStart = (skill) => {
    setActiveQuizSkill(skill);
  };

  const handleQuizComplete = (skill, score, domain) => {
    setVerifiedMap(prev => ({
      ...prev,
      [skill]: { confidence: score, domain: domain }
    }));
    setActiveQuizSkill(null);
    triggerToast(`${skill} has been verified successfully!`);
  };

  const totalSkills = defaultSkills.length || 1;
  const verifiedCount = verifiedSkills.length;
  const trustScorePercent = Math.round((verifiedCount / totalSkills) * 100);

  // Common card style scaled down
  const cardStyle = {
    background: '#ffffff', 
    border: '1px solid #e5e7eb', 
    borderRadius: '12px', 
    padding: '20px', 
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
    display: 'flex', 
    flexDirection: 'column'
  };

  return (
    <div id="profile" className="pg on" style={{ padding: 0, background: '#f8fafc', minHeight: '100vh', paddingBottom: '60px' }}>
      
      <SkillQuizModal 
        isOpen={!!activeQuizSkill}
        skillName={activeQuizSkill}
        onClose={() => setActiveQuizSkill(null)}
        onComplete={handleQuizComplete}
      />
      
      <CreateSessionModal 
        isOpen={isCreateSessionOpen} 
        onClose={() => setIsCreateSessionOpen(false)} 
      />

      {/* Blue Banner */}
      <div style={{ height: '140px', background: 'linear-gradient(105deg, #1e3a8a 0%, #3b82f6 55%, #1e3a8a 100%)', width: '100%' }}></div>

      <div style={{ margin: '0 auto', padding: '0 24px', position: 'relative', top: '-48px' }}>
        
        {/* Avatar and Buttons Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
          <div 
            onClick={() => fileInputRef.current?.click()}
            style={{ 
              width: '96px', height: '96px', borderRadius: '50%', background: '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              boxShadow: '0 4px 10px rgba(0,0,0,0.08)', position: 'relative', cursor: 'pointer' 
            }}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              accept="image/*" 
              onChange={handleImageChange}
            />
            <Avatar initials={initials} bg="#eef2ff" color="#1d4ed8" backgroundImage={user?.avatarImg} size="88px" fontSize="32px" />
            <div style={{ position: 'absolute', bottom: '0', right: '0', background: '#fff', borderRadius: '50%', padding: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconCamera size={14} color="#1d4ed8"/>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
            {user?.avatarImg && (
              <button 
                onClick={handleRemovePhoto}
                style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #ef4444', background: '#ffffff', color: '#ef4444', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Remove Photo
              </button>
            )}
            <button 
              onClick={() => navigate('/app/edit-profile')} 
              style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid #1d4ed8', background: '#ffffff', color: '#1d4ed8', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              Edit Profile
            </button>
            <button 
              onClick={() => setIsCreateSessionOpen(true)}
              style={{ padding: '8px 16px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <IconPlus size={16} /> Create Session
            </button>
          </div>
        </div>

        {/* User Info */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
            <div style={{ fontSize: '22px', fontWeight: 700, color: '#111827' }}>{user?.name || "Arjun Kumar"}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '2px 8px', borderRadius: '100px', color: '#059669', fontSize: '11px', fontWeight: 600 }}>
              <IconCheck size={12} strokeWidth={3} /> Verified
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#4b5563', marginBottom: '8px', fontWeight: 500 }}>
            {user?.branch || 'CSE'} Student · {user?.college || 'PESU Bengaluru'}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: '#6b7280', fontWeight: 600 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <IconMapPin size={12} style={{ color: '#ef4444' }} /> {user?.year || '3rd year'}
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              Joined May 2024
            </span>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="glossy-card" style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <IconCalendarEvent size={24} strokeWidth={1.5} style={{ color: '#818cf8', marginBottom: '12px' }} />
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>24</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Sessions</div>
          </div>
          <div className="glossy-card" style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <IconStarFilled size={24} style={{ color: '#fcd34d', marginBottom: '12px' }} />
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>4.9</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Rating</div>
          </div>
          <div className="glossy-card" style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <IconSparkles size={24} strokeWidth={1.5} style={{ color: '#c084fc', marginBottom: '12px' }} />
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>48</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Hours</div>
          </div>
          <div className="glossy-card" style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <IconShieldCheck size={24} strokeWidth={1.5} style={{ color: '#34d399', marginBottom: '12px' }} />
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{verifiedCount}</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Verified</div>
          </div>
        </div>

        {/* Verification Trust Score Card */}
        <div style={{ background: '#3b3fd8', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '40px', color: '#fff', boxShadow: '0 4px 12px rgba(59, 63, 216, 0.2)' }}>
          <div style={{ width: '48px', height: '48px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <IconShieldCheckFilled size={24} color="#fff" />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: 600, opacity: 0.9, marginBottom: '4px' }}>Verification Trust Score</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
              <span style={{ fontSize: '28px', fontWeight: 700 }}>{trustScorePercent}%</span>
              <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 500 }}>{verifiedCount} / {totalSkills} verified</span>
            </div>
            <div style={{ width: '100%', height: '6px', background: 'rgba(255, 255, 255, 0.2)', borderRadius: '100px' }}>
              <div style={{ width: `${trustScorePercent}%`, height: '100%', background: '#fff', borderRadius: '100px' }}></div>
            </div>
          </div>
        </div>

        {/* My Skills Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>My Skills</div>
            <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Verify your skills to boost your profile credibility and attract more students.</div>
          </div>
          {!isAddingSkill && (
            <button 
              onClick={() => setIsAddingSkill(true)}
              style={{ padding: '8px 16px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)' }}
            >
              <IconPlus size={14} strokeWidth={2.5} /> Add Skill
            </button>
          )}
        </div>

        {/* Add Skill Flow Inline */}
        {isAddingSkill && (
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #f3f4f6', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)' }}>
            <input 
              type="text" 
              placeholder="Enter skill name..." 
              value={newSkill} 
              onChange={e => setNewSkill(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#ffffff', fontSize: '12px', color: '#111827', outline: 'none' }}
              autoFocus
            />
            <button 
              onClick={handleAddSkill}
              style={{ padding: '0 16px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Add & Verify
            </button>
            <button 
              onClick={() => setIsAddingSkill(false)}
              style={{ padding: '0 16px', borderRadius: '100px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#4b5563', fontSize: '12px', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Verified Skills Section */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ background: '#ecfdf5', borderRadius: '50%', padding: '2px' }}>
              <IconCheck size={14} strokeWidth={3} style={{ color: '#10b981' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Verified Skills</span>
            <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{verifiedCount}</span>
          </div>

          {verifiedCount === 0 ? (
            <div style={{ ...cardStyle, padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
              You haven't verified any skills yet.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {verifiedSkills.map((skill, i) => {
                const meta = verifiedMap[skill];
                return (
                  <div key={i} className="glossy-card" style={{ ...cardStyle, border: '1px solid #e5e7eb' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{skill}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#1d4ed8', marginBottom: '20px', marginLeft: '14px', fontWeight: 600 }}>{meta.domain || 'General'}</div>
                    
                    <div style={{ marginBottom: '20px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Confidence Score</span>
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 700 }}>{meta.confidence}%</span>
                      </div>
                      <div style={{ width: '100%', height: '4px', background: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${meta.confidence}%`, height: '100%', background: '#10b981', borderRadius: '2px' }}></div>
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleQuizStart(skill)}
                        style={{ background: 'none', border: 'none', color: '#1d4ed8', fontSize: '11px', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                      >
                        Retake Quiz →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Verification Section */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ background: '#fef3c7', borderRadius: '50%', padding: '2px' }}>
              <IconCircle size={14} strokeWidth={3} style={{ color: '#f59e0b' }} />
            </div>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Pending Verification</span>
            <span style={{ fontSize: '11px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '100px', fontWeight: 600 }}>{pendingSkills.length}</span>
          </div>

          {pendingSkills.length === 0 ? (
            <div style={{ ...cardStyle, padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
              No pending skills.
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
              {pendingSkills.map((skill, i) => (
                <div key={i} className="glossy-card" style={{ ...cardStyle, border: '1px solid #fde047', background: '#fffbeb' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f59e0b' }}></div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{skill}</div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', marginBottom: '16px', marginLeft: '14px', fontWeight: 600 }}>{skill === 'Node.js' ? 'Specialist' : 'Language'}</div>
                  
                  <div style={{ fontSize: '11px', color: '#d97706', marginBottom: '24px', marginLeft: '14px', fontWeight: 600 }}>Not Verified</div>

                  <div style={{ marginTop: 'auto' }}>
                    <button 
                      onClick={() => handleQuizStart(skill)}
                      style={{ width: '100%', padding: '12px', borderRadius: '100px', border: 'none', background: '#1d4ed8', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s' }}
                      onMouseOver={(e) => { e.currentTarget.style.background = '#1e40af' }}
                      onMouseOut={(e) => { e.currentTarget.style.background = '#1d4ed8' }}
                    >
                      Start Verification Quiz
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Profile;
