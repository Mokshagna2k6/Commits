import { useEffect, useState } from 'react';
import { Package, Plus, Edit3, Trash2, Search, Info, Eye, Check, X } from 'lucide-react';
import { usePageTitle, useDebounce } from '@lib/hooks';
import { formatINR, cn } from '@lib/utils';
import { Spinner, Button, EmptyState, Badge } from '@components/ui/Primitives';
import api from '@lib/api';
import toast from 'react-hot-toast';

export default function Catalog() {
  usePageTitle('Admin Catalog');
  const [tab, setTab] = useState('services');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const q = useDebounce(search, 200);

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = '/catalog/services';
      if (tab === 'categories') endpoint = '/catalog/categories';
      if (tab === 'packages') endpoint = '/catalog/packages';
      if (tab === 'bundles') endpoint = '/catalog/bundles';
      
      const r = await api.get(endpoint, { params: { limit: 500 } });
      const data = r.data.data;
      
      // Handle paginated vs non-paginated responses
      if (tab === 'services') {
        setItems(data.results || []);
      } else {
        setItems(data[tab] || []);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setItems([]);
      toast.error(`Failed to load ${tab}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [tab]);

  const filtered = q
    ? items.filter((i) => 
        (i.name || '').toLowerCase().includes(q.toLowerCase()) || 
        (i.dataId || '').toLowerCase().includes(q.toLowerCase())
      )
    : items;

  const handleDeactivate = async (id) => {
    const typeMap = {
      services: 'service',
      categories: 'category',
      packages: 'package',
      bundles: 'bundle'
    };

    if (!confirm(`Are you sure you want to deactivate this ${typeMap[tab]}?`)) return;

    try {
      await api.post('/admin/catalog/deactivate', {
        id,
        type: typeMap[tab]
      });
      toast.success('Item deactivated');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const tabs = [
    { key: 'services', label: 'Services' },
    { key: 'categories', label: 'Categories' },
    { key: 'packages', label: 'Packages' },
    { key: 'bundles', label: 'Bundles' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-warm-900 tracking-tight">Catalog Management</h2>
          <p className="text-sm text-warm-500">Manage and update your service offerings across the platform.</p>
        </div>
        <div className="flex items-center gap-2">
           <Badge variant="fox" className="px-3 py-1">Admin Access Verified</Badge>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1 space-y-4">
          {/* Tabs */}
          <div className="flex gap-1 bg-warm-100 rounded-2xl p-1.5 w-fit border border-warm-200">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => { setTab(t.key); setSearch(''); }}
                className={cn(
                  'px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200',
                  tab === t.key 
                    ? 'bg-white shadow-nav text-fox-600 scale-100' 
                    : 'text-warm-500 hover:text-warm-800 hover:bg-white/50 scale-95 hover:scale-100'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              type="text"
              placeholder={`Search in ${tab}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-fx pl-11 h-12 text-base bg-white border-warm-200 focus:border-fox-500 transition-all rounded-2xl"
            />
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Spinner size="xl" variant="fox" />
              <p className="text-sm font-medium text-warm-500 animate-pulse">Fetching latest catalog data...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white/50 rounded-3xl border-2 border-dashed border-warm-200 p-20">
              <EmptyState 
                icon={Package} 
                title={`No items found in ${tab}`} 
                description="Try adjusting your search or reloading the page."
              />
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-warm-200 shadow-elevated overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-warm-50/50 border-b border-warm-200">
                      <th className="py-4 px-6 font-bold text-warm-700 uppercase tracking-wider text-xs">Details</th>
                      {tab === 'services' && <th className="py-4 px-6 font-bold text-warm-700 uppercase tracking-wider text-xs">Category</th>}
                      {tab === 'categories' && <th className="py-4 px-6 font-bold text-warm-700 uppercase tracking-wider text-xs">Layman Tip</th>}
                      <th className="py-4 px-6 font-bold text-warm-700 uppercase tracking-wider text-xs text-right">Price</th>
                      <th className="py-4 px-6 font-bold text-warm-700 uppercase tracking-wider text-xs text-center w-32">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100">
                    {filtered.map((item) => (
                      <tr key={item._id || item.id} className="hover:bg-fox-50/30 transition-colors group">
                        <td className="py-4 px-6">
                          <div className="flex flex-col">
                            <span className="font-bold text-warm-900 text-base">{item.name}</span>
                            <span className="text-xs font-mono text-warm-400 mt-0.5">{item.dataId || item.id}</span>
                          </div>
                        </td>
                        
                        {tab === 'services' && (
                          <td className="py-4 px-6">
                            <Badge variant="neutral" className="font-medium">{item.catId}</Badge>
                          </td>
                        )}

                        {tab === 'categories' && (
                          <td className="py-4 px-6">
                            {item.laymanTip ? (
                              <p className="text-xs text-warm-500 italic max-w-xs leading-relaxed">"{item.laymanTip}"</p>
                            ) : (
                              <span className="text-xs text-warm-300 italic">No tip added</span>
                            )}
                          </td>
                        )}

                        <td className="py-4 px-6 text-right">
                          <div className="flex flex-col items-end">
                            <span className="text-base font-black text-warm-900">{item.price ? formatINR(item.price) : '—'}</span>
                            {item.unit && <span className="text-[10px] text-warm-400 font-bold uppercase tracking-widest mt-0.5">per {item.unit}</span>}
                          </div>
                        </td>

                        <td className="py-4 px-6">
                          <div className="flex items-center justify-center gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => handleDeactivate(item._id || item.id)}
                              className="p-2 hover:bg-danger-50 rounded-xl text-warm-400 hover:text-danger-500 transition-all hover:scale-110 active:scale-95"
                              title="Deactivate"
                            >
                              <Trash2 size={18} />
                            </button>
                            <button 
                              className="p-2 hover:bg-warm-100 rounded-xl text-warm-400 hover:text-warm-900 transition-all hover:scale-110 active:scale-95"
                              title="More info"
                            >
                              <Info size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
          }

          <div className="flex items-center justify-between text-xs px-2">
            <span className="text-warm-400 font-medium">
              Showing {filtered.length} of {items.length} {tab} 
            </span>
            <div className="flex items-center gap-1.5 text-fox-500 font-bold uppercase tracking-widest">
              <Badge variant="outline" className="text-[9px] border-fox-200">Catalog Version 2.0.4</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
