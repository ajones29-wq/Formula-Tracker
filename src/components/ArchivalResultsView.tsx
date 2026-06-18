import { useEffect, useState } from 'react';
import { getScheduleByYear, getRaceResults, getDriverStandingsByYear, getConstructorStandingsByYear } from '../api';
import { Race, Driver, Constructor, DriverStanding, ConstructorStanding } from '../types';
import { Timer, CheckCircle2, AlertCircle, Archive, ChevronDown, Loader2, Trophy, Flag, Users } from 'lucide-react';
import { DriverProfileModal } from './DriverProfileModal';
import { ConstructorProfileModal } from './ConstructorProfileModal';

export function ArchivalResultsView() {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1950 + 1 }, (_, i) => (currentYear - i).toString());

  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [activeTab, setActiveTab] = useState<'race' | 'drivers' | 'constructors'>('race');
  const [schedule, setSchedule] = useState<Race[]>([]);
  const [selectedRound, setSelectedRound] = useState<string>('1');
  
  const [race, setRace] = useState<Race | null>(null);
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loadingRace, setLoadingRace] = useState(false);
  const [loadingStandings, setLoadingStandings] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [selectedConstructor, setSelectedConstructor] = useState<Constructor | null>(null);

  // Fetch Schedule and Standings when Year changes
  useEffect(() => {
    let mounted = true;
    setLoadingSchedule(true);
    setLoadingStandings(true);
    setSchedule([]);
    setDriverStandings([]);
    setConstructorStandings([]);
    setError(null);

    Promise.all([
      getScheduleByYear(selectedYear),
      getDriverStandingsByYear(selectedYear),
      getConstructorStandingsByYear(selectedYear)
    ])
      .then(([scheduleData, driverData, constructorData]) => {
        if (mounted) {
          setSchedule(scheduleData);
          setDriverStandings(driverData);
          setConstructorStandings(constructorData);
          if (scheduleData.length > 0) {
            setSelectedRound(scheduleData[0].round);
          }
          setLoadingSchedule(false);
          setLoadingStandings(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(`Failed to load data for ${selectedYear}: ${err.message}`);
          setLoadingSchedule(false);
          setLoadingStandings(false);
        }
      });

    return () => { mounted = false; };
  }, [selectedYear]);

  // Fetch Results when Year or Round changes
  useEffect(() => {
    if (!selectedYear || !selectedRound || schedule.length === 0) return;
    
    let mounted = true;
    setLoadingRace(true);
    setError(null);
    setRace(null);

    getRaceResults(selectedYear, selectedRound)
      .then((data) => {
        if (mounted) {
          setRace(data);
          setLoadingRace(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(`Failed to load results: ${err.message}`);
          setLoadingRace(false);
        }
      });

    return () => { mounted = false; };
  }, [selectedYear, selectedRound, schedule]);

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-red-600/10 rounded-lg flex items-center justify-center text-red-500 border border-red-500/20">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold uppercase tracking-widest text-white italic">Historical Archive</h3>
            <p className="text-xs text-zinc-400">Explore F1 race results back to 1950</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="flex-1 relative">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">Season</label>
            <div className="relative">
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                disabled={loadingSchedule}
              >
                {years.map(year => (
                  <option key={year} value={year}>{year} Season</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="flex-[2] relative">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 ml-1 mb-1 block">Grand Prix</label>
            <div className="relative">
              <select
                value={selectedRound}
                onChange={(e) => setSelectedRound(e.target.value)}
                className="w-full appearance-none bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors disabled:opacity-50"
                disabled={loadingSchedule || schedule.length === 0 || activeTab !== 'race'}
              >
                {schedule.map(raceItem => (
                  <option key={raceItem.round} value={raceItem.round}>
                    Round {raceItem.round} — {raceItem.raceName}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-zinc-500">
                {loadingSchedule ? <Loader2 className="w-4 h-4 animate-spin" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </div>
        </div>

        <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-lg max-w-2xl">
          <button
            onClick={() => setActiveTab('race')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
              activeTab === 'race' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Race Results
          </button>
          <button
            onClick={() => setActiveTab('drivers')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
              activeTab === 'drivers' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Drivers
          </button>
          <button
            onClick={() => setActiveTab('constructors')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-md transition-colors ${
              activeTab === 'constructors' ? 'bg-red-600 text-white' : 'text-zinc-500 hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Constructors
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-4 bg-red-950/30 text-red-400 rounded-lg border border-red-900/50 flex flex-col items-center justify-center min-h-[200px] gap-3">
          <AlertCircle className="w-8 h-8 opacity-50" />
          <p>{error}</p>
        </div>
      ) : activeTab === 'race' ? (
        loadingRace ? (
          <div className="flex items-center justify-center p-12 min-h-[300px]">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : race ? (
          <>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
              <div>
                <p className="text-red-500 font-medium tracking-wide uppercase text-sm mb-1">
                  Round {race.round} — {selectedYear} Season
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
                          key={`${result.position}-${result.Driver.driverId}`}
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
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[300px] text-zinc-500 italic">
            No results data available.
          </div>
        )
      ) : activeTab === 'drivers' || activeTab === 'constructors' ? (
        loadingStandings ? (
          <div className="flex items-center justify-center p-12 min-h-[300px]">
            <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 overflow-hidden backdrop-blur-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-zinc-950/50 text-zinc-400 border-b border-zinc-800/80">
                  <tr>
                    <th className="px-4 py-3 font-medium w-16 text-center">Pos</th>
                    <th className="px-4 py-3 font-medium">{activeTab === 'drivers' ? 'Driver' : 'Constructor'}</th>
                    {activeTab === 'drivers' && <th className="px-4 py-3 font-medium hidden sm:table-cell">Constructor</th>}
                    <th className="px-4 py-3 font-medium text-right">Pts</th>
                    <th className="px-4 py-3 font-medium text-right w-16">Wins</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {activeTab === 'drivers' ? driverStandings.map((standing) => {
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
                            {standing.position}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div>
                              <p className="font-semibold text-zinc-100">
                                <button 
                                  onClick={() => setSelectedDriver(standing.Driver)} 
                                  className="hover:underline text-left"
                                >
                                  {standing.Driver.givenName} <span className="uppercase text-white relative">{standing.Driver.familyName}</span>
                                </button>
                              </p>
                              <p className="text-xs text-zinc-500 sm:hidden">
                                <button 
                                  onClick={() => standing.Constructors[0] && setSelectedConstructor(standing.Constructors[0])} 
                                  className="hover:underline text-left"
                                >
                                  {standing.Constructors[0]?.name}
                                </button>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell text-zinc-400">
                          <button 
                            onClick={() => standing.Constructors[0] && setSelectedConstructor(standing.Constructors[0])} 
                            className="hover:underline text-left"
                          >
                            {standing.Constructors[0]?.name}
                          </button>
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
                            {standing.position}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div>
                              <p className="font-semibold text-zinc-100 text-lg">
                                <button 
                                  onClick={() => setSelectedConstructor(standing.Constructor)} 
                                  className="hover:underline text-left"
                                >
                                  {standing.Constructor.name}
                                </button>
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
        )
      ) : null}

      {selectedDriver && (
        <DriverProfileModal driver={selectedDriver} onClose={() => setSelectedDriver(null)} />
      )}

      {selectedConstructor && (
        <ConstructorProfileModal constructorData={selectedConstructor} onClose={() => setSelectedConstructor(null)} />
      )}
    </div>
  );
}
