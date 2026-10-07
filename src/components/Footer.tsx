import React, { useState } from 'react';
import { 
  Award, 
  Mail, 
  Copy, 
  Check, 
  Send, 
  ExternalLink, 
  Building2, 
  Phone, 
  ShieldCheck, 
  RotateCcw,
  Sparkles,
  Heart
} from 'lucide-react';

interface FooterProps {
  onOpenAuthors: () => void;
  onResetData: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAuthors, onResetData }) => {
  const [copied, setCopied] = useState(false);
  const userEmail = "canikissyoulashari@gmail.com";

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(userEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <footer className="bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 text-slate-300 border-t border-slate-800 mt-auto relative z-20 pb-12 sm:pb-10">
      
      {/* Top Accent Strip with Academic Colors */}
      <div className="h-1.5 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 w-full" />

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Ownership & Developer Showcase Box - Highlighted for User's Request */}
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-emerald-950/80 rounded-2xl border-2 border-emerald-500/40 p-6 mb-8 shadow-xl relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            
            {/* Left: Project Ownership & Developers */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                <span>Project Ownership &amp; System Developers</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center justify-center lg:justify-start gap-2 flex-wrap">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300">
                      Asghar Lashari
                    </span>
                    <span className="text-emerald-400 text-sm font-semibold">&bull; Lead Architect &amp; Developer</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Co-Developer: <strong className="text-white">Naseem Jalbani</strong> &bull; Dept. of Computer Science &amp; IT, BBSUTSD
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-400 max-w-xl">
                The Benazir Bhutto Shaheed University of Technology and Skill Development (BBSUTSD), Khairpur Mirs, Sindh, Pakistan.
              </p>
            </div>

            {/* Right: Direct Gmail Contact & Action Buttons */}
            <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-3 shrink-0 shadow-lg">
              <div className="flex items-center gap-2.5 text-left">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Official Contact Gmail
                  </span>
                  <a 
                    href={`mailto:${userEmail}?subject=BBSUTSD%20Lost%20and%20Found%20Inquiry`}
                    className="font-mono text-sm sm:text-base font-bold text-amber-300 hover:text-amber-200 transition underline underline-offset-2"
                    title="Send email to Asghar Lashari"
                  >
                    {userEmail}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {/* Copy Gmail Button */}
                <button
                  onClick={handleCopyEmail}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700 transition"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-300" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Email Direct Send Button */}
                <a
                  href={`mailto:${userEmail}?subject=BBSUTSD%20Lost%20and%20Found%20Portal`}
                  className="flex-1 sm:flex-none px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Email Now</span>
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Multi-Column Institutional Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4 pb-8 border-b border-slate-800">
          
          {/* Col 1: University Identity */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-amber-400 shadow-md shrink-0 overflow-hidden">
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
                <h4 className="font-extrabold text-white text-sm leading-tight">
                  The Benazir Bhutto Shaheed University of Technology and Skill Development
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold px-1.5 py-0.2 rounded">
                    BBSUTSD
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium">Khairpur Mirs, Sindh</span>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md">
              A premier public sector university recognized by the Higher Education Commission (HEC) Pakistan and chartered by the Government of Sindh, committed to technological innovation and skill empowerment.
            </p>
          </div>

          {/* Col 2: Campus Security & Custody Dispatch */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Campus Security &amp; Custody</span>
            </h5>
            <ul className="space-y-1.5 text-slate-400">
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-500" />
                <span>Helpline: +92 243 928012</span>
              </li>
              <li className="flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Central Administration, Ground Floor</span>
              </li>
              <li>24/7 Security Dispatch &amp; Intake Counter</li>
              <li>Civil Lines, Khairpur Mirs, Sindh 66020</li>
            </ul>
          </div>

          {/* Col 3: Quick System Actions */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Project Navigation</span>
            </h5>
            <ul className="space-y-1.5">
              <li>
                <button
                  onClick={onOpenAuthors}
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 transition"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Developer Profiles &amp; Ownership</span>
                </button>
              </li>
              <li>
                <a
                  href="https://bbsutsd.edu.pk"
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white flex items-center gap-1 transition"
                >
                  <span>Official University Portal</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <button
                  onClick={onResetData}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1 transition"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Demo Sample Records</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div>
            &copy; {new Date().getFullYear()} The Benazir Bhutto Shaheed University of Technology and Skill Development (BBSUTSD). All rights reserved.
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span>Designed &amp; Engineered by</span>
            <strong className="text-amber-300 font-semibold">Asghar Lashari</strong>
            <span>&amp;</span>
            <strong className="text-white font-semibold">Naseem Jalbani</strong>
            <span>&bull;</span>
            <span className="font-mono text-emerald-400">canikissyoulashari@gmail.com</span>
          </div>
        </div>

      </div>

    </footer>
  );
};
