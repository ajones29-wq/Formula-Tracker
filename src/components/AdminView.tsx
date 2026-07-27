import { useState, useEffect } from 'react';
import { Lock, Unlock, Settings as SettingsIcon, Save, Mail, Key, Loader2, Shield, CheckCircle2 } from 'lucide-react';
import { initFirebase } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AdminViewProps {
  isAuthenticated: boolean;
  setIsAuthenticated: (val: boolean) => void;
  settings: {
    themeColor: string;
    announcement: string;
    siteTitle: string;
    defaultTab: string;
    showRaceCountdown: boolean;
    enableNews: boolean;
    liveTimingMode: boolean;
    showHistoricalArchive: boolean;
    maintenanceMode: boolean;
    maintenanceMessage: string;
    enableGlobalSearch: boolean;
    enableTelemetry: boolean;
    allowRegistrations: boolean;
    verboseLogging: boolean;
    simulateRace: boolean;
    contactDescription?: string;
  };
  setters: {
    setThemeColor: (val: string) => void;
    setAnnouncement: (val: string) => void;
    setSiteTitle: (val: string) => void;
    setDefaultTab: (val: any) => void;
    setShowRaceCountdown: (val: boolean) => void;
    setEnableNews: (val: boolean) => void;
    setLiveTimingMode: (val: boolean) => void;
    setShowHistoricalArchive: (val: boolean) => void;
    setMaintenanceMode: (val: boolean) => void;
    setMaintenanceMessage: (val: string) => void;
    setEnableGlobalSearch: (val: boolean) => void;
    setEnableTelemetry: (val: boolean) => void;
    setAllowRegistrations: (val: boolean) => void;
    setVerboseLogging: (val: boolean) => void;
    setSimulateRace: (val: boolean) => void;
    setContactDescription?: (val: string) => void;
  };
}

export function AdminView({ isAuthenticated, setIsAuthenticated, settings, setters }: AdminViewProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // 2FA state
  const [step, setStep] = useState<'password' | '2fa'>('password');
  const [adminEmail, setAdminEmail] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const {
    themeColor, announcement, siteTitle, defaultTab, 
    showRaceCountdown, enableNews, liveTimingMode, 
    showHistoricalArchive, maintenanceMode, maintenanceMessage, enableGlobalSearch, 
    enableTelemetry, allowRegistrations, verboseLogging, simulateRace,
    contactDescription
  } = settings;

  const {
    setThemeColor, setAnnouncement, setSiteTitle, setDefaultTab,
    setShowRaceCountdown, setEnableNews, setLiveTimingMode,
    setShowHistoricalArchive, setMaintenanceMode, setMaintenanceMessage, setEnableGlobalSearch,
    setEnableTelemetry, setAllowRegistrations, setVerboseLogging, setSimulateRace,
    setContactDescription
  } = setters;
  
  // Settings are now managed by App.tsx props
  useEffect(() => {
    // We no longer need to load local settings or fetch Firestore here
    // as App.tsx handles the global state initialization and syncing.
  }, []);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Prompt user to sign in to Google to receive their 2FA code in Docs
      const { googleSignIn } = await import('../lib/auth');
      let googleToken = '';
      try {
        const authResult = await googleSignIn();
        if (authResult) {
          googleToken = authResult.accessToken;
        } else {
          throw new Error('Google Sign-In was cancelled.');
        }
      } catch (err: any) {
        throw new Error('Google Sign-In is required to receive the 2FA code in your Google Doc: ' + err.message);
      }

      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, googleToken }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      if (data.require2FA) {
        setAdminEmail(data.email);
        if (data.documentId) setDocumentId(data.documentId);
        setStep('2fa');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail, code: twoFactorCode }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }
      
      // Register as admin in Firestore to allow rule-based writes
      try {
        const { db, auth } = await initFirebase();
        if (auth.currentUser) {
          const adminRef = doc(db, 'admins', auth.currentUser.uid);
          await setDoc(adminRef, {
            email: auth.currentUser.email,
            assignedAt: new Date().toISOString()
          }, { merge: true });
        }
      } catch (err) {
        console.warn('Could not register admin in Firestore, writes might be restricted:', err);
      }
      
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Local Storage Save
      localStorage.setItem('app-theme', themeColor);
      localStorage.setItem('app-announcement', announcement);
      localStorage.setItem('app-site-title', siteTitle);
      localStorage.setItem('app-default-tab', defaultTab);
      localStorage.setItem('app-show-countdown', showRaceCountdown.toString());
      localStorage.setItem('app-enable-news', enableNews.toString());
      localStorage.setItem('app-live-timing', liveTimingMode.toString());
      localStorage.setItem('app-show-archive', showHistoricalArchive.toString());
      localStorage.setItem('app-maintenance-mode', maintenanceMode.toString());
      localStorage.setItem('app-maintenance-message', maintenanceMessage);
      localStorage.setItem('app-enable-search', enableGlobalSearch.toString());
      localStorage.setItem('app-enable-telemetry', enableTelemetry.toString());
      localStorage.setItem('app-allow-registrations', allowRegistrations.toString());
      localStorage.setItem('app-verbose-logging', verboseLogging.toString());
      localStorage.setItem('app-simulate-race', simulateRace.toString());
      if (contactDescription) localStorage.setItem('app-contact-description', contactDescription);
      
      document.documentElement.setAttribute('data-theme', themeColor);

      // Firestore Save
      const { db, auth } = await initFirebase();
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, {
        maintenanceMode,
        maintenanceMessage,
        announcement,
        siteTitle,
        themeColor,
        contactDescription,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.email || 'admin'
      }, { merge: true });

      window.dispatchEvent(new Event('app-settings-changed'));
      alert('Settings saved globally!');
    } catch (err: any) {
      console.error('Error saving settings:', err);
      alert('Failed to save global settings: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-20">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-full flex items-center justify-center">
              {step === 'password' ? <Lock className="w-8 h-8 text-zinc-500" /> : <Mail className="w-8 h-8 text-accent-500" />}
            </div>
          </div>
          
          <h2 className="text-2xl font-black italic uppercase text-center mb-2">Admin Access</h2>
          <p className="text-zinc-400 text-sm text-center mb-8">
            {step === 'password' 
              ? 'Enter password to configure website settings' 
              : 'Enter the 6-digit code below'
            }
          </p>
          
          {step === 'password' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password..."
                  disabled={isLoading}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all disabled:opacity-50"
                />
              </div>
              
              {error && (
                <p className="text-accent-500 text-sm text-center font-bold">{error}</p>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                {isLoading ? 'Verifying...' : 'Sign in with Google to Receive Code'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify2FA} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  disabled={isLoading}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder-zinc-600 text-center text-2xl tracking-[0.5em] font-mono focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-all disabled:opacity-50"
                />
              </div>
              
              {error && (
                <p className="text-accent-500 text-sm text-center font-bold">{error}</p>
              )}
              
              {documentId && (
                <div className="text-center pb-2">
                  <a 
                    href={`https://docs.google.com/document/d/${documentId}/edit`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm font-bold text-accent-500 hover:text-accent-400 underline transition-colors"
                  >
                    Open Google Doc to view code
                  </a>
                </div>
              )}
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-accent-600 hover:bg-accent-700 text-white font-bold uppercase tracking-wider py-3 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {isLoading ? 'Verifying...' : 'Verify Code'}
              </button>
              
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep('password');
                    setError('');
                    setTwoFactorCode('');
                  }}
                  disabled={isLoading}
                  className="text-xs font-bold text-zinc-500 hover:text-white transition-colors"
                >
                  Return to password
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-black italic uppercase flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-accent-500" />
          Site Settings
        </h2>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="text-sm font-bold text-zinc-500 hover:text-white uppercase tracking-wider"
        >
          Lock
        </button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Global Settings</h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Site Title
              </label>
              <input 
                type="text"
                value={siteTitle}
                onChange={(e) => setSiteTitle(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Default Tab
              </label>
              <select 
                value={defaultTab}
                onChange={(e) => setDefaultTab(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-500"
              >
                <option value="standings">Standings</option>
                <option value="schedule">Schedule</option>
                <option value="results">Results</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Primary Accent Color
              </label>
              <select 
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-500"
              >
                <option value="red">Racing Red</option>
                <option value="blue">Alpine Blue</option>
                <option value="orange">Papaya Orange</option>
                <option value="green">British Racing Green</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Site Announcement Banner
              </label>
              <textarea 
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Enter text to display at the top of the site..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-500 h-24 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Maintenance Message
              </label>
              <textarea 
                value={maintenanceMessage}
                onChange={(e) => setMaintenanceMessage(e.target.value)}
                placeholder="Enter message to display during maintenance mode..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-500 h-24 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Contact Page Description
              </label>
              <textarea 
                value={contactDescription || ''}
                onChange={(e) => setContactDescription?.(e.target.value)}
                placeholder="Enter text to display on the contact page..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-accent-500 h-24 resize-none"
              ></textarea>
            </div>
          </div>
        </div>
        
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2">Feature Flags</h3>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
              <div>
                <div className="font-bold text-white">Show Race Countdown</div>
                <div className="text-xs text-zinc-500">Display the next race countdown banner</div>
              </div>
              <input type="checkbox" checked={showRaceCountdown} onChange={(e) => setShowRaceCountdown(e.target.checked)} className="w-4 h-4 accent-accent-500" />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
              <div>
                <div className="font-bold text-white">Enable Latest News</div>
                <div className="text-xs text-zinc-500">Show the Latest News tab</div>
              </div>
              <input type="checkbox" checked={enableNews} onChange={(e) => setEnableNews(e.target.checked)} className="w-4 h-4 accent-accent-500" />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
              <div>
                <div className="font-bold text-white">Live Timing Mode</div>
                <div className="text-xs text-zinc-500">Enable real-time data polling during races</div>
              </div>
              <input type="checkbox" checked={liveTimingMode} onChange={(e) => setLiveTimingMode(e.target.checked)} className="w-4 h-4 accent-accent-500" />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
              <div>
                <div className="font-bold text-white">Show Historical Archive</div>
                <div className="text-xs text-zinc-500">Display pre-2026 season data</div>
              </div>
              <input type="checkbox" checked={showHistoricalArchive} onChange={(e) => setShowHistoricalArchive(e.target.checked)} className="w-4 h-4 accent-accent-500" />
            </label>

            <label className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
              <div>
                <div className="font-bold text-white">Enable Global Search</div>
                <div className="text-xs text-zinc-500">Allow users to search the site (Cmd/Ctrl + K)</div>
              </div>
              <input type="checkbox" checked={enableGlobalSearch} onChange={(e) => setEnableGlobalSearch(e.target.checked)} className="w-4 h-4 accent-accent-500" />
            </label>

            <label className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
              <div>
                <div className="font-bold text-white">Enable Telemetry Data</div>
                <div className="text-xs text-zinc-500">Collect anonymous user interactions</div>
              </div>
              <input type="checkbox" checked={enableTelemetry} onChange={(e) => setEnableTelemetry(e.target.checked)} className="w-4 h-4 accent-accent-500" />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
              <div>
                <div className="font-bold text-white">Allow Paddock Registrations</div>
                <div className="text-xs text-zinc-500">Open sign-ups for new users</div>
              </div>
              <input type="checkbox" checked={allowRegistrations} onChange={(e) => setAllowRegistrations(e.target.checked)} className="w-4 h-4 accent-accent-500" />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
              <div>
                <div className="font-bold text-white">Simulate Live Race</div>
                <div className="text-xs text-zinc-500">Mock active race timing for testing</div>
              </div>
              <input type="checkbox" checked={simulateRace} onChange={(e) => setSimulateRace(e.target.checked)} className="w-4 h-4 accent-accent-500" />
            </label>
            
            <label className="flex items-center justify-between p-3 bg-zinc-950 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
              <div>
                <div className="font-bold text-white">Verbose Logging</div>
                <div className="text-xs text-zinc-500">Output detailed debug logs to console</div>
              </div>
              <input type="checkbox" checked={verboseLogging} onChange={(e) => setVerboseLogging(e.target.checked)} className="w-4 h-4 accent-accent-500" />
            </label>

            <label className="flex items-center justify-between p-3 bg-red-950/30 border border-red-900/50 rounded-xl cursor-pointer hover:border-red-900 transition-colors">
              <div>
                <div className="font-bold text-red-500">Maintenance Mode</div>
                <div className="text-xs text-red-400/70">Restrict access to the site</div>
              </div>
              <input type="checkbox" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} className="w-4 h-4 accent-red-500" />
            </label>
          </div>
        </div>
      </div>
      
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
        <h3 className="text-lg font-bold uppercase tracking-wider mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">
          <Shield className="w-5 h-5 text-emerald-500" />
          Security & Infrastructure Audit
        </h3>
        
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">HSTS & CSP</span>
            </div>
            <p className="text-[10px] text-zinc-500">Helmet.js headers active with strict Content Security Policy</p>
          </div>
          
          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Rate Limiting</span>
            </div>
            <p className="text-[10px] text-zinc-500">Window-based IP throttling enabled on all sensitive endpoints</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">CORS Policy</span>
            </div>
            <p className="text-[10px] text-zinc-500">Cross-Origin Resource Sharing restricted to authorized domains</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">HPP Protection</span>
            </div>
            <p className="text-[10px] text-zinc-500">HTTP Parameter Pollution defense active on all API routes</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Payload Limits</span>
            </div>
            <p className="text-[10px] text-zinc-500">JSON request body capped at 10KB to prevent memory exhaustion</p>
          </div>

          <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">2FA Protocol</span>
            </div>
            <p className="text-[10px] text-zinc-500">Google Docs based secondary out-of-band verification active</p>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-accent-600 hover:bg-accent-700 text-white font-bold uppercase tracking-wider px-8 py-3 rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
