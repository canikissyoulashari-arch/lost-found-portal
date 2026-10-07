import React, { useState, useEffect } from 'react';
import { SafeTag, ItemCategory } from '../types';
import { generateQrDataUrl, getStoredSafeTags, createSafeTag } from '../services/storage';
import { 
  QrCode, 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  Plus, 
  Sparkles, 
  Check, 
  ExternalLink 
} from 'lucide-react';

interface SafeTagGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateScan: (tagId: string) => void;
}

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'Student IDs & Wallets',
  'Keys & Dorm Badges',
  'Books & Notebooks',
  'Bags & Backpacks',
  'Clothing & Accessories',
  'Bottles & Drinkware',
  'Sports Equipment',
  'Other'
];

export const SafeTagGeneratorModal: React.FC<SafeTagGeneratorModalProps> = ({
  isOpen,
  onClose,
  onSimulateScan
}) => {
  const [safeTags, setSafeTags] = useState<SafeTag[]>([]);
  const [selectedTag, setSelectedTag] = useState<SafeTag | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form states
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [ownerName, setOwnerName] = useState('Asghar Lashari');
  const [ownerStudentId, setOwnerStudentId] = useState('BBSUTSD-CS-22-04');
  const [ownerEmail, setOwnerEmail] = useState('asghar.lashari@bbsutsd.edu.pk');
  const [ownerPhone, setOwnerPhone] = useState('+92 300 1234567');
  const [emergencyNote, setEmergencyNote] = useState('Reward offered! Please hand into BBSUTSD CS & IT Dept or Library desk.');

  useEffect(() => {
    if (isOpen) {
      const tags = getStoredSafeTags();
      setSafeTags(tags);
      if (tags.length > 0 && !selectedTag) {
        setSelectedTag(tags[0]);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedTag) {
      // Generate QR code data URL encoding the tag payload
      const qrPayload = JSON.stringify({
        type: 'SVU_SAFETAG',
        tagId: selectedTag.id,
        item: selectedTag.itemName,
        portal: 'CampusSafe',
        ownerEmail: selectedTag.ownerEmail
      });

      generateQrDataUrl(qrPayload, { width: 280, margin: 2 }).then(url => {
        setQrDataUrl(url);
      });
    }
  }, [selectedTag]);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemName.trim()) return;

    const newTag = createSafeTag({
      itemName,
      category,
      ownerName,
      ownerStudentId,
      ownerEmail,
      ownerPhone,
      emergencyNote
    });

    const updated = getStoredSafeTags();
    setSafeTags(updated);
    setSelectedTag(newTag);
    setIsCreating(false);
    setItemName('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || !selectedTag) return;
    const a = document.createElement('a');
    a.href = qrDataUrl;
    a.download = `CampusSafe-${selectedTag.id}-${selectedTag.itemName.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white px-6 py-4.5 flex items-center justify-between border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">Campus SafeTag™ Generator</h2>
                <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full">
                  Preventive QR System
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                Generate printable QR code stickers for laptops, keys &amp; backpacks. Scan-to-recover privacy relay.
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

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50/50">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: List and New Form */}
            <div className="lg:col-span-6 space-y-4">
              
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">
                  {isCreating ? 'Register New Belonging' : 'My Registered Belongings'}
                </h3>
                <button
                  onClick={() => setIsCreating(!isCreating)}
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 flex items-center gap-1 transition"
                >
                  {isCreating ? '← Back to List' : <><Plus className="w-3.5 h-3.5" /> Tag New Item</>}
                </button>
              </div>

              {isCreating ? (
                /* Registration form */
                <form onSubmit={handleCreate} className="bg-white p-4.5 rounded-xl border border-slate-200 space-y-3.5 shadow-sm">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Item Name &amp; Model *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. MacBook Pro 14, Hydro Flask Navy Blue"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as ItemCategory)}
                      className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Student ID
                      </label>
                      <input
                        type="text"
                        required
                        value={ownerStudentId}
                        onChange={(e) => setOwnerStudentId(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Campus Email
                      </label>
                      <input
                        type="email"
                        required
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Phone (Optional)
                      </label>
                      <input
                        type="text"
                        value={ownerPhone}
                        onChange={(e) => setOwnerPhone(e.target.value)}
                        className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Reward / Finder Instructions
                    </label>
                    <textarea
                      rows={2}
                      value={emergencyNote}
                      onChange={(e) => setEmergencyNote(e.target.value)}
                      placeholder="e.g. Reward offered! Hand into campus security desk."
                      className="w-full text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-lg shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Generate SafeTag &amp; QR Sticker</span>
                  </button>
                </form>
              ) : (
                /* List of existing tags */
                <div className="space-y-2">
                  {safeTags.map((tag) => {
                    const isSelected = selectedTag?.id === tag.id;
                    return (
                      <div
                        key={tag.id}
                        onClick={() => setSelectedTag(tag)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                          isSelected 
                            ? 'bg-indigo-50/80 border-indigo-400 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                            isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            <QrCode className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 text-xs sm:text-sm">{tag.itemName}</div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-2">
                              <span className="font-mono text-indigo-700 font-medium">{tag.id}</span>
                              <span>•</span>
                              <span>{tag.category}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                            Active
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Privacy explain box */}
              <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold block">Privacy-Shielded Relay:</span>
                  Anyone scanning your sticker can message you or report the item found via CampusSafe without seeing your phone number or dorm room.
                </div>
              </div>

            </div>

            {/* Right Column: Printable Sticker Preview */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center">
              
              {selectedTag ? (
                <div className="w-full flex flex-col items-center space-y-4">
                  
                  {/* The Physical Sticker Mockup */}
                  <div 
                    id="printable-safetag-card"
                    className="w-72 bg-white border-2 border-slate-900 rounded-2xl p-4 shadow-xl text-center space-y-3 relative overflow-hidden"
                  >
                    {/* Top BBSUTSD header */}
                    <div className="bg-emerald-950 text-white -mx-4 -mt-4 py-2 px-4 flex items-center justify-between text-[11px] font-bold tracking-wider uppercase border-b border-emerald-800">
                      <div className="flex items-center gap-1.5">
                        <img src="/bbsutsd_logo.png" alt="Logo" className="w-4 h-4 object-contain bg-white rounded-full p-0.5" />
                        <span>BBSUTSD SAFETAG</span>
                      </div>
                      <span className="font-mono text-amber-400">{selectedTag.id}</span>
                    </div>

                    {/* QR code canvas */}
                    <div className="pt-2 flex justify-center">
                      {qrDataUrl ? (
                        <div className="p-2 border border-slate-200 rounded-xl bg-white shadow-inner">
                          <img 
                            src={qrDataUrl} 
                            alt={`SafeTag ${selectedTag.id}`}
                            className="w-44 h-44 object-contain" 
                          />
                        </div>
                      ) : (
                        <div className="w-44 h-44 bg-slate-100 animate-pulse rounded-xl flex items-center justify-center text-slate-400 text-xs">
                          Generating QR...
                        </div>
                      )}
                    </div>

                    {/* Label & Instructions */}
                    <div>
                      <div className="font-bold text-slate-900 text-sm truncate">{selectedTag.itemName}</div>
                      <div className="text-[11px] text-slate-600 mt-0.5">
                        IF FOUND: Scan with camera to return to owner or hand into BBSUTSD Department Office
                      </div>
                    </div>

                    {/* Bottom seal */}
                    <div className="border-t border-dashed border-slate-300 pt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>BBSUTSD Khairpur Mirs</span>
                      <span className="font-mono">{selectedTag.ownerStudentId}</span>
                    </div>
                  </div>

                  {/* Actions for this tag */}
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                    <button
                      onClick={handleDownloadQr}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
                    >
                      <Download className="w-3.5 h-3.5 text-blue-400" />
                      <span>Download PNG Sticker</span>
                    </button>

                    <button
                      onClick={handlePrint}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Sheet</span>
                    </button>

                    <button
                      onClick={() => {
                        onClose();
                        onSimulateScan(selectedTag.id);
                      }}
                      className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-200 transition"
                      title="Simulate someone finding this item on campus"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Simulate Finder Scan</span>
                    </button>
                  </div>

                </div>
              ) : (
                <div className="text-center text-slate-400 text-xs">Select or create a SafeTag to preview.</div>
              )}

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>Stickers can be printed on waterproof sticker paper at the Campus Print Center.</span>
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
