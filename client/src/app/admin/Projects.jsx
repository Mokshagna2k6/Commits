import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FolderKanban, ArrowLeft } from 'lucide-react';
import { usePageTitle } from '@lib/hooks';
import { formatINR, formatDate, capitalize, getStatusBadge } from '@lib/utils';
import { Spinner, Badge, EmptyState, Button } from '@components/ui/Primitives';
import api from '@lib/api';

export default function AdminProjects() {
  usePageTitle('Admin Projects');
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (id) {
      api.get(`/projects/${id}`).then((r) => setProject(r.data.data.project)).catch(() => {}).finally(() => setLoading(false));
    } else {
      const params = { limit: 100 };
      if (statusFilter !== 'all') params.status = statusFilter;
      api.get('/projects', { params }).then((r) => setProjects(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id, statusFilter]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  if (id && project) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Link to="/app/admin/projects" className="p-2 hover:bg-warm-100 rounded-lg"><ArrowLeft size={18} /></Link>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-warm-900">{project.title}</h2>
            <p className="text-xs text-warm-500">{project.projectNumber} &middot; Client: {project.client?.name}</p>
          </div>
          <Badge variant={getStatusBadge(project.status)?.replace('badge-', '')}>{capitalize(project.status)}</Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-warm-50 rounded-xl p-4"><div className="text-xs text-warm-500">Total</div><div className="font-mono font-semibold mt-1">{formatINR(project.totalAmount)}</div></div>
          <div className="bg-warm-50 rounded-xl p-4"><div className="text-xs text-warm-500">Paid</div><div className="font-mono font-semibold mt-1 text-success-700">{formatINR(project.paidAmount || 0)}</div></div>
          <div className="bg-warm-50 rounded-xl p-4"><div className="text-xs text-warm-500">Team</div><div className="font-mono font-semibold mt-1">{project.team?.length || 0}</div></div>
          <div className="bg-warm-50 rounded-xl p-4"><div className="text-xs text-warm-500">Progress</div><div className="font-mono font-semibold mt-1">{project.progress || 0}%</div></div>
        </div>
        <div className="bg-white rounded-xl border border-warm-200 p-5">
          <h3 className="font-semibold text-warm-900 mb-3">Milestones</h3>
          {project.milestones?.map((ms, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b border-warm-100 last:border-0">
              <span className="text-sm flex-1">{ms.title}</span>
              <span className="text-xs font-mono text-warm-500">{formatINR(ms.amount || 0)}</span>
              <Badge variant={getStatusBadge(ms.status)?.replace('badge-', '') || 'neutral'}>{capitalize(ms.status)}</Badge>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-warm-900">All projects</h2>
      <div className="flex gap-2 flex-wrap">
        {['all', 'planning', 'in-progress', 'review', 'completed', 'on-hold'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setLoading(true); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === s ? 'bg-fox-500 text-white' : 'bg-warm-100 text-warm-600'}`}>
            {capitalize(s === 'all' ? 'all' : s)}
          </button>
        ))}
      </div>
      {projects.length === 0 ? <EmptyState icon={FolderKanban} title="No projects" /> : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link key={p._id} to={`/app/admin/projects/${p._id}`} className="block bg-white rounded-xl border border-warm-200 p-4 hover:shadow-card transition-shadow">
              <div className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-warm-900">{p.title}</p>
                  <p className="text-xs text-warm-500">{p.projectNumber} &middot; {p.client?.name} &middot; {formatDate(p.createdAt)}</p>
                </div>
                <span className="font-mono text-sm text-warm-700">{formatINR(p.totalAmount)}</span>
                <Badge variant={getStatusBadge(p.status)?.replace('badge-', '')}>{capitalize(p.status)}</Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
