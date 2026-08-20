import { useState } from 'react';
import { Gift, Copy, Check, Users } from 'lucide-react';
import { Badge, EmptyState } from '@components/ui/Primitives';
import { formatINR, formatDate } from '@lib/utils';

const REFERRAL_LINK = 'https://stackfox.com/ref/CLIENT-8X92K';

const mockReferrals = [
  { id: 1, name: 'Ravi Mehta', email: 'ravi@example.com', status: 'converted', date: '2026-07-12', earning: 5000 },
  { id: 2, name: 'Priya Sharma', email: 'priya@example.com', status: 'signed_up', date: '2026-08-01', earning: 0 },
  { id: 3, name: 'Amit Patel', email: 'amit@example.com', status: 'pending', date: '2026-08-15', earning: 0 },
  { id: 4, name: 'Neha Gupta', email: 'neha@example.com', status: 'converted', date: '2026-06-20', earning: 5000 },
];

const statusMap = { pending: 'warning', signed_up: 'info', converted: 'success' };
const statusLabel = { pending: 'Pending', signed_up: 'Signed Up', converted: 'Converted' };

export default function Referrals() {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(REFERRAL_LINK);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalEarnings = mockReferrals.reduce((s, r) => s + r.earning, 0);
  const converted = mockReferrals.filter((r) => r.status === 'converted').length;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-warm-900">Referral Program</h2>

      <div className="bg-white rounded-2xl border border-warm-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-fox-500/10 flex items-center justify-center">
            <Gift size={20} className="text-fox-500" />
          </div>
          <div>
            <h3 className="font-medium text-warm-900">Your Referral Link</h3>
            <p className="text-xs text-warm-500">Earn {formatINR(5000)} for every converted referral</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 bg-warm-50 rounded-xl px-4 py-2.5 text-sm text-warm-600 truncate">{REFERRAL_LINK}</code>
          <button onClick={copyLink} className="shrink-0 px-4 py-2.5 rounded-xl bg-fox-500 text-white text-sm font-medium hover:bg-fox-600 transition flex items-center gap-1.5">
            {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Referrals', value: mockReferrals.length },
          { label: 'Converted', value: converted },
          { label: 'Total Earnings', value: formatINR(totalEarnings) },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-warm-200 p-5 text-center">
            <div className="text-xs text-warm-500">{s.label}</div>
            <div className="text-xl font-bold text-warm-900 mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {mockReferrals.length === 0 ? (
        <EmptyState icon={Users} title="No referrals yet" description="Share your link to start earning rewards." />
      ) : (
        <div className="bg-white rounded-2xl border border-warm-200 divide-y divide-warm-100">
          {mockReferrals.map((r) => (
            <div key={r.id} className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-medium text-warm-900 text-sm">{r.name}</p>
                <p className="text-xs text-warm-500">{r.email} &middot; {formatDate(r.date)}</p>
              </div>
              <div className="flex items-center gap-3">
                {r.earning > 0 && <span className="text-sm font-mono font-semibold text-green-600">+{formatINR(r.earning)}</span>}
                <Badge variant={statusMap[r.status]}>{statusLabel[r.status]}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
