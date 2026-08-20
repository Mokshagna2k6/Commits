import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { usePageTitle } from '@lib/hooks';
import { Input, Button } from '@components/ui/Primitives';
import { BrandLogo } from '@components/ui/BrandLogo';
import useAuthStore from '@store/authStore';

export default function Login() {
  usePageTitle('Log in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(email, password);
    if (result.success) {
      const role = result.user?.role;
      const dash = role === 'admin' ? '/app/admin' : role === 'team' ? '/app/team' : '/app/client';
      navigate(dash);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-warm-white px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <BrandLogo size={32} withBackground containerClassName="shadow-sm shadow-fox-200 group-hover:scale-105 transition-transform" />
            <span className="text-xl font-semibold"><span className="text-warm-900">stack</span><span className="text-fox-500">fox</span></span>
          </Link>
          <h1 className="text-display-sm text-warm-900">Welcome back</h1>
          <p className="text-sm text-warm-500 mt-1">Log in to your StackFox account</p>
        </div>

        <div className="card-fx p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
            <div className="relative">
              <Input label="Password" type={showPw ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 8 characters" required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-9 text-warm-400 hover:text-warm-600">
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-fox-500 hover:underline">Forgot password?</Link>
            </div>
            <Button type="submit" variant="primary" size="lg" isLoading={isLoading} className="w-full">
              Log in <ArrowRight size={18} />
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-warm-500 mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-fox-500 font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
