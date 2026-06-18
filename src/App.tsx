/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Header } from './components/Header';
import { ScheduleView } from './components/ScheduleView';
import { StandingsView } from './components/StandingsView';
import { ResultsView } from './components/ResultsView';
import { AIPredictorView } from './components/AIPredictorView';
import { ProfileView } from './components/ProfileView';
import { Calendar, Trophy, Timer, Bot, User as UserIcon } from 'lucide-react';

type Tab = 'standings' | 'results' | 'schedule' | 'ai' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('standings');

  return (
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
            <button
              onClick={() => setActiveTab('ai')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'ai'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Bot className="w-4 h-4" />
              AI Strategist
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'profile'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <UserIcon className="w-4 h-4" />
              Profile
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="pb-24">
          {activeTab === 'standings' && <StandingsView />}
          {activeTab === 'results' && <ResultsView />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'ai' && <AIPredictorView />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </main>
    </div>
  );
}
