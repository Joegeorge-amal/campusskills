import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Avatar from '../components/common/Avatar';
import { IconCircleCheckFilled, IconEdit, IconPlayerPlayFilled, IconRefresh } from '@tabler/icons-react';
import SkillQuizModal from '../components/modals/SkillQuizModal';

const Profile = () => {
  const { user, avBg, avCol, updateProfile } = useAuth();
  const { triggerToast } = useAppData();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('verified');
  const [newSkill, setNewSkill] = useState('');
  const [activeQuizSkill, setActiveQuizSkill] = useState(null);

  if (!user) return null;

  // Local mapping to avoid dirtying global state. 
  // We treat the first skill in user.topicsOffered as verified, rest as pending for demo purposes.
  const [verifiedMap, setVerifiedMap] = useState({
    'React.js': { confidence: 90, domain: 'Frontend' },
    'Figma UI': { confidence: 85, domain: 'Design' }
  });

  const topicsOffered = user?.topicsOffered || [];
  const verifiedSkills = topicsOffered.filter(skill => verifiedMap[skill]);
  const pendingSkills = topicsOffered.filter(skill => !verifiedMap[skill]);

  const initials = user?.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'AK';

  const handleAddSkill = async () => {
    if (!newSkill.trim()) return;
    if (topicsOffered.includes(newSkill.trim())) {
      triggerToast('Skill already added!');
      return;
    }
    
    try {
      await updateProfile({
        ...user,
        topicsOffered: [...topicsOffered, newSkill.trim()]
      });
      setNewSkill('');
      setActiveTab('pending');
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
    setActiveTab('verified');
    triggerToast(`${skill} has been verified successfully!`);
  };

  return (
    <div id="profile" className="pg on" style={{ padding: '24px', background: '#f9fafb', minHeight: '100vh', maxWidth: '800px', margin: '0 auto' }}>
      
      <SkillQuizModal 
        isOpen={!!activeQuizSkill}
        skillName={activeQuizSkill}
        onClose={() => setActiveQuizSkill(null)}
        onComplete={handleQuizComplete}
      />
      
      {/* Profile Header */}
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <Avatar initials={initials} bg={avBg} color={avCol} backgroundImage={user?.avatarImg} size="80px" fontSize="24px" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{user?.name || "Demo User"}</div>
                <IconCircleCheckFilled style={{ color: '#0ea5e9' }} size={24} />
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                {user ? `${user.year} · ${user.branch} · ${user.college}` : '3rd year · CSE · PESU Bengaluru'}
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563' }}>Verification Trust Score</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669' }}>Good 4.8/5</span>
                  </div>
                  <div style={{ width: '160px', height: '6px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: '96%', height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                  </div>
                </div>

                <div style={{ width: '1px', height: '32px', background: '#e5e7eb' }}></div>

                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#4b5563', marginBottom: '4px' }}>Verified Score</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827' }}>{verifiedSkills.length}/{topicsOffered.length || 1}</div>
                </div>
              </div>

            </div>
          </div>

          <button 
            onClick={() => navigate('/app/edit-profile')} 
            style={{ padding: '8px 16px', borderRadius: '24px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <IconEdit size={16} /> Edit Profile
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '8px' }}>Attended</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>12 <span style={{ fontSize: '14px', fontWeight: 500, color: '#9ca3af' }}>Sessions</span></div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '8px' }}>Average</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>4.9 <span style={{ fontSize: '14px', fontWeight: 500, color: '#9ca3af' }}>Rating</span></div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '8px' }}>Teaching</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{topicsOffered.length} <span style={{ fontSize: '14px', fontWeight: 500, color: '#9ca3af' }}>Skills</span></div>
        </div>
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500, marginBottom: '8px' }}>Verified</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>{verifiedSkills.length} <span style={{ fontSize: '14px', fontWeight: 500, color: '#9ca3af' }}>Skills</span></div>
        </div>
      </div>

      {/* My Skills Section */}
      <div style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>My Skills</div>
      
      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb', marginBottom: '24px' }}>
        <div 
          onClick={() => setActiveTab('verified')}
          style={{ padding: '0 16px 12px', cursor: 'pointer', borderBottom: activeTab === 'verified' ? '2px solid #534AB7' : '2px solid transparent', color: activeTab === 'verified' ? '#534AB7' : '#6b7280', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
        >
          Verified Skills ({verifiedSkills.length})
        </div>
        <div 
          onClick={() => setActiveTab('pending')}
          style={{ padding: '0 16px 12px', cursor: 'pointer', borderBottom: activeTab === 'pending' ? '2px solid #534AB7' : '2px solid transparent', color: activeTab === 'pending' ? '#534AB7' : '#6b7280', fontWeight: 600, fontSize: '14px', transition: 'all 0.2s' }}
        >
          Pending Verification ({pendingSkills.length})
        </div>
      </div>

      {/* Add Skill Flow */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
        <input 
          type="text" 
          placeholder="Enter skill name..." 
          value={newSkill} 
          onChange={e => setNewSkill(e.target.value)}
          onKeyPress={e => e.key === 'Enter' && handleAddSkill()}
          style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', background: '#ffffff', fontSize: '14px', color: '#111827', outline: 'none' }}
        />
        <button 
          onClick={handleAddSkill}
          style={{ padding: '0 24px', borderRadius: '8px', border: 'none', background: '#534AB7', color: '#ffffff', fontSize: '14px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Add & Verify
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {activeTab === 'verified' && (
          verifiedSkills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: '14px' }}>No verified skills yet.</div>
          ) : (
            verifiedSkills.map((skill, i) => {
              const meta = verifiedMap[skill] || { confidence: 80, domain: 'General' };
              return (
                <div key={i} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{skill}</div>
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: '#f3f4f6', color: '#4b5563', fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                        {meta.domain}
                      </span>
                    </div>
                    
                    <div style={{ maxWidth: '300px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 500 }}>Confidence Score</span>
                        <span style={{ fontSize: '12px', color: '#059669', fontWeight: 700 }}>{meta.confidence}%</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: `${meta.confidence}%`, height: '100%', background: '#10b981', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleQuizStart(skill)}
                    style={{ padding: '8px 16px', borderRadius: '24px', border: '1px solid #e5e7eb', background: '#ffffff', color: '#374151', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <IconRefresh size={16} /> Retake Quiz
                  </button>
                </div>
              );
            })
          )
        )}

        {activeTab === 'pending' && (
          pendingSkills.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#9ca3af', fontSize: '14px' }}>No pending skills.</div>
          ) : (
            pendingSkills.map((skill, i) => (
              <div key={i} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#eab308' }}></div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{skill}</div>
                </div>

                <button 
                  onClick={() => handleQuizStart(skill)}
                  style={{ padding: '8px 16px', borderRadius: '24px', border: 'none', background: '#f5f4ff', color: '#534AB7', fontSize: '13px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <IconPlayerPlayFilled size={14} /> Start Verification Quiz
                </button>
              </div>
            ))
          )
        )}
      </div>

    </div>
  );
};

export default Profile;
