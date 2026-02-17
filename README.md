# Hardtale Server App

Hardtale is a React + Express app for the Hardtale Hytale server community. It includes a public site, store flow, admin news tools, a vote page, and a custom loader/branding system.

## Features
- React UI with Clerk authentication
- News & updates with admin publishing and featured posts
- Store + cart flow with checkout modal
- Vote page with branded listing links
- Mobile-first navigation + drawer
- Theme support (light/dark/system)
- Custom Hardtale loader and branded assets

## Project Structure
- `public/` — client app (React + CSS)
- `public/components/` — UI components (e.g. HardtaleLoader)
- `Images/` — asset sources (logos, icons, SVGs)
- `server.js` — Express server + Clerk middleware

## Development
```bash
npm install
npm run dev
```

## Notes
- Static assets are served from `/Images` and `/assets`.
- Logo and SVG assets are organized under `Images/IslandLogo`, `Images/Logos`, and `Images/SVGs`.

## License
Private / internal use.

## Forum Post Storage & Safe Rendering
- Forum posts are now stored as Markdown in `forum_posts.body` with `forum_posts.bodyFormat = "markdown"` for new/edited posts.
- Backwards compatibility is preserved: older records without `bodyFormat` continue to load and render.
- Rendering is client-side through a safe Markdown renderer that:
  - Escapes raw HTML
  - Allows only safe links (`http`, `https`, `mailto`)
  - Allows images from `http`, `https`, and `data:image/*`
  - Blocks raw script/event payloads by construction (no raw HTML execution)
- Preview and final post rendering use the same renderer so what users see in Preview matches published output.
