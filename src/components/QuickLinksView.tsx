import { Globe, MonitorPlay, ExternalLink, Link, Trophy, Gamepad2, Unlock, Github } from 'lucide-react';
import { motion } from 'motion/react';

export function QuickLinksView() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-accent-600/20 p-3 rounded-lg">
          <Link className="w-6 h-6 text-accent-500" />
        </div>
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tight">Quick Links</h2>
          <p className="text-sm text-zinc-400 font-medium">Official Formula 1 resources</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href="https://www.formula1.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-accent-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-accent-500/10 flex items-center gap-6"
        >
          <div className="bg-zinc-950 p-4 rounded-full text-zinc-400 group-hover:text-accent-500 transition-colors">
            <Globe className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-1 group-hover:text-accent-500 transition-colors flex items-center gap-2">
              F1.com
              <ExternalLink className="w-4 h-4 opacity-50" />
            </h3>
            <p className="text-sm text-zinc-400">Official Formula 1 website for news, standings, and information.</p>
          </div>
        </a>

        <a
          href="https://f1tv.formula1.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-accent-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-accent-500/10 flex items-center gap-6"
        >
          <div className="bg-zinc-950 p-4 rounded-full text-zinc-400 group-hover:text-accent-500 transition-colors">
            <MonitorPlay className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-1 group-hover:text-accent-500 transition-colors flex items-center gap-2">
              F1 TV
              <ExternalLink className="w-4 h-4 opacity-50" />
            </h3>
            <p className="text-sm text-zinc-400">Watch live races, replays, and exclusive Formula 1 content.</p>
          </div>
        </a>

        <a
          href="https://fantasy.formula1.com/en/"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-accent-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-accent-500/10 flex items-center gap-6"
        >
          <div className="bg-zinc-950 p-4 rounded-full text-zinc-400 group-hover:text-accent-500 transition-colors">
            <Trophy className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-1 group-hover:text-accent-500 transition-colors flex items-center gap-2">
              F1 Fantasy
              <ExternalLink className="w-4 h-4 opacity-50" />
            </h3>
            <p className="text-sm text-zinc-400">Build your team, manage your budget, and compete against friends.</p>
          </div>
        </a>

        <a
          href="https://www.ea.com/en/games/f1/f1-25"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-accent-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-accent-500/10 flex items-center gap-6"
        >
          <div className="bg-zinc-950 p-4 rounded-full text-zinc-400 group-hover:text-accent-500 transition-colors">
            <Gamepad2 className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-1 group-hover:text-accent-500 transition-colors flex items-center gap-2">
              F1 25
              <ExternalLink className="w-4 h-4 opacity-50" />
            </h3>
            <p className="text-sm text-zinc-400">The official video game of the 2026 FIA Formula One World Championship.</p>
          </div>
        </a>

        <a
          href="https://www.formula1.com/en/page/unlocked/exclusive-content"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-accent-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-accent-500/10 flex items-center gap-6"
        >
          <div className="bg-zinc-950 p-4 rounded-full text-zinc-400 group-hover:text-accent-500 transition-colors">
            <Unlock className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-1 group-hover:text-accent-500 transition-colors flex items-center gap-2">
              F1 Unlocked
              <ExternalLink className="w-4 h-4 opacity-50" />
            </h3>
            <p className="text-sm text-zinc-400">Get closer to the grid with exclusive stories, videos, and rewards.</p>
          </div>
        </a>

        <a
          href="https://github.com/ajones29-wq/Formula-Tracker"
          target="_blank"
          rel="noopener noreferrer"
          className="group bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-accent-500/50 transition-all shadow-lg hover:shadow-xl hover:shadow-accent-500/10 flex items-center gap-6"
        >
          <div className="bg-zinc-950 p-4 rounded-full text-zinc-400 group-hover:text-accent-500 transition-colors">
            <Github className="w-8 h-8" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold uppercase tracking-wider mb-1 group-hover:text-accent-500 transition-colors flex items-center gap-2">
              GitHub
              <ExternalLink className="w-4 h-4 opacity-50" />
            </h3>
            <p className="text-sm text-zinc-400">View the Formula Tracker source code on GitHub.</p>
          </div>
        </a>
      </div>
    </motion.div>
  );
}
