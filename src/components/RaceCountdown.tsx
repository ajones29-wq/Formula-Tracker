import { useState, useEffect } from 'react';
import { Calendar, MapPin, Flag, Clock, Globe } from 'lucide-react';
import { getCurrentSchedule } from '../api';
import { Race } from '../types';

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

export function RaceCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [timeZone, setTimeZone] = useState<'track' | 'syd'>('track');
  const [nextRace, setNextRace] = useState<Race | null>(null);

  useEffect(() => {
    let mounted = true;
    getCurrentSchedule().then((races) => {
      if (!mounted) return;
      const now = new Date();
      const upcoming = races.filter(race => {
        const raceDate = new Date(`${race.date}T${race.time || '00:00:00Z'}`);
        return raceDate >= now;
      });
      if (upcoming.length > 0) {
        setNextRace(upcoming[0]);
      }
    }).catch(console.error);

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (!nextRace) return;

    const nextRaceDate = new Date(`${nextRace.date}T${nextRace.time || '00:00:00Z'}`);

    const calculateTimeLeft = () => {
      const difference = +nextRaceDate - +new Date();
      
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60)
        });
      } else {
        setTimeLeft(null);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [nextRace]);

  const formatTime = (date: Date, circuitId: string) => {
    const trackTz = timeZoneMap[circuitId] || 'UTC';
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: timeZone === 'track' ? trackTz : 'Australia/Sydney',
    }).format(date);
  };

  if (!nextRace || !timeLeft) {
    return null; // Don't show if loading or no next race
  }

  const schedule = getRaceSchedule(nextRace);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 sm:p-6 mb-8 flex flex-col relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
          <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
            <Flag className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1 block">Next Race Countdown</span>
            <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tight">{nextRace.raceName}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {nextRace.Circuit.circuitName}, {nextRace.Circuit.Location.country}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 relative z-10 w-full md:w-auto justify-center md:justify-end">
          <div className="flex flex-col items-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black italic text-white shadow-inner">
              {timeLeft.days.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Days</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black italic text-white shadow-inner">
              {timeLeft.hours.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Hours</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black italic text-white shadow-inner">
              {timeLeft.minutes.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Mins</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center text-2xl sm:text-3xl font-black italic text-red-500 shadow-inner">
              {timeLeft.seconds.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mt-2">Secs</span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/50 pt-6 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-zinc-500" />
            Session Schedule
          </h3>
          <div className="flex bg-zinc-950 border border-zinc-800 rounded-lg p-1 self-start sm:self-auto">
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
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {schedule.map((session, index) => (
            <div key={index} className="bg-zinc-950/50 border border-zinc-800 rounded-xl p-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 block mb-1">
                {session.name}
              </span>
              <div className="text-sm font-medium text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {formatTime(session.time, nextRace.Circuit.circuitId)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
