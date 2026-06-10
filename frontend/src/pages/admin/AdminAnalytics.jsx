import React from 'react';
import { IconFilter } from '@tabler/icons-react';
import AdminLineChart from '../../components/admin/AdminLineChart';
import { adminAnalyticsStats, adminAnalyticsChartData } from '../../data/adminDashboardData';
import '../../styles/admin.css';

const AdminAnalytics = () => {
  return (
    <div className="admin-analytics-page fade-in">
      
      {/* Filters Toolbar */}
      <div className="admin-analytics-filters">
        <div className="aa-filter-left">
          <div className="aa-filter-btn">
            <IconFilter size={18} color="#2563eb" />
            <span style={{ fontWeight: 600, color: '#0f172a' }}>Filters</span>
          </div>
          <div className="aa-filter-group">
            <label>YEAR</label>
            <select defaultValue="2024">
              <option value="2024">2024</option>
              <option value="2023">2023</option>
            </select>
          </div>
          <div className="aa-filter-group">
            <label>DEPARTMENT</label>
            <select defaultValue="all">
              <option value="all">All Departments</option>
              <option value="cse">Computer Science</option>
              <option value="ece">Electronics</option>
            </select>
          </div>
          <div className="aa-filter-group">
            <label>MONTH</label>
            <select defaultValue="all">
              <option value="all">All Months</option>
              <option value="dec">December</option>
            </select>
          </div>
        </div>
        <div className="aa-filter-right">
          <button className="aa-reset-btn">Reset filters</button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="admin-analytics-stats">
        <div className="aa-stat-card">
          <div className="aa-stat-label">TOTAL REGISTRATIONS</div>
          <div className="aa-stat-val">{adminAnalyticsStats.totalRegistrations.value}</div>
          <div className="aa-stat-sub">{adminAnalyticsStats.totalRegistrations.sub}</div>
        </div>
        <div className="aa-stat-card">
          <div className="aa-stat-label">PEAK MONTH</div>
          <div className="aa-stat-val">{adminAnalyticsStats.peakMonth.value}</div>
          <div className="aa-stat-sub">{adminAnalyticsStats.peakMonth.sub}</div>
        </div>
        <div className="aa-stat-card">
          <div className="aa-stat-label">MONTHLY AVERAGE</div>
          <div className="aa-stat-val">{adminAnalyticsStats.monthlyAvg.value}</div>
          <div className="aa-stat-sub">{adminAnalyticsStats.monthlyAvg.sub}</div>
        </div>
        <div className="aa-stat-card">
          <div className="aa-stat-label">YOY GROWTH</div>
          <div className="aa-stat-val" style={{ color: adminAnalyticsStats.yoyGrowth.color }}>
            {adminAnalyticsStats.yoyGrowth.value}
          </div>
          <div className="aa-stat-sub">{adminAnalyticsStats.yoyGrowth.sub}</div>
        </div>
      </div>

      {/* Line Chart Panel */}
      <div className="admin-panel" style={{ padding: '32px' }}>
        <div className="aa-chart-header">
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#0f172a' }}>Student Registrations Trend</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Jan - Dec · 2024 · All Departments</span>
          </div>
          <div className="aa-chart-badge">+216% YoY</div>
        </div>
        
        <div className="aa-chart-container" style={{ marginTop: '40px' }}>
          <AdminLineChart data={adminAnalyticsChartData} />
        </div>
      </div>

    </div>
  );
};

export default AdminAnalytics;
