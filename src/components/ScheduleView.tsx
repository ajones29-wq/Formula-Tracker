import { useEffect, useState } from 'react';
import { getCurrentSchedule } from '../api';
import { Race } from '../types';
import { Calendar, MapPin, Clock, ChevronRight } from 'lucide-react';
import { RaceResultsModal } from './RaceResultsModal';
import { Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

export function ScheduleView() {
  const [races, setRaces] = useState<Race[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPastRace, setSelectedPastRace] = useState<Race | null>(null);

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

  const NextRaceCard = ({ race }: { race: Race }) => {
    const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
    const isThisWeekend = (raceDate.getTime() - now.getTime()) < 7 * 24 * 60 * 60 * 1000;

    return (
      <div className="mb-8 relative overflow-hidden rounded-2xl border border-red-900/40 bg-gradient-to-br from-red-950/40 to-zinc-950 flex flex-col lg:flex-row">
        <div className="p-6 sm:p-8 flex-1 relative z-10">
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
                <Clock className="w-5 h-5 text-zinc-500" />
                <span className="font-medium">
                  {new Intl.DateTimeFormat('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    timeZoneName: 'short'
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
          </div>
        </div>
        
        <div className="h-64 lg:h-auto lg:w-96 shrink-0 relative lg:border-l border-zinc-800">
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-zinc-950 to-transparent z-10 lg:hidden pointer-events-none" />
          <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent z-10 hidden lg:block pointer-events-none" />
          <Map
            defaultCenter={{
              lat: parseFloat(race.Circuit.Location.lat),
              lng: parseFloat(race.Circuit.Location.long)
            }}
            defaultZoom={13}
            mapId="CIRCUIT_MAP"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            disableDefaultUI={true}
            style={{width: '100%', height: '100%'}}
          >
            <AdvancedMarker 
              position={{
                lat: parseFloat(race.Circuit.Location.lat),
                lng: parseFloat(race.Circuit.Location.long)
              }}
            >
              <Pin background="#dc2626" glyphColor="#fff" borderColor="#991b1b" />
            </AdvancedMarker>
          </Map>
        </div>
      </div>
    );
  };

  const RaceList = ({ races, title, isPast }: { races: Race[], title: string, isPast: boolean }) => (
    <div className="space-y-4">
      <h4 className="text-lg font-bold text-zinc-300 uppercase italic tracking-tight border-b border-zinc-800 pb-2">
        {title}
      </h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {races.map(race => {
          const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
          
          return (
            <div 
              key={race.round}
              onClick={() => isPast ? setSelectedPastRace(race) : null}
              className={`bg-zinc-900/40 border border-zinc-800 rounded-xl p-4 transition-colors relative group ${isPast ? 'cursor-pointer hover:bg-zinc-800/60 hover:border-zinc-600' : 'hover:border-zinc-700'}`}
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

              {isPast && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="w-6 h-6 text-zinc-400" />
                </div>
              )}
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
        {upcoming.length > 0 && <NextRaceCard race={upcoming[0]} />}
        
        {upcoming.length > 1 && (
          <RaceList races={upcoming.slice(1)} title="Upcoming Races" isPast={false} />
        )}
        
        <RaceList races={past} title="Completed Races" isPast={true} />
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
