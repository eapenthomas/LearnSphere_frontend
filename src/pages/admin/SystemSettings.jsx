import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout.jsx';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { toast } from 'react-hot-toast';
import { 
  Settings, 
  Database, 
  Shield, 
  Mail, 
  Bell, 
  Server, 
  Users, 
  FileText,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Globe,
  Lock
} from 'lucide-react';

const SystemSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    general: {
      siteName: 'LearnSphere',
      siteDescription: 'Advanced Learning Management System',
      maintenanceMode: false,
      registrationEnabled: true,
      maxFileUploadSize: 50, // MB
      sessionTimeout: 30, // minutes
    },
    email: {
      smtpEnabled: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUsername: '',
      smtpPassword: '',
      fromEmail: 'noreply@learnsphere.com',
      fromName: 'LearnSphere',
    },
    ai: {
      openaiApiKey: '',
      deepseekApiKey: '',
      defaultModel: 'gpt-3.5-turbo',
      quizGeneration: true,
      contentSummarization: true,
      autoGrading: false,
      chatbot: true,
    },
    security: {
      passwordMinLength: 8,
      requireSpecialChars: true,
      requireNumbers: true,
      requireUppercase: true,
      sessionSecurity: 'high',
      twoFactorEnabled: false,
      ipWhitelisting: false,
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      deadlineReminders: true,
      gradeNotifications: true,
      forumNotifications: true,
    },
    database: {
      backupFrequency: 'daily',
      retentionPeriod: 30, // days
      autoCleanup: true,
      compressionEnabled: true,
    }
  });

  const [activeTab, setActiveTab] = useState('general');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const tabs = [
    { id: 'general', name: 'General', icon: Settings },
    { id: 'security', name: 'Security', icon: Shield },
    { id: 'email', name: 'Email', icon: Mail },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'database', name: 'Database', icon: Database },
    { id: 'ai', name: 'AI Settings', icon: Server },
  ];

  // Fetch settings from backend
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/settings/`, {
        headers: {
          'Authorization': `Bearer ${user?.accessToken || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      } else {
        console.error('Failed to fetch settings');
        toast.error('Failed to load system settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Error loading system settings');
    } finally {
      setLoading(false);
    }
  };

  // Initialize default settings
  const initializeDefaults = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/settings/initialize-defaults`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user?.accessToken || ''}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Default settings initialized');
        await fetchSettings();
      } else {
        toast.error('Failed to initialize default settings');
      }
    } catch (error) {
      console.error('Error initializing defaults:', error);
      toast.error('Error initializing default settings');
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/settings/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.accessToken || ''}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        setSaved(true);
        toast.success('Settings saved successfully');
        setTimeout(() => setSaved(false), 3000);
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
        <input
          type="text"
          value={settings.general.siteName}
          onChange={(e) => updateSetting('general', 'siteName', e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Max File Upload Size (MB)</label>
          <input
            type="number"
            value={settings.general.maxFileUploadSize}
            onChange={(e) => updateSetting('general', 'maxFileUploadSize', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.general.sessionTimeout}
            onChange={(e) => updateSetting('general', 'sessionTimeout', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">Maintenance Mode</h4>
            <p className="text-gray-400 text-sm">Temporarily disable site access for maintenance</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general.maintenanceMode}
              onChange={(e) => updateSetting('general', 'maintenanceMode', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium">User Registration</h4>
            <p className="text-gray-400 text-sm">Allow new users to register accounts</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general.registrationEnabled}
              onChange={(e) => updateSetting('general', 'registrationEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Minimum Password Length</label>
          <input
            type="number"
            value={settings.security.passwordMinLength}
            onChange={(e) => updateSetting('security', 'passwordMinLength', parseInt(e.target.value))}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">Session Security Level</label>
          <select
            value={settings.security.sessionSecurity}
            onChange={(e) => updateSetting('security', 'sessionSecurity', e.target.value)}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'requireSpecialChars', label: 'Require Special Characters', desc: 'Passwords must contain special characters' },
          { key: 'requireNumbers', label: 'Require Numbers', desc: 'Passwords must contain numbers' },
          { key: 'requireUppercase', label: 'Require Uppercase', desc: 'Passwords must contain uppercase letters' },
          { key: 'twoFactorEnabled', label: 'Two-Factor Authentication', desc: 'Enable 2FA for enhanced security' },
          { key: 'ipWhitelisting', label: 'IP Whitelisting', desc: 'Restrict access to specific IP addresses' },
        ].map((setting) => (
          <div key={setting.key} className="flex items-center justify-between">
            <div>
              <h4 className="text-white font-medium">{setting.label}</h4>
              <p className="text-gray-400 text-sm">{setting.desc}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.security[setting.key]}
                onChange={(e) => updateSetting('security', setting.key, e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'security':
        return renderSecuritySettings();
      case 'email':
        return (
          <div className="space-y-6">
            <div className="text-white">
              <h3 className="text-lg font-medium mb-4">Email Configuration</h3>
              <p className="text-gray-400 mb-6">Configure SMTP settings for email notifications</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">SMTP Host</label>
                  <input
                    type="text"
                    value={settings.email.smtpHost}
                    onChange={(e) => updateSetting('email', 'smtpHost', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2">SMTP Port</label>
                  <input
                    type="number"
                    value={settings.email.smtpPort}
                    onChange={(e) => updateSetting('email', 'smtpPort', parseInt(e.target.value))}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        );
      case 'ai':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-4">AI Configuration</h3>
              <p className="text-gray-600 mb-6">Configure AI services and API settings</p>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">OpenAI API Key</label>
                  <input
                    type="password"
                    value={settings.ai?.openaiApiKey || ''}
                    onChange={(e) => updateSetting('ai', 'openaiApiKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Used for AI-powered features like quiz generation</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">DeepSeek API Key</label>
                  <input
                    type="password"
                    value={settings.ai?.deepseekApiKey || ''}
                    onChange={(e) => updateSetting('ai', 'deepseekApiKey', e.target.value)}
                    placeholder="sk-..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">Alternative AI provider for cost optimization</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default AI Model</label>
                  <select
                    value={settings.ai?.defaultModel || 'gpt-3.5-turbo'}
                    onChange={(e) => updateSetting('ai', 'defaultModel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                    <option value="deepseek-chat">DeepSeek Chat</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <h4 className="text-md font-medium text-gray-700">AI Features</h4>
                  {[
                    { key: 'quizGeneration', label: 'AI Quiz Generation', desc: 'Enable AI-powered quiz creation' },
                    { key: 'contentSummarization', label: 'Content Summarization', desc: 'AI-powered content summaries' },
                    { key: 'autoGrading', label: 'Auto Grading', desc: 'AI assistance for assignment grading' },
                    { key: 'chatbot', label: 'AI Chatbot', desc: 'Virtual assistant for students' },
                  ].map((feature) => (
                    <div key={feature.key} className="flex items-center justify-between">
                      <div>
                        <h5 className="text-sm font-medium text-gray-700">{feature.label}</h5>
                        <p className="text-sm text-gray-500">{feature.desc}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.ai?.[feature.key] || false}
                          onChange={(e) => updateSetting('ai', feature.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-12">
            <Settings className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">Settings Panel</h3>
            <p className="text-gray-600">Select a category to configure system settings</p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <AdminDashboardLayout>
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <RefreshCw className="mx-auto h-8 w-8 text-blue-600 animate-spin mb-4" />
              <p className="text-gray-600">Loading system settings...</p>
            </div>
          </div>
        </div>
      </AdminDashboardLayout>
    );
  }

  return (
    <AdminDashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">System Settings</h1>
              <p className="text-gray-600">Configure and manage system-wide settings</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={initializeDefaults}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Initialize Defaults
              </button>
              <button
                onClick={fetchSettings}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 inline mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              {renderContent()}
              
              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {saved && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center text-green-400"
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Settings saved successfully
                      </motion.div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {saving ? 'Saving...' : 'Save Settings'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default SystemSettings;
