import { useState } from 'react';
import { Star, Send, MessageSquare } from 'lucide-react';
import { Badge } from '@components/ui/Primitives';

const completedProjects = [
  { id: 1, name: 'E-commerce Platform', code: 'PRJ-1042', completedAt: '2026-07-28' },
  { id: 2, name: 'Mobile App Redesign', code: 'PRJ-1038', completedAt: '2026-06-15' },
];

export default function Feedback() {
  const [selected, setSelected] = useState(completedProjects[0]?.id);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [nps, setNps] = useState(8);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="space-y-5">
        <h2 className="text-lg font-semibold text-warm-900">Project Feedback</h2>
        <div className="bg-white rounded-2xl border border-warm-200 p-10 text-center">
          <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={24} className="text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-warm-900 mb-1">Thank you for your feedback!</h3>
          <p className="text-sm text-warm-500">Your response helps us improve our services.</p>
          <button onClick={() => { setSubmitted(false); setRating(0); setComment(''); }} className="mt-5 px-5 py-2 rounded-xl bg-warm-100 text-warm-700 text-sm font-medium hover:bg-warm-200 transition">
            Submit Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-warm-900">Project Feedback</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <label className="block text-sm font-medium text-warm-700 mb-2">Select Project</label>
          <div className="space-y-2">
            {completedProjects.map((p) => (
              <label key={p.id} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition ${selected === p.id ? 'border-fox-500 bg-fox-500/5' : 'border-warm-100 hover:bg-warm-50'}`}>
                <input type="radio" name="project" checked={selected === p.id} onChange={() => setSelected(p.id)} className="accent-fox-500" />
                <div>
                  <span className="text-sm font-medium text-warm-900">{p.name}</span>
                  <Badge variant="default" className="ml-2">{p.code}</Badge>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <label className="block text-sm font-medium text-warm-700 mb-3">Rating</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button type="button" key={s} onClick={() => setRating(s)} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                className="transition-transform hover:scale-110">
                <Star size={32} className={`${(hover || rating) >= s ? 'text-amber-400 fill-amber-400' : 'text-warm-200'} transition-colors`} />
              </button>
            ))}
          </div>
          {rating > 0 && <p className="text-xs text-warm-500 mt-2">{['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][rating]}</p>}
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <label className="block text-sm font-medium text-warm-700 mb-2">How likely are you to recommend StackFox? (0-10)</label>
          <input type="range" min={0} max={10} value={nps} onChange={(e) => setNps(+e.target.value)} className="w-full accent-fox-500" />
          <div className="flex justify-between text-xs text-warm-400 mt-1">
            <span>Not likely</span>
            <span className="font-bold text-fox-500 text-sm">{nps}</span>
            <span>Very likely</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-warm-200 p-6">
          <label className="block text-sm font-medium text-warm-700 mb-2">Comments</label>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4} placeholder="Tell us about your experience..."
            className="w-full border border-warm-200 rounded-xl px-4 py-3 text-sm text-warm-800 placeholder:text-warm-400 focus:outline-none focus:ring-2 focus:ring-fox-500/30 resize-none" />
        </div>

        <button type="submit" disabled={!rating} className="w-full py-3 rounded-xl bg-fox-500 text-white font-medium text-sm hover:bg-fox-600 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <Send size={16} /> Submit Feedback
        </button>
      </form>
    </div>
  );
}
