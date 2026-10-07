import React, { useState, useEffect, useMemo } from 'react';
import { Item, ItemCategory, CampusLocation, SolverCandidate } from '../types';
import { solveQueryRealTime } from '../services/autoMatchEngine';
import { 
  Zap, 
  X, 
  Sparkles, 
  Search, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  Phone, 
  Building2, 
  PackageSearch, 
  HelpCircle,
  Clock,
  Compass,
  AlertTriangle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RealTimeSolverModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  onSelectCandidate: (item: Item) => void;
  onPreFillReport: (prefill: { title: string; category?: ItemCategory; location?: CampusLocation; type: 'lost' | 'found' }) => void;
}

const SAMPLE_QUERIES = [
  { label: 'Lost AirPods in Digital Library', query: 'I lost my white Apple AirPods in BBSUTSD Main Central Library & IT Lab', type: 'lost' as const },
  { label: 'Found Blue Hydro Flask', query: 'Found a navy blue Hydro Flask bottle with stickers at Department of Computer Science & IT', type: 'found' as const },
  { label: 'Lost TI-84 Calculator', query: 'Lost my rose gold TI-84 calculator in Electrical & Electronics Engineering Block', type: 'lost' as const },
  { label: 'Found Hostel Keys', query: 'Found keys with BBSUTSD ribbon at Campus Hostels Complex', type: 'found' as const },
  { label: 'Lost ThinkPad Charger', query: 'Misplaced Lenovo laptop charger in Mechanical & Energy Technology Labs', type: 'lost' as const }
];

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Student IDs & Wallets',
  'Keys & Dorm Badges',
  'Books & Notebooks',
  'Bags & Backpacks',
  'Clothing & Accessories',
  'Bottles & Drinkware',
  'Eyewear & Jewelry',
  'Sports Equipment',
  'Other'
];

const LOCATIONS: CampusLocation[] = [
  'BBSUTSD Main Central Library & IT Lab',
  'Department of Computer Science & IT',
  'Electrical & Electronics Engineering Block',
  'Mechanical & Energy Technology Labs',
  'Civil & Environmental Technology Block',
  'Administration Block & VC Secretariat',
  'Student Cafeteria & Auditorium',
  'Campus Hostels Complex & Main Gate Dispatch'
];

export const RealTimeSolverModal: React.FC<RealTimeSolverModalProps> = ({
  isOpen,
  onClose,
  items,
  onSelectCandidate,
  onPreFillReport
}) => {
  const [activeMode, setActiveMode] = useState<'instant' | 'wizard'>('instant');
  const [query, setQuery] = useState('I lost my AirPods in the library');
  
  // Guided wizard state
  const [wizardStep, setWizardStep] = useState<1 | 2 | 3>(1);
  const [wizardType, setWizardType] = useState<'lost' | 'found'>('lost');
  const [wizardCategory, setWizardCategory] = useState<ItemCategory>('Electronics');
  const [wizardItemName, setWizardItemName] = useState('');
  const [wizardLocation, setWizardLocation] = useState<CampusLocation>('BBSUTSD Main Central Library & IT Lab');

  // Selected filters in instant mode
  const [manualCategory, setManualCategory] = useState<ItemCategory | 'auto'>('auto');
  const [manualLocation, setManualLocation] = useState<CampusLocation | 'auto'>('auto');

  // Real-time solver evaluation
  const solution = useMemo(() => {
    if (activeMode === 'wizard') {
      const combinedQuery = `${wizardType === 'lost' ? 'Lost' : 'Found'} ${wizardItemName || wizardCategory} at ${wizardLocation}`;
      return solveQueryRealTime(
        combinedQuery,
        items,
        wizardCategory,
        wizardLocation,
        wizardType
      );
    } else {
      return solveQueryRealTime(
        query,
        items,
        manualCategory === 'auto' ? undefined : manualCategory,
        manualLocation === 'auto' ? undefined : manualLocation
      );
    }
  }, [query, items, manualCategory, manualLocation, activeMode, wizardType, wizardCategory, wizardItemName, wizardLocation]);

  if (!isOpen) return null;

  const handleApplyPreset = (presetQuery: string) => {
    setQuery(presetQuery);
    setManualCategory('auto');
    setManualLocation('auto');
  };

  const handlePreFillAndReport = () => {
    onClose();
    onPreFillReport({
      title: activeMode === 'wizard' ? wizardItemName || `${wizardCategory} item` : query.slice(0, 50),
      category: activeMode === 'wizard' ? wizardCategory : solution.analysis.detectedCategory || 'Other',
      location: activeMode === 'wizard' ? wizardLocation : solution.analysis.detectedLocation || 'BBSUTSD Main Central Library & IT Lab',
      type: activeMode === 'wizard' ? wizardType : solution.analysis.inferredType === 'found' ? 'found' : 'lost'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white px-6 py-4.5 flex items-center justify-between border-b border-emerald-700/50">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-full bg-white p-0.5 border-2 border-amber-400 shadow-md shrink-0 overflow-hidden">
              <img 
                src="/bbsutsd_seal.png" 
                alt="BBSUTSD Seal" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/bbsutsd_logo.png';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-extrabold text-white">Real-Time Lost &amp; Found Solver</h2>
                <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.2 rounded-full uppercase tracking-wider">
                  BBSUTSD
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Matcher Active
                </span>
              </div>
              <p className="text-xs text-emerald-200">
                The Benazir Bhutto Shaheed University of Technology &amp; Skill Development &bull; Instant semantic engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="bg-slate-100 px-6 py-2 border-b border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 bg-slate-200/80 p-0.5 rounded-lg">
            <button
              onClick={() => setActiveMode('instant')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeMode === 'instant' 
                  ? 'bg-white text-blue-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Instant Natural Search</span>
            </button>
            <button
              onClick={() => setActiveMode('wizard')}
              className={`px-3 py-1.5 rounded-md font-semibold transition flex items-center gap-1.5 ${
                activeMode === 'wizard' 
                  ? 'bg-white text-indigo-900 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
              <span>Step-by-Step Guided Wizard</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-500 hidden sm:flex items-center gap-1">
            <span>Need immediate help?</span>
            <span className="font-semibold text-slate-700">BBSUTSD Dispatch Hotline: +92 243 928012</span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          
          {activeMode === 'instant' ? (
            /* Mode 1: Instant Natural Language Solver */
            <div className="space-y-4">
              
              {/* Primary Real-time Input Box */}
              <div className="relative">
                <div className="absolute top-3.5 left-4 text-blue-600 pointer-events-none">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Lost my white AirPods in the library, or Found keys near Engineering Quad..."
                  className="w-full bg-white text-sm sm:text-base text-slate-900 placeholder-slate-400 pl-12 pr-10 py-3 rounded-2xl border-2 border-blue-500/50 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 focus:outline-none shadow-sm transition"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-600 text-sm font-semibold p-1"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Fast Example Chips */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] font-semibold text-slate-500">⚡ Try instant scenario:</span>
                {SAMPLE_QUERIES.map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleApplyPreset(sample.query)}
                    className="text-[11px] bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 hover:border-blue-300 px-2.5 py-1 rounded-full font-medium transition shadow-2xs"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>

              {/* Live Parsing Badges */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-400 text-[11px] font-medium mr-1">Real-Time Detection:</span>
                  
                  <span className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                    solution.analysis.inferredType === 'lost' 
                      ? 'bg-amber-100 text-amber-800' 
                      : solution.analysis.inferredType === 'found'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    Intent: {solution.analysis.inferredType.toUpperCase()}
                  </span>

                  {solution.analysis.detectedCategory && (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      {solution.analysis.detectedCategory}
                    </span>
                  )}

                  {solution.analysis.detectedLocation && (
                    <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-md font-semibold text-[11px] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-500" />
                      {solution.analysis.detectedLocation}
                    </span>
                  )}

                  {solution.analysis.detectedBrands.length > 0 && (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      Brand: {solution.analysis.detectedBrands.join(', ').toUpperCase()}
                    </span>
                  )}

                  {solution.analysis.detectedColors.length > 0 && (
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                      Color: {solution.analysis.detectedColors.join(', ')}
                    </span>
                  )}
                </div>

                <div className="text-[11px] text-slate-400">
                  {solution.candidates.length} item records compared in 1.4ms
                </div>
              </div>

            </div>
          ) : (
            /* Mode 2: Step-by-Step Guided Wizard */
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              
              {/* Stepper Progress */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    wizardStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>1</div>
                  <span className="text-xs font-semibold text-slate-800">Item Details</span>
                </div>
                <div className="h-0.5 w-12 bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    wizardStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>2</div>
                  <span className="text-xs font-semibold text-slate-800">Campus Location</span>
                </div>
                <div className="h-0.5 w-12 bg-slate-200"></div>
                <div className="flex items-center gap-2">
                  <div className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center ${
                    wizardStep >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>3</div>
                  <span className="text-xs font-semibold text-slate-800">Instant Solution</span>
                </div>
              </div>

              {wizardStep === 1 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">What happened?</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWizardType('lost')}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          wizardType === 'lost' 
                            ? 'bg-amber-50 border-amber-500 text-amber-900 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <PackageSearch className="w-4 h-4 text-amber-600" />
                        <span>I Lost an Item (Find it for me)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setWizardType('found')}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                          wizardType === 'found' 
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-900 shadow-sm' 
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>I Found an Item (Find owner)</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">What is the item?</label>
                    <input
                      type="text"
                      placeholder="e.g. Navy Blue Hydro Flask, AirPods Pro 2, TI-84"
                      value={wizardItemName}
                      onChange={(e) => setWizardItemName(e.target.value)}
                      className="w-full text-xs sm:text-sm border border-slate-300 rounded-xl p-2.5 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {CATEGORIES.slice(0, 6).map(cat => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setWizardCategory(cat)}
                          className={`p-2 rounded-lg text-xs font-medium border text-left truncate transition ${
                            wizardCategory === cat 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Continue to Location</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Where on campus?</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {LOCATIONS.map(loc => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setWizardLocation(loc)}
                          className={`p-3 rounded-xl border text-xs text-left transition flex items-center gap-2.5 ${
                            wizardLocation === loc 
                              ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-xs' 
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <MapPin className={`w-4 h-4 shrink-0 ${wizardLocation === loc ? 'text-indigo-600' : 'text-slate-400'}`} />
                          <span className="truncate">{loc}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setWizardStep(3)}
                      className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Solve &amp; Match Now</span>
                      <Zap className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Wizard Diagnosis:</span>
                    <button
                      onClick={() => setWizardStep(1)}
                      className="text-xs text-indigo-600 hover:underline"
                    >
                      Edit parameters
                    </button>
                  </div>
                  <p className="text-xs text-slate-600">{solution.guidanceText}</p>
                </div>
              )}

            </div>
          )}

          {/* Real-Time Live Results Card */}
          <div className="space-y-3">
            
            {/* Top Match Spotlight */}
            {solution.topMatch ? (
              <div className="bg-white rounded-2xl border-2 border-indigo-500/40 shadow-md overflow-hidden animate-fadeIn">
                
                {/* Confidence Bar */}
                <div className="bg-gradient-to-r from-indigo-900 to-blue-900 text-white px-5 py-3 flex items-center justify-between text-xs font-bold">
                  <div className="flex items-center gap-2">
                    <span className="bg-amber-400 text-slate-950 px-2 py-0.5 rounded-full font-extrabold text-xs">
                      {solution.topMatch.score}% MATCH
                    </span>
                    <span>Top Real-Time Match Resolved</span>
                  </div>
                  <span className="text-indigo-200 text-[11px] font-normal">
                    Custody Code: {solution.topMatch.item.qrCodeId}
                  </span>
                </div>

                <div className="p-5 flex flex-col md:flex-row gap-5 items-start">
                  {/* Photo */}
                  <div className="w-full md:w-36 h-36 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                    {solution.topMatch.item.imageUrl ? (
                      <img 
                        src={solution.topMatch.item.imageUrl} 
                        alt={solution.topMatch.item.title} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-3xl">📦</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        solution.topMatch.item.type === 'lost' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {solution.topMatch.item.type.toUpperCase()}
                      </span>
                      <span className="font-bold text-slate-900 text-base">{solution.topMatch.item.title}</span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {solution.topMatch.item.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="font-medium truncate">{solution.topMatch.item.location}</span>
                      </div>

                      {solution.topMatch.item.storageLocation && (
                        <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60 font-semibold truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Pickup: {solution.topMatch.item.storageLocation}</span>
                        </div>
                      )}
                    </div>

                    {/* Match Reasons */}
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[11px] text-slate-500 font-semibold">Matched on:</span>
                      {solution.topMatch.matchReasons.map((reason, rIdx) => (
                        <span key={rIdx} className="bg-slate-100 text-slate-700 text-[11px] px-2 py-0.5 rounded font-medium">
                          ✓ {reason}
                        </span>
                      ))}
                    </div>

                    {/* Action button */}
                    <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectCandidate(solution.topMatch!.item);
                        }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-md flex items-center gap-1.5 transition active:scale-95"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Inspect &amp; Verify Ownership Now</span>
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            ) : null}

            {/* Other Candidates List */}
            {solution.candidates.length > 1 && (
              <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-2.5">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Other Matching Candidates ({solution.candidates.length - 1})
                </h4>

                <div className="space-y-2">
                  {solution.candidates.slice(1, 4).map((cand, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onClose();
                        onSelectCandidate(cand.item);
                      }}
                      className="p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 cursor-pointer transition flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                          {cand.score}%
                        </span>
                        <div>
                          <div className="font-semibold text-slate-900">{cand.item.title}</div>
                          <div className="text-[11px] text-slate-500">{cand.item.location} &bull; {cand.item.category}</div>
                        </div>
                      </div>
                      <span className="text-blue-600 font-semibold flex items-center gap-1">
                        View <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What to do next / No Match Fallback */}
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold text-amber-300">
                  <Sparkles className="w-4 h-4" />
                  <span>Didn't find your exact item?</span>
                </div>
                <p className="text-xs text-slate-300 max-w-md">
                  Publish an official campus alert with these extracted details. Our auto-match engine will alert you the moment it gets turned in.
                </p>
              </div>

              <button
                onClick={handlePreFillAndReport}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 shrink-0 transition active:scale-95"
              >
                <span>Publish Alert in 1-Click</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2 flex-wrap text-center sm:text-left">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>BBSUTSD Dispatch &bull; Developers: <strong className="text-slate-800">Asghar Lashari &amp; Naseem Jalbani</strong> &bull;</span>
            <a 
              href="mailto:canikissyoulashari@gmail.com" 
              className="text-amber-700 hover:text-amber-800 font-mono font-medium underline"
            >
              canikissyoulashari@gmail.com
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-2xs"
          >
            Close Solver
          </button>
        </div>

      </div>
    </div>
  );
};
