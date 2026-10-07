import React, { useState, useMemo, useEffect } from 'react';
import { Item, ItemType, ItemCategory, CampusLocation, SafeTag, AutoMatchResult } from './types';
import { 
  getStoredItems, 
  saveStoredItems, 
  getStoredSafeTags, 
  updateItemStatus, 
  linkMatch, 
  submitClaim, 
  resetToDefaults,
  generateQrDataUrl 
} from './services/storage';
import { runAutoMatch } from './services/autoMatchEngine';

import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { ItemCard } from './components/ItemCard';
import { ReportItemModal } from './components/ReportItemModal';
import { AutoMatchCenterModal } from './components/AutoMatchCenterModal';
import { SafeTagGeneratorModal } from './components/SafeTagGeneratorModal';
import { QRScannerModal } from './components/QRScannerModal';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { CampusMapView } from './components/CampusMapView';
import { SecurityDeskView } from './components/SecurityDeskView';
import { RealTimeSolverModal } from './components/RealTimeSolverModal';
import { AuthorsModal } from './components/AuthorsModal';
import { Footer } from './components/Footer';

import { 
  Filter, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle2, 
  Plus, 
  RotateCcw, 
  Compass, 
  MapPin, 
  QrCode, 
  X,
  Printer,
  ChevronDown,
  Zap,
  Award,
  Mail,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

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

export function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [safeTags, setSafeTags] = useState<SafeTag[]>([]);
  
  // Views & filters
  const [currentView, setCurrentView] = useState<'portal' | 'map' | 'security'>('portal');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'lost' | 'found' | 'returned' | 'matched'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');

  // Modals state
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<ItemType>('lost');
  const [reportPrefillData, setReportPrefillData] = useState<{
    title?: string;
    category?: ItemCategory;
    location?: CampusLocation;
    type?: ItemType;
  } | null>(null);
  
  // Real-Time Solver state
  const [solverModalOpen, setSolverModalOpen] = useState(false);
  const [authorsModalOpen, setAuthorsModalOpen] = useState(false);

  const [autoMatchModalOpen, setAutoMatchModalOpen] = useState(false);
  const [safeTagModalOpen, setSafeTagModalOpen] = useState(false);
  
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [initialScanCode, setInitialScanCode] = useState<string | undefined>(undefined);

  const [detailsModalItem, setDetailsModalItem] = useState<Item | null>(null);

  // QR Badge Quick Preview Modal
  const [qrBadgeItem, setQrBadgeItem] = useState<Item | null>(null);
  const [qrBadgeDataUrl, setQrBadgeDataUrl] = useState<string>('');

  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize data
  useEffect(() => {
    setItems(getStoredItems());
    setSafeTags(getStoredSafeTags());

    // Global keyboard shortcut: pressing '/' or Cmd+K opens the Real-Time Solver
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') return;

      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setSolverModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute live auto-matches
  const activeMatches = useMemo(() => {
    return runAutoMatch(items);
  }, [items]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Type filter
      if (filterType === 'lost' && (item.type !== 'lost' || item.status === 'returned')) return false;
      if (filterType === 'found' && (item.type !== 'found' || item.status === 'returned')) return false;
      if (filterType === 'returned' && item.status !== 'returned') return false;
      if (filterType === 'matched' && item.status !== 'matched') return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Location filter
      if (selectedLocation !== 'all' && item.location !== selectedLocation) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inDesc = item.description.toLowerCase().includes(q);
        const inLoc = item.location.toLowerCase().includes(q);
        const inTags = item.tags.some(t => t.toLowerCase().includes(q));
        const inId = item.id.toLowerCase().includes(q) || item.qrCodeId.toLowerCase().includes(q);
        if (!inTitle && !inDesc && !inLoc && !inTags && !inId) return false;
      }

      return true;
    });
  }, [items, filterType, selectedCategory, selectedLocation, searchQuery]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleOpenReport = (type: ItemType = 'lost') => {
    setReportModalType(type);
    setReportModalOpen(true);
  };

  const handleItemCreated = (newItem: Item) => {
    const updated = getStoredItems();
    setItems(updated);
    showToast(`Successfully logged ${newItem.type.toUpperCase()}: ${newItem.title}`);
  };

  const handleConfirmReunion = (lostId: string, foundId: string) => {
    updateItemStatus(lostId, 'returned');
    updateItemStatus(foundId, 'returned');
    setItems(getStoredItems());
    showToast('Items reunited! Status updated to Returned.');
  };

  const handleClaimSubmitted = (itemId: string, claimantId: string, proof: string) => {
    submitClaim({
      itemId,
      claimantName: 'Campus Claimant',
      claimantEmail: 'student@summit.edu',
      claimantPhone: '(555) 000-0000',
      claimantStudentId: claimantId,
      proofDescription: proof
    });
    updateItemStatus(itemId, 'in_claim', claimantId);
    setItems(getStoredItems());
    showToast('Claim registered with Campus Custodian.');
  };

  const handleMarkReturned = (itemId: string) => {
    updateItemStatus(itemId, 'returned');
    setItems(getStoredItems());
    showToast('Item successfully marked as Returned & Closed.');
    try {
      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } catch (e) {}
  };

  const handleResetData = () => {
    if (window.confirm('Reset catalog to sample college data?')) {
      resetToDefaults();
      setItems(getStoredItems());
      setSafeTags(getStoredSafeTags());
      showToast('Catalog reset to campus default records.');
    }
  };

  const handleShowQrBadge = async (item: Item) => {
    setQrBadgeItem(item);
    const url = await generateQrDataUrl(JSON.stringify({
      code: item.qrCodeId,
      title: item.title,
      type: item.type,
      location: item.location
    }), { width: 240, margin: 2 });
    setQrBadgeDataUrl(url);
  };

  const handleSimulateScan = (tagId: string) => {
    setInitialScanCode(tagId);
    setScannerModalOpen(true);
  };

  const handleResolveFoundSafeTag = (tag: SafeTag, location: string, note: string) => {
    showToast(`Owner ${tag.ownerName} pinged with recovery location "${location}"!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      
      {/* Toast popup */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2.5 animate-fadeIn">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Primary Navigation */}
      <Navbar
        onOpenReport={handleOpenReport}
        onOpenSafeTag={() => setSafeTagModalOpen(true)}
        onOpenScanner={() => {
          setInitialScanCode(undefined);
          setScannerModalOpen(true);
        }}
        onOpenAutoMatch={() => setAutoMatchModalOpen(true)}
        onOpenSolver={() => setSolverModalOpen(true)}
        onOpenAuthors={() => setAuthorsModalOpen(true)}
        onOpenMap={() => setCurrentView('map')}
        activeMatchCount={activeMatches.length}
        currentView={currentView}
        onChangeView={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onResetData={handleResetData}
      />

      {/* Main Hero and Stats */}
      {currentView === 'portal' && (
        <StatsBanner
          items={items}
          matches={activeMatches}
          onOpenReportLost={() => handleOpenReport('lost')}
          onOpenReportFound={() => handleOpenReport('found')}
          onOpenAutoMatch={() => setAutoMatchModalOpen(true)}
          onOpenSolver={() => setSolverModalOpen(true)}
        />
      )}

      {/* Conditional View Rendering */}
      {currentView === 'map' ? (
        <CampusMapView
          items={items}
          onSelectItem={(item) => setDetailsModalItem(item)}
        />
      ) : currentView === 'security' ? (
        <SecurityDeskView
          items={items}
          onSelectItem={(item) => setDetailsModalItem(item)}
          onOpenScanner={() => {
            setInitialScanCode(undefined);
            setScannerModalOpen(true);
          }}
          onMarkReturned={handleMarkReturned}
        />
      ) : (
        /* Registry Portal View */
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
          
          {/* Filter Bar & Controls */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-sm space-y-4">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              
              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                <button
                  onClick={() => setFilterType('all')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    filterType === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Items ({items.length})
                </button>

                <button
                  onClick={() => setFilterType('lost')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                    filterType === 'lost'
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                      : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Lost Alerts ({items.filter(i => i.type === 'lost' && i.status !== 'returned').length})</span>
                </button>

                <button
                  onClick={() => setFilterType('found')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                    filterType === 'found'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Found in Custody ({items.filter(i => i.type === 'found' && i.status !== 'returned').length})</span>
                </button>

                <button
                  onClick={() => setFilterType('matched')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-1.5 transition ${
                    filterType === 'matched'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100 border border-indigo-200/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Auto-Matched ({activeMatches.length})</span>
                </button>

                <button
                  onClick={() => setFilterType('returned')}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    filterType === 'returned'
                      ? 'bg-slate-700 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Returned &bull; Closed
                </button>
              </div>

              {/* Dropdown Filters (Category & Location) */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                
                {/* Category Dropdown */}
                <div className="w-full sm:w-auto min-w-[150px]">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Location Dropdown */}
                <div className="w-full sm:w-auto min-w-[170px]">
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="w-full text-xs font-medium border border-slate-300 rounded-xl px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="all">All Campus Zones</option>
                    {LOCATIONS.map(loc => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                </div>

                {/* Clear filters if active */}
                {(selectedCategory !== 'all' || selectedLocation !== 'all' || searchQuery || filterType !== 'all') && (
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedLocation('all');
                      setSearchQuery('');
                      setFilterType('all');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 underline px-1 py-1"
                  >
                    Reset
                  </button>
                )}

              </div>

            </div>

          </div>

          {/* Items Grid */}
          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-slate-900">No matching campus items found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                Try clearing your search query or filters. You can also file a new report if your item is not listed yet.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => handleOpenReport('lost')}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs px-4 py-2 rounded-lg"
                >
                  Report Lost
                </button>
                <button
                  onClick={() => handleOpenReport('found')}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-4 py-2 rounded-lg"
                >
                  Report Found
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredItems.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onSelect={(i) => setDetailsModalItem(i)}
                  onShowQr={(i) => handleShowQrBadge(i)}
                />
              ))}
            </div>
          )}

        </main>
      )}

      {/* Comprehensive Bottom University Footer - Requested: Developer Name & Gmail at Bottom */}
      <Footer 
        onOpenAuthors={() => setAuthorsModalOpen(true)}
        onResetData={handleResetData}
      />

      {/* Persistent Bottom Ownership & Gmail Docking Bar */}
      <aside 
        aria-label="Developer Ownership and Contact Information"
        className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md border-t border-emerald-500/40 px-3 sm:px-6 py-2 shadow-2xl text-xs text-slate-300"
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          
          {/* Developer Names */}
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-slate-400 font-medium">BBSUTSD Project Ownership:</span>
            <strong className="text-amber-300 font-bold tracking-wide">Asghar Lashari</strong>
            <span className="text-emerald-400 text-[11px]">(Lead Architect)</span>
            <span className="text-slate-500">&bull;</span>
            <strong className="text-white font-medium">Naseem Jalbani</strong>
            <span className="text-slate-400 text-[11px]">(Co-Dev)</span>
          </div>

          {/* Direct Gmail & Contact Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-end">
            <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-900 border border-amber-400/30 px-2.5 py-1 rounded-lg text-amber-300 shadow-xs">
              <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <a 
                href="mailto:canikissyoulashari@gmail.com?subject=BBSUTSD%20Lost%20Found%20System" 
                className="hover:text-amber-200 hover:underline"
                title="Send email to Asghar Lashari"
              >
                canikissyoulashari@gmail.com
              </a>
            </div>

            <button
              onClick={() => setAuthorsModalOpen(true)}
              className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 border border-emerald-500/40 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition"
              title="View full project profile & credentials"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Project Profile</span>
            </button>
          </div>

        </div>
      </aside>

      {/* Floating Real-Time Solver Quick Button (positioned above bottom dock) */}
      <button
        onClick={() => setSolverModalOpen(true)}
        className="fixed bottom-14 left-4 sm:left-6 z-40 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs px-4 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-slate-900/10 transition transform hover:scale-105 active:scale-95 group"
        title="Open Real-Time Solver (Press / key anytime)"
      >
        <Zap className="w-4 h-4 fill-slate-950 group-hover:rotate-12 transition-transform" />
        <span>Real-Time Solver</span>
        <span className="hidden sm:inline bg-slate-950/15 text-slate-900 text-[10px] px-1.5 py-0.5 rounded font-mono">
          /
        </span>
      </button>

      {/* Modals */}
      <RealTimeSolverModal
        isOpen={solverModalOpen}
        onClose={() => setSolverModalOpen(false)}
        items={items}
        onSelectCandidate={(item) => setDetailsModalItem(item)}
        onPreFillReport={(prefill) => {
          setReportPrefillData(prefill);
          setReportModalType(prefill.type);
          setReportModalOpen(true);
        }}
      />

      <ReportItemModal
        isOpen={reportModalOpen}
        onClose={() => {
          setReportModalOpen(false);
          setReportPrefillData(null);
        }}
        defaultType={reportModalType}
        existingItems={items}
        onItemCreated={handleItemCreated}
        onInspectMatch={(item) => setDetailsModalItem(item)}
        prefillData={reportPrefillData}
      />

      <AutoMatchCenterModal
        isOpen={autoMatchModalOpen}
        onClose={() => setAutoMatchModalOpen(false)}
        matches={activeMatches}
        onConfirmReunion={handleConfirmReunion}
        onSelectInspectItem={(item) => setDetailsModalItem(item)}
      />

      <SafeTagGeneratorModal
        isOpen={safeTagModalOpen}
        onClose={() => setSafeTagModalOpen(false)}
        onSimulateScan={handleSimulateScan}
      />

      <QRScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        items={items}
        safeTags={safeTags}
        initialScanCode={initialScanCode}
        onSelectScannedItem={(item) => setDetailsModalItem(item)}
        onResolveFoundSafeTag={handleResolveFoundSafeTag}
      />

      <ItemDetailsModal
        isOpen={!!detailsModalItem}
        item={detailsModalItem}
        onClose={() => setDetailsModalItem(null)}
        onClaimSubmitted={handleClaimSubmitted}
        onMarkReturned={handleMarkReturned}
      />

      {/* Quick QR Badge Preview Modal */}
      {qrBadgeItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Official Intake Tag
              </span>
              <button 
                onClick={() => setQrBadgeItem(null)} 
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-center">
              {qrBadgeDataUrl ? (
                <img src={qrBadgeDataUrl} alt="Item QR" className="w-44 h-44 object-contain" />
              ) : (
                <div className="w-44 h-44 bg-slate-100 animate-pulse rounded-lg" />
              )}
            </div>

            <div>
              <div className="font-mono text-sm font-bold text-slate-900">{qrBadgeItem.qrCodeId}</div>
              <div className="font-medium text-xs text-slate-700 mt-0.5 truncate">{qrBadgeItem.title}</div>
              <div className="text-[11px] text-slate-400 mt-1">{qrBadgeItem.location}</div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Intake Tag</span>
              </button>
              <button
                onClick={() => {
                  const itm = qrBadgeItem;
                  setQrBadgeItem(null);
                  handleSimulateScan(itm.qrCodeId);
                }}
                className="flex-1 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center gap-1.5 transition"
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan / Verify</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Ownership & Authors Modal */}
      <AuthorsModal
        isOpen={authorsModalOpen}
        onClose={() => setAuthorsModalOpen(false)}
      />

    </div>
  );
}
export default App;
