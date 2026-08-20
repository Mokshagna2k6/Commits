import { usePageTitle } from '@lib/hooks';
import { Settings as SettingsIcon, Database, Mail, CreditCard, Shield } from 'lucide-react';

const settingSections = [
  { icon: Database, title: 'Database', desc: 'MongoDB connection status and backup configuration.', status: 'Connected' },
  { icon: Mail, title: 'Email (SMTP)', desc: 'Configure SendGrid or SMTP for transactional emails.', status: 'Check .env' },
  { icon: CreditCard, title: 'Razorpay', desc: 'Payment gateway credentials and webhook configuration.', status: 'Check .env' },
  { icon: Shield, title: 'Security', desc: 'JWT secrets, rate limiting, and CORS configuration.', status: 'Active' },
];

export default function AdminSettings() {
  usePageTitle('Admin Settings');

  return (
    <div className="space-y-6 max-w-3xl">
      <h2 className="text-lg font-semibold text-warm-900">Settings</h2>

      <div className="space-y-4">
        {settingSections.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-warm-200 p-5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-warm-100 flex items-center justify-center shrink-0">
              <s.icon size={20} className="text-warm-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-warm-900">{s.title}</h3>
              <p className="text-sm text-warm-500 mt-0.5">{s.desc}</p>
            </div>
            <span className="badge-fx badge-neutral text-xs shrink-0">{s.status}</span>
          </div>
        ))}
      </div>

      <div className="bg-warm-100 rounded-2xl p-6 text-center">
        <p className="text-sm text-warm-600">All configuration is managed via environment variables in <code className="bg-white px-2 py-0.5 rounded text-fox-500 text-xs font-mono">server/.env</code></p>
        <p className="text-xs text-warm-400 mt-2">See README.md for the complete list of available settings.</p>
      </div>
    </div>
  );
}
