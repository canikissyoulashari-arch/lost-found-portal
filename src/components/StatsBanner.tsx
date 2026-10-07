import React from 'react';
import { Item, AutoMatchResult } from '../types';
import { 
  PackageSearch, 
  Sparkles, 
  CheckCircle2, 
  MapPin, 
  ShieldAlert,
  ArrowRight,
  Zap
} from 'lucide-react';

interface StatsBannerProps {
  items: Item[];
  matches: AutoMatchResult[];
  onOpenReportLost: () => void;
  onOpenReportFound: () => void;
  onOpenAutoMatch: () => void;
  onOpenSolver: () => void;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  items,
  matches,
  onOpenReportLost,
  onOpenReportFound,
  onOpenAutoMatch,
  onOpenSolver
}) => {
  const lostCount = items.filter(i => i.type === 'lost' && i.status !== 'returned').length;
  const foundCount = items.filter(i => i.type === 'found' && i.status !== 'returned').length;
  const returnedCount = items.filter(i => i.status === 'returned').length + 86; // add baseline term total
  const topMatch = matches[0];

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border-b border-indigo-900/50 text-white py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Headline and Fast Report Buttons */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full border border-emerald-500/35 flex-wrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-semibold">BBSUTSD Khairpur Mirs &bull; Official Campus Recovery Network</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              BBSUTSD SmartRecovery Portal <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-300">
                Real-Time Auto-Match &amp; QR SafeTagging
              </span>
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Official property recovery network for The Benazir Bhutto Shaheed University of Technology and Skill Development. Developed by <strong className="text-emerald-300 font-semibold">Asghar Lashari &amp; Naseem Jalbani</strong> (Dept. of CS &amp; IT) to safeguard student and faculty belongings.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                onClick={onOpenSolver}
                className="bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-amber-400/25 transition active:scale-95"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>⚡ Real-Time Solver</span>
              </button>

              <button
                onClick={onOpenReportLost}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 border border-slate-700 transition active:scale-95"
              >
                <PackageSearch className="w-4 h-4 text-amber-400" />
                <span>I Lost Something</span>
              </button>

              <button
                onClick={onOpenReportFound}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>I Found Something</span>
              </button>

              {matches.length > 0 && (
                <button
                  onClick={onOpenAutoMatch}
                  className="bg-slate-800/80 hover:bg-slate-700/80 text-amber-300 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-amber-500/30 flex items-center gap-1.5 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>{matches.length} Matches Detected</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Metrics cards grid */}
          <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-3 gap-3">
            
            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-xs text-amber-400 mb-1">
                <span>Active Lost</span>
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-bold text-white">{lostCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Campus alerts</div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 p-3.5 rounded-xl">
              <div className="flex items-center justify-between text-xs text-emerald-400 mb-1">
                <span>In Custody</span>
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-bold text-white">{foundCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">Ready for claim</div>
            </div>

            <div className="bg-slate-800/60 backdrop-blur-sm border border-slate-700/60 p-3.5 rounded-xl col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-xs text-blue-400 mb-1">
                <span>Returned</span>
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="text-2xl font-bold text-white">{returnedCount}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">84% recovery rate</div>
            </div>

            {/* Live Highlight notice if match is ready */}
            {topMatch && (
              <div 
                onClick={onOpenAutoMatch}
                className="col-span-2 sm:col-span-3 bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/30 p-2.5 rounded-xl cursor-pointer hover:border-amber-400/50 transition flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="font-semibold text-amber-300">{topMatch.confidenceScore}% Match Detected:</span>
                  <span className="text-slate-200 truncate max-w-[200px] sm:max-w-xs">{topMatch.lostItem.title}</span>
                </div>
                <span className="text-[11px] text-amber-400 font-medium underline flex items-center gap-0.5 shrink-0">
                  Review <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
