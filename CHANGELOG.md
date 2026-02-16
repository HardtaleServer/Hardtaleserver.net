# Changelog

All notable changes to this project are documented here.

## 2026-02-16 (v1.3.31)
- Expanded forum profile cards for your own profile to include all rank controls: display title, rank effects toggle, avatar effects toggle, and staff-gradient toggle (staff-only).
- Added per-rank hover glow effects to forum rank icons (Registered/Hero/Legend/Mythic/Staff) on forum author rows.
- Fixed a recurring desktop sticky-navbar issue where hovering Home/Forum nav buttons could cause the Settings button to visually glitch.
- Fixed staff/admin forum post rank labels so the STAFF gradient now renders correctly.
- Updated staff/admin gradient setting to toggle animation only while keeping the STAFF gradient effect enabled by default.
- Added reusable store-rank SVG assets (`RANK_HERO.svg`, `RANK_LEGEND.svg`, `RANK_MYTHIC.svg`) and switched Store rank icons to use them.
- Added staff-only profile badge options to show/hide badge and choose `STAFF` or `ICON STAFF` (HT icon), with badge gradient following staff gradient animation settings.
- Added `HardTale_H_HT.png` as a selectable logo icon option in mobile and desktop logo pickers.
- Wired staff rank chips to use the `ht_staff` SVG icon asset for STAFF rank icon rendering.

## 2026-02-16 (v1.3.29)
- Added forum post `PATCH`/`DELETE` APIs with owner-or-staff authorization checks.
- Added forum post edit/delete controls in the UI for post owners and staff/admin users.
- Added `(STAFF FORCED EDIT):` rendering and glow styling for staff-forced edits on other users' posts.
- Added targeted notifications to users when staff edit or remove their forum post, including profile-card metadata and a `View` deep-link.

## 2026-02-16 (v1.3.28)
- Added self-rank title settings to forum profile cards when viewing your own profile.
- Saving your title from the forum profile card now updates rank labels immediately in forum list and post views.

## 2026-02-16 (v1.3.27)
- Reply notifications now store and display the real replying user metadata (name/userId/username/avatar/rank) instead of `System`.
- Added notification-panel profile peek so recipients can open the replying user's profile card directly from the bell popup.
- Kept `View` deep-links for reply notifications unchanged so users can still jump to the exact reply thread.

## 2026-02-16 (v1.3.26)
- Switched `/link` feature gating to `LINKING_ENABLED` with local mock mode when disabled.
- Kept `/link` URL parsing active while simulating redeem outcomes for invalid/expired, already used, rate-limited, and unavailable states.
- Preserved the same `/link` UI flow so enabling live server integration only requires flipping the env flag.

## 2026-02-16 (v1.3.25)
- Added `LINK_REDEEM_ENABLED` feature flag so `/link` can accept code input while live redeem is disabled.
- Expanded `/link` UX states for linked, invalid/expired code, already used, rate limited, and server unavailable.
- Added backend error-code passthrough for plugin redeem responses.

## 2026-02-16 (v1.3.24)
- Added account linking APIs: `/api/link/status` and `/api/link/redeem`, including Mongo persistence for `webUserId <-> playerUuid`.
- Added `/link` page verify flow (authenticated redeem call, loading/success/error states, and linked account status display).
- Added server-to-server redeem integration config via `LINK_SERVICE_BASE_URL`, `LINK_SERVICE_AUTH_TOKEN`, and optional `LINK_SERVICE_TIMEOUT_MS`.

## 2026-02-16 (v1.3.23)
- Updated `Registered` rank color to `#479284`.
- Reworked `Mythic` rank visuals to a more distinct rare/cosmic cyan palette so it no longer closely matches `Legend`.

## 2026-02-16 (v1.3.21)
- Updated mobile notifications layout so timestamp and author line are right-aligned within each notification card.

## 2026-02-16 (v1.3.20)
- Added profile title selection on your own comment profile card (Registered/Hero/Legend/Mythic), persisted in Clerk metadata with unlock validation.
- Gave staff full title access by default and added a staff-only profile toggle to show/hide the staff badge.
- Fixed reply targeting so notifications go only to the replied user (never yourself), and added clickable reply references with author/snippet that jump to the target comment or reply.
- Updated rank badge rendering so only STAFF keeps gradient while other ranks use per-rank colors; saved rank prefix mapping to `data/rank-prefixes.json`.
- Improved Home panels with direct `View` buttons for news items, added a forum highlights mini-panel with deep links, and reserved a leaderstats placeholder for MMO Trees integration.

## 2026-02-14 (v1.3.19)
- Fixed `/link` page runtime crash and kept six single-digit code inputs with URL prefill support (e.g. `?123456`).
- Improved mobile comment/reply presentation: larger avatars, inline compact timestamp/edited metadata, and smart long-name scaling.
- Replaced comment toggle `?` glyphs with consistent chevrons (`>` collapsed, `v` expanded).
- Left-aligned news metadata rows so `By System` aligns correctly on both desktop and mobile.
- Updated staff text gradients to flow red-to-blue across author names, rank labels, and staff message text.
- Added server-side author profile refresh for comments/replies/news so name/username/avatar/rank updates sync from Clerk.
- Added targeted reply notifications (`who replied`) with `View` actions that deep-link into news posts and auto-scroll/highlight the related comment or reply.
- Added admin News Publisher option to send a linked notification on post (header + small info + `View` route to the news article).

## 2026-02-14 (v1.3.18)
- Added `/link` auth page with six-digit code input UX (auto-advance, keyboard navigation, and paste support).
- Moved comment/reply identity to username-first staff-aware rendering and added staff reflectance animation.
- Redesigned comment responses as a full-width dropdown section with improved mobile stacking/alignment.
- Added avatar profile cards from comment/reply images, including staff badge metadata for future badge expansion.
- Updated admin delete actions to hard-delete news and notifications from MongoDB when deleting entries.

## 2026-02-13 (v1.3.17)
- Added Mongo-backed reply edit and reply delete APIs with auth/ownership checks.
- Stored reply edit metadata (`editCount`, `updatedAt`) so reply changes persist across reloads.
- Added signed-in UI controls to edit/delete your own replies directly in the news comment thread.

## 2026-02-12 (v1.3.8)
- Installed Frimousse locally and updated emoji picker imports.
- Updated picker styling to match light/dark theme.

## 2026-02-12 (v1.3.16)
- Prevented desktop scroll yank by keeping the topbar layout stable when sticky nav activates.
- Moved empty reaction prompt above the add-reaction button.
- Placed empty comments notice above the composer and locked comment textarea resizing.

## 2026-02-12 (v1.3.15)
- Stabilized desktop sticky nav by swapping nav components at scroll threshold.
- Fixed right-side settings menu offset and limited mobile island toggle to mobile.
- Restyled poll buttons to match site gradients and theme.

## 2026-02-12 (v1.3.7)
- Switched emoji picker to Frimousse with CDN loading and updated picker styling.
- Added reactions (emoji picker) to news and changelog entries.
- Added signed-in comments with edit history and author metadata on news posts.
- Added server-side JSON storage for reactions and comments with audience-checked Clerk auth.
 
## 2026-02-12 (v1.3.9)
- Added polls (admin-created) to news posts with single/multi-choice voting and results after vote.
- Added ranks display under comment author names with STAFF gradient styling.
- Added polls JSON storage file.

## 2026-02-12 (v1.3.10)
- Added permissions-based rank syncing (polls JSON plus permissions JSON source).
- Comment badges now read rank from Clerk public metadata with STAFF override.

## 2026-02-12 (v1.3.11)
- Fixed desktop sticky mode to always hide the original nav on scroll.
- Increased changelog popup height.

## 2026-02-12 (v1.3.12)
- Refined comment layout (stacked identity + right-aligned actions).
- Right-aligned news metadata row.

## 2026-02-12 (v1.3.14)
- Improved desktop nav stability and hover behavior.
- Tweaked notification modal layout and kept gradient buttons readable in dark mode.

## 2026-02-12 (v1.3.6)
- Added reactions (emoji picker) to news and changelog entries.
- Added signed-in comments with edit history and author metadata on news posts.
- Added server-side JSON storage for reactions and comments with audience-checked Clerk auth.

## 2026-02-12 (v1.3.5)
- Updated store rank perks/pricing and added a global-boost support note.
- Added checkout perk bullets from store descriptions with bold badge emphasis.
- Fixed desktop header to show the cart button next to notifications, matching the logo-side ordering.
- Added desktop sticky navbar settings (style, width, and logo picker) with scroll-in animation.

## 2026-02-11 (v1.3.4)
- Added visible timestamps to notification entries in the bell panel.
- Added visible timestamps to news posts and home news updates.
- Improved timestamp formatting consistency across activity feeds.

## 2026-02-11 (v1.3.3)
- Added `/home` as a route alias for the root home page.
- Updated home nav active-state handling so both `/` and `/home` map to Home.

## 2026-02-11 (v1.3.2)
- Corrected Clerk key configuration after a mismatched key update.
- Resolved auth handshake verification failures caused by invalid key pairing.
- Stabilized production authentication initialization for live sessions.

## 2026-02-11 (v1.3.1)
- Kept the loader for initial page boot only, with direct navigation after first load.
- Added a short loader transition specifically for sign-in and sign-out state changes.
- Moved admin tools to the 404 route and restricted visibility to admin users.

## 2026-02-11 (v1.3.0)
- Added admin notification publishing and management (create, delete, and featured toggles).
- Replaced static notifications with API-backed delivery through the notification bell for signed-in users.
- Added featured notification prioritization and live notification refresh handling.

## 2026-02-11 (v1.2.9)
- Hardened production configuration handling and moved environment configuration to Render-managed variables.
- Improved signed-in loading reliability in live environments.
- Moved the Play action to the last position in the mobile drawer menu list.

## 2026-02-11 (v1.2.8)
- Added mobile logo picker with icon/logo grids and solid-only display.
- Separated floating island from navbar logos for mobile-only hiding.
- Reorganized asset folders (IslandLogo, SVGs) and loader component structure.

## 2026-02-11 (v1.2.7)
- Expanded mobile logo icon options and fixed icon selection in the drawer settings.
- Added a flip animation to the HardtaleLoader.
- Adjusted mobile navbar logo sizing.

## 2026-02-11 (v1.2.6)
- Added HardtaleLoader component with rotating H icon variants for load transitions.
- Introduced the Vote page with branded site logos and updated navigation links.
- Fixed mobile topbar transparency behavior when the logo is hidden (solid mode).
- Multiple mobile UI alignment tweaks and settings cleanup.

## 2026-02-11 (v1.2.5)
- Added a Vote page with branded site logos and updated navigation links.
- Removed the players-online pill from the Vote page layout.

## 2026-02-11 (v1.2.4)
- Added desktop logo side setting that repositions the logo, nav, and auth buttons.
- Introduced Direct Connect help modal with a How? button in the join row.
- Refined footer layout to align Version and Copyright on one line.

## 2026-02-11 (v1.2.3)
- Adjusted mobile drawer width and menu-side alignment behavior.
- Added conditional ordering and offsets for mobile menu/cart buttons.
- Refined drawer header button positioning and settings menu offsets.
- Tweaked mobile navbar spacing and click sparkle cooldown.

## 2026-02-11 (v1.2.2)
- Added an interactive Version footer that opens a changelog popup.
- Styled changelog entries for a notification-style modal.

## 2026-02-11 (v1.2.1)
- Added mobile navbar style options (transparent/solid) and solid mini-logo treatment.
- Reworked mobile header layout with a Discord info pill and tighter logo spacing.
- Updated server status pill to include active players and cleaned up Discord info card.
- Refined mobile navbar styling, layering, and shadow behavior.

## 2026-02-11 (v1.2.0)
- Reworked the home layout with full-width hero/play section and a split stats/news panel.
- Added mobile drawer navigation with customizable menu side, improved header behavior, and refined menu styling.
- Implemented featured news toggles, sorting, and a dynamic featured callout with admin controls.
- Added notification and cart count badges plus refined admin/news tooling.
- Tuned mobile spacing, copy IP placement, and Discord CTA icon/button layout.

## 2026-02-11 (v1.1.0)
- Expanded the Store experience with rank-style icons and an "About Ranks" section.
- Added ticket support modal with sign-in gating, email prefill, cooldown timer, and thank-you state.
- Implemented cart quantity controls with remove icons and improved cart styling.
- Introduced a subscription portal page and a custom 404 screen.
- Refreshed the visual theme with blue/red accents and card gradients.
- Updated the server address to `play.hardtale.net`.

## 2026-02-09 (v1.0.5)
- Built the home page layout and hero section.
- Added the admin utility for publishing and managing news.
- Integrated Clerk authentication (sign in/sign up, user menu, admin checks).
- Added site navigation and routing foundations.
- Introduced core UI scaffolding (cards, popups, settings UI).

## 2026-02-08 (v1.0.0)
- Rebuilt the site as a React app served from `public/` with a Node/Express backend.
- Added Clerk auth (sign in/sign up), admin-only news publishing, and news delete support.
- Implemented a Store page with React Router and a cart/checkout popup.
- Added a settings popup with theme and navbar placement controls.
- Added notifications UI with a popup list (system notifications).
- Added server-side logo fallback at `/logo.png` and favicon/social meta tags.
- Added mobile/desktop navbar placement defaults (center on mobile, left on desktop).
- Added light/dark/system theme support and local storage persistence.

### Files of note
- `server.js` (API for news + delete + logo fallback)
- `public/app.js` (React UI, routing, notifications, store, cart)
- `public/styles.css` (layout, popups, themes)
