import { useState } from 'react';
import { Link } from 'react-router-dom';

const QUEUE = [
  { id: 'P-101', title: 'E-commerce site (Starter)', tier: 'Starter', est: '7 days', budget: 'Rs 35K' },
  { id: 'P-102', title: 'Mobile app prototype', tier: 'Growth', est: '14 days', budget: 'Rs 3.2L' },
  { id: 'P-103', title: 'AI chatbot integration', tier: 'Premium', est: '21 days', budget: 'Rs 8.5L' },
];

const SPRINTS = [
  { name: 'Sprint 1', start: '2026-08-01', end: '2026-08-14', tasks: 12, done: 12, status: 'completed' },
  { name: 'Sprint 2', start: '2026-08-15', end: '2026-08-28', tasks: 15, done: 9, status: 'in-progress' },
];

const RESOURCES = [
  { id: 'dev-01', name: 'Arjun (PM)', role: 'Project Manager', load: 80 },
  { id: 'dev-02', name: 'Priya (Designer)', role: 'UI/UX Designer', load: 100 },
  { id: 'dev-03', name: 'Ravi (Dev)', role: 'Full-stack', load: 70 },
];

const QUALITY = [
  { id: 1, severity: 'Critical', desc: 'Payment gateway fails on Safari', project: 'E-commerce site' },
  { id: 2, severity: 'Medium', desc: 'Form validation missing error state', project: 'Landing page' },
];

const FINANCE = [
  { id: 'INV-001', project: 'E-commerce site', status: 'Paid', amt: 35000 },
  { id: 'INV-002', project: 'Mobile app', status: 'Pending', amt: 160000 },
];

const CLIENTS = [
  { id: 'C-01', name: 'Acme Corp', projects: 2, status: 'active' },
  { id: 'C-02', name: 'Beta Start', projects: 1, status: 'on-hold' },
];

const ANALYTICS = [
  { metric: 'Active projects', value: '18' },
  { metric: 'On-time delivery', value: '92%' },
  { metric: 'Avg. CSAT', value: '4.7 / 5' },
  { metric: 'Pipeline value', value: 'Rs 5.4L' },
];

const SEQUEUE = [
  { id: 'SE-01', name: 'Auto-generate product descriptions (AI)', score: 0.89 },
  { id: 'SE-02', name: 'Build portfolio carousel component', score: 0.82 },
  { id: 'SE-03', name: 'Integrate Razorpay checkout', score: 0.78 },
];

export function Queue() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">H1 &middot; Order and Project Queue</p>
      <h1 className="text-2xl font-bold mb-6">Incoming Projects</h1>
      <p className="text-gray-600 mb-6">New orders awaiting kickoff. Sorted by earliest commitment date.</p>
      <div className="space-y-3">
        {QUEUE.map((p) => (
          <div key={p.id} className="border rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="font-semibold">{p.id}: {p.title}</div>
              <div className="text-sm text-gray-500">Tier: {p.tier} &middot; {p.est}</div>
            </div>
            <div className="text-right">
              <div className="font-bold">{p.budget}</div>
              <Link to={'/builder?service=' + p.id} className="text-xs text-orange-600 hover:underline">Open Builder</Link>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link to="/app/team/projects" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Back to projects</Link>
      </div>
    </div>
  );
}

export function Sprints() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">H2 &middot; Sprint and Task Management</p>
      <h1 className="text-2xl font-bold mb-6">Sprints</h1>
      <div className="space-y-4 mb-6">
        {SPRINTS.map((s) => (
          <div key={s.name} className="border rounded-xl p-4">
            <div className="flex justify-between font-semibold">
              <span>{s.name}</span>
              <span className={s.status === 'completed' ? 'text-green-700' : 'text-orange-700'}>{s.status}</span>
            </div>
            <div className="text-sm text-gray-500">{s.start} to {s.end}</div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: Math.round((s.done / s.tasks) * 100) + '%' }} />
            </div>
            <div className="text-xs text-gray-500 mt-1">{s.done}/{s.tasks} tasks done</div>
          </div>
        ))}
      </div>
      <Link to="/app/team/tasks" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">View all tasks</Link>
    </div>
  );
}

export function Resources() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">H3 &middot; Resource Allocation</p>
      <h1 className="text-2xl font-bold mb-6">Team Resources</h1>
      <p className="text-gray-600 mb-6">Capacity heatmap per team member. Red = over-allocated.</p>
      <div className="space-y-3">
        {RESOURCES.map((r) => (
          <div key={r.id} className="border rounded-xl p-4">
            <div className="flex justify-between">
              <span className="font-medium">{r.name} &mdash; {r.role}</span>
              <span className={r.load > 90 ? 'text-red-700' : r.load > 70 ? 'text-orange-700' : 'text-green-700'}>{r.load}%</span>
            </div>
            <div className="mt-1 bg-gray-200 rounded-full h-2">
              <div className={`h-2 rounded-full ${r.load > 90 ? 'bg-red-500' : r.load > 70 ? 'bg-orange-500' : 'bg-green-500'}`} style={{ width: r.load + '%' }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link to="/app/team/projects" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Back to projects</Link>
      </div>
    </div>
  );
}

export function Quality() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">H4 &middot; Quality Assurance</p>
      <h1 className="text-2xl font-bold mb-6">QA Dashboard</h1>
      <p className="text-gray-600 mb-6">Open bugs and quality signals for active projects.</p>
      <div className="space-y-3">
        {QUALITY.map((b) => (
          <div key={b.id} className="border rounded-xl p-4 flex justify-between">
            <div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${b.severity === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{b.severity}</span>
              <span className="font-medium ml-2">{b.desc}</span>
            </div>
            <span className="text-sm text-gray-500">{b.project}</span>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link to="/app/team/tasks" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Back to tasks</Link>
      </div>
    </div>
  );
}

export function Finance() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">H5 &middot; Financial Operations</p>
      <h1 className="text-2xl font-bold mb-6">Finance</h1>
      <p className="text-gray-600 mb-6">Revenue, payouts, and invoice reconciliation for the team.</p>
      <div className="bg-white border rounded-xl p-4 mb-6">
        <div className="text-2xl font-bold text-green-600">Rs 4.2L</div>
        <div className="text-xs text-gray-500">Revenue this month</div>
      </div>
      <div className="space-y-3">
        {FINANCE.map((i) => (
          <div key={i.id} className="border rounded-xl p-4 flex justify-between">
            <div>
              <span className="font-medium">{i.id}</span>
              <span className="text-sm text-gray-500 ml-2">{i.project}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">Rs {i.amt.toLocaleString('en-IN')}</div>
              <span className={`text-xs ${i.status === 'Paid' ? 'text-green-700' : 'text-orange-700'}`}>{i.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link to="/app/admin/finance" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Admin finance panel</Link>
      </div>
    </div>
  );
}

export function Clients() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">H6 &middot; Client Relationship</p>
      <h1 className="text-2xl font-bold mb-6">Clients</h1>
      <p className="text-gray-600 mb-6">All client accounts and active engagements in one view.</p>
      <div className="space-y-3">
        {CLIENTS.map((c) => (
          <div key={c.id} className="border rounded-xl p-4 flex justify-between">
            <div>
              <span className="font-semibold">{c.name}</span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full ml-2">{c.id}</span>
            </div>
            <div className="text-right">
              <div className="text-sm">{c.projects} active projects</div>
              <span className={`text-xs font-medium ${c.status === 'active' ? 'text-green-700' : 'text-yellow-700'}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link to="/app/team/projects" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Back to projects</Link>
      </div>
    </div>
  );
}

export function Analysis() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">H7 &middot; Analytics and Reporting</p>
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <p className="text-gray-600 mb-6">Key delivery metrics across the whole team.</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {ANALYTICS.map((a) => (
          <div key={a.metric} className="bg-[#FAFAF8] border rounded-xl p-5 text-center">
            <div className="text-2xl font-extrabold text-orange-600">{a.value}</div>
            <div className="text-xs text-gray-500 mt-1">{a.metric}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border rounded-xl p-4">
        <div className="text-xs text-gray-400 text-center">chart: on-time delivery trend (placeholder)</div>
      </div>
      <div className="mt-6">
        <Link to="/app/admin/analytics" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Admin analytics</Link>
      </div>
    </div>
  );
}

export function SEQueue() {
  const [assigned, setAssigned] = useState(true);
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">H8 &middot; SE Queue</p>
      <h1 className="text-2xl font-bold mb-6">AI Task Queue</h1>
      <p className="text-gray-600 mb-6">AI-generated backlog ready for senior estimation. Confidence score = SE model certainty.</p>
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setAssigned(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${assigned ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Assigned
        </button>
        <button
          onClick={() => setAssigned(false)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${!assigned ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Unassigned
        </button>
      </div>
      <div className="space-y-3">
        {SEQUEUE.map((t) => (
          <div key={t.id} className="border rounded-xl p-4 flex justify-between items-center">
            <div>
              <div className="font-medium">{t.id}: {t.name}</div>
              <div className="text-xs text-gray-500">Confidence: {Math.round(t.score * 100)}%</div>
            </div>
            <div className="text-right">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${t.score > 0.85 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {assigned ? 'Assigned' : 'Needs estimate'}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Link to="/app/team/tasks" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Back to tasks</Link>
      </div>
    </div>
  );
}
