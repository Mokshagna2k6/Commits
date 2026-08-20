import { useState } from 'react';
import { Search, BookOpen, Code2, Palette, Cog, Wrench, Plus, ExternalLink } from 'lucide-react';
import { Badge, EmptyState } from '@components/ui/Primitives';

const categories = [
  { key: 'all', label: 'All', icon: BookOpen },
  { key: 'development', label: 'Development', icon: Code2 },
  { key: 'design', label: 'Design', icon: Palette },
  { key: 'process', label: 'Process', icon: Cog },
  { key: 'tools', label: 'Tools', icon: Wrench },
];

const articles = [
  { id: 1, title: 'Git Branching Strategy', category: 'development', author: 'Rohan Das', date: '2026-08-12', views: 48, excerpt: 'Our standard branching model using trunk-based development with short-lived feature branches.' },
  { id: 2, title: 'Design System Components', category: 'design', author: 'Anika Verma', date: '2026-08-08', views: 62, excerpt: 'Complete guide to using our Tailwind-based component library with warm/fox color tokens.' },
  { id: 3, title: 'Sprint Ceremony Guide', category: 'process', author: 'Priya Kapoor', date: '2026-07-25', views: 35, excerpt: 'How we run standups, sprint planning, reviews, and retrospectives at StackFox.' },
  { id: 4, title: 'Setting Up Local Dev Environment', category: 'tools', author: 'Vikram Joshi', date: '2026-07-20', views: 89, excerpt: 'Step-by-step guide to clone, install dependencies, configure env vars, and run the stack locally.' },
  { id: 5, title: 'API Error Handling Patterns', category: 'development', author: 'Rohan Das', date: '2026-07-15', views: 41, excerpt: 'Standardized error response format, status codes, and client-side error boundary patterns.' },
  { id: 6, title: 'Figma to Code Handoff Process', category: 'design', author: 'Anika Verma', date: '2026-07-10', views: 55, excerpt: 'How designers export specs and how developers translate Figma frames to React components.' },
  { id: 7, title: 'Deployment Checklist', category: 'process', author: 'Vikram Joshi', date: '2026-06-28', views: 73, excerpt: 'Pre-deployment, deployment, and post-deployment verification steps for production releases.' },
  { id: 8, title: 'Useful VS Code Extensions', category: 'tools', author: 'Priya Kapoor', date: '2026-06-20', views: 30, excerpt: 'Recommended extensions for React, Tailwind, Git, and productivity.' },
];

const categoryColor = { development: 'info', design: 'default', process: 'warning', tools: 'success' };

export default function Knowledge() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [showSuggest, setShowSuggest] = useState(false);

  const filtered = articles.filter((a) => {
    if (category !== 'all' && a.category !== category) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.excerpt.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-warm-900">Knowledge Base</h2>
        <button onClick={() => setShowSuggest(!showSuggest)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-fox-500 text-white text-sm font-medium hover:bg-fox-600 transition">
          <Plus size={14} /> Suggest Article
        </button>
      </div>

      {showSuggest && (
        <div className="bg-white rounded-2xl border border-warm-200 p-6 space-y-3">
          <input placeholder="Article title" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fox-500/30" />
          <textarea rows={3} placeholder="What should this article cover?" className="w-full border border-warm-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-fox-500/30 resize-none" />
          <div className="flex gap-2">
            <button className="px-4 py-2 rounded-xl bg-fox-500 text-white text-sm font-medium hover:bg-fox-600 transition">Submit</button>
            <button onClick={() => setShowSuggest(false)} className="px-4 py-2 rounded-xl bg-warm-100 text-warm-600 text-sm font-medium hover:bg-warm-200 transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search articles..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-warm-200 text-sm focus:outline-none focus:ring-2 focus:ring-fox-500/30" />
      </div>

      <div className="flex gap-2">
        {categories.map((c) => (
          <button key={c.key} onClick={() => setCategory(c.key)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${category === c.key ? 'bg-fox-500 text-white' : 'bg-warm-50 text-warm-600 hover:bg-warm-100'}`}>
            <c.icon size={14} /> {c.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No articles found" description="Try a different search or category." />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {filtered.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl border border-warm-200 p-5 hover:shadow-sm transition cursor-pointer group">
              <div className="flex items-start justify-between mb-2">
                <Badge variant={categoryColor[a.category]}>{a.category}</Badge>
                <ExternalLink size={14} className="text-warm-300 group-hover:text-fox-500 transition" />
              </div>
              <h3 className="font-medium text-warm-900 text-sm mb-1">{a.title}</h3>
              <p className="text-xs text-warm-500 mb-3 line-clamp-2">{a.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-warm-400">
                <span>{a.author}</span>
                <span>{a.views} views</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
