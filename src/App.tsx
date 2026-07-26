/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScheduleView } from './components/ScheduleView';
import { StandingsView } from './components/StandingsView';
import { ResultsView } from './components/ResultsView';
import { NewsView } from './components/NewsView';
import { ProfileView } from './components/ProfileView';
import { ResetAccountView } from './components/ResetAccountView';
import { ArchivalResultsView } from './components/ArchivalResultsView';
import { AdminView } from './components/AdminView';
import { ContactView } from './components/ContactView';
import { QuickLinksView } from './components/QuickLinksView';
import { Footer } from './components/Footer';
import { RaceCountdown } from './components/RaceCountdown';
import { Calendar, Trophy, Timer, Newspaper, Bot, User as UserIcon, Archive, Award, ChevronDown, ExternalLink, Settings, Mail, Globe, MonitorPlay, Link, KeyRound } from 'lucide-react';
import { initFirebase } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { initTheme } from './lib/theme';

type Tab = 'standings' | 'results' | 'archive' | 'admin' | 'schedule' | 'news' | 'profile' | 'contact' | 'quick-links' | 'reset-account';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Settings State
  const [announcement, setAnnouncement] = useState('');
  const [themeColor, setThemeColor] = useState('red');
  const [siteTitle, setSiteTitle] = useState('F1 2026 Season');
  const [defaultTab, setDefaultTab] = useState<Tab>('standings');
  const [enableNews, setEnableNews] = useState(true);
  const [showHistoricalArchive, setShowHistoricalArchive] = useState(true);
  const [showRaceCountdown, setShowRaceCountdown] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('We are currently updating our systems. Please check back later for the latest racing data.');
  const [liveTimingMode, setLiveTimingMode] = useState(true);
  const [enableGlobalSearch, setEnableGlobalSearch] = useState(true);
  const [enableTelemetry, setEnableTelemetry] = useState(true);
  const [allowRegistrations, setAllowRegistrations] = useState(false);
  const [verboseLogging, setVerboseLogging] = useState(false);
  const [simulateRace, setSimulateRace] = useState(false);
  const [contactEmail, setContactEmail] = useState('ajones29@erc.nsw.edu.au');
  const [contactDescription, setContactDescription] = useState('Have questions about the 2026 season or feedback for the tracker? I\'d love to hear from you.');

  // Initialize theme from localStorage
  useEffect(() => {
    initTheme();

    const loadLocalSettings = () => {
      const savedTheme = localStorage.getItem('app-theme') || 'red';
      setThemeColor(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      setAnnouncement(localStorage.getItem('app-announcement') || '');
      setSiteTitle(localStorage.getItem('app-site-title') || 'F1 2026 Season');
      
      const savedNews = localStorage.getItem('app-enable-news');
      if (savedNews !== null) setEnableNews(savedNews === 'true');
      
      const savedArchive = localStorage.getItem('app-show-archive');
      if (savedArchive !== null) setShowHistoricalArchive(savedArchive === 'true');
      
      const savedCountdown = localStorage.getItem('app-show-countdown');
      if (savedCountdown !== null) setShowRaceCountdown(savedCountdown === 'true');
      
      const savedMaintenance = localStorage.getItem('app-maintenance-mode');
      if (savedMaintenance !== null) setMaintenanceMode(savedMaintenance === 'true');
      
      const savedMaintenanceMsg = localStorage.getItem('app-maintenance-message');
      if (savedMaintenanceMsg !== null) setMaintenanceMessage(savedMaintenanceMsg);
      
      const savedTiming = localStorage.getItem('app-live-timing');
      if (savedTiming !== null) setLiveTimingMode(savedTiming === 'true');

      const savedSearch = localStorage.getItem('app-enable-search');
      if (savedSearch !== null) setEnableGlobalSearch(savedSearch === 'true');

      const savedTelemetry = localStorage.getItem('app-enable-telemetry');
      if (savedTelemetry !== null) setEnableTelemetry(savedTelemetry === 'true');

      const savedRegistrations = localStorage.getItem('app-allow-registrations');
      if (savedRegistrations !== null) setAllowRegistrations(savedRegistrations === 'true');

      const savedVerbose = localStorage.getItem('app-verbose-logging');
      if (savedVerbose !== null) setVerboseLogging(savedVerbose === 'true');

      const savedSimulate = localStorage.getItem('app-simulate-race');
      if (savedSimulate !== null) setSimulateRace(savedSimulate === 'true');

      const savedContactEmail = localStorage.getItem('app-contact-email');
      if (savedContactEmail !== null) setContactEmail(savedContactEmail);

      const savedContactDesc = localStorage.getItem('app-contact-description');
      if (savedContactDesc !== null) setContactDescription(savedContactDesc);

      const savedDefaultTab = localStorage.getItem('app-default-tab') as Tab || 'standings';
      setDefaultTab(savedDefaultTab);
      setActiveTab((prev) => prev || savedDefaultTab);
    };

    loadLocalSettings();
    window.addEventListener('app-settings-changed', loadLocalSettings);

    // Global Settings Listener
    let unsubscribe: () => void;
    initFirebase().then(({ db }) => {
      const settingsRef = doc(db, 'settings', 'global');
      unsubscribe = onSnapshot(
        settingsRef, 
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
            if (data.maintenanceMessage !== undefined) setMaintenanceMessage(data.maintenanceMessage);
            if (data.announcement !== undefined) setAnnouncement(data.announcement);
            if (data.contactEmail !== undefined) setContactEmail(data.contactEmail);
            if (data.contactDescription !== undefined) setContactDescription(data.contactDescription);
            if (data.themeColor !== undefined) {
              document.documentElement.setAttribute('data-theme', data.themeColor);
            }
          }
        },
        (error) => {
          console.warn('Firestore snapshot connection warning (using local fallback settings):', error.message);
        }
      );
    }).catch((err) => {
      console.warn('Firebase init skipped or failed:', err);
    });

    return () => {
      window.removeEventListener('app-settings-changed', loadLocalSettings);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!activeTab) return null;

  if (maintenanceMode && activeTab !== 'admin') {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-50 flex items-center justify-center flex-col p-8 text-center">
        <div className="max-w-4xl w-full mb-12">
          <RaceCountdown />
        </div>
        <Settings className="w-16 h-16 text-accent-500 mb-6 animate-spin-slow" />
        <h1 className="text-4xl font-black italic uppercase tracking-tight mb-4">Under Maintenance</h1>
        <p className="text-zinc-400 max-w-md text-lg">
          {maintenanceMessage}
        </p>
        <button 
          onClick={() => setActiveTab('admin')} 
          className="mt-8 text-xs font-bold uppercase tracking-wider text-zinc-600 hover:text-zinc-400"
        >
          Admin Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-50 selection:bg-accent-500/30">
      <Header onAdminClick={() => setActiveTab('admin')} onProfileClick={() => setActiveTab('profile')} />
      
      {!maintenanceMode && announcement && (
        <div className="bg-accent-600 text-white px-4 py-2 text-center text-sm font-bold tracking-wide">
          {announcement}
        </div>
      )}
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {!maintenanceMode && showRaceCountdown && <RaceCountdown />}

        {/* Navigation Tabs */}
        {!maintenanceMode && (
        <div className="flex border-b border-zinc-800 mb-8 overflow-visible">
          <div className="flex space-x-8">
            <div className="relative group/dropdown">
              <button
                className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === 'standings'
                    ? 'border-accent-600 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <Trophy className="w-4 h-4" />
                Standings
                <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
              
              <div className="absolute top-full left-0 mt-0 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 overflow-hidden flex flex-col">
                <button
                  onClick={() => setActiveTab('standings')}
                  className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'standings' ? 'bg-accent-600/10 text-accent-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                >
                  Formula 1
                </button>
                <a
                  href="https://www.fiaformula2.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Formula 2
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
                <a
                  href="https://www.fiaformula3.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors text-zinc-400 hover:bg-zinc-800 hover:text-white"
                >
                  Formula 3
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              </div>
            </div>
            
            <div className="relative group/dropdown">
              <button
                className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                  (activeTab === 'results' || activeTab === 'archive')
                    ? 'border-accent-600 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <Timer className="w-4 h-4" />
                Results
                <ChevronDown className="w-4 h-4 ml-1 opacity-50" />
              </button>
              
              <div className="absolute top-full left-0 mt-0 w-48 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl opacity-0 invisible group-hover/dropdown:opacity-100 group-hover/dropdown:visible transition-all z-50 overflow-hidden flex flex-col">
                <button
                  onClick={() => setActiveTab('results')}
                  className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'results' ? 'bg-accent-600/10 text-accent-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                >
                  Latest Results
                </button>
                {showHistoricalArchive && (
                  <button
                    onClick={() => setActiveTab('archive')}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'archive' ? 'bg-accent-600/10 text-accent-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                  >
                    Archive
                  </button>
                )}
              </div>
            </div>
            
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'schedule'
                  ? 'border-accent-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
            {enableNews && (
              <button
                onClick={() => setActiveTab('news')}
                className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === 'news'
                    ? 'border-accent-600 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <Newspaper className="w-4 h-4" />
                Latest News
              </button>
            )}
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'profile'
                  ? 'border-accent-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Profile
            </button>
            <button
              onClick={() => setActiveTab('contact')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'contact'
                  ? 'border-accent-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              Contact
            </button>
            <button
              onClick={() => setActiveTab('quick-links')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'quick-links'
                  ? 'border-accent-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Link className="w-4 h-4" />
              Quick Links
            </button>
          </div>
        </div>
        )}

        {/* Content Area */}
        <div className="pb-24">
          {activeTab === 'standings' && <StandingsView />}
          {activeTab === 'results' && <ResultsView />}
          {activeTab === 'archive' && showHistoricalArchive && <ArchivalResultsView />}
          {activeTab === 'admin' && (
            <AdminView 
              isAuthenticated={isAdminAuthenticated}
              setIsAuthenticated={setIsAdminAuthenticated}
              settings={{
                themeColor, announcement, siteTitle, defaultTab, 
                showRaceCountdown, enableNews, liveTimingMode, 
                showHistoricalArchive, maintenanceMode, maintenanceMessage, enableGlobalSearch, 
                enableTelemetry, allowRegistrations, verboseLogging, simulateRace,
                contactEmail, contactDescription
              }}
              setters={{
                setThemeColor, setAnnouncement, setSiteTitle, setDefaultTab,
                setShowRaceCountdown, setEnableNews, setLiveTimingMode,
                setShowHistoricalArchive, setMaintenanceMode, setMaintenanceMessage, setEnableGlobalSearch,
                setEnableTelemetry, setAllowRegistrations, setVerboseLogging, setSimulateRace,
                setContactEmail, setContactDescription
              }}
            />
          )}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'news' && enableNews && <NewsView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'reset-account' && <ResetAccountView onBackToProfile={() => setActiveTab('profile')} />}
          {activeTab === 'contact' && <ContactView contactEmail={contactEmail} contactDescription={contactDescription} />}
          {activeTab === 'quick-links' && <QuickLinksView />}
        </div>
      </main>

      <Footer 
        siteTitle={siteTitle} 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        showHistoricalArchive={showHistoricalArchive} 
        enableNews={enableNews} 
      />
    </div>
  );
}
