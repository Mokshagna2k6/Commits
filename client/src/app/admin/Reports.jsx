import { useState } from 'react';
import { BarChart3, Users, Briefcase, Wrench, Download, Calendar } from 'lucide-react';
import { formatINR } from '@lib/utils';

const reportTypes = [
  { key: 'revenue', label: 'Revenue Report', icon: BarChart3, color: 'text-green-600 bg-green-50', desc: 'Monthly and quarterly revenue breakdown by service, client, and project.' },
  { key: 'projects', label: 'Projects Report', icon: Briefcase, color: 'text-blue-600 bg-blue-50', desc: 'Project completion rates, timelines, budget vs actual, and milestone tracking.' },
  { key: 'users', label: 'Users Report', icon: Users, color: 'text-purple-600 bg-purple-50', desc: 'Client acquisition, retention, churn analysis, and user activity metrics.' },
  { key: 'services', label: 'Services Report', icon: Wrench, color: 'text-fox-500 bg-fox-500/10', desc: 'Service popularity, revenue per service, and capacity utilization.' },
];

const sampleData = {
  revenue: [
    { month: 'Mar', value: 850000 }, { month: 'Apr', value: 920000 }, { month: 'May', value: 1100000 },
    { month: 'Jun', value: 980000 }, { month: 'Jul', value: 1250000 }, { month: 'Aug', value: 1400000 },
  ],
  summary: [
    { label: 'Total Revenue', value: formatINR(6500000) },
    { label: 'Active Projects', value: '24' },
    { label: 'New Clients', value: '18' },
    { label: 'Avg Project Value', value: formatINR(270000) },
  ],
};

const maxVal = Math.max(...sampleData.revenue.map((d) => d.value));

export default function Reports() {
  const [dateRange, setDateRange] = useState({ from: '2026-03-01', to: '2026-08-31' });
  const [generating, setGenerating] = useState(null);

  const handleGenerate = (key) => {
    setGenerating(key);
    setTimeout(() => setGenerating(null), 1500);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-warm-900">Business Reports</h2>
        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-warm-400" />
          <input type="date" value={dateRange.from} onChange={(e) => setDateRange((p) => ({ ...p, from: e.target.value }))}
            className="text-xs border border-warm-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-fox-500/30" />
          <span className="text-xs text-warm-400">to</span>
          <input type="date" value={dateRange.to} onChange={(e) => setDateRange((p) => ({ ...p, to: e.target.value }))}
            className="text-xs border border-warm-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-fox-500/30" />
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {sampleData.summary.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-warm-200 p-5 text-center">
            <div className="text-xs text-warm-500">{s.label}</div>
            <div className="text-xl font-bold text-warm-900 mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 p-6">
        <h3 className="text-sm font-medium text-warm-700 mb-4">Revenue Trend</h3>
        <div className="flex items-end gap-3 h-40">
          {sampleData.revenue.map((d) => (
            <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-mono text-warm-500">{formatINR(d.value / 100000)}L</span>
              <div className="w-full bg-fox-500/80 rounded-t-lg transition-all hover:bg-fox-500" style={{ height: `${(d.value / maxVal) * 100}%` }} />
              <span className="text-xs text-warm-500">{d.month}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {reportTypes.map((r) => (
          <div key={r.key} className="bg-white rounded-2xl border border-warm-200 p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.color}`}><r.icon size={20} /></div>
              <h3 className="font-medium text-warm-900">{r.label}</h3>
            </div>
            <p className="text-sm text-warm-500 mb-4">{r.desc}</p>
            <button onClick={() => handleGenerate(r.key)} disabled={generating === r.key}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-fox-500 text-white text-sm font-medium hover:bg-fox-600 transition disabled:opacity-50">
              <Download size={14} /> {generating === r.key ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
