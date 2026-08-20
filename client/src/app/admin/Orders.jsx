import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Mail, MessageSquare, ExternalLink, ChevronDown, ChevronUp, User } from 'lucide-react';
import { usePageTitle } from '@lib/hooks';
import { formatINR, formatDate, capitalize, getStatusBadge } from '@lib/utils';
import { Spinner, Badge, EmptyState, Button } from '@components/ui/Primitives';
import api from '@lib/api';
import toast from 'react-hot-toast';

export default function Orders() {
  usePageTitle('Admin Orders');
  const [tab, setTab] = useState('quotes');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchItems = () => {
    setLoading(true);
    const endpoint = tab === 'quotes' ? '/quotes' : '/invoices';
    api.get(endpoint, { params: { limit: 100 } })
      .then((r) => setItems(r.data.data || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, [tab]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const endpoint = tab === 'quotes' ? `/quotes/${id}/status` : `/invoices/${id}/status`;
      await api.patch(endpoint, { status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
      fetchItems();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const contactUser = (email, phone, name, quoteNum) => {
    const msg = `Hi ${name}, this is about your quote ${quoteNum} on StackFox...`;
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`, '_blank');
    } else {
      window.open(`mailto:${email}?subject=Regarding your quote ${quoteNum}&body=${encodeURIComponent(msg)}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-warm-900">Orders & Billing</h2>
          <p className="text-sm text-warm-500">Manage client quotes, invoices, and payment tracking.</p>
        </div>
      </div>

      <div className="flex bg-warm-100/50 p-1 rounded-2xl w-fit">
        {['quotes', 'invoices'].map((t) => (
          <button 
            key={t} 
            onClick={() => setTab(t)} 
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
              tab === t ? 'bg-white text-fox-500 shadow-sm' : 'text-warm-500 hover:text-warm-900'
            }`}
          >
            {capitalize(t)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon={ShoppingBag} title={`No ${tab} found`} description={`Check back later for new ${tab}.`} />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div 
              key={item._id} 
              className={`bg-white rounded-[2rem] border transition-all duration-300 ${
                expandedId === item._id ? 'border-fox-200 shadow-xl ring-1 ring-fox-100' : 'border-warm-200 hover:border-warm-300'
              }`}
            >
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-warm-50 flex items-center justify-center text-warm-400">
                      <ShoppingBag size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-warm-900">{item.quoteNumber || item.invoiceNumber}</h3>
                        <Badge variant={getStatusBadge(item.status)?.replace('badge-', '')}>{capitalize(item.status)}</Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-warm-500">
                        <span className="flex items-center gap-1 font-semibold text-warm-700">
                          <User size={12} /> {item.client?.name || 'Anonymous User'}
                        </span>
                        <span>&bull;</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right mr-4">
                      <div className="text-xs text-warm-400 font-bold uppercase tracking-widest">Total Amount</div>
                      <div className="font-mono text-xl font-black text-warm-900">{formatINR(item.total)}</div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-warm-200"
                        onClick={() => contactUser(item.client?.email, item.client?.phone, item.client?.name, item.quoteNumber || item.invoiceNumber)}
                      >
                        <MessageSquare size={14} className="text-emerald-500" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="rounded-xl border-warm-200"
                        onClick={() => setExpandedId(expandedId === item._id ? null : item._id)}
                      >
                        {expandedId === item._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </Button>
                    </div>
                  </div>
                </div>

                {expandedId === item._id && (
                  <div className="mt-8 pt-6 border-t border-warm-100 animate-slide-up">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Items List */}
                      <div>
                        <h4 className="text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-4">Itemized Breakdown</h4>
                        <div className="space-y-2">
                          {item.items?.map((sub, i) => (
                            <div key={i} className="flex justify-between items-center bg-warm-50 p-3 rounded-xl border border-warm-100/50">
                              <div>
                                <div className="text-sm font-bold text-warm-900">{sub.name}</div>
                                <div className="text-[10px] text-warm-500">{sub.quantity} units &bull; {formatINR(sub.price)}/ea</div>
                              </div>
                              <div className="font-mono text-sm font-bold text-warm-800">{formatINR(sub.price * sub.quantity)}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Management Actions */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-4">Update Workflow Status</h4>
                          <div className="flex flex-wrap gap-2">
                            {['pending', 'reviewing', 'approved', 'invoiced', 'cancelled'].map((s) => (
                              <button
                                key={s}
                                onClick={() => handleStatusUpdate(item._id, s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all border ${
                                  item.status === s 
                                    ? 'bg-fox-500 text-white border-fox-600' 
                                    : 'bg-white text-warm-500 border-warm-200 hover:border-fox-300'
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-bold text-warm-400 uppercase tracking-widest mb-4">Quick Actions</h4>
                          <div className="flex flex-wrap gap-3">
                            <Link to={`/app/admin/users?id=${item.client?._id}`} className="btn-outline py-2 px-4 rounded-xl text-xs gap-2">
                              <User size={14} /> User Profile
                            </Link>
                            <a href={`mailto:${item.client?.email}`} className="btn-outline py-2 px-4 rounded-xl text-xs gap-2">
                              <Mail size={14} /> Send Email
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
