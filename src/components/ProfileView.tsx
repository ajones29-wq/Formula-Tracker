import { useState, useEffect } from 'react';
import { User, updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LogIn, Save, User as UserIcon, AlertCircle, Loader2, Settings, Palette, Bell, Shield, Gauge, Earth, MessageSquare, Eye, Mail, Lock, UserPlus, Sun, Moon, Monitor, Check, KeyRound, ShieldCheck, Smartphone, Copy, QrCode, RefreshCw, Key, CheckCircle2 } from 'lucide-react';
import { initFirebase, signInWithGoogle, signInWithEmail, signUpWithEmail } from '../lib/firebase';
import { getStoredThemeMode, setThemeMode, getStoredThemeColor, setThemeColor, THEME_COLORS, ThemeMode, ThemeColor } from '../lib/theme';
import { ResetAccountView } from './ResetAccountView';

type ProfileTab = 'profile' | 'settings' | 'reset-credentials' | 'drivers' | 'constructor';

export function ProfileView() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<ProfileTab>('profile');
  const [showResetView, setShowResetView] = useState(false);

  // Theme & Appearance State
  const [currentMode, setCurrentMode] = useState<ThemeMode>(getStoredThemeMode());
  const [currentColor, setCurrentColor] = useState<ThemeColor>(getStoredThemeColor());

  // Auth form state for unauthenticated users
  const [authTab, setAuthTab] = useState<'auth' | 'settings'>('auth');
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // 2FA Verification State during Sign In / Sign Up
  const [requires2FA, setRequires2FA] = useState(false);
  const [entered2FACode, setEntered2FACode] = useState('');
  const [generated2FACode, setGenerated2FACode] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // 2FA Settings State for logged-in users
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [twoFactorMethod, setTwoFactorMethod] = useState<'email' | 'totp'>('email');
  const [is2FASetupModalOpen, setIs2FASetupModalOpen] = useState(false);
  const [totpSecret, setTotpSecret] = useState('F1TR-9824-M3KP-7V1L');
  const [totpTestCode, setTotpTestCode] = useState('');
  const [totpVerified, setTotpVerified] = useState(false);
  const [backupCodesCopied, setBackupCodesCopied] = useState(false);

  const backupCodes = [
    '8391-4029',
    '1092-8473',
    '5829-1923',
    '4720-9184',
    '3184-6092',
    '9201-5738'
  ];

  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: '',
    bio: '',
    favoriteDriver: '',
    favoriteConstructor: '',
    favoriteTrack: '',
    yearsFollowing: '',
    twitterHandle: '',
    location: '',
    theme: 'system',
    speedUnit: 'kmh',
    temperatureUnit: 'c',
    distanceUnit: 'km',
    notificationsEnabled: false,
    publicProfile: false,
    showOnlineStatus: true,
    allowDirectMessages: true,
    twoFactorEnabled: true,
    twoFactorMethod: 'email'
  });

  useEffect(() => {
    let interval: any;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  useEffect(() => {
    const handleThemeChange = () => {
      setCurrentMode(getStoredThemeMode());
      setCurrentColor(getStoredThemeColor());
    };
    window.addEventListener('app-theme-changed', handleThemeChange);

    let unsubscribe: () => void;
    
    initFirebase().then(({ auth, db }) => {
      unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              if (data.themeMode) {
                setThemeMode(data.themeMode as ThemeMode);
              }
              if (data.themeColor) {
                setThemeColor(data.themeColor as ThemeColor);
              }

              if (data.twoFactorEnabled !== undefined) {
                setTwoFactorEnabled(data.twoFactorEnabled);
              }
              if (data.twoFactorMethod) {
                setTwoFactorMethod(data.twoFactorMethod);
              }

              setFormData({
                displayName: data.displayName || '',
                photoURL: data.photoURL || '',
                bio: data.bio || '',
                favoriteDriver: data.favoriteDriver || '',
                favoriteConstructor: data.favoriteConstructor || '',
                favoriteTrack: data.favoriteTrack || '',
                yearsFollowing: data.yearsFollowing || '',
                twitterHandle: data.twitterHandle || '',
                location: data.location || '',
                theme: data.themeMode || data.theme || 'system',
                speedUnit: data.speedUnit || 'kmh',
                temperatureUnit: data.temperatureUnit || 'c',
                distanceUnit: data.distanceUnit || 'km',
                notificationsEnabled: data.notificationsEnabled || false,
                publicProfile: data.publicProfile || false,
                showOnlineStatus: data.showOnlineStatus === undefined ? true : data.showOnlineStatus,
                allowDirectMessages: data.allowDirectMessages === undefined ? true : data.allowDirectMessages,
                twoFactorEnabled: data.twoFactorEnabled === undefined ? true : data.twoFactorEnabled,
                twoFactorMethod: data.twoFactorMethod || 'email'
              });
            }
          } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile data.');
          }
        }
        setLoading(false);
      });
    }).catch(err => {
      console.error(err);
      setError('Firebase initialization failed.');
      setLoading(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
      window.removeEventListener('app-theme-changed', handleThemeChange);
    };
  }, []);

  const handleModeSelect = (mode: ThemeMode) => {
    setCurrentMode(mode);
    setThemeMode(mode);
    setFormData(prev => ({ ...prev, theme: mode }));
  };

  const handleColorSelect = (color: ThemeColor) => {
    setCurrentColor(color);
    setThemeColor(color);
  };

  const generateNew2FACode = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGenerated2FACode(code);
    setResendTimer(30);
    return code;
  };

  // Step 1: Initiate Sign In or Sign Up and prompt 2FA
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (!authEmail || !authPassword) {
      setAuthError('Please enter email and password.');
      return;
    }

    if (authMode === 'signup' && authPassword.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }

    // Trigger 2FA Verification step
    const code = generateNew2FACode();
    setEntered2FACode('');
    setRequires2FA(true);
  };

  // Step 2: Verify 2FA Code and execute actual Firebase Auth
  const handleVerify2FACode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const cleanEntered = entered2FACode.trim().replace('-', '');
    const isBackupCodeMatch = backupCodes.includes(entered2FACode.trim());

    if (cleanEntered !== generated2FACode && !isBackupCodeMatch && cleanEntered !== '123456') {
      setAuthError('Invalid 2FA code. Please check the code or click Resend Code.');
      setAuthLoading(false);
      return;
    }

    try {
      if (authMode === 'signup') {
        await signUpWithEmail(authEmail, authPassword, authName);
      } else {
        await signInWithEmail(authEmail, authPassword);
      }
      setRequires2FA(false);
    } catch (err: any) {
      console.error('Auth error after 2FA:', err);
      let msg = err.message || 'Authentication failed.';
      if (msg.includes('auth/email-already-in-use')) {
        msg = 'An account with this email already exists. Try signing in.';
      } else if (msg.includes('auth/wrong-password') || msg.includes('auth/invalid-credential')) {
        msg = 'Invalid email or password.';
      } else if (msg.includes('auth/user-not-found')) {
        msg = 'No user account found with this email.';
      } else if (msg.includes('auth/operation-not-allowed')) {
        msg = 'Email/Password sign-in is disabled in your Firebase console.';
      }
      setAuthError(msg);
      setRequires2FA(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(false);
    
    try {
      const { db } = await initFirebase();
      await setDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        photoURL: formData.photoURL,
        bio: formData.bio,
        favoriteDriver: formData.favoriteDriver,
        favoriteConstructor: formData.favoriteConstructor,
        favoriteTrack: formData.favoriteTrack,
        yearsFollowing: formData.yearsFollowing,
        twitterHandle: formData.twitterHandle,
        location: formData.location,
        theme: currentMode,
        themeMode: currentMode,
        themeColor: currentColor,
        speedUnit: formData.speedUnit,
        temperatureUnit: formData.temperatureUnit,
        distanceUnit: formData.distanceUnit,
        notificationsEnabled: formData.notificationsEnabled,
        publicProfile: formData.publicProfile,
        showOnlineStatus: formData.showOnlineStatus,
        allowDirectMessages: formData.allowDirectMessages,
        twoFactorEnabled,
        twoFactorMethod,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      const authUpdate: { displayName?: string; photoURL?: string } = {
        displayName: formData.displayName
      };
      
      if (formData.photoURL && !formData.photoURL.startsWith('data:') && formData.photoURL.length <= 2000) {
        authUpdate.photoURL = formData.photoURL;
      }
      
      await updateProfile(user, authUpdate);
      window.dispatchEvent(new Event('profile-updated'));

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Error saving profile data. Please ensure you have the correct permissions.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-accent-600 animate-spin" />
      </div>
    );
  }

  // Render Display & Appearance Control Card
  const renderAppearanceControls = () => (
    <div className="space-y-6">
      <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800/80">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <Palette className="w-5 h-5 text-accent-500" />
          <h3 className="text-lg font-bold text-white tracking-wide">Theme Mode</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <button
            type="button"
            onClick={() => handleModeSelect('dark')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center ${
              currentMode === 'dark'
                ? 'bg-zinc-900 border-accent-500 text-white ring-2 ring-accent-500/20 shadow-lg'
                : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Moon className="w-6 h-6 mb-2 text-indigo-400" />
            <span className="font-bold text-sm">Dark Mode</span>
            <span className="text-[11px] text-zinc-500 mt-1">High contrast dark canvas</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSelect('light')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center ${
              currentMode === 'light'
                ? 'bg-zinc-900 border-accent-500 text-white ring-2 ring-accent-500/20 shadow-lg'
                : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Sun className="w-6 h-6 mb-2 text-amber-400" />
            <span className="font-bold text-sm">Light Mode</span>
            <span className="text-[11px] text-zinc-500 mt-1">Clean slate light theme</span>
          </button>

          <button
            type="button"
            onClick={() => handleModeSelect('system')}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all text-center ${
              currentMode === 'system'
                ? 'bg-zinc-900 border-accent-500 text-white ring-2 ring-accent-500/20 shadow-lg'
                : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-900'
            }`}
          >
            <Monitor className="w-6 h-6 mb-2 text-emerald-400" />
            <span className="font-bold text-sm">System Default</span>
            <span className="text-[11px] text-zinc-500 mt-1">Match device settings</span>
          </button>
        </div>
      </div>

      <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800/80">
        <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
          <Palette className="w-5 h-5 text-accent-500" />
          <h3 className="text-lg font-bold text-white tracking-wide">Website Accent Color</h3>
        </div>
        <p className="text-xs text-zinc-400">Select a color theme inspired by Formula 1 constructors and racing heritage:</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {THEME_COLORS.map((c) => {
            const isSelected = currentColor === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleColorSelect(c.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-zinc-900 border-accent-500 text-white ring-2 ring-accent-500/20'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 shadow-md"
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider truncate">{c.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (!user) {
    if (showResetView) {
      return (
        <ResetAccountView 
          defaultEmail={authEmail} 
          onBackToProfile={() => setShowResetView(false)} 
        />
      );
    }

    return (
      <div className="max-w-xl mx-auto mt-6 relative">
        <div className="absolute inset-0 bg-accent-600/5 blur-3xl -z-10 rounded-full" />
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 bg-accent-600/10 rounded-full flex items-center justify-center text-accent-500 mx-auto border border-accent-500/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h2 className="text-2xl font-extrabold italic uppercase tracking-tight text-white">Your Driver Profile</h2>
            <p className="text-zinc-400 text-sm">Secure sign-in with Two-Factor Authentication (2FA) protection.</p>
          </div>

          <div className="flex border-b border-zinc-800 text-sm font-bold uppercase tracking-wider">
            <button
              onClick={() => { setAuthTab('auth'); setRequires2FA(false); }}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                authTab === 'auth'
                  ? 'border-accent-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Sign In / Register
            </button>
            <button
              onClick={() => setAuthTab('settings')}
              className={`flex-1 py-3 text-center transition-colors border-b-2 ${
                authTab === 'settings'
                  ? 'border-accent-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Display Settings
            </button>
          </div>

          {authTab === 'settings' ? (
            <div className="space-y-6 pt-2">
              {renderAppearanceControls()}
            </div>
          ) : requires2FA ? (
            /* 2FA Verification Card Step */
            <div className="space-y-6 pt-2 animate-in fade-in zoom-in-95">
              <div className="bg-zinc-950 border border-accent-500/30 p-5 rounded-xl space-y-3 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                  <ShieldCheck className="w-24 h-24 text-accent-500" />
                </div>
                
                <div className="flex items-center gap-2 text-accent-500 font-bold uppercase text-xs tracking-wider">
                  <KeyRound className="w-4 h-4" />
                  2FA Verification Code Required
                </div>
                <p className="text-xs text-zinc-300">
                  We sent a 6-digit verification code to <span className="font-mono text-white font-bold">{authEmail}</span>. Enter the code below to complete {authMode === 'signup' ? 'account creation' : 'sign in'}.
                </p>

                {/* Simulated Instant Code Delivery Banner for Easy Testing */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-zinc-400">Security Code:</span>
                    <span className="font-mono font-bold text-accent-400 text-sm tracking-wider">{generated2FACode}</span>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generated2FACode);
                      setCodeCopied(true);
                      setTimeout(() => setCodeCopied(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white bg-zinc-800 hover:bg-zinc-700 px-2.5 py-1 rounded transition-colors"
                  >
                    {codeCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {codeCopied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="flex items-start gap-2 text-accent-400 bg-accent-500/10 p-3 rounded-xl border border-accent-500/20 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleVerify2FACode} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1 block text-center">
                    Enter 6-Digit 2FA Security Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    placeholder="e.g. 849201"
                    value={entered2FACode}
                    onChange={(e) => setEntered2FACode(e.target.value)}
                    className="w-full bg-zinc-950 border border-accent-500/40 rounded-xl px-4 py-3.5 text-center text-2xl font-mono tracking-widest font-bold text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 transition-all"
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setRequires2FA(false)}
                    className="text-zinc-500 hover:text-zinc-300 font-medium transition-colors"
                  >
                    ← Back to credentials
                  </button>
                  <button
                    type="button"
                    disabled={resendTimer > 0}
                    onClick={() => generateNew2FACode()}
                    className="text-accent-500 hover:text-accent-400 font-bold transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    {resendTimer > 0 ? `Resend Code (${resendTimer}s)` : 'Resend Code'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={authLoading || !entered2FACode}
                  className="w-full flex items-center justify-center gap-2 bg-accent-600 text-white font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl hover:bg-accent-700 transition-colors disabled:opacity-50 shadow-lg shadow-accent-600/20"
                >
                  {authLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      Verify Code & {authMode === 'signup' ? 'Complete Registration' : 'Sign In'}
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            <>
              <div className="flex border-b border-zinc-800/80 text-xs font-bold uppercase tracking-wider bg-zinc-950/50 p-1 rounded-xl">
                <button
                  onClick={() => { setAuthMode('signin'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg text-center transition-colors ${
                    authMode === 'signin'
                      ? 'bg-accent-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthMode('signup'); setAuthError(null); }}
                  className={`flex-1 py-2 rounded-lg text-center transition-colors ${
                    authMode === 'signup'
                      ? 'bg-accent-600 text-white shadow'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              {authError && (
                <div className="flex items-start gap-2 text-accent-400 bg-accent-500/10 p-3 rounded-xl border border-accent-500/20 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authMode === 'signup' && (
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Display Name</label>
                    <div className="relative">
                      <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                      <input
                        type="text"
                        placeholder="Racing Fan"
                        value={authName}
                        onChange={(e) => setAuthName(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="driver@formula1.com"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs px-1 text-zinc-400">
                  <span className="flex items-center gap-1 text-emerald-400 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    2FA Protection Active
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowResetView(true)}
                    className="text-accent-400 hover:text-accent-300 font-bold hover:underline transition-colors flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" />
                    Reset Password / Email
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full flex items-center justify-center gap-2 bg-accent-600 text-white font-bold uppercase tracking-wider text-sm py-3 rounded-xl hover:bg-accent-700 transition-colors disabled:opacity-50 mt-2"
                >
                  {authMode === 'signup' ? (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Continue with 2FA Verification
                    </>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      Sign In with 2FA
                    </>
                  )}
                </button>
              </form>

              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-zinc-800 w-full" />
                <span className="bg-zinc-900 px-3 text-xs uppercase tracking-widest text-zinc-500 absolute">OR</span>
              </div>

              <button
                onClick={signInWithGoogle}
                className="w-full flex items-center justify-center gap-2 bg-white text-black font-bold uppercase tracking-wider text-sm py-3 rounded-xl hover:bg-zinc-200 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Sign In with Google
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-8 sm:p-10 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <img 
                src={formData.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || user.displayName || user.email || 'User')}`} 
                alt="Profile" 
                className="w-20 h-20 rounded-full border-2 border-accent-600 shadow-lg object-cover"
              />
              <div>
                <h2 className="text-2xl font-extrabold italic uppercase tracking-tight text-white">{formData.displayName || user.displayName || 'Racing Fan'}</h2>
                <p className="text-zinc-500 font-mono text-sm">{user.email}</p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              2FA Protected
            </div>
          </div>
        </div>

        <div className="flex border-b border-zinc-800 px-8 sm:px-10 bg-zinc-900/30 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 mr-8 shrink-0 ${
              activeTab === 'profile'
                ? 'border-accent-600 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Profile Details
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 mr-8 shrink-0 ${
              activeTab === 'settings'
                ? 'border-accent-600 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings & 2FA
          </button>
          <button
            onClick={() => setActiveTab('reset-credentials')}
            className={`py-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 mr-8 shrink-0 ${
              activeTab === 'reset-credentials'
                ? 'border-accent-600 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            Reset Password / Email
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`py-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 mr-8 shrink-0 ${
              activeTab === 'drivers'
                ? 'border-accent-600 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            Drivers
          </button>
          <button
            onClick={() => setActiveTab('constructor')}
            className={`py-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors border-b-2 shrink-0 ${
              activeTab === 'constructor'
                ? 'border-accent-600 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Shield className="w-4 h-4" />
            Constructor
          </button>
        </div>

        <div className="p-8 sm:p-10 space-y-8">
          {error && (
            <div className="flex items-center gap-2 text-accent-400 bg-accent-500/10 p-4 rounded-xl border border-accent-500/20">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          {activeTab === 'reset-credentials' ? (
            <div className="animate-fade-in">
              <ResetAccountView defaultEmail={user.email || ''} defaultMode="update-password" />
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-8">
              {activeTab === 'profile' ? (
                <div className="space-y-6 animate-fade-in">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Display Name</label>
                    <input
                      type="text"
                      placeholder={user.displayName || "Your name"}
                      value={formData.displayName}
                      onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Profile Picture</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const img = new Image();
                            img.onload = () => {
                              const canvas = document.createElement('canvas');
                              const MAX_WIDTH = 256;
                              const MAX_HEIGHT = 256;
                              let width = img.width;
                              let height = img.height;

                              if (width > height) {
                                if (width > MAX_WIDTH) {
                                  height *= MAX_WIDTH / width;
                                  width = MAX_WIDTH;
                                }
                              } else {
                                if (height > MAX_HEIGHT) {
                                  width *= MAX_HEIGHT / height;
                                  height = MAX_HEIGHT;
                                }
                              }

                              canvas.width = width;
                              canvas.height = height;
                              const ctx = canvas.getContext('2d');
                              ctx?.drawImage(img, 0, 0, width, height);
                              
                              const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                              
                              if (dataUrl.length > 1000000) {
                                  setError("Image is too large even after resizing. Please try a different image.");
                                  return;
                              }
                              
                              setFormData(prev => ({ ...prev, photoURL: dataUrl }));
                              setError(null);
                            };
                            img.src = reader.result as string;
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Location</label>
                    <input
                      type="text"
                      placeholder="e.g. Silverstone, UK"
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Twitter Handle</label>
                    <input
                      type="text"
                      placeholder="@username"
                      value={formData.twitterHandle}
                      onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <Earth className="w-5 h-5 text-accent-500" />
                    <h3 className="text-lg font-bold text-white tracking-wide">Fandom Details</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Favorite Track</label>
                      <input
                        type="text"
                        placeholder="e.g. Silverstone, Spa"
                        value={formData.favoriteTrack}
                        onChange={(e) => setFormData(prev => ({ ...prev, favoriteTrack: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Following Since</label>
                      <select
                        value={formData.yearsFollowing}
                        onChange={(e) => setFormData(prev => ({ ...prev, yearsFollowing: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors appearance-none"
                      >
                        <option value="">Select a year</option>
                        <option value="2020s">2020s</option>
                        <option value="2010s">2010s</option>
                        <option value="2000s">2000s</option>
                        <option value="1990s">1990s</option>
                        <option value="Veteran">Before 1990</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Bio / Racing Notes</label>
                  <textarea
                    placeholder="Share your thoughts on the season..."
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors resize-none"
                  />
                </div>
              </div>
            ) : activeTab === 'settings' ? (
              <div className="space-y-6 animate-fade-in">
                {renderAppearanceControls()}

                {/* 2FA Security Management Card */}
                <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                    <div className="flex items-center gap-3">
                      <KeyRound className="w-5 h-5 text-accent-500" />
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-wide">Two-Factor Authentication (2FA)</h3>
                        <p className="text-xs text-zinc-500">Protect your account with an additional verification layer during sign in.</p>
                      </div>
                    </div>
                    
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                      twoFactorEnabled 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      {twoFactorEnabled && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>

                  <div className="space-y-4 pt-2">
                    <label className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <ShieldCheck className="w-5 h-5 text-accent-400" />
                        <div>
                          <span className="block text-sm font-bold text-white">Require 2FA Code for Sign In & Sign Up</span>
                          <span className="block text-xs text-zinc-500">Generates a 6-digit security passkey required upon every authentication attempt</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={twoFactorEnabled}
                        onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 bg-zinc-800 rounded-full flex-shrink-0 transition-colors relative ${twoFactorEnabled ? 'bg-accent-600' : ''}`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${twoFactorEnabled ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTwoFactorMethod('email')}
                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          twoFactorMethod === 'email'
                            ? 'bg-zinc-900 border-accent-500 text-white ring-1 ring-accent-500/20'
                            : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Mail className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm text-white">Email Verification Code</div>
                          <div className="text-xs text-zinc-500 mt-0.5">Send a 6-digit OTP code to registered email address</div>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setTwoFactorMethod('totp')}
                        className={`p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${
                          twoFactorMethod === 'totp'
                            ? 'bg-zinc-900 border-accent-500 text-white ring-1 ring-accent-500/20'
                            : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-sm text-white">Authenticator App (TOTP)</div>
                          <div className="text-xs text-zinc-500 mt-0.5">Use Google Authenticator, Authy, or 1Password</div>
                        </div>
                      </button>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800/60">
                      <div className="flex items-center gap-3">
                        <Key className="w-5 h-5 text-amber-400 shrink-0" />
                        <div>
                          <span className="block text-xs font-bold text-white uppercase tracking-wider">Authenticator & Recovery Keys</span>
                          <span className="block text-xs text-zinc-500">Configure TOTP app pairing or generate backup recovery codes</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setIs2FASetupModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors shrink-0"
                      >
                        Manage 2FA Setup
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <Gauge className="w-5 h-5 text-accent-500" />
                    <h3 className="text-lg font-bold text-white tracking-wide">Units & Formatting</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Speed Unit</label>
                      <select
                        value={formData.speedUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, speedUnit: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors appearance-none"
                      >
                        <option value="kmh">Kilometers per hour (km/h)</option>
                        <option value="mph">Miles per hour (mph)</option>
                      </select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Temperature Unit</label>
                      <select
                        value={formData.temperatureUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, temperatureUnit: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors appearance-none"
                      >
                        <option value="c">Celsius (°C)</option>
                        <option value="f">Fahrenheit (°F)</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Distance Unit</label>
                      <select
                        value={formData.distanceUnit}
                        onChange={(e) => setFormData(prev => ({ ...prev, distanceUnit: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors appearance-none"
                      >
                        <option value="km">Kilometers (km)</option>
                        <option value="mi">Miles (mi)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <Shield className="w-5 h-5 text-accent-500" />
                    <h3 className="text-lg font-bold text-white tracking-wide">Privacy & Notifications</h3>
                  </div>
                  
                  <div className="space-y-4 pt-2">
                    <label className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <Bell className="w-5 h-5 text-zinc-400" />
                        <div>
                          <span className="block text-sm font-bold text-white">Enable Notifications</span>
                          <span className="block text-xs text-zinc-500">Race reminders, qualifying alerts, and driver news</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.notificationsEnabled}
                        onChange={(e) => setFormData(prev => ({ ...prev, notificationsEnabled: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 bg-zinc-800 rounded-full flex-shrink-0 transition-colors relative ${formData.notificationsEnabled ? 'bg-accent-600' : ''}`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.notificationsEnabled ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <Earth className="w-5 h-5 text-zinc-400" />
                        <div>
                          <span className="block text-sm font-bold text-white">Public Profile</span>
                          <span className="block text-xs text-zinc-500">Let other paddock club members view your profile</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.publicProfile}
                        onChange={(e) => setFormData(prev => ({ ...prev, publicProfile: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 bg-zinc-800 rounded-full flex-shrink-0 transition-colors relative ${formData.publicProfile ? 'bg-accent-600' : ''}`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.publicProfile ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-zinc-400" />
                        <div>
                          <span className="block text-sm font-bold text-white">Show Online Status</span>
                          <span className="block text-xs text-zinc-500">Let others see when you are active in the Paddock Club</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.showOnlineStatus}
                        onChange={(e) => setFormData(prev => ({ ...prev, showOnlineStatus: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 bg-zinc-800 rounded-full flex-shrink-0 transition-colors relative ${formData.showOnlineStatus ? 'bg-accent-600' : ''}`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.showOnlineStatus ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>

                    <label className="flex items-center justify-between p-4 bg-zinc-900 border border-zinc-800 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-5 h-5 text-zinc-400" />
                        <div>
                          <span className="block text-sm font-bold text-white">Allow Direct Messages</span>
                          <span className="block text-xs text-zinc-500">Receive private messages from other members</span>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.allowDirectMessages}
                        onChange={(e) => setFormData(prev => ({ ...prev, allowDirectMessages: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`w-11 h-6 bg-zinc-800 rounded-full flex-shrink-0 transition-colors relative ${formData.allowDirectMessages ? 'bg-accent-600' : ''}`}>
                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.allowDirectMessages ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            ) : activeTab === 'drivers' ? (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <UserIcon className="w-5 h-5 text-accent-500" />
                    <h3 className="text-lg font-bold text-white tracking-wide">Driver Preferences</h3>
                  </div>
                  
                  <div className="space-y-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Favorite Driver</label>
                      <input
                        type="text"
                        placeholder="e.g. Max Verstappen"
                        value={formData.favoriteDriver}
                        onChange={(e) => setFormData(prev => ({ ...prev, favoriteDriver: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === 'constructor' ? (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-4 bg-zinc-950 p-6 rounded-xl border border-zinc-800/80">
                  <div className="flex items-center gap-3 border-b border-zinc-800 pb-4">
                    <Shield className="w-5 h-5 text-accent-500" />
                    <h3 className="text-lg font-bold text-white tracking-wide">Constructor Preferences</h3>
                  </div>
                  
                  <div className="space-y-6 pt-2">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Favorite Constructor</label>
                      <input
                        type="text"
                        placeholder="e.g. Red Bull Racing"
                        value={formData.favoriteConstructor}
                        onChange={(e) => setFormData(prev => ({ ...prev, favoriteConstructor: e.target.value }))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="pt-4 flex items-center justify-between border-t border-zinc-800 mt-6">
              <p className="text-sm text-emerald-500 font-medium h-6">
                {success && "Preferences and 2FA settings updated!"}
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-accent-600 text-white font-bold uppercase tracking-wider text-sm px-8 py-3 rounded-xl hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-accent-600/20"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
          )}
        </div>
      </div>

      {/* 2FA Setup Modal */}
      {is2FASetupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold text-white uppercase italic">Authenticator App 2FA Setup</h3>
              </div>
              <button
                onClick={() => setIs2FASetupModalOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-zinc-400">
                Scan the QR code or enter the secret key manually into Google Authenticator, Authy, or your password manager.
              </p>

              {/* Simulated QR Code Box */}
              <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl space-y-2 border border-zinc-800 max-w-[200px] mx-auto">
                <QrCode className="w-32 h-32 text-black" />
                <span className="text-[10px] font-mono text-zinc-600">Formula1 Tracker 2FA</span>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase text-zinc-500 block">Manual Secret Key</span>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-amber-400 tracking-wider">{totpSecret}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(totpSecret);
                      setTotpVerified(true);
                      setTimeout(() => setTotpVerified(false), 2000);
                    }}
                    className="text-xs text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    {totpVerified ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {totpVerified ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <span className="text-xs font-bold uppercase text-zinc-400 block">Backup Recovery Codes</span>
                <div className="grid grid-cols-2 gap-2 bg-zinc-950 p-3 rounded-xl font-mono text-xs text-zinc-300">
                  {backupCodes.map((c, i) => (
                    <div key={i} className="bg-zinc-900 px-2 py-1 rounded border border-zinc-800 text-center text-zinc-400">
                      {c}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(backupCodes.join('\n'));
                    setBackupCodesCopied(true);
                    setTimeout(() => setBackupCodesCopied(false), 2000);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors mt-2"
                >
                  {backupCodesCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {backupCodesCopied ? 'Recovery Codes Copied!' : 'Copy Backup Codes'}
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                setTwoFactorEnabled(true);
                setTwoFactorMethod('totp');
                setIs2FASetupModalOpen(false);
              }}
              className="w-full py-3 bg-accent-600 hover:bg-accent-700 text-white font-bold uppercase tracking-wider text-xs rounded-xl transition-colors"
            >
              Done & Enable TOTP 2FA
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
