import React from 'react';
import { 
  Compass, 
  PlusCircle, 
  QrCode, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  RotateCcw, 
  Search, 
  Zap,
  Award,
  Mail
} from 'lucide-react';

interface NavbarProps {
  onOpenReport: (type?: 'lost' | 'found') => void;
  onOpenSafeTag: () => void;
  onOpenScanner: () => void;
  onOpenAutoMatch: () => void;
  onOpenSolver: () => void;
  onOpenAuthors: () => void;
  onOpenMap: () => void;
  activeMatchCount: number;
  currentView: 'portal' | 'map' | 'security';
  onChangeView: (view: 'portal' | 'map' | 'security') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenReport,
  onOpenSafeTag,
  onOpenScanner,
  onOpenAutoMatch,
  onOpenSolver,
  onOpenAuthors,
  onOpenMap,
  activeMatchCount,
  currentView,
  onChangeView,
  searchQuery,
  onSearchChange,
  onResetData
}) => {
  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-xl border-b border-slate-800">
      
      {/* Grand Top University Institutional Header - Requested: University name in beautiful style & cropped logo in top corner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-950 to-emerald-950 border-b border-amber-500/40 px-3 sm:px-6 py-2.5 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Top Corner Cropped Logo & Beautiful University Name */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Top Corner Cropped Seal */}
            <div 
              onClick={() => onChangeView('portal')}
              className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-full bg-white p-0.5 shadow-lg shadow-emerald-950/80 border-2 border-amber-400 ring-2 ring-emerald-500/50 shrink-0 overflow-hidden cursor-pointer hover:scale-105 transition-transform group"
              title="Official Cropped Seal — The Benazir Bhutto Shaheed University of Technology and Skill Development (BBSUTSD)"
            >
              <img 
                src="/bbsutsd_seal.png" 
                alt="BBSUTSD Official Cropped Seal" 
                className="w-full h-full object-cover rounded-full group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/bbsutsd_logo.png';
                }}
              />
              <span className="sr-only">BBSUTSD Cropped Logo</span>
            </div>

            {/* University Name Styled with Elegance and Prestige */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-extrabold text-xs sm:text-sm md:text-base tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 uppercase drop-shadow-sm font-sans">
                  The Benazir Bhutto Shaheed University of Technology &amp; Skill Development
                </h1>
                <span className="bg-gradient-to-r from-amber-400 to-yellow-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                  BBSUTSD
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-medium flex-wrap mt-0.5">
                <span className="flex items-center gap-1 text-slate-200 font-semibold">
                  <span>Khairpur Mirs, Sindh, Pakistan</span>
                </span>
                <span className="text-amber-400/80">&bull;</span>
                <span className="italic text-emerald-200">"Technology for Empowerment"</span>
                <span className="text-amber-400/80 hidden sm:inline">&bull;</span>
                <span className="text-slate-300 hidden sm:inline">HEC Recognized Public Sector University</span>
              </div>
            </div>

          </div>

          {/* Right: Author Ownership & Gmail Quick Connect */}
          <div className="flex items-center gap-2.5 text-xs justify-between lg:justify-end flex-wrap pt-1 lg:pt-0 border-t border-slate-800/80 lg:border-t-0">
            
            <a 
              
              className="bg-slate-900/90 hover:bg-slate-800 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-lg font-mono text-[11px] flex items-center gap-1.5 transition"
              title="Email Asghar Lashari (canikissyoulashari@gmail.com)"
            >
              <Mail className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline"<
              <span className="sm:hidden">Email</span>
            </a>

            <button
              onClick={onOpenAuthors}
              className="bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 border border-emerald-500/50 px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1.5 transition text-[11px]"
              title="Project Authors: Asghar Lashari & Naseem Jalbani"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Authors: Asghar Lashari &amp; Naseem Jalbani</span>
            </button>

            <button 
              onClick={onResetData}
              title="Reset sample catalog"
              className="text-slate-400 hover:text-slate-200 flex items-center gap-1 text-[11px] transition px-1.5 py-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>

        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div 
              onClick={() => onChangeView('portal')}
              className="flex items-center gap-3 cursor-pointer group"
            >
              {/* Secondary logo badge */}
              <div className="h-10 w-10 rounded-xl bg-white p-0.5 shadow-sm border border-slate-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform overflow-hidden">
                <img 
                  src="/bbsutsd_seal.png" 
                  alt="BBSUTSD Emblem" 
                  className="w-full h-full object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/bbsutsd_logo.png';
                  }}
                />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">BBSUTSD SmartRecovery</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/35 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full">
                    Official Portal
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Campus Lost &amp; Found &bull; Asghar Lashari &bull; canikissyoulashari@gmail.com
                </p>
              </div>
            </div>

            {/* Mobile action shortcuts */}
            <div className="flex items-center gap-1.5 md:hidden">
              <button
                onClick={onOpenAuthors}
                className="p-1.5 bg-emerald-950 text-emerald-300 rounded-lg border border-emerald-700/60 text-xs font-semibold"
                title="Authors"
              >
                <Award className="w-4 h-4" />
              </button>
              <button
                onClick={onOpenSolver}
                className="px-2 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 shadow-sm"
                title="Real-Time Solver"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Solver</span>
              </button>
              <button
                onClick={onOpenScanner}
                className="p-2 bg-slate-800 text-slate-200 rounded-lg hover:bg-slate-700"
                title="Scan QR"
              >
                <QrCode className="w-5 h-5 text-blue-400" />
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md mx-0 md:mx-4">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search items, keywords (e.g. AirPods, Hydro Flask, Keys)..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-slate-800/90 text-sm text-white placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Action buttons & tabs */}
          <div className="flex items-center flex-wrap gap-2">
            
            {/* Real-Time Solver CTA */}
            <button
              onClick={onOpenSolver}
              className="px-3 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 flex items-center gap-1.5 shadow-md shadow-amber-400/20 transition transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Real-Time Solver</span>
            </button>

            {/* Auto Match badge button */}
            <button
              onClick={onOpenAutoMatch}
              className={`relative px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-1.5 transition ${
                activeMatchCount > 0 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30' 
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Auto-Matches</span>
              {activeMatchCount > 0 && (
                <span className="ml-1 bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 text-[10px] rounded-full">
                  {activeMatchCount}
                </span>
              )}
            </button>

            {/* Authors & Ownership Badge Button */}
            <button
              onClick={onOpenAuthors}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-950/70 text-emerald-300 hover:bg-emerald-900 border border-emerald-600/40 flex items-center gap-1.5 transition"
              title="Project Authors: Asghar Lashari & Naseem Jalbani (BBSUTSD)"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>Authors</span>
            </button>

            {/* QR SafeTag Generator */}
            <button
              onClick={onOpenSafeTag}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-indigo-600/20 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-600/30 flex items-center gap-1.5 transition"
              title="Generate printable QR sticker for your personal belongings"
            >
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">Belonging</span> SafeTag
            </button>

            {/* Scan QR */}
            <button
              onClick={onOpenScanner}
              className="px-3 py-2 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 flex items-center gap-1.5 transition"
            >
              <QrCode className="w-4 h-4 text-cyan-400" />
              <span>Scan QR</span>
            </button>

            {/* View Switchers */}
            <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
              <button
                onClick={() => onChangeView('portal')}
                className={`px-2.5 py-1.5 rounded-md font-medium transition ${
                  currentView === 'portal' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Registry
              </button>
              <button
                onClick={() => onChangeView('map')}
                className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition ${
                  currentView === 'map' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <MapPin className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Campus</span> Map
              </button>
              <button
                onClick={() => onChangeView('security')}
                className={`px-2.5 py-1.5 rounded-md font-medium flex items-center gap-1 transition ${
                  currentView === 'security' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Security Dispatch & Custody Bins"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Security</span>
              </button>
            </div>

            {/* Primary Report CTA */}
            <button
              onClick={() => onOpenReport()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition transform active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Item</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
