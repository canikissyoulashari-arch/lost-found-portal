import React, { useState } from 'react';
import { AutoMatchResult, Item } from '../types';
import { 
  Sparkles, 
  X, 
  ArrowRight, 
  CheckCircle2, 
  ShieldAlert, 
  MapPin, 
  Calendar, 
  Check, 
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface AutoMatchCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: AutoMatchResult[];
  onConfirmReunion: (lostId: string, foundId: string) => void;
  onSelectInspectItem: (item: Item) => void;
}

export const AutoMatchCenterModal: React.FC<AutoMatchCenterModalProps> = ({
  isOpen,
  onClose,
  matches,
  onConfirmReunion,
  onSelectInspectItem
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'resolved'>('pending');
  const [verifyingPair, setVerifyingPair] = useState<AutoMatchResult | null>(null);
  const [studentIdInput, setStudentIdInput] = useState('');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTriggerReunion = (match: AutoMatchResult) => {
    setVerifyingPair(match);
    setStudentIdInput(match.lostItem.studentId || 'STU-');
  };

  const handleFinalizeReunion = () => {
    if (!verifyingPair) return;

    onConfirmReunion(verifyingPair.lostItem.id, verifyingPair.foundItem.id);
    
    // Celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // safe fallback
    }

    setSuccessNotice(`Item successfully matched and marked returned to ${verifyingPair.lostItem.contactName}!`);
    setVerifyingPair(null);

    setTimeout(() => {
      setSuccessNotice(null);
    }, 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-6 py-4.5 flex items-center justify-between border-b border-indigo-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Campus Auto-Match Engine</h2>
                <span className="bg-amber-400 text-slate-950 font-extrabold text-[11px] px-2 py-0.5 rounded-full">
                  {matches.length} Candidates
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                AI and heuristic semantic correlation between lost alerts and cataloged found items
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Alert Banner */}
        {successNotice && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-3 flex items-center gap-2 text-emerald-800 text-sm font-medium animate-fadeIn">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successNotice}</span>
          </div>
        )}

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          
          {matches.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white rounded-xl border border-dashed border-slate-300">
              <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Sparkles className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-semibold text-slate-800 text-base">No Open Auto-Match Pairs Detected</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The algorithm automatically analyzes newly reported lost and found items. When descriptors, location, and dates align, candidates will appear here.
              </p>
            </div>
          ) : (
            matches.map((match, idx) => {
              const score = match.confidenceScore;
              const isHigh = score >= 80;

              return (
                <div 
                  key={`${match.lostItem.id}-${match.foundItem.id}-${idx}`}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden hover:border-indigo-300 transition"
                >
                  {/* Confidence banner */}
                  <div className={`px-4 py-2 flex items-center justify-between text-xs font-semibold ${
                    isHigh 
                      ? 'bg-amber-50 text-amber-900 border-b border-amber-200' 
                      : 'bg-blue-50 text-blue-900 border-b border-blue-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <span className={`inline-block px-2 py-0.5 rounded-full font-bold ${
                        isHigh ? 'bg-amber-500 text-slate-950' : 'bg-blue-600 text-white'
                      }`}>
                        {score}% Confidence Match
                      </span>
                      <span>{match.summary}</span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-normal hidden sm:block">
                      Compared Lost #{match.lostItem.id} vs Found #{match.foundItem.id}
                    </div>
                  </div>

                  {/* Side-by-side comparison */}
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                    
                    {/* Lost side */}
                    <div className="space-y-2 pr-0 md:pr-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" /> Reported Lost
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{match.lostItem.id}</span>
                      </div>

                      <div className="flex items-start gap-3 pt-1">
                        {match.lostItem.imageUrl && (
                          <img 
                            src={match.lostItem.imageUrl} 
                            alt={match.lostItem.title}
                            className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0" 
                          />
                        )}
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{match.lostItem.title}</h4>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{match.lostItem.description}</div>
                        </div>
                      </div>

                      <div className="pt-2 text-xs space-y-1 text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>{match.lostItem.location}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>Reported by: {match.lostItem.contactName} ({match.lostItem.studentId || 'Student'})</span>
                        </div>
                      </div>
                    </div>

                    {/* Found side */}
                    <div className="space-y-2 pt-3 md:pt-0 md:pl-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Reported Found
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">{match.foundItem.id}</span>
                      </div>

                      <div className="flex items-start gap-3 pt-1">
                        {match.foundItem.imageUrl && (
                          <img 
                            src={match.foundItem.imageUrl} 
                            alt={match.foundItem.title}
                            className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0" 
                          />
                        )}
                        <div>
                          <h4 className="font-semibold text-slate-900 text-sm">{match.foundItem.title}</h4>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-2">{match.foundItem.description}</div>
                        </div>
                      </div>

                      <div className="pt-2 text-xs space-y-1 text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{match.foundItem.location}</span>
                        </div>
                        {match.foundItem.storageLocation && (
                          <div className="text-[11px] text-emerald-700 font-medium">
                            Custody: {match.foundItem.storageLocation}
                          </div>
                        )}
                      </div>
                    </div>

                  </div>

                  {/* Factor Analysis & Actions */}
                  <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    
                    {/* Why this matched tag cloud */}
                    <div className="flex items-center flex-wrap gap-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase mr-1">Factors:</span>
                      {match.factors.map((factor, fIdx) => (
                        <span 
                          key={fIdx} 
                          title={factor.description}
                          className="bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[11px] font-medium"
                        >
                          ✓ {factor.label}
                        </span>
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onSelectInspectItem(match.foundItem)}
                        className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 transition"
                      >
                        Inspect Details
                      </button>

                      <button
                        onClick={() => handleTriggerReunion(match)}
                        className="text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-3.5 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5 transition active:scale-95"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Confirm Reunion &amp; Release</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })
          )}

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Auto-match uses continuous token similarity, campus spatial proximity &amp; timeline windowing.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Close
          </button>
        </div>

      </div>

      {/* Verification & Handover Dialog */}
      {verifyingPair && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Authorize Item Handover</h3>
                <p className="text-xs text-slate-500">Confirm ownership verification before releasing item</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Item:</span>
                <span className="font-medium text-slate-900">{verifyingPair.foundItem.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Owner Claimant:</span>
                <span className="font-medium text-slate-900">{verifyingPair.lostItem.contactName}</span>
              </div>
              {verifyingPair.lostItem.secretDetails && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-semibold text-indigo-700 block mb-0.5">Owner's Secret Proof Note:</span>
                  <p className="italic text-slate-700 bg-white p-2 rounded border border-slate-200">
                    "{verifyingPair.lostItem.secretDetails}"
                  </p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Student ID / Campus Card Number
              </label>
              <input
                type="text"
                value={studentIdInput}
                onChange={(e) => setStudentIdInput(e.target.value)}
                placeholder="e.g. STU-9281"
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setVerifyingPair(null)}
                className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleFinalizeReunion}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-sm flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Verify &amp; Mark Returned</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
