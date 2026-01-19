import { useState } from 'react';
import { User, Bell, Shield, Database, Globe, Moon } from 'lucide-react';

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState('GENERAL');

    const SettingItem = ({ icon: Icon, title, desc, action }: any) => (
        <div className="settings-item card">
            <div className="settings-icon">
                <Icon size={24} />
            </div>
            <div className="settings-info">
                <h4>{title}</h4>
                <p>{desc}</p>
            </div>
            <div className="settings-action">
                {action}
            </div>
        </div>
    );

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>System Settings</h1>
            </div>

            <div className="settings-layout">
                <div className="settings-nav card">
                    <button className={activeTab === 'GENERAL' ? 'active' : ''} onClick={() => setActiveTab('GENERAL')}>
                        <Globe size={18} /> General
                    </button>
                    <button className={activeTab === 'PROFILE' ? 'active' : ''} onClick={() => setActiveTab('PROFILE')}>
                        <User size={18} /> Profile
                    </button>
                    <button className={activeTab === 'SECURITY' ? 'active' : ''} onClick={() => setActiveTab('SECURITY')}>
                        <Shield size={18} /> Security
                    </button>
                    <button className={activeTab === 'NOTIFICATIONS' ? 'active' : ''} onClick={() => setActiveTab('NOTIFICATIONS')}>
                        <Bell size={18} /> Notifications
                    </button>
                    <button className={activeTab === 'DATABASE' ? 'active' : ''} onClick={() => setActiveTab('DATABASE')}>
                        <Database size={18} /> Backup & Sync
                    </button>
                </div>

                <div className="settings-content">
                    {activeTab === 'GENERAL' && (
                        <div className="settings-group">
                            <SettingItem
                                icon={Globe}
                                title="Default Language"
                                desc="Set the interface language for the dashboard."
                                action={<select className="select-filter"><option>English</option><option>Thai</option></select>}
                            />
                            <SettingItem
                                icon={Moon}
                                title="Dark Mode"
                                desc="Toggle between light and dark themes."
                                action={<button className="btn btn-secondary">Toggle</button>}
                            />
                            <SettingItem
                                icon={Shield}
                                title="Tenant Portal"
                                desc="Enable or disable public access to self-upload slips."
                                action={<button className="btn btn-primary">Enabled</button>}
                            />
                        </div>
                    )}
                    {activeTab === 'PROFILE' && (
                        <div className="card">
                            <h3>Profile Information</h3>
                            <div className="form-group mt-1">
                                <label>Display Name</label>
                                <input type="text" className="input-field" defaultValue="Admin User" />
                            </div>
                            <div className="form-group mt-1">
                                <label>Email Address</label>
                                <input type="email" className="input-field" defaultValue="admin@rentcore.com" />
                            </div>
                            <button className="btn btn-primary mt-2">Update Profile</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
