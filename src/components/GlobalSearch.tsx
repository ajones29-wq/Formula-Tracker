import { useState, useEffect, useRef } from 'react';
import { Search, X, User as UserIcon, Flag, Car, Users, Calendar, Trophy, ArrowRight } from 'lucide-react';

export function GlobalSearch({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setToastMessage(null);
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Mock search results based on query
  const getResults = () => {
    if (!query.trim()) return [];
    
    const lowerQuery = query.toLowerCase();
    const results = [];

    // Drivers
    const mockDrivers = [
      { id: 'max-verstappen', name: 'Max Verstappen', team: 'Red Bull Racing', type: 'driver', number: '1' },
      { id: 'isack-hadjar', name: 'Isack Hadjar', team: 'Red Bull Racing', type: 'driver', number: '6' },
      { id: 'lando-norris', name: 'Lando Norris', team: 'McLaren', type: 'driver', number: '4' },
      { id: 'oscar-piastri', name: 'Oscar Piastri', team: 'McLaren', type: 'driver', number: '81' },
      { id: 'charles-leclerc', name: 'Charles Leclerc', team: 'Ferrari', type: 'driver', number: '16' },
      { id: 'lewis-hamilton', name: 'Lewis Hamilton', team: 'Ferrari', type: 'driver', number: '44' },
      { id: 'george-russell', name: 'George Russell', team: 'Mercedes', type: 'driver', number: '63' },
      { id: 'kimi-antonelli', name: 'Andrea Kimi Antonelli', team: 'Mercedes', type: 'driver', number: '12' },
      { id: 'fernando-alonso', name: 'Fernando Alonso', team: 'Aston Martin', type: 'driver', number: '14' },
      { id: 'lance-stroll', name: 'Lance Stroll', team: 'Aston Martin', type: 'driver', number: '18' },
      { id: 'pierre-gasly', name: 'Pierre Gasly', team: 'Alpine', type: 'driver', number: '10' },
      { id: 'franco-colapinto', name: 'Franco Colapinto', team: 'Alpine', type: 'driver', number: '43' },
      { id: 'alex-albon', name: 'Alexander Albon', team: 'Williams', type: 'driver', number: '23' },
      { id: 'carlos-sainz', name: 'Carlos Sainz', team: 'Williams', type: 'driver', number: '55' },
      { id: 'liam-lawson', name: 'Liam Lawson', team: 'VCARB', type: 'driver', number: '30' },
      { id: 'arvid-lindblad', name: 'Arvid Lindblad', team: 'VCARB', type: 'driver', number: '8' },
      { id: 'nico-hulkenberg', name: 'Nico Hulkenberg', team: 'Audi F1 Team', type: 'driver', number: '27' },
      { id: 'gabriel-bortoleto', name: 'Gabriel Bortoleto', team: 'Audi F1 Team', type: 'driver', number: '5' },
      { id: 'esteban-ocon', name: 'Esteban Ocon', team: 'Haas', type: 'driver', number: '31' },
      { id: 'oliver-bearman', name: 'Oliver Bearman', team: 'Haas', type: 'driver', number: '87' },
    ];
    
    // Teams
    const mockTeams = [
      { id: 'red-bull', name: 'Red Bull Racing', principal: 'Laurent Mekies', type: 'team' },
      { id: 'ferrari', name: 'Scuderia Ferrari', principal: 'Fred Vasseur', type: 'team' },
      { id: 'mclaren', name: 'McLaren', principal: 'Andrea Stella', type: 'team' },
      { id: 'mercedes', name: 'Mercedes', principal: 'Toto Wolff', type: 'team' },
      { id: 'aston-martin', name: 'Aston Martin', principal: 'Mike Krack', type: 'team' },
      { id: 'alpine', name: 'Alpine', principal: 'Oliver Oakes', type: 'team' },
      { id: 'williams', name: 'Williams', principal: 'James Vowles', type: 'team' },
      { id: 'vcarb', name: 'VCARB', principal: 'Peter Bayer', type: 'team' },
      { id: 'audi', name: 'Audi F1 Team', principal: 'Mattia Binotto', type: 'team' },
      { id: 'haas', name: 'Haas', principal: 'Ayao Komatsu', type: 'team' },
    ];

    // Tracks/Races
    const mockTracks = [
      { id: 'bahrain', name: 'Bahrain International Circuit', location: 'Bahrain', type: 'track' },
      { id: 'jeddah', name: 'Jeddah Corniche Circuit', location: 'Saudi Arabia', type: 'track' },
      { id: 'saopaulo', name: 'Interlagos', location: 'Brazil', type: 'track' },
      { id: 'las-vegas', name: 'Las Vegas Strip Circuit', location: 'USA', type: 'track' },
      { id: 'silverstone', name: 'Silverstone Circuit', location: 'UK', type: 'track' },
      { id: 'monza', name: 'Autodromo Nazionale Monza', location: 'Italy', type: 'track' },
      { id: 'suzuka', name: 'Suzuka International Racing Course', location: 'Japan', type: 'track' },
      { id: 'spa', name: 'Circuit de Spa-Francorchamps', location: 'Belgium', type: 'track' },
      { id: 'monaco', name: 'Circuit de Monaco', location: 'Monaco', type: 'track' },
    ];

    // Paddock Club Members (Users)
    const mockMembers = [
      { id: 'user1', name: 'Alex Albon Superfan', bio: 'Following F1 since 2018', type: 'user' },
      { id: 'user2', name: 'Tifosi forever', bio: 'Forza Ferrari!', type: 'user' },
      { id: 'user3', name: 'Tech Analyst 04', bio: 'Aero updates and telemetry geek', type: 'user' },
    ];

    mockDrivers.forEach(d => {
      if (d.name.toLowerCase().includes(lowerQuery) || d.team.toLowerCase().includes(lowerQuery)) {
        results.push(d);
      }
    });

    mockTeams.forEach(t => {
      if (t.name.toLowerCase().includes(lowerQuery)) {
        results.push(t);
      }
    });

    mockTracks.forEach(t => {
      if (t.name.toLowerCase().includes(lowerQuery) || t.location.toLowerCase().includes(lowerQuery)) {
        results.push(t);
      }
    });

    mockMembers.forEach(m => {
      if (m.name.toLowerCase().includes(lowerQuery)) {
        results.push(m);
      }
    });

    return results.slice(0, 8); // Limit to top 8 results
  };

  const results = getResults();

  const getIcon = (type: string) => {
    switch (type) {
      case 'driver': return <UserIcon className="w-4 h-4 text-emerald-500" />;
      case 'team': return <Users className="w-4 h-4 text-blue-500" />;
      case 'track': return <Flag className="w-4 h-4 text-amber-500" />;
      case 'user': return <UserIcon className="w-4 h-4 text-purple-500" />;
      default: return <Search className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] px-4">
      <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input Header */}
        <div className="flex items-center px-4 py-4 border-b border-zinc-800">
          <Search className="w-5 h-5 text-zinc-400 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search drivers, teams, circuits, paddock members..."
            className="flex-1 bg-transparent border-none text-white text-lg focus:outline-none placeholder:text-zinc-600"
          />
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results Area */}
        {query.trim() === '' ? (
          <div className="p-8 text-center border-t border-zinc-800/50">
            <div className="flex justify-center gap-6 mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-zinc-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Drivers</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-zinc-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Teams</span>
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center">
                  <Flag className="w-6 h-6 text-zinc-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">Tracks</span>
              </div>
            </div>
            <p className="text-zinc-500 text-sm">Start typing to search the unified racing database...</p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length > 0 ? (
              <ul className="space-y-1">
                {results.map((result, idx) => (
                  <li key={`${result.id}-${idx}`}>
                    <button 
                      onClick={() => {
                        setToastMessage(`Navigating to ${result.type}: ${result.name}`);
                        setTimeout(() => {
                          setToastMessage(null);
                          onClose();
                        }, 1500);
                      }}
                      className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-zinc-800 transition-colors text-left group"
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-950 flex items-center justify-center flex-shrink-0 border border-zinc-800">
                        {getIcon(result.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-sm font-bold text-white truncate">{result.name}</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{result.type}</span>
                        </div>
                        <p className="text-xs text-zinc-400 truncate">
                          {result.type === 'driver' && `${result.team} • Car ${result.number}`}
                          {result.type === 'team' && `Principal: ${result.principal}`}
                          {result.type === 'track' && `Location: ${result.location}`}
                          {result.type === 'user' && result.bio}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-zinc-700" />
                </div>
                <h3 className="text-sm font-bold text-white mb-1">No results found</h3>
                <p className="text-xs text-zinc-500">We couldn't find anything matching "{query}"</p>
              </div>
            )}
          </div>
        )}
        
        {/* Footer */}
        <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950 flex justify-between items-center text-xs text-zinc-500 relative">
          {toastMessage && (
            <div className="absolute inset-0 bg-emerald-500/10 backdrop-blur-md border-t border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold tracking-wider z-10">
               {toastMessage}
            </div>
          )}
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-[9px] text-zinc-300 shadow-sm">ESC</kbd> to close</span>
            <span className="flex items-center gap-1"><kbd className="bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-700 font-mono text-[9px] text-zinc-300 shadow-sm">↵</kbd> to select</span>
          </div>
          <span className="font-bold uppercase tracking-wider text-[10px]">Unified Search Engine</span>
        </div>
      </div>
    </div>
  );
}
