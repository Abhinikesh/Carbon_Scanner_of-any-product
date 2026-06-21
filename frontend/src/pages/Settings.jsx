import React, { useState } from 'react';
import { User as UserIcon, Mail, Bell, Moon, Save, CheckCircle2 } from 'lucide-react';
import { Toast } from '../App.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm]         = useState({ name: user?.name || '', email: user?.email || '' });
  const [notifications, setNotifications] = useState(true);
  const [darkMode,       setDarkMode]      = useState(false);
  const [toast,          setToast]         = useState(null);
  const [saved,          setSaved]         = useState(false);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setSaved(false);
  }

  function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setToast({ msg: 'Name and email cannot be empty.', type: 'error' });
      return;
    }
    setSaved(true);
    setToast({ msg: 'Settings saved successfully!', type: 'success' });
  }

  return (
    <div className="px-10 pt-8 pb-10 max-w-2xl">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      <header className="mb-8">
        <h1 className="text-[36px] font-bold text-black leading-tight mb-2">Settings</h1>
        <p className="text-gray-500 text-sm">Manage your profile, preferences, and account options.</p>
      </header>

      {/* Profile */}
      <form onSubmit={handleSave}>
        <div className="bg-white rounded-xl p-6 mb-5">
          <h2 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#1a3d2b]" /> Profile Settings
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] transition-all"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#1a3d2b]/20 focus:border-[#1a3d2b] transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="bg-white rounded-xl p-6 mb-5">
          <h2 className="font-bold text-gray-900 mb-5">Preferences</h2>
          <div className="space-y-4">
            {/* Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#f0f5f2] rounded-lg flex items-center justify-center">
                  <Bell className="w-[18px] h-[18px] text-[#1a3d2b]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Push Notifications</p>
                  <p className="text-xs text-gray-400">Get notified when a scan completes</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setNotifications(v => !v)}
                className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? 'bg-[#1a3d2b]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${notifications ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>

            {/* Dark Mode */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[#f0f5f2] rounded-lg flex items-center justify-center">
                  <Moon className="w-[18px] h-[18px] text-[#1a3d2b]" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-gray-900">Dark Mode</p>
                  <p className="text-xs text-gray-400">Switch to a dark theme interface</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDarkMode(v => !v)}
                className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-[#1a3d2b]' : 'bg-gray-200'}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${darkMode ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Save */}
        <button
          type="submit"
          className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl text-sm transition-all ${
            saved
              ? 'bg-[#00c896] text-white'
              : 'bg-[#1a3d2b] hover:bg-[#14301f] text-white'
          }`}
        >
          {saved
            ? <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            : <><Save className="w-4 h-4" /> Save Changes</>
          }
        </button>
      </form>
    </div>
  );
}
