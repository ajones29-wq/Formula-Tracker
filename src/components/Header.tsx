import { useEffect, useState } from 'react';
import { Flag, LogOut, LogIn, Search } from 'lucide-react';
import { initFirebase, signInWithGoogle, logout } from '../lib/firebase';
import { User } from 'firebase/auth';
import { GlobalSearch } from './GlobalSearch';

export function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    let unsubscribe: () => void;
    initFirebase().then(({ auth }) => {
      unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
      });
    }).catch(console.error);
    
    // Global keyboard shortcut for search (Cmd/Ctrl + K pattern)
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase italic hidden sm:block">
                Formula Tracker
              </h1>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
                title="Search (Cmd/Ctrl + K)"
              >
                <Search className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider hidden md:inline-block">Search...</span>
                <kbd className="hidden lg:inline-flex items-center h-5 px-1.5 ml-2 text-[10px] font-mono rounded bg-zinc-800 border border-zinc-700 text-zinc-500">⌘K</kbd>
              </button>
              
              <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>

              <span className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider hidden lg:flex">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Live Sync
              </span>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <img 
                    src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}`} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full border border-zinc-800"
                  />
                  <button 
                    onClick={logout}
                    className="text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 bg-zinc-900/50 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={signInWithGoogle}
                  className="text-xs font-bold uppercase tracking-wider text-black bg-white hover:bg-zinc-200 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
