import { useState } from 'react';
import { usePageTitle } from '@lib/hooks';
import { Globe, Shield, Search, Zap, Eye } from 'lucide-react';

const categories = [
  { key: 'performance', label: 'Performance', icon: Zap, color: 'text-green-500' },
  { key: 'seo', label: 'SEO', icon: Search, color: 'text-blue-500' },
  { key: 'accessibility', label: 'Accessibility', icon: Eye, color: 'text-purple-500' },
  { key: 'security', label: 'Security', icon: Shield, color: 'text-fox-500' },
];

function GaugeBar({ score, label, icon: Icon, color }) {
  const barColor = score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-4">
      <Icon className={`w-5 h-5 ${color} shrink-0`} />
      <div className="flex-1">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-warm-900">{label}</span>
          <span className="font-bold text-warm-900">{score}/100</span>
        </div>
        <div className="h-3 bg-warm-100 rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor} transition-all duration-700`} style={{ width: `${score}%` }} />
        </div>
      </div>
    </div>
  );
}

export default function WebsiteAudit() {
  usePageTitle('Website Audit Tool');
  const [url, setUrl] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const runAudit = () => {
    if (!url) return;
    setLoading(true);
    setTimeout(() => {
      setResults({
        performance: Math.floor(Math.random() * 40) + 60,
        seo: Math.floor(Math.random() * 30) + 65,
        accessibility: Math.floor(Math.random() * 35) + 55,
        security: Math.floor(Math.random() * 25) + 70,
      });
      setLoading(false);
    }, 1500);
  };

  const avg = results ? Math.round(Object.values(results).reduce((a, b) => a + b, 0) / 4) : 0;

  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <Globe className="w-12 h-12 text-fox-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Website Audit</h1>
        <p className="text-warm-600">Analyze any website for performance, SEO, accessibility & security.</p>
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 p-6 mb-8">
        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 border border-warm-200 rounded-xl px-4 py-3 text-warm-900 focus:outline-none focus:ring-2 focus:ring-fox-500"
          />
          <button onClick={runAudit} disabled={loading} className="bg-fox-500 text-white rounded-xl px-6 py-3 hover:bg-fox-600 disabled:opacity-50 transition">
            {loading ? 'Scanning...' : 'Run Audit'}
          </button>
        </div>
      </div>

      {results && (
        <div className="bg-white rounded-2xl border border-warm-200 p-6 space-y-6">
          <div className="text-center mb-4">
            <div className="text-5xl font-bold text-warm-900">{avg}</div>
            <div className="text-warm-500 text-sm mt-1">Overall Score</div>
          </div>
          {categories.map((cat) => (
            <GaugeBar key={cat.key} score={results[cat.key]} label={cat.label} icon={cat.icon} color={cat.color} />
          ))}
          <p className="text-xs text-warm-400 text-center pt-2">Results are simulated for demonstration purposes.</p>
        </div>
      )}
    </div>
  );
}
