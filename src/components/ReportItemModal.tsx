import React, { useState, useEffect } from 'react';
import { Item, ItemType, ItemCategory, CampusLocation } from '../types';
import { addItem } from '../services/storage';
import { calculateMatchScore } from '../services/autoMatchEngine';
import { 
  PackageSearch, 
  CheckCircle2, 
  X, 
  Sparkles, 
  MapPin, 
  Calendar, 
  Image as ImageIcon, 
  ShieldAlert, 
  Lock, 
  ArrowRight 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: ItemType;
  existingItems: Item[];
  onItemCreated: (newItem: Item) => void;
  onInspectMatch: (item: Item) => void;
  prefillData?: {
    title?: string;
    category?: ItemCategory;
    location?: CampusLocation;
    type?: ItemType;
  } | null;
}

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

const PRESET_IMAGES: { label: string; url: string; category: ItemCategory }[] = [
  {
    label: 'AirPods / Earbuds',
    url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    category: 'Electronics'
  },
  {
    label: 'Water Bottle',
    url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    category: 'Bottles & Drinkware'
  },
  {
    label: 'Calculator',
    url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&w=600&q=80',
    category: 'Electronics'
  },
  {
    label: 'Keys Keychain',
    url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    category: 'Keys & Dorm Badges'
  },
  {
    label: 'Backpack',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    category: 'Bags & Backpacks'
  },
  {
    label: 'Jacket / Hoodie',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    category: 'Clothing & Accessories'
  },
  {
    label: 'ID Card / Badge',
    url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?auto=format&fit=crop&w=600&q=80',
    category: 'Student IDs & Wallets'
  }
];

export const ReportItemModal: React.FC<ReportItemModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'lost',
  existingItems,
  onItemCreated,
  onInspectMatch,
  prefillData
}) => {
  const [type, setType] = useState<ItemType>(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [location, setLocation] = useState<CampusLocation>('BBSUTSD Main Central Library & IT Lab');
  const [specificSpot, setSpecificSpot] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [description, setDescription] = useState('');
  const [secretDetails, setSecretDetails] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [storageLocation, setStorageLocation] = useState('Central Library Front Desk — Bin L-08');
  
  // Contact info
  const [contactName, setContactName] = useState('Asghar Lashari');
  const [contactEmail, setContactEmail] = useState('asghar.lashari@bbsutsd.edu.pk');
  const [contactPhone, setContactPhone] = useState('+92 300 1234567');
  const [studentId, setStudentId] = useState('BBSUTSD-CS-22-04');

  // Live match candidate
  const [liveCandidate, setLiveCandidate] = useState<{ item: Item; score: number } | null>(null);

  useEffect(() => {
    if (prefillData) {
      if (prefillData.type) setType(prefillData.type);
      if (prefillData.title) setTitle(prefillData.title);
      if (prefillData.category) setCategory(prefillData.category);
      if (prefillData.location) setLocation(prefillData.location);
    } else {
      setType(defaultType);
    }
  }, [defaultType, isOpen, prefillData]);

  // Real-time auto-match candidate search as the user types!
  useEffect(() => {
    if (!title.trim() || title.length < 3) {
      setLiveCandidate(null);
      return;
    }

    const targetType = type === 'lost' ? 'found' : 'lost';
    const counterparts = existingItems.filter(i => i.type === targetType && i.status !== 'returned');

    // Create a temporary mock item
    const tempItem: Item = {
      id: 'TEMP',
      type,
      title,
      category,
      location,
      specificSpot,
      dateTime: new Date(dateTime).toISOString(),
      description,
      contactName,
      contactEmail,
      status: 'open',
      qrCodeId: 'TEMP',
      tags: title.toLowerCase().split(' ')
    };

    let bestScore = 0;
    let bestItem: Item | null = null;

    for (const counterpart of counterparts) {
      const match = type === 'lost' 
        ? calculateMatchScore(tempItem, counterpart)
        : calculateMatchScore(counterpart, tempItem);

      if (match.score > bestScore) {
        bestScore = match.score;
        bestItem = counterpart;
      }
    }

    if (bestScore >= 55 && bestItem) {
      setLiveCandidate({ item: bestItem, score: bestScore });
    } else {
      setLiveCandidate(null);
    }
  }, [title, category, location, description, type, dateTime, existingItems]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const tags = Array.from(new Set([
      ...title.toLowerCase().split(/\s+/).filter(w => w.length > 2),
      ...category.toLowerCase().split(/\s+/),
      category.toLowerCase()
    ]));

    const newItem = addItem({
      type,
      title,
      category,
      location,
      specificSpot: specificSpot.trim() || undefined,
      dateTime: new Date(dateTime).toISOString(),
      description,
      secretDetails: secretDetails.trim() || undefined,
      contactName,
      contactEmail,
      contactPhone: contactPhone.trim() || undefined,
      studentId: studentId.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      storageLocation: type === 'found' ? storageLocation : undefined,
      tags
    });

    onItemCreated(newItem);

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className={`px-6 py-4.5 flex items-center justify-between text-white border-b ${
          type === 'lost' 
            ? 'bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 border-amber-600/60' 
            : 'bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 border-emerald-600/60'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              type === 'lost' ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
            }`}>
              {type === 'lost' ? <PackageSearch className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {type === 'lost' ? 'Report a Lost Item on Campus' : 'Log a Found Item with Custody'}
              </h2>
              <p className="text-xs text-slate-200">
                Instantly registered with the SVU Auto-Match Engine &amp; Campus Registry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Auto-Match Alert Banner if detected! */}
        {liveCandidate && (
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 px-6 py-2.5 flex items-center justify-between gap-3 shadow-inner animate-fadeIn">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Sparkles className="w-4 h-4 text-slate-950 animate-spin" />
              <span>
                Wait! Potential {liveCandidate.score}% Auto-Match Found: 
                "{liveCandidate.item.title}" reported {liveCandidate.item.type} at {liveCandidate.item.location}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                onInspectMatch(liveCandidate.item);
              }}
              className="bg-slate-950 text-white text-[11px] font-bold px-3 py-1 rounded-md hover:bg-slate-800 flex items-center gap-1 shrink-0"
            >
              <span>View Match</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/50">
          
          {/* Report Type selector */}
          <div className="flex rounded-xl bg-slate-200/80 p-1">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                type === 'lost' 
                  ? 'bg-amber-500 text-slate-950 shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PackageSearch className="w-4 h-4" />
              <span>I Lost Something (Owner Report)</span>
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-2 ${
                type === 'found' 
                  ? 'bg-emerald-600 text-white shadow-sm' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>I Found Something (Finder Intake)</span>
            </button>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Item Title &amp; Primary Identification *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Navy Blue Hydro Flask with stickers, Apple AirPods Pro 2"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs sm:text-sm border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Campus Location *
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value as CampusLocation)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
              >
                {LOCATIONS.map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Specific Spot / Room / Desk
              </label>
              <input
                type="text"
                placeholder="e.g. Floor 2 Quiet Zone, Table 12, or Bench near door"
                value={specificSpot}
                onChange={(e) => setSpecificSpot(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Date &amp; Approximate Time *
              </label>
              <input
                type="datetime-local"
                required
                value={dateTime}
                onChange={(e) => setDateTime(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

          </div>

          {/* Description & Secret Details */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Public Description (Color, Brand, Model, Condition)
              </label>
              <textarea
                rows={3}
                required
                placeholder="Provide distinct physical traits so the auto-match algorithm can cross-reference."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>

            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-950">
                <Lock className="w-3.5 h-3.5 text-indigo-600" />
                <span>Confidential Ownership Proof Detail (Hidden from Public)</span>
              </div>
              <p className="text-[11px] text-indigo-900 leading-relaxed">
                Add an identifying mark that only the true owner would know to prevent fraudulent claims (e.g., lock screen background, engraved initials, serial digits, contents of inner pocket).
              </p>
              <input
                type="text"
                placeholder="e.g. Wallpaper photo is a Golden Retriever puppy, or serial # ends in 44"
                value={secretDetails}
                onChange={(e) => setSecretDetails(e.target.value)}
                className="w-full text-xs border border-indigo-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Custody location if type is Found */}
          {type === 'found' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 space-y-2">
              <label className="block text-xs font-bold text-emerald-950">
                Where is this item currently stored? (Custody Bin / Front Desk)
              </label>
              <input
                type="text"
                required
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                placeholder="e.g. Central Library Front Desk - Bin L-08, or Security Hub Locker"
                className="w-full text-xs border border-emerald-300 rounded-lg p-2 bg-white focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {/* Photo Selection / Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Attach Item Photo (Image URL or Pick Sample)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://example.com/item-photo.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 text-xs border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 bg-white"
              />
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick preset chips */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] text-slate-500">Fast photo presets:</span>
              {PRESET_IMAGES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageUrl(preset.url)}
                  className={`text-[11px] px-2 py-0.5 rounded-full border transition ${
                    imageUrl === preset.url 
                      ? 'bg-blue-600 text-white border-blue-600' 
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contact Details */}
          <div className="border-t border-slate-200 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              {type === 'lost' ? 'Owner Contact Information' : 'Finder Contact & Intake Officer'}
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Student ID / Staff ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campus Email *</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg p-2 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit button */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2.5 text-xs font-bold rounded-lg text-white shadow-md flex items-center gap-2 transition active:scale-95 ${
                type === 'lost' 
                  ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30' 
                  : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{type === 'lost' ? 'Publish Lost Alert' : 'Submit Found Item Record'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
