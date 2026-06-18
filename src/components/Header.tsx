import { useEffect, useState } from 'react';
import { Flag, LogOut, LogIn } from 'lucide-react';
import { initFirebase, signInWithGoogle, logout } from '../lib/firebase';
import { User } from 'firebase/auth';

export function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    initFirebase().then(({ auth }) => {
      unsubscribe = auth.onAuthStateChanged((user) => {
        setUser(user);
      });
    }).catch(console.error);
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  return (
    <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
              <Flag className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase italic">
              Formula Tracker
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider hidden sm:flex">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Live Sync
            </span>
            
            {user ? (
              <div className="flex items-center gap-3">
                <img 
                  src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
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
  );
}
