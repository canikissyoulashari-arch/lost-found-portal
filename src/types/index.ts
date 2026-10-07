export type ItemType = 'lost' | 'found';

export type ItemCategory = 
  | 'Electronics'
  | 'Student IDs & Wallets'
  | 'Keys & Dorm Badges'
  | 'Books & Notebooks'
  | 'Bags & Backpacks'
  | 'Clothing & Accessories'
  | 'Bottles & Drinkware'
  | 'Eyewear & Jewelry'
  | 'Sports Equipment'
  | 'Other';

export type CampusLocation =
  | 'BBSUTSD Main Central Library & IT Lab'
  | 'Department of Computer Science & IT'
  | 'Electrical & Electronics Engineering Block'
  | 'Mechanical & Energy Technology Labs'
  | 'Civil & Environmental Technology Block'
  | 'Administration Block & VC Secretariat'
  | 'Student Cafeteria & Auditorium'
  | 'Campus Hostels Complex & Main Gate Dispatch';

export type ItemStatus = 'open' | 'matched' | 'in_claim' | 'returned';

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  location: CampusLocation;
  specificSpot?: string;
  dateTime: string; // ISO date string
  description: string;
  secretDetails?: string; // Verifiable detail only the true owner knows
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  studentId?: string;
  status: ItemStatus;
  qrCodeId: string;
  storageLocation?: string; // e.g. "Security Desk - Bin A-14"
  imageUrl?: string;
  tags: string[];
  matchedWithId?: string;
  matchScore?: number;
  resolvedAt?: string;
  claimantStudentId?: string;
}

export interface MatchFactor {
  label: string;
  score: number;
  description: string;
}

export interface AutoMatchResult {
  lostItem: Item;
  foundItem: Item;
  confidenceScore: number; // 0 - 100
  factors: MatchFactor[];
  summary: string;
  status: 'pending' | 'verified' | 'dismissed';
}

export interface SafeTag {
  id: string; // unique code like ST-84920
  itemName: string;
  category: ItemCategory;
  ownerName: string;
  ownerStudentId: string;
  ownerEmail: string;
  ownerPhone: string;
  emergencyNote?: string;
  createdAt: string;
}

export interface ClaimVerificationRequest {
  id: string;
  itemId: string;
  claimantName: string;
  claimantEmail: string;
  claimantPhone: string;
  claimantStudentId: string;
  proofDescription: string;
  timestamp: string;
  status: 'pending' | 'approved' | 'rejected';
}

export interface SolverQueryAnalysis {
  inferredType: 'lost' | 'found' | 'any';
  detectedCategory?: ItemCategory;
  detectedLocation?: CampusLocation;
  detectedBrands: string[];
  detectedColors: string[];
  keyTokens: string[];
}

export interface SolverCandidate {
  item: Item;
  score: number;
  matchReasons: string[];
  recommendedAction: string;
}

export interface RealTimeSolverResult {
  query: string;
  analysis: SolverQueryAnalysis;
  candidates: SolverCandidate[];
  topMatch: SolverCandidate | null;
  guidanceText: string;
  immediateActions: string[];
}
