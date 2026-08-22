import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '@lib/utils';
import { Modal, Input, Textarea, Select, Button } from '@components/ui/Primitives';
import api from '@lib/api';
import toast from 'react-hot-toast';

const DELIVERABLES = [
  { id: 'specs', name: 'Final specifications document', status: 'ready', note: 'PDF, 42 pages' },
  { id: 'code', name: 'Source code repository', status: 'ready', note: 'GitHub private repo invite sent' },
  { id: 'creds', name: 'Admin credentials and hosting', status: 'ready', note: 'LastPass shared folder' },
  { id: 'docs', name: 'User documentation', status: 'in_progress', note: '50% complete' },
];

const ACTIVITIES = [
  { id: 1, actor: 'Priya (Designer)', action: 'uploaded wireframes for review', ts: 'Today, 09:42', unread: false },
  { id: 2, actor: 'Arjun (PM)', action: 'moved task to In Progress', ts: 'Yesterday, 14:05', unread: true },
  { id: 3, actor: 'System', action: 'generated staging link', ts: 'Aug 19', unread: true },
];

export function Activity() {
  const [unread, setUnread] = useState(false);
  const items = unread ? ACTIVITIES.filter((a) => a.unread) : ACTIVITIES;
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">G3 &middot; Activity Feed</p>
      <h1 className="text-2xl font-bold mb-6">Activity</h1>
      <div className="flex gap-3 mb-6">
        <button onClick={() => setUnread(false)} className={`px-4 py-2 rounded-full text-sm font-medium ${!unread ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>All activity</button>
        <button onClick={() => setUnread(true)} className={`px-4 py-2 rounded-full text-sm font-medium ${unread ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}>Unread only</button>
      </div>
      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className={`border rounded-xl p-4 ${a.unread ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
            <div className="flex justify-between"><span className="font-medium">{a.actor}</span> <span className="text-xs text-gray-500">{a.ts}</span></div>
            <p className="text-gray-700 mt-1">{a.action}</p>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link to="/app/client/projects" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Back to projects</Link>
      </div>
    </div>
  );
}

const CR_STATUS_STYLE = {
  approved: 'bg-green-100 text-green-700',
  paid: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  lapsed: 'bg-gray-100 text-gray-600',
  assessed: 'bg-orange-100 text-orange-700',
  submitted: 'bg-blue-100 text-blue-700',
  draft: 'bg-blue-100 text-blue-700',
};

export function Changes() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', urgency: 'MEDIUM' });
  const [submitting, setSubmitting] = useState(false);

  const fetchItems = () => api.get('/change-requests').then((r) => setItems(r.data.data || [])).catch(() => {}).finally(() => setLoading(false));
  useEffect(() => { fetchItems(); }, []);

  const create = async () => {
    if (!form.title || !form.description) { toast.error('Fill all fields.'); return; }
    setSubmitting(true);
    try {
      await api.post('/change-requests', form);
      toast.success('Change request submitted!');
      setShowNew(false);
      setForm({ title: '', description: '', urgency: 'MEDIUM' });
      fetchItems();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">G8 &middot; Change Request Panel</p>
      <h1 className="text-2xl font-bold mb-6">Change Requests</h1>
      <p className="text-gray-600 mb-6">Submit and track change requests. Each request is fixed-price or covered by your revision allowance.</p>
      <div className="mb-4">
        <button onClick={() => setShowNew(true)} className="px-5 py-2.5 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600">+ New Change Request</button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-gray-400">No change requests yet. Submit one above.</p>
      ) : (
        <div className="space-y-4">
          {items.map((c) => (
            <div key={c.id} className="border rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-purple-600">{c.id}</span>
                  <span className="font-semibold">{c.title}</span>
                </div>
                <div className="text-xs text-gray-500 mt-1">Created {formatDate(c.createdAt)}</div>
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${CR_STATUS_STYLE[c.status?.toLowerCase()] ?? 'bg-gray-100 text-gray-600'}`}>{c.status?.toLowerCase().replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showNew} onClose={() => setShowNew(false)} title="New change request" size="md">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Brief summary of the change" />
          <Select label="Urgency" value={form.urgency} onChange={(e) => setForm({ ...form, urgency: e.target.value })} options={[{ value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'HIGH', label: 'High' }]} />
          <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the change you'd like..." />
          <Button variant="primary" onClick={create} isLoading={submitting}>Submit Request</Button>
        </div>
      </Modal>

      <div className="mt-8">
        <Link to="/app/client/projects" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Back to projects</Link>
      </div>
    </div>
  );
}

export function Reports() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">G10 &middot; Reports and Analytics</p>
      <h1 className="text-2xl font-bold mb-6">Reports</h1>
      <p className="text-gray-600 mb-6">Transparent reporting for every engagement. View spending, delivery speed, quality, and engagement health.</p>
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { title: 'Monthly spend', desc: 'Budget used vs allocated across projects.' },
          { title: 'Project timeline', desc: 'Deliverables vs committed timeline.' },
          { title: 'Revisions and QA', desc: 'Rounds used and bug rate over time.' },
          { title: 'Engagement health', desc: 'Response times and satisfaction score.' },
        ].map((r) => (
          <div key={r.title} className="bg-white border rounded-xl p-5">
            <h2 className="font-semibold text-lg mb-2">{r.title}</h2>
            <p className="text-sm text-gray-600 mb-3">{r.desc}</p>
            <div className="bg-gray-100 rounded-xl h-32 flex items-center justify-center text-gray-400 text-xs">[ chart placeholder ]</div>
          </div>
        ))}
      </div>
      <div className="mt-8">
        <Link to="/app/client/projects" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Back to projects</Link>
      </div>
    </div>
  );
}

export function Handover() {
  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">G11 &middot; Post-Delivery Handover</p>
      <h1 className="text-2xl font-bold mb-6">Handover Kit</h1>
      <p className="text-gray-600 mb-6">Your project has shipped. This is your post-delivery handover center for specs, source code, and docs.</p>
      <div className="space-y-3">
        {DELIVERABLES.map((d) => (
          <div key={d.id} className="border rounded-xl p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{d.name}</div>
              <div className="text-xs text-gray-500">{d.note}</div>
            </div>
            <span className={`text-xs font-medium ${d.status === 'ready' ? 'text-green-700' : 'text-orange-700'}`}>{d.status === 'ready' ? 'Ready' : 'In progress'}</span>
          </div>
        ))}
      </div>
      <div className="mt-8 bg-[#FAFAF8] rounded-2xl p-6">
        <h2 className="font-bold mb-2">30-day warranty</h2>
        <p className="text-sm text-gray-600">All bugs reported in the first 30 days are fixed free of charge. Open a ticket under Support.</p>
      </div>
      <div className="mt-6">
        <Link to="/app/client/projects" className="px-4 py-2 text-sm text-orange-600 font-semibold hover:underline">Back to projects</Link>
      </div>
    </div>
  );
}
