import React, { useState } from 'react';
import { LogIn, LogOut, Cloud, CloudOff, RefreshCw, Check, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthModal } from './AuthModal';

export const AccountButton: React.FC = () => {
  const { isConfigured, user, loading, syncState, signOut } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Local-only mode: sync isn't set up for this deployment.
  if (!isConfigured) {
    return (
      <span
        className="hidden sm:flex items-center gap-1.5 text-xs text-text/50"
        title="Cloud sync is not configured for this site. Data is saved on this device only."
      >
        <CloudOff size={16} /> Local only
      </span>
    );
  }

  if (loading) {
    return <RefreshCw size={18} className="animate-spin text-text/40" />;
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <LogIn size={16} /> Sign In
        </button>
        {showModal && <AuthModal onClose={() => setShowModal(false)} />}
      </>
    );
  }

  const SyncIcon =
    syncState === 'syncing' ? RefreshCw : syncState === 'error' ? CloudOff : Check;

  return (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-primary/20 text-sm font-medium hover:border-primary/40 transition-colors"
      >
        <UserIcon size={16} className="text-primary" />
        <span className="hidden sm:inline max-w-[140px] truncate">{user.email}</span>
        <SyncIcon
          size={14}
          className={
            syncState === 'syncing'
              ? 'animate-spin text-amber-500'
              : syncState === 'error'
              ? 'text-red-500'
              : 'text-green-500'
          }
        />
      </button>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 card p-3 z-50">
            <div className="flex items-center gap-2 text-sm mb-3">
              <Cloud size={16} className="text-primary" />
              <span className="text-text/70">
                {syncState === 'syncing'
                  ? 'Syncing…'
                  : syncState === 'error'
                  ? 'Sync error — will retry'
                  : 'Synced across devices'}
              </span>
            </div>
            <p className="text-xs text-text/50 mb-3 break-all">{user.email}</p>
            <button
              onClick={async () => {
                setMenuOpen(false);
                await signOut();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-red-600 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
};
