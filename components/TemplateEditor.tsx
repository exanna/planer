
import React, { useState, useEffect } from 'react';
import { Template, DayType, ScheduleItem, TemplateCategory } from '../types';
import { Plus, Trash2, Save, X, Sparkles, Clock, List, ArrowRight, BrainCircuit, History } from 'lucide-react';
import { generateSchedule } from '../services/geminiService';

interface TemplateEditorProps {
  initialTemplate?: Template | null;
  categories: TemplateCategory[];
  onSave: (template: Template) => void;
  onAddCategory: (category: TemplateCategory) => void;
  onCancel: () => void;
  isNew: boolean;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({ 
  initialTemplate, 
  categories, 
  onSave, 
  onAddCategory, 
  onCancel, 
  isNew 
}) => {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [items, setItems] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [promptFocus, setPromptFocus] = useState('');
  const [error, setError] = useState<string | null>(null);

  // New Category State
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<DayType>(DayType.WORK);
  const [newCatColor, setNewCatColor] = useState('cyber-red');

  useEffect(() => {
    if (initialTemplate) {
      setName(initialTemplate.name);
      setCategoryId(initialTemplate.categoryId);
      // Ensure compatibility if legacy data exists (though types enforce new structure now)
      setItems(initialTemplate.items.map(i => ({
        ...i,
        startTime: i.startTime || (i as any).time || '00:00',
        endTime: i.endTime || '01:00'
      })));
    } else {
      setName('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setItems([{ id: Date.now().toString(), startTime: '08:00', endTime: '09:00', activity: 'Początek dnia' }]);
    }
  }, [initialTemplate, categories]);

  const handleAddItem = () => {
    // Auto-suggest time based on last item
    let nextStart = '12:00';
    let nextEnd = '13:00';
    
    if (items.length > 0) {
      const last = items[items.length - 1];
      if (last.endTime) {
        nextStart = last.endTime;
        // Add 1 hour simply
        const [h, m] = nextStart.split(':').map(Number);
        const nextH = (h + 1) % 24;
        nextEnd = `${String(nextH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      }
    }

    setItems([...items, { id: Date.now().toString(), startTime: nextStart, endTime: nextEnd, activity: '' }]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof ScheduleItem, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const calculateDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const [startH, startM] = start.split(':').map(Number);
    const [endH, endM] = end.split(':').map(Number);
    
    let diffM = (endH * 60 + endM) - (startH * 60 + startM);
    if (diffM < 0) diffM += 24 * 60; // Handle crossing midnight
    
    const hours = Math.floor(diffM / 60);
    const minutes = diffM % 60;
    
    if (hours > 0 && minutes > 0) return `${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h`;
    return `${minutes}m`;
  };

  const handleSave = () => {
    if (!name.trim()) {
      setError("NAZWA JEST WYMAGANA");
      return;
    }
    if (!categoryId) {
      setError("WYBIERZ KATEGORIĘ");
      return;
    }

    onSave({
      id: initialTemplate?.id || Date.now().toString(),
      name: name.toUpperCase(),
      categoryId,
      items: items.sort((a, b) => a.startTime.localeCompare(b.startTime)),
    });
  };

  const handleSaveCategory = () => {
    if(!newCatName.trim()) return;
    const newCat: TemplateCategory = {
      id: `cat_${Date.now()}`,
      name: newCatName.toUpperCase(),
      baseType: newCatType,
      color: newCatColor
    };
    onAddCategory(newCat);
    setCategoryId(newCat.id); // Auto select new category
    setIsAddingCategory(false);
    setNewCatName('');
  };

  const handleAIGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const selectedCategory = categories.find(c => c.id === categoryId);
      const type = selectedCategory ? selectedCategory.baseType : DayType.WORK;
      const generatedItems = await generateSchedule(type, promptFocus);
      setItems(generatedItems);
    } catch (err) {
      setError("BŁĄD GENEROWANIA. SPRAWDŹ POŁĄCZENIE.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c.id === categoryId);

  return (
    <div className="bg-cyber-dark border-l border-white/10 h-full flex flex-col shadow-2xl relative z-50">
      {/* Header */}
      <div className="p-8 border-b border-white/10 flex justify-between items-center bg-cyber-panel/30">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3 tracking-widest">
          {isNew ? <Plus className="w-8 h-8 text-cyber-red" /> : <List className="w-8 h-8 text-cyber-red" />}
          {isNew ? 'NOWY SZABLON' : 'EDYTOR SZABLONU'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-white transition">
          <X className="w-10 h-10" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-10 bg-cyber-black/50 custom-scrollbar">
        {/* Form Fields */}
        <div className="space-y-8">
          <div>
            <label className="block text-xl font-mono font-bold text-cyber-light mb-3 uppercase">Nazwa Szablonu</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-cyber-black border-2 border-cyber-panel text-white px-6 py-5 focus:border-cyber-red outline-none transition font-mono placeholder-slate-600 text-2xl shadow-inner"
              placeholder="np. PRACA ZDALNA"
            />
          </div>

          <div>
            <label className="block text-xl font-mono font-bold text-cyber-light mb-3 uppercase flex justify-between">
              <span>Kategoria</span>
              {!isAddingCategory && (
                <button onClick={() => setIsAddingCategory(true)} className="text-base text-cyber-red hover:underline flex items-center gap-1">
                  <Plus className="w-4 h-4" /> NOWA KATEGORIA
                </button>
              )}
            </label>
            
            {!isAddingCategory ? (
              <div className="relative group">
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-cyber-black border-2 border-cyber-panel text-white px-6 py-5 focus:border-cyber-red outline-none transition font-mono appearance-none text-xl relative z-10 bg-transparent"
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id} className="bg-cyber-black text-white">{cat.name}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none z-0">
                  <div className={`w-8 h-8 bg-${selectedCategory?.color || 'slate-500'} shadow-sm`}></div>
                </div>
              </div>
            ) : (
              <div className="p-6 bg-cyber-black border-2 border-cyber-red/30 animate-in fade-in slide-in-from-top-2 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-20"><BrainCircuit className="w-16 h-16 text-cyber-red"/></div>
                <div className="space-y-6 relative z-10">
                  <div>
                    <label className="text-xs text-cyber-red uppercase font-bold mb-1 block">Nazwa Kategorii</label>
                    <input
                       type="text"
                       value={newCatName}
                       onChange={(e) => setNewCatName(e.target.value)}
                       placeholder="NP. HOBBY"
                       className="w-full bg-cyber-dark px-6 py-4 text-xl text-white border border-cyber-panel focus:border-cyber-red outline-none font-mono"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-cyber-red uppercase font-bold mb-2 block">Kolor Systemowy</label>
                    <div className="flex gap-4">
                      {['cyber-red', 'cyber-blue', 'cyber-yellow', 'cyber-purple', 'cyber-green'].map(color => (
                         <button
                           key={color}
                           onClick={() => setNewCatColor(color)}
                           className={`w-12 h-12 border-2 transition-transform ${newCatColor === color ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60 hover:opacity-100'} bg-${color}`}
                         />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-cyber-red uppercase font-bold mb-2 block">Typ Dnia</label>
                    <div className="flex gap-3 text-base font-mono">
                       <button 
                         onClick={() => setNewCatType(DayType.WORK)}
                         className={`px-6 py-3 border-2 transition-all ${newCatType === DayType.WORK ? 'bg-cyber-red text-black border-cyber-red font-bold' : 'border-cyber-panel text-slate-500 hover:border-cyber-red/50'}`}
                       >
                         PRACA
                       </button>
                       <button 
                         onClick={() => setNewCatType(DayType.OFF)}
                         className={`px-6 py-3 border-2 transition-all ${newCatType === DayType.OFF ? 'bg-cyber-blue text-black border-cyber-blue font-bold' : 'border-cyber-panel text-slate-500 hover:border-cyber-blue/50'}`}
                       >
                         WOLNE
                       </button>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-cyber-panel/30">
                    <button onClick={() => setIsAddingCategory(false)} className="text-base text-slate-500 p-3 hover:text-white transition">ANULUJ</button>
                    <button onClick={handleSaveCategory} className="text-base bg-white text-black px-8 py-3 font-bold hover:bg-cyber-red transition shadow-lg">DODAJ</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Generator Section */}
        <div className="border-2 border-dashed border-cyber-panel p-8 bg-cyber-panel/10 relative overflow-hidden group hover:border-cyber-red/50 transition-colors">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:20px_20px]"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 text-cyber-red font-mono text-lg font-bold tracking-wider">
              <Sparkles className="w-6 h-6 animate-pulse" />
              <span>GENERATOR AI</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={promptFocus}
                onChange={(e) => setPromptFocus(e.target.value)}
                placeholder="CEL: np. Sprzątanie domu, Nauka angielskiego..."
                className="flex-1 bg-cyber-black border border-cyber-panel text-white px-6 py-4 text-xl focus:border-cyber-red outline-none font-mono placeholder-slate-600"
              />
              <button
                onClick={handleAIGenerate}
                disabled={loading}
                className="px-8 py-4 bg-cyber-red text-black text-lg font-bold hover:bg-white hover:text-cyber-red transition flex items-center justify-center gap-3 disabled:opacity-50 min-w-[180px]"
              >
                {loading ? <span className="animate-pulse flex items-center gap-2"><BrainCircuit className="w-5 h-5 animate-spin" /> TWORZENIE...</span> : 'STWÓRZ PLAN'}
              </button>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-6">
          <h3 className="text-xl font-mono font-bold text-slate-400 uppercase border-b border-cyber-panel pb-3 flex justify-between items-center">
            <span>Harmonogram</span>
            <span className="text-base text-cyber-red">{items.length} ZADAŃ</span>
          </h3>
          
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col sm:flex-row gap-0 sm:gap-0 items-stretch group bg-cyber-black border-l-4 border-cyber-panel hover:border-cyber-red transition shadow-sm hover:shadow-neon-red/20">
                
                {/* Time Inputs & Duration */}
                <div className="relative w-full sm:w-auto border-b sm:border-b-0 sm:border-r border-cyber-panel bg-cyber-dark/30 flex flex-col justify-center">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none opacity-50">
                     <Clock className="w-5 h-5 text-cyber-red" />
                  </div>
                  <div className="flex items-center pl-12 pr-4 py-2">
                    <input
                      type="time"
                      value={item.startTime}
                      onChange={(e) => handleItemChange(item.id, 'startTime', e.target.value)}
                      className="w-[95px] bg-transparent text-white text-xl font-mono focus:text-cyber-red outline-none p-1 border-b border-transparent focus:border-cyber-red transition-colors"
                    />
                    <ArrowRight className="w-5 h-5 text-slate-500 mx-2" />
                    <input
                      type="time"
                      value={item.endTime}
                      onChange={(e) => handleItemChange(item.id, 'endTime', e.target.value)}
                      className="w-[95px] bg-transparent text-white text-xl font-mono focus:text-cyber-red outline-none p-1 border-b border-transparent focus:border-cyber-red transition-colors"
                    />
                  </div>
                  {/* Interval Display */}
                  <div className="pl-12 pb-2 text-xs font-mono font-bold text-cyber-blue flex items-center gap-2 uppercase tracking-wide opacity-80">
                    <History className="w-3 h-3" />
                    {calculateDuration(item.startTime, item.endTime)}
                  </div>
                </div>
                
                {/* Activity Input */}
                <input
                  type="text"
                  value={item.activity}
                  onChange={(e) => handleItemChange(item.id, 'activity', e.target.value)}
                  placeholder="Opis zadania..."
                  className="flex-1 px-6 py-5 bg-transparent text-white text-xl focus:bg-cyber-panel/30 outline-none placeholder-slate-700 font-medium"
                />
                
                {/* Delete Button */}
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="bg-cyber-black text-slate-500 hover:bg-red-900/50 hover:text-red-500 transition px-6 py-3 sm:py-0 border-t sm:border-t-0 sm:border-l border-cyber-panel group-hover:border-cyber-red"
                >
                  <Trash2 className="w-6 h-6 mx-auto" />
                </button>
              </div>
            ))}
          </div>
          
          <button
            onClick={handleAddItem}
            className="w-full py-6 border-2 border-dashed border-cyber-panel text-slate-400 text-lg font-mono font-bold hover:border-cyber-red hover:text-cyber-red hover:bg-cyber-red/5 transition flex items-center justify-center gap-3 uppercase tracking-wider group"
          >
            <Plus className="w-6 h-6 group-hover:rotate-90 transition-transform" /> Dodaj Zadanie
          </button>
        </div>

        {error && <div className="p-6 bg-red-900/50 border-l-4 border-red-500 text-white text-lg font-mono animate-pulse">{error}</div>}
      </div>

      <div className="p-8 border-t border-white/10 bg-cyber-panel/30">
        <button
          onClick={handleSave}
          className="w-full bg-cyber-red text-black py-6 text-2xl font-bold hover:bg-white hover:text-red-600 transition flex items-center justify-center gap-3 uppercase tracking-widest shadow-neon-red hover:scale-[1.01] active:scale-[0.99]"
          style={{ clipPath: 'polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px)' }}
        >
          <Save className="w-7 h-7" /> ZAPISZ
        </button>
      </div>
    </div>
  );
};
