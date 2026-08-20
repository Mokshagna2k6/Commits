import { useState } from 'react';
import { Link } from 'react-router-dom';

const ACTIVITIES = [
  { id: 1, actor: 'Priya (Designer)', action: 'uploaded wireframes for review', ts: 'Today, 09:42', unread: false },
  { id: 2, actor: 'You', action: 'approved the homepage mockup', ts: 'Yesterday, 16:10', unread: false },
  { id: 3, actor: 'Arjun (PM)', action: 'moved task Contact form to In Progress', ts: 'Yesterday, 14:05', unread: true },
  { id: 4, actor: 'System', action: 'generated staging link', ts: 'Aug 19', unread: true },
  { id: 5, actor: 'Priya (Designer)', action: 'requested clarification on logo variant', ts: 'Aug 18', unread: true },
];

export default function Activity() {
  const [unread, setUnread] = useState(false);
  const items = unread ? ACTIVITIES.filter((a) => a.unread) : ACTIVITIES;

  return (
    <div className="p-6">
      <p className="text-sm font-semibold text-orange-600 mb-2">G3 &middot; Activity Feed</p>
      <h1 className="text-2xl font-bold mb-6">Activity</h1>
      <p className="text-gray-600 mb-6">Everything happening on your project, in real time.</p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setUnread(false)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${!unread ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          All activity
        </button>
        <button
          onClick={() => setUnread(true)}
          className={`px-4 py-2 rounded-full text-sm font-medium ${unread ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600'}`}
        >
          Unread only
        </button>
      </div>

      <div className="space-y-3">
        {items.map((a) => (
          <div key={a.id} className={`border rounded-xl p-4 ${a.unread ? 'bg-orange-50 border-orange-200' : 'bg-white'}`}>
            <div className="flex justify-between">
              <span className="font-medium">{a.actor}</span>
              <span className="text-xs text-gray-500">{a.ts}</span>
            </div>
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
