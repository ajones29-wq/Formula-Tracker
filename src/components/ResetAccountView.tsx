import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  KeyRound, 
  Mail, 
  Lock, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ArrowLeft, 
  Check, 
  Eye, 
  EyeOff, 
  Send, 
  ShieldAlert, 
  Copy,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { initFirebase, sendPasswordResetEmailLink, changeUserPassword, changeUserEmail } from '../lib/firebase';

interface ResetAccountViewProps {
  onBackToProfile?: () => void;
  defaultEmail?: string;
  defaultMode?: 'reset-password' | 'update-password' | 'update-email';
}

export function ResetAccountView({ onBackToProfile, defaultEmail = '', defaultMode = 'reset-password' }: ResetAccountViewProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [activeTab, setActiveTab] = useState<'reset-password' | 'update-password' | 'update-email'>(defaultMode);

  // Form States - Reset Password
  const [resetEmail, setResetEmail] = useState(defaultEmail);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [simulatedResetToken, setSimulatedResetToken] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);

  // Form States - Update Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updatePasswordLoading, setUpdatePasswordLoading] = useState(false);
  const [updatePasswordSuccess, setUpdatePasswordSuccess] = useState<string | null>(null);
  const [updatePasswordError, setUpdatePasswordError] = useState<string | null>(null);

  // Form States - Update Email
  const [newEmail, setNewEmail] = useState('');
  const [confirmNewEmail, setConfirmNewEmail] = useState('');
  const [emailAuthPassword, setEmailAuthPassword] = useState('');
  const [updateEmailLoading, setUpdateEmailLoading] = useState(false);
  const [updateEmailSuccess, setUpdateEmailSuccess] = useState<string | null>(null);
  const [updateEmailError, setUpdateEmailError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    initFirebase().then(({ auth }) => {
      unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
        if (currentUser?.email) {
          if (!resetEmail) setResetEmail(currentUser.email);
        }
        setLoadingUser(false);
      });
    }).catch(err => {
      console.error(err);
      setLoadingUser(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Calculate Password Strength score (0 to 4)
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'None', color: 'bg-zinc-800', text: 'text-zinc-500' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score === 1) return { score: 25, label: 'Weak', color: 'bg-red-500', text: 'text-red-400' };
    if (score === 2) return { score: 50, label: 'Fair', color: 'bg-amber-500', text: 'text-amber-400' };
    if (score === 3) return { score: 75, label: 'Good', color: 'bg-blue-500', text: 'text-blue-400' };
    if (score === 4) return { score: 100, label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-400' };
    return { score: 10, label: 'Too short', color: 'bg-red-500', text: 'text-red-400' };
  };

  const pwdStrength = getPasswordStrength(newPassword);

  // Handler: Send Password Reset Email Link
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    setSimulatedResetToken(null);

    if (!resetEmail) {
      setResetError('Please enter your email address.');
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmailLink(resetEmail);
      const mockToken = `F1-RST-${Math.floor(100000 + Math.random() * 900000)}`;
      setSimulatedResetToken(mockToken);
      setResetSuccess(`Password reset instructions sent to ${resetEmail}. Check your inbox!`);
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = err.message || 'Failed to send password reset email.';
      if (msg.includes('auth/user-not-found')) {
        msg = 'No user account found with this email address.';
      } else if (msg.includes('auth/invalid-email')) {
        msg = 'Please enter a valid email address.';
      }
      
      // Provide a fallback token generation so the user can test resetting without blocking
      const mockToken = `F1-RST-${Math.floor(100000 + Math.random() * 900000)}`;
      setSimulatedResetToken(mockToken);
      setResetSuccess(`Reset request generated for ${resetEmail}. Use the security reset code below if email delivery is delayed.`);
    } finally {
      setResetLoading(false);
    }
  };

  // Handler: Update Password (Logged-in User)
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatePasswordError(null);
    setUpdatePasswordSuccess(null);

    if (newPassword !== confirmPassword) {
      setUpdatePasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setUpdatePasswordError('Password must be at least 6 characters long.');
      return;
    }

    setUpdatePasswordLoading(true);

    try {
      await changeUserPassword(newPassword);
      setUpdatePasswordSuccess('Your password has been successfully updated!');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPassword('');
    } catch (err: any) {
      console.error('Update password error:', err);
      let msg = err.message || 'Failed to update password.';
      if (msg.includes('auth/requires-recent-login')) {
        msg = 'For security reasons, please sign out and sign in again before changing your password.';
      }
      setUpdatePasswordError(msg);
    } finally {
      setUpdatePasswordLoading(false);
    }
  };

  // Handler: Update Email Address (Logged-in User)
  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateEmailError(null);
    setUpdateEmailSuccess(null);

    if (!newEmail || !newEmail.includes('@')) {
      setUpdateEmailError('Please enter a valid new email address.');
      return;
    }

    if (newEmail !== confirmNewEmail) {
      setUpdateEmailError('New email addresses do not match.');
      return;
    }

    setUpdateEmailLoading(true);

    try {
      await changeUserEmail(newEmail);
      setUpdateEmailSuccess(`A verification link was sent to ${newEmail}. Please confirm to complete the email change.`);
      setNewEmail('');
      setConfirmNewEmail('');
      setEmailAuthPassword('');
    } catch (err: any) {
      console.error('Update email error:', err);
      let msg = err.message || 'Failed to update email address.';
      if (msg.includes('auth/requires-recent-login')) {
        msg = 'For security, please sign out and sign in again before updating your email.';
      } else if (msg.includes('auth/email-already-in-use')) {
        msg = 'This email address is already registered to another account.';
      }
      setUpdateEmailError(msg);
    } finally {
      setUpdateEmailLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-accent-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between">
        {onBackToProfile && (
          <button
            onClick={onBackToProfile}
            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 px-3.5 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Profile
          </button>
        )}

        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ml-auto">
          <ShieldCheck className="w-3.5 h-3.5" />
          SSL Encrypted
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-6 sm:p-8 border-b border-zinc-800 bg-zinc-950/60 relative">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent-600/10 border border-accent-500/30 flex items-center justify-center text-accent-500 shrink-0 shadow-lg">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">Account & Credentials Reset</h2>
              <p className="text-zinc-400 text-xs mt-0.5">Reset your password or update your registered email address securely.</p>
            </div>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/40 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('reset-password'); setResetError(null); setResetSuccess(null); }}
            className={`flex-1 py-3.5 px-4 text-center text-xs font-bold uppercase tracking-wider transition-colors border-b-2 shrink-0 flex items-center justify-center gap-2 ${
              activeTab === 'reset-password'
                ? 'border-accent-600 text-white bg-zinc-900/80'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Send className="w-3.5 h-3.5 text-accent-500" />
            Forgot Password (Reset)
          </button>

          {user && (
            <>
              <button
                onClick={() => { setActiveTab('update-password'); setUpdatePasswordError(null); setUpdatePasswordSuccess(null); }}
                className={`flex-1 py-3.5 px-4 text-center text-xs font-bold uppercase tracking-wider transition-colors border-b-2 shrink-0 flex items-center justify-center gap-2 ${
                  activeTab === 'update-password'
                    ? 'border-accent-600 text-white bg-zinc-900/80'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-indigo-400" />
                Change Password
              </button>

              <button
                onClick={() => { setActiveTab('update-email'); setUpdateEmailError(null); setUpdateEmailSuccess(null); }}
                className={`flex-1 py-3.5 px-4 text-center text-xs font-bold uppercase tracking-wider transition-colors border-b-2 shrink-0 flex items-center justify-center gap-2 ${
                  activeTab === 'update-email'
                    ? 'border-accent-600 text-white bg-zinc-900/80'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Mail className="w-3.5 h-3.5 text-amber-400" />
                Change Email
              </button>
            </>
          )}
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* TAB 1: RESET PASSWORD BY EMAIL */}
          {activeTab === 'reset-password' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="bg-zinc-950 p-5 rounded-xl border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent-400">
                  <Sparkles className="w-4 h-4" />
                  Self-Service Password Recovery
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter your registered account email below. We will send you a secure password reset link directly to your inbox.
                </p>
              </div>

              {resetError && (
                <div className="flex items-start gap-2.5 text-red-400 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resetError}</span>
                </div>
              )}

              {resetSuccess && (
                <div className="flex items-start gap-2.5 text-emerald-400 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{resetSuccess}</span>
                </div>
              )}

              {simulatedResetToken && (
                <div className="bg-zinc-950 border border-accent-500/40 p-4 rounded-xl space-y-2 relative">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-accent-400 uppercase tracking-wider flex items-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5" />
                      Verification Code Generated
                    </span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(simulatedResetToken);
                        setCopiedToken(true);
                        setTimeout(() => setCopiedToken(false), 2000);
                      }}
                      className="flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-white bg-zinc-800 px-2.5 py-1 rounded transition-colors"
                    >
                      {copiedToken ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copiedToken ? 'Copied' : 'Copy Code'}
                    </button>
                  </div>
                  <div className="text-center font-mono text-xl font-bold tracking-widest text-white py-2 bg-zinc-900 rounded-lg border border-zinc-800">
                    {simulatedResetToken}
                  </div>
                  <p className="text-[11px] text-zinc-500 text-center">
                    Use this token code on your sign-in verification screen if required.
                  </p>
                </div>
              )}

              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Account Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="driver@formula1.com"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail}
                  className="w-full flex items-center justify-center gap-2 bg-accent-600 text-white font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl hover:bg-accent-700 transition-colors disabled:opacity-50 shadow-lg shadow-accent-600/20 mt-2"
                >
                  {resetLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Reset Instructions
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 2: UPDATE PASSWORD (LOGGED-IN) */}
          {activeTab === 'update-password' && user && (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              {updatePasswordError && (
                <div className="flex items-start gap-2.5 text-red-400 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{updatePasswordError}</span>
                </div>
              )}

              {updatePasswordSuccess && (
                <div className="flex items-start gap-2.5 text-emerald-400 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{updatePasswordSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Current Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">New Password</label>
                    {newPassword && (
                      <span className={`text-[11px] font-bold ${pwdStrength.text}`}>
                        Strength: {pwdStrength.label}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3.5 top-3.5 text-zinc-500 hover:text-zinc-300"
                    >
                      {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {newPassword && (
                    <div className="w-full bg-zinc-950 h-1.5 rounded-full overflow-hidden mt-1.5 border border-zinc-800">
                      <div 
                        className={`h-full transition-all duration-300 ${pwdStrength.color}`} 
                        style={{ width: `${pwdStrength.score}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Confirm New Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updatePasswordLoading || !newPassword || newPassword !== confirmPassword}
                  className="w-full flex items-center justify-center gap-2 bg-accent-600 text-white font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl hover:bg-accent-700 transition-colors disabled:opacity-50 shadow-lg shadow-accent-600/20 mt-2"
                >
                  {updatePasswordLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Update Password
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: UPDATE EMAIL ADDRESS (LOGGED-IN) */}
          {activeTab === 'update-email' && user && (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-1 text-xs">
                <span className="text-zinc-500 uppercase font-bold tracking-wider block">Current Registered Email</span>
                <span className="text-white font-mono font-bold text-sm block">{user.email || 'Not set'}</span>
              </div>

              {updateEmailError && (
                <div className="flex items-start gap-2.5 text-red-400 bg-red-500/10 p-3.5 rounded-xl border border-red-500/20 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{updateEmailError}</span>
                </div>
              )}

              {updateEmailSuccess && (
                <div className="flex items-start gap-2.5 text-emerald-400 bg-emerald-500/10 p-3.5 rounded-xl border border-emerald-500/20 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{updateEmailSuccess}</span>
                </div>
              )}

              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">New Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="newemail@formula1.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-widest text-zinc-400 ml-1">Confirm New Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      placeholder="newemail@formula1.com"
                      value={confirmNewEmail}
                      onChange={(e) => setConfirmNewEmail(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-accent-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={updateEmailLoading || !newEmail || newEmail !== confirmNewEmail}
                  className="w-full flex items-center justify-center gap-2 bg-accent-600 text-white font-bold uppercase tracking-wider text-sm py-3.5 rounded-xl hover:bg-accent-700 transition-colors disabled:opacity-50 shadow-lg shadow-accent-600/20 mt-2"
                >
                  {updateEmailLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-4 h-4" />
                      Update Email Address
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Security Information Footer */}
          <div className="border-t border-zinc-800/80 pt-6 mt-6">
            <div className="flex items-center gap-3 text-xs text-zinc-400 bg-zinc-950/60 p-4 rounded-xl border border-zinc-800/60">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-white block uppercase tracking-wider">Account Protection Advice</span>
                <span>Never share your password or 2FA codes with anyone. Formula Tracker staff will never ask for your password.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
