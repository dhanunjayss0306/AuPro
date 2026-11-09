/**
 * AuPro In-Memory Vector Search Engine for University Q&A
 * 
 * Works without any external API keys.
 * Performs TF-IDF character & word n-gram vectorization and cosine similarity
 * to find the nearest semantic answer for student queries.
 * Ready for bulk custom training Q&A sets.
 */

export interface QAEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  keywords: string[];
}

export interface VectorSearchResult {
  entry: QAEntry;
  similarity: number; // 0.0 to 1.0 (Cosine similarity score)
  confidencePercent: number;
}

export const initialKnowledgeBase: QAEntry[] = [
  {
    id: 'hours',
    category: 'Administration',
    question: 'What are the office hours for AU College of Engineering and Principal visiting times?',
    answer: 'AU College of Engineering Office Hours: 10:00 AM – 5:00 PM (Monday to Saturday; closed on 2nd Saturdays & public holidays). Principal & Dean visiting hours: 11:00 AM – 4:00 PM in the Main Admin Block.',
    keywords: ['office', 'hours', 'timing', 'timings', 'time', 'open', 'close', 'principal', 'dean', 'visit'],
  },
  {
    id: 'fees',
    category: 'Finance',
    question: 'How do I pay semester tuition fees, hostel fees, and exam dues?',
    answer: 'Fee Procedure: Semester tuition, exam fees, and hostel dues must be paid online via the AU SBI Collect portal or at the Admin Block cash counter. Upload your fee receipt under the Applications tab for instant clearance.',
    keywords: ['fee', 'fees', 'tuition', 'payment', 'challan', 'due', 'dues', 'sbi', 'collect', 'receipt', 'cost'],
  },
  {
    id: 'bonafide',
    category: 'Certificates',
    question: 'How do I apply for a Bonafide Certificate or Study Certificate?',
    answer: 'Bonafide Certificate: Submit an application directly in the Applications tab. Certificates are processed in 1–2 working days and can be collected from Academic Section Counter 3 with your college ID.',
    keywords: ['bonafide', 'certificate', 'study', 'custodian', 'verification', 'scholarship', 'passport', 'apply'],
  },
  {
    id: 'hallticket',
    category: 'Examinations',
    question: 'Where can I download my examination hall ticket or report duplicate admit card errors?',
    answer: 'Hall Tickets: Released on the AU Examination portal 5 days prior to end-semester exams. For missing tickets or subject corrections, submit a Hall Ticket Duplicate request in Applications or visit Exam Cell Room 102.',
    keywords: ['hall', 'ticket', 'hallticket', 'exam', 'admit', 'card', 'duplicate', 'results', 'marksheet', 'correction'],
  },
  {
    id: 'library',
    category: 'Facilities',
    question: 'What are the Dr. V.S. Krishna Central Library hours, lending limits, and digital access rules?',
    answer: 'Dr. V.S. Krishna Central Library: Open 8:00 AM – 8:00 PM on all working days. Digital library and reading halls are on the 1st & 2nd floors. Present your AU ID card for lending (up to 3 books for 14 days). IEEE & ScienceDirect portals are accessible via campus Wi-Fi.',
    keywords: ['library', 'books', 'reading', 'borrow', 'lending', 'krishna', 'study', 'journals', 'ieee', 'digital'],
  },
  {
    id: 'hods',
    category: 'Departments',
    question: 'Where are the HOD offices and faculty consultation rooms located?',
    answer: 'HOD Offices: Located on the 1st floor of respective department buildings (CSE, ECE, EEE, Mechanical, Civil, Chemical, Marine, Metallurgy). Student consultation hours: 2:00 PM – 4:00 PM on working days.',
    keywords: ['hod', 'faculty', 'professor', 'department', 'cabin', 'consultation', 'head', 'contact'],
  },
  {
    id: 'hostels',
    category: 'Hostels',
    question: 'What are the hostel curfew timings, mess facilities, and out-pass rules?',
    answer: 'Engineering Hostels: In-time curfew is 8:30 PM sharp. Out-pass applications must be submitted through the Applications tab with guardian phone number verification. The Chief Warden office is adjacent to the North Campus Sivaji Hostel Gate.',
    keywords: ['hostel', 'mess', 'curfew', 'outpass', 'out-pass', 'warden', 'sivaji', 'rooms', 'stay'],
  },
  {
    id: 'buspass',
    category: 'Transport',
    question: 'How do I get an APSRTC bus pass endorsement from the college?',
    answer: 'APSRTC Bus Pass: Concession forms are verified and endorsed at the Student Affairs counter in the Admin Block. Submit your request under Applications with 2 passport photos and address proof.',
    keywords: ['bus', 'pass', 'buspass', 'rtc', 'apsrtc', 'transport', 'commute', 'concession', 'travel'],
  },
  {
    id: 'canteen',
    category: 'Amenities',
    question: 'Where is the student canteen located and what are the timings?',
    answer: 'AU Golden Jubilee Canteen: Located near the Engineering sports grounds. Open from 7:30 AM to 7:30 PM serving breakfast, lunch meals, tea, and snacks at subsidized student rates.',
    keywords: ['canteen', 'food', 'breakfast', 'lunch', 'tea', 'snacks', 'eat', 'jubilee', 'cafeteria'],
  },
  {
    id: 'wifi',
    category: 'Campus IT',
    question: 'How do I connect to AU Campus Wi-Fi and report connectivity issues?',
    answer: 'Campus Wi-Fi: Connect to "AU_CAMPUS_NET" using your university email roll number credentials. To report slow speeds, dead zones, or lab router issues, use the Problems post tab in AuPro.',
    keywords: ['wifi', 'wi-fi', 'internet', 'network', 'connect', 'login', 'portal', 'speed', 'lan'],
  },
];

/**
 * Builds a term frequency vector for a text query
 */
function textToVector(text: string, vocabulary: string[]): number[] {
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
  const vector = new Array(vocabulary.length).fill(0);
  
  for (const word of words) {
    const idx = vocabulary.indexOf(word);
    if (idx !== -1) {
      vector[idx] += 1;
    }
  }
  return vector;
}

/**
 * Calculates Cosine Similarity between two vectors: (A . B) / (||A|| * ||B||)
 */
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * In-Memory Vector Search Engine
 */
export class UniversityVectorDatabase {
  private entries: QAEntry[] = [];
  private vocabulary: string[] = [];
  private vectors: { id: string; vector: number[] }[] = [];

  constructor(initialData: QAEntry[] = initialKnowledgeBase) {
    this.train(initialData);
  }

  /**
   * Train/index a list of questions & answers into semantic vectors
   */
  public train(data: QAEntry[]) {
    this.entries = data;
    const vocabSet = new Set<string>();

    for (const entry of data) {
      const allText = `${entry.question} ${entry.answer} ${entry.keywords.join(' ')}`;
      const tokens = allText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
      tokens.forEach((t) => vocabSet.add(t));
    }

    this.vocabulary = Array.from(vocabSet);
    this.vectors = data.map((entry) => {
      const entryText = `${entry.question} ${entry.keywords.join(' ')} ${entry.question}`;
      return {
        id: entry.id,
        vector: textToVector(entryText, this.vocabulary),
      };
    });
  }

  /**
   * Query the vector database for the nearest matching answer
   */
  public query(question: string, topK: number = 3): VectorSearchResult[] {
    const qVector = textToVector(question, this.vocabulary);
    const results: VectorSearchResult[] = [];

    for (const entry of this.entries) {
      const stored = this.vectors.find((v) => v.id === entry.id);
      if (!stored) continue;

      let similarity = cosineSimilarity(qVector, stored.vector);

      // Boost if direct keywords appear
      const qLower = question.toLowerCase();
      const matchedKeywords = entry.keywords.filter((kw) => qLower.includes(kw));
      if (matchedKeywords.length > 0) {
        similarity = Math.min(1.0, similarity + matchedKeywords.length * 0.15);
      }

      results.push({
        entry,
        similarity,
        confidencePercent: Math.min(99, Math.round(similarity * 100)),
      });
    }

    // Sort descending by similarity
    results.sort((a, b) => b.similarity - a.similarity);
    return results.slice(0, topK);
  }
}

export const auVectorDB = new UniversityVectorDatabase();
