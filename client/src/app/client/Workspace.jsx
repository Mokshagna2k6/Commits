import { useState } from 'react';
import { FolderOpen, CheckCircle2, Users, Clock, FileText, ListTodo, LayoutDashboard } from 'lucide-react';
import { Badge } from '@components/ui/Primitives';
import { formatDate } from '@lib/utils';

const tabs = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'files', label: 'Files', icon: FileText },
  { key: 'tasks', label: 'Tasks', icon: ListTodo },
  { key: 'team', label: 'Team', icon: Users },
];

const mockActivity = [
  { id: 1, text: 'Design mockups uploaded', time: '2 hours ago', user: 'Anika' },
  { id: 2, text: 'Sprint review completed', time: '5 hours ago', user: 'Rohan' },
  { id: 3, text: 'API integration milestone approved', time: '1 day ago', user: 'Admin' },
  { id: 4, text: 'New task assigned: Payment gateway', time: '2 days ago', user: 'Anika' },
];

const mockFiles = [
  { name: 'Brand-Guidelines-v2.pdf', size: '2.4 MB', date: '2026-08-18' },
  { name: 'Wireframes-Final.fig', size: '8.1 MB', date: '2026-08-15' },
  { name: 'API-Docs.md', size: '124 KB', date: '2026-08-10' },
];

const mockTasks = [
  { name: 'Payment gateway integration', status: 'in_progress', assignee: 'Rohan' },
  { name: 'Dashboard UI polish', status: 'done', assignee: 'Anika' },
  { name: 'Write unit tests', status: 'todo', assignee: 'Vikram' },
];

const mockTeam = [
  { name: 'Anika Verma', role: 'Lead Designer' },
  { name: 'Rohan Das', role: 'Full-Stack Dev' },
  { name: 'Vikram Joshi', role: 'Backend Dev' },
];

const statusColors = { todo: 'warning', in_progress: 'info', done: 'success' };
const statusLabels = { todo: 'To Do', in_progress: 'In Progress', done: 'Done' };

export default function Workspace() {
  const [tab, setTab] = useState('overview');
  const progress = 65;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-warm-900">Project Workspace</h2>
        <Badge variant="info">In Progress</Badge>
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-warm-700">Overall Progress</span>
          <span className="text-sm font-bold text-fox-500">{progress}%</span>
        </div>
        <div className="w-full bg-warm-100 rounded-full h-2.5">
          <div className="bg-fox-500 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex gap-1 bg-warm-50 rounded-xl p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? 'bg-white text-fox-500 shadow-sm' : 'text-warm-500 hover:text-warm-700'}`}>
            <t.icon size={15} /> {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 p-6">
        {tab === 'overview' && (
          <div className="space-y-3">
            <h3 className="font-medium text-warm-900 text-sm mb-3">Recent Activity</h3>
            {mockActivity.map((a) => (
              <div key={a.id} className="flex items-start gap-3">
                <Clock size={14} className="text-warm-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-warm-800">{a.text}</p>
                  <p className="text-xs text-warm-400">{a.user} &middot; {a.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'files' && (
          <div className="space-y-3">
            {mockFiles.map((f) => (
              <div key={f.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <FileText size={16} className="text-warm-400" />
                  <span className="text-sm font-medium text-warm-800">{f.name}</span>
                </div>
                <span className="text-xs text-warm-500">{f.size} &middot; {formatDate(f.date)}</span>
              </div>
            ))}
          </div>
        )}
        {tab === 'tasks' && (
          <div className="space-y-3">
            {mockTasks.map((t) => (
              <div key={t.name} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <CheckCircle2 size={16} className={t.status === 'done' ? 'text-green-500' : 'text-warm-300'} />
                  <span className="text-sm text-warm-800">{t.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-warm-500">{t.assignee}</span>
                  <Badge variant={statusColors[t.status]}>{statusLabels[t.status]}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 'team' && (
          <div className="space-y-3">
            {mockTeam.map((m) => (
              <div key={m.name} className="flex items-center gap-3 py-2">
                <div className="w-8 h-8 rounded-full bg-fox-500/10 flex items-center justify-center text-fox-500 text-xs font-bold">{m.name[0]}</div>
                <div>
                  <p className="text-sm font-medium text-warm-900">{m.name}</p>
                  <p className="text-xs text-warm-500">{m.role}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
