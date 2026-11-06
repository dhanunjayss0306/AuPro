'use client';

import React, { useState, useRef } from 'react';
import { InstagramLocationIcon } from './icons';

export interface ThreadsPostData {
  category: 'announcement' | 'problem' | 'normal';
  title?: string;
  department?: string;
  location: string;
  caption: string;
  imageUrl?: string;
  gifUrl?: string;
  audioTitle?: string;
  isAnonymous?: boolean;
}

interface ThreadsComposerProps {
  initialKind?: 'announcement' | 'problem';
  userName?: string;
  userHandle?: string;
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
  initialKind = 'announcement',
  userName = 'AU Student',
  userHandle = 'au.student',
  onClose,
  onSubmit,
}: ThreadsComposerProps) {
  const [kind, setKind] = useState<'announcement' | 'problem'>(initialKind);
  const [caption, setCaption] = useState('');
  const [department, setDepartment] = useState('CSE Department');
  const [problemCategory, setProblemCategory] = useState('Water & Sanitation');
  const [location, setLocation] = useState('AU College of Engineering');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedGif, setSelectedGif] = useState<string | null>(null);
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [audioAttached, setAudioAttached] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [error, setError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (PNG, JPG, WebP).');
      return;
    }
    if (file.size > 12 * 1024 * 1024) {
      setError('Image must be under 12 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
      setSelectedGif(null); // clear GIF if file uploaded
      setError('');
    };
    reader.readAsDataURL(file);
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
    if (!caption.trim() && !imagePreview && !selectedGif) {
      setError('Please write some details or attach media before posting.');
      return;
    }

    onSubmit({
      category: kind,
      department: kind === 'announcement' ? department : undefined,
      title: kind === 'problem' ? `${problemCategory} Issue` : `${department} Circular`,
      location: location.trim() || 'College of Engineering, AU Campus',
      caption: caption.trim(),
      imageUrl: imagePreview || selectedGif || undefined,
      gifUrl: selectedGif || undefined,
      audioTitle: audioAttached || undefined,
      isAnonymous: kind === 'problem' ? isAnonymous : false,
    });
  };

  const canPost = caption.trim().length > 0 || imagePreview !== null || selectedGif !== null;

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
        {/* Header: Cancel, Title / Type Selector */}
        <header className="threads-composer-header">
          <button type="button" onClick={onClose} className="threads-cancel-btn">
            Cancel
          </button>
          
          <div className="threads-type-pills" role="tablist" aria-label="Post category">
            <button
              type="button"
              className={`threads-type-pill ${kind === 'announcement' ? 'active announcement' : ''}`}
              onClick={() => setKind('announcement')}
            >
              📢 Announcement
            </button>
            <button
              type="button"
              className={`threads-type-pill ${kind === 'problem' ? 'active problem' : ''}`}
              onClick={() => setKind('problem')}
            >
              ⚠️ Problem
            </button>
          </div>

          <div style={{ width: 48 }} />
        </header>

        {/* Main Body: Two-column Threads structure */}
        <form onSubmit={handleSubmit} className="threads-form-body">
          <div className="threads-body-row">
            {/* Left Column: Avatar + Connecting Vertical Thread Line */}
            <div className="threads-left-col">
              <div className="threads-avatar">
                {isAnonymous && kind === 'problem' ? '?' : (userName[0] || 'A').toUpperCase()}
              </div>
              <div className="threads-line" />
              <div className="threads-sub-avatar">
                {isAnonymous ? '?' : (userName[0] || 'A').toUpperCase()}
              </div>
            </div>

            {/* Right Column: User details, typing down, media preview, icons */}
            <div className="threads-right-col">
              {/* User details row */}
              <div className="threads-user-row">
                <span className="threads-name">
                  {isAnonymous && kind === 'problem' ? 'Anonymous Student' : userName}
                </span>
                <span className="threads-handle">
                  {isAnonymous && kind === 'problem' ? '@anonymous.au' : `@${userHandle}`}
                </span>
                <span className={`threads-badge ${kind === 'problem' ? 'badge-problem' : 'badge-announcement'}`}>
                  {kind === 'problem' ? 'Report' : 'Official Notice'}
                </span>
              </div>

              {/* Specific metadata fields depending on type */}
              {kind === 'announcement' ? (
                <div className="threads-meta-row">
                  <span className="threads-meta-label">Dept:</span>
                  <select
                    className="threads-select"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                  >
                    <option value="Dean Academic Affairs">Dean Academic Affairs</option>
                    <option value="CSE Department">CSE Department</option>
                    <option value="ECE Department">ECE Department</option>
                    <option value="Civil Engineering Dept">Civil Engineering Dept</option>
                    <option value="Mechanical Dept">Mechanical Dept</option>
                    <option value="Central Library">Central Library</option>
                    <option value="Principal Office">Principal Office</option>
                  </select>
                </div>
              ) : (
                <div className="threads-meta-row">
                  <span className="threads-meta-label">Category:</span>
                  <select
                    className="threads-select"
                    value={problemCategory}
                    onChange={(e) => setProblemCategory(e.target.value)}
                  >
                    <option value="Water & Sanitation">Water & Sanitation</option>
                    <option value="Electricity & Wi-Fi">Electricity & Wi-Fi</option>
                    <option value="Classrooms & Labs">Classrooms & Labs</option>
                    <option value="Hostels & Mess">Hostels & Mess</option>
                    <option value="Library & Infrastructure">Library & Infrastructure</option>
                    <option value="Other">Other Campus Issue</option>
                  </select>
                </div>
              )}

              {/* Location indicator / editor */}
              <div className="threads-location-row">
                <InstagramLocationIcon size={14} />
                {showLocationInput ? (
                  <input
                    type="text"
                    className="threads-inline-input"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Civil Block Room 208"
                    autoFocus
                  />
                ) : (
                  <span
                    className="threads-location-text"
                    onClick={() => setShowLocationInput(true)}
                    title="Click to edit location"
                  >
                    {location} ✏️
                  </span>
                )}
              </div>

              {/* Textarea: Typing down, clean borderless Threads style */}
              <textarea
                className="threads-textarea"
                rows={3}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={
                  kind === 'problem'
                    ? "What's the issue? Describe what's broken or needs repair..."
                    : "What's new? Post an official announcement or circular..."
                }
                autoFocus
              />

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
                  <span className="threads-audio-icon">🎵</span>
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
              {kind === 'problem' ? (
                <label className="threads-anon-label">
                  <input
                    type="checkbox"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>Report anonymously</span>
                </label>
              ) : (
                <span className="threads-audience-text">Anyone can view & reply</span>
              )}
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
