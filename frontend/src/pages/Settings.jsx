import React, { useState, useEffect } from 'react';
import { User as UserIcon, Mail, Bell, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../lib/api';
import ErrorBanner from '../components/common/ErrorBanner.jsx';

export default function Settings() {
  const { user, refreshUser } = useAuth();
  
  // Controlled form states
  const [name, setName] = useState(user?.name || '');
  const [pushNotifications, setPushNotifications] = useState(user?.preferences?.pushNotifications ?? true);
  
  // UX states
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showSavedMsg, setShowSavedMsg] = useState(false);

  // Sync state if user context updates from silent token refresh or other page modifications
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPushNotifications(user.preferences?.pushNotifications ?? true);
    }
  }, [user]);

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) {
      setSaveError('Name cannot be empty.');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setShowSavedMsg(false);

    try {
      await api.put('/users/me', {
        name: name.trim(),
        preferences: {
          pushNotifications
        }
      });
      
      // Update AuthContext user details
      await refreshUser();
      
      setShowSavedMsg(true);
    } catch (err) {
      console.error('[Settings] Save error:', err);
      setSaveError(err.response?.data?.message || err.message || 'Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  }

  // Fade out saved success text after 3 seconds
  useEffect(() => {
    if (showSavedMsg) {
      const timer = setTimeout(() => setShowSavedMsg(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedMsg]);

  return (
    <div className="px-6 md:px-10 pt-8 pb-10 max-w-2xl min-h-screen bg-paper">
      <header className="mb-8">
        <h1 className="text-[32px] font-bold text-ink leading-tight mb-2 font-display">Settings</h1>
        <p className="text-gray-500 text-sm font-body">Manage your profile, preferences, and carbon intelligence options.</p>
      </header>

      {saveError && <ErrorBanner message={saveError} />}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Details Card */}
        <div className="bg-white border border-mist rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-ink text-sm mb-5 font-display flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-forest" /> Profile Settings
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide font-display">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                className="w-full border border-mist rounded-xl px-4 py-2.5 text-sm text-ink bg-gray-50 focus:outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest transition-all font-body"
                placeholder="Your full name"
              />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide font-display">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  value={user?.email || ''}
                  readOnly
                  disabled
                  className="w-full border border-mist rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-500 bg-gray-100 cursor-not-allowed font-body"
                  placeholder="your@email.com"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-1 font-body">Email changes aren't supported yet.</p>
            </div>
          </div>
        </div>

        {/* Preferences Toggle Card */}
        <div className="bg-white border border-mist rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-ink text-sm mb-5 font-display">Preferences</h2>
          <div className="space-y-4">
            
            {/* Push Notifications Toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-forest/5 rounded-lg flex items-center justify-center">
                  <Bell className="w-[18px] h-[18px] text-forest" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-ink font-body">Push Notifications</p>
                  <p className="text-xs text-gray-400 font-body">Get notified when a scan completes</p>
                </div>
              </div>
              <button
                type="button"
                disabled={isSaving}
                onClick={() => setPushNotifications(v => !v)}
                className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-2 focus:ring-forest/20 cursor-pointer ${
                  pushNotifications ? 'bg-forest' : 'bg-gray-200'
                }`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${
                  pushNotifications ? 'left-5' : 'left-0.5'
                }`} />
              </button>
            </div>
            
          </div>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className={`flex items-center gap-2 font-bold px-6 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-forest/20 cursor-pointer ${
              showSavedMsg
                ? 'bg-emerald-600 text-white'
                : 'bg-forest hover:bg-forest-dark text-white'
            } disabled:opacity-70`}
          >
            {isSaving ? (
              'Saving...'
            ) : showSavedMsg ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </button>
          
          {showSavedMsg && (
            <span className="text-emerald-600 font-semibold text-xs animate-fade-in font-body">
              Preferences updated!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
