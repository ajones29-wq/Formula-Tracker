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
  Sparkles
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
          <div className="font-mono text-xs text-zinc-500 bg-zinc-950 border border-zinc-800 px-3/5 py-1.5 rounded-lg">
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

                    <p className="text-xs text-zinc-350 leading-relaxed break-words whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
