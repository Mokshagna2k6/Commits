import { useEffect, useState } from 'react';
import { LayoutGrid, MessageSquare } from 'lucide-react';
import { usePageTitle } from '@lib/hooks';
import { formatDate, capitalize, cn } from '@lib/utils';
import { Spinner, Badge, EmptyState, Button } from '@components/ui/Primitives';
import api from '@lib/api';
import toast from 'react-hot-toast';

const statusColors = { submitted: 'info', screening: 'warning', interview: 'fox', technical: 'fox', offer: 'success', hired: 'success', rejected: 'danger', withdrawn: 'neutral' };

export default function AdminProjectWall() {
  usePageTitle('Admin Project Wall');
  const [projects, setProjects] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [selectedProject, setSelectedProject] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mocking the behavior for now as we don't have a dedicated project wall API yet
    // In a real scenario, we'd fetch project inquiries
    api.get('/jobs')
      .then((jr) => {
        setProjects(jr.data.data?.jobs || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-warm-900">Project Wall Manager</h2>
          <p className="text-sm text-warm-500">Track interest and inquiries for live projects.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {projects.map((p) => (
          <div key={p._id} className="bg-white rounded-2xl border border-warm-200 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
               <div className="w-8 h-8 rounded-lg bg-fox-50 text-fox-600 flex items-center justify-center">
                 <LayoutGrid size={16} />
               </div>
               <Badge variant="neutral">Active</Badge>
            </div>
            <h3 className="text-sm font-bold text-warm-900 truncate">{p.title}</h3>
            <p className="text-[10px] text-warm-500 mt-1 uppercase tracking-wider">{p.type}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-warm-200 p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-warm-50 flex items-center justify-center mx-auto mb-4 text-warm-300">
          <MessageSquare size={32} />
        </div>
        <h3 className="text-lg font-bold text-warm-900">Project Inquiries</h3>
        <p className="text-sm text-warm-500 max-w-sm mx-auto mt-2">
          When users click "Discuss Project" on the Project Wall, their messages will appear here.
        </p>
      </div>
    </div>
  );
}
