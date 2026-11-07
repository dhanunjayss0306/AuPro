'use client';

import React, { useEffect, useState, useRef } from 'react';
import {
  InstagramFeedIcon,
  InstagramLikeIcon,
  InstagramShareIcon,
  InstagramLocationIcon,
  NotificationIcon,
  ServiceIcon,
  ServiceIconKind,
  WhatsAppIcon,
  ApplicationsIcon,
  ChatbotIcon,
  DarkenedAboutIcon,
  InstagramProfileIcon,
  BigPlusIcon,
  GoogleGLogo,
  GoogleMapsPinIcon,
  DirectionsDiamondIcon,
  LayersIcon,
  CrosshairGpsIcon,
  SwapRouteIcon,
  WalkIcon,
  CarIcon,
  TransitBusIcon,
  SunIcon,
  MoonIcon,
} from './icons';
import { MomentCard, MomentPost } from './MomentCard';
import { IntroCinematic } from './IntroCinematic';
import { ThreadsComposer, ThreadsPostData } from './ThreadsComposer';
import {
  getGoogleOAuthUrl,
  isValidCollegeEmail,
  supabaseSignIn,
  supabaseSignUp,
  sendUniversityOtp,
  verifyUniversityOtp,
  findRegisteredUser,
  saveRegisteredUser,
  HEAD_ACCOUNT_EMAIL,
  isHeadAccount,
  getRegisteredUsers,
  deleteRegisteredUser,
  purgeAllExceptHeadAccount,
  logPlatformActivity,
  getPlatformActivities,
  clearPlatformActivities,
  PlatformActivity,
  StudentProfile,
} from './auth';
import { auVectorDB } from './vector_search';
import { validateTextContent, validateImageSafety } from './content_moderation';

type Tab = 'applications' | 'create' | 'feed' | 'chatbot' | 'location' | 'about';
type AuthMode = 'landing' | 'email-login' | 'signup' | 'otp';
type FeedFilter = 'all' | 'problems' | 'normal' | 'announcements';

interface CampusLandmark {
  id: string;
  name: string;
  category: string;
  code: string;
  query: string;
  description: string;
  timings: string;
  ext: string;
  built?: string;
  tags?: string[];
}

const campusLandmarks: CampusLandmark[] = [
  {
    id: 'aucoe-main',
    name: 'AU College of Engineering (Main & Admin Block)',
    category: 'Administration',
    code: 'AUCOE-01',
    query: 'Andhra University College of Engineering, Visakhapatnam',
    description: 'Principal Office, Dean of Academic Affairs, and Administrative Counters.',
    timings: '10:00 AM – 5:00 PM',
    ext: 'Ext: 201 / 202',
    built: 'Built in 1950',
    tags: ['History', 'Built in 1950', 'Visakhapatnam', 'Vaddadi', 'Administration'],
  },
  {
    id: 'cse-dept',
    name: 'Dept. of Computer Science & Systems Engg (CS&SE)',
    category: 'Department',
    code: 'CSE-BLK',
    query: 'Department of Computer Science & Systems Engineering, Andhra University, Visakhapatnam',
    description: 'AI & Data Science Labs, Software Engineering Centre, and HOD Office.',
    timings: '9:00 AM – 5:00 PM',
    ext: 'Ext: 310',
    built: 'Built in 1985',
    tags: ['Visakhapatnam', 'Departments'],
  },
  {
    id: 'ece-dept',
    name: 'Dept. of Electronics & Communication Engg (ECE)',
    category: 'Department',
    code: 'ECE-BLK',
    query: 'Department of Electronics and Communication Engineering, Andhra University, Visakhapatnam',
    description: 'VLSI Design Lab, DSP Centre, Microwave Lab, and Seminar Halls.',
    timings: '9:00 AM – 5:00 PM',
    ext: 'Ext: 320',
    built: 'Built in 1968',
    tags: ['Visakhapatnam', 'Departments'],
  },
  {
    id: 'mech-dept',
    name: 'Dept. of Mechanical Engineering',
    category: 'Department',
    code: 'MECH-BLK',
    query: 'Mechanical Engineering Department, Andhra University, Visakhapatnam',
    description: 'Thermal Engineering Lab, CAD/CAM Studio, and Machine Shops.',
    timings: '9:00 AM – 5:00 PM',
    ext: 'Ext: 330',
    built: 'Built in 1955',
    tags: ['History', 'Visakhapatnam', 'Departments'],
  },
  {
    id: 'civil-dept',
    name: 'Civil Engineering Department',
    category: 'Department',
    code: 'CIVIL-BLK',
    query: 'Civil Engineering Department, Andhra University, Visakhapatnam',
    description: 'Structural Analysis Lab, Surveying Lab, and Environmental Engineering Lab.',
    timings: '9:00 AM – 5:00 PM',
    ext: 'Ext: 340',
    built: 'Built in 1950',
    tags: ['History', 'Built in 1950', 'Visakhapatnam', 'Departments'],
  },
  {
    id: 'library',
    name: 'Dr. V.S. Krishna Central Memorial Library',
    category: 'Library',
    code: 'AU-LIB',
    query: 'Dr. V.S. Krishna Library Andhra University, Visakhapatnam',
    description: 'Multi-floor central library with over 500,000 volumes, e-journals, and study halls.',
    timings: '8:00 AM – 8:00 PM',
    ext: 'Ext: 115',
    built: 'Built in 1950',
    tags: ['History', 'Built in 1950', 'Visakhapatnam', 'Library', 'Vaddadi'],
  },
  {
    id: 'exam-cell',
    name: 'AU Examination Cell & Confidential Section',
    category: 'Administration',
    code: 'EXAM-CELL',
    query: 'Andhra University Examination Section, Visakhapatnam',
    description: 'Semester hall tickets, grade cards, transcripts, and re-evaluation counters.',
    timings: '10:30 AM – 4:30 PM',
    ext: 'Ext: 102',
    built: 'Built in 1950',
    tags: ['History', 'Visakhapatnam', 'Administration'],
  },
  {
    id: 'hostels',
    name: 'AU Engineering Hostels (Sivaji & North Campus)',
    category: 'Hostel',
    code: 'AU-HSTL',
    query: 'Andhra University Sivaji Hostel, Visakhapatnam',
    description: 'Residential hostels for engineering students with mess and recreation facilities.',
    timings: 'Curfew: 8:30 PM',
    ext: 'Ext: 401',
    built: 'Built in 1952',
    tags: ['History', 'Visakhapatnam', 'Hostels'],
  },
  {
    id: 'canteen',
    name: 'AU Golden Jubilee Canteen',
    category: 'Amenities',
    code: 'AU-CANT',
    query: 'Andhra University Canteen, Visakhapatnam',
    description: 'Student cafeteria, breakfast, meals, tea counters, and student seating.',
    timings: '7:30 AM – 7:30 PM',
    ext: 'Ext: 501',
    built: 'Built in 1976',
    tags: ['Visakhapatnam'],
  },
  {
    id: 'main-gate',
    name: 'AU Engineering Main Gate & Arch',
    category: 'Campus Gate',
    code: 'AU-GATE1',
    query: 'Andhra University Engineering Main Gate, Visakhapatnam',
    description: 'Main campus gate connecting to Siripuram Junction and Maddilapalem road.',
    timings: 'Open 24 Hours',
    ext: 'Security Post 1',
    built: 'Built in 1950',
    tags: ['History', 'Built in 1950', 'Visakhapatnam', 'Vaddadi'],
  },
  {
    id: 'eee-dept',
    name: 'Dept. of Electrical & Electronics Engg (EEE)',
    category: 'Department',
    code: 'EEE-BLK',
    query: 'Electrical Engineering Department, Andhra University, Visakhapatnam',
    description: 'Power Systems Lab, Control Systems Centre, and High Voltage Laboratory.',
    timings: '9:00 AM – 5:00 PM',
    ext: 'Ext: 350',
    built: 'Built in 1960',
    tags: ['Visakhapatnam', 'Departments'],
  },
  {
    id: 'sports-ground',
    name: 'AU Sports Grounds & University Gymnasium',
    category: 'Amenities',
    code: 'AU-SPORTS',
    query: 'Andhra University Sports Ground, Visakhapatnam',
    description: 'Track and field grounds, cricket/football grounds, indoor badminton, and gym.',
    timings: '6:00 AM – 7:00 PM',
    ext: 'Physical Ed: Ext 601',
    built: 'Built in 1950',
    tags: ['History', 'Visakhapatnam'],
  },
];

interface NearbyHub {
  id: string;
  name: string;
  shortName: string;
  query: string;
  lat: number;
  lng: number;
  distanceKm: number;
  alias: string[];
}

const AU_NEARBY_HUBS: NearbyHub[] = [
  {
    id: 'sivaji-hostel',
    name: 'AU Sivaji Hostel (North Campus)',
    shortName: 'Shiva Jay Hostel',
    query: 'AU Sivaji Hostel, Andhra University, Visakhapatnam',
    lat: 17.7312,
    lng: 83.3228,
    distanceKm: 0.2,
    alias: ['sivaji', 'shiva jay', 'hostel', 'north campus'],
  },
  {
    id: 'au-main-gate',
    name: 'AU Main Gate (Engineering Campus)',
    shortName: 'AU Main Gate',
    query: 'Andhra University College of Engineering Main Gate, Visakhapatnam',
    lat: 17.7285,
    lng: 83.3210,
    distanceKm: 0.4,
    alias: ['main gate', 'gate', 'outgate', 'entrance'],
  },
  {
    id: 'siripuram',
    name: 'Siripuram Junction (AU Circle)',
    shortName: 'Sripuram Junction',
    query: 'Siripuram Junction, Visakhapatnam',
    lat: 17.7248,
    lng: 83.3175,
    distanceKm: 0.8,
    alias: ['siripuram', 'sripuram', 'circle', 'junction'],
  },
  {
    id: 'chinna-waltair',
    name: 'Chinna Waltair (Waltair Gate / Thero)',
    shortName: 'Channawal Thero',
    query: 'Chinna Waltair, Visakhapatnam',
    lat: 17.7265,
    lng: 83.3305,
    distanceKm: 1.2,
    alias: ['chinna waltair', 'channawal thero', 'waltair', 'pedda waltair'],
  },
  {
    id: 'maddilapalem',
    name: 'Maddilapalem Bus Depot & Junction',
    shortName: 'Madhylapalam',
    query: 'Maddilapalem Bus Depot, Visakhapatnam',
    lat: 17.7385,
    lng: 83.3325,
    distanceKm: 1.8,
    alias: ['maddilapalem', 'madhylapalam', 'depot', 'bus station'],
  },
  {
    id: 'au-convention',
    name: 'AU Convention Center (Beach Road)',
    shortName: 'AU Convention Center',
    query: 'Andhra University Convention Centre, Beach Road, Visakhapatnam',
    lat: 17.7210,
    lng: 83.3340,
    distanceKm: 2.5,
    alias: ['convention center', 'beach road convention', 'au convention'],
  },
  {
    id: 'rk-beach',
    name: 'RK Beach (Ramakrishna Beach)',
    shortName: 'RK Beach',
    query: 'Ramakrishna Beach, Visakhapatnam',
    lat: 17.7125,
    lng: 83.3220,
    distanceKm: 3.0,
    alias: ['rk beach', 'beach', 'submarine', 'novotel'],
  },
  {
    id: 'rtc-complex',
    name: 'RTC Complex (Dwaraka Central Bus Station)',
    shortName: 'RTC Complex',
    query: 'RTC Complex Dwaraka Bus Station, Visakhapatnam',
    lat: 17.7240,
    lng: 83.3030,
    distanceKm: 4.2,
    alias: ['rtc complex', 'complex', 'dwaraka bus station', 'bus stand'],
  },
];

function calculateHaversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

function findNearestHub(userLat: number, userLng: number) {
  let nearest = AU_NEARBY_HUBS[0];
  let minKm = Infinity;
  for (const hub of AU_NEARBY_HUBS) {
    const km = calculateHaversineKm(userLat, userLng, hub.lat, hub.lng);
    if (km < minKm) {
      minKm = km;
      nearest = hub;
    }
  }
  return { hub: nearest, distanceKm: minKm };
}

function resolveLocationQuery(locName: string): string {
  if (!locName || locName === 'Your location') {
    return 'Andhra University Visakhapatnam';
  }
  const hub = AU_NEARBY_HUBS.find(
    (h) =>
      h.shortName.toLowerCase() === locName.toLowerCase() ||
      h.name.toLowerCase() === locName.toLowerCase() ||
      h.alias.some((a) => locName.toLowerCase().includes(a))
  );
  if (hub) return hub.query;

  if (!locName.includes(',') && !locName.toLowerCase().includes('visakhapatnam')) {
    return `${locName}, Visakhapatnam`;
  }
  return locName;
}

function resolveDestinationQuery(destName: string, selected?: CampusLandmark | null): string {
  if (destName) {
    const hub = AU_NEARBY_HUBS.find(
      (h) =>
        h.shortName.toLowerCase() === destName.toLowerCase() ||
        h.name.toLowerCase() === destName.toLowerCase()
    );
    if (hub) return hub.query;
    if (!destName.includes(',') && !destName.toLowerCase().includes('visakhapatnam')) {
      return `${destName}, Andhra University, Visakhapatnam`;
    }
    return destName;
  }
  if (selected) return selected.query;
  return 'AU College of Engineering, Andhra University, Visakhapatnam';
}

const initialPosts: MomentPost[] = [];

const services = [
  { title: 'Bonafide Certificate', icon: 'document' as const, detail: 'Request an official student-status certificate for scholarships, travel, or other verified needs.' },
  { title: 'Fee-Related Request', icon: 'payment' as const, detail: 'Submit a fee receipt, payment clarification, or fee-clearance request to the college office.' },
  { title: 'Hall Ticket Duplicate', icon: 'ticket' as const, detail: 'Request help with a missing or incorrect examination hall ticket.' },
  { title: 'Bus Pass Endorsement', icon: 'bus' as const, detail: 'Request the college endorsement needed for a student bus-pass application.' },
  { title: 'Hostel Out-Pass', icon: 'home' as const, detail: 'Submit a hostel out-pass request for review by the relevant authority.' },
  { title: 'Custom Request', icon: 'help' as const, detail: 'Describe a college-office request that is not covered by the listed services.' },
];

const aboutSections = [
  { title: 'Academic Departments', icon: 'document' as const, detail: 'Explore engineering programs, academic departments, laboratories, and college resources.', link: 'https://www.andhrauniversity.edu.in/colleges/college-of-engineering' },
  { title: 'University & College History', icon: 'home' as const, detail: 'Learn about Andhra University and the history of its College of Engineering.', link: 'https://www.andhrauniversity.edu.in/' },
  { title: 'Faculty & Research', icon: 'help' as const, detail: 'Find faculty, research activities, and department contacts in university directories.', link: 'https://www.andhrauniversity.edu.in/' },
  { title: 'Placements & Collaborations', icon: 'ticket' as const, detail: 'Look for placement-cell notices, campus recruitment updates, and collaboration news.', link: 'https://www.andhrauniversity.edu.in/' },
  { title: 'Administration & Contacts', icon: 'payment' as const, detail: 'Use official university contacts for current office information and administrative support.', link: 'https://www.andhrauniversity.edu.in/contact-us' },
];

const verifiedBotKnowledge: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['timing', 'hour', 'office', 'time', 'open', 'close'],
    answer: 'AU College of Engineering Office Hours: 10:00 AM – 5:00 PM (Monday to Saturday; closed on 2nd Saturdays & public holidays). Principal & Dean visiting hours: 11:00 AM – 4:00 PM.',
  },
  {
    keywords: ['fee', 'payment', 'challan', 'due', 'sbi', 'collect'],
    answer: 'Fee Procedure: Semester tuition, exam fees, and hostel dues must be paid online through the AU SBI Collect portal or at the Admin Block cash counter. Upload your fee receipt in the Applications tab for clearance.',
  },
  {
    keywords: ['bonafide', 'certificate', 'study'],
    answer: 'Bonafide Certificate: Submit an application via the Applications tab. Certificates are processed in 1–2 working days and can be collected from Academic Section counter 3 with your college ID.',
  },
  {
    keywords: ['hall ticket', 'exam', 'examination', 'admit card'],
    answer: 'Hall Tickets: Available on the university examination portal 5 days before exams. For errors or duplicate copies, submit a Hall Ticket Duplicate request in Applications or visit Exam Cell Room 102.',
  },
  {
    keywords: ['library', 'book', 'reading'],
    answer: 'Central Library: Open from 8:00 AM to 8:00 PM on all working days. Digital library and reading halls are on the 1st & 2nd floors. Present your AU ID card for book lending (max 3 books for 14 days).',
  },
  {
    keywords: ['hod', 'faculty', 'professor', 'department', 'contact'],
    answer: 'HOD Offices: Located on the 1st floor of respective department buildings (CSE, ECE, EEE, Mechanical, Civil, Chemical, Metallurgy). Visiting hours: 2:00 PM – 4:00 PM on working days.',
  },
  {
    keywords: ['hostel', 'mess', 'curfew', 'out-pass', 'outpass'],
    answer: 'Hostels: In-time curfew is 8:30 PM. Out-pass approvals must be submitted through the Applications tab with guardian phone number verification. Chief Warden office is near the North Campus Hostel Gate.',
  },
  {
    keywords: ['bus', 'pass', 'rtc', 'transport'],
    answer: 'Bus Pass: RTC student concession forms are verified and endorsed at the Student Affairs counter in the Admin Block. Submit your request under Applications with 2 passport photos and address proof.',
  },
];

export default function Home() {
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash || '';
      const search = window.location.search || '';
      // If returning from Google OAuth or if error present, DO NOT show intro animation
      if (
        hash.includes('access_token') ||
        hash.includes('error') ||
        search.includes('error') ||
        search.includes('error_description')
      ) {
        return false;
      }
      // If already logged in, do not replay intro animation
      if (localStorage.getItem('aupro_session')) {
        return false;
      }
    }
    return true;
  });
  const [showThreadsComposer, setShowThreadsComposer] = useState(false);
  const [threadsInitialKind, setThreadsInitialKind] = useState<'normal' | 'problem' | 'announcement'>('normal');

  const [tab, setTab] = useState<Tab>('feed');
  const [signedIn, setSignedIn] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [authRollNo, setAuthRollNo] = useState('');
  const [authDept, setAuthDept] = useState('Computer Science & Systems Engineering');
  const [authYear, setAuthYear] = useState('3rd Year');
  const [authPhone, setAuthPhone] = useState('');
  const [authBio, setAuthBio] = useState('Student at Andhra University College of Engineering. Passionate about technology, projects, and campus collaboration.');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authOtpToken, setAuthOtpToken] = useState('');
  const [authOtpDevCode, setAuthOtpDevCode] = useState('');
  const [authOtpProviderStatus, setAuthOtpProviderStatus] = useState<'delivered' | 'setup_required' | ''>('');
  const [authOtpProviderError, setAuthOtpProviderError] = useState('');
  const [authOtpCountdown, setAuthOtpCountdown] = useState(0);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dark Mode Theme State ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Single consistent student handle across New Thread and Profile
  const studentHandle = authName ? authName.toLowerCase().replace(/\s+/g, '_') : (authUsername || 'p_v_n_dhanunajay_reedy');

  // Theme management & persistence
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('aupro_theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        document.documentElement.classList.toggle('dark', savedTheme === 'dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = prefersDark ? 'dark' : 'light';
        setTheme(initial);
        document.documentElement.setAttribute('data-theme', initial);
        document.documentElement.classList.toggle('dark', initial === 'dark');
      }
    } catch {}
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    try {
      localStorage.setItem('aupro_theme', nextTheme);
      document.documentElement.setAttribute('data-theme', nextTheme);
      document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    } catch {}
    setToast(nextTheme === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled');
  };

  // Topbar Profile Quick Menu
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Instagram Profile Edit Mode State
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Scroll-driven auto-hiding / appearing bottom navigation bar
  const [isNavVisible, setIsNavVisible] = useState(true);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY || window.pageYOffset;
          const diff = currentY - lastScrollYRef.current;

          // Scroll down by > 6px past top 60px -> hide navbar
          if (diff > 6 && currentY > 60) {
            setIsNavVisible(false);
          } else if (diff < -6 || currentY <= 30) {
            // Scroll up or near top -> show navbar
            setIsNavVisible(true);
          }
          lastScrollYRef.current = currentY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // In-App Turn-by-Turn Navigation System State
  const [isNavigating, setIsNavigating] = useState(false);
  const [navStepIndex, setNavStepIndex] = useState(0);
  const [showNavStepsSheet, setShowNavStepsSheet] = useState(false);

  // Application Dedicated Page State
  const [activeApplication, setActiveApplication] = useState<{ title: string; icon: ServiceIconKind; detail: string } | null>(null);
  const [clickedApplyId, setClickedApplyId] = useState<string | null>(null);
  const [applicationPurpose, setApplicationPurpose] = useState('');

  // Google Maps State (Authentic Google Maps UI)
  const [mapLocationQuery, setMapLocationQuery] = useState('Andhra University College of Engineering, Visakhapatnam');
  const [selectedLandmark, setSelectedLandmark] = useState<CampusLandmark | null>(campusLandmarks[0]);
  const [mapLayer, setMapLayer] = useState<'m' | 'k'>('m');
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [mapSearchInput, setMapSearchInput] = useState('');
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [mapFilterChip, setMapFilterChip] = useState<'all' | 'history' | 'built-1950' | 'visakhapatnam' | 'vaddadi' | 'library' | 'departments' | 'hostels'>('all');
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const [showDirections, setShowDirections] = useState(false);
  const [directionsStart, setDirectionsStart] = useState('Your location');
  const [directionsEnd, setDirectionsEnd] = useState('AU College of Engineering (Main & Admin Block)');
  const [transportMode, setTransportMode] = useState<'w' | 'm' | 'd' | 'r'>('w');
  const [isLocationFar, setIsLocationFar] = useState(false);
  const [nearestHub, setNearestHub] = useState<NearbyHub | null>(null);
  const [userDistanceToAu, setUserDistanceToAu] = useState<number | null>(null);

  const getNavSteps = () => {
    const startLower = (directionsStart || '').toLowerCase();
    const endName = directionsEnd || selectedLandmark?.name || 'AU College of Engineering';

    if (startLower.includes('rtc complex') || startLower.includes('complex')) {
      return [
        {
          instruction: 'Head east on Station Road towards Asilmetta Flyover',
          distance: '1.1 km',
          turnIcon: '⬆',
          subText: 'Follow Waltair Main Road',
        },
        {
          instruction: 'Continue straight past Siripuram Junction towards AU Circle',
          distance: '1.9 km',
          turnIcon: '⬆',
          subText: 'Pass AU Ingate and Library circle',
        },
        {
          instruction: 'Turn left at Andhra University Outgate into North Campus',
          distance: '800 m',
          turnIcon: '↰',
          subText: 'Enter campus avenue past Sivaji Hostel',
        },
        {
          instruction: `Arrive at ${endName}`,
          distance: '150 m',
          turnIcon: '🏁',
          subText: 'Destination reached on campus',
        },
      ];
    }

    if (startLower.includes('maddilapalem') || startLower.includes('madhylapalam')) {
      return [
        {
          instruction: 'Head south on AU Avenue from Maddilapalem Bus Depot',
          distance: '700 m',
          turnIcon: '⬆',
          subText: 'Pass AU Platinum Jubilee Guest House',
        },
        {
          instruction: 'Proceed straight past Sivaji Hostel into College of Engineering',
          distance: '600 m',
          turnIcon: '⬆',
          subText: 'Follow paved student walkway',
        },
        {
          instruction: `Turn right towards ${endName}`,
          distance: '300 m',
          turnIcon: '↱',
          subText: 'Department block entrance',
        },
        {
          instruction: `Arrive at ${endName}`,
          distance: '100 m',
          turnIcon: '🏁',
          subText: 'Destination reached',
        },
      ];
    }

    if (startLower.includes('siripuram') || startLower.includes('sripuram')) {
      return [
        {
          instruction: 'Head northeast from Siripuram Circle towards AU Main Gate',
          distance: '450 m',
          turnIcon: '⬆',
          subText: 'Follow Siripuram AU link road',
        },
        {
          instruction: 'Enter AU Engineering Campus through North Gate',
          distance: '350 m',
          turnIcon: '↱',
          subText: 'Proceed towards Academic Quadrangle',
        },
        {
          instruction: `Turn left towards ${endName}`,
          distance: '180 m',
          turnIcon: '↰',
          subText: 'Follow walkway towards department',
        },
        {
          instruction: `Arrive at ${endName}`,
          distance: '50 m',
          turnIcon: '🏁',
          subText: 'Destination reached',
        },
      ];
    }

    if (startLower.includes('chinna waltair') || startLower.includes('channawal')) {
      return [
        {
          instruction: 'Head west on Chinna Waltair Road towards AU East Gate',
          distance: '850 m',
          turnIcon: '⬆',
          subText: 'Walk past AU staff quarters',
        },
        {
          instruction: 'Turn right onto Campus Perimeter Avenue',
          distance: '450 m',
          turnIcon: '↱',
          subText: 'Follow avenue towards Engineering blocks',
        },
        {
          instruction: `Turn left towards ${endName}`,
          distance: '200 m',
          turnIcon: '↰',
          subText: 'Department courtyard',
        },
        {
          instruction: `Arrive at ${endName}`,
          distance: '50 m',
          turnIcon: '🏁',
          subText: 'Destination reached',
        },
      ];
    }

    if (startLower.includes('rk beach') || startLower.includes('beach')) {
      return [
        {
          instruction: 'Head north on Beach Road towards Novotel Junction',
          distance: '1.2 km',
          turnIcon: '⬆',
          subText: 'Coastal roadway',
        },
        {
          instruction: 'Turn left onto Waltair Uplands Road towards Siripuram',
          distance: '1.5 km',
          turnIcon: '↰',
          subText: 'Proceed uphill towards AU Circle',
        },
        {
          instruction: 'Turn right at AU Outgate into Engineering Campus',
          distance: '600 m',
          turnIcon: '↱',
          subText: 'Enter campus avenue',
        },
        {
          instruction: `Arrive at ${endName}`,
          distance: '120 m',
          turnIcon: '🏁',
          subText: 'Destination reached',
        },
      ];
    }

    if (startLower.includes('convention') || startLower.includes('au convention')) {
      return [
        {
          instruction: 'Head north along Beach Road towards AU East Gate',
          distance: '900 m',
          turnIcon: '⬆',
          subText: 'Pass AU convention grounds',
        },
        {
          instruction: 'Turn left into University Campus Avenue',
          distance: '700 m',
          turnIcon: '↰',
          subText: 'Proceed towards North Campus',
        },
        {
          instruction: `Arrive at ${endName}`,
          distance: '250 m',
          turnIcon: '🏁',
          subText: 'Destination reached',
        },
      ];
    }

    if (startLower.includes('sivaji') || startLower.includes('shiva jay')) {
      return [
        {
          instruction: 'Head south on Sivaji Hostel Avenue towards Engineering Library',
          distance: '120 m',
          turnIcon: '⬆',
          subText: 'Walk along North Campus avenue',
        },
        {
          instruction: `Turn right at Central Library Junction towards ${endName}`,
          distance: '100 m',
          turnIcon: '↱',
          subText: 'Follow paved student walkway',
        },
        {
          instruction: `Arrive at ${endName}`,
          distance: '60 m',
          turnIcon: '🏁',
          subText: 'Destination reached',
        },
      ];
    }

    // Default campus navigation steps
    return [
      {
        instruction: `Head northeast on AU North Campus Avenue towards ${endName}`,
        distance: '80 m',
        turnIcon: '⬆',
        subText: 'Walk past Sivaji Hostel & Department avenue',
      },
      {
        instruction: 'In 120m, turn right at Engineering Library junction',
        distance: '120 m',
        turnIcon: '↱',
        subText: 'Follow paved student walkway',
      },
      {
        instruction: `Turn left towards ${endName}`,
        distance: '110 m',
        turnIcon: '↰',
        subText: 'Walk past the lawn and seminar hall',
      },
      {
        instruction: `Arrived at ${endName}`,
        distance: '40 m',
        turnIcon: '📍',
        subText: 'Your destination is on the right',
      },
    ];
  };

  const getRouteMetrics = () => {
    const startLower = (directionsStart || '').toLowerCase();
    let baseDistKm = 0.5;

    if (startLower.includes('rtc complex') || startLower.includes('complex')) baseDistKm = 4.2;
    else if (startLower.includes('rk beach') || startLower.includes('beach')) baseDistKm = 3.0;
    else if (startLower.includes('convention')) baseDistKm = 2.5;
    else if (startLower.includes('maddilapalem') || startLower.includes('madhylapalam')) baseDistKm = 1.8;
    else if (startLower.includes('chinna waltair') || startLower.includes('channawal')) baseDistKm = 1.2;
    else if (startLower.includes('siripuram') || startLower.includes('sripuram')) baseDistKm = 0.8;
    else if (startLower.includes('sivaji') || startLower.includes('shiva jay')) baseDistKm = 0.3;
    else if (userDistanceToAu && userDistanceToAu > 0.5) baseDistKm = userDistanceToAu;

    let timeMin = 4;
    let distStr = '350 m';
    let modeLabel = 'Walking';

    if (transportMode === 'w') {
      modeLabel = 'Walking';
      timeMin = Math.max(1, Math.round((baseDistKm / 4.5) * 60));
    } else if (transportMode === 'm') {
      modeLabel = 'Bike';
      timeMin = Math.max(1, Math.round((baseDistKm / 28) * 60));
    } else if (transportMode === 'd') {
      modeLabel = 'Drive';
      timeMin = Math.max(1, Math.round((baseDistKm / 24) * 60));
    } else if (transportMode === 'r') {
      modeLabel = 'Bus';
      timeMin = Math.max(2, Math.round((baseDistKm / 16) * 60) + 4);
    }

    if (baseDistKm >= 1) {
      distStr = `${baseDistKm.toFixed(1)} km`;
    } else {
      distStr = `${Math.round(baseDistKm * 1000)} m`;
    }

    return { timeStr: `${timeMin} min`, metaStr: `${distStr} • ${modeLabel} • GPS Active` };
  };

  const campusNavSteps = getNavSteps();

  // GPS & Live Geolocation Auto-Tracking State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // About tab sub-navigation & settings (My Posts, Saved Bookmarks, Profile, AU College Info, Head Admin Console)
  const [aboutSubTab, setAboutSubTab] = useState<'posts' | 'saved' | 'profile' | 'college' | 'admin'>('posts');
  const [savedPostIds, setSavedPostIds] = useState<string[]>([]);
  const [settingsNotifications, setSettingsNotifications] = useState(true);
  const [settingsProblemAlerts, setSettingsProblemAlerts] = useState(true);
  const [settingsCompactView, setSettingsCompactView] = useState(false);

  // Head Account Master Administrator State (Only for 325506402371@andhrauniversity.edu.in)
  const [registeredUsersList, setRegisteredUsersList] = useState<Record<string, StudentProfile>>({});
  const [platformActivities, setPlatformActivities] = useState<PlatformActivity[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRoll, setNewUserRoll] = useState('');
  const [newUserDept, setNewUserDept] = useState('Computer Science & Systems Engineering');
  const [newUserYear, setNewUserYear] = useState('1st Year');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [addUserError, setAddUserError] = useState('');

  const refreshAdminData = () => {
    if (typeof window !== 'undefined') {
      setRegisteredUsersList(getRegisteredUsers());
      setPlatformActivities(getPlatformActivities());
    }
  };

  // Load saved post IDs and user posts from persistent client storage
  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem('aupro_saved_posts');
      if (storedSaved) {
        setSavedPostIds(JSON.parse(storedSaved));
      }
      const storedPosts = localStorage.getItem('aupro_feed_posts');
      if (storedPosts) {
        const parsed = JSON.parse(storedPosts);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFeedPosts(parsed);
        }
      }
    } catch {}
  }, []);

  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('all');
  const [feedPosts, setFeedPosts] = useState<MomentPost[]>(initialPosts);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createKind, setCreateKind] = useState<'announcement' | 'problem'>('announcement');
  const [createTitle, setCreateTitle] = useState('');
  const [createDepartment, setCreateDepartment] = useState('');
  const [createCategory, setCreateCategory] = useState('Classrooms & Labs');
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState<string | null>(null);
  const [createCaption, setCreateCaption] = useState('');
  const [createLocation, setCreateLocation] = useState('');
  const [createAnonymous, setCreateAnonymous] = useState(false);
  const [createDays, setCreateDays] = useState('30');
  const [createError, setCreateError] = useState('');
  const [toast, setToast] = useState('');
  const [selectedService, setSelectedService] = useState<{ title: string; icon: string; detail: string } | null>(null);
  const [applicationName, setApplicationName] = useState('');
  const [applicationRollNumber, setApplicationRollNumber] = useState('');
  const [applicationDetails, setApplicationDetails] = useState('');
  const [applicationError, setApplicationError] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; text: string; time?: string }[]>([
    {
      role: 'assistant',
      text: 'Hello! I am the AuPro Assistant for Andhra University College of Engineering. Tap any quick question below or ask me directly about office hours, certificates, fees, exams, or departments.',
      time: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatStatus, setChatStatus] = useState('');
  const [topNotice, setTopNotice] = useState('');

  useEffect(() => {
    try {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReduced) {
        setShowIntro(false);
      }
    } catch {
      // keep showIntro true on reload
    }
  }, []);

  // Purge all legacy test accounts per user instruction; start clean with designated main ID
  useEffect(() => {
    try {
      const PURGE_KEY = 'aupro_accounts_purged_20261107_v1';
      if (!localStorage.getItem(PURGE_KEY)) {
        localStorage.removeItem('aupro_registered_users');
        localStorage.removeItem('aupro_session');
        localStorage.setItem(PURGE_KEY, 'true');
        setSignedIn(false);
      }
    } catch {}
  }, []);

  // Restore existing user session from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('aupro_session');
      if (saved) {
        const user = JSON.parse(saved);
        if (user && user.email) {
          setAuthEmail(user.email);
          setAuthName(user.name || 'AU Student');
          setAuthUsername(user.username || 'au.student');
          if (user.rollNo) setAuthRollNo(user.rollNo);
          if (user.dept) setAuthDept(user.dept);
          if (user.year) setAuthYear(user.year);
          if (user.phone) setAuthPhone(user.phone);
          if (user.bio) setAuthBio(user.bio);
          setSignedIn(true);
          setShowIntro(false);
        }
      }
    } catch (e) {
      console.error('Failed to restore session', e);
    }
  }, []);

  // Synchronize registered accounts and live activity stream for Head Account
  useEffect(() => {
    refreshAdminData();
  }, [signedIn, aboutSubTab]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (authOtpCountdown <= 0) return;
    const timer = setInterval(() => {
      setAuthOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [authOtpCountdown]);

  // Handle return from Google OAuth (Supabase sends back #access_token=... in URL)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for query errors
    const searchParams = new URLSearchParams(window.location.search);
    const oauthError = searchParams.get('error_description') || searchParams.get('error');
    if (oauthError) {
      setAuthError(`Authentication error: ${decodeURIComponent(oauthError)}`);
      setShowIntro(false);
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }

    // Check for access token in hash
    const hash = window.location.hash;
    if (hash && hash.includes('access_token')) {
      try {
        const params = new URLSearchParams(hash.replace(/^#/, ''));
        const accessToken = params.get('access_token');
        if (accessToken) {
          const base64Url = accessToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          const payload = JSON.parse(jsonPayload);
          const email = (payload.email || '').toLowerCase().trim();

          // Enforce university email boundary
          if (!email.endsWith('@andhrauniversity.edu.in')) {
            setAuthError(`Access restricted: ${email} is not a verified @andhrauniversity.edu.in account.`);
            setSignedIn(false);
            setShowIntro(false);
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }

          const fullName = payload.user_metadata?.full_name || payload.user_metadata?.name || 'AU Student';
          const username = (payload.user_metadata?.user_name || email.split('@')[0] || 'au.student').replace(/\s+/g, '_');

          setAuthEmail(email);
          setAuthName(fullName);
          setAuthUsername(username);
          setSignedIn(true);
          setShowIntro(false);
          setToast(`Welcome back, ${fullName}!`);

          // Persist session to localStorage
          try {
            localStorage.setItem(
              'aupro_session',
              JSON.stringify({
                email,
                name: fullName,
                username,
                dept: authDept,
                year: authYear,
              })
            );
          } catch {}

          // Clean URL
          window.history.replaceState(null, '', window.location.pathname);
        }
      } catch (err) {
        console.error('Failed to parse OAuth return:', err);
      }
    }
  }, [authDept, authYear]);

  const handleSignOut = () => {
    try {
      localStorage.removeItem('aupro_session');
    } catch {}
    setSignedIn(false);
    setAuthMode('landing');
    setAuthPassword('');
    setAuthOtp('');
    setAuthOtpToken('');
    setAuthOtpDevCode('');
    setAuthOtpProviderStatus('');
    setAuthOtpCountdown(0);
    setShowProfileMenu(false);
    setToast('Signed out of AuPro.');
  };

  const handleGoogleSignIn = () => {
    try {
      const url = getGoogleOAuthUrl();
      window.location.href = url;
    } catch {
      setAuthError('Unable to connect to Google OAuth.');
    }
  };

  // Real-time GPS Auto-Tracking on Mobile when Location tab is open
  useEffect(() => {
    if (tab !== 'location') return;
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setGpsError('Geolocation is not supported by your device or browser.');
      return;
    }

    let watchId: number | undefined;
    setIsLocating(true);

    const onGeoSuccess = (pos: GeolocationPosition) => {
      const { latitude, longitude, accuracy } = pos.coords;
      setUserCoords({ lat: latitude, lng: longitude, accuracy });
      setIsGpsTracking(true);
      setGpsError('');
      setIsLocating(false);
    };

    const onGeoError = (err: GeolocationPositionError) => {
      console.warn('GPS location tracking notice:', err.message);
      setGpsError(err.message);
      setIsLocating(false);
    };

    const geoOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
    };

    navigator.geolocation.getCurrentPosition(onGeoSuccess, onGeoError, geoOptions);

    try {
      watchId = navigator.geolocation.watchPosition(onGeoSuccess, onGeoError, geoOptions);
    } catch (e) {
      console.warn('watchPosition failed:', e);
    }

    return () => {
      if (watchId !== undefined && typeof navigator !== 'undefined' && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [tab]);

  const handleLocateMe = () => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setToast('Geolocation is not supported on this device.');
      return;
    }
    setIsLocating(true);
    setToast('🛰️ Acquiring live GPS position...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude, accuracy });
        setIsGpsTracking(true);
        setGpsError('');
        setIsLocating(false);

        // Proximity calculation from Andhra University Center (17.7295, 83.3218)
        const distKm = calculateHaversineKm(latitude, longitude, 17.7295, 83.3218);
        setUserDistanceToAu(distKm);

        if (distKm > 5) {
          const found = findNearestHub(latitude, longitude);
          setNearestHub(found.hub);
          setIsLocationFar(true);
          setDirectionsStart('Your location');
          setMapLocationQuery(`${latitude},${longitude}`);
          setToast(`📍 You are ${distKm}km from AU. Select a campus hub or route directly.`);
          if (transportMode === 'w') {
            setTransportMode('d');
          }
        } else {
          setIsLocationFar(false);
          setMapLocationQuery(`${latitude},${longitude}`);
          setDirectionsStart('Your location');
          setToast(`📍 GPS Locked: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (±${Math.round(accuracy)}m)`);
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsError(err.message);
        setToast('Location access was denied. You can still search places above.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 3000 }
    );
  };

  const handleAskBot = (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    // University Knowledge Base Query
    const vectorMatches = auVectorDB.query(q, 3);
    const topMatch = vectorMatches[0];

    let response = 'I have noted your query for Andhra University College of Engineering administration. If you require immediate in-person help, visit Room 102 in the Main Administration Block or tap "Forward to WhatsApp" below.';

    if (topMatch && topMatch.confidencePercent >= 25) {
      response = topMatch.entry.answer;
    }

    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: q, time: 'Just now' },
      { role: 'assistant', text: response, time: 'Just now' },
    ]);
    setChatInput('');
    setChatStatus('');
  };

  // Head Account Administrative Handlers
  const handleAddStudentAccount = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    const cleanEmail = newUserEmail.toLowerCase().trim();
    if (!cleanEmail.endsWith('@andhrauniversity.edu.in')) {
      setAddUserError('Registration is restricted to official @andhrauniversity.edu.in addresses.');
      return;
    }
    if (!newUserName.trim()) {
      setAddUserError('Student full name is required.');
      return;
    }
    if (newUserPassword.length < 6) {
      setAddUserError('Initial password must be at least 6 characters.');
      return;
    }
    const currentUsers = getRegisteredUsers();
    if (currentUsers[cleanEmail]) {
      setAddUserError('An account already exists for this university email.');
      return;
    }

    const studentProfile: StudentProfile = {
      email: cleanEmail,
      name: newUserName.trim(),
      username: newUserName.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      rollNo: newUserRoll.trim() || '32550640' + Math.floor(1000 + Math.random() * 9000),
      department: newUserDept,
      year: newUserYear,
      phone: '',
      bio: `AU Student @ ${newUserDept}. Verified by Head Administrator.`,
      password: newUserPassword,
      isVerified: true,
      verifiedAt: new Date().toISOString(),
    };

    saveRegisteredUser(studentProfile);
    logPlatformActivity('Account Created (Admin)', authEmail, `Created account for ${newUserName} (${cleanEmail})`);
    refreshAdminData();
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserRoll('');
    setNewUserPassword('');
    setToast(`Account created for ${newUserName.trim()} successfully.`);
  };

  const handleDeleteUserAccount = (targetEmail: string, targetName: string) => {
    if (isHeadAccount(targetEmail)) {
      setToast('The Head Administrator account is protected and cannot be removed.');
      return;
    }
    const confirmed = typeof window !== 'undefined' ? window.confirm(`Are you sure you want to remove the account for ${targetName} (${targetEmail})?`) : false;
    if (!confirmed) return;

    const success = deleteRegisteredUser(targetEmail);
    if (success) {
      logPlatformActivity('Account Removed (Admin)', authEmail, `Removed account for ${targetName} (${targetEmail})`);
      refreshAdminData();
      setToast(`Account for ${targetName} has been removed.`);
    } else {
      setToast('Failed to remove account.');
    }
  };

  const handlePurgeAllAccounts = () => {
    const confirmed = typeof window !== 'undefined' ? window.confirm(
      '⚠️ DANGER: Are you sure you want to remove ALL registered accounts except your Head Administrator account? All other student accounts will be deleted immediately.'
    ) : false;
    if (!confirmed) return;

    purgeAllExceptHeadAccount();
    logPlatformActivity('Purged All Accounts (Admin)', authEmail, 'Reset platform registry to Head Account only');
    refreshAdminData();
    setToast('All other student accounts have been purged. Only the Head Account remains.');
  };

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filteredFeedPosts = feedPosts.filter((post) => {
    if (feedFilter === 'problems') return post.category === 'problem';
    if (feedFilter === 'announcements') return post.category === 'announcement';
    if (feedFilter === 'normal') return post.category === 'normal' || !post.category;
    return true;
  });

  const myPosts = feedPosts.filter((post) => {
    const cleanAuth = authEmail.toLowerCase().trim();
    const cleanPostAuth = (post.authorEmail || '').toLowerCase().trim();
    const cleanUser = authUsername.toLowerCase().trim();
    const cleanPostUser = post.username.toLowerCase().trim();
    const cleanName = authName.toLowerCase().replace(/\s+/g, '_');
    return (
      (cleanAuth && cleanPostAuth === cleanAuth) ||
      (cleanUser && cleanPostUser === cleanUser) ||
      (cleanName && cleanPostUser === cleanName) ||
      cleanPostUser === 'you'
    );
  });

  const savedPosts = feedPosts.filter((post) => savedPostIds.includes(post.id));

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLandmarks = campusLandmarks.filter((loc) => {
    // 1. Filter by chip
    if (mapFilterChip !== 'all') {
      const lowerChip = mapFilterChip.toLowerCase();
      if (lowerChip === 'built-1950') {
        const yr = parseInt(loc.built?.replace(/\D/g, '') || '9999', 10);
        if (yr > 1950) return false;
      } else {
        const matchesTag = loc.tags?.some((t) => t.toLowerCase().includes(lowerChip));
        const matchesCat = loc.category.toLowerCase().includes(lowerChip);
        const matchesName = loc.name.toLowerCase().includes(lowerChip);
        const matchesDesc = loc.description?.toLowerCase().includes(lowerChip);
        if (!matchesTag && !matchesCat && !matchesName && !matchesDesc) return false;
      }
    }

    // 2. Filter by search input
    if (!mapSearchInput.trim()) return true;
    const s = mapSearchInput.toLowerCase();
    return (
      loc.name.toLowerCase().includes(s) ||
      loc.category.toLowerCase().includes(s) ||
      loc.code.toLowerCase().includes(s) ||
      (loc.tags && loc.tags.some((t) => t.toLowerCase().includes(s))) ||
      (loc.description && loc.description.toLowerCase().includes(s))
    );
  });

  const handleCreateFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setCreateFile(file);
    setCreateError('');
    if (!file) {
      setCreatePreview(null);
      return;
    }

    // Automated Media Content Moderation & Safety Guard
    const safetyCheck = await validateImageSafety(file);
    if (!safetyCheck.isValid) {
      setCreateError(safetyCheck.reason || 'Photo rejected: Inappropriate or invalid image.');
      setCreateFile(null);
      setCreatePreview(null);
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setCreatePreview(reader.result as string);
      reader.readAsDataURL(file);
      return;
    }
    setCreatePreview(null);
  };

  const handleDeletePost = (postId: string) => {
    setFeedPosts((posts) => {
      const updated = posts.filter((p) => p.id !== postId);
      try {
        localStorage.setItem('aupro_feed_posts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setSavedPostIds((saved) => {
      const updated = saved.filter((id) => id !== postId);
      try {
        localStorage.setItem('aupro_saved_posts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setToast('Post deleted successfully');
  };

  const handleSaveToggle = (postId: string) => {
    setSavedPostIds((prev) => {
      const isAlreadySaved = prev.includes(postId);
      const next = isAlreadySaved
        ? prev.filter((id) => id !== postId)
        : [...prev, postId];
      try {
        localStorage.setItem('aupro_saved_posts', JSON.stringify(next));
      } catch {}
      setToast(isAlreadySaved ? 'Removed from saved posts' : 'Post saved to bookmarks');
      return next;
    });
  };

  const handleThreadsPost = (data: ThreadsPostData) => {
    // Content Moderation check (Profanity, safety, and University/Studies Relevance)
    const textCheck = validateTextContent(`${data.caption} ${data.title || ''} ${data.location || ''}`, data.category);
    if (!textCheck.isValid) {
      logPlatformActivity('Post Rejected (Off-Topic/Policy)', authEmail || 'Student', textCheck.reason || 'Off-topic post attempt blocked');
      setToast(textCheck.reason || 'Post blocked: Content must be related to university problems, campus life, or studies.');
      return;
    }

    const newPost: MomentPost = {
      id: `${Date.now()}`,
      username: data.isAnonymous ? 'anonymous.au' : (authUsername || (authName ? authName.toLowerCase().replace(/\s+/g, '_') : 'au.student')),
      authorEmail: authEmail,
      authorHandle: authUsername || 'au.student',
      avatarText: data.isAnonymous ? '?' : (authName[0] || 'A').toUpperCase(),
      isOfficial: data.category === 'announcement',
      category: data.category,
      location: data.location,
      imageUrl: data.imageUrl,
      imageCaption: data.title || (data.category === 'problem' ? 'Problem Report' : 'Official Notice'),
      likesCount: 0,
      repostsCount: 0,
      caption: data.caption,
      commentsCount: 0,
      comments: [],
      timeAgo: 'now',
      durationDays: 30,
    };

    setFeedPosts((posts) => {
      const updated = [newPost, ...posts];
      try {
        localStorage.setItem('aupro_feed_posts', JSON.stringify(updated));
      } catch {}
      return updated;
    });
    logPlatformActivity(
      data.category === 'problem' ? 'Reported Campus Problem' : data.category === 'announcement' ? 'Published Announcement' : 'Published Feed Post',
      authEmail || authUsername || 'Student',
      data.caption.slice(0, 90)
    );
    setFeedFilter('all');
    setShowThreadsComposer(false);
    setToast(data.category === 'problem' ? 'Problem reported to campus administration.' : 'Post published to AuPro feed.');
    setTab('feed');
  };

  const handleCreatePost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError('');

    // 1. Announcements blocked per university administration
    if (createKind === 'announcement') {
      setCreateError('Official Announcement posting is temporarily locked by university administration.');
      return;
    }

    if (!createCaption.trim()) {
      setCreateError('Please provide details for the post.');
      return;
    }

    // 2. Automated Bad Words & University/Study Relevance Filter
    const textCheck = validateTextContent(`${createTitle} ${createCaption} ${createLocation}`, createKind);
    if (!textCheck.isValid) {
      logPlatformActivity('Post Rejected (Off-Topic/Policy)', authEmail || 'Student', textCheck.reason || 'Off-topic post attempt blocked');
      setCreateError(textCheck.reason || 'Post blocked: Content must be related to university problems, campus life, or studies.');
      return;
    }

    const newPost: MomentPost = {
      id: `post-${Date.now()}`,
      username: createKind === 'problem'
        ? (createAnonymous ? 'anonymous.student' : (authName ? authName.toLowerCase().replace(/\s+/g, '_') : 'au.student'))
        : (createDepartment ? createDepartment.toLowerCase().replace(/\s+/g, '.') : 'au.college.office'),
      avatarText: createKind === 'problem' ? (createAnonymous ? '?' : 'S') : 'AU',
      isOfficial: false,
      category: createKind,
      location: createLocation.trim() || 'College of Engineering, Visakhapatnam',
      imageUrl: createPreview || undefined,
      imageCaption: createTitle || 'Campus Problem Report',
      likesCount: 1,
      repostsCount: 0,
      likedBy: undefined,
      caption: createTitle ? `${createTitle}: ${createCaption.trim()}` : createCaption.trim(),
      commentsCount: 0,
      comments: [],
      timeAgo: 'JUST NOW',
      durationDays: Number(createDays) || 30,
    };

    setFeedPosts((posts) => [newPost, ...posts]);
    setFeedFilter('problems');
    setCreateTitle('');
    setCreateDepartment('');
    setCreateCaption('');
    setCreateLocation('');
    setCreateFile(null);
    setCreatePreview(null);
    setCreateDays('30');
    setToast('Problem reported to campus administration.');
    setTab('feed');
  };

  if (showIntro) {
    return <IntroCinematic onComplete={() => setShowIntro(false)} />;
  }

  if (!signedIn) {
    return (
      <main className="shell">
        <section className="content" style={{ paddingTop: '12vh' }}>
          <div className="card auth-card">
            <div className="eyebrow" style={{ color: 'var(--secondary)', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: 12, fontWeight: 600, lineHeight: 1.4, marginBottom: 4 }}>ANDHRA UNIVERSITY</div>
            <h1 style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.25, marginBottom: 8, color: 'var(--ink)' }}>Welcome to AuPro</h1>
            <p className="lead" style={{ fontSize: 15, fontWeight: 400, lineHeight: 1.5, marginBottom: 20 }}>
              Campus updates, verified applications, student problems, and the engineering campus map.
            </p>

            {authError && (
              <div className="error" style={{ marginBottom: 16 }}>
                {authError}
              </div>
            )}

            {authMode === 'landing' && (
              <div className="stack">
                <button className="google-button" onClick={handleGoogleSignIn}>
                  <GoogleGLogo size={18} /> Continue with Google
                </button>

                <div className="auth-divider"><span>or with university credentials</span></div>
                <div className="auth-actions">
                  <button
                    className="secondary-button"
                    style={{ width: '100%', padding: '13px 16px', fontSize: 15 }}
                    onClick={() => { setAuthError(''); setAuthMode('email-login'); }}
                  >
                    Log in with email
                  </button>
                  <button
                    className="text-button"
                    style={{ width: '100%', textAlign: 'center', marginTop: 8 }}
                    onClick={() => { setAuthError(''); setAuthMode('signup'); }}
                  >
                    Create student account
                  </button>
                </div>
              </div>
            )}

            {authMode === 'email-login' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setAuthError('');
                const clean = authEmail.toLowerCase().trim();
                const existing = findRegisteredUser(clean);

                if (existing) {
                  if (existing.password && existing.password !== authPassword) {
                    setAuthError('Incorrect password. Please verify and try again.');
                    return;
                  }
                  // Password matches! Log them in
                  try {
                    localStorage.setItem('aupro_session', JSON.stringify(existing));
                  } catch {}
                  setAuthName(existing.name || 'AU Student');
                  setAuthUsername(existing.username || 'au.student');
                  setAuthRollNo(existing.rollNo || '');
                  setAuthDept(existing.department || authDept);
                  setAuthYear(existing.year || authYear);
                  setAuthPhone(existing.phone || '');
                  if (existing.bio) setAuthBio(existing.bio);
                  setSignedIn(true);
                  setShowIntro(false);
                  logPlatformActivity('User Signed In', clean, `Logged in as ${existing.name || 'Student'}`);
                  setToast(`Welcome back, ${existing.name}!`);
                  return;
                }

                // If not found in local registry, check Supabase
                try {
                  const res = await supabaseSignIn(clean, authPassword);
                  if (res && res.session) {
                    const sessionData = {
                      email: clean,
                      name: authName || 'AU Student',
                      username: authUsername || 'au.student',
                      rollNo: authRollNo || '',
                      dept: authDept,
                      year: authYear,
                      phone: authPhone,
                      bio: authBio,
                      isVerified: true,
                    };
                    localStorage.setItem('aupro_session', JSON.stringify(sessionData));
                    setSignedIn(true);
                    setShowIntro(false);
                    logPlatformActivity('User Signed In', clean, `Authenticated via college portal`);
                    setToast('Signed in successfully.');
                    return;
                  }
                } catch (err: any) {
                  console.warn('Supabase signin attempt:', err);
                }

                setAuthError('No verified student account found for this university email. Please click "Create student account" below to complete one-time OTP verification.');
              }} className="stack">
                <div>
                  <label className="field-label" style={{ fontSize: 12 }}>College Email</label>
                  <input className="search" type="email" placeholder="name@andhrauniversity.edu.in" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
                </div>
                <div>
                  <label className="field-label" style={{ fontSize: 12 }}>Password</label>
                  <input className="search" type="password" placeholder="Enter password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                </div>
                <button className="primary-button" type="submit">Sign In</button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <button type="button" className="text-button" onClick={() => setAuthMode('landing')}>← Back</button>
                  <button type="button" className="text-button" onClick={() => setAuthMode('signup')} style={{ color: 'var(--secondary)' }}>Create account</button>
                </div>
              </form>
            )}

            {authMode === 'signup' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setAuthError('');
                const clean = authEmail.toLowerCase().trim();
                if (!clean.endsWith('@andhrauniversity.edu.in')) {
                  setAuthError('Registration is strictly restricted to official @andhrauniversity.edu.in college email addresses.');
                  return;
                }
                if (authPassword.length < 6) {
                  setAuthError('Password must be at least 6 characters.');
                  return;
                }
                if (authPassword !== authConfirmPassword) {
                  setAuthError('Passwords do not match.');
                  return;
                }
                if (clean !== '325506402371@andhrauniversity.edu.in' && findRegisteredUser(clean)) {
                  setAuthError('An account has already been created for this university email. Each student may create only one account. Please sign in instead.');
                  return;
                }

                setIsOtpLoading(true);
                try {
                  const data = await sendUniversityOtp(clean, authName, authRollNo, true);
                  setAuthOtpToken(data.token || '');
                  setAuthOtpDevCode(data.devCode || '');
                  setAuthOtpProviderStatus(data.providerStatus || 'delivered');
                  setAuthOtpProviderError(data.providerError || '');
                  setAuthOtpCountdown(60);
                  setAuthOtp('');
                  setAuthMode('otp');
                  if (data.providerError) {
                    setToast('Verification code generated (see diagnostic note)');
                  } else {
                    setToast(`Verification code sent to ${clean}`);
                  }
                } catch (err: any) {
                  setAuthError(err?.message || 'Failed to dispatch verification code. Please check your email.');
                } finally {
                  setIsOtpLoading(false);
                }
              }} className="stack" style={{ gap: 12 }}>
                <div>
                  <label className="field-label" style={{ fontSize: 12 }}>Full Name *</label>
                  <input className="search" type="text" placeholder="e.g. Dhanunjay Rao" value={authName} onChange={(e) => setAuthName(e.target.value)} required />
                </div>

                <div>
                  <label className="field-label" style={{ fontSize: 12 }}>Choose Username *</label>
                  <input className="search" type="text" placeholder="e.g. dhanunjay_au" value={authUsername} onChange={(e) => setAuthUsername(e.target.value.toLowerCase().replace(/\s+/g, '_'))} required />
                </div>

                <div>
                  <label className="field-label" style={{ fontSize: 12 }}>University Email *</label>
                  <input className="search" type="email" placeholder="student@andhrauniversity.edu.in" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="field-label" style={{ fontSize: 12 }}>Roll / Reg Number *</label>
                    <input className="search" type="text" placeholder="e.g. 321101234" value={authRollNo} onChange={(e) => setAuthRollNo(e.target.value)} required />
                  </div>
                  <div>
                    <label className="field-label" style={{ fontSize: 12 }}>Phone Number *</label>
                    <input className="search" type="tel" placeholder="+91 9876543210" value={authPhone} onChange={(e) => setAuthPhone(e.target.value)} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="field-label" style={{ fontSize: 12 }}>Department</label>
                    <select className="search" value={authDept} onChange={(e) => setAuthDept(e.target.value)} style={{ padding: '8px 10px', fontSize: 13 }}>
                      <option value="Computer Science & Systems Engineering">CS&SE (CSE)</option>
                      <option value="Electronics & Communication Engineering">ECE</option>
                      <option value="Mechanical Engineering">Mechanical</option>
                      <option value="Civil Engineering">Civil</option>
                      <option value="Electrical & Electronics Engineering">EEE</option>
                      <option value="Chemical Engineering">Chemical</option>
                      <option value="Marine Engineering">Marine</option>
                      <option value="Information Technology">IT</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label" style={{ fontSize: 12 }}>Year</label>
                    <select className="search" value={authYear} onChange={(e) => setAuthYear(e.target.value)} style={{ padding: '8px 10px', fontSize: 13 }}>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label className="field-label" style={{ fontSize: 12 }}>Password *</label>
                    <input className="search" type="password" placeholder="Min 6 chars" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                  </div>
                  <div>
                    <label className="field-label" style={{ fontSize: 12 }}>Confirm Password *</label>
                    <input className="search" type="password" placeholder="Repeat password" value={authConfirmPassword} onChange={(e) => setAuthConfirmPassword(e.target.value)} required />
                  </div>
                </div>

                <button className="primary-button" type="submit" style={{ marginTop: 6 }} disabled={isOtpLoading}>
                  {isOtpLoading ? 'Sending Verification Code...' : 'Verify Email & Create Account →'}
                </button>
                <div style={{ textAlign: 'center' }}>
                  <button type="button" className="text-button" onClick={() => setAuthMode('landing')}>← Back to Sign In</button>
                </div>
              </form>
            )}

            {authMode === 'otp' && (
              <form onSubmit={async (e) => {
                e.preventDefault();
                setAuthError('');
                if (authOtp.trim().length !== 6) {
                  setAuthError('Please enter the complete 6-digit numeric verification code.');
                  return;
                }
                setIsOtpLoading(true);
                try {
                  await verifyUniversityOtp(authEmail, authOtp.trim(), authOtpToken);

                  // Registration officially verified!
                  const studentProfile = {
                    email: authEmail.toLowerCase().trim(),
                    name: authName,
                    username: authUsername,
                    rollNo: authRollNo,
                    department: authDept,
                    year: authYear,
                    phone: authPhone,
                    bio: authBio,
                    password: authPassword,
                    isVerified: true,
                    verifiedAt: new Date().toISOString(),
                  };

                  saveRegisteredUser(studentProfile);
                  localStorage.setItem('aupro_session', JSON.stringify(studentProfile));

                  try {
                    await supabaseSignUp({
                      email: authEmail,
                      password: authPassword,
                      fullName: authName,
                      username: authUsername,
                      rollNo: authRollNo,
                      department: authDept,
                      year: authYear,
                      phone: authPhone,
                    });
                  } catch {}

                  setSignedIn(true);
                  setShowIntro(false);
                  logPlatformActivity('Account Registered', authEmail, `Verified identity for ${authName} (${authRollNo}, ${authDept})`);
                  refreshAdminData();
                  setToast(`Welcome to AuPro, ${authName || 'Student'}! Official email verified successfully.`);
                } catch (err: any) {
                  setAuthError(err?.message || 'Invalid or expired verification code. Please request a new code.');
                } finally {
                  setIsOtpLoading(false);
                }
              }} className="stack" style={{ gap: 14 }}>
                <div style={{ textAlign: 'center', padding: '6px 0' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: 22, background: 'var(--teal)', color: 'var(--secondary)', fontSize: 20, marginBottom: 8 }}>
                    🛡️
                  </div>
                  <h3 style={{ margin: '0 0 4px 0', fontSize: 17, fontWeight: 700, color: 'var(--ink)' }}>Verify College Identity</h3>
                  <p className="lead" style={{ fontSize: 13, margin: 0, color: 'var(--muted)' }}>
                    A 6-digit security code was dispatched to:
                  </p>
                  <div className="otp-target-pill">
                    {authEmail} • Roll No: {authRollNo || '—'}
                  </div>
                </div>

                {authOtpProviderStatus === 'delivered' && !authOtpProviderError && (
                  <div style={{
                    background: 'rgba(16, 185, 129, 0.08)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 12,
                    color: 'var(--ink)',
                    textAlign: 'center',
                    margin: '6px 0 10px 0',
                    lineHeight: 1.5,
                  }}>
                    <div style={{ color: '#10b981', fontWeight: 700, marginBottom: 2 }}>✓ Dispatched via Resend</div>
                    <span style={{ color: 'var(--muted)' }}>Check your university inbox (and spam folder) for the 6-digit code.</span>
                  </div>
                )}

                {authOtpProviderError && (
                  <div style={{
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 12,
                    color: 'var(--ink)',
                    lineHeight: 1.45,
                    margin: '6px 0 10px 0',
                    textAlign: 'left',
                  }}>
                    <strong style={{ color: '#ef4444', display: 'block', marginBottom: 2 }}>⚠️ Email Dispatch Diagnostic:</strong>
                    <span>{authOtpProviderError}</span>
                  </div>
                )}

                {authOtpDevCode && (
                  <div style={{ textAlign: 'center', margin: '4px 0 10px 0' }}>
                    <span style={{ fontSize: 12, color: 'var(--muted)', background: 'var(--hover-subtle)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 8, fontFamily: 'monospace', display: 'inline-block' }}>
                      Verification code: <strong style={{ color: 'var(--primary)', letterSpacing: 2, fontSize: 13 }}>{authOtpDevCode}</strong>
                    </span>
                  </div>
                )}

                <div>
                  <label className="field-label" style={{ fontSize: 12, textAlign: 'center', display: 'block', marginBottom: 8 }}>
                    Enter 6-Digit Verification Code *
                  </label>
                  <input
                    className="search"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="••••••"
                    value={authOtp}
                    onChange={(e) => setAuthOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    autoFocus
                    style={{
                      textAlign: 'center',
                      fontSize: 24,
                      fontWeight: 700,
                      letterSpacing: 8,
                      padding: '12px 16px',
                      color: 'var(--primary)',
                      border: '2px solid var(--border)',
                      borderRadius: 10,
                    }}
                    required
                  />
                </div>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={authOtp.trim().length !== 6 || isOtpLoading}
                  style={{
                    padding: '12px 18px',
                    fontSize: 14,
                    fontWeight: 700,
                    opacity: authOtp.trim().length === 6 ? 1 : 0.65,
                    cursor: authOtp.trim().length === 6 ? 'pointer' : 'not-allowed',
                  }}
                >
                  {isOtpLoading ? 'Verifying...' : '✓ Verify Code & Activate Account'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 12 }}>
                  <button
                    type="button"
                    className="text-button"
                    onClick={() => {
                      setAuthError('');
                      setAuthMode('signup');
                    }}
                    style={{ color: 'var(--muted)', fontSize: 12 }}
                  >
                    ← Edit registration details
                  </button>

                  <button
                    type="button"
                    className="text-button"
                    disabled={authOtpCountdown > 0 || isOtpLoading}
                    onClick={async () => {
                      setAuthError('');
                      setIsOtpLoading(true);
                      try {
                        const data = await sendUniversityOtp(authEmail, authName, authRollNo);
                        setAuthOtpToken(data.token || '');
                        setAuthOtpDevCode(data.devCode || '');
                        setAuthOtpProviderError(data.providerError || '');
                        setAuthOtpCountdown(60);
                        if (data.providerError) {
                          setToast('New verification code generated (see diagnostic note)');
                        } else {
                          setToast(`New verification code sent to ${authEmail}`);
                        }
                      } catch (err: any) {
                        setAuthError(err?.message || 'Failed to resend code.');
                      } finally {
                        setIsOtpLoading(false);
                      }
                    }}
                    style={{
                      color: authOtpCountdown > 0 ? 'var(--muted)' : 'var(--primary)',
                      fontWeight: 600,
                      cursor: authOtpCountdown > 0 ? 'default' : 'pointer',
                    }}
                  >
                    {authOtpCountdown > 0 ? `Resend Code (${authOtpCountdown}s)` : 'Resend Code'}
                  </button>
                </div>
              </form>
            )}

            <p className="lead" style={{ fontSize: 12, marginTop: 16, marginBottom: 0 }}>
              Only verified <strong>@andhrauniversity.edu.in</strong> accounts are authorized.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="shell">
      {/* Top Bar: Clean and uncluttered, NO "Search campus posts" */}
      <header className="topbar">
        <div className="brand" onClick={() => setTab('feed')} style={{ cursor: 'pointer' }}>
          <span>AuPro</span>
          <span className="brand-badge">AU Eng</span>
        </div>
        <div className="topbar-actions">
          <button
            className="icon-button theme-toggle-btn"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            onClick={toggleTheme}
            style={{ color: theme === 'dark' ? '#fbbf24' : 'var(--ink)' }}
          >
            {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>
          <button className="icon-button" aria-label="Notifications" onClick={() => setTopNotice('No new unread notices.')}>
            <NotificationIcon size={22} />
          </button>
          <button className="icon-button" aria-label="Open chatbot" onClick={() => setTab('chatbot')}>
            <ChatbotIcon size={22} />
          </button>
          <button
            className="profile-avatar"
            aria-label="My Profile and Quick Menu"
            onClick={() => setShowProfileMenu((prev) => !prev)}
          >
            {(authName.trim()[0] || authEmail.trim()[0] || 'A').toUpperCase()}
          </button>
        </div>
      </header>

      {/* Topbar Profile Dropdown Quick Menu with Sign Out */}
      {showProfileMenu && (
        <div className="profile-dropdown-backdrop" onClick={() => setShowProfileMenu(false)}>
          <div className="profile-dropdown-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-dropdown-header">
              <div className="profile-dropdown-avatar">
                {(authName.trim()[0] || authEmail.trim()[0] || 'A').toUpperCase()}
              </div>
              <div className="profile-dropdown-user">
                <h3>{authName || 'AU Student'}</h3>
                <span>@{studentHandle}</span>
                <span className="profile-dropdown-email">{authEmail}</span>
              </div>
            </div>
            <div className="profile-dropdown-actions">
              <button
                className="profile-dropdown-btn"
                onClick={toggleTheme}
              >
                <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
                <span>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</span>
              </button>
              <button
                className="profile-dropdown-btn"
                onClick={() => {
                  setTab('about');
                  setAboutSubTab('profile');
                  setShowProfileMenu(false);
                }}
              >
                <span>👤</span> View Full Profile &amp; Bio
              </button>
              <button
                className="profile-dropdown-btn"
                onClick={() => {
                  setTab('about');
                  setAboutSubTab('profile');
                  setShowProfileMenu(false);
                }}
              >
                <span>⚙️</span> Account Preferences &amp; Settings
              </button>
              <button className="profile-dropdown-signout" onClick={handleSignOut}>
                <span>🚪</span> Sign Out of AuPro
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <section className={`content ${tab === 'location' ? 'content-map' : ''}`}>
        {topNotice && (
          <div className="top-notice" role="status">
            <span>{topNotice}</span>
            <button aria-label="Dismiss" onClick={() => setTopNotice('')}>×</button>
          </div>
        )}


        {/* TAB 1: FEED / MOMENTS */}
        {tab === 'feed' && (
          <div className="insta-feed-container">
            {filteredFeedPosts.map((post) => (
              <MomentCard
                key={post.id}
                post={post}
                onToast={setToast}
                isSaved={savedPostIds.includes(post.id)}
                onSaveToggle={handleSaveToggle}
                isOwner={
                  (post.authorEmail && post.authorEmail === authEmail) ||
                  post.username === authUsername ||
                  post.username === (authName ? authName.toLowerCase().replace(/\s+/g, '_') : '') ||
                  post.username === 'you'
                }
                onDelete={handleDeletePost}
              />
            ))}

            {filteredFeedPosts.length === 0 ? (
              <div className="card feed-empty-card">
                <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
                <h3>No Posts in Feed Yet</h3>
                <p className="lead" style={{ fontSize: 13, margin: '0 0 16px 0' }}>
                  Be the first to share an academic update, tech project, or report a campus issue with fellow AU students.
                </p>
                <button
                  className="primary-button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 auto', fontSize: 13 }}
                  onClick={() => {
                    setThreadsInitialKind('normal');
                    setShowThreadsComposer(true);
                  }}
                >
                  <span>Create Post</span>
                </button>
              </div>
            ) : (
              <div className="feed-end-note"><strong>You’re all caught up</strong><span>You’ve seen all recent updates.</span></div>
            )}
          </div>
        )}

        {/* TAB 2: APPLICATIONS / SERVICES (Dedicated Page View + Burgundy Click) */}
        {tab === 'applications' && (
          <div className="stack">
            {activeApplication ? (
              <div className="application-page-view">
                <button className="app-breadcrumb" onClick={() => setActiveApplication(null)}>
                  ← Back to Applications List
                </button>

                <div className="card" style={{ borderLeft: '4px solid #701d32', padding: '24px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                    <div className={`service-icon service-icon-${activeApplication.icon}`} style={{ width: 48, height: 48, fontSize: 22, flexShrink: 0 }}>
                      <ServiceIcon kind={activeApplication.icon} size={24} />
                    </div>
                    <div>
                      <div className="eyebrow" style={{ color: '#701d32', marginBottom: 2 }}>AU College of Engineering · Official Service</div>
                      <h2 style={{ margin: 0, fontSize: 22 }}>{activeApplication.title}</h2>
                    </div>
                  </div>
                  <p className="lead" style={{ margin: '0 0 20px 0', fontSize: 13 }}>{activeApplication.detail}</p>

                  {/* Step Progress Tracker */}
                  <div className="app-step-tracker">
                    <div className="app-step-item active">
                      <div className="app-step-circle">1</div>
                      <span>Details Form</span>
                    </div>
                    <div style={{ flex: 1, height: 2, background: '#701d32', margin: '0 8px' }} />
                    <div className="app-step-item active">
                      <div className="app-step-circle">2</div>
                      <span>Verification</span>
                    </div>
                    <div style={{ flex: 1, height: 2, background: '#cbd5e1', margin: '0 8px' }} />
                    <div className="app-step-item">
                      <div className="app-step-circle">3</div>
                      <span>Dept Endorsement</span>
                    </div>
                    <div style={{ flex: 1, height: 2, background: '#cbd5e1', margin: '0 8px' }} />
                    <div className="app-step-item">
                      <div className="app-step-circle">4</div>
                      <span>Ready for Pickup</span>
                    </div>
                  </div>

                  {/* Application Form Pre-filled with Student Credentials */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      const refId = `AU-${Math.floor(100000 + Math.random() * 900000)}`;
                      logPlatformActivity('Applied for Certificate', authEmail || 'Student', `${activeApplication.title} (Ref ID: ${refId})`);
                      setToast(`Application for ${activeApplication.title} submitted! Ref ID: ${refId}`);
                      setApplicationStatus(`Application submitted for ${activeApplication.title} (Ref ID: ${refId}). Track at Academic Section Counter 3.`);
                      setActiveApplication(null);
                      setApplicationPurpose('');
                    }}
                    className="stack"
                    style={{ gap: 14 }}
                  >
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                      <div>
                        <label className="field-label" style={{ fontSize: 14, fontWeight: 500 }}>Applicant Full Name</label>
                        <input className="search" value={authName || 'Student Name'} readOnly style={{ background: 'var(--input-bg)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 14, fontWeight: 500 }}>Roll / Registration Number</label>
                        <input className="search" value={authRollNo || '321101234'} readOnly style={{ background: 'var(--input-bg)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 14, fontWeight: 500 }}>Department & Branch</label>
                        <div
                          className="search"
                          style={{
                            background: 'var(--input-bg)',
                            color: 'var(--text-main)',
                            minHeight: 44,
                            height: 'auto',
                            display: 'flex',
                            alignItems: 'center',
                            lineHeight: 1.35,
                            padding: '8px 14px',
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            borderRadius: 12,
                            fontSize: 15,
                            fontWeight: 400,
                          }}
                        >
                          {authDept}
                        </div>
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 14, fontWeight: 500 }}>Year of Study</label>
                        <input className="search" value={authYear} readOnly style={{ background: 'var(--input-bg)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 14, fontWeight: 500 }}>University College Email</label>
                        <input className="search" value={authEmail} readOnly style={{ background: 'var(--input-bg)', color: 'var(--text-main)' }} />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 14, fontWeight: 500 }}>Contact Phone</label>
                        <input className="search" value={authPhone || '+91 9876543210'} readOnly style={{ background: 'var(--input-bg)', color: 'var(--text-main)' }} />
                      </div>
                    </div>

                    <div>
                      <label className="field-label" style={{ fontSize: 12 }}>Purpose / Specific Requirements *</label>
                      <textarea
                        className="search"
                        rows={4}
                        placeholder="Specify reason (e.g. Higher studies scholarship, passport verification, bus concession pass, or duplicate grade card)..."
                        value={applicationPurpose}
                        onChange={(e) => setApplicationPurpose(e.target.value)}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                      <button type="submit" className="primary-button" style={{ background: '#701d32', borderColor: '#701d32', fontWeight: 700 }}>
                        Submit Official Application
                      </button>
                      <button type="button" className="secondary-button" onClick={() => setActiveApplication(null)}>
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <div className="eyebrow">College Office Services</div>
                  <h1>Applications</h1>
                  <p className="lead">Find student services, submit forms step-by-step, and track your approval status.</p>
                </div>
                <input
                  className="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search applications (e.g. bonafide, bus pass)..."
                  aria-label="Search applications"
                />
                <div className="grid service-grid">
                  {filteredServices.map((service) => (
                    <article className="card service-card" key={service.title}>
                      <div className="service-heading">
                        <div className={`service-icon service-icon-${service.icon}`}>
                          <ServiceIcon kind={service.icon} size={22} />
                        </div>
                        <h2>{service.title}</h2>
                      </div>
                      <p className="lead">{service.detail}</p>
                      <button
                        className={`apply-burgundy-btn ${clickedApplyId === service.title ? 'clicked' : ''}`}
                        onClick={() => {
                          setClickedApplyId(service.title);
                          setTimeout(() => {
                            setClickedApplyId(null);
                            setActiveApplication(service);
                          }, 220);
                        }}
                      >
                        Apply now ➔
                      </button>
                    </article>
                  ))}
                </div>
                {applicationStatus && <div className="feedback-banner" role="status">{applicationStatus}</div>}
              </>
            )}
          </div>
        )}

        {/* TAB 3: CREATE POST (Tailored for "Announcement Post" and "Problem") */}
        {tab === 'create' && (
          <div className="stack" style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="create-heading">
              <button className="back-button" onClick={() => setTab('feed')}>← Back to feed</button>
              <div className="eyebrow">{createKind === 'problem' ? 'Student Voice & Maintenance' : 'College Office & Departments'}</div>
              <h1>{createKind === 'problem' ? 'Report a Problem' : 'New Announcement Post'}</h1>
              <p className="lead">
                {createKind === 'problem'
                  ? 'Submit an infrastructure, lab, hostel, or campus issue directly for college administration review.'
                  : 'Publish an official notice or college circular with clear information for students.'}
              </p>
            </div>

            <form className="card create-form" onSubmit={handleCreatePost}>
              {createKind === 'announcement' ? (
                <div style={{ background: 'rgba(220, 38, 38, 0.1)', border: '1px solid rgba(220, 38, 38, 0.3)', borderRadius: 12, padding: 14, color: 'var(--error)', fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
                  <strong>🔒 Announcements Temporarily Blocked</strong>
                  <p style={{ margin: '4px 0 0 0', fontSize: 12 }}>
                    Official announcement publishing is currently locked by university administration. Please report your campus concern as a <strong>Problem</strong>.
                  </p>
                </div>
              ) : (
                <>
                  <label className="field-label" htmlFor="create-title">Problem Title / Issue *</label>
                  <input
                    id="create-title"
                    className="search"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Water cooler near Room 208 not working"
                    required
                  />
                </>
              )}

              <label className="field-label" htmlFor="create-loc">Location / Room Number</label>
              <div className="create-location-field">
                <InstagramLocationIcon size={17} />
                <input
                  id="create-loc"
                  className="search"
                  value={createLocation}
                  onChange={(e) => setCreateLocation(e.target.value)}
                  placeholder="e.g. Civil Engineering Block, 2nd Floor"
                  required
                />
              </div>

              <label className="field-label" htmlFor="create-caption">Description / Details</label>
              <textarea
                id="create-caption"
                className="search create-caption"
                rows={4}
                value={createCaption}
                onChange={(e) => setCreateCaption(e.target.value)}
                placeholder={createKind === 'problem' ? 'Describe what is broken or needed in detail...' : 'Full text of the announcement...'}
                maxLength={1200}
                required
              />

              <label className="create-upload" htmlFor="create-file">
                {createPreview ? (
                  <img className="create-image-preview" src={createPreview} alt="Preview" />
                ) : (
                  <span className="create-upload-mark"><BigPlusIcon size={24} /></span>
                )}
                <strong>{createFile ? createFile.name : (createKind === 'problem' ? 'Attach Photo Evidence (Optional)' : 'Attach Document or Banner Photo')}</strong>
                <span className="lead">Images up to 12 MB</span>
                <input id="create-file" type="file" accept="image/*" onChange={handleCreateFile} />
              </label>

              {createKind === 'problem' && (
                <label className="checkbox-row" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, margin: '8px 0' }}>
                  <input
                    type="checkbox"
                    checked={createAnonymous}
                    onChange={(e) => setCreateAnonymous(e.target.checked)}
                  />
                  <span>Report anonymously (name hidden from public feed)</span>
                </label>
              )}

              {createError && <p className="error" role="alert">{createError}</p>}

              <button className="primary-button create-submit" type="submit">
                {createKind === 'problem' ? 'Submit Problem Report' : 'Publish Announcement'}
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: CHATBOT / AI ASSISTANT (Sharp, to-the-point) */}
        {tab === 'chatbot' && (
          <div className="stack" style={{ maxWidth: 640, margin: '0 auto' }}>
            <div>
              <div className="eyebrow">AU Assistant</div>
              <h1>Ask AuPro</h1>
              <p className="lead">Direct, verified answers for College of Engineering administration, exams, fees, and services.</p>
            </div>

            {/* Quick Answer Prompt Chips */}
            <div className="chatbot-chip-container">
              {[
                'Office Timings',
                'Bonafide Certificate',
                'Fee Payment',
                'Hall Tickets',
                'Library Hours',
                'Hostel Rules',
                'HOD Contacts',
                'Bus Pass',
              ].map((chip) => (
                <button
                  key={chip}
                  className="chatbot-chip"
                  onClick={() => handleAskBot(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Conversational Stream */}
            <div className="card chat-card">
              <div className="chat-messages-scroll" aria-live="polite">
                {chatMessages.map((msg, index) => (
                  <div key={index} className={`chat-bubble-row ${msg.role === 'user' ? 'user-row' : 'bot-row'}`}>
                    {msg.role === 'assistant' && (
                      <div className="chat-bot-avatar">AU</div>
                    )}
                    <div className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'bot-bubble'}`}>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input & Actions */}
              <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); handleAskBot(chatInput); }}>
                <div className="chat-input-row">
                  <input
                    className="search chat-input-field"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about timings, fees, certificates, or courses..."
                  />
                  <button className="primary-button chat-send-btn" type="submit" disabled={!chatInput.trim()}>
                    Send
                  </button>
                </div>
                <div className="chat-footer-actions">
                  <a
                    className="whatsapp-button"
                    href={`https://wa.me/?text=${encodeURIComponent(chatInput || 'Hello, I need help with an Andhra University query.')}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <WhatsAppIcon size={18} />
                    <span>Forward query to Department WhatsApp</span>
                  </a>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: CAMPUS MAP / LOCATION (Authentic Google Maps Edge-to-Edge Experience) */}
        {tab === 'location' && (
          <div className={`gmaps-container maps-environment-wrapper ${isMapFullscreen ? 'fullscreen' : ''}`}>
            {/* The Google Maps Embedded Background Canvas */}
            {isMapLoading && (
              <div className="gmaps-skeleton-loader">
                <div className="gmaps-skeleton-spinner" />
                <span>Loading Andhra University Map...</span>
              </div>
            )}
            <iframe
              className="gmaps-iframe"
              title="Google Maps Andhra University"
              onLoad={() => setIsMapLoading(false)}
              src={
                isNavigating || showDirections
                  ? `https://www.google.com/maps?saddr=${encodeURIComponent(
                      resolveLocationQuery(
                        directionsStart === 'Your location' && userCoords
                          ? `${userCoords.lat},${userCoords.lng}`
                          : directionsStart
                      )
                    )}&daddr=${encodeURIComponent(
                      resolveDestinationQuery(directionsEnd, selectedLandmark)
                    )}&dirflg=${
                      transportMode === 'w' ? 'w' : transportMode === 'r' ? 'r' : 'd'
                    }&output=embed`
                  : `https://www.google.com/maps?q=${encodeURIComponent(mapLocationQuery)}&t=${mapLayer}&z=17&output=embed`
              }
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            {/* IN-APP TURN-BY-TURN NAVIGATION HUD */}
            {isNavigating ? (
              <>
                {/* Step Preview Navigator Controls on TOP */}
                <div className="gmaps-nav-step-controls">
                  <button
                    type="button"
                    className="gmaps-nav-step-btn"
                    disabled={navStepIndex <= 0}
                    onClick={() => setNavStepIndex((prev) => Math.max(0, prev - 1))}
                    style={{ opacity: navStepIndex <= 0 ? 0.4 : 1 }}
                  >
                    ◀ Prev Step
                  </button>
                  <span style={{ fontSize: 12.5, alignSelf: 'center', fontWeight: 600 }}>
                    Turn {navStepIndex + 1} of {campusNavSteps.length}
                  </span>
                  <button
                    type="button"
                    className="gmaps-nav-step-btn"
                    disabled={navStepIndex >= campusNavSteps.length - 1}
                    onClick={() => setNavStepIndex((prev) => Math.min(campusNavSteps.length - 1, prev + 1))}
                    style={{ opacity: navStepIndex >= campusNavSteps.length - 1 ? 0.4 : 1 }}
                  >
                    Next Step ▶
                  </button>
                </div>

                {/* Green Navigation HUD Banner at the BOTTOM */}
                <div className="gmaps-nav-hud-top">
                  <div className="gmaps-nav-turn-icon">
                    {campusNavSteps[navStepIndex]?.turnIcon || '⬆'}
                  </div>
                  <div className="gmaps-nav-instructions">
                    <div className="gmaps-nav-primary-instruction">
                      {campusNavSteps[navStepIndex]?.instruction}
                    </div>
                    <div className="gmaps-nav-sub-instruction">
                      {campusNavSteps[navStepIndex]?.subText} • {campusNavSteps[navStepIndex]?.distance}
                    </div>
                  </div>
                </div>

                {/* Step-by-Step Route Drawer */}
                {showNavStepsSheet && (
                  <div className="gmaps-nav-steps-modal">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>Turn-by-Turn Route Guidance</h4>
                      <button className="icon-button" onClick={() => setShowNavStepsSheet(false)}>✕</button>
                    </div>
                    <div className="stack" style={{ gap: 8 }}>
                      {campusNavSteps.map((step, idx) => (
                        <div
                          key={idx}
                          onClick={() => { setNavStepIndex(idx); setShowNavStepsSheet(false); }}
                          style={{
                            display: 'flex',
                            gap: 12,
                            alignItems: 'center',
                            padding: '10px 12px',
                            borderRadius: 10,
                            background: navStepIndex === idx ? 'var(--hover-subtle)' : 'transparent',
                            border: navStepIndex === idx ? '1px solid var(--primary)' : '1px solid var(--border-light)',
                            cursor: 'pointer',
                          }}
                        >
                          <span style={{ fontSize: 20 }}>{step.turnIcon}</span>
                          <div style={{ flex: 1 }}>
                            <strong style={{ fontSize: 13, display: 'block', color: 'var(--ink)' }}>{step.instruction}</strong>
                            <span style={{ fontSize: 11.5, color: 'var(--muted)' }}>{step.subText} • {step.distance}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Navigation Control Bar */}
                <div className="gmaps-nav-hud-bottom">
                  <div className="gmaps-nav-eta-block">
                    <div className="gmaps-nav-eta-time">{getRouteMetrics().timeStr}</div>
                    <div className="gmaps-nav-eta-meta">{getRouteMetrics().metaStr}</div>
                  </div>
                  <div className="gmaps-nav-hud-actions">
                    <button
                      type="button"
                      className="gmaps-nav-steps-btn"
                      onClick={() => setShowNavStepsSheet(!showNavStepsSheet)}
                    >
                      Steps ☰
                    </button>
                    <button
                      type="button"
                      className="gmaps-nav-exit-btn"
                      onClick={() => {
                        setIsNavigating(false);
                        setShowNavStepsSheet(false);
                        setShowDirections(false);
                        setToast('In-app navigation ended.');
                      }}
                    >
                      ✕ Exit
                    </button>
                  </div>
                </div>
              </>
            ) : null}

            {/* Floating Top Bar: Search Bar or Directions Header */}
            <div className="gmaps-top-overlay">
              {isGpsTracking && userCoords && (
                <div
                  className="gmaps-gps-badge"
                  onClick={handleLocateMe}
                  title="Auto-tracking active. Tap to re-center on live GPS."
                >
                  <span className="gps-live-dot" />
                  <span>GPS Active: {userCoords.lat.toFixed(4)}°N, {userCoords.lng.toFixed(4)}°E (±{Math.round(userCoords.accuracy || 10)}m)</span>
                </div>
              )}
              {!showDirections ? (
                <>
                  {/* Google Maps Search Bar Card */}
                  <div className="gmaps-search-card">
                    <div className="gmaps-search-icon">
                      <GoogleMapsPinIcon size={20} />
                    </div>
                    <input
                      className="gmaps-search-input"
                      placeholder="Search Andhra University..."
                      value={mapSearchInput}
                      onChange={(e) => {
                        setMapSearchInput(e.target.value);
                        setShowSearchSuggestions(true);
                      }}
                      onFocus={() => setShowSearchSuggestions(true)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && mapSearchInput.trim()) {
                          setShowSearchSuggestions(false);
                          setMapLocationQuery(`${mapSearchInput.trim()}, Andhra University, Visakhapatnam`);
                        }
                      }}
                    />
                    {mapSearchInput && (
                      <button
                        className="gmaps-search-clear"
                        onClick={() => {
                          setMapSearchInput('');
                          setShowSearchSuggestions(false);
                        }}
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                    <div className="gmaps-search-divider" />
                    <button
                      className="gmaps-directions-btn"
                      title="Directions"
                      aria-label="Directions"
                      onClick={() => {
                        setShowDirections(true);
                        if (selectedLandmark) {
                          setDirectionsEnd(selectedLandmark.name);
                        }
                      }}
                    >
                      <DirectionsDiamondIcon size={20} />
                    </button>

                    {/* Search Auto-suggestions Dropdown */}
                    {showSearchSuggestions && (
                      <div className="gmaps-suggestions-dropdown">
                        {filteredLandmarks.slice(0, 8).map((loc) => (
                          <div
                            key={loc.id}
                            className="gmaps-suggestion-item"
                            onClick={() => {
                              setSelectedLandmark(loc);
                              setMapLocationQuery(loc.query);
                              setMapSearchInput(loc.name);
                              setShowSearchSuggestions(false);
                            }}
                          >
                            <GoogleMapsPinIcon size={18} />
                            <div className="gmaps-suggestion-info">
                              <strong>{loc.name}</strong>
                              <span>{loc.category} • {loc.code}</span>
                            </div>
                          </div>
                        ))}
                        {filteredLandmarks.length === 0 && (
                          <div style={{ padding: '12px 16px', fontSize: 13, color: 'var(--muted)' }}>
                            No places match. Try another search.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Google Maps Category Filter Chips */}
                  <div className="gmaps-chips-scroll">
                    {[
                      { id: 'all', label: 'All' },
                      { id: 'history', label: 'History' },
                      { id: 'built-1950', label: 'Built <1950' },
                      { id: 'visakhapatnam', label: 'Visakhapatnam' },
                      { id: 'vaddadi', label: 'Vaddadi' },
                      { id: 'library', label: 'Library' },
                      { id: 'departments', label: 'Departments' },
                      { id: 'hostels', label: 'Hostels' },
                    ].map((chip) => {
                      const isActive = mapFilterChip === chip.id;
                      return (
                        <button
                          key={chip.id}
                          className={`gmaps-chip ${isActive ? 'active' : ''}`}
                          onClick={() => {
                            if (isActive) {
                              setMapFilterChip('all');
                            } else {
                              setMapFilterChip(chip.id as any);
                            }
                          }}
                        >
                          {chip.label}
                        </button>
                      );
                    })}
                  </div>
                </>
              ) : (
                /* Google Maps Directions Navigation Drawer Card */
                <div className="gmaps-directions-card">
                  <div className="gmaps-transit-row">
                    <button
                      className="gmaps-back-btn"
                      onClick={() => setShowDirections(false)}
                      aria-label="Back to Map"
                    >
                      ←
                    </button>
                    <div className="gmaps-transit-modes">
                      <button
                        className={`gmaps-transit-btn ${transportMode === 'w' ? 'active' : ''}`}
                        onClick={() => setTransportMode('w')}
                      >
                        <WalkIcon size={16} />
                        <span>Walk</span>
                      </button>
                      <button
                        className={`gmaps-transit-btn ${transportMode === 'm' ? 'active' : ''}`}
                        onClick={() => setTransportMode('m')}
                      >
                        <span>🏍️</span>
                        <span>Bike</span>
                      </button>
                      <button
                        className={`gmaps-transit-btn ${transportMode === 'd' ? 'active' : ''}`}
                        onClick={() => setTransportMode('d')}
                      >
                        <CarIcon size={16} />
                        <span>Drive</span>
                      </button>
                      <button
                        className={`gmaps-transit-btn ${transportMode === 'r' ? 'active' : ''}`}
                        onClick={() => setTransportMode('r')}
                      >
                        <TransitBusIcon size={16} />
                        <span>Bus</span>
                      </button>
                    </div>
                  </div>

                  <div className="gmaps-route-inputs">
                    <div className="gmaps-route-pins">
                      <div className="gmaps-pin-circle" />
                      <div style={{ width: 2, height: 16, background: '#dadce0' }} />
                      <div className="gmaps-pin-dot" />
                    </div>
                    <div className="gmaps-route-fields">
                      <input
                        className="gmaps-route-field"
                        value={directionsStart}
                        onChange={(e) => setDirectionsStart(e.target.value)}
                        placeholder="Choose start location"
                      />
                      <input
                        className="gmaps-route-field"
                        value={directionsEnd}
                        onChange={(e) => setDirectionsEnd(e.target.value)}
                        placeholder="Choose destination"
                      />
                    </div>
                    <button
                      className="gmaps-swap-btn"
                      title="Swap start and destination"
                      onClick={() => {
                        const temp = directionsStart;
                        setDirectionsStart(directionsEnd);
                        setDirectionsEnd(temp);
                      }}
                    >
                      <SwapRouteIcon size={16} />
                    </button>
                  </div>

                  {/* Quick Start Preset Chips */}
                  <div className="gmaps-preset-pills">
                    <span style={{ fontSize: 11, color: 'var(--muted)', alignSelf: 'center', whiteSpace: 'nowrap' }}>Start:</span>
                    {[
                      'Your location',
                      'Shiva Jay Hostel',
                      'Sripuram Junction',
                      'Madhylapalam',
                      'Channawal Thero',
                      'AU Main Gate',
                      'RTC Complex',
                      'AU Convention Center',
                      'RK Beach',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        className={`gmaps-preset-pill ${directionsStart === preset ? 'active' : ''}`}
                        onClick={() => {
                          setDirectionsStart(preset);
                          setIsLocationFar(false);
                          if (preset === 'Your location') {
                            handleLocateMe();
                          }
                        }}
                      >
                        {preset === 'Your location'
                          ? userCoords
                            ? '📍 Your location (Live GPS)'
                            : '📍 Your location'
                          : preset}
                      </button>
                    ))}
                  </div>

                  {/* Proximity / Far Location Detection Prompt */}
                  {isLocationFar && userDistanceToAu && (
                    <div className="gmaps-far-location-prompt">
                      <div className="gmaps-far-header">
                        <span style={{ fontSize: 16 }}>📍</span>
                        <div>
                          <strong>You are {userDistanceToAu} km from Andhra University</strong>
                          <p>Choose a nearby campus entry hub below, or route directly from anywhere with Google Maps.</p>
                        </div>
                      </div>

                      <div className="gmaps-far-actions">
                        {nearestHub && (
                          <button
                            type="button"
                            className="gmaps-far-btn primary"
                            onClick={() => {
                              setDirectionsStart(nearestHub.shortName);
                              setIsLocationFar(false);
                              setToast(`Starting route from nearest campus hub: ${nearestHub.shortName}`);
                            }}
                          >
                            ⭐ Start from {nearestHub.shortName} (~{nearestHub.distanceKm} km to AU)
                          </button>
                        )}

                        <button
                          type="button"
                          className="gmaps-far-btn secondary"
                          onClick={() => {
                            setDirectionsStart('Your location');
                            setIsLocationFar(false);
                            setToast(`Routing directly from your current location (${userDistanceToAu} km away)`);
                          }}
                        >
                          🚗 Route from current location ({userDistanceToAu} km)
                        </button>
                      </div>

                      <div className="gmaps-far-hubs-label">Or choose a campus transit hub:</div>
                      <div className="gmaps-far-hubs-chips">
                        {AU_NEARBY_HUBS.map((hub) => (
                          <button
                            key={hub.id}
                            type="button"
                            className={`gmaps-far-hub-chip ${directionsStart === hub.shortName ? 'active' : ''}`}
                            onClick={() => {
                              setDirectionsStart(hub.shortName);
                              setIsLocationFar(false);
                              setToast(`Selected: ${hub.shortName}`);
                            }}
                          >
                            {hub.shortName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Floating Action Buttons (Right side: Layers, My Location, Fullscreen) */}
            <div
              className="gmaps-fab-column"
              style={{
                bottom: !showDirections ? (isSheetExpanded ? 'calc(70% + 16px)' : '240px') : '100px',
                transition: 'bottom 0.28s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              <button
                className="gmaps-fab-btn"
                title={mapLayer === 'm' ? 'Switch to Satellite View' : 'Switch to Street Map'}
                onClick={() => setMapLayer((prev) => (prev === 'm' ? 'k' : 'm'))}
              >
                <LayersIcon size={20} />
              </button>
              <button
                className={`gmaps-fab-btn ${isGpsTracking ? 'gps-active' : ''}`}
                title="My location"
                onClick={handleLocateMe}
                aria-label="My location"
              >
                <CrosshairGpsIcon size={20} />
              </button>
              <button
                className="gmaps-fab-btn"
                title={isMapFullscreen ? 'Exit Fullscreen' : 'Open in Fullscreen'}
                onClick={() => setIsMapFullscreen((prev) => !prev)}
              >
                {isMapFullscreen ? '✕' : '⛶'}
              </button>
            </div>

            {/* Layer 4: Bottom Sheet (peek / expanded) */}
            {!showDirections && (
              <div className={`gmaps-bottom-sheet ${isSheetExpanded ? 'expanded' : 'peek'}`}>
                {/* Drag Handle & Place Count Header */}
                <button
                  type="button"
                  className="gmaps-sheet-handle-bar"
                  onClick={() => setIsSheetExpanded((prev) => !prev)}
                  aria-label={isSheetExpanded ? 'Collapse places sheet' : 'Expand places sheet'}
                >
                  <div className="gmaps-sheet-handle-pill" />
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 16px 8px' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
                    {filteredLandmarks.length} {filteredLandmarks.length === 1 ? 'place' : 'places'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSheetExpanded((prev) => !prev)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--secondary)', fontSize: 13, fontWeight: 500, cursor: 'pointer' }}
                  >
                    {isSheetExpanded ? 'Collapse' : 'View all'}
                  </button>
                </div>

                {/* Cards List inside Sheet */}
                <div className="gmaps-sheet-cards-list">
                  {filteredLandmarks.length === 0 ? (
                    <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 14 }}>
                      No places match. Try another search.
                    </div>
                  ) : (
                    filteredLandmarks.map((loc) => {
                      const isSelected = selectedLandmark?.id === loc.id;
                      return (
                        <div
                          key={loc.id}
                          className={`gmaps-sheet-place-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedLandmark(loc);
                            setMapLocationQuery(loc.query);
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <div className="gmaps-sheet-place-title">
                              {loc.name}
                            </div>
                            <span style={{ fontSize: 16 }}>
                              {loc.category === 'Department' ? '🏢' : loc.category === 'Library' ? '📚' : loc.category === 'Hostel' ? '🛏️' : '🏛️'}
                            </span>
                          </div>

                          <div className="gmaps-sheet-place-detail">
                            {loc.category} • {loc.code}
                          </div>

                          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 2 }}>
                            {loc.built} {loc.tags && loc.tags.length > 0 ? `• ${loc.tags.join(', ')}` : ''}
                          </div>

                          <div style={{ display: 'flex', gap: 8, marginTop: 8 }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              className="gmaps-action-pill primary"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              onClick={() => {
                                setSelectedLandmark(loc);
                                setDirectionsEnd(loc.name);
                                setShowDirections(true);
                              }}
                            >
                              <DirectionsDiamondIcon size={14} />
                              <span>Directions</span>
                            </button>
                            <button
                              type="button"
                              className="gmaps-action-pill"
                              style={{ padding: '4px 10px', fontSize: 12 }}
                              onClick={() => {
                                if (navigator.clipboard) {
                                  navigator.clipboard.writeText(loc.name);
                                  setToast(`Copied "${loc.name}" to clipboard`);
                                }
                              }}
                            >
                              <span>📋</span>
                              <span>Copy</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* Directions Trip Summary Bottom Sheet */}
            {showDirections && (
              <div className="gmaps-trip-sheet">
                <div>
                  <div className="gmaps-trip-time">
                    {getRouteMetrics().timeStr}
                  </div>
                  <div className="gmaps-trip-meta">
                    {getRouteMetrics().metaStr}
                  </div>
                </div>
                <button
                  className="gmaps-trip-start-btn"
                  onClick={() => {
                    setIsNavigating(true);
                    setNavStepIndex(0);
                    setToast(`Starting in-app navigation to ${directionsEnd || selectedLandmark?.name || 'campus destination'}...`);
                  }}
                >
                  <span>Start Navigation</span>
                  <span style={{ fontSize: 16 }}>➔</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: ABOUT & STUDENT PROFILE */}
        {tab === 'about' && (
          <>
            {aboutSubTab === 'college' ? (
              /* DEDICATED WHOLE-PAGE AU INFO VIEW */
              <div className="au-info-fullpage stack">
                <div className="au-info-topbar">
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ fontSize: 13, padding: '7px 14px', borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setAboutSubTab('posts')}
                  >
                    <span>←</span>
                    <span>Back to Profile</span>
                  </button>
                  <div className="au-info-title-group">
                    <span className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 0 }}>Andhra University</span>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>College of Engineering</h2>
                  </div>
                  <a
                    href="https://andhrauniversity.edu.in"
                    target="_blank"
                    rel="noreferrer"
                    className="secondary-button"
                    style={{ fontSize: 12, padding: '7px 12px', textDecoration: 'none' }}
                  >
                    Official Portal ↗
                  </a>
                </div>

                <div className="card au-info-hero-card">
                  <div className="eyebrow">ESTABLISHED 1926 • AUTONOMOUS SINCE 1946</div>
                  <h1 style={{ margin: '6px 0 10px', fontSize: 22 }}>Andhra University College of Engineering (AUCoE)</h1>
                  <p className="lead" style={{ margin: 0, fontSize: 13.5 }}>
                    One of India's oldest and most prestigious engineering institutions, recognized as a Category-1 University by UGC with NAAC A++ Grade (3.74 / 4.0 CGPA).
                  </p>
                </div>

                {/* University Stat Badges */}
                <div className="college-stats-grid">
                  <div className="college-stat-card">
                    <span className="stat-number">1926</span>
                    <span className="stat-label">Founded</span>
                  </div>
                  <div className="college-stat-card">
                    <span className="stat-number">4,000+</span>
                    <span className="stat-label">Engineering Students</span>
                  </div>
                  <div className="college-stat-card">
                    <span className="stat-number">12+</span>
                    <span className="stat-label">B.Tech / M.Tech Branches</span>
                  </div>
                  <div className="college-stat-card naac-stat-card" style={{ background: 'rgba(198, 155, 69, 0.12)', border: '1px solid rgba(198, 155, 69, 0.3)', borderTop: '3px solid var(--gold)' }}>
                    <span className="stat-number" style={{ color: 'var(--gold)' }}>A++</span>
                    <span className="stat-label" style={{ color: 'var(--gold)' }}>NAAC Grade (3.74 CGPA)</span>
                  </div>
                </div>

                <div className="grid about-grid">
                  {aboutSections.map((item) => (
                    <article className="card about-card" key={item.title}>
                      <div className="about-heading"><span className="about-icon"><ServiceIcon kind={item.icon} size={22} /></span><h2>{item.title}</h2></div>
                      <p className="lead">{item.detail}</p>
                      <a className="about-link" href={item.link} target="_blank" rel="noreferrer">Visit official university site <span aria-hidden="true">↗</span></a>
                    </article>
                  ))}
                </div>

                {/* Campus Helplines & Key Offices */}
                <div className="card" style={{ padding: 20 }}>
                  <h3 style={{ margin: '0 0 14px 0', fontSize: 17, fontWeight: 600, color: 'var(--ink)' }}>Campus Key Contacts & Helplines</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 15, fontWeight: 400, color: 'var(--text-main)', lineHeight: 1.5 }}>
                    <div style={{ wordBreak: 'break-all' }}><strong style={{ fontWeight: 600 }}>Principal Office:</strong> principal.aucoe@andhrauniversity.edu.in</div>
                    <div style={{ wordBreak: 'break-all' }}><strong style={{ fontWeight: 600 }}>Dean Academic Affairs:</strong> dean.academic@andhrauniversity.edu.in</div>
                    <div style={{ wordBreak: 'break-all' }}><strong style={{ fontWeight: 600 }}>Examination Cell:</strong> examcell@andhrauniversity.edu.in</div>
                    <div style={{ wordBreak: 'break-all' }}><strong style={{ fontWeight: 600 }}>Central Library Desk:</strong> library@andhrauniversity.edu.in</div>
                    <div style={{ wordBreak: 'break-all' }}><strong style={{ fontWeight: 600 }}>Hostel Office:</strong> hostels@andhrauniversity.edu.in</div>
                    <div style={{ wordBreak: 'break-all' }}><strong style={{ fontWeight: 600 }}>Emergency Security:</strong> 0891-2844000</div>
                  </div>
                </div>
              </div>
            ) : aboutSubTab === 'admin' && isHeadAccount(authEmail) ? (
              /* DEDICATED WHOLE-PAGE HEAD ADMINISTRATOR CONSOLE (REDIRECT PAGE) */
              <div className="head-admin-fullpage stack" style={{ gap: 18 }}>
                {/* Clean Topbar with Back button */}
                <div className="head-admin-topbar">
                  <button
                    type="button"
                    className="secondary-button"
                    style={{ fontSize: 13, padding: '7px 14px', borderRadius: 9999, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => setAboutSubTab('posts')}
                  >
                    <span>←</span>
                    <span>Back to Profile</span>
                  </button>
                  <div className="head-admin-title-group" style={{ textAlign: 'center' }}>
                    <span className="eyebrow" style={{ color: 'var(--gold)', marginBottom: 0, fontSize: 11 }}>Master Admin</span>
                    <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Head Console</h2>
                  </div>
                  <button
                    type="button"
                    className="primary-button"
                    style={{ fontSize: 12, padding: '7px 14px', borderRadius: 9999, whiteSpace: 'nowrap' }}
                    onClick={() => setShowAddUserModal(true)}
                  >
                    + Add Student
                  </button>
                </div>

                {/* Master Account Hero Banner */}
                <div className="card head-admin-hero-card">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="head-admin-hero-avatar">👑</div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Head Administrator</h1>
                          <span className="head-badge">Master ID</span>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, wordBreak: 'break-all' }}>{HEAD_ACCOUNT_EMAIL}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="primary-button"
                        style={{ fontSize: 12, padding: '7px 14px' }}
                        onClick={() => setShowAddUserModal(true)}
                      >
                        ➕ Add Another One
                      </button>
                      <button
                        type="button"
                        className="danger-button"
                        style={{ fontSize: 12, padding: '7px 14px' }}
                        onClick={handlePurgeAllAccounts}
                        title="Delete all accounts except the Head Account"
                      >
                        🧹 Purge Other Accounts
                      </button>
                    </div>
                  </div>

                  {/* Summary Metrics */}
                  <div className="head-metrics-grid">
                    <div className="head-metric-card">
                      <span className="head-metric-label">Registered Accounts</span>
                      <span className="head-metric-value">{Object.keys(registeredUsersList).length}</span>
                      <span className="head-metric-sub">1 Master ID</span>
                    </div>
                    <div className="head-metric-card">
                      <span className="head-metric-label">Feed Posts</span>
                      <span className="head-metric-value">{feedPosts.length}</span>
                      <span className="head-metric-sub">AU Campus</span>
                    </div>
                    <div className="head-metric-card">
                      <span className="head-metric-label">Activity Log</span>
                      <span className="head-metric-value">{platformActivities.length}</span>
                      <span className="head-metric-sub">Live Events</span>
                    </div>
                  </div>
                </div>

                {/* Section 1: Registered Student Accounts Directory */}
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Registered Student Accounts</h3>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Authorize, view, or remove campus student accounts</span>
                    </div>
                    <button
                      type="button"
                      className="secondary-button"
                      style={{ fontSize: 12, padding: '5px 12px' }}
                      onClick={refreshAdminData}
                    >
                      🔄 Refresh
                    </button>
                  </div>

                  <div className="head-users-list">
                    {Object.values(registeredUsersList).map((user) => {
                      const isThisHead = isHeadAccount(user.email);
                      return (
                        <div key={user.email} className={`head-user-card ${isThisHead ? 'is-head-account' : ''}`}>
                          <div className="head-user-left">
                            <div className="head-user-avatar">
                              {isThisHead ? '👑' : (user.name[0] || 'U').toUpperCase()}
                            </div>
                            <div className="head-user-info">
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                                <strong style={{ color: 'var(--ink)', fontSize: 14 }}>{user.name}</strong>
                                {isThisHead && <span className="head-badge">Head Master</span>}
                                <span className="head-roll-badge">{user.rollNo || 'No Roll'}</span>
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2, wordBreak: 'break-all' }}>{user.email}</div>
                              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>
                                {user.department || 'AU Engineering'} • {user.year || '4th Yr'}
                              </div>
                            </div>
                          </div>
                          <div className="head-user-right">
                            {isThisHead ? (
                              <span className="head-locked-pill">Protected (Head)</span>
                            ) : (
                              <button
                                type="button"
                                className="danger-button-outline"
                                onClick={() => handleDeleteUserAccount(user.email, user.name)}
                              >
                                🗑️ Remove
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Section 2: Everyone's Activity Audit Feed */}
                <div className="card" style={{ padding: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Everyone's Live Activity Stream</h3>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>Real-time audit log of campus actions, logins, and submissions</span>
                    </div>
                    {platformActivities.length > 0 && (
                      <button
                        type="button"
                        className="secondary-button"
                        style={{ fontSize: 12, padding: '5px 12px' }}
                        onClick={() => {
                          if (typeof window !== 'undefined' && window.confirm('Clear all recorded activity history?')) {
                            clearPlatformActivities();
                            refreshAdminData();
                            setToast('Activity history cleared.');
                          }
                        }}
                      >
                        Clear Log
                      </button>
                    )}
                  </div>

                  {platformActivities.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--muted)', fontSize: 13 }}>
                      No platform activities recorded yet. Actions like signups, posts, logins, and applications will appear here in real-time.
                    </div>
                  ) : (
                    <div className="head-activity-list">
                      {platformActivities.map((act) => (
                        <div key={act.id} className="head-activity-item">
                          <div className="head-activity-dot" />
                          <div className="head-activity-content">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                              <strong style={{ fontSize: 13, color: 'var(--ink)' }}>{act.action}</strong>
                              <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                                {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--secondary)', marginTop: 2, wordBreak: 'break-all' }}>{act.actor}</div>
                            {act.details && (
                              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, background: 'var(--hover-subtle)', padding: '4px 8px', borderRadius: 6, wordBreak: 'break-word' }}>
                                {act.details}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* INSTAGRAM-STYLE PROFILE SCREEN (Posts and Saved) */
              <div className="insta-profile-screen">
                {/* 1. TOP USERNAME BAR */}
                <div className="insta-profile-topbar">
                  <div className="insta-topbar-username">
                    <span className="lock-icon" style={{ fontSize: 13 }}>🔒</span>
                    <span>@{studentHandle}</span>
                    <span className="verified-badge" title="Official Student Identity Verified">✓</span>
                  </div>
                  <div className="insta-topbar-actions">
                    <button
                      className="icon-button"
                      onClick={toggleTheme}
                      aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                      {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
                    </button>
                    <button
                      className={`icon-button ${isEditingProfile ? 'active' : ''}`}
                      onClick={() => setIsEditingProfile(!isEditingProfile)}
                      aria-label="Edit Profile & Settings"
                      title="Edit Profile & Settings"
                    >
                      ⚙️
                    </button>
                  </div>
                </div>

                {/* 2. PROFILE HERO (AVATAR + 3 STATS) */}
                <div className="insta-profile-hero">
                  <div className="insta-avatar-wrapper">
                    <div className="insta-avatar-ring">
                      <div className="insta-avatar-circle">
                        {(authName.trim()[0] || authEmail.trim()[0] || 'A').toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div className="insta-stats-row">
                    <button
                      type="button"
                      className="insta-stat-item"
                      onClick={() => setAboutSubTab('posts')}
                    >
                      <span className="insta-stat-number">{myPosts.length}</span>
                      <span className="insta-stat-label">Posts</span>
                    </button>
                    <button
                      type="button"
                      className="insta-stat-item"
                      onClick={() => setAboutSubTab('saved')}
                    >
                      <span className="insta-stat-number">{savedPosts.length}</span>
                      <span className="insta-stat-label">Saved</span>
                    </button>
                    <div className="insta-stat-item">
                      <span className="insta-stat-number">{authYear || '4th Yr'}</span>
                      <span className="insta-stat-label">{authDept.includes('Science') ? 'CSE' : authDept || 'Dept'}</span>
                    </div>
                  </div>
                </div>

                {/* 3. BIO & DETAILS SECTION */}
                <div className="insta-bio-section">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                    <h1 className="insta-bio-fullname" style={{ margin: 0, fontSize: 22, fontWeight: 700, lineHeight: 1.25 }}>{authName || 'AU Student'}</h1>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, fontWeight: 600, color: 'var(--gold)', background: 'rgba(198, 155, 69, 0.12)', padding: '2px 6px', borderRadius: 4 }}>
                      ✓ Verified
                    </span>
                    {isHeadAccount(authEmail) && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#f59e0b', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.35)', padding: '2px 8px', borderRadius: 9999 }}>
                        👑 Head Administrator
                      </span>
                    )}
                  </div>
                  <div className="insta-bio-college" style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>
                    🎓 AU College of Engineering (Autonomous)
                  </div>
                  <div className="profile-identity-stack" style={{ display: 'flex', flexDirection: 'column', gap: 4, margin: '8px 0', fontSize: 13, fontWeight: 400, color: 'var(--muted)', lineHeight: 1.4 }}>
                    <span>Roll: {authRollNo || '325506402371'}</span>
                    <span style={{ wordBreak: 'break-all' }}>{authEmail || 'student@andhrauniversity.edu.in'}</span>
                    <span>{authPhone || '+91 9876543210'}</span>
                  </div>
                  <p className="insta-bio-text">
                    {authBio || 'Engineering Student @ Andhra University. Passionate about technology, projects, and campus collaboration.'}
                  </p>
                  {isHeadAccount(authEmail) && (
                    <div className="head-admin-compact-strip">
                      <div className="head-admin-compact-left">
                        <span style={{ fontSize: 14 }}>👑</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>Head Administrator</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>Master ID: 325506402371</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="head-admin-compact-btn"
                        onClick={() => {
                          refreshAdminData();
                          setAboutSubTab('admin');
                        }}
                      >
                        Open Console →
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. ACTION BUTTONS ROW (Edit Bio, Share, Sign Out) */}
                <div className="insta-profile-actions-row">
                  <button
                    type="button"
                    className="insta-action-button primary"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <span>{isEditingProfile ? '✕ Close Editor' : '✏️ Edit Profile / Bio'}</span>
                  </button>
                  <button
                    type="button"
                    className="insta-action-button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.origin);
                      }
                      setToast('Profile link copied to clipboard!');
                    }}
                  >
                    <span>🔗 Share</span>
                  </button>
                  <button
                    type="button"
                    className="insta-action-button danger"
                    onClick={handleSignOut}
                  >
                    <span>🚪 Sign Out</span>
                  </button>
                </div>

                {/* COLLAPSIBLE EDIT PROFILE / BIO & SETTINGS DRAWER */}
                {isEditingProfile && (
                  <div className="insta-edit-drawer card">
                    <div className="insta-edit-header">
                      <h3>Edit Profile & Bio</h3>
                      <button className="icon-button" onClick={() => setIsEditingProfile(false)}>✕</button>
                    </div>

                    <div className="stack" style={{ gap: 12 }}>
                      <div>
                        <label className="field-label">Full Name</label>
                        <input
                          type="text"
                          className="search"
                          value={authName}
                          onChange={(e) => setAuthName(e.target.value)}
                          placeholder="e.g. P V N Dhanunjay Reddy"
                        />
                      </div>

                      <div>
                        <label className="field-label">Phone Number (authPhone)</label>
                        <input
                          type="tel"
                          className="search"
                          value={authPhone}
                          onChange={(e) => setAuthPhone(e.target.value)}
                          placeholder="+91 9876543210"
                        />
                      </div>

                      <div className="profile-bio-card" style={{ padding: 0, border: 'none', background: 'transparent' }}>
                        <label className="field-label">About Yourself (Bio)</label>
                        <p className="lead" style={{ fontSize: 12, margin: '0 0 6px 0' }}>
                          Add your academic interests, branch clubs, projects, or hostel details.
                        </p>
                        <textarea
                          className="profile-bio-textarea"
                          value={authBio}
                          onChange={(e) => setAuthBio(e.target.value)}
                          placeholder="Write a few lines about yourself..."
                          rows={3}
                        />
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                        <button
                          className="primary-button"
                          style={{ fontSize: 13, padding: '8px 18px' }}
                          onClick={() => {
                            try {
                              const sess = localStorage.getItem('aupro_session');
                              if (sess) {
                                const parsed = JSON.parse(sess);
                                localStorage.setItem('aupro_session', JSON.stringify({ ...parsed, name: authName, phone: authPhone, bio: authBio }));
                              }
                            } catch {}
                            setIsEditingProfile(false);
                            setToast('Bio saved to your profile!');
                          }}
                        >
                          Save Bio
                        </button>
                        <button
                          className="secondary-button"
                          style={{ fontSize: 13, padding: '8px 14px' }}
                          onClick={() => setIsEditingProfile(false)}
                        >
                          Cancel
                        </button>
                      </div>

                      {/* Account Preferences / Settings */}
                      <div className="settings-card" style={{ marginTop: 12, padding: '16px 0 0 0', borderTop: '1px solid var(--border)' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: 14, color: 'var(--ink)' }}>Account Preferences</h4>
                        <div className="settings-row">
                          <div className="settings-info">
                            <strong>Dark Mode Appearance</strong>
                            <span>Switch between collegiate light theme and modern dark mode</span>
                          </div>
                          <button
                            className={`settings-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                            onClick={toggleTheme}
                            aria-label="Toggle dark mode"
                          >
                            <span className="settings-toggle-thumb" />
                          </button>
                        </div>

                        <div className="settings-row">
                          <div className="settings-info">
                            <strong>Official Announcements Push</strong>
                            <span>Receive instant alerts when college notices are published</span>
                          </div>
                          <button
                            className={`settings-toggle-btn ${settingsNotifications ? 'active' : ''}`}
                            onClick={() => setSettingsNotifications(!settingsNotifications)}
                            aria-label="Toggle notifications"
                          >
                            <span className="settings-toggle-thumb" />
                          </button>
                        </div>

                        <div className="settings-row">
                          <div className="settings-info">
                            <strong>Problem Ticket Updates</strong>
                            <span>Get status updates when reported campus issues are inspected</span>
                          </div>
                          <button
                            className={`settings-toggle-btn ${settingsProblemAlerts ? 'active' : ''}`}
                            onClick={() => setSettingsProblemAlerts(!settingsProblemAlerts)}
                            aria-label="Toggle problem alerts"
                          >
                            <span className="settings-toggle-thumb" />
                          </button>
                        </div>

                        <div className="settings-row">
                          <div className="settings-info">
                            <strong>Compact Feed Layout</strong>
                            <span>Display high-density feed items</span>
                          </div>
                          <button
                            className={`settings-toggle-btn ${settingsCompactView ? 'active' : ''}`}
                            onClick={() => setSettingsCompactView(!settingsCompactView)}
                            aria-label="Toggle compact view"
                          >
                            <span className="settings-toggle-thumb" />
                          </button>
                        </div>

                        {/* Master Head Account Admin Controls inside Settings Drawer */}
                        {isHeadAccount(authEmail) && (
                          <div style={{ marginTop: 14, padding: 14, borderRadius: 12, background: 'var(--surface-elevated)', border: '1px solid rgba(212, 168, 87, 0.35)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                              <strong style={{ fontSize: 13, color: 'var(--gold)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                👑 Head Account Master Controls
                              </strong>
                              <span style={{ fontSize: 11, background: 'rgba(212, 168, 87, 0.15)', color: 'var(--gold)', padding: '2px 8px', borderRadius: 9999, fontWeight: 600 }}>
                                Master Admin
                              </span>
                            </div>
                            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 10px 0' }}>
                              Authorized Master: {HEAD_ACCOUNT_EMAIL}. You can add student accounts, delete accounts, or review live activity.
                            </p>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="primary-button"
                                style={{ fontSize: 12, padding: '7px 14px' }}
                                onClick={() => {
                                  setIsEditingProfile(false);
                                  refreshAdminData();
                                  setShowAddUserModal(true);
                                }}
                              >
                                ➕ Add Another One
                              </button>
                              <button
                                type="button"
                                className="secondary-button"
                                style={{ fontSize: 12, padding: '7px 14px' }}
                                onClick={() => {
                                  setIsEditingProfile(false);
                                  refreshAdminData();
                                  setAboutSubTab('admin');
                                }}
                              >
                                👑 Open Head Console
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <button className="signout-button" onClick={handleSignOut} style={{ marginTop: 8 }}>
                        <span>🚪</span>
                        <span>Sign Out of AuPro</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. INSTAGRAM PROFILE SUBTABS: Posts | Saved | AU Info | Head Console */}
                <div className="insta-profile-tabs" role="tablist" aria-label="Profile navigation">
                  <button
                    role="tab"
                    aria-selected={aboutSubTab === 'posts'}
                    className={`insta-tab-btn ${aboutSubTab === 'posts' ? 'active' : ''}`}
                    onClick={() => setAboutSubTab('posts')}
                  >
                    <span className="tab-icon">📸</span>
                    <span className="tab-label">Posts {myPosts.length > 0 ? `(${myPosts.length})` : ''}</span>
                  </button>

                  <button
                    role="tab"
                    aria-selected={aboutSubTab === 'saved'}
                    className={`insta-tab-btn ${aboutSubTab === 'saved' ? 'active' : ''}`}
                    onClick={() => setAboutSubTab('saved')}
                  >
                    <span className="tab-icon">🔖</span>
                    <span className="tab-label">Saved {savedPosts.length > 0 ? `(${savedPosts.length})` : ''}</span>
                  </button>

                  <button
                    role="tab"
                    aria-selected={(aboutSubTab as string) === 'college'}
                    className={`insta-tab-btn ${(aboutSubTab as string) === 'college' ? 'active' : ''}`}
                    onClick={() => setAboutSubTab('college')}
                  >
                    <span className="tab-icon">🏛️</span>
                    <span className="tab-label">AU Info</span>
                  </button>

                  {isHeadAccount(authEmail) && (
                    <button
                      role="tab"
                      aria-selected={aboutSubTab === 'admin'}
                      className={`insta-tab-btn ${aboutSubTab === 'admin' ? 'active' : ''}`}
                      style={{ color: aboutSubTab === 'admin' ? 'var(--gold)' : undefined, borderTopColor: aboutSubTab === 'admin' ? 'var(--gold)' : undefined }}
                      onClick={() => {
                        refreshAdminData();
                        setAboutSubTab('admin');
                      }}
                      title="Open Head Administrator Console"
                    >
                      <span className="tab-icon">👑</span>
                      <span className="tab-label">Console</span>
                    </button>
                  )}
                </div>

                {/* 6. "DOWN YOUR POSTS" / TAB CONTENT */}
                {/* SUBTAB 1: USER'S PUBLISHED POSTS (DOWN YOUR POSTS) */}
                {aboutSubTab === 'posts' && (
                  <div className="insta-down-posts-container">
                    <div className="insta-down-posts-header">
                      <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 2 }}>Down Your Posts</div>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Your Published Posts</h2>
                      <p className="lead" style={{ margin: '2px 0 0', fontSize: 12 }}>Tap the ••• icon on any post to delete or share</p>
                    </div>

                    {myPosts.length === 0 ? (
                      <div className="profile-feed-empty card">
                        <div style={{ fontSize: 36, marginBottom: 10 }}>📝</div>
                        <h3>No Posts Published Yet</h3>
                        <p className="lead">You haven't posted anything to the campus feed yet. Share updates, questions, or report campus issues.</p>
                        <button
                          className="primary-button"
                          style={{ fontSize: 13, padding: '8px 18px', margin: '0 auto' }}
                          onClick={() => setShowThreadsComposer(true)}
                        >
                          Create Your First Post
                        </button>
                      </div>
                    ) : (
                      myPosts.map((post) => (
                        <div key={post.id} className="profile-post-wrapper">
                          <MomentCard
                            post={post}
                            onToast={setToast}
                            isSaved={savedPostIds.includes(post.id)}
                            onSaveToggle={handleSaveToggle}
                            isOwner={true}
                            onDelete={handleDeletePost}
                          />
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* SUBTAB 2: SAVED BOOKMARKS */}
                {aboutSubTab === 'saved' && (
                  <div className="insta-down-posts-container">
                    <div className="insta-down-posts-header">
                      <div className="eyebrow" style={{ color: 'var(--primary)', marginBottom: 2 }}>Bookmarks</div>
                      <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--ink)' }}>Saved Posts</h2>
                      <p className="lead" style={{ margin: '2px 0 0', fontSize: 12 }}>Posts, circulars, and notices bookmarked for quick access</p>
                    </div>

                    {savedPosts.length === 0 ? (
                      <div className="profile-feed-empty card">
                        <div style={{ fontSize: 36, marginBottom: 10 }}>★</div>
                        <h3>No Saved Posts</h3>
                        <p className="lead">Tap the bookmark ribbon icon on any post in the feed to save it here for reference.</p>
                        <button
                          className="secondary-button"
                          style={{ fontSize: 13, padding: '8px 18px', margin: '0 auto' }}
                          onClick={() => setTab('feed')}
                        >
                          Browse Campus Feed
                        </button>
                      </div>
                    ) : (
                      savedPosts.map((post) => (
                        <div key={post.id} className="profile-post-wrapper">
                          <div className="post-action-banner">
                            <button
                              type="button"
                              className="unsave-btn"
                              onClick={() => handleSaveToggle(post.id)}
                              title="Remove bookmark"
                            >
                              ✕ Remove from Saved
                            </button>
                          </div>
                          <MomentCard
                            post={post}
                            onToast={setToast}
                            isSaved={true}
                            onSaveToggle={handleSaveToggle}
                            isOwner={
                              (post.authorEmail && post.authorEmail === authEmail) ||
                              post.username === authUsername ||
                              post.username === (authName ? authName.toLowerCase().replace(/\s+/g, '_') : '') ||
                              post.username === 'you'
                            }
                            onDelete={handleDeletePost}
                          />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </section>

      {/* Bottom Navigation: Exactly as requested */}
      {/* 
        - Applications
        - Big Plus button: PROMINENTLY UNDERLINED with clear underline bar, no "Create" text!
        - Feed: Instagram Home icon
        - Chatbot: AI assistant
        - Location: Instagram Map Pin
        - About: Darkened icon
      */}
      <nav className={`bottom-nav ${!isNavVisible ? 'nav-hidden' : ''}`} aria-label="Primary navigation">
        <button className={`nav-button ${tab === 'applications' ? 'active' : ''}`} onClick={() => { setTab('applications'); setQuery(''); }} aria-label="Applications">
          <ApplicationsIcon active={tab === 'applications'} size={24} />
          <span>Applications</span>
        </button>

        {/* Big Plus button with CLEAR PROMINENT UNDERLINE */}
        <button
          className="nav-button create-action"
          onClick={() => {
            setThreadsInitialKind('problem');
            setShowThreadsComposer(true);
          }}
          aria-label="Add new post"
          title="Add new post"
        >
          <div className="big-plus-bubble">
            <BigPlusIcon size={24} />
          </div>
          <div className="plus-underline-bar" />
        </button>

        <button className={`nav-button ${tab === 'feed' ? 'active' : ''}`} onClick={() => setTab('feed')} aria-label="Feed">
          <InstagramFeedIcon active={tab === 'feed'} size={24} />
          <span>Feed</span>
        </button>

        <button className={`nav-button ${tab === 'chatbot' ? 'active' : ''}`} onClick={() => setTab('chatbot')} aria-label="Chatbot">
          <ChatbotIcon active={tab === 'chatbot'} size={24} />
          <span>Chatbot</span>
        </button>

        <button className={`nav-button ${tab === 'location' ? 'active' : ''}`} onClick={() => setTab('location')} aria-label="Location">
          <InstagramLocationIcon size={22} />
          <span>Location</span>
        </button>

        <button className={`nav-button ${tab === 'about' ? 'active' : ''}`} onClick={() => setTab('about')} aria-label="Profile">
          <InstagramProfileIcon active={tab === 'about'} size={24} />
          <span>Profile</span>
        </button>
      </nav>

      {showThreadsComposer && (
        <ThreadsComposer
          initialKind={threadsInitialKind}
          userName={authName || 'AU Student'}
          userHandle={studentHandle}
          userEmail={authEmail}
          onClose={() => setShowThreadsComposer(false)}
          onSubmit={handleThreadsPost}
        />
      )}

      {/* HEAD ADMINISTRATOR: ADD ANOTHER STUDENT ACCOUNT MODAL */}
      {showAddUserModal && (
        <div className="insta-modal-backdrop" onClick={() => setShowAddUserModal(false)}>
          <div className="insta-modal-sheet head-modal-sheet" style={{ maxWidth: 460, padding: 22 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 22 }}>👑</span>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>Add Another Student Account</h3>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>Authorize a student under Andhra University</span>
                </div>
              </div>
              <button className="icon-button" onClick={() => setShowAddUserModal(false)} aria-label="Close dialog">✕</button>
            </div>

            {addUserError && (
              <div className="auth-error-banner" style={{ marginBottom: 12, padding: '8px 12px', fontSize: 12 }}>
                {addUserError}
              </div>
            )}

            <form onSubmit={handleAddStudentAccount} className="stack" style={{ gap: 12 }}>
              <div>
                <label className="field-label" style={{ fontSize: 12 }}>Student Full Name *</label>
                <input
                  type="text"
                  className="search"
                  placeholder="e.g. Ramesh Kumar"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="field-label" style={{ fontSize: 12 }}>University Email *</label>
                <input
                  type="email"
                  className="search"
                  placeholder="rollno@andhrauniversity.edu.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div>
                  <label className="field-label" style={{ fontSize: 12 }}>Roll Number</label>
                  <input
                    type="text"
                    className="search"
                    placeholder="e.g. 325506402375"
                    value={newUserRoll}
                    onChange={(e) => setNewUserRoll(e.target.value)}
                  />
                </div>
                <div>
                  <label className="field-label" style={{ fontSize: 12 }}>Year</label>
                  <select
                    className="search"
                    value={newUserYear}
                    onChange={(e) => setNewUserYear(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: 13 }}
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="field-label" style={{ fontSize: 12 }}>Department</label>
                <select
                  className="search"
                  value={newUserDept}
                  onChange={(e) => setNewUserDept(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: 13 }}
                >
                  <option value="Computer Science & Systems Engineering">CSE</option>
                  <option value="Electronics & Communication Engineering">ECE</option>
                  <option value="Mechanical Engineering">Mechanical</option>
                  <option value="Civil Engineering">Civil</option>
                  <option value="Electrical & Electronics Engineering">EEE</option>
                  <option value="Chemical Engineering">Chemical</option>
                  <option value="Marine Engineering">Marine</option>
                  <option value="Information Technology">IT</option>
                </select>
              </div>

              <div>
                <label className="field-label" style={{ fontSize: 12 }}>Initial Password *</label>
                <input
                  type="password"
                  className="search"
                  placeholder="Minimum 6 characters"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button type="submit" className="primary-button" style={{ flex: 1 }}>
                  Create Student Account
                </button>
                <button type="button" className="secondary-button" onClick={() => setShowAddUserModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
