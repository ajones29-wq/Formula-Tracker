import { Mail, Copy, Check, ExternalLink, Github, Code2, GitFork } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

export function ContactView({ contactDescription = 'Have questions, feedback, or want to contribute to the Formula Tracker project? Check out our GitHub repository.' }: { contactDescription?: string }) {
  const githubUrl = 'https://github.com/ajones29-wq/Formula-Tracker';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-accent-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Contact & GitHub</h2>
            <p className="text-accent-100 font-medium max-w-lg">
              {contactDescription}
            </p>
          </div>
          <Github className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 rotate-12" />
        </div>

        <div className="p-8 sm:p-12">
          {/* GitHub Repository Card */}
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="space-y-2 text-center">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Source Code & Issues</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">
                View the project codebase, contribute improvements, or submit issue reports on GitHub.
              </p>
            </div>

            <div className="group relative bg-zinc-950 border border-zinc-800 rounded-xl p-6 transition-all hover:border-accent-500/50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block">GitHub Repository</span>
                  <span className="text-sm font-bold text-white">Formula-Tracker</span>
                </div>
              </div>

              <p className="text-xs font-mono text-zinc-400 break-all mb-6">
                {githubUrl}
              </p>

              <a 
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full bg-accent-600 hover:bg-accent-500 text-white font-bold uppercase tracking-widest text-xs py-3 rounded-lg transition-all shadow-lg hover:shadow-accent-500/20"
              >
                <Github className="w-4 h-4" />
                Open on GitHub
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center pb-8">
        <p className="text-zinc-600 text-xs font-medium uppercase tracking-[0.2em]">
          F1 Tracker © 2026 Season • NSW Australia
        </p>
      </div>
    </motion.div>
  );
}

