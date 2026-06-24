import { useEffect, useState } from 'react';
import { getCurrentSchedule } from '../api';
import { Race } from '../types';
import { Calendar, MapPin, Clock, ChevronRight, Globe } from 'lucide-react';
import { RaceResultsModal } from './RaceResultsModal';

const timeZoneMap: Record<string, string> = {
  'bahrain': 'Asia/Bahrain',
  'jeddah': 'Asia/Riyadh',
  'albert_park': 'Australia/Melbourne',
  'suzuka': 'Asia/Tokyo',
  'shanghai': 'Asia/Shanghai',
  'miami': 'America/New_York',
  'imola': 'Europe/Rome',
  'monaco': 'Europe/Monaco',
  'villeneuve': 'America/Montreal',
  'catalunya': 'Europe/Madrid',
  'red_bull_ring': 'Europe/Vienna',
  'silverstone': 'Europe/London',
  'spa': 'Europe/Brussels',
  'hungaroring': 'Europe/Budapest',
  'zandvoort': 'Europe/Amsterdam',
  'monza': 'Europe/Rome',
  'baku': 'Asia/Baku',
  'marina_bay': 'Asia/Singapore',
  'americas': 'America/Chicago',
  'rodriguez': 'America/Mexico_City',
  'interlagos': 'America/Sao_Paulo',
  'vegas': 'America/Los_Angeles',
  'losail': 'Asia/Qatar',
  'yas_marina': 'Asia/Dubai',
};

const getRaceSchedule = (race: Race) => {
  const schedule = [];
  if (race.FirstPractice) {
    schedule.push({ name: "Practice 1", time: new Date(`${race.FirstPractice.date}T${race.FirstPractice.time || '00:00:00Z'}`) });
  }
  if (race.SecondPractice) {
    schedule.push({ name: "Practice 2", time: new Date(`${race.SecondPractice.date}T${race.SecondPractice.time || '00:00:00Z'}`) });
  }
  if (race.ThirdPractice) {
    schedule.push({ name: "Practice 3", time: new Date(`${race.ThirdPractice.date}T${race.ThirdPractice.time || '00:00:00Z'}`) });
  }
  if (race.Sprint) {
    schedule.push({ name: "Sprint", time: new Date(`${race.Sprint.date}T${race.Sprint.time || '00:00:00Z'}`) });
  }
  if (race.Qualifying) {
    schedule.push({ name: "Qualifying", time: new Date(`${race.Qualifying.date}T${race.Qualifying.time || '00:00:00Z'}`) });
  }
  
  schedule.push({ name: "Race", time: new Date(`${race.date}T${race.time || '00:00:00Z'}`) });
  
  return schedule.sort((a, b) => a.time.getTime() - b.time.getTime());
};

export function ScheduleView() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPastRace, setSelectedPastRace] = useState<Race | null>(null);
  const [timeZone, setTimeZone] = useState<'track' | 'syd'>('track');

  useEffect(() => {
    let mounted = true;
    getCurrentSchedule()
      .then((data) => {
        if (mounted) {
          setRaces(data);
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
        Failed to load schedule: {error}
      </div>
    );
  }

  const now = new Date();
  
  // Separate into upcoming and past
  const upcoming = races.filter(race => {
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
    return raceDate >= now;
  });

  const past = races.filter(race => {
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
    return raceDate < now;
  }).reverse(); // Most recent past first

  const formatSessionTime = (date: Date, circuitId: string) => {
    const trackTz = timeZoneMap[circuitId] || 'UTC';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timeZone === 'track' ? trackTz : 'Australia/Sydney',
    }).format(date);
  };

  const SessionScheduleDisplay = ({ race }: { race: Race }) => {
    const schedule = getRaceSchedule(race);
    if (schedule.length === 0) return null;

    return (
      <div className="mt-4 pt-4 border-t border-zinc-800/50">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {schedule.map((session, index) => (
            <div key={index} className="bg-zinc-950/50 border border-zinc-800/80 rounded-xl p-3 flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">
                {session.name}
              </span>
              <div className="text-sm font-medium text-zinc-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {formatSessionTime(session.time, race.Circuit.circuitId)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const NextRaceCard = ({ race }: { race: Race }) => {
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
    const isThisWeekend = (raceDate.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000;

    return (
      <div className="mb-8 relative overflow-hidden rounded-2xl border border-red-900/40 bg-gradient-to-br from-red-950/40 to-zinc-950 p-6 sm:p-8">
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          <Calendar className="w-48 h-48" />
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              Next Race
            </span>
            {isThisWeekend && (
              <span className="flex items-center gap-2 text-xs font-medium text-red-400">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                Race Week
              </span>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-red-500 font-medium tracking-wide uppercase text-sm mb-1">
                Round {race.round}
              </p>
              <h3 className="text-3xl sm:text-4xl font-extrabold italic text-white uppercase tracking-tight">
                {race.raceName}
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-8 pt-4">
              <div className="flex items-center gap-2 text-zinc-300">
                <Calendar className="w-5 h-5 text-zinc-500" />
                <span className="font-medium">
                  {new Intl.DateTimeFormat('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                  }).format(raceDate)}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-zinc-300">
                <MapPin className="w-5 h-5 text-zinc-500" />
                <span className="font-medium">
                  {race.Circuit.circuitName}, {race.Circuit.Location.country}
                </span>
              </div>
            </div>
            
            <SessionScheduleDisplay race={race} />
          </div>
        </div>
      </div>
    );
  };

  const UpcomingRaceList = ({ races }: { races: Race[] }) => (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-zinc-300 uppercase italic tracking-tight border-b border-zinc-800 pb-2">
        Upcoming Races
      </h4>
      <div className="grid gap-6">
        {races.map(race => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          
          return (
            <div 
              key={race.round}
              className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 hover:border-zinc-700 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs text-zinc-500 font-medium tracking-wider uppercase mb-1">
                    Round {race.round}
                  </div>
                  <h5 className="font-bold text-zinc-100 text-lg line-clamp-1 leading-tight">
                    {race.raceName}
                  </h5>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-zinc-500" />
                    <span>
                      {new Intl.DateTimeFormat('en-US', {
                        month: 'short',
                        day: 'numeric'
                      }).format(raceDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-zinc-500" />
                    <span>
                      {race.Circuit.Location.country}
                    </span>
                  </div>
                </div>
              </div>
              
              <SessionScheduleDisplay race={race} />
            </div>
          );
        })}
      </div>
      {races.length === 0 && (
        <p className="text-zinc-500 text-sm italic">No more upcoming races.</p>
      )}
    </div>
  );

  const PastRaceList = ({ races }: { races: Race[] }) => (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-zinc-300 uppercase italic tracking-tight border-b border-zinc-800 pb-2 mt-12">
        Completed Races
      </h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {races.map(race => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          
          return (
            <div 
              key={race.round}
              onClick={() => setSelectedPastRace(race)}
              className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 transition-colors relative group cursor-pointer hover:bg-zinc-800/60 hover:border-zinc-600"
            >
              <div className="text-xs text-zinc-500 font-medium tracking-wider uppercase mb-2">
                Round {race.round}
              </div>
              <h5 className="font-bold text-zinc-100 mb-3 line-clamp-1 leading-tight">
                {race.raceName}
              </h5>
              
              <div className="space-y-2 text-sm text-zinc-400">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-zinc-500" />
                  <span>
                    {new Intl.DateTimeFormat('en-US', {
                      month: 'short',
                      day: 'numeric'
                    }).format(raceDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-zinc-500" />
                  <span className="truncate" title={race.Circuit.Location.country}>
                    {race.Circuit.Location.country}
                  </span>
                </div>
              </div>

              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-6 h-6 text-zinc-400" />
              </div>
            </div>
          );
        })}
      </div>
      {races.length === 0 && (
        <p className="text-zinc-500 text-sm italic">No races found.</p>
      )}
    </div>
  );

  return (
    <>
      <div className="space-y-8">
        <div className="flex justify-end mb-4">
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1">
            <button
              onClick={() => setTimeZone('track')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-colors ${
                timeZone === 'track' 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" /> Track Time
            </button>
            <button
              onClick={() => setTimeZone('syd')}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md flex items-center gap-1.5 transition-colors ${
                timeZone === 'syd' 
                  ? 'bg-zinc-800 text-white' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> SYD Time
            </button>
          </div>
        </div>

        {upcoming.length > 0 && <NextRaceCard race={upcoming[0]} />}
        
        {upcoming.length > 1 && (
          <UpcomingRaceList races={upcoming.slice(1)} />
        )}
        
        <PastRaceList races={past} />
      </div>

      {selectedPastRace && (
        <RaceResultsModal 
          race={selectedPastRace} 
          onClose={() => setSelectedPastRace(null)} 
        />
      )}
    </>
  );
}
