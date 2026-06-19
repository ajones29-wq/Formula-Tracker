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
import { ArchivalResultsView } from './components/ArchivalResultsView';
import { MembersAreaView } from './components/MembersAreaView';
import { RaceCountdown } from './components/RaceCountdown';
import { Calendar, Trophy, Timer, Bot, User as UserIcon, Archive, Award, ChevronDown, ExternalLink } from 'lucide-react';

type Tab = 'standings' | 'results' | 'archive' | 'members' | 'schedule' | 'ai' | 'profile';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('standings');

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 selection:bg-red-500/30">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <RaceCountdown />

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 mb-8 overflow-visible">
          <div className="flex space-x-8">
            <div className="relative group/dropdown">
              <button
                className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                  activeTab === 'standings'
                    ? 'border-red-600 text-white'
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
                  className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'standings' ? 'bg-red-600/10 text-red-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
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
                    ? 'border-red-600 text-white'
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
                  className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'results' ? 'bg-red-600/10 text-red-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                >
                  Latest Results
                </button>
                <button
                  onClick={() => setActiveTab('archive')}
                  className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'archive' ? 'bg-red-600/10 text-red-500' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
                >
                  Archive
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('members')}
              className={`pb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors whitespace-nowrap border-b-2 ${
                activeTab === 'members'
                  ? 'border-red-600 text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <Award className="w-4 h-4" />
              Paddock Club
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
          {activeTab === 'archive' && <ArchivalResultsView />}
          {activeTab === 'members' && <MembersAreaView />}
          {activeTab === 'schedule' && <ScheduleView />}
          {activeTab === 'ai' && <AIPredictorView />}
          {activeTab === 'profile' && <ProfileView />}
        </div>
      </main>
    </div>
  );
}
