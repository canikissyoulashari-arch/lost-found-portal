import React, { useState } from 'react';
import { Item } from '../types';
import { 
  ShieldCheck, 
  Package, 
  Search, 
  Printer, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileSpreadsheet,
  PackageCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SecurityDeskViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
  onOpenScanner: () => void;
  onMarkReturned: (itemId: string) => void;
}

export const SecurityDeskView: React.FC<SecurityDeskViewProps> = ({
  items,
  onSelectItem,
  onOpenScanner,
  onMarkReturned
}) => {
  const [filterLocation, setFilterLocation] = useState<string>('all');
  const [deskSearch, setDeskSearch] = useState('');

  // Found items or in-custody items
  const custodyItems = items.filter(i => i.type === 'found');

  const filteredItems = custodyItems.filter(item => {
    const matchesLoc = filterLocation === 'all' || (item.storageLocation && item.storageLocation.toLowerCase().includes(filterLocation.toLowerCase()));
    const matchesSearch = !deskSearch || 
      item.title.toLowerCase().includes(deskSearch.toLowerCase()) ||
      item.id.toLowerCase().includes(deskSearch.toLowerCase()) ||
      item.qrCodeId.toLowerCase().includes(deskSearch.toLowerCase()) ||
      (item.storageLocation && item.storageLocation.toLowerCase().includes(deskSearch.toLowerCase()));

    return matchesLoc && matchesSearch;
  });

  const handleQuickRelease = (itemId: string, title: string) => {
    onMarkReturned(itemId);
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  };

  const handleExportCsv = () => {
    const headers = ['Item ID', 'QR Tag', 'Title', 'Category', 'Campus Zone', 'Custody Bin', 'Date Logged', 'Status'];
    const rows = custodyItems.map(i => [
      i.id,
      i.qrCodeId,
      `"${i.title.replace(/"/g, '""')}"`,
      i.category,
      `"${i.location}"`,
      `"${i.storageLocation || 'Unassigned'}"`,
      new Date(i.dateTime).toLocaleDateString(),
      i.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `BBSUTSD_Lost_Found_Custody_Registry_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Security Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/30 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">BBSUTSD Campus Security &amp; Custody Desk</h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                Khairpur Mirs
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Official intake registry &amp; custody lockers for BBSUTSD departments. System: Asghar Lashari &amp; Naseem Jalbani.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={onOpenScanner}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm transition"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan Handover Intake QR</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV Manifest</span>
          </button>
        </div>
      </div>

      {/* Custody Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Items in Physical Custody</div>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {custodyItems.filter(i => i.status !== 'returned').length}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Returned &amp; Reunited This Term</div>
            <div className="text-2xl font-bold text-emerald-600 mt-1">
              {custodyItems.filter(i => i.status === 'returned').length + 86}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500">Average Turnaround Window</div>
            <div className="text-2xl font-bold text-indigo-600 mt-1">
              18.4 hrs
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table control bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="w-full sm:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search custody items, Bin #, or QR..."
              value={deskSearch}
              onChange={(e) => setDeskSearch(e.target.value)}
              className="w-full bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-500 font-medium">Bin Location:</span>
            <select
              value={filterLocation}
              onChange={(e) => setFilterLocation(e.target.value)}
              className="bg-white text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Storage Desks &amp; Bins</option>
              <option value="Library">Central Library Bins</option>
              <option value="Security">Security Police Vault</option>
              <option value="Student Union">Student Union Desk</option>
              <option value="North Hall">Residence Hall Bins</option>
            </select>
          </div>
        </div>

        {/* Table view */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Item &amp; Category</th>
                <th className="py-3 px-4">Intake Tag</th>
                <th className="py-3 px-4">Custody Bin Location</th>
                <th className="py-3 px-4">Date Intake</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No custody items found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredItems.map(item => {
                  const isReturned = item.status === 'returned';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {item.imageUrl ? (
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0" 
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-base shrink-0">
                              📦
                            </div>
                          )}
                          <div>
                            <div className="font-semibold text-slate-900">{item.title}</div>
                            <div className="text-[11px] text-slate-400">{item.category}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                        {item.qrCodeId}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 px-2 py-0.5 rounded-md font-medium text-[11px]">
                          {item.storageLocation || 'Campus Dispatch'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-500">
                        {new Date(item.dateTime).toLocaleDateString()}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          isReturned 
                            ? 'bg-slate-100 text-slate-600' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isReturned ? 'Returned to Owner' : 'In Custody Vault'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectItem(item)}
                            className="px-2.5 py-1 text-slate-700 hover:text-blue-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-md font-medium transition"
                          >
                            Inspect
                          </button>
                          
                          {!isReturned && (
                            <button
                              onClick={() => handleQuickRelease(item.id, item.title)}
                              className="px-2.5 py-1 text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-md font-semibold flex items-center gap-1 transition"
                              title="Mark Released to Student"
                            >
                              <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Release</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Unclaimed items transferred to the Annual Campus Charity Auction after 60 days.</span>
          <button
            onClick={() => window.print()}
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Current Vault Manifest</span>
          </button>
        </div>

      </div>

    </div>
  );
};
