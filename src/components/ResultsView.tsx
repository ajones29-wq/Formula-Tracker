import { useEffect, useState } from 'react';
import { getLastRaceResults } from '../api';
import { Race } from '../types';
import { Timer, CheckCircle2, AlertCircle } from 'lucide-react';

export function ResultsView() {
  const [race, setRace] = useState<Race | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getLastRaceResults()
      .then((data) => {
        if (mounted) {
          setRace(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      });
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !race) {
    return (
      <div className="p-4 bg-red-950/30 text-red-400 rounded-lg border border-red-900/50 flex flex-col items-center justify-center min-h-[200px] gap-3">
        <AlertCircle className="w-8 h-8 opacity-50" />
        <p>Failed to load latest race results. {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <p className="text-red-500 font-medium tracking-wide uppercase text-sm mb-1">
            Latest Result — Round {race.round}
          </p>
          <h2 className="text-3xl font-extrabold italic tracking-tight text-white uppercase">
            {race.raceName}
          </h2>
        </div>
        <div className="text-left sm:text-right">
          <p className="text-zinc-400 text-sm">{race.Circuit.circuitName}</p>
          <p className="text-zinc-500 text-sm">
            {new Intl.DateTimeFormat('en-US', {
              year: 'numeric', month: 'long', day: 'numeric'
            }).format(new Date(race.date))}
          </p>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800/80">
              <tr>
                <th className="px-4 py-3 font-medium w-16 text-center">Pos</th>
                <th className="px-4 py-3 font-medium">Driver</th>
                <th className="px-4 py-3 font-medium hidden sm:table-cell">Constructor</th>
                <th className="px-4 py-3 font-medium text-right">Time/Status</th>
                <th className="px-4 py-3 font-medium text-right w-16">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {race.Results?.map((result) => {
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
                            <a href={result.Driver.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {result.Driver.givenName} <span className="uppercase text-white relative">{result.Driver.familyName}</span>
                            </a>
                          </p>
                          <p className="text-xs text-zinc-500 sm:hidden">
                            <a href={result.Constructor.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {result.Constructor.name}
                            </a>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-zinc-400">
                      <a href={result.Constructor.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {result.Constructor.name}
                      </a>
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
    </div>
  );
}
