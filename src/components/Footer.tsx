import { Flag } from 'lucide-react';

type Tab = 'standings' | 'results' | 'archive' | 'admin' | 'schedule' | 'news' | 'profile' | 'contact' | 'quick-links' | 'reset-account';

interface FooterProps {
  siteTitle: string;
  activeTab: Tab | null;
  setActiveTab: (tab: Tab) => void;
  showHistoricalArchive?: boolean;
  enableNews?: boolean;
}

export function Footer({
  siteTitle,
  activeTab,
  setActiveTab,
  showHistoricalArchive = true,
  enableNews = true,
}: FooterProps) {
  const navTabs: { id: Tab; label: string; condition?: boolean }[] = [
    { id: 'standings', label: 'Standings' },
    { id: 'results', label: 'Results' },
    { id: 'archive', label: 'Archive', condition: showHistoricalArchive },
    { id: 'schedule', label: 'Schedule' },
    { id: 'news', label: 'Latest News', condition: enableNews },
    { id: 'profile', label: 'Profile' },
    { id: 'reset-account', label: 'Reset Password/Email' },
    { id: 'contact', label: 'Contact' },
    { id: 'quick-links', label: 'Quick Links' },
  ];

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 mt-auto text-zinc-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Brand & Disclaimer */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-accent-600 rounded-lg flex items-center justify-center">
                <Flag className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white uppercase italic">
                {siteTitle || 'Formula Tracker'}
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
              We are not affiliated with Formula 1 or any teams that race in Formula 1.
            </p>
          </div>

          {/* Quick Navigation Links */}
          <div className="md:col-span-6">
            <h3 className="text-xs font-bold text-zinc-300 uppercase tracking-widest mb-4">
              Navigation
            </h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {navTabs
                .filter((tab) => tab.condition !== false)
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`transition-colors font-medium hover:text-white ${
                      activeTab === tab.id ? 'text-accent-500 font-bold' : 'text-zinc-400'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
          <p>© {new Date().getFullYear()} {siteTitle || 'Formula Tracker'}. All rights reserved.</p>
          <p className="italic">Built for F1 fans & motorsport enthusiasts</p>
        </div>
      </div>
    </footer>
  );
}
