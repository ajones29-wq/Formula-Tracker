import { Mail, Copy, Check, ExternalLink, MessageSquare } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'motion/react';

export function ContactView({ contactEmail = 'ajones29@erc.nsw.edu.au', contactDescription = 'Have questions about the 2026 season or feedback for the tracker? I\'d love to hear from you.' }: { contactEmail?: string, contactDescription?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="bg-accent-600 px-8 py-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Get in Touch</h2>
            <p className="text-accent-100 font-medium max-w-md">
              {contactDescription}
            </p>
          </div>
          <Mail className="absolute -right-8 -bottom-8 w-48 h-48 text-white/10 rotate-12" />
        </div>

        <div className="p-8 sm:p-12 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Contact Details</h3>
              <p className="text-zinc-300 leading-relaxed">
                Reach out directly via email for technical inquiries, feature requests, or general racing discussion.
              </p>
            </div>

            <div className="group relative bg-zinc-950 border border-zinc-800 rounded-xl p-6 transition-all hover:border-accent-500/50">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-500/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-accent-500" />
                  </div>
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-wide">Primary Email</span>
                </div>
                <button 
                  onClick={handleCopy}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-500 hover:text-white"
                  title="Copy email address"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              
              <div className="text-xl sm:text-2xl font-mono font-bold text-white break-all">
                {contactEmail}
              </div>

              <a 
                href={`mailto:${contactEmail}`}
                className="mt-6 flex items-center justify-center gap-2 w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold uppercase tracking-widest text-xs py-3 rounded-lg transition-all"
              >
                Send Message
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-zinc-950/50 border border-zinc-800/50 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-zinc-500" />
                <h4 className="font-bold text-white">Community & Support</h4>
              </div>
              <ul className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 shrink-0" />
                  <p className="text-sm text-zinc-400">Response time is usually within 24-48 hours during race weeks.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 shrink-0" />
                  <p className="text-sm text-zinc-400">For security concerns, please use PGP encryption where applicable.</p>
                </li>
                <li className="flex gap-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 mt-2 shrink-0" />
                  <p className="text-sm text-zinc-400">Interested in contributing? Check the GitHub repository links in your profile.</p>
                </li>
              </ul>
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
