# AuPro campus map architecture

## Scope

The first map covers the College of Engineering area at Andhra University. It is a campus map, not a worldwide Google Maps replacement. The experience can use Apple Maps as a reference for calm hierarchy, gesture behavior, place sheets, and visual clarity without copying proprietary code, assets, or branding.

## Product capabilities

- Current location with explicit permission.
- Search for verified buildings and places.
- Place details: name, category, description, official contact, hours, accessibility notes, and approved photos.
- Walking directions inside the mapped campus area.
- Categories for departments, offices, hostels, food, transport, and other approved campus places.
- Optional offline campus-map download.
- Map-correction suggestions from students.
- Cleaned and verified walking paths derived from private survey recordings.

## Client architecture

Web and mobile clients share map domain types and API contracts. The map renderer is an implementation detail behind a shared map interface so the web and iOS/Android clients can use compatible interaction rules. The final renderer and routing provider remain a later technical choice after the placeholder prototype.

Core map states:

1. Permission not requested.
2. Permission denied or unavailable.
3. Map loading.
4. Campus map ready.
5. Place selected with a detail sheet.
6. Search results.
7. Route preview.
8. Offline region available/unavailable.
9. Suggestion submitted.

## Backend architecture

- Supabase Auth identifies users.
- Supabase/Postgres stores approved place metadata, categories, paths, suggestions, and offline-region metadata.
- Spatial columns/indexes are added only when PostGIS is enabled in the target Supabase project.
- Cloudflare R2 stores approved map photos and future approved attachments using signed upload/download flows.
- Raw survey GPS tracks remain private to authorized administrators.
- Public map paths are cleaned/derived paths, not raw tracks.

## Publication and privacy rules

- All changes begin as drafts.
- Student suggestions require admin review before publication.
- Raw GPS tracks are private and never public.
- Only cleaned, verified walking paths and approved place points are public.
- Photos and contact details require verification before public display.
- Location permission is explicit, revocable, and used only for map functionality.

## Phases

1. Architecture and survey specification.
2. Backend spatial schema and access policies.
3. Placeholder map prototype using clearly marked sample data.
4. Admin survey capture and review workflow.
5. Verified campus data import and place details.
6. Walking routes, offline download, and correction workflow.
7. Runtime testing on iOS, Android, and web.

## Authentication error behavior

The clickable Google sign-in control must show clear, actionable messages for cancellation, non-university accounts, network/server failures, incomplete profiles, and expired sessions. The UI must not expose provider secrets or misleading technical stack traces.
