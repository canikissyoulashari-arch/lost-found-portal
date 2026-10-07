import React, { useState } from 'react';
import { Item, CampusLocation } from '../types';
import { 
  MapPin, 
  Building2, 
  ShieldAlert, 
  CheckCircle2, 
  Compass, 
  ArrowRight,
  Filter
} from 'lucide-react';

interface CampusMapViewProps {
  items: Item[];
  onSelectItem: (item: Item) => void;
}

interface CampusZoneMeta {
  name: CampusLocation;
  code: string;
  quad: string;
  icon: string;
  description: string;
  gridArea: string;
}

const CAMPUS_ZONES: CampusZoneMeta[] = [
  {
    name: 'BBSUTSD Main Central Library & IT Lab',
    code: 'LIB',
    quad: 'Academic Block',
    icon: '📚',
    description: 'Central university library, digital research terminals, reference section & front desk.',
    gridArea: 'col-span-1 md:col-span-2'
  },
  {
    name: 'Department of Computer Science & IT',
    code: 'CS-IT',
    quad: 'Technology Wing',
    icon: '💻',
    description: 'Software labs, AI & Data Science research lab, programming studios & faculty rooms.',
    gridArea: 'col-span-1'
  },
  {
    name: 'Electrical & Electronics Engineering Block',
    code: 'EE',
    quad: 'Engineering Wing',
    icon: '⚡',
    description: 'Power engineering labs, circuit theory labs, telecommunication facilities.',
    gridArea: 'col-span-1'
  },
  {
    name: 'Mechanical & Energy Technology Labs',
    code: 'ME',
    quad: 'Technology Wing',
    icon: '⚙️',
    description: 'Heavy machinery workshop, CAD/CAM design lab, thermodynamics & robotics section.',
    gridArea: 'col-span-1'
  },
  {
    name: 'Civil & Environmental Technology Block',
    code: 'CIVIL',
    quad: 'Engineering Wing',
    icon: '🏗️',
    description: 'Surveying laboratories, concrete testing lab, environmental technology wing.',
    gridArea: 'col-span-1'
  },
  {
    name: 'Administration Block & VC Secretariat',
    code: 'ADM',
    quad: 'Central Secretariat',
    icon: '🏛️',
    description: 'Vice Chancellor office, Registrar, Student Affairs Directorate, Security HQ.',
    gridArea: 'col-span-1 md:col-span-2'
  },
  {
    name: 'Student Cafeteria & Auditorium',
    code: 'CAF',
    quad: 'Campus Center',
    icon: '☕',
    description: 'Main dining hall, student recreation center, grand auditorium & event hall.',
    gridArea: 'col-span-1'
  },
  {
    name: 'Campus Hostels Complex & Main Gate Dispatch',
    code: 'HSTL',
    quad: 'Residential & Security',
    icon: '🏢',
    description: 'Boys & Girls residential halls, campus main gate security dispatch & lost box.',
    gridArea: 'col-span-1'
  }
];

export const CampusMapView: React.FC<CampusMapViewProps> = ({
  items,
  onSelectItem
}) => {
  const [selectedZone, setSelectedZone] = useState<CampusLocation | null>(null);

  const zoneItems = selectedZone 
    ? items.filter(i => i.location === selectedZone && i.status !== 'returned')
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Map Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Campus Spatial Map &amp; Zones</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse lost reports and found custody bins across Summit Valley University campus locations.
          </p>
        </div>

        {selectedZone && (
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-xs text-blue-900">
            <span className="font-semibold">Filtered to:</span>
            <span className="font-bold">{selectedZone}</span>
            <button
              onClick={() => setSelectedZone(null)}
              className="ml-2 text-slate-400 hover:text-slate-700"
            >
              ✕ Clear
            </button>
          </div>
        )}
      </div>

      {/* Interactive Map Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {CAMPUS_ZONES.map(zone => {
          const zoneLost = items.filter(i => i.location === zone.name && i.type === 'lost' && i.status !== 'returned');
          const zoneFound = items.filter(i => i.location === zone.name && i.type === 'found' && i.status !== 'returned');
          const isSelected = selectedZone === zone.name;

          return (
            <div
              key={zone.name}
              onClick={() => setSelectedZone(isSelected ? null : zone.name)}
              className={`rounded-2xl p-5 border cursor-pointer transition-all duration-200 flex flex-col justify-between group ${
                isSelected
                  ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{zone.icon}</span>
                  <span className="font-mono text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {zone.code}
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition">
                  {zone.name}
                </h3>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">
                  {zone.quad}
                </span>

                <p className="text-xs text-slate-500 line-clamp-2">
                  {zone.description}
                </p>
              </div>

              {/* Status pills at bottom */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <span 
                    title="Active lost alerts" 
                    className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                      zoneLost.length > 0 
                        ? 'bg-amber-100 text-amber-800' 
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <ShieldAlert className="w-3 h-3" />
                    {zoneLost.length} Lost
                  </span>

                  <span 
                    title="Found items in custody" 
                    className={`flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                      zoneFound.length > 0 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {zoneFound.length} Found
                  </span>
                </div>

                <span className="text-xs text-blue-600 group-hover:translate-x-0.5 transition font-medium">
                  {isSelected ? 'Active' : 'View'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Zone Item Drawer if selected */}
      {selectedZone && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Items Logged at {selectedZone}
              </h3>
              <p className="text-xs text-slate-500">
                Showing {zoneItems.length} active items in this sector
              </p>
            </div>
            <button
              onClick={() => setSelectedZone(null)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Close Drawer
            </button>
          </div>

          {zoneItems.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No open reports currently in this zone. Everything is accounted for!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {zoneItems.map(item => (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-white cursor-pointer transition flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0" 
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-slate-200 flex items-center justify-center text-lg shrink-0">
                        📦
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold uppercase px-1.5 py-0.2 rounded ${
                          item.type === 'lost' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {item.type}
                        </span>
                        <span className="font-semibold text-slate-900 text-xs truncate max-w-[140px]">
                          {item.title}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                        {item.specificSpot || item.category}
                      </div>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
