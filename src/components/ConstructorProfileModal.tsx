import { useEffect } from 'react';
import { X, Users, Flag, Building2, User } from 'lucide-react';
import { Constructor } from '../types';

interface ConstructorProfileModalProps {
  constructorData: Constructor;
  onClose: () => void;
}

const TEAM_PRINCIPALS: Record<string, string> = {
  'alpine': 'Oliver Oakes',
  'aston_martin': 'Mike Krack',
  'audi': 'Jonathan Wheatley',
  'cadillac': 'To be announced',
  'ferrari': 'Frédéric Vasseur',
  'haas': 'Ayao Komatsu',
  'mclaren': 'Andrea Stella',
  'mercedes': 'Toto Wolff',
  'rb': 'Laurent Mekies',
  'red_bull': 'Christian Horner',
  'williams': 'James Vowles'
};

const TEAM_URLS: Record<string, string> = {
  'alpine': 'alpine',
  'aston_martin': 'aston-martin',
  'audi': 'audi',
  'cadillac': 'cadillac',
  'ferrari': 'ferrari',
  'haas': 'haas',
  'mclaren': 'mclaren',
  'mercedes': 'mercedes',
  'rb': 'racing-bulls',
  'red_bull': 'red-bull-racing',
  'williams': 'williams'
};

export function ConstructorProfileModal({ constructorData: team, onClose }: ConstructorProfileModalProps) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { 
      document.body.style.overflow = 'unset';
    };
  }, []);

  const teamPrincipal = TEAM_PRINCIPALS[team.constructorId] || 'Unknown';

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
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-zinc-500 font-bold tracking-widest uppercase text-xs mb-1">
                Constructor Profile
              </p>
              <h2 className="text-2xl font-extrabold italic tracking-tight text-white gap-2 uppercase">
                {team.name}
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
          <div className="space-y-4 bg-zinc-900/30 p-5 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                <Flag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Nationality</p>
                <p className="text-white font-medium">{team.nationality}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-semibold tracking-wider">Team Principal</p>
                <p className="text-white font-medium">{teamPrincipal}</p>
              </div>
            </div>
          </div>
          
          <a
            href={`https://www.formula1.com/en/teams/${TEAM_URLS[team.constructorId] || team.constructorId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 bg-zinc-100 hover:bg-white text-black text-center text-sm font-bold uppercase tracking-wider rounded-xl transition-colors block"
          >
            Open Official F1 Profile
          </a>
        </div>
      </div>
    </div>
  );
}
