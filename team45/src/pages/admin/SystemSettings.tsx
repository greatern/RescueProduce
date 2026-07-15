import React from 'react';
import { Settings, User, Shield,Database, AlertTriangle } from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = React.useState({
    inactivityPeriod: '1 year',
    failedLoginAttempts: 5,
    requireNgoVerification: true,
    requireVolunteerCert: true,
    emergencyMode: false
  });

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const activateEmergencyMode = () => {

    setSettings(prev => ({
      ...prev,
      emergencyMode: true
    }));
    alert('Emergency mode activated! All users will be notified and high-risk zones suspended.');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        <Settings className="inline mr-2" />
        System Configuration
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-4">
            <User className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="font-semibold">Account Policies</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Inactivity Period Before Anonymization
              </label>
              <select 
                name="inactivityPeriod"
                value={settings.inactivityPeriod}
                onChange={handleSettingChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"
              >
                <option value="6 months">6 months</option>
                <option value="1 year">1 year (default)</option>
                <option value="2 years">2 years</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                After this period, inactive user data will be anonymized 
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Failed Login Attempts Before Lockout
              </label>
              <input 
                type="number" 
                name="failedLoginAttempts"
                value={settings.failedLoginAttempts}
                onChange={handleSettingChange}
                min="1"
                max="10"
                className="mt-1 block w-full shadow-sm sm:text-sm focus:ring-emerald-500 focus:border-emerald-500 border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

       <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="font-semibold">Verification Rules</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center">
              <input 
                id="ngo-verification" 
                name="requireNgoVerification"
                type="checkbox" 
                checked={settings.requireNgoVerification}
                onChange={handleSettingChange}
                className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
              />
              <label htmlFor="ngo-verification" className="ml-2 block text-sm text-gray-700">
                Require NGO document verification
              </label>
            </div>
            <div className="flex items-center">
              <input 
                id="volunteer-cert" 
                name="requireVolunteerCert"
                type="checkbox" 
                checked={settings.requireVolunteerCert}
                onChange={handleSettingChange}
                className="focus:ring-emerald-500 h-4 w-4 text-emerald-600 border-gray-300 rounded"
              />
              <label htmlFor="volunteer-cert" className="ml-2 block text-sm text-gray-700">
                Require volunteer certifications
              </label>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-4">
            <Database className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="font-semibold">Data Management</h2>
          </div>
          <div className="space-y-3">
            <button className="w-full text-left px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">
              Export All Data (For compliance reporting)
            </button>
            <button className="w-full text-left px-3 py-2 bg-gray-100 rounded text-sm hover:bg-gray-200">
              Run Anonymization Process
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-5 w-5 mr-2 text-gray-500" />
            <h2 className="font-semibold">Emergency Protocols</h2>
          </div>
          <div className="space-y-3">
            <button 
              onClick={activateEmergencyMode}
              disabled={settings.emergencyMode}
              className={`w-full text-left px-3 py-2 rounded text-sm ${
                settings.emergencyMode 
                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              {settings.emergencyMode ? 'Emergency Mode Active' : 'Activate Emergency Mode'}
            </button>
            <div className="text-xs text-gray-500">
              This will cancel all active pickups in selected zones and notify users
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;