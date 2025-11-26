
import React from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Columns, Maximize, ZoomIn, ZoomOut, Menu, Timer } from 'lucide-react';
import { MONTHS } from '../../constants';

interface HeaderProps {
  currentDate: Date;
  viewMode: 'month' | 'week' | 'day';
  setViewMode: (mode: 'month' | 'week' | 'day') => void;
  onPrev: () => void;
  onNext: () => void;
  onFontScale: (delta: number) => void;
  selectedDateStr: string | null;
  toggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDate,
  viewMode,
  setViewMode,
  onPrev,
  onNext,
  onFontScale,
  selectedDateStr,
  toggleSidebar
}) => {
  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-cyber-dark border-b border-cyber-panel z-30 shadow-lg shrink-0">
        <div className="flex items-center gap-3 text-cyber-text-main font-bold tracking-widest text-xl">
          <Timer className="w-6 h-6 text-cyber-red" /> DAYMASTER
        </div>
        <button onClick={toggleSidebar} className="text-cyber-text-main hover:text-cyber-red transition">
          <Menu className="w-8 h-8" />
        </button>
      </div>

      {/* Main Desktop Header */}
      <header className="h-auto lg:h-32 border-b border-cyber-panel flex flex-col lg:flex-row items-center justify-between px-4 lg:px-10 py-4 lg:py-0 shrink-0 bg-cyber-dark shadow-md gap-4">
        <div className="flex items-center gap-4 lg:gap-8 w-full lg:w-auto justify-between lg:justify-start">
          
          {/* Desktop Sidebar Toggle */}
          <button onClick={toggleSidebar} className="hidden lg:block text-cyber-muted hover:text-white transition p-2 border border-transparent hover:border-cyber-panel">
            <Menu className="w-6 h-6 lg:w-8 lg:h-8" />
          </button>

          <h2 className="font-black text-cyber-text-main italic tracking-tighter flex items-center gap-2 lg:gap-4 text-2xl lg:text-3xl">
            <span className="text-cyber-red text-3xl lg:text-4xl">/</span>
            {viewMode === 'month' && (
              <>
                {MONTHS[month]} <span className="text-slate-600 font-normal not-italic text-sm">{year}</span>
              </>
            )}
            {viewMode === 'week' && (
              <span className="text-sm">TYDZIEŃ {Math.ceil((currentDate.getDate() + 6 - currentDate.getDay()) / 7)}</span>
            )}
            {viewMode === 'day' && (
              <span className="text-sm">{currentDate.getDate()} {MONTHS[month]}</span>
            )}
          </h2>

          <div className="flex bg-cyber-black border border-cyber-panel scale-90 lg:scale-100 origin-right">
            <button onClick={() => onFontScale(-0.1)} className="p-3 lg:p-4 hover:bg-cyber-panel hover:text-white transition text-cyber-muted border-r border-cyber-panel">
              <ZoomOut className="w-5 h-5" />
            </button>
            <button onClick={() => onFontScale(0.1)} className="p-3 lg:p-4 hover:bg-cyber-panel hover:text-white transition text-cyber-muted">
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          <div className="flex bg-cyber-black border border-cyber-panel scale-90 lg:scale-100 origin-right ml-2">
            <button onClick={onPrev} className="p-3 lg:p-4 hover:bg-cyber-red hover:text-black transition text-cyber-muted">
              <ChevronLeft className="w-6 h-6 lg:w-8 lg:h-8" />
            </button>
            <div className="w-px bg-cyber-panel"></div>
            <button onClick={onNext} className="p-3 lg:p-4 hover:bg-cyber-red hover:text-black transition text-cyber-muted">
              <ChevronRight className="w-6 h-6 lg:w-8 lg:h-8" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex p-1 bg-cyber-black border border-cyber-panel w-full lg:w-auto">
            <button onClick={() => setViewMode('month')} className={`flex-1 lg:flex-none px-4 lg:px-6 py-2 lg:py-3 flex items-center justify-center gap-2 lg:gap-3 text-sm lg:text-lg font-bold transition ${viewMode === 'month' ? 'bg-cyber-red text-black' : 'text-cyber-muted hover:text-white'}`}>
              <LayoutGrid className="w-5 h-5 lg:w-6 lg:h-6" /> <span className="hidden sm:inline">MIESIĄC</span>
            </button>
            <button onClick={() => setViewMode('week')} className={`flex-1 lg:flex-none px-4 lg:px-6 py-2 lg:py-3 flex items-center justify-center gap-2 lg:gap-3 text-sm lg:text-lg font-bold transition ${viewMode === 'week' ? 'bg-cyber-red text-black' : 'text-cyber-muted hover:text-white'}`}>
              <Columns className="w-5 h-5 lg:w-6 lg:h-6" /> <span className="hidden sm:inline">TYDZIEŃ</span>
            </button>
            <button onClick={() => setViewMode('day')} className={`flex-1 lg:flex-none px-4 lg:px-6 py-2 lg:py-3 flex items-center justify-center gap-2 lg:gap-3 text-sm lg:text-lg font-bold transition ${viewMode === 'day' ? 'bg-cyber-red text-black' : 'text-cyber-muted hover:text-white'}`}>
              <Maximize className="w-5 h-5 lg:w-6 lg:h-6" /> <span className="hidden sm:inline">DZIEŃ</span>
            </button>
          </div>
          {selectedDateStr && viewMode !== 'day' && (
            <div className="text-sm lg:text-lg font-mono font-bold text-cyber-red hidden xl:block bg-cyber-red/10 px-6 py-3 border border-cyber-red/20">
              {selectedDateStr}
            </div>
          )}
        </div>
      </header>
    </>
  );
};
