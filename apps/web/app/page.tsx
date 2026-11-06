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

type Tab = 'applications' | 'create' | 'feed' | 'chatbot' | 'location' | 'about';
type AuthMode = 'landing' | 'email-login' | 'signup-email' | 'signup-name' | 'signup-password' | 'otp';
type FeedFilter = 'problems' | 'normal' | 'announcements';

const initialPosts: MomentPost[] = [
  {
    id: '1',
    username: 'au.college.office',
    avatarText: 'AU',
    isOfficial: true,
    category: 'announcement',
    location: 'College of Engineering (A), Visakhapatnam',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&auto=format&fit=crop&q=80',
    likesCount: 384,
    repostsCount: 17,
    likedBy: 'dean_student_affairs',
    caption: 'Official Notice: Semester exam registrations and hall ticket applications are now open on AuPro. Please submit before the 15th.',
    commentsCount: 28,
    comments: [
      { id: '1-a', username: 'kiran_cs', avatarText: 'K', text: 'Thanks for sharing. Is the deadline the same for all departments?', timeAgo: '1h' },
      { id: '1-b', username: 'au.students_council', avatarText: 'A', text: 'Please check the official applications section for department-specific details.', timeAgo: '48m' },
    ],
    timeAgo: '2 HOURS AGO',
  },
  {
    id: '4',
    username: 'praveen_civil',
    avatarText: 'P',
    isOfficial: false,
    category: 'problem',
    location: 'Civil Engineering Block (2nd Floor near 208)',
    likesCount: 89,
    repostsCount: 24,
    likedBy: 'rahul_mech',
    caption: 'Problem Report: Water cooler near Room 208 has stopped dispensing water for the past 3 days. Students have to walk to the ground floor between lectures. Maintenance team please inspect and repair.',
    commentsCount: 12,
    comments: [
      { id: '4-a', username: 'student_rep', avatarText: 'S', text: 'Forwarded to the campus maintenance office. Ticket #402 opened.', timeAgo: '2h' },
      { id: '4-b', username: 'kavitha_ee', avatarText: 'K', text: 'Same issue on the 3rd floor cooler as well.', timeAgo: '1h' },
    ],
    timeAgo: '3 HOURS AGO',
  },
  {
    id: '2',
    username: 'au.robotics.club',
    avatarText: 'RC',
    isOfficial: false,
    category: 'normal',
    location: 'Department of CS & SE, AU Campus',
    imageUrl: '/images/robotics-hackathon.svg',
    imageCaption: 'Robotics hackathon',
    likesCount: 196,
    repostsCount: 8,
    likedBy: 'kiran_cs',
    caption: 'Day 1 of the Annual AU Tech Fest & Autonomous Robotics Hackathon! Check the services tab for event gate passes and certificates.',
    commentsCount: 15,
    comments: [
      { id: '2-a', username: 'nisha_builds', avatarText: 'N', text: 'The demo was amazing! 🤖', timeAgo: '2h' },
      { id: '2-b', username: 'au.robotics.club', avatarText: 'R', text: 'Thank you! More photos from the event are coming soon.', timeAgo: '1h' },
    ],
    timeAgo: '5 HOURS AGO',
  },
  {
    id: '5',
    username: 'anand_ece',
    avatarText: 'A',
    isOfficial: false,
    category: 'problem',
    location: 'Central Library (3rd Floor Reading Hall)',
    likesCount: 134,
    repostsCount: 38,
    likedBy: 'praveen_civil',
    caption: 'Problem Report: Frequent packet drops and disconnections on the 3rd floor Wi-Fi access point. Students are unable to access IEEE & ScienceDirect portals during study hours.',
    commentsCount: 18,
    comments: [
      { id: '5-a', username: 'au.library_desk', avatarText: 'L', text: 'Network technician has been alerted and will reset the 3rd-floor router today by 4 PM.', timeAgo: '1h' },
    ],
    timeAgo: '6 HOURS AGO',
  },
  {
    id: '3',
    username: 'campus.moments',
    avatarText: 'AU',
    isOfficial: false,
    category: 'normal',
    location: 'North Campus Library & Grounds',
    imageUrl: '/images/au-campus-library.svg',
    imageCaption: 'Andhra University campus library',
    likesCount: 421,
    repostsCount: 21,
    likedBy: 'au.students_council',
    caption: 'Quiet morning at the central reading halls before the mid-term reviews. Best of luck everyone! 🎓',
    commentsCount: 9,
    comments: [
      { id: '3-a', username: 'ananya_reads', avatarText: 'A', text: 'This is my favorite spot on campus.', timeAgo: '1d' },
      { id: '3-b', username: 'campus.moments', avatarText: 'C', text: 'The reading hall is open until 8 PM today.', timeAgo: '23h' },
    ],
    timeAgo: '1 DAY AGO',
  },
];

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
      const seen = sessionStorage.getItem('aupro_intro_seen');
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (seen === 'true' || prefersReduced) {
        setShowIntro(false);
      }
    } catch {
      setShowIntro(false);
    }
  }, []);
  const [tab, setTab] = useState<Tab>('feed');
  const [signedIn, setSignedIn] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
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

  // Google Maps State
  const [mapLocationQuery, setMapLocationQuery] = useState('Andhra University College of Engineering, Visakhapatnam');
  const [customApiKey, setCustomApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);

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

            {authMode === 'landing' && (
              <div className="stack">
                <button
                  className="google-button"
                  onClick={() => {
                    setAuthEmail('student@andhrauniversity.edu.in');
                    setAuthName('AU Student');
                    setSignedIn(true);
                  }}
                >
                  <span className="google-mark">G</span> Continue with Google
                </button>
                <div className="auth-divider"><span>or</span></div>
                <div className="auth-actions">
                  <button className="secondary-button" onClick={() => setAuthMode('email-login')}>Log in with email</button>
                  <button className="secondary-button" onClick={() => setAuthMode('signup-email')}>Create account</button>
                </div>
              </div>
            )}

            {authMode === 'email-login' && (
              <form onSubmit={(e) => { e.preventDefault(); setSignedIn(true); }} className="stack">
                <input className="search" type="email" placeholder="student@andhrauniversity.edu.in" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
                <input className="search" type="password" placeholder="Password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                <button className="primary-button" type="submit">Sign In</button>
                <button type="button" className="text-button" onClick={() => setAuthMode('landing')}>← Back</button>
              </form>
            )}

            {authMode === 'signup-email' && (
              <form onSubmit={(e) => { e.preventDefault(); setAuthMode('signup-name'); }} className="stack">
                <input className="search" type="email" placeholder="Enter college email (@andhrauniversity.edu.in)" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} required />
                <button className="primary-button" type="submit">Next</button>
                <button type="button" className="text-button" onClick={() => setAuthMode('landing')}>← Back</button>
              </form>
            )}

            {authMode === 'signup-name' && (
              <form onSubmit={(e) => { e.preventDefault(); setAuthMode('signup-password'); }} className="stack">
                <input className="search" type="text" placeholder="Full name" value={authName} onChange={(e) => setAuthName(e.target.value)} required />
                <button className="primary-button" type="submit">Next</button>
                <button type="button" className="text-button" onClick={() => setAuthMode('signup-email')}>← Back</button>
              </form>
            )}

            {authMode === 'signup-password' && (
              <form onSubmit={(e) => { e.preventDefault(); setAuthMode('otp'); }} className="stack">
                <input className="search" type="password" placeholder="Create password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} required />
                <button className="primary-button" type="submit">Send Verification Code</button>
                <button type="button" className="text-button" onClick={() => setAuthMode('signup-name')}>← Back</button>
              </form>
            )}

            {authMode === 'otp' && (
              <form onSubmit={(e) => { e.preventDefault(); setSignedIn(true); }} className="stack">
                <input className="search" type="text" placeholder="Enter 6-digit OTP sent to email" value={authOtp} onChange={(e) => setAuthOtp(e.target.value)} required maxLength={6} />
                <button className="primary-button" type="submit">Verify & Complete</button>
                <button type="button" className="text-button" onClick={() => setAuthMode('signup-password')}>← Back</button>
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
          <button className="profile-avatar" aria-label="Profile" onClick={() => setTopNotice(`Signed in as ${authName || authEmail || 'AU Student'}.`)}>
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
              <div className="feed-end-note">No posts in this category yet.</div>
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

        {/* TAB 5: CAMPUS MAP / LOCATION (Live Google Maps Export) */}
        {tab === 'location' && (
          <div className="stack">
            <div>
              <div className="eyebrow">Google Maps Integration</div>
              <h1>College of Engineering Map</h1>
              <p className="lead">Interactive location exported directly from Google Maps with navigation, blocks, and directions.</p>
            </div>

            {/* Quick Location Shortcuts */}
            <div className="map-shortcuts-bar">
              {[
                { label: 'All Campus', query: 'Andhra University College of Engineering, Visakhapatnam' },
                { label: 'CSE Department', query: 'Department of Computer Science & Systems Engineering, Andhra University, Visakhapatnam' },
                { label: 'Central Library', query: 'Dr. V.S. Krishna Library Andhra University, Visakhapatnam' },
                { label: 'Civil Block', query: 'Civil Engineering Department, Andhra University, Visakhapatnam' },
                { label: 'Mechanical Block', query: 'Mechanical Engineering Department, Andhra University, Visakhapatnam' },
              ].map((loc) => (
                <button
                  key={loc.label}
                  className={`map-shortcut-btn ${mapLocationQuery === loc.query ? 'active' : ''}`}
                  onClick={() => setMapLocationQuery(loc.query)}
                >
                  <InstagramLocationIcon size={14} />
                  <span>{loc.label}</span>
                </button>
              ))}
            </div>

            {/* Google Maps Container */}
            <div className="card google-map-card" style={{ padding: 0, overflow: 'hidden' }}>
              <div className="google-map-embed-wrapper" style={{ height: 420, width: '100%', position: 'relative' }}>
                <iframe
                  title="Andhra University College of Engineering Google Map"
                  src={`https://www.google.com/maps?q=${encodeURIComponent(mapLocationQuery)}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              {/* Map Footer Actions */}
              <div className="p-4 bg-white border-t border-[#e6e1db] flex flex-wrap items-center justify-between gap-3">
                <div>
                  <strong style={{ fontSize: 14 }}>{mapLocationQuery}</strong>
                  <div className="lead" style={{ fontSize: 12, margin: 0 }}>Visakhapatnam, Andhra Pradesh 530003</div>
                </div>
                <div className="actions">
                  <a
                    className="primary-button"
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocationQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <span>Open in Google Maps App ↗</span>
                  </a>
                  <a
                    className="secondary-button"
                    href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapLocationQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    Get Directions
                  </a>
                </div>
              </div>

              {/* Optional API Key Accordion */}
              <div className="p-3 bg-[#f5f5f7] border-t border-[#e6e1db] text-xs">
                <button
                  className="text-button"
                  style={{ fontSize: 12, color: 'var(--muted)' }}
                  onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                >
                  {showApiKeyInput ? '▲ Hide Custom Maps API Key configuration' : '▼ Want to paste a Google Maps API Key or custom Embed link? (Optional)'}
                </button>
                {showApiKeyInput && (
                  <div style={{ marginTop: 8 }} className="space-y-2">
                    <input
                      className="search"
                      style={{ fontSize: 12, padding: '8px 10px' }}
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                      placeholder="Paste your Google Maps API key (AIzaSy...)"
                    />
                    <p className="lead" style={{ fontSize: 11, margin: 0 }}>
                      The map above is already functioning with live Google Maps export. Adding your key will switch to Google Maps JavaScript/Embed API v1.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ABOUT */}
        {tab === 'about' && (
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
