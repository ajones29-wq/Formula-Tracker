import { useEffect } from 'react';
import { X, User, Flag, Calendar, Hash } from 'lucide-react';
import { Driver } from '../types';

interface DriverProfileModalProps {
  driver: Driver;
  onClose: () => void;
}

export function DriverProfileModal({ driver, onClose }: DriverProfileModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { 
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 opacity-100 transition-opacity">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-zinc-800/80 bg-zinc-900/30 rounded-t-2xl">
          <div className="flex gap-4 items-center">
            <div className="w-16 h-16 bg-red-600/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-500">
              <User className="w-8 h-8" />
            </div>
            <div>
              <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs mb-1">
                Driver Profile
              </p>
              <h2 className="text-2xl font-extrabold italic tracking-tight text-white uppercase">
                {driver.givenName} {driver.familyName}
              </h2>
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
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <Hash className="w-4 h-4" />
                Permanent Number
              </div>
              <p className="text-2xl font-mono text-white font-bold">{driver.permanentNumber || 'N/A'}</p>
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80">
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-2">
                <span className="font-mono bg-zinc-800 px-1 rounded">ID</span>
                Abbreviation
              </div>
              <p className="text-2xl font-mono text-white font-bold uppercase">{driver.code || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-4 bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Nationality</p>
                <p className="text-white font-medium">{driver.nationality}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Date of Birth</p>
                <p className="text-white font-medium">
                  {new Intl.DateTimeFormat('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                  }).format(new Date(driver.dateOfBirth))}
                </p>
              </div>
            </div>
          </div>
          
          <a
            href={driver.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-black text-center text-sm font-bold uppercase tracking-wider rounded-xl transition-colors block"
          >
            Open Wikipedia Profile
          </a>
        </div>
      </div>
    </div>
  );
}
