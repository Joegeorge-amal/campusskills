import React, { useState, useEffect } from 'react';
import { adminSettingsData } from '../../data/adminDashboardData';
import { IconShieldCheck, IconLoader2, IconDeviceFloppy } from '@tabler/icons-react';
import adminService from '../../services/adminService';
import '../../styles/admin.css';

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // We keep original settings to track dirty state
  const [originalSettings, setOriginalSettings] = useState(null);
  
  // Current edited settings
  const [accessLive, setAccessLive] = useState(true);
  const [platformConfig, setPlatformConfig] = useState({});
  const [notificationConfig, setNotificationConfig] = useState({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getSettings();
      
      const pAccess = data.platformAccess?.isLive ?? true;
      const pSettings = data.platformSettings || {};
      const nSettings = data.notificationSettings || {};

      setAccessLive(pAccess);
      setPlatformConfig(pSettings);
      setNotificationConfig(nSettings);

      setOriginalSettings({
        platformAccess: { isLive: pAccess },
        platformSettings: { ...pSettings },
        notificationSettings: { ...nSettings }
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
      setError('Failed to load settings from server.');
    } finally {
      setLoading(false);
    }
  };

  const isDirty = () => {
    if (!originalSettings) return false;
    
    if (accessLive !== originalSettings.platformAccess.isLive) return true;
    
    if (JSON.stringify(platformConfig) !== JSON.stringify(originalSettings.platformSettings)) return true;
    if (JSON.stringify(notificationConfig) !== JSON.stringify(originalSettings.notificationSettings)) return true;
    
    return false;
  };

  const handleSave = async () => {
    if (!isDirty()) return;

    try {
      setSaving(true);
      const payload = {
        platformAccess: { isLive: accessLive },
        platformSettings: platformConfig,
        notificationSettings: notificationConfig
      };

      await adminService.updateSettings(payload);
      
      // Update original settings to reflect successful save
      setOriginalSettings(payload);
      // Could show a toast here in a real app
    } catch (err) {
      console.error('Failed to save settings:', err);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const togglePlatform = (id) => {
    setPlatformConfig(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNotification = (id) => {
    setNotificationConfig(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDangerAction = (actionName) => {
    alert(`Coming Soon: ${actionName} is not yet implemented.`);
  };

  if (loading) {
    return (
      <div className="admin-settings-page fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <IconLoader2 className="spinner" size={32} color="#2563eb" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-settings-page fade-in" style={{ padding: '32px', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  return (
    <div className="admin-settings-page fade-in">
      <div className="admin-settings-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2>System Settings</h2>
        <button 
          className="ast-save-btn" 
          disabled={!isDirty() || saving}
          onClick={handleSave}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            padding: '10px 20px', 
            background: isDirty() ? '#2563eb' : '#94a3b8', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px',
            cursor: isDirty() && !saving ? 'pointer' : 'not-allowed',
            fontWeight: 600,
            transition: 'all 0.2s'
          }}
        >
          {saving ? <IconLoader2 className="spinner" size={18} /> : <IconDeviceFloppy size={18} />}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="admin-settings-layout">
        {/* Left Column */}
        <div className="ast-column-main">
          
          {/* Platform Access Card */}
          <div className="ast-panel ast-panel-access">
            <div className="ast-access-icon">
              <IconShieldCheck size={24} color="#ffffff" />
            </div>
            <div className="ast-access-content">
              <h3>{adminSettingsData.platformAccess.title}</h3>
              <p>{adminSettingsData.platformAccess.description}</p>
              <div className="ast-access-badge">{accessLive ? 'Platform is LIVE' : 'Platform is PAUSED'}</div>
            </div>
            <div className="ast-access-toggle">
              <label className="admin-toggle">
                <input type="checkbox" checked={accessLive} onChange={() => setAccessLive(!accessLive)} />
                <span className="admin-slider"></span>
              </label>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="ast-panel">
            <div className="ast-panel-header">
              <h3>Platform Settings</h3>
            </div>
            <div className="ast-list">
              {adminSettingsData.platformSettings.map(setting => (
                <div key={setting.id} className="ast-list-item">
                  <div className="ast-item-info">
                    <div className="ast-item-title">{setting.title}</div>
                    <div className="ast-item-desc">{setting.description}</div>
                  </div>
                  <label className="admin-toggle">
                    <input 
                      type="checkbox" 
                      checked={!!platformConfig[setting.id]} 
                      onChange={() => togglePlatform(setting.id)} 
                    />
                    <span className="admin-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="ast-panel">
            <div className="ast-panel-header">
              <h3>Notification Settings</h3>
            </div>
            <div className="ast-list">
              {adminSettingsData.notificationSettings.map(setting => (
                <div key={setting.id} className="ast-list-item">
                  <div className="ast-item-info">
                    <div className="ast-item-title">{setting.title}</div>
                    <div className="ast-item-desc">{setting.description}</div>
                  </div>
                  <label className="admin-toggle">
                    <input 
                      type="checkbox" 
                      checked={!!notificationConfig[setting.id]} 
                      onChange={() => toggleNotification(setting.id)} 
                    />
                    <span className="admin-slider"></span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="ast-panel ast-danger-zone">
            <div className="ast-panel-header ast-danger-header">
              <h3>Danger Zone</h3>
              <p>These actions are irreversible. Proceed with extreme caution.</p>
            </div>
            <div className="ast-danger-actions">
              <button className="ast-btn-danger-outline" onClick={() => handleDangerAction('Clear All Sessions')}>Clear All Sessions</button>
              <button className="ast-btn-danger-outline" onClick={() => handleDangerAction('Export All Data')}>Export All Data</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
