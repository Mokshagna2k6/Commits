import { useState } from 'react';
import { Star, ClipboardCheck, Clock, Send } from 'lucide-react';
import { Badge } from '@components/ui/Primitives';
import { formatDate } from '@lib/utils';

const completedReviews = [
  { id: 1, reviewer: 'Anika Verma', period: 'Q2 2026', rating: 4.5, summary: 'Excellent technical skills and team collaboration. Consistently delivers ahead of deadlines.', date: '2026-07-05' },
  { id: 2, reviewer: 'Rohan Das', period: 'Q1 2026', rating: 4.0, summary: 'Strong problem-solving abilities. Could improve on documentation practices.', date: '2026-04-10' },
];

const pendingRequests = [
  { id: 1, for: 'Vikram Joshi', role: 'Backend Developer', dueDate: '2026-08-25' },
  { id: 2, for: 'Priya Kapoor', role: 'UI Designer', dueDate: '2026-08-28' },
];

export default function Reviews() {
  const [tab, setTab] = useState('completed');
  const [formRating, setFormRating] = useState(0);
  const [formHover, setFormHover] = useState(0);
  const [formText, setFormText] = useState('');
  const [reviewFor, setReviewFor] = useState(pendingRequests[0]?.id);

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star key={s} size={14} className={s <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-warm-200'} />
      ))}
    </div>
  );

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-warm-900">Performance Reviews</h2>

      <div className="flex gap-1 bg-warm-50 rounded-xl p-1">
        {[{ key: 'completed', label: 'Completed', icon: ClipboardCheck }, { key: 'pending', label: 'Pending', icon: Clock }, { key: 'submit', label: 'Submit Review', icon: Send }].map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition ${tab === t.key ? 'bg-white text-fox-500 shadow-sm' : 'text-warm-500 hover:text-warm-700'}`}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === 'completed' && (
        <div className="space-y-3">
          {completedReviews.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-warm-200 p-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-medium text-warm-900 text-sm">{r.period} Review</h3>
                  <p className="text-xs text-warm-500">By {r.reviewer} &middot; {formatDate(r.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  {renderStars(r.rating)}
                  <span className="text-sm font-bold text-warm-800">{r.rating}</span>
                </div>
              </div>
              <p className="text-sm text-warm-600 bg-warm-50 rounded-xl p-3">{r.summary}</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'pending' && (
        <div className="space-y-3">
          {pendingRequests.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl border border-warm-200 p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-fox-500/10 flex items-center justify-center text-fox-500 text-xs font-bold">{r.for[0]}</div>
                <div>
                  <p className="text-sm font-medium text-warm-900">{r.for}</p>
                  <p className="text-xs text-warm-500">{r.role}</p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant="warning">Due {formatDate(r.dueDate)}</Badge>
                <button onClick={() => { setReviewFor(r.id); setTab('submit'); }} className="block mt-1 text-xs text-fox-500 hover:underline">Write Review</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'submit' && (
        <div className="bg-white rounded-2xl border border-warm-200 p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">Review For</label>
            <select value={reviewFor} onChange={(e) => setReviewFor(+e.target.value)} className="w-full border border-warm-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fox-500/30">
              {pendingRequests.map((p) => <option key={p.id} value={p.id}>{p.for} - {p.role}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button type="button" key={s} onClick={() => setFormRating(s)} onMouseEnter={() => setFormHover(s)} onMouseLeave={() => setFormHover(0)}>
                  <Star size={28} className={`${(formHover || formRating) >= s ? 'text-amber-400 fill-amber-400' : 'text-warm-200'} transition-colors`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-warm-700 mb-2">Feedback</label>
            <textarea value={formText} onChange={(e) => setFormText(e.target.value)} rows={4} placeholder="Share your observations about their performance..."
              className="w-full border border-warm-200 rounded-xl px-4 py-3 text-sm placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-fox-500/30 resize-none" />
          </div>
          <button disabled={!formRating || !formText} className="px-6 py-2.5 rounded-xl bg-fox-500 text-white text-sm font-medium hover:bg-fox-600 transition disabled:opacity-40 flex items-center gap-2">
            <Send size={14} /> Submit Review
          </button>
        </div>
      )}
    </div>
  );
}
