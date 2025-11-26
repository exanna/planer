
import React from 'react';
import { User, ZoomIn, ZoomOut, Crosshair, Plus, CheckCircle2, Trash2, Terminal, Flag, Watch, Hash, Flame, Trophy } from 'lucide-react';
import { UserProfile } from '../../types';

interface SidebarProfileProps {
  userProfile: UserProfile;
  updateProfileInfo: (field: 'username' | 'tagline', value: string) => void;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  handleFontScale: (delta: number) => void;
  newGoalTitle: string;
  setNewGoalTitle: (val: string) => void;
  onAddGoal: () => void;
  onToggleGoal: (id: string) => void;
  onDeleteGoal: (id: string) => void;
  stats: {
    questsDone: number;
    focusHours: string;
    categoryCounts: Record<string, number>;
  };
}

export const SidebarProfile: React.FC<SidebarProfileProps> = ({
  userProfile,
  updateProfileInfo,
  setUserProfile,
  handleFontScale,
  newGoalTitle,
  setNewGoalTitle,
  onAddGoal,
  onToggleGoal,
  onDeleteGoal,
  stats
}) => {
  const getLevel = (xp: number) => Math.floor(xp / 1000) + 1;
  const getNextLevelXp = (xp: number) => (Math.floor(xp / 1000) + 1) * 1000;

  return (
    <div className="flex flex-col h-full space-y-8">
      {/* PROFILE HEADER */}
      <div className="flex items-center gap-4 border-b-2 border-cyber-green pb-6">
        <div className="w-20 h-20 bg-cyber-black border-2 border-cyber-green flex items-center justify-center shadow-[0_0_15px_rgba(57,255,20,0.3)]">
          <User className="w-10 h-10 text-cyber-green" />
        </div>
        <div className="flex-1">
          <input 
            type="text" 
            value={userProfile.username} 
            onChange={(e) => updateProfileInfo('username', e.target.value)}
            className="bg-transparent text-white text-2xl font-black italic outline-none w-full border-b border-transparent focus:border-cyber-green"
          />
          <input 
            type="text" 
            value={userProfile.tagline} 
            onChange={(e) => updateProfileInfo('tagline', e.target.value)}
            className="bg-transparent text-cyber-muted font-mono text-sm outline-none w-full border-b border-transparent focus:border-cyber-green mb-2"
          />
          
          {/* LEVEL / XP BAR */}
          <div className="flex justify-between items-end mb-1">
            <span className="text-cyber-green font-bold text-xs">LVL {getLevel(userProfile.xp)}</span>
            <span className="text-slate-600 font-mono text-micro">{userProfile.xp} / {getNextLevelXp(userProfile.xp)} XP</span>
          </div>
          <div className="w-full h-2 bg-cyber-black border border-cyber-panel">
            <div 
              className="h-full bg-cyber-green shadow-[0_0_10px_rgba(57,255,20,0.5)] transition-all"
              style={{ width: `${(userProfile.xp % 1000) / 10}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* STREAK DASHBOARD */}
      <div className="bg-gradient-to-r from-orange-900/20 to-red-900/20 border border-orange-500/30 p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity"><Flame className="w-16 h-16 text-orange-500" /></div>
        <h3 className="text-lg font-bold font-mono text-orange-500 uppercase tracking-widest flex items-center gap-2 mb-3">
          <Flame className="w-5 h-5 animate-pulse" /> Seria Dni (Streak)
        </h3>
        <div className="flex justify-between items-center gap-4">
          <div className="flex-1 bg-cyber-black/50 p-2 border-l-2 border-orange-500">
            <div className="text-micro font-bold text-cyber-muted uppercase">Aktualna</div>
            <div className="text-3xl font-black text-white leading-none">{userProfile.currentStreak || 0}</div>
          </div>
          <div className="flex-1 bg-cyber-black/50 p-2 border-l-2 border-yellow-500">
            <div className="text-micro font-bold text-cyber-muted uppercase flex items-center gap-1"><Trophy className="w-3 h-3 text-yellow-500"/> Rekord</div>
            <div className="text-3xl font-black text-white leading-none">{userProfile.longestStreak || 0}</div>
          </div>
        </div>
      </div>

      {/* THEME & FONT SELECTOR */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-cyber-black border border-cyber-panel">
          <div className="text-sm font-bold text-cyber-muted uppercase font-mono">Motyw Systemu</div>
          <button 
            onClick={() => {
              const newTheme = userProfile.theme === 'light' ? 'dark' : 'light';
              setUserProfile(prev => ({ ...prev, theme: newTheme }));
            }}
            className="flex items-center gap-2 text-xs font-bold border border-cyber-panel px-3 py-1 hover:bg-white hover:text-black transition"
          >
            {userProfile.theme === 'light' ? 'INDUSTRIAL SILVER' : 'CYBER DARK'}
          </button>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-cyber-black border border-cyber-panel">
          <div className="text-sm font-bold text-cyber-muted uppercase font-mono">Skala Tekstu</div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleFontScale(-0.1)} className="p-2 border border-cyber-panel hover:bg-cyber-panel/30"><ZoomOut className="w-4 h-4"/></button>
            <span className="text-xs font-mono w-10 text-center">{((userProfile.fontScale || 1) * 100).toFixed(0)}%</span>
            <button onClick={() => handleFontScale(0.1)} className="p-2 border border-cyber-panel hover:bg-cyber-panel/30"><ZoomIn className="w-4 h-4"/></button>
          </div>
        </div>
      </div>

      {/* LONG TERM GOALS */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold font-mono text-cyber-muted uppercase tracking-widest flex items-center gap-2">
          <Crosshair className="w-5 h-5" /> Cele Życiowe
        </h3>
        <div className="flex gap-2">
          <input 
            type="text" 
            value={newGoalTitle}
            onChange={(e) => setNewGoalTitle(e.target.value)}
            placeholder="NP. ZWIEDZIĆ JAPONIĘ"
            className="flex-1 bg-cyber-black border border-cyber-panel p-2 text-sm text-white outline-none focus:border-white"
            onKeyDown={(e) => e.key === 'Enter' && onAddGoal()}
          />
          <button onClick={onAddGoal} className="bg-white text-black px-3 font-bold hover:bg-cyber-green transition"><Plus/></button>
        </div>
        <div className="space-y-2">
          {userProfile.longTermGoals.map(goal => (
            <div key={goal.id} className="flex items-center gap-3 p-2 bg-cyber-black/50 border-l-2 border-slate-600 hover:border-cyber-green group">
              <button onClick={() => onToggleGoal(goal.id)} className={`w-5 h-5 border flex items-center justify-center ${goal.completed ? 'bg-cyber-green border-cyber-green' : 'border-slate-500'}`}>
                {goal.completed && <CheckCircle2 className="w-4 h-4 text-black" />}
              </button>
              <span className={`flex-1 font-mono text-sm ${goal.completed ? 'line-through text-slate-600' : 'text-slate-300'}`}>{goal.title}</span>
              <button onClick={() => onDeleteGoal(goal.id)} className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
            </div>
          ))}
          {userProfile.longTermGoals.length === 0 && <p className="text-xs text-slate-600 italic">Brak zdefiniowanych celów.</p>}
        </div>
      </div>

      {/* STATS FOR NERDS */}
      <div className="space-y-4 pt-4 border-t border-cyber-panel">
        <h3 className="text-lg font-bold font-mono text-cyber-purple uppercase tracking-widest flex items-center gap-2">
          <Terminal className="w-5 h-5" /> Statystyki
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-cyber-black p-3 border border-cyber-panel/50">
            <div className="text-cyber-muted text-micro uppercase mb-1 flex items-center gap-1"><Flag className="w-3 h-3"/> Zadania (Quests)</div>
            <div className="text-2xl font-black text-white">{stats.questsDone}</div>
          </div>
          <div className="bg-cyber-black p-3 border border-cyber-panel/50">
            <div className="text-cyber-muted text-micro uppercase mb-1 flex items-center gap-1"><Watch className="w-3 h-3"/> Skupienie (h)</div>
            <div className="text-2xl font-black text-white">{stats.focusHours}</div>
          </div>
        </div>

        <div className="bg-cyber-black p-4 border border-cyber-panel/50">
          <div className="text-cyber-muted text-micro uppercase mb-3 flex items-center gap-1"><Hash className="w-3 h-3"/> Rozkład Dni</div>
          <div className="space-y-3">
            {Object.entries(stats.categoryCounts).map(([catName, count]) => {
              const total = Object.values(stats.categoryCounts).reduce((a,b) => a+b, 0);
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={catName}>
                  <div className="flex justify-between text-xs font-mono text-slate-400 mb-1">
                    <span>{catName}</span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full h-1 bg-cyber-dark">
                    <div className="h-full bg-cyber-purple" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
              )
            })}
            {Object.keys(stats.categoryCounts).length === 0 && <p className="text-xs text-slate-600">Brak danych.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
