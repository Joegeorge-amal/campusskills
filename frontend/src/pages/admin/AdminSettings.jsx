import React, { useState } from 'react';
import { adminSettingsData } from '../../data/adminDashboardData';
import { IconShieldCheck } from '@tabler/icons-react';
import '../../styles/admin.css';

const AdminSettings = () => {
  // Local state to handle visual toggles without hardcoding booleans
  const [accessLive, setAccessLive] = useState(adminSettingsData.platformAccess.isLive);
  const [platformConfig, setPlatformConfig] = useState(
    adminSettingsData.platformSettings.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.enabled }), {})
  );
  const [notificationConfig, setNotificationConfig] = useState(
    adminSettingsData.notificationSettings.reduce((acc, curr) => ({ ...acc, [curr.id]: curr.enabled }), {})
  );

  const togglePlatform = (id) => {
    setPlatformConfig(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleNotification = (id) => {
    setNotificationConfig(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="admin-settings-page fade-in">
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
              <div className="ast-access-badge">{adminSettingsData.platformAccess.badge}</div>
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
                      checked={platformConfig[setting.id]} 
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
                      checked={notificationConfig[setting.id]} 
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
              <button className="ast-btn-danger-outline">Clear All Sessions</button>
              <button className="ast-btn-danger-outline">Export All Data</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
