import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronRight, IconCode, IconPalette, IconLanguage } from '@tabler/icons-react';
import StatCard from '../../components/common/StatCard';
import StatusBadge from '../../components/common/StatusBadge';

const AdminOverview = () => {
  const navigate = useNavigate();

  return (
    <div id="adm-overview" className="pg on">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        <StatCard 
          title="Total Platform Revenue" 
          value="₹42,500" 
          subtitle="+12% this month" 
        />
        <StatCard 
          title="Active Sessions Today" 
          value="128" 
          subtitle="45 paid · 83 swaps" 
        />
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Quick Actions Card */}
        <div style={{ background: 'var(--cs-bg-white)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', border: '1px solid var(--cs-border)' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '16px' }}>Quick Actions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={() => navigate('/app/admin/reports')} 
              style={{ padding: '16px', borderRadius: 'var(--cs-radius-md)', border: 'none', background: 'var(--cs-danger-light)', color: 'var(--cs-danger)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>Review 3 Open Reports</span>
              <IconChevronRight size={18} />
            </button>
            <button 
              onClick={() => navigate('/app/admin/users')} 
              style={{ padding: '16px', borderRadius: 'var(--cs-radius-md)', border: 'none', background: 'var(--cs-primary-light)', color: 'var(--cs-primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <span>Verify 12 New Tutors</span>
              <IconChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Top Categories Card */}
        <div style={{ background: 'var(--cs-bg-white)', borderRadius: 'var(--cs-radius-lg)', padding: '24px', border: '1px solid var(--cs-border)' }}>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--cs-text-main)', marginBottom: '16px' }}>Top Categories</div>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid var(--cs-border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--cs-radius-sm)', background: '#E6F1FB', color: '#0C447C', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}><IconCode size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>React.js basics</div>
              <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', marginTop: '4px' }}>42 sessions</div>
            </div>
            <StatusBadge status="Coding" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid var(--cs-border)' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--cs-radius-sm)', background: '#FBEAF0', color: '#72243E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}><IconPalette size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Figma UI Design</div>
              <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', marginTop: '4px' }}>18 sessions</div>
            </div>
            <StatusBadge status="Design" />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', padding: '12px 0' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: 'var(--cs-radius-sm)', background: '#EAF3DE', color: '#27500A', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '16px' }}><IconLanguage size={20} /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--cs-text-main)' }}>Japanese N5</div>
              <div style={{ fontSize: '12px', color: 'var(--cs-text-inactive)', marginTop: '4px' }}>11 sessions</div>
            </div>
            <StatusBadge status="Language" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
