/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ScheduleView } from './components/ScheduleView';
import { StandingsView } from './components/StandingsView';
import { ResultsView } from './components/ResultsView';
import { AIPredictorView } from './components/AIPredictorView';
import { ProfileView } from './components/ProfileView';
import { ArchivalResultsView } from './components/ArchivalResultsView';
import { AdminView } from './components/AdminView';
import { ContactView } from './components/ContactView';
import { RaceCountdown } from './components/RaceCountdown';
import { Calendar, Trophy, Timer, Bot, User as UserIcon, Archive, Award, ChevronDown, ExternalLink, Settings, Mail } from 'lucide-react';
import { initFirebase } from './lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

type Tab = 'standings' | 'results' | 'archive' | 'admin' | 'schedule' | 'ai' | 'profile' | 'contact';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  // Settings State
  const [announcement, setAnnouncement] = useState('');
  const [themeColor, setThemeColor] = useState('red');
  const [siteTitle, setSiteTitle] = useState('F1 2026 Season');
  const [defaultTab, setDefaultTab] = useState<Tab>('standings');
  const [enableAIPredictor, setEnableAIPredictor] = useState(true);
  const [showHistoricalArchive, setShowHistoricalArchive] = useState(true);
  const [showRaceCountdown, setShowRaceCountdown] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [liveTimingMode, setLiveTimingMode] = useState(true);
  const [enableGlobalSearch, setEnableGlobalSearch] = useState(true);
  const [enableTelemetry, setEnableTelemetry] = useState(true);
  const [allowRegistrations, setAllowRegistrations] = useState(false);
  const [verboseLogging, setVerboseLogging] = useState(false);
  const [simulateRace, setSimulateRace] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const loadLocalSettings = () => {
      const savedTheme = localStorage.getItem('app-theme') || 'red';
      setThemeColor(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
      
      setAnnouncement(localStorage.getItem('app-announcement') || '');
      setSiteTitle(localStorage.getItem('app-site-title') || 'F1 2026 Season');
      
      const savedAI = localStorage.getItem('app-enable-ai');
      if (savedAI !== null) setEnableAIPredictor(savedAI === 'true');
      
      const savedArchive = localStorage.getItem('app-show-archive');
      if (savedArchive !== null) setShowHistoricalArchive(savedArchive === 'true');
      
      const savedCountdown = localStorage.getItem('app-show-countdown');
      if (savedCountdown !== null) setShowRaceCountdown(savedCountdown === 'true');
      
      const savedMaintenance = localStorage.getItem('app-maintenance-mode');
      if (savedMaintenance !== null) setMaintenanceMode(savedMaintenance === 'true');
      
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
      unsubscribe = onSnapshot(settingsRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          if (data.maintenanceMode !== undefined) setMaintenanceMode(data.maintenanceMode);
          if (data.announcement !== undefined) setAnnouncement(data.announcement);
          if (data.themeColor !== undefined) {
            document.documentElement.setAttribute('data-theme', data.themeColor);
          }
        }
      });
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
          We are currently updating our systems. Please check back later for the latest racing data.
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-accent-500/30">
      <Header onAdminClick={() => setActiveTab('admin')} onProfileClick={() => setActiveTab('profile')} />
      
      {!maintenanceMode && announcement && (
        <div className="bg-accent-600 text-white px-4 py-2 text-center text-sm font-bold tracking-wide">
          {announcement}
        </div>
      )}
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
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
            {enableAIPredictor && (
              <button
                onClick={() => setActiveTab('ai')}
                className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === 'ai'
                    ? 'border-accent-600 text-white'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                }`}
              >
                <Bot className="w-4 h-4" />
                AI Strategist
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
                showRaceCountdown, enableAIPredictor, liveTimingMode, 
                showHistoricalArchive, maintenanceMode, enableGlobalSearch, 
                enableTelemetry, allowRegistrations, verboseLogging, simulateRace
              }}
              setters={{
                setThemeColor, setAnnouncement, setSiteTitle, setDefaultTab,
                setShowRaceCountdown, setEnableAIPredictor, setLiveTimingMode,
                setShowHistoricalArchive, setMaintenanceMode, setEnableGlobalSearch,
                setEnableTelemetry, setAllowRegistrations, setVerboseLogging, setSimulateRace
              }}
            />
          )}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'ai' && enableAIPredictor && <AIPredictorView />}
          {activeTab === 'profile' && <ProfileView />}
          {activeTab === 'contact' && <ContactView />}
        </div>
      </main>

      {!maintenanceMode && (
      <button
        onClick={() => setActiveTab('admin')}
        className="fixed bottom-4 right-4 p-3 bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white rounded-full shadow-lg transition-all opacity-50 hover:opacity-100 focus:opacity-100 z-50"
        title="Admin Settings"
      >
        <Settings className="w-5 h-5" />
      </button>
      )}
    </div>
  );
}
