import React, { useState, useEffect } from 'react';
import { Item } from '../types';
import { generateQrDataUrl } from '../services/storage';
import { 
  X, 
  MapPin, 
  Calendar, 
  QrCode, 
  ShieldCheck, 
  Lock, 
  Send, 
  CheckCircle2, 
  Printer, 
  User, 
  Mail, 
  Phone,
  Sparkles,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ItemDetailsModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSubmitted: (itemId: string, claimantId: string, proof: string) => void;
  onMarkReturned: (itemId: string) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  isOpen,
  onClose,
  onClaimSubmitted,
  onMarkReturned
}) => {
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimantName, setClaimantName] = useState('');
  const [claimantStudentId, setClaimantStudentId] = useState('');
  const [claimantEmail, setClaimantEmail] = useState('');
  const [ownershipProof, setOwnershipProof] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  useEffect(() => {
    if (item) {
      setShowClaimForm(false);
      setClaimSuccess(false);
      generateQrDataUrl(JSON.stringify({
        id: item.id,
        qrCodeId: item.qrCodeId,
        title: item.title,
        type: item.type,
        location: item.location
      }), { width: 220, margin: 2 }).then(url => {
        setQrCodeDataUrl(url);
      });
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const isLost = item.type === 'lost';
  const formattedDate = new Date(item.dateTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimantName.trim() || !ownershipProof.trim()) return;

    onClaimSubmitted(item.id, claimantStudentId, ownershipProof);
    setClaimSuccess(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setTimeout(() => {
      onClose();
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white border-b ${
          isLost 
            ? 'bg-slate-900 border-amber-500/40' 
            : 'bg-slate-900 border-emerald-500/40'
        }`}>
          <div className="flex items-center gap-2.5">
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
              isLost ? 'bg-amber-500 text-slate-950' : 'bg-emerald-600 text-white'
            }`}>
              {isLost ? 'Lost Item' : 'Found Item'}
            </span>
            <span className="font-mono text-xs text-slate-400">{item.id}</span>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          
          {/* Main Hero Card */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-4 shadow-sm">
            
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Photo or placeholder */}
              <div className="w-full sm:w-44 h-44 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 flex items-center justify-center">
                {item.imageUrl ? (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="text-center p-3 text-slate-400 text-xs">
                    <span className="text-3xl block mb-1">📦</span>
                    No photo attached
                  </div>
                )}
              </div>

              {/* Title & Metadata */}
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="text-lg font-bold text-slate-900 leading-snug">{item.title}</h2>
                </div>

                <div className="inline-block bg-slate-100 text-slate-700 text-xs px-2.5 py-0.5 rounded-md font-medium">
                  {item.category}
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-medium text-slate-800">{item.location}</span>
                  </div>
                  {item.specificSpot && (
                    <div className="text-[11px] text-slate-500 pl-5 italic">
                      Spot: {item.specificSpot}
                    </div>
                  )}
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Logged: {formattedDate}</span>
                  </div>
                </div>

                {item.storageLocation && (
                  <div className="bg-emerald-50 border border-emerald-200/80 p-2 rounded-lg text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-semibold block text-[11px]">Current Custody:</span>
                      {item.storageLocation}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Description</h4>
              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {item.description}
              </p>
            </div>

            {/* Tags */}
            {item.tags.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-400 font-medium">Keywords:</span>
                {item.tags.map((t, idx) => (
                  <span key={idx} className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Secret challenge notice */}
            {item.secretDetails && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-2.5 text-xs text-indigo-900 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  <strong>Anti-Theft Protected:</strong> This item has a sealed ownership challenge detail on file. Claimant must provide matching proof.
                </span>
              </div>
            )}

          </div>

          {/* QR Code / Custody Tag Section */}
          <div className="bg-white p-4.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3">
              {qrCodeDataUrl ? (
                <img 
                  src={qrCodeDataUrl} 
                  alt="Item QR Code" 
                  className="w-20 h-20 border border-slate-200 rounded-lg p-1 bg-white" 
                />
              ) : (
                <div className="w-20 h-20 bg-slate-100 rounded-lg animate-pulse" />
              )}
              <div>
                <div className="font-mono text-xs font-bold text-slate-900">{item.qrCodeId}</div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Official Campus Intake Barcode &amp; Custody Identifier
                </div>
                <button
                  onClick={() => window.print()}
                  className="mt-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <Printer className="w-3 h-3" />
                  <span>Print Custody Intake Slip</span>
                </button>
              </div>
            </div>

            {item.status !== 'returned' && (
              <button
                onClick={() => onMarkReturned(item.id)}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1.5 shrink-0 transition"
              >
                <PackageCheck className="w-4 h-4 text-emerald-600" />
                <span>Mark Reunited &amp; Returned</span>
              </button>
            )}
          </div>

          {/* Claim or Contact Section */}
          {!isLost && item.status !== 'returned' && (
            <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Is this your item?</h3>
                  <p className="text-xs text-slate-500">File an ownership claim to pick it up from campus custody</p>
                </div>
                <button
                  onClick={() => setShowClaimForm(!showClaimForm)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  {showClaimForm ? 'Hide Form' : 'Submit Ownership Claim'}
                </button>
              </div>

              {claimSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    Claim submitted! Present your student ID at <strong>{item.storageLocation || 'Campus Security'}</strong> with reference #{item.id}.
                  </span>
                </div>
              ) : showClaimForm ? (
                <form onSubmit={handleClaimSubmit} className="pt-2 space-y-3 border-t border-slate-100 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Your Full Name *</label>
                      <input
                        type="text"
                        required
                        value={claimantName}
                        onChange={(e) => setClaimantName(e.target.value)}
                        placeholder="e.g. Jordan Smith"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID # *</label>
                      <input
                        type="text"
                        required
                        value={claimantStudentId}
                        onChange={(e) => setClaimantStudentId(e.target.value)}
                        placeholder="e.g. STU-9182"
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Proof of Ownership Challenge Answer *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={ownershipProof}
                      onChange={(e) => setOwnershipProof(e.target.value)}
                      placeholder="Describe distinguishing marks, serial number digits, wallpaper photo, stickers, or item contents."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Transmit Verification Claim to Campus Custodian</span>
                  </button>
                </form>
              ) : null}
            </div>
          )}

          {/* Contact Details of reporter */}
          <div className="bg-slate-100/70 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Contact: {item.contactName}</span>
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.contactEmail}</span>
              </span>
            </div>
            {item.contactPhone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.contactPhone}</span>
              </span>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>SVU Campus Property Registry &bull; Items held for 60 calendar days</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
