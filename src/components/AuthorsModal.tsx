import React, { useState } from 'react';
import { X, Award, ExternalLink, ShieldCheck, Mail, Phone, Building2, User, Sparkles, Copy, Check, Send } from 'lucide-react';

interface AuthorsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthorsModal: React.FC<AuthorsModalProps> = ({ isOpen, onClose }) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const asgharEmail = "canikissyoulashari@gmail.com";

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(asgharEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header with BBSUTSD theme */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-950 text-white p-6 border-b border-emerald-700/60 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white p-0.5 shadow-md border-2 border-amber-400 shrink-0 flex items-center justify-center overflow-hidden">
              <img 
                src="/bbsutsd_seal.png" 
                alt="BBSUTSD Official Cropped Seal" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/bbsutsd_logo.png';
                }}
              />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full mb-1">
                <Award className="w-3 h-3 text-amber-400" />
                <span>Official Project Ownership &amp; Attribution</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold leading-tight text-white">
                BBSUTSD SmartRecovery Portal
              </h2>
              <p className="text-xs text-emerald-200 mt-0.5">
                The Benazir Bhutto Shaheed University of Technology &amp; Skill Development, Khairpur Mirs
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 bg-slate-50/50">
          
          {/* Authors Cards */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-emerald-700" />
              <span>Project Creators &amp; System Authors</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Author 1: Asghar Lashari */}
              <div className="bg-white p-4.5 rounded-xl border-2 border-emerald-600/40 shadow-sm space-y-2.5 relative">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-base border border-emerald-300">
                    AL
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Asghar Lashari</h4>
                    <span className="text-xs text-emerald-700 font-semibold block">
                      Lead System Developer &amp; Architect
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Dept. of Computer Science &amp; IT</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono text-[11px] text-amber-700 font-semibold">{asgharEmail}</span>
                  </div>
                </div>

                {/* Direct Action Buttons for Asghar Lashari */}
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopy}
                    className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center justify-center gap-1 border border-slate-200 transition"
                  >
                    {copiedEmail ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-slate-500" />
                        <span>Copy Gmail</span>
                      </>
                    )}
                  </button>
                  <a
                    href={`mailto:${asgharEmail}?subject=BBSUTSD%20Project%20Inquiry`}
                    className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition shadow-2xs"
                  >
                    <Send className="w-3 h-3" />
                    <span>Email</span>
                  </a>
                </div>
              </div>

              {/* Author 2: Naseem Jalbani */}
              <div className="bg-white p-4.5 rounded-xl border-2 border-emerald-600/30 shadow-sm space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-base border border-teal-300">
                    NJ
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Naseem Jalbani</h4>
                    <span className="text-xs text-teal-700 font-semibold block">
                      Co-Developer &amp; Systems Engineering
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Dept. of Computer Science &amp; IT</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-mono text-[11px]">naseem.jalbani@bbsutsd.edu.pk</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Institutional Affiliation */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Institution</span>
              <a 
                href="https://bbsutsd.edu.pk" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold flex items-center gap-1"
              >
                <span>Visit bbsutsd.edu.pk</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              <strong>The Benazir Bhutto Shaheed University of Technology and Skill Development (BBSUTSD)</strong>, located in Khairpur Mirs, Sindh, Pakistan, is a premier public university established to empower students with world-class engineering, computing, and technological skills.
            </p>
          </div>

          {/* Key Innovations */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Project Innovations &amp; Core Architecture</span>
            </h4>
            <ul className="text-xs text-emerald-900 space-y-1.5 list-disc list-inside">
              <li><strong>Real-Time Semantic Solver:</strong> Instant natural-language parser matching reported belongings across all campus departments in sub-milliseconds.</li>
              <li><strong>Campus SafeTag™ QR System:</strong> Preventive downloadable QR stickers for laptops, keychains, and bikes with privacy-shielded relay.</li>
              <li><strong>Ownership Proof Challenge Flow:</strong> Anti-fraud verification preventing unauthorized pickups from campus custody bins.</li>
              <li><strong>Campus Spatial Map:</strong> Interactive schematic overview of 8 major BBSUTSD departments and residential sectors.</li>
            </ul>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3.5 flex items-center justify-between text-xs text-slate-500">
          <span>Technology for Empowerment &bull; BBSUTSD Khairpur Mirs</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
