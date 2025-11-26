
import React from 'react';
import { Folder, Plus, Trash2, Zap } from 'lucide-react';
import { Template, TemplateCategory, CalendarEntry } from '../../types';

interface SidebarTemplatesProps {
  categories: TemplateCategory[];
  templates: Template[];
  selectedEntry?: CalendarEntry | null;
  viewMode: string;
  onCreateNew: () => void;
  onAssignTemplate: (id: string) => void;
  onDeleteTemplate: (id: string, e: React.MouseEvent) => void;
}

export const SidebarTemplates: React.FC<SidebarTemplatesProps> = ({
  categories,
  templates,
  selectedEntry,
  viewMode,
  onCreateNew,
  onAssignTemplate,
  onDeleteTemplate
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-8 border-b-2 border-cyber-panel pb-4">
        <h3 className="text-lg font-bold font-mono text-cyber-muted uppercase tracking-widest">Twoje Szablony</h3>
        <button onClick={onCreateNew} className="bg-cyber-red text-black p-3 hover:bg-white transition" title="Nowy Szablon">
          <Plus className="w-6 h-6" />
        </button>
      </div>
      <div className="space-y-10">
        {categories.map(cat => {
          const catTemplates = templates.filter(t => t.categoryId === cat.id);
          if (catTemplates.length === 0) return null;
          return (
            <div key={cat.id}>
              <div className={`flex items-center gap-3 text-base font-bold font-mono mb-4 text-${cat.color}`}>
                <Folder className="w-5 h-5" />{cat.name}
              </div>
              <div className="space-y-5 pl-4 border-l-2 border-cyber-panel/30">
                {catTemplates.map(tpl => (
                  <div 
                    key={tpl.id} 
                    onClick={() => onAssignTemplate(tpl.id)} 
                    className={`relative p-6 cursor-pointer transition group border bg-cyber-black border-cyber-panel hover:border-${cat.color} hover:shadow-lg ${selectedEntry?.templateId === tpl.id && viewMode !== 'day' ? 'ring-2 ring-white border-white' : ''}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xl font-bold font-mono tracking-tight text-white group-hover:text-cyber-red transition">
                        {tpl.name}
                      </span>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="flex items-center gap-2 text-sm font-mono font-bold opacity-60 uppercase text-slate-400">
                        <Zap className="w-4 h-4" />{tpl.items.length} ZADAŃ
                      </div>
                      <button onClick={(e) => onDeleteTemplate(tpl.id, e)} className="text-slate-600 hover:text-red-500 z-10 p-2 rounded">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute top-0 right-0 bg-cyber-red text-black text-xs font-bold px-3 py-1 opacity-0 group-hover:opacity-100 transition">
                      PRZYPISZ
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
};
