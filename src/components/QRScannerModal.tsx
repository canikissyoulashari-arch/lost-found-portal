import React, { useState } from 'react';
import { Item, SafeTag } from '../types';
import { 
  QrCode, 
  X, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  ShieldCheck, 
  MapPin, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: Item[];
  safeTags: SafeTag[];
  initialScanCode?: string;
  onSelectScannedItem: (item: Item) => void;
  onResolveFoundSafeTag: (safeTag: SafeTag, finderLocation: string, finderNote: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  items,
  safeTags,
  initialScanCode,
  onSelectScannedItem,
  onResolveFoundSafeTag
}) => {
  const [manualCode, setManualCode] = useState(initialScanCode || '');
  const [isScanning, setIsScanning] = useState(true);
  const [decodedTag, setDecodedTag] = useState<SafeTag | null>(null);
  const [decodedItem, setDecodedItem] = useState<Item | null>(null);
  const [finderLocation, setFinderLocation] = useState('Central Library Circulation Desk');
  const [finderNote, setFinderNote] = useState('Found on table. Handed in to front attendant.');
  const [notificationSent, setNotificationSent] = useState(false);

  if (!isOpen) return null;

  const handleProcessCode = (code: string) => {
    const trimmed = code.trim();
    if (!trimmed) return;

    // Check if it's a SafeTag (starts with ST- or has matching ID)
    const matchedSafeTag = safeTags.find(t => 
      t.id.toLowerCase() === trimmed.toLowerCase() || 
      trimmed.includes(t.id) ||
      t.itemName.toLowerCase().includes(trimmed.toLowerCase())
    );

    if (matchedSafeTag) {
      setDecodedTag(matchedSafeTag);
      setDecodedItem(null);
      setIsScanning(false);
      setNotificationSent(false);
      return;
    }

    // Check if it's an Item (QR-FOUND-xxx, QR-LOST-xxx, LF-xxx)
    const matchedItem = items.find(i => 
      i.id.toLowerCase() === trimmed.toLowerCase() ||
      i.qrCodeId.toLowerCase() === trimmed.toLowerCase() ||
      trimmed.includes(i.id) ||
      trimmed.includes(i.qrCodeId)
    );

    if (matchedItem) {
      setDecodedItem(matchedItem);
      setDecodedTag(null);
      setIsScanning(false);
      setNotificationSent(false);
      return;
    }

    // Fallback: search by partial text
    const fuzzyItem = items.find(i => i.title.toLowerCase().includes(trimmed.toLowerCase()));
    if (fuzzyItem) {
      setDecodedItem(fuzzyItem);
      setDecodedTag(null);
      setIsScanning(false);
      return;
    }

    alert(`No matching item or SafeTag found for code "${trimmed}". Try one of the test badges below.`);
  };

  const handleSendFinderAlert = () => {
    if (!decodedTag) return;
    onResolveFoundSafeTag(decodedTag, finderLocation, finderNote);
    setNotificationSent(true);

    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    setTimeout(() => {
      onClose();
    }, 2500);
  };

  const resetScanner = () => {
    setIsScanning(true);
    setDecodedItem(null);
    setDecodedTag(null);
    setNotificationSent(false);
    setManualCode('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Campus QR Scanner</h2>
              <p className="text-[11px] text-slate-400">Scan physical SafeTag or intake barcode</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">

          {isScanning && !decodedItem && !decodedTag ? (
            <>
              {/* Camera Scanner Viewfinder simulation */}
              <div className="relative aspect-square max-w-xs mx-auto bg-slate-950 rounded-2xl overflow-hidden border-2 border-slate-800 flex items-center justify-center shadow-inner group">
                
                {/* Simulated live campus camera overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-950/40 via-slate-900/60 to-blue-950/40 flex items-center justify-center">
                  
                  {/* Targeting box */}
                  <div className="relative w-48 h-48 border-2 border-blue-400 rounded-xl flex items-center justify-center">
                    
                    {/* Animated scanning line */}
                    <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-bounce shadow-lg shadow-cyan-400/50"></div>
                    
                    {/* Corner marks */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-300"></div>
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-300"></div>
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-300"></div>
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-300"></div>
                    
                    <div className="text-center text-[11px] text-cyan-200/90 font-medium px-2">
                      Align QR Code or SafeTag within frame
                    </div>
                  </div>

                </div>

                <div className="absolute bottom-3 text-slate-400 text-[10px] flex items-center gap-1.5 bg-slate-900/80 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <span>Camera Active (Simulation Ready)</span>
                </div>
              </div>

              {/* Fast test presets for instant user evaluation */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-semibold text-slate-700 block">
                  ⚡ Test One-Click Simulated Scans:
                </span>
                
                <div className="grid grid-cols-1 gap-1.5">
                  {safeTags.slice(0, 2).map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => handleProcessCode(tag.id)}
                      className="text-left p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 flex items-center justify-between transition text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-700">{tag.id}</span>
                        <span className="text-slate-800 font-medium truncate">{tag.itemName}</span>
                      </div>
                      <span className="text-[10px] bg-indigo-200/80 text-indigo-900 px-1.5 py-0.5 rounded font-semibold shrink-0">
                        SafeTag
                      </span>
                    </button>
                  ))}

                  {items.slice(0, 2).map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleProcessCode(item.id)}
                      className="text-left p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-between transition text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-emerald-800">{item.qrCodeId}</span>
                        <span className="text-slate-800 font-medium truncate">{item.title}</span>
                      </div>
                      <span className="text-[10px] bg-emerald-200/80 text-emerald-900 px-1.5 py-0.5 rounded font-semibold shrink-0">
                        {item.type.toUpperCase()}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual input */}
              <div className="pt-2 border-t border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Or Enter Tag / Code Manually
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. ST-9021 or QR-FOUND-102"
                    className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleProcessCode(manualCode)}
                  />
                  <button
                    onClick={() => handleProcessCode(manualCode)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs px-4 py-2 rounded-lg transition"
                  >
                    Decode
                  </button>
                </div>
              </div>
            </>
          ) : decodedTag ? (
            /* Scanned a SafeTag! */
            <div className="space-y-4 animate-fadeIn">
              
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-950 text-base">{decodedTag.itemName}</span>
                    <span className="font-mono text-xs bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded">
                      {decodedTag.id}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-800 mt-1">
                    Registered to SVU Student <strong>{decodedTag.ownerName}</strong> ({decodedTag.ownerStudentId}).
                  </p>
                </div>
              </div>

              {notificationSent ? (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto" />
                  <h4 className="font-bold text-blue-900 text-sm">Owner Notified!</h4>
                  <p className="text-xs text-blue-700">
                    A secure dispatch email &amp; SMS ping has been dispatched to {decodedTag.ownerEmail}. Thank you for being a great campus citizen!
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="text-xs font-semibold text-slate-800">
                    Send Instant "Found" Recovery Notice to Owner:
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Where is the item currently located?
                    </label>
                    <input
                      type="text"
                      value={finderLocation}
                      onChange={(e) => setFinderLocation(e.target.value)}
                      placeholder="e.g. Handed to Library Circulation Desk"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Message / Note for Owner:
                    </label>
                    <textarea
                      rows={2}
                      value={finderNote}
                      onChange={(e) => setFinderNote(e.target.value)}
                      placeholder="e.g. Left in front study area. Safe and sound!"
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  {decodedTag.emergencyNote && (
                    <div className="bg-amber-50 border border-amber-200/80 p-2.5 rounded-lg text-xs text-amber-900">
                      <span className="font-semibold block text-[11px]">Owner's SafeTag Note:</span>
                      "{decodedTag.emergencyNote}"
                    </div>
                  )}

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={resetScanner}
                      className="w-1/3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                    >
                      Scan Another
                    </button>
                    <button
                      onClick={handleSendFinderAlert}
                      className="w-2/3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ping Owner Now</span>
                    </button>
                  </div>
                </div>
              )}

            </div>
          ) : decodedItem ? (
            /* Scanned an Item Record */
            <div className="space-y-4 animate-fadeIn">
              
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-950 text-base">{decodedItem.title}</span>
                    <span className="font-mono text-xs bg-blue-200 text-blue-900 px-2 py-0.5 rounded">
                      {decodedItem.id}
                    </span>
                  </div>
                  <p className="text-xs text-blue-800 mt-1 line-clamp-2">
                    {decodedItem.description}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Classification:</span>
                  <span className="font-semibold text-slate-900 uppercase">{decodedItem.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium text-slate-900">{decodedItem.location}</span>
                </div>
                {decodedItem.storageLocation && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Custody Bin:</span>
                    <span className="font-bold text-emerald-700">{decodedItem.storageLocation}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={resetScanner}
                  className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition"
                >
                  Scan Another
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onSelectScannedItem(decodedItem);
                  }}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm flex items-center justify-center gap-1.5 transition"
                >
                  <span>Open Item File</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          ) : null}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Compatible with all SVU SafeTag stickers and intake custody barcodes.</span>
          <button
            onClick={onClose}
            className="px-3 py-1 font-medium text-slate-700 hover:text-slate-900"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
