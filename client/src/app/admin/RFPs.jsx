import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { Badge, EmptyState } from '@components/ui/Primitives';
import { formatINR, formatDate } from '@lib/utils';

const mockRFPs = [
  { id: 1, company: 'TechNova Solutions', industry: 'SaaS', budget: 1200000, status: 'new', date: '2026-08-18', details: 'Enterprise CRM with AI-driven lead scoring and automated pipeline management.' },
  { id: 2, company: 'GreenLeaf Organics', industry: 'E-commerce', budget: 450000, status: 'reviewing', date: '2026-08-15', details: 'D2C organic food marketplace with subscription box and cold-chain logistics tracking.' },
  { id: 3, company: 'UrbanNest Realty', industry: 'Real Estate', budget: 800000, status: 'shortlisted', date: '2026-08-10', details: 'Property listing platform with virtual tours, mortgage calculator, and agent matching.' },
  { id: 4, company: 'FitPulse Health', industry: 'Healthcare', budget: 650000, status: 'rejected', date: '2026-08-05', details: 'Telemedicine app with appointment booking, video consultations, and e-prescriptions.' },
  { id: 5, company: 'EduBridge Academy', industry: 'EdTech', budget: 350000, status: 'won', date: '2026-07-28', details: 'LMS platform with live classes, assessments, and certification management.' },
];

const statuses = ['all', 'new', 'reviewing', 'shortlisted', 'won', 'rejected'];
const statusVariant = { new: 'info', reviewing: 'warning', shortlisted: 'default', won: 'success', rejected: 'danger' };

export default function RFPs() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [expanded, setExpanded] = useState(null);
  const [rfpStatuses, setRfpStatuses] = useState(() => Object.fromEntries(mockRFPs.map((r) => [r.id, r.status])));

  const filtered = mockRFPs.filter((r) => {
    if (filterStatus !== 'all' && rfpStatuses[r.id] !== filterStatus) return false;
    if (search && !r.company.toLowerCase().includes(search.toLowerCase()) && !r.industry.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-warm-900">RFP Management</h2>

      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by company or industry..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-fox-500/30" />
        </div>
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
            className="pl-8 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-fox-500/30 capitalize">
            {statuses.map((s) => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FileText} title="No RFPs found" description="Adjust your filters or check back later." />
      ) : (
        <div className="bg-white rounded-2xl border border-warm-200 overflow-hidden">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-6 py-3 bg-warm-50 text-xs font-semibold text-warm-500 uppercase tracking-wide">
            <span>Company</span><span>Industry</span><span>Budget</span><span>Status</span><span>Date</span><span />
          </div>
          {filtered.map((r) => (
            <div key={r.id} className="border-t border-warm-100">
              <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-4 px-6 py-4 items-center cursor-pointer hover:bg-warm-50/50 transition" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
                <span className="text-sm font-medium text-warm-900">{r.company}</span>
                <span className="text-sm text-warm-600">{r.industry}</span>
                <span className="text-sm font-mono text-warm-800">{formatINR(r.budget)}</span>
                <select value={rfpStatuses[r.id]} onClick={(e) => e.stopPropagation()} onChange={(e) => setRfpStatuses((p) => ({ ...p, [r.id]: e.target.value }))}
                  className="text-xs px-2 py-1 rounded-lg border border-warm-200 bg-white capitalize focus:outline-none">
                  {statuses.filter((s) => s !== 'all').map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <span className="text-xs text-warm-500">{formatDate(r.date)}</span>
                {expanded === r.id ? <ChevronUp size={16} className="text-warm-400" /> : <ChevronDown size={16} className="text-warm-400" />}
              </div>
              {expanded === r.id && (
                <div className="px-6 pb-4">
                  <div className="bg-warm-50 rounded-xl p-4 text-sm text-warm-700">{r.details}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
