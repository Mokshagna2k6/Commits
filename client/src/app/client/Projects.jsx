import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FolderKanban, ArrowLeft, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePageTitle } from '@lib/hooks';
import { formatINR, formatDate, capitalize, cn, getStatusBadge } from '@lib/utils';
import { Spinner, Badge, EmptyState, Button } from '@components/ui/Primitives';
import api from '@lib/api';

const MilestoneBar = ({ milestones }) => {
  if (!milestones?.length) return null;
  const total = milestones.length;
  const done = milestones.filter((m) => m.status === 'approved').length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-warm-500">
        <span>{done}/{total} milestones</span>
        <span className="font-mono">{pct}%</span>
      </div>
      <div className="h-2 bg-warm-100 rounded-full overflow-hidden">
        <div className="h-full bg-fox-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

const msStatusIcon = { pending: Clock, 'in-progress': AlertCircle, review: AlertCircle, approved: CheckCircle, rejected: AlertCircle };
const msStatusColor = { pending: 'text-warm-400', 'in-progress': 'text-warning-500', review: 'text-fox-500', approved: 'text-success-500', rejected: 'text-danger-500' };

function ProjectDetail({ id }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/projects/${id}`).then((r) => setProject(r.data.data.project)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  if (!project) return <EmptyState icon={FolderKanban} title="Project not found" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/app/client/projects" className="p-2 hover:bg-warm-100 rounded-lg"><ArrowLeft size={18} /></Link>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-warm-900">{project.title}</h2>
          <p className="text-xs text-warm-500">{project.projectNumber}</p>
        </div>
        <Badge variant={getStatusBadge(project.status)?.replace('badge-', '')}>{capitalize(project.status)}</Badge>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: formatINR(project.totalAmount) },
          { label: 'Paid', value: formatINR(project.paidAmount || 0) },
          { label: 'Balance', value: formatINR((project.totalAmount || 0) - (project.paidAmount || 0)) },
          { label: 'Start', value: formatDate(project.startDate) },
        ].map((s, i) => (
          <div key={i} className="bg-warm-50 rounded-xl p-4">
            <div className="text-xs text-warm-500">{s.label}</div>
            <div className="text-base font-semibold font-mono text-warm-900 mt-1">{s.value}</div>
          </div>
        ))}
      </div>

      {project.description && <p className="text-sm text-warm-600">{project.description}</p>}

      <MilestoneBar milestones={project.milestones} />

      <div className="bg-white rounded-2xl border border-warm-200 p-5">
        <h3 className="font-semibold text-warm-900 mb-4">Milestones</h3>
        <div className="space-y-3">
          {project.milestones?.sort((a, b) => a.order - b.order).map((ms, i) => {
            const Icon = msStatusIcon[ms.status] || Clock;
            return (
              <div key={ms._id || i} className="flex items-start gap-3 p-3 rounded-xl bg-warm-50">
                <Icon size={18} className={cn('mt-0.5 shrink-0', msStatusColor[ms.status])} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-warm-900">{ms.title}</p>
                  {ms.description && <p className="text-xs text-warm-500 mt-0.5">{ms.description}</p>}
                  <div className="flex gap-3 mt-1.5 text-xs text-warm-400">
                    {ms.dueDate && <span>Due: {formatDate(ms.dueDate)}</span>}
                    {ms.amount > 0 && <span className="font-mono">{formatINR(ms.amount)}</span>}
                    {ms.weightPercent > 0 && <span>{ms.weightPercent}% weight</span>}
                  </div>
                </div>
                <Badge variant={getStatusBadge(ms.status)?.replace('badge-', '') || 'neutral'} className="shrink-0">
                  {capitalize(ms.status)}
                </Badge>
              </div>
            );
          })}
        </div>
      </div>

      {project.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {project.techStack.map((t) => <span key={t} className="badge-fx badge-neutral text-xs">{t}</span>)}
        </div>
      )}
    </div>
  );
}

export default function Projects() {
  usePageTitle('Projects');
  const { id } = useParams();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      api.get('/projects').then((r) => setProjects(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
    }
  }, [id]);

  if (id) return <ProjectDetail id={id} />;
  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-warm-900">Projects</h2>

      {projects.length === 0 ? (
        <EmptyState icon={FolderKanban} title="No projects yet" description="Your projects will appear here once a quote is converted." action={<Link to="/builder" className="btn-fox text-sm px-4 py-2">Browse Services</Link>} />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link key={p._id} to={`/app/client/projects/${p._id}`} className="block bg-white rounded-2xl border border-warm-200 p-5 hover:shadow-card transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h3 className="font-medium text-warm-900">{p.title}</h3>
                  <p className="text-xs text-warm-500 mt-0.5">{p.projectNumber} &middot; {formatDate(p.createdAt)}</p>
                </div>
                <Badge variant={getStatusBadge(p.status)?.replace('badge-', '')}>{capitalize(p.status)}</Badge>
              </div>
              <MilestoneBar milestones={p.milestones} />
              <div className="flex gap-4 mt-3 text-xs text-warm-500">
                <span>Total: <span className="font-mono text-warm-700">{formatINR(p.totalAmount)}</span></span>
                <span>Paid: <span className="font-mono text-success-700">{formatINR(p.paidAmount || 0)}</span></span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
