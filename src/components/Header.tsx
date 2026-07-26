import { useEffect, useState } from 'react';
import { Flag, LogOut, LogIn, Search, Settings, User as UserIcon, Sun, Moon, Palette, Check } from 'lucide-react';
import { initFirebase, signInWithGoogle, logout } from '../lib/firebase';
import { User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { GlobalSearch } from './GlobalSearch';
import { getStoredThemeMode, setThemeMode, getStoredThemeColor, setThemeColor, THEME_COLORS, ThemeMode, ThemeColor } from '../lib/theme';

export function Header({ onAdminClick, onProfileClick }: { onAdminClick?: () => void, onProfileClick?: () => void }) {
  const [user, setUser] = useState<User | null>(null);
  const [customPhotoURL, setCustomPhotoURL] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [siteTitle, setSiteTitle] = useState('Formula Tracker');
  const [enableSearch, setEnableSearch] = useState(true);

  const [currentMode, setCurrentMode] = useState<ThemeMode>(getStoredThemeMode());
  const [currentColor, setCurrentColor] = useState<ThemeColor>(getStoredThemeColor());
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);

  useEffect(() => {
    const handleThemeChange = () => {
      setCurrentMode(getStoredThemeMode());
      setCurrentColor(getStoredThemeColor());
    };
    window.addEventListener('app-theme-changed', handleThemeChange);

    let unsubscribe: () => void;
    let authInstance: any;
    initFirebase().then(({ auth, db }) => {
      authInstance = auth;
      unsubscribe = auth.onAuthStateChanged(async (user) => {
        setUser(user);
        if (user) {
          // Fetch custom photo from Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', user.uid));
            if (userDoc.exists()) {
              setCustomPhotoURL(userDoc.data().photoURL || null);
            }
          } catch (err) {
            console.error('Error fetching custom photo:', err);
          }
        } else {
          setCustomPhotoURL(null);
        }
      });
    }).catch(console.error);
    
    const handleProfileUpdate = async () => {
      if (authInstance && authInstance.currentUser) {
        setUser({ ...authInstance.currentUser });
        
        // Refetch from Firestore on update
        try {
          const { db } = await initFirebase();
          const userDoc = await getDoc(doc(db, 'users', authInstance.currentUser.uid));
          if (userDoc.exists()) {
            setCustomPhotoURL(userDoc.data().photoURL || null);
          }
        } catch (err) {
          console.error('Error refetching custom photo:', err);
        }
      }
    };
    window.addEventListener('profile-updated', handleProfileUpdate);
    
    const loadSettings = () => {
      const savedTitle = localStorage.getItem('app-site-title');
      if (savedTitle) setSiteTitle(savedTitle);
      
      const search = localStorage.getItem('app-enable-search');
      if (search !== null) setEnableSearch(search === 'true');
    };
    
    loadSettings();
    window.addEventListener('app-settings-changed', loadSettings);
    
    // Global keyboard shortcut for search (Cmd/Ctrl + K pattern)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!enableSearch) return;
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    
    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('app-settings-changed', loadSettings);
      window.removeEventListener('profile-updated', handleProfileUpdate);
      window.removeEventListener('app-theme-changed', handleThemeChange);
    };
  }, [enableSearch]);

  const toggleMode = () => {
    const nextMode: ThemeMode = currentMode === 'light' ? 'dark' : 'light';
    setThemeMode(nextMode);
  };

  return (
    <>
      <header className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center shadow-lg shadow-accent-600/20">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white uppercase italic hidden sm:block">
                {siteTitle}
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              {enableSearch && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 hover:border-zinc-700 transition-colors"
                  title="Search (Cmd/Ctrl + K)"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-wider hidden md:inline-block">Search...</span>
                  <kbd className="hidden lg:inline-flex items-center h-5 px-1.5 ml-2 text-[10px] font-mono rounded bg-zinc-800 border border-zinc-700 text-zinc-500">⌘K</kbd>
                </button>
              )}

              {/* Light/Dark Mode Toggle */}
              <button
                onClick={toggleMode}
                className="flex items-center justify-center p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                title={`Switch to ${currentMode === 'light' ? 'Dark' : 'Light'} Mode`}
              >
                {currentMode === 'light' ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-400" />
                )}
              </button>

              {/* Accent Color Picker Popover */}
              <div className="relative">
                <button
                  onClick={() => setIsPaletteOpen(!isPaletteOpen)}
                  className="flex items-center justify-center p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Choose Website Color Theme"
                >
                  <Palette className="w-4 h-4 text-accent-500" />
                </button>

                {isPaletteOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl p-3 shadow-2xl z-30 space-y-2 animate-in fade-in zoom-in-95">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block px-1">
                      Theme Color
                    </span>
                    <div className="grid grid-cols-4 gap-1.5">
                      {THEME_COLORS.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setThemeColor(c.id);
                            setIsPaletteOpen(false);
                          }}
                          className={`flex items-center justify-center h-9 rounded-lg border transition-all ${
                            currentColor === c.id
                              ? 'border-white scale-105 shadow-md'
                              : 'border-transparent opacity-80 hover:opacity-100 hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {currentColor === c.id && <Check className="w-4 h-4 text-white drop-shadow" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="w-px h-6 bg-zinc-800 hidden sm:block"></div>

              {user && (
                <button
                  onClick={onAdminClick}
                  className="flex items-center justify-center w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
                  title="Admin Portal"
                >
                  <UserIcon className="w-4 h-4" />
                </button>
              )}

              <span className="flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase tracking-wider hidden lg:flex">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                Live Sync
              </span>
              
              {user ? (
                <div className="flex items-center gap-3">
                  <button onClick={onProfileClick} className="focus:outline-none focus:ring-2 focus:ring-accent-500 rounded-full transition-transform hover:scale-105">
                    <img 
                      src={customPhotoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email || 'User')}`} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full border border-zinc-800 object-cover"
                    />
                  </button>
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
                  onClick={onProfileClick || signInWithGoogle}
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

      {enableSearch && <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}

