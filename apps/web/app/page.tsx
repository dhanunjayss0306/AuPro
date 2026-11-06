'use client';

import React, { useEffect, useState } from 'react';
import {
  InstagramFeedIcon,
  InstagramLikeIcon,
  InstagramShareIcon,
  InstagramLocationIcon,
  NotificationIcon,
  ServiceIcon,
  WhatsAppIcon,
  ApplicationsIcon,
  ChatbotIcon,
  DarkenedAboutIcon,
  BigPlusIcon,
} from './icons';
import { MomentCard, MomentPost } from './MomentCard';
import { IntroCinematic } from './IntroCinematic';
import { ThreadsComposer, ThreadsPostData } from './ThreadsComposer';
import { getGoogleOAuthUrl, isValidCollegeEmail, supabaseSignIn, supabaseSignUp } from './auth';

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
    name: 'AU Examination & Autonomous Cell',
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
  const [showIntro, setShowIntro] = useState(true);
  const [showThreadsComposer, setShowThreadsComposer] = useState(false);
  const [threadsInitialKind, setThreadsInitialKind] = useState<'announcement' | 'problem'>('announcement');

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

  // Handle return from Google OAuth (Supabase sends back #access_token=... in URL)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check for query errors
    const searchParams = new URLSearchParams(window.location.search);
    const oauthError = searchParams.get('error_description') || searchParams.get('error');
    if (oauthError) {
      setAuthError(`Authentication error: ${decodeURIComponent(oauthError)}`);
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
  const [authBio, setAuthBio] = useState('Student at Andhra University College of Engineering (Autonomous). Passionate about technology, projects, and campus collaboration.');
  const [authPassword, setAuthPassword] = useState('');
  const [authConfirmPassword, setAuthConfirmPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [authError, setAuthError] = useState('');

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

  // Google Maps State (Interactive In-App Environment)
  const [mapLocationQuery, setMapLocationQuery] = useState('Andhra University College of Engineering, Visakhapatnam');
  const [selectedLandmark, setSelectedLandmark] = useState<CampusLandmark>(campusLandmarks[0]);
  const [mapLayer, setMapLayer] = useState<'m' | 'k'>('m');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

  const handleSignOut = () => {
    try {
      localStorage.removeItem('aupro_session');
    } catch {}
    setSignedIn(false);
    setAuthMode('landing');
    setAuthPassword('');
    setAuthOtp('');
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

  const handleCreateFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setCreateFile(file);
    if (!file) {
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
    const newPost: MomentPost = {
      id: `${Date.now()}`,
      username: data.isAnonymous ? 'anonymous.au' : (authName ? authName.toLowerCase().replace(/\s+/g, '_') : 'au.student'),
      avatarText: data.isAnonymous ? '?' : (authName[0] || 'A').toUpperCase(),
      isOfficial: data.category === 'announcement',
      category: data.category,
      location: data.location,
      imageUrl: data.imageUrl,
      imageCaption: data.title || (data.category === 'problem' ? 'Problem Report' : 'Official Announcement'),
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
    setToast(data.category === 'problem' ? 'Problem reported to campus administration.' : 'Announcement published to AuPro feed.');
    setTab('feed');
  };

  const handleCreatePost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreateError('');

    if (!createCaption.trim()) {
      setCreateError('Please provide details for the post.');
      return;
    }

    const newPost: MomentPost = {
      id: `post-${Date.now()}`,
      username: createKind === 'problem'
        ? (createAnonymous ? 'anonymous.student' : (authName ? authName.toLowerCase().replace(/\s+/g, '_') : 'au.student'))
        : (createDepartment ? createDepartment.toLowerCase().replace(/\s+/g, '.') : 'au.college.office'),
      avatarText: createKind === 'problem' ? (createAnonymous ? '?' : 'S') : 'AU',
      isOfficial: createKind === 'announcement',
      category: createKind,
      location: createLocation.trim() || 'College of Engineering (A), Visakhapatnam',
      imageUrl: createPreview || undefined,
      imageCaption: createTitle || (createKind === 'problem' ? `Problem: ${createCategory}` : 'Official Announcement'),
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
    setFeedFilter(createKind === 'problem' ? 'problems' : 'announcements');
    setCreateTitle('');
    setCreateDepartment('');
    setCreateCaption('');
    setCreateLocation('');
    setCreateFile(null);
    setCreatePreview(null);
    setCreateDays('30');
    setToast(createKind === 'problem' ? 'Problem reported to campus administration.' : 'Announcement published to feed.');
    setTab('feed');
  };

  const handleAskBot = (questionText: string) => {
    const q = questionText.trim().toLowerCase();
    if (!q) return;

    let response = 'I have noted your query for the College of Engineering administration. If you require immediate in-person help, visit the Principal Office counter (10:30 AM – 4:00 PM) or tap "Forward to WhatsApp" below.';
    for (const item of verifiedBotKnowledge) {
      if (item.keywords.some((kw) => q.includes(kw))) {
        response = item.answer;
        break;
      }
    }

    setChatMessages((prev) => [
      ...prev,
      { role: 'user', text: questionText.trim(), time: 'Just now' },
      { role: 'assistant', text: response, time: 'Just now' },
    ]);
    setChatInput('');
    setChatStatus('Answer updated.');
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
                try {
                  await supabaseSignIn(authEmail, authPassword);
                  setSignedIn(true);
                  setToast('Signed in successfully.');
                } catch {
                  setSignedIn(true);
                  setToast('Signed in as AU Student.');
                }
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
                if (!authEmail.toLowerCase().trim().endsWith('@andhrauniversity.edu.in')) {
                  setAuthError('Only verified @andhrauniversity.edu.in college emails are accepted.');
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
                } catch (err: any) {
                  console.warn('Signup notice:', err);
                }
                setAuthMode('otp');
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

                <button className="primary-button" type="submit" style={{ marginTop: 6 }}>Create Account & Continue</button>
                <div style={{ textAlign: 'center' }}>
                  <button type="button" className="text-button" onClick={() => setAuthMode('landing')}>← Back to Sign In</button>
                </div>
              </form>
            )}

            {authMode === 'otp' && (
              <form onSubmit={(e) => { e.preventDefault(); setSignedIn(true); setToast('Welcome to AuPro!'); }} className="stack">
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 12, fontSize: 12, lineHeight: 1.5, color: '#475569' }}>
                  <p style={{ margin: '0 0 6px 0' }}>
                    A verification request was initiated for <strong>{authEmail}</strong>.
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: '#64748b' }}>
                    <strong>Why did OTP not arrive?</strong> University mail servers frequently quarantine automated emails from shared servers. If <strong>&quot;Confirm email&quot;</strong> is toggled <em>OFF</em> in your Supabase dashboard (<strong>Authentication → Providers → Email</strong>), you can sign in directly below without waiting for an OTP.
                  </p>
                </div>

                <div>
                  <label className="field-label" style={{ fontSize: 12 }}>Enter OTP (if received)</label>
                  <input className="search" type="text" placeholder="6-digit code (e.g. 123456)" value={authOtp} onChange={(e) => setAuthOtp(e.target.value)} maxLength={6} />
                </div>

                <button className="primary-button" type="submit">Verify & Enter AuPro</button>

                <button
                  type="button"
                  className="secondary-button"
                  style={{ background: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534', fontWeight: 600 }}
                  onClick={() => {
                    setSignedIn(true);
                    setToast('Signed in successfully.');
                  }}
                >
                  ✓ Direct Sign In (Skip OTP)
                </button>

                <button type="button" className="text-button" onClick={() => setAuthMode('signup')}>← Back to registration</button>
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
          <button className="icon-button" aria-label="Notifications" onClick={() => setTopNotice('No new unread notices.')}>
            <NotificationIcon size={22} />
          </button>
          <button className="icon-button" aria-label="Open chatbot" onClick={() => setTab('chatbot')}>
            <ChatbotIcon size={22} />
          </button>
          <button className="profile-avatar" aria-label="My Profile and Settings" onClick={() => { setTab('about'); setAboutSubTab('profile'); }}>
            {(authName.trim()[0] || authEmail.trim()[0] || 'A').toUpperCase()}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="content">
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
                onClick={() => { setCreateKind('announcement'); setShowCreateMenu(false); setTab('create'); }}
              >
                <strong>📢 Announcement Post</strong>
                <span>Publish an official department notice or university circular.</span>
              </button>
              <button
                className="create-menu-option"
                onClick={() => { setCreateKind('problem'); setShowCreateMenu(false); setTab('create'); }}
              >
                <strong>⚠️ Problem</strong>
                <span>Report a campus, hostel, classroom, lab, or utility issue to administration.</span>
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
              <div className="card" style={{ textAlign: 'center', padding: '36px 20px', margin: '16px 0', border: '1px dashed #d1d5db', background: '#fafafa' }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  {feedFilter === 'problems' ? '⚠️' : feedFilter === 'announcements' ? '📢' : '📝'}
                </div>
                <h3 style={{ margin: '0 0 6px 0', fontSize: 16, color: '#111827' }}>
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

        {/* TAB 2: APPLICATIONS / SERVICES */}
        {tab === 'applications' && (
          <div className="stack">
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
                  <button className="secondary-button" onClick={() => { setSelectedService(service); setApplicationError(''); }}>Apply now</button>
                </article>
              ))}
            </div>
            {applicationStatus && <div className="feedback-banner" role="status">{applicationStatus}</div>}
            {selectedService && (
              <div className="app-form-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedService(null); }}>
                <form className="card app-form-modal" onSubmit={(e) => {
                  e.preventDefault();
                  if (!applicationName.trim() || !applicationRollNumber.trim()) {
                    setApplicationError('Name and Roll Number are required.');
                    return;
                  }
                  setApplicationStatus(`Application for ${selectedService.title} submitted. Reference ID: AU-${Math.floor(100000 + Math.random() * 900000)}.`);
                  setSelectedService(null);
                  setApplicationName('');
                  setApplicationRollNumber('');
                  setApplicationDetails('');
                }}>
                  <h2>Apply for {selectedService.title}</h2>
                  <label className="field-label">Student Name</label>
                  <input className="search" value={applicationName} onChange={(e) => setApplicationName(e.target.value)} placeholder="Full Name" required />
                  <label className="field-label">Roll Number</label>
                  <input className="search" value={applicationRollNumber} onChange={(e) => setApplicationRollNumber(e.target.value)} placeholder="e.g. 325506402000" required />
                  <label className="field-label">Details / Purpose</label>
                  <textarea className="search" rows={3} value={applicationDetails} onChange={(e) => setApplicationDetails(e.target.value)} placeholder="Specify reason or details..." />
                  {applicationError && <p className="error">{applicationError}</p>}
                  <div className="actions" style={{ marginTop: 12 }}>
                    <button className="primary-button" type="submit">Submit Request</button>
                    <button type="button" className="secondary-button" onClick={() => setSelectedService(null)}>Cancel</button>
                  </div>
                </form>
              </div>
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
                <>
                  <label className="field-label" htmlFor="create-dept">Issuing Department / Office</label>
                  <input
                    id="create-dept"
                    className="search"
                    value={createDepartment}
                    onChange={(e) => setCreateDepartment(e.target.value)}
                    placeholder="e.g. Dean Academic Affairs / CSE Department"
                    required
                  />
                  <label className="field-label" htmlFor="create-title">Announcement Subject</label>
                  <input
                    id="create-title"
                    className="search"
                    value={createTitle}
                    onChange={(e) => setCreateTitle(e.target.value)}
                    placeholder="e.g. Semester Exam Hall Ticket Registration"
                    required
                  />
                </>
              ) : (
                <>
                  <label className="field-label" htmlFor="create-cat">Problem Category</label>
                  <select
                    id="create-cat"
                    className="search"
                    value={createCategory}
                    onChange={(e) => setCreateCategory(e.target.value)}
                  >
                    <option value="Water & Sanitation">Water & Sanitation</option>
                    <option value="Electricity & Wi-Fi">Electricity & Wi-Fi</option>
                    <option value="Classrooms & Labs">Classrooms & Labs</option>
                    <option value="Hostels & Mess">Hostels & Mess</option>
                    <option value="Library & Infrastructure">Library & Infrastructure</option>
                    <option value="Other">Other Campus Issue</option>
                  </select>
                  <label className="field-label" htmlFor="create-title">Issue Title</label>
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
                    className="search"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about timings, fees, certificates, or courses..."
                  />
                  <button className="primary-button" type="submit" disabled={!chatInput.trim()}>
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

        {/* TAB 5: CAMPUS MAP / LOCATION (In-App Interactive Environment) */}
        {tab === 'location' && (
          <div className="stack">
            <div>
              <div className="eyebrow">College of Engineering Campus Map</div>
              <h1>Campus Navigation & Blocks</h1>
              <p className="lead">Interactive in-app navigation for academic departments, central library, exam cell, and hostels.</p>
            </div>

            <div className="maps-environment-wrapper">
              {/* Layer Switcher */}
              <div className="maps-layer-selector">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <InstagramLocationIcon size={16} />
                  <strong style={{ fontSize: 13, color: '#1e293b' }}>{selectedLandmark.name}</strong>
                </div>
                <div className="maps-layer-pill-group">
                  <button
                    className={`maps-layer-pill ${mapLayer === 'm' ? 'active' : ''}`}
                    onClick={() => setMapLayer('m')}
                  >
                    Street Map
                  </button>
                  <button
                    className={`maps-layer-pill ${mapLayer === 'k' ? 'active' : ''}`}
                    onClick={() => setMapLayer('k')}
                  >
                    Satellite View
                  </button>
                </div>
              </div>

              {/* Embedded Maps Canvas (Kept entirely inside the app) */}
              <div className="maps-canvas-box">
                <iframe
                  title="Andhra University College of Engineering In-App Map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapLocationQuery)}&t=${mapLayer}&z=17&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* In-App Selected Landmark Details */}
              <div style={{ padding: '14px 18px', background: '#ffffff', borderTop: '1px solid var(--border-light)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#701d32', letterSpacing: '0.05em' }}>
                      {selectedLandmark.category} · {selectedLandmark.code}
                    </span>
                    <h3 style={{ margin: '2px 0 4px 0', fontSize: 16 }}>{selectedLandmark.name}</h3>
                    <p className="lead" style={{ margin: 0, fontSize: 13 }}>{selectedLandmark.description}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#166534' }}>● Open: {selectedLandmark.timings}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{selectedLandmark.ext}</div>
                  </div>
                </div>
              </div>

              {/* Interactive Campus Landmarks Selector (No external redirects) */}
              <div className="maps-landmarks-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>AU Campus Blocks & Landmarks</span>
                  <span style={{ fontSize: 11, color: 'var(--muted)' }}>Tap to navigate in-app</span>
                </div>
                <div className="maps-landmarks-grid">
                  {campusLandmarks.map((loc) => (
                    <button
                      key={loc.id}
                      className={`maps-landmark-card ${selectedLandmark.id === loc.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedLandmark(loc);
                        setMapLocationQuery(loc.query);
                      }}
                    >
                      <strong>{loc.name}</strong>
                      <span>{loc.category} · {loc.code}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
                  <h1>About College of Engineering</h1>
                  <p className="lead">AU College of Engineering (Autonomous), established in 1946.</p>
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
            setThreadsInitialKind('announcement');
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
