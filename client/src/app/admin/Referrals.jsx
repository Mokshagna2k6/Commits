import { useState } from 'react';
import { Users, TrendingUp, Award, IndianRupee } from 'lucide-react';
import { Badge } from '@components/ui/Primitives';
import { formatINR } from '@lib/utils';

const topReferrers = [
  { id: 1, name: 'Ankit Verma', referrals: 12, converted: 8, earnings: 40000, status: 'active' },
  { id: 2, name: 'Sneha Iyer', referrals: 9, converted: 6, earnings: 30000, status: 'active' },
  { id: 3, name: 'Karan Malhotra', referrals: 7, converted: 4, earnings: 20000, status: 'active' },
  { id: 4, name: 'Divya Nair', referrals: 5, converted: 3, earnings: 15000, status: 'active' },
  { id: 5, name: 'Rahul Singh', referrals: 3, converted: 1, earnings: 5000, status: 'pending_payout' },
];

const payouts = [
  { id: 1, referrer: 'Ankit Verma', amount: 15000, status: 'paid', date: '2026-08-01' },
  { id: 2, referrer: 'Sneha Iyer', amount: 10000, status: 'paid', date: '2026-08-01' },
  { id: 3, referrer: 'Karan Malhotra', amount: 10000, status: 'pending', date: '2026-08-15' },
  { id: 4, referrer: 'Rahul Singh', amount: 5000, status: 'pending', date: '2026-08-15' },
];

const stats = [
  { label: 'Total Referrals', value: '36', icon: Users, color: 'text-blue-600 bg-blue-50' },
  { label: 'Conversion Rate', value: '61%', icon: TrendingUp, color: 'text-green-600 bg-green-50' },
  { label: 'Top Referrer', value: 'Ankit V.', icon: Award, color: 'text-amber-600 bg-amber-50' },
  { label: 'Total Payouts', value: formatINR(110000), icon: IndianRupee, color: 'text-fox-500 bg-fox-500/10' },
];

export default function Referrals() {
  const [tab, setTab] = useState('leaderboard');

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-warm-900">Referral Program</h2>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-warm-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${s.color}`}><s.icon size={18} /></div>
            </div>
            <div className="text-xl font-bold text-warm-900">{s.value}</div>
            <div className="text-xs text-warm-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="flex gap-1 bg-warm-50 rounded-xl p-1">
        {['leaderboard', 'payouts'].map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-medium transition capitalize ${tab === t ? 'bg-white text-fox-500 shadow-sm' : 'text-warm-500 hover:text-warm-700'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'leaderboard' && (
        <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
          <div className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-warm-50 text-xs font-semibold text-warm-500 uppercase tracking-wide">
            <span>#</span><span>Referrer</span><span>Referrals</span><span>Converted</span><span>Earnings</span>
          </div>
          {topReferrers.map((r, i) => (
            <div key={r.id} className="grid grid-cols-[40px_2fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-t border-warm-100 items-center">
              <span className={`text-sm font-bold ${i < 3 ? 'text-fox-500' : 'text-warm-400'}`}>{i + 1}</span>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-fox-500/10 flex items-center justify-center text-fox-500 text-xs font-bold">{r.name[0]}</div>
                <span className="text-sm font-medium text-warm-900">{r.name}</span>
              </div>
              <span className="text-sm text-warm-600">{r.referrals}</span>
              <span className="text-sm text-warm-600">{r.converted}</span>
              <span className="text-sm font-mono font-semibold text-warm-900">{formatINR(r.earnings)}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'payouts' && (
        <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-3 bg-warm-50 text-xs font-semibold text-warm-500 uppercase tracking-wide">
            <span>Referrer</span><span>Amount</span><span>Status</span><span>Date</span>
          </div>
          {payouts.map((p) => (
            <div key={p.id} className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-4 px-6 py-4 border-t border-warm-100 items-center">
              <span className="text-sm font-medium text-warm-900">{p.referrer}</span>
              <span className="text-sm font-mono text-warm-800">{formatINR(p.amount)}</span>
              <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>{p.status === 'paid' ? 'Paid' : 'Pending'}</Badge>
              <span className="text-xs text-warm-500">{p.date}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
