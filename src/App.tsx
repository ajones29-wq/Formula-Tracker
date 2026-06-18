/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { ScheduleView } from './components/ScheduleView';
import { StandingsView } from './components/StandingsView';
import { ResultsView } from './components/ResultsView';
import { Calendar, Trophy, Timer } from 'lucide-react';
import { APIProvider } from '@vis.gl/react-google-maps';

type Tab = 'standings' | 'results' | 'schedule';

const API_KEY = (process.env.GOOGLE_MAPS_PLATFORM_KEY || '').trim();
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('standings');

  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white font-sans p-6">
        <div className="text-center max-w-lg bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
          <h2 className="text-xl font-bold mb-4 uppercase tracking-widest text-red-500">Google Maps API Key Required</h2>
          <p className="mb-2 text-zinc-300"><strong>Step 1:</strong> <a className="text-blue-400 hover:text-blue-300 underline" href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener">Get an API Key</a></p>
          <p className="mb-2 text-zinc-300"><strong>Step 2:</strong> Add your key as a secret in AI Studio:</p>
          <ul className="text-left leading-relaxed text-zinc-400 bg-zinc-950 p-4 rounded-lg mb-4 text-sm font-mono border border-zinc-800">
            <li>1. Open <strong>Settings</strong> (⚙️ gear icon, <strong>top-right corner</strong>)</li>
            <li>2. Select <strong>Secrets</strong></li>
            <li>3. Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> as the secret name, press <strong>Enter</strong></li>
            <li>4. Paste your API key as the value, press <strong>Enter</strong></li>
          </ul>
          <p className="text-xs text-zinc-500 uppercase tracking-widest">The app rebuilds automatically after you add the secret.</p>
        </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-red-500/30">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 mb-8 overflow-x-auto no-scrollbar">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('standings')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'standings'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Trophy className="w-4 h-4" />
              Standings
            </button>
            <button
              onClick={() => setActiveTab('results')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'results'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Timer className="w-4 h-4" />
              Latest Results
            </button>
            <button
              onClick={() => setActiveTab('schedule')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'schedule'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Schedule
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="pb-24">
          {activeTab === 'standings' && <StandingsView />}
          {activeTab === 'results' && <ResultsView />}
          {activeTab === 'schedule' && <ScheduleView />}
        </div>
      </main>
    </div>
    </APIProvider>
  );
}
