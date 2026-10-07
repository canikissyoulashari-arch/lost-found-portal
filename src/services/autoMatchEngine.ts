import { 
  Item, 
  AutoMatchResult, 
  MatchFactor, 
  ItemCategory, 
  CampusLocation, 
  RealTimeSolverResult, 
  SolverQueryAnalysis, 
  SolverCandidate 
} from '../types';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 
  'by', 'about', 'is', 'it', 'was', 'my', 'i', 'lost', 'found', 'near', 'left',
  'around', 'please', 'has', 'have', 'from', 'this', 'that', 'some', 'there'
]);

const COLOR_KEYWORDS = [
  'black', 'white', 'blue', 'navy', 'red', 'silver', 'grey', 'gray', 
  'green', 'yellow', 'gold', 'pink', 'purple', 'orange', 'brown', 'matte', 'rose gold'
];

const BRAND_KEYWORDS = [
  'apple', 'airpods', 'iphone', 'macbook', 'ipad', 'samsung', 'galaxy',
  'sony', 'bose', 'dell', 'lenovo', 'hp', 'hydro flask', 'hydroflask',
  'stanley', 'yeti', 'nike', 'adidas', 'north face', 'patagonia',
  'ti-84', 'casio', 'logitech', 'anker', 'kindle', 'jansport', 'fjallraven'
];

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !STOP_WORDS.has(word));
}

export function calculateMatchScore(lostItem: Item, foundItem: Item): { score: number; factors: MatchFactor[]; summary: string } {
  // If categories are completely different and not related, score stays low
  let totalScore = 0;
  const factors: MatchFactor[] = [];

  // 1. Category Matching (Max 30)
  if (lostItem.category === foundItem.category) {
    totalScore += 30;
    factors.push({
      label: 'Exact Category Match',
      score: 30,
      description: `Both logged under '${lostItem.category}'.`
    });
  } else {
    // Check compatible categories
    const compatibleGroups = [
      ['Student IDs & Wallets', 'Keys & Dorm Badges'],
      ['Electronics', 'Other'],
      ['Clothing & Accessories', 'Bags & Backpacks'],
      ['Books & Notebooks', 'Other']
    ];
    const isCompatible = compatibleGroups.some(group => 
      group.includes(lostItem.category) && group.includes(foundItem.category)
    );

    if (isCompatible) {
      totalScore += 12;
      factors.push({
        label: 'Related Category Match',
        score: 12,
        description: `Compatible types: ${lostItem.category} & ${foundItem.category}.`
      });
    }
  }

  // 2. Keyword & Brand Overlap (Max 35)
  const lostTokens = new Set([
    ...tokenize(lostItem.title),
    ...tokenize(lostItem.description),
    ...lostItem.tags.map(t => t.toLowerCase())
  ]);

  const foundTokens = new Set([
    ...tokenize(foundItem.title),
    ...tokenize(foundItem.description),
    ...foundItem.tags.map(t => t.toLowerCase())
  ]);

  const commonWords: string[] = [];
  lostTokens.forEach(token => {
    if (foundTokens.has(token)) {
      commonWords.push(token);
    }
  });

  if (commonWords.length > 0) {
    const rawWordScore = Math.min(25, commonWords.length * 7);
    totalScore += rawWordScore;
    factors.push({
      label: 'Matching Key Descriptors',
      score: rawWordScore,
      description: `Overlapping keywords: ${commonWords.slice(0, 5).join(', ')}`
    });
  }

  // Brand / Model specific check (Max 15)
  const fullLostText = `${lostItem.title} ${lostItem.description}`.toLowerCase();
  const fullFoundText = `${foundItem.title} ${foundItem.description}`.toLowerCase();

  const matchedBrands = BRAND_KEYWORDS.filter(brand => 
    fullLostText.includes(brand) && fullFoundText.includes(brand)
  );

  if (matchedBrands.length > 0) {
    totalScore += 15;
    factors.push({
      label: 'Brand / Model Confirmation',
      score: 15,
      description: `Specific brand verified: ${matchedBrands.join(', ').toUpperCase()}`
    });
  }

  // Color check (Max 10)
  const matchedColors = COLOR_KEYWORDS.filter(color => 
    fullLostText.includes(color) && fullFoundText.includes(color)
  );

  if (matchedColors.length > 0) {
    totalScore += 10;
    factors.push({
      label: 'Color Alignment',
      score: 10,
      description: `Matching color attribute: ${matchedColors.join(', ')}`
    });
  }

  // 3. Location Correlation (Max 20)
  if (lostItem.location === foundItem.location) {
    totalScore += 20;
    factors.push({
      label: 'Campus Location Match',
      score: 20,
      description: `Both registered at ${lostItem.location}.`
    });
  }

  // 4. Time Sequence Validation (Max 10)
  const lostTime = new Date(lostItem.dateTime).getTime();
  const foundTime = new Date(foundItem.dateTime).getTime();
  const hoursDiff = (foundTime - lostTime) / (1000 * 60 * 60);

  // Ideal scenario: Found right after lost, or within 7 days
  if (hoursDiff >= -2 && hoursDiff <= 72) {
    totalScore += 10;
    factors.push({
      label: 'High-Probability Timeline',
      score: 10,
      description: hoursDiff >= 0 
        ? `Found within ${(hoursDiff).toFixed(0)} hours after being lost.`
        : 'Reported timestamps within hours of each other.'
    });
  } else if (hoursDiff > 72 && hoursDiff <= 168) {
    totalScore += 5;
    factors.push({
      label: 'Timeline Feasibility',
      score: 5,
      description: 'Reported within 1 week timeframe.'
    });
  }

  const finalScore = Math.min(100, Math.round(totalScore));

  let summary = 'Low similarity';
  if (finalScore >= 80) {
    summary = 'Outstanding Match — Highly likely to be the same item!';
  } else if (finalScore >= 60) {
    summary = 'Strong Match — Recommended for claim review.';
  } else if (finalScore >= 40) {
    summary = 'Moderate Match — Similar characteristics observed.';
  }

  return {
    score: finalScore,
    factors,
    summary
  };
}

export function runAutoMatch(items: Item[]): AutoMatchResult[] {
  const lostItems = items.filter(item => item.type === 'lost' && item.status !== 'returned');
  const foundItems = items.filter(item => item.type === 'found' && item.status !== 'returned');
  const results: AutoMatchResult[] = [];

  for (const lost of lostItems) {
    for (const found of foundItems) {
      const match = calculateMatchScore(lost, found);
      // Threshold: 50% or above is considered an auto-match candidate
      if (match.score >= 50) {
        results.push({
          lostItem: lost,
          foundItem: found,
          confidenceScore: match.score,
          factors: match.factors,
          summary: match.summary,
          status: 'pending'
        });
      }
    }
  }

  // Sort descending by highest score
  return results.sort((a, b) => b.confidenceScore - a.confidenceScore);
}

export function analyzeQuery(query: string): SolverQueryAnalysis {
  const lower = query.toLowerCase();

  // Inferred intent
  let inferredType: 'lost' | 'found' | 'any' = 'any';
  if (/lost|misplaced|left|missing|dropped|forgot/i.test(lower)) {
    inferredType = 'lost';
  } else if (/found|picked up|handed|turned in|recovered/i.test(lower)) {
    inferredType = 'found';
  }

  // Detected category
  let detectedCategory: ItemCategory | undefined;
  if (/airpods|earbuds|headphones|macbook|laptop|phone|iphone|charger|calculator|ipad|kindle|tablet/i.test(lower)) {
    detectedCategory = 'Electronics';
  } else if (/id|badge|student card|wallet|credit|money|cash/i.test(lower)) {
    detectedCategory = 'Student IDs & Wallets';
  } else if (/key|keys|keychain|fob|dorm key/i.test(lower)) {
    detectedCategory = 'Keys & Dorm Badges';
  } else if (/bottle|flask|hydro|water|stanley|yeti|mug/i.test(lower)) {
    detectedCategory = 'Bottles & Drinkware';
  } else if (/backpack|bag|tote|purse|sack/i.test(lower)) {
    detectedCategory = 'Bags & Backpacks';
  } else if (/jacket|hoodie|coat|vest|sweater|gloves|scarf|shirt|pants/i.test(lower)) {
    detectedCategory = 'Clothing & Accessories';
  } else if (/book|notebook|binder|textbook|folder|notes/i.test(lower)) {
    detectedCategory = 'Books & Notebooks';
  } else if (/glasses|sunglasses|spectacles|ring|watch|necklace|bracelet/i.test(lower)) {
    detectedCategory = 'Eyewear & Jewelry';
  }

  // Detected campus location
  let detectedLocation: CampusLocation | undefined;
  if (/library|digital lab|circulation|books/i.test(lower)) {
    detectedLocation = 'BBSUTSD Main Central Library & IT Lab';
  } else if (/computer|cs|it|software|programming|computing/i.test(lower)) {
    detectedLocation = 'Department of Computer Science & IT';
  } else if (/electrical|electronics|circuit|power|telecom/i.test(lower)) {
    detectedLocation = 'Electrical & Electronics Engineering Block';
  } else if (/mechanical|energy|thermo|workshop|lathe/i.test(lower)) {
    detectedLocation = 'Mechanical & Energy Technology Labs';
  } else if (/civil|environmental|concrete|surveying/i.test(lower)) {
    detectedLocation = 'Civil & Environmental Technology Block';
  } else if (/admin|vc|secretariat|registrar|finance|dean/i.test(lower)) {
    detectedLocation = 'Administration Block & VC Secretariat';
  } else if (/cafeteria|canteen|auditorium|dining|hall/i.test(lower)) {
    detectedLocation = 'Student Cafeteria & Auditorium';
  } else if (/hostel|dorm|gate|dispatch|security|guard/i.test(lower)) {
    detectedLocation = 'Campus Hostels Complex & Main Gate Dispatch';
  }

  // Detected brands
  const detectedBrands = BRAND_KEYWORDS.filter(b => lower.includes(b));
  const detectedColors = COLOR_KEYWORDS.filter(c => lower.includes(c));
  const keyTokens = tokenize(query);

  return {
    inferredType,
    detectedCategory,
    detectedLocation,
    detectedBrands,
    detectedColors,
    keyTokens
  };
}

export function solveQueryRealTime(
  query: string,
  items: Item[],
  overrideCategory?: ItemCategory,
  overrideLocation?: CampusLocation,
  overrideType?: 'lost' | 'found' | 'any'
): RealTimeSolverResult {
  const analysis = analyzeQuery(query);
  const effectiveCategory = overrideCategory || analysis.detectedCategory;
  const effectiveLocation = overrideLocation || analysis.detectedLocation;
  const effectiveType = overrideType || analysis.inferredType;

  // Target seek type:
  // If user is searching because they lost something, look for found items in custody!
  // If user found something, look for lost items owners filed!
  const targetSeekType = effectiveType === 'lost' ? 'found' : effectiveType === 'found' ? 'lost' : undefined;

  const candidates: SolverCandidate[] = [];

  for (const item of items) {
    if (item.status === 'returned') continue;

    let score = 0;
    const matchReasons: string[] = [];

    // Target seek state
    if (targetSeekType && item.type === targetSeekType) {
      score += 20;
      matchReasons.push(`Matches target state (${item.type.toUpperCase()})`);
    } else if (!targetSeekType) {
      score += 10;
    }

    // Category match
    if (effectiveCategory && item.category === effectiveCategory) {
      score += 30;
      matchReasons.push(`Category: ${effectiveCategory}`);
    }

    // Location match
    if (effectiveLocation && item.location === effectiveLocation) {
      score += 25;
      matchReasons.push(`Campus Zone: ${effectiveLocation}`);
    }

    // Keyword & token overlaps
    const itemTokens = new Set([
      ...tokenize(item.title),
      ...tokenize(item.description),
      ...item.tags.map(t => t.toLowerCase())
    ]);

    const overlap = analysis.keyTokens.filter(t => itemTokens.has(t));
    if (overlap.length > 0) {
      const keywordScore = Math.min(30, overlap.length * 10);
      score += keywordScore;
      matchReasons.push(`Keywords: ${overlap.slice(0, 3).join(', ')}`);
    }

    // Brand match
    const brandHit = analysis.detectedBrands.some(b => 
      item.title.toLowerCase().includes(b) || item.description.toLowerCase().includes(b)
    );
    if (brandHit) {
      score += 15;
      matchReasons.push('Brand alignment');
    }

    // Color match
    const colorHit = analysis.detectedColors.some(c => 
      item.title.toLowerCase().includes(c) || item.description.toLowerCase().includes(c)
    );
    if (colorHit) {
      score += 10;
      matchReasons.push('Color match');
    }

    const finalScore = Math.min(100, Math.round(score));

    // Threshold: include items with at least some similarity
    if (finalScore >= 30) {
      let recommendedAction = 'Review item file and check custody location.';
      if (item.type === 'found' && item.storageLocation) {
        recommendedAction = `Available at ${item.storageLocation}.`;
      } else if (item.type === 'lost') {
        recommendedAction = `Contact owner ${item.contactName} (${item.contactEmail}).`;
      }

      candidates.push({
        item,
        score: finalScore,
        matchReasons,
        recommendedAction
      });
    }
  }

  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  const topMatch = candidates[0] || null;

  // Generate real-time friendly guidance text
  let guidanceText = 'Describe your item above or select your campus zone for instant matching.';
  const immediateActions: string[] = [];

  if (topMatch && topMatch.score >= 70) {
    guidanceText = `🎯 High-confidence match found! A matching ${topMatch.item.category.toLowerCase()} was reported at ${topMatch.item.location}.`;
    if (topMatch.item.storageLocation) {
      immediateActions.push(`Visit ${topMatch.item.storageLocation} with Student ID to claim.`);
    }
    immediateActions.push(`Inspect item details and submit verification challenge proof.`);
  } else if (topMatch && topMatch.score >= 45) {
    guidanceText = `🔎 Found ${candidates.length} potential candidates matching your description. Check the list below.`;
    immediateActions.push(`Compare distinguishing features like stickers, color, or serial digits.`);
    immediateActions.push(`If none match, one-click publish a public Lost/Found alert.`);
  } else if (query.trim().length > 3) {
    guidanceText = `No immediate match logged yet in custody. Don't worry! New items are logged every hour.`;
    immediateActions.push(`Publish an official alert in 1-click so you get auto-notified when turned in.`);
    immediateActions.push(`Contact Campus Security Dispatch at (555) 019-2834.`);
  }

  return {
    query,
    analysis,
    candidates,
    topMatch,
    guidanceText,
    immediateActions
  };
}
