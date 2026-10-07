import { Item, SafeTag, ClaimVerificationRequest } from '../types';
import { INITIAL_ITEMS, INITIAL_SAFETAGS } from './mockData';
import QRCode from 'qrcode';

const STORAGE_KEY_ITEMS = 'bbsutsd_campus_lost_found_items_v2';
const STORAGE_KEY_SAFETAGS = 'bbsutsd_campus_safetags_v2';
const STORAGE_KEY_CLAIMS = 'bbsutsd_campus_claims_v2';

export function getStoredItems(): Item[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) {
      saveStoredItems(INITIAL_ITEMS);
      return INITIAL_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading items from localStorage', e);
    return INITIAL_ITEMS;
  }
}

export function saveStoredItems(items: Item[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  } catch (e) {
    console.error('Failed saving items to localStorage', e);
  }
}

export function addItem(item: Omit<Item, 'id' | 'qrCodeId' | 'status'> & Partial<Pick<Item, 'id' | 'qrCodeId' | 'status'>>): Item {
  const items = getStoredItems();
  const id = item.id || `LF-${Math.floor(100 + Math.random() * 900)}`;
  const qrCodeId = item.qrCodeId || `QR-${item.type.toUpperCase()}-${id.replace('LF-', '')}`;
  
  const newItem: Item = {
    ...item,
    id,
    qrCodeId,
    status: item.status || 'open',
    tags: item.tags || []
  };

  items.unshift(newItem);
  saveStoredItems(items);
  return newItem;
}

export function updateItemStatus(itemId: string, status: Item['status'], claimantId?: string): Item | null {
  const items = getStoredItems();
  const idx = items.findIndex(i => i.id === itemId);
  if (idx === -1) return null;

  items[idx] = {
    ...items[idx],
    status,
    claimantStudentId: claimantId || items[idx].claimantStudentId,
    resolvedAt: status === 'returned' ? new Date().toISOString() : items[idx].resolvedAt
  };

  saveStoredItems(items);
  return items[idx];
}

export function linkMatch(lostId: string, foundId: string, score: number): void {
  const items = getStoredItems();
  const lostIdx = items.findIndex(i => i.id === lostId);
  const foundIdx = items.findIndex(i => i.id === foundId);

  if (lostIdx !== -1) {
    items[lostIdx].status = 'matched';
    items[lostIdx].matchedWithId = foundId;
    items[lostIdx].matchScore = score;
  }
  if (foundIdx !== -1) {
    items[foundIdx].status = 'matched';
    items[foundIdx].matchedWithId = lostId;
    items[foundIdx].matchScore = score;
  }

  saveStoredItems(items);
}

export function getStoredSafeTags(): SafeTag[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAFETAGS);
    if (!raw) {
      saveStoredSafeTags(INITIAL_SAFETAGS);
      return INITIAL_SAFETAGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_SAFETAGS;
  }
}

export function saveStoredSafeTags(tags: SafeTag[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_SAFETAGS, JSON.stringify(tags));
  } catch (e) {
    console.error('Failed saving SafeTags', e);
  }
}

export function createSafeTag(tagData: Omit<SafeTag, 'id' | 'createdAt'>): SafeTag {
  const tags = getStoredSafeTags();
  const newTag: SafeTag = {
    ...tagData,
    id: `ST-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString()
  };
  tags.unshift(newTag);
  saveStoredSafeTags(tags);
  return newTag;
}

export function getClaims(): ClaimVerificationRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLAIMS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function submitClaim(claim: Omit<ClaimVerificationRequest, 'id' | 'timestamp' | 'status'>): ClaimVerificationRequest {
  const claims = getClaims();
  const newClaim: ClaimVerificationRequest = {
    ...claim,
    id: `CLM-${Math.floor(1000 + Math.random() * 9000)}`,
    timestamp: new Date().toISOString(),
    status: 'pending'
  };
  claims.unshift(newClaim);
  localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(claims));
  return newClaim;
}

export function resetToDefaults(): void {
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(INITIAL_ITEMS));
  localStorage.setItem(STORAGE_KEY_SAFETAGS, JSON.stringify(INITIAL_SAFETAGS));
  localStorage.removeItem(STORAGE_KEY_CLAIMS);
}

// Generate QR Code as DataURL
export async function generateQrDataUrl(text: string, options = { width: 256, margin: 2 }): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: options.width,
      margin: options.margin,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('QR code generation error', err);
    return '';
  }
}
