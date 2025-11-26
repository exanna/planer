
import React from 'react';
import { Flag, Plus, Trash2, Target, ChevronsDown, ChevronsUp, AlertTriangle } from 'lucide-react';
import { Quest, QuestPriority } from '../../types';

interface SidebarQuestsProps {
  quests: Quest[];
  newQuestTitle: string;
  setNewQuestTitle: (val: string) => void;
  newQuestPriority: QuestPriority;
  setNewQuestPriority: (val: QuestPriority) => void;
  newQuestDeadline: string;
  setNewQuestDeadline: (val: string) => void;
  onAddQuest: () => void;
  onDeleteQuest: (id: string) => void;
  onToggleQuest: (id: string) => void;
  getPriorityColor: (p: QuestPriority) => string;
}

export const SidebarQuests: React.FC<SidebarQuestsProps> = ({
  quests,
  newQuestTitle,
  setNewQuestTitle,
  newQuestPriority,
  setNewQuestPriority,
  newQuestDeadline,
  setNewQuestDeadline,
  onAddQuest,
  onDeleteQuest,
  onToggleQuest,
  getPriorityColor
}) => {
  const getPriorityIcon = (priority: QuestPriority) => {
    switch (priority) {
      case QuestPriority.LOW: return <ChevronsDown className="w-3 h-3" />;
      case QuestPriority.HIGH: return <ChevronsUp className="w-3 h-3" />;
      case QuestPriority.CRITICAL: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6 border-b-2 border-cyber-yellow/50 pb-4">
        <h3 className="text-lg font-bold font-mono text-cyber-yellow uppercase tracking-widest flex items-center gap-2">
          <Flag className="w-5 h-5" /> Lista Zadań
        </h3>
      </div>
      <div className="bg-cyber-black/40 border border-cyber-yellow/30 p-4 mb-6 shadow-lg">
        <div className="space-y-3">
          <div>
            <label className="text-micro font-mono font-bold text-cyber-yellow uppercase block mb-1">Co jest do zrobienia?</label>
            <input 
              type="text" 
              value={newQuestTitle} 
              onChange={(e) => setNewQuestTitle(e.target.value)} 
              placeholder="NP. ZROBIĆ ZAKUPY" 
              className="w-full bg-cyber-dark text-white border-b-2 border-cyber-panel focus:border-cyber-yellow outline-none py-2 px-1 font-bold text-sm placeholder-slate-600 transition-colors" 
              onKeyDown={(e) => e.key === 'Enter' && onAddQuest()}
            />
          </div>
          <div>
            <label className="text-micro font-mono font-bold text-cyber-yellow uppercase block mb-1">Priorytet</label>
            <div className="flex gap-2">
              {[QuestPriority.LOW, QuestPriority.HIGH, QuestPriority.CRITICAL].map(p => (
                <button 
                  key={p} 
                  onClick={() => setNewQuestPriority(p)} 
                  className={`flex-1 py-1 text-xs font-bold uppercase border transition flex items-center justify-center gap-1 ${newQuestPriority === p ? `bg-${getPriorityColor(p)} text-black border-${getPriorityColor(p)}` : 'bg-transparent text-slate-500 border-slate-700'}`}
                >
                  {getPriorityIcon(p)} {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-micro font-mono font-bold text-cyber-yellow uppercase block mb-1">Termin (Deadline)</label>
            <input 
              type="date" 
              value={newQuestDeadline} 
              onChange={(e) => setNewQuestDeadline(e.target.value)} 
              className="w-full bg-cyber-dark text-white border-b-2 border-cyber-panel focus:border-cyber-yellow outline-none py-2 px-1 font-mono text-sm"
            />
          </div>
          <button 
            onClick={onAddQuest} 
            disabled={!newQuestTitle.trim()} 
            className="w-full mt-2 bg-cyber-yellow text-black py-3 font-bold uppercase tracking-wider hover:bg-white transition flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" /> DODAJ ZADANIE
          </button>
        </div>
      </div>
      <div className="space-y-4 pb-20">
        {quests.length === 0 && (<p className="text-cyber-muted font-mono text-center py-10 opacity-50">BRAK ZADAŃ NA LIŚCIE</p>)}
        {quests.sort((a,b) => a.deadline.localeCompare(b.deadline)).map(quest => (
          <div key={quest.id} className={`bg-cyber-black border-l-4 p-4 transition relative group ${quest.completed ? 'border-green-500 opacity-50' : `border-${getPriorityColor(quest.priority)} hover:bg-cyber-panel/20`}`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className={`font-bold text-base leading-tight pr-6 ${quest.completed ? 'line-through text-cyber-muted' : 'text-white'}`}>
                {quest.title}
              </h4>
              <button onClick={() => onDeleteQuest(quest.id)} className="text-cyber-muted hover:text-red-500 absolute top-2 right-2 p-2">
                <Trash2 className="w-4 h-4"/>
              </button>
            </div>
            <div className="flex justify-between items-center text-xs font-mono mt-2">
              <div className="flex items-center gap-2">
                <span className={`${quest.completed ? 'text-cyber-muted' : 'text-cyber-yellow'} flex items-center gap-1 bg-black/30 px-2 py-1`}>
                  <Target className="w-3 h-3"/> {quest.deadline}
                </span>
                <span className={`text-micro uppercase font-bold px-1 flex items-center gap-1 text-${getPriorityColor(quest.priority)}`}>
                  {getPriorityIcon(quest.priority)} {quest.priority}
                </span>
              </div>
              <button 
                onClick={() => onToggleQuest(quest.id)} 
                className={`px-3 py-1 border transition-colors ${quest.completed ? 'border-green-500 text-green-500 hover:bg-green-500/10' : 'border-slate-500 text-slate-500 hover:border-cyber-yellow hover:text-cyber-yellow'}`}
              >
                {quest.completed ? 'ZROBIONE' : 'ODHACZ'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};
