import React, { useState } from 'react';
import {
  BarChart2, Leaf, Zap, Award, CloudUpload,
  CheckCircle2, Clock, TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer, Area, AreaChart, XAxis, YAxis,
  CartesianGrid, Tooltip
} from 'recharts';

const carbonData = [
  { month: 'Oct', co2: 68 },
  { month: 'Nov', co2: 55 },
  { month: 'Dec', co2: 80 },
  { month: 'Jan', co2: 61 },
  { month: 'Feb', co2: 49 },
  { month: 'Mar', co2: 42 },
];

const recentScans = [
  { name: 'WholeFoods_09_22.jpg', category: 'Groceries', co2Val: '1.8',  co2Unit: 'kg', score: 72, status: 'Done',       date: '2 Apr 2026' },
  { name: 'UPC_8849201.jpg',      category: 'Electronics', co2Val: '4.2',  co2Unit: 'kg', score: 38, status: 'Done',       date: '1 Apr 2026' },
  { name: 'LHR_NYC_Flight.pdf',   category: 'Travel',      co2Val: '28.5', co2Unit: 'kg', score: 15, status: 'Done',       date: '30 Mar 2026' },
  { name: 'Burger_photo.png',     category: 'Food',        co2Val: '2.1',  co2Unit: 'kg', score: 55, status: 'Processing', date: '29 Mar 2026' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-mist rounded-xl px-4 py-2 shadow-sm font-body">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-bold text-forest text-sm">
          <span className="font-mono tabular-nums">{payload[0].value}</span> kg CO₂e
        </p>
      </div>
    );
  }
  return null;
};

function ScoreBadge({ score }) {
  const color = score >= 70 ? 'text-green-600 bg-green-50' : score >= 50 ? 'text-yellow-600 bg-yellow-50' : 'text-red-500 bg-red-50';
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${color}`}>
      <span className="font-mono tabular-nums">{score}</span>
    </span>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [range, setRange] = useState('6M');

  const stats = [
    { label: 'Total Scans',         value: '12',     unit: '',       Icon: BarChart2,    color: 'bg-blue-50   text-blue-600'  },
    { label: 'Total CO₂ Tracked',   value: '127',    unit: ' kg',    Icon: Leaf,         color: 'bg-green-50  text-forest' },
    { label: 'This Month',          value: '42',     unit: ' kg',    Icon: Zap,          color: 'bg-yellow-50 text-yellow-600'},
    { label: 'Sustainability Score', value: '64/100',  unit: '',       Icon: Award,        color: 'bg-purple-50 text-purple-600'},
  ];

  return (
    <div className="px-10 pt-8 pb-10 bg-paper">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[36px] font-bold text-ink leading-tight mb-1 font-display">Dashboard</h1>
          <p className="text-gray-500 text-sm font-body">Your personal carbon intelligence overview.</p>
        </div>
        <button
          onClick={() => navigate('/app/upload-center')}
          className="flex items-center gap-2 bg-forest hover:bg-forest-dark text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors font-body focus:outline-none focus:ring-2 focus:ring-forest/20"
        >
          <CloudUpload className="w-4 h-4" /> New Scan
        </button>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map(({ label, value, unit, Icon, color }) => (
          <div key={label} className="bg-white border border-mist rounded-xl p-5 shadow-sm">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${color.split(' ')[0]}`}>
              <Icon className={`w-[18px] h-[18px] ${color.split(' ')[1]}`} />
            </div>
            <p className="text-2xl font-bold text-ink font-mono tabular-nums">
              {value}
              {unit && <span className="text-sm font-sans font-medium text-gray-500">{unit}</span>}
            </p>
            <p className="text-xs text-gray-500 mt-1 font-body">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white border border-mist rounded-xl p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-ink">Carbon Over Time</h2>
            <p className="text-xs text-gray-400 mt-0.5 font-body">Monthly CO₂e emissions (kg)</p>
          </div>
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            {['3M', '6M', '1Y'].map(r => (
              <button key={r} onClick={() => setRange(r)}
                className={`text-xs font-semibold px-3 py-1 rounded-md transition-all font-body ${range === r ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={carbonData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#1a3d2b" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#1a3d2b" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'Inter, sans-serif' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#9ca3af', fontFamily: 'JetBrains Mono, monospace' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="co2" stroke="#1a3d2b" strokeWidth={2.5}
              fill="url(#co2Grad)" dot={{ r: 4, fill: '#1a3d2b', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#00c896', strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Scans */}
      <div className="bg-white border border-mist rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-ink">Recent Scans</h2>
          <button onClick={() => navigate('/app/upload-center')} className="text-xs text-[#1a7a4a] font-semibold hover:text-forest transition-colors font-body focus:outline-none focus:ring-2 focus:ring-forest/20 rounded">+ New Scan</button>
        </div>

        {recentScans.length === 0 ? (
          <div className="text-center py-12">
            <BarChart2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400 font-body">No scans yet</p>
            <p className="text-xs text-gray-400 mt-1 font-body">Upload your first file to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm font-body">
              <thead>
                <tr className="text-left text-xs text-gray-400 font-semibold border-b border-mist/50">
                  <th className="pb-3 pr-4 font-display">File</th>
                  <th className="pb-3 pr-4 font-display">Category</th>
                  <th className="pb-3 pr-4 font-display">CO₂</th>
                  <th className="pb-3 pr-4 font-display">Score</th>
                  <th className="pb-3 pr-4 font-display">Status</th>
                  <th className="pb-3 font-display">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mist/30">
                {recentScans.map((s, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-forest rounded-lg flex items-center justify-center flex-shrink-0">
                          <TrendingDown className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="font-semibold text-gray-900 truncate max-w-[140px]">{s.name}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-500 text-xs">{s.category}</td>
                    <td className="py-3 pr-4 text-gray-900">
                      <span className="font-mono font-bold tabular-nums">{s.co2Val}</span>
                      <span className="font-mono text-xs text-gray-500 ml-0.5">{s.co2Unit}</span>
                    </td>
                    <td className="py-3 pr-4"><ScoreBadge score={s.score} /></td>
                    <td className="py-3 pr-4">
                      {s.status === 'Done'
                        ? <span className="flex items-center gap-1 text-xs text-green-600 font-medium"><CheckCircle2 className="w-3.5 h-3.5" /> Done</span>
                        : <span className="flex items-center gap-1 text-xs text-yellow-500 font-medium"><Clock className="w-3.5 h-3.5" /> Processing</span>
                      }
                    </td>
                    <td className="py-3 text-xs text-gray-400 font-mono tabular-nums">{s.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
