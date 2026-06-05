import React, { useState } from 'react';
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
  IconCircle
} from '@tabler/icons-react';
import SkillQuizModal from '../components/modals/SkillQuizModal';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const { triggerToast } = useAppData();
  const navigate = useNavigate();

  const [newSkill, setNewSkill] = useState('');
  const [activeQuizSkill, setActiveQuizSkill] = useState(null);
  const [isAddingSkill, setIsAddingSkill] = useState(false);

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

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'SU';

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
    border: '1px solid #f3f4f6', 
    borderRadius: '10px', 
    padding: '16px', 
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
    display: 'flex', 
    flexDirection: 'column'
  };

  return (
    <div id="profile" className="pg on" style={{ padding: 0, background: '#f4f5f9', minHeight: '100vh' }}>
      
      <SkillQuizModal 
        isOpen={!!activeQuizSkill}
        skillName={activeQuizSkill}
        onClose={() => setActiveQuizSkill(null)}
        onComplete={handleQuizComplete}
      />

      {/* Full Bleed Profile Header Background */}
      <div style={{ background: '#2E2974', color: '#ffffff', padding: '32px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Top Info Area */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <div style={{ background: '#ffffff', borderRadius: '50%', padding: '2px' }}>
                <Avatar initials={initials} bg="#eef2ff" color="#312e81" backgroundImage={user?.avatarImg} size="48px" fontSize="16px" />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <div style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.3px' }}>{user?.name || "Student User"}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '12px', color: '#34d399', fontSize: '10px', fontWeight: 600 }}>
                    <IconCheck size={12} strokeWidth={3} /> Verified
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', marginBottom: '4px', fontWeight: 400 }}>
                  {user?.branch || 'CSE'} Student · {user?.college || 'PESU Bengaluru'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <IconMapPin size={12} /> {user?.year || '3rd year'}
                  </span>
                  <span>· Joined May 2024</span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => navigate('/app/edit-profile')} 
              style={{ padding: '6px 16px', borderRadius: '16px', border: '1px solid rgba(255, 255, 255, 0.3)', background: 'transparent', color: '#ffffff', fontSize: '12px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)' }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              Edit Profile
            </button>
          </div>

          {/* Verification Trust Score Area - Integrated without box background */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IconShieldCheckFilled size={18} style={{ color: 'rgba(255, 255, 255, 0.8)' }} />
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2px', fontWeight: 500 }}>Verification Trust Score</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, lineHeight: 1 }}>{trustScorePercent}%</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '2px', fontWeight: 500 }}>Verified Score</div>
                  <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: 1 }}>{verifiedCount} / {totalSkills}</div>
                </div>
              </div>
              
              <div style={{ width: '100%', height: '4px', background: 'rgba(255, 255, 255, 0.15)', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ width: `${trustScorePercent}%`, height: '100%', background: '#ffffff', borderRadius: '2px', transition: 'width 0.5s ease-out' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '32px 40px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          
          {/* Top Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            <div style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <IconCalendarEvent size={20} strokeWidth={1.5} style={{ color: '#818cf8', marginBottom: '8px' }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>24</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Attended</div>
            </div>
            <div style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <IconStarFilled size={20} style={{ color: '#fcd34d', marginBottom: '8px' }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>4.9</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Average</div>
            </div>
            <div style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <IconSparkles size={20} strokeWidth={1.5} style={{ color: '#60a5fa', marginBottom: '8px' }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>48</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Teaching</div>
            </div>
            <div style={{ ...cardStyle, alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
              <IconShieldCheck size={20} strokeWidth={1.5} style={{ color: '#34d399', marginBottom: '8px' }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '2px' }}>{verifiedCount}</div>
              <div style={{ fontSize: '11px', color: '#6b7280', fontWeight: 500 }}>Skills</div>
            </div>
          </div>

          {/* My Skills Section */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>My Skills</div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Verify your skills to boost your profile credibility.</div>
            </div>
            {!isAddingSkill && (
              <button 
                onClick={() => setIsAddingSkill(true)}
                style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', background: '#534AB7', color: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 8px rgba(83, 74, 183, 0.2)' }}
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
                style={{ padding: '0 16px', borderRadius: '6px', border: 'none', background: '#534AB7', color: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Add & Verify
              </button>
              <button 
                onClick={() => setIsAddingSkill(false)}
                style={{ padding: '0 16px', borderRadius: '6px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#4b5563', fontSize: '12px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Verified Skills Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <IconCheck size={16} strokeWidth={2.5} style={{ color: '#10b981' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Verified Skills</span>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{verifiedCount}</span>
            </div>

            {verifiedCount === 0 ? (
              <div style={{ ...cardStyle, padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                You haven't verified any skills yet.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {verifiedSkills.map((skill, i) => {
                  const meta = verifiedMap[skill];
                  return (
                    <div key={i} style={cardStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{skill}</div>
                      </div>
                      <div style={{ fontSize: '12px', color: '#534AB7', marginBottom: '20px', marginLeft: '12px' }}>{meta.domain || 'General'}</div>
                      
                      <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
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
                          style={{ background: 'none', border: 'none', color: '#534AB7', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        >
                          {skill.includes('React') ? 'React Quiz' : 'Verified Quiz'}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
              <IconCircle size={14} strokeWidth={2.5} style={{ color: '#eab308' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>Pending Verification</span>
              <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: 500 }}>{pendingSkills.length}</span>
            </div>

            {pendingSkills.length === 0 ? (
              <div style={{ ...cardStyle, padding: '24px', textAlign: 'center', color: '#6b7280', fontSize: '12px' }}>
                No pending skills.
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
                {pendingSkills.map((skill, i) => (
                  <div key={i} style={cardStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#eab308' }}></div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>{skill}</div>
                    </div>
                    <div style={{ fontSize: '12px', color: '#534AB7', marginBottom: '16px', marginLeft: '12px' }}>{skill === 'Node.js' ? 'Specialist' : 'Language'}</div>
                    
                    <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '20px', marginLeft: '12px' }}>Not Verified</div>

                    <div style={{ marginTop: 'auto' }}>
                      <button 
                        onClick={() => handleQuizStart(skill)}
                        style={{ width: '100%', padding: '10px', borderRadius: '6px', border: 'none', background: '#534AB7', color: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        onMouseOver={(e) => { e.currentTarget.style.background = '#463e9c' }}
                        onMouseOut={(e) => { e.currentTarget.style.background = '#534AB7' }}
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
    </div>
  );
};

export default Profile;
