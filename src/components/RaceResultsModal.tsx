import { useEffect, useState } from 'react';
import { X, Calendar, MapPin, Trophy, AlertCircle, Timer } from 'lucide-react';
import { getRaceResults } from '../api';
import { Race, Driver, Constructor } from '../types';
import { DriverProfileModal } from './DriverProfileModal';
import { ConstructorProfileModal } from './ConstructorProfileModal';

interface RaceResultsModalProps {
  race: Race;
  onClose: () => void;
}

export function RaceResultsModal({ race, onClose }: RaceResultsModalProps) {
  const [raceResults, setRaceResults] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedConstructor, setSelectedConstructor] = useState<Constructor | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getRaceResults(race.season, race.round)
      .then((data) => {
        if (mounted) {
          setRaceResults(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });
      
    // Prevent scrolling behind modal
    document.body.style.overflow = 'hidden';
    return () => { 
      mounted = false; 
      document.body.style.overflow = 'unset';
    };
  }, [race]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-800/80 bg-zinc-900/30 rounded-t-2xl shrink-0">
          <div>
            <p className="text-red-500 font-bold tracking-widest uppercase text-xs mb-1.5 flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5" />
              Round {race.round} Results
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold italic tracking-tight text-white uppercase">
              {race.raceName}
            </h2>
            <div className="flex flex-wrap items-center gap-3 sm:gap-6 mt-3 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-4 h-4 text-zinc-500" />
                {new Intl.DateTimeFormat('en-US', {
                  month: 'long', day: 'numeric', year: 'numeric'
                }).format(new Date(race.date))}
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <MapPin className="w-4 h-4 text-zinc-500" />
                {race.Circuit.circuitName}
              </span>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors bg-zinc-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 no-scrollbar flex flex-col">
          <div className="p-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-zinc-500 text-sm font-medium tracking-wider uppercase">Loading Results</p>
              </div>
            ) : error || !raceResults || !raceResults.Results ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3 text-red-400 bg-red-950/20 rounded-xl border border-red-900/30">
                <AlertCircle className="w-8 h-8 opacity-50" />
                <p>Failed to load race results: {error || 'No results available yet'}</p>
              </div>
            ) : (
              <div className="bg-black/50 rounded-xl border border-zinc-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-zinc-900 text-zinc-400 border-b border-zinc-800/80">
                    <tr>
                      <th className="px-4 py-3 font-medium w-16 text-center">Pos</th>
                      <th className="px-4 py-3 font-medium">Driver</th>
                      <th className="px-4 py-3 font-medium hidden sm:table-cell">Constructor</th>
                      <th className="px-4 py-3 font-medium text-right">Time/Status</th>
                      <th className="px-4 py-3 font-medium text-right w-16">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {raceResults.Results.map((result) => {
                      const pos = parseInt(result.position);
                      const isFinished = result.status === 'Finished' || result.status.includes('+');
                      
                      return (
                        <tr 
                          key={result.number}
                          className="hover:bg-zinc-800/30 transition-colors group"
                        >
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                              pos === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                              pos === 2 ? 'bg-zinc-300/10 text-zinc-300 border border-zinc-300/20' :
                              pos === 3 ? 'bg-amber-700/10 text-amber-600 border border-amber-700/20' :
                              'text-zinc-500'
                            }`}>
                              {result.positionText}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-6 w-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                              <div>
                                <p className="font-semibold text-zinc-100">
                                  <button 
                                    onClick={() => setSelectedDriver(result.Driver)} 
                                    className="hover:underline text-left"
                                  >
                                    {result.Driver.givenName} <span className="uppercase text-white relative">{result.Driver.familyName}</span>
                                  </button>
                                </p>
                                <p className="text-xs text-zinc-500 sm:hidden">
                                  <button 
                                    onClick={() => setSelectedConstructor(result.Constructor)} 
                                    className="hover:underline text-left"
                                  >
                                    {result.Constructor.name}
                                  </button>
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 hidden sm:table-cell text-zinc-400">
                            <button 
                              onClick={() => setSelectedConstructor(result.Constructor)} 
                              className="hover:underline text-left"
                            >
                              {result.Constructor.name}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {result.Time ? (
                              <span className="font-mono text-zinc-300">
                                {result.Time.time}
                              </span>
                            ) : (
                              <span className="text-zinc-500 flex items-center justify-end gap-1.5 text-xs uppercase tracking-wider">
                                {!isFinished && <AlertCircle className="w-3.5 h-3.5 text-red-400/70" />}
                                {result.status}
                              </span>
                            )}
                            {result.FastestLap?.rank === "1" && (
                              <div className="text-[10px] text-purple-400 uppercase tracking-widest mt-0.5 flex items-center justify-end gap-1">
                                <Timer className="w-3 h-3" /> Fastest Lap
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`font-mono font-bold ${parseInt(result.points) > 0 ? 'text-white' : 'text-zinc-600'}`}>
                              {result.points}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      {selectedDriver && (
        <DriverProfileModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
      )}

      {selectedConstructor && (
        <ConstructorProfileModal constructorData={selectedConstructor} onClose={() => setSelectedConstructor(null)} />
      )}
    </div>
  );
}
