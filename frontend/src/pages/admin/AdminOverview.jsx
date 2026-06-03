import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IconChevronRight, IconCode, IconPalette, IconLanguage } from '@tabler/icons-react';

const AdminOverview = () => {
  const navigate = useNavigate();

  return (
    <div id="adm-overview" className="pg on">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '11px', marginBottom: '11px' }}>
        <div className="scard" style={{ background: '#534AB7', color: '#fff' }}>
          <div style={{ fontSize: '12px', color: '#AFA9EC' }}>Total Platform Revenue</div>
          <div style={{ fontSize: '24px', fontWeight: 600, marginTop: '3px' }}>₹42,500</div>
          <div style={{ fontSize: '11px', color: '#AFA9EC', marginTop: '7px' }}>+12% this month</div>
        </div>
        <div className="scard" style={{ background: '#0F6E56', color: '#fff' }}>
          <div style={{ fontSize: '12px', color: '#88D1B6' }}>Active Sessions Today</div>
          <div style={{ fontSize: '24px', fontWeight: 600, marginTop: '3px' }}>128</div>
          <div style={{ fontSize: '11px', color: '#88D1B6', marginTop: '7px' }}>45 paid · 83 swaps</div>
        </div>
      </div>
      
      <div className="r2">
        <div className="card">
          <div className="ch"><span className="ct">Quick Actions</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
            <button 
              onClick={() => navigate('/app/admin/reports')} 
              style={{ padding: '12px', borderRadius: '9px', border: 'none', background: '#FAECE7', color: '#993C1D', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>Review 3 Open Reports</span>
              <IconChevronRight />
            </button>
            <button 
              onClick={() => navigate('/app/admin/users')} 
              style={{ padding: '12px', borderRadius: '9px', border: 'none', background: '#F5F4FF', color: '#534AB7', fontSize: '12px', fontWeight: 500, cursor: 'pointer', display: 'flex', justifyContent: 'space-between' }}
            >
              <span>Verify 12 New Tutors</span>
              <IconChevronRight />
            </button>
          </div>
        </div>

        <div className="card">
          <div className="ch"><span className="ct">Top Categories</span></div>
          <div className="hrow">
            <div className="hico" style={{ background: '#E6F1FB', color: '#0C447C' }}><IconCode /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>React.js basics</div>
              <div style={{ fontSize: '11px', color: '#888' }}>42 sessions</div>
            </div>
            <span className="cpill c-code">Coding</span>
          </div>
          <div className="hrow">
            <div className="hico" style={{ background: '#FBEAF0', color: '#72243E' }}><IconPalette /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>Figma UI Design</div>
              <div style={{ fontSize: '11px', color: '#888' }}>18 sessions</div>
            </div>
            <span className="cpill c-des">Design</span>
          </div>
          <div className="hrow">
            <div className="hico" style={{ background: '#EAF3DE', color: '#27500A' }}><IconLanguage /></div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: 500, color: '#222' }}>Japanese N5</div>
              <div style={{ fontSize: '11px', color: '#888' }}>11 sessions</div>
            </div>
            <span className="cpill c-lan">Language</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
