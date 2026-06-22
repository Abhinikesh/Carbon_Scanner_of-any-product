import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Leaf, BarChart2, Award, RefreshCw } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import { BADGE_CATALOG } from '../data/badgeCatalog.js';

function getRankStyle(rank) {
  if (rank === 1) return { bg: 'bg-amber-50 border-amber-200', icon: 'text-amber-500', label: 'bg-amber-500' };
  if (rank === 2) return { bg: 'bg-gray-50 border-gray-200', icon: 'text-gray-400', label: 'bg-gray-400' };
  if (rank === 3) return { bg: 'bg-orange-50 border-orange-200', icon: 'text-orange-400', label: 'bg-orange-400' };
  return { bg: 'bg-white border-mist', icon: 'text-gray-300', label: 'bg-gray-200' };
}

function RankIcon({ rank }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
  if (rank === 3) return <Medal className="w-5 h-5 text-orange-400" />;
  return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-400">#{rank}</span>;
}

export default function Leaderboard() {
  const { user: currentUser } = useAuth();
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchLeaderboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const res = await api.get('/users/leaderboard');
      // Handle both { data: { leaders } } and { leaders } shapes
      const data = res.data?.data?.leaders || res.data?.leaders || [];
      setLeaders(data);
    } catch (err) {
      console.error('[Leaderboard] fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load leaderboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const topThree = leaders.slice(0, 3);
  const rest = leaders.slice(3);

  return (
    <div className="px-6 md:px-10 pt-8 pb-16 bg-paper min-h-screen">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-bold text-ink leading-tight mb-1 font-display">
            Leaderboard
          </h1>
          <p className="text-gray-500 text-sm font-body">
            Top sustainability champions — ranked by total scans.
          </p>
        </div>
        <button
          onClick={() => fetchLeaderboard(true)}
          disabled={refreshing}
          className="flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-forest transition-colors px-3 py-2 rounded-xl border border-mist hover:border-forest/30 bg-white disabled:opacity-60 font-body"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </header>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner size="large" />
      ) : leaders.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-body">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold text-sm">No leaders yet</p>
          <p className="text-xs mt-1">Start scanning to appear on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* Top 3 Podium */}
          {topThree.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5 font-display flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Top Performers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topThree.map((leader, i) => {
                  const rank = i + 1;
                  const style = getRankStyle(rank);
                  const isMe = leader._id === currentUser?._id || leader.name === currentUser?.name;
                  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(leader.name || 'User')}`;
                  const earnedBadges = BADGE_CATALOG.filter(b => (leader.badges || []).includes(b.key));

                  return (
                    <div
                      key={leader._id || i}
                      className={`relative border rounded-2xl p-6 flex flex-col items-center text-center shadow-sm transition-all ${style.bg} ${isMe ? 'ring-2 ring-forest/30' : ''} ${rank === 1 ? 'sm:order-2' : rank === 2 ? 'sm:order-1' : 'sm:order-3'}`}
                    >
                      {isMe && (
                        <span className="absolute top-3 right-3 text-[9px] font-bold text-forest bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-body">
                          You
                        </span>
                      )}

                      {/* Rank badge */}
                      <div className={`w-7 h-7 rounded-full ${style.label} flex items-center justify-center mb-3 shadow-sm`}>
                        <span className="text-white text-xs font-black">#{rank}</span>
                      </div>

                      {/* Avatar */}
                      <div className={`w-16 h-16 rounded-full overflow-hidden border-4 mb-3 ${rank === 1 ? 'border-amber-300' : rank === 2 ? 'border-gray-300' : 'border-orange-300'}`}>
                        <img src={avatarUrl} alt={leader.name} className="w-full h-full object-cover" />
                      </div>

                      <p className="font-display font-bold text-ink text-sm mb-1 truncate max-w-full">{leader.name}</p>

                      {/* Stats */}
                      <div className="flex gap-4 mt-2 mb-3">
                        <div className="text-center">
                          <p className="text-lg font-bold text-forest font-mono tabular-nums">{leader.totalScans ?? 0}</p>
                          <p className="text-[9px] text-gray-400 uppercase font-body">Scans</p>
                        </div>
                        <div className="w-px bg-mist" />
                        <div className="text-center">
                          <p className="text-lg font-bold text-ink font-mono tabular-nums">{(leader.totalCO2 ?? 0).toFixed(1)}</p>
                          <p className="text-[9px] text-gray-400 uppercase font-body">kg CO₂</p>
                        </div>
                      </div>

                      {/* Badges */}
                      {earnedBadges.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-center mt-1">
                          {earnedBadges.slice(0, 4).map(b => (
                            <span key={b.key} title={b.label} className="text-base select-none">{b.emoji}</span>
                          ))}
                          {earnedBadges.length > 4 && (
                            <span className="text-[10px] text-gray-400 font-body mt-1">+{earnedBadges.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Remaining ranks table */}
          {rest.length > 0 && (
            <div className="bg-white border border-mist rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-mist/50">
                <h2 className="font-display font-bold text-sm text-ink">Rankings</h2>
              </div>
              <div className="divide-y divide-mist/50">
                {rest.map((leader, i) => {
                  const rank = i + 4;
                  const isMe = leader._id === currentUser?._id || leader.name === currentUser?.name;
                  const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(leader.name || 'User')}`;
                  const earnedBadges = BADGE_CATALOG.filter(b => (leader.badges || []).includes(b.key));

                  return (
                    <div
                      key={leader._id || i}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/60 ${isMe ? 'bg-green-50/40' : ''}`}
                    >
                      {/* Rank */}
                      <div className="w-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-400 font-mono">#{rank}</span>
                      </div>

                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full overflow-hidden border border-mist flex-shrink-0">
                        <img src={avatarUrl} alt={leader.name} className="w-full h-full object-cover" />
                      </div>

                      {/* Name + badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-ink font-body truncate">{leader.name}</p>
                          {isMe && (
                            <span className="text-[9px] font-bold text-forest bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-body">You</span>
                          )}
                        </div>
                        {earnedBadges.length > 0 && (
                          <div className="flex gap-0.5 mt-0.5">
                            {earnedBadges.slice(0, 5).map(b => (
                              <span key={b.key} title={b.label} className="text-xs select-none">{b.emoji}</span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-gray-900 font-mono tabular-nums">{leader.totalScans ?? 0}</p>
                          <p className="text-[9px] text-gray-400 uppercase font-body">Scans</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-forest font-mono tabular-nums">{(leader.totalCO2 ?? 0).toFixed(1)} kg</p>
                          <p className="text-[9px] text-gray-400 uppercase font-body">CO₂</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Info footer */}
          <p className="text-[11px] text-gray-400 text-center mt-6 font-body">
            Rankings update in real time · Based on total scan count
          </p>
        </>
      )}
    </div>
  );
}
