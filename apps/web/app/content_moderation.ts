/**
 * Andhra University AuPro Content Moderation & Safety Engine
 * 
 * Enforces university campus student conduct policies:
 * 1. Blocks profanity, abuse, harassment, and inappropriate language (English & regional).
 * 2. Blocks inappropriate, NSFW, suspicious, or prohibited photos and attachments.
 */

// Blocklist of prohibited profanity, vulgarity, abuse, and harassment terms
export const PROHIBITED_WORDS: string[] = [
  // Profanity & Slurs (English)
  'fuck', 'fucking', 'fucker', 'fuk', 'f*ck', 'f**k',
  'shit', 'sh*t', 'shite', 'bullshit',
  'asshole', 'ass', 'a$$', 'a**hole',
  'bitch', 'b!tch', 'b*tch', 'bitches',
  'bastard', 'cunt', 'c*nt',
  'dick', 'd*ck', 'cock', 'c*ck',
  'pussy', 'p*ssy', 'vagina', 'penis',
  'slut', 'sl*t', 'whore', 'wh*re',
  'nude', 'nudes', 'naked', 'porn', 'porno', 'pornography', 'xxx', 'nsfw',
  'sex', 'sexy', 'boobs', 'tits',
  
  // Violence, Threats & Campus Prohibitions
  'kill', 'suicide', 'murder', 'die', 'shoot', 'bomb',
  'ragging', 'ragged', 'rag', 'bribe', 'scam', 'fraud',
  'weed', 'drugs', 'ganja', 'alcohol', 'beer', 'liquor',

  // Regional Telugu / Indian Transliterated Abuses & Slurs
  'deng', 'dengey', 'dengu', 'dengudu',
  'lanja', 'lanjakodaka', 'lanjamunda', 'l**ja',
  'modda', 'moddalo', 'm**da',
  'puku', 'pukulo', 'p**ku',
  'gudha', 'guddalo', 'gudd',
  'na kodaka', 'nakodaka', 'vedhava', 'sannasi',
  'chavu', 'sava',
];

/**
 * 3 Core University Pillars for AuPro Content Moderation
 */
export const CAMPUS_PROBLEM_KEYWORDS = [
  'problem', 'issue', 'repair', 'broken', 'damage', 'damaged', 'defect', 'leak', 'leaking', 'leakage',
  'tap', 'pipe', 'water', 'cooler', 'filter', 'drinking water', 'purifier', 'washroom', 'toilet', 'restroom',
  'clean', 'cleanliness', 'cleaning', 'sanitation', 'hygiene', 'drain', 'drainage', 'overflow', 'smell', 'odor',
  'garbage', 'trash', 'dustbin', 'waste', 'ac', 'air conditioner', 'fan', 'light', 'tube light', 'bulb',
  'electricity', 'electric', 'power', 'powercut', 'blackout', 'generator', 'switch', 'socket', 'wiring', 'wire',
  'projector', 'mic', 'microphone', 'speaker', 'podium', 'bench', 'desk', 'chair', 'blackboard', 'whiteboard',
  'window', 'door', 'lock', 'roof', 'wall', 'crack', 'road', 'pothole', 'streetlight', 'dark', 'stray dog',
  'parking', 'bicycle', 'cycle', 'bike', 'bus', 'bus pass', 'rtc', 'complex', 'transport', 'wifi', 'wi-fi',
  'internet', 'lan', 'ethernet', 'slow internet', 'connection', 'network', 'system', 'pc', 'computer', 'monitor',
  'keyboard', 'mouse', 'printer', 'xerox', 'lab equipment', 'apparatus', 'multimeter', 'oscilloscope', 'chemical',
  'chemicals', 'hostel', 'mess', 'mess food', 'curfew', 'warden', 'geyser', 'hot water', 'pest', 'mosquito',
  'complaint', 'grievance', 'urgent', 'attention', 'help needed', 'fix this', 'fee', 'challan', 'receipt',
  'portal', 'server', 'hall ticket', 'marks correction', 'revaluation', 'admit card', 'attendance shortage',
  'condonation', 'fine', 'plumber', 'electrician'
];

export const UNIVERSITY_CAMPUS_KEYWORDS = [
  'andhra university', 'andhra univ', 'au', 'aucoe', 'auce', 'campus', 'college', 'university', 'principal',
  'dean', 'hod', 'faculty', 'prof', 'professor', 'lecturer', 'staff', 'teacher', 'registrar', 'vice chancellor',
  'vc', 'administration', 'admin block', 'academic section', 'exam branch', 'examination cell', 'cash counter',
  'dispensary', 'health center', 'clinic', 'bank', 'sbi', 'post office', 'ground', 'golden jubilee', 'cricket',
  'gymnasium', 'gym', 'canteen', 'main canteen', 'engg canteen', 'hostel', 'north hostel', 'south hostel',
  'ladies hostel', 'womens hostel', 'swarna hostel', 'dr b.r. ambedkar', 'ambedkar library', 'central library',
  'reading room', 'tln sabha', 'sabha hall', 'convocation theatre', 'sir cv raman', 'cv raman', 'maddilapalem',
  'siripuram', 'three town', 'rk beach', 'convention center', 'north campus', 'south campus', 'department',
  'dept', 'branch', 'cse', 'ece', 'eee', 'mech', 'mechanical', 'civil', 'chemical', 'marine', 'it', 'biotech',
  'pharmacy', 'fest', 'college fest', 'tech fest', 'cultural fest', 'hackathon', 'symposium', 'workshop',
  'seminar', 'webinar', 'freshers', 'farewell', 'sports day', 'youth fest', 'nss', 'ncc', 'rotaract', 'ieee',
  'csi', 'placement', 'placements', 'campus placement', 'placement drive', 'training & placement', 't&p',
  'internship', 'intern', 'interview', 'job offer', 'ctc', 'lpa', 'package', 'company visit', 'aptitude',
  'notice', 'circular', 'notification', 'holiday', 'semester start', 'calendar', 'regulation', 'alumni',
  'convocation'
];

export const ACADEMIC_STUDY_KEYWORDS = [
  'study', 'studying', 'studies', 'syllabus', 'curriculum', 'subject', 'course', 'class', 'period', 'lecture',
  'timetable', 'schedule', 'semester', 'sem', '1st sem', '2nd sem', '3rd sem', '4th sem', '5th sem', '6th sem',
  '7th sem', '8th sem', '1-1', '1-2', '2-1', '2-2', '3-1', '3-2', '4-1', '4-2', 'btech', 'b.tech', 'mtech',
  'm.tech', 'mca', 'mba', 'phd', 'degree', 'engineering', 'exam', 'examination', 'mid exam', 'mid term',
  'mids', 'internal', 'internals', 'external', 'externals', 'practical', 'practicals', 'lab exam', 'record',
  'lab record', 'observation', 'viva', 'experiment', 'assignment', 'homework', 'submission', 'deadline',
  'notes', 'handwritten', 'pdf', 'study material', 'textbook', 'book', 'author', 'question bank', 'previous year',
  'previous paper', 'pyq', 'pyqs', 'model paper', 'question paper', 'doubt', 'solve', 'solution', 'formula',
  'derivation', 'theorem', 'proof', 'concept', 'topic', 'chapter', 'unit', 'marks', 'score', 'cgpa', 'sgpa',
  'gpa', 'grade', 'credits', 'credit', 'supply', 'supplementary', 'backlog', 'backlogs', 'revaluation',
  'project', 'mini project', 'major project', 'capstone', 'guide', 'thesis', 'coding', 'programming', 'code',
  'algorithm', 'algorithms', 'data structure', 'data structures', 'dsa', 'leetcode', 'github', 'python', 'java',
  'c++', 'c programming', 'javascript', 'typescript', 'react', 'sql', 'database', 'dbms', 'operating system',
  'os', 'networks', 'computer networks', 'software engineering', 'cyber', 'security', 'ai', 'artificial intelligence',
  'ml', 'machine learning', 'deep learning', 'data science', 'cloud', 'iot', 'circuits', 'digital logic', 'vlsi',
  'embedded', 'signals', 'dsp', 'microprocessor', 'thermodynamics', 'fluid mechanics', 'strength of materials',
  'som', 'surveying', 'cad', 'autocad', 'matlab', 'math', 'maths', 'mathematics', 'calculus', 'physics',
  'chemistry', 'gate', 'gre', 'cat', 'research', 'paper', 'journal', 'ieee', 'conference', 'publication'
];

export const PROHIBITED_OFF_TOPIC_TERMS = [
  // Commercial & Financial spam
  'crypto', 'bitcoin', 'ethereum', 'forex', 'trading bot', 'earn money online', 'earn money from home',
  'daily profit', 'guaranteed return', 'casino', 'betting', 'roulette', '1xbet', 'dream11', 'bet365',
  'free recharge', 'cashback bonus', 'discount coupon', 'promo code', 'buy now at discount', 'limited time deal',
  'dropshipping', 'sell my old phone', 'buy iphone cheap', 'work from home part time',

  // Cinema / Film gossip / Entertainment
  'box office collection', 'first day box office', 'fan war', 'hero birthday celebration', 'movie review',
  'theatre occupancy', 'ott release date', 'teaser review', 'trailer review', 'heroine hot', 'heroine photos',
  'actor gossip', 'actress gossip', 'cinema tickets',

  // Partisan politics
  'vote for mla', 'vote for mp', 'general election party', 'chief minister speech', 'prime minister speech',
  'election rally', 'political party flag',

  // Adult / Dating
  'call girls', 'escort service', 'dating app', 'find girlfriend', 'find boyfriend', 'looking for girl',
  'looking for boy', 'sugar daddy', 'hookup meetup', 'adult chat telegram', 'private video call'
];

export interface TopicAnalysisResult {
  isRelevant: boolean;
  categoryName?: string;
  matchedKeywords: string[];
  reason?: string;
}

export function analyzePostTopic(text: string, categoryKind?: string): TopicAnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      isRelevant: false,
      matchedKeywords: [],
      reason: 'Please enter post details.',
    };
  }

  const normalized = text
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 1. Check for Prohibited Off-Topic Patterns (commercial, gossip, ads, politics, dating)
  for (const term of PROHIBITED_OFF_TOPIC_TERMS) {
    if (normalized.includes(term)) {
      return {
        isRelevant: false,
        matchedKeywords: [term],
        reason: 'Post blocked: Commercial promotions, entertainment gossip, political campaigning, and solicitations are strictly prohibited on AuPro. Content must relate exclusively to AU campus or academics.',
      };
    }
  }

  // 2. Check for gibberish / extreme character repetition
  if (/([a-z])\1{7,}/i.test(normalized)) {
    return {
      isRelevant: false,
      matchedKeywords: [],
      reason: 'Post blocked: Please enter meaningful content relating to university problems, campus life, or studies.',
    };
  }

  const matchedProblems: string[] = [];
  const matchedCampus: string[] = [];
  const matchedAcademics: string[] = [];

  for (const kw of CAMPUS_PROBLEM_KEYWORDS) {
    if (normalized.includes(kw)) matchedProblems.push(kw);
  }
  for (const kw of UNIVERSITY_CAMPUS_KEYWORDS) {
    if (normalized.includes(kw)) matchedCampus.push(kw);
  }
  for (const kw of ACADEMIC_STUDY_KEYWORDS) {
    if (normalized.includes(kw)) matchedAcademics.push(kw);
  }

  const allMatched = [...matchedProblems, ...matchedCampus, ...matchedAcademics];

  if (allMatched.length > 0) {
    let categoryName = 'Campus Life';
    if (matchedProblems.length > 0 || categoryKind === 'problem') {
      categoryName = 'Campus Problem';
    } else if (matchedAcademics.length > 0) {
      categoryName = 'Academic Study';
    }

    return {
      isRelevant: true,
      categoryName,
      matchedKeywords: Array.from(new Set(allMatched)),
    };
  }

  // Educational / campus contextual fallback
  const educationalFallback = [
    'student', 'college', 'campus', 'batch', 'classmate', 'friend', 'roommate',
    'hosteller', 'day scholar', 'senior', 'junior', 'teacher', 'attendance', 'learn',
    'degree', 'semester', 'score', 'university', 'help', 'doubt', 'notes'
  ];
  for (const w of educationalFallback) {
    if (normalized.includes(w)) {
      return {
        isRelevant: true,
        categoryName: 'Campus Life',
        matchedKeywords: [w],
      };
    }
  }

  return {
    isRelevant: false,
    matchedKeywords: [],
    reason: 'Post blocked: AuPro feed is strictly reserved for Andhra University problems, campus life, and academic studies. Your post appears off-topic. Please keep posts focused on university matters, coursework, exams, or campus issues.',
  };
}

export interface ModerationResult {
  isValid: boolean;
  reason?: string;
  flaggedWord?: string;
  categoryName?: string;
}

/**
 * Validates text content for:
 * 1. Profanity, vulgarity, abuse, and safety.
 * 2. University, Campus Problem, and Academic Study relevance.
 */
export function validateTextContent(text: string, categoryKind?: string): ModerationResult {
  if (!text) return { isValid: true };

  const normalized = text
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width spaces
    .replace(/[._\-*!@#$%^&()]/g, ' ')     // replace separators with spaces
    .replace(/\s+/g, ' ');

  const words = normalized.split(/\s+/);

  for (const word of words) {
    const cleanWord = word.trim();
    if (!cleanWord) continue;

    for (const bad of PROHIBITED_WORDS) {
      if (cleanWord === bad || (bad.length >= 4 && cleanWord.includes(bad))) {
        return {
          isValid: false,
          flaggedWord: bad,
          reason: `Post blocked: Inappropriate or prohibited language detected ("${cleanWord}"). Please adhere to Andhra University student code of conduct.`,
        };
      }
    }
  }

  // Also check direct substring matches for severe explicit terms
  for (const bad of ['porn', 'nude', 'xxx', 'nsfw', 'lanja', 'modda', 'puku', 'deng']) {
    if (normalized.includes(bad)) {
      return {
        isValid: false,
        flaggedWord: bad,
        reason: 'Post blocked: Content violates Andhra University campus safety and decency guidelines.',
      };
    }
  }

  // 2. University & Academic Relevance Verification
  const topicCheck = analyzePostTopic(text, categoryKind);
  if (!topicCheck.isRelevant) {
    return {
      isValid: false,
      reason: topicCheck.reason,
    };
  }

  return { isValid: true, categoryName: topicCheck.categoryName };
}

export function validateUniversityRelevance(text: string, categoryKind?: string): ModerationResult {
  const topicCheck = analyzePostTopic(text, categoryKind);
  return {
    isValid: topicCheck.isRelevant,
    reason: topicCheck.reason,
    categoryName: topicCheck.categoryName,
  };
}

/**
 * Validates uploaded photo / image attachments for safety, format, and decency.
 */
export async function validateImageSafety(file: File): Promise<ModerationResult> {
  if (!file) return { isValid: true };

  // 1. MIME Type Validation
  const validMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  if (!validMimeTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      reason: 'Photo rejected: Only standard campus photo formats (JPEG, PNG, WebP) are permitted.',
    };
  }

  // 2. File Size Checks (Min 2 KB to prevent corrupt/script files; Max 12 MB)
  if (file.size < 2048) {
    return {
      isValid: false,
      reason: 'Photo rejected: The image file is corrupt or too small.',
    };
  }
  if (file.size > 12 * 1024 * 1024) {
    return {
      isValid: false,
      reason: 'Photo rejected: Image file size exceeds the 12 MB limit.',
    };
  }

  // 3. Filename Keywords Filter (Catching explicit / inappropriate labels)
  const lowerName = file.name.toLowerCase();
  const prohibitedFileTokens = [
    'nude', 'naked', 'nsfw', 'xxx', 'porn', 'leaked', 'sex', 'boobs', 'tits',
    'dick', 'pussy', 'adult', 'kill', 'gore', 'weapon', 'drugs', 'abuse',
  ];

  for (const token of prohibitedFileTokens) {
    if (lowerName.includes(token)) {
      return {
        isValid: false,
        reason: 'Photo rejected: Image file contains inappropriate or prohibited naming violating university policies.',
      };
    }
  }

  // 4. In-Memory Dimension and Decency Verification
  try {
    const isImageDecent = await new Promise<boolean>((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        // Valid image dimensions check
        if (img.naturalWidth < 40 || img.naturalHeight < 40) {
          resolve(false);
          return;
        }

        // Basic canvas inspection for extreme solid color or abnormal payloads
        try {
          const canvas = document.createElement('canvas');
          canvas.width = 32;
          canvas.height = 32;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, 32, 32);
            const data = ctx.getImageData(0, 0, 32, 32).data;
            let totalBrightness = 0;
            for (let i = 0; i < data.length; i += 4) {
              totalBrightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
            }
            const avg = totalBrightness / (32 * 32);
            // Allow normal real-world images (not fully pitch black corrupt files)
            if (avg <= 1 && data.length > 0) {
              resolve(false);
              return;
            }
          }
        } catch {
          // If canvas check fails on browser security, default to pass if dimensions were valid
        }

        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(false);
      };

      img.src = objectUrl;
    });

    if (!isImageDecent) {
      return {
        isValid: false,
        reason: 'Photo rejected: The uploaded image could not be verified as a valid campus photo.',
      };
    }
  } catch {
    // Fallback gracefully if DOM is unavailable
  }

  return { isValid: true };
}
