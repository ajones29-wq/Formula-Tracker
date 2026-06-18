import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { LogIn, Save, User as UserIcon, AlertCircle, Loader2 } from 'lucide-react';
import { initFirebase, signInWithGoogle } from '../lib/firebase';

export function ProfileView() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    displayName: '',
    photoURL: '',
    bio: '',
    favoriteDriver: '',
    favoriteConstructor: '',
    twitterHandle: '',
    location: ''
  });

  useEffect(() => {
    let unsubscribe: () => void;
    
    initFirebase().then(({ auth, db }) => {
      unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
          try {
            const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
            if (userDoc.exists()) {
              const data = userDoc.data();
              setFormData({
                displayName: data.displayName || '',
                photoURL: data.photoURL || '',
                bio: data.bio || '',
                favoriteDriver: data.favoriteDriver || '',
                favoriteConstructor: data.favoriteConstructor || '',
                twitterHandle: data.twitterHandle || '',
                location: data.location || ''
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
    };
  }, []);

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
        twitterHandle: formData.twitterHandle,
        location: formData.location,
        updatedAt: new Date().toISOString()
      }, { merge: true });
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
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto mt-8 relative">
        <div className="absolute inset-0 bg-red-600/5 blur-3xl -z-10 rounded-full" />
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center text-red-500 mx-auto border border-red-500/20">
            <UserIcon className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold italic uppercase tracking-tight text-white">Your Driver Profile</h2>
            <p className="text-zinc-400">Sign in to customize your profile, set your favorite driver and constructor, and join the paddock.</p>
          </div>
          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2 bg-white text-black font-bold uppercase tracking-wider text-sm px-6 py-3 rounded-xl hover:bg-zinc-200 transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Sign In with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-8 sm:p-10 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-6">
            <img 
              src={formData.photoURL || user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.displayName || user.displayName || user.email || 'User')}`} 
              alt="Profile" 
              className="w-20 h-20 rounded-full border-2 border-red-600 shadow-lg object-cover"
            />
            <div>
              <h2 className="text-2xl font-extrabold italic uppercase tracking-tight text-white">{formData.displayName || user.displayName || 'Racing Fan'}</h2>
              <p className="text-zinc-500 font-mono text-sm">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="p-8 sm:p-10 space-y-8">
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Display Name</label>
                <input
                  type="text"
                  placeholder={user.displayName || "Your name"}
                  value={formData.displayName}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
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
                        setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-zinc-800 file:text-white hover:file:bg-zinc-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Location</label>
                <input
                  type="text"
                  placeholder="e.g. Silverstone, UK"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Twitter Handle</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={formData.twitterHandle}
                  onChange={(e) => setFormData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Favorite Driver</label>
                <input
                  type="text"
                  placeholder="e.g. Charles Leclerc"
                  value={formData.favoriteDriver}
                  onChange={(e) => setFormData(prev => ({ ...prev, favoriteDriver: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Favorite Constructor</label>
                <input
                  type="text"
                  placeholder="e.g. Ferrari, McLaren"
                  value={formData.favoriteConstructor}
                  onChange={(e) => setFormData(prev => ({ ...prev, favoriteConstructor: e.target.value }))}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1">Bio / Racing Notes</label>
              <textarea
                placeholder="Share your thoughts on the season..."
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white placeholder:text-zinc-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors resize-none"
              />
            </div>

            <div className="pt-4 flex items-center justify-between">
              <p className="text-sm text-emerald-500 font-medium h-6">
                {success && "Profile updated successfully!"}
              </p>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-red-600 text-white font-bold uppercase tracking-wider text-sm px-8 py-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Profile
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
