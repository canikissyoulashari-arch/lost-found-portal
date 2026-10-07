import React from 'react';
import { Item } from '../types';
import { 
  MapPin, 
  Calendar, 
  QrCode, 
  Sparkles, 
  CheckCircle, 
  ShieldAlert, 
  Clock, 
  Lock
} from 'lucide-react';

interface ItemCardProps {
  item: Item;
  onSelect: (item: Item) => void;
  onShowQr: (item: Item) => void;
  matchedScore?: number;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onSelect,
  onShowQr,
  matchedScore
}) => {
  const isLost = item.type === 'lost';
  const formattedDate = new Date(item.dateTime).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition duration-200 flex flex-col overflow-hidden group">
      
      {/* Top Banner & Photo */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
            <span className="text-3xl mb-1">📦</span>
            <span className="text-xs font-medium text-slate-500">{item.category}</span>
          </div>
        )}

        {/* Status and Type Pills */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
            isLost 
              ? 'bg-amber-500 text-slate-950' 
              : 'bg-emerald-600 text-white'
          }`}>
            {isLost ? <ShieldAlert className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          {item.status === 'returned' && (
            <span className="bg-slate-900/90 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-semibold backdrop-blur-sm">
              ✓ Returned
            </span>
          )}

          {item.status === 'matched' && (
            <span className="bg-amber-500/90 text-slate-950 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm backdrop-blur-sm animate-pulse-subtle">
              <Sparkles className="w-3 h-3" />
              {item.matchScore ? `${item.matchScore}% Matched` : 'Auto-Matched'}
            </span>
          )}
        </div>

        {/* QR Badge Button in top right */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShowQr(item);
          }}
          title="Inspect Item QR Code / Custody Tag"
          className="absolute top-2.5 right-2.5 bg-white/90 hover:bg-white text-slate-700 hover:text-slate-900 p-1.5 rounded-lg shadow-sm border border-slate-200 transition backdrop-blur-sm"
        >
          <QrCode className="w-4 h-4 text-blue-600" />
        </button>

        {/* Category tag at bottom of image */}
        <div className="absolute bottom-2 left-2.5 bg-slate-950/70 text-slate-200 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-medium">
          {item.category}
        </div>
      </div>

      {/* Body content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-base leading-snug line-clamp-1 group-hover:text-blue-600 transition">
            {item.title}
          </h3>

          <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          <div className="mt-3 space-y-1.5 text-xs text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-700">
              <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span className="truncate font-medium">{item.location}</span>
            </div>

            {item.specificSpot && (
              <div className="text-[11px] text-slate-500 pl-5 truncate italic">
                Spot: {item.specificSpot}
              </div>
            )}

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>

            {item.storageLocation && (
              <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200/60 text-[11px]">
                <CheckCircle className="w-3 h-3 shrink-0" />
                <span className="truncate">Stored at: {item.storageLocation}</span>
              </div>
            )}

            {item.secretDetails && (
              <div className="flex items-center gap-1 text-[11px] text-indigo-600">
                <Lock className="w-3 h-3 shrink-0" />
                <span>Protected by ownership proof challenge</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom card footer */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div className="text-[11px] text-slate-400 font-mono">
            {item.id}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onSelect(item)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-slate-200 transition"
            >
              {isLost ? 'Inspect Report' : 'Claim Item'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
};
