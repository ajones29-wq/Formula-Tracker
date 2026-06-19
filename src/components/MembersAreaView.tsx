import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  initFirebase, 
  signInWithGoogle 
} from '../lib/firebase';
import { 
  Lock, 
  Unlock, 
  Send, 
  Trash2, 
  Loader2, 
  Gauge, 
  TrendingUp, 
  Zap, 
  Award, 
  Flame, 
  ShieldAlert, 
  Timer,
  ChevronRight,
  Sparkles,
  CloudRain,
  Thermometer,
  MessageCircle,
  Activity
} from 'lucide-react';

// Formatted Firebase error handling as requested by system rules
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null, activeUserId?: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
    authInfo: {
      userId: activeUserId,
    }
  };
  console.error('Firestore Error Detailed Info: ', JSON.stringify(errInfo));
}

interface Post {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorPhoto: string;
  createdAt: any;
  tag: string;
}

export function MembersAreaView() {
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [selectedTag, setSelectedTag] = useState('#Strategy');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Exclusive members only telemetry state
  const [selectedTelemetryDataset, setSelectedTelemetryDataset] = useState<'monaco' | 'silverstone' | 'spa'>('monaco');

  const telemetryData = {
    monaco: {
      trackTemp: '42.6°C',
      avgDegradation: '0.94% / lap',
      optimalDownforce: '98%',
      sectorOneRecord: '18.423s',
      topSpeedTrap: '298.4 km/h',
      optMinimumSteer: '14.2°',
      tireStrategy: 'Soft (18 Laps) ➔ Hard (60 Laps)'
    },
    silverstone: {
      trackTemp: '28.1°C',
      avgDegradation: '1.45% / lap',
      optimalDownforce: '72%',
      sectorOneRecord: '26.104s',
      topSpeedTrap: '344.2 km/h',
      optMinimumSteer: '4.8°',
      tireStrategy: 'Medium (24 Laps) ➔ Hard (28 Laps)'
    },
    spa: {
      trackTemp: '22.3°C',
      avgDegradation: '1.20% / lap',
      optimalDownforce: '55%',
      sectorOneRecord: '28.910s',
      topSpeedTrap: '359.1 km/h',
      optMinimumSteer: '6.1°',
      tireStrategy: 'Soft (12 Laps) ➔ Medium (18 Laps) ➔ Medium (14 Laps)'
    }
  };

  // Auth Status check
  useEffect(() => {
    let unsubscribe: () => void;
    
    initFirebase().then(({ auth }) => {
      unsubscribe = auth.onAuthStateChanged((currentUser) => {
        setUser(currentUser);
        setLoadingAuth(false);
      });
    }).catch(err => {
      console.error(err);
      setError('Firebase failed to load.');
      setLoadingAuth(false);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Post Listener for Members Area
  useEffect(() => {
    if (!user) {
      setPosts([]);
      return;
    }

    setLoadingPosts(true);
    let unsubscribePosts: () => void;

    initFirebase().then(({ db }) => {
      const postsCol = collection(db, 'member_posts');
      const q = query(postsCol, orderBy('createdAt', 'desc'), limit(30));

      unsubscribePosts = onSnapshot(q, (snapshot) => {
        const loadedPosts: Post[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          loadedPosts.push({
            id: doc.id,
            content: data.content || '',
            authorId: data.authorId || '',
            authorName: data.authorName || 'Anonymous Member',
            authorPhoto: data.authorPhoto || '',
            createdAt: data.createdAt,
            tag: data.tag || '#Paddock'
          });
        });
        setPosts(loadedPosts);
        setLoadingPosts(false);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, 'member_posts', user?.uid);
        setError('Failed to sync paddock messages.');
        setLoadingPosts(false);
      });
    }).catch(err => {
      console.error(err);
      setLoadingPosts(false);
    });

    return () => {
      if (unsubscribePosts) unsubscribePosts();
    };
  }, [user]);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postContent.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    const content = postContent.trim();
    setPostContent('');

    try {
      const { db } = await initFirebase();
      await addDoc(collection(db, 'member_posts'), {
        content: content,
        authorId: user.uid,
        authorName: user.displayName || user.email || 'Paddock Insider',
        authorPhoto: user.photoURL || '',
        createdAt: serverTimestamp(),
        tag: selectedTag
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'member_posts', user.uid);
      setError('Error transmitting your paddock message. Keep it under 1000 characters.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    try {
      const { db } = await initFirebase();
      await deleteDoc(doc(db, 'member_posts', postId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `member_posts/${postId}`, user.uid);
      setError('Could not delete post. You can only delete your own paddock messages.');
    }
  };

  if (loadingAuth) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto mt-6 relative">
        <div className="absolute inset-0 bg-red-600/5 blur-3xl -z-10 rounded-full" />
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 sm:p-12 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>
          
          <div className="inline-flex items-center justify-center p-4 bg-red-500/10 rounded-2xl border border-red-500/20 text-red-500 mb-2">
            <Lock className="w-10 h-10" />
          </div>
          
          <div className="space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-red-500 px-3 py-1 bg-red-950/40 border border-red-900/30 rounded-full">
              Paddock Club Private Lounge
            </span>
            <h2 className="text-3xl font-extrabold italic uppercase tracking-tight text-white mt-2">
              Exclusive Members Lounge
            </h2>
            <p className="text-zinc-400 text-sm max-w-lg mx-auto leading-relaxed">
              Unlock real-time wind tunnel diagnostics, advanced aerodynamic telemetries, sector-record timelines, and exchange strategic intel directly with other F1 enthusiasts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left max-w-xl mx-auto pt-4 pb-4">
            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 flex gap-3 items-start">
              <Gauge className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase">Advanced Telemetry</h4>
                <p className="text-[11px] text-zinc-500">Speed traps, wing degradation profiles.</p>
              </div>
            </div>
            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 flex gap-3 items-start">
              <TrendingUp className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase">Compound Metrics</h4>
                <p className="text-[11px] text-zinc-500">Simulate tires and structural decay ratios.</p>
              </div>
            </div>
            <div className="bg-zinc-950/60 p-4 rounded-xl border border-zinc-800 flex gap-3 items-start">
              <Award className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-extrabold text-white uppercase">Paddock Hot Board</h4>
                <p className="text-[11px] text-zinc-500">Live communication thread with F1 members.</p>
              </div>
            </div>
          </div>

          <button
            onClick={signInWithGoogle}
            className="inline-flex items-center gap-2.5 bg-red-600 text-white font-extrabold uppercase tracking-wider text-sm px-8 py-3.5 rounded-xl hover:bg-red-700 transition-all hover:scale-[1.02] shadow-lg shadow-red-600/10 cursor-pointer"
          >
            <Unlock className="w-4 h-4" />
            Enter Paddock Club
          </button>
        </div>
      </div>
    );
  }

  const currentDataset = telemetryData[selectedTelemetryDataset];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Badge */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
          <Sparkles className="w-40 h-40 text-red-500" />
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20 shadow-inner">
              <Unlock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-red-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 animate-pulse" /> Paddock Club Member Access Verified
              </p>
              <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
                Member Hub & Private Telemetry
              </h2>
            </div>
          </div>
          <div className="font-mono text-xs text-zinc-500 bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded-lg">
            SECRET ACCESS TOKEN: <span className="text-green-500 font-bold">ACTIVE</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-400 bg-red-500/10 p-4 rounded-xl border border-red-500/20 max-w-4xl mx-auto">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main dashboard content */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Left Column (3/5 width): Telemetry Dashboard */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-bold uppercase tracking-widest text-white italic">Advanced Telemetrics</h3>
              </div>
              
              {/* Dataset selectors */}
              <div className="flex bg-zinc-950 p-1 border border-zinc-800 rounded-lg text-xs">
                {['monaco', 'silverstone', 'spa'].map((dbId) => (
                  <button
                    key={dbId}
                    onClick={() => setSelectedTelemetryDataset(dbId as any)}
                    className={`px-3 py-1.5 rounded-md font-bold uppercase tracking-wider transition-colors ${
                      selectedTelemetryDataset === dbId
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-500 hover:text-white'
                    }`}
                  >
                    {dbId}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              These diagnostics are exclusively rendered from current-year wind-tunnel profiles and simulated circuit setups. Non-members are restricted from fetching this database.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Metric 1 */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs text-zinc-500 uppercase font-extrabold tracking-wider">Optimal Aero Downforce</span>
                <span className="text-2xl font-black text-white italic mt-2">{currentDataset.optimalDownforce}</span>
                <span className="text-[10px] text-zinc-500 mt-1">Target drag profile target</span>
              </div>
              {/* Metric 2 */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs text-zinc-500 uppercase font-extrabold tracking-wider">Avg Compound Decay</span>
                <span className="text-2xl font-black text-red-500 italic mt-2">{currentDataset.avgDegradation}</span>
                <span className="text-[10px] text-zinc-500 mt-1">Based on telemetry models</span>
              </div>
              {/* Metric 3 */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs text-zinc-500 uppercase font-extrabold tracking-wider">Estimated Sector-1 Target</span>
                <span className="text-2xl font-black text-amber-500 italic mt-2">{currentDataset.sectorOneRecord}</span>
                <span className="text-[10px] text-zinc-500 mt-1">Ideal delta curve line</span>
              </div>
              {/* Metric 4 */}
              <div className="bg-zinc-950 border border-zinc-800/80 rounded-xl p-4 flex flex-col justify-between">
                <span className="text-xs text-zinc-500 uppercase font-extrabold tracking-wider">Maximum Speed Trap</span>
                <span className="text-2xl font-black text-emerald-500 italic mt-2">{currentDataset.topSpeedTrap}</span>
                <span className="text-[10px] text-zinc-500 mt-1">End of Main Straight limit</span>
              </div>
            </div>

            {/* Simulated Strategy Info */}
            <div className="bg-zinc-950 border border-red-950/50 rounded-xl p-4 space-y-2 border-l-4 border-l-red-600">
              <h5 className="text-xs font-black uppercase text-red-400 tracking-wider flex items-center gap-2">
                <Timer className="w-4 h-4" /> Optimized Strategic Wheel Timeline
              </h5>
              <p className="text-sm font-semibold text-zinc-100 font-mono">
                {currentDataset.tireStrategy}
              </p>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Strategy calculated dynamically by matching circuit heat coefficients of {currentDataset.trackTemp} track surface with maximum speed profile requirements.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (2/5 width): Forum & intel stream */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-[550px]">
            
            <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 mb-4 shrink-0">
              <Zap className="w-5 h-5 text-red-500" />
              <div>
                <h3 className="text-md font-bold uppercase tracking-widest text-white italic">Intel Transmissions</h3>
                <p className="text-[10px] text-zinc-400">Share tips, strategies, and setup rumors</p>
              </div>
            </div>

            {/* Posting form */}
            <form onSubmit={handlePostSubmit} className="space-y-3 mb-4 shrink-0">
              <div className="flex gap-2 text-xs">
                {['#Strategy', '#Rumors', '#Setup'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-2.5 py-1 rounded-md border font-extrabold transition-colors ${
                      selectedTag === tag
                        ? 'bg-red-600/10 text-red-500 border-red-500/30'
                        : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={950}
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Insert F1 rumors, setups, strategy intel..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={submitting || !postContent.trim()}
                  className="bg-red-600 hover:bg-red-700 text-white p-3.5 rounded-xl transition-colors disabled:opacity-40 shrink-0"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </div>
            </form>

            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 normal-scrollbar">
              {loadingPosts ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                  <Loader2 className="w-6 h-6 animate-spin text-red-500 mb-2" />
                  <p className="text-xs italic">Syncing live transmissions...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-600 text-center py-6">
                  <Award className="w-8 h-8 opacity-20 mb-2" />
                  <p className="text-xs italic">Be the first to transmit motorsport intel to this members room.</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div 
                    key={post.id} 
                    className="p-3 bg-zinc-950 border border-zinc-800/80 rounded-xl relative group hover:border-zinc-700/80 transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-2 justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={post.authorPhoto || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.authorName)}`}
                          alt="avatar"
                          referrerPolicy="no-referrer"
                          className="w-5 h-5 rounded-full object-cover border border-zinc-800"
                        />
                        <span className="text-xs font-black text-zinc-200 truncate max-w-[120px]" title={post.authorName}>
                          {post.authorName}
                        </span>
                        <span className="text-[9px] font-extrabold text-red-500 bg-red-950/50 border border-red-900/30 px-1.5 py-0.5 rounded uppercase">
                          {post.tag}
                        </span>
                      </div>

                      {post.authorId === user?.uid && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="text-zinc-600 hover:text-red-500 p-1 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                          title="Delete message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* New Row: Additional Paddock Club Features */}
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-4">
          
          {/* Race Control Communications */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Flame className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-md font-bold uppercase tracking-widest text-white italic">Race Control Radio</h3>
                <p className="text-[10px] text-zinc-400">Decrypted pitwall communications</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
               <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Pit Wall ➔ Car 16</span>
                    <span className="text-[10px] text-zinc-600 font-mono">Lap 42</span>
                  </div>
                  <p className="text-xs text-zinc-300 italic font-mono">"Box, box. Pit confirm. Let's cover the undercut risk from Car 4. Soft tires waiting."</p>
               </div>
               <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Car 4 ➔ Pit Wall</span>
                    <span className="text-[10px] text-zinc-600 font-mono">Lap 43</span>
                  </div>
                  <p className="text-xs text-zinc-300 italic font-mono">"Tires feel completely gone. I'm losing the rear in Sector 3."</p>
               </div>
               <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] uppercase font-bold text-red-500 tracking-wider">Race Control</span>
                    <span className="text-[10px] text-zinc-600 font-mono">System</span>
                  </div>
                  <p className="text-xs text-zinc-300 italic font-mono">"VIRTUAL SAFETY CAR DEPLOYED. Debris reported at Turn 8."</p>
               </div>
            </div>
            <button className="w-full mt-4 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-white uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
              <Lock className="w-3 h-3" /> Connect to Audio Stream (Premium)
            </button>
          </div>

          {/* Members Only Events */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Award className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-md font-bold uppercase tracking-widest text-white italic">Exclusive Events</h3>
                <p className="text-[10px] text-zinc-400">VIP meetups and factory tours</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
               <div className="flex gap-4">
                 <div className="w-14 items-center justify-center flex flex-col bg-zinc-950 rounded-lg border border-zinc-800 shrink-0 h-16">
                   <span className="text-[10px] font-bold text-red-500 uppercase">JUL</span>
                   <span className="text-lg font-black text-white">14</span>
                 </div>
                 <div className="flex flex-col justify-center">
                   <h4 className="text-sm font-bold text-white uppercase tracking-wide">Silverstone Factory Tour</h4>
                   <p className="text-[10px] text-zinc-400 mt-1">Guided aero lab experience. Limited to 20 members.</p>
                   <span className="text-[9px] text-emerald-500 uppercase font-bold mt-2">Tickets Available</span>
                 </div>
               </div>
               
               <div className="flex gap-4">
                 <div className="w-14 items-center justify-center flex flex-col bg-zinc-950 rounded-lg border border-zinc-800 shrink-0 h-16 opacity-60">
                   <span className="text-[10px] font-bold text-red-500 uppercase">AUG</span>
                   <span className="text-lg font-black text-white">28</span>
                 </div>
                 <div className="flex flex-col justify-center opacity-60">
                   <h4 className="text-sm font-bold text-white uppercase tracking-wide">Monza Track Walk</h4>
                   <p className="text-[10px] text-zinc-400 mt-1">Walk the track with legendary engineers.</p>
                   <span className="text-[9px] text-red-500 uppercase font-bold mt-2">Sold Out</span>
                 </div>
               </div>

                <div className="flex gap-4">
                 <div className="w-14 items-center justify-center flex flex-col bg-zinc-950 rounded-lg border border-zinc-800 shrink-0 h-16">
                   <span className="text-[10px] font-bold text-red-500 uppercase">NOV</span>
                   <span className="text-lg font-black text-white">21</span>
                 </div>
                 <div className="flex flex-col justify-center">
                   <h4 className="text-sm font-bold text-white uppercase tracking-wide">Vegas Paddock Meetup</h4>
                   <p className="text-[10px] text-zinc-400 mt-1">Exclusive cocktail party in the neon paddock.</p>
                   <span className="text-[9px] text-amber-500 uppercase font-bold mt-2">RSVP Opening Soon</span>
                 </div>
               </div>
            </div>
             <button className="w-full mt-4 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-white uppercase tracking-widest transition-colors flex justify-center items-center gap-2">
              View Calendar
            </button>
          </div>

          {/* Virtual Engineering Desk */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full md:col-span-2 xl:col-span-1">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                <Gauge className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <h3 className="text-md font-bold uppercase tracking-widest text-white italic">Engineering Desk</h3>
                <p className="text-[10px] text-zinc-400">Technical insights direct from the garage</p>
              </div>
            </div>
            
            <div className="flex-1 flex flex-col gap-4">
              <div className="relative h-40 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden group">
                 <div className="absolute inset-0 bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1549463990-25251a37c0bb?auto=format&fit=crop&q=80&w=800')" }}></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent"></div>
                 <div className="absolute bottom-4 left-4 right-4">
                   <span className="text-[10px] font-black uppercase text-indigo-400 bg-indigo-950/50 px-2 py-0.5 rounded border border-indigo-900/50 mb-2 inline-block">Aero Update</span>
                   <h4 className="text-sm font-bold text-white">Analysis: New Floor Edge Wings</h4>
                   <p className="text-[10px] text-zinc-300 mt-1 line-clamp-2">A deep dive into how the new vortex generators along the floor edge improve high-speed downforce stability.</p>
                 </div>
              </div>

               <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800/80">
                  <h4 className="text-xs font-bold text-white uppercase mb-2">Simulated Upgrades Tracker</h4>
                  <div className="space-y-3 mt-3">
                    <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>Front Wing Development</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5">
                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                     <div>
                      <div className="flex justify-between text-[10px] text-zinc-400 mb-1">
                        <span>Power Unit Mapping</span>
                        <span>100% (Deployed)</span>
                      </div>
                      <div className="w-full bg-zinc-900 rounded-full h-1.5">
                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Third Row: Analytics and Rumors */}
        <div className="lg:col-span-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-4">
          
          {/* Live Track Conditions */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full bg-gradient-to-b from-zinc-900 to-zinc-950 relative overflow-hidden">
             {/* Background map grid effect */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
            
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4 relative z-10">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                <CloudRain className="w-4 h-4 text-sky-500" />
              </div>
              <div>
                <h3 className="text-md font-bold uppercase tracking-widest text-white italic">Track Weather</h3>
                <p className="text-[10px] text-zinc-400">Live conditions & radar forecast</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-6 relative z-10">
               <div className="flex justify-between items-center bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <Thermometer className="w-6 h-6 text-red-500" />
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Track Temp</span>
                      <span className="block text-2xl font-black text-white italic">42.5°C</span>
                    </div>
                  </div>
                  <div className="h-10 w-px bg-zinc-800"></div>
                  <div className="flex items-center gap-3">
                    <CloudRain className="w-6 h-6 text-sky-500" />
                    <div>
                      <span className="block text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Rain Chance</span>
                      <span className="block text-2xl font-black text-white italic">15%</span>
                    </div>
                  </div>
               </div>
               
               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-zinc-400 font-mono">
                   <span>Radar Forecast (Next 60m)</span>
                   <span className="text-sky-500">Light Showers Approach Turn 14</span>
                 </div>
                 <div className="h-12 w-full bg-zinc-950 border border-zinc-800 rounded-lg overflow-hidden flex">
                    <div className="h-full bg-zinc-900 border-r border-zinc-800" style={{ width: '20%' }}></div>
                    <div className="h-full bg-zinc-900 border-r border-zinc-800 relative" style={{ width: '30%' }}>
                       <div className="absolute inset-x-0 bottom-0 bg-sky-500/20 h-1/3"></div>
                    </div>
                    <div className="h-full bg-sky-500/40 border-r border-zinc-800 relative" style={{ width: '25%' }}>
                       <div className="absolute inset-x-0 bottom-0 bg-sky-500 h-2/3"></div>
                    </div>
                    <div className="h-full bg-zinc-900 relative" style={{ width: '25%' }}>
                       <div className="absolute inset-x-0 bottom-0 bg-sky-500/20 h-1/4"></div>
                    </div>
                 </div>
                 <div className="flex justify-between text-[9px] text-zinc-600 uppercase font-bold">
                   <span>Now</span>
                   <span>+15m</span>
                   <span>+30m</span>
                   <span>+45m</span>
                   <span>+60m</span>
                 </div>
               </div>
            </div>
          </div>

          {/* Live Sector Timing (Simulated) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full bg-gradient-to-br from-zinc-900 to-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-4">
               <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                  <Activity className="w-4 h-4 text-pink-500" />
                </div>
                <div>
                  <h3 className="text-md font-bold uppercase tracking-widest text-white italic">Live Timing</h3>
                  <p className="text-[10px] text-zinc-400">Sector analysis (Pro)</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-red-600 animate-pulse text-[9px] font-black uppercase tracking-widest text-white">Live</span>
            </div>
            
            <div className="flex-1 space-y-3 font-mono text-xs">
               <div className="grid grid-cols-5 gap-2 text-[10px] text-zinc-500 uppercase font-bold border-b border-zinc-800 pb-2">
                 <div className="col-span-2">Driver</div>
                 <div className="text-center">S1</div>
                 <div className="text-center">S2</div>
                 <div className="text-center">S3</div>
               </div>
               
               <div className="grid grid-cols-5 gap-2 items-center bg-zinc-950 p-2 rounded border border-zinc-800">
                 <div className="col-span-2 font-bold text-white flex items-center gap-2">
                   <div className="w-1 h-3 bg-blue-500"></div> VER
                 </div>
                 <div className="text-center text-purple-400">28.410</div>
                 <div className="text-center text-green-500">31.295</div>
                 <div className="text-center text-yellow-500">22.841</div>
               </div>

               <div className="grid grid-cols-5 gap-2 items-center hover:bg-zinc-800/50 p-2 rounded border border-transparent transition-colors">
                 <div className="col-span-2 font-bold text-white flex items-center gap-2">
                   <div className="w-1 h-3 bg-red-600"></div> LEC
                 </div>
                 <div className="text-center text-yellow-500">28.530</div>
                 <div className="text-center text-purple-400">31.182</div>
                 <div className="text-center text-green-500">22.890</div>
               </div>

                <div className="grid grid-cols-5 gap-2 items-center hover:bg-zinc-800/50 p-2 rounded border border-transparent transition-colors">
                 <div className="col-span-2 font-bold text-white flex items-center gap-2">
                   <div className="w-1 h-3 bg-orange-500"></div> NOR
                 </div>
                 <div className="text-center text-green-500">28.455</div>
                 <div className="text-center text-yellow-500">31.401</div>
                 <div className="text-center text-purple-400">22.788</div>
               </div>

                <div className="grid grid-cols-5 gap-2 items-center hover:bg-zinc-800/50 p-2 rounded border border-transparent transition-colors">
                 <div className="col-span-2 font-bold text-white flex items-center gap-2">
                   <div className="w-1 h-3 bg-teal-400"></div> RUS
                 </div>
                 <div className="text-center text-yellow-500">28.611</div>
                 <div className="text-center text-yellow-500">31.450</div>
                 <div className="text-center text-yellow-500">22.955</div>
               </div>
            </div>
          </div>

           {/* Paddock Rumors */}
           <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex flex-col h-full md:col-span-2 xl:col-span-1">
            <div className="flex items-center gap-3 border-b border-zinc-800 pb-4 mb-4">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                <MessageCircle className="w-4 h-4 text-orange-500" />
              </div>
              <div>
                <h3 className="text-md font-bold uppercase tracking-widest text-white italic">Paddock Gossip</h3>
                <p className="text-[10px] text-zinc-400">Unverified driver market rumors</p>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
               <div className="relative pl-6 border-l-2 border-zinc-800 space-y-6">
                 
                 <div className="relative">
                   <div className="absolute w-3 h-3 bg-orange-500 rounded-full -left-[31px] top-1 border-4 border-zinc-900 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">2 Hours Ago</span>
                   <p className="text-sm text-white italic line-clamp-2">"High-level meetings observed in the Mercedes motorhome. Potential engine supplier negotiations for 2026."</p>
                 </div>

                  <div className="relative">
                   <div className="absolute w-3 h-3 bg-zinc-700 rounded-full -left-[31px] top-1 border-4 border-zinc-900"></div>
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">5 Hours Ago</span>
                   <p className="text-sm text-zinc-300 italic line-clamp-2">"Audi reportedly makes massive multi-year offer to secure leading driver. Decision expected before Monza."</p>
                 </div>

                  <div className="relative">
                   <div className="absolute w-3 h-3 bg-zinc-700 rounded-full -left-[31px] top-1 border-4 border-zinc-900"></div>
                   <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1 block">Yesterday</span>
                   <p className="text-sm text-zinc-300 italic line-clamp-2">"Tension at Red Bull? Whispers of restructuring in the aerodynamic department after wind tunnel discrepancies."</p>
                 </div>
               </div>
            </div>
             <button className="w-full mt-4 py-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-xs font-bold text-white uppercase tracking-widest transition-colors">
              Read All Rumors
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
