'use client';

import React, { useEffect, useState } from 'react';
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
  BigPlusIcon,
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
} from './auth';
import { auVectorDB } from './vector_search';
import { validateTextContent, validateImageSafety } from './content_moderation';

type Tab = 'applications' | 'create' | 'feed' | 'chatbot' | 'location' | 'about';
type AuthMode = 'landing' | 'email-login' | 'signup' | 'otp';
type FeedFilter = 'problems' | 'normal' | 'announcements';

interface CampusLandmark {
  id: string;
  name: string;
  category: string;
  code: string;
  query: string;
  description: string;
  timings: string;
  ext: string;
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
  },
];

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
  const [threadsInitialKind, setThreadsInitialKind] = useState<'announcement' | 'problem'>('announcement');

  const [tab, setTab] = useState<Tab>('feed');
  const [signedIn, setSignedIn] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authUsername, setAuthUsername] = useState('dhanunjay_au');
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
  const [authOtpCountdown, setAuthOtpCountdown] = useState(0);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dark Mode Theme State ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
  const [mapCategory, setMapCategory] = useState<'all' | 'departments' | 'admin' | 'library' | 'hostels' | 'canteen' | 'gates'>('all');
  const [showPlaceSheet, setShowPlaceSheet] = useState(true);
  const [showDirections, setShowDirections] = useState(false);
  const [directionsStart, setDirectionsStart] = useState('Your location');
  const [directionsEnd, setDirectionsEnd] = useState('AU College of Engineering (Main & Admin Block)');
  const [transportMode, setTransportMode] = useState<'w' | 'm' | 'd' | 'r'>('w');

  // GPS & Live Geolocation Auto-Tracking State
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [isGpsTracking, setIsGpsTracking] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  // About tab sub-navigation & settings
  const [aboutSubTab, setAboutSubTab] = useState<'profile' | 'college'>('profile');
  const [settingsNotifications, setSettingsNotifications] = useState(true);
  const [settingsProblemAlerts, setSettingsProblemAlerts] = useState(true);
  const [settingsCompactView, setSettingsCompactView] = useState(false);

  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [feedFilter, setFeedFilter] = useState<FeedFilter>('normal');
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
        setMapLocationQuery(`${latitude},${longitude}`);
        setDirectionsStart('Your location');
        setToast(`📍 GPS Locked: ${latitude.toFixed(4)}°N, ${longitude.toFixed(4)}°E (±${Math.round(accuracy)}m)`);
      },
      (err) => {
        setIsLocating(false);
        setGpsError(err.message);
        setToast(`GPS notice: ${err.message}. Showing campus map.`);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 3000 }
    );
  };

  const handleAskBot = (questionText: string) => {
    const q = questionText.trim();
    if (!q) return;

    // Semantic Vector Database Query
    const vectorMatches = auVectorDB.query(q, 3);
    const topMatch = vectorMatches[0];

    let response = 'I have noted your query for Andhra University College of Engineering administration. If you require immediate in-person help, visit Room 102 in the Main Administration Block or tap "Forward to WhatsApp" below.';
    let matchTag = '';

    if (topMatch && topMatch.confidencePercent >= 25) {
      response = topMatch.entry.answer;
      matchTag = `⚡ Vector Match: ${topMatch.confidencePercent}% confidence (${topMatch.entry.category})`;
    }

    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: q, time: 'Just now' },
      { role: 'assistant', text: matchTag ? `${response}\n\n${matchTag}` : response, time: 'Just now' },
    ]);
    setChatInput('');
    setChatStatus('Answer retrieved from Vector Search.');
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

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(query.toLowerCase())
  );

  const filteredLandmarks = campusLandmarks.filter((loc) => {
    if (!mapSearchInput.trim()) return true;
    const s = mapSearchInput.toLowerCase();
    return (
      loc.name.toLowerCase().includes(s) ||
      loc.category.toLowerCase().includes(s) ||
      loc.code.toLowerCase().includes(s)
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

  const handleThreadsPost = (data: ThreadsPostData) => {
    // Content Moderation check
    const textCheck = validateTextContent(`${data.caption} ${data.title || ''} ${data.location}`);
    if (!textCheck.isValid) {
      setToast(textCheck.reason || 'Post blocked: Inappropriate language detected.');
      return;
    }

    const newPost: MomentPost = {
      id: `${Date.now()}`,
      username: data.isAnonymous ? 'anonymous.au' : (authName ? authName.toLowerCase().replace(/\s+/g, '_') : 'au.student'),
      avatarText: data.isAnonymous ? '?' : (authName[0] || 'A').toUpperCase(),
      isOfficial: data.category === 'announcement',
      category: data.category,
      location: data.location,
      imageUrl: data.imageUrl,
      imageCaption: data.title || (data.category === 'problem' ? 'Problem Report' : 'Official Notice'),
      likesCount: 1,
      repostsCount: 0,
      caption: data.caption,
      commentsCount: 0,
      comments: [],
      timeAgo: 'JUST NOW',
      durationDays: 30,
    };

    setFeedPosts((posts) => [newPost, ...posts]);
    setFeedFilter(data.category === 'problem' ? 'problems' : data.category === 'announcement' ? 'announcements' : 'normal');
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

    // 2. Automated Bad Words & Profanity Filter
    const textCheck = validateTextContent(`${createTitle} ${createCaption} ${createLocation}`);
    if (!textCheck.isValid) {
      setCreateError(textCheck.reason || 'Post blocked: Inappropriate language detected.');
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
            <div className="eyebrow" style={{ color: '#701d32', marginBottom: 6 }}>Andhra University</div>
            <h1 style={{ fontSize: 32, marginBottom: 12 }}>Welcome to AuPro</h1>
            <p className="lead" style={{ fontSize: 14, marginBottom: 22 }}>
              Campus updates, verified applications, student problems, and the engineering campus map.
            </p>

            {authError && (
              <div style={{ background: '#fee2e2', border: '1px solid #fecaca', color: '#991b1b', padding: '10px 14px', borderRadius: 10, fontSize: 12, marginBottom: 16 }}>
                {authError}
              </div>
            )}

            {authMode === 'landing' && (
              <div className="stack">
                <button className="google-button" onClick={handleGoogleSignIn}>
                  <span className="google-mark">G</span> Continue with Google
                </button>

                <div className="auth-divider"><span>or with university credentials</span></div>
                <div className="auth-actions">
                  <button className="secondary-button" onClick={() => { setAuthError(''); setAuthMode('email-login'); }}>Log in with email</button>
                  <button className="secondary-button" onClick={() => { setAuthError(''); setAuthMode('signup'); }}>Create student account</button>
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
                  setAuthOtpCountdown(60);
                  setAuthOtp('');
                  setAuthMode('otp');
                  setToast(`Verification code sent to ${clean}`);
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

                {authOtpDevCode && (
                  <div style={{ textAlign: 'center', margin: '2px 0 6px 0' }}>
                    <span style={{ fontSize: 11, color: 'var(--muted)', background: 'var(--hover-subtle)', border: '1px solid var(--border)', padding: '4px 10px', borderRadius: 8, fontFamily: 'monospace' }}>
                      Test code: <strong style={{ color: 'var(--primary)', letterSpacing: 2 }}>{authOtpDevCode}</strong>
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
                        setAuthOtpCountdown(60);
                        setToast(`New verification code sent to ${authEmail}`);
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
                <span>@{authUsername || 'au.student'}</span>
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

        {/* CREATE POST MODAL: ONLY "Announcement Post" and "Problem" */}
        {showCreateMenu && (
          <div className="create-menu-backdrop" role="presentation" onClick={() => setShowCreateMenu(false)}>
            <section className="create-menu" role="dialog" aria-modal="true" aria-labelledby="create-menu-title" onClick={(event) => event.stopPropagation()}>
              <div className="create-menu-header">
                <div>
                  <div className="eyebrow">AuPro</div>
                  <h2 id="create-menu-title">Select Post Type</h2>
                </div>
                <button className="icon-button" aria-label="Close menu" onClick={() => setShowCreateMenu(false)}>×</button>
              </div>
              <button
                className="create-menu-option"
                style={{ opacity: 0.65 }}
                onClick={() => {
                  setToast('Official Announcement posting is temporarily locked by administration.');
                }}
              >
                <strong>🔒 Announcement Post (Blocked)</strong>
                <span>Official circulars are temporarily restricted to university admin.</span>
              </button>
              <button
                className="create-menu-option"
                onClick={() => { setCreateKind('problem'); setShowCreateMenu(false); setTab('create'); }}
              >
                <strong>⚠️ Report Campus Problem</strong>
                <span>Report an infrastructure, lab, classroom, or hostel issue directly to administration.</span>
              </button>
            </section>
          </div>
        )}

        {/* TAB 1: FEED / MOMENTS */}
        {tab === 'feed' && (
          <div className="insta-feed-container">
            {/* Small Navigation Bar with Problems, Normal Posts, and Announcements */}
            <div className="feed-category-bar" role="tablist" aria-label="Feed filter">
              <button
                role="tab"
                aria-selected={feedFilter === 'problems'}
                className={`feed-category-btn ${feedFilter === 'problems' ? 'active' : ''}`}
                onClick={() => setFeedFilter('problems')}
              >
                Problems
              </button>
              <button
                role="tab"
                aria-selected={feedFilter === 'normal'}
                className={`feed-category-btn ${feedFilter === 'normal' ? 'active' : ''}`}
                onClick={() => setFeedFilter('normal')}
              >
                Normal Posts
              </button>
              <button
                role="tab"
                aria-selected={feedFilter === 'announcements'}
                className={`feed-category-btn ${feedFilter === 'announcements' ? 'active' : ''}`}
                onClick={() => setFeedFilter('announcements')}
              >
                Announcements
              </button>
            </div>

            {filteredFeedPosts.map((post) => (
              <MomentCard key={post.id} post={post} onToast={setToast} />
            ))}

            {filteredFeedPosts.length === 0 ? (
              <div className="card feed-empty-card">
                <div style={{ fontSize: 32, marginBottom: 10 }}>
                  {feedFilter === 'problems' ? '⚠️' : feedFilter === 'announcements' ? '📢' : '📝'}
                </div>
                <h3>
                  {feedFilter === 'problems' ? 'No Active Problems Reported' : feedFilter === 'announcements' ? 'No Official Announcements Yet' : 'No Posts in Feed Yet'}
                </h3>
                <p className="lead" style={{ fontSize: 13, margin: '0 0 16px 0' }}>
                  {feedFilter === 'problems'
                    ? 'Have an issue with lab equipment, classrooms, or hostel facilities? Tap the + button to report it to administration.'
                    : feedFilter === 'announcements'
                    ? 'Department circulars and university notices published by authorized administration will appear here.'
                    : 'Be the first to share an academic update, tech project, or question with fellow AU students.'}
                </p>
                <button
                  className="primary-button"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, margin: '0 auto', fontSize: 13 }}
                  onClick={() => {
                    setThreadsInitialKind(feedFilter === 'problems' ? 'problem' : 'announcement');
                    setShowThreadsComposer(true);
                  }}
                >
                  <span>Create {feedFilter === 'problems' ? 'Problem Report' : feedFilter === 'announcements' ? 'Announcement' : 'Post'}</span>
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
                        <label className="field-label" style={{ fontSize: 12 }}>Applicant Full Name</label>
                        <input className="search" value={authName || 'Student Name'} readOnly style={{ background: '#f8fafc' }} />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 12 }}>Roll / Registration Number</label>
                        <input className="search" value={authRollNo || '321101234'} readOnly style={{ background: '#f8fafc' }} />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 12 }}>Department & Branch</label>
                        <input className="search" value={authDept} readOnly style={{ background: '#f8fafc' }} />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 12 }}>Year of Study</label>
                        <input className="search" value={authYear} readOnly style={{ background: '#f8fafc' }} />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 12 }}>University College Email</label>
                        <input className="search" value={authEmail} readOnly style={{ background: '#f8fafc' }} />
                      </div>
                      <div>
                        <label className="field-label" style={{ fontSize: 12 }}>Contact Phone</label>
                        <input className="search" value={authPhone || '+91 9876543210'} readOnly style={{ background: '#f8fafc' }} />
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
                <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10, padding: 14, color: '#991b1b', fontSize: 13, lineHeight: 1.5, marginBottom: 8 }}>
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
              {chatStatus && <div className="feedback-banner" role="status">{chatStatus}</div>}
            </div>
          </div>
        )}

        {/* TAB 5: CAMPUS MAP / LOCATION (Authentic Google Maps Edge-to-Edge Experience) */}
        {tab === 'location' && (
          <div className={`gmaps-container maps-environment-wrapper ${isMapFullscreen ? 'fullscreen' : ''}`}>
            {/* The Google Maps Embedded Background Canvas */}
            <iframe
              className="gmaps-iframe"
              title="Google Maps Andhra University"
              src={
                showDirections
                  ? `https://www.google.com/maps?saddr=${encodeURIComponent(
                      directionsStart === 'Your location' && userCoords
                        ? `${userCoords.lat},${userCoords.lng}`
                        : directionsStart === 'Your location'
                        ? 'Andhra University Visakhapatnam'
                        : directionsStart
                    )}&daddr=${encodeURIComponent(directionsEnd || selectedLandmark?.query || 'AU College of Engineering')}&dirflg=${transportMode === 'm' ? 'w' : transportMode}&output=embed`
                  : `https://www.google.com/maps?q=${encodeURIComponent(mapLocationQuery)}&t=${mapLayer}&z=17&output=embed`
              }
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

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
                      placeholder="Search here"
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
                        ×
                      </button>
                    )}
                    <div className="gmaps-search-divider" />
                    <button
                      className="gmaps-directions-btn"
                      title="Directions"
                      aria-label="Directions"
                      onClick={() => {
                        setShowDirections(true);
                        setShowPlaceSheet(false);
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
                              setShowPlaceSheet(true);
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
                            No matching AU landmark. Press Enter to search on Map.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Google Maps Category Filter Chips */}
                  <div className="gmaps-chips-scroll">
                    {[
                      { id: 'all', label: 'All Places' },
                      { id: 'departments', label: '🏢 Departments' },
                      { id: 'admin', label: '🏛️ Administration' },
                      { id: 'library', label: '📚 Library' },
                      { id: 'hostels', label: '🛏️ Hostels' },
                      { id: 'canteen', label: '🍽️ Canteen' },
                      { id: 'gates', label: '🚪 Campus Gates' },
                    ].map((chip) => (
                      <button
                        key={chip.id}
                        className={`gmaps-chip ${mapCategory === chip.id ? 'active' : ''}`}
                        onClick={() => {
                          setMapCategory(chip.id as any);
                          const target = campusLandmarks.find((l) => {
                            if (chip.id === 'all') return true;
                            if (chip.id === 'departments') return l.category === 'Department';
                            if (chip.id === 'admin') return l.category === 'Administration';
                            if (chip.id === 'library') return l.category === 'Library';
                            if (chip.id === 'hostels') return l.category === 'Hostel';
                            if (chip.id === 'canteen') return l.category === 'Amenities';
                            if (chip.id === 'gates') return l.category === 'Campus Gate';
                            return true;
                          });
                          if (target) {
                            setSelectedLandmark(target);
                            setMapLocationQuery(target.query);
                            setShowPlaceSheet(true);
                          }
                        }}
                      >
                        {chip.label}
                      </button>
                    ))}
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
                      'AU Main Gate',
                      'Siripuram Junction',
                      'Sivaji Hostel',
                      'RTC Complex',
                    ].map((preset) => (
                      <button
                        key={preset}
                        className={`gmaps-preset-pill ${directionsStart === preset ? 'active' : ''}`}
                        onClick={() => {
                          setDirectionsStart(preset);
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
                </div>
              )}
            </div>

            {/* Floating Action Buttons (Right side: Layers, GPS, Fullscreen) */}
            <div className="gmaps-fab-column">
              <button
                className="gmaps-fab-btn"
                title={mapLayer === 'm' ? 'Switch to Satellite View' : 'Switch to Street Map'}
                onClick={() => setMapLayer((prev) => (prev === 'm' ? 'k' : 'm'))}
              >
                <LayersIcon size={20} />
              </button>
              <button
                className={`gmaps-fab-btn ${isGpsTracking ? 'gps-active' : ''}`}
                title={isGpsTracking ? "GPS Auto-Tracking Active • Tap to center" : "Acquire Live GPS Location"}
                onClick={handleLocateMe}
                aria-label="Auto-track location via GPS"
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

            {/* Google Maps Bottom Place Sheet (When landmark selected and directions not active) */}
            {showPlaceSheet && selectedLandmark && !showDirections && (
              <div className="gmaps-place-sheet">
                <div className="gmaps-sheet-header">
                  <div>
                    <h3>{selectedLandmark.name}</h3>
                    <div className="gmaps-sheet-rating">
                      <strong>★ 4.7</strong>
                      <span>(1,420) • {selectedLandmark.category} • {selectedLandmark.code}</span>
                    </div>
                  </div>
                  <button
                    className="gmaps-sheet-close"
                    onClick={() => setShowPlaceSheet(false)}
                    aria-label="Close"
                  >
                    ✕
                  </button>
                </div>

                {/* Google Maps Action Pills */}
                <div className="gmaps-sheet-actions">
                  <button
                    className="gmaps-action-pill primary"
                    onClick={() => {
                      setShowDirections(true);
                      setDirectionsEnd(selectedLandmark.name);
                    }}
                  >
                    <DirectionsDiamondIcon size={16} />
                    <span>Directions</span>
                  </button>
                  <button
                    className="gmaps-action-pill"
                    onClick={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(selectedLandmark.query);
                        setToast('Copied campus landmark location!');
                      }
                    }}
                  >
                    <span>📋</span>
                    <span>Copy Info</span>
                  </button>
                  <button
                    className="gmaps-action-pill"
                    onClick={() => setIsMapFullscreen((prev) => !prev)}
                  >
                    <span>⛶</span>
                    <span>{isMapFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
                  </button>
                </div>

                {/* Place Details */}
                <div className="gmaps-sheet-details">
                  <div className="gmaps-sheet-detail-row">
                    <span>📍</span>
                    <span>Andhra University College of Engineering, Visakhapatnam, Andhra Pradesh 530003</span>
                  </div>
                  <div className="gmaps-sheet-detail-row">
                    <span>🕒</span>
                    <span>Open • {selectedLandmark.timings}</span>
                  </div>
                  <div className="gmaps-sheet-detail-row">
                    <span>ℹ️</span>
                    <span>{selectedLandmark.description} ({selectedLandmark.ext})</span>
                  </div>
                </div>
              </div>
            )}

            {/* Directions Trip Summary Bottom Sheet */}
            {showDirections && (
              <div className="gmaps-trip-sheet">
                <div>
                  <div className="gmaps-trip-time">
                    {transportMode === 'w' ? '4 min' : transportMode === 'm' ? '2 min' : transportMode === 'd' ? '3 min' : '5 min'}
                  </div>
                  <div className="gmaps-trip-meta">
                    {transportMode === 'w' ? '350 m • via AU North Campus Ave' : 'Fastest route inside AU campus'}
                  </div>
                </div>
                <button
                  className="gmaps-trip-start-btn"
                  onClick={() => {
                    const originParam = directionsStart === 'Your location' && userCoords
                      ? `${userCoords.lat},${userCoords.lng}`
                      : encodeURIComponent(directionsStart === 'Your location' ? 'Andhra University Visakhapatnam' : directionsStart);
                    const mapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originParam}&destination=${encodeURIComponent(directionsEnd)}&travelmode=${transportMode === 'w' ? 'walking' : transportMode === 'd' ? 'driving' : 'transit'}`;
                    window.open(mapsUrl, '_blank');
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
          <div className="stack">
            {/* Top Subtab switcher */}
            <div className="about-subtab-bar" role="tablist">
              <button
                role="tab"
                aria-selected={aboutSubTab === 'profile'}
                className={`about-subtab-btn ${aboutSubTab === 'profile' ? 'active' : ''}`}
                onClick={() => setAboutSubTab('profile')}
              >
                <span>👤</span>
                <span>My Profile & Settings</span>
              </button>
              <button
                role="tab"
                aria-selected={aboutSubTab === 'college'}
                className={`about-subtab-btn ${aboutSubTab === 'college' ? 'active' : ''}`}
                onClick={() => setAboutSubTab('college')}
              >
                <span>🏛️</span>
                <span>AU College Info</span>
              </button>
            </div>

            {aboutSubTab === 'profile' && (
              <div className="stack">
                {/* Profile Identity Card */}
                <div className="profile-card">
                  <div className="profile-header-wrap">
                    <div className="profile-avatar-lg">
                      {(authName.trim()[0] || authEmail.trim()[0] || 'A').toUpperCase()}
                    </div>
                    <div className="profile-title-group">
                      <h2>{authName || 'AU Student'}</h2>
                      <div className="profile-username">@{authUsername || 'au.student'}</div>
                      <div className="profile-email-badge">
                        <span>✉️</span>
                        <span>{authEmail || 'student@andhrauniversity.edu.in'}</span>
                      </div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                        <span>✓</span>
                        <span>Official Student Identity Verified</span>
                      </div>
                    </div>
                  </div>

                  <div className="profile-details-grid">
                    <div className="profile-field-box">
                      <div className="field-label">Roll Number</div>
                      <div className="field-value">{authRollNo || '321101234'}</div>
                    </div>
                    <div className="profile-field-box">
                      <div className="field-label">Department</div>
                      <div className="field-value">{authDept}</div>
                    </div>
                    <div className="profile-field-box">
                      <div className="field-label">Year of Study</div>
                      <div className="field-value">{authYear}</div>
                    </div>
                    <div className="profile-field-box">
                      <div className="field-label">Phone Number</div>
                      <div className="field-value">{authPhone || '+91 9876543210'}</div>
                    </div>
                  </div>

                  {/* ABOUT YOURSELF (BIO) */}
                  <div className="profile-bio-card">
                    <h3>About Yourself (Bio)</h3>
                    <p className="lead" style={{ fontSize: 12, margin: '0 0 8px 0' }}>
                      Add your academic interests, branch clubs, projects, or hostel details.
                    </p>
                    <textarea
                      className="profile-bio-textarea"
                      value={authBio}
                      onChange={(e) => setAuthBio(e.target.value)}
                      placeholder="Write a few lines about yourself..."
                      rows={3}
                    />
                    <button
                      className="primary-button"
                      style={{ fontSize: 13, padding: '8px 16px' }}
                      onClick={() => setToast('Bio saved to your profile!')}
                    >
                      Save Bio
                    </button>
                  </div>

                  {/* SETTINGS CARD */}
                  <div className="settings-card">
                    <h3>Account Preferences</h3>
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
                  </div>

                  {/* SIGN OUT BUTTON */}
                  <button className="signout-button" onClick={handleSignOut}>
                    <span>🚪</span>
                    <span>Sign Out of AuPro</span>
                  </button>
                </div>
              </div>
            )}

            {aboutSubTab === 'college' && (
              <div className="stack">
                <div>
                  <div className="eyebrow">Andhra University</div>
                  <h1>About Andhra University</h1>
                  <p className="lead">Andhra University, established in 1926. College of Engineering, established in 1946.</p>
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
                  <div className="college-stat-card">
                    <span className="stat-number">A++</span>
                    <span className="stat-label">NAAC Grade (3.74 CGPA)</span>
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
              </div>
            )}
          </div>
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
      <nav className="bottom-nav" aria-label="Primary navigation">
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

        <button className={`nav-button ${tab === 'about' ? 'active' : ''}`} onClick={() => setTab('about')} aria-label="About">
          <DarkenedAboutIcon active={tab === 'about'} size={22} />
          <span>About</span>
        </button>
      </nav>

      {showThreadsComposer && (
        <ThreadsComposer
          initialKind={threadsInitialKind}
          userName={authName || 'AU Student'}
          userHandle={authName ? authName.toLowerCase().replace(/\s+/g, '_') : 'au.student'}
          userEmail={authEmail}
          onClose={() => setShowThreadsComposer(false)}
          onSubmit={handleThreadsPost}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
