import React, { useState, useRef, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  Leaf, Search, Bell, BarChart2, CloudUpload, LayoutGrid,
  Settings, QrCode, X, ChevronDown, User, LogOut, Recycle, Menu,
  Trophy, History
} from 'lucide-react';

import Home         from './pages/Home.jsx';
import UploadCenter from './pages/UploadCenter.jsx';
import RecycleFinder from './pages/RecycleFinder.jsx';
import Dashboard    from './pages/Dashboard.jsx';
import SettingsPage from './pages/Settings.jsx';
import Login        from './pages/Login.jsx';
import Signup       from './pages/Signup.jsx';
import LandingPage  from './pages/LandingPage.jsx';
import Leaderboard  from './pages/Leaderboard.jsx';
import ScanHistory  from './pages/ScanHistory.jsx';

import ProtectedRoute  from './components/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx';
import { useAuth }     from './context/AuthContext.jsx';
import { ScanStatsProvider, useScanStats } from './context/ScanStatsContext.jsx';
import QuickScanModal from './components/QuickScanModal.jsx';

/* ─── NAVBAR ───────────────────────────────────────────────────────────── */
function Navbar({ onMenuClick }) {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const [bellOpen,   setBellOpen]   = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [search,     setSearch]     = useState('');
  const bellRef   = useRef(null);
  const avatarRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handle(e) {
      if (bellRef.current   && !bellRef.current.contains(e.target))   setBellOpen(false);
      if (avatarRef.current && !avatarRef.current.contains(e.target)) setAvatarOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const navLinks = [
    { to: '/app/home',          label: 'Home'          },
    { to: '/app/upload-center', label: 'Upload Center' },
    { to: '/app/recycle',       label: 'Recycle Finder' },
    { to: '/app/dashboard',     label: 'Dashboard'     },
  ];

  const isActive = (to) => {
    if (to === '/app/home') return location.pathname === '/app/home';
    return location.pathname.startsWith(to);
  };

  async function handleLogout() {
    setAvatarOpen(false);
    await logout();
    navigate('/');
  }

  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Felix')}`;

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-white flex items-center justify-between px-6 z-20 border-b border-mist">
      {/* Hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden p-1.5 -ml-1 text-gray-700 hover:text-gray-900 rounded-lg hover:bg-gray-100 focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <Link to="/app/home" className="flex items-center gap-2">
          <div className="w-6 h-6 bg-forest rounded-md flex items-center justify-center flex-shrink-0">
            <Leaf className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-display font-bold text-[17px] text-ink tracking-tight">Climate Lens</span>
        </Link>
      </div>

      {/* Center nav */}
      <div className="hidden md:flex items-center gap-8 text-sm font-medium absolute left-1/2 -translate-x-1/2">
        {navLinks.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`transition-colors pb-0.5 font-body ${
              isActive(to)
                ? 'text-ink font-semibold border-b-2 border-forest'
                : 'text-[#1a7a4a] hover:opacity-80'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden sm:block relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search data..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-4 py-1.5 bg-gray-50 border border-mist rounded-full text-xs text-gray-700 focus:outline-none focus:ring-2 focus:ring-forest/20 w-44 placeholder:text-gray-400 transition-all font-body"
          />
          {search && (
            <div className="absolute top-full mt-1 right-0 w-56 bg-white border border-mist rounded-xl shadow-lg z-50 p-3">
              <p className="text-xs text-gray-400 text-center font-body">No results for "{search}"</p>
            </div>
          )}
        </div>

        {/* Bell */}
        <div className="relative" ref={bellRef}>
          <button
            onClick={() => setBellOpen(o => !o)}
            className="text-gray-700 hover:text-gray-900 p-1 rounded-full transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-forest rounded-full" />
          </button>
          {bellOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-mist rounded-xl shadow-lg z-50 p-4">
              <p className="font-bold text-sm text-gray-900 mb-2 font-display">Notifications</p>
              <p className="text-xs text-gray-400 text-center py-3 font-body">No new notifications</p>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="relative" ref={avatarRef}>
          <button onClick={() => setAvatarOpen(o => !o)} className="flex items-center gap-1.5 focus:outline-none">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-mist bg-paper">
              <img src={avatarUrl} alt={user?.name || 'User'} className="w-full h-full object-cover" />
            </div>
            <span className="hidden sm:inline text-xs font-semibold text-ink font-body max-w-[80px] truncate">
              {user?.name}
            </span>
            <ChevronDown className="w-3 h-3 text-gray-400 animate-fade-in" />
          </button>
          {avatarOpen && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-mist rounded-xl shadow-lg z-50 py-1">
              <div className="px-4 py-2 border-b border-mist/50">
                <p className="text-xs font-bold text-ink truncate font-display">{user?.name}</p>
                <p className="text-[10px] text-gray-400 truncate font-body">{user?.email}</p>
              </div>
              <Link to="/app/settings" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-body">
                <User className="w-4 h-4" /> Profile
              </Link>
              <Link to="/app/settings" onClick={() => setAvatarOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-body">
                <Settings className="w-4 h-4" /> Settings
              </Link>
              <div className="border-t border-mist my-1" />
              <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors font-body text-left">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─── SIDEBAR ──────────────────────────────────────────────────────────── */
function Sidebar({ isOpen, onClose, onQuickScanClick }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { stats, isLoading } = useScanStats();

  const navItems = [
    { to: '/app/home',          label: 'Home',           Icon: BarChart2    },
    { to: '/app/upload-center', label: 'Upload Center',  Icon: CloudUpload  },
    { to: '/app/recycle',       label: 'Recycle Finder', Icon: Recycle      },
    { to: '/app/dashboard',     label: 'Dashboard',      Icon: LayoutGrid   },
    { to: '/app/history',       label: 'Scan History',   Icon: History      },
    { to: '/app/leaderboard',   label: 'Leaderboard',    Icon: Trophy       },
    { to: '/app/settings',      label: 'Settings',       Icon: Settings     },
  ];

  const isActive = (to) => {
    if (to === '/app/home') return location.pathname === '/app/home';
    return location.pathname.startsWith(to);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
        />
      )}
      <aside className={`fixed left-0 top-0 bottom-0 w-[240px] md:w-[210px] bg-paper flex flex-col pt-4 pb-6 border-r border-mist transition-transform duration-300 z-50 md:z-10 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0 md:flex`}>
        {/* Mobile Header in Drawer */}
        <div className="flex items-center justify-between px-5 pb-4 md:hidden border-b border-mist/50 mb-4">
          <span className="font-display font-bold text-base text-ink">Navigation</span>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sustainability block */}
        <div className="px-5 pt-3 pb-6 flex items-start gap-3">
          <div className="w-9 h-9 bg-forest rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest leading-tight font-display">
              Sustainability<br />Level
            </p>
            <p className="text-sm font-bold text-ink mt-1 font-body">
              Monthly CO2e: <span className="font-mono tabular-nums">
                {isLoading && stats === null ? '—' : `${stats?.thisMonthCo2Kg ?? 0} kg`}
              </span>
            </p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 space-y-0.5">
          {navItems.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors relative font-body ${
                isActive(to)
                  ? 'bg-white text-forest font-semibold'
                  : 'text-[#1a7a4a] hover:bg-white/60'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              {label}
              {isActive(to) && (
                <span className="absolute right-0 top-2 bottom-2 w-1 bg-forest rounded-l-full" />
              )}
            </Link>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="px-5 border-t border-mist/50 pt-4 mt-auto">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-mist bg-white">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.name || 'Felix')}`} alt="User" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink truncate font-display">{user?.name}</p>
              <p className="text-[9px] text-gray-400 truncate font-body">User Profile</p>
            </div>
          </div>
        </div>

         {/* Quick Scan */}
        <div className="px-3 mt-4">
          <button
            onClick={() => {
              onClose?.();
              onQuickScanClick?.();
            }}
            className="w-full bg-forest hover:bg-forest-dark text-white rounded-xl py-3 flex items-center justify-center gap-2.5 font-bold text-sm transition-colors font-body"
          >
            <QrCode className="w-5 h-5" />
            Quick Scan
          </button>
        </div>
      </aside>
    </>
  );
}

/* ─── TOAST ────────────────────────────────────────────────────────────── */
export function Toast({ message, type = 'error', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all font-body ${type === 'error' ? 'bg-red-500' : 'bg-forest'}`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-1 hover:opacity-75"><X className="w-4 h-4" /></button>
    </div>
  );
}

/* ─── LAYOUT WRAPPER ───────────────────────────────────────────────────── */
function AppLayout({ children }) {
  return (
    <ScanStatsProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </ScanStatsProvider>
  );
}

function AppLayoutContent({ children }) {
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);
  const location = useLocation();

  // Close mobile drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  return (
    <div className="font-body antialiased text-ink">
      <Navbar onMenuClick={() => setDrawerOpen(true)} />
      <Sidebar 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        onQuickScanClick={() => setIsQuickScanOpen(true)}
      />
      <main className="md:ml-[210px] mt-[56px] min-h-screen bg-paper pb-16 md:pb-0">
        {children}
      </main>
      {/* Mobile bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-mist flex justify-around py-2 md:hidden z-30">
        {[
          { to: '/app/home',          Icon: BarChart2,   label: 'Home'     },
          { to: '/app/upload-center', Icon: CloudUpload, label: 'Upload'   },
          { to: '/app/recycle',       Icon: Recycle,     label: 'Recycle'  },
          { to: '/app/history',       Icon: History,     label: 'History'  },
          { to: '/app/leaderboard',   Icon: Trophy,      label: 'Leaders'  },
        ].map(({ to, Icon, label }) => (
          <Link key={to} to={to} className="flex flex-col items-center gap-1 text-[10px] text-gray-400 font-body">
            <Icon className="w-5 h-5" /> {label}
          </Link>
        ))}
      </div>
      
      {/* Quick Scan Modal */}
      <QuickScanModal isOpen={isQuickScanOpen} onClose={() => setIsQuickScanOpen(false)} />
    </div>
  );
}

/* ─── APP ROUTES ────────────────────────────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      {/* Public landing page */}
      <Route path="/" element={<LandingPage />} />

      {/* Guest/Public-only pages */}
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Route>

      {/* Authenticated/Protected pages */}
      <Route element={<ProtectedRoute />}>
        <Route path="/app/home" element={<AppLayout><Home /></AppLayout>} />
        <Route path="/app/upload-center" element={<AppLayout><UploadCenter /></AppLayout>} />
        <Route path="/app/recycle" element={<AppLayout><RecycleFinder /></AppLayout>} />
        <Route path="/app/dashboard" element={<AppLayout><Dashboard /></AppLayout>} />
        <Route path="/app/history" element={<AppLayout><ScanHistory /></AppLayout>} />
        <Route path="/app/leaderboard" element={<AppLayout><Leaderboard /></AppLayout>} />
        <Route path="/app/settings" element={<AppLayout><SettingsPage /></AppLayout>} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
