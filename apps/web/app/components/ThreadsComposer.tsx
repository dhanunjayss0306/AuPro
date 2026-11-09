'use client';

import React, { useState, useRef } from 'react';
import { InstagramLocationIcon } from './icons';
import { validateTextContent, validateImageSafety, analyzePostTopic } from '../lib/content_moderation';
import { compressImageFile } from '../lib/image_compressor';
import { Glyph } from './Glyph';

export interface ThreadsPostData {
  category: 'normal' | 'problem' | 'announcement';
  title?: string;
  department?: string;
  location?: string;
  caption: string;
  imageUrl?: string;
  gifUrl?: string;
  audioTitle?: string;
  isAnonymous?: boolean;
}

// Authorized university email list for publishing official Announcements.
// You can add your specific university / department email IDs here.
export const AUTHORIZED_ANNOUNCEMENT_EMAILS = [
  'admin@andhrauniversity.edu.in',
  'office@andhrauniversity.edu.in',
  'principal.aucoe@andhrauniversity.edu.in',
  'dean.academic@andhrauniversity.edu.in',
  'dean_student_affairs@andhrauniversity.edu.in',
  'hod.cse@andhrauniversity.edu.in',
  'hod.ece@andhrauniversity.edu.in',
  'hod.civil@andhrauniversity.edu.in',
  'hod.mech@andhrauniversity.edu.in',
  'examcell@andhrauniversity.edu.in',
  'library@andhrauniversity.edu.in',
];

// Supported post categories: Normal Post, Problem report, or Announcement
export type PostCategoryOption = 'Normal Post' | 'Problem' | 'Announcement';

export function checkIsAuthorizedForAnnouncement(userEmail: string, authorizedEmails: string[] = []): boolean {
  if (!userEmail) return false;
  const cleanEmail = userEmail.toLowerCase().trim();
  const allAllowed = [...AUTHORIZED_ANNOUNCEMENT_EMAILS, ...authorizedEmails.map((e) => e.toLowerCase().trim())];
  if (allAllowed.includes(cleanEmail)) return true;
  if (cleanEmail.startsWith('admin') || cleanEmail.startsWith('dean') || cleanEmail.startsWith('hod') || cleanEmail.startsWith('office')) return true;
  return false;
}

interface ThreadsComposerProps {
  initialKind?: 'normal' | 'problem' | 'announcement';
  userName?: string;
  userHandle?: string;
  userEmail?: string;
  authorizedEmails?: string[];
  onClose: () => void;
  onSubmit: (post: ThreadsPostData) => void;
}

const SAMPLE_CAMPUS_GIFS = [
  { label: 'Campus Hackathon', url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=600&auto=format&fit=crop&q=80' },
  { label: 'AU Pride', url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Urgent Issue', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80' },
  { label: 'Library Study', url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop&q=80' },
];

export function ThreadsComposer({
  initialKind = 'normal',
  userName = 'AU Student',
  userHandle = 'au.student',
  userEmail = '',
  authorizedEmails = [],
  onClose,
  onSubmit,
}: ThreadsComposerProps) {
  const [kind, setKind] = useState<'normal' | 'problem' | 'announcement'>(initialKind === 'announcement' ? 'problem' : initialKind);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [audioAttached, setAudioAttached] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    const imageSafetyCheck = await validateImageSafety(file);
    if (!imageSafetyCheck.isValid) {
      setError(imageSafetyCheck.reason || 'Photo rejected: Inappropriate or invalid image.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    try {
      const compressed = await compressImageFile(file, 1280, 0.82);
      setImagePreview(compressed);
      setSelectedGif(null);
      setError('');
    } catch {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
        setSelectedGif(null);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectGif = (url: string) => {
    setSelectedGif(url);
    setImagePreview(null);
    setShowGifPicker(false);
  };

  const toggleAudio = () => {
    if (audioAttached) {
      setAudioAttached(null);
    } else {
      setAudioAttached('Campus Audio Announcement · 0:42');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Announcements temporarily blocked per university policy
    if (kind === 'announcement') {
      setError('Official Announcement posting is temporarily locked by university administration.');
      return;
    }

    if (!caption.trim() && !imagePreview && !selectedGif) {
      setError('Please write some details or attach media before posting.');
      return;
    }

    // 2. Strict content & topic moderation (safety + university/studies relevance)
    const textCheck = validateTextContent(`${caption} ${location}`, kind);
    if (!textCheck.isValid) {
      setError(textCheck.reason || 'Post blocked: Inappropriate or off-topic content detected.');
      return;
    }

    onSubmit({
      category: kind,
      department: undefined,
      title: kind === 'problem' ? 'Campus Problem Report' : undefined,
      location: location.trim() || undefined,
      caption: caption.trim(),
      imageUrl: imagePreview || selectedGif || undefined,
      gifUrl: selectedGif || undefined,
      audioTitle: audioAttached || undefined,
      isAnonymous: kind === 'problem' ? isAnonymous : false,
    });
  };

  const canPost =
    (caption.trim().length > 0 || imagePreview !== null || selectedGif !== null) &&
    kind !== 'announcement';

  return (
    <div
      className="threads-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="threads-composer-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="threads-composer-card">
        {/* Header: Cancel, Title (New thread), Spacer */}
        <header className="threads-composer-header">
          <button type="button" onClick={onClose} className="threads-cancel-btn">
            Cancel
          </button>
          
          <div className="threads-composer-title" id="threads-composer-title">
            New thread
          </div>

          <div style={{ width: 44 }} />
        </header>

        {/* Main Body: Two-column Threads structure */}
        <form onSubmit={handleSubmit} className="threads-form-body">
          <div className="threads-body-row">
            {/* Left Column: Avatar + Connecting Vertical Thread Line */}
            <div className="threads-left-col">
              <div className="threads-avatar">
                {(userName[0] || 'A').toUpperCase()}
              </div>
              <div className="threads-line" />
              <div className="threads-sub-avatar">
                {(userName[0] || 'A').toUpperCase()}
              </div>
            </div>

            {/* Right Column: User details, typing down, media preview, icons */}
            <div className="threads-right-col">
              {/* User details row */}
              <div className="threads-user-row">
                <span className="threads-name">
                  {userName}
                </span>
                <span className="threads-handle">
                  @{userHandle}
                </span>
              </div>

              {/* Location indicator / editor */}
              <div className="threads-location-row">
                <InstagramLocationIcon size={14} />
                {showLocationInput ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, width: '100%' }}>
                    <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                      <input
                        type="text"
                        className="threads-inline-input"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Tag campus spot (e.g. Central Library, CSE Labs...)"
                        autoFocus
                        style={{ flex: 1 }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowLocationInput(false)}
                        style={{ background: 'transparent', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: 13 }}
                      >
                        <Glyph n="check" />
                      </button>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {['Central Library', 'CSE Labs', 'Civil Block', 'Main Canteen', 'Grounds'].map((spot) => (
                        <button
                          key={spot}
                          type="button"
                          className="threads-location-chip"
                          onClick={() => { setLocation(spot); setShowLocationInput(false); }}
                          style={{
                            fontSize: 11,
                            padding: '2px 8px',
                            borderRadius: 12,
                            border: '1px solid var(--border)',
                            background: 'var(--hover-subtle)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                          }}
                        >
                          {spot}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <span
                    className="threads-location-text"
                    onClick={() => setShowLocationInput(true)}
                    title="Click to tag a campus location"
                  >
                    {location ? `${location}` : '+ Add Campus Location'}
                  </span>
                )}
              </div>

              {/* Textarea: Typing down, clean borderless Threads style */}
              <textarea
                className="threads-textarea"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={kind === 'problem' ? "What's the issue? Describe what's broken or needs repair..." : "Share university updates, academic queries, or study notes..."}
                autoFocus
              />

              {/* Real-time University & Academic Topic Analysis Pill */}
              <div style={{ margin: '4px 0 6px 0' }}>
                {caption.trim().length < 3 ? (
                  <div className="threads-topic-pill neutral">
                    <span style={{ fontSize: 12 }}><Glyph n="cap" /></span>
                    <span>AuPro Focus: Posts must relate to AU campus problems, college life, or studies</span>
                  </div>
                ) : analyzePostTopic(`${caption} ${location}`, kind).isRelevant ? (
                  <div className="threads-topic-pill valid">
                    <span style={{ fontSize: 12 }}><Glyph n="check" /></span>
                    <span>Verified: {analyzePostTopic(`${caption} ${location}`, kind).categoryName} topic</span>
                  </div>
                ) : (
                  <div className="threads-topic-pill warning">
                    <span style={{ fontSize: 12 }}><Glyph n="warn" /></span>
                    <span>Must be related to AU problems, campus life, or academic studies</span>
                  </div>
                )}
              </div>

              {/* Attached Image Preview */}
              {imagePreview && (
                <div className="threads-media-preview">
                  <img src={imagePreview} alt="Attached upload" className="threads-media-img" />
                  <button
                    type="button"
                    className="threads-media-remove"
                    onClick={() => setImagePreview(null)}
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Attached GIF Preview */}
              {selectedGif && (
                <div className="threads-media-preview">
                  <div className="threads-gif-badge">GIF</div>
                  <img src={selectedGif} alt="Selected GIF" className="threads-media-img" />
                  <button
                    type="button"
                    className="threads-media-remove"
                    onClick={() => setSelectedGif(null)}
                    aria-label="Remove GIF"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Attached Audio Memo Preview */}
              {audioAttached && (
                <div className="threads-audio-pill">
                  <span className="threads-audio-icon"><Glyph n="music" /></span>
                  <span className="threads-audio-text">{audioAttached}</span>
                  <button
                    type="button"
                    className="threads-audio-remove"
                    onClick={() => setAudioAttached(null)}
                  >
                    ×
                  </button>
                </div>
              )}

              {/* Quick GIF Picker Drawer */}
              {showGifPicker && (
                <div className="threads-gif-drawer">
                  <div className="threads-gif-drawer-header">
                    <span>Select Campus GIF / Sticker</span>
                    <button type="button" onClick={() => setShowGifPicker(false)}>×</button>
                  </div>
                  <div className="threads-gif-grid">
                    {SAMPLE_CAMPUS_GIFS.map((g) => (
                      <div
                        key={g.label}
                        className="threads-gif-item"
                        onClick={() => handleSelectGif(g.url)}
                      >
                        <img src={g.url} alt={g.label} />
                        <span>{g.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Toolbar Icons Row (Photo, GIF, Music, Location) */}
              <div className="threads-actions-toolbar">
                {/* Photo / Image button */}
                <button
                  type="button"
                  className="threads-tool-btn"
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach Photo / Image"
                  aria-label="Attach Photo"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {/* GIF Button */}
                <button
                  type="button"
                  className={`threads-tool-btn ${showGifPicker ? 'active' : ''}`}
                  onClick={() => setShowGifPicker(!showGifPicker)}
                  title="Attach GIF"
                  aria-label="Attach GIF"
                >
                  <span className="threads-gif-icon">GIF</span>
                </button>

                {/* Music / Audio Memo Button */}
                <button
                  type="button"
                  className={`threads-tool-btn ${audioAttached ? 'active' : ''}`}
                  onClick={toggleAudio}
                  title="Attach Audio / Music"
                  aria-label="Attach Audio"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                  </svg>
                </button>

                {/* Location Button */}
                <button
                  type="button"
                  className={`threads-tool-btn ${showLocationInput ? 'active' : ''}`}
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  title="Add Location"
                  aria-label="Add Location"
                >
                  <InstagramLocationIcon size={19} />
                </button>
              </div>

              {error && <p className="threads-error" role="alert">{error}</p>}
            </div>
          </div>

          {/* Footer: Privacy / Anonymous toggle on left, Post button on right */}
          <footer className="threads-composer-footer">
            <div className="threads-footer-left">
              <span className="threads-audience-text">Anyone can view & reply</span>
            </div>

            <button
              type="submit"
              disabled={!canPost}
              className={`threads-post-submit-btn ${canPost ? 'ready' : ''}`}
            >
              Post
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
