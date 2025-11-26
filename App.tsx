
import React, { useState, useEffect, useRef } from 'react';
import { Template, CalendarEntry, DayType, TemplateCategory, ScheduleItem, Quest, QuestPriority, BackupData, PomodoroSession, UserProfile, LongTermGoal } from './types';
import { INITIAL_TEMPLATES, INITIAL_CATEGORIES } from './constants';
import { TemplateEditor } from './components/TemplateEditor';
import { LayoutGrid, Flag, Watch, User, Download, Upload, X, Cpu, Coffee, ShieldCheck, CheckCircle2, Circle, PanelLeftClose } from 'lucide-react';

// Imported Components
import { Header } from './components/layout/Header';
import { SidebarTemplates } from './components/sidebar/SidebarTemplates';
import { SidebarQuests } from './components/sidebar/SidebarQuests';
import { SidebarPomodoro } from './components/sidebar/SidebarPomodoro';
import { SidebarProfile } from './components/sidebar/SidebarProfile';
import { MonthView } from './components/calendar/MonthView';
import { WeekView } from './components/calendar/WeekView';
import { DayView } from './components/calendar/DayView';
import { TemplateSelectorModal } from './components/modals/TemplateSelectorModal';

type ViewMode = 'month' | 'week' | 'day';
type SidebarTab = 'templates' | 'quests' | 'pomodoro' | 'profile';

const App: React.FC = () => {
  // --- STATE ---
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  
  // Data State (Persisted)
  const [categories, setCategories] = useState<TemplateCategory[]>(() => JSON.parse(localStorage.getItem('categories') || JSON.stringify(INITIAL_CATEGORIES)));
  const [templates, setTemplates] = useState<Template[]>(() => JSON.parse(localStorage.getItem('templates') || JSON.stringify(INITIAL_TEMPLATES)));
  const [entries, setEntries] = useState<CalendarEntry[]>(() => JSON.parse(localStorage.getItem('entries') || '[]'));
  const [quests, setQuests] = useState<Quest[]>(() => JSON.parse(localStorage.getItem('quests') || '[]'));
  const [pomodoroHistory, setPomodoroHistory] = useState<PomodoroSession[]>(() => JSON.parse(localStorage.getItem('pomodoroHistory') || '[]'));
  const [userProfile, setUserProfile] = useState<UserProfile>(() => JSON.parse(localStorage.getItem('userProfile') || JSON.stringify({
    username: 'USER_ZERO', tagline: 'Cyberpunk Enthusiast', xp: 0, longTermGoals: [], theme: 'dark', fontScale: 1.0, currentStreak: 0, longestStreak: 0
  })));
  
  // UI State
  // Default sidebar to open on large screens, closed on small
  const [isSidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('templates');
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [isCreatingTemplate, setIsCreatingTemplate] = useState(false);
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);
  const [isTemplateSelectorOpen, setIsTemplateSelectorOpen] = useState(false);
  
  // Form States
  const [newQuestTitle, setNewQuestTitle] = useState('');
  const [newQuestPriority, setNewQuestPriority] = useState<QuestPriority>(QuestPriority.HIGH);
  const [newQuestDeadline, setNewQuestDeadline] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  const [newGoalTitle, setNewGoalTitle] = useState('');

  // Pomodoro State
  const [timerTime, setTimerTime] = useState(25 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerMode, setTimerMode] = useState<'WORK' | 'BREAK'>('WORK');
  const [selectedQuestId, setSelectedQuestId] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- HELPERS ---
  const formatDateStr = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  // --- EFFECTS ---
  useEffect(() => { localStorage.setItem('categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('templates', JSON.stringify(templates)); }, [templates]);
  useEffect(() => { localStorage.setItem('entries', JSON.stringify(entries)); }, [entries]);
  useEffect(() => { localStorage.setItem('quests', JSON.stringify(quests)); }, [quests]);
  useEffect(() => { localStorage.setItem('pomodoroHistory', JSON.stringify(pomodoroHistory)); }, [pomodoroHistory]);
  useEffect(() => { localStorage.setItem('userProfile', JSON.stringify(userProfile)); }, [userProfile]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (userProfile.theme === 'light') body.classList.add('theme-light');
    else body.classList.remove('theme-light');
    root.style.setProperty('--font-scale', (userProfile.fontScale || 1.0).toString());
  }, [userProfile.theme, userProfile.fontScale]);

  // STREAK CALCULATION LOGIC
  useEffect(() => {
    const calculateStreak = () => {
      const isDayPerfect = (dStr: string) => {
        const entry = entries.find(e => e.date === dStr);
        if (!entry) return false;
        
        let items = entry.customItems;
        if (!items) {
           const tpl = templates.find(t => t.id === entry.templateId);
           items = tpl ? tpl.items : [];
        }
        if (!items || items.length === 0) return false;
        return items.every(i => i.completed);
      };

      const today = new Date();
      let streak = 0;
      let checkDate = new Date(today);
      
      const todayStr = formatDateStr(today);
      if (isDayPerfect(todayStr)) {
        streak++;
      }

      checkDate.setDate(checkDate.getDate() - 1); 
      while (true) {
        const dStr = formatDateStr(checkDate);
        if (isDayPerfect(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      if (streak !== (userProfile.currentStreak || 0)) {
        setUserProfile(prev => ({
          ...prev,
          currentStreak: streak,
          longestStreak: Math.max(streak, prev.longestStreak || 0)
        }));
      }
    };

    calculateStreak();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entries]);

  useEffect(() => {
    let interval: number | undefined;
    if (isTimerRunning && timerTime > 0) {
      interval = window.setInterval(() => setTimerTime((prev) => prev - 1), 1000);
    } else if (timerTime === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      handlePomodoroComplete();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerTime]);

  
  const addXp = (amount: number) => setUserProfile(prev => ({ ...prev, xp: prev.xp + amount }));
  
  const getEntryForDate = (date: Date) => {
    const dateStr = formatDateStr(date);
    return entries.find(e => e.date === dateStr);
  };
  
  const getTemplateById = (id: string) => {
    if (id === 'tpl_custom') return { id: 'tpl_custom', name: 'WŁASNY PLAN', categoryId: 'cat_custom', items: [] };
    return templates.find(t => t.id === id);
  };
  
  const getCategoryById = (id: string) => {
    if (id === 'cat_custom') return { id: 'cat_custom', name: 'NIESTANDARDOWE', baseType: DayType.OFF, color: 'cyber-purple' };
    return categories.find(c => c.id === id);
  };

  const getPriorityColor = (priority: QuestPriority) => {
    switch(priority) {
      case QuestPriority.CRITICAL: return 'cyber-red';
      case QuestPriority.HIGH: return 'cyber-yellow';
      case QuestPriority.LOW: return 'cyber-green';
      default: return 'slate-500';
    }
  };

  const getStats = () => {
    const totalCompletedQuests = quests.filter(q => q.completed).length;
    const totalFocusTime = pomodoroHistory.reduce((acc, s) => acc + s.durationMinutes, 0);
    const categoryCounts: Record<string, number> = {};
    entries.forEach(e => {
       const tpl = templates.find(t => t.id === e.templateId);
       if(tpl) {
          const cat = categories.find(c => c.id === tpl.categoryId);
          if(cat) categoryCounts[cat.name] = (categoryCounts[cat.name] || 0) + 1;
          else if (e.templateId === 'tpl_custom') categoryCounts['NIESTANDARDOWE'] = (categoryCounts['NIESTANDARDOWE'] || 0) + 1;
       }
    });
    return { questsDone: totalCompletedQuests, focusHours: (totalFocusTime / 60).toFixed(1), categoryCounts };
  };

  // --- HANDLERS ---
  const handleDayClick = (date: Date) => {
    const dateStr = formatDateStr(date);
    setSelectedDateStr(dateStr);
    setCurrentDate(date);
    setEditingTemplate(null);
    setIsCreatingTemplate(false);
  };

  const handleQuickCustomInit = (specificDateStr?: string) => {
    const dateStr = specificDateStr || selectedDateStr || formatDateStr(currentDate);
    // Directly add entry to calendar without creating a template in the list
    setEntries(prev => [
      ...prev.filter(e => e.date !== dateStr),
      { 
        date: dateStr, 
        templateId: 'tpl_custom', 
        customItems: [{ id: Date.now().toString(), startTime: '08:00', endTime: '09:00', activity: '', completed: false }] 
      }
    ]);
    setSelectedDateStr(dateStr);
    setCurrentDate(new Date(dateStr));
    setViewMode('day');
  };

  const assignTemplateToDate = (templateId: string) => {
    const targetDateStr = selectedDateStr || formatDateStr(currentDate);
    setEntries(prev => [...prev.filter(e => e.date !== targetDateStr), { date: targetDateStr, templateId }]);
    setSelectedDateStr(targetDateStr);
    setIsTemplateSelectorOpen(false);
  };

  // Quest Handlers
  const handleAddQuest = () => {
    if (!newQuestTitle.trim()) return;
    setQuests([...quests, { id: Date.now().toString(), title: newQuestTitle.toUpperCase(), deadline: newQuestDeadline, priority: newQuestPriority, completed: false }]);
    setNewQuestTitle('');
  };

  const handleToggleQuest = (id: string) => {
    const quest = quests.find(q => q.id === id);
    if (!quest) return;
    const isCompleting = !quest.completed;
    setQuests(quests.map(q => q.id === id ? { ...q, completed: isCompleting } : q));
    addXp(isCompleting ? (quest.priority === QuestPriority.CRITICAL ? 100 : quest.priority === QuestPriority.LOW ? 25 : 50) : -50);
  };

  const handleDeleteQuest = (id: string) => { if(confirm("Usunąć zadanie?")) setQuests(quests.filter(q => q.id !== id)); };

  // Day Item Handlers
  const updateDayEntry = (dateStr: string, modifier: (items: ScheduleItem[]) => ScheduleItem[]) => {
    setEntries(prev => prev.map(entry => {
      if (entry.date !== dateStr) return entry;
      let currentItems = entry.customItems;
      if (!currentItems) {
        const tpl = templates.find(t => t.id === entry.templateId);
        currentItems = tpl ? [...tpl.items] : [];
      }
      return { ...entry, customItems: modifier(currentItems) };
    }));
  };

  const handleToggleComplete = (dateStr: string, itemId: string) => {
    let gainedXp = false;
    updateDayEntry(dateStr, (items) => items.map(item => {
      if(item.id === itemId) {
         const newState = !item.completed;
         if(newState) gainedXp = true; 
         return { ...item, completed: newState };
      }
      return item;
    }));
    addXp(gainedXp ? 15 : -15);
  };

  const handleUpdateDayItem = (dateStr: string, itemId: string, field: keyof ScheduleItem, value: string) => {
    updateDayEntry(dateStr, (items) => items.map(item => item.id === itemId ? { ...item, [field]: value } : item));
  };
  
  const handleAddDayItem = (dateStr: string) => {
    updateDayEntry(dateStr, (items) => [...items, { id: Date.now().toString(), startTime: '12:00', endTime: '13:00', activity: '', completed: false }]);
  };

  const handleDeleteDayItem = (dateStr: string, itemId: string) => {
    updateDayEntry(dateStr, (items) => items.filter(i => i.id !== itemId));
  };

  // Reorder Handler
  const handleReorderDayItems = (dateStr: string, fromIndex: number, toIndex: number) => {
    updateDayEntry(dateStr, (items) => {
      const newItems = [...items];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  };

  // Pomodoro Handlers
  const handlePomodoroComplete = () => {
    if (timerMode === 'WORK') {
      setPomodoroHistory([...pomodoroHistory, { id: Date.now().toString(), timestamp: Date.now(), durationMinutes: 25, type: 'WORK', questId: selectedQuestId || undefined }]);
      addXp(25);
      alert("KONIEC CZASU! +25 XP");
      setTimerMode('BREAK'); setTimerTime(5 * 60); setIsTimerRunning(false);
    } else {
      alert("PRZERWA ZAKOŃCZONA.");
      setTimerMode('WORK'); setTimerTime(25 * 60); setIsTimerRunning(false);
    }
  };

  // Profile Handlers
  const handleAddLongTermGoal = () => {
    if (!newGoalTitle.trim()) return;
    setUserProfile(prev => ({ ...prev, longTermGoals: [...prev.longTermGoals, { id: Date.now().toString(), title: newGoalTitle.toUpperCase(), completed: false }] }));
    setNewGoalTitle('');
  };

  const handleToggleGoal = (id: string) => {
    setUserProfile(prev => ({ ...prev, longTermGoals: prev.longTermGoals.map(g => g.id === id ? { ...g, completed: !g.completed } : g) }));
    const goal = userProfile.longTermGoals.find(g => g.id === id);
    addXp(goal && !goal.completed ? 500 : -500);
  };

  const handleDeleteGoal = (id: string) => setUserProfile(prev => ({ ...prev, longTermGoals: prev.longTermGoals.filter(g => g.id !== id) }));
  
  // Data Handlers
  const handleExportData = () => {
    const data: BackupData = { version: 3, categories, templates, entries, quests, pomodoroHistory, profile: userProfile };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `daymaster_backup_${formatDateStr(new Date())}.json`; document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string) as BackupData;
        if (confirm(`Znaleziono backup. Nadpisać?`)) {
          if(json.categories) setCategories(json.categories);
          if(json.templates) setTemplates(json.templates);
          if(json.entries) setEntries(json.entries);
          if(json.quests) setQuests(json.quests);
          if(json.pomodoroHistory) setPomodoroHistory(json.pomodoroHistory);
          if(json.profile) setUserProfile(json.profile);
          alert("DANE PRZYWRÓCONE");
        }
      } catch (err) { alert("BŁĄD PLIKU"); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // --- RENDER ---
  const selectedEntry = (selectedDateStr || viewMode === 'day') ? entries.find(e => e.date === (selectedDateStr || formatDateStr(currentDate))) : null;
  const selectedEntryTemplate = selectedEntry ? getTemplateById(selectedEntry.templateId) : null;
  const selectedEntryCategory = selectedEntryTemplate ? getCategoryById(selectedEntryTemplate.categoryId) : null;
  
  const panelItems = selectedEntry?.customItems || selectedEntryTemplate?.items || [];
  const panelCompletedCount = panelItems.filter(i => i.completed).length;
  const panelProgress = panelItems.length > 0 ? Math.round((panelCompletedCount / panelItems.length) * 100) : 0;

  return (
    <div className="h-[100dvh] w-full flex flex-col lg:flex-row bg-cyber-black text-cyber-text-main font-sans overflow-hidden">
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-grid-white/[0.02]">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyber-red/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-cyber-blue/5 rounded-full blur-[100px]"></div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".json" />

      {/* MODAL */}
      <TemplateSelectorModal 
        isOpen={isTemplateSelectorOpen} 
        onClose={() => setIsTemplateSelectorOpen(false)}
        categories={categories}
        templates={templates}
        onAssign={assignTemplateToDate}
        onCreateNew={() => { setIsTemplateSelectorOpen(false); setIsCreatingTemplate(true); }}
        onQuickCustom={() => { setIsTemplateSelectorOpen(false); handleQuickCustomInit(); }}
      />

      {/* SIDEBAR */}
      <aside 
        className={`
          flex flex-col h-full bg-cyber-dark border-r border-cyber-panel shadow-2xl transition-all duration-300 ease-in-out shrink-0
          /* Mobile: Fixed overlay */
          fixed top-0 left-0 bottom-0 z-40 
          /* Desktop: Relative flow that takes space */
          lg:relative lg:z-0 lg:top-auto lg:left-auto lg:bottom-auto lg:shadow-none
          
          ${isSidebarOpen 
            ? 'translate-x-0 w-[85%] sm:w-[400px] lg:w-[400px]' 
            : '-translate-x-full lg:translate-x-0 w-[85%] sm:w-[400px] lg:w-0 lg:border-r-0 lg:overflow-hidden'
          }
        `}
      >
        <div className="p-8 border-b border-cyber-panel flex justify-between items-center bg-cyber-black/20 hidden lg:flex shrink-0">
          <h1 className="text-4xl font-black italic text-cyber-text-main flex items-center gap-3 tracking-tighter shrink-0">
            <span className="text-cyber-red">MÓJ</span>PLANER
          </h1>
          {/* Collapse Button for Desktop */}
          <button onClick={() => setSidebarOpen(false)} className="text-cyber-muted hover:text-white transition" title="Zwiń Panel">
             <PanelLeftClose className="w-6 h-6"/>
          </button>
        </div>
        
        {/* Mobile Close Button */}
        <div className="lg:hidden p-6 flex justify-end bg-cyber-dark border-b border-cyber-panel shrink-0">
          <button onClick={() => setSidebarOpen(false)} className="text-cyber-muted hover:text-white">
            <X className="w-8 h-8" />
          </button>
        </div>

        {/* Sidebar Tabs */}
        <div className="flex border-b border-cyber-panel shrink-0">
          <button onClick={() => setSidebarTab('templates')} className={`flex-1 py-4 font-bold font-mono text-lg transition flex justify-center ${sidebarTab === 'templates' ? 'bg-cyber-black text-cyber-red border-b-2 border-cyber-red' : 'text-cyber-muted hover:text-white bg-cyber-dark'}`}><LayoutGrid className="w-5 h-5" /></button>
          <button onClick={() => setSidebarTab('quests')} className={`flex-1 py-4 font-bold font-mono text-lg transition flex justify-center ${sidebarTab === 'quests' ? 'bg-cyber-black text-cyber-yellow border-b-2 border-cyber-yellow' : 'text-cyber-muted hover:text-white bg-cyber-dark'}`}><Flag className="w-5 h-5" /></button>
          <button onClick={() => setSidebarTab('pomodoro')} className={`flex-1 py-4 font-bold font-mono text-lg transition flex justify-center ${sidebarTab === 'pomodoro' ? 'bg-cyber-black text-cyber-blue border-b-2 border-cyber-blue' : 'text-cyber-muted hover:text-white bg-cyber-dark'}`}><Watch className="w-5 h-5" /></button>
          <button onClick={() => setSidebarTab('profile')} className={`flex-1 py-4 font-bold font-mono text-lg transition flex justify-center ${sidebarTab === 'profile' ? 'bg-cyber-black text-cyber-green border-b-2 border-cyber-green' : 'text-cyber-muted hover:text-white bg-cyber-dark'}`}><User className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-cyber-black/20 min-w-[320px]">
          {sidebarTab === 'templates' && (
            <SidebarTemplates 
              categories={categories} templates={templates} selectedEntry={selectedEntry} viewMode={viewMode}
              onCreateNew={() => { setIsCreatingTemplate(true); setEditingTemplate(null); if(window.innerWidth < 1024) setSidebarOpen(false); }}
              onAssignTemplate={(id) => { assignTemplateToDate(id); if (window.innerWidth < 1024) setSidebarOpen(false); }}
              onDeleteTemplate={(id, e) => { e.stopPropagation(); if(confirm("Usunąć?")) setTemplates(templates.filter(t => t.id !== id)); }}
            />
          )}
          {sidebarTab === 'quests' && (
            <SidebarQuests 
              quests={quests} newQuestTitle={newQuestTitle} setNewQuestTitle={setNewQuestTitle}
              newQuestPriority={newQuestPriority} setNewQuestPriority={setNewQuestPriority}
              newQuestDeadline={newQuestDeadline} setNewQuestDeadline={setNewQuestDeadline}
              onAddQuest={handleAddQuest} onDeleteQuest={handleDeleteQuest} onToggleQuest={handleToggleQuest}
              getPriorityColor={getPriorityColor}
            />
          )}
          {sidebarTab === 'pomodoro' && (
            <SidebarPomodoro 
              timerTime={timerTime} isTimerRunning={isTimerRunning} timerMode={timerMode}
              quests={quests} selectedQuestId={selectedQuestId} setSelectedQuestId={setSelectedQuestId}
              onToggleTimer={() => setIsTimerRunning(!isTimerRunning)}
              onResetTimer={() => { setIsTimerRunning(false); setTimerTime(timerMode === 'WORK' ? 25*60 : 5*60); }}
              onSwitchMode={(mode) => { setIsTimerRunning(false); setTimerMode(mode); setTimerTime(mode === 'WORK' ? 25*60 : 5*60); }}
              todayStats={{ count: pomodoroHistory.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString() && s.type === 'WORK').length, minutes: pomodoroHistory.filter(s => new Date(s.timestamp).toDateString() === new Date().toDateString() && s.type === 'WORK').reduce((a,b) => a+b.durationMinutes, 0) }}
            />
          )}
          {sidebarTab === 'profile' && (
            <SidebarProfile 
              userProfile={userProfile} updateProfileInfo={(f, v) => setUserProfile(p => ({...p, [f]: v}))}
              setUserProfile={setUserProfile} handleFontScale={(d) => setUserProfile(p => ({...p, fontScale: parseFloat(Math.max(0.7, Math.min(1.5, (p.fontScale || 1) + d)).toFixed(1))}))}
              newGoalTitle={newGoalTitle} setNewGoalTitle={setNewGoalTitle}
              onAddGoal={handleAddLongTermGoal} onToggleGoal={handleToggleGoal} onDeleteGoal={handleDeleteGoal}
              stats={getStats()}
            />
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-cyber-panel bg-cyber-black/50 grid grid-cols-2 gap-2 relative shrink-0">
          <div className="absolute top-[-20px] left-1/2 transform -translate-x-1/2 bg-cyber-black border border-cyber-panel text-cyber-muted text-[10px] px-2 py-0.5 font-mono whitespace-nowrap">SYSTEM v1.0 STABLE</div>
          <button onClick={handleExportData} className="flex flex-col items-center justify-center p-2 bg-cyber-dark border border-cyber-panel hover:border-cyber-blue hover:text-cyber-blue transition group">
            <Download className="w-6 h-6 mb-1 text-cyber-muted group-hover:text-cyber-blue"/><span className="text-micro font-mono uppercase font-bold">Eksport</span>
          </button>
          <button onClick={handleImportClick} className="flex flex-col items-center justify-center p-2 bg-cyber-dark border border-cyber-panel hover:border-cyber-green hover:text-cyber-green transition group">
            <Upload className="w-6 h-6 mb-1 text-cyber-muted group-hover:text-cyber-green"/><span className="text-micro font-mono uppercase font-bold">Import</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 bg-cyber-black transition-all duration-300">
        <Header 
          currentDate={currentDate} viewMode={viewMode} setViewMode={setViewMode}
          onPrev={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} 
          onNext={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} 
          onFontScale={(d) => setUserProfile(p => ({...p, fontScale: parseFloat(Math.max(0.7, Math.min(1.5, (p.fontScale || 1) + d)).toFixed(1))}))}
          selectedDateStr={selectedDateStr} toggleSidebar={() => setSidebarOpen(!isSidebarOpen)}
        />

        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 p-2 lg:p-8 overflow-y-auto custom-scrollbar bg-cyber-black">
             <div key={viewMode} className="h-full animate-view-transition">
               {viewMode === 'month' && (
                 <MonthView 
                   year={currentDate.getFullYear()} month={currentDate.getMonth()} selectedDateStr={selectedDateStr}
                   entries={entries} quests={quests}
                   getTemplateById={getTemplateById} getCategoryById={getCategoryById} getEntryForDate={getEntryForDate}
                   formatDateStr={formatDateStr}
                   onDayClick={handleDayClick} onQuickAdd={handleQuickCustomInit} 
                   onOpenSelector={(e, d) => { e.stopPropagation(); setSelectedDateStr(formatDateStr(d)); setCurrentDate(d); setIsTemplateSelectorOpen(true); }}
                   onToggleTask={handleToggleComplete}
                 />
               )}
               {viewMode === 'week' && (
                 <WeekView 
                   currentDate={currentDate} selectedDateStr={selectedDateStr} quests={quests}
                   getTemplateById={getTemplateById} getCategoryById={getCategoryById} getEntryForDate={getEntryForDate}
                   formatDateStr={formatDateStr}
                   onDayClick={handleDayClick} onQuickAdd={handleQuickCustomInit}
                   onOpenSelector={(e, d) => { e.stopPropagation(); setSelectedDateStr(formatDateStr(d)); setCurrentDate(d); setIsTemplateSelectorOpen(true); }}
                   onToggleTask={handleToggleComplete}
                 />
               )}
               {viewMode === 'day' && (
                 <DayView 
                   currentDate={currentDate} selectedDateStr={selectedDateStr} quests={quests}
                   getTemplateById={getTemplateById} getCategoryById={getCategoryById} getEntryForDate={getEntryForDate}
                   formatDateStr={formatDateStr}
                   onQuickAdd={handleQuickCustomInit}
                   onOpenSelector={(e, d) => { e.stopPropagation(); setSelectedDateStr(formatDateStr(d)); setCurrentDate(d); setIsTemplateSelectorOpen(true); }}
                   onToggleTask={handleToggleComplete}
                   onUpdateDayItem={handleUpdateDayItem} onDeleteDayItem={handleDeleteDayItem} onAddDayItem={handleAddDayItem}
                   onToggleQuest={handleToggleQuest} getPriorityColor={getPriorityColor}
                   onReorderDayItems={handleReorderDayItems}
                 />
               )}
             </div>
          </div>

          {(isCreatingTemplate || editingTemplate || (selectedDateStr && selectedEntryTemplate && viewMode === 'month')) && (
            <div className={`absolute 2xl:relative right-0 top-0 bottom-0 z-20 w-full md:w-[500px] bg-cyber-dark border-l border-cyber-panel shadow-2xl animate-slide-in-right overflow-hidden flex flex-col`}>
              <div className="p-4 flex justify-between items-center bg-cyber-dark border-b border-cyber-panel shrink-0">
                <span className="text-cyber-muted font-bold text-xs font-mono uppercase tracking-widest pl-2">SZCZEGÓŁY</span>
                <button onClick={() => { setSelectedDateStr(null); setEditingTemplate(null); setIsCreatingTemplate(false); }} className="text-cyber-muted hover:text-white transition flex items-center gap-2 uppercase font-bold text-xs tracking-widest bg-cyber-black/50 px-3 py-1 border border-cyber-panel hover:border-cyber-red">
                  <span>ZAMKNIJ</span> <X className="w-5 h-5" />
                </button>
              </div>
              {isCreatingTemplate || editingTemplate ? ( 
                <TemplateEditor 
                  isNew={isCreatingTemplate} initialTemplate={editingTemplate} categories={categories} 
                  onAddCategory={(c) => setCategories([...categories, c])} 
                  onSave={(t) => { isCreatingTemplate ? setTemplates([...templates, t]) : setTemplates(templates.map(old => old.id === t.id ? t : old)); setEditingTemplate(null); setIsCreatingTemplate(false); }} 
                  onCancel={() => { setIsCreatingTemplate(false); setEditingTemplate(null); }} 
                /> 
              ) : (
                <div className="h-full flex flex-col bg-cyber-dark">
                  <div className="p-6 lg:p-10 border-b-2 border-cyber-red bg-cyber-black/50">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-4xl lg:text-6xl font-black text-white italic tracking-tighter">
                        {selectedDateStr?.split('-')[2]}<span className="text-lg lg:text-2xl text-slate-500 not-italic ml-3 font-normal">/ {selectedDateStr?.split('-')[1]}</span>
                      </h3>
                      <button onClick={() => { const target = selectedDateStr || formatDateStr(currentDate); setEntries(prev => prev.filter(e => e.date !== target)); }} className="text-red-500 hover:text-white border border-red-500/30 hover:bg-red-500 px-4 py-2 lg:px-6 lg:py-3 text-sm lg:text-base font-bold transition uppercase">Resetuj</button>
                    </div>
                    <div className="flex items-center gap-4 lg:gap-6">
                      <div className={`p-3 lg:p-4 bg-cyber-black border border-cyber-panel`}>{selectedEntryCategory?.baseType === DayType.WORK ? <Cpu className="w-6 h-6 lg:w-8 lg:h-8 text-cyber-red"/> : <Coffee className="w-6 h-6 lg:w-8 lg:h-8 text-cyber-blue"/>}</div>
                      <div>
                        <span className={`text-xl lg:text-2xl font-bold tracking-widest block leading-none text-${selectedEntryCategory?.color || 'white'}`}>{selectedEntryTemplate?.name}</span>
                        <span className="text-xs lg:text-sm text-slate-500 block mt-2 lg:mt-3 uppercase tracking-wider">{selectedEntryCategory?.name}</span>
                        {selectedEntryTemplate?.id !== 'tpl_custom' && (
                           <button onClick={() => { if(selectedEntryTemplate) { setEditingTemplate(selectedEntryTemplate); }}} className="text-xs lg:text-sm text-slate-500 hover:text-white underline mt-2 lg:mt-3">EDYTUJ SZABLON</button>
                        )}
                      </div>
                    </div>
                    {/* Panel Progress Bar */}
                    <div className="mt-6 flex items-center gap-4">
                      <div className="flex-1 h-2 bg-cyber-black border border-cyber-panel relative">
                        <div className="absolute inset-y-0 left-0 bg-cyber-green transition-all duration-500" style={{ width: `${panelProgress}%` }}></div>
                      </div>
                      <span className="text-mono font-bold text-cyber-green">{panelProgress}%</span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 lg:p-10 relative bg-cyber-dark space-y-4">
                    <div className="flex items-center gap-2 mb-4 text-cyber-muted font-mono uppercase text-sm tracking-widest border-b border-cyber-panel pb-2">
                      <ShieldCheck className="w-4 h-4" /> Lista Zadań
                    </div>
                    {panelItems.length === 0 && <p className="text-slate-500 italic">Brak zadań w harmonogramie.</p>}
                    {panelItems.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => selectedDateStr && handleToggleComplete(selectedDateStr, item.id)}
                        className={`p-4 border-l-4 bg-cyber-black/30 hover:bg-cyber-panel/20 cursor-pointer transition group flex items-start gap-4 ${item.completed ? 'border-cyber-green opacity-60' : 'border-cyber-panel hover:border-cyber-red'}`}
                      >
                         <button className={`mt-1 shrink-0 ${item.completed ? 'text-cyber-green' : 'text-slate-600 group-hover:text-white'}`}>
                            {item.completed ? <CheckCircle2 className="w-6 h-6"/> : <Circle className="w-6 h-6"/>}
                         </button>
                         <div>
                            <div className="flex items-center gap-2 text-xs font-mono font-bold mb-1">
                               <span className={item.completed ? 'text-cyber-green' : 'text-cyber-red'}>{item.startTime}</span>
                               <span className="text-slate-600">-</span>
                               <span className="text-slate-500">{item.endTime}</span>
                            </div>
                            <div className={`text-lg font-bold leading-tight ${item.completed ? 'line-through text-slate-500' : 'text-white'}`}>
                              {item.activity}
                            </div>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
