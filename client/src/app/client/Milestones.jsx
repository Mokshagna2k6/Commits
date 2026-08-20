import { Link } from 'react-router-dom';

const MILESTONES = [
  { id: 1, name: 'Kickoff & discovery complete', status: 'done', date: '2026-07-03' },
  { id: 2, name: 'Design approved', status: 'done', date: '2026-07-12' },
  { id: 3, name: 'Development phase 1', status: 'done', date: '2026-08-20' },
  { id: 4, name: 'Testing & QA', status: 'inprogress', date: 'Due 2026-08-25' },
  { id: 5, name: 'Staging review', status: 'pending', date: 'Scheduled' },
  { id: 6, name: 'Live deployment', status: 'pending', date: 'Scheduled' },
];

export default function Milestones() {
  return (
    <div className="p-6">
      <p classNam     e="text-sm font-semibold text-orange-600 mb-2">G2 · Milestone Tracker</p>
      <h1 className="text-2xl font-bold mb-6">Project Milestones</h1>
      <p className="text-gray-600 mb-6">Real-time progress against your project plan. Green = on track, amber = at risk.</p>
      <div className="space-y-4">
        {MILESTONES.map((m) => (
          <div key={m.id} className="border rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${m.status === 'done' ? 'bg-green-500' : m.status === 'inprogress' ? 'bg-orange-500' : 'bg-gray-300'}`} />
              <div>
                <div className="font-medium">{m.name}</div>
                <div className="text-xs text-gray-500">ID: {m.id}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-xs font-medium ${m.status === 'done' ? 'text-green-700' : m.status === 'inprogress' ? 'text-orange-700' : 'text-gray-500'}`}>{m.status}</div>
              <div className="text-xs text-gray-500">{m.date}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link to="/app/client/projects" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">← Back to projects</Link>
      </div>
    </div>
  );
}
