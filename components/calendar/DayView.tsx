
import React from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle2, Circle, Trash2, Plus, Coffee, MousePointerClick, GripVertical, ChevronsDown, ChevronsUp } from 'lucide-react';
import { MONTHS, WEEKDAYS } from '../../constants';
import { Template, TemplateCategory, CalendarEntry, Quest, QuestPriority } from '../../types';

interface DayViewProps {
  currentDate: Date;
  selectedDateStr: string | null;
  quests: Quest[];
  getTemplateById: (id: string) => Template | undefined;
  getCategoryById: (id: string) => TemplateCategory | undefined;
  getEntryForDate: (date: Date) => CalendarEntry | undefined;
  formatDateStr: (date: Date) => string;
  onQuickAdd: (dateStr?: string) => void;
  onOpenSelector: (e: React.MouseEvent, date: Date) => void;
  onToggleTask: (dateStr: string, itemId: string) => void;
  onUpdateDayItem: (dateStr: string, itemId: string, field: any, value: string) => void;
  onDeleteDayItem: (dateStr: string, itemId: string) => void;
  onAddDayItem: (dateStr: string) => void;
  onToggleQuest: (id: string) => void;
  getPriorityColor: (p: QuestPriority) => string;
  onReorderDayItems: (dateStr: string, fromIndex: number, toIndex: number) => void;
}

export const DayView: React.FC<DayViewProps> = ({
  currentDate,
  selectedDateStr,
  quests,
  getTemplateById,
  getCategoryById,
  getEntryForDate,
  formatDateStr,
  onQuickAdd,
  onOpenSelector,
  onToggleTask,
  onUpdateDayItem,
  onDeleteDayItem,
  onAddDayItem,
  onToggleQuest,
  getPriorityColor,
  onReorderDayItems
}) => {
  const dateToShow = selectedDateStr ? new Date(selectedDateStr) : currentDate;
  const dateStr = formatDateStr(dateToShow);
  const entry = getEntryForDate(dateToShow);
  const tpl = entry ? getTemplateById(entry.templateId) : undefined;
  const category = tpl ? getCategoryById(tpl.categoryId) : undefined;
  const displayItems = entry?.customItems || tpl?.items || [];
  const completedItems = displayItems.filter(i => i.completed).length;
  const progressPct = displayItems.length > 0 ? Math.round((completedItems / displayItems.length) * 100) : 0;
  const activeQuests = quests.filter(q => q.deadline === dateStr && !q.completed);

  const getPriorityIcon = (priority: QuestPriority) => {
    switch (priority) {
      case QuestPriority.LOW: return <ChevronsDown className="w-3 h-3" />;
      case QuestPriority.HIGH: return <ChevronsUp className="w-3 h-3" />;
      case QuestPriority.CRITICAL: return <AlertTriangle className="w-3 h-3" />;
    }
  };

  return (
    <div className="h-full flex flex-col max-w-6xl mx-auto w-full bg-cyber-black lg:border-x border-cyber-panel">
      <div className="p-4 md:p-12 border-b border-cyber-panel bg-cyber-dark/30 flex flex-col items-stretch gap-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="text-center md:text-left">
            <h2 className="font-black italic text-cyber-text-main mb-2 md:mb-4 leading-none text-4xl lg:text-6xl">
              {WEEKDAYS[dateToShow.getDay() === 0 ? 6 : dateToShow.getDay() - 1]} <span className="text-cyber-red">/</span> {dateToShow.getDate()}
            </h2>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <p className="text-cyber-muted font-mono text-xl md:text-2xl uppercase tracking-widest">{MONTHS[dateToShow.getMonth()]} {dateToShow.getFullYear()}</p>
              {entry?.customItems && (<span className="px-3 py-1 bg-cyber-text-main text-cyber-black font-bold text-sm font-mono uppercase tracking-tight animate-pulse">ZMODYFIKOWANY</span>)}
            </div>
          </div>
          {tpl && (
            <div className="w-full md:w-auto flex flex-col items-end">
              <div className="flex items-center gap-4 mb-2">
                <ShieldCheck className={`w-8 h-8 ${progressPct === 100 ? 'text-cyber-green animate-pulse' : 'text-cyber-muted'}`} />
                <div className="text-right">
                  <div className="text-xs text-cyber-muted font-mono uppercase">Postęp Dnia</div>
                  <div className={`text-4xl font-mono font-bold ${progressPct === 100 ? 'text-cyber-green' : 'text-cyber-text-main'}`}>{progressPct}%</div>
                </div>
              </div>
            </div>
          )}
        </div>
        {tpl && (
          <div className="w-full h-4 bg-cyber-black border border-cyber-panel relative overflow-hidden">
            <div className="absolute top-0 bottom-0 left-0 bg-cyber-red transition-all duration-700 ease-out shadow-[0_0_15px_rgba(255,0,60,0.5)]" style={{ width: `${progressPct}%`, backgroundColor: progressPct === 100 ? '#39ff14' : '#ff003c' }}>
              <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg,rgba(0,0,0,.15) 25%,transparent 25%,transparent 50%,rgba(0,0,0,.15) 50%,rgba(0,0,0,.15) 75%,transparent 75%,transparent)', backgroundSize: '1rem 1rem' }}></div>
            </div>
          </div>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-4 md:p-12 relative">
        {activeQuests.length > 0 && (
          <div className="mb-10 space-y-3">
            <h3 className="text-2xl font-black text-cyber-text-main uppercase tracking-widest mb-4 flex items-center gap-3">
              <AlertTriangle className="w-8 h-8 animate-pulse text-cyber-red" /> Pilne Zadania
            </h3>
            {activeQuests.map(q => {
              const color = getPriorityColor(q.priority);
              return (
                <div key={q.id} className={`p-4 bg-cyber-dark/40 border-l-4 border-${color} shadow-[0_0_10px_rgba(0,0,0,0.2)] flex items-center justify-between`}>
                  <div className="flex items-center gap-4 text-xl font-bold font-mono">
                    <button onClick={() => onToggleQuest(q.id)} className={`w-6 h-6 border-2 border-${color} flex items-center justify-center hover:bg-${color}/20 transition`}>
                      <div className="w-3 h-3 bg-transparent"></div>
                    </button>
                    <span className="text-cyber-text-main">{q.title}</span>
                  </div>
                  <span className={`text-xs font-mono font-bold px-2 py-1 text-black bg-${color} uppercase flex items-center gap-1`}>
                    {getPriorityIcon(q.priority)} {q.priority}
                  </span>
                </div>
              )
            })}
          </div>
        )}
        {tpl ? (
          <div className="space-y-0 relative pb-32">
            <div className="absolute left-[80px] md:left-[160px] top-0 bottom-0 w-px md:w-1 bg-cyber-panel/50"></div>
            {displayItems.map((item, index) => (
              <div 
                key={item.id} 
                className={`flex group mb-8 md:mb-12 last:mb-0 items-start transition-opacity duration-500 ${item.completed ? 'opacity-50 grayscale-[0.8]' : 'opacity-100'}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                  e.dataTransfer.effectAllowed = 'move';
                }}
                onDragOver={(e) => {
                  e.preventDefault(); // Necessary to allow dropping
                  e.dataTransfer.dropEffect = 'move';
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
                  if (fromIndex !== index) {
                    onReorderDayItems(dateStr, fromIndex, index);
                  }
                }}
              >
                <div className="w-[80px] md:w-[160px] pr-4 md:pr-10 text-right pt-2 relative shrink-0">
                  <input value={item.startTime} onChange={(e) => onUpdateDayItem(dateStr, item.id, 'startTime', e.target.value)} className={`w-full text-right bg-transparent border-b border-transparent focus:border-cyber-red outline-none text-xl md:text-3xl font-mono font-bold text-${category?.color || 'white'} block transition mb-1`}/>
                  <input value={item.endTime} onChange={(e) => onUpdateDayItem(dateStr, item.id, 'endTime', e.target.value)} className="w-full text-right bg-transparent border-b border-transparent focus:border-cyber-red outline-none text-sm md:text-lg font-mono font-bold text-cyber-muted block"/>
                  <div className={`absolute right-[-4px] md:right-[-6px] top-4 md:top-6 w-2 h-2 md:w-4 md:h-4 rounded-full ring-4 ring-cyber-black z-10 transition-colors duration-300 ${item.completed ? 'bg-cyber-green shadow-[0_0_10px_#39ff14]' : `bg-${category?.color || 'slate-500'}`}`}></div>
                </div>
                <div className="flex-1 relative group-item flex gap-2 md:gap-4 items-stretch">
                  <div className="flex items-center justify-center px-1 cursor-grab active:cursor-grabbing text-cyber-panel hover:text-cyber-red transition">
                    <GripVertical className="w-6 h-6" />
                  </div>
                  <button onClick={() => onToggleTask(dateStr, item.id)} className={`px-2 md:px-4 border-2 flex items-center justify-center transition-all duration-300 ${item.completed ? 'bg-cyber-green/20 border-cyber-green text-cyber-green' : 'bg-cyber-dark/50 border-cyber-panel text-cyber-muted hover:border-white hover:text-white'}`}>
                    {item.completed ? <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8" /> : <Circle className="w-6 h-6 md:w-8 md:h-8" />}
                  </button>
                  <div className={`flex-1 bg-cyber-dark/50 p-4 md:p-8 border transition relative overflow-hidden shadow-lg flex gap-4 items-center ${item.completed ? 'border-cyber-green/30' : 'border-cyber-panel hover:border-cyber-red focus-within:border-cyber-red'}`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 md:w-2 ${item.completed ? 'bg-cyber-green' : `bg-${category?.color || 'slate-500'}`}`}></div>
                    <input value={item.activity} onChange={(e) => onUpdateDayItem(dateStr, item.id, 'activity', e.target.value)} className={`flex-1 bg-transparent border-none outline-none text-lg md:text-3xl font-medium placeholder-slate-700 transition-all ${item.completed ? 'text-cyber-muted line-through decoration-2' : 'text-cyber-text-main'}`} placeholder="Opis zadania..."/>
                    <button onClick={() => onDeleteDayItem(dateStr, item.id)} className="opacity-100 md:opacity-0 group-hover:opacity-100 transition text-cyber-muted hover:text-red-500 p-2">
                      <Trash2 className="w-6 h-6 md:w-8 md:h-8" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex mt-12 pl-[80px] md:pl-[160px]">
              <button onClick={() => onAddDayItem(dateStr)} className="w-full py-6 md:py-8 border-2 border-dashed border-cyber-panel hover:border-cyber-red hover:bg-cyber-red/5 text-cyber-muted hover:text-cyber-red transition font-bold text-xl md:text-2xl uppercase tracking-widest flex items-center justify-center gap-3">
                <Plus className="w-6 h-6 md:w-8 md:h-8" /> Dodaj Pozycję
              </button>
            </div>
          </div>
        ) : ( 
          <div className="h-full flex flex-col items-center justify-center text-cyber-muted space-y-6">
            <Coffee className="w-32 h-32 opacity-20" />
            <div className="text-center flex flex-col gap-4">
              <p className="font-mono text-3xl font-bold mb-4">PUSTY DZIEŃ</p>
              
              <button 
                onClick={() => onQuickAdd()}
                className="bg-cyber-purple text-black px-8 py-4 font-bold uppercase tracking-widest hover:bg-white transition text-xl flex items-center justify-center gap-2 mx-auto shadow-[0_0_15px_rgba(217,70,239,0.5)] w-full max-w-md"
              >
                <Plus className="w-6 h-6" /> ROZPOCZNIJ PLANOWANIE
              </button>

              <div className="text-sm font-mono text-cyber-muted">- LUB -</div>

              <button 
                onClick={(e) => onOpenSelector(e, dateToShow)} 
                className="bg-cyber-dark border border-cyber-panel text-cyber-muted px-8 py-3 font-bold uppercase tracking-widest hover:bg-cyber-panel/50 transition text-lg flex items-center justify-center gap-2 mx-auto w-full max-w-md"
              >
                <MousePointerClick className="w-5 h-5" /> Wybierz Szablon
              </button>
            </div>
          </div> 
        )}
      </div>
    </div>
  );
};
