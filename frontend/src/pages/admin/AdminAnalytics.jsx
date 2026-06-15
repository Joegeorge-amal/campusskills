import React, { useState, useEffect } from 'react';
import { IconFilter, IconLoader2 } from '@tabler/icons-react';
import AdminLineChart from '../../components/admin/AdminLineChart';
import AdminSelect from '../../components/admin/AdminSelect';
import adminService from '../../services/adminService';
import '../../styles/admin.css';

const AdminAnalytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    year: new Date().getFullYear().toString(),
    department: 'all',
    month: 'all'
  });

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminService.getAnalyticsData(filters);
      setData(res);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
      setError('Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFilters({
      year: new Date().getFullYear().toString(),
      department: 'all',
      month: 'all'
    });
  };

  if (loading && !data) {
    return (
      <div className="admin-analytics-page fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <IconLoader2 className="spinner" size={32} color="#2563eb" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="admin-analytics-page fade-in" style={{ padding: '32px', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  const { stats, chartData, meta } = data;

  const yearOptions = [
    { value: '2026', label: '2026' }
  ];

  const deptOptions = [
    { value: 'all', label: 'All Departments' },
    { value: 'Computer Science', label: 'Computer Science' },
    { value: 'Electronics', label: 'Electronics' },
    { value: 'BCA', label: 'BCA' },
    { value: 'BBA', label: 'BBA' }
  ];

  const monthOptions = [
    { value: 'all', label: 'All Months' },
    { value: 'jan', label: 'January' },
    { value: 'feb', label: 'February' },
    { value: 'mar', label: 'March' },
    { value: 'apr', label: 'April' },
    { value: 'may', label: 'May' },
    { value: 'jun', label: 'June' },
    { value: 'jul', label: 'July' },
    { value: 'aug', label: 'August' },
    { value: 'sep', label: 'September' },
    { value: 'oct', label: 'October' },
    { value: 'nov', label: 'November' },
    { value: 'dec', label: 'December' }
  ];

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
            <AdminSelect name="year" value={filters.year} options={yearOptions} onChange={handleFilterChange} />
          </div>
          <div className="aa-filter-group">
            <label>DEPARTMENT</label>
            <AdminSelect name="department" value={filters.department} options={deptOptions} onChange={handleFilterChange} />
          </div>
          <div className="aa-filter-group">
            <label>MONTH</label>
            <AdminSelect name="month" value={filters.month} options={monthOptions} onChange={handleFilterChange} />
          </div>
        </div>
        <div className="aa-filter-right">
          <button className="aa-reset-btn" onClick={handleReset}>Reset filters</button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="admin-analytics-stats">
        <div className="aa-stat-card">
          <div className="aa-stat-label">TOTAL REGISTRATIONS</div>
          <div className="aa-stat-val">{stats.totalRegistrations.value}</div>
          <div className="aa-stat-sub">{stats.totalRegistrations.sub}</div>
        </div>
        <div className="aa-stat-card">
          <div className="aa-stat-label">PEAK MONTH</div>
          <div className="aa-stat-val">{stats.peakMonth.value}</div>
          <div className="aa-stat-sub">{stats.peakMonth.sub}</div>
        </div>
        <div className="aa-stat-card">
          <div className="aa-stat-label">MONTHLY AVERAGE</div>
          <div className="aa-stat-val">{stats.monthlyAvg.value}</div>
          <div className="aa-stat-sub">{stats.monthlyAvg.sub}</div>
        </div>
        <div className="aa-stat-card">
          <div className="aa-stat-label">YOY GROWTH</div>
          <div className="aa-stat-val" style={{ color: stats.yoyGrowth.color }}>
            {stats.yoyGrowth.value}
          </div>
          <div className="aa-stat-sub">{stats.yoyGrowth.sub}</div>
        </div>
      </div>

      {/* Line Chart Panel */}
      <div className="admin-panel" style={{ padding: '32px' }}>
        <div className="aa-chart-header">
          <div>
            <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', color: '#0f172a' }}>Student Registrations Trend</h3>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Jan - Dec · {meta.year} · {filters.department === 'all' ? 'All Departments' : filters.department}</span>
          </div>
          <div className="aa-chart-badge">{meta.yoyGrowth}</div>
        </div>
        
        <div className="aa-chart-container" style={{ marginTop: '40px' }}>
          {loading ? (
             <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
               <IconLoader2 className="spinner" size={24} color="#2563eb" />
             </div>
          ) : (
            <AdminLineChart data={chartData} />
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminAnalytics;
