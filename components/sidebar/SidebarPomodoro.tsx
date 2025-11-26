
import React from 'react';
import { Watch, Play, Pause, RotateCcw } from 'lucide-react';
import { Quest } from '../../types';

interface SidebarPomodoroProps {
  timerTime: number;
  isTimerRunning: boolean;
  timerMode: 'WORK' | 'BREAK';
  quests: Quest[];
  selectedQuestId: string;
  setSelectedQuestId: (id: string) => void;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  onSwitchMode: (mode: 'WORK' | 'BREAK') => void;
  todayStats: { count: number; minutes: number };
}

export const SidebarPomodoro: React.FC<SidebarPomodoroProps> = ({
  timerTime,
  isTimerRunning,
  timerMode,
  quests,
  selectedQuestId,
  setSelectedQuestId,
  onToggleTimer,
  onResetTimer,
  onSwitchMode,
  todayStats
}) => {
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-8 border-b-2 border-cyber-blue pb-4">
        <h3 className="text-lg font-bold font-mono text-cyber-blue uppercase tracking-widest flex items-center gap-2">
          <Watch className="w-5 h-5" /> KONCENTRACJA
        </h3>
        <div className="flex gap-2">
          <button onClick={() => onSwitchMode('WORK')} className={`text-xs font-bold px-2 py-1 ${timerMode === 'WORK' ? 'bg-cyber-blue text-black' : 'text-slate-500 border border-slate-700'}`}>
            PRACA
          </button>
          <button onClick={() => onSwitchMode('BREAK')} className={`text-xs font-bold px-2 py-1 ${timerMode === 'BREAK' ? 'bg-green-500 text-black' : 'text-slate-500 border border-slate-700'}`}>
            PRZERWA
          </button>
        </div>
      </div>
      <div className="bg-cyber-black border-2 border-cyber-panel p-8 mb-6 relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className={`absolute inset-0 opacity-10 ${isTimerRunning ? 'animate-pulse' : ''} ${timerMode === 'WORK' ? 'bg-cyber-blue' : 'bg-green-500'}`}></div>
        <div className="relative z-10 text-center">
          <div className={`text-6xl font-mono font-black tracking-widest mb-2 ${timerMode === 'WORK' ? 'text-cyber-blue' : 'text-green-500'}`}>
            {formatTime(timerTime)}
          </div>
          <p className="text-xs text-cyber-muted font-mono uppercase tracking-[0.2em]">
            {timerMode === 'WORK' ? 'SESJA ROBOCZA' : 'CZAS NA REGENERACJĘ'}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-8">
        {!isTimerRunning ? (
          <button onClick={onToggleTimer} className="col-span-2 bg-cyber-blue text-black py-3 font-bold flex items-center justify-center gap-2 hover:bg-white transition">
            <Play className="w-5 h-5" /> START
          </button>
        ) : (
          <button onClick={onToggleTimer} className="col-span-2 bg-cyber-red text-black py-3 font-bold flex items-center justify-center gap-2 hover:bg-white transition">
            <Pause className="w-5 h-5" /> PAUZA
          </button>
        )}
        <button onClick={onResetTimer} className="bg-cyber-dark border border-cyber-panel text-cyber-muted hover:text-white flex items-center justify-center">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
      <div className="mb-8">
        <label className="block text-xs text-cyber-muted mb-2 font-mono uppercase">Przypisz do Zadania</label>
        <select value={selectedQuestId} onChange={(e) => setSelectedQuestId(e.target.value)} className="w-full bg-cyber-black border border-cyber-panel text-white p-3 outline-none focus:border-cyber-blue">
          <option value="">-- Praca Ogólna --</option>
          {quests.filter(q => !q.completed).map(q => (<option key={q.id} value={q.id}>{q.title}</option>))}
        </select>
      </div>
      <div className="mt-auto border-t border-cyber-panel pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-cyber-black/50 p-3 border border-cyber-panel">
            <span className="block text-xs text-cyber-muted mb-1">DZISIAJ</span>
            <span className="block text-xl text-white font-mono font-bold">{todayStats.minutes} min</span>
          </div>
          <div className="bg-cyber-black/50 p-3 border border-cyber-panel">
            <span className="block text-xs text-cyber-muted mb-1">SESJE</span>
            <span className="block text-xl text-white font-mono font-bold">{todayStats.count}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
