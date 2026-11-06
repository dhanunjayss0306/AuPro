# AuPro backend foundation

## Approved authentication flow

1. Opening/loading experience completes.
2. The user signs in with Google through Supabase Auth.
3. The email must end with `@andhrauniversity.edu.in`.
4. A profile is created automatically for an allowed account.
5. If profile fields are incomplete, the client routes to profile completion.
6. The client routes to the feed after profile completion.
7. Protected routes redirect unauthenticated users to sign-in.

AuPro never stores university passwords.

## Implemented in this phase

- Supabase profile table and role boundary.
- Database trigger that rejects non-university email addresses.
- Row-level security so users can access only their own profile.
- Supabase Edge Function health endpoint at `/functions/v1/health`.
- Environment-variable placeholders with no secrets.

## Not implemented yet

Posts, attachments/R2 uploads, interactions, applications, FAQ/About content, voice provider integration, and frontend redirects are separate phases. Their contracts must be added without bypassing the profile and email-domain boundary.

## Provider setup required outside source code

Enable Google in the Supabase dashboard, configure the Google OAuth client, and set the allowed redirect URLs for the web and mobile clients. Credentials must remain in Supabase/Vercel/Expo secrets and must never be committed here.
