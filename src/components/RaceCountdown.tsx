import { useState, useEffect } from 'react';
import { Calendar, MapPin, Flag, ChevronRight } from 'lucide-react';

export function RaceCountdown() {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  // Example: Next race is Austrian Grand Prix, let's say 2026-06-28T13:00:00Z
  const nextRaceDate = new Date('2026-06-28T13:00:00Z');
  const raceName = "Austrian Grand Prix";
  const location = "Red Bull Ring, Spielberg";

  useEffect(() => {
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
  }, []);

  if (!timeLeft) {
    return null; // Or show "Race is Live!"
  }

  return (
    <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-4 sm:p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex items-center gap-6 relative z-10 w-full md:w-auto">
        <div className="w-16 h-16 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center flex-shrink-0">
          <Flag className="w-8 h-8 text-red-500" />
        </div>
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-red-500 mb-1 block">Next Race</span>
          <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tight">{raceName}</h2>
          <div className="flex items-center gap-3 mt-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {location}</span>
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
  );
}
