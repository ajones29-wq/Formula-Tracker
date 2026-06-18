import { useEffect, useState } from 'react';
import { getCurrentDriverStandings, getCurrentConstructorStandings } from '../api';
import { DriverStanding, ConstructorStanding } from '../types';
import { Trophy, Users, User } from 'lucide-react';

type StandingsType = 'drivers' | 'constructors';

export function StandingsView() {
  const [type, setType] = useState<StandingsType>('drivers');
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    
    Promise.all([
      getCurrentDriverStandings(),
      getCurrentConstructorStandings()
    ])
      .then(([drivers, constructors]) => {
        if (mounted) {
          setDriverStandings(drivers);
          setConstructorStandings(constructors);
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

  if (error) {
    return (
      <div className="p-4 bg-red-950/30 text-red-400 rounded-lg border border-red-900/50">
        Failed to load standings: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold italic tracking-tight text-white uppercase flex items-center gap-3">
          <Trophy className="w-6 h-6 text-yellow-500" />
          {type === 'drivers' ? 'Driver Standings' : 'Constructor Standings'}
        </h2>
        
        <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-lg">
          <button
            onClick={() => setType('drivers')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider rounded-md transition-colors ${
              type === 'drivers' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            Drivers
          </button>
          <button
            onClick={() => setType('constructors')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold uppercase tracking-wider rounded-md transition-colors ${
              type === 'constructors' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Constructors
          </button>
        </div>
      </div>

      <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800/80">
              <tr>
                <th className="px-4 py-3 font-medium w-16 text-center">Pos</th>
                <th className="px-4 py-3 font-medium">{type === 'drivers' ? 'Driver' : 'Constructor'}</th>
                {type === 'drivers' && <th className="px-4 py-3 font-medium hidden sm:table-cell">Constructor</th>}
                <th className="px-4 py-3 font-medium text-right">Pts</th>
                <th className="px-4 py-3 font-medium text-right w-16">Wins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {type === 'drivers' ? driverStandings.map((standing) => {
                const pos = parseInt(standing.position);
                
                return (
                  <tr 
                    key={standing.Driver.driverId}
                    className="hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        pos === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        pos === 2 ? 'bg-zinc-300/10 text-zinc-300 border border-zinc-300/20' :
                        pos === 3 ? 'bg-amber-700/10 text-amber-600 border border-amber-700/20' :
                        'text-zinc-500'
                      }`}>
                        {pos}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div>
                          <p className="font-semibold text-zinc-100">
                            <a href={standing.Driver.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {standing.Driver.givenName} <span className="uppercase text-white relative">{standing.Driver.familyName}</span>
                            </a>
                          </p>
                          <p className="text-xs text-zinc-500 sm:hidden">
                            <a href={standing.Constructors[0]?.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {standing.Constructors[0]?.name}
                            </a>
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-zinc-400">
                      <a href={standing.Constructors[0]?.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                        {standing.Constructors[0]?.name}
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-bold text-lg text-white">
                        {standing.points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500 font-mono">
                      {standing.wins}
                    </td>
                  </tr>
                );
              }) : constructorStandings.map((standing) => {
                const pos = parseInt(standing.position);
                
                return (
                  <tr 
                    key={standing.Constructor.constructorId}
                    className="hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold ${
                        pos === 1 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' :
                        pos === 2 ? 'bg-zinc-300/10 text-zinc-300 border border-zinc-300/20' :
                        pos === 3 ? 'bg-amber-700/10 text-amber-600 border border-amber-700/20' :
                        'text-zinc-500'
                      }`}>
                        {pos}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div>
                          <p className="font-semibold text-zinc-100 text-lg">
                            <a href={standing.Constructor.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                              {standing.Constructor.name}
                            </a>
                          </p>
                          <p className="text-xs text-zinc-500">
                            {standing.Constructor.nationality}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-mono font-bold text-lg text-white">
                        {standing.points}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-zinc-500 font-mono">
                      {standing.wins}
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
