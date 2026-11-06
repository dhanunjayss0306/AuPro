'use client';

import { useState } from 'react';

type Tab = 'applications' | 'chatbot' | 'create' | 'feed' | 'about' | 'location';

const services = [
  { title: 'Bonafide certificate', detail: 'Check requirements and start a request.' },
  { title: 'Fee-related request', detail: 'Ask the college office about a fee matter.' },
  { title: 'Hall ticket', detail: 'Submit a hall-ticket-related request.' },
  { title: 'Other application', detail: 'More services can be added by an admin.' },
];

function Icon({ name }: { name: string }) {
  const icons: Record<string, string> = { applications: '▣', chatbot: '◌', create: '+', feed: '⌂', about: 'ⓘ', location: '⌖' };
  return <span aria-hidden="true">{icons[name]}</span>;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>('feed');
  const [signedIn, setSignedIn] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');

  if (!signedIn) {
    return (
      <main className="shell">
        <section className="content" style={{ paddingTop: '18vh' }}>
          <div className="stack" style={{ maxWidth: 480, margin: '0 auto' }}>
            <div className="eyebrow">Andhra University</div>
            <h1>Welcome to AuPro.</h1>
            <p className="lead">One place for campus applications, verified information, posts, and the College of Engineering map.</p>
            {error && <div className="error" role="alert">{error}</div>}
            <button className="primary-button" onClick={() => { setError(''); setSignedIn(true); }}>
              Continue with Google
            </button>
            <p className="lead" style={{ fontSize: 12 }}>Only @andhrauniversity.edu.in accounts are allowed.</p>
          </div>
        </section>
      </main>
    );
  }

  const filteredServices = services.filter((service) => service.title.toLowerCase().includes(query.toLowerCase()));

  return (
    <main className="shell">
      <header className="topbar">
        <div className="brand">AuPro</div>
        <div className="topbar-actions"><button className="icon-button" aria-label="Notifications">♡</button><button className="icon-button" aria-label="More options">⋯</button></div>
      </header>
      <section className="content">
        {tab === 'feed' && <div className="stack"><div><div className="eyebrow">College of Engineering</div><h1>Your campus feed.</h1><p className="lead">Posts and official announcements from your university community.</p></div><article className="card"><div className="post-header"><div className="avatar">AU</div><div className="post-meta"><strong>College Office</strong><span>@official · Official announcement</span></div></div><p className="post-body">Important information for College of Engineering students. Check the latest notice and its expiry date.</p><div className="post-media">Attachment preview</div><div className="post-actions"><button>♡ Like</button><button>Comment</button><button>Share</button><button>Repost</button></div></article><article className="card"><div className="post-header"><div className="avatar">M</div><div className="post-meta"><strong>Student name</strong><span>@username · 2h</span></div></div><p className="post-body">A simple, verified place for campus updates.</p><div className="post-actions"><button>♡ Like</button><button>Comment</button><button>Share</button><button>Repost</button></div></article></div>}
        {tab === 'applications' && <div className="stack"><div><div className="eyebrow">College office</div><h1>Applications.</h1><p className="lead">Find a service, review its requirements, and submit it step by step.</p></div><input className="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applications" aria-label="Search applications" /><div className="grid">{filteredServices.map((service) => <article className="card" key={service.title}><div className="post-media" style={{ minHeight: 100 }}>Service preview</div><h2 style={{ margin: '14px 0 6px' }}>{service.title}</h2><p className="lead" style={{ fontSize: 13 }}>{service.detail}</p><button className="secondary-button">View requirements</button></article>)}</div></div>}
        {tab === 'chatbot' && <div className="stack"><div><div className="eyebrow">English support</div><h1>Ask AuPro.</h1><p className="lead">Start with verified College of Engineering information, then ask a question by text or voice.</p></div><div className="grid">{['College information', 'Faculty and contacts', 'Courses', 'Applications', 'Campus location'].map((topic) => <button className="card" key={topic} style={{ textAlign: 'left' }}>{topic}<br /><span className="lead" style={{ fontSize: 12 }}>Browse verified answers</span></button>)}</div><div className="card"><input className="search" placeholder="Type your question..." aria-label="Type your question" /><div className="actions" style={{ marginTop: 12 }}><button className="primary-button">Ask by voice</button><button className="secondary-button">Send</button></div></div></div>}
        {tab === 'about' && <div className="stack"><div><div className="eyebrow">Andhra University</div><h1>College of Engineering.</h1><p className="lead">Department profiles, courses, faculty, research areas, collaborations, and official links.</p></div>{['Department profile and history', 'Courses and programmes', 'Faculty directory', 'Research areas', 'Collaborations', 'Department contact'].map((item) => <article className="card" key={item}><h2>{item}</h2><p className="lead">Official information and source links will appear here.</p></article>)}</div>}
        {tab === 'location' && <div className="stack"><div><div className="eyebrow">College of Engineering</div><h1>Campus map.</h1><p className="lead">A verified campus map with search, places, walking routes, and offline support.</p></div><div className="card post-media" style={{ minHeight: 360 }}>Map preview<br /><span style={{ fontSize: 13 }}>MapLibre campus layer</span></div><div className="actions"><button className="primary-button">Use my location</button><button className="secondary-button">Download offline map</button></div></div>}
        {tab === 'create' && <div className="stack"><div><div className="eyebrow">Create</div><h1>What do you want to share?</h1></div>{['New post', 'Event post', 'Announcement', 'Upload document'].map((item) => <button className="card" key={item} style={{ textAlign: 'left' }}><h2>{item}</h2><p className="lead">Open the composer and continue.</p></button>)}</div>}
      </section>
      <nav className="bottom-nav" aria-label="Primary navigation">{(['applications', 'chatbot', 'create', 'feed', 'about', 'location'] as Tab[]).map((item) => <button key={item} className={`nav-button ${tab === item ? 'active' : ''} ${item === 'create' ? 'create' : ''}`} onClick={() => { setTab(item); if (item !== 'applications') setQuery(''); }} aria-label={item === 'create' ? 'Create' : item}><Icon name={item} /><span>{item === 'create' ? 'Create' : item[0].toUpperCase() + item.slice(1)}</span></button>)}</nav>
    </main>
  );
}
