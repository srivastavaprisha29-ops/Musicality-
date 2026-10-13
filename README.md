# Musicality — find your sound, find your people

A music-first discovery and collaboration prototype.

[Live demo](https://srivastavaprisha29-ops.github.io/Musicality-/)

## Account features
- Email/password signup, login, logout, confirmation email flow, and password recovery.
- Login/create-account popup for signed-out visitors.
- Editable profiles stored in Supabase, with owner-only read/write access.
- Per-account browser storage for saved demo profiles and demo conversations.

## Still a prototype
Discovery and opportunities show fictional sample profiles. Messages are local demos and are not delivered to other users. Audio is synthesized using the Web Audio API. Database-backed public discovery and real messaging are future work. Old unscoped prototype data is not imported into real accounts.

## Required Supabase setup BEFORE merging/deploying
1. In your Musicality Supabase project, open SQL Editor, create a query, paste `supabase/schema.sql`, and Run.
2. Under Authentication → URL Configuration, set Site URL to:
   `https://srivastavaprisha29-ops.github.io/Musicality-/`
   Add this exact URL to the allowed Redirect URLs too.
3. Enable the Email authentication provider and keep email confirmation enabled.
4. Configure production email delivery before inviting a broad audience; the default mail service has delivery restrictions and limits.
5. Test signup with an email you control, follow its confirmation link, log in, save a profile, refresh, and log out.
6. Repeat with a second account and verify its profile is independent. Test password reset.
7. Confirm anonymous database requests cannot read profiles and one user cannot read/update another user's row.

Only the public project URL and publishable key belong in `auth.js`. Never add a database password, secret key, or service-role key.

## Run locally
Serve the folder with `python3 -m http.server 8000`, then open http://localhost:8000.
To test email redirects locally, add that origin/path to Supabase's allowed Redirect URLs.

## Publish
GitHub Pages: main branch, / (root). No build step is required.
The Supabase browser SDK is loaded from a version-pinned CDN; an unavailable CDN displays a login service error.

## Next milestones
1. Real profile discovery with deliberate visibility controls.
2. Secure database-backed messaging.
3. Spotify integration and real previews.
