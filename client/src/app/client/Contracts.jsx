import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ScrollText, Download, ChevronRight, ArrowRight } from 'lucide-react';
import { usePageTitle } from '@lib/hooks';
import { formatDate } from '@lib/utils';
import { Spinner, Badge, EmptyState } from '@components/ui/Primitives';
import api from '@lib/api';

export default function Contracts() {
  usePageTitle('Contracts');
  const { id } = useParams();
  const [contracts, setContracts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/contracts').then(r => {
      setContracts(r.data.data || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (id) {
      api.get(`/contracts/${id}`).then(r => setSelected(r.data.data)).catch(() => {});
    }
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (id && selected) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2 text-sm text-warm-500">
          <Link to="/app/client/contracts" className="hover:text-fox-500">Contracts</Link>
          <ChevronRight size={14} />
          <span className="text-warm-900">{selected.id}</span>
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-warm-900">Contract {selected.id}</h2>
            <div className="flex gap-2">
              <Badge variant={selected.status === 'SIGNED' ? 'success' : 'warning'}>{selected.status}</Badge>
              <button onClick={() => window.open(`/api/contracts/${id}/pdf`)}
                className="btn-outline text-sm flex items-center gap-1.5 px-3 py-1.5 rounded-lg">
                <Download size={14} /> PDF
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="text-warm-500">Created</span><p className="font-medium">{formatDate(selected.createdAt)}</p></div>
            <div><span className="text-warm-500">Engagement</span><p className="font-medium">{selected.engagementId || '–'}</p></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-warm-900">Contracts</h1>

      {contracts.length === 0 ? (
        <EmptyState icon={ScrollText} title="No contracts" description="Contracts appear after you complete checkout and sign the agreement." />
      ) : (
        <div className="space-y-3">
          {contracts.map(c => (
            <Link key={c.id} to={`/app/client/contracts/${c.id}`}
              className="bg-white rounded-2xl border border-warm-200 p-5 flex items-center justify-between hover:shadow-card transition-shadow group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <ScrollText size={20} />
                </div>
                <div>
                  <p className="font-medium text-warm-900">Contract {c.id}</p>
                  <p className="text-sm text-warm-500">{formatDate(c.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={c.status === 'SIGNED' ? 'success' : 'warning'}>{c.status}</Badge>
                <ArrowRight size={16} className="text-warm-300 group-hover:text-fox-500" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
