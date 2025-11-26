
import React from 'react';
import { LayoutGrid, X, Folder, Edit } from 'lucide-react';
import { Template, TemplateCategory } from '../../types';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: TemplateCategory[];
  templates: Template[];
  onAssign: (id: string) => void;
  onCreateNew: () => void;
  onQuickCustom: () => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  categories,
  templates,
  onAssign,
  onCreateNew,
  onQuickCustom
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-cyber-dark border-2 border-cyber-red max-w-2xl w-full flex flex-col max-h-[80vh] shadow-neon-red relative overflow-hidden">
        <div className="p-6 border-b border-cyber-panel flex justify-between items-center bg-cyber-black/80">
          <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-2">
            <LayoutGrid className="w-6 h-6 text-cyber-red" /> WYBIERZ SZABLON
          </h2>
          <button onClick={onClose} className="text-cyber-muted hover:text-white">
            <X className="w-8 h-8" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-cyber-black/90 custom-scrollbar">
          {categories.map(cat => {
            const catTemplates = templates.filter(t => t.categoryId === cat.id);
            if (catTemplates.length === 0) return null;
            return (
              <div key={cat.id}>
                <div className={`text-base font-mono font-bold text-${cat.color} mb-3 flex items-center gap-2 uppercase`}>
                  <Folder className="w-4 h-4"/> {cat.name}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {catTemplates.map(tpl => (
                    <button 
                      key={tpl.id} 
                      onClick={() => onAssign(tpl.id)} 
                      className={`text-left p-4 border bg-cyber-dark hover:bg-cyber-panel/30 transition group border-cyber-panel hover:border-${cat.color} hover:shadow-lg relative overflow-hidden`}
                    >
                      <div className={`absolute top-0 left-0 w-1 h-full bg-${cat.color} group-hover:w-2 transition-all`}></div>
                      <span className="block text-lg font-bold text-white mb-1 pl-2">{tpl.name}</span>
                      <span className="block text-xs font-mono text-slate-500 pl-2 uppercase">{tpl.items.length} ZADAŃ</span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
          {templates.length === 0 && (
            <div className="text-center py-10">
              <p className="text-cyber-muted font-mono mb-4">BRAK ZDEFINIOWANYCH SZABLONÓW</p>
              <button onClick={() => { onClose(); onCreateNew(); }} className="text-cyber-red hover:underline">
                + UTWÓRZ NOWY SZABLON
              </button>
            </div>
          )}
          <div className="pt-6 border-t border-cyber-panel mt-6">
            <button 
              onClick={onQuickCustom}
              className="w-full py-4 bg-cyber-purple text-black font-bold uppercase tracking-widest hover:bg-white transition flex items-center justify-center gap-2"
            >
              <Edit className="w-5 h-5" /> PUSTY DZIEŃ (NIESTANDARDOWY)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
