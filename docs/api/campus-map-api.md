# AuPro campus map API contract

The map API is intentionally provider-neutral while the renderer and routing provider are evaluated.

## Read endpoints

- `GET /api/map/places?bbox=...&category=...&q=...`
- `GET /api/map/places/:placeId`
- `GET /api/map/paths?bbox=...`
- `GET /api/map/categories`
- `GET /api/map/offline-regions`
- `GET /api/map/routes/walking?from=...&to=...`

## Authenticated write endpoints

- `POST /api/map/suggestions`
- `POST /api/map/survey-sessions` — admin only
- `POST /api/map/survey-sessions/:id/track-points` — admin only
- `POST /api/map/drafts/places` — admin only
- `POST /api/map/drafts/paths` — admin only
- `POST /api/map/admin/review/:id` — admin only

## Rules

- Public reads return published, reviewed records only.
- Student suggestions are never public before review.
- Raw survey sessions and track points are admin-only.
- Routes are limited to the mapped campus area.
- Error responses use a stable code and a user-safe message.
- Location permission is client-controlled; the server receives location only for an explicitly requested map operation.
