
import React from 'react';
import { Flag, Plus, LayoutGrid, AlertTriangle, Zap, FileSignature } from 'lucide-react';
import { WEEKDAYS } from '../../constants';
import { Template, TemplateCategory, CalendarEntry, Quest } from '../../types';

interface WeekViewProps {
  currentDate: Date;
  selectedDateStr: string | null;
  quests: Quest[];
  getTemplateById: (id: string) => Template | undefined;
  getCategoryById: (id: string) => TemplateCategory | undefined;
  getEntryForDate: (date: Date) => CalendarEntry | undefined;
  formatDateStr: (date: Date) => string;
  onDayClick: (date: Date) => void;
  onQuickAdd: (dateStr: string) => void;
  onOpenSelector: (e: React.MouseEvent, date: Date) => void;
  onToggleTask: (dateStr: string, itemId: string) => void;
}

export const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  selectedDateStr,
  quests,
  getTemplateById,
  getCategoryById,
  getEntryForDate,
  formatDateStr,
  onDayClick,
  onQuickAdd,
  onOpenSelector,
  onToggleTask
}) => {
  const getStartOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  };

  const addDays = (date: Date, days: number) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  const startOfWeek = getStartOfWeek(currentDate);
  const days = Array.from({ length: 7 }).map((_, i) => addDays(startOfWeek, i));

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex flex-col lg:grid lg:grid-cols-7 gap-px bg-cyber-panel border border-cyber-panel h-full overflow-y-auto">
        {days.map((date) => {
          const dateStr = formatDateStr(date);
          const entry = getEntryForDate(date);
          const tpl = entry ? getTemplateById(entry.templateId) : undefined;
          const category = tpl ? getCategoryById(tpl.categoryId) : undefined;
          const isSelected = selectedDateStr === dateStr;
          const isToday = new Date().toDateString() === date.toDateString();
          const activeQuests = quests.filter(q => q.deadline === dateStr && !q.completed);
          const displayItems = entry?.customItems || tpl?.items || [];
          const hasCustomItems = entry?.customItems && entry.customItems.length > 0;
          const isCustomDay = entry?.templateId === 'tpl_custom';
          
          return (
            <div key={dateStr} onClick={() => onDayClick(date)} className={`flex flex-col lg:h-full shrink-0 bg-cyber-black hover:bg-cyber-dark transition cursor-pointer relative border-b lg:border-b-0 lg:border-r border-cyber-panel ${isSelected ? 'bg-cyber-dark/80 ring-inset ring-2 ring-cyber-red' : ''}`}>
              
              {/* HEADER SECTION */}
              <div className={`p-3 lg:p-4 lg:border-b border-cyber-panel flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-2 ${isToday ? 'bg-cyber-red/10' : ''} ${activeQuests.length > 0 ? 'bg-cyber-yellow/5' : ''}`}>
                
                <div className="flex items-center gap-3 lg:flex-col">
                  <span className="text-lg font-mono text-cyber-muted uppercase">{WEEKDAYS[date.getDay() === 0 ? 6 : date.getDay() - 1]}</span>
                  <span className={`text-3xl lg:text-5xl font-bold leading-none ${isToday ? 'text-cyber-red' : 'text-cyber-text-main'}`}>{date.getDate()}</span>
                </div>

                {/* Status Indicators Row */}
                <div className="flex items-center gap-3 lg:mt-2">
                  {/* Quest Indicator */}
                  {activeQuests.length > 0 && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-cyber-yellow/20 border border-cyber-yellow/50 shadow-[0_0_10px_rgba(252,238,10,0.2)] animate-pulse" title={`${activeQuests.length} Pilnych Zadań`}>
                      <AlertTriangle className="w-4 h-4 text-cyber-yellow" />
                      <span className="text-xs font-bold text-cyber-yellow font-mono">{activeQuests.length}</span>
                    </div>
                  )}
                  
                  {/* Custom Plan Indicator */}
                  {(hasCustomItems || isCustomDay) && (
                    <div className="flex items-center justify-center w-7 h-7 bg-cyber-purple/20 border border-cyber-purple/50 text-cyber-purple" title="Plan Zmodyfikowany / Niestandardowy">
                      {isCustomDay ? <FileSignature className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                    </div>
                  )}

                  {/* Template Indicator (Mobile Only Small Dot) */}
                  <div className={`lg:hidden w-3 h-3 bg-${category?.color || 'transparent'}`}></div>
                </div>

                {/* Desktop Template Label */}
                <div className="hidden lg:flex items-center justify-center w-full mt-2">
                   {tpl ? (<span className={`px-2 py-0.5 font-bold text-xs bg-cyber-black border border-cyber-panel text-${category?.color} truncate max-w-full`}>{tpl.name}</span>) : (<span className="text-cyber-muted text-xs opacity-50">--</span>)}
                </div>
              </div>

              {/* CONTENT SECTION */}
              <div className="p-3 overflow-y-auto custom-scrollbar hidden lg:block flex-1">
                {tpl ? ( 
                  <div className="space-y-3 mt-2">
                    {displayItems.map((item, idx) => (
                      <div key={idx} onClick={(e) => { e.stopPropagation(); onToggleTask(dateStr, item.id); }} className={`bg-cyber-dark/50 p-2 border-l-2 transition cursor-pointer group hover:bg-cyber-panel/30 ${item.completed ? 'border-green-600 opacity-50' : 'border-cyber-panel hover:border-cyber-red'}`}>
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-xs font-mono font-bold text-cyber-muted group-hover:text-white transition">{item.startTime}</span>
                           {item.endTime && <span className="text-[10px] text-slate-600">{item.endTime}</span>}
                        </div>
                        <span className={`block text-xs leading-tight text-cyber-text-main truncate font-bold ${item.completed ? 'line-through' : ''}`}>{item.activity}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity p-4">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onQuickAdd(dateStr); }} 
                      className="w-full py-3 bg-cyber-purple text-black font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-white transition shadow-lg"
                    >
                      <Plus className="w-4 h-4" /> SZYBKI PLAN
                    </button>
                    <button 
                      onClick={(e) => onOpenSelector(e, date)}
                      className="w-full py-3 bg-cyber-dark border border-slate-500 text-slate-300 font-bold uppercase text-xs flex items-center justify-center gap-2 hover:bg-white hover:text-black transition"
                    >
                      <LayoutGrid className="w-4 h-4" /> SZABLON
                    </button>
                  </div>
                )}
              </div>

              {/* MOBILE PREVIEW SECTION */}
              <div className="lg:hidden px-4 pb-4">
                {tpl ? (
                  <div className="space-y-1 mt-2 border-l-2 border-cyber-panel pl-3">
                    {displayItems.slice(0, 3).map((item, idx) => (
                      <div key={idx} onClick={(e) => { e.stopPropagation(); onToggleTask(dateStr, item.id); }} className={`flex gap-2 text-sm text-cyber-muted ${item.completed ? 'line-through opacity-50' : ''}`}>
                        <span className="font-mono text-xs pt-0.5 min-w-[35px]">{item.startTime}</span>
                        <span className="truncate">{item.activity}</span>
                      </div>
                    ))}
                    {displayItems.length > 3 && <div className="text-xs text-slate-600 italic pl-1">+{displayItems.length - 3} więcej...</div>}
                  </div>
                ) : (
                  <div className="flex gap-2 mt-2">
                    <button 
                      onClick={(e) => { e.stopPropagation(); onQuickAdd(dateStr); }} 
                      className="flex-1 py-3 bg-cyber-purple text-black font-bold uppercase text-micro flex items-center justify-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3 h-3" /> PLAN
                    </button>
                    <button 
                      onClick={(e) => onOpenSelector(e, date)}
                      className="flex-1 py-3 bg-cyber-dark border border-slate-500 text-slate-300 font-bold uppercase text-micro flex items-center justify-center gap-1"
                    >
                      <LayoutGrid className="w-3 h-3" /> SZABLON
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
