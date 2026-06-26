import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Leaf, RefreshCw, TrendingUp } from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/common/Spinner.jsx';
import ErrorBanner from '../components/common/ErrorBanner.jsx';
import Avatar from '../components/common/Avatar.jsx';

/* ── helpers ──────────────────────────────────────────────────────────── */
function getRankStyle(rank) {
  if (rank === 1) return { bg: 'bg-amber-50 border-amber-200', label: 'bg-amber-500', ring: 'ring-amber-200' };
  if (rank === 2) return { bg: 'bg-gray-50 border-gray-200',   label: 'bg-gray-400',   ring: 'ring-gray-200'  };
  if (rank === 3) return { bg: 'bg-orange-50 border-orange-200', label: 'bg-orange-400', ring: 'ring-orange-200' };
  return          { bg: 'bg-white border-mist',               label: 'bg-gray-300',   ring: 'ring-mist'      };
}

function RankIcon({ rank }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-amber-500" />;
  if (rank === 2) return <Medal  className="w-5 h-5 text-gray-400"  />;
  if (rank === 3) return <Medal  className="w-5 h-5 text-orange-400" />;
  return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-gray-400">#{rank}</span>;
}

/* ── main component ───────────────────────────────────────────────────── */
export default function Leaderboard() {
  const { user: authUser } = useAuth();

  const [topPerformers, setTopPerformers] = useState([]);
  const [currentUser,   setCurrentUser]   = useState(null);   // { userId, scansCount, totalCo2Kg, rank }
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState(null);

  async function fetchLeaderboard(isRefresh = false) {
    if (isRefresh) setRefreshing(true);
    else           setLoading(true);
    setError(null);

    try {
      const res = await api.get('/users/leaderboard');
      setTopPerformers(res.data?.topPerformers ?? []);
      setCurrentUser(res.data?.currentUser   ?? null);
    } catch (err) {
      console.error('[Leaderboard] fetch error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load leaderboard.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchLeaderboard(); }, []);

  // ── "YOU" detection: compare userId strings only — never by name ──────
  // authUser from login has { id: ... }; from /auth/me it's the full doc with _id.
  // Support both shapes.
  const myId = String(authUser?.id ?? authUser?._id ?? '');
  const isMe = (leader) => leader.userId === myId;

  // Is the logged-in user present in the top 10?
  const meInTop = topPerformers.some(isMe);

  const topThree = topPerformers.slice(0, 3);
  const rest      = topPerformers.slice(3);

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
      ) : topPerformers.length === 0 ? (
        <div className="text-center py-20 text-gray-400 font-body">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-bold text-sm">No leaders yet</p>
          <p className="text-xs mt-1">Start scanning to appear on the leaderboard!</p>
        </div>
      ) : (
        <>
          {/* ── Top 3 podium ────────────────────────────────────────────── */}
          {topThree.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-5 font-display flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-500" /> Top Performers
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {topThree.map((leader) => {
                  const { rank } = leader;
                  const style    = getRankStyle(rank);
                  const mine     = isMe(leader);

                  return (
                    <div
                      key={leader.userId}
                      className={`relative border rounded-2xl p-6 flex flex-col items-center text-center shadow-sm transition-all
                        ${style.bg}
                        ${mine ? `ring-2 ${style.ring}` : ''}
                        ${rank === 1 ? 'sm:order-2' : rank === 2 ? 'sm:order-1' : 'sm:order-3'}`}
                    >
                      {/* YOU badge — only when this userId === mine */}
                      {mine && (
                        <span className="absolute top-3 right-3 text-[9px] font-bold text-forest bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-body">
                          You
                        </span>
                      )}

                      {/* Rank badge */}
                      <div className={`w-7 h-7 rounded-full ${style.label} flex items-center justify-center mb-3 shadow-sm`}>
                        <span className="text-white text-xs font-black">#{rank}</span>
                      </div>

                      {/* Avatar */}
                      <div className={`rounded-full overflow-hidden border-4 mb-3 ${
                        rank === 1 ? 'border-amber-300' : rank === 2 ? 'border-gray-300' : 'border-orange-300'
                      }`}>
                        <Avatar src={leader.avatar} name={leader.name} size={64} />
                      </div>

                      <p className="font-display font-bold text-ink text-sm mb-1 truncate max-w-full">{leader.name}</p>

                      {/* Stats */}
                      <div className="flex gap-4 mt-2">
                        <div className="text-center">
                          <p className="text-lg font-bold text-forest font-mono tabular-nums">{leader.scansCount}</p>
                          <p className="text-[9px] text-gray-400 uppercase font-body">Scans</p>
                        </div>
                        <div className="w-px bg-mist" />
                        <div className="text-center">
                          <p className="text-lg font-bold text-ink font-mono tabular-nums">{(leader.totalCo2Kg ?? 0).toFixed(1)}</p>
                          <p className="text-[9px] text-gray-400 uppercase font-body">kg CO₂</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Ranks #4–10 table ───────────────────────────────────────── */}
          {rest.length > 0 && (
            <div className="bg-white border border-mist rounded-2xl shadow-sm overflow-hidden mb-6">
              <div className="px-6 py-4 border-b border-mist/50">
                <h2 className="font-display font-bold text-sm text-ink">Rankings</h2>
              </div>
              <div className="divide-y divide-mist/50">
                {rest.map((leader) => {
                  const mine = isMe(leader);
                  return (
                    <div
                      key={leader.userId}
                      className={`flex items-center gap-4 px-6 py-4 transition-colors hover:bg-gray-50/60 ${mine ? 'bg-green-50/40' : ''}`}
                    >
                      {/* Rank */}
                      <div className="w-8 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-gray-400 font-mono">#{leader.rank}</span>
                      </div>

                      {/* Avatar */}
                      <Avatar src={leader.avatar} name={leader.name} size={36} className="border border-mist flex-shrink-0" />

                      {/* Name */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm text-ink font-body truncate">{leader.name}</p>
                          {mine && (
                            <span className="text-[9px] font-bold text-forest bg-green-50 border border-green-100 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-body">
                              You
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-6 flex-shrink-0">
                        <div className="text-right hidden sm:block">
                          <p className="text-xs font-bold text-gray-900 font-mono tabular-nums">{leader.scansCount}</p>
                          <p className="text-[9px] text-gray-400 uppercase font-body">Scans</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs font-bold text-forest font-mono tabular-nums">{(leader.totalCo2Kg ?? 0).toFixed(1)} kg</p>
                          <p className="text-[9px] text-gray-400 uppercase font-body">CO₂</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── "You're not in top 10" banner ───────────────────────────── */}
          {!meInTop && currentUser && (
            currentUser.rank !== null ? (
              // User has scans but is ranked outside top 10
              <div className="flex items-center gap-4 bg-white border border-mist rounded-2xl px-6 py-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-forest/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-5 h-5 text-forest" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-ink font-body">
                    You're ranked{' '}
                    <span className="text-forest font-mono">#{currentUser.rank}</span>
                    {' '}— keep scanning to climb the board.
                  </p>
                  <p className="text-xs text-gray-400 font-body mt-0.5">
                    {currentUser.scansCount} scan{currentUser.scansCount !== 1 ? 's' : ''} · {currentUser.totalCo2Kg.toFixed(1)} kg CO₂
                  </p>
                </div>
              </div>
            ) : (
              // User has zero scans — not ranked at all
              <div className="flex items-center gap-4 bg-white border border-mist rounded-2xl px-6 py-4 shadow-sm">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <Leaf className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-ink font-body">
                    You're not ranked yet
                  </p>
                  <p className="text-xs text-gray-400 font-body mt-0.5">
                    Complete your first scan to join the leaderboard.
                  </p>
                </div>
              </div>
            )
          )}

          {/* Footer note */}
          <p className="text-[11px] text-gray-400 text-center mt-6 font-body">
            Rankings update in real time · Based on total scan count
          </p>
        </>
      )}
    </div>
  );
}
