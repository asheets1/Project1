import React, { useState } from 'react';
import { X, Loader2, Mail } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setBusy(true);
    if (mode === 'signin') {
      const { error } = await signIn(email, password);
      setBusy(false);
      if (error) {
        setError(error);
        return;
      }
      onClose();
    } else {
      const { error, needsConfirmation } = await signUp(email, password);
      setBusy(false);
      if (error) {
        setError(error);
        return;
      }
      if (needsConfirmation) {
        setInfo('Check your inbox to confirm your email, then sign in.');
        setMode('signin');
      } else {
        onClose();
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text/40 hover:text-text/70 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-1">
          {mode === 'signin' ? 'Sign In' : 'Create Account'}
        </h2>
        <p className="text-sm text-text/60 mb-6">
          {mode === 'signin'
            ? 'Sign in to sync your data across devices.'
            : 'Create an account to save and sync your data securely.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {info && (
            <p className="text-sm text-green-600 flex items-center gap-2">
              <Mail size={16} /> {info}
            </p>
          )}

          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2" disabled={busy}>
            {busy && <Loader2 size={16} className="animate-spin" />}
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-text/60">
          {mode === 'signin' ? (
            <>
              No account?{' '}
              <button
                onClick={() => { setMode('signup'); setError(''); setInfo(''); }}
                className="text-primary font-medium hover:underline"
              >
                Create one
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                onClick={() => { setMode('signin'); setError(''); setInfo(''); }}
                className="text-primary font-medium hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>

        <div className="mt-4 rounded-lg bg-surface p-3 text-xs text-text/60">
          Your data is protected by per-user access rules. Until you sign in, data
          stays only on this device.
        </div>
      </div>
    </div>
  );
};
