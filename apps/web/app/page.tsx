'use client';

import React, { useState } from 'react';
import {
  InstagramFeedIcon,
  InstagramLikeIcon,
  InstagramShareIcon,
  InstagramLocationIcon,
  ApplicationsIcon,
  ChatbotIcon,
  DarkenedAboutIcon,
  BigPlusIcon,
} from './icons';
import { MomentCard, MomentPost } from './MomentCard';

type Tab = 'feed' | 'applications' | 'create' | 'chatbot' | 'location' | 'about';

const samplePosts: MomentPost[] = [
  {
    id: '1',
    username: 'au.college.office',
    avatarText: 'AU',
    isOfficial: true,
    location: 'College of Engineering (A), Visakhapatnam',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&auto=format&fit=crop&q=80',
    likesCount: 384,
    likedBy: 'dean_student_affairs',
    caption: 'Official Notice: Semester exam registrations and hall ticket applications are now open on AuPro. Please submit before the 15th.',
    commentsCount: 28,
    timeAgo: '2 HOURS AGO',
  },
  {
    id: '2',
    username: 'au.robotics.club',
    avatarText: 'RC',
    isOfficial: false,
    location: 'Department of CS & SE, AU Campus',
    imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=900&auto=format&fit=crop&q=80',
    likesCount: 196,
    likedBy: 'kiran_cs',
    caption: 'Day 1 of the Annual AU Tech Fest & Autonomous Robotics Hackathon! Check the services tab for event gate passes and certificates.',
    commentsCount: 15,
    timeAgo: '5 HOURS AGO',
  },
  {
    id: '3',
    username: 'campus.moments',
    avatarText: 'AU',
    isOfficial: false,
    location: 'North Campus Library & Grounds',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&auto=format&fit=crop&q=80',
    likesCount: 421,
    likedBy: 'au.students_council',
    caption: 'Quiet morning at the central reading halls before the mid-term reviews. Best of luck everyone! 🎓',
    commentsCount: 9,
    timeAgo: '1 DAY AGO',
  },
];

const services = [
  { title: 'Bonafide Certificate', detail: 'Instant application with automated profile prefill. Trackable directly on AuPro.' },
  { title: 'Fee-Related Request', detail: 'Submit queries and fee clearance verifications to the college office.' },
  { title: 'Hall Ticket Duplicate', detail: 'Request duplicate hall ticket or resolve examination schedule conflicts.' },
  { title: 'Bus Pass Endorsement', detail: 'Apply for semester bus pass seal and RTC concession verification.' },
  { title: 'Hostel Out-Pass', detail: 'Weekend and holiday campus out-pass approval with parent confirmation.' },
  { title: 'Custom Request', detail: 'Send general administrative applications directly to department HOD.' },
];

export default function Home() {
  const [tab, setTab] = useState<Tab>('feed');
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  if (!signedIn) {
    return (
      <main className="shell">
        <section className="content" style={{ paddingTop: '16vh' }}>
          <div className="card" style={{ maxWidth: 460, margin: '0 auto', textAlign: 'center', padding: '36px 28px' }}>
            <div className="eyebrow" style={{ color: '#701d32', marginBottom: 6 }}>Andhra University</div>
            <h1 style={{ fontSize: 32, marginBottom: 12 }}>Welcome to AuPro</h1>
            <p className="lead" style={{ fontSize: 14, marginBottom: 26 }}>
              Campus moments, verified college applications, student helpdesk, and interactive engineering campus map.
            </p>
            {error && <div className="error" role="alert" style={{ marginBottom: 18 }}>{error}</div>}
            <button
              className="primary-button"
              style={{ width: '100%', padding: '14px', fontSize: 15, background: '#111827', borderColor: '#111827' }}
              onClick={() => { setError(''); setSignedIn(true); }}
            >
              Continue with Google
            </button>
            <p className="lead" style={{ fontSize: 12, marginTop: 16, marginBottom: 0 }}>
              Only verified <strong>@andhrauniversity.edu.in</strong> accounts are authorized.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const filteredServices = services.filter((service) =>
    service.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="shell">
      {/* Instagram-style Top Bar */}
      <header className="topbar">
        <div className="brand">
          <span>AuPro</span>
          <span className="brand-badge">AU Eng</span>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Notifications">
            <InstagramLikeIcon size={24} />
          </button>
          <button
            className="icon-button"
            aria-label="Direct Messages"
            onClick={() => setTab('chatbot')}
          >
            <InstagramShareIcon size={22} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="content">
        {/* TAB 1: INSTAGRAM-DITTO FEED / MOMENTS */}
        {tab === 'feed' && (
          <div className="insta-feed-container">
            {samplePosts.map((post) => (
              <MomentCard key={post.id} post={post} />
            ))}
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
            <div className="grid">
              {filteredServices.map((service) => (
                <article className="card" key={service.title}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ background: '#f3f4f6', padding: 8, borderRadius: 8 }}>
                      <ApplicationsIcon size={20} />
                    </div>
                    <h2 style={{ margin: 0, fontSize: 16 }}>{service.title}</h2>
                  </div>
                  <p className="lead" style={{ fontSize: 13, marginBottom: 14 }}>{service.detail}</p>
                  <button className="secondary-button" style={{ width: '100%' }}>Apply now</button>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CREATE POST (No "Create" text in nav; large plus button) */}
        {tab === 'create' && (
          <div className="stack" style={{ maxWidth: 480, margin: '0 auto' }}>
            <div>
              <div className="eyebrow">New Moment</div>
              <h1>Share with Campus</h1>
              <p className="lead">Publish a photo, college announcement, or hackathon update.</p>
            </div>
            <div className="card">
              <div
                style={{
                  border: '2px dashed var(--border)',
                  borderRadius: 12,
                  padding: 36,
                  textAlign: 'center',
                  background: '#fafafa',
                  marginBottom: 16,
                  cursor: 'pointer',
                }}
              >
                <div style={{ margin: '0 auto 10px', width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BigPlusIcon size={24} />
                </div>
                <strong>Select a photo from your device</strong>
                <p className="lead" style={{ fontSize: 12, margin: '6px 0 0' }}>Images are compressed automatically for fast loading</p>
              </div>
              <textarea
                className="search"
                rows={4}
                placeholder="Write a caption for your moment..."
                style={{ marginBottom: 14, resize: 'vertical' }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <InstagramLocationIcon size={16} />
                <input
                  className="search"
                  placeholder="Add location (e.g. Civil Engineering Dept)"
                  style={{ padding: '8px 12px', fontSize: 13 }}
                />
              </div>
              <button
                className="primary-button"
                style={{ width: '100%', background: '#111827', borderColor: '#111827' }}
                onClick={() => setTab('feed')}
              >
                Share Post
              </button>
            </div>
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
            <div className="grid">
              {['College office timings', 'Department faculty directory', 'Fee submission rules', 'Hall ticket requirements', 'Campus library timings'].map((topic) => (
                <button className="card" key={topic} style={{ textAlign: 'left' }}>
                  <strong>{topic}</strong>
                  <div className="lead" style={{ fontSize: 12, margin: '6px 0 0' }}>View verified answers</div>
                </button>
              ))}
            </div>
            <div className="card">
              <input className="search" placeholder="Type your college query or question..." aria-label="Query input" />
              <div className="actions" style={{ marginTop: 12 }}>
                <button className="primary-button" style={{ background: '#111827', borderColor: '#111827' }}>Send message</button>
                <button className="secondary-button">Forward to WhatsApp</button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: CAMPUS MAP / LOCATION */}
        {tab === 'location' && (
          <div className="stack">
            <div>
              <div className="eyebrow">Campus Navigation</div>
              <h1>College of Engineering Map</h1>
              <p className="lead">Interactive department buildings, labs, admin offices, and routes.</p>
            </div>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ height: 320, background: 'linear-gradient(135deg, #e2e8f0, #cbd5e1)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#334155' }}>
                <InstagramLocationIcon size={36} />
                <span style={{ fontWeight: 700, marginTop: 8, fontSize: 16 }}>Andhra University Engineering Campus</span>
                <span className="lead" style={{ fontSize: 12, color: '#64748b' }}>North Campus, Visakhapatnam</span>
              </div>
              <div style={{ padding: 16, display: 'flex', gap: 10 }}>
                <button className="primary-button" style={{ flex: 1, background: '#111827', borderColor: '#111827' }}>Find Department</button>
                <button className="secondary-button" style={{ flex: 1 }}>Download Offline Map</button>
              </div>
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
            {['Academic Departments & History', 'Accreditation & NIRF Rankings', 'Faculty Directory', 'Placement Cell & Collaborations', 'Administration & Contacts'].map((item) => (
              <article className="card" key={item}>
                <h2>{item}</h2>
                <p className="lead" style={{ margin: 0 }}>Official verified Andhra University details and portal links.</p>
              </article>
            ))}
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
        {/* 1. Feed */}
        <button
          className={`nav-button ${tab === 'feed' ? 'active' : ''}`}
          onClick={() => setTab('feed')}
          aria-label="Feed"
        >
          <InstagramFeedIcon active={tab === 'feed'} size={24} />
          <span>Feed</span>
        </button>

        {/* 2. Applications */}
        <button
          className={`nav-button ${tab === 'applications' ? 'active' : ''}`}
          onClick={() => { setTab('applications'); setQuery(''); }}
          aria-label="Applications"
        >
          <ApplicationsIcon active={tab === 'applications'} size={24} />
          <span>Services</span>
        </button>

        {/* 3. Big Plus Symbol - Notice: NO "Create" text */}
        <button
          className="nav-button create-action"
          onClick={() => setTab('create')}
          aria-label="New post"
          title="Add new post"
        >
          <div className="big-plus-bubble">
            <BigPlusIcon size={24} />
          </div>
        </button>

        {/* 4. Chatbot */}
        <button
          className={`nav-button ${tab === 'chatbot' ? 'active' : ''}`}
          onClick={() => setTab('chatbot')}
          aria-label="Chatbot"
        >
          <ChatbotIcon active={tab === 'chatbot'} size={24} />
          <span>AuPro AI</span>
        </button>

        {/* 5. Location */}
        <button
          className={`nav-button ${tab === 'location' ? 'active' : ''}`}
          onClick={() => setTab('location')}
          aria-label="Campus Map"
        >
          <InstagramLocationIcon size={22} />
          <span>Map</span>
        </button>

        {/* 6. Darkened About Icon */}
        <button
          className={`nav-button ${tab === 'about' ? 'active' : ''}`}
          onClick={() => setTab('about')}
          aria-label="About"
        >
          <DarkenedAboutIcon active={tab === 'about'} size={22} />
          <span style={{ color: tab === 'about' ? '#111827' : '#4b5563', fontWeight: tab === 'about' ? 700 : 500 }}>
            About
          </span>
        </button>
      </nav>
    </main>
  );
}
