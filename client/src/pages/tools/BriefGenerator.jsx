import { useState } from 'react';
import { usePageTitle } from '@lib/hooks';
import { FileText, ArrowRight, ArrowLeft } from 'lucide-react';

const steps = ['Project Type', 'Budget & Timeline', 'Features', 'Summary'];
const projectTypes = ['Website', 'Mobile App', 'SaaS Platform', 'E-Commerce', 'AI/ML Solution'];
const budgetRanges = ['$5k - $15k', '$15k - $50k', '$50k - $100k', '$100k+'];
const timelines = ['1-2 months', '3-4 months', '5-6 months', '6+ months'];
const featureOptions = ['User Auth', 'Payment Integration', 'Admin Dashboard', 'Analytics', 'API Development', 'Real-time Chat', 'File Upload', 'Email Notifications', 'Multi-language', 'Third-party Integrations'];

export default function BriefGenerator() {
  usePageTitle('Brief Generator');
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ type: '', budget: '', timeline: '', features: [] });

  const toggleFeature = (f) => {
    const features = data.features.includes(f) ? data.features.filter((x) => x !== f) : [...data.features, f];
    setData({ ...data, features });
  };

  return (
    <div className="max-w-2xl mx-auto py-16 px-4">
      <div className="text-center mb-10">
        <FileText className="w-12 h-12 text-fox-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-warm-900 mb-2">Brief Generator</h1>
        <p className="text-warm-600">Build a project brief in a few steps.</p>
      </div>

      <div className="flex gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${i <= step ? 'bg-fox-500' : 'bg-warm-200'}`} />
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-warm-200 p-6 min-h-[280px]">
        <h2 className="font-semibold text-warm-900 mb-4">{steps[step]}</h2>

        {step === 0 && (
          <div className="grid grid-cols-2 gap-3">
            {projectTypes.map((t) => (
              <button key={t} onClick={() => setData({ ...data, type: t })} className={`rounded-xl px-4 py-3 text-sm border transition ${data.type === t ? 'border-fox-500 bg-fox-500/10 text-fox-500 font-medium' : 'border-warm-200 text-warm-700 hover:border-warm-300'}`}>{t}</button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-warm-600 mb-2 block">Budget Range</label>
              <div className="grid grid-cols-2 gap-3">
                {budgetRanges.map((b) => (
                  <button key={b} onClick={() => setData({ ...data, budget: b })} className={`rounded-xl px-4 py-2 text-sm border transition ${data.budget === b ? 'border-fox-500 bg-fox-500/10 text-fox-500' : 'border-warm-200 text-warm-700'}`}>{b}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm text-warm-600 mb-2 block">Timeline</label>
              <div className="grid grid-cols-2 gap-3">
                {timelines.map((t) => (
                  <button key={t} onClick={() => setData({ ...data, timeline: t })} className={`rounded-xl px-4 py-2 text-sm border transition ${data.timeline === t ? 'border-fox-500 bg-fox-500/10 text-fox-500' : 'border-warm-200 text-warm-700'}`}>{t}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-wrap gap-2">
            {featureOptions.map((f) => (
              <button key={f} onClick={() => toggleFeature(f)} className={`rounded-full px-4 py-2 text-sm border transition ${data.features.includes(f) ? 'border-fox-500 bg-fox-500 text-white' : 'border-warm-200 text-warm-700 hover:border-warm-300'}`}>{f}</button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3 text-sm">
            <div><span className="text-warm-500">Project:</span> <span className="text-warm-900 font-medium">{data.type || '—'}</span></div>
            <div><span className="text-warm-500">Budget:</span> <span className="text-warm-900 font-medium">{data.budget || '—'}</span></div>
            <div><span className="text-warm-500">Timeline:</span> <span className="text-warm-900 font-medium">{data.timeline || '—'}</span></div>
            <div><span className="text-warm-500">Features:</span> <span className="text-warm-900 font-medium">{data.features.join(', ') || '—'}</span></div>
            <button className="mt-4 bg-fox-500 text-white rounded-xl px-6 py-3 hover:bg-fox-600 transition w-full">Download Brief PDF</button>
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6">
        <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="flex items-center gap-2 text-warm-500 hover:text-warm-700 disabled:opacity-30">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button onClick={() => setStep(Math.min(3, step + 1))} disabled={step === 3} className="flex items-center gap-2 text-fox-500 hover:text-fox-600 disabled:opacity-30">
          Next <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
