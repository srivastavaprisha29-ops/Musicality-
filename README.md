# Musicality — find your sound, find your people

A music-first discovery and collaboration network for musicians, producers, bands, labels, and studios.

## Prototype features
- Continuous creative discovery feed with individual, band, and organization profiles
- Search by name, genre, or city
- Saved profiles
- Profile prompts and collaboration opportunities
- Contextual messaging and editable personal profile
- Original synthesized demo audio
- Responsive charcoal-and-lime interface

## Current implementation
Built with HTML, CSS, and JavaScript. No package installation or build step is required. Profiles are fictional sample data. Messages, saved profiles, and profile edits are stored in this browser using localStorage; they are not sent to other users. Demo previews use the Web Audio API.

This prototype does not yet implement the planned Next.js, Supabase, Spotify OAuth, or real-time backend.

## Run locally
Open index.html in a browser, or serve this folder:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000.

## Publish on GitHub Pages
Upload index.html, style.css, app.js, and this README.md to the repository root. In repository Settings → Pages, select Deploy from a branch, main, and / (root), then Save.

## Roadmap
1. Real authentication, database profiles, and secure messaging
2. Spotify integration and genuine audio previews
3. Advanced search and collaborator matching
4. Band recruitment and organization dashboards
