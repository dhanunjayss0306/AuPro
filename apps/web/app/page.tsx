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

type Tab = 'applications' | 'create' | 'feed' | 'chatbot' | 'location' | 'about';
type AuthMode = 'landing' | 'email-login' | 'signup-email' | 'signup-name' | 'signup-password' | 'otp';

const samplePosts: MomentPost[] = [
  {
    id: '1',
    username: 'au.college.office',
    avatarText: 'AU',
    isOfficial: true,
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
    id: '2',
    username: 'au.robotics.club',
    avatarText: 'RC',
    isOfficial: false,
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
    id: '3',
    username: 'campus.moments',
    avatarText: 'AU',
    isOfficial: false,
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

const campusPlaces = [
  { name: 'College of Engineering', category: 'Academic building', x: 57, y: 54 },
  { name: 'Central Library', category: 'Library', x: 79, y: 29 },
  { name: 'Administrative Block', category: 'Administration', x: 35, y: 42 },
  { name: 'Engineering Workshops', category: 'Laboratories', x: 68, y: 80 },
  { name: 'Student Services', category: 'Office', x: 20, y: 69 },
];

const aboutSections = [
  { title: 'Academic Departments', icon: 'document' as const, detail: 'Explore engineering programs, academic departments, laboratories, and college resources.', link: 'https://www.andhrauniversity.edu.in/colleges/college-of-engineering' },
  { title: 'University & College History', icon: 'home' as const, detail: 'Learn about Andhra University and the history of its College of Engineering.', link: 'https://www.andhrauniversity.edu.in/' },
  { title: 'Faculty & Research', icon: 'help' as const, detail: 'Find faculty, research activities, and department contacts in university directories.', link: 'https://www.andhrauniversity.edu.in/' },
  { title: 'Placements & Collaborations', icon: 'ticket' as const, detail: 'Look for placement-cell notices, campus recruitment updates, and collaboration news.', link: 'https://www.andhrauniversity.edu.in/' },
  { title: 'Administration & Contacts', icon: 'payment' as const, detail: 'Use official university contacts for current office information and administrative support.', link: 'https://www.andhrauniversity.edu.in/contact-us' },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('feed');
  const [signedIn, setSignedIn] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('landing');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authOtp, setAuthOtp] = useState('');
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [feedSearch, setFeedSearch] = useState('');
  const [feedPosts, setFeedPosts] = useState(samplePosts);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [createKind, setCreateKind] = useState<'post' | 'event' | 'document'>('post');
  const [createFile, setCreateFile] = useState<File | null>(null);
  const [createPreview, setCreatePreview] = useState('');
  const [createCaption, setCreateCaption] = useState('');
  const [createLocation, setCreateLocation] = useState('');
  const [createDays, setCreateDays] = useState('');
  const [createError, setCreateError] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [chatStatus, setChatStatus] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('');
  const [selectedService, setSelectedService] = useState<(typeof services)[number] | null>(null);
  const [applicationName, setApplicationName] = useState('');
  const [applicationRollNumber, setApplicationRollNumber] = useState('');
  const [applicationDetails, setApplicationDetails] = useState('');
  const [applicationError, setApplicationError] = useState('');
  const [locationStatus, setLocationStatus] = useState('');
  const [mapQuery, setMapQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(campusPlaces[0]);
  const [topNotice, setTopNotice] = useState('');
  const [toast, setToast] = useState('');

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [tab]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!topNotice) return;
    const timeout = window.setTimeout(() => setTopNotice(''), 4000);
    return () => window.clearTimeout(timeout);
  }, [topNotice]);

  useEffect(() => {
    if (!signedIn) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowCreateMenu(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [signedIn]);

  if (!signedIn) {
    const submitAuth = () => {
      setError('');
      const email = authEmail.trim().toLowerCase();
      if (authMode === 'signup-name') {
        if (!authName.trim()) { setError('Enter your full name to continue.'); return; }
        setAuthMode('signup-password');
        return;
      }
      if (authMode === 'signup-password') {
        if (authPassword.length < 8) { setError('Use a password with at least 8 characters.'); return; }
        setSignedIn(true);
        return;
      }
      if (authMode === 'otp') {
        if (!authOtp || authOtp.length < 4) { setError('Enter the OTP sent to your college email.'); return; }
        setSignedIn(true);
        return;
      }
      if (!email.endsWith('@andhrauniversity.edu.in')) {
        setError('Use your Andhra University email ending in @andhrauniversity.edu.in.');
        return;
      }
      if (authMode === 'email-login') {
        if (!authPassword) { setError('Enter your password or choose email OTP.'); return; }
        setSignedIn(true);
      } else if (authMode === 'signup-email') {
        setAuthMode('signup-name');
      }
    };

    return (
      <main className="shell">
        <section className="content" style={{ paddingTop: '12vh' }}>
          <div className="card auth-card">
            <div className="eyebrow" style={{ color: '#701d32', marginBottom: 6 }}>Andhra University</div>
            <h1 style={{ fontSize: 32, marginBottom: 12 }}>{authMode === 'landing' ? 'Welcome to AuPro' : authMode === 'signup-name' ? 'Tell us your name' : authMode === 'signup-password' ? 'Create a password' : authMode === 'otp' ? 'Check your email' : 'Sign in to AuPro'}</h1>
            <p className="lead" style={{ fontSize: 14, marginBottom: 22 }}>{authMode === 'landing' ? 'Campus moments, applications, verified information, and the engineering campus map.' : 'Use only your Andhra University college email.'}</p>
            {error && <div className="error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}
            {authMode === 'landing' && <>
              <button className="google-button" onClick={() => { setError(''); setSignedIn(true); }}><span className="google-mark">G</span> Continue with Google</button>
              <div className="auth-divider"><span>or</span></div>
              <div className="auth-actions"><button className="secondary-button" onClick={() => setAuthMode('email-login')}>Log in with email</button><button className="secondary-button" onClick={() => { setAuthMode('signup-email'); setAuthEmail(''); }}>Create account</button></div>
            </>}
            {authMode === 'email-login' && <><label className="field-label" htmlFor="auth-email">College email</label><input id="auth-email" className="search" type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@andhrauniversity.edu.in" /><label className="field-label" htmlFor="auth-password">Password</label><input id="auth-password" className="search" type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="Your password" /><div className="auth-actions"><button className="primary-button" onClick={submitAuth}>Log in</button><button className="secondary-button" onClick={() => { const email = authEmail.trim().toLowerCase(); if (!email.endsWith('@andhrauniversity.edu.in')) { setError('Enter your Andhra University email before requesting an OTP.'); return; } setAuthMode('otp'); }}>Use email OTP</button></div></>}
            {authMode === 'signup-email' && <><label className="field-label" htmlFor="signup-email">College email</label><input id="signup-email" className="search" type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@andhrauniversity.edu.in" /><button className="primary-button" onClick={submitAuth}>Continue</button></>}
            {authMode === 'signup-name' && <><label className="field-label" htmlFor="signup-name">Full name</label><input id="signup-name" className="search" value={authName} onChange={(event) => setAuthName(event.target.value)} placeholder="Your name" /><button className="primary-button" onClick={submitAuth}>Continue</button></>}
            {authMode === 'signup-password' && <><label className="field-label" htmlFor="signup-password">Password</label><input id="signup-password" className="search" type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="At least 8 characters" /><button className="primary-button" onClick={submitAuth}>Create account</button></>}
            {authMode === 'otp' && <><p className="lead">We sent a one-time code to {authEmail || 'your college email'}.</p><label className="field-label" htmlFor="auth-otp">Email OTP</label><input id="auth-otp" className="search" inputMode="numeric" value={authOtp} onChange={(event) => setAuthOtp(event.target.value)} placeholder="Enter OTP" /><button className="primary-button" onClick={submitAuth}>Verify OTP</button></>}
            {authMode !== 'landing' && <button className="text-button" onClick={() => { setAuthMode('landing'); setError(''); }}>Back to sign-in choices</button>}
            <p className="lead" style={{ fontSize: 12, marginTop: 16, marginBottom: 0 }}>Only verified <strong>@andhrauniversity.edu.in</strong> accounts are authorized.</p>
          </div>
        </section>
      </main>
    );
  }

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(query.toLowerCase())
  );
  const filteredFeedPosts = feedPosts.filter((post) =>
    `${post.username} ${post.location ?? ''} ${post.caption}`.toLowerCase().includes(feedSearch.toLowerCase())
  );
  const filteredPlaces = campusPlaces.filter((place) =>
    `${place.name} ${place.category}`.toLowerCase().includes(mapQuery.toLowerCase())
  );

  const handleCreateFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      setCreateFile(null);
      setCreatePreview('');
      setCreateError('Choose an image or PDF file.');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setCreateFile(null);
      setCreatePreview('');
      setCreateError('Choose a file smaller than 12 MB.');
      return;
    }

    setCreateFile(file);
    setCreateError('');
    setCreatePreview('');
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') setCreatePreview(reader.result);
        else setCreateError('This image could not be previewed.');
      };
      reader.onerror = () => setCreateError('This image could not be read.');
      reader.readAsDataURL(file);
    }
  };

  const handleCreatePost = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createFile) {
      setCreateError('Choose a photo or PDF before sharing.');
      return;
    }
    if (!createCaption.trim()) {
      setCreateError('Add a caption before sharing.');
      return;
    }
    const durationDays = Number(createDays);
    if (!Number.isInteger(durationDays) || durationDays < 1 || durationDays > 365) {
      setCreateError('Choose a post duration between 1 and 365 days.');
      return;
    }
    if (createFile.type.startsWith('image/') && !createPreview) {
      setCreateError('Wait for the photo preview to finish loading.');
      return;
    }

    const newPost: MomentPost = {
      id: `${Date.now()}`,
      username: authEmail.split('@')[0] || 'you',
      avatarText: authName.trim().slice(0, 1).toUpperCase() || 'Y',
      location: createLocation.trim() || undefined,
      imageUrl: createFile.type.startsWith('image/') ? createPreview : undefined,
      documentUrl: createFile.type === 'application/pdf' ? URL.createObjectURL(createFile) : undefined,
      imageCaption: createFile.type === 'application/pdf' ? `PDF document · ${createFile.name}` : createCaption.trim(),
      likesCount: 0,
      repostsCount: 0,
      caption: createCaption.trim(),
      durationDays,
      commentsCount: 0,
      comments: [],
      timeAgo: 'JUST NOW',
    };

    setFeedPosts((posts) => [newPost, ...posts]);
    setCreateFile(null);
    setCreatePreview('');
    setCreateCaption('');
    setCreateLocation('');
    setCreateDays('');
    setCreateError('');
    setTab('feed');
    setToast('Your post was added to this demo feed.');
  };

  const handleApplicationSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedService) return;
    if (!applicationName.trim() || !applicationRollNumber.trim() || !applicationDetails.trim()) {
      setApplicationError('Complete your name, student ID, and request details.');
      return;
    }
    setApplicationStatus(`${selectedService.title} request prepared locally. It has not been sent to the university.`);
    setSelectedService(null);
    setApplicationName('');
    setApplicationRollNumber('');
    setApplicationDetails('');
    setApplicationError('');
  };

  return (
    <main className="shell">
      {/* Instagram-style Top Bar */}
      <header className="topbar">
        <div className="brand">
          <span>AuPro</span>
          <span className="brand-badge">AU Eng</span>
        </div>
        <label className="topbar-search">
          <span className="sr-only">Search campus posts</span>
          <input
            value={feedSearch}
            onFocus={() => setTab('feed')}
            onChange={(event) => { setFeedSearch(event.target.value); setTab('feed'); }}
            placeholder="Search campus"
            aria-label="Search campus posts"
          />
        </label>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Notifications" onClick={() => setTopNotice('No new notifications.')}>
            <NotificationIcon size={22} />
          </button>
          <button
            className="icon-button"
            aria-label="Open chatbot"
            onClick={() => setTab('chatbot')}
          >
            <ChatbotIcon size={22} />
          </button>
          <button className="profile-avatar" aria-label={`Profile for ${authName || authEmail}`} onClick={() => setTopNotice(`Signed in as ${authName || authEmail}. Profile settings are not connected yet.`)}>
            {(authName.trim()[0] || authEmail.trim()[0] || 'Y').toUpperCase()}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="content">
        {topNotice && (
          <div className="top-notice" role="status">
            <span>{topNotice}</span>
            <button aria-label="Dismiss notification" onClick={() => setTopNotice('')}>×</button>
          </div>
        )}
        {showCreateMenu && (
          <div className="create-menu-backdrop" role="presentation" onClick={() => setShowCreateMenu(false)}>
            <section className="create-menu" role="dialog" aria-modal="true" aria-labelledby="create-menu-title" onClick={(event) => event.stopPropagation()}>
              <div className="create-menu-header"><div><div className="eyebrow">AuPro</div><h2 id="create-menu-title">Create</h2></div><button className="icon-button" aria-label="Close create menu" onClick={() => setShowCreateMenu(false)}>×</button></div>
              <button className="create-menu-option" onClick={() => { setCreateKind('post'); setShowCreateMenu(false); setTab('create'); }}><strong>New post</strong><span>Share an update with the campus community.</span></button>
              <button className="create-menu-option" onClick={() => { setCreateKind('event'); setShowCreateMenu(false); setTab('create'); }}><strong>Event post</strong><span>Share an event with a required duration.</span></button>
              <button className="create-menu-option" onClick={() => { setCreateKind('document'); setShowCreateMenu(false); setTab('create'); }}><strong>Upload document</strong><span>Share a PDF with the campus community.</span></button>
            </section>
          </div>
        )}

        {/* TAB 1: INSTAGRAM-DITTO FEED / MOMENTS */}
        {tab === 'feed' && (
          <div className="insta-feed-container">
            <div className="story-row" aria-label="Campus accounts">
              {[
                ['AU Office', 'AU', 'au.college.office'],
                ['Robotics', 'RC', 'au.robotics.club'],
                ['Campus', 'C', 'campus.moments'],
                ['Students', 'S', 'au.students_council'],
              ].map(([label, initials, username]) => (
                <button className="story-item" key={username} onClick={() => { setFeedSearch(username); setToast(`Showing ${label} posts.`); }}>
                  <span className="insta-avatar-ring"><span className="insta-avatar-inner"><span className="insta-avatar-placeholder">{initials}</span></span></span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            {filteredFeedPosts.map((post) => (
              <MomentCard key={post.id} post={post} onToast={setToast} />
            ))}
            {filteredFeedPosts.length === 0 ? (
              <div className="feed-end-note">No campus posts match “{feedSearch}”.</div>
            ) : (
              <div className="feed-end-note"><strong>You’re all caught up</strong><span>You’ve seen the latest campus posts.</span></div>
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
              <div className="app-form-backdrop" onMouseDown={(event) => {
                if (event.target === event.currentTarget) setSelectedService(null);
              }}>
                <form className="app-form-dialog" role="dialog" aria-modal="true" aria-labelledby="application-form-title" onSubmit={handleApplicationSubmit}>
                  <header className="app-form-header">
                    <div><div className="eyebrow">Demo application</div><h2 id="application-form-title">{selectedService.title}</h2></div>
                    <button type="button" className="icon-button" aria-label="Close application form" onClick={() => setSelectedService(null)}>×</button>
                  </header>
                  <p className="lead">{selectedService.detail}</p>
                  <label className="field-label" htmlFor="application-name">Full name</label>
                  <input id="application-name" className="search" value={applicationName} onChange={(event) => setApplicationName(event.target.value)} />
                  <label className="field-label" htmlFor="application-roll">Student ID / roll number</label>
                  <input id="application-roll" className="search" value={applicationRollNumber} onChange={(event) => setApplicationRollNumber(event.target.value)} />
                  <label className="field-label" htmlFor="application-details">Request details</label>
                  <textarea id="application-details" className="search" rows={4} value={applicationDetails} onChange={(event) => setApplicationDetails(event.target.value)} />
                  {applicationError && <p className="error" role="alert">{applicationError}</p>}
                  <p className="app-form-note">Demo only: this form does not submit to Andhra University.</p>
                  <button className="primary-button" type="submit">Review request</button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: CREATE POST (No "Create" text in nav; large plus button) */}
        {tab === 'create' && (
          <div className="stack" style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="create-heading">
              <button className="back-button" onClick={() => setTab('feed')}>← Back to feed</button>
              <div className="eyebrow">New Moment</div>
              <h1>{createKind === 'event' ? 'Share an event' : createKind === 'document' ? 'Upload a document' : 'Share with Campus'}</h1>
              <p className="lead">Attach a photo or PDF and add a caption for your campus post.</p>
            </div>
            <form className="card create-form" onSubmit={handleCreatePost}>
              <label className="create-upload" htmlFor="create-file">
                {createPreview ? (
                  <img className="create-image-preview" src={createPreview} alt="Selected post preview" />
                ) : (
                  <span className="create-upload-mark">{createFile?.type === 'application/pdf' ? 'PDF' : <BigPlusIcon size={26} />}</span>
                )}
                <strong>{createFile ? createFile.name : 'Choose a photo or PDF'}</strong>
                <span className="lead">{createFile?.type === 'application/pdf' ? 'PDF selected; preview is not available in this demo.' : 'Images and PDFs up to 12 MB.'}</span>
                <input id="create-file" type="file" accept="image/*,application/pdf" onChange={handleCreateFile} />
              </label>
              <label className="field-label" htmlFor="create-caption">Caption</label>
              <textarea
                id="create-caption"
                className="search create-caption"
                rows={4}
                value={createCaption}
                onChange={(event) => setCreateCaption(event.target.value)}
                placeholder="Write a caption for your moment..."
                maxLength={1000}
              />
              <label className="field-label" htmlFor="create-location">Location (optional)</label>
              <div className="create-location-field">
                <InstagramLocationIcon size={17} />
                <input
                  id="create-location"
                  className="search"
                  value={createLocation}
                  onChange={(event) => setCreateLocation(event.target.value)}
                  placeholder="Add a campus location"
                />
              </div>
              <label className="field-label" htmlFor="create-days">Keep this post visible for (days)</label>
              <input
                id="create-days"
                className="search"
                type="number"
                min="1"
                max="365"
                step="1"
                required
                value={createDays}
                onChange={(event) => setCreateDays(event.target.value)}
                placeholder="Enter 1–365 days"
              />
              {createError && <p className="error" role="alert">{createError}</p>}
              <p className="app-form-note">Demo only: this post is added to the current browser session and is not uploaded.</p>
              <button className="primary-button create-submit" type="submit" disabled={!createFile || !createCaption.trim() || !createDays}>Share Post</button>
            </form>
          </div>
        )}

        {/* TAB 4: CHATBOT / AI ASSISTANT */}
        {tab === 'chatbot' && (
          <div className="stack">
            <div>
              <div className="eyebrow">AU Assistant</div>
              <h1>Ask AuPro</h1>
              <p className="lead">College of Engineering knowledgebase, faculty directories, and quick queries.</p>
            </div>
            <div className="grid quick-questions">
              {['College office timings', 'Department faculty directory', 'Fee submission rules', 'Hall ticket requirements', 'Campus library timings', 'Campus bus routes'].map((topic) => (
                <button className="card quick-question" key={topic} onClick={() => { setChatInput(`Tell me about ${topic.toLowerCase()}.`); setChatStatus('Topic selected. Review the question and send it.'); }}>
                  <strong>{topic}</strong>
                  <div className="lead" style={{ fontSize: 12, margin: '6px 0 0' }}>View verified answers</div>
                </button>
              ))}
            </div>
            <div className="card">
              <div className="chat-transcript" aria-live="polite">
                {chatMessages.map((message, index) => <p key={`${message.role}-${index}`} className={message.role === 'user' ? 'chat-user' : 'chat-assistant'}><strong>{message.role === 'user' ? 'You' : 'AuPro'}:</strong> {message.text}</p>)}
              </div>
              <form className="chat-form" onSubmit={(event) => {
                event.preventDefault();
                if (!chatInput.trim()) return;
                setChatMessages((messages) => [...messages, { role: 'user', text: chatInput.trim() }, { role: 'assistant', text: 'I can help with verified College of Engineering information. Connect an approved AI provider to enable live answers.' }]);
                setChatInput('');
                setChatStatus('Message added to this demo conversation.');
              }}>
                <input className="search" value={chatInput} onChange={(event) => setChatInput(event.target.value)} placeholder="Type your college query or question..." aria-label="Query input" />
              <div className="actions" style={{ marginTop: 12 }}>
                <button className="primary-button" type="submit" disabled={!chatInput.trim()}>Send message</button>
                <a className="whatsapp-button" href={`https://wa.me/?text=${encodeURIComponent(chatInput || 'Hello, I need help with an Andhra University query.')}`} target="_blank" rel="noreferrer" onClick={() => setChatStatus('WhatsApp opened. Review and send your message there.')}>
                  <WhatsAppIcon size={20} />Forward to WhatsApp
                </a>
              </div>
              </form>
              {chatStatus && <div className="feedback-banner" role="status">{chatStatus}</div>}
            </div>
          </div>
        )}

        {/* TAB 5: CAMPUS MAP / LOCATION */}
        {tab === 'location' && (
          <div className="stack">
            <div>
              <div className="eyebrow">Campus Navigation</div>
              <h1>College of Engineering Map</h1>
              <p className="lead">Explore campus places and select a destination. This schematic is illustrative, not surveyed navigation data.</p>
            </div>
            <div className="card campus-map-card">
              <div className="campus-map-wrap">
                <svg className="campus-map-drawing" viewBox="0 0 1000 560" role="img" aria-label="Illustrated Andhra University campus map">
                  <rect width="1000" height="560" fill="#eaf0e4" />
                  <path d="M-20 142 1020 390M320-30 170 590M716-30 840 590M-20 465 1020 78" stroke="#fff" strokeWidth="58" />
                  <path d="M-20 142 1020 390M320-30 170 590M716-30 840 590M-20 465 1020 78" stroke="#d7d2c3" strokeWidth="3" strokeDasharray="12 12" />
                  <path d="M0 278h1000M500 0v560" stroke="#c7ddc0" strokeWidth="22" />
                  <rect x="260" y="185" width="172" height="98" rx="14" fill="#d9c7aa" />
                  <rect x="462" y="245" width="214" height="112" rx="14" fill="#e0c596" />
                  <rect x="700" y="110" width="184" height="108" rx="14" fill="#d2c3a5" />
                  <rect x="595" y="405" width="168" height="88" rx="14" fill="#d6c9b0" />
                  <rect x="104" y="338" width="196" height="92" rx="14" fill="#d6c9b0" />
                  <path d="M450 420q88-48 144-95" stroke="#0b5cad" strokeWidth="8" strokeLinecap="round" strokeDasharray="14 12" />
                  <text x="346" y="239" textAnchor="middle">ADMIN</text>
                  <text x="569" y="309" textAnchor="middle">ENGINEERING</text>
                  <text x="792" y="172" textAnchor="middle">LIBRARY</text>
                  <text x="679" y="458" textAnchor="middle">WORKSHOPS</text>
                  <text x="201" y="391" textAnchor="middle">STUDENT SERVICES</text>
                </svg>
                <span className="map-campus-label">Andhra University · Visakhapatnam</span>
                {campusPlaces.map((place) => (
                  <button
                    className={`campus-map-marker ${selectedPlace.name === place.name ? 'selected' : ''}`}
                    key={place.name}
                    style={{ left: `${place.x}%`, top: `${place.y}%` }}
                    aria-label={`Select ${place.name}`}
                    aria-pressed={selectedPlace.name === place.name}
                    onClick={() => { setSelectedPlace(place); setLocationStatus(`${place.name} selected.`); }}
                  />
                ))}
              </div>
              <div className="campus-map-content">
                <label className="field-label" htmlFor="campus-place-search">Find a campus place</label>
                <input id="campus-place-search" className="search" value={mapQuery} onChange={(event) => setMapQuery(event.target.value)} placeholder="Search departments, library, offices..." />
                <div className="campus-place-list">
                  {filteredPlaces.map((place) => (
                    <button className={`campus-place ${selectedPlace.name === place.name ? 'selected' : ''}`} key={place.name} onClick={() => { setSelectedPlace(place); setLocationStatus(`${place.name} selected. Campus routing is not connected yet.`); }}>
                      <InstagramLocationIcon size={17} />
                      <span><strong>{place.name}</strong><small>{place.category}</small></span>
                    </button>
                  ))}
                  {filteredPlaces.length === 0 && <p className="lead">No matching campus places.</p>}
                </div>
                <div className="campus-map-selection"><strong>{selectedPlace.name}</strong><span>{selectedPlace.category}</span></div>
                <button className="secondary-button" onClick={() => setLocationStatus('Offline map downloads are not available in this demo.')}>Offline map info</button>
              </div>
              {locationStatus && <div className="feedback-banner" role="status">{locationStatus}</div>}
            </div>
          </div>
        )}

        {/* TAB 6: ABOUT (Darkened Icon) */}
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
        - Feed symbol: Instagram Home
        - Applications: Clean modern 4-tile grid
        - Plus symbol: BIG prominent button (No "Create" label)
        - Chatbot: Sleek AI Assistant icon
        - Location symbol: Instagram Map Pin
        - About symbol: DARKENED #111827 high contrast icon
      */}
      <nav className="bottom-nav" aria-label="Primary navigation">
        {/* Confirmed structural order: Applications, Create, Feed, then supporting areas. */}
        <button className={`nav-button ${tab === 'applications' ? 'active' : ''}`} onClick={() => { setTab('applications'); setQuery(''); }} aria-label="Applications">
          <ApplicationsIcon active={tab === 'applications'} size={24} />
          <span>Applications</span>
        </button>
        <button className="nav-button create-action" onClick={() => setShowCreateMenu(true)} aria-label="Create" title="Create">
          <div className="big-plus-bubble"><BigPlusIcon size={24} /></div>
          <span>Create</span>
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
    </main>
  );
}
