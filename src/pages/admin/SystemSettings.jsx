import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Settings, Save, RefreshCw, Shield, Mail, Database,
    Bell, Globe, Server, UserCheck, AlertTriangle, Cpu, CheckCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext.jsx';
import AdminDashboardLayout from '../../layouts/AdminDashboardLayout.jsx';

// Custom Animated Toggle Component
const Toggle = ({ checked, onChange, label, description }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300">
        <div className="flex-1 pr-6">
            <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${checked ? 'bg-indigo-600' : 'bg-gray-200'
                }`}
            role="switch"
            aria-checked={checked}
        >
            <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'
                    }`}
            />
        </button>
    </div>
);

// Custom Input Component with Floating Label
const FloatingInput = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, required = false }) => (
    <div className="relative group">
        {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
        )}
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`block w-full rounded-xl border-0 py-3.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-transparent focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-300 bg-gray-50/50 hover:bg-gray-50 focus:bg-white peer ${Icon ? 'pl-10' : 'pl-4'
                }`}
            placeholder={placeholder || label}
            required={required}
        />
        <label className={`absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-transparent px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rtl:peer-focus:translate-x-1/4 rtl:peer-focus:left-auto ${Icon ? 'left-8' : 'left-3'} pointer-events-none bg-white/80 backdrop-blur-sm rounded-md`}>
            {label}
        </label>
    </div>
);

const SystemSettings = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('general');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [hasChanges, setHasChanges] = useState(false);
    const [initialSettings, setInitialSettings] = useState(null);

    const [settings, setSettings] = useState({
        general: {
            siteName: '',
            siteDescription: '',
            maintenanceMode: false,
            registrationEnabled: true,
            maxFileUploadSize: 50,
            sessionTimeout: 30,
        },
        email: {
            smtpHost: '',
            smtpPort: 587,
            smtpUsername: '',
            smtpPassword: '',
            fromEmail: '',
            fromName: '',
            smtpEnabled: true,
        },
        ai: {
            openaiApiKey: '',
            deepseekApiKey: '',
            defaultModel: 'gpt-3.5-turbo',
            quizGeneration: true,
            contentSummarization: true,
            autoGrading: false,
            chatbot: true,
            maxTokensPerRequest: 4000,
            dailyTokenLimit: 100000,
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
            retentionPeriod: 30,
            autoCleanup: true,
            compressionEnabled: true,
        }
    });

    const tabs = [
        { id: 'general', name: 'General', icon: Globe, desc: 'Basic site configuration' },
        { id: 'security', name: 'Security', icon: Shield, desc: 'Authentication & safety' },
        { id: 'ai', name: 'AI Engine', icon: Cpu, desc: 'Models & capabilities' },
        { id: 'email', name: 'Email (SMTP)', icon: Mail, desc: 'Outbound mail server' },
        { id: 'notifications', name: 'Notifications', icon: Bell, desc: 'Alert preferences' },
        { id: 'database', name: 'Database', icon: Database, desc: 'Backups & retention' },
    ];

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/settings/`, {
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const mergedSettings = { ...settings };

                // Deep merge fetched data into current structure
                Object.keys(data).forEach(category => {
                    if (mergedSettings[category] && data[category]) {
                        mergedSettings[category] = { ...mergedSettings[category], ...data[category] };
                    }
                });

                setSettings(mergedSettings);
                setInitialSettings(JSON.stringify(mergedSettings));
                setHasChanges(false);
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load system settings');
        } finally {
            setLoading(false);
        }
    }, [user.accessToken]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    // Track changes to show save bar
    useEffect(() => {
        if (initialSettings) {
            const current = JSON.stringify(settings);
            setHasChanges(current !== initialSettings);
        }
    }, [settings, initialSettings]);

    const updateSetting = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

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

    const handleSave = async () => {
        if (!hasChanges) return;

        setSaving(true);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/admin/settings/`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });

            if (response.ok) {
                toast.success('Settings synchronized successfully!');
                setInitialSettings(JSON.stringify(settings));
                setHasChanges(false);
            } else {
                const error = await response.json();
                toast.error(error.detail || 'Sync failed');
            }
        } catch (error) {
            toast.error('Network error during sync');
        } finally {
            setSaving(false);
        }
    };

    const renderGeneralSettings = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-indigo-500" />
                    Platform Identity
                </h3>
                <div className="space-y-6">
                    <FloatingInput
                        label="Site Name"
                        value={settings.general.siteName || ''}
                        onChange={(val) => updateSetting('general', 'siteName', val)}
                    />
                    <div className="relative group">
                        <textarea
                            value={settings.general.siteDescription || ''}
                            onChange={(e) => updateSetting('general', 'siteDescription', e.target.value)}
                            rows={3}
                            className="block w-full rounded-xl border-0 py-3.5 pl-4 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 placeholder:text-transparent focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 transition-all duration-300 bg-gray-50/50 hover:bg-gray-50 focus:bg-white resize-none peer"
                            placeholder="Description"
                        />
                        <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white/80 backdrop-blur-sm px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-6 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-3 rounded-md pointer-events-none">
                            Site Description
                        </label>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase text-gray-500 flex items-center">
                        <Database className="w-4 h-4 mr-2" /> Storage Limits
                    </h3>
                    <FloatingInput
                        label="Max File Upload Size (MB)"
                        type="number"
                        value={settings.general.maxFileUploadSize || 0}
                        onChange={(val) => updateSetting('general', 'maxFileUploadSize', parseInt(val) || 0)}
                    />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase text-gray-500 flex items-center">
                        <Shield className="w-4 h-4 mr-2" /> Session Policy
                    </h3>
                    <FloatingInput
                        label="Inactivity Timeout (Minutes)"
                        type="number"
                        value={settings.general.sessionTimeout || 0}
                        onChange={(val) => updateSetting('general', 'sessionTimeout', parseInt(val) || 0)}
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Server className="w-5 h-5 mr-2 text-indigo-500" />
                    Access Control
                </h3>
                <Toggle
                    label="Maintenance Mode"
                    description="Temporarily disable access for all non-admin users. Shows a maintenance page."
                    checked={settings.general.maintenanceMode || false}
                    onChange={(val) => updateSetting('general', 'maintenanceMode', val)}
                />
                <Toggle
                    label="Open Registration"
                    description="Allow new users to create accounts organically without admin invitation."
                    checked={settings.general.registrationEnabled || false}
                    onChange={(val) => updateSetting('general', 'registrationEnabled', val)}
                />
            </div>
        </div>
    );

    const renderSecuritySettings = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-rose-500" />
                    Authentication Policies
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <FloatingInput
                        label="Minimum Password Length"
                        type="number"
                        value={settings.security.passwordMinLength || 8}
                        onChange={(val) => updateSetting('security', 'passwordMinLength', parseInt(val) || 8)}
                    />
                    <div className="relative group">
                        <select
                            value={settings.security.sessionSecurity || 'high'}
                            onChange={(e) => updateSetting('security', 'sessionSecurity', e.target.value)}
                            className="block w-full rounded-xl border-0 py-3.5 pl-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-rose-500 sm:text-sm sm:leading-6 transition-all duration-300 bg-gray-50/50 appearance-none cursor-pointer peer"
                        >
                            <option value="low">Low (Standard Cookie)</option>
                            <option value="medium">Medium (Secure HTTP Only)</option>
                            <option value="high">High (Strict + Short Expiry)</option>
                        </select>
                        <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white/80 backdrop-blur-sm px-2 left-3 rounded-md pointer-events-none">
                            Session strictness
                        </label>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Toggle
                        label="Require Special Characters"
                        description="Passwords must contain symbols (!@#$)."
                        checked={settings.security.requireSpecialChars || false}
                        onChange={(val) => updateSetting('security', 'requireSpecialChars', val)}
                    />
                    <Toggle
                        label="Require Numbers"
                        description="Passwords must contain digits (0-9)."
                        checked={settings.security.requireNumbers || false}
                        onChange={(val) => updateSetting('security', 'requireNumbers', val)}
                    />
                    <Toggle
                        label="Require Uppercase"
                        description="Passwords must contain capital letters."
                        checked={settings.security.requireUppercase || false}
                        onChange={(val) => updateSetting('security', 'requireUppercase', val)}
                    />
                    <Toggle
                        label="Two-Factor Aux (2FA)"
                        description="Force MFA for admin and teacher accounts."
                        checked={settings.security.twoFactorEnabled || false}
                        onChange={(val) => updateSetting('security', 'twoFactorEnabled', val)}
                    />
                </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Globe className="w-5 h-5 mr-2 text-rose-500" />
                    Network Security
                </h3>
                <Toggle
                    label="IP Whitelisting"
                    description="Restrict admin panel access to specific IP ranges only."
                    checked={settings.security.ipWhitelisting || false}
                    onChange={(val) => updateSetting('security', 'ipWhitelisting', val)}
                />
            </div>
        </div>
    );

    const renderAiSettings = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 p-8 rounded-3xl shadow-lg relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md shadow-inner border border-white/20">
                            <Cpu className="w-8 h-8 text-indigo-200" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold tracking-tight text-white">AI Engine Configuration</h3>
                            <p className="text-indigo-200 mt-1 font-medium">Manage LLM integrations, APIs, and feature flags</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="relative group">
                            <input
                                type="password"
                                value={settings.ai.openaiApiKey || ''}
                                onChange={(e) => updateSetting('ai', 'openaiApiKey', e.target.value)}
                                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="block w-full rounded-xl border-0 py-4 pl-4 pr-10 text-white shadow-sm ring-1 ring-inset ring-white/20 placeholder:text-white/30 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6 bg-white/10 backdrop-blur-md transition-all hover:bg-white/15 peer"
                            />
                            <label className="absolute text-sm text-indigo-300 font-medium duration-300 transform -translate-y-4 scale-75 top-2 left-1 bg-transparent px-2 peer-focus:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rounded-md pointer-events-none">
                                OpenAI API Key
                            </label>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <Lock className="h-4 w-4 text-white/50" />
                            </div>
                        </div>

                        <div className="relative group">
                            <input
                                type="password"
                                value={settings.ai.deepseekApiKey || ''}
                                onChange={(e) => updateSetting('ai', 'deepseekApiKey', e.target.value)}
                                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                                className="block w-full rounded-xl border-0 py-4 pl-4 pr-10 text-white shadow-sm ring-1 ring-inset ring-white/20 placeholder:text-white/30 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6 bg-white/10 backdrop-blur-md transition-all hover:bg-white/15 peer"
                            />
                            <label className="absolute text-sm text-indigo-300 font-medium duration-300 transform -translate-y-4 scale-75 top-2 left-1 bg-transparent px-2 peer-focus:text-white peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 rounded-md pointer-events-none">
                                DeepSeek API Key
                            </label>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                                <Lock className="h-4 w-4 text-white/50" />
                            </div>
                        </div>

                        <div className="relative group pt-2">
                            <select
                                value={settings.ai.defaultModel || 'gpt-3.5-turbo'}
                                onChange={(e) => updateSetting('ai', 'defaultModel', e.target.value)}
                                className="block w-full rounded-xl border-0 py-4 pl-4 pr-10 text-white shadow-sm ring-1 ring-inset ring-white/20 focus:ring-2 focus:ring-inset focus:ring-indigo-400 sm:text-sm sm:leading-6 bg-indigo-950/50 backdrop-blur-md appearance-none cursor-pointer hover:bg-indigo-900/50 transition-colors"
                            >
                                <option value="gpt-3.5-turbo" className="bg-indigo-900">GPT-3.5 Turbo (Fast, Standard)</option>
                                <option value="gpt-4" className="bg-indigo-900">GPT-4 (Smartest, High Cost)</option>
                                <option value="deepseek-chat" className="bg-indigo-900">DeepSeek Chat (Alternative)</option>
                            </select>
                            <label className="absolute text-xs text-indigo-300 font-medium uppercase tracking-wider -top-1 left-2 bg-indigo-900/80 backdrop-blur-sm px-2 rounded-full pointer-events-none">
                                Default LLM Routing
                            </label>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-white/50 pt-2">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase text-gray-500">Platform Capabilities</h4>
                    <Toggle label="Quiz Generation" description="Allow teachers to auto-generate assessments." checked={settings.ai.quizGeneration || false} onChange={(val) => updateSetting('ai', 'quizGeneration', val)} />
                    <Toggle label="Notes Summarization" description="AI condenses long lesson materials." checked={settings.ai.contentSummarization || false} onChange={(val) => updateSetting('ai', 'contentSummarization', val)} />
                    <Toggle label="Auto Grading" description="AI assistance for assignment evaluation." checked={settings.ai.autoGrading || false} onChange={(val) => updateSetting('ai', 'autoGrading', val)} />
                    <Toggle label="AI Tutor Chatbot" description="24/7 virtual assistant for students." checked={settings.ai.chatbot || false} onChange={(val) => updateSetting('ai', 'chatbot', val)} />
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h4 className="text-sm font-bold text-gray-900 mb-6 tracking-wide uppercase text-gray-500">Quotas & Economics</h4>
                    <div className="space-y-6">
                        <FloatingInput label="Daily Token Limit (Global)" type="number" value={settings.ai.dailyTokenLimit || 0} onChange={(val) => updateSetting('ai', 'dailyTokenLimit', parseInt(val) || 0)} />
                        <FloatingInput label="Max Tokens per Request" type="number" value={settings.ai.maxTokensPerRequest || 0} onChange={(val) => updateSetting('ai', 'maxTokensPerRequest', parseInt(val) || 0)} />
                        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-indigo-500 mt-0.5 mr-3 shrink-0" />
                                <p className="text-sm text-indigo-800 leading-relaxed">
                                    <strong>Cost Warning:</strong> Lowering the max tokens per request will save costs but may truncate long AI responses.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderEmailSettings = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Mail className="w-5 h-5 mr-2 text-blue-500" />
                    SMTP Server Configuration
                </h3>

                <div className="mb-8">
                    <Toggle
                        label="Enable SMTP Delivery"
                        description="Toggle all outbound emails from the platform. If disabled, notifications will only show in-app."
                        checked={settings.email.smtpEnabled || false}
                        onChange={(val) => updateSetting('email', 'smtpEnabled', val)}
                    />
                </div>

                <div className={`space-y-6 transition-opacity duration-300 ${!settings.email.smtpEnabled ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingInput
                            label="SMTP Host"
                            value={settings.email.smtpHost || ''}
                            onChange={(val) => updateSetting('email', 'smtpHost', val)}
                            placeholder="smtp.mailgun.org"
                        />
                        <FloatingInput
                            label="SMTP Port"
                            type="number"
                            value={settings.email.smtpPort || ''}
                            onChange={(val) => updateSetting('email', 'smtpPort', parseInt(val) || "")}
                            placeholder="587"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingInput
                            label="SMTP Username"
                            value={settings.email.smtpUsername || ''}
                            onChange={(val) => updateSetting('email', 'smtpUsername', val)}
                        />
                        <FloatingInput
                            label="SMTP Password"
                            type="password"
                            value={settings.email.smtpPassword || ''}
                            onChange={(val) => updateSetting('email', 'smtpPassword', val)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                        <FloatingInput
                            label="System Sender Email (From)"
                            value={settings.email.fromEmail || ''}
                            onChange={(val) => updateSetting('email', 'fromEmail', val)}
                            placeholder="noreply@learnsphere.com"
                        />
                        <FloatingInput
                            label="System Sender Name"
                            value={settings.email.fromName || ''}
                            onChange={(val) => updateSetting('email', 'fromName', val)}
                            placeholder="LearnSphere Admin"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNotificationSettings = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Bell className="w-5 h-5 mr-2 text-amber-500" />
                    System Notifications
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase text-gray-500">Channels</h4>
                        <Toggle label="Email Notifications" description="Send alerts via email." checked={settings.notifications.emailNotifications || false} onChange={(val) => updateSetting('notifications', 'emailNotifications', val)} />
                        <Toggle label="Push Notifications" description="Browser push alerts." checked={settings.notifications.pushNotifications || false} onChange={(val) => updateSetting('notifications', 'pushNotifications', val)} />
                        <Toggle label="SMS Notifications" description="Text message alerts (requires Twilio)." checked={settings.notifications.smsNotifications || false} onChange={(val) => updateSetting('notifications', 'smsNotifications', val)} />
                    </div>

                    <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 mb-4 tracking-wide uppercase text-gray-500">Event Triggers</h4>
                        <Toggle label="Deadline Reminders" description="24h warning before assignments due." checked={settings.notifications.deadlineReminders || false} onChange={(val) => updateSetting('notifications', 'deadlineReminders', val)} />
                        <Toggle label="Grade Publications" description="Alerts when teacher finishes grading." checked={settings.notifications.gradeNotifications || false} onChange={(val) => updateSetting('notifications', 'gradeNotifications', val)} />
                        <Toggle label="Forum Replies" description="Alerts for discussion comments." checked={settings.notifications.forumNotifications || false} onChange={(val) => updateSetting('notifications', 'forumNotifications', val)} />
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDatabaseSettings = () => (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
                    <Database className="w-5 h-5 mr-2 text-emerald-500" />
                    Maintenance & Storage
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="relative group">
                        <select
                            value={settings.database.backupFrequency || 'daily'}
                            onChange={(e) => updateSetting('database', 'backupFrequency', e.target.value)}
                            className="block w-full rounded-xl border-0 py-3.5 pl-4 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-200 focus:ring-2 focus:ring-inset focus:ring-emerald-500 sm:text-sm sm:leading-6 transition-all duration-300 bg-gray-50/50 appearance-none cursor-pointer peer"
                        >
                            <option value="hourly">Hourly</option>
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="never">Manual Only</option>
                        </select>
                        <label className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white/80 backdrop-blur-sm px-2 left-3 rounded-md pointer-events-none">
                            Automated Backup Frequency
                        </label>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>

                    <FloatingInput
                        label="Log Retention Period (Days)"
                        type="number"
                        value={settings.database.retentionPeriod || 30}
                        onChange={(val) => updateSetting('database', 'retentionPeriod', parseInt(val) || 30)}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Toggle
                        label="Auto-Cleanup"
                        description="Automatically permanently delete soft-deleted records after 90 days."
                        checked={settings.database.autoCleanup || false}
                        onChange={(val) => updateSetting('database', 'autoCleanup', val)}
                    />
                    <Toggle
                        label="Data Compression"
                        description="Compress aged log table rows to save DB space."
                        checked={settings.database.compressionEnabled || false}
                        onChange={(val) => updateSetting('database', 'compressionEnabled', val)}
                    />
                </div>
            </div>
        </div>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'general': return renderGeneralSettings();
            case 'security': return renderSecuritySettings();
            case 'ai': return renderAiSettings();
            case 'email': return renderEmailSettings();
            case 'notifications': return renderNotificationSettings();
            case 'database': return renderDatabaseSettings();
            default: return null;
        }
    };

    if (loading) {
        return (
            <AdminDashboardLayout>
                <div className="min-h-screen flex items-center justify-center">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full" />
                </div>
            </AdminDashboardLayout>
        );
    }

    return (
        <AdminDashboardLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Environment</h1>
                        <p className="text-sm text-gray-500 mt-1">Configure core infrastructure and AI parameters across the platform</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={initializeDefaults}
                            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                        >
                            Reset Defaults
                        </button>
                        <button
                            onClick={fetchSettings}
                            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                            title="Refresh config"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Modern Sidebar */}
                    <div className="w-full lg:w-64 shrink-0">
                        <nav className="flex flex-col space-y-1 lg:sticky lg:top-8">
                            {tabs.map((tab) => {
                                const isActive = activeTab === tab.id;
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`group relative flex items-center px-4 py-3.5 text-sm font-medium rounded-2xl transition-all duration-200 w-full ${isActive
                                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 lg:translate-x-2'
                                                : 'text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                                            }`}
                                    >
                                        <Icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-indigo-100' : 'text-gray-400 group-hover:text-indigo-500'}`} />
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="truncate">{tab.name}</div>
                                            {!isActive && <div className="text-xs text-gray-400 font-normal truncate mt-0.5">{tab.desc}</div>}
                                        </div>
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Floating Sticky Save Bar */}
            <AnimatePresence>
                {hasChanges && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none flex justify-center lg:ml-72" // offset for main sidebar
                    >
                        <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700 shadow-2xl rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between w-full max-w-3xl pointer-events-auto gap-4">
                            <div className="flex items-center space-x-3 text-emerald-400">
                                <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-400" />
                                <span className="text-sm font-medium text-white">You have unsaved configuration changes</span>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button
                                    onClick={() => {
                                        setSettings(JSON.parse(initialSettings));
                                        setHasChanges(false);
                                    }}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/30 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    {saving ? 'Syncing to Server...' : 'Save Configuration'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AdminDashboardLayout>
    );
};

export default SystemSettings;
