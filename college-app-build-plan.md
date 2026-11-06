# College-only social + services app — build plan

For Mohith — MVGR / department-scale app, ~4,000 students, college email login.
Status: plan only. Nothing has been built, published, or sent to the college.

## The idea in one line

One app for college people only, in three parts:
1. **Feed** — posts about college issues, hackathons and events. No share button, no reels.
2. **Student services** — bus pass, bonafide certificate, fee-related requests, tracked like a delivery order.
3. **Helpdesk Q&A** — questions arranged as a tree; unanswered questions go to a responsible person on WhatsApp.

Photos are the only files stored. No stories. No other documents in v1.

## Screens (v1)

- Sign in / sign up (college email only)
- Feed: post list, create post (+ photo), like, comment
- Post detail: comments, expiry badge for event posts
- Services: pick a service, short form, my requests + status tracker
- Staff/admin: approve / reject a request with one tap, see pending queue
- Helpdesk: topic tree → sub-question → answer; "not answered? send on WhatsApp" button
- Profile: name, roll no., department, my posts, my requests
- Admin announcements: official posts from HOD / office (same feed, marked official)

## Free setup — verified 5 Nov 2026

| Piece | Free tier | What it is used for |
|---|---|---|
| Supabase | 500 MB Postgres, 50,000 auth users/month, 1 GB file storage, 5 GB egress/month, 200 realtime connections | Database, login, Q&A, requests, feed text |
| Cloudflare R2 | 10 GB storage/month, 1M Class A (upload/list) ops/month, 10M Class B (read) ops/month, egress free | Photos only |
| Vercel / Netlify | Free hosting tier | The app itself (start as a web app — works on a phone browser, easiest free route) |

Sources checked 5 Nov 2026: Supabase limits summarised from its pricing page as checked Oct 2026 — https://mykavo.app/blog/supabase-free-tier-limits ; Cloudflare R2 official pricing — https://developers.cloudflare.com/r2/pricing/

**Photo maths (the part that decides "free forever"):**
- Phone photo ~4 MB → compress in the app before upload to ~200 KB at 1080px.
- R2 10 GB then holds ~52,000 compressed photos (vs ~2,600 uncompressed).
- Permanent photos keep growing. Event/hackathon posts with an `expires_at` date auto-delete, so storage stops growing.
- Example from the earlier discussion: all 4,000 students posting 1 photo/week, permanent = ~780 MB/week, filling 10 GB in ~13 weeks. With 30-day expiry on event posts, the same use stays around ~3.3 GB — inside the free tier.

**Two hard rules:**
1. **Never store university passwords.** Only allow the college email domain. Students create their own password for this app (hashed by Supabase Auth), or sign in with Google restricted to that domain.
2. **Supabase built-in email is ~2/hour** for confirmations/resets. Before a mass launch, use Google sign-in or plug in a free SMTP (Brevo/Resend). Free Supabase projects also pause after 1 week of inactivity — fine if students use it daily, a problem only for a dead launch.

**First paid step, if ever needed:** Supabase Pro $25/month (8 GB database, 100 GB storage, no pausing). R2 beyond 10 GB is $0.015/GB/month. You do not need either at the start.

## Database tables (Supabase Postgres)

- `profiles` — id, name, roll_no, department, year, college_email, role (student / staff / admin)
- `posts` — id, author_id, text, photo_url (R2 link only, not the file itself), is_event, expires_at (null = permanent), created_at
- `post_likes`, `post_comments` — post_id, user_id, text
- `service_requests` — id, student_id, service_type (bus_pass / bonafide / fee / other), form fields, status, handled_by, created_at, updated_at
  - Status flow: `submitted → dept_or_hod → office → approved → ready` (rejected is a separate end state, with a reason)
- `faq_nodes` — id, parent_id (null = top topic), question, answer, order_no
  - Example: Exams → Duplicate hall ticket → "Apply at…"
- `unanswered_questions` — id, student_id, question_text, forwarded_to (staff role/name), sent_via_whatsapp (true only after the student presses send), created_at
- `announcements` — can reuse `posts` with `is_official = true` and author role = staff/admin, to keep v1 simple.

## How each feature works

**Feed**
- Create post: text + optional photo. Photo is compressed on the phone, uploaded to R2, and only its URL is saved in Supabase.
- No share button = simply do not build one. No reels = no video upload at all.
- Event posts: author picks an expiry (2 days / 2 weeks / 1 month). A scheduled job deletes expired posts and their R2 photos.

**Student services**
- Form auto-fills name and roll no. from the profile. Student picks the service and submits.
- Staff see a pending queue and approve/reject with one tap. The student sees the status change — no need to go and ask in person.
- Honest condition: the app makes *applying* instant, but a bonafide certificate is only "within a day" if college staff actually use the admin view. Without staff cooperation, this stays a request form, not a same-day service.

**Helpdesk Q&A tree**
- Student taps through topics until they reach an answer. The tree is just `faq_nodes` with `parent_id` links — admins can add/edit nodes without code changes.
- If no node answers the question: the app saves it in `unanswered_questions` and opens a `wa.me` link to the responsible person's number, with the question pre-typed. The student presses send.
- v1 does **not** use the official WhatsApp API to send automatically — that is the restricted/paid part. The click-to-chat link is free.

## Build order (MVP first)

1. **Auth + profiles** — college-domain sign-up, Google sign-in option, profile with roll no.
2. **Feed** — create/list/like/comment, photo upload with compression to R2, expiry field.
3. **Services** — request form, status tracker, staff approval view.
4. **Helpdesk** — FAQ tree, unanswered → WhatsApp link.
5. **Expiry + admin polish** — scheduled cleanup of expired posts, official announcements, launch checklist.

Suggested stack for v1 (not locked in): React/Next.js on Vercel + Supabase + R2. Build as a web app first; a wrapped mobile app can come later if the college actually adopts it.

## Decisions needed before building

1. College email domain to allow (e.g. the MVGR student domain) — this is the gate for "college only".
2. Which 2–3 services go in v1? Suggested: bus pass, bonafide certificate, fee query.
3. Who are the approvers? One staff/admin account per department to start, or HOD + office?
4. Which staff WhatsApp numbers are used for unanswered questions — and do those staff agree to receive them?
5. Web app first, or native mobile app from day one? Web first is cheaper and faster to test.

## Launch checklist

- [ ] Domain allowlist tested with a real college email
- [ ] Google sign-in or own SMTP connected (do not rely on Supabase built-in email at launch)
- [ ] Photo compression tested on a real phone photo
- [ ] Expiry cleanup job tested (expired post + its R2 photo both gone)
- [ ] One staff member has tried approving a test request end-to-end
- [ ] FAQ tree seeded with the 20 most-asked questions
- [ ] A plan for the Supabase 1-week pause if usage drops (e.g. a weekly keep-alive visit, or accept Pro later)
