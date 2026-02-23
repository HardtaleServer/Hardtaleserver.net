# Changelog

All notable changes to this project are documented here.

## 2026-02-23 (v1.4.11)
- Added purchase toast notifications across all checkout paths:
  - Stripe return finalize (`/api/payments/stripe/complete`)
  - Stripe payment-intent finalize (`/api/payments/stripe/finalize-intent`)
  - Local checkout (`/api/cart/checkout`)
- Updated purchase success UX text to queue-aware messaging (`Rank processing (PENDING)`) instead of immediate rank-awarded wording.
- Added explicit error toasts for failed secure checkout and failed local checkout flows.
- Added admin fake-purchase toasts with purchase id context for faster debugging/support.
- Added pending-rank processing line in mobile drawer profile preview when rank fulfillment is awaiting server ACK.

## 2026-02-23 (v1.4.10)
- Retuned forum `@mention` preview-card anchor positioning to match requested dropdown-style placement under inline mentions (screenshot-aligned lower positioning).
- Updated mention-card horizontal offset behavior so preview placement better tracks the mention context inside forum/reply content blocks.
- Forced mention preview cards to render fully opaque (no inherited transparency/gradient bleed) with explicit theme-aware surface and text colors:
  - Light theme: solid white via `var(--bg)`
  - Dark theme: solid dark surface via `var(--bg)`
- Prevented mention preview cards from inheriting surrounding link/text color by enforcing card text color tokens.

## 2026-02-23 (v1.4.09)
- Removed forced-edit callouts from forum post cards and single-post forum views entirely (no inline forced-edit banner text in post body areas).
- Kept forced-edit moderation details scoped to revision history surfaces instead of post-body rendering.
- Fixed forum `@mention` hover/tap preview badge accuracy by hydrating preview cards with live profile metadata instead of partial forum snapshot data.
- Added backend public profile-card metadata endpoint for mention previews:
  - `GET /api/profile/public-card/:userId`
  - Returns linked status, display/owned rank, selected/equipped donor badge settings, staff badge settings, and visual preference flags.
- Updated forum mention preview rendering to respect equipped/selected donor badge settings (`showAllOwnedRankBadges` + `selectedOwnedBadge`) and real linked state.
- Added mention-profile metadata caching in forum UI to reduce repeated profile lookups while keeping badge/link display consistent.

## 2026-02-23 (v1.4.08)
- Fixed forum profile-card runtime crash on mention/profile open paths by restoring compatible owned-rank normalization handling in profile card rendering.
- Reworked forum `Past edits` control placement so it now lives in the right-side action row with post management controls instead of a separate status row.
- Updated forced-edit forum post presentation:
  - Removed legacy forced-edit header emphasis in post body area.
  - Added compact Hardtale-icon notice above post body (`Force edited by a staff member.`).
  - Kept detailed forced-edit history context inside the Past Edits modal.
- Improved forum `@mention` interaction model across desktop and mobile:
  - Clicking/tapping `@username` now opens the lightweight profile preview card first.
  - Selecting that preview card opens the full user profile modal.
  - Mention lookups now resolve more reliably when users are not already present in the local post/comment map.
- Expanded mention/member resolution to include registered Clerk users for better `@username` discovery and mention-target matching (not only previously active forum posters/commenters).
- Updated rank-label rendering for badge pills so `Registered` now displays as `Registered` (instead of reusing `Linked` text), ensuring the secondary profile preview pill can correctly represent user rank/donor rank.
- Added profile header friend-action visual updates:
  - Added `Add_Friend.svg` icon before `Add Friend` text in profile header actions.
  - Center-aligned profile modal header action row for a consistent top-of-card friend-action presentation.
- Added/used `Images/SVGs/Add_Friend.svg` as the shared icon asset for profile friend-action buttons.

## 2026-02-23 (v1.4.04)
- Added live notification toasts for new incoming bell notifications with the shared bell icon and Legend-style warning gradient treatment.
- Moved forced-edit emphasis from forum cards into the Past Edits modal, including Hardtale icon callouts and clearer forced-change history metadata.
- Enhanced forced edit moderation flow: staff-forced forum edits now automatically open a private support ticket for the affected user and notify them with a direct support deep-link.
- Added private messaging modal access from profile cards with linked-or-above gating and server-side enforcement.

## 2026-02-22 (v1.4.03)
- Updated Home hero join-state behavior for signed-out visitors: the previous `Unlinked` pill now renders as a `Sign Up` button.
- Kept signed-in behavior unchanged so linked users still see `Linked` and signed-in unlinked users still see `Unlinked` with the existing link flow.

## 2026-02-17 (v1.4.01)
- Awarded `Linked Up` achievement automatically for already-linked users on next login/status bootstrap.
- Preserved existing achievement notification flow so the unlock toast appears once without duplicate spam.
- Added heartbeat-driven Home server status rendering (online/offline + active players) using existing routes and auth.

## 2026-02-17 (v1.4.00)
- Added clean auth separation for linking/fulfillment API layers:
  - Browser/user flow stays Clerk-protected (`POST /api/link/claim`, `POST /api/link/redeem` compatibility).
  - Server/plugin flow now uses `SERVER_SECRET` on `/api/server/*` routes.
- Added plugin-facing server routes:
  - `POST /api/server/register-code`
  - `GET /api/server/pending-links`
  - `POST /api/server/ack-link`
  - `GET /api/server/pending-fulfillments`
  - `POST /api/server/ack-fulfillment`
- Added explicit `SERVER_SECRET` auth failure diagnostics (`missing_authorization` vs `invalid_server_secret`) to resolve plugin 403 debugging quickly.
- Added `fulfillment_jobs` Mongo collection/indexes and idempotent ack-finalization handling.
- Added `POST /api/link/info` for optional link-code UI feedback (valid/expired/claimed).
- Switched frontend `/link` submit call to `POST /api/link/claim` with `{ code }`.
- Added Stripe webhook queue mode for plugin fulfillment:
  - Webhook now enqueues fulfillment jobs instead of applying rewards immediately.
  - Added alias endpoint `POST /api/stripe/webhook` (existing `/api/payments/stripe/webhook` retained).

## 2026-02-17 (v1.3.99)
- Added reusable `CustomScrollbar` component and enabled global custom scrollbar styling with staff-gradient treatment for page scroll and key modal/drawer scroll containers.
- Replaced default scrollbar look across app overlays/popups with consistent themed track/thumb styling.
- Strengthened Hero rank icon visual treatment across shared rank pills/cards (including store variants) so Hero icon glow/blue identity matches donor-rank effects.
- Adjusted sticky store comparison header `Add to cart` button vertical offset so it no longer covers the `Chat Prefix` row.

## 2026-02-17 (v1.3.98)
- Enforced strict `/link` query parsing on frontend: only `/link?code=ABCDEFGH` is treated as valid deep-link input.
- Removed legacy link-query acceptance in the `/link` parser (`link`, `token`, `redeem`, bare query values, and path-segment code extraction are no longer accepted).
- Added telemetry-only bad-query safety net for `/link`: unexpected query keys are logged to console and sent non-blocking to `POST /api/telemetry/link-bad-query`.
- Added backend telemetry endpoint `POST /api/telemetry/link-bad-query` to capture malformed link query patterns without allowing legacy redemption.

## 2026-02-17 (v1.3.97)
- Switched `/link` to hosted link-code first mode by default: `/api/link/redeem` now returns `INVALID_CODE` when code is unknown instead of attempting downstream plugin redeem unless explicitly enabled.
- Added `LINK_REDEEM_DOWNSTREAM_FALLBACK_ENABLED` feature flag (default `false`) to keep old downstream redeem path opt-in only.
- Expanded plugin API auth to accept any configured shared token from `HARDTALE_API_TOKEN`, `FULFILLMENT_API_TOKEN`, or `LINK_SERVICE_AUTH_TOKEN`.
- Kept existing plugin outbound endpoints active (`/api/link/create`, `/api/link/status?playerUuid=...`, `/api/fulfillment/pending`, `/api/fulfillment/ack`) for Render-only architecture.

## 2026-02-17 (v1.3.96)
- Added plugin-auth `/api/link/create` to issue 8-character link codes for player UUIDs with Mongo-backed expiry.
- Extended `/api/link/status` to support plugin UUID checks (`?playerUuid=...`) with shared-token auth while preserving existing signed-in web-user status behavior.
- Added Mongo `link_codes` collection/indexes (`code` unique, `expiresAt` TTL) for outbound plugin linking.
- Updated `/api/link/redeem` to consume locally-issued hosted link codes first, then fallback to existing JWT/plugin-redeem flow for backward compatibility.
- Upgraded plugin auth header support to accept both `Authorization: Bearer ...` and `X-Service-Auth`.
- Updated fulfillment endpoints for plugin action-style polling:
  - `/api/fulfillment/pending` now returns `actions[]` (plus legacy `purchases[]`).
  - `/api/fulfillment/ack` now accepts `id` + `status` (`APPLIED`/`FAILED`) with idempotent final-state handling.

## 2026-02-17 (v1.3.95)
- Fixed `/store/ranks` card image overlap by constraining rank artwork height and adding a small spacing buffer above profile preview cards.

## 2026-02-17 (v1.3.94)
- Updated donor base rank colors in shared site palette: Legend -> `#F7C627`, Mythic -> `#E45579`.

## 2026-02-17 (v1.3.93)
- Added reusable `CountBadge` component for shared count-pill UI usage.
- Migrated cart/notification counters and store dropdown counters to use the shared count badge component.
- Added forum/news section count pills for quicker post-volume context.

## 2026-02-17 (v1.3.92)
- Restored empty-cart visibility behavior so the cart button hides when cart count is zero.

## 2026-02-17 (v1.3.91)
- Imported `PenumbraSerifStd-Bold` via `@font-face` for store in-game donor tag display.
- Applied the Penumbra font specifically to `[HERO]`, `[LEGEND]`, and `[MYTHIC]` tag text on `/store/ranks` card previews.

## 2026-02-17 (v1.3.90)
- Reordered `/store/ranks` cards to title -> artwork -> profile preview -> centered rank row for cleaner vertical hierarchy.
- Added in-game donor tag preview line (rank SVG + bracket format like `[HERO]`) above `Titles unlocked`.
- Added reusable `InlineDropdownToggle` component and moved rank perk lists into comment-style collapsible dropdown sections with count pills and accent arrow.
- Tuned Hero/Legend store icon/text visuals: subtle Hero glow/gradient pass and brighter/more noticeable Legend intensity.

## 2026-02-17 (v1.3.89)
- Scaled `/store` gateway PNG artwork up significantly on desktop and mobile for stronger visual coverage.
- Adjusted gateway card image sizing so artwork spans card width more effectively above section text.

## 2026-02-17 (v1.3.88)
- Increased `/store/ranks` card artwork size significantly and rebalanced card grid row heights so lower card content shifts down cleanly.
- Slightly increased rank label typography size on rank cards to better match the larger artwork presentation.

## 2026-02-17 (v1.3.87)
- Adjusted Rank Comparison sticky header offset so rank header cards sit higher and reduce overlap with top feature rows.
- Removed the `Feature` label from the extended comparison table first column header.
- Moved extended comparison Add to cart actions outside the table into a dedicated button row below the table.

## 2026-02-17 (v1.3.86)
- Reordered Store rank detail popup so the rank badge is centered directly below the rank title.
- Moved rank detail price to centered footer position below the Add to cart button for all rank popups.

## 2026-02-17 (v1.3.85)
- Reworked `/api/link/redeem` to enforce signed-in web auth first, before any JWT/code linking branch.
- Added dual-link strategy routing: verify Hytale JWT first (when provided/configured), then fallback to code redeem only when JWT is missing/invalid and a code is present.
- Normalized downstream plugin auth/path failures to `502 DOWNSTREAM_FAILURE` with `upstreamStatus` for diagnostics.
- Added `linkSource` (`JWT` or `CODE`) and `linkedAt` persistence/response fields on successful links.
- Added temporary structured failure logs for key `/api/link/redeem` branches (`401`/`403`/`502`).
- Tightened default plugin redeem endpoint path to `/api/v1/link/redeem`.

## 2026-02-17 (v1.3.84)
- Added `/link` deep-link auto-submit so valid URL codes (for example `/link?12345678`) redeem automatically once per code view.
- Added `/link` cooldown lock UI for rate-limited attempts with timer countdown and disabled non-interactive submit button state.
- Added red inline lock reason widget above the submit button while cooldown is active.

## 2026-02-17 (v1.3.83)
- Hardened frontend API auth helper by adding Clerk token fallback (`getToken()` when template token is unavailable) and default `credentials: include`.
- Added explicit `/link` 401 handling with a clear session-expired message and sign-in prompt trigger.
- Improved `/link` auth reliability during local/remote mode switches where session or token-template state can temporarily mismatch.

## 2026-02-17 (v1.3.82)
- Added `info` toast support with default `Images/SVGs/toasts/Info.svg` icon and neutral light-blue visual treatment.
- Added informational toast feedback for staff-forced forum edits so moderation actions can surface as neutral system events.
- Kept existing success/warning/error toast behavior unchanged while enabling shared `Info.svg` reuse across UI actions.

## 2026-02-17 (v1.3.81)
- Added clickable rank artwork on `/store/ranks` cards and comparison-header rank cells that opens a dedicated rank detail modal.
- Added a themed Store rank detail popup with placeholder artwork, condensed perk highlights, and direct add-to-cart action.
- Refined rank artwork placement/sizing so the placeholder rank image sits above rank labels consistently.

## 2026-02-17 (v1.3.37)
- Added changelog item visibility controls with stable item keys and admin-only filtering for sensitive/internal update notes.
- Restricted internal changelog notes to admin view while keeping player-facing patch history visible to all users.

## 2026-02-17 (v1.3.36)
- Switched `/link` to a route-triggered modal overlay while keeping `/link` and `/link?` deep-link parsing/verification behavior intact.
- Added dismissible modal close (`X`) and background-restore behavior so closing `/link` returns users to the previous page (or Home fallback).
- Added daily system-style link reminder notifications for unlinked users in the bell feed until the account is linked.
- Added local reminder read-state handling so local daily reminders do not interfere with server notification read sync.
- Added local dev startup mode (`npm run dev` / `npm run start:dev`) that forces `LINK_SERVICE_BASE_URL=http://127.0.0.1:8080`.
- Added frontend local-dev environment signal and a red `DEV MODE` pill that appears only in local dev mode.
- Added temporary Smurfis verified-link test override so profile/link status renders UUID `826ac345-e6fe-4ec7-a5fd-0b170b9d6439` for UI validation.
- Updated local linking docs to standardize `127.0.0.1` loopback testing defaults.
- Updated donor rank text/glow palette tokens: Legend is now `#9e7411` and Mythic is now `#e100ff`.

## 2026-02-16 (v1.3.35)
- Added role-tier staff visual hierarchy with distinct Dev/Admin/Mod/Helper gradient identities across staff pills, rank text, and staff badge chips.
- Added dynamic profile link-state badges (`🔓 Unlinked` / `🔗 Linked`) in profile card badge rows for clearer account-link visibility.
- Added linked-state and unlinked-state achievement badges and updated profile achievement cards to render live achievement title/icon values.
- Added fully wired rank-font system with persisted profile toggle (`/api/profile/rank-font`) and rendering support across comments, forum, and profile cards.
- Retuned donor rank identity visuals with balanced gradients and refined animation intensity, while preserving readability-first name text styling.
- Updated Store donor bonus copy to include gradient chat prefix and colored chat message perks.
- Added LP-ready donor/staff gradient response packs in the `RESPONSES/` folder.

## 2026-02-16 (v1.3.34)
- Fixed unlinked-user cart autosave noise by skipping `/api/cart` POST sync unless the account is linked.
- Reworked Store rank cards so rank title/icon sits above the profile preview card and removed duplicate rank text inside the preview row.
- Updated Store badge behavior so each rank card displays only its own rank badge while the clicked preview modal shows tier progression badges.
- Added reusable profile achievements card groundwork with circular badge slots for future API-based integrations.

## 2026-02-16 (v1.3.33)
- Expanded forum profile cards for your own profile to include all rank controls: display title, rank effects toggle, avatar effects toggle, and staff-gradient toggle (staff-only).
- Added per-rank hover glow effects to forum rank icons (Registered/Hero/Legend/Mythic/Staff) on forum author rows.
- Fixed a recurring desktop sticky-navbar issue where hovering Home/Forum nav buttons could cause the Settings button to visually glitch.
- Fixed staff/admin forum post rank labels so the STAFF gradient now renders correctly.
- Updated staff/admin gradient setting to toggle animation only while keeping the STAFF gradient effect enabled by default.
- Added reusable store-rank SVG assets (`RANK_HERO.svg`, `RANK_LEGEND.svg`, `RANK_MYTHIC.svg`) and switched Store rank icons to use them.
- Added staff-only profile badge options to show/hide badge and choose `STAFF` or `ICON STAFF` (HT icon), with badge gradient following staff gradient animation settings.
- Added `HardTale_H_HT.png` as a selectable logo icon option in mobile and desktop logo pickers.
- Wired staff rank chips to use the `ht_staff` SVG icon asset for STAFF rank icon rendering.
- Reworked desktop sticky navbar swap behavior to prevent duplicate nav/settings/auth mounts and reduce logo/nav flicker while scrolling and hovering.
- Added owned-rank badge pills to profile cards under a dedicated `Badges` section, including staff users who own store ranks.
- Reworked Store rank cards to use clickable Clerk-avatar profile previews with per-tier badge progression and unlocked title previews.
- Note: `Unregistered` title remains a reserved default state pending `/link` UUID authentication gating.
- Added shared rank config mapping for display labels and icon assignment to centralize future rank updates.
- Swapped rank icon mapping globally so Hero uses `shield` and Mythic uses `star`.
- Updated rank palette tokens to a centralized CSS source of truth and retuned Hero/Legend colors with matching hover glows.
- Updated Store tier button locking so lower tiers are disabled/greyed out when a higher tier is already in cart.
- Started migrating permissions and staff-role handling to server-authoritative APIs (foundation for live game-server synced permission updates).
- Updated profile-card owned-rank badges to use rank-aligned colors (with staff gradient behavior preserved for staff badge chips).
- Added a reusable profile achievements card section with circular badge slots and API-ready placeholder support for future Kyuubisoft Achievements/Titles/Rewards integration.

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
