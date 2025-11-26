
import React from 'react';
import { AlertTriangle, Plus, LayoutGrid } from 'lucide-react';
import { WEEKDAYS } from '../../constants';
import { Template, TemplateCategory, CalendarEntry, Quest } from '../../types';

interface MonthViewProps {
  year: number;
  month: number;
  selectedDateStr: string | null;
  entries: CalendarEntry[];
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

export const MonthView: React.FC<MonthViewProps> = ({
  year,
  month,
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
  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfMonth = (y: number, m: number) => {
    let day = new Date(y, m, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const getDayClasses = (isSelected: boolean, isToday: boolean, tpl: Template | undefined, category: TemplateCategory | undefined) => {
    let base = "relative flex flex-col transition cursor-pointer border min-h-[80px] lg:min-h-[140px] p-2 lg:p-3 gap-1 ";

    if (isSelected) {
      base += "border-cyber-red ring-2 ring-cyber-red/50 shadow-neon-red z-10 bg-cyber-red/10 ";
    } else if (tpl && category) {
       // Reduced border opacity to handle "too bright" complaint
       const borderColor = category.color === 'cyber-red' ? 'border-cyber-red/20' : 
                          category.color === 'cyber-blue' ? 'border-cyber-blue/20' : 'border-cyber-yellow/20';
       base += `bg-cyber-dark lg:hover:bg-cyber-panel/50 ${borderColor} `;
    } else {
       // Changed default empty day to border-transparent to be cleaner/darker as requested
       base += "border-transparent hover:border-cyber-red/20 bg-cyber-dark hover:bg-cyber-panel/20 group ";
    }
    return base;
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="grid grid-cols-7 gap-1 lg:gap-3 mb-2 lg:mb-4 shrink-0">
        {WEEKDAYS.map(day => <div key={day} className="text-center text-sm lg:text-xl font-black text-cyber-muted py-2 border-b-2 border-cyber-panel uppercase tracking-widest">{day}</div>)}
      </div>
      <div className="grid grid-cols-7 gap-1 lg:gap-3 flex-1 auto-rows-fr">
        {Array.from({ length: firstDay }).map((_, i) => <div key={`empty-${i}`} className="bg-cyber-dark/30" />)}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const date = new Date(year, month, day);
          const dateStr = formatDateStr(date);
          const entry = getEntryForDate(date);
          const tpl = entry ? getTemplateById(entry.templateId) : undefined;
          const category = tpl ? getCategoryById(tpl.categoryId) : undefined;
          const isSelected = selectedDateStr === dateStr;
          const isToday = new Date().toDateString() === date.toDateString();
          const activeQuests = quests.filter(q => q.deadline === dateStr && !q.completed);
          const displayItems = entry?.customItems || tpl?.items || [];
          const completed = displayItems.filter(i => i.completed).length;
          const progress = displayItems.length > 0 ? (completed / displayItems.length) * 100 : 0;
          const bgColor = category?.color ? `bg-${category.color}` : 'bg-slate-300';

          return (
            <div key={day} onClick={() => onDayClick(date)} className={getDayClasses(isSelected, isToday, tpl, category)}>
              {tpl && ( <div className={`lg:hidden absolute inset-0 opacity-20 ${bgColor}`}></div> )}
              {tpl && displayItems.length > 0 && ( <div className="absolute bottom-0 left-0 h-1 bg-green-500 transition-all duration-500" style={{ width: `${progress}%` }} /> )}
              <div className="flex justify-between items-start relative z-10">
                <span 
                  className={`text-xl lg:text-3xl font-bold w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center font-mono ${isToday ? 'bg-cyber-red text-black' : 'text-cyber-muted'}`}
                >
                  {day}
                </span>
                <div className="flex gap-1 items-center">
                  {activeQuests.length > 0 && <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-cyber-yellow animate-pulse" fill="currentColor" />}
                  {entry?.customItems && <div className="w-2 h-2 lg:w-4 lg:h-4 bg-cyber-text-main animate-pulse" />}
                  {tpl && <div className={`hidden lg:block w-4 h-4 ${bgColor}`}></div>}
                </div>
              </div>
              {tpl ? (
                <div className="mt-3 flex-1 overflow-hidden hidden lg:block">
                  <p className={`text-xs lg:text-sm font-bold uppercase tracking-wider truncate mb-2 text-${category?.color}`}>{tpl.name}</p>
                  <ul className="space-y-1">{displayItems.slice(0, 3).map((item, idx) => (<li key={idx} onClick={(e) => { e.stopPropagation(); onToggleTask(dateStr, item.id); }} className={`cursor-pointer text-xs font-bold flex gap-2 truncate font-mono hover:text-white transition ${item.completed ? 'text-cyber-muted line-through' : 'text-cyber-muted opacity-90'}`}><span className="text-cyber-muted/70">{item.startTime}</span>{item.activity}</li>))}</ul>
                </div>
              ) : ( 
                <div className="relative z-20 flex-1 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 lg:group-hover:opacity-100 opacity-100 lg:opacity-0 transition-opacity gap-1 lg:gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); onQuickAdd(dateStr); }} 
                    className="p-1 lg:p-2 bg-cyber-purple text-black rounded-none hover:bg-white transition shadow-lg w-full flex justify-center"
                    title="Szybki Plan"
                  >
                    <Plus className="w-4 h-4 lg:w-6 lg:h-6" />
                  </button>
                  <button 
                    onClick={(e) => onOpenSelector(e, date)}
                    className="p-1 lg:p-2 bg-cyber-panel text-white border border-slate-500 hover:bg-white hover:text-black transition shadow-lg w-full flex justify-center"
                    title="Wybierz Szablon"
                  >
                    <LayoutGrid className="w-4 h-4 lg:w-6 lg:h-6" />
                  </button>
                </div> 
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
