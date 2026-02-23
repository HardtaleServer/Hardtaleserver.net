import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import htm from "htm";
import HardtaleLoader from "./components/HardtaleLoader.js";
import AuthorName from "./components/AuthorName.js";
import TimestampText from "./components/TimestampText.js";
import CommentIdentity from "./components/CommentIdentity.js";
import CommentMeta from "./components/CommentMeta.js";
import ForumSectionList from "./components/ForumSectionList.js";
import MobileDrawerLinks from "./components/MobileDrawerLinks.js";
import DesktopNavLinkButton from "./components/DesktopNavLinkButton.js";
import TicketInboxList from "./components/TicketInboxList.js";
import DesktopAuthButtons from "./components/DesktopAuthButtons.js";
import AccountActionButton from "./components/AccountActionButton.js";
import PageHero from "./components/PageHero.js";
import SupportTicketForm from "./components/SupportTicketForm.js";
import SupportTicketThread from "./components/SupportTicketThread.js";
import AppRoutes from "./components/AppRoutes.js";
import RankBadge from "./components/RankBadge.js";
import ProfilePreviewButton from "./components/ProfilePreviewButton.js";
import MobileDrawerProfilePreview from "./components/MobileDrawerProfilePreview.js";
import ProfileCardLayout from "./components/ProfileCardLayout.js";
import ProfileAchievementsCard from "./components/ProfileAchievementsCard.js";
import ProfileAchievementsPanel from "./components/ProfileAchievementsPanel.js";
import DeferredForumEditor from "./components/DeferredForumEditor.js";
import ForumRenderedMarkdown from "./components/ForumRenderedMarkdown.js";
import ProfileInfoTabs from "./components/ProfileInfoTabs.js";
import ProfileOptionsActions from "./components/ProfileOptionsActions.js";
import PopUp from "./components/PopUp.js";
import ToastSystem, { APP_TOAST_EVENT, createToastPayload, emitAppToast } from "./components/ToastSystem.js";
import SeoManager from "./components/SeoManager.js";
import SkillLeaderboardCard from "./components/SkillLeaderboardCard.js";
import NotificationsPanel from "./components/NotificationsPanel.js";
import SiteFooter from "./components/SiteFooter.js";
import SubscriptionsPage from "./components/SubscriptionsPage.js";
import CopyAction from "./components/CopyAction.js";
import GradientScrollArea from "./components/GradientScrollArea.js";
import InlineDropdownToggle from "./components/InlineDropdownToggle.js";
import CountBadge from "./components/CountBadge.js";
import CustomScrollbar from "./components/CustomScrollbar.js";
import StoreRankArt from "./components/StoreRankArt.js";
import { markdownExcerpt } from "./components/forumMarkdown.js";
import { getRankDisplayLabel, getRankIconType } from "./components/rankConfig.js";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  ClerkProvider,
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
  useClerk,
  useAuth,
  useUser,
} from "@clerk/clerk-react";

const html = htm.bind(React.createElement);

const SERVER_IP = "play.hardtale.net";
const PLAYER_COUNT = "60+";
const PUBLISHABLE_KEY = window.__CLERK_PUBLISHABLE_KEY__;
const STRIPE_PUBLISHABLE_KEY = window.__STRIPE_PUBLISHABLE_KEY__ || "";
const LOCAL_DEV_MODE = window.__LOCAL_DEV_MODE__ === true;
const LOGO_SRC = "/Images/IslandLogo/Hero_Island_Logo.png";
const THEME_KEY = "hardtale-theme";
const NAV_KEY = "hardtale-nav";
const MENU_SIDE_KEY = "hardtale-menu-side";
const MOBILE_NAV_STYLE_KEY = "hardtale-mobile-nav-style";
const LAST_NON_LINK_ROUTE_KEY = "hardtale-last-non-link-route";
const LINK_REMINDER_LAST_SHOWN_PREFIX = "hardtale-link-reminder-last-shown";
const LINK_REMINDER_READ_PREFIX = "hardtale-link-reminder-read";
const LINK_REMINDER_LOCAL_ID_PREFIX = "local-link-reminder";
const ACHIEVEMENT_TOAST_SEEN_PREFIX = "hardtale-achievement-toast-seen";
const SUPPORT_ERROR_CONTEXTS_KEY = "hardtale-support-error-contexts";
const SUPPORT_ERROR_MARKER_START = "[ATTACHED_ERROR_CONTEXT]";
const SUPPORT_ERROR_MARKER_END = "[/ATTACHED_ERROR_CONTEXT]";
const TICKET_COOLDOWN_KEY = "hardtale-ticket-cooldown";
const TICKET_COOLDOWN_MS = 60 * 60 * 1000;
const AVATAR_PREF_KEY_PREFIX = "hardtale-avatar-pref";
const LOGO_SIDE_KEY = "hardtale-logo-side";
const MOBILE_LOGO_STYLE_KEY = "hardtale-mobile-logo-style";
const MOBILE_ISLAND_KEY = "hardtale-mobile-island";
const DESKTOP_STICKY_STYLE_KEY = "hardtale-desktop-sticky-style";
const DESKTOP_STICKY_WIDE_KEY = "hardtale-desktop-sticky-wide";
const DESKTOP_STICKY_LOGO_STYLE_KEY = "hardtale-desktop-sticky-logo-style";
const COMMENTS_TOKEN_TEMPLATE = "hardtale-api-comments";
const UI_FLASH_KEY = "hardtale-ui-flash";
const TOAST_SHAPE_KEY = "hardtale-toast-shape";
const VERSION = "1.4.10";
const INK_PEN_ICON = "/Images/SVGs/ui/Ink_Pen.svg";
const STAFF_BADGE_ICON_SVG = "/Images/SVGs/ui/ht_staff_badge.svg";
const COPYRIGHT_ICON_SVG = "/Images/SVGs/ui/Copyright.svg";
const FEATURED_BADGE_ICON_SVG = "/Images/SVGs/ui/Featured.svg";
const DELETE_ICON_SVG = "/Images/SVGs/ui/Delete.svg";
const NOTIFICATIONS_ICON_SVG = "/Images/SVGs/ui/Notifications.svg";
const BASKET_ICON_SVG = "/Images/SVGs/ui/Basket.svg";
const DRAWER_MENU_ICON_SVG = "/Images/SVGs/ui/DrawerMenu.svg";
const LOGOUT_ICON_SVG = "/Images/SVGs/Logout.svg";
const ADD_FRIEND_ICON_SVG = "/Images/SVGs/Add_Friend.svg";
const WARNING_STATUS_ICON_SVG = "/Images/SVGs/toasts/Warning.svg";
const SUCCESS_STATUS_ICON_SVG = "/Images/SVGs/toasts/Success.svg";
const ERROR_STATUS_ICON_SVG = "/Images/SVGs/toasts/Error.svg";
const INFO_STATUS_ICON_SVG = "/Images/SVGs/toasts/Info.svg";
const HERO_RANK_ICON_SVG = "/Images/SVGs/ranks/RANK_HERO.svg";
const MOD_RANK_ICON_SVG = "/Images/SVGs/ranks/RANK_MOD.svg";
const ACHIEVEMENT_STAR_ICON_SVG = "/Images/SVGs/ui/Achievement_Star.svg";
const LEADERBOARD_ICON_SVG = "/Images/SVGs/ui/Leaderboard_SVG.svg";
const LINKED_STATUS_ICON_SVG = "/Images/SVGs/link/LINKED.svg";
const UNLINKED_STATUS_ICON_SVG = "/Images/SVGs/link/UNLINKED.svg";
const DEFAULT_PROFILE_AVATAR_SVG = "/Images/SVGs/ui/DEFAULT_PROFILE_AVATAR.svg";
const STORE_RANK_ICON_SVG = {
  star: "/Images/SVGs/ranks/RANK_PLACEHOLDER.svg",
  crown: "/Images/SVGs/ranks/RANK_LEGEND.svg",
  shield: "/Images/SVGs/ranks/RANK_HERO.svg",
  mythic: "/Images/SVGs/ranks/RANK_MYTHIC.svg",
};
const STAFF_EMAILS = new Set([
  "chashsmurfis@gmail.com",
  "hardtaleserver@gmail.com",
  "hytaleserver@gmail.com",
]);
const STAFF_USERNAME_KEYS = new Set([
  "hardtale",
  "hardtaleserver",
  "smurfis",
  "hardtaleteam",
  "system",
]);
const LOADER_VARIANTS = ["fiery", "golden", "greyscale", "icey"];
const INITIAL_LOADER_MIN_MS = 3200;
const AUTH_TRANSITION_LOADER_MS = 850;
const MOBILE_LOGO_MAP = {
  "logo-greyscale": "/Images/Logos/Logo_GreyScale.png",
  "logo-golden": "/Images/Logos/Logo_Golden.png",
  "logo-fiery": "/Images/Logos/Logo_Fiery.png",
  "logo-icey": "/Images/Logos/Logo_Icey.png",
  "icon-greyscale": "/assets/HardTale_H_GreyScale.png",
  "icon-golden": "/assets/HardTale_H_Golden.png",
  "icon-fiery": "/assets/HardTale_H_Fiery.png",
  "icon-icey": "/assets/HardTale_H_Icey.png",
  "icon-ht": "/assets/HardTale_H_HT.png",
};
const DESKTOP_LOGO_MAP = MOBILE_LOGO_MAP;
const CRITICAL_IMAGE_SOURCES = [
  LOGO_SRC,
  "/Images/SVGs/ui/SETTINGS_SVG.svg",
  BASKET_ICON_SVG,
  DRAWER_MENU_ICON_SVG,
  "/assets/HardTale_H_Fiery.png",
  "/assets/HardTale_H_Golden.png",
  "/assets/HardTale_H_GreyScale.png",
  "/assets/HardTale_H_Icey.png",
  "/assets/HardTale_H_HT.png",
  ...Object.values(MOBILE_LOGO_MAP),
];

function preloadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}
const VOTE_SITES = [
  {
    id: "hytale-online-servers",
    name: "Hytale Online Servers",
    url: "https://hytaleonlineservers.com/server-hardtale.2003",
    logo: "https://cdn.prod.website-files.com/6962221f328e943ce29c8b58/6964c285c8d187c91d08602c_hytale.webp",
  },
  {
    id: "hytale-game",
    name: "Hytale.Game",
    url: "#",
    logo: "https://cdn.prod.website-files.com/6962221f328e943ce29c8b58/69773d20ad16aae49ad0841e_logo-192px.webp",
  },
  {
    id: "hytale-top-100",
    name: "HytaleTop100",
    url: "https://hytaletop100.com/servers/hardtale",
    logo: "https://cdn.prod.website-files.com/6962221f328e943ce29c8b58/69773d53e0bcc3a08f96a0d9_icon223.png",
  },
  {
    id: "hytale-servers",
    name: "Hytale-Servers",
    url: "https://hytale-servers.com/server/hardtale",
    logo: "https://cdn.prod.website-files.com/6962221f328e943ce29c8b58/6964c89d5275ed5bfecb5271_ChatGPT%20Image%20Jan%2012%2C%202026%2C%2002_10_23%20AM.png",
  },
];
const CHANGELOG_ENTRIES = [
  {
    version: "1.4.07",
    date: "2026-02-23",
    items: [
      "Updated `/store/ranks` profile preview badges so each rank card now shows its own appropriate donor badge (Hero/Legend/Mythic) instead of shared account badge stacks.",
      "Added a dedicated mobile drawer profile preview component with separate logic from `store-profile-preview`, including linked state + displayed donor badge + optional staff tier badge in one compact row.",
      "Moved account-panel loading feedback into the profile modal body so background pages remain interactive while profile data resolves.",
      "Fixed forum post preview rendering to apply rich-text markdown output (`h1/h2/h3`, bold, italic, mentions) instead of plain text-only excerpts in `news-body-paragraph forum-post-preview`.",
    ],
  },
  {
    version: "1.4.06",
    date: "2026-02-23",
    items: [
      "Separated profile badge presentation into explicit sections: Link Status, Donor Badges, Staff Tier, and Groups / Guilds / Clans.",
      "Updated donor badge ownership logic so staff no longer implicitly unlock donor rank badges without owned donor tiers.",
      "Synced mobile drawer profile preview to selected donor/staff badge display settings and enabled dual badge display (staff + donor) when applicable.",
      "Added a planned `Add Friend` quick action in profile-card header actions (under modal close) for signed-in users viewing other profiles.",
      "Increased profile-card modal scrolling headroom and mobile overflow behavior to prevent badge title clipping in tall badge stacks.",
    ],
  },
  {
    version: "1.4.05",
    date: "2026-02-23",
    items: [
      "Added richer profile badge toasts: donor badge selection and staff badge mode changes now emit clear success/error feedback instead of silent saves.",
      "Normalized badge-control toast behavior across comment-thread, forum, and notification profile cards for consistent UX.",
      "Updated profile card modal header action layout so `Account Management` remains available directly under the modal close row for own-profile cards.",
    ],
  },
  {
    version: "1.4.04",
    date: "2026-02-23",
    items: [
      "Added live notification toasts for new incoming bell notifications with the shared bell icon and Legend-style warning gradient treatment.",
      "Moved forced-edit emphasis from forum cards into the Past Edits modal, including Hardtale icon callouts and clearer forced-change history metadata.",
      "Enhanced forced edit moderation flow: staff-forced forum edits now automatically open a private support ticket for the affected user and notify them with a direct support deep-link.",
      "Added private messaging modal access from profile cards with linked-or-above gating and server-side enforcement.",
    ],
  },
  {
    version: "1.4.02",
    date: "2026-02-18",
    items: [
      "Improved Home dark-mode readability for News/Forum preview cards and added short preview text snippets.",
      "Added a Home linked-status pill above Join now that opens `/link` modal and reflects linked/unlinked state.",
      "Refactored profile card tabs to `Badges`, `Ranks`, `Groups`, `Achievements` and moved staff-group selection into `Groups`.",
      "Removed linked/unlinked state achievements so `Welcome!` -> `Linking up` remains the first two core account achievements.",
      "Added side-aware custom mobile drawer scrollbar styling and sticky footer behavior to avoid settings-cog overlap/conflicts.",
    ],
  },
  {
    version: "1.4.01",
    date: "2026-02-17",
    items: [
      "Awarded `Linked Up` achievement automatically for already-linked users on next login/status bootstrap.",
      "Ensured linked achievement unlock still uses existing notification flow so achievement toast appears once.",
      "Added heartbeat-driven server online/offline + player count status to Home via existing backend routes.",
    ],
  },
  {
    version: "1.3.95",
    date: "2026-02-17",
    items: [
      "Fixed `/store/ranks` card artwork overlap by constraining rank image height to card row and adding a small spacer before profile preview.",
    ],
  },
  {
    version: "1.3.94",
    date: "2026-02-17",
    items: [
      "Updated donor base rank colors: Legend now `#F7C627` and Mythic now `#E45579` across shared rank palette styling.",
    ],
  },
  {
    version: "1.3.93",
    date: "2026-02-17",
    items: [
      "Added reusable `CountBadge` component for shared count-pill UI across cart, notifications, dropdown toggles, and section headers.",
      "Migrated cart/notification counters and store perks dropdown counter to `CountBadge` for consistent styling/behavior.",
      "Added forum/news header count pills (`News & Updates`, `Forum Highlights`, and `Posts in ...`) to surface post volume quickly.",
    ],
  },
  {
    version: "1.3.92",
    date: "2026-02-17",
    items: [
      "Restored empty-cart visibility behavior so the cart button hides when checkout cart count is zero.",
    ],
  },
  {
    version: "1.3.91",
    date: "2026-02-17",
    items: [
      "Imported `PenumbraSerifStd-Bold` via `@font-face` for store in-game rank tag rendering.",
      "Applied the Penumbra font specifically to `[HERO]`, `[LEGEND]`, and `[MYTHIC]` tag text on `/store/ranks` card previews.",
    ],
  },
  {
    version: "1.3.90",
    date: "2026-02-17",
    items: [
      "Reworked `/store/ranks` card order to title -> artwork -> profile preview -> centered rank tag for cleaner hierarchy.",
      "Added in-game donor tag preview line (SVG + bracket format like `[HERO]`) above `Titles unlocked`.",
      "Added reusable `InlineDropdownToggle` component and migrated rank perks into a comment-style dropdown section with count pill + accent arrow.",
      "Retuned Hero/Legend store icon/text effects: Hero subtle glow/gradient pass and brighter, more noticeable Legend intensity.",
    ],
  },
  {
    version: "1.3.89",
    date: "2026-02-17",
    items: [
      "Scaled `/store` gateway PNG card artwork up significantly on desktop and mobile for stronger visual coverage.",
      "Adjusted store gateway image sizing to better span card width above section titles.",
    ],
  },
  {
    version: "1.3.88",
    date: "2026-02-17",
    items: [
      "Increased `/store/ranks` card artwork size substantially and rebalanced card row heights so lower content shifts down cleanly.",
      "Slightly increased rank display typography sizing for Hero/Legend/Mythic card labels to match larger artwork presentation.",
    ],
  },
  {
    version: "1.3.87",
    date: "2026-02-17",
    items: [
      "Adjusted Rank Comparison sticky header offset to sit higher and reduce overlap with top feature rows.",
      "Removed `Feature` text from the extended comparison header first column.",
      "Moved extended comparison Add to cart actions outside the table into a dedicated row beneath the table.",
    ],
  },
  {
    version: "1.3.86",
    date: "2026-02-17",
    items: [
      "Reordered Store rank detail popup layout so rank badge is centered directly under rank title.",
      "Moved rank detail price to centered footer position below Add to cart button for all ranks.",
    ],
  },
  {
    version: "1.3.85",
    date: "2026-02-17",
    items: [
      "Reworked `/api/link/redeem` to enforce signed-in web auth before JWT/code strategy selection.",
      "Added JWT-first linking with code fallback, normalized downstream `502 DOWNSTREAM_FAILURE`, and persisted `linkSource`/`linkedAt`.",
    ],
  },
  {
    version: "1.3.84",
    date: "2026-02-17",
    items: [
      "Added `/link` URL auto-submit flow: valid deep-link codes now auto-fire once when present in route/query.",
      "Added `/link` redeem cooldown lock UI for rate-limited attempts with countdown timer and disabled non-interactive submit button.",
      "Added red inline cooldown info widget that explains lock reason while timer is active.",
    ],
  },
  {
    version: "1.3.83",
    date: "2026-02-17",
    items: [
      "Hardened frontend API auth helper: added Clerk token fallback (`getToken()` when template token is unavailable) and defaulted requests to `credentials: include`.",
      "Added explicit `/link` 401 handling with a clear session-expired message and sign-in prompt trigger.",
      "Improved `/link` auth resilience for local/remote mode switches where token templates or session state can temporarily mismatch.",
    ],
  },
  {
    version: "1.3.82",
    date: "2026-02-17",
    items: [
      "Added new `info` toast kind support with `Images/SVGs/toasts/Info.svg` default icon and info title fallback handling.",
      "Added informational forum toast feedback when a staff member force-edits another user's post.",
      "Prepared shared info icon usage for other neutral system actions while keeping existing success/warning/error behaviors unchanged.",
    ],
  },
  {
    version: "1.3.81",
    date: "2026-02-17",
    items: [
      "Added clickable rank artwork on `/store/ranks` cards and comparison header cells that opens a themed rank detail modal.",
      "Added a new Store rank detail popup with badge artwork, quick perk summary, and direct add-to-cart action.",
      "Refined rank-card artwork placement and sizing so placeholder rank images sit cleanly above rank labels.",
    ],
  },
  {
    version: "1.3.80",
    date: "2026-02-17",
    items: [
      "Added placeholder rank badge artwork blocks to `/store/ranks` cards above rank title/profile areas for future per-rank image assets.",
      "Wired card artwork sources per rank id while using `Store_Ranks.png` as the temporary placeholder image.",
    ],
  },
  {
    version: "1.3.79",
    date: "2026-02-17",
    items: [
      "Implemented desktop sticky rank header cells on `/store/ranks` with rank name, preview info, badges, pricing, and buy actions anchored above feature rows.",
      "Kept mobile table behavior unchanged while enhancing desktop-only comparison readability and purchase access during scroll.",
    ],
  },
  {
    version: "1.3.78",
    date: "2026-02-17",
    items: [
      "Fixed nested-route module loading by switching `index.html` asset paths to absolute URLs (`/app.js`, `/styles.css`).",
      "Resolved route-refresh MIME issue on paths like `/store/ranks` where module requests were previously falling back to HTML.",
    ],
  },
  {
    version: "1.3.77",
    date: "2026-02-17",
    items: [
      "Applied mobile-only sticky store comparison table behavior for `/store/ranks` (sticky first column + sticky header row).",
      "Updated mobile table cell spacing/border treatment to a separated-column style with alternating row backgrounds for readability.",
    ],
  },
  {
    version: "1.3.76",
    date: "2026-02-17",
    items: [
      "Moved Settings to modal-first behavior and removed the old inline dropdown interaction.",
      "Added desktop cart icon hover gradient treatment to match notifications/settings hover style.",
      "Moved mobile drawer Settings control below the profile preview card with side-aware left/right alignment.",
      "Updated Store gateway cards to PNG-first presentation (removed top SVG icon above artwork) and scaled artwork larger.",
    ],
  },
  {
    version: "1.3.75",
    date: "2026-02-17",
    items: [
      "Added Store gateway artwork tiles using new PNG assets for `Ranks`, `Gold`, and `Currency` cards.",
      "Applied staff-style animated gradient treatment to Store gateway section titles.",
    ],
  },
  {
    version: "1.3.74",
    date: "2026-02-17",
    items: [
      "Changed Store routing flow: `/store` is now a section gateway and the previous rank store experience moved to `/store/ranks`.",
      "Added large icon-based Store section buttons (`Ranks`, `Gold`, `Currency`) without bracket styling.",
      "Updated comparison buy rows so only one set is visible at a time (core row hides when extended feature rows are expanded).",
    ],
  },
  {
    version: "1.3.73",
    date: "2026-02-17",
    items: [
      "Adjusted Checkout popup sizing: wider desktop layout with internal scrolling and mobile max-height reduced so it no longer fills the entire screen.",
      "Added reusable `GradientScrollArea` component and applied custom gradient scrollbar styling for checkout/cart scrolling regions.",
    ],
  },
  {
    version: "1.3.72",
    date: "2026-02-17",
    items: [
      "Switched Hero rank icon rendering to the dedicated `Images/SVGs/ranks/RANK_HERO.svg` asset.",
      "Added moderator rank icon mapping to `Images/SVGs/ranks/RANK_MOD.svg` (shield).",
      "Updated Hero rank palette to a blue-tint gradient with matching glow treatment.",
    ],
  },
  {
    version: "1.3.71",
    date: "2026-02-17",
    items: [
      "Added direct remove-from-cart action on Store rank cards via top-right bin button when a tier is already in cart.",
      "Kept the main CTA focused on add/lock states while enabling instant cart removal without opening the cart popup.",
    ],
  },
  {
    version: "1.3.70",
    date: "2026-02-17",
    items: [
      "Reworked Store comparison into a visible Tebex-style rank matrix layout (rank columns + feature rows) instead of a hidden-only section.",
      "Added `Click here to see more features` expandable secondary feature table and repeated buy-button rows for quicker rank checkout.",
      "Kept gradient emphasis on rank labels/headings while using shared Success/Error SVG indicators for boolean feature cells.",
    ],
  },
  {
    version: "1.3.69",
    date: "2026-02-17",
    items: [
      "Added a toggleable Store rank comparison matrix (`View detailed comparison`) with mobile-safe horizontal scroll.",
      "Kept existing rank cards and gradient perk styling while adding a clearer feature-by-feature included/not-included view.",
      "Used shared toast `Success.svg` and `Error.svg` assets for comparison status icons to keep iconography consistent.",
    ],
  },
  {
    version: "1.3.68",
    date: "2026-02-17",
    items: [
      "Added Stripe webhook endpoint `/api/payments/stripe/webhook` with signature verification (`Stripe-Signature`) using `STRIPE_WEBHOOK_SECRET`.",
      "Added server-side Checkout Session fulfillment on `checkout.session.completed` and `checkout.session.async_payment_succeeded` so purchases still enqueue while users are offline.",
      "Kept fulfillment idempotent through existing unique purchase IDs, preserving safe plugin polling + ack flow via `/api/fulfillment/pending` and `/api/fulfillment/ack`.",
    ],
  },
  {
    version: "1.3.67",
    date: "2026-02-17",
    items: [
      "Moved mobile basket and drawer menu buttons to the new dedicated UI SVG assets for stable icon rendering.",
      "Renamed donor-rank SVG assets for cleaner conventions (`RANK_MYTHIC` now points to the new Mythic art, previous file moved to `RANK_PLACEHOLDER`).",
      "Updated shared rank icon mapping constants to match the new mythic/placeholder naming scheme.",
    ],
  },
  {
    version: "1.3.66",
    date: "2026-02-17",
    items: [
      "Matched mobile drawer selected-page styling to the same active effect used by top navigation.",
      "Play now remains the active mobile drawer item while the play/help module is open, then returns to the current route when closed.",
      "Standardized profile-card account action to an `Account Management` pill button and removed legacy Clerk label text.",
    ],
  },
  {
    version: "1.3.65",
    date: "2026-02-17",
    items: [
      "Added donor upgrade-difference pricing so owned lower donor ranks reduce the checkout cost of higher donor rank upgrades.",
      "Moved cart and Stripe payment calculations to server-authoritative upgrade pricing (subtotal, upgrade discount, final total).",
      "Updated Store checkout UI to show clear `Subtotal`, `Upgrade Discount`, and `Total` breakdown.",
    ],
  },
  {
    version: "1.3.64",
    date: "2026-02-17",
    items: [
      "Added the new `Operator` staff role and mapped Smurfis to Operator for profile/group badge display.",
      "Added staff role preview controls with tiered fallback paths (Operator > Developer > Administrator > Moderator > Helper > Staff).",
      "Applied Operator staff role styling with the same thematic visual treatment as Developer.",
    ],
  },
  {
    version: "1.3.63",
    date: "2026-02-17",
    items: [
      "Reduced desktop navbar hover re-renders to stop nav/cart flicker while mousing between top navigation buttons.",
      "Kept desktop cart button mounted even with zero items so it no longer disappears between auth/cart state updates.",
      "Expanded bug report/support flows with dedicated image/video evidence URL support and clickable link rendering in support threads.",
    ],
  },
  {
    version: "1.3.62",
    date: "2026-02-17",
    items: [
      "Fixed cart icon flicker by triggering cart pop animation only when cart count changes.",
    ],
  },
  {
    version: "1.3.61",
    date: "2026-02-17",
    items: [
      "Fixed mobile navbar visibility issues by keeping cart access visible even when cart count is zero.",
      "Kept mobile settings access consistently visible instead of hiding it behind signed-in state.",
      "Stabilized mobile drawer/header action rendering to prevent settings/cart disappearing behavior.",
    ],
  },
  {
    version: "1.3.60",
    date: "2026-02-17",
    items: [
      "Updated forum rich editor Tools button to use the admin panel SVG icon and proper toggle-open/toggle-close behavior.",
      "Removed `Write mode` label when composing a new post with mode tabs hidden.",
      "Added instinctive editor shortcuts: Ctrl+B (bold), Ctrl+I (italic), Ctrl+U (underline), while keeping existing undo/redo shortcuts.",
    ],
  },
  {
    version: "1.3.59",
    date: "2026-02-17",
    items: [
      "Added `ClerkUserProfile:` meta row to profile cards near Hytale Username/UUID for quick access to Clerk profile controls.",
      "Removed forum `Profile Options` chooser popup and now always opens Profile Card directly.",
      "Updated profile-card copy icon hover to use staff gradient treatment.",
    ],
  },
  {
    version: "1.3.58",
    date: "2026-02-17",
    items: [
      "Added reusable `CopyAction` component using `Copy.svg` for consistent copy UX across the site.",
      "Updated Home/Connect `Copy IP` buttons to use the shared copy component with icon-left label layout.",
      "Updated profile metadata copy UI to show a subtle grey copy icon before Hytale Username/UUID values (mobile-friendly) while keeping existing toast copy feedback.",
    ],
  },
  {
    version: "1.3.57",
    date: "2026-02-17",
    items: [
      "Moved profile-card Hytale metadata to the top of player cards and renamed fields to `Hytale Username:` and `UUID:`.",
      "Added click-to-copy behavior for Hytale Username/UUID values with clipboard toast feedback (no extra buttons added).",
    ],
  },
  {
    version: "1.3.56",
    date: "2026-02-17",
    items: [
      "Extracted `SubscriptionsPage` into `components/SubscriptionsPage.js` to keep `app.js` lighter and improve component reuse.",
    ],
  },
  {
    version: "1.3.55",
    date: "2026-02-17",
    items: [
      "Extracted reusable `SiteFooter` component from Layout to further reduce `app.js` size while preserving footer behavior and styling.",
    ],
  },
  {
    version: "1.3.54",
    date: "2026-02-17",
    items: [
      "Extracted Notifications panel rendering into reusable `components/NotificationsPanel.js` to reduce `app.js` size and keep UI behavior unchanged.",
    ],
  },
  {
    version: "1.3.53",
    date: "2026-02-17",
    items: [
      "Removed the icon from the main profile-card STAFF badge for a cleaner text-first STAFF chip.",
      "Updated linked-status badges: staff now resolves as Linked in profile badge stacks, Linked now uses a verified tick, and Unlinked now uses warning styling/icon.",
      "Hooked achievement unlock toasts to the new achievement SVG icon.",
      "Replaced Home leaderstats placeholder copy with a fake leaderboard preview card powered by enabled/disabled skill toggle configuration.",
    ],
  },
  {
    version: "1.3.52",
    date: "2026-02-17",
    items: [
      "Updated desktop news-comment left rail to show the active account badge stack under avatar (rank badge + staff pill when applicable).",
      "Moved comment Reply action into the responses block so Reply now appears directly above Responses.",
      "Adjusted desktop footer layout so Version and site links sit on the same row; Version now uses muted text styling by default.",
    ],
  },
  {
    version: "1.3.51",
    date: "2026-02-17",
    items: [
      "Adjusted mobile right-side drawer alignment for header controls and profile preview card placement.",
      "Raised mobile drawer profile preview position and enabled drawer panel scrolling to prevent bottom clipping on shorter screens.",
      "Updated mobile drawer nav label from `News & Updates` to `News`, and tightened drawer link spacing for cleaner vertical rhythm.",
      "Fine-tuned mobile profile-card overlay positioning to remove minor horizontal offset.",
    ],
  },
  {
    version: "1.3.50",
    date: "2026-02-17",
    items: [
      "Reorganized SVG assets into grouped folders (`ui`, `link`, `ranks`, `toasts`, `brand`) under `Images/SVGs`.",
      "Updated all frontend references to the new SVG paths so icons/badges/toasts continue working without behavior changes.",
    ],
  },
  {
    version: "1.3.49",
    date: "2026-02-17",
    items: [
      "Extracted global modal implementation into reusable `PopUp` component module.",
      "Kept all modal behavior the same while reducing `app.js` size and improving component reuse.",
    ],
  },
  {
    version: "1.3.48",
    date: "2026-02-17",
    items: [
      "Optimized `ProfileInfoTabs` to render only the active tab panel instead of both badges/groups content.",
      "Memoized reusable UI components (`ProfileInfoTabs`, `ProfileOptionsActions`, `DeferredForumEditor`) to reduce avoidable re-renders.",
    ],
  },
  {
    version: "1.3.47",
    date: "2026-02-17",
    items: [
      "Extracted reusable `ProfileInfoTabs` component and applied it across comment, forum, and notification profile cards.",
      "Reduced duplicated profile-tab markup to improve maintainability and keep behavior consistent across views.",
    ],
  },
  {
    version: "1.3.46",
    date: "2026-02-17",
    items: [
      "Extracted deferred rich-editor loading into a reusable `DeferredForumEditor` component.",
      "Extracted shared profile-choice action buttons into reusable `ProfileOptionsActions` component for comment/forum profile option modals.",
    ],
  },
  {
    version: "1.3.45",
    date: "2026-02-17",
    items: [
      "Optimized initial load by lazy-loading the rich forum editor only when users open create/edit flows.",
      "Split forum markdown rendering into a lightweight standalone component so normal page/forum reading no longer pulls the full editor runtime.",
    ],
  },
  {
    version: "1.3.44",
    date: "2026-02-17",
    items: [
      "Added route-aware SEO manager for dynamic title, description, canonical URL, Open Graph, and Twitter metadata updates.",
      "Added structured data (JSON-LD WebSite schema) for consistent search-engine context.",
      "Improved runtime performance with external connection prewarming and deferred Stripe script loading in index head.",
    ],
  },
  {
    version: "1.3.43",
    date: "2026-02-17",
    items: [
      "Enabled the custom Hardtale loading overlay while profile cards and profile previews load from API data.",
      "Extended loader usage to forum post fetch states so longer loads use the same branded loading experience.",
    ],
  },
  {
    version: "1.3.42",
    date: "2026-02-17",
    items: [
      "Added /link result toasts for both success and failure outcomes.",
      "Added persistent achievement-toast dedupe so old achievement notifications no longer re-toast on each reload.",
      "Expanded Smurfis profile groups for testing visibility (Developer, Administrator, Moderator, Helper, Staff) and treated test-link override as linked for store checks.",
      "Compacted legacy achievement documents by stripping unused bulky fields when profile achievements are loaded.",
    ],
  },
  {
    version: "1.3.41",
    date: "2026-02-17",
    items: [
      "Added embedded Stripe Payment Element directly inside the existing cart popup so checkout stays fully on-site and in-flow.",
      "Added Stripe PaymentIntent server APIs for secure in-modal payment creation and finalization.",
      "Kept legacy checkout/session routes as fallback paths without removing prior functionality.",
    ],
  },
  {
    version: "1.3.40",
    date: "2026-02-17",
    items: [
      "Added Stripe checkout integration with secure server-side session creation from current cart items.",
      "Added Stripe return/finalize flow on /store to complete paid sessions and apply rank grants.",
      "Kept existing local cart checkout endpoint as a fallback path when Stripe is not configured.",
    ],
  },
  {
    version: "1.3.39",
    date: "2026-02-17",
    items: [
      "Moved Home philosophy cards (Performance First, True to the Game, Who We Are) into a dedicated About Us page at /about-us.",
      "Added About Us footer navigation link while keeping the top navbar unchanged.",
    ],
  },
  {
    version: "1.3.38",
    date: "2026-02-17",
    items: [
      "Rearranged Home join panel so Join now and How? appear above the server IP row.",
      "Moved Copy IP next to play.hardtale.net and added animated Hardtale accent gradient styling to the IP text.",
    ],
  },
  {
    version: "1.3.37",
    date: "2026-02-17",
    items: [
      "Added changelog item visibility controls with stable item keys and admin-only filtering for sensitive/internal update notes.",
      "Restricted internal changelog notes to admin view while keeping player-facing patch history visible to all users.",
    ],
  },
  {
    version: "1.3.36",
    date: "2026-02-17",
    items: [
      "Switched /link to a route-triggered modal overlay while keeping /link and /link? deep-link parsing/verification behavior intact.",
      "Added dismissible /link modal close (X) with background page restore so users return to prior route (or Home fallback).",
      "Added daily system-style link reminder notifications for unlinked users in the bell feed until account linking is completed.",
      "Added local reminder read-state handling so local daily reminders do not interfere with server notification unread/read sync.",
      "Added local dev startup mode (npm run dev / npm run start:dev) that forces LINK_SERVICE_BASE_URL=http://127.0.0.1:8080.",
      "Added frontend local-dev environment signal and red DEV MODE pill that renders only in local dev mode.",
      "Added temporary Smurfis verified-link test override for UI validation using UUID 826ac345-e6fe-4ec7-a5fd-0b170b9d6439.",
      "Updated donor rank text/glow tokens: Legend -> #9e7411 and Mythic -> #e100ff.",
    ],
  },
  {
    version: "1.3.35",
    date: "2026-02-16",
    items: [
      "Added role-tier staff visual hierarchy with distinct Dev/Admin/Mod/Helper gradient identities across staff pills, rank text, and staff badges.",
      "Added dynamic profile link-state badge chips (`🔓 Unlinked` / `🔗 Linked`) in profile card badges and aligned linked/unlinked display flow.",
      "Added linked-state and unlinked-state achievement badges and updated profile achievement cards to render live server title/icon data.",
      "Added fully wired rank-font system with profile toggle (`Enable rank font styling`), backend persistence, and forum/comment/profile rendering support.",
      "Retuned donor rank visual identity using balanced gradient styles and updated store rank bonuses to include gradient prefix and colored chat message perks.",
      "Added LP-ready prefix gradient response packs under `RESPONSES/` for donor and staff role formatting.",
    ],
  },
  {
    version: "1.3.34",
    date: "2026-02-16",
    items: [
      "Fixed unlinked-user cart autosave noise by skipping /api/cart POST sync unless the account is linked.",
      "Reworked Store rank cards so rank title/icon sits above the profile preview card and removed duplicate rank text inside the preview row.",
      "Updated Store badge behavior so each rank card displays only its own rank badge while the clicked preview modal shows tier progression badges.",
      "Added reusable profile achievements card groundwork with circular badge slots for future API-based integrations.",
    ],
  },
  {
    version: "1.3.33",
    date: "2026-02-16",
    items: [
      "Expanded forum profile cards for your own user to include rank effects, avatar effects, and staff-gradient toggles (staff-only where applicable).",
      "Added per-rank hover glow effects to forum rank icons for clearer visual identity on author rows.",
      "Fixed a recurring desktop sticky-navbar issue where hovering Home/Forum nav buttons could cause the Settings button to visually glitch.",
      "Fixed staff/admin forum post rank labels so the STAFF gradient now renders correctly.",
      "Updated the staff/admin gradient setting to toggle animation only while keeping the STAFF gradient effect enabled by default.",
      "Added reusable Store rank SVG assets and switched Store rank icons to use shared SVG files.",
      "Added staff-only profile badge options to show/hide badge and choose STAFF text-only vs ICON STAFF (HT icon), with gradient behavior tied to staff gradient animation.",
      "Added HardTale_H_HT icon as a selectable mobile/desktop logo option.",
      "Updated STAFF rank icon rendering to use the ht_staff SVG asset across rank chips.",
      "Reworked desktop sticky navbar swap behavior to prevent duplicate nav/settings/auth mounts and reduce logo/nav flicker while scrolling and hovering.",
      "Added owned-rank badge pills under a Badges section on profile cards, including staff users who own store ranks.",
      "Reworked Store rank cards with clickable Clerk-avatar profile previews, tier badge progression, and unlocked title previews.",
      "Noted Unregistered title as a reserved default pending /link UUID authentication gating implementation.",
      "Added shared rank config mapping for centralized rank display labels and icon assignment updates.",
      "Swapped rank icon mapping globally so Hero uses shield and Mythic uses star.",
      "Updated rank color tokens into centralized CSS variables and retuned Hero/Legend visuals with matching hover glow behavior.",
      "Updated Store tier locking so lower rank buttons disable when a higher tier is already in the cart.",
      "Started moving permissions and staff-role handling to server-authoritative APIs, with planned live game-server permission sync.",
      "Updated profile-card owned-rank badge chips to use rank color styling while preserving staff gradient treatment for staff chips.",
      "Added a reusable profile achievements card section with circular badge placeholders and future API integration notes.",
    ],
  },
  {
    version: "1.3.29",
    date: "2026-02-16",
    items: [
      "Added forum post edit/delete APIs with owner-or-staff authorization checks.",
      "Added forum UI controls so post owners and staff can edit or delete posts directly.",
      "Added STAFF FORCED EDIT marking/glow on moderated posts and sent targeted notifications when staff edit/remove another user's post.",
    ],
  },
  {
    version: "1.3.28",
    date: "2026-02-16",
    items: [
      "Forum profile cards now include self-service display title settings when you open your own profile.",
      "Applied rank-title updates immediately across forum post list and selected post views after saving.",
    ],
  },
  {
    version: "1.3.27",
    date: "2026-02-16",
    items: [
      "Reply notifications now show the actual replying user and carry their profile metadata.",
      "Added notification-panel profile peek action so recipients can open the replier's profile card directly from the bell popup.",
      "Kept reply notification deep-link behavior intact for quick jump to the exact thread location.",
    ],
  },
  {
    version: "1.3.26",
    date: "2026-02-16",
    items: [
      "Switched /link feature gating to LINKING_ENABLED with local mock mode when disabled.",
      "Kept /link URL parsing active while simulating redeem outcomes for invalid/expired, already used, rate limited, and unavailable states.",
      "Preserved the same UI flow so enabling live server integration only requires flipping the env flag.",
    ],
  },
  {
    version: "1.3.25",
    date: "2026-02-16",
    items: [
      "Added LINK_REDEEM_ENABLED feature flag so /link codes can be captured while live game-server redeem is disabled.",
      "Expanded /link UX states for linked, invalid/expired code, already used, rate limited, and server unavailable.",
      "Added backend error code passthrough for plugin redeem responses.",
    ],
  },
  {
    version: "1.3.24",
    date: "2026-02-16",
    items: [
      "Added account linking APIs: /api/link/status and /api/link/redeem with Mongo persistence for webUserId <-> playerUuid.",
      "Integrated /link UI with authenticated verify flow, success/error states, and linked account status display.",
      "Added server-to-server redeem call plumbing for plugin integration via LINK_SERVICE_BASE_URL and LINK_SERVICE_AUTH_TOKEN.",
    ],
  },
  {
    version: "1.3.23",
    date: "2026-02-16",
    items: [
      "Updated Registered rank color to #479284.",
      "Reworked Mythic rank visuals to a more distinct rare/cosmic cyan palette so it no longer closely matches Legend.",
    ],
  },
  {
    version: "1.3.22",
    date: "2026-02-16",
    items: [
      "Fixed desktop navbar hover conflicts that caused nav/cart/notification flicker when sticky mode was active.",
      "Moved notification unread tracking to the server per user for cross-device consistency, including a mark-read API.",
      "Updated Support Center with ticket inbox timestamps and admin-visible ticket categories, auto-delete of closed tickets after 24 hours, and user notifications when staff reply (with View deep-link to the ticket).",
      "Updated /link code entry from 6 digits to 8 digits.",
    ],
  },
  {
    version: "1.3.21",
    date: "2026-02-16",
    items: [
      "Updated mobile notifications layout so timestamp and author line are right-aligned within each notification card.",
    ],
  },
  {
    version: "1.3.20",
    date: "2026-02-16",
    items: [
      "Added profile title selection on your own comment profile card (Registered/Hero/Legend/Mythic), persisted in Clerk metadata with unlock validation.",
      "Gave staff full title access by default and added staff-only profile toggle to show/hide the staff badge.",
      "Fixed reply targeting so notifications go only to the replied user (never yourself), and added clickable reply references with author/snippet that jump to the target comment or reply.",
      "Updated rank badge rendering so only STAFF keeps gradient while other ranks use per-rank colors; saved rank prefix mapping to data/rank-prefixes.json.",
      "Improved Home panels with direct View buttons for news items, added a forum highlights mini-panel with deep links, and reserved a leaderstats placeholder for MMO Trees integration.",
    ],
  },  {
    version: "1.3.18",
    date: "2026-02-14",
    items: [
      "Added /link auth page with six-digit code input UX (auto-advance, keyboard navigation, and paste support).",
      "Moved comment/reply identity to username-first staff-aware rendering and added staff reflectance animation.",
      "Redesigned comment responses as a full-width dropdown section with improved mobile stacking/alignment.",
      "Added avatar profile cards from comment/reply images, including staff badge metadata for future badge expansion.",
      "Updated admin delete actions to hard-delete news and notifications from MongoDB when deleting entries.",
    ],
  },
  {
    version: "1.3.17",
    date: "2026-02-13",
    items: [
      "Moved 404 tools into a redacted modal and added /panel console command support.",
      "Made public News feed user-facing only and consolidated news/notification management inside the admin panel.",
      "Migrated reactions, news, notifications, and carts to Mongo-backed APIs.",
      "Added server-side cart checkout that awards highest purchased rank (Hero/Legend/Mythic) and updates comment rank tags.",
      "Fixed mobile cart UI issues by removing duplicate drawer cart controls, hiding empty cart button states, and improving checkout layout.",
    ],
  },
  {
    version: "1.3.4",
    date: "2026-02-11",
    items: [
      "Added visible timestamps to notification entries in the bell panel.",
      "Added visible timestamps to news posts and home news updates.",
      "Improved timestamp formatting consistency across activity feeds.",
    ],
  },
  {
    version: "1.3.3",
    date: "2026-02-11",
    items: [
      "Added /home as a route alias for the root home page.",
      "Updated home nav active-state handling so both / and /home map to Home.",
    ],
  },
  {
    version: "1.3.2",
    date: "2026-02-11",
    items: [
      "Corrected Clerk key configuration after a mismatched key update.",
      "Resolved auth handshake verification failures caused by invalid key pairing.",
      "Stabilized production authentication initialization for live sessions.",
    ],
  },
  {
    version: "1.3.1",
    date: "2026-02-11",
    items: [
      "Kept the loader for initial page boot only, with direct navigation after first load.",
      "Added a short loader transition specifically for sign-in and sign-out state changes.",
      "Moved admin tools to the 404 route and restricted visibility to admin users.",
    ],
  },
  {
    version: "1.3.0",
    date: "2026-02-11",
    items: [
      "Added admin notification publishing and management (create, delete, and featured toggles).",
      "Replaced static notifications with API-backed delivery through the notification bell for signed-in users.",
      "Added featured notification prioritization and live notification refresh handling.",
    ],
  },
  {
    version: "1.2.9",
    date: "2026-02-11",
    items: [
      "Hardened production configuration handling and moved environment configuration to Render-managed variables.",
      "Improved signed-in loading reliability in live environments.",
      "Moved the Play action to the last position in the mobile drawer menu list.",
    ],
  },
  {
    version: "1.2.8",
    date: "2026-02-11",
    items: [
      "Added mobile logo picker with icon/logo grids and solid-only display.",
      "Separated floating island from navbar logos for mobile-only hiding.",
      "Reorganized asset folders (IslandLogo, SVGs) and loader component structure.",
    ],
  },
  {
    version: "1.2.7",
    date: "2026-02-11",
    items: [
      "Expanded mobile logo icon options and fixed icon selection in the drawer settings.",
      "Added a flip animation to the HardtaleLoader.",
      "Adjusted mobile navbar logo sizing.",
    ],
  },
  {
    version: "1.2.6",
    date: "2026-02-11",
    items: [
      "Added HardtaleLoader component with rotating H icon variants for load transitions.",
      "Introduced the Vote page with branded site logos and updated navigation links.",
      "Fixed mobile topbar transparency behavior when the logo is hidden (solid mode).",
      "Multiple mobile UI alignment tweaks and settings cleanup.",
    ],
  },
  {
    version: "1.2.5",
    date: "2026-02-11",
    items: [
      "Added a Vote page with branded site logos and updated navigation links.",
      "Removed the players-online pill from the Vote page layout.",
    ],
  },
  {
    version: "1.2.4",
    date: "2026-02-11",
    items: [
      "Added desktop logo side setting that repositions the logo, nav, and auth buttons.",
      "Introduced Direct Connect help modal with a How? button in the join row.",
      "Refined footer layout to align Version and Copyright on one line.",
    ],
  },
  {
    version: "1.2.3",
    date: "2026-02-11",
    items: [
      "Adjusted mobile drawer width and menu-side alignment behavior.",
      "Added conditional ordering and offsets for mobile menu/cart buttons.",
      "Refined drawer header button positioning and settings menu offsets.",
      "Tweaked mobile navbar spacing and click sparkle cooldown.",
    ],
  },
  {
    version: "1.2.2",
    date: "2026-02-11",
    items: [
      "Added an interactive Version footer that opens a changelog popup.",
      "Styled changelog entries for a notification-style modal.",
    ],
  },
  {
    version: "1.2.1",
    date: "2026-02-11",
    items: [
      "Added mobile navbar style options (transparent/solid) and solid mini-logo treatment.",
      "Reworked mobile header layout with a Discord info pill and tighter logo spacing.",
      "Updated server status pill to include active players and cleaned up Discord info card.",
      "Refined mobile navbar styling, layering, and shadow behavior.",
    ],
  },
  {
    version: "1.2.0",
    date: "2026-02-11",
    items: [
      "Reworked the home layout with full-width hero/play section and a split stats/news panel.",
      "Added mobile drawer navigation with customizable menu side, improved header behavior, and refined menu styling.",
      "Implemented featured news toggles, sorting, and a dynamic featured callout with admin controls.",
      "Added notification and cart count badges plus refined admin/news tooling.",
      "Tuned mobile spacing, copy IP placement, and Discord CTA icon/button layout.",
    ],
  },
  {
    version: "1.1.0",
    date: "2026-02-11",
    items: [
      "Expanded the Store experience with rank-style icons and an \"About Ranks\" section.",
      "Added ticket support modal with sign-in gating, email prefill, cooldown timer, and thank-you state.",
      "Implemented cart quantity controls with remove icons and improved cart styling.",
      "Introduced a subscription portal page and a custom 404 screen.",
      "Refreshed the visual theme with blue/red accents and card gradients.",
      "Updated the server address to play.hardtale.net.",
    ],
  },
  {
    version: "1.0.5",
    date: "2026-02-09",
    items: [
      "Built the home page layout and hero section.",
      "Added the admin utility for publishing and managing news.",
      "Integrated Clerk authentication (sign in/sign up, user menu, admin checks).",
      "Added site navigation and routing foundations.",
      "Introduced core UI scaffolding (cards, popups, settings UI).",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-02-08",
    items: [
      "Rebuilt the site as a React app served from public/ with a Node/Express backend.",
      "Added Clerk auth (sign in/sign up), admin-only news publishing, and news delete support.",
      "Implemented a Store page with React Router and a cart/checkout popup.",
      "Added a settings popup with theme and navbar placement controls.",
      "Added notifications UI with a popup list (system notifications).",
      "Added server-side logo fallback at /logo.png and favicon/social meta tags.",
      "Added mobile/desktop navbar placement defaults (center on mobile, left on desktop).",
      "Added light/dark/system theme support and local storage persistence.",
    ],
  },
];

const SAMPLE_STORE = [
  {
    id: "rank-hero",
    name: "Hero Rank",
    price: 6.99,
    blurb:
      "10% passive XP boost, daily 15-min XP boost, weekly kit (small XP potion + minor utility potions), 1 extra /home, gradient chat prefix + colored chat messages, slight auction/listing boost, no raw damage bonuses, bold badge",
    icon: "star",
  },
  {
    id: "rank-legend",
    name: "Legend Rank",
    price: 14.0,
    blurb:
      "20% passive XP boost, daily 30-min XP boost, weekly kit (medium XP potions + resource bundle), 2 extra /home, 1 monthly global boost (30 min), gradient chat prefix + colored chat messages, reduced teleport cooldown, priority queue, bold badge",
    icon: "crown",
  },
  {
    id: "rank-mythic",
    name: "Mythic Rank",
    price: 24.0,
    blurb:
      "30% passive XP boost, daily 1hr XP boost, weekly kit (large XP potions + rare crafting materials), 3 extra /home, 2 monthly global boosts, premium gradient chat prefix + colored chat messages, special cosmetic title glow, particle aura cosmetic, guild banner cosmetic, bold badge",
    icon: "shield",
  },
];
const STORE_ITEM_BY_ID = new Map(SAMPLE_STORE.map((item) => [item.id, item]));
const RANK_TIER_ORDER = {
  "rank-hero": 1,
  "rank-legend": 2,
  "rank-mythic": 3,
};
const PROFILE_DISPLAY_TITLES = ["Staff", "Registered", "Hero", "Legend", "Mythic"];
const OWNED_RANK_ORDER = ["Hero", "Legend", "Mythic"];
const STORE_BADGE_ORDER = ["Hero", "Legend", "Mythic"];
const OWNED_RANK_TIER = {
  Unregistered: 0,
  Registered: 0,
  Hero: 1,
  Legend: 2,
  Mythic: 3,
};
const STORE_PREVIEW_TITLES_BY_ID = {
  "rank-hero": ["Hero"],
  "rank-legend": ["Hero", "Legend"],
  "rank-mythic": ["Hero", "Legend", "Mythic"],
};
const HOME_FORUM_PREVIEW_SECTIONS = [
  "updates",
  "bug-reports",
  "help-feedback",
  "suggestions",
  "feature-requests",
  "forum-help",
];

function buildCartFromIds(entries = []) {
  if (!Array.isArray(entries)) return [];
  const seen = new Set();
  return entries
    .map((entry) => {
      const id = typeof entry === "string" ? entry : String(entry?.id || "");
      if (!id || seen.has(id)) return null;
      const base = STORE_ITEM_BY_ID.get(id);
      if (!base) return null;
      seen.add(id);
      return { ...base };
    })
    .filter(Boolean);
}

function normalizeInternalRoute(value, fallback = "/") {
  const raw = String(value || "").trim();
  if (!raw.startsWith("/")) return fallback;
  return raw;
}

function readLastNonLinkRoute() {
  try {
    return normalizeInternalRoute(localStorage.getItem(LAST_NON_LINK_ROUTE_KEY), "/");
  } catch {
    return "/";
  }
}

function writeLastNonLinkRoute(value) {
  const normalized = normalizeInternalRoute(value, "/");
  try {
    localStorage.setItem(LAST_NON_LINK_ROUTE_KEY, normalized);
  } catch {
    // noop
  }
}

function getLocalDateStamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function linkReminderStorageKey(userId) {
  return `${LINK_REMINDER_LAST_SHOWN_PREFIX}:${String(userId || "").trim()}`;
}

function readLinkReminderStamp(userId) {
  const key = linkReminderStorageKey(userId);
  if (!key.endsWith(":")) {
    try {
      return String(localStorage.getItem(key) || "").trim();
    } catch {
      return "";
    }
  }
  return "";
}

function writeLinkReminderStamp(userId, stamp) {
  const key = linkReminderStorageKey(userId);
  if (key.endsWith(":")) return;
  try {
    localStorage.setItem(key, String(stamp || "").trim());
  } catch {
    // noop
  }
}

function readLinkReminderReadStamp(userId) {
  const key = `${LINK_REMINDER_READ_PREFIX}:${String(userId || "").trim()}`;
  if (key.endsWith(":")) return "";
  try {
    return String(localStorage.getItem(key) || "").trim();
  } catch {
    return "";
  }
}

function writeLinkReminderReadStamp(userId, stamp) {
  const key = `${LINK_REMINDER_READ_PREFIX}:${String(userId || "").trim()}`;
  if (key.endsWith(":")) return;
  try {
    localStorage.setItem(key, String(stamp || "").trim());
  } catch {
    // noop
  }
}

function buildDailyLinkReminderId(userId, stamp = getLocalDateStamp()) {
  return `${LINK_REMINDER_LOCAL_ID_PREFIX}:${String(userId || "").trim()}:${String(stamp || "").trim()}`;
}

function isLocalLinkReminderId(value) {
  return String(value || "").startsWith(`${LINK_REMINDER_LOCAL_ID_PREFIX}:`);
}

function buildDailyLinkReminderNotification(userId) {
  const today = getLocalDateStamp();
  const reminderRead = readLinkReminderReadStamp(userId) === today;
  return {
    id: buildDailyLinkReminderId(userId, today),
    title: "Link Your UUID",
    message: "Use /link in-game, then verify on web to unlock linked account perks and store access.",
    author: "System",
    featured: false,
    readMoreUrl: "/link",
    createdAt: new Date().toISOString(),
    readByMe: reminderRead,
  };
}

function readSupportErrorContexts() {
  try {
    const raw = localStorage.getItem(SUPPORT_ERROR_CONTEXTS_KEY);
    const parsed = JSON.parse(raw || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((entry) => ({
        id: String(entry?.id || "").trim(),
        title: String(entry?.title || "System Error").trim(),
        message: String(entry?.message || "").trim(),
        createdAt: String(entry?.createdAt || new Date().toISOString()),
      }))
      .filter((entry) => entry.id && entry.message)
      .slice(-20)
      .reverse();
  } catch {
    return [];
  }
}

function writeSupportErrorContexts(list) {
  try {
    localStorage.setItem(SUPPORT_ERROR_CONTEXTS_KEY, JSON.stringify(Array.isArray(list) ? list : []));
  } catch {
    // noop
  }
}

function addSupportErrorContext(entry) {
  const next = {
    id: `errctx-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    title: String(entry?.title || "System Error").trim() || "System Error",
    message: String(entry?.message || "").trim(),
    createdAt: String(entry?.createdAt || new Date().toISOString()),
  };
  if (!next.message) return "";
  const existing = readSupportErrorContexts().reverse();
  const merged = [...existing, next].slice(-20);
  writeSupportErrorContexts(merged);
  return next.id;
}

function buildTicketBodyWithAttachedError(baseBody, errorContext) {
  const body = String(baseBody || "").trim();
  if (!errorContext || !errorContext.message) return body;
  const title = String(errorContext.title || "System Error").trim() || "System Error";
  const createdAt = String(errorContext.createdAt || new Date().toISOString());
  const details = String(errorContext.message || "").trim();
  const marker = [
    SUPPORT_ERROR_MARKER_START,
    `Title: ${title}`,
    `When: ${createdAt}`,
    "Details:",
    details,
    SUPPORT_ERROR_MARKER_END,
  ].join("\n");
  return `${body}\n\n${marker}`.trim();
}

function parseEvidenceLinks(rawValue) {
  const unique = new Set();
  String(rawValue || "")
    .split(/\r?\n|,/)
    .map((entry) => entry.trim())
    .filter(Boolean)
    .forEach((entry) => {
      if (/^https?:\/\//i.test(entry)) unique.add(entry);
    });
  return [...unique].slice(0, 10);
}

function appendEvidenceLinksToBody(baseBody, rawLinks) {
  const body = String(baseBody || "").trim();
  const links = parseEvidenceLinks(rawLinks);
  if (links.length === 0) return body;
  const evidenceBlock = ["### Evidence Links", ...links.map((link) => `- ${link}`)].join("\n");
  return body ? `${body}\n\n${evidenceBlock}` : evidenceBlock;
}

function serializeCartItems(cart = []) {
  return cart
    .map((item) => ({ id: String(item?.id || "") }))
    .filter((item) => item.id && STORE_ITEM_BY_ID.has(item.id));
}

function applyRankTierRules(cart = [], nextItem) {
  const nextRankTier = RANK_TIER_ORDER[nextItem.id] || 0;
  if (!nextRankTier) {
    return cart.some((entry) => entry.id === nextItem.id) ? cart : [...cart, nextItem];
  }

  const filtered = cart.filter((entry) => {
    const tier = RANK_TIER_ORDER[entry.id] || 0;
    return tier === 0 || tier > nextRankTier;
  });
  const hasHigherTier = filtered.some((entry) => (RANK_TIER_ORDER[entry.id] || 0) > nextRankTier);
  if (hasHigherTier) return filtered;
  return [...filtered.filter((entry) => entry.id !== nextItem.id), nextItem];
}

function normalizeOwnedRankLabel(value) {
  const label = String(value || "").trim();
  return Object.prototype.hasOwnProperty.call(OWNED_RANK_TIER, label) ? label : "Unregistered";
}

function normalizeOwnedRank(value) {
  return normalizeOwnedRankLabel(value);
}

function isDonorOwnedRank(value) {
  const normalized = normalizeOwnedRankLabel(value);
  return normalized === "Hero" || normalized === "Legend" || normalized === "Mythic";
}

function buildOwnedRankBadges(ownedRank, isStaffUser = false, options = {}) {
  const showAllOwnedRankBadges = options?.showAllOwnedRankBadges !== false;
  const selectedOwnedBadge = normalizeOwnedRankLabel(options?.selectedOwnedBadge || "");
  const tier = OWNED_RANK_TIER[normalizeOwnedRankLabel(ownedRank)] || 0;
  if (tier <= 0) return [];
  const unlocked = OWNED_RANK_ORDER.filter((rank) => (OWNED_RANK_TIER[rank] || 0) <= tier);
  if (unlocked.length <= 1 || showAllOwnedRankBadges) return unlocked;
  if (unlocked.includes(selectedOwnedBadge)) return [selectedOwnedBadge];
  return [unlocked[unlocked.length - 1]];
}

function resolvePrimaryOwnedBadge(ownedRank, showAllOwnedRankBadges = true, selectedOwnedBadge = "") {
  const badges = buildOwnedRankBadges(ownedRank, false, {
    showAllOwnedRankBadges,
    selectedOwnedBadge,
  });
  return badges.length > 0 ? badges[badges.length - 1] : "Unregistered";
}

function normalizeProfileGroupLabel(value = "") {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 40);
}

function deriveProfileGroups(entry) {
  const incoming = Array.isArray(entry?.groups) ? entry.groups : [];
  const groups = [];
  const seen = new Set();
  function add(label) {
    const value = normalizeProfileGroupLabel(label);
    if (!value) return;
    const key = value.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    groups.push(value);
  }
  for (const item of incoming) add(item);
  if (groups.length === 0) {
    if (entry?.isStaffUser || entry?.staff) add("Staff");
    const staffRoleLabel = toStaffPillTitle(entry?.staffRole || entry?.authorStaffRole || "");
    if (staffRoleLabel) add(staffRoleLabel);
    if (entry?.ownedRank && String(entry.ownedRank) !== "Unregistered") add(entry.ownedRank);
    add(entry?.linkedAccount ? "Linked" : "Unlinked");
  }
  return groups;
}

function applyTheme(value) {
  const root = document.body;
  if (!value || value === "system") {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.dataset.theme = prefersDark ? "dark" : "light";
    return;
  }
  root.dataset.theme = value;
}

function useTheme() {
  const [theme, setTheme] = useState(
    localStorage.getItem(THEME_KEY) || "system",
  );

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange() {
      if (theme === "system") {
        applyTheme("system");
      }
    }
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  function toggleLightDark() {
    setTheme((prev) => {
      if (prev === "light") return "dark";
      if (prev === "dark") return "light";
      return "dark";
    });
  }

  return { theme, setTheme, toggleLightDark };
}

function defaultNavPlacement() {
  if (window.matchMedia("(max-width: 860px)").matches) {
    return "center";
  }
  return "left";
}

function useNavPlacement() {
  const [placement, setPlacement] = useState(
    localStorage.getItem(NAV_KEY) || defaultNavPlacement(),
  );

  useEffect(() => {
    localStorage.setItem(NAV_KEY, placement);
  }, [placement]);

  return { placement, setPlacement };
}

function useMenuSide() {
  const [menuSide, setMenuSide] = useState(
    localStorage.getItem(MENU_SIDE_KEY) || "left",
  );

  useEffect(() => {
    localStorage.setItem(MENU_SIDE_KEY, menuSide);
  }, [menuSide]);

  return { menuSide, setMenuSide };
}

function useMobileNavStyle() {
  const [mobileNavStyle, setMobileNavStyle] = useState(
    localStorage.getItem(MOBILE_NAV_STYLE_KEY) || "transparent",
  );

  useEffect(() => {
    localStorage.setItem(MOBILE_NAV_STYLE_KEY, mobileNavStyle);
  }, [mobileNavStyle]);

  return { mobileNavStyle, setMobileNavStyle };
}

function useLogoSide() {
  const [logoSide, setLogoSide] = useState(
    localStorage.getItem(LOGO_SIDE_KEY) || "left",
  );

  useEffect(() => {
    localStorage.setItem(LOGO_SIDE_KEY, logoSide);
  }, [logoSide]);

  return { logoSide, setLogoSide };
}

function useMobileLogoStyle() {
  const [mobileLogoStyle, setMobileLogoStyle] = useState(
    localStorage.getItem(MOBILE_LOGO_STYLE_KEY) || "logo-greyscale",
  );

  useEffect(() => {
    const fallback =
      typeof mobileLogoStyle === "string" && mobileLogoStyle.startsWith("icon")
        ? "icon-greyscale"
        : "logo-greyscale";
    const normalized = MOBILE_LOGO_MAP[mobileLogoStyle]
      ? mobileLogoStyle
      : fallback;
    if (normalized !== mobileLogoStyle) {
      setMobileLogoStyle(normalized);
      return;
    }
    localStorage.setItem(MOBILE_LOGO_STYLE_KEY, normalized);
  }, [mobileLogoStyle]);

  return { mobileLogoStyle, setMobileLogoStyle };
}

function useMobileIsland() {
  const [showMobileIsland, setShowMobileIsland] = useState(
    localStorage.getItem(MOBILE_ISLAND_KEY) !== "false",
  );

  useEffect(() => {
    localStorage.setItem(MOBILE_ISLAND_KEY, String(showMobileIsland));
  }, [showMobileIsland]);

  return { showMobileIsland, setShowMobileIsland };
}

function useDesktopStickyStyle() {
  const [desktopStickyStyle, setDesktopStickyStyle] = useState(
    localStorage.getItem(DESKTOP_STICKY_STYLE_KEY) || "solid",
  );

  useEffect(() => {
    localStorage.setItem(DESKTOP_STICKY_STYLE_KEY, desktopStickyStyle);
  }, [desktopStickyStyle]);

  return { desktopStickyStyle, setDesktopStickyStyle };
}

function useDesktopStickyWide() {
  const stored = localStorage.getItem(DESKTOP_STICKY_WIDE_KEY);
  const [desktopStickyWide, setDesktopStickyWide] = useState(
    stored ? stored === "true" : true,
  );

  useEffect(() => {
    localStorage.setItem(DESKTOP_STICKY_WIDE_KEY, String(desktopStickyWide));
  }, [desktopStickyWide]);

  return { desktopStickyWide, setDesktopStickyWide };
}

function useDesktopStickyLogoStyle() {
  const [desktopStickyLogoStyle, setDesktopStickyLogoStyle] = useState(
    localStorage.getItem(DESKTOP_STICKY_LOGO_STYLE_KEY) || "logo-greyscale",
  );

  useEffect(() => {
    const fallback =
      typeof desktopStickyLogoStyle === "string" &&
      desktopStickyLogoStyle.startsWith("icon")
        ? "icon-greyscale"
        : "logo-greyscale";
    const normalized = DESKTOP_LOGO_MAP[desktopStickyLogoStyle]
      ? desktopStickyLogoStyle
      : fallback;
    if (normalized !== desktopStickyLogoStyle) {
      setDesktopStickyLogoStyle(normalized);
      return;
    }
    localStorage.setItem(DESKTOP_STICKY_LOGO_STYLE_KEY, normalized);
  }, [desktopStickyLogoStyle]);

  return { desktopStickyLogoStyle, setDesktopStickyLogoStyle };
}

function useUiFlash() {
  const [uiFlashEnabled, setUiFlashEnabled] = useState(
    localStorage.getItem(UI_FLASH_KEY) !== "false",
  );

  useEffect(() => {
    localStorage.setItem(UI_FLASH_KEY, String(uiFlashEnabled));
  }, [uiFlashEnabled]);

  return { uiFlashEnabled, setUiFlashEnabled };
}

function useToastShape() {
  const [toastShape, setToastShape] = useState(
    localStorage.getItem(TOAST_SHAPE_KEY) === "rounded" ? "rounded" : "block",
  );

  useEffect(() => {
    const normalized = toastShape === "rounded" ? "rounded" : "block";
    if (normalized !== toastShape) {
      setToastShape(normalized);
      return;
    }
    localStorage.setItem(TOAST_SHAPE_KEY, normalized);
  }, [toastShape]);

  return { toastShape, setToastShape };
}

function useNews() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/news")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setNews(Array.isArray(data.news) ? data.news : []);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setError("Unable to load news right now.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { news, setNews, loading, error };
}

function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        setLoading(false);
      })
      .catch(() => {
        if (!alive) return;
        setError("Unable to load notifications right now.");
        setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return { notifications, setNotifications, loading, error };
}

function getUserEmail(user) {
  return (
    user?.primaryEmailAddress?.emailAddress ||
    user?.emailAddresses?.[0]?.emailAddress ||
    ""
  );
}

function formatUsernameForDisplay(value) {
  const username = String(value || "").trim().slice(0, 80);
  if (!username) return "";
  if (/[A-Z]/.test(username)) return username;
  return `${username.charAt(0).toUpperCase()}${username.slice(1)}`;
}

function getUserDisplayName(user) {
  return (
    formatUsernameForDisplay(user?.username) ||
    getUserEmail(user) ||
    user?.fullName ||
    "User"
  );
}

function formatTimestamp(value) {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return date.toLocaleString([], {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function triggerFlash(buttonEl) {
  if (!buttonEl?.classList) return;
  buttonEl.classList.remove("flash");
  void buttonEl.offsetWidth;
  buttonEl.classList.add("flash");
  setTimeout(() => {
    if (buttonEl?.classList) buttonEl.classList.remove("flash");
  }, 420);
}

function isStaffLabel(label = "") {
  const text = String(label || "").trim().toLowerCase();
  if (!text) return false;
  if (text === "staff") return true;
  if (text === "operator" || text === "op") return true;
  if (text === "developer" || text === "dev") return true;
  if (text === "admin" || text === "administrator") return true;
  if (text === "moderator" || text === "mod") return true;
  if (text === "helper") return true;
  if (STAFF_EMAILS.has(text)) return true;
  const key = text.replace(/[\s_-]+/g, "");
  return STAFF_USERNAME_KEYS.has(key);
}

function toStaffPillTitle(value = "") {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (!key) return "";
  if (key === "operator" || key === "op") return "Operator";
  if (key === "moderator" || key === "mod") return "Moderator";
  if (key === "developer" || key === "dev") return "Developer";
  if (key === "admin" || key === "administrator") return "Administrator";
  if (key === "helper") return "Helper";
  if (key === "staff") return "Staff";
  return "";
}

function normalizeStaffRoleKey(value = "") {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (!key) return "";
  if (key === "operator" || key === "op") return "op";
  if (key === "developer" || key === "dev") return "dev";
  if (key === "admin" || key === "administrator") return "admin";
  if (key === "moderator" || key === "mod") return "mod";
  if (key === "helper") return "helper";
  if (key === "staff") return "staff";
  return "";
}

function resolveStaffRoleKey(entry) {
  if (!entry) return "";
  const candidates = [
    entry?.authorStaffRole,
    entry?.staffRole,
    entry?.authorRole,
    entry?.authorStaffTitle,
    entry?.role,
    entry?.staffTitle,
    entry?.authorRank,
    entry?.rankLabel,
  ];
  for (const candidate of candidates) {
    const role = normalizeStaffRoleKey(candidate);
    if (role) return role;
  }
  return "";
}

function resolveStaffRoleClass(entry) {
  const role = resolveStaffRoleKey(entry);
  if (!role) return "";
  return `staff-role-${role}`;
}

function resolveStaffPillTitle(entry) {
  if (!entry) return "";
  const explicitRole = resolveStaffRoleKey(entry);
  if (explicitRole === "op") return "Operator";
  if (explicitRole === "dev") return "Developer";
  if (explicitRole === "admin") return "Administrator";
  if (explicitRole === "mod") return "Moderator";
  if (explicitRole === "helper") return "Helper";
  if (explicitRole === "staff") return "Staff";
  const candidates = [
    entry?.authorRole,
    entry?.authorStaffTitle,
    entry?.role,
    entry?.staffTitle,
    entry?.authorRank,
    entry?.rankLabel,
  ];
  for (const candidate of candidates) {
    const title = toStaffPillTitle(candidate);
    if (title) return title;
  }
  if (entry?.authorIsStaff) return "Staff";
  return "";
}

function renderNewsRichText(text) {
  const source = String(text || "").trim();
  if (!source) return [];
  const blocks = source.split(/\n{2,}/).map((entry) => entry.trim()).filter(Boolean);
  return blocks.map((block, index) => {
    if (block.startsWith("### ")) {
      return html`<h5 key=${`news-h5-${index}`} className="news-body-heading h5">${block.slice(4)}</h5>`;
    }
    if (block.startsWith("## ")) {
      return html`<h4 key=${`news-h4-${index}`} className="news-body-heading h4">${block.slice(3)}</h4>`;
    }
    if (block.startsWith("# ")) {
      return html`<h3 key=${`news-h3-${index}`} className="news-body-heading h3">${block.slice(2)}</h3>`;
    }
    const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
    const isList = lines.length > 1 && lines.every((line) => line.startsWith("- "));
    if (isList) {
      return html`<ul key=${`news-list-${index}`} className="news-body-list">
        ${lines.map((line, lineIndex) => html`<li key=${`news-li-${index}-${lineIndex}`}>${line.slice(2)}</li>`)}
      </ul>`;
    }
    return html`<p key=${`news-p-${index}`} className="news-body-paragraph">${block}</p>`;
  });
}
async function apiFetchWithToken(getToken, isSignedIn, url, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (isSignedIn && getToken) {
    let token = "";
    try {
      token = String((await getToken({ template: COMMENTS_TOKEN_TEMPLATE })) || "").trim();
    } catch {
      token = "";
    }
    if (!token) {
      try {
        token = String((await getToken()) || "").trim();
      } catch {
        token = "";
      }
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: options.credentials || "include",
  });
  return response;
}

function NewsCard({ item, focusCommentId, focusReplyId, autoOpenComments }) {
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [expandedDescription, setExpandedDescription] = useState(false);
  const descriptionText = String(item.description || "");
  const descriptionLimit = 350;
  const hasLongDescription = descriptionText.length > descriptionLimit;
  const visibleDescription =
    hasLongDescription && !expandedDescription
      ? `${descriptionText.slice(0, descriptionLimit).trimEnd()}...`
      : descriptionText;

  return html`
    <article className="news-card" data-news-id=${item.id}>
      ${item.imageUrl
        ? html`<div className="news-photo" style=${{ backgroundImage: `url(${item.imageUrl})` }}></div>`
        : html``}
      <div className="news-header">
        <div className="news-title-row">
          ${item.featured ? renderFeaturedBadge(false) : html``}
          <h3>${item.title}</h3>
        </div>
      </div>
      <div className="news-body">
        ${hasLongDescription && !expandedDescription
          ? html`<p className="news-body-paragraph">${visibleDescription}</p>`
          : renderNewsRichText(visibleDescription)}
      </div>
      <div className="news-meta">
        <div className="news-meta-left">
          <${TimestampText} value=${item.createdAt} formatTimestamp=${formatTimestamp} />
        </div>
        <div className="news-meta-right">
          <span className="news-meta-author">
            By <${AuthorName} value=${item.author} isStaffLabel=${isStaffLabel} />
          </span>
          <div className="news-meta-actions">
            ${item.imageUrl
              ? html`<button
                  type="button"
                  className="button ghost-btn news-image-preview-btn"
                  onClick=${() => setShowImagePreview(true)}
                >
                  View image
                </button>`
              : html``}
            ${item.readMoreUrl
              ? html`<a href=${item.readMoreUrl} target="_blank" rel="noreferrer">
                  Read source
                </a>`
              : html``}
          </div>
          ${hasLongDescription
            ? html`<button
                type="button"
                className="ghost-btn news-read-more-btn"
                onClick=${() => setExpandedDescription((prev) => !prev)}
              >
                ${expandedDescription ? "Show less >" : "Read more >"}
              </button>`
            : html``}
        </div>
      </div>
      <${PollPanel} newsId=${item.id} />
      <${ReactionBar} itemType="news" itemId=${item.id} />
      <${CommentThread}
        newsId=${item.id}
        focusCommentId=${focusCommentId}
        focusReplyId=${focusReplyId}
        autoOpen=${autoOpenComments}
        commentsLocked=${Boolean(item.commentsLocked)}
      />

      <${PopUp}
        show=${showImagePreview}
        onClose=${() => setShowImagePreview(false)}
        title=${item.title || "Image preview"}
        className="image-preview-overlay"
      >
        <div className="image-preview-modal">
          <img
            className="image-preview-modal-image"
            src=${item.imageUrl}
            alt=${item.title || "News image preview"}
            loading="lazy"
          />
        </div>
      <//>
    </article>
  `;
}
function PollPanel({ newsId }) {
  const { getToken, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState([]);
  const [loading, setLoading] = useState(true);
  const [choice, setChoice] = useState([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadPoll() {
      try {
        const response = await fetch(`/api/polls?newsId=${encodeURIComponent(newsId)}`);
        if (!response.ok) return;
        const data = await response.json();
        if (!alive) return;
        setPoll(data.poll);
        setVoted(Array.isArray(data.voted) ? data.voted : []);
        setChoice(Array.isArray(data.voted) ? data.voted : []);
      } catch {}
      if (alive) setLoading(false);
    }
    loadPoll();
    return () => {
      alive = false;
    };
  }, [newsId]);

  if (loading || !poll) return null;

  const hasVoted = voted.length > 0;
  const totalVotes = poll.totalVotes || 0;

  function toggleOption(id) {
    if (poll.multiple) {
      setChoice((prev) =>
        prev.includes(id) ? prev.filter((entry) => entry !== id) : [...prev, id],
      );
    } else {
      setChoice([id]);
    }
  }

  async function submitVote() {
    if (!isSignedIn) {
      if (openSignIn) openSignIn({});
      return;
    }
    if (!choice.length) {
      setStatus("Select an option.");
      return;
    }
    setStatus("Voting...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/polls/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId, optionIds: choice }),
      });
      if (!response.ok) throw new Error("Vote failed");
      const data = await response.json();
      setPoll(data.poll);
      setVoted(Array.isArray(data.voted) ? data.voted : []);
      setChoice(Array.isArray(data.voted) ? data.voted : []);
      setStatus("");
    } catch {
      setStatus("Vote failed.");
    }
  }

  return html`
    <div className="poll-panel">
      <div className="poll-question">${poll.question}</div>
      <div className="poll-options">
        ${poll.options.map((option) => {
          const isSelected = choice.includes(option.id);
          const percent = totalVotes
            ? Math.round((option.count / totalVotes) * 100)
            : 0;
          return html`<button
            className=${`poll-option ${isSelected ? "selected" : ""} ${hasVoted ? "voted" : ""}`}
            type="button"
            onClick=${() => !hasVoted && toggleOption(option.id)}
          >
            <span className="poll-option-text">${option.text}</span>
            ${hasVoted
              ? html`<span className="poll-option-meta">${option.count} Â· ${percent}%</span>`
              : html``}
          </button>`;
        })}
      </div>
      ${hasVoted
        ? html`<div className="poll-footer muted">
            ${totalVotes} vote${totalVotes === 1 ? "" : "s"}
          </div>`
        : html`<div className="poll-footer">
            <button className="button primary" type="button" onClick=${submitVote}>
              Vote
            </button>
            ${status ? html`<span className="muted">${status}</span>` : html``}
          </div>`}
    </div>
  `;
}

function ReactionBar({ itemType, itemId }) {
  const { getToken, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [reactions, setReactions] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [pickerFailed, setPickerFailed] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    let alive = true;
    async function loadPicker() {
      try {
        await import(
          "https://cdn.jsdelivr.net/npm/emoji-picker-element@1.21.3/index.js"
        );
        if (!alive) return;
        setPickerLoaded(true);
      } catch {
        if (!alive) return;
        setPickerFailed(true);
      }
    }
    loadPicker();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!showPicker || !pickerLoaded || !pickerRef.current) return;
    const pickerEl = pickerRef.current;
    function onEmojiClick(event) {
      const emoji = event?.detail?.unicode || event?.detail?.emoji;
      if (!emoji) return;
      toggleReaction(emoji);
      setShowPicker(false);
    }
    pickerEl.addEventListener("emoji-click", onEmojiClick);
    return () => pickerEl.removeEventListener("emoji-click", onEmojiClick);
  }, [showPicker, pickerLoaded]);


  useEffect(() => {
    let alive = true;
    async function loadReactions() {
      try {
        const response = await apiFetchWithToken(
          getToken,
          isSignedIn,
          `/api/reactions?type=${itemType}&id=${encodeURIComponent(itemId)}`,
        );
        if (!response.ok) return;
        const data = await response.json();
        if (!alive) return;
        setReactions(Array.isArray(data.reactions) ? data.reactions : []);
      } catch {}
    }
    loadReactions();
    return () => {
      alive = false;
    };
  }, [itemType, itemId, getToken, isSignedIn]);

  function updateOptimistic(emoji) {
    const existing = reactions.find((entry) => entry.emoji === emoji);
    const myCount = reactions.filter((entry) => entry.reactedByMe).length;
    if (!existing?.reactedByMe && myCount >= 2) {
      setError("You can only react with two emojis.");
      return null;
    }
    const next = reactions.map((entry) => ({ ...entry }));
    const target = next.find((entry) => entry.emoji === emoji);
    if (target) {
      if (target.reactedByMe) {
        target.count -= 1;
        target.reactedByMe = false;
      } else {
        target.count += 1;
        target.reactedByMe = true;
      }
    } else {
      next.push({ emoji, count: 1, reactedByMe: true });
    }
    return next.filter((entry) => entry.count > 0).sort((a, b) => b.count - a.count);
  }

  async function toggleReaction(emoji) {
    if (!isSignedIn) {
      if (openSignIn) openSignIn({});
      return;
    }
    setError("");
    const optimistic = updateOptimistic(emoji);
    if (!optimistic) return;
    setReactions(optimistic);
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: itemType, id: itemId, emoji }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data?.error || "Reaction failed.");
        const refresh = await apiFetchWithToken(
          getToken,
          true,
          `/api/reactions?type=${itemType}&id=${encodeURIComponent(itemId)}`,
        );
        if (refresh.ok) {
          const refreshed = await refresh.json();
          setReactions(Array.isArray(refreshed.reactions) ? refreshed.reactions : []);
        }
        return;
      }
      const data = await response.json();
      setReactions(Array.isArray(data.reactions) ? data.reactions : []);
    } catch {
      setError("Reaction failed.");
    }
  }

  return html`
    <div className="reaction-bar">
      ${reactions.length === 0
        ? html`<span className="muted reaction-empty">Be the first to react.</span>`
        : reactions.map(
            (entry) => html`<button
              className=${`reaction-pill ${entry.reactedByMe ? "active" : ""}`}
              onClick=${() => toggleReaction(entry.emoji)}
              title="React"
              type="button"
            >
              <span>${entry.emoji}</span>
              <span>${entry.count}</span>
            </button>`,
          )}
      <button
        className="reaction-pill reaction-add"
        type="button"
        onClick=${() => setShowPicker(!showPicker)}
        title="Add reaction"
      >
        +
      </button>
      <div className="pad-top"></div>
      ${showPicker
        ? html`<div className="reaction-picker">
            ${pickerLoaded
              ? html`<emoji-picker
                  class="reaction-picker-panel"
                  ref=${pickerRef}
                ></emoji-picker>`
              : html`<div className="muted">Loading emojis...</div>`}
            ${pickerFailed
              ? html`<div className="reaction-error">Failed to load emoji picker.</div>`
              : html``}
          </div>`
        : html``}
      ${error ? html`<div className="reaction-error">${error}</div>` : html``}
    </div>
  `;
}

function CommentThread({
  newsId,
  focusCommentId,
  focusReplyId,
  autoOpen,
  commentsLocked = false,
  threadOwnerUserId = "",
}) {
  const { getToken, isSignedIn, userId } = useAuth();
  const { openSignIn, openUserProfile } = useClerk();
  const [open, setOpen] = useState(Boolean(autoOpen));
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [draft, setDraft] = useState("");
  const [composerStatus, setComposerStatus] = useState("");
  const [actionStatusByComment, setActionStatusByComment] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [editingReplyKey, setEditingReplyKey] = useState(null);
  const [editingReplyText, setEditingReplyText] = useState("");
  const [openResponses, setOpenResponses] = useState({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileInfoTab, setProfileInfoTab] = useState("badges");
  const [profileTitleStatus, setProfileTitleStatus] = useState("");
  const [profileTitleSaving, setProfileTitleSaving] = useState(false);
  const [profileStaffBadgeSaving, setProfileStaffBadgeSaving] = useState(false);
  const [profileStaffBadgeIconSaving, setProfileStaffBadgeIconSaving] = useState(false);
  const [profileStaffGradientSaving, setProfileStaffGradientSaving] = useState(false);
  const [profileRankEffectsSaving, setProfileRankEffectsSaving] = useState(false);
  const [profileRankFontSaving, setProfileRankFontSaving] = useState(false);
  const [profileDonorGradientSaving, setProfileDonorGradientSaving] = useState(false);
  const [profileOwnedBadgesSaving, setProfileOwnedBadgesSaving] = useState(false);
  const [profileAvatarVfxSaving, setProfileAvatarVfxSaving] = useState(false);
  const [profileCardLoading, setProfileCardLoading] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [replyTargets, setReplyTargets] = useState({});
  const [selfProfileChooserOpen, setSelfProfileChooserOpen] = useState(false);
  const [selfProfileChooserEntry, setSelfProfileChooserEntry] = useState(null);
  const focusAppliedRef = useRef(false);
  const loadCommentsRetryTimerRef = useRef(0);
  const isForumThread = String(newsId || "").startsWith("forum:");

  function resolveEntryUserId(entry) {
    return String(entry?.userId || entry?.authorUserId || entry?.createdBy || "").trim();
  }

  async function loadComments(retryAttempt = 0) {
    try {
      const response = await fetch(`/api/comments?newsId=${encodeURIComponent(newsId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const next = Array.isArray(data.comments) ? data.comments : [];
      if (loadCommentsRetryTimerRef.current) {
        clearTimeout(loadCommentsRetryTimerRef.current);
        loadCommentsRetryTimerRef.current = 0;
      }
      setComments(next);
      setCommentCount(next.length);
    } catch {
      if (retryAttempt >= 1) return;
      if (loadCommentsRetryTimerRef.current) clearTimeout(loadCommentsRetryTimerRef.current);
      loadCommentsRetryTimerRef.current = window.setTimeout(() => {
        loadComments(retryAttempt + 1);
      }, 900);
    }
  }

  useEffect(() => {
    loadComments();
    return () => {
      if (loadCommentsRetryTimerRef.current) {
        clearTimeout(loadCommentsRetryTimerRef.current);
        loadCommentsRetryTimerRef.current = 0;
      }
    };
  }, [newsId]);

  useEffect(() => {
    if (!open) return;
    loadComments();
  }, [open]);

  useEffect(() => {
    if (autoOpen) setOpen(true);
  }, [autoOpen]);

  useEffect(() => {
    focusAppliedRef.current = false;
    if (focusCommentId) setOpen(true);
  }, [newsId, focusCommentId, focusReplyId]);

  useEffect(() => {
    if (!focusCommentId || !focusReplyId) return;
    setOpenResponses((prev) => ({ ...prev, [focusCommentId]: true }));
  }, [focusCommentId, focusReplyId]);

  useEffect(() => {
    setCommentCount(comments.length);
  }, [comments]);

  useEffect(() => {
    if (!open || !focusCommentId || focusAppliedRef.current) return;
    const timer = setTimeout(() => {
      const targetSelector = focusReplyId
        ? `[data-reply-id="${focusReplyId}"]`
        : `[data-comment-id="${focusCommentId}"]`;
      const fallbackSelector = `[data-comment-id="${focusCommentId}"]`;
      const target = document.querySelector(targetSelector) || document.querySelector(fallbackSelector);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("notif-focus-target");
      window.setTimeout(() => target.classList.remove("notif-focus-target"), 1400);
      focusAppliedRef.current = true;
    }, 110);
    return () => clearTimeout(timer);
  }, [open, comments, openResponses, focusCommentId, focusReplyId]);

  function resolveRank(comment) {
    const email = String(comment.authorEmail || "").toLowerCase();
    const username = String(comment.authorUsername || "").toLowerCase();
    const authorName = String(comment.authorName || "").toLowerCase();
    const authorRank = String(comment.authorRank || "");
    const staffIdentity =
      Boolean(comment?.authorIsStaff) ||
      STAFF_EMAILS.has(email) ||
      isStaffLabel(username) ||
      isStaffLabel(authorName) ||
      isStaffLabel(authorRank);
    const showStaffBadge = comment?.authorShowStaffBadge !== false;
    const animateStaffGradient = comment?.authorShowStaffGradient !== false;
    const selectedRank = authorRank || "Unregistered";
    const selectedIsStaff = isStaffLabel(selectedRank);
    if (staffIdentity && showStaffBadge && (selectedIsStaff || !authorRank)) {
      return { label: "STAFF", staff: true, animateStaffGradient };
    }
    const rank = selectedRank;
    return { label: rank, staff: false, animateStaffGradient: false };
  }

  function showStaffNameBadge(entry) {
    if (!entry) return false;
    return entry?.authorShowStaffBadge !== false && Boolean(resolveStaffPillTitle(entry));
  }

  function renderReplyStaffBadge(entry) {
    if (!showStaffNameBadge(entry)) return html``;
    const rank = resolveRank(entry);
    const roleClass = resolveStaffRoleClass(entry);
    const useGradientPillText = entry?.authorShowStaffBadgeIcon !== false;
    const staffPillClass = `forum-staff-pill ${roleClass} ${useGradientPillText ? "gradient-text" : "text-only"} ${
      rank?.animateStaffGradient === false ? "staff-static" : ""
    }`.trim();
    const staffPillText = resolveStaffPillTitle(entry) || "Staff";
    return html`<span className=${`reply-staff-badge ${staffPillClass}`.trim()}>
      <span className=${useGradientPillText ? "staff-pill-label" : "staff-pill-text"}>${staffPillText}</span>
    </span>`;
  }

  function renderCommentLeftMainBadges(entry) {
    if (!entry || isForumThread) return html``;
    const rank = resolveRank(entry);
    const rankLabel = String(rank?.label || "Unregistered");
    const roleClass = rank?.staff ? resolveStaffRoleClass(entry) : "";
    const rankStaticClass = rank?.staff && rank?.animateStaffGradient === false ? "staff-static" : "";
    const rankEffectsClass = entry?.authorShowRankEffects === false ? "rank-effects-off" : "";
    const rankFontClass = entry?.authorUseRankFont === false ? "rank-font-off" : "rank-font-on";
    const rankClass = `rank-${rankClassSlug(rankLabel)}`;
    const rankIconType = getRankIconType(rankLabel);
    const rankBadgeClass = `comment-rank forum-author-rank ${rank?.staff ? "staff" : ""} ${roleClass} ${rankStaticClass} ${rankEffectsClass} ${rankFontClass} ${rankClass}`.trim();
    return html`<span className="comment-left-main-badge">
      <span className="comment-left-main-badges">
        <span className=${rankBadgeClass}>
          ${rankIconType ? html`<span className="rank-icon">${renderRankIcon(rankIconType)}</span>` : html``}
          <span>${getRankDisplayLabel(rankLabel)}</span>
        </span>
        ${showStaffNameBadge(entry) ? renderReplyStaffBadge(entry) : html``}
      </span>
    </span>`;
  }

  function rankClassSlug(value) {
    return String(value || "Unregistered")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }

  function avatarClassName(entry, isSmall = false) {
    const rankLabel = resolveRank(entry).label;
    return [
      "comment-avatar",
      isSmall ? "small" : "",
      `avatar-rank-${rankClassSlug(rankLabel)}`,
      entry?.authorShowAvatarVfx === false ? "avatar-vfx-off" : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  function staffTextClass(entry) {
    const rank = resolveRank(entry);
    if (!rank.staff) return "";
    const roleClass = resolveStaffRoleClass(entry);
    return rank.animateStaffGradient === false ? `staff ${roleClass} staff-static`.trim() : `staff ${roleClass}`.trim();
  }

  function isOriginalPoster(entry) {
    const entryUserId = resolveEntryUserId(entry);
    if (!isForumThread || !threadOwnerUserId || !entryUserId) return false;
    return entryUserId === String(threadOwnerUserId);
  }

  function authorSizeClass(value) {
    const length = String(value || "").trim().length;
    if (length >= 26) return "tiny";
    if (length >= 18) return "small";
    return "";
  }

  function setCommentActionStatus(commentId, value) {
    if (!commentId) return;
    setActionStatusByComment((prev) => ({ ...prev, [commentId]: value }));
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!isSignedIn) return;
    if (commentsLocked) {
      setComposerStatus("Comments are locked for this post.");
      return;
    }
    if (!draft.trim()) return;
    setComposerStatus("Posting...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId, text: draft }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed");
      }
      const data = await response.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setDraft("");
      setComposerStatus("");
    } catch (error) {
      setComposerStatus(error?.message || "Failed to post.");
    }
  }

  function startEdit(comment) {
    setEditingId(comment.id);
    setEditingText(comment.body);
  }

  async function saveEdit(commentId) {
    if (!editingText.trim()) return;
    setCommentActionStatus(commentId, "Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, `/api/comments/${commentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editingText }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const updated = data?.comment;
      if (updated) {
        setComments((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)));
      }
      setEditingId(null);
      setEditingText("");
      setCommentActionStatus(commentId, "");
    } catch {
      setCommentActionStatus(commentId, "Edit failed.");
    }
  }

  async function deleteComment(commentId) {
    setCommentActionStatus(commentId, "Deleting...");
    try {
      const response = await apiFetchWithToken(getToken, true, `/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed");
      setComments((prev) => prev.filter((entry) => entry.id !== commentId));
      setCommentActionStatus(commentId, "");
    } catch {
      setCommentActionStatus(commentId, "Delete failed.");
    }
  }

  function startReplyEdit(commentId, reply) {
    setEditingReplyKey(`${commentId}:${reply.id}`);
    setEditingReplyText(reply.body || "");
  }

  function cancelReplyEdit() {
    setEditingReplyKey(null);
    setEditingReplyText("");
  }

  function toggleResponses(commentId) {
    setOpenResponses((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  }

  function setReplyTarget(commentId, target) {
    setOpenResponses((prev) => ({ ...prev, [commentId]: true }));
    setReplyTargets((prev) => ({
      ...prev,
      [commentId]: target,
    }));
  }

  function clearReplyTarget(commentId) {
    setReplyTargets((prev) => {
      const next = { ...prev };
      delete next[commentId];
      return next;
    });
  }

  function formatReplyReference(reply) {
    const who = String(reply?.repliedToAuthorName || reply?.repliedToName || "comment").trim();
    const snippet = String(reply?.repliedToSnippet || "").trim();
    if (!snippet) return `Replying to ${who}`;
    return `Replying to ${who}: "${snippet}"`;
  }

  function scrollToReplyReference(parentCommentId, reply) {
    const targetCommentId = String(reply?.repliedToCommentId || parentCommentId || "");
    const targetReplyId = String(reply?.repliedToReplyId || "");
    if (targetCommentId) {
      setOpenResponses((prev) => ({ ...prev, [targetCommentId]: true, [parentCommentId]: true }));
    }
    setOpen(true);
    const selector = targetReplyId
      ? `[data-reply-id="${targetReplyId}"]`
      : `[data-comment-id="${targetCommentId}"]`;
    window.setTimeout(() => {
      const target = document.querySelector(selector);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("notif-focus-target");
      window.setTimeout(() => target.classList.remove("notif-focus-target"), 1400);
    }, 90);
  }

  async function submitReply(comment, text, textarea) {
    if (commentsLocked) {
      setCommentActionStatus(comment.id, "Comments are locked for this post.");
      return;
    }
    if (!text.trim()) return;
    const target = replyTargets[comment.id] || null;
    const payload = { text };
    if (target?.type === "reply") {
      payload.repliedToReplyId = target.id;
      payload.repliedToCommentId = comment.id;
    } else if (target?.type === "comment") {
      payload.repliedToCommentId = target.id;
    }
    const response = await apiFetchWithToken(getToken, true, `/api/comments/${comment.id}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setCommentActionStatus(comment.id, data?.error || "Reply failed.");
      return;
    }
    const data = await response.json();
    if (data?.comment) {
      setComments((prev) =>
        prev.map((entry) => (entry.id === data.comment.id ? data.comment : entry)),
      );
      clearReplyTarget(comment.id);
      if (textarea) textarea.value = "";
      setCommentActionStatus(comment.id, "");
    }
  }

  async function saveReplyEdit(commentId, replyId) {
    if (!editingReplyText.trim()) return;
    setCommentActionStatus(commentId, "Saving reply...");
    try {
      const response = await apiFetchWithToken(
        getToken,
        true,
        `/api/comments/${commentId}/replies/${replyId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: editingReplyText }),
        },
      );
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      if (data?.comment) {
        setComments((prev) =>
          prev.map((entry) => (entry.id === data.comment.id ? data.comment : entry)),
        );
      }
      cancelReplyEdit();
      setCommentActionStatus(commentId, "");
    } catch {
      setCommentActionStatus(commentId, "Reply edit failed.");
    }
  }

  async function deleteReply(commentId, replyId) {
    setCommentActionStatus(commentId, "Deleting reply...");
    try {
      const response = await apiFetchWithToken(
        getToken,
        true,
        `/api/comments/${commentId}/replies/${replyId}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      if (data?.comment) {
        setComments((prev) =>
          prev.map((entry) => (entry.id === data.comment.id ? data.comment : entry)),
        );
      }
      setCommentActionStatus(commentId, "");
    } catch {
      setCommentActionStatus(commentId, "Reply delete failed.");
    }
  }

  async function openHistory(commentId) {
    try {
      const response = await fetch(`/api/comments/${commentId}/history`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setHistoryItems(Array.isArray(data.history) ? data.history : []);
      setHistoryOpen(true);
    } catch {}
  }

  async function loadOwnProfileTitleSettings() {
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/title");
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const availableRaw = Array.isArray(data.availableTitles) ? data.availableTitles : [];
      const availableTitles = PROFILE_DISPLAY_TITLES.filter((title) => availableRaw.includes(title));
      const selectedTitle = String(data.selectedTitle || "");
      const ownedRank = String(data.ownedRank || "Unregistered");
      const fallbackTitles = ownedRank === "Unregistered" ? ["Unregistered"] : ["Registered"];
      return {
        ownedRank,
        availableTitles: availableTitles.length > 0 ? availableTitles : fallbackTitles,
        selectedTitle: selectedTitle || ownedRank || "Unregistered",
        staffRole: String(data?.staffRole || ""),
        staffRoleBase: String(data?.staffRoleBase || ""),
        canPreviewStaffRole: Boolean(data?.canPreviewStaffRole),
        staffRolePreview: String(data?.staffRolePreview || ""),
        staffRolePreviewOptions: Array.isArray(data?.staffRolePreviewOptions)
          ? data.staffRolePreviewOptions
          : [],
        canToggleOwnedBadges: Boolean(data?.canToggleOwnedBadges),
        showAllOwnedRankBadges: data?.showAllOwnedRankBadges !== false,
        selectedOwnedBadge: String(data?.selectedOwnedBadge || ""),
        ownedBadgeOptions: Array.isArray(data?.ownedBadgeOptions)
          ? data.ownedBadgeOptions.filter((rank) => OWNED_RANK_ORDER.includes(String(rank)))
          : [],
        canToggleStaffBadge: Boolean(data?.canToggleStaffBadge),
        showStaffBadge: data?.showStaffBadge !== false,
        showStaffBadgeIcon: data?.showStaffBadgeIcon !== false,
        canToggleStaffGradient: Boolean(data?.canToggleStaffGradient),
        showStaffGradient: data?.showStaffGradient !== false,
        canToggleRankEffects: Boolean(data?.canToggleRankEffects),
        showRankEffects: data?.showRankEffects !== false,
        canToggleRankFont: Boolean(data?.canToggleRankFont),
        useRankFont: data?.useRankFont === true,
        canToggleDonorGradient: Boolean(data?.canToggleDonorGradient),
        showDonorGradient: data?.showDonorGradient !== false,
        canToggleAvatarVfx: Boolean(data?.canToggleAvatarVfx),
        showAvatarVfx: data?.showAvatarVfx !== false,
      };
    } catch {
      return null;
    }
  }

  async function loadProfileLinkStatus(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) {
      return { linked: false, playerName: "N/A", playerUuid: "N/A" };
    }
    try {
      const response = await fetch(`/api/profile/link-status/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return {
        linked: Boolean(data?.linked),
        playerName: String(data?.playerName || "").trim() || "N/A",
        playerUuid: String(data?.playerUuid || "").trim() || "N/A",
      };
    } catch {
      return { linked: false, playerName: "N/A", playerUuid: "N/A" };
    }
  }

  async function loadProfileAchievements(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return [];
    try {
      const response = await fetch(`/api/profile/achievements/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return Array.isArray(data?.achievements) ? data.achievements : [];
    } catch {
      return [];
    }
  }

  async function loadProfileGroups(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return [];
    try {
      const response = await fetch(`/api/profile/groups/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return Array.isArray(data?.groups) ? data.groups : [];
    } catch {
      return [];
    }
  }

  async function loadProfileForumActivity(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return null;
    try {
      const response = await fetch(`/api/profile/forum-activity/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return data?.activity && typeof data.activity === "object" ? data.activity : null;
    } catch {
      return null;
    }
  }

  async function updateOwnDisplayTitle(nextTitle) {
    if (!profileUser?.isOwn || !nextTitle || profileTitleSaving) return;
    const current = String(profileUser.rankLabel || "");
    if (nextTitle === current) return;
    setProfileTitleSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save title.");
      }
      const data = await response.json();
      const selectedTitle = String(data?.selectedTitle || nextTitle);
      const shouldDisableStaffGradient = !isStaffLabel(selectedTitle);
      if (shouldDisableStaffGradient) {
        await apiFetchWithToken(getToken, true, "/api/profile/staff-gradient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ showStaffGradient: false }),
        }).catch(() => {});
      }
      const availableRaw = Array.isArray(data?.availableTitles) ? data.availableTitles : [];
      const availableTitles = PROFILE_DISPLAY_TITLES.filter((title) => availableRaw.includes(title));
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              rankLabel: selectedTitle,
              availableTitles: availableTitles.length > 0 ? availableTitles : prev.availableTitles,
              showStaffGradient: shouldDisableStaffGradient ? false : prev.showStaffGradient,
            }
          : prev,
      );
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId
              ? {
                  ...comment,
                  authorRank: selectedTitle,
                  authorShowStaffGradient: shouldDisableStaffGradient
                    ? false
                    : comment.authorShowStaffGradient,
                }
              : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId
                ? {
                    ...reply,
                    authorRank: selectedTitle,
                    authorShowStaffGradient: shouldDisableStaffGradient
                      ? false
                      : reply.authorShowStaffGradient,
                  }
                : reply,
            ),
          };
        }),
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save title.");
    } finally {
      setProfileTitleSaving(false);
    }
  }

  async function updateOwnStaffGradientVisibility(nextVisible) {
    if (!profileUser?.isOwn || !profileUser?.canToggleStaffGradient || profileStaffGradientSaving) return;
    setProfileStaffGradientSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-gradient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showStaffGradient: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save staff gradient.");
      }
      const data = await response.json();
      const showStaffGradient = data?.showStaffGradient !== false;
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              showStaffGradient,
              showStaffBadge: prev.isStaffUser,
              staff:
                prev.isStaffUser &&
                prev.showStaffBadge !== false &&
                isStaffLabel(prev.rankLabel || ""),
            }
          : prev,
      );
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId
              ? {
                  ...comment,
                  authorShowStaffGradient: showStaffGradient,
                  authorShowStaffBadge: comment.authorShowStaffBadge !== false,
                }
              : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId
                ? {
                    ...reply,
                    authorShowStaffGradient: showStaffGradient,
                    authorShowStaffBadge: reply.authorShowStaffBadge !== false,
                  }
                : reply,
            ),
          };
        }),
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save staff gradient.");
    } finally {
      setProfileStaffGradientSaving(false);
    }
  }

  async function updateOwnStaffBadgeVisibility(nextVisible) {
    if (!profileUser?.isOwn || !profileUser?.canToggleStaffBadge || profileStaffBadgeSaving) return false;
    setProfileStaffBadgeSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showStaffBadge: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save staff badge.");
      }
      const data = await response.json();
      const showStaffBadge = data?.showStaffBadge !== false;
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              showStaffBadge,
              staff: prev.isStaffUser && showStaffBadge && isStaffLabel(prev.rankLabel || ""),
            }
          : prev,
      );
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId
              ? {
                  ...comment,
                  authorShowStaffBadge: showStaffBadge,
                }
              : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId
                ? {
                    ...reply,
                    authorShowStaffBadge: showStaffBadge,
                  }
                : reply,
            ),
          };
        }),
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
      return true;
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save staff badge.");
      return false;
    } finally {
      setProfileStaffBadgeSaving(false);
    }
  }

  async function updateOwnStaffBadgeIconVisibility(nextVisible) {
    if (!profileUser?.isOwn || !profileUser?.canToggleStaffBadge || profileStaffBadgeIconSaving) return false;
    setProfileStaffBadgeIconSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-badge-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showStaffBadgeIcon: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save staff badge icon.");
      }
      const data = await response.json();
      const showStaffBadgeIcon = data?.showStaffBadgeIcon !== false;
      setProfileUser((prev) => (prev ? { ...prev, showStaffBadgeIcon } : prev));
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId
              ? {
                  ...comment,
                  authorShowStaffBadgeIcon: showStaffBadgeIcon,
                }
              : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId
                ? {
                    ...reply,
                    authorShowStaffBadgeIcon: showStaffBadgeIcon,
                  }
                : reply,
            ),
          };
        }),
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
      return true;
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save staff badge icon.");
      return false;
    } finally {
      setProfileStaffBadgeIconSaving(false);
    }
  }

  async function updateOwnStaffBadgeMode(nextMode) {
    const mode = String(nextMode || "").trim().toLowerCase();
    let success = false;
    if (mode === "hidden") {
      success = await updateOwnStaffBadgeVisibility(false);
    } else if (mode === "label") {
      const badgeSaved = await updateOwnStaffBadgeVisibility(true);
      const iconSaved = await updateOwnStaffBadgeIconVisibility(false);
      success = badgeSaved && iconSaved;
    } else {
      const badgeSaved = await updateOwnStaffBadgeVisibility(true);
      const iconSaved = await updateOwnStaffBadgeIconVisibility(true);
      success = badgeSaved && iconSaved;
    }
    emitAppToast({
      kind: success ? "success" : "error",
      title: success ? "Staff Badge Updated" : "Staff Badge Update Failed",
      message: success
        ? mode === "hidden"
          ? "Staff badge is now hidden."
          : mode === "label"
          ? "Staff badge now uses text style."
          : "Staff badge now uses icon style."
        : "Unable to update staff badge mode right now.",
    });
  }

  async function updateOwnRankEffectsVisibility(nextVisible) {
    if (!profileUser?.isOwn || !profileUser?.canToggleRankEffects || profileRankEffectsSaving) return;
    setProfileRankEffectsSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/rank-effects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showRankEffects: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save rank effects.");
      }
      const data = await response.json();
      const showRankEffects = data?.showRankEffects !== false;
      setProfileUser((prev) => (prev ? { ...prev, showRankEffects } : prev));
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId ? { ...comment, authorShowRankEffects: showRankEffects } : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId
                ? { ...reply, authorShowRankEffects: showRankEffects }
                : reply,
            ),
          };
        }),
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save rank effects.");
    } finally {
      setProfileRankEffectsSaving(false);
    }
  }

  async function updateOwnRankFontVisibility(nextVisible) {
    if (!profileUser?.isOwn || !profileUser?.canToggleRankFont || profileRankFontSaving) return;
    setProfileRankFontSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/rank-font", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useRankFont: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save rank font setting.");
      }
      const data = await response.json();
      const useRankFont = data?.useRankFont === true;
      setProfileUser((prev) => (prev ? { ...prev, useRankFont } : prev));
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId ? { ...comment, authorUseRankFont: useRankFont } : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId
                ? { ...reply, authorUseRankFont: useRankFont }
                : reply,
            ),
          };
        }),
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save rank font setting.");
    } finally {
      setProfileRankFontSaving(false);
    }
  }

  async function updateOwnDonorGradientVisibility(nextVisible) {
    if (!profileUser?.isOwn || !profileUser?.canToggleDonorGradient || profileDonorGradientSaving) return;
    setProfileDonorGradientSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/donor-gradient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showDonorGradient: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save donor gradient setting.");
      }
      const data = await response.json();
      const showDonorGradient = data?.showDonorGradient !== false;
      setProfileUser((prev) => (prev ? { ...prev, showDonorGradient } : prev));
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId
              ? { ...comment, authorShowDonorGradient: showDonorGradient }
              : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId
                ? { ...reply, authorShowDonorGradient: showDonorGradient }
                : reply,
            ),
          };
        }),
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save donor gradient setting.");
    } finally {
      setProfileDonorGradientSaving(false);
    }
  }

  async function updateOwnOwnedBadgeDisplaySettings(nextShowAll, nextSelectedBadge = "") {
    if (!profileUser?.isOwn || !profileUser?.canToggleOwnedBadges || profileOwnedBadgesSaving) return false;
    setProfileOwnedBadgesSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/owned-badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showAllOwnedRankBadges: Boolean(nextShowAll),
          selectedOwnedBadge: String(nextSelectedBadge || ""),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save badge display settings.");
      }
      const data = await response.json();
      const ownedBadgeOptions = Array.isArray(data?.ownedBadgeOptions)
        ? data.ownedBadgeOptions.filter((rank) => OWNED_RANK_ORDER.includes(String(rank)))
        : [];
      const selectedOwnedBadge = String(data?.selectedOwnedBadge || "");
      const showAllOwnedRankBadges = data?.showAllOwnedRankBadges !== false;
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              showAllOwnedRankBadges,
              selectedOwnedBadge,
              ownedBadgeOptions: ownedBadgeOptions.length ? ownedBadgeOptions : prev.ownedBadgeOptions,
            }
          : prev,
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
      return true;
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save badge display settings.");
      return false;
    } finally {
      setProfileOwnedBadgesSaving(false);
    }
  }

  async function updateOwnDonorBadgeSelection(nextBadgeOrAll) {
    const next = String(nextBadgeOrAll || "").trim();
    const success =
      next === "__all__"
        ? await updateOwnOwnedBadgeDisplaySettings(true, "")
        : await updateOwnOwnedBadgeDisplaySettings(false, next);
    emitAppToast({
      kind: success ? "success" : "error",
      title: success ? "Donor Badge Updated" : "Donor Badge Update Failed",
      message: success
        ? next === "__all__"
          ? "Displaying all owned donor badges."
          : `Now displaying ${getRankDisplayLabel(next)} as your donor badge.`
        : "Unable to update donor badge display right now.",
    });
  }

  async function updateOwnAvatarVfxVisibility(nextVisible) {
    if (!profileUser?.isOwn || !profileUser?.canToggleAvatarVfx || profileAvatarVfxSaving) return;
    setProfileAvatarVfxSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/avatar-vfx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showAvatarVfx: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save avatar effects.");
      }
      const data = await response.json();
      const showAvatarVfx = data?.showAvatarVfx !== false;
      setProfileUser((prev) => (prev ? { ...prev, showAvatarVfx } : prev));
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId ? { ...comment, authorShowAvatarVfx: showAvatarVfx } : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId
                ? { ...reply, authorShowAvatarVfx: showAvatarVfx }
                : reply,
            ),
          };
        }),
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save avatar effects.");
    } finally {
      setProfileAvatarVfxSaving(false);
    }
  }

  async function openProfileCard(entry) {
    if (!entry) return;
    setProfileCardLoading(true);
    try {
    const authorUserId = resolveEntryUserId(entry);
    const rank = resolveRank(entry);
    const isOwn = Boolean(userId && authorUserId && String(authorUserId) === String(userId));
    const email = String(entry.authorEmail || "").toLowerCase();
    const username = String(entry.authorUsername || "").toLowerCase();
    const authorName = String(entry.authorName || "").toLowerCase();
    let isStaffUser =
      Boolean(entry?.authorIsStaff) ||
      isStaffLabel(entry?.authorStaffRole || "") ||
      STAFF_EMAILS.has(email) ||
      isStaffLabel(username) ||
      isStaffLabel(authorName) ||
      isStaffLabel(rank.label);
    let availableTitles = [];
    let staffRole = String(entry?.authorStaffRole || "");
    let staffRoleBase = "";
    let canPreviewStaffRole = false;
    let staffRolePreview = "";
    let staffRolePreviewOptions = [];
    let selectedTitle = rank.label;
    let ownedRank = normalizeOwnedRankLabel(entry?.authorOwnedRank || rank.label);
    let canToggleOwnedBadges = false;
    let showAllOwnedRankBadges = entry?.showAllOwnedRankBadges !== false;
    let selectedOwnedBadge = normalizeOwnedRankLabel(entry?.selectedOwnedBadge || "");
    let ownedBadgeOptions = buildOwnedRankBadges(ownedRank, false, { showAllOwnedRankBadges: true });
    let canToggleStaffBadge = false;
    let showStaffBadge = entry?.authorShowStaffBadge !== false;
    let showStaffBadgeIcon = entry?.authorShowStaffBadgeIcon !== false;
    let canToggleStaffGradient = false;
    let showStaffGradient = entry?.authorShowStaffGradient !== false;
    let canToggleRankEffects = false;
    let showRankEffects = entry?.authorShowRankEffects !== false;
    let canToggleRankFont = false;
    let useRankFont = entry?.authorUseRankFont === true;
    let canToggleDonorGradient = false;
    let showDonorGradient = entry?.authorShowDonorGradient !== false;
    let canToggleAvatarVfx = false;
    let showAvatarVfx = entry?.authorShowAvatarVfx !== false;
    if (isOwn && isSignedIn) {
      const settings = await loadOwnProfileTitleSettings();
      if (settings) {
        staffRole = String(settings.staffRole || staffRole);
        staffRoleBase = String(settings.staffRoleBase || "");
        canPreviewStaffRole = Boolean(settings.canPreviewStaffRole);
        staffRolePreview = String(settings.staffRolePreview || "");
        staffRolePreviewOptions = Array.isArray(settings.staffRolePreviewOptions)
          ? settings.staffRolePreviewOptions
          : [];
        ownedRank = normalizeOwnedRankLabel(settings.ownedRank);
        availableTitles = settings.availableTitles;
        selectedTitle = settings.selectedTitle || rank.label;
        canToggleOwnedBadges = Boolean(settings.canToggleOwnedBadges);
        showAllOwnedRankBadges = settings.showAllOwnedRankBadges !== false;
        selectedOwnedBadge = normalizeOwnedRankLabel(settings.selectedOwnedBadge || "");
        ownedBadgeOptions = Array.isArray(settings.ownedBadgeOptions) ? settings.ownedBadgeOptions : ownedBadgeOptions;
        canToggleStaffBadge = Boolean(settings.canToggleStaffBadge);
        showStaffBadge = settings.showStaffBadge !== false;
        showStaffBadgeIcon = settings.showStaffBadgeIcon !== false;
        canToggleStaffGradient = Boolean(settings.canToggleStaffGradient);
        showStaffGradient = settings.showStaffGradient !== false;
        canToggleRankEffects = Boolean(settings.canToggleRankEffects);
        showRankEffects = settings.showRankEffects !== false;
        canToggleRankFont = Boolean(settings.canToggleRankFont);
        useRankFont = settings.useRankFont === true;
        canToggleDonorGradient = Boolean(settings.canToggleDonorGradient);
        showDonorGradient = settings.showDonorGradient !== false;
        canToggleAvatarVfx = Boolean(settings.canToggleAvatarVfx);
        showAvatarVfx = settings.showAvatarVfx !== false;
      }
    }
    if (!isDonorOwnedRank(ownedRank)) {
      showDonorGradient = false;
    }
    if (!isStaffLabel(selectedTitle)) {
      showStaffGradient = false;
    }
    isStaffUser = isStaffUser || canToggleStaffGradient || canToggleStaffBadge;
    if (isOwn && availableTitles.length === 0 && selectedTitle) {
      availableTitles = [selectedTitle];
    }
    const [linkStatus, achievements, groups, forumActivity] = await Promise.all([
      loadProfileLinkStatus(authorUserId),
      loadProfileAchievements(authorUserId),
      loadProfileGroups(authorUserId),
      loadProfileForumActivity(authorUserId),
    ]);
    setProfileTitleStatus("");
    setProfileInfoTab("badges");
    setProfileUser({
      name: String(entry.authorName || "User"),
      image: String(entry.authorImage || "/assets/HardTale_H_GreyScale.png"),
      rankLabel: selectedTitle,
      ownedRank,
      canToggleOwnedBadges,
      showAllOwnedRankBadges,
      selectedOwnedBadge,
      ownedBadgeOptions,
      staff: isStaffUser && showStaffBadge && isStaffLabel(selectedTitle),
      staffRole,
      staffRoleBase,
      canPreviewStaffRole,
      staffRolePreview,
      staffRolePreviewOptions,
      username: formatUsernameForDisplay(entry.authorUsername),
      isOwn,
      isStaffUser,
      availableTitles,
      canToggleStaffBadge,
      showStaffBadge,
      showStaffBadgeIcon,
      canToggleStaffGradient,
      showStaffGradient,
      canToggleRankEffects,
      showRankEffects,
      canToggleRankFont,
      useRankFont,
      canToggleDonorGradient,
      showDonorGradient,
      canToggleAvatarVfx,
      showAvatarVfx,
      hytalePlayerName: linkStatus.playerName,
      hytalePlayerUuid: linkStatus.playerUuid,
      linkedAccount: linkStatus.linked,
      achievements,
      groups,
      forumActivity,
    });
    setProfileOpen(true);
    } finally {
      setProfileCardLoading(false);
    }
  }

  function openCommentProfileEntry(entry) {
    if (!entry) return;
    const entryUserId = resolveEntryUserId(entry);
    const isOwnEntry = Boolean(isSignedIn && userId && entryUserId && String(userId) === entryUserId);
    if (isOwnEntry) {
      setSelfProfileChooserEntry(entry);
      setSelfProfileChooserOpen(true);
      return;
    }
    openProfileCard(entry);
  }

  async function updateOwnStaffRolePreview(nextRole) {
    if (!profileUser?.isOwn || !profileUser?.canPreviewStaffRole || !nextRole) return;
    const current = String(profileUser.staffRolePreview || profileUser.staffRole || "");
    if (nextRole === current) return;
    setProfileTitleSaving(true);
    setProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-role-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffRolePreview: nextRole }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save group badge preview.");
      }
      const data = await response.json();
      const staffRole = String(data?.staffRole || nextRole);
      const options = Array.isArray(data?.staffRolePreviewOptions) ? data.staffRolePreviewOptions : [];
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              staffRole,
              staffRolePreview: String(data?.staffRolePreview || staffRole),
              staffRolePreviewOptions: options.length > 0 ? options : prev.staffRolePreviewOptions,
            }
          : prev,
      );
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId ? { ...comment, authorStaffRole: staffRole } : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId ? { ...reply, authorStaffRole: staffRole } : reply,
            ),
          };
        }),
      );
      setProfileTitleStatus("Saved.");
      setTimeout(() => setProfileTitleStatus(""), 1200);
    } catch (error) {
      setProfileTitleStatus(error?.message || "Failed to save group badge preview.");
    } finally {
      setProfileTitleSaving(false);
    }
  }

  async function copyProfileMetaValue(label, value) {
    const raw = String(value || "").trim();
    if (!raw || raw.toLowerCase() === "n/a") return;
    try {
      await navigator.clipboard.writeText(raw);
      emitAppToast({
        kind: "success",
        title: "Copied",
        message: `${label} copied to clipboard.`,
      });
    } catch {
      emitAppToast({
        kind: "warning",
        title: "Copy failed",
        message: `Couldn't copy ${label}.`,
      });
    }
  }

  return html`
    <div className=${`comment-thread ${isForumThread ? "forum-thread" : ""}`.trim()}>
      <button className="comment-toggle" type="button" onClick=${() => setOpen(!open)}>
        Comments (${commentCount})
        <span className="comment-toggle-arrow">${open ? "v" : ">"}</span>
      </button>
      ${open
        ? html`<div className="comment-panel">
            ${comments.length === 0 && isSignedIn
              ? html`<div className="no-comments">No comments yet.</div>`
              : html``}
            ${isSignedIn
              ? commentsLocked
                ? html`<div className="comment-login-card">
                    <div className="comment-login-title">Responses are locked</div>
                    <div className="comment-login-input">Staff disabled comments for this post.</div>
                  </div>`
                : html`<form className="comment-form" onSubmit=${submitComment}>
                    <textarea
                      rows="3"
                      placeholder="Write a comment..."
                      value=${draft}
                      maxLength="276"
                      onInput=${(event) => setDraft(event.target.value)}
                    ></textarea>
                    <div className="comment-actions right">
                      <div className="comment-char-count">${draft.length}/276</div>
                      <button className="button primary" type="submit">Post</button>
                      ${composerStatus ? html`<span className="muted">${composerStatus}</span>` : html``}
                    </div>
                  </form>`
              : html`<div
                  className="comment-login-card"
                  role="button"
                  tabindex="0"
                  onClick=${() => {
                    if (openSignIn) openSignIn({});
                  }}
                >
                  <div className="comment-login-title">Write a response</div>
                  <div className="comment-login-input">What are your thoughts?</div>
                </div>`}
            ${comments.length === 0
              ? html``
              : comments.map(
                  (comment) => html`<div key=${comment.id} className="comment-item" data-comment-id=${comment.id}>
                    <div className="comment-left comment-left-main">
                      <button
                        className="comment-avatar-trigger"
                        type="button"
                        onClick=${() => openCommentProfileEntry(comment)}
                        title="Open profile card"
                      >
                        <img
                          className=${avatarClassName(comment, false)}
                          src=${comment.authorImage || "/assets/HardTale_H_GreyScale.png"}
                          alt=${comment.authorName}
                        />
                      </button>
                      ${renderCommentLeftMainBadges(comment)}
                      <${CommentIdentity}
                        entry=${comment}
                        rank=${resolveRank(comment)}
                        authorSizeClass=${authorSizeClass}
                        showStaffPill=${showStaffNameBadge(comment)}
                        staffPillText=${resolveStaffPillTitle(comment)}
                      />
                      <${CommentMeta}
                        entry=${comment}
                        formatTimestamp=${formatTimestamp}
                        variant="mobile"
                        showOpBadge=${isOriginalPoster(comment)}
                        historyIcon=${INK_PEN_ICON}
                      />
                    </div>
                    <div className="comment-right">
                      <div className="comment-header-desktop">
                        <div className="comment-header-main">
                          <${CommentIdentity}
                            entry=${comment}
                            rank=${resolveRank(comment)}
                            authorSizeClass=${authorSizeClass}
                            showStaffPill=${isForumThread ? showStaffNameBadge(comment) : false}
                            staffPillText=${resolveStaffPillTitle(comment)}
                            showOpBadge=${isOriginalPoster(comment)}
                          />
                        </div>
                        <${CommentMeta}
                          entry=${comment}
                          formatTimestamp=${formatTimestamp}
                          variant="desktop"
                          showHistoryButton=${true}
                          historyIcon=${INK_PEN_ICON}
                          onHistoryMouseDown=${(event) => triggerFlash(event.currentTarget)}
                          onHistoryClick=${() => openHistory(comment.id)}
                        />
                      </div>
                      ${editingId === comment.id
                        ? html`<div className="comment-editor">
                            <textarea
                              rows="3"
                              value=${editingText}
                              onInput=${(event) => setEditingText(event.target.value)}
                            ></textarea>
                            <div className="comment-actions right">
                              <button
                                className="button primary"
                                type="button"
                                onClick=${() => saveEdit(comment.id)}
                              >
                                Save
                              </button>
                              <button
                                className="button ghost-btn"
                                type="button"
                                onClick=${() => {
                                  setEditingId(null);
                                  setEditingText("");
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>`
                        : html`<p className=${`comment-text ${staffTextClass(comment)}`.trim()}>
                            ${comment.body}
                          </p>`}
                      ${actionStatusByComment[comment.id]
                        ? html`<div className="muted comment-inline-status">
                            ${actionStatusByComment[comment.id]}
                          </div>`
                        : html``}
                      ${(editingId !== comment.id && (resolveEntryUserId(comment) === String(userId || "") || (isSignedIn && !commentsLocked)))
                        ? html`<div className="comment-controls right">
                            ${resolveEntryUserId(comment) === String(userId || "")
                              ? html`<button
                                  className="ghost-btn"
                                  type="button"
                                  onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                                  onClick=${() => startEdit(comment)}
                                >
                                  <img src=${INK_PEN_ICON} alt="" aria-hidden="true" className="comment-action-icon" />
                                  Edit
                                </button>
                                <button
                                  className="ghost-btn delete-action-btn"
                                  type="button"
                                  onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                                  onClick=${() => deleteComment(comment.id)}
                                >
                                  ${renderDeleteLabel("Delete")}
                                </button>`
                              : html``}
                          </div>`
                        : html``}
                    </div>
                    <div className="comment-responses-section">
                      ${(() => {
                        const replies = Array.isArray(comment.replies) ? comment.replies : [];
                        const responsesOpen = Boolean(openResponses[comment.id]);
                        return html`
                          ${isSignedIn && !commentsLocked
                            ? html`<div className="comment-reply-above-responses">
                                <button
                                  className="ghost-btn"
                                  type="button"
                                  onClick=${() =>
                                    setReplyTarget(comment.id, {
                                      type: "comment",
                                      id: comment.id,
                                      name: comment.authorName,
                                      snippet: String(comment.body || "").trim().slice(0, 72),
                                    })}
                                >
                                  Reply
                                </button>
                              </div>`
                            : html``}
                          <button
                            className="comment-responses-toggle"
                            type="button"
                            onClick=${() => toggleResponses(comment.id)}
                          >
                            Responses (${replies.length})
                            <span className="comment-toggle-arrow">${responsesOpen ? "v" : ">"}</span>
                          </button>
                          <div className="comment-responses-divider"></div>
                          ${responsesOpen
                            ? html`<div className="comment-replies">
                                ${replies.map(
                                  (reply) => html`<div
                                    key=${reply.id}
                                    className="comment-reply"
                                    data-reply-id=${reply.id}
                                  >
                                    <div className="comment-left comment-left-reply">
                                      <button
                                        className="comment-avatar-trigger"
                                        type="button"
                                        onClick=${() => openCommentProfileEntry(reply)}
                                        title="Open profile card"
                                      >
                                        <img
                                          className=${avatarClassName(reply, true)}
                                          src=${reply.authorImage || "/assets/HardTale_H_GreyScale.png"}
                                          alt=${reply.authorName}
                                        />
                                      </button>
                                      ${renderReplyStaffBadge(reply)}
                                      <${CommentIdentity}
                                        entry=${reply}
                                        rank=${resolveRank(reply)}
                                        authorSizeClass=${authorSizeClass}
                                        showStaffPill=${false}
                                        staffPillText=${resolveStaffPillTitle(reply)}
                                      />
                                      <${CommentMeta}
                                        entry=${reply}
                                        formatTimestamp=${formatTimestamp}
                                        variant="mobile"
                                        showOpBadge=${isOriginalPoster(reply)}
                                        historyIcon=${INK_PEN_ICON}
                                      />
                                    </div>
                                    <div className="comment-right">
                                      <div className="comment-header-desktop">
                                        <div className="comment-header-main">
                                          <${CommentIdentity}
                                            entry=${reply}
                                            rank=${resolveRank(reply)}
                                            authorSizeClass=${authorSizeClass}
                                            showStaffPill=${false}
                                            staffPillText=${resolveStaffPillTitle(reply)}
                                            showOpBadge=${isOriginalPoster(reply)}
                                          />
                                        </div>
                                        <${CommentMeta}
                                          entry=${reply}
                                          formatTimestamp=${formatTimestamp}
                                          variant="desktop"
                                          historyIcon=${INK_PEN_ICON}
                                        />
                                      </div>
                                      ${editingReplyKey === `${comment.id}:${reply.id}`
                                        ? html`<div className="comment-editor">
                                            <textarea
                                              rows="2"
                                              value=${editingReplyText}
                                              onInput=${(event) => setEditingReplyText(event.target.value)}
                                            ></textarea>
                                            <div className="comment-actions right">
                                              <button
                                                className="button primary"
                                                type="button"
                                                onClick=${() => saveReplyEdit(comment.id, reply.id)}
                                              >
                                                Save
                                              </button>
                                              <button
                                                className="button ghost-btn"
                                                type="button"
                                                onClick=${cancelReplyEdit}
                                              >
                                                Cancel
                                              </button>
                                            </div>
                                          </div>`
                                        : html`<div>
                                            ${(reply.repliedToName || reply.repliedToSnippet)
                                              ? html`<button
                                                  type="button"
                                                  className="comment-replied-to comment-replied-link"
                                                  onClick=${() => scrollToReplyReference(comment.id, reply)}
                                                >
                                                  ${formatReplyReference(reply)}
                                                </button>`
                                              : html``}
                                            <p className=${`comment-text ${staffTextClass(reply)}`.trim()}>
                                              ${reply.body}
                                            </p>
                                          </div>`}
                                      ${(editingReplyKey !== `${comment.id}:${reply.id}` &&
                                      (resolveEntryUserId(reply) === String(userId || "") || (isSignedIn && !commentsLocked)))
                                        ? html`<div className="comment-controls right">
                                            ${resolveEntryUserId(reply) === String(userId || "")
                                              ? html`<button
                                                  className="ghost-btn"
                                                  type="button"
                                                  onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                                                  onClick=${() => startReplyEdit(comment.id, reply)}
                                                >
                                                  <img src=${INK_PEN_ICON} alt="" aria-hidden="true" className="comment-action-icon" />
                                                  Edit
                                                </button>
                                                <button
                                                  className="ghost-btn delete-action-btn"
                                                  type="button"
                                                  onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                                                  onClick=${() => deleteReply(comment.id, reply.id)}
                                                >
                                                  ${renderDeleteLabel("Delete")}
                                                </button>`
                                              : html``}
                                            ${isSignedIn && !commentsLocked
                                              ? html`<button
                                                  className="ghost-btn"
                                                  type="button"
                                                  onClick=${() =>
                                                    setReplyTarget(comment.id, {
                                                      type: "reply",
                                                      id: reply.id,
                                                      name: reply.authorName,
                                                      snippet: String(reply.body || "").trim().slice(0, 72),
                                                    })}
                                                >
                                                  Reply
                                                </button>`
                                              : html``}
                                          </div>`
                                        : html``}
                                    </div>
                                  </div>`,
                                )}
                                ${isSignedIn && !commentsLocked
                                  ? html`<div className="comment-reply-form">
                                      ${replyTargets[comment.id]
                                        ? html`<div className="comment-reply-target">
                                            Replying to ${replyTargets[comment.id].name}
                                            <button
                                              className="ghost-btn"
                                              type="button"
                                              onClick=${() => clearReplyTarget(comment.id)}
                                            >
                                              Cancel
                                            </button>
                                          </div>`
                                        : html``}
                                      <textarea
                                        rows="2"
                                        placeholder=${replyTargets[comment.id]
                                          ? `Reply to ${replyTargets[comment.id].name}${
                                              replyTargets[comment.id].snippet
                                                ? `: "${replyTargets[comment.id].snippet}"`
                                                : ""
                                            }...`
                                          : "Reply..."}
                                        onInput=${(event) => {
                                          const value = event.target.value;
                                          event.target.dataset.value = value;
                                        }}
                                      ></textarea>
                                      <div className="comment-actions right">
                                        <button
                                          className="button primary comment-reply-submit"
                                          type="button"
                                          onClick=${(event) => {
                                            const textarea = event.currentTarget
                                              .closest(".comment-reply-form")
                                              .querySelector("textarea");
                                            const text = textarea?.value || "";
                                            submitReply(comment, text, textarea);
                                          }}
                                        >
                                          Reply
                                        </button>
                                      </div>
                                    </div>`
                                  : html``}
                              </div>`
                            : html``}
                        `;
                      })()}
                    </div>
                  </div>`,
                )}
          </div>`
        : html``}
      <${PopUp}
        show=${profileOpen}
        onClose=${() => setProfileOpen(false)}
        title=${(() => {
          const username = String(profileUser?.username || "").replace(/^@+/, "");
          const display = username || profileUser?.name || "User";
          return `${display}'s Profile`;
        })()}
        headerBelow=${profileUser?.isOwn
          ? html`<div className="profile-modal-header-actions">
              <button
                type="button"
                className="copy-action-btn subtle profile-copy-action account-management-pill"
                onClick=${() => {
                  setProfileOpen(false);
                  if (openUserProfile) openUserProfile({});
                }}
                title="Account Management"
              >
                <span>Account Management</span>
              </button>
            </div>`
          : isSignedIn
          ? html`<div className="profile-modal-header-actions">
              <button
                type="button"
                className="copy-action-btn subtle profile-copy-action account-management-pill"
                onClick=${() =>
                  emitAppToast({
                    kind: "info",
                    title: "Friends Feature Planned",
                    message: `Friend requests are planned. @${profileUser?.username || profileUser?.name || "user"} support is coming soon.`,
                  })}
                title="Add Friend (planned)"
              >
                <img src=${ADD_FRIEND_ICON_SVG} alt="" aria-hidden="true" className="profile-action-icon-img" />
                <span>Add Friend</span>
              </button>
            </div>`
          : html``}
      >
        ${profileUser
          ? html`<div className="profile-card">
              <div className="profile-card-link-meta">
                <span className="muted">Hytale Username:</span>
                <${CopyAction}
                  label=${profileUser.hytalePlayerName || "N/A"}
                  valueToCopy=${profileUser.hytalePlayerName || ""}
                  subtle=${true}
                  className="profile-copy-action"
                  title="Copy Hytale Username"
                  onCopied=${() => copyProfileMetaValue("Hytale Username", profileUser.hytalePlayerName || "")}
                />
              </div>
              <div className="profile-card-link-meta">
                <span className="muted">UUID:</span>
                <${CopyAction}
                  label=${profileUser.hytalePlayerUuid || "N/A"}
                  valueToCopy=${profileUser.hytalePlayerUuid || ""}
                  subtle=${true}
                  className="profile-copy-action"
                  title="Copy UUID"
                  onCopied=${() => copyProfileMetaValue("UUID", profileUser.hytalePlayerUuid || "")}
                />
              </div>
              <img
                className=${`profile-card-avatar avatar-rank-${rankClassSlug(
                  profileUser.rankLabel || "Unregistered",
                )} ${profileUser.showAvatarVfx === false ? "avatar-vfx-off" : ""}`.trim()}
                src=${profileUser.image}
                alt=${profileUser.name}
              />
              <div
                className=${`profile-card-name ${
                  profileUser.showRankEffects === false ? "rank-effects-off" : ""
                } ${
                  profileUser.useRankFont === true ? "rank-font-on" : "rank-font-off"
                } ${
                  profileUser.showDonorGradient === false ? "donor-gradient-off" : "donor-gradient-on"
                } rank-${String(profileUser.rankLabel || "Unregistered")
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`.trim()}
              >
                ${profileUser.name}
              </div>
              ${renderStaffBadge(profileUser)}
              ${profileUser.username
                ? html`<div className="profile-card-username">@${profileUser.username}</div>`
                : html``}
              ${(() => {
                const normalizedRank = normalizeOwnedRankLabel(profileUser.rankLabel || "Unregistered");
                const useStaffAsPrimaryBadge = Boolean(profileUser.staff) && (normalizedRank === "Unregistered" || normalizedRank === "Unlinked");
                const badgeLabel = useStaffAsPrimaryBadge
                  ? toStaffPillTitle(profileUser.staffRole) || "Staff"
                  : getRankDisplayLabel(profileUser.rankLabel);
                const badgeIconType = useStaffAsPrimaryBadge ? "staff" : getRankIconType(profileUser.rankLabel || "");
                const badgeSlug = useStaffAsPrimaryBadge
                  ? "staff"
                  : String(profileUser.rankLabel || "Unregistered")
                      .trim()
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, "-");
                return html`<div
                  className=${`comment-rank ${
                    profileUser.staff ? `staff ${resolveStaffRoleClass(profileUser)}`.trim() : ""
                  } ${
                    profileUser.staff && profileUser.showStaffGradient === false ? "staff-static" : ""
                  } profile-card-rank ${
                    profileUser.showRankEffects === false ? "rank-effects-off" : ""
                  } ${
                    profileUser.showDonorGradient === false ? "donor-gradient-off" : "donor-gradient-on"
                  } rank-${badgeSlug}`.trim()}
                >
                  ${badgeIconType ? html`<span className="rank-icon">${renderRankIcon(badgeIconType)}</span>` : html``}
                  <span>${badgeLabel}</span>
                </div>`;
              })()}
              <${ProfileInfoTabs}
                activeTab=${profileInfoTab}
                onTabChange=${setProfileInfoTab}
                renderBadges=${() =>
                  html`${renderOwnedRankBadges(profileUser, {
                    onSelectDonorBadge: updateOwnDonorBadgeSelection,
                    onSelectStaffBadgeMode: updateOwnStaffBadgeMode,
                    donorSaving: profileOwnedBadgesSaving,
                    staffSaving: profileStaffBadgeSaving || profileStaffBadgeIconSaving,
                  })}`}
                renderGroups=${() =>
                  html`${renderProfileGroupsCard(profileUser, {
                    isSaving: profileTitleSaving,
                    onStaffRoleChange: updateOwnStaffRolePreview,
                  })}`}
                renderAchievements=${() =>
                  html`<${ProfileAchievementsPanel}
                    achievements=${profileUser?.achievements || []}
                  />`}
                renderForumActivity=${() =>
                  html`${renderProfileForumActivityCard(profileUser, formatTimestamp)}`}
              />
              ${profileUser.isOwn
                ? html`<label className="profile-card-title-picker">
                    <span className="muted">Display title</span>
                    <select
                      value=${profileUser.rankLabel}
                      disabled=${profileTitleSaving}
                      onChange=${(event) => updateOwnDisplayTitle(event.target.value)}
                    >
                      ${(Array.isArray(profileUser.availableTitles)
                        ? profileUser.availableTitles
                        : ["Unregistered"]
                      ).map((title) => html`<option value=${title}>${getRankDisplayLabel(title)}</option>`)}
                    </select>
                  </label>`
                : html``}
              ${profileUser.isOwn && profileUser.canToggleRankEffects
                ? html`<label className="profile-card-toggle">
                    <input
                      type="checkbox"
                      checked=${profileUser.showRankEffects !== false}
                      disabled=${profileRankEffectsSaving}
                      onChange=${(event) => updateOwnRankEffectsVisibility(event.target.checked)}
                    />
                    <span>Enable rank effects</span>
                  </label>`
                : html``}
              ${profileUser.isOwn && profileUser.canToggleRankFont
                ? html`<label className="profile-card-toggle">
                    <input
                      type="checkbox"
                      checked=${profileUser.useRankFont === true}
                      disabled=${profileRankFontSaving}
                      onChange=${(event) => updateOwnRankFontVisibility(event.target.checked)}
                    />
                    <span>Enable rank font styling</span>
                  </label>`
                : html``}
              ${profileUser.isOwn && profileUser.canToggleDonorGradient
                ? html`<label className="profile-card-toggle">
                    <input
                      type="checkbox"
                      checked=${profileUser.showDonorGradient !== false}
                      disabled=${profileDonorGradientSaving}
                      onChange=${(event) => updateOwnDonorGradientVisibility(event.target.checked)}
                    />
                    <span>Enable donor text gradient</span>
                  </label>`
                : html``}
              ${profileUser.isOwn && profileUser.canToggleAvatarVfx
                ? html`<label className="profile-card-toggle">
                    <input
                      type="checkbox"
                      checked=${profileUser.showAvatarVfx !== false}
                      disabled=${profileAvatarVfxSaving}
                      onChange=${(event) => updateOwnAvatarVfxVisibility(event.target.checked)}
                    />
                    <span>Enable avatar effects</span>
                  </label>`
                : html``}
              ${profileUser.isOwn &&
              profileUser.canToggleStaffGradient &&
              isStaffLabel(profileUser.rankLabel || "")
                ? html`<label className="profile-card-toggle">
                    <input
                      type="checkbox"
                      checked=${profileUser.showStaffGradient !== false}
                      disabled=${profileStaffGradientSaving}
                      onChange=${(event) => updateOwnStaffGradientVisibility(event.target.checked)}
                    />
                    <span>Enable staff gradient animation</span>
                  </label>`
                : html``}
              ${profileTitleStatus && profileUser.isOwn
                ? html`<div className="muted profile-card-title-status">${profileTitleStatus}</div>`
                : html``}
            </div>`
          : html``}
      <//>
      <${PopUp}
        show=${selfProfileChooserOpen}
        onClose=${() => {
          setSelfProfileChooserOpen(false);
          setSelfProfileChooserEntry(null);
        }}
        title="Profile Options"
      >
        <${ProfileOptionsActions}
          onViewProfile=${() => {
            const target = selfProfileChooserEntry;
            setSelfProfileChooserOpen(false);
            setSelfProfileChooserEntry(null);
            if (target) openProfileCard(target);
          }}
          onViewClerk=${() => {
            setSelfProfileChooserOpen(false);
            setSelfProfileChooserEntry(null);
            if (openUserProfile) openUserProfile({});
          }}
        />
      <//>
      <${PopUp}
        show=${historyOpen}
        onClose=${() => setHistoryOpen(false)}
        title="Edit History"
        className="comment-history-overlay"
      >
        ${historyItems.length === 0
          ? html`<p className="muted">No revisions yet.</p>`
          : html`<div className="comment-history">
              ${historyItems.map(
                (entry) => html`<div key=${entry.id} className="comment-history-item">
                  <div className="comment-history-meta">
                    <img
                      className="comment-avatar small"
                      src=${entry.editorImage || "/assets/HardTale_H_GreyScale.png"}
                      alt=${entry.editorName}
                    />
                    <div>
                      <div className="comment-author">${entry.editorName}</div>
                      <div className="muted"> Edited ${formatTimestamp(entry.createdAt)}</div>
                    </div>
                  </div>
                  <div className="comment-history-body">
                    <div className="muted">Before</div>
                    <p>${entry.oldBody}</p>
                    <div className="muted">After</div>
                    <p>${entry.newBody}</p>
                  </div>
                </div>`,
              )}
            </div>`}
      <//>
      <${LoadingScreen} show=${profileCardLoading} />
    </div>
  `;
}

function AdminPanel({
  news,
  onNewsUpdate,
  onNotificationsUpdate,
  notifications,
  isAdmin,
}) {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [newsTitle, setNewsTitle] = useState("");
  const [newsDescription, setNewsDescription] = useState("");
  const [newsReadMoreUrl, setNewsReadMoreUrl] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [newsStatus, setNewsStatus] = useState("");
  const [authorMode, setAuthorMode] = useState("system");
  const [newsFeatured, setNewsFeatured] = useState(false);
  const [newsCommentsLocked, setNewsCommentsLocked] = useState(false);
  const [pollEnabled, setPollEnabled] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollMultiple, setPollMultiple] = useState(false);
  const [pollOptions, setPollOptions] = useState(["", "", "", ""]);
  const [sendNewsNotification, setSendNewsNotification] = useState(true);
  const [newsNotificationInfo, setNewsNotificationInfo] = useState("");
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notificationFeatured, setNotificationFeatured] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState("");

  if (!isAdmin) {
    return html`<div className="card">Admin access only.</div>`;
  }

  const authorValue = authorMode === "system" ? "System" : getUserDisplayName(user);

  async function submitNews(event) {
    event.preventDefault();
    setNewsStatus("Posting...");

    try {
      let poll = null;
      if (pollEnabled) {
        const cleaned = pollOptions.map((option) => option.trim()).filter(Boolean);
        if (!pollQuestion.trim() || cleaned.length < 2) {
          setNewsStatus("Poll needs a question and at least 2 options.");
          return;
        }
        poll = {
          question: pollQuestion.trim(),
          multiple: pollMultiple,
          options: cleaned.slice(0, 4),
        };
      }
      const token = await getToken();
      const response = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newsTitle,
          description: newsDescription,
          author: authorValue,
          readMoreUrl: newsReadMoreUrl,
          imageUrl: newsImageUrl,
          featured: newsFeatured,
          commentsLocked: newsCommentsLocked,
          poll,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post");
      }

      const data = await response.json();
      onNewsUpdate(Array.isArray(data.news) ? data.news : []);

      if (sendNewsNotification) {
        const createdId = String(data?.createdId || "");
        const fallbackNewsId = createdId || String(data?.news?.[0]?.id || "");
        const info =
          newsNotificationInfo.trim() ||
          String(newsDescription || "").replace(/\s+/g, " ").trim().slice(0, 140);
        if (fallbackNewsId && info) {
          const notifyResponse = await fetch("/api/notifications", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              title: newsTitle,
              message: info,
              author: "System",
              featured: false,
              type: "news",
              newsId: fallbackNewsId,
              readMoreUrl: `/news?newsId=${encodeURIComponent(fallbackNewsId)}`,
            }),
          });
          if (notifyResponse.ok) {
            const notifyData = await notifyResponse.json();
            onNotificationsUpdate(Array.isArray(notifyData.notifications) ? notifyData.notifications : []);
          }
        }
      }

      setNewsTitle("");
      setNewsDescription("");
      setNewsReadMoreUrl("");
      setNewsImageUrl("");
      setNewsFeatured(false);
      setNewsCommentsLocked(false);
      setPollEnabled(false);
      setPollQuestion("");
      setPollMultiple(false);
      setPollOptions(["", "", "", ""]);
      setSendNewsNotification(true);
      setNewsNotificationInfo("");
      setNewsStatus("Posted!");
    } catch (err) {
      setNewsStatus("Failed to post news.");
    }
  }

  async function submitNotification(event) {
    event.preventDefault();
    setNotificationStatus("Sending...");

    try {
      const token = await getToken();
      const response = await fetch("/api/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: notificationTitle,
          message: notificationMessage,
          author: authorValue,
          featured: notificationFeatured,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post");
      }

      const data = await response.json();
      onNotificationsUpdate(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
      setNotificationTitle("");
      setNotificationMessage("");
      setNotificationFeatured(false);
      setNotificationStatus("Sent!");
    } catch (err) {
      setNotificationStatus("Failed to send notification.");
    }
  }

  async function deleteNews(id) {
    try {
      const token = await getToken();
      const response = await fetch(`/api/news/${id}?hard=true`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Delete failed");
      const data = await response.json();
      onNewsUpdate(Array.isArray(data.news) ? data.news : []);
    } catch (err) {
      emitAppToast({
        kind: "error",
        title: "Delete failed",
        message: "Failed to delete news.",
      });
    }
  }

  async function toggleNewsFeatured(id, featured) {
    try {
      const token = await getToken();
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured }),
      });
      if (!response.ok) throw new Error("Feature update failed");
      const data = await response.json();
      onNewsUpdate(Array.isArray(data.news) ? data.news : []);
    } catch (err) {
      emitAppToast({
        kind: "error",
        title: "Update failed",
        message: "Failed to update featured status.",
      });
    }
  }

  async function toggleNewsCommentsLocked(id, commentsLocked) {
    try {
      const token = await getToken();
      const response = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ commentsLocked }),
      });
      if (!response.ok) throw new Error("Comment lock update failed");
      const data = await response.json();
      onNewsUpdate(Array.isArray(data.news) ? data.news : []);
    } catch (err) {
      emitAppToast({
        kind: "error",
        title: "Update failed",
        message: "Failed to update comment lock.",
      });
    }
  }

  async function deleteNotification(id) {
    try {
      const token = await getToken();
      const response = await fetch(`/api/notifications/${id}?hard=true`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      const data = await response.json();
      onNotificationsUpdate(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
    } catch (err) {
      emitAppToast({
        kind: "error",
        title: "Delete failed",
        message: "Failed to delete notification.",
      });
    }
  }

  async function toggleNotificationFeatured(id, featured) {
    try {
      const token = await getToken();
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ featured }),
      });

      if (!response.ok) {
        throw new Error("Feature update failed");
      }

      const data = await response.json();
      onNotificationsUpdate(
        Array.isArray(data.notifications) ? data.notifications : [],
      );
    } catch (err) {
      emitAppToast({
        kind: "error",
        title: "Update failed",
        message: "Failed to update featured status.",
      });
    }
  }

  return html`
    <div className="admin-tools">
    <form className="card admin-panel" onSubmit=${submitNews}>
      <div className="section-title">News Publisher</div>
      <input
        placeholder="Header"
        value=${newsTitle}
        onInput=${(event) => setNewsTitle(event.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value=${newsDescription}
        onInput=${(event) => setNewsDescription(event.target.value)}
        required
      ></textarea>
      <div className="muted">
        Supports formatting: <code># Heading</code>, <code>## Subheading</code>, blank lines for paragraphs, and list lines with <code>- item</code>.
      </div>
      <label className="settings-row">
        <span>Author</span>
        <select
          value=${authorMode}
          onChange=${(event) => setAuthorMode(event.target.value)}
        >
          <option value="system">System</option>
          <option value="user">${getUserDisplayName(user)}</option>
        </select>
      </label>
      <label className="settings-row inline">
        <span>Featured</span>
        <input
          type="checkbox"
          checked=${newsFeatured}
          onChange=${(event) => setNewsFeatured(event.target.checked)}
        />
      </label>
      <label className="settings-row inline">
        <span>Lock comments</span>
        <input
          type="checkbox"
          checked=${newsCommentsLocked}
          onChange=${(event) => setNewsCommentsLocked(event.target.checked)}
        />
      </label>
      <label className="settings-row inline">
        <span>Send notification</span>
        <input
          type="checkbox"
          checked=${sendNewsNotification}
          onChange=${(event) => setSendNewsNotification(event.target.checked)}
        />
      </label>
      ${sendNewsNotification
        ? html`<input
            placeholder="Small info for notification"
            value=${newsNotificationInfo}
            onInput=${(event) => setNewsNotificationInfo(event.target.value)}
          />`
        : html``}
      <input
        placeholder="Read more URL (optional)"
        value=${newsReadMoreUrl}
        onInput=${(event) => setNewsReadMoreUrl(event.target.value)}
      />
      <input
        placeholder="Photo URL (optional)"
        value=${newsImageUrl}
        onInput=${(event) => setNewsImageUrl(event.target.value)}
      />
      <label className="settings-row inline">
        <span>Add poll</span>
        <input
          type="checkbox"
          checked=${pollEnabled}
          onChange=${(event) => setPollEnabled(event.target.checked)}
        />
      </label>
      ${pollEnabled
        ? html`<div className="poll-admin">
            <input
              placeholder="Poll question"
              value=${pollQuestion}
              onInput=${(event) => setPollQuestion(event.target.value)}
            />
            ${pollOptions.map(
              (option, index) => html`<input
                key=${`poll-${index}`}
                placeholder=${`Option ${index + 1}`}
                value=${option}
                onInput=${(event) =>
                  setPollOptions((prev) => {
                    const next = [...prev];
                    next[index] = event.target.value;
                    return next;
                  })}
              />`,
            )}
            <label className="settings-row inline">
              <span>Multi-choice</span>
              <input
                type="checkbox"
                checked=${pollMultiple}
                onChange=${(event) => setPollMultiple(event.target.checked)}
              />
            </label>
          </div>`
        : html``}
      <div className="admin-actions">
        <button className="button primary" type="submit">Post News</button>
      </div>
      <div className="muted">${newsStatus}</div>
      <div className="section-title">Manage News</div>
      ${news.length === 0
        ? html`<p className="muted">No news posted yet.</p>`
        : html`<div className="news-list">
            ${news.map(
              (item) => html`<article key=${item.id} className="news-card">
                <div className="news-header">
                  <div className="news-title-row">
                    ${item.featured ? renderFeaturedBadge(false) : html``}
                    <h3>${item.title}</h3>
                  </div>
                  <button
                    className="ghost-btn delete-action-btn"
                    type="button"
                    onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                    onClick=${() => deleteNews(item.id)}
                  >
                    ${renderDeleteLabel("Delete")}
                  </button>
                </div>
                <p>${item.description}</p>
                <div className="news-meta">
                  <span>
                    By <${AuthorName} value=${item.author} isStaffLabel=${isStaffLabel} />
                  </span>
                  <${TimestampText} value=${item.createdAt} formatTimestamp=${formatTimestamp} />
                </div>
                <button
                  className="ghost-btn news-toggle"
                  type="button"
                  onClick=${() => toggleNewsFeatured(item.id, !item.featured)}
                >
                  ${item.featured ? "Remove featured" : "Feature this"}
                </button>
                <button
                  className="ghost-btn news-toggle"
                  type="button"
                  onClick=${() => toggleNewsCommentsLocked(item.id, !item.commentsLocked)}
                >
                  ${item.commentsLocked ? "Unlock comments" : "Lock comments"}
                </button>
              </article>`,
            )}
          </div>`}
    </form>
    <form className="card admin-panel" onSubmit=${submitNotification}>
      <div className="section-title">Send Notification</div>
      <input
        placeholder="Notification title"
        value=${notificationTitle}
        onInput=${(event) => setNotificationTitle(event.target.value)}
        required
      />
      <textarea
        placeholder="Notification message"
        value=${notificationMessage}
        onInput=${(event) => setNotificationMessage(event.target.value)}
        required
      ></textarea>
      <label className="settings-row inline">
        <span>Featured</span>
        <input
          type="checkbox"
          checked=${notificationFeatured}
          onChange=${(event) => setNotificationFeatured(event.target.checked)}
        />
      </label>
      <button className="button primary" type="submit">Send Notification</button>
      <div className="muted">${notificationStatus}</div>
      <div className="section-title">Manage Notifications</div>
      ${notifications.length === 0
        ? html`<p className="muted">No notifications posted yet.</p>`
        : html`<div className="news-list">
            ${notifications.map(
              (item) => html`<article key=${item.id} className="news-card">
                <div className="news-header">
                  <div className="news-title-row">
                    ${item.featured ? renderFeaturedBadge(false) : html``}
                    <h3>${item.title}</h3>
                  </div>
                  <button
                    className="ghost-btn delete-action-btn"
                    type="button"
                    onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                    onClick=${() => deleteNotification(item.id)}
                  >
                    ${renderDeleteLabel("Delete")}
                  </button>
                </div>
                <p>${item.message}</p>
                <div className="news-meta">
                  <span>
                    By <${AuthorName} value=${item.author} isStaffLabel=${isStaffLabel} />
                  </span>
                  <${TimestampText} value=${item.createdAt} formatTimestamp=${formatTimestamp} />
                </div>
                <button
                  className="ghost-btn news-toggle"
                  type="button"
                  onClick=${() => toggleNotificationFeatured(item.id, !item.featured)}
                >
                  ${item.featured ? "Remove featured" : "Feature this"}
                </button>
              </article>`,
            )}
          </div>`}
    </form>
    </div>
  `;
}

function SettingsMenu({
  theme,
  setTheme,
  toggleLightDark,
  placement,
  setPlacement,
  menuSide,
  setMenuSide,
  mobileNavStyle,
  setMobileNavStyle,
  logoSide,
  setLogoSide,
  mobileLogoStyle,
  setMobileLogoStyle,
  showMobileIsland,
  setShowMobileIsland,
  desktopStickyStyle,
  setDesktopStickyStyle,
  desktopStickyWide,
  setDesktopStickyWide,
  desktopStickyLogoStyle,
  setDesktopStickyLogoStyle,
  uiFlashEnabled,
  setUiFlashEnabled,
  toastShape,
  setToastShape,
  openState,
  setOpenState,
  onOpenChange,
  isMobile,
}) {
  const [openInternal, setOpenInternal] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const [showDesktopLogoPicker, setShowDesktopLogoPicker] = useState(false);
  const isMobileView =
    typeof window !== "undefined"
      ? isMobile || window.matchMedia("(max-width: 860px)").matches
      : isMobile;
  const open = typeof openState === "boolean" ? openState : openInternal;
  const setOpen = typeof setOpenState === "function" ? setOpenState : setOpenInternal;

  function handleClick(event) {
    const buttonEl = event?.currentTarget;
    if (uiFlashEnabled && buttonEl) {
      buttonEl.classList.remove("flash");
      void buttonEl.offsetWidth;
      buttonEl.classList.add("flash");
      setTimeout(() => {
        if (buttonEl?.classList) buttonEl.classList.remove("flash");
      }, 400);
    }
  }

  return html`
    <div className="settings">
      <button
        className=${`settings-button ${spinning ? "spin" : ""}`}
        title="Settings"
        onClick=${(event) => {
          handleClick(event);
          const next = !open;
          setOpen(next);
          if (onOpenChange) onOpenChange(next);
          setSpinning(true);
          setTimeout(() => setSpinning(false), 420);
        }}
      >
        <span className="settings-icon-mask" aria-hidden="true"></span>
      </button>
      ${open
        ? html`<${PopUp}
            show=${open}
            onClose=${() => {
              setOpen(false);
              if (onOpenChange) onOpenChange(false);
            }}
            title="Settings"
            className="settings-modal-overlay"
          >
            <div className="settings-menu settings-modal-body">
            ${!isMobileView
              ? html`
                  <div className="settings-row">
                    <label>Desktop nav placement</label>
                    <select
                      value=${placement}
                      onChange=${(event) => setPlacement(event.target.value)}
                    >
                      <option value="center">Center</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                  <div className="settings-row">
                    <label>Desktop sticky background</label>
                    <select
                      value=${desktopStickyStyle}
                      onChange=${(event) => setDesktopStickyStyle(event.target.value)}
                    >
                      <option value="solid">Solid</option>
                      <option value="transparent">Transparent</option>
                    </select>
                  </div>
                  <div className="settings-row">
                    <label>Desktop sticky height</label>
                    <select
                      value=${desktopStickyWide ? "short" : "tall"}
                      onChange=${(event) =>
                        setDesktopStickyWide(event.target.value === "short")}
                    >
                      <option value="short">Short</option>
                      <option value="tall">Tall</option>
                    </select>
                    <div className="muted">Tall uses the island logo.</div>
                  </div>
                  ${desktopStickyStyle === "solid" && desktopStickyWide
                    ? html`
                        <div className="settings-row">
                          <label>Desktop sticky logo</label>
                          <button
                            className="logo-picker-trigger"
                            type="button"
                            onClick=${() => setShowDesktopLogoPicker(!showDesktopLogoPicker)}
                          >
                            Choose icon or logo
                          </button>
                          ${showDesktopLogoPicker
                            ? html`<div className="logo-picker">
                                <div className="logo-picker-section">
                                  <div className="logo-picker-title">Icons</div>
                                  <div className="logo-picker-grid">
                                    ${[
                                      { id: "icon-greyscale", src: "/assets/HardTale_H_GreyScale.png" },
                                      { id: "icon-golden", src: "/assets/HardTale_H_Golden.png" },
                                      { id: "icon-fiery", src: "/assets/HardTale_H_Fiery.png" },
                                      { id: "icon-icey", src: "/assets/HardTale_H_Icey.png" },
                                      { id: "icon-ht", src: "/assets/HardTale_H_HT.png" },
                                    ].map(
                                      (item) => html`<button
                                        key=${item.id}
                                        className=${`logo-option ${desktopStickyLogoStyle === item.id ? "selected" : ""}`}
                                        type="button"
                                        onClick=${() => {
                                          setDesktopStickyLogoStyle(item.id);
                                          setShowDesktopLogoPicker(false);
                                        }}
                                      >
                                        <img src=${item.src} alt="" />
                                      </button>`,
                                    )}
                                  </div>
                                </div>
                                <div className="logo-picker-section">
                                  <div className="logo-picker-title">Logos</div>
                                  <div className="logo-picker-grid">
                                    ${[
                                      { id: "logo-greyscale", src: "/Images/Logos/Logo_GreyScale.png" },
                                      { id: "logo-golden", src: "/Images/Logos/Logo_Golden.png" },
                                      { id: "logo-fiery", src: "/Images/Logos/Logo_Fiery.png" },
                                      { id: "logo-icey", src: "/Images/Logos/Logo_Icey.png" },
                                    ].map(
                                      (item) => html`<button
                                        key=${item.id}
                                        className=${`logo-option ${desktopStickyLogoStyle === item.id ? "selected" : ""}`}
                                        type="button"
                                        onClick=${() => {
                                          setDesktopStickyLogoStyle(item.id);
                                          setShowDesktopLogoPicker(false);
                                        }}
                                      >
                                        <img src=${item.src} alt="" />
                                      </button>`,
                                    )}
                                  </div>
                                </div>
                              </div>`
                            : html``}
                        </div>
                      `
                    : html``}
                  <div className="settings-row">
                    <label>Click flash</label>
                    <div className="toggle">
                      <span>${uiFlashEnabled ? "On" : "Off"}</span>
                      <button
                        className=${`switch ${uiFlashEnabled ? "on" : ""}`}
                        type="button"
                        onClick=${() => setUiFlashEnabled(!uiFlashEnabled)}
                        title="Toggle click flash"
                      ></button>
                    </div>
                  </div>
                  <div className="settings-row">
                    <label>Toast corners</label>
                    <select
                      value=${toastShape}
                      onChange=${(event) => setToastShape(event.target.value)}
                    >
                      <option value="block">Blocky</option>
                      <option value="rounded">Rounded</option>
                    </select>
                  </div>
                `
              : html``}
                ${isMobileView
                  ? html`
                      <div className="settings-row">
                        <label>Mobile menu side</label>
                        <select
                          value=${menuSide}
                          onChange=${(event) => setMenuSide(event.target.value)}
                        >
                          <option value="left">Left</option>
                          <option value="right">Right</option>
                        </select>
                      </div>
                  <div className="settings-row">
                    <label>Mobile navbar background</label>
                    <select
                      value=${mobileNavStyle}
                      onChange=${(event) => setMobileNavStyle(event.target.value)}
                    >
                      <option value="transparent">Transparent</option>
                      <option value="solid">Solid</option>
                    </select>
                  </div>
                  ${mobileNavStyle === "solid"
                    ? html`
                        <div className="settings-row">
                          <label>Mobile navbar logo</label>
                          <button
                            className="logo-picker-trigger"
                            type="button"
                            onClick=${() => setShowLogoPicker(!showLogoPicker)}
                          >
                            Choose icon or logo
                          </button>
                          ${showLogoPicker
                            ? html`<div className="logo-picker">
                                <div className="logo-picker-section">
                                  <div className="logo-picker-title">Icons</div>
                                  <div className="logo-picker-grid">
                                    ${[
                                      { id: "icon-greyscale", src: "/assets/HardTale_H_GreyScale.png" },
                                      { id: "icon-golden", src: "/assets/HardTale_H_Golden.png" },
                                      { id: "icon-fiery", src: "/assets/HardTale_H_Fiery.png" },
                                      { id: "icon-icey", src: "/assets/HardTale_H_Icey.png" },
                                      { id: "icon-ht", src: "/assets/HardTale_H_HT.png" },
                                    ].map(
                                      (item) => html`<button
                                        key=${item.id}
                                        type="button"
                                        className=${`logo-option ${mobileLogoStyle === item.id ? "selected" : ""}`}
                                        onClick=${() => {
                                          setMobileLogoStyle(item.id);
                                          setShowLogoPicker(false);
                                        }}
                                      >
                                        <img src=${item.src} alt="" />
                                      </button>`,
                                    )}
                                  </div>
                                </div>
                                <div className="logo-picker-section">
                                  <div className="logo-picker-title">Logos</div>
                                  <div className="logo-picker-grid">
                                    ${[
                                      { id: "logo-greyscale", src: "/Images/Logos/Logo_GreyScale.png" },
                                      { id: "logo-golden", src: "/Images/Logos/Logo_Golden.png" },
                                      { id: "logo-fiery", src: "/Images/Logos/Logo_Fiery.png" },
                                      { id: "logo-icey", src: "/Images/Logos/Logo_Icey.png" },
                                    ].map(
                                      (item) => html`<button
                                        key=${item.id}
                                        type="button"
                                        className=${`logo-option ${mobileLogoStyle === item.id ? "selected" : ""}`}
                                        onClick=${() => {
                                          setMobileLogoStyle(item.id);
                                          setShowLogoPicker(false);
                                        }}
                                      >
                                        <img src=${item.src} alt="" />
                                      </button>`,
                                    )}
                                  </div>
                                </div>
                              </div>`
                            : html``}
                        </div>
                      `
                    : html``}
                `
              : html``}
            ${!isMobileView
              ? html`
                  <div className="settings-row">
                    <label>Desktop logo side</label>
                    <select
                      value=${logoSide}
                      onChange=${(event) => setLogoSide(event.target.value)}
                    >
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                    </select>
                  </div>
                `
              : html``}
            <div className="settings-row">
              <label>Quick toggles</label>
              <div className="toggle">
                <span>${theme === "light" ? "Light" : "Dark"}</span>
                <button
                  className=${`switch ${theme === "dark" ? "on" : ""}`}
                  type="button"
                  onClick=${toggleLightDark}
                  title="Toggle light/dark"
                ></button>
              </div>
            </div>
            ${isMobileView
              ? html`<div className="settings-row">
                  <label>Floating island (mobile)</label>
                  <div className="toggle">
                    <span>${showMobileIsland ? "Show" : "Hide"}</span>
                    <button
                      className=${`switch ${showMobileIsland ? "on" : ""}`}
                      type="button"
                      onClick=${() => setShowMobileIsland(!showMobileIsland)}
                      title="Toggle floating island"
                    ></button>
                  </div>
                </div>`
              : html``}
          </div>
          <//>`
        : html``}
    </div>
  `;
}

function CartButton({ onClick, count }) {
  if (Number(count || 0) <= 0) return null;
  const [cartPopActive, setCartPopActive] = useState(false);
  const previousCountRef = useRef(Number(count || 0));

  useEffect(() => {
    const nextCount = Number(count || 0);
    if (nextCount === previousCountRef.current) return;
    previousCountRef.current = nextCount;
    setCartPopActive(true);
    const timer = setTimeout(() => setCartPopActive(false), 260);
    return () => clearTimeout(timer);
  }, [count]);

  return html`
    <button
      className=${`settings-button cart-button ${cartPopActive ? "cart-pop" : ""}`}
      title="Cart"
      onClick=${onClick}
    >
      <span
        className="cart-icon-mask"
        aria-hidden="true"
        style=${{ "--cart-icon": `url(${BASKET_ICON_SVG})` }}
      ></span>
      ${count > 0 ? html`<${CountBadge} count=${count} className="cart-badge" />` : html``}
    </button>
  `;
}

function NotificationsButton({ count, onClick, flashEnabled }) {
  function handleClick(event) {
    const buttonEl = event?.currentTarget;
    if (flashEnabled && buttonEl) {
      buttonEl.classList.remove("flash");
      void buttonEl.offsetWidth;
      buttonEl.classList.add("flash");
      setTimeout(() => {
        if (buttonEl?.classList) buttonEl.classList.remove("flash");
      }, 400);
    }
    onClick();
  }
  return html`
    <button className="settings-button notif" title="Notifications" onClick=${handleClick}>
      <span
        className="notif-icon-mask"
        aria-hidden="true"
        style=${{ "--notif-icon": `url(${NOTIFICATIONS_ICON_SVG})` }}
      ></span>
      ${count > 0 ? html`<${CountBadge} count=${count} className="cart-badge notif-badge" />` : html``}
    </button>
  `;
}

function LoadingScreen({ show, variant }) {
  if (!show) return null;
  return html`
    <div className="hardtale-loader-overlay" role="status" aria-live="polite">
      <${HardtaleLoader} variant=${variant} />
    </div>
  `;
}

function StoreGatewayPage() {
  const navigate = useNavigate();
  const { isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [pendingPath, setPendingPath] = useState("");
  const options = [
    {
      id: "ranks",
      title: "Ranks",
      path: "/store/ranks",
      iconType: "hero",
      imageSrc: "/Images/store/Store_Ranks.png",
      copy: "Rank perks, prefixes, and account upgrades.",
    },
    {
      id: "gold",
      title: "Gold",
      path: "/store/gold",
      iconType: "crown",
      imageSrc: "/Images/store/Store_Gold_Chest.png",
      copy: "In-game premium currency bundles and offers.",
    },
    {
      id: "currency",
      title: "Currency",
      path: "/store/currency",
      iconType: "star",
      imageSrc: "/Images/store/Store_Boosts_Potion.png",
      copy: "Additional store currencies and exchange packs.",
    },
  ];

  function openSection(path) {
    const target = String(path || "").trim();
    if (!target) return;
    if (!isSignedIn) {
      setPendingPath(target);
      if (openSignIn) openSignIn({});
      return;
    }
    navigate(target);
  }

  useEffect(() => {
    if (!pendingPath || !isSignedIn) return;
    navigate(pendingPath);
    setPendingPath("");
  }, [pendingPath, isSignedIn, navigate]);

  return html`
    <section className="card fade-in store-gateway">
      <div className="section-title">Store</div>
      <p className="muted">
        Choose a section to continue. Sign-in is required before entering a store section.
      </p>
      <ul className="blocks-list" role="list">
        ${options.map(
          (entry) => html`<li key=${entry.id} className="blocks-item" id=${`block-${entry.id}`}>
            <a
              href=${entry.path}
              title=${entry.title}
              className="blocks-item-link"
              onClick=${(event) => {
                event.preventDefault();
                openSection(entry.path);
              }}
            >
              <img className="block-icon-image" src=${entry.imageSrc} alt="" aria-hidden="true" loading="lazy" />
              <p className="blocks-item-title">${entry.title}</p>
              <span className="blocks-item-copy">${entry.copy}</span>
            </a>
          </li>`,
        )}
      </ul>
    </section>
  `;
}

function StorePage({
  onAdd,
  onRemove = () => {},
  isLinkedAccount = false,
  isAdmin = false,
  isStaff = false,
  cart = [],
  section = "ranks",
  onAdminFakePurchase = null,
  profileAvatar = "",
  profileRankLabel = "Unregistered",
  profileOwnedRank = "Unregistered",
  profileStaffRole = "",
}) {
  const [showTicket, setShowTicket] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [previewItemId, setPreviewItemId] = useState("");
  const [rankDetailItemId, setRankDetailItemId] = useState("");
  const [openPerkRows, setOpenPerkRows] = useState({});
  const [message, setMessage] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [ticketSent, setTicketSent] = useState(false);
  const comparisonTopWrapRef = useRef(null);
  const comparisonBottomWrapRef = useRef(null);
  const comparisonSyncingRef = useRef(false);
  const location = useLocation();
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const [adminPurchaseLoading, setAdminPurchaseLoading] = useState(false);
  const [adminPurchaseStatus, setAdminPurchaseStatus] = useState("");
  const email = getUserEmail(user);
  const storePreviewName = isSignedIn ? getUserDisplayName(user) : "Guest";
  const storePreviewImage = String(
    isSignedIn
      ? profileAvatar || user?.imageUrl || "/assets/HardTale_H_GreyScale.png"
      : DEFAULT_PROFILE_AVATAR_SVG,
  );
  const storePreviewUsername = isSignedIn ? formatUsernameForDisplay(user?.username) : "";
  const storePreviewOwnedRank = normalizeOwnedRankLabel(profileOwnedRank || profileRankLabel || "Unregistered");
  const storePreviewStaffRole = String(profileStaffRole || "").trim();
  const storePreviewHasStaff = Boolean(storePreviewStaffRole) || isStaffLabel(profileRankLabel || "");
  const storePreviewStaffEntry = useMemo(
    () => ({
      staffRole: storePreviewStaffRole,
      authorStaffRole: storePreviewStaffRole,
    }),
    [storePreviewStaffRole],
  );
  const ownedTierInProfile = OWNED_RANK_TIER[storePreviewOwnedRank] || 0;
  const previewItem = SAMPLE_STORE.find((item) => item.id === previewItemId) || null;
  const rankDetailItem = SAMPLE_STORE.find((item) => item.id === rankDetailItemId) || null;
  const canUseFakePurchase = Boolean(isAdmin || isStaff);
  const canPurchase = Boolean(isSignedIn && isLinkedAccount);
  const normalizedSection = String(section || "ranks").trim().toLowerCase();
  const isRanksSection = normalizedSection === "ranks";
  const cartItems = Array.isArray(cart) ? cart : [];
  const highestTierInCart = cartItems.reduce(
    (maxTier, entry) => Math.max(maxTier, RANK_TIER_ORDER[String(entry?.id || "")] || 0),
    0,
  );
  const coreComparisonRows = useMemo(
    () => [
      { label: "Chat Prefix", values: { "rank-hero": "[HERO]", "rank-legend": "[LEGEND]", "rank-mythic": "[MYTHIC]" } },
      { label: "In-game Name Color", values: { "rank-hero": "Hero Blue", "rank-legend": "Legend Gold", "rank-mythic": "Mythic Pink" } },
      { label: "Passive XP Boost", values: { "rank-hero": "10%", "rank-legend": "20%", "rank-mythic": "30%" } },
      { label: "Daily XP Boost", values: { "rank-hero": "15 min", "rank-legend": "30 min", "rank-mythic": "1 hour" } },
      { label: "Weekly Kit", values: { "rank-hero": true, "rank-legend": true, "rank-mythic": true } },
      { label: "Extra /home Slots", values: { "rank-hero": "+1", "rank-legend": "+2", "rank-mythic": "+3" } },
      { label: "Global Boost Charges", values: { "rank-hero": false, "rank-legend": "1 monthly", "rank-mythic": "2 monthly" } },
      { label: "Gradient Chat Prefix", values: { "rank-hero": true, "rank-legend": true, "rank-mythic": true } },
      { label: "Colored Chat Messages", values: { "rank-hero": true, "rank-legend": true, "rank-mythic": true } },
      { label: "Reduced Teleport Cooldown", values: { "rank-hero": false, "rank-legend": true, "rank-mythic": true } },
      { label: "Priority Queue", values: { "rank-hero": false, "rank-legend": true, "rank-mythic": true } },
      { label: "Bold Badge", values: { "rank-hero": true, "rank-legend": true, "rank-mythic": true } },
    ],
    [],
  );
  const extendedComparisonRows = useMemo(
    () => [
      { label: "Special Cosmetic Title Glow", values: { "rank-hero": false, "rank-legend": false, "rank-mythic": true } },
      { label: "Particle Aura Cosmetic", values: { "rank-hero": false, "rank-legend": false, "rank-mythic": true } },
      { label: "Guild Banner Cosmetic", values: { "rank-hero": false, "rank-legend": false, "rank-mythic": true } },
      { label: "Resource Bundle in Kit", values: { "rank-hero": false, "rank-legend": true, "rank-mythic": false } },
      { label: "Rare Crafting Materials in Kit", values: { "rank-hero": false, "rank-legend": false, "rank-mythic": true } },
      { label: "No Raw Damage Bonuses", values: { "rank-hero": true, "rank-legend": true, "rank-mythic": true } },
    ],
    [],
  );

  useEffect(() => {
    const stored = Number(localStorage.getItem(TICKET_COOLDOWN_KEY) || 0);
    if (stored && stored > Date.now()) {
      setCooldownUntil(stored);
    }
  }, []);

  useEffect(() => {
    if (location.hash === "#ticket" || location.search.includes("ticket=1")) {
      setShowTicket(true);
    }
  }, [location.hash, location.search]);

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownLeft(0);
      return;
    }
    function tick() {
      const remaining = Math.max(cooldownUntil - Date.now(), 0);
      setCooldownLeft(remaining);
      if (remaining === 0) {
        setCooldownUntil(0);
        setTicketSent(false);
        localStorage.removeItem(TICKET_COOLDOWN_KEY);
      }
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [cooldownUntil]);

  function formatCooldown(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
  }

  function submitTicket(event) {
    event.preventDefault();
    const subject = encodeURIComponent("Hardtale Store Ticket");
    const body = encodeURIComponent(
      `From: ${email || "Unknown user"}\n\n${message.trim()}`,
    );
    window.location.href = `mailto:hardtaleserver@gmail.com?subject=${subject}&body=${body}`;
    setMessage("");
    const nextCooldown = Date.now() + TICKET_COOLDOWN_MS;
    localStorage.setItem(TICKET_COOLDOWN_KEY, String(nextCooldown));
    setCooldownUntil(nextCooldown);
    setTicketSent(true);
  }

  function getStoreRankLabel(item) {
    return String(item?.name || "").replace(/\s*Rank$/i, "").trim() || "Registered";
  }

  function getStoreRankSlug(item) {
    return getStoreRankLabel(item).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  function getStoreCardBadges(item) {
    const rankLabel = getStoreRankLabel(item);
    return [rankLabel];
  }

  function getStorePreviewBadges(item) {
    if (!item?.id) return [];
    const maxTier = RANK_TIER_ORDER[item.id] || 0;
    return STORE_BADGE_ORDER.filter((label) => (OWNED_RANK_TIER[label] || 0) <= maxTier);
  }

  function isTierLockedInCart(item) {
    const tier = RANK_TIER_ORDER[String(item?.id || "")] || 0;
    if (!tier) return false;
    return tier < highestTierInCart;
  }

  function isAlreadyInCart(item) {
    const id = String(item?.id || "");
    if (!id) return false;
    return cartItems.some((entry) => String(entry?.id || "") === id);
  }

  async function runAdminFakePurchase() {
    if (!canUseFakePurchase || typeof onAdminFakePurchase !== "function") return;
    setAdminPurchaseStatus("");
    setAdminPurchaseLoading(true);
    try {
      const result = await onAdminFakePurchase();
      if (!result?.ok) {
        setAdminPurchaseStatus(String(result?.error || "Fake purchase failed."));
        return;
      }
      const awardedRank = String(result?.awardedRank || "").trim();
      const purchaseId = String(result?.purchaseId || "").trim();
      setAdminPurchaseStatus(
        awardedRank
          ? `Fake purchase queued. Rank awarded: ${awardedRank}${purchaseId ? ` (id: ${purchaseId})` : ""}`
          : `Fake purchase queued${purchaseId ? ` (id: ${purchaseId})` : ""}.`,
      );
    } catch (error) {
      setAdminPurchaseStatus(String(error?.message || "Fake purchase failed."));
    } finally {
      setAdminPurchaseLoading(false);
    }
  }

  function getStoreAddMeta(item) {
    const alreadyInCart = isAlreadyInCart(item);
    const tierLocked = isTierLockedInCart(item);
    const rankTier = RANK_TIER_ORDER[String(item?.id || "")] || 0;
    const ownedTierLocked = rankTier > 0 && ownedTierInProfile >= rankTier;
    const addDisabled = !canPurchase || ownedTierLocked || alreadyInCart || tierLocked;
    const addTitle = !canPurchase
      ? isSignedIn
        ? "Link your game account first (/link)"
        : "Sign in to use the store"
      : ownedTierLocked
      ? ownedTierInProfile === rankTier
        ? "You already own this rank"
        : `Included with your ${storePreviewOwnedRank} rank`
      : alreadyInCart
      ? "Already in cart"
      : tierLocked
      ? "A higher tier is already in your cart"
      : "Add to cart";
    const addLabel = !canPurchase
      ? isSignedIn
        ? "Link account to buy"
        : "Sign in to buy"
      : ownedTierLocked
      ? ownedTierInProfile === rankTier
        ? "Owned"
        : "Included"
      : alreadyInCart
      ? "In cart"
      : tierLocked
      ? "Tier locked"
      : "Add to cart";
    return { addDisabled, addTitle, addLabel, alreadyInCart, tierLocked, ownedTierLocked };
  }

  function renderComparisonCell(value, rowLabel = "", item = null) {
    if (rowLabel === "Chat Prefix" && item) {
      const rankSlug = getStoreRankSlug(item);
      return html`<span className=${`store-comparison-prefix rank-${rankSlug}`.trim()}>${String(value || "-")}</span>`;
    }
    if (rowLabel === "In-game Name Color" && item) {
      const rankSlug = getStoreRankSlug(item);
      const comparisonName = storePreviewUsername ? `@${storePreviewUsername}` : storePreviewName;
      return html`<span className=${`store-comparison-name-color rank-${rankSlug}`.trim()}>${comparisonName}</span>`;
    }
    if (typeof value === "boolean") {
      return html`<img
        className=${`store-comparison-status-icon ${value ? "is-success" : "is-error"}`.trim()}
        src=${value ? SUCCESS_STATUS_ICON_SVG : ERROR_STATUS_ICON_SVG}
        alt=${value ? "Included" : "Not included"}
        loading="lazy"
      />`;
    }
    return html`<span className="store-comparison-value-text">${String(value || "-")}</span>`;
  }

  function syncComparisonScroll(source) {
    if (comparisonSyncingRef.current) return;
    const topWrap = comparisonTopWrapRef.current;
    const bottomWrap = comparisonBottomWrapRef.current;
    if (!topWrap || !bottomWrap) return;
    const sourceWrap = source === "bottom" ? bottomWrap : topWrap;
    const targetWrap = source === "bottom" ? topWrap : bottomWrap;
    comparisonSyncingRef.current = true;
    targetWrap.scrollLeft = sourceWrap.scrollLeft;
    requestAnimationFrame(() => {
      comparisonSyncingRef.current = false;
    });
  }

  function togglePerkRow(itemId) {
    setOpenPerkRows((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  }

  function renderComparisonHeaderCell(item, keyPrefix = "comparison", includeBuy = true) {
    const rankLabel = getStoreRankLabel(item);
    const rankSlug = getStoreRankSlug(item);
    const addMeta = getStoreAddMeta(item);
    const previewTitles = STORE_PREVIEW_TITLES_BY_ID[item.id] || [];
    const perks = perkBullets(item.blurb).slice(0, 2).map((entry) => capitalizePerk(entry));
    return html`<th key=${`${keyPrefix}-head-${item.id}`} scope="col" className="store-rank-col store-rank-head-cell">
      <div className="store-rank-head">
        <div className=${`store-sticky-rank-name rank-${rankSlug}`.trim()}>${rankLabel}</div>
        <div className="store-rank-head-profile">
          <img className="store-rank-head-avatar" src=${storePreviewImage} alt=${storePreviewName} loading="lazy" />
          <div className="store-rank-head-meta">
            <div className="store-rank-head-name">${storePreviewName}</div>
            ${storePreviewUsername
              ? html`<div className=${`store-rank-head-username rank-${rankSlug}`.trim()}>@${storePreviewUsername}</div>`
              : html``}
          </div>
        </div>
        <button
          type="button"
          className="store-rank-head-art-btn"
          title=${`Open ${rankLabel} rank details`}
          onClick=${() => setRankDetailItemId(item.id)}
        >
          <${StoreRankArt}
            rankId=${item.id}
            className="store-rank-head-art"
            alt=""
            aria-hidden="true"
            loading="lazy"
          />
        </button>
        <div className="store-rank-head-badges">
          <${RankBadge} label=${rankLabel} className="store-owned-badge store-comparison-badge" />
        </div>
        <div className="store-rank-head-info">
          ${previewTitles.length > 0
            ? html`<div>Titles: ${previewTitles.join(", ")}</div>`
            : html``}
          ${perks.map((perk, index) => html`<div key=${`${item.id}-perk-${index}`}>${perk}</div>`)}
        </div>
        ${includeBuy
          ? html`<button
              type="button"
              className="button store-cta store-comparison-buy-btn"
              onClick=${() => onAdd(item)}
              disabled=${addMeta.addDisabled}
              title=${addMeta.addTitle}
            >
              ${addMeta.addLabel}
            </button>`
          : html``}
        <div className="store-comparison-price">$${item.price.toFixed(2)}</div>
      </div>
    </th>`;
  }

  return html`
    <section className="card fade-in store-ranks-section">
      <div className="section-title">Hardtale Store</div>
      ${canUseFakePurchase
        ? html`<div className="store-admin-tools">
            <button
              type="button"
              className="button ghost-btn"
              onClick=${runAdminFakePurchase}
              disabled=${adminPurchaseLoading}
              title="Create a paid test purchase from your current cart (staff only)"
            >
              ${adminPurchaseLoading ? "Running fake purchase..." : "Fake Purchase (Staff)"}
            </button>
            ${adminPurchaseStatus ? html`<div className="muted store-admin-status">${adminPurchaseStatus}</div>` : html``}
          </div>`
        : html``}
      ${isSignedIn && !isLinkedAccount
        ? html`<p className="muted store-link-required">
            Your account is currently Unlinked. Use <${Link} className="ranks-link" to="/link">/link</${Link}> to unlock store purchases.
          </p>`
        : html``}
      ${isRanksSection
        ? html`<div className="store-grid">
            ${SAMPLE_STORE.map(
              (item) => {
                const addMeta = getStoreAddMeta(item);
                const itemSlug = getStoreRankSlug(item);
                const perkItems = perkBullets(item.blurb).map((entry) => capitalizePerk(entry));
                const perksOpen = Boolean(openPerkRows[item.id]);
                const rankLabel = getStoreRankLabel(item);
                return html`<div
                  key=${item.id}
                  className=${`store-card rank-preview-${getStoreRankSlug(item)} ${addMeta.ownedTierLocked ? "owned-locked" : ""}`.trim()}
                >
                ${addMeta.alreadyInCart
                  ? html`<button
                      type="button"
                      className="store-card-remove"
                      title="Remove from cart"
                      aria-label="Remove from cart"
                      onClick=${() => onRemove(item.id)}
                    >
                      <img src=${DELETE_ICON_SVG} alt="" aria-hidden="true" />
                    </button>`
                  : html``}
                <div className=${`comment-rank store-rank-title rank-${itemSlug}`.trim()}>
                  ${(() => {
                    const iconType = getRankIconType(getStoreRankLabel(item));
                    return html`${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                      <span>${item.name}</span>`;
                  })()}
                </div>
                <div className="store-rank-card-art-wrap">
                  <button
                    type="button"
                    className="store-rank-card-art-btn"
                    title=${`Open ${getStoreRankLabel(item)} rank details`}
                    onClick=${() => setRankDetailItemId(item.id)}
                  >
                    <${StoreRankArt}
                      rankId=${item.id}
                      className="store-rank-card-art"
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                  </button>
                </div>
                <${ProfilePreviewButton}
                  onClick=${() => setPreviewItemId(item.id)}
                  title="Open profile preview"
                  avatar=${storePreviewImage}
                  name=${storePreviewName}
                  username=${storePreviewUsername}
                >
                  ${getStoreCardBadges(item).map(
                    (label) => html`<${RankBadge} label=${label} className="store-owned-badge" />`,
                  )}
                  ${storePreviewHasStaff
                    ? html`<span
                        className=${`profile-owned-badge staff-owned-badge ${resolveStaffRoleClass(storePreviewStaffEntry)}`.trim()}
                        title=${toStaffPillTitle(storePreviewStaffRole) || "Staff"}
                      >
                        <span>${toStaffPillTitle(storePreviewStaffRole) || "Staff"}</span>
                      </span>`
                    : html``}
                <//>
                <div className=${`comment-rank store-profile-rank rank-${itemSlug}`.trim()}>
                  ${(() => {
                    const iconType = getRankIconType(getStoreRankLabel(item));
                    return html`${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                      <span>${rankLabel}</span>`;
                  })()}
                </div>
                <div className="store-tag-preview-line">
                  <span className="muted">In-game tag</span>
                  <span className=${`comment-rank store-tag-preview rank-${itemSlug}`.trim()}>
                    ${(() => {
                      const iconType = getRankIconType(rankLabel);
                      return html`${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                        <span>[${rankLabel.toUpperCase()}]</span>`;
                    })()}
                  </span>
                </div>
                <div className="store-preview-note muted">
                  Titles unlocked: ${(STORE_PREVIEW_TITLES_BY_ID[item.id] || []).join(", ")}
                </div>
                <div className="store-desc">
                  <${InlineDropdownToggle}
                    label="Perks"
                    count=${perkItems.length}
                    open=${perksOpen}
                    onToggle=${() => togglePerkRow(item.id)}
                  />
                  <div className=${`store-perks-panel ${perksOpen ? "open" : ""}`.trim()}>
                    <div className="store-perks">
                      ${perkItems.map((perk) => html`<div>${perk}</div>`)}
                    </div>
                  </div>
                </div>
                <div className="store-price">$${item.price.toFixed(2)}</div>
                <button
                  className="button store-cta"
                  onClick=${() => onAdd(item)}
                  disabled=${addMeta.addDisabled}
                  title=${addMeta.addTitle}
                >
                  ${addMeta.addLabel}
                </button>
              </div>`;
              },
            )}
          </div>
          <div className="store-comparison-shell">
            <div className="section-title">Rank Comparison</div>
            <div className="store-comparison-scroll-hint">Scroll right for more -></div>
            <div
              className="store-comparison-wrap"
              ref=${comparisonTopWrapRef}
              onScroll=${() => syncComparisonScroll("top")}
            >
              <table className="store-comparison-table" role="table" aria-label="Rank feature comparison">
                <thead>
                  <tr>
                    <th scope="col" className="store-feature-col" aria-label="Rank features"></th>
                    ${SAMPLE_STORE.map((item) => renderComparisonHeaderCell(item, "comparison", true))}
                  </tr>
                </thead>
                <tbody>
                  ${coreComparisonRows.map((row) => html`<tr key=${`core-row-${row.label}`}>
                    <th scope="row" className="store-feature-label">${row.label}</th>
                    ${SAMPLE_STORE.map((item) => html`<td key=${`core-cell-${row.label}-${item.id}`}>
                      ${renderComparisonCell(row.values[item.id], row.label, item)}
                    </td>`)}
                  </tr>`)}
                </tbody>
              </table>
            </div>
            <div className="store-comparison-toggle-row">
              <button
                type="button"
                className="button ghost-btn store-comparison-toggle"
                onClick=${() => setShowComparison((prev) => !prev)}
              >
                ${showComparison ? "Hide extended features" : "Click here to see more features"}
              </button>
            </div>
            ${showComparison
              ? html`<div
                  className="store-comparison-wrap expanded"
                  ref=${comparisonBottomWrapRef}
                  onScroll=${() => syncComparisonScroll("bottom")}
                >
                  <table className="store-comparison-table" role="table" aria-label="Extended rank feature comparison">
                    <tbody>
                      ${extendedComparisonRows.map((row) => html`<tr key=${`extended-row-${row.label}`}>
                        <th scope="row" className="store-feature-label">${row.label}</th>
                        ${SAMPLE_STORE.map((item) => html`<td key=${`extended-cell-${row.label}-${item.id}`}>
                          ${renderComparisonCell(row.values[item.id], row.label, item)}
                        </td>`)}
                      </tr>`)}
                    </tbody>
                  </table>
                </div>
                `
              : html``}
            <div className="store-comparison-scroll-hint store-comparison-scroll-hint-bottom">Scroll right for more -></div>
          </div>`
        : html`<div className="store-section-placeholder">
            <div className="section-title">${normalizedSection === "gold" ? "Gold Shop" : "Currency Shop"}</div>
            <p className="muted">
              This section is being prepared. Use <${Link} className="ranks-link" to="/store/ranks">Ranks</${Link}> for now.
            </p>
          </div>`}
      <p className="muted store-support-note">
        Support the server and become a local:
        <${RankBadge} label="Hero" className="store-owned-badge" />
        <${RankBadge} label="Legend" className="store-owned-badge" />
        <${RankBadge} label="Mythic" className="store-owned-badge" />
        By giving global boosts to the entire server.
      </p>
    </section>
    <section className="card fade-in rank-philosophy">
      <div className="section-title">Why These Ranks Work</div>
      <div className="rank-philosophy-grid">
        <div className="rank-philosophy-card">
          <div className="rank-philosophy-title">Price vs Value</div>
          <p className="muted">
            Mid-tier pricing that feels fair. Players get real convenience and cosmetics,
            not just a name color.
          </p>
        </div>
        <div className="rank-philosophy-card">
          <div className="rank-philosophy-title">One-Time Rewards</div>
          <p className="muted">
            Impactful boosts that help without skipping progression. Big dopamine, low power creep.
          </p>
        </div>
        <div className="rank-philosophy-card">
          <div className="rank-philosophy-title">Quality-of-Life Commands</div>
          <p className="muted">
            /trash, /getpos, portable storage, repair access. Convenience that keeps players engaged.
          </p>
        </div>
        <div className="rank-philosophy-card">
          <div className="rank-philosophy-title">Claim Chunks + Kits</div>
          <p className="muted">
            Daily claim options and cooldown kits build healthy habits without monopolies.
            Playtime can also earn an extra claim occasionally.
          </p>
        </div>
      </div>
      <div className="rank-philosophy-note">
        <strong>Important:</strong> No exclusive weapons or PvP stat boosts. Cosmetics + convenience keep the server healthy.
      </div>
    </section>
    <section className="card fade-in ranks-info">
      <div className="section-title">About Ranks</div>
      <p className="ranks-lead">
        A Hardtale Rank is a fun way to help support the Hardtale Server! With
        different perks, commands, and rank colors, this table above is to help
        you figure out which rank best suits you.
      </p>
      <p className="muted">
        If you already have a rank, the value of your current rank is deducted
        from your future rank upgrades. This upgrade price will be displayed
        automatically as you browse this page.
      </p>
      <div className="ranks-divider"></div>
      <div className="ranks-help">
        <div className="ranks-help-title">Need help?</div>
        <p className="muted">
          If you have any questions or issues related to payments, send us a
          ticket <button className="ranks-link" type="button" onClick=${() => setShowTicket(true)}>here</button>, and we will reply
          as fast as possible.
        </p>
        <p className="muted">
          You can manage or cancel your subscriptions by visiting our
          subscription portal <${Link} className="ranks-link" to="/subscriptions">here</${Link}>.
        </p>
      </div>
    </section>
    <${PopUp}
      show=${Boolean(previewItem)}
      onClose=${() => setPreviewItemId("")}
      title=${previewItem ? `${previewItem.name} Profile Preview` : "Rank Profile Preview"}
      className="store-profile-preview-overlay"
    >
      ${previewItem
        ? html`<${ProfileCardLayout}
            className="store-profile-preview-card"
            avatarClassName="profile-card-avatar"
            avatarSrc=${storePreviewImage}
            avatarAlt=${storePreviewName}
            nameClassName=${`profile-card-name rank-${getStoreRankSlug(previewItem)}`.trim()}
            name=${storePreviewName}
            username=${storePreviewUsername}
            rankNode=${html`<div className=${`comment-rank profile-card-rank rank-${getStoreRankSlug(previewItem)}`.trim()}>
              ${(() => {
                const iconType = getRankIconType(getStoreRankLabel(previewItem));
                return html`${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                  <span>${getStoreRankLabel(previewItem)}</span>`;
              })()}
            </div>`}
          >
            <div className=${`comment-rank store-rank-title rank-${getStoreRankSlug(previewItem)}`.trim()}>
              ${(() => {
                const iconType = getRankIconType(getStoreRankLabel(previewItem));
                return html`${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                  <span>${previewItem.name}</span>`;
              })()}
            </div>
            <div className="profile-card-badges-block">
              <div className="profile-card-badges-title">Badges</div>
              <div className="profile-card-badges-row">
                ${getStorePreviewBadges(previewItem).map(
                  (label) => html`<${RankBadge} label=${label} className="store-owned-badge" />`,
                )}
              </div>
            </div>
          <//>`
        : html``}
    <//>
    <${PopUp}
      show=${Boolean(rankDetailItem)}
      onClose=${() => setRankDetailItemId("")}
      title=${rankDetailItem ? `${rankDetailItem.name} Details` : "Rank Details"}
      className="store-rank-detail-overlay"
    >
      ${rankDetailItem
        ? html`<div className="store-rank-detail">
            <div className=${`comment-rank store-rank-title rank-${getStoreRankSlug(rankDetailItem)}`.trim()}>
              ${(() => {
                const iconType = getRankIconType(getStoreRankLabel(rankDetailItem));
                return html`${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                  <span>${rankDetailItem.name}</span>`;
              })()}
            </div>
            <div className="store-rank-detail-badge">
              <${RankBadge} label=${getStoreRankLabel(rankDetailItem)} className="store-owned-badge" />
            </div>
            <${StoreRankArt}
              rankId=${rankDetailItem.id}
              className="store-rank-detail-art"
              alt=""
              aria-hidden="true"
              loading="lazy"
            />
            <div className="store-rank-detail-perks">
              ${perkBullets(rankDetailItem.blurb).slice(0, 5).map(
                (perk) => html`<div>${capitalizePerk(perk)}</div>`,
              )}
            </div>
            ${(() => {
              const addMeta = getStoreAddMeta(rankDetailItem);
              return html`<button
                type="button"
                className="button store-cta"
                onClick=${() => {
                  onAdd(rankDetailItem);
                  if (!addMeta.addDisabled) setRankDetailItemId("");
                }}
                disabled=${addMeta.addDisabled}
                title=${addMeta.addTitle}
              >
                ${addMeta.addLabel}
              </button>`;
            })()}
            <div className="store-rank-detail-price">$${rankDetailItem.price.toFixed(2)}</div>
          </div>`
        : html``}
    <//>
    <${PopUp} show=${showTicket} onClose=${() => setShowTicket(false)} title="Send a Ticket">
      <${SignedOut}>
        <p className="muted">Please sign in to send a ticket.</p>
        <${SignInButton} mode="modal">
          <button className="button primary">Sign in</button>
        <//>
      <//>
      <${SignedIn}>
        ${ticketSent || cooldownLeft > 0
          ? html`<div className="ticket-status">
              <div className="ticket-thanks">
                Thank you for your feed-back support will return an email to you in due course.
              </div>
              <div className="muted ticket-timer">
                You can contact support again in ${formatCooldown(cooldownLeft)}.
              </div>
            </div>`
          : html`<form className="ticket-form" onSubmit=${submitTicket}>
              <label>
                <span>Your email</span>
                <input type="email" value=${email} disabled />
              </label>
              <label>
                <span>Message</span>
                <textarea
                  required
                  rows="4"
                  value=${message}
                  onInput=${(event) => setMessage(event.target.value)}
                  placeholder="Tell us what you need help with..."
                ></textarea>
              </label>
              <button className="button primary" type="submit">Email support</button>
            </form>`}
      <//>
    <//>
  `;
}

function perkBullets(text) {
  if (!text) return [];
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function capitalizePerk(text) {
  if (!text) return "";
  let value = text.charAt(0).toUpperCase() + text.slice(1);
  value = value.replace(/\bpassive\b/gi, "Passive");
  value = value.replace(/\bxp\b/gi, "XP");
  value = value.replace(/\bXP\s+([a-z])/g, (_, first) => `XP ${String(first).toUpperCase()}`);
  value = value.replace(/\bextra\b/gi, "Extra");
  value = value.replace(/\bmonthly\b/gi, "Monthly");
  return value;
}

function SupportPage({ isAdmin }) {
  const { getToken, isSignedIn } = useAuth();
  const { openSignIn, openUserProfile } = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const [showTicketModal, setShowTicketModal] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("support");
  const [newBody, setNewBody] = useState("");
  const [newEvidenceLinks, setNewEvidenceLinks] = useState("");
  const [errorContextOptions, setErrorContextOptions] = useState(() => readSupportErrorContexts());
  const [selectedErrorContextId, setSelectedErrorContextId] = useState("");
  const [chatDraft, setChatDraft] = useState("");
  const [nextStatus, setNextStatus] = useState("pending");

  async function loadTickets() {
    if (!isSignedIn) {
      setTickets([]);
      setSelectedTicketId("");
      setSelectedTicket(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/forum/tickets");
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const next = Array.isArray(data.tickets) ? data.tickets : [];
      setTickets(next);
      if (!selectedTicketId && next.length > 0) {
        setSelectedTicketId(next[0].id);
      }
    } catch {
      setStatus("Failed to load tickets.");
    } finally {
      setLoading(false);
    }
  }

  async function loadTicketDetail(ticketId) {
    if (!ticketId || !isSignedIn) {
      setSelectedTicket(null);
      return;
    }
    try {
      const response = await apiFetchWithToken(getToken, true, `/api/forum/tickets/${ticketId}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setSelectedTicket(data.ticket || null);
      setNextStatus((data.ticket?.status || "pending") === "resolved" ? "resolved" : "pending");
    } catch {
      setSelectedTicket(null);
    }
  }

  useEffect(() => {
    loadTickets();
  }, [isSignedIn]);

  useEffect(() => {
    loadTicketDetail(selectedTicketId);
  }, [selectedTicketId, isSignedIn]);

  useEffect(() => {
    const nextOptions = readSupportErrorContexts();
    setErrorContextOptions(nextOptions);
    const attachErrorId = String(new URLSearchParams(location.search || "").get("attachError") || "").trim();
    if (attachErrorId && nextOptions.some((entry) => entry.id === attachErrorId)) {
      setSelectedErrorContextId(attachErrorId);
    }
  }, [location.search, showTicketModal]);

  async function submitTicket(event) {
    event.preventDefault();
    if (!isSignedIn) return;
    if (!newSubject.trim() || !newBody.trim()) return;
    const selectedErrorContext = errorContextOptions.find(
      (entry) => entry.id === selectedErrorContextId,
    );
    const ticketBodyBase = appendEvidenceLinksToBody(newBody, newEvidenceLinks);
    const ticketBody = buildTicketBodyWithAttachedError(ticketBodyBase, selectedErrorContext);
    setStatus("Creating ticket...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/forum/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          body: ticketBody,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const created = data.ticket;
      setNewSubject("");
      setNewCategory("support");
      setNewBody("");
      setNewEvidenceLinks("");
      setSelectedErrorContextId("");
      setStatus("Ticket created.");
      await loadTickets();
      if (created?.id) {
        setSelectedTicketId(created.id);
        setSelectedTicket(created);
      }
    } catch {
      setStatus("Failed to create ticket.");
    }
  }

  async function sendMessage() {
    if (!selectedTicketId || !chatDraft.trim()) return;
    setStatus("Sending message...");
    try {
      const response = await apiFetchWithToken(
        getToken,
        true,
        `/api/forum/tickets/${selectedTicketId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: chatDraft }),
        },
      );
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setSelectedTicket(data.ticket || null);
      setChatDraft("");
      setStatus("");
      await loadTickets();
    } catch {
      setStatus("Failed to send message.");
    }
  }

  async function updateTicketStatus() {
    if (!isAdmin || !selectedTicketId) return;
    setStatus("Updating ticket...");
    try {
      const response = await apiFetchWithToken(getToken, true, `/api/forum/tickets/${selectedTicketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setSelectedTicket(data.ticket || null);
      setStatus("");
      await loadTickets();
    } catch {
      setStatus("Failed to update ticket.");
    }
  }

  return html`
    <section className="news-page fade-in">
      <${PageHero}
        eyebrow="Support"
        title="Player Support"
        copy="Open a private ticket to contact staff for account issues, appeals, bug help, or warnings."
        calloutLabel="Status"
        calloutItems=${[
          { title: "Live Ticket Inbox", copy: "1:1 staff messaging with status updates and full history." },
          {
            title: "Forum Sections",
            copy: "Public categories are now in Forum. Use Support for private help cases.",
          },
        ]}
      />

      <section className="card support-page-launch">
        <div className="support-page-launch-row">
          <div>
            <div className="section-title">Support Tickets</div>
            <p className="muted">Open ticket inbox and private staff chat.</p>
          </div>
          <button className="button primary" type="button" onClick=${() => setShowTicketModal(true)}>
            Open Support
          </button>
        </div>
      </section>

      <${PopUp}
        show=${showTicketModal}
        onClose=${() => {
          setShowTicketModal(false);
          navigate("/");
        }}
        title="Support Center"
        className="support-center-overlay"
      >
        ${!isSignedIn
          ? html`<section className="card">
              <p className="muted">Sign in to create and manage support tickets.</p>
              <button className="button primary" type="button" onClick=${() => openSignIn && openSignIn({})}>
                Sign in
              </button>
            </section>`
          : html`<section className="card admin-tools support-modal-layout">
              <${SupportTicketForm}
                submitTicket=${submitTicket}
                newSubject=${newSubject}
                setNewSubject=${setNewSubject}
                newCategory=${newCategory}
                setNewCategory=${setNewCategory}
                newBody=${newBody}
                setNewBody=${setNewBody}
                newEvidenceLinks=${newEvidenceLinks}
                setNewEvidenceLinks=${setNewEvidenceLinks}
                errorContextOptions=${errorContextOptions}
                selectedErrorContextId=${selectedErrorContextId}
                setSelectedErrorContextId=${setSelectedErrorContextId}
                status=${status}
              />

              <div className="admin-panel">
                <div className="section-title">Ticket Inbox</div>
                <${TicketInboxList}
                  loading=${loading}
                  tickets=${tickets}
                  formatTimestamp=${formatTimestamp}
                  isAdmin=${isAdmin}
                  onSelectTicket=${(ticketId) => setSelectedTicketId(ticketId)}
                />

                <${SupportTicketThread}
                  selectedTicket=${selectedTicket}
                  isAdmin=${isAdmin}
                  nextStatus=${nextStatus}
                  setNextStatus=${setNextStatus}
                  updateTicketStatus=${updateTicketStatus}
                  formatTimestamp=${formatTimestamp}
                  chatDraft=${chatDraft}
                  setChatDraft=${setChatDraft}
                  sendMessage=${sendMessage}
                />
              </div>
            </section>`}
      <//>
    </section>
  `;
}

function getForumTemplateOptions(sectionId) {
  const key = String(sectionId || "").trim();
  if (key === "bug-reports") {
    return [
      {
        id: "bug-repro",
        label: "Bug reproduction report",
        content:
          "## Bug Report\n\n### Summary\nShort summary of the bug.\n\n### Environment\n- Web version:\n- Region:\n- Device/OS:\n\n### Steps to Reproduce\n1. Step one\n2. Step two\n3. Step three\n\n### Expected Result\n\n### Actual Result\n\n### Screenshots / Video Links\n- Image URL:\n- Video URL:\n",
      },
      {
        id: "bug-crash",
        label: "Crash report",
        content:
          "## Crash Report\n\n### What happened\nDescribe the crash.\n\n### Last action before crash\n\n### Error text\nPaste exact error text if available.\n\n### Frequency\n- [ ] Once\n- [ ] Sometimes\n- [ ] Every time\n\n### Screenshots / Video Links\n- Image URL:\n- Video URL:\n\n### Extra context\n",
      },
    ];
  }
  if (key === "help-feedback") {
    return [
      {
        id: "help-account",
        label: "Account help",
        content:
          "## Account Help\n\n### Issue\nWhat problem are you having?\n\n### Account details\n- Username:\n- Linked UUID:\n\n### What you tried\n- Step 1\n- Step 2\n\n### Expected outcome\n",
      },
      {
        id: "help-gameplay",
        label: "Gameplay question",
        content:
          "## Gameplay Question\n\n### Question\nWhat do you need help with?\n\n### Current progress\n\n### What you already tried\n\n### Extra details\n",
      },
      {
        id: "feedback",
        label: "General feedback",
        content:
          "## Feedback\n\n### Topic\nWhat area are you giving feedback on?\n\n### What feels good\n\n### What should improve\n\n### Suggested change\n",
      },
    ];
  }
  if (key === "suggestions") {
    return [
      {
        id: "suggestion-standard",
        label: "Suggestion",
        content:
          "## Suggestion\n\n### Idea\nDescribe your idea clearly.\n\n### Why this helps\n\n### Expected impact\n\n### Possible downsides\n",
      },
      {
        id: "suggestion-qol",
        label: "Quality of life",
        content:
          "## Quality of Life Suggestion\n\n### Current pain point\n\n### Proposed improvement\n\n### Who benefits\n\n### Implementation notes\n",
      },
    ];
  }
  if (key === "feature-requests") {
    return [
      {
        id: "feature-system",
        label: "System feature request",
        content:
          "## Feature Request\n\n### Feature summary\n\n### Problem it solves\n\n### Detailed behavior\n\n### Success criteria\n\n### Long-term value\n",
      },
      {
        id: "feature-economy",
        label: "Economy feature request",
        content:
          "## Economy Feature Request\n\n### Feature summary\n\n### Economy impact\n\n### Balance considerations\n\n### Abuse risks\n\n### Monitoring plan\n",
      },
    ];
  }
  if (key === "forum-help") {
    return [
      {
        id: "forum-moderation",
        label: "Moderation question",
        content:
          "## Moderation Question\n\n### Issue\n\n### Link to relevant post/comment\n\n### Expected moderation outcome\n\n### Extra context\n",
      },
      {
        id: "forum-tools",
        label: "Forum tools help",
        content:
          "## Forum Tools Help\n\n### Tool/feature\n\n### What is not working\n\n### Steps you tried\n\n### Expected behavior\n",
      },
    ];
  }
  return [];
}

function ForumPage({ isAdmin = false }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, getToken, userId } = useAuth();
  const { openSignIn, openUserProfile } = useClerk();
  const { user } = useUser();
  const sections = [
    {
      id: "updates",
      title: "Updates",
      description: "Official announcements, patch notes, and release updates from the Hardtale team.",
      stat: "Official",
    },
    {
      id: "bug-reports",
      title: "Bug Reports",
      description: "Report reproducible bugs and track status from acknowledgement to fix.",
      stat: "QA",
    },
    {
      id: "help-feedback",
      title: "Help and Feedback",
      description: "Ask questions about gameplay, launcher, account, and share platform feedback.",
      stat: "Support",
    },
    {
      id: "suggestions",
      title: "Suggestions",
      description: "Share server ideas and vote on community concepts before roadmap review.",
      stat: "Community",
    },
    {
      id: "feature-requests",
      title: "Feature Requests",
      description: "Propose larger systems and mechanics with use-cases and expected impact.",
      stat: "Planning",
    },
    {
      id: "forum-help",
      title: "Forum Help",
      description: "Need help with forum tools, trust levels, moderation, or posting permissions.",
      stat: "Meta",
    },
  ];
  const sectionMap = Object.fromEntries(sections.map((section) => [section.id, section]));
  const selectedSectionId = String(new URLSearchParams(location.search).get("section") || "").trim();
  const selectedPostId = String(new URLSearchParams(location.search).get("post") || "").trim();
  const selectedSection = sectionMap[selectedSectionId] || null;
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postsStatus, setPostsStatus] = useState("");
  const [createStatus, setCreateStatus] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreatePreview, setShowCreatePreview] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostLoading, setSelectedPostLoading] = useState(false);
  const [forumMemberMentions, setForumMemberMentions] = useState([]);
  const [forumProfileOpen, setForumProfileOpen] = useState(false);
  const [forumProfileUser, setForumProfileUser] = useState(null);
  const [forumHoverProfile, setForumHoverProfile] = useState(null);
  const [forumProfileInfoTab, setForumProfileInfoTab] = useState("badges");
  const [forumProfileTitleStatus, setForumProfileTitleStatus] = useState("");
  const [forumProfileTitleSaving, setForumProfileTitleSaving] = useState(false);
  const [forumProfileStaffBadgeSaving, setForumProfileStaffBadgeSaving] = useState(false);
  const [forumProfileStaffBadgeIconSaving, setForumProfileStaffBadgeIconSaving] = useState(false);
  const [forumProfileStaffGradientSaving, setForumProfileStaffGradientSaving] = useState(false);
  const [forumProfileRankEffectsSaving, setForumProfileRankEffectsSaving] = useState(false);
  const [forumProfileRankFontSaving, setForumProfileRankFontSaving] = useState(false);
  const [forumProfileDonorGradientSaving, setForumProfileDonorGradientSaving] = useState(false);
  const [forumProfileOwnedBadgesSaving, setForumProfileOwnedBadgesSaving] = useState(false);
  const [forumProfileAvatarVfxSaving, setForumProfileAvatarVfxSaving] = useState(false);
  const [forumProfileCardLoading, setForumProfileCardLoading] = useState(false);
  const [editingPostId, setEditingPostId] = useState("");
  const [editingPostTitle, setEditingPostTitle] = useState("");
  const [editingPostBody, setEditingPostBody] = useState("");
  const [editingPostStatus, setEditingPostStatus] = useState("");
  const [deletingPostId, setDeletingPostId] = useState("");
  const [forumHistoryOpen, setForumHistoryOpen] = useState(false);
  const [forumHistoryItems, setForumHistoryItems] = useState([]);
  const [forumHistoryTitle, setForumHistoryTitle] = useState("Post Edit History");
  const forumHoverOpenTimerRef = useRef(0);
  const forumHoverCloseTimerRef = useRef(0);
  const forumMentionProfileMetaCacheRef = useRef(new Map());
  const FORUM_BODY_MIN_LENGTH = 30;
  const createTemplateOptions = useMemo(
    () => getForumTemplateOptions(selectedSectionId),
    [selectedSectionId],
  );
  const mentionSuggestions = useMemo(() => {
    const directory = new Map();
    const register = (entry) => {
      const username = String(entry?.authorUsername || entry?.username || "").trim().replace(/^@+/, "");
      if (!username) return;
      const key = username.toLowerCase();
      if (directory.has(key)) return;
      directory.set(key, {
        username,
        image: String(entry?.authorImage || entry?.image || "/assets/HardTale_H_GreyScale.png"),
        userId: String(entry?.authorUserId || entry?.createdBy || entry?.userId || "").trim(),
      });
    };
    posts.forEach(register);
    if (selectedPost) register(selectedPost);
    forumMemberMentions.forEach(register);
    return Array.from(directory.values());
  }, [forumMemberMentions, posts, selectedPost]);
  const mentionProfileDirectory = useMemo(() => {
    const directory = new Map();
    const register = (entry) => {
      const username = String(entry?.authorUsername || entry?.username || "").trim().replace(/^@+/, "");
      const userId = String(entry?.authorUserId || entry?.createdBy || entry?.userId || "").trim();
      if (!username || !userId) return;
      const key = username.toLowerCase();
      if (directory.has(key)) return;
      directory.set(key, {
        authorUsername: username,
        authorUserId: userId,
        authorName: String(entry?.authorName || entry?.name || username),
        authorImage: String(entry?.authorImage || entry?.image || "/assets/HardTale_H_GreyScale.png"),
        authorRank: String(entry?.authorRank || "Unregistered"),
        authorOwnedRank: String(entry?.authorOwnedRank || entry?.authorRank || "Unregistered"),
        authorStaffRole: String(entry?.authorStaffRole || ""),
        authorIsStaff: Boolean(entry?.authorIsStaff),
      });
    };
    posts.forEach(register);
    if (selectedPost) register(selectedPost);
    forumMemberMentions.forEach(register);
    return directory;
  }, [forumMemberMentions, posts, selectedPost]);

  function getForumPreviewText(body, limit = 220) {
    return markdownExcerpt(body, limit);
  }

  function rankSlug(value) {
    return String(value || "Unregistered")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
  }

  function forumRankClassName(entry) {
    const slug = rankSlug(entry?.authorRank || "Unregistered");
    const showStaffBadge = entry?.authorShowStaffBadge !== false;
    const staffIdentity =
      Boolean(entry?.authorIsStaff) ||
      isStaffLabel(entry?.authorName || "") ||
      isStaffLabel(entry?.authorUsername || "") ||
      isStaffLabel(entry?.authorRank || "");
    const selectedIsStaff = isStaffLabel(entry?.authorRank || "");
    const isStaffRank = showStaffBadge && staffIdentity && selectedIsStaff;
    const roleClass = resolveStaffRoleClass(entry);
    const staffClass = isStaffRank
      ? entry?.authorShowStaffGradient === false
        ? `staff staff-static ${roleClass}`.trim()
        : `staff ${roleClass}`.trim()
      : "";
    return `comment-rank forum-author-rank ${staffClass} rank-${slug}`.trim();
  }

  function forumShowStaffPill(entry) {
    if (!entry) return false;
    return entry?.authorShowStaffBadge !== false && Boolean(resolveStaffPillTitle(entry));
  }

  function renderForumStaffPill(entry) {
    if (!forumShowStaffPill(entry)) return html``;
    const useGradientPillText = entry?.authorShowStaffBadgeIcon !== false;
    const roleClass = resolveStaffRoleClass(entry);
    const staffPillClass = `forum-staff-pill ${roleClass} ${useGradientPillText ? "gradient-text" : "text-only"} ${
      entry?.authorShowStaffGradient === false ? "staff-static" : ""
    }`.trim();
    const staffPillText = resolveStaffPillTitle(entry) || "Staff";
    return html`<span className=${staffPillClass}>
      <span className=${useGradientPillText ? "staff-pill-label" : "staff-pill-text"}>${staffPillText}</span>
    </span>`;
  }

  function getForumPostAuthorUserId(post) {
    return String(post?.authorUserId || post?.createdBy || "");
  }

  function canManageForumPost(post) {
    if (!isSignedIn) return false;
    const authorUserId = getForumPostAuthorUserId(post);
    return Boolean((userId && authorUserId && String(userId) === authorUserId) || isAdmin);
  }

  function openForumProfileEntry(entry) {
    if (!entry) return;
    setForumHoverProfile(null);
    openForumProfileCard(entry);
  }

  function normalizeForumProfileEntry(entry) {
    if (!entry) return null;
    return {
      authorName: String(entry?.authorName || entry?.name || "User"),
      authorUsername: String(entry?.authorUsername || entry?.username || "").replace(/^@+/, ""),
      authorImage: String(entry?.authorImage || entry?.image || "/assets/HardTale_H_GreyScale.png"),
      authorRank: String(entry?.authorRank || "Unregistered"),
      authorOwnedRank: String(entry?.authorOwnedRank || entry?.authorRank || "Unregistered"),
      authorStaffRole: String(entry?.authorStaffRole || ""),
      authorShowStaffBadge: entry?.authorShowStaffBadge !== false,
      authorShowStaffBadgeIcon: entry?.authorShowStaffBadgeIcon !== false,
      authorShowStaffGradient: entry?.authorShowStaffGradient !== false,
      authorShowRankEffects: entry?.authorShowRankEffects !== false,
      authorUseRankFont: entry?.authorUseRankFont === true,
      authorShowDonorGradient: entry?.authorShowDonorGradient !== false,
      showAllOwnedRankBadges: entry?.showAllOwnedRankBadges !== false,
      selectedOwnedBadge: String(entry?.selectedOwnedBadge || ""),
      authorIsStaff: Boolean(entry?.authorIsStaff || isStaffLabel(entry?.authorRank || "") || isStaffLabel(entry?.authorStaffRole || "")),
      authorUserId: String(entry?.authorUserId || entry?.createdBy || entry?.userId || "").trim(),
      linkedAccount: entry?.linkedAccount === true || entry?.linked === true,
    };
  }

  async function hydrateForumProfileEntry(entry) {
    const normalized = normalizeForumProfileEntry(entry);
    if (!normalized) return null;
    const userId = String(normalized.authorUserId || "").trim();
    if (!userId) return normalized;
    if (forumMentionProfileMetaCacheRef.current.has(userId)) {
      const cached = forumMentionProfileMetaCacheRef.current.get(userId);
      return normalizeForumProfileEntry({ ...normalized, ...(cached || {}) }) || normalized;
    }
    try {
      const response = await fetch(`/api/profile/public-card/${encodeURIComponent(userId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      const meta = {
        authorName: String(data?.name || normalized.authorName || "User"),
        authorUsername: String(data?.username || normalized.authorUsername || "").replace(/^@+/, ""),
        authorImage: String(data?.image || normalized.authorImage || "/assets/HardTale_H_GreyScale.png"),
        authorRank: String(data?.displayRank || normalized.authorRank || "Unregistered"),
        authorOwnedRank: String(data?.ownedRank || normalized.authorOwnedRank || normalized.authorRank || "Unregistered"),
        authorStaffRole: String(data?.staffRole || normalized.authorStaffRole || ""),
        authorIsStaff: Boolean(data?.isStaff || normalized.authorIsStaff),
        authorShowStaffBadge: data?.showStaffBadge !== false,
        authorShowStaffBadgeIcon: data?.showStaffBadgeIcon !== false,
        authorShowStaffGradient: data?.showStaffGradient !== false,
        authorShowRankEffects: data?.showRankEffects !== false,
        authorUseRankFont: data?.useRankFont === true,
        authorShowDonorGradient: data?.showDonorGradient !== false,
        showAllOwnedRankBadges: data?.showAllOwnedRankBadges !== false,
        selectedOwnedBadge: String(data?.selectedOwnedBadge || ""),
        linkedAccount: Boolean(data?.linked),
      };
      forumMentionProfileMetaCacheRef.current.set(userId, meta);
      return normalizeForumProfileEntry({ ...normalized, ...meta }) || normalized;
    } catch {
      forumMentionProfileMetaCacheRef.current.set(userId, {});
      return normalized;
    }
  }

  function clearForumHoverTimers() {
    if (forumHoverOpenTimerRef.current) {
      clearTimeout(forumHoverOpenTimerRef.current);
      forumHoverOpenTimerRef.current = 0;
    }
    if (forumHoverCloseTimerRef.current) {
      clearTimeout(forumHoverCloseTimerRef.current);
      forumHoverCloseTimerRef.current = 0;
    }
  }

  function openForumHoverProfile(entry, anchorEl, options = {}) {
    if (!entry || !anchorEl) return;
    const normalized = normalizeForumProfileEntry(entry);
    if (!normalized) return;
    const rect = anchorEl.getBoundingClientRect();
    const offsetX = Number.isFinite(Number(options?.offsetX)) ? Number(options.offsetX) : 0;
    const offsetY = Number.isFinite(Number(options?.offsetY)) ? Number(options.offsetY) : 8;
    const key = `${normalized.authorUserId || normalized.authorUsername || normalized.authorName}`.toLowerCase();
    const maxX = Math.max(10, (typeof window !== "undefined" ? window.innerWidth : 1200) - 340);
    const left = rect.left + offsetX;
    setForumHoverProfile({
      key,
      entry: normalized,
      x: Math.min(Math.max(10, left), maxX),
      y: rect.bottom + offsetY,
    });
  }

  function openForumMentionPreview(entry, triggerEl = null) {
    const normalized = normalizeForumProfileEntry(entry);
    if (!normalized) return;
    clearForumHoverTimers();
    if (triggerEl?.getBoundingClientRect) {
      const useTouchLayout = typeof window !== "undefined" && window.matchMedia("(hover: none)").matches;
      openForumHoverProfile(normalized, triggerEl, {
        offsetX: 28,
        offsetY: 50,
      });
      return;
    }
    const key = `${normalized.authorUserId || normalized.authorUsername || normalized.authorName}`.toLowerCase();
    const viewportWidth = typeof window !== "undefined" ? window.innerWidth : 1200;
    const x = Math.max(10, Math.min(Math.round((viewportWidth - 320) / 2), viewportWidth - 340));
    setForumHoverProfile({
      key,
      entry: normalized,
      x,
      y: 112,
    });
  }

  function scheduleForumHoverOpen(entry, anchorEl) {
    clearForumHoverTimers();
    forumHoverOpenTimerRef.current = setTimeout(() => {
      openForumHoverProfile(entry, anchorEl);
      forumHoverOpenTimerRef.current = 0;
    }, 1000);
  }

  function scheduleForumHoverClose() {
    if (forumHoverCloseTimerRef.current) clearTimeout(forumHoverCloseTimerRef.current);
    forumHoverCloseTimerRef.current = setTimeout(() => {
      setForumHoverProfile(null);
      forumHoverCloseTimerRef.current = 0;
    }, 1500);
  }

  function handleForumIdentityMouseEnter(entry, anchorEl) {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return;
    scheduleForumHoverOpen(entry, anchorEl);
  }

  function handleForumIdentityMouseLeave() {
    if (typeof window !== "undefined" && window.matchMedia("(hover: none)").matches) return;
    scheduleForumHoverClose();
  }

  function handleForumIdentityTap(entry, anchorEl) {
    if (!(typeof window !== "undefined" && window.matchMedia("(hover: none)").matches)) {
      openForumProfileEntry(entry);
      return;
    }
    const normalized = normalizeForumProfileEntry(entry);
    if (!normalized) return;
    const key = `${normalized.authorUserId || normalized.authorUsername || normalized.authorName}`.toLowerCase();
    if (forumHoverProfile?.key === key) {
      openForumProfileEntry(normalized);
      return;
    }
    clearForumHoverTimers();
    openForumHoverProfile(normalized, anchorEl);
  }

  function renderForumHoverProfileCard() {
    if (!forumHoverProfile?.entry) return html``;
    const preview = forumHoverProfile.entry;
    const username = String(preview.authorUsername || "").replace(/^@+/, "");
    const displayBadge = resolvePrimaryOwnedBadge(
      normalizeOwnedRankLabel(preview.authorOwnedRank || preview.authorRank || "Unregistered"),
      preview?.showAllOwnedRankBadges !== false,
      normalizeOwnedRankLabel(preview?.selectedOwnedBadge || preview.authorOwnedRank || preview.authorRank || "Unregistered"),
    );
    const showStaff = preview?.authorShowStaffBadge !== false &&
      Boolean(preview.authorIsStaff || isStaffLabel(preview.authorRank || ""));
    return html`<div
      className="forum-profile-peek-shell"
      style=${{ left: `${forumHoverProfile.x}px`, top: `${forumHoverProfile.y}px` }}
      onMouseEnter=${() => clearForumHoverTimers()}
      onMouseLeave=${scheduleForumHoverClose}
    >
      <${MobileDrawerProfilePreview}
        className="drawer-profile-preview forum-profile-peek-card"
        onClick=${() => openForumProfileEntry(preview)}
        title=${username ? `${username}'s Profile` : `${preview.authorName}'s Profile`}
        avatar=${preview.authorImage}
        name=${preview.authorName || "User"}
        username=${username}
        linkedLabel=${preview.linkedAccount ? "Linked" : "Unlinked"}
        displayedBadge=${displayBadge !== "Unregistered" ? displayBadge : preview.authorRank || "Unregistered"}
        showStaffBadge=${showStaff}
        staffLabel=${toStaffPillTitle(preview.authorStaffRole || "") || "Staff"}
        staffRoleClass=${resolveStaffRoleClass({
          staffRole: preview.authorStaffRole || "",
          authorStaffRole: preview.authorStaffRole || "",
        })}
      />
    </div>`;
  }

  async function openForumMentionProfile(username, triggerEl = null, options = {}) {
    const allowFetch = options?.allowFetch !== false;
    const suppressToast = options?.suppressToast === true;
    const key = String(username || "").trim().replace(/^@+/, "").toLowerCase();
    if (!key) return;
    let entry = mentionProfileDirectory.get(key) || null;
    if (!entry && allowFetch) {
      try {
        const response = await fetch(`/api/forum/members?q=${encodeURIComponent(key)}&limit=25`);
        if (response.ok) {
          const data = await response.json().catch(() => ({}));
          const members = Array.isArray(data?.members) ? data.members : [];
          const exact = members.find(
            (item) =>
              String(item?.username || "")
                .trim()
                .replace(/^@+/, "")
                .toLowerCase() === key,
          );
          if (exact) {
            entry = normalizeForumProfileEntry({
              authorName: String(exact?.name || exact?.username || "User"),
              authorUsername: String(exact?.username || "").replace(/^@+/, ""),
              authorImage: String(exact?.image || "/assets/HardTale_H_GreyScale.png"),
              authorRank: String(exact?.rank || "Unregistered"),
              authorOwnedRank: String(exact?.ownedRank || exact?.rank || "Unregistered"),
              authorStaffRole: String(exact?.staffRole || ""),
              authorIsStaff: Boolean(exact?.isStaff),
              authorUserId: String(exact?.userId || "").trim(),
              linkedAccount: Boolean(exact?.linked),
            });
            if (entry) {
              setForumMemberMentions((prev) => {
                const rows = Array.isArray(prev) ? prev : [];
                const already = rows.some(
                  (row) => String(row?.userId || row?.authorUserId || "").trim() === String(exact?.userId || "").trim(),
                );
                if (already) return rows;
                return [
                  ...rows,
                  {
                    userId: String(exact?.userId || "").trim(),
                    username: String(exact?.username || "").replace(/^@+/, ""),
                    name: String(exact?.name || exact?.username || "User"),
                    image: String(exact?.image || "/assets/HardTale_H_GreyScale.png"),
                  },
                ];
              });
            }
          }
        }
      } catch {}
    }
    if (!entry) {
      if (suppressToast) return;
      emitAppToast({
        kind: "warning",
        title: "Mention not found",
        message: `No profile card found for @${String(username || "").replace(/^@+/, "")}.`,
      });
      return;
    }
    const hydratedEntry = await hydrateForumProfileEntry(entry);
    if (hydratedEntry?.authorUserId) {
      setForumMemberMentions((prev) => {
        const rows = Array.isArray(prev) ? prev : [];
        const id = String(hydratedEntry.authorUserId || "").trim();
        const nextEntry = {
          userId: id,
          username: String(hydratedEntry.authorUsername || "").replace(/^@+/, ""),
          name: String(hydratedEntry.authorName || "User"),
          image: String(hydratedEntry.authorImage || "/assets/HardTale_H_GreyScale.png"),
          authorRank: String(hydratedEntry.authorRank || "Unregistered"),
          authorOwnedRank: String(hydratedEntry.authorOwnedRank || hydratedEntry.authorRank || "Unregistered"),
          authorStaffRole: String(hydratedEntry.authorStaffRole || ""),
          authorIsStaff: Boolean(hydratedEntry.authorIsStaff),
          authorShowStaffBadge: hydratedEntry.authorShowStaffBadge !== false,
          authorShowStaffBadgeIcon: hydratedEntry.authorShowStaffBadgeIcon !== false,
          authorShowStaffGradient: hydratedEntry.authorShowStaffGradient !== false,
          authorShowRankEffects: hydratedEntry.authorShowRankEffects !== false,
          authorUseRankFont: hydratedEntry.authorUseRankFont === true,
          authorShowDonorGradient: hydratedEntry.authorShowDonorGradient !== false,
          showAllOwnedRankBadges: hydratedEntry.showAllOwnedRankBadges !== false,
          selectedOwnedBadge: String(hydratedEntry.selectedOwnedBadge || ""),
          linkedAccount: Boolean(hydratedEntry.linkedAccount),
        };
        const index = rows.findIndex((row) => String(row?.userId || row?.authorUserId || "").trim() === id);
        if (index < 0) return [...rows, nextEntry];
        const next = [...rows];
        next[index] = { ...next[index], ...nextEntry };
        return next;
      });
    }
    openForumMentionPreview(hydratedEntry || entry, triggerEl);
  }

  function handleForumMentionHover(username, triggerEl = null) {
    openForumMentionProfile(username, triggerEl, {
      allowFetch: false,
      suppressToast: true,
    });
  }

  function handleForumMentionLeave() {
    scheduleForumHoverClose();
  }

  async function copyForumProfileMetaValue(label, value) {
    const raw = String(value || "").trim();
    if (!raw || raw.toLowerCase() === "n/a") return;
    try {
      await navigator.clipboard.writeText(raw);
      emitAppToast({
        kind: "success",
        title: "Copied",
        message: `${label} copied to clipboard.`,
      });
    } catch {
      emitAppToast({
        kind: "warning",
        title: "Copy failed",
        message: `Couldn't copy ${label}.`,
      });
    }
  }

  async function openForumPostHistory(post) {
    const postId = String(post?.id || "");
    if (!postId) return;
    try {
      const response = await fetch(`/api/forum/posts/${encodeURIComponent(postId)}/history`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setForumHistoryItems(Array.isArray(data?.history) ? data.history : []);
      setForumHistoryTitle(`Past Edits - ${String(post?.title || "Forum Post")}`);
      setForumHistoryOpen(true);
    } catch {
      setForumHistoryItems([]);
      setForumHistoryTitle(`Past Edits - ${String(post?.title || "Forum Post")}`);
      setForumHistoryOpen(true);
    }
  }

  function renderForumHistoryDetails(label, value) {
    const text = String(value || "").trim();
    return html`<details className="forum-history-detail">
      <summary>${label}</summary>
      <div className="forum-history-detail-body">${text || "No content."}</div>
    </details>`;
  }

  function renderForumHistoryContent() {
    if (!Array.isArray(forumHistoryItems) || forumHistoryItems.length === 0) {
      return html`<p className="muted">No revisions yet.</p>`;
    }
    const firstEditedAt = String(forumHistoryItems[0]?.createdAt || "");
    const forcedEdits = forumHistoryItems.filter((entry) => entry?.forcedEdit);
    const latestForcedEdit =
      forcedEdits.length > 0 ? forcedEdits[forcedEdits.length - 1] : null;
    return html`<div className="comment-history">
      ${firstEditedAt
        ? html`<div className="forum-history-originally-edited">
            <span className="muted">Originally edited</span>
            <${TimestampText} value=${firstEditedAt} formatTimestamp=${formatTimestamp} />
          </div>`
        : html``}
      ${latestForcedEdit
        ? html`<div className="forum-history-forced-banner">
            <img src=${STAFF_BADGE_ICON_SVG} alt="" aria-hidden="true" className="forum-history-forced-icon" />
            <span>
              Staff moderation update: ${latestForcedEdit.editorName || "Staff"} updated this post and opened a private support ticket for discussion.
            </span>
          </div>`
        : html``}
      ${forumHistoryItems.map(
        (entry, index) => html`<div key=${entry.id || `${entry.createdAt || ""}-${index}`} className="comment-history-item">
          <div className="comment-history-meta">
            <button
              type="button"
              className="forum-post-author-trigger"
              onMouseEnter=${(event) =>
                handleForumIdentityMouseEnter(
                  {
                    authorName: entry.editorName || "Editor",
                    authorUsername: entry.editorUsername || "",
                    authorImage: entry.editorImage || "/assets/HardTale_H_GreyScale.png",
                    authorRank: entry.editorRank || "Unregistered",
                    authorOwnedRank: entry.editorOwnedRank || entry.editorRank || "Unregistered",
                    authorStaffRole: entry.editorStaffRole || "",
                    authorIsStaff: Boolean(entry.editorIsStaff),
                    authorUserId: entry.editorUserId || "",
                  },
                  event.currentTarget,
                )}
              onMouseLeave=${handleForumIdentityMouseLeave}
              onClick=${(event) =>
                handleForumIdentityTap(
                  {
                    authorName: entry.editorName || "Editor",
                    authorUsername: entry.editorUsername || "",
                    authorImage: entry.editorImage || "/assets/HardTale_H_GreyScale.png",
                    authorRank: entry.editorRank || "Unregistered",
                    authorOwnedRank: entry.editorOwnedRank || entry.editorRank || "Unregistered",
                    authorStaffRole: entry.editorStaffRole || "",
                    authorIsStaff: Boolean(entry.editorIsStaff),
                    authorUserId: entry.editorUserId || "",
                  },
                  event.currentTarget,
                )}
              title="Open profile"
              aria-label="Open profile"
            >
              <img
                className="comment-avatar small"
                src=${entry.editorImage || "/assets/HardTale_H_GreyScale.png"}
                alt=${entry.editorName || "Editor"}
              />
            </button>
            <div className="forum-history-meta-main">
              <button
                type="button"
                className="forum-post-author-name-btn"
                onMouseEnter=${(event) =>
                  handleForumIdentityMouseEnter(
                    {
                      authorName: entry.editorName || "Editor",
                      authorUsername: entry.editorUsername || "",
                      authorImage: entry.editorImage || "/assets/HardTale_H_GreyScale.png",
                      authorRank: entry.editorRank || "Unregistered",
                      authorOwnedRank: entry.editorOwnedRank || entry.editorRank || "Unregistered",
                      authorStaffRole: entry.editorStaffRole || "",
                      authorIsStaff: Boolean(entry.editorIsStaff),
                      authorUserId: entry.editorUserId || "",
                    },
                    event.currentTarget,
                  )}
                onMouseLeave=${handleForumIdentityMouseLeave}
                onClick=${(event) =>
                  handleForumIdentityTap(
                    {
                      authorName: entry.editorName || "Editor",
                      authorUsername: entry.editorUsername || "",
                      authorImage: entry.editorImage || "/assets/HardTale_H_GreyScale.png",
                      authorRank: entry.editorRank || "Unregistered",
                      authorOwnedRank: entry.editorOwnedRank || entry.editorRank || "Unregistered",
                      authorStaffRole: entry.editorStaffRole || "",
                      authorIsStaff: Boolean(entry.editorIsStaff),
                      authorUserId: entry.editorUserId || "",
                    },
                    event.currentTarget,
                  )}
                title="Open profile"
              >
                <span className="comment-author">
                  ${entry.editorName || "Editor"}${entry?.editorUsername ? ` @${entry.editorUsername}` : ""}
                </span>
              </button>
              ${entry?.forcedEdit
                ? html`<div className="forum-history-forced-row">
                    <img src=${STAFF_BADGE_ICON_SVG} alt="" aria-hidden="true" className="forum-history-forced-icon" />
                    <span className="forum-post-edited-note forced">
                      Updated by ${entry.editorName || "Staff"}${entry?.editorUsername ? ` (@${entry.editorUsername})` : ""}.
                    </span>
                  </div>`
                : html``}
              <div className="forum-history-time">
                <span className="muted"> Edited</span>
                <${TimestampText} value=${entry.createdAt} formatTimestamp=${formatTimestamp} />
              </div>
            </div>
          </div>
          <div className="comment-history-body forum-history-body">
            ${renderForumHistoryDetails("Before title", entry.oldTitle)}
            ${renderForumHistoryDetails("After title", entry.newTitle)}
            ${renderForumHistoryDetails("Before body", entry.oldBody)}
            ${renderForumHistoryDetails("After body", entry.newBody)}
          </div>
        </div>`,
      )}
    </div>`;
  }

  async function loadOwnForumProfileTitleSettings() {
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/title");
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const availableRaw = Array.isArray(data.availableTitles) ? data.availableTitles : [];
      const availableTitles = PROFILE_DISPLAY_TITLES.filter((title) => availableRaw.includes(title));
      const selectedTitle = String(data.selectedTitle || "");
      const ownedRank = String(data.ownedRank || "Unregistered");
      const fallbackTitles = ownedRank === "Unregistered" ? ["Unregistered"] : ["Registered"];
      return {
        ownedRank,
        availableTitles: availableTitles.length > 0 ? availableTitles : fallbackTitles,
        selectedTitle: selectedTitle || ownedRank || "Unregistered",
        staffRole: String(data?.staffRole || ""),
        staffRoleBase: String(data?.staffRoleBase || ""),
        canPreviewStaffRole: Boolean(data?.canPreviewStaffRole),
        staffRolePreview: String(data?.staffRolePreview || ""),
        staffRolePreviewOptions: Array.isArray(data?.staffRolePreviewOptions)
          ? data.staffRolePreviewOptions
          : [],
        canToggleOwnedBadges: Boolean(data?.canToggleOwnedBadges),
        showAllOwnedRankBadges: data?.showAllOwnedRankBadges !== false,
        selectedOwnedBadge: String(data?.selectedOwnedBadge || ""),
        ownedBadgeOptions: Array.isArray(data?.ownedBadgeOptions)
          ? data.ownedBadgeOptions.filter((rank) => OWNED_RANK_ORDER.includes(String(rank)))
          : [],
        canToggleStaffBadge: Boolean(data?.canToggleStaffBadge),
        showStaffBadge: data?.showStaffBadge !== false,
        showStaffBadgeIcon: data?.showStaffBadgeIcon !== false,
        canToggleStaffGradient: Boolean(data?.canToggleStaffGradient),
        showStaffGradient: data?.showStaffGradient !== false,
        canToggleRankEffects: Boolean(data?.canToggleRankEffects),
        showRankEffects: data?.showRankEffects !== false,
        canToggleRankFont: Boolean(data?.canToggleRankFont),
        useRankFont: data?.useRankFont === true,
        canToggleDonorGradient: Boolean(data?.canToggleDonorGradient),
        showDonorGradient: data?.showDonorGradient !== false,
        canToggleAvatarVfx: Boolean(data?.canToggleAvatarVfx),
        showAvatarVfx: data?.showAvatarVfx !== false,
      };
    } catch {
      return null;
    }
  }

  async function loadForumProfileLinkStatus(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) {
      return { linked: false, playerName: "N/A", playerUuid: "N/A" };
    }
    try {
      const response = await fetch(`/api/profile/link-status/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return {
        linked: Boolean(data?.linked),
        playerName: String(data?.playerName || "").trim() || "N/A",
        playerUuid: String(data?.playerUuid || "").trim() || "N/A",
      };
    } catch {
      return { linked: false, playerName: "N/A", playerUuid: "N/A" };
    }
  }

  async function loadForumProfileAchievements(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return [];
    try {
      const response = await fetch(`/api/profile/achievements/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return Array.isArray(data?.achievements) ? data.achievements : [];
    } catch {
      return [];
    }
  }

  async function loadForumProfileGroups(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return [];
    try {
      const response = await fetch(`/api/profile/groups/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return Array.isArray(data?.groups) ? data.groups : [];
    } catch {
      return [];
    }
  }

  async function loadForumProfileActivity(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return null;
    try {
      const response = await fetch(`/api/profile/forum-activity/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return data?.activity && typeof data.activity === "object" ? data.activity : null;
    } catch {
      return null;
    }
  }

  async function openForumProfileCard(entry) {
    if (!entry) return;
    setForumProfileCardLoading(true);
    try {
    const rankLabel = String(entry.authorRank || "Unregistered");
    const authorName = String(entry.authorName || "User");
    const authorUsername = String(entry.authorUsername || "");
    const authorUserId = String(entry.authorUserId || entry.createdBy || "");
    const isOwn = Boolean(userId && authorUserId && String(userId) === authorUserId);
    let isStaffUser =
      Boolean(entry?.authorIsStaff) ||
      isStaffLabel(entry?.authorStaffRole || "") ||
      isStaffLabel(authorName) ||
      isStaffLabel(authorUsername) ||
      isStaffLabel(rankLabel);
    let availableTitles = [];
    let staffRole = String(entry?.authorStaffRole || "");
    let staffRoleBase = "";
    let canPreviewStaffRole = false;
    let staffRolePreview = "";
    let staffRolePreviewOptions = [];
    let selectedTitle = rankLabel;
    let ownedRank = normalizeOwnedRankLabel(entry?.authorOwnedRank || rankLabel);
    let canToggleOwnedBadges = false;
    let showAllOwnedRankBadges = entry?.showAllOwnedRankBadges !== false;
    let selectedOwnedBadge = normalizeOwnedRankLabel(entry?.selectedOwnedBadge || "");
    let ownedBadgeOptions = buildOwnedRankBadges(ownedRank, false, { showAllOwnedRankBadges: true });
    let canToggleStaffBadge = false;
    let showStaffBadge = entry?.authorShowStaffBadge !== false;
    let showStaffBadgeIcon = entry?.authorShowStaffBadgeIcon !== false;
    let canToggleStaffGradient = false;
    let showStaffGradient = entry?.authorShowStaffGradient !== false;
    let canToggleRankEffects = false;
    let showRankEffects = true;
    let canToggleRankFont = false;
    let useRankFont = entry?.authorUseRankFont === true;
    let canToggleDonorGradient = false;
    let showDonorGradient = entry?.authorShowDonorGradient !== false;
    let canToggleAvatarVfx = false;
    let showAvatarVfx = true;
    if (isOwn && isSignedIn) {
      const settings = await loadOwnForumProfileTitleSettings();
      if (settings) {
        staffRole = String(settings.staffRole || staffRole);
        staffRoleBase = String(settings.staffRoleBase || "");
        canPreviewStaffRole = Boolean(settings.canPreviewStaffRole);
        staffRolePreview = String(settings.staffRolePreview || "");
        staffRolePreviewOptions = Array.isArray(settings.staffRolePreviewOptions)
          ? settings.staffRolePreviewOptions
          : [];
        ownedRank = normalizeOwnedRankLabel(settings.ownedRank);
        availableTitles = settings.availableTitles;
        selectedTitle = settings.selectedTitle || rankLabel;
        canToggleOwnedBadges = Boolean(settings.canToggleOwnedBadges);
        showAllOwnedRankBadges = settings.showAllOwnedRankBadges !== false;
        selectedOwnedBadge = normalizeOwnedRankLabel(settings.selectedOwnedBadge || "");
        ownedBadgeOptions = Array.isArray(settings.ownedBadgeOptions) ? settings.ownedBadgeOptions : ownedBadgeOptions;
        canToggleStaffBadge = Boolean(settings.canToggleStaffBadge);
        showStaffBadge = settings.showStaffBadge !== false;
        showStaffBadgeIcon = settings.showStaffBadgeIcon !== false;
        canToggleStaffGradient = Boolean(settings.canToggleStaffGradient);
        showStaffGradient = settings.showStaffGradient !== false;
        canToggleRankEffects = Boolean(settings.canToggleRankEffects);
        showRankEffects = settings.showRankEffects !== false;
        canToggleRankFont = Boolean(settings.canToggleRankFont);
        useRankFont = settings.useRankFont === true;
        canToggleDonorGradient = Boolean(settings.canToggleDonorGradient);
        showDonorGradient = settings.showDonorGradient !== false;
        canToggleAvatarVfx = Boolean(settings.canToggleAvatarVfx);
        showAvatarVfx = settings.showAvatarVfx !== false;
      }
    }
    if (!isDonorOwnedRank(ownedRank)) {
      showDonorGradient = false;
    }
    if (!isStaffLabel(selectedTitle)) {
      showStaffGradient = false;
    }
    isStaffUser = isStaffUser || canToggleStaffGradient || canToggleStaffBadge;
    if (isOwn && availableTitles.length === 0 && selectedTitle) {
      availableTitles = [selectedTitle];
    }
    const [linkStatus, achievements, groups, forumActivity] = await Promise.all([
      loadForumProfileLinkStatus(authorUserId),
      loadForumProfileAchievements(authorUserId),
      loadForumProfileGroups(authorUserId),
      loadForumProfileActivity(authorUserId),
    ]);
    setForumProfileTitleStatus("");
    setForumProfileInfoTab("badges");
    setForumProfileUser({
      name: authorName,
      username: formatUsernameForDisplay(authorUsername),
      image: String(entry.authorImage || "/assets/HardTale_H_GreyScale.png"),
      rankLabel: selectedTitle,
      ownedRank,
      canToggleOwnedBadges,
      showAllOwnedRankBadges,
      selectedOwnedBadge,
      ownedBadgeOptions,
      staff: isStaffUser && showStaffBadge && isStaffLabel(selectedTitle),
      staffRole,
      staffRoleBase,
      canPreviewStaffRole,
      staffRolePreview,
      staffRolePreviewOptions,
      isStaffUser,
      isOwn,
      availableTitles,
      canToggleStaffBadge,
      showStaffBadge,
      showStaffBadgeIcon,
      canToggleStaffGradient,
      showStaffGradient,
      canToggleRankEffects,
      showRankEffects,
      canToggleRankFont,
      useRankFont,
      canToggleDonorGradient,
      showDonorGradient,
      canToggleAvatarVfx,
      showAvatarVfx,
      authorUserId,
      hytalePlayerName: linkStatus.playerName,
      hytalePlayerUuid: linkStatus.playerUuid,
      linkedAccount: linkStatus.linked,
      achievements,
      groups,
      forumActivity,
    });
    setForumProfileOpen(true);
    } finally {
      setForumProfileCardLoading(false);
    }
  }

  async function updateOwnForumDisplayTitle(nextTitle) {
    if (!forumProfileUser?.isOwn || !nextTitle || forumProfileTitleSaving) return;
    const current = String(forumProfileUser.rankLabel || "");
    if (nextTitle === current) return;
    setForumProfileTitleSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: nextTitle }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save title.");
      }
      const data = await response.json();
      const selectedTitle = String(data?.selectedTitle || nextTitle);
      const shouldDisableStaffGradient = !isStaffLabel(selectedTitle);
      if (shouldDisableStaffGradient) {
        await apiFetchWithToken(getToken, true, "/api/profile/staff-gradient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ showStaffGradient: false }),
        }).catch(() => {});
      }
      const availableRaw = Array.isArray(data?.availableTitles) ? data.availableTitles : [];
      const availableTitles = PROFILE_DISPLAY_TITLES.filter((title) => availableRaw.includes(title));
      setForumProfileUser((prev) =>
        prev
          ? {
              ...prev,
              rankLabel: selectedTitle,
              availableTitles: availableTitles.length > 0 ? availableTitles : prev.availableTitles,
              showStaffGradient: shouldDisableStaffGradient ? false : prev.showStaffGradient,
            }
          : prev,
      );
      setPosts((prev) =>
        prev.map((post) => {
          const postAuthorUserId = String(post?.authorUserId || post?.createdBy || "");
          return postAuthorUserId === String(userId || "")
            ? {
                ...post,
                authorRank: selectedTitle,
                authorShowStaffGradient: shouldDisableStaffGradient
                  ? false
                  : post.authorShowStaffGradient,
              }
            : post;
        }),
      );
      setSelectedPost((prev) => {
        if (!prev) return prev;
        const postAuthorUserId = String(prev?.authorUserId || prev?.createdBy || "");
        return postAuthorUserId === String(userId || "")
          ? {
              ...prev,
              authorRank: selectedTitle,
              authorShowStaffGradient: shouldDisableStaffGradient
                ? false
                : prev.authorShowStaffGradient,
            }
          : prev;
      });
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save title.");
    } finally {
      setForumProfileTitleSaving(false);
    }
  }

  async function updateOwnForumStaffRolePreview(nextRole) {
    if (!forumProfileUser?.isOwn || !forumProfileUser?.canPreviewStaffRole || !nextRole) return;
    const current = String(forumProfileUser.staffRolePreview || forumProfileUser.staffRole || "");
    if (nextRole === current) return;
    setForumProfileTitleSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-role-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffRolePreview: nextRole }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save group badge preview.");
      }
      const data = await response.json();
      const staffRole = String(data?.staffRole || nextRole);
      const options = Array.isArray(data?.staffRolePreviewOptions) ? data.staffRolePreviewOptions : [];
      setForumProfileUser((prev) =>
        prev
          ? {
              ...prev,
              staffRole,
              staffRolePreview: String(data?.staffRolePreview || staffRole),
              staffRolePreviewOptions: options.length > 0 ? options : prev.staffRolePreviewOptions,
            }
          : prev,
      );
      setPosts((prev) =>
        prev.map((post) => {
          const postAuthorUserId = String(post?.authorUserId || post?.createdBy || "");
          return postAuthorUserId === String(userId || "")
            ? { ...post, authorStaffRole: staffRole }
            : post;
        }),
      );
      setSelectedPost((prev) => {
        if (!prev) return prev;
        const postAuthorUserId = String(prev?.authorUserId || prev?.createdBy || "");
        return postAuthorUserId === String(userId || "")
          ? { ...prev, authorStaffRole: staffRole }
          : prev;
      });
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save group badge preview.");
    } finally {
      setForumProfileTitleSaving(false);
    }
  }

  async function updateOwnForumStaffGradientVisibility(nextVisible) {
    if (!forumProfileUser?.isOwn || !forumProfileUser?.canToggleStaffGradient || forumProfileStaffGradientSaving) return;
    setForumProfileStaffGradientSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-gradient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showStaffGradient: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save staff gradient.");
      }
      const data = await response.json();
      const showStaffGradient = data?.showStaffGradient !== false;
      setForumProfileUser((prev) =>
        prev
          ? {
              ...prev,
              showStaffGradient,
              staff:
                prev.isStaffUser &&
                prev.showStaffBadge !== false &&
                isStaffLabel(prev.rankLabel || ""),
            }
          : prev,
      );
      setPosts((prev) =>
        prev.map((post) => {
          const postAuthorUserId = String(post?.authorUserId || post?.createdBy || "");
          return postAuthorUserId === String(userId || "")
            ? { ...post, authorShowStaffGradient: showStaffGradient }
            : post;
        }),
      );
      setSelectedPost((prev) => {
        if (!prev) return prev;
        const postAuthorUserId = String(prev?.authorUserId || prev?.createdBy || "");
        return postAuthorUserId === String(userId || "")
          ? { ...prev, authorShowStaffGradient: showStaffGradient }
          : prev;
      });
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save staff gradient.");
    } finally {
      setForumProfileStaffGradientSaving(false);
    }
  }

  async function updateOwnForumStaffBadgeVisibility(nextVisible) {
    if (!forumProfileUser?.isOwn || !forumProfileUser?.canToggleStaffBadge || forumProfileStaffBadgeSaving) return false;
    setForumProfileStaffBadgeSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showStaffBadge: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save staff badge.");
      }
      const data = await response.json();
      const showStaffBadge = data?.showStaffBadge !== false;
      setForumProfileUser((prev) =>
        prev
          ? {
              ...prev,
              showStaffBadge,
              staff: prev.isStaffUser && showStaffBadge && isStaffLabel(prev.rankLabel || ""),
            }
          : prev,
      );
      setPosts((prev) =>
        prev.map((post) => {
          const postAuthorUserId = String(post?.authorUserId || post?.createdBy || "");
          return postAuthorUserId === String(userId || "")
            ? { ...post, authorShowStaffBadge: showStaffBadge }
            : post;
        }),
      );
      setSelectedPost((prev) => {
        if (!prev) return prev;
        const postAuthorUserId = String(prev?.authorUserId || prev?.createdBy || "");
        return postAuthorUserId === String(userId || "")
          ? { ...prev, authorShowStaffBadge: showStaffBadge }
          : prev;
      });
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
      return true;
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save staff badge.");
      return false;
    } finally {
      setForumProfileStaffBadgeSaving(false);
    }
  }

  async function updateOwnForumStaffBadgeIconVisibility(nextVisible) {
    if (!forumProfileUser?.isOwn || !forumProfileUser?.canToggleStaffBadge || forumProfileStaffBadgeIconSaving) return false;
    setForumProfileStaffBadgeIconSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-badge-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showStaffBadgeIcon: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save staff badge icon.");
      }
      const data = await response.json();
      const showStaffBadgeIcon = data?.showStaffBadgeIcon !== false;
      setForumProfileUser((prev) => (prev ? { ...prev, showStaffBadgeIcon } : prev));
      setPosts((prev) =>
        prev.map((post) => {
          const postAuthorUserId = String(post?.authorUserId || post?.createdBy || "");
          return postAuthorUserId === String(userId || "")
            ? { ...post, authorShowStaffBadgeIcon: showStaffBadgeIcon }
            : post;
        }),
      );
      setSelectedPost((prev) => {
        if (!prev) return prev;
        const postAuthorUserId = String(prev?.authorUserId || prev?.createdBy || "");
        return postAuthorUserId === String(userId || "")
          ? { ...prev, authorShowStaffBadgeIcon: showStaffBadgeIcon }
          : prev;
      });
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
      return true;
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save staff badge icon.");
      return false;
    } finally {
      setForumProfileStaffBadgeIconSaving(false);
    }
  }

  async function updateOwnForumStaffBadgeMode(nextMode) {
    const mode = String(nextMode || "").trim().toLowerCase();
    let success = false;
    if (mode === "hidden") {
      success = await updateOwnForumStaffBadgeVisibility(false);
    } else if (mode === "label") {
      const badgeSaved = await updateOwnForumStaffBadgeVisibility(true);
      const iconSaved = await updateOwnForumStaffBadgeIconVisibility(false);
      success = badgeSaved && iconSaved;
    } else {
      const badgeSaved = await updateOwnForumStaffBadgeVisibility(true);
      const iconSaved = await updateOwnForumStaffBadgeIconVisibility(true);
      success = badgeSaved && iconSaved;
    }
    emitAppToast({
      kind: success ? "success" : "error",
      title: success ? "Staff Badge Updated" : "Staff Badge Update Failed",
      message: success
        ? mode === "hidden"
          ? "Staff badge is now hidden."
          : mode === "label"
          ? "Staff badge now uses text style."
          : "Staff badge now uses icon style."
        : "Unable to update staff badge mode right now.",
    });
  }

  async function updateOwnForumOwnedBadgeDisplaySettings(nextShowAll, nextSelectedBadge = "") {
    if (!forumProfileUser?.isOwn || !forumProfileUser?.canToggleOwnedBadges || forumProfileOwnedBadgesSaving) return false;
    setForumProfileOwnedBadgesSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/owned-badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showAllOwnedRankBadges: Boolean(nextShowAll),
          selectedOwnedBadge: String(nextSelectedBadge || ""),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save owned badge display.");
      }
      const data = await response.json();
      const selectedOwnedBadge = String(data?.selectedOwnedBadge || "");
      const showAllOwnedRankBadges = data?.showAllOwnedRankBadges !== false;
      const options = Array.isArray(data?.ownedBadgeOptions)
        ? data.ownedBadgeOptions.filter((rank) => OWNED_RANK_ORDER.includes(String(rank)))
        : [];
      setForumProfileUser((prev) =>
        prev
          ? {
              ...prev,
              selectedOwnedBadge,
              showAllOwnedRankBadges,
              ownedBadgeOptions: options.length > 0 ? options : prev.ownedBadgeOptions,
            }
          : prev,
      );
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
      return true;
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save owned badge display.");
      return false;
    } finally {
      setForumProfileOwnedBadgesSaving(false);
    }
  }

  async function updateOwnForumDonorBadgeSelection(nextBadgeOrAll) {
    const next = String(nextBadgeOrAll || "").trim();
    const success =
      next === "__all__"
        ? await updateOwnForumOwnedBadgeDisplaySettings(true, "")
        : await updateOwnForumOwnedBadgeDisplaySettings(false, next);
    emitAppToast({
      kind: success ? "success" : "error",
      title: success ? "Donor Badge Updated" : "Donor Badge Update Failed",
      message: success
        ? next === "__all__"
          ? "Displaying all owned donor badges."
          : `Now displaying ${getRankDisplayLabel(next)} as your donor badge.`
        : "Unable to update donor badge display right now.",
    });
  }

  async function updateOwnForumRankEffectsVisibility(nextVisible) {
    if (!forumProfileUser?.isOwn || !forumProfileUser?.canToggleRankEffects || forumProfileRankEffectsSaving) return;
    setForumProfileRankEffectsSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/rank-effects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showRankEffects: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save rank effects.");
      }
      const data = await response.json();
      const showRankEffects = data?.showRankEffects !== false;
      setForumProfileUser((prev) => (prev ? { ...prev, showRankEffects } : prev));
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save rank effects.");
    } finally {
      setForumProfileRankEffectsSaving(false);
    }
  }

  async function updateOwnForumRankFontVisibility(nextVisible) {
    if (!forumProfileUser?.isOwn || !forumProfileUser?.canToggleRankFont || forumProfileRankFontSaving) return;
    setForumProfileRankFontSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/rank-font", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useRankFont: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save rank font setting.");
      }
      const data = await response.json();
      const useRankFont = data?.useRankFont === true;
      setForumProfileUser((prev) => (prev ? { ...prev, useRankFont } : prev));
      setPosts((prev) =>
        prev.map((post) => {
          const postAuthorUserId = String(post?.authorUserId || post?.createdBy || "");
          return userId && postAuthorUserId && String(userId) === postAuthorUserId
            ? { ...post, authorUseRankFont: useRankFont }
            : post;
        }),
      );
      setSelectedPost((prev) => {
        const postAuthorUserId = String(prev?.authorUserId || prev?.createdBy || "");
        return userId && prev && postAuthorUserId && String(userId) === postAuthorUserId
          ? { ...prev, authorUseRankFont: useRankFont }
          : prev;
      });
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save rank font setting.");
    } finally {
      setForumProfileRankFontSaving(false);
    }
  }

  async function updateOwnForumDonorGradientVisibility(nextVisible) {
    if (!forumProfileUser?.isOwn || !forumProfileUser?.canToggleDonorGradient || forumProfileDonorGradientSaving) return;
    setForumProfileDonorGradientSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/donor-gradient", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showDonorGradient: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save donor gradient setting.");
      }
      const data = await response.json();
      const showDonorGradient = data?.showDonorGradient !== false;
      setForumProfileUser((prev) => (prev ? { ...prev, showDonorGradient } : prev));
      setPosts((prev) =>
        prev.map((post) => {
          const postAuthorUserId = String(post?.authorUserId || post?.createdBy || "");
          return userId && postAuthorUserId && String(userId) === postAuthorUserId
            ? { ...post, authorShowDonorGradient: showDonorGradient }
            : post;
        }),
      );
      setSelectedPost((prev) => {
        const postAuthorUserId = String(prev?.authorUserId || prev?.createdBy || "");
        return userId && prev && postAuthorUserId && String(userId) === postAuthorUserId
          ? { ...prev, authorShowDonorGradient: showDonorGradient }
          : prev;
      });
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save donor gradient setting.");
    } finally {
      setForumProfileDonorGradientSaving(false);
    }
  }

  async function updateOwnForumAvatarVfxVisibility(nextVisible) {
    if (!forumProfileUser?.isOwn || !forumProfileUser?.canToggleAvatarVfx || forumProfileAvatarVfxSaving) return;
    setForumProfileAvatarVfxSaving(true);
    setForumProfileTitleStatus("Saving...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/avatar-vfx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showAvatarVfx: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save avatar effects.");
      }
      const data = await response.json();
      const showAvatarVfx = data?.showAvatarVfx !== false;
      setForumProfileUser((prev) => (prev ? { ...prev, showAvatarVfx } : prev));
      setForumProfileTitleStatus("Saved.");
      setTimeout(() => setForumProfileTitleStatus(""), 1200);
    } catch (error) {
      setForumProfileTitleStatus(error?.message || "Failed to save avatar effects.");
    } finally {
      setForumProfileAvatarVfxSaving(false);
    }
  }

  function renderForumProfileCard() {
    if (!forumProfileUser) return html``;
    return html`<div className="profile-card">
      <div className="profile-card-link-meta">
        <span className="muted">Hytale Username:</span>
        <${CopyAction}
          label=${forumProfileUser.hytalePlayerName || "N/A"}
          valueToCopy=${forumProfileUser.hytalePlayerName || ""}
          subtle=${true}
          className="profile-copy-action"
          title="Copy Hytale Username"
          onCopied=${() => copyForumProfileMetaValue("Hytale Username", forumProfileUser.hytalePlayerName || "")}
        />
      </div>
      <div className="profile-card-link-meta">
        <span className="muted">UUID:</span>
        <${CopyAction}
          label=${forumProfileUser.hytalePlayerUuid || "N/A"}
          valueToCopy=${forumProfileUser.hytalePlayerUuid || ""}
          subtle=${true}
          className="profile-copy-action"
          title="Copy UUID"
          onCopied=${() => copyForumProfileMetaValue("UUID", forumProfileUser.hytalePlayerUuid || "")}
        />
      </div>
      <img
        className=${`profile-card-avatar avatar-rank-${rankSlug(
          forumProfileUser.rankLabel || "Unregistered",
        )} ${forumProfileUser.showAvatarVfx === false ? "avatar-vfx-off" : ""}`.trim()}
        src=${forumProfileUser.image}
        alt=${forumProfileUser.name}
      />
      <div
        className=${`profile-card-name ${
          forumProfileUser.showRankEffects === false ? "rank-effects-off" : ""
        } ${
          forumProfileUser.useRankFont === true ? "rank-font-on" : "rank-font-off"
        } ${
          forumProfileUser.showDonorGradient === false ? "donor-gradient-off" : "donor-gradient-on"
        } rank-${rankSlug(forumProfileUser.rankLabel || "Unregistered")}`.trim()}
      >
        ${forumProfileUser.name}
      </div>
      ${renderStaffBadge(forumProfileUser)}
      ${forumProfileUser.username
        ? html`<div className="profile-card-username">@${forumProfileUser.username}</div>`
        : html``}
      ${(() => {
        const normalizedRank = normalizeOwnedRankLabel(forumProfileUser.rankLabel || "Unregistered");
        const useStaffAsPrimaryBadge = Boolean(forumProfileUser.staff) && (normalizedRank === "Unregistered" || normalizedRank === "Unlinked");
        const badgeLabel = useStaffAsPrimaryBadge
          ? toStaffPillTitle(forumProfileUser.staffRole) || "Staff"
          : getRankDisplayLabel(forumProfileUser.rankLabel || "Unregistered");
        const badgeIconType = useStaffAsPrimaryBadge ? "staff" : getRankIconType(forumProfileUser.rankLabel || "");
        const badgeSlug = useStaffAsPrimaryBadge ? "staff" : rankSlug(forumProfileUser.rankLabel || "Unregistered");
        return html`<div
          className=${`comment-rank ${forumProfileUser.staff ? `staff ${resolveStaffRoleClass(forumProfileUser)}`.trim() : ""} profile-card-rank ${
            forumProfileUser.staff && forumProfileUser.showStaffGradient === false
              ? "staff-static"
              : ""
          } ${
            forumProfileUser.showRankEffects === false ? "rank-effects-off" : ""
          } ${
            forumProfileUser.showDonorGradient === false ? "donor-gradient-off" : "donor-gradient-on"
          } rank-${badgeSlug}`.trim()}
        >
          ${badgeIconType ? html`<span className="rank-icon">${renderRankIcon(badgeIconType)}</span>` : html``}
          <span>${badgeLabel}</span>
        </div>`;
      })()}
      <${ProfileInfoTabs}
        activeTab=${forumProfileInfoTab}
        onTabChange=${setForumProfileInfoTab}
        renderBadges=${() =>
          html`${renderOwnedRankBadges(forumProfileUser, {
            onSelectDonorBadge: updateOwnForumDonorBadgeSelection,
            onSelectStaffBadgeMode: updateOwnForumStaffBadgeMode,
            donorSaving: forumProfileOwnedBadgesSaving,
            staffSaving: forumProfileStaffBadgeSaving || forumProfileStaffBadgeIconSaving,
          })}`}
        renderGroups=${() =>
          html`${renderProfileGroupsCard(forumProfileUser, {
            isSaving: forumProfileTitleSaving,
            onStaffRoleChange: updateOwnForumStaffRolePreview,
          })}`}
        renderAchievements=${() =>
          html`<${ProfileAchievementsPanel}
            achievements=${forumProfileUser?.achievements || []}
          />`}
        renderForumActivity=${() =>
          html`${renderProfileForumActivityCard(forumProfileUser, formatTimestamp)}`}
      />
      ${forumProfileUser.isOwn
        ? html`<label className="profile-card-title-picker">
            <span className="muted">Display title</span>
            <select
              value=${forumProfileUser.rankLabel}
              disabled=${forumProfileTitleSaving}
              onChange=${(event) => updateOwnForumDisplayTitle(event.target.value)}
            >
              ${(Array.isArray(forumProfileUser.availableTitles)
                ? forumProfileUser.availableTitles
                : ["Unregistered"]
              ).map((title) => html`<option value=${title}>${getRankDisplayLabel(title)}</option>`)}
            </select>
          </label>`
        : html``}
      ${forumProfileUser.isOwn && forumProfileUser.canToggleRankEffects
        ? html`<label className="profile-card-toggle">
            <input
              type="checkbox"
              checked=${forumProfileUser.showRankEffects !== false}
              disabled=${forumProfileRankEffectsSaving}
              onChange=${(event) => updateOwnForumRankEffectsVisibility(event.target.checked)}
            />
            <span>Enable rank effects</span>
          </label>`
        : html``}
      ${forumProfileUser.isOwn && forumProfileUser.canToggleRankFont
        ? html`<label className="profile-card-toggle">
            <input
              type="checkbox"
              checked=${forumProfileUser.useRankFont === true}
              disabled=${forumProfileRankFontSaving}
              onChange=${(event) => updateOwnForumRankFontVisibility(event.target.checked)}
            />
            <span>Enable rank font styling</span>
          </label>`
        : html``}
      ${forumProfileUser.isOwn && forumProfileUser.canToggleDonorGradient
        ? html`<label className="profile-card-toggle">
            <input
              type="checkbox"
              checked=${forumProfileUser.showDonorGradient !== false}
              disabled=${forumProfileDonorGradientSaving}
              onChange=${(event) => updateOwnForumDonorGradientVisibility(event.target.checked)}
            />
            <span>Enable donor text gradient</span>
          </label>`
        : html``}
      ${forumProfileUser.isOwn && forumProfileUser.canToggleAvatarVfx
        ? html`<label className="profile-card-toggle">
            <input
              type="checkbox"
              checked=${forumProfileUser.showAvatarVfx !== false}
              disabled=${forumProfileAvatarVfxSaving}
              onChange=${(event) => updateOwnForumAvatarVfxVisibility(event.target.checked)}
            />
            <span>Enable avatar effects</span>
          </label>`
        : html``}
      ${forumProfileUser.isOwn &&
      forumProfileUser.canToggleStaffGradient &&
      isStaffLabel(forumProfileUser.rankLabel || "")
        ? html`<label className="profile-card-toggle">
            <input
              type="checkbox"
              checked=${forumProfileUser.showStaffGradient !== false}
              disabled=${forumProfileStaffGradientSaving}
              onChange=${(event) => updateOwnForumStaffGradientVisibility(event.target.checked)}
            />
            <span>Enable staff gradient animation</span>
          </label>`
        : html``}
      ${forumProfileTitleStatus && forumProfileUser.isOwn
        ? html`<div className="muted profile-card-title-status">${forumProfileTitleStatus}</div>`
        : html``}
    </div>`;
  }

  async function loadSectionPosts(sectionId) {
    if (!sectionId || !sectionMap[sectionId]) {
      setPosts([]);
      return;
    }
    setPostsLoading(true);
    setPostsStatus("");
    try {
      const response = await fetch(`/api/forum/posts?section=${encodeURIComponent(sectionId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setPosts(Array.isArray(data.posts) ? data.posts : []);
    } catch {
      setPostsStatus("Failed to load posts.");
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }

  useEffect(() => {
    loadSectionPosts(selectedSectionId);
  }, [selectedSectionId]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const response = await fetch("/api/forum/members?limit=180");
        if (!response.ok) throw new Error("Failed");
        const data = await response.json().catch(() => ({}));
        if (!alive) return;
        setForumMemberMentions(Array.isArray(data?.members) ? data.members : []);
      } catch {
        if (!alive) return;
        setForumMemberMentions([]);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(
    () => () => {
      clearForumHoverTimers();
    },
    [],
  );

  useEffect(() => {
    if (!selectedSectionId || !selectedPostId) {
      setSelectedPost(null);
      setSelectedPostLoading(false);
      return;
    }
    const fromList = posts.find((entry) => String(entry?.id || "") === selectedPostId) || null;
    if (fromList) {
      setSelectedPost(fromList);
      setSelectedPostLoading(false);
      return;
    }
    let alive = true;
    setSelectedPostLoading(true);
    fetch(`/api/forum/posts/${encodeURIComponent(selectedPostId)}`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed");
        return response.json();
      })
      .then((data) => {
        if (!alive) return;
        const post = data?.post || null;
        if (post && post.section === selectedSectionId) {
          setSelectedPost(post);
        } else {
          setSelectedPost(null);
        }
      })
      .catch(() => {
        if (!alive) return;
        setSelectedPost(null);
      })
      .finally(() => {
        if (!alive) return;
        setSelectedPostLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [selectedSectionId, selectedPostId, posts]);

  async function submitPost(event) {
    event.preventDefault();
    if (!selectedSectionId || !isSignedIn) return;
    const trimmedTitle = newPostTitle.trim();
    const trimmedBody = newPostBody.trim();
    if (!trimmedTitle || !trimmedBody) {
      setCreateStatus("Title and body are required.");
      return;
    }
    if (trimmedBody.length < FORUM_BODY_MIN_LENGTH) {
      setCreateStatus(`Body must be at least ${FORUM_BODY_MIN_LENGTH} characters.`);
      return;
    }
    setCreateStatus("Posting...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: selectedSectionId,
          title: trimmedTitle,
          body: trimmedBody,
          bodyFormat: "markdown",
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const created = data?.post;
      if (created) {
        setPosts((prev) => [created, ...prev]);
      } else {
        await loadSectionPosts(selectedSectionId);
      }
      setNewPostTitle("");
      setNewPostBody("");
      setCreateStatus("");
      setShowCreateModal(false);
    } catch {
      setCreateStatus("Failed to post.");
    }
  }

  function startEditPost(post) {
    if (!post || !canManageForumPost(post)) return;
    setEditingPostId(String(post.id || ""));
    setEditingPostTitle(String(post.title || ""));
    setEditingPostBody(String(post.body || ""));
    setEditingPostStatus("");
  }

  function cancelEditPost() {
    setEditingPostId("");
    setEditingPostTitle("");
    setEditingPostBody("");
    setEditingPostStatus("");
  }

  async function saveEditedPost(post) {
    if (!post || !editingPostId) return;
    const postId = String(post.id || "");
    if (!postId || postId !== editingPostId) return;
    const trimmedTitle = editingPostTitle.trim();
    const trimmedBody = editingPostBody.trim();
    if (!trimmedTitle || !trimmedBody) {
      setEditingPostStatus("Title and body are required.");
      return;
    }
    if (trimmedBody.length < FORUM_BODY_MIN_LENGTH) {
      setEditingPostStatus(`Body must be at least ${FORUM_BODY_MIN_LENGTH} characters.`);
      return;
    }
    setEditingPostStatus("Saving...");
    try {
      const response = await apiFetchWithToken(
        getToken,
        true,
        `/api/forum/posts/${encodeURIComponent(postId)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: trimmedTitle,
            body: trimmedBody,
            bodyFormat: "markdown",
          }),
        },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to update post.");
      }
      const data = await response.json();
      const updated = data?.post || null;
      if (updated) {
        setPosts((prev) => prev.map((entry) => (String(entry?.id || "") === postId ? updated : entry)));
        setSelectedPost((prev) => (String(prev?.id || "") === postId ? updated : prev));
      } else {
        await loadSectionPosts(selectedSectionId);
      }
      const postAuthorUserId = getForumPostAuthorUserId(post);
      const isForcedEdit = Boolean(isAdmin && userId && postAuthorUserId && String(userId) !== String(postAuthorUserId));
      if (isForcedEdit) {
        emitAppToast({
          kind: "info",
          title: "Staff edit applied",
          message: "This post was updated by staff moderation.",
          icon: INFO_STATUS_ICON_SVG,
          duration: 4200,
        });
      }
      cancelEditPost();
    } catch (error) {
      setEditingPostStatus(error?.message || "Failed to update post.");
    }
  }

  async function deleteForumPost(post) {
    if (!post || !canManageForumPost(post) || deletingPostId) return;
    const postId = String(post.id || "");
    if (!postId) return;
    const confirmed = window.confirm("Delete this forum post?");
    if (!confirmed) return;
    setDeletingPostId(postId);
    try {
      const response = await apiFetchWithToken(
        getToken,
        true,
        `/api/forum/posts/${encodeURIComponent(postId)}`,
        { method: "DELETE" },
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to delete post.");
      }
      setPosts((prev) => prev.filter((entry) => String(entry?.id || "") !== postId));
      if (String(selectedPost?.id || "") === postId) {
        setSelectedPost(null);
        navigate(`/forum?section=${encodeURIComponent(selectedSectionId)}`);
      }
      if (editingPostId === postId) {
        cancelEditPost();
      }
      emitAppToast({
        kind: "success",
        title: "Post deleted",
        message: "Your forum post was deleted successfully.",
      });
    } catch (error) {
      const message = error?.message || "Failed to delete post.";
      setPostsStatus(message);
      emitAppToast({
        kind: "error",
        title: "Delete failed",
        message,
      });
    } finally {
      setDeletingPostId("");
    }
  }

  if (selectedSection) {
    if (selectedPostId) {
      return html`
        <section className="news-page fade-in forum-hub">
          <${PageHero}
            eyebrow=${selectedSection.title}
            title="Forum Post"
            copy=${selectedSection.description}
            calloutLabel="Navigation"
            calloutItems=${[
              { title: "Section", copy: selectedSection.title },
            ]}
            actionLabel="Back to Section"
            onAction=${() => navigate(`/forum?section=${selectedSectionId}`)}
          />

          <section className="card forum-post-feed">
            ${selectedPostLoading
              ? html`<p className="muted">Loading post...</p>`
              : !selectedPost
              ? html`<p className="muted">Post not found in this section.</p>`
              : html`<article className="news-card forum-post-card">
                  <div className="forum-post-author-row">
                    <button
                      className="forum-post-author-trigger"
                      type="button"
                      onMouseEnter=${(event) => handleForumIdentityMouseEnter(selectedPost, event.currentTarget)}
                      onMouseLeave=${handleForumIdentityMouseLeave}
                      onClick=${(event) => handleForumIdentityTap(selectedPost, event.currentTarget)}
                      title="Open profile card"
                      aria-label="Open profile card"
                    >
                      <img
                        className="forum-post-author-avatar"
                        src=${selectedPost.authorImage || "/assets/HardTale_H_GreyScale.png"}
                        alt=${selectedPost.authorName || "User"}
                      />
                    </button>
                    <span className="muted">By</span>
                    <button
                      className="forum-post-author-name-btn"
                      type="button"
                      onMouseEnter=${(event) => handleForumIdentityMouseEnter(selectedPost, event.currentTarget)}
                      onMouseLeave=${handleForumIdentityMouseLeave}
                      onClick=${(event) => handleForumIdentityTap(selectedPost, event.currentTarget)}
                    >
                      <${AuthorName}
                        value=${selectedPost.authorName || "User"}
                        isStaffLabel=${isStaffLabel}
                        className=${`author-name ${selectedPost?.authorUseRankFont === true ? "rank-font-on" : "rank-font-off"} rank-${rankSlug(selectedPost?.authorRank || "Unregistered")}`.trim()}
                      />
                    </button>
                    <span className=${forumRankClassName(selectedPost)}>
                      ${(() => {
                        const iconType = getRankIconType(selectedPost.authorRank || "");
                        return html`${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                          <span>${getRankDisplayLabel(selectedPost.authorRank || "Unregistered")}</span>`;
                      })()}
                    </span>
                    ${forumShowStaffPill(selectedPost)
                      ? renderForumStaffPill(selectedPost)
                      : html``}
                    <span className="forum-post-op">OP</span>
                    <${TimestampText} value=${selectedPost.createdAt} formatTimestamp=${formatTimestamp} />
                  </div>
                  <div className="forum-post-header-divider"></div>
                  <div className="news-header">
                    <div className="news-title-row">
                      <h3>${selectedPost.title}</h3>
                    </div>
                  </div>
                  ${editingPostId === String(selectedPost.id || "")
                    ? html`<form
                        className="forum-edit-form"
                        onSubmit=${(event) => {
                          event.preventDefault();
                          saveEditedPost(selectedPost);
                        }}
                      >
                        <input
                          value=${editingPostTitle}
                          maxLength="140"
                          onInput=${(event) => setEditingPostTitle(event.target.value)}
                          required
                        />
                        <${DeferredForumEditor}
                          value=${editingPostBody}
                          onChange=${setEditingPostBody}
                          mentionSuggestions=${mentionSuggestions}
                          maxLength=${4000}
                          minLength=${FORUM_BODY_MIN_LENGTH}
                          draftScope=${`edit:${String(selectedPost.id || "")}`}
                          showTemplatePicker=${false}
                          placeholder="Update your post..."
                        />
                        <div className="comment-actions right submit-panel row">
                          <button className="button primary" type="submit">Save</button>
                          <button className="button ghost-btn" type="button" onClick=${cancelEditPost}>
                            Cancel
                          </button>
                        </div>
                        ${editingPostStatus ? html`<div className="muted">${editingPostStatus}</div>` : html``}
                      </form>`
                    : html`<${ForumRenderedMarkdown}
                        value=${selectedPost.body}
                        onMentionClick=${openForumMentionProfile}
                        onMentionHover=${handleForumMentionHover}
                        onMentionLeave=${handleForumMentionLeave}
                        className="news-body-paragraph"
                      />`}
                  ${(canManageForumPost(selectedPost) || (selectedPost.editCount || 0) > 0)
                    ? html`<div className="forum-post-actions-row">
                        ${canManageForumPost(selectedPost)
                          ? html`<button
                              className="ghost-btn"
                              type="button"
                              onClick=${() => startEditPost(selectedPost)}
                              disabled=${deletingPostId === String(selectedPost.id || "")}
                            >
                              Edit Post
                            </button>
                            <button
                              className="ghost-btn delete-action-btn"
                              type="button"
                              onClick=${() => deleteForumPost(selectedPost)}
                              disabled=${deletingPostId === String(selectedPost.id || "")}
                            >
                              ${deletingPostId === String(selectedPost.id || "")
                                ? "Deleting..."
                                : renderDeleteLabel("Delete Post")}
                            </button>`
                          : html``}
                        ${(selectedPost.editCount || 0) > 0
                          ? html`<button
                              className="ghost-btn forum-post-history-btn"
                              type="button"
                              onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                              onClick=${() => openForumPostHistory(selectedPost)}
                              title="View past edits"
                            >
                              <img src=${INK_PEN_ICON} alt="" aria-hidden="true" className="comment-action-icon" />
                              Past edits
                            </button>`
                          : html``}
                      </div>`
                    : html``}
                    <${CommentThread}
                      newsId=${`forum:${selectedPost.id}`}
                      autoOpen=${true}
                      threadOwnerUserId=${selectedPost.createdBy || selectedPost.authorUserId || ""}
                    />
                  </article>`}
          </section>
          ${renderForumHoverProfileCard()}
          <${PopUp}
            show=${forumProfileOpen}
            onClose=${() => setForumProfileOpen(false)}
            title=${(() => {
              const username = String(forumProfileUser?.username || "").replace(/^@+/, "");
              const display = username || forumProfileUser?.name || "User";
              return `${display}'s Profile`;
            })()}
            headerBelow=${forumProfileUser?.isOwn
              ? html`<div className="profile-modal-header-actions">
                  <button
                    type="button"
                    className="copy-action-btn subtle profile-copy-action account-management-pill"
                    onClick=${() => {
                      setForumProfileOpen(false);
                      if (openUserProfile) openUserProfile({});
                    }}
                    title="Account Management"
                  >
                    <span>Account Management</span>
                  </button>
                </div>`
              : isSignedIn
              ? html`<div className="profile-modal-header-actions">
                  <button
                    type="button"
                    className="copy-action-btn subtle profile-copy-action account-management-pill"
                    onClick=${() =>
                      emitAppToast({
                        kind: "info",
                        title: "Friends Feature Planned",
                        message: `Friend requests are planned. @${forumProfileUser?.username || forumProfileUser?.name || "user"} support is coming soon.`,
                      })}
                    title="Add Friend (planned)"
                  >
                    <img src=${ADD_FRIEND_ICON_SVG} alt="" aria-hidden="true" className="profile-action-icon-img" />
                    <span>Add Friend</span>
                  </button>
                </div>`
              : html``}
          >
            ${renderForumProfileCard()}
          <//>
          <${PopUp}
            show=${forumHistoryOpen}
            onClose=${() => setForumHistoryOpen(false)}
            title=${forumHistoryTitle}
            className="comment-history-overlay"
          >
            ${renderForumHistoryContent()}
          <//>
          <${LoadingScreen}
            show=${forumProfileCardLoading || postsLoading || selectedPostLoading}
          />
        </section>
      `;
    }

    return html`
      <section className="news-page fade-in forum-hub">
        <${PageHero}
          eyebrow="Forum Section"
          title=${selectedSection.title}
          copy=${selectedSection.description}
          calloutLabel=${selectedSection.stat}
          calloutItems=${[
            {
              title: "Community Posting",
              copy: "Create a post, then use comments and replies to discuss it.",
            },
          ]}
          actionLabel="Back to Sections"
          onAction=${() => navigate("/forum")}
        />

        ${isSignedIn
          ? html`<section className="card">
              <div className="forum-create-inline">
                <div>
                  <div className="section-title">Create Post</div>
                  <p className="muted">Posting as ${getUserDisplayName(user)}</p>
                </div>
                <button className="button primary" type="button" onClick=${() => setShowCreateModal(true)}>
                  New Post
                </button>
              </div>
            </section>`
          : html`<section className="card">
              <p className="muted">Sign in to create forum posts, comments, and replies.</p>
              <button className="button primary" type="button" onClick=${() => openSignIn && openSignIn({})}>
                Sign in
              </button>
            </section>`}

        <section className="card forum-post-feed">
          <div className="section-title-row">
            <div className="section-title">Posts in ${selectedSection.title}</div>
            <${CountBadge} count=${posts.length} className="section-count-badge" />
          </div>
          ${postsLoading
            ? html`<p className="muted">Loading posts...</p>`
            : posts.length === 0
            ? html`<p className="muted">No posts yet. Be the first to start this section.</p>`
            : html`<div className="news-list">
                ${posts.map(
                  (post) => html`<article
                    key=${post.id}
                    className="news-card forum-post-card"
                  >
                    <div className="forum-post-author-row">
                      <button
                        className="forum-post-author-trigger"
                        type="button"
                        onMouseEnter=${(event) => handleForumIdentityMouseEnter(post, event.currentTarget)}
                        onMouseLeave=${handleForumIdentityMouseLeave}
                        onClick=${(event) => handleForumIdentityTap(post, event.currentTarget)}
                        title="Open profile card"
                        aria-label="Open profile card"
                      >
                        <img
                          className="forum-post-author-avatar"
                          src=${post.authorImage || "/assets/HardTale_H_GreyScale.png"}
                          alt=${post.authorName || "User"}
                        />
                      </button>
                      <span className="muted">By</span>
                      <button
                        className="forum-post-author-name-btn"
                        type="button"
                        onMouseEnter=${(event) => handleForumIdentityMouseEnter(post, event.currentTarget)}
                        onMouseLeave=${handleForumIdentityMouseLeave}
                        onClick=${(event) => handleForumIdentityTap(post, event.currentTarget)}
                      >
                        <${AuthorName}
                          value=${post.authorName || "User"}
                          isStaffLabel=${isStaffLabel}
                          className=${`author-name ${post?.authorUseRankFont === true ? "rank-font-on" : "rank-font-off"} rank-${rankSlug(post?.authorRank || "Unregistered")}`.trim()}
                        />
                      </button>
                      <span className=${forumRankClassName(post)}>
                        ${(() => {
                          const iconType = getRankIconType(post.authorRank || "");
                          return html`${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                            <span>${getRankDisplayLabel(post.authorRank || "Unregistered")}</span>`;
                        })()}
                      </span>
                      ${forumShowStaffPill(post)
                        ? renderForumStaffPill(post)
                        : html``}
                      <span className="forum-post-op">OP</span>
                      <${TimestampText} value=${post.createdAt} formatTimestamp=${formatTimestamp} />
                    </div>
                    <${Link}
                      className="forum-post-link"
                      to=${`/forum?section=${encodeURIComponent(selectedSectionId)}&post=${encodeURIComponent(post.id)}`}
                    >
                      <div className="forum-post-header-divider"></div>
                      <div className="news-header">
                        <div className="news-title-row">
                          <h3>${post.title}</h3>
                        </div>
                      </div>
                      <div className="news-body-paragraph forum-post-preview">
                        <${ForumRenderedMarkdown}
                          value=${post.body || ""}
                          className="forum-post-preview-markdown"
                          onMentionClick=${openForumMentionProfile}
                          onMentionHover=${handleForumMentionHover}
                          onMentionLeave=${handleForumMentionLeave}
                        />
                      </div>
                    </${Link}>
                    ${(canManageForumPost(post) || (post.editCount || 0) > 0)
                      ? html`<div className="forum-post-actions-row">
                          ${canManageForumPost(post)
                            ? html`<button
                                className="ghost-btn"
                                type="button"
                                onClick=${() => startEditPost(post)}
                                disabled=${deletingPostId === String(post.id || "")}
                              >
                                Edit Post
                              </button>
                              <button
                                className="ghost-btn delete-action-btn"
                                type="button"
                                onClick=${() => deleteForumPost(post)}
                                disabled=${deletingPostId === String(post.id || "")}
                              >
                                ${deletingPostId === String(post.id || "")
                                  ? "Deleting..."
                                  : renderDeleteLabel("Delete Post")}
                              </button>`
                            : html``}
                          ${(post.editCount || 0) > 0
                            ? html`<button
                                className="ghost-btn forum-post-history-btn"
                                type="button"
                                onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                                onClick=${() => openForumPostHistory(post)}
                                title="View past edits"
                              >
                                <img src=${INK_PEN_ICON} alt="" aria-hidden="true" className="comment-action-icon" />
                                Past edits
                              </button>`
                            : html``}
                        </div>`
                      : html``}
                    ${editingPostId === String(post.id || "")
                      ? html`<form
                          className="forum-edit-form"
                          onSubmit=${(event) => {
                            event.preventDefault();
                            saveEditedPost(post);
                          }}
                        >
                          <input
                            value=${editingPostTitle}
                            maxLength="140"
                            onInput=${(event) => setEditingPostTitle(event.target.value)}
                            required
                          />
                          <${DeferredForumEditor}
                            value=${editingPostBody}
                            onChange=${setEditingPostBody}
                            mentionSuggestions=${mentionSuggestions}
                            maxLength=${4000}
                            minLength=${FORUM_BODY_MIN_LENGTH}
                            draftScope=${`edit:${String(post.id || "")}`}
                            showTemplatePicker=${false}
                            placeholder="Update your post..."
                          />
                          <div className="comment-actions right submit-panel row">
                            <button className="button primary" type="submit">Save</button>
                            <button className="button ghost-btn" type="button" onClick=${cancelEditPost}>
                              Cancel
                            </button>
                          </div>
                          ${editingPostStatus ? html`<div className="muted">${editingPostStatus}</div>` : html``}
                        </form>`
                      : html``}
                  </article>`,
                )}
              </div>`}
          ${postsStatus ? html`<div className="muted">${postsStatus}</div>` : html``}
        </section>
        ${renderForumHoverProfileCard()}
        <${PopUp}
          show=${forumProfileOpen}
          onClose=${() => setForumProfileOpen(false)}
          title=${(() => {
            const username = String(forumProfileUser?.username || "").replace(/^@+/, "");
            const display = username || forumProfileUser?.name || "User";
            return `${display}'s Profile`;
          })()}
          headerBelow=${forumProfileUser?.isOwn
            ? html`<div className="profile-modal-header-actions">
                <button
                  type="button"
                  className="copy-action-btn subtle profile-copy-action account-management-pill"
                  onClick=${() => {
                    setForumProfileOpen(false);
                    if (openUserProfile) openUserProfile({});
                  }}
                  title="Account Management"
                >
                  <span>Account Management</span>
                </button>
              </div>`
            : isSignedIn
            ? html`<div className="profile-modal-header-actions">
                <button
                  type="button"
                  className="copy-action-btn subtle profile-copy-action account-management-pill"
                  onClick=${() =>
                    emitAppToast({
                      kind: "info",
                      title: "Friends Feature Planned",
                      message: `Friend requests are planned. @${forumProfileUser?.username || forumProfileUser?.name || "user"} support is coming soon.`,
                    })}
                  title="Add Friend (planned)"
                >
                  <img src=${ADD_FRIEND_ICON_SVG} alt="" aria-hidden="true" className="profile-action-icon-img" />
                  <span>Add Friend</span>
                </button>
              </div>`
            : html``}
        >
          ${renderForumProfileCard()}
        <//>
        <${PopUp}
          show=${forumHistoryOpen}
          onClose=${() => setForumHistoryOpen(false)}
          title=${forumHistoryTitle}
          className="comment-history-overlay"
        >
          ${renderForumHistoryContent()}
        <//>

        <${PopUp}
          show=${showCreateModal}
          onClose=${() => {
            setShowCreateModal(false);
            setShowCreatePreview(false);
          }}
          title=${`Create Post - ${selectedSection.title}`}
          className="forum-create-overlay"
        >
          <form className="forum-create-form" onSubmit=${submitPost}>
            <input
              placeholder="Post title"
              value=${newPostTitle}
              onInput=${(event) => setNewPostTitle(event.target.value)}
              maxLength="140"
              required
            />
            <${DeferredForumEditor}
              value=${newPostBody}
              onChange=${setNewPostBody}
              mentionSuggestions=${mentionSuggestions}
              maxLength=${4000}
              minLength=${FORUM_BODY_MIN_LENGTH}
              draftScope=${`create:${selectedSectionId}`}
              showTemplatePicker=${createTemplateOptions.length > 0}
              templateOptions=${createTemplateOptions}
              showModeTabs=${false}
              placeholder="Write your post..."
            />
            <div className="comment-actions right submit-panel row">
              <span className="muted">Posting as ${getUserDisplayName(user)}</span>
              <button
                className="button ghost-btn"
                type="button"
                onClick=${() => setShowCreatePreview(true)}
                disabled=${!newPostTitle.trim() && !newPostBody.trim()}
              >
                Preview
              </button>
              <button className="button primary" type="submit">Post</button>
            </div>
            ${createStatus ? html`<div className="muted">${createStatus}</div>` : html``}
          </form>
        <//>
        <${PopUp}
          show=${showCreatePreview}
          onClose=${() => setShowCreatePreview(false)}
          title="Post Preview"
          className="forum-create-overlay"
        >
          <div className="comment-actions right">
            <button
              className="button ghost-btn"
              type="button"
              onClick=${() => setShowCreatePreview(false)}
            >
              Back to editor
            </button>
          </div>
          <article className="news-card forum-post-card forum-preview-card">
            <div className="forum-post-author-row">
              <img
                className="forum-post-author-avatar"
                src=${user?.imageUrl || "/assets/HardTale_H_GreyScale.png"}
                alt=${getUserDisplayName(user)}
              />
              <span className="muted">By</span>
              <span className="forum-post-author-name-static">
                <${AuthorName} value=${getUserDisplayName(user)} isStaffLabel=${isStaffLabel} />
              </span>
              <${TimestampText} value=${new Date().toISOString()} formatTimestamp=${formatTimestamp} />
            </div>
            <div className="forum-post-header-divider"></div>
            <div className="news-header">
              <div className="news-title-row">
                <h3>${newPostTitle.trim() || "Post title preview"}</h3>
              </div>
            </div>
            <div className="news-body">
              <${ForumRenderedMarkdown}
                value=${newPostBody.trim() || "Write content in the editor to preview your post body."}
                onMentionClick=${openForumMentionProfile}
                onMentionHover=${handleForumMentionHover}
                onMentionLeave=${handleForumMentionLeave}
              />
            </div>
          </article>
        <//>
        <${LoadingScreen}
          show=${forumProfileCardLoading || postsLoading || selectedPostLoading}
        />
      </section>
    `;
  }

  return html`
    <section className="news-page fade-in forum-hub">
      <${PageHero}
        eyebrow="Forum"
        title="Community Sections"
        copy="Devforum-inspired structure with focused sections for updates, reports, and player feedback."
        calloutLabel="Need Private Help?"
        calloutItems=${[
          {
            title: "Use Support Tickets",
            copy: "Appeals and account-specific issues should be opened in Support, not public posts.",
          },
        ]}
        actionLabel="Open Support"
        onAction=${() => navigate("/support")}
      />

      <${ForumSectionList}
        sections=${sections}
        onNavigateSection=${(sectionId) => navigate(`/forum?section=${sectionId}`)}
      />
    </section>
  `;
}

const CHANGELOG_ADMIN_ONLY_PATTERNS = [
  /temporary smurfis verified-link test override/i,
  /\blocal dev\b/i,
  /\bdev mode\b/i,
  /\bserver-to-server\b/i,
  /\bfeature flag\b/i,
  /\blink_service_/i,
  /\/api\//i,
  /\bclerk key\b/i,
  /\bauth handshake\b/i,
  /\brender-managed\b/i,
  /\badmin tools\b/i,
  /\/panel\b/i,
  /\bmongo-backed\b/i,
];

function isAdminOnlyChangelogText(text) {
  const value = String(text || "");
  return CHANGELOG_ADMIN_ONLY_PATTERNS.some((pattern) => pattern.test(value));
}

function buildVisibleChangelogEntries(isAdmin = false) {
  return CHANGELOG_ENTRIES
    .map((entry) => {
      const normalizedItems = (Array.isArray(entry?.items) ? entry.items : [])
        .map((rawItem, index) => {
          if (typeof rawItem === "string") {
            return {
              key: `${entry.version}-${index}`,
              text: rawItem,
              adminOnly: isAdminOnlyChangelogText(rawItem),
            };
          }
          return {
            key: String(rawItem?.key || `${entry.version}-${index}`),
            text: String(rawItem?.text || ""),
            adminOnly: Boolean(rawItem?.adminOnly),
          };
        })
        .filter((item) => item.text)
        .filter((item) => isAdmin || item.adminOnly !== true);

      return {
        ...entry,
        items: normalizedItems,
      };
    })
    .filter((entry) => entry.items.length > 0);
}

function ChangelogPanel({ isAdmin = false }) {
  const visibleEntries = buildVisibleChangelogEntries(isAdmin);
  return html`
    <div className="changelog-list">
      ${visibleEntries.map(
        (entry) => html`<div key=${entry.version} className="changelog-entry">
          <div className="changelog-header">
            <div className="changelog-version">v${entry.version}</div>
            <div className="changelog-date">${entry.date}</div>
          </div>
          <ul className="changelog-items">
            ${entry.items.map(
              (item) => html`<li key=${item.key}>${item.text}</li>`,
            )}
          </ul>
          <${ReactionBar} itemType="changelog" itemId=${entry.version} />
        </div>`,
      )}
    </div>
  `;
}

function NotFoundPage({
  isAdmin,
  news,
  notifications,
  onNewsUpdate,
  onNotificationsUpdate,
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useUser();
  const { getToken, isSignedIn } = useAuth();
  const { openSignIn, openUserProfile } = useClerk();
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(
    location.pathname === "/support",
  );
  const [timeLabel, setTimeLabel] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy Crash Log");
  const [command, setCommand] = useState("");
  const [commandStatus, setCommandStatus] = useState("");
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticketStatus, setTicketStatus] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("support");
  const [newBody, setNewBody] = useState("");
  const [newEvidenceLinks, setNewEvidenceLinks] = useState("");
  const [errorContextOptions, setErrorContextOptions] = useState(() => readSupportErrorContexts());
  const [selectedErrorContextId, setSelectedErrorContextId] = useState("");
  const [chatDraft, setChatDraft] = useState("");
  const [nextStatus, setNextStatus] = useState("pending");
  const logRef = useRef(null);

  useEffect(() => {
    const now = new Date();
    setTimeLabel(
      `${now.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })}`,
    );
  }, []);

  async function copyCrashLog() {
    const text = logRef.current?.innerText?.replace(/\n{3,}/g, "\n\n")?.trim();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy Crash Log"), 1200);
    } catch (err) {
      emitAppToast({
        kind: "warning",
        title: "Clipboard blocked",
        message: "Copy manually.",
      });
    }
  }

  async function loadTickets() {
    if (!showSupportModal || !isSignedIn) {
      setTickets([]);
      setSelectedTicketId("");
      setSelectedTicket(null);
      setTicketLoading(false);
      return;
    }
    setTicketLoading(true);
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/forum/tickets");
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const next = Array.isArray(data.tickets) ? data.tickets : [];
      setTickets(next);
      if (!selectedTicketId && next.length > 0) {
        setSelectedTicketId(next[0].id);
      }
      setTicketStatus("");
    } catch {
      setTicketStatus("Failed to load tickets.");
    } finally {
      setTicketLoading(false);
    }
  }

  async function loadTicketDetail(ticketId) {
    if (!showSupportModal || !ticketId || !isSignedIn) {
      setSelectedTicket(null);
      return;
    }
    try {
      const response = await apiFetchWithToken(getToken, true, `/api/forum/tickets/${ticketId}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setSelectedTicket(data.ticket || null);
      setNextStatus((data.ticket?.status || "pending") === "resolved" ? "resolved" : "pending");
    } catch {
      setSelectedTicket(null);
    }
  }

  async function submitTicket(event) {
    event.preventDefault();
    if (!isSignedIn) return;
    if (!newSubject.trim() || !newBody.trim()) return;
    const selectedErrorContext = errorContextOptions.find(
      (entry) => entry.id === selectedErrorContextId,
    );
    const ticketBodyBase = appendEvidenceLinksToBody(newBody, newEvidenceLinks);
    const ticketBody = buildTicketBodyWithAttachedError(ticketBodyBase, selectedErrorContext);
    setTicketStatus("Creating ticket...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/forum/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          body: ticketBody,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const created = data.ticket;
      setNewSubject("");
      setNewCategory("support");
      setNewBody("");
      setNewEvidenceLinks("");
      setSelectedErrorContextId("");
      setTicketStatus("Ticket created.");
      await loadTickets();
      if (created?.id) {
        setSelectedTicketId(created.id);
        setSelectedTicket(created);
      }
    } catch {
      setTicketStatus("Failed to create ticket.");
    }
  }

  async function sendMessage() {
    if (!selectedTicketId || !chatDraft.trim()) return;
    setTicketStatus("Sending message...");
    try {
      const response = await apiFetchWithToken(
        getToken,
        true,
        `/api/forum/tickets/${selectedTicketId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ body: chatDraft }),
        },
      );
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setSelectedTicket(data.ticket || null);
      setChatDraft("");
      setTicketStatus("");
      await loadTickets();
    } catch {
      setTicketStatus("Failed to send message.");
    }
  }

  async function updateTicketStatus() {
    if (!isAdmin || !selectedTicketId) return;
    setTicketStatus("Updating ticket...");
    try {
      const response = await apiFetchWithToken(getToken, true, `/api/forum/tickets/${selectedTicketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setSelectedTicket(data.ticket || null);
      setTicketStatus("");
      await loadTickets();
    } catch {
      setTicketStatus("Failed to update ticket.");
    }
  }

  useEffect(() => {
    if (location.pathname === "/support") {
      setShowSupportModal(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname !== "/support") return;
    const ticketId = new URLSearchParams(location.search).get("ticketId") || "";
    if (ticketId) {
      setSelectedTicketId(ticketId);
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const nextOptions = readSupportErrorContexts();
    setErrorContextOptions(nextOptions);
    const attachErrorId = String(new URLSearchParams(location.search || "").get("attachError") || "").trim();
    if (attachErrorId && nextOptions.some((entry) => entry.id === attachErrorId)) {
      setSelectedErrorContextId(attachErrorId);
    }
  }, [location.search, showSupportModal]);

  useEffect(() => {
    loadTickets();
  }, [isSignedIn, showSupportModal]);

  useEffect(() => {
    loadTicketDetail(selectedTicketId);
  }, [selectedTicketId, isSignedIn, showSupportModal]);

  function closeSupportModal() {
    setShowSupportModal(false);
  }

  function runCommand(value) {
    const next = (value || command).trim();
    if (!next) return;
    if (next === "/support") {
      if (location.pathname === "/support") {
        setShowSupportModal(true);
      } else {
        navigate("/support");
      }
      setCommandStatus("Opening support module...");
      return;
    }
    if (next === "/warp spawn") {
      navigate("/");
      return;
    }
    if (next === "/panel") {
      if (!isAdmin) {
        setCommandStatus("Admin only command.");
        return;
      }
      setShowAdminPanel(true);
      setCommandStatus("Opening admin panel...");
      return;
    }
    setCommandStatus("Unknown command. Try /support.");
  }

  return html`
    <section className="not-found-world">
      <div className="not-found-wrap">
        <main className="not-found-card" role="main" aria-label="404 error">
          <section className="not-found-left">
            <div className="not-found-badge-row">
              <div className="not-found-badge">
                <span className="not-found-dot"></span>
                WORLDGEN ERROR - CHUNK_NOT_FOUND
              </div>
              ${isAdmin
                ? html`<button
                    type="button"
                    className="button ghost-btn not-found-admin-open"
                    onClick=${() => setShowAdminPanel(true)}
                  >
                    Open Admin Panel
                  </button>`
                : html``}
            </div>
            <h1 className="not-found-title">
              <span className="not-found-glow">ERROR 404</span>
            </h1>
            <div className="not-found-subtitle">Page not found you fell out the world</div>
            <p className="not-found-copy">
              This page doesn't exist (or the portal bugged out). If you typed the URL,
              check it for typos - otherwise you can head back to spawn.
            </p>
            <div className="not-found-actions">
              <button className="button" onClick=${() => navigate(-1)}>
                Go Back
              </button>
              <button className="button ghost-btn" type="button" onClick=${copyCrashLog}>
                ${copyLabel}
              </button>
            </div>
            <div className="not-found-hint">
              Tip: try <code>/warp spawn</code> or <code>/support</code> if this keeps happening.
            </div>
          </section>
          <aside className="not-found-right" aria-label="debug panel">
            <div className="not-found-logtitle">
              <span>Server Console</span>
              <span className="not-found-pill">${timeLabel || "UTC"}</span>
            </div>
            <div className="not-found-log" ref=${logRef}>
              <div className="not-found-log-line">
                <span className="info">[INFO]</span> Loaded ${user?.fullName || getUserEmail(user) || "Guest"}
              </div>
              <div className="not-found-log-line">
                <span className="info">[INFO]</span> Teleport requested: /page
              </div>
              <div className="not-found-log-line">
                <span className="warn">[WARN]</span> Portal target missing: /this-url
              </div>
              <div className="not-found-log-line">
                <span className="warn">[WARN]</span> Chunk decode failed: x=?? z=??
              </div>
              <div className="not-found-log-line">
                <span className="ok">[OK]</span> Fallback route available: /
              </div>
            </div>
            <div className="not-found-console bottom">
              <div className="not-found-console-title">Console</div>
              <div className="not-found-console-row">
                <input
                  className="not-found-input"
                  placeholder="/support"
                  value=${command}
                  onInput=${(event) => {
                    setCommand(event.target.value);
                    setCommandStatus("");
                  }}
                  onKeyDown=${(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      runCommand(event.target.value);
                    }
                  }}
                />
                <button className="button" type="button" onClick=${() => runCommand()}>
                  Run
                </button>
              </div>
              <div className="not-found-console-actions">
                ${commandStatus ? html`<span className="muted">${commandStatus}</span>` : html``}
              </div>
              <div className="not-found-command">
                <button className="button ghost-btn" type="button" onClick=${() => {
                  setCommand("/support");
                  setCommandStatus("");
                  runCommand("/support");
                }}>
                  /support
                </button>
                <span className="muted">Open a support ticket.</span>
              </div>
              <div className="not-found-command">
                <button className="button ghost-btn" type="button" onClick=${() => {
                  setCommand("/");
                  setCommandStatus("");
                  navigate("/");
                }}>
                  Return to Spawn
                </button>
                <span className="muted">Takes you home.</span>
              </div>
            </div>
          </aside>
        </main>
      </div>
      <${PopUp}
        show=${showSupportModal}
        onClose=${closeSupportModal}
        title="Support Center"
        className="support-center-overlay"
      >
        ${!isSignedIn
          ? html`<section className="card">
              <p className="muted">Sign in to create and manage support tickets.</p>
              <button className="button primary" type="button" onClick=${() => openSignIn && openSignIn({})}>
                Sign in
              </button>
            </section>`
          : html`<section className="card admin-tools support-modal-layout">
              <${SupportTicketForm}
                submitTicket=${submitTicket}
                newSubject=${newSubject}
                setNewSubject=${setNewSubject}
                newCategory=${newCategory}
                setNewCategory=${setNewCategory}
                newBody=${newBody}
                setNewBody=${setNewBody}
                newEvidenceLinks=${newEvidenceLinks}
                setNewEvidenceLinks=${setNewEvidenceLinks}
                errorContextOptions=${errorContextOptions}
                selectedErrorContextId=${selectedErrorContextId}
                setSelectedErrorContextId=${setSelectedErrorContextId}
                status=${ticketStatus}
              />

              <div className="admin-panel">
                <div className="section-title">Ticket Inbox</div>
                <${TicketInboxList}
                  loading=${ticketLoading}
                  tickets=${tickets}
                  formatTimestamp=${formatTimestamp}
                  isAdmin=${isAdmin}
                  onSelectTicket=${(ticketId) => setSelectedTicketId(ticketId)}
                />

                <${SupportTicketThread}
                  selectedTicket=${selectedTicket}
                  isAdmin=${isAdmin}
                  nextStatus=${nextStatus}
                  setNextStatus=${setNextStatus}
                  updateTicketStatus=${updateTicketStatus}
                  formatTimestamp=${formatTimestamp}
                  chatDraft=${chatDraft}
                  setChatDraft=${setChatDraft}
                  sendMessage=${sendMessage}
                />
              </div>
            </section>`}
      <//>
      ${isAdmin
        ? html`<${PopUp}
            show=${showAdminPanel}
            onClose=${() => setShowAdminPanel(false)}
            title="Admin Panel"
            className="admin-panel-overlay"
          >
            <div className="admin-panel-modal-content">
              <${AdminPanel}
                news=${news}
                onNewsUpdate=${onNewsUpdate}
                onNotificationsUpdate=${onNotificationsUpdate}
                notifications=${notifications}
                isAdmin=${isAdmin}
              />
            </div>
          <//>`
        : html``}
    </section>
  `;
}

function renderStoreIcon(type) {
  const src = STORE_RANK_ICON_SVG[String(type || "").trim()] || STORE_RANK_ICON_SVG.star;
  return html`<img src=${src} alt="" aria-hidden="true" />`;
}

function renderFeaturedBadge(mini = false) {
  return html`<span className=${`news-star ${mini ? "mini" : ""}`.trim()} title="Featured" aria-label="Featured">
    <img className="news-badge-icon" src=${FEATURED_BADGE_ICON_SVG} alt="" aria-hidden="true" />
  </span>`;
}

function renderDeleteLabel(label = "Delete") {
  return html`<span className="delete-btn-content">
    <span className="delete-btn-icon" style=${{ "--delete-icon": `url(${DELETE_ICON_SVG})` }} aria-hidden="true"></span>
    <span>${label}</span>
  </span>`;
}

function renderRankIcon(type) {
  switch (type) {
    case "hero":
      return html`<img className="rank-icon-image" src=${HERO_RANK_ICON_SVG} alt="" aria-hidden="true" />`;
    case "mod":
      return html`<img className="rank-icon-image" src=${MOD_RANK_ICON_SVG} alt="" aria-hidden="true" />`;
    case "crown":
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M3 7l4 3 5-6 5 6 4-3-2 12H5L3 7zm4 12h10l.3-2H6.7l.3 2z" />
      </svg>`;
    case "shield":
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3zm0 4.1L7 7.8V11c0 3.6 2.2 6.8 5 8 2.8-1.2 5-4.4 5-8V7.8l-5-1.7z"
        />
      </svg>`;
    case "star":
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 2l2.5 6.2 6.7.6-5.1 4.3 1.6 6.5-5.7-3.6-5.7 3.6 1.6-6.5-5.1-4.3 6.7-.6L12 2z" />
      </svg>`;
    case "linked":
      return html`<img className="rank-icon-image" src=${LINKED_STATUS_ICON_SVG} alt="" aria-hidden="true" />`;
    case "unlinked":
      return html`<img className="rank-icon-image" src=${UNLINKED_STATUS_ICON_SVG} alt="" aria-hidden="true" />`;
    case "staff":
      return html`<img className="rank-icon-image" src=${STAFF_BADGE_ICON_SVG} alt="" aria-hidden="true" />`;
    default:
      return html``;
  }
}

function renderStaffBadge(entry) {
  if (!entry || !entry.staff || entry.showStaffBadge === false) return html``;
  const roleClass = resolveStaffRoleClass(entry);
  const badgeClass = `profile-card-badge staff-badge ${roleClass} ${
    entry.showStaffGradient === false ? "staff-static" : ""
  }`.trim();
  return html`<div className=${badgeClass}>
    <span>STAFF</span>
  </div>`;
}

function renderLinkedStatusIcon(linked = false) {
  if (linked) {
    return html`<img
      className="link-state-icon link-state-icon-verified"
      src=${LINKED_STATUS_ICON_SVG}
      alt=""
      aria-hidden="true"
    />`;
  }
  return html`<img
    className="link-state-icon link-state-icon-warning"
    src=${WARNING_STATUS_ICON_SVG}
    alt=""
    aria-hidden="true"
  />`;
}

function renderOwnedRankBadges(entry, options = {}) {
  if (!entry) return html``;
  const donorBadges = buildOwnedRankBadges(entry.ownedRank, false, {
    showAllOwnedRankBadges: entry?.showAllOwnedRankBadges !== false,
    selectedOwnedBadge: entry?.selectedOwnedBadge || "",
  });
  const donorBadgeOptions = Array.isArray(entry?.ownedBadgeOptions)
    ? entry.ownedBadgeOptions.filter((rank) => OWNED_RANK_ORDER.includes(String(rank)))
    : donorBadges;
  const linkedResolved = Boolean(entry.linkedAccount);
  const linkedBadgeLabel = linkedResolved ? "Linked" : "Unlinked";
  const hasStaffTier = Boolean(entry?.isStaffUser || entry?.staff);
  const showStaffTier = hasStaffTier && entry?.showStaffBadge !== false;
  const staffTierLabel = toStaffPillTitle(entry?.staffRolePreview || entry?.staffRole || entry?.authorStaffRole || "") || "Staff";
  const staffRoleClass = resolveStaffRoleClass(entry);
  const groups = deriveProfileGroups(entry);
  const canManageDonorBadge =
    Boolean(entry?.isOwn) &&
    Boolean(entry?.canToggleOwnedBadges) &&
    typeof options?.onSelectDonorBadge === "function";
  const canManageStaffBadge =
    Boolean(entry?.isOwn) &&
    Boolean(entry?.canToggleStaffBadge) &&
    typeof options?.onSelectStaffBadgeMode === "function";
  const donorModeValue =
    entry?.showAllOwnedRankBadges === false
      ? String(entry?.selectedOwnedBadge || "")
      : "__all__";
  const staffModeValue =
    entry?.showStaffBadge === false
      ? "hidden"
      : entry?.showStaffBadgeIcon === false
      ? "label"
      : "icon";
  return html`<div className="profile-card-badges-stack">
    <div className="profile-card-badges-block">
      <div className="profile-card-badges-title">Link Status</div>
      <div className="profile-card-badges-row">
        <span className=${`profile-owned-badge rank-${linkedBadgeLabel.toLowerCase()}`.trim()}>
          ${renderLinkedStatusIcon(linkedResolved)}
          <span>${linkedBadgeLabel}</span>
        </span>
      </div>
    </div>
    <div className="profile-card-badges-block">
      <div className="profile-card-badges-title">Donor Badges</div>
      ${donorBadges.length > 0
        ? html`<div className="profile-card-badges-row">
            ${donorBadges.map((label) => {
              const iconType = getRankIconType(label);
              const slug = String(label).trim().toLowerCase();
              return html`<button
                type="button"
                className=${`profile-owned-badge rank-${slug} ${
                  canManageDonorBadge ? "is-selectable" : ""
                }`.trim()}
                onClick=${() => {
                  if (!canManageDonorBadge) return;
                  options.onSelectDonorBadge(label);
                }}
                title=${canManageDonorBadge
                  ? `Display ${label} as your donor badge`
                  : `${label} badge`}
                disabled=${!canManageDonorBadge}
              >
                ${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                <span>${getRankDisplayLabel(label)}</span>
              </button>`;
            })}
          </div>`
        : html`<div className="muted profile-card-badges-empty">No donor badges yet.</div>`}
    </div>
    ${hasStaffTier
      ? html`<div className="profile-card-badges-block">
          <div className="profile-card-badges-title">Staff Tier</div>
          ${showStaffTier
            ? html`<div className="profile-card-badges-row">
                <span className=${`profile-owned-badge staff-owned-badge ${staffRoleClass}`.trim()}>
                  ${entry?.showStaffBadgeIcon === false
                    ? html``
                    : html`<span className="rank-icon">${renderRankIcon("staff")}</span>`}
                  <span>${staffTierLabel}</span>
                </span>
              </div>`
            : html`<div className="muted profile-card-badges-empty">Staff tier badge hidden.</div>`}
        </div>`
      : html``}
    <div className="profile-card-badges-block">
      <div className="profile-card-badges-title">Groups / Guilds / Clans</div>
      ${groups.length > 0
        ? html`<div className="profile-card-badges-row profile-groups-row">
            ${groups.map((group) => html`<span className="profile-group-pill">${group}</span>`)}
          </div>`
        : html`<div className="muted profile-card-badges-empty">No groups assigned yet.</div>`}
    </div>
    ${entry?.isOwn && (canManageDonorBadge || canManageStaffBadge)
      ? html`<div className="profile-card-badges-block">
          <div className="profile-card-badges-title">Badge Display Tabs</div>
          ${canManageDonorBadge
            ? html`<details className="profile-badge-dropdown" open>
                <summary>Donor Tab</summary>
                <label className="profile-card-title-picker">
                  <span className="muted">Displayed donor badge</span>
                  <select
                    value=${donorModeValue}
                    disabled=${options?.donorSaving === true}
                    onChange=${(event) => {
                      const next = String(event.target.value || "");
                      if (next === "__all__") {
                        options.onSelectDonorBadge("__all__");
                        return;
                      }
                      options.onSelectDonorBadge(next);
                    }}
                  >
                    <option value="__all__">Show all owned donor badges</option>
                    ${donorBadgeOptions
                      .map(
                        (badge) => html`<option value=${badge}>Show ${badge} only</option>`,
                      )}
                  </select>
                </label>
              </details>`
            : html``}
          ${canManageStaffBadge
            ? html`<details className="profile-badge-dropdown" open>
                <summary>Staff Tab</summary>
                <label className="profile-card-title-picker">
                  <span className="muted">Staff badge mode</span>
                  <select
                    value=${staffModeValue}
                    disabled=${options?.staffSaving === true}
                    onChange=${(event) => options.onSelectStaffBadgeMode(event.target.value)}
                  >
                    <option value="icon">Icon Staff</option>
                    <option value="label">Text Staff</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </label>
              </details>`
            : html``}
        </div>`
      : html``}
    <${ProfileAchievementsCard} achievements=${entry?.achievements || entry?.profileAchievements || []} />
  </div>`;
}

function renderProfileRanksCard(entry) {
  const groups = deriveProfileGroups(entry);
  return html`<div className="profile-card-badges-block">
    <div className="profile-card-badges-title">Ranks</div>
    ${groups.length > 0
      ? html`<div className="profile-card-badges-row profile-groups-row">
          ${groups.map((group) => html`<span className="profile-group-pill">${group}</span>`)}
        </div>`
      : html`<div className="muted profile-card-badges-empty">No ranks assigned.</div>`}
  </div>`;
}

function renderProfileGroupsCard(entry, options = {}) {
  const canManageStaffGroup =
    Boolean(entry?.isOwn) &&
    Boolean(entry?.canPreviewStaffRole) &&
    Array.isArray(entry?.staffRolePreviewOptions) &&
    entry.staffRolePreviewOptions.length > 0 &&
    typeof options?.onStaffRoleChange === "function";
  const groups = deriveProfileGroups(entry);
  return html`<div className="profile-card-badges-block">
    <div className="profile-card-badges-title">Groups</div>
    ${groups.length > 0
      ? html`<div className="profile-card-badges-row profile-groups-row">
          ${groups.map((group) => html`<span className="profile-group-pill">${group}</span>`)}
        </div>`
      : html`<div className="muted profile-card-badges-empty">No groups assigned yet.</div>`}
    ${canManageStaffGroup
      ? html`<label className="profile-card-title-picker profile-groups-picker">
          <span className="muted">Staff tier</span>
          <select
            value=${entry?.staffRolePreview || entry?.staffRole || ""}
            disabled=${options?.isSaving === true}
            onChange=${(event) => options.onStaffRoleChange(event.target.value)}
          >
            ${entry.staffRolePreviewOptions.map((role) => html`<option value=${role}>
              ${toStaffPillTitle(role) || role}
            </option>`)}
          </select>
        </label>`
      : html``}
  </div>`;
}

function renderProfileForumActivityCard(entry, formatTimestamp) {
  const activity = entry?.forumActivity || {};
  const posts = Number(activity?.posts || 0);
  const comments = Number(activity?.comments || 0);
  const replies = Number(activity?.replies || 0);
  const mentionsReceived = Number(activity?.mentionsReceived || 0);
  const totalEngagement = Number(activity?.totalEngagement || posts + comments + replies);
  const lastActiveAt = String(activity?.lastReplyAt || activity?.lastCommentAt || activity?.lastPostAt || "");
  return html`<div className="profile-card-badges-block">
    <div className="profile-card-badges-title">Forum Activity</div>
    <div className="profile-card-badges-row profile-groups-row">
      <span className="profile-group-pill">Posts: ${posts}</span>
      <span className="profile-group-pill">Comments: ${comments}</span>
      <span className="profile-group-pill">Replies: ${replies}</span>
      <span className="profile-group-pill">Mentions: ${mentionsReceived}</span>
      <span className="profile-group-pill">Total: ${totalEngagement}</span>
    </div>
    <div className="muted profile-card-badges-empty">
      ${lastActiveAt ? `Last activity: ${formatTimestamp(lastActiveAt)}` : "No recent forum activity."}
    </div>
  </div>`;
}

function HomePage({
  news,
  loading,
  error,
  playRef,
  onPlayClick,
  onNewsClick,
  onHowClick,
  onLinkClick,
  isLinkedAccount,
  isSignedIn,
}) {
  const navigate = useNavigate();
  const { openSignIn } = useClerk();
  const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
  const [forumPreview, setForumPreview] = useState([]);
  const [forumLoading, setForumLoading] = useState(true);
  const [serverRuntime, setServerRuntime] = useState({
    online: false,
    playerCount: null,
    maxPlayers: null,
    loading: true,
  });

  useEffect(() => {
    let alive = true;
    async function loadForumPreview() {
      setForumLoading(true);
      try {
        const results = await Promise.all(
          HOME_FORUM_PREVIEW_SECTIONS.map(async (sectionId) => {
            try {
              const response = await fetch(
                `/api/forum/posts?section=${encodeURIComponent(sectionId)}`,
              );
              if (!response.ok) return [];
              const data = await response.json();
              const posts = Array.isArray(data.posts) ? data.posts : [];
              return posts.slice(0, 2);
            } catch {
              return [];
            }
          }),
        );
        if (!alive) return;
        const merged = results
          .flat()
          .filter(Boolean)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
        setForumPreview(merged);
      } catch {
        if (!alive) return;
        setForumPreview([]);
      } finally {
        if (alive) setForumLoading(false);
      }
    }
    loadForumPreview();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadServerRuntime() {
      try {
        const response = await fetch("/health");
        const data = await response.json().catch(() => ({}));
        if (!alive || !response.ok) return;
        const server = data?.server || {};
        const playerCount =
          Number.isFinite(Number(server?.playerCount)) && Number(server?.playerCount) >= 0
            ? Math.trunc(Number(server.playerCount))
            : null;
        const maxPlayers =
          Number.isFinite(Number(server?.maxPlayers)) && Number(server?.maxPlayers) > 0
            ? Math.trunc(Number(server.maxPlayers))
            : null;
        setServerRuntime({
          online: server?.online === true,
          playerCount,
          maxPlayers,
          loading: false,
        });
      } catch {
        if (!alive) return;
        setServerRuntime((prev) => ({ ...prev, loading: false }));
      }
    }
    loadServerRuntime();
    const timer = window.setInterval(loadServerRuntime, 60_000);
    return () => {
      alive = false;
      window.clearInterval(timer);
    };
  }, []);

  const onlineLabel = serverRuntime.online ? "Server online" : "Server offline";
  const activePlayersLabel = serverRuntime.loading
    ? `Active Players: ${PLAYER_COUNT}`
    : serverRuntime.online
    ? serverRuntime.playerCount !== null
      ? `Active Players: ${serverRuntime.maxPlayers ? `${serverRuntime.playerCount}/${serverRuntime.maxPlayers}` : serverRuntime.playerCount}`
      : "Active Players: Online"
    : "Active Players: Offline";
  const linkedLabel = isLinkedAccount ? "Linked" : "Unlinked";
  const linkedClass = isLinkedAccount ? "linked" : "unlinked";
  const previewText = (value) =>
    String(value || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);

  return html`
    <section className="home-stack">
      <div className="hero fade-in">
        <div>
          <div className="hero-kicker">Start your adventure</div>
          <h1 className="hero-title">Enter the new age of <span>Hardtale</span></h1>
          <p className="hero-copy">
            Hardtale aims to be the definitive Hytale Vanilla+ RPG SMP. A custom
            coded realm focused on immersive progression, bold builds, and
            community-first adventures.
          </p>
          <div className="hero-actions">
            <button className="button primary hero-action-btn" onClick=${onPlayClick}>
              Play now
            </button>
            <button className="button" onClick=${onNewsClick}>
              Latest news
            </button>
          </div>
        </div>
        <div ref=${playRef} className="hero-card plain">
          <div className="join-row">
            <strong>Join now</strong>
            ${!isSignedIn
              ? html`<button
                  className="button ghost-btn link-state-pill unlinked"
                  type="button"
                  onClick=${() =>
                    openSignIn &&
                    openSignIn({
                      fallbackRedirectUrl: "/",
                      forceRedirectUrl: "/",
                    })}
                >
                  Sign up / Sign In
                </button>`
              : html`<button
                  className=${`button ghost-btn link-state-pill ${linkedClass}`.trim()}
                  type="button"
                  onClick=${() => onLinkClick && onLinkClick()}
                >
                  ${linkedLabel}
                </button>`}
            <button
              className="button ghost-btn how-btn"
              type="button"
              onClick=${onHowClick}
            >
              How?
            </button>
          </div>
          <div className="ip-row">
            <div className="ip">${SERVER_IP}</div>
            <${CopyAction}
              className="button primary copy-ip-btn hero-action-btn"
              label="Copy IP"
              valueToCopy=${SERVER_IP}
            />
          </div>
          <div className="server-pill">
            <span className="server-status">
              <span className=${`dot ${serverRuntime.online ? "" : "offline"}`.trim()}></span> ${onlineLabel}
            </span>
            <span className="server-players">${activePlayersLabel}</span>
          </div>
          <div className="discord-pill">
            <span className="discord-text">Discord online: -/-</span>
            <div className="discord-actions">
              <a className="button primary hero-action-btn" href="#" role="button">Join Discord</a>
              <div className="discord-icon">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 5.2c-1.3-1-2.8-1.7-4.4-2l-.2.4c1 .3 2 .8 2.9 1.4-1.7-.8-3.7-1.2-5.7-1.2s-4 .4-5.7 1.2c.9-.6 1.9-1.1 2.9-1.4l-.2-.4C7.9 3.5 6.4 4.2 5.1 5.2 2.9 8.3 2.2 11.5 2.4 14.6c1.3 1 2.8 1.8 4.4 2.4.5-.7 1-1.4 1.3-2.2-.7-.3-1.4-.6-2-.9.2-.2.4-.3.6-.4 1.2.6 2.6.9 4 .9s2.8-.3 4-.9c.2.1.4.3.6.4-.6.3-1.3.6-2 .9.4.8.8 1.5 1.3 2.2 1.6-.6 3.1-1.4 4.4-2.4.4-3.4-.8-6.6-3-9.4zM9.3 12.9c-.6 0-1.1-.6-1.1-1.3s.5-1.3 1.1-1.3 1.1.6 1.1 1.3-.5 1.3-1.1 1.3zm5.4 0c-.6 0-1.1-.6-1.1-1.3s.5-1.3 1.1-1.3 1.1.6 1.1 1.3-.5 1.3-1.1 1.3z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="home-split fade-in">
        <div className="card news-sidebar updates-combined-card">
          <div className="section-title">Updates & News</div>
          <div className="combined-updates-grid">
            <div className="combined-updates-col updates-news-col">
              <div className="combined-updates-title">News</div>
              ${loading
                ? html`<p className="muted">Loading latest news...</p>`
                : error
                ? html`<p className="muted">${error}</p>`
                : news.length === 0
                ? html`<p className="muted">No news yet. Check back soon.</p>`
                : html`<div className="news-mini compact">
                    ${news.slice(0, 3).map(
                      (item) => html`<div key=${item.id} className="news-mini-row">
                        <div className="mini-row-head">
                          <div className="news-mini-title">
                            ${item.featured ? renderFeaturedBadge(true) : html``}
                            ${item.title}
                          </div>
                          <button
                            className="button ghost-btn mini-view-btn"
                            type="button"
                            onClick=${() => navigate(`/news?newsId=${encodeURIComponent(item.id)}`)}
                          >
                            View
                          </button>
                        </div>
                        <div className="news-mini-meta">
                          By ${item.author} · ${formatTimestamp(item.createdAt)}
                        </div>
                        ${previewText(item.body || item.content || item.summary)
                          ? html`<div className="news-mini-preview">
                              ${previewText(item.body || item.content || item.summary)}
                            </div>`
                          : html``}
                      </div>`,
                    )}
                  </div>`}
              <button className="button ghost-btn home-preview-footer-btn" onClick=${onNewsClick}>
                View all news
              </button>
            </div>
            <div className="combined-updates-col forum-highlights-col">
              <div className="combined-updates-title">Forum Highlights</div>
              ${forumLoading
                ? html`<p className="muted">Loading forum highlights...</p>`
                : forumPreview.length === 0
                ? html`<p className="muted">No forum posts yet. Be the first to post.</p>`
                : html`<div className="news-mini compact">
                    ${forumPreview.map(
                      (post) => html`<div key=${post.id} className="news-mini-row">
                        <div className="mini-row-head">
                          <div className="news-mini-title">${post.title}</div>
                          <button
                            className="button ghost-btn mini-view-btn"
                            type="button"
                            onClick=${() =>
                              navigate(
                                `/forum?section=${encodeURIComponent(
                                  String(post.section || ""),
                                )}&post=${encodeURIComponent(post.id)}`,
                              )}
                          >
                            View
                          </button>
                        </div>
                        <div className="news-mini-meta">
                          By ${post.authorName || "User"} · ${formatTimestamp(post.createdAt)}
                        </div>
                        ${previewText(post.body || post.excerpt || post.summary)
                          ? html`<div className="news-mini-preview">
                              ${previewText(post.body || post.excerpt || post.summary)}
                            </div>`
                          : html``}
                      </div>`,
                    )}
                  </div>`}
              <button className="button ghost-btn home-preview-footer-btn" type="button" onClick=${() => navigate("/forum")}>
                View forum
              </button>
            </div>
          </div>
        </div>

        <div className="card news-sidebar home-right-leaderboard">
          <div className="section-title">Leaderboard</div>
          <${SkillLeaderboardCard}
            iconSrc=${LEADERBOARD_ICON_SVG}
            onShowMore=${() => setShowLeaderboardModal(true)}
          />
        </div>
      </section>
      <${PopUp}
        show=${showLeaderboardModal}
        onClose=${() => setShowLeaderboardModal(false)}
        title="Leaderboard"
      >
        <${SkillLeaderboardCard} iconSrc=${LEADERBOARD_ICON_SVG} detailed=${true} />
      <//>
    </section>
  `;
}

function AboutUsPage() {
  return html`
    <section className="news-page fade-in">
      <div className="news-hero">
        <div>
          <div className="news-eyebrow">About Hardtale</div>
          <h1 className="news-title">Who We Are</h1>
          <p className="news-copy">
            Build philosophy, game direction, and what makes Hardtale different.
          </p>
        </div>
      </div>
      <section className="grid">
        <div className="card">
          <div className="section-title">Performance First</div>
          <p className="muted">
            A stable, optimized realm built for long sessions and real progression.
          </p>
          <p className="muted">
            Server-first architecture (Hub designed for network expansion)
            <br />
            Controlled world size & clean entity management
            <br />
            Progression systems built to scale, not inflate
            <br />
            Minimal unnecessary plugins  performance over bloat
            <br />
            Designed to support instanced content later without breaking the core world
          </p>
          <p className="muted">
            Hardtale is being built to run clean before it runs big.
          </p>
        </div>
        <div className="card">
          <div className="section-title">True to the Game</div>
          <p className="muted">
            Vanilla-first design. MMO depth without destroying the sandbox.
          </p>
          <p className="muted">
            Core survival loop remains intact
            <br />
            No overpowered donor kits or pay-to-win gear
            <br />
            RPG systems layered on top  not replacing base mechanics
            <br />
            Combat progression designed to complement Hytale, not override it
            <br />
            Scarcity and crafting still matter
          </p>
          <p className="muted">
            This is Vanilla+, not a total conversion.
          </p>
        </div>
        <div className="card">
          <div className="section-title">Who We Are</div>
          <p className="muted">
            Hardtale isnt a quick-launch cash grab. Its a long-term project.
          </p>
          <p className="muted">
            Designers focused on progression pacing and economy balance
            <br />
            Builders creating structured hubs and meaningful world spaces
            <br />
            Systems-first development before cosmetics or hype
            <br />
            MMO-inspired structure inside a survival sandbox
          </p>
          <p className="muted">
            Were building something persistent  not seasonal.
          </p>
        </div>
      </section>
    </section>
  `;
}

function NewsPage({
  news,
  loading,
  error,
  isAdmin,
  notifications,
  onNewsUpdate,
  onNotificationsUpdate,
}) {
  const location = useLocation();
  const featuredItem = news.find((item) => item.featured);
  const [showManagePanel, setShowManagePanel] = useState(false);
  const searchParams = useMemo(() => new URLSearchParams(location.search || ""), [location.search]);
  const focusNewsId = searchParams.get("newsId") || "";
  const focusCommentId = searchParams.get("commentId") || "";
  const focusReplyId = searchParams.get("replyId") || "";

  useEffect(() => {
    if (!focusNewsId) return;
    const timer = setTimeout(() => {
      const target = document.querySelector(`[data-news-id="${focusNewsId}"]`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.classList.add("notif-focus-target");
      window.setTimeout(() => target.classList.remove("notif-focus-target"), 1400);
    }, 120);
    return () => clearTimeout(timer);
  }, [focusNewsId, news.length]);

  return html`
    <section className="news-page fade-in">
      <div className="news-hero">
        <div>
          <div className="news-eyebrow">News & Updates</div>
          <h1 className="news-title">Realm Dispatch</h1>
          <p className="news-copy">
            Patch notes, events, and community highlights. Stay up to date with
            everything happening on the server.
          </p>
          ${isAdmin
            ? html`<button
                type="button"
                className="ghost-btn news-manage-btn"
                onClick=${() => setShowManagePanel(true)}
              >
                <img
                  className="news-manage-icon"
                  src="/Images/SVGs/ui/Admin_Panel.svg"
                  alt=""
                  aria-hidden="true"
                />
                <span>Manage</span>
              </button>`
            : html``}
        </div>
        <div className="news-callout">
          <div className="news-callout-label">Featured</div>
          ${featuredItem
            ? html`<div className="news-callout-title">${featuredItem.title}</div>
                <div className="news-callout-copy">${String(featuredItem.description || "").slice(0, 420)}</div>
                `
            : html`<div className="news-callout-title">No featured updates yet</div>
                <div className="news-callout-copy">Mark a post as featured to highlight it here.</div>`}
        </div>
      </div>

      <section className="card news-feed">
        <div className="section-title">Latest updates</div>
        ${loading
          ? html`<p className="muted">Loading latest news...</p>`
          : error
          ? html`<p className="muted">${error}</p>`
          : news.length === 0
          ? html`<p className="muted">No news yet. Check back soon.</p>`
          : html`<div className="news-list">
              ${news.map((item) =>
                html`<${NewsCard}
                  key=${item.id}
                  item=${item}
                  focusCommentId=${item.id === focusNewsId ? focusCommentId : ""}
                  focusReplyId=${item.id === focusNewsId ? focusReplyId : ""}
                  autoOpenComments=${item.id === focusNewsId && Boolean(focusCommentId)}
                />`,
              )}
            </div>`}
      </section>
      ${isAdmin
        ? html`<${PopUp}
            show=${showManagePanel}
            onClose=${() => setShowManagePanel(false)}
            title="Admin Panel"
            className="admin-panel-overlay"
          >
            <div className="admin-panel-modal-content">
              <${AdminPanel}
                news=${news}
                onNewsUpdate=${onNewsUpdate}
                onNotificationsUpdate=${onNotificationsUpdate}
                notifications=${notifications}
                isAdmin=${isAdmin}
              />
            </div>
          <//>`
        : html``}
    </section>
  `;
}
function VotePage() {
  return html`
    <section className="vote-page fade-in">
      <div className="vote-hero">
        <h1 className="vote-title">Vote for Hardtale</h1>
        <p className="vote-copy">
          Voting grants you vote points which can be spent in-game on rewards!
        </p>
      </div>
      <div className="vote-list">
        ${VOTE_SITES.map(
          (site) => html`<div key=${site.id} className="vote-card card">
            <div className="vote-name">${site.name}</div>
            <div className="vote-icon">
              <img src=${site.logo} alt=${site.name} loading="lazy" />
            </div>
            <a className="button primary vote-button" href=${site.url} role="button">
              Vote now
            </a>
          </div>`,
        )}
      </div>
    </section>
  `;
}

function LinkPage({ onClose = null, isLinkedAccount = false }) {
  const location = useLocation();
  const { user } = useUser();
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const LINK_BAD_QUERY_TELEMETRY_UNTIL_MS = Date.parse("2026-02-24T23:59:59Z");
  const LINK_CODE_LENGTH = 8;
  const LINK_CODE_REGEX = useMemo(
    () => new RegExp(`^[A-Z0-9]{${LINK_CODE_LENGTH}}$`),
    [LINK_CODE_LENGTH],
  );
  const LINKED_INPUT_DISPLAY = "HARDTALE";
  const EMPTY_CODE_ARRAY = useMemo(
    () => Array.from({ length: LINK_CODE_LENGTH }, () => ""),
    [LINK_CODE_LENGTH],
  );
  const inputRefs = useRef([]);
  const autoSubmittedCodeRef = useRef("");
  const badQueryTelemetryRef = useRef("");
  const linkInfoInFlightRef = useRef(false);
  const linkInfoLastRequestedCodeRef = useRef("");
  const linkInfoLastRejected4xxCodeRef = useRef("");

  function normalizeCode(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function parseStrictLinkQuery(search) {
    const rawSearch = String(search || "").replace(/^\?/, "");
    const hasAnyQuery = rawSearch.length > 0;
    const params = new URLSearchParams(rawSearch);
    const codeValues = params.getAll("code");
    const normalizedCodeFromNamedParam = normalizeCode(codeValues[0] || "");
    const rawEntries = Array.from(params.entries());
    const namedCodeValid = codeValues.length > 0 && LINK_CODE_REGEX.test(normalizedCodeFromNamedParam);
    let derivedBareCode = "";
    if (!namedCodeValid && codeValues.length === 0 && rawEntries.length === 1) {
      const [rawKey, rawValue] = rawEntries[0];
      if (String(rawValue || "") === "") {
        const normalizedBare = normalizeCode(rawKey);
        if (LINK_CODE_REGEX.test(normalizedBare)) {
          derivedBareCode = normalizedBare;
        }
      }
    }
    const normalizedCode = namedCodeValid ? normalizedCodeFromNamedParam : derivedBareCode;
    const unexpectedKeys = Array.from(
      new Set(
        Array.from(params.keys()).filter((key) => {
          if (key === "code") return false;
          if (derivedBareCode && normalizeCode(key) === derivedBareCode) return false;
          return true;
        }),
      ),
    ).slice(0, 12);
    const hasMultipleCode = codeValues.length > 1;
    const hasUnexpectedKeys = unexpectedKeys.length > 0;
    const hasCode = codeValues.length > 0 || Boolean(derivedBareCode);
    const isValidCode = hasCode && !hasMultipleCode && !hasUnexpectedKeys && LINK_CODE_REGEX.test(normalizedCode);
    const queryIssue = hasAnyQuery && !isValidCode;
    return {
      hasAnyQuery,
      hasCode,
      code: isValidCode ? normalizedCode : "",
      queryIssue,
      unexpectedKeys,
      hasMultipleCode,
      rawSearch: rawSearch.slice(0, 400),
    };
  }

  const strictQuery = useMemo(() => parseStrictLinkQuery(location.search), [location.search]);

  const [digits, setDigits] = useState(() => {
    const initialCode = strictQuery.code;
    return initialCode ? initialCode.split("") : [...EMPTY_CODE_ARRAY];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [linkingEnabled, setLinkingEnabled] = useState(true);
  const [linkMode, setLinkMode] = useState("live");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [linkedInfo, setLinkedInfo] = useState({
    linked: Boolean(isLinkedAccount),
    maskedPlayerUuid: "",
    playerName: "",
  });
  const [linkStatusInitialized, setLinkStatusInitialized] = useState(Boolean(isLinkedAccount));
  const [linkDebugInfo, setLinkDebugInfo] = useState({
    loading: false,
    error: "",
    code: "",
    status: "",
    valid: null,
    isClaimed: null,
    isExpired: null,
    expiresAt: "",
    playerUuidMasked: "",
    fetchedAt: "",
  });
  const fullCode = digits.join("");
  const isComplete = fullCode.length === LINK_CODE_LENGTH && LINK_CODE_REGEX.test(fullCode);
  const urlCode = strictQuery.code;
  const isCooldownActive = cooldownLeft > 0;
  const debugCode = linkedInfo.linked ? LINKED_INPUT_DISPLAY : isComplete ? fullCode : urlCode;
  const clerkUsername = formatUsernameForDisplay(user?.username, 80) || "unknown";
  const clerkEmail = String(user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "");
  const linkedDebugSummary = linkedInfo.linked
    ? `Linked Account | ${linkedInfo.playerName || "Unknown"} (${linkedInfo.maskedPlayerUuid || "UUID unknown"} -> ${
        linkedInfo.playerName || "PlayerDB username unavailable"
      }) to Clerk: ${clerkUsername}${clerkEmail ? ` / ${clerkEmail}` : ""}`
    : "";

  useEffect(() => {
    if (!isLinkedAccount) return;
    setLinkedInfo((prev) => ({ ...prev, linked: true }));
    setLinkStatusInitialized(true);
  }, [isLinkedAccount]);

  useEffect(() => {
    const parsedCode = strictQuery.code;
    if (!parsedCode) return;
    setDigits(parsedCode.split(""));
  }, [strictQuery.code, LINK_CODE_LENGTH]);

  useEffect(() => {
    if (!strictQuery.queryIssue) return;
    const signature = JSON.stringify({
      rawSearch: strictQuery.rawSearch,
      unexpectedKeys: strictQuery.unexpectedKeys,
      hasMultipleCode: strictQuery.hasMultipleCode,
    });
    if (badQueryTelemetryRef.current === signature) return;
    badQueryTelemetryRef.current = signature;
    console.warn("[link.strict-mode] Unexpected /link query format", {
      search: strictQuery.rawSearch,
      unexpectedKeys: strictQuery.unexpectedKeys,
      hasMultipleCode: strictQuery.hasMultipleCode,
    });
    if (Date.now() > LINK_BAD_QUERY_TELEMETRY_UNTIL_MS) return;
    fetch("/api/telemetry/link-bad-query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        path: location.pathname,
        search: strictQuery.rawSearch,
        unexpectedKeys: strictQuery.unexpectedKeys,
        hasMultipleCode: strictQuery.hasMultipleCode,
        source: "link_page_strict_mode",
      }),
    }).catch(() => {});
  }, [
    LINK_BAD_QUERY_TELEMETRY_UNTIL_MS,
    location.pathname,
    strictQuery.hasMultipleCode,
    strictQuery.queryIssue,
    strictQuery.rawSearch,
    strictQuery.unexpectedKeys,
  ]);

  useEffect(() => {
    if (!cooldownUntil) {
      setCooldownLeft(0);
      return;
    }
    function tick() {
      const remaining = Math.max(0, cooldownUntil - Date.now());
      setCooldownLeft(remaining);
    }
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil]);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!linkStatusInitialized) return;
    if (linkedInfo.linked) return;
    if (!urlCode || !LINK_CODE_REGEX.test(urlCode)) return;
    if (autoSubmittedCodeRef.current === urlCode) return;
    if (isSubmitting || isCooldownActive) return;
    autoSubmittedCodeRef.current = urlCode;
    onVerifyClick();
  }, [urlCode, isAuthLoaded, linkStatusInitialized, isSubmitting, isCooldownActive, linkedInfo.linked]);

  useEffect(() => {
    let cancelled = false;
    let abortController = null;
    let debounceTimer = null;
    if (linkedInfo.linked) {
      linkInfoLastRejected4xxCodeRef.current = "";
      linkInfoLastRequestedCodeRef.current = "";
      setLinkDebugInfo((prev) => ({
        ...prev,
        loading: false,
        error: "",
        code: LINKED_INPUT_DISPLAY,
        status: "linked",
        valid: null,
        isClaimed: null,
        isExpired: null,
        fetchedAt: new Date().toISOString(),
      }));
      return () => {
        cancelled = true;
      };
    }
    if (!debugCode || !LINK_CODE_REGEX.test(debugCode)) {
      linkInfoLastRejected4xxCodeRef.current = "";
      linkInfoLastRequestedCodeRef.current = "";
      setLinkDebugInfo((prev) => ({
        ...prev,
        loading: false,
        error: "",
        code: debugCode || "",
        status: "",
        valid: null,
        isClaimed: null,
        isExpired: null,
        expiresAt: "",
        playerUuidMasked: "",
      }));
      return () => {
        cancelled = true;
        if (debounceTimer) {
          window.clearTimeout(debounceTimer);
        }
        if (abortController) {
          linkInfoInFlightRef.current = false;
          abortController.abort();
        }
      };
    }
    if (linkInfoLastRejected4xxCodeRef.current === debugCode) {
      return () => {
        cancelled = true;
      };
    }
    if (linkInfoInFlightRef.current) {
      return () => {
        cancelled = true;
      };
    }
    if (linkInfoLastRequestedCodeRef.current === debugCode) {
      return () => {
        cancelled = true;
      };
    }
    debounceTimer = window.setTimeout(() => {
      if (cancelled || linkInfoInFlightRef.current) return;
      abortController = new AbortController();
      linkInfoInFlightRef.current = true;
      linkInfoLastRequestedCodeRef.current = debugCode;
      setLinkDebugInfo((prev) => ({
        ...prev,
        loading: true,
        error: "",
        code: debugCode,
      }));
      fetch(`/api/link/info?code=${encodeURIComponent(debugCode)}`, { signal: abortController.signal })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (cancelled) return;
          if (!response.ok) {
            if (response.status >= 400 && response.status < 500) {
              linkInfoLastRejected4xxCodeRef.current = debugCode;
            }
            setLinkDebugInfo((prev) => ({
              ...prev,
              loading: false,
              code: debugCode,
              error: String(data?.error || `HTTP ${response.status}`),
              status: String(data?.status || ""),
              valid: typeof data?.valid === "boolean" ? data.valid : null,
              isClaimed: typeof data?.isClaimed === "boolean" ? data.isClaimed : null,
              isExpired: typeof data?.isExpired === "boolean" ? data.isExpired : null,
              expiresAt: String(data?.expiresAt || ""),
              playerUuidMasked: String(data?.playerUuidMasked || ""),
              fetchedAt: new Date().toISOString(),
            }));
            return;
          }
          linkInfoLastRejected4xxCodeRef.current = "";
          setLinkDebugInfo((prev) => ({
            ...prev,
            loading: false,
            error: "",
            code: debugCode,
            status: String(data?.status || ""),
            valid: typeof data?.valid === "boolean" ? data.valid : null,
            isClaimed: typeof data?.isClaimed === "boolean" ? data.isClaimed : null,
            isExpired: typeof data?.isExpired === "boolean" ? data.isExpired : null,
            expiresAt: String(data?.expiresAt || ""),
            playerUuidMasked: String(data?.playerUuidMasked || ""),
            fetchedAt: new Date().toISOString(),
          }));
        })
        .catch((error) => {
          if (cancelled || error?.name === "AbortError") return;
          setLinkDebugInfo((prev) => ({
            ...prev,
            loading: false,
            code: debugCode,
            error: String(error?.message || "Failed to fetch link info"),
            fetchedAt: new Date().toISOString(),
          }));
        })
        .finally(() => {
          linkInfoInFlightRef.current = false;
          abortController = null;
        });
    }, 400);
    return () => {
      cancelled = true;
      if (debounceTimer) {
        window.clearTimeout(debounceTimer);
      }
      if (abortController) {
        linkInfoInFlightRef.current = false;
        abortController.abort();
      }
    };
  }, [debugCode, LINK_CODE_REGEX, linkedInfo.linked, LINKED_INPUT_DISPLAY]);

  function formatCooldown(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, "0")}`;
  }

  useEffect(() => {
    let cancelled = false;
    async function loadStatus() {
      if (!isAuthLoaded || !isSignedIn) return;
      try {
        const response = await apiFetchWithToken(getToken, true, "/api/link/status");
        const data = await response.json().catch(() => ({}));
        if (cancelled || !response.ok) return;
        setLinkingEnabled(data?.linkingEnabled !== false);
        setLinkMode(String(data?.linkMode || "").toLowerCase() === "mock" ? "mock" : "live");
        if (!data?.linked) return;
        setLinkedInfo({
          linked: true,
          maskedPlayerUuid: String(data.maskedPlayerUuid || ""),
          playerName: String(data.playerName || ""),
        });
      } catch {
        // noop
      } finally {
        if (!cancelled) {
          setLinkStatusInitialized(true);
        }
      }
    }
    loadStatus();
    return () => {
      cancelled = true;
    };
  }, [isAuthLoaded, isSignedIn, getToken]);

  function setDigitAt(index, value) {
    if (linkedInfo.linked) return;
    const next = [...digits];
    next[index] = value;
    setDigits(next);
  }

  function onInput(index, event) {
    if (linkedInfo.linked) return;
    const raw = String(event.target.value || "");
    const value = normalizeCode(raw).slice(-1);
    setDigitAt(index, value);
    if (value && index < LINK_CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      inputRefs.current[index + 1]?.select();
    }
  }

  function onKeyDown(index, event) {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      inputRefs.current[index - 1]?.focus();
      return;
    }
    if (event.key === "ArrowRight" && index < LINK_CODE_LENGTH - 1) {
      event.preventDefault();
      inputRefs.current[index + 1]?.focus();
    }
  }

  function onPaste(event) {
    if (linkedInfo.linked) return;
    const text = String(event.clipboardData?.getData("text") || "");
    const pastedDigits = normalizeCode(text).slice(0, LINK_CODE_LENGTH).split("");
    if (pastedDigits.length === 0) return;
    event.preventDefault();
    const next = Array.from({ length: LINK_CODE_LENGTH }, () => "");
    for (let i = 0; i < pastedDigits.length; i += 1) {
      next[i] = pastedDigits[i];
    }
    setDigits(next);
    const focusIndex = Math.min(pastedDigits.length - 1, LINK_CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
    inputRefs.current[focusIndex]?.select();
  }

  async function onVerifyClick() {
    function notifyLinkResult(kind, title, message) {
      emitAppToast({
        id: `link-${kind}-${Date.now()}`,
        kind,
        title,
        message,
        duration: kind === "error" ? 6500 : 5200,
      });
    }
    if (!isSignedIn) {
      setStatusType("error");
      setStatusMessage("Sign in first to link your game account.");
      notifyLinkResult("error", "Link failed", "Sign in first to link your game account.");
      if (openSignIn) openSignIn({});
      return;
    }
    if (linkedInfo.linked) {
      const message = "Your game account is already linked.";
      setStatusType("success");
      setStatusMessage(message);
      return;
    }
    if (!isComplete || isSubmitting || isCooldownActive) return;
    setIsSubmitting(true);
    setStatusType("");
    setStatusMessage("");
    try {
      let response = await apiFetchWithToken(getToken, true, "/api/link/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      if (response.status === 404) {
        response = await apiFetchWithToken(getToken, true, "/api/link/claim", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: fullCode }),
        });
      }
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401) {
          const message = "Session expired or missing. Sign in again, then retry /link.";
          setStatusType("error");
          setStatusMessage(message);
          notifyLinkResult("error", "Link failed", message);
          if (openSignIn) openSignIn({});
          return;
        }
        const errorCode = String(data?.code || "").toUpperCase();
        if (
          errorCode === "INVALID_CODE" ||
          errorCode === "EXPIRED_CODE" ||
          errorCode === "CODE_EXPIRED" ||
          errorCode === "CODE_REJECTED"
        ) {
          const message = "Invalid or expired code. Run /link in-game again for a fresh code.";
          setStatusType("error");
          setStatusMessage(message);
          notifyLinkResult("error", "Link failed", message);
          return;
        }
        if (errorCode === "ALREADY_USED" || errorCode === "ALREADY_LINKED" || errorCode === "CODE_USED") {
          const message = "This code or game account was already used for linking.";
          setStatusType("error");
          setStatusMessage(message);
          notifyLinkResult("error", "Link failed", message);
          return;
        }
        if (errorCode === "RATE_LIMITED" || errorCode === "CODE_LOCKED" || response.status === 429) {
          const retryAfterHeader = Number(response.headers?.get?.("retry-after") || 0);
          const retryAfterMs = Number.isFinite(retryAfterHeader) && retryAfterHeader > 0
            ? retryAfterHeader * 1000
            : 60_000;
          setCooldownUntil(Date.now() + retryAfterMs);
          const message = "Too many attempts. Please wait and try again.";
          setStatusType("error");
          setStatusMessage(message);
          notifyLinkResult("error", "Link failed", message);
          return;
        }
        if (errorCode === "SERVER_UNAVAILABLE" || response.status >= 500) {
          const message = "Link service is unavailable right now. Try again later.";
          setStatusType("error");
          setStatusMessage(message);
          notifyLinkResult("error", "Link failed", message);
          return;
        }
        const message = String(data?.error || "Link failed. Try again.");
        setStatusType("error");
        setStatusMessage(message);
        notifyLinkResult("error", "Link failed", message);
        return;
      }
      setLinkedInfo({
        linked: true,
        maskedPlayerUuid: String(data?.maskedPlayerUuid || ""),
        playerName: String(data?.playerName || ""),
      });
      const nextMode = String(data?.linkMode || "").toLowerCase() === "mock" ? "mock" : "live";
      setLinkMode(nextMode);
      setStatusType("success");
      const successMessage =
        nextMode === "mock"
          ? "Mock link succeeded. This is a simulated result until live server integration is enabled."
          : "Your game account is linked.";
      setStatusMessage(successMessage);
      notifyLinkResult("success", "Link complete", successMessage);
    } catch {
      const message = "Link failed. Please try again.";
      setStatusType("error");
      setStatusMessage(message);
      notifyLinkResult("error", "Link failed", message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return html`
    <section className=${`link-page fade-in ${onClose ? "link-page-modal" : ""}`.trim()}>
      <div className="card link-card">
        ${onClose
          ? html`<button className="link-modal-close" type="button" aria-label="Close link modal" onClick=${onClose}>
              X
            </button>`
          : html``}
        <div className="link-eyebrow">Account Linking</div>
        <h1 className="link-title">Link Hardtale Account</h1>
        <p className="link-copy">
          Enter your 8-character link code to connect your game account to your website profile.
        </p>
        ${strictQuery.queryIssue
          ? html`<div className="link-status link-status-error">
              This link code is invalid or expired. Run /link in-game to generate a new one.
            </div>`
          : html``}
        <div className="link-code-grid" onPaste=${onPaste}>
          ${digits.map(
            (digit, index) => html`<input
              key=${`link-digit-${index}`}
              ref=${(node) => {
                inputRefs.current[index] = node;
              }}
              className="link-code-input"
              type="text"
              inputmode="text"
              autocomplete="one-time-code"
              pattern="[A-Za-z0-9]*"
              maxLength="1"
              value=${linkedInfo.linked ? LINKED_INPUT_DISPLAY[index] || "" : digit}
              disabled=${linkedInfo.linked}
              readOnly=${linkedInfo.linked}
              aria-label=${`Link code character ${index + 1}`}
              onInput=${(event) => onInput(index, event)}
              onKeyDown=${(event) => onKeyDown(index, event)}
              onFocus=${(event) => event.target.select()}
            />`,
          )}
        </div>
        ${linkedInfo.linked
          ? html`<div className="link-status link-status-info">
              HARDTALE is the linked-account placeholder input. No code verification is required.
            </div>`
          : html``}
        <div className="link-actions">
          ${isCooldownActive
            ? html`<div className="link-status link-status-error">
                Link is temporarily locked due to rate limit. Retry in ${formatCooldown(cooldownLeft)}.
              </div>`
            : html``}
          <button
            className=${`button primary link-verify-btn ${linkedInfo.linked ? "linked-done" : ""}`.trim()}
            type="button"
            disabled=${linkedInfo.linked || !isComplete || isSubmitting || isCooldownActive}
            onClick=${onVerifyClick}
            title=${linkedInfo.linked ? "Account already linked" : isCooldownActive ? "Link currently on cooldown" : "Verify link code"}
          >
            ${isSubmitting
              ? linkMode === "mock"
                ? "Simulating..."
                : "Linking..."
              : linkedInfo.linked
              ? "Already Linked"
              : isCooldownActive
              ? "On cooldown"
              : linkMode === "mock"
              ? "Simulate Link Code"
              : "Verify Link Code"}
          </button>
          ${!linkingEnabled
            ? html`<div className="link-status link-status-info">
                Mock mode active: live game-server redeem is disabled. You can still test full /link UX flows.
              </div>`
            : html``}
          ${linkedInfo.linked
            ? html`<div className="link-status link-status-success">
                Linked account: ${linkedInfo.playerName || linkedInfo.maskedPlayerUuid || "Linked"}
              </div>`
            : html``}
          ${statusMessage
            ? html`<div className=${`link-status ${
                statusType === "error"
                  ? "link-status-error"
                  : statusType === "info"
                  ? "link-status-info"
                  : "link-status-success"
              }`}>${statusMessage}</div>`
            : html``}
          <div className="muted link-hint">Use /link in-game soon to generate this code from your UUID.</div>
          <div className="link-debug-panel">
            <div className="link-debug-title">Link Debug</div>
            <div className="link-debug-grid">
              ${linkedInfo.linked
                ? html`<div className="muted">Linked mapping</div>
                    <div className="link-status-success">${linkedDebugSummary}</div>`
                : html``}
              <div className="muted">Route query</div>
              <div>${strictQuery.rawSearch ? `?${strictQuery.rawSearch}` : "(none)"}</div>
              <div className="muted">Parsed code</div>
              <div>${strictQuery.code || "(invalid/empty)"}</div>
              <div className="muted">Current input code</div>
              <div>${debugCode || "(incomplete)"}</div>
              <div className="muted">Auth signed in</div>
              <div>${isSignedIn ? "yes" : "no"}</div>
              <div className="muted">Link mode</div>
              <div>${linkMode}</div>
              <div className="muted">Linking enabled</div>
              <div>${linkingEnabled ? "yes" : "no"}</div>
              <div className="muted">Code lookup</div>
              <div>${linkDebugInfo.loading ? "loading..." : linkDebugInfo.error ? `error: ${linkDebugInfo.error}` : "ok"}</div>
              <div className="muted">Backend status</div>
              <div>${linkDebugInfo.status || "(n/a)"}</div>
              <div className="muted">Valid</div>
              <div>${linkDebugInfo.valid === null ? "(n/a)" : linkDebugInfo.valid ? "true" : "false"}</div>
              <div className="muted">Claimed</div>
              <div>${linkDebugInfo.isClaimed === null ? "(n/a)" : linkDebugInfo.isClaimed ? "true" : "false"}</div>
              <div className="muted">Expired</div>
              <div>${linkDebugInfo.isExpired === null ? "(n/a)" : linkDebugInfo.isExpired ? "true" : "false"}</div>
              <div className="muted">UUID mask</div>
              <div>${linkDebugInfo.playerUuidMasked || "(n/a)"}</div>
              <div className="muted">Expires</div>
              <div>${linkDebugInfo.expiresAt || "(n/a)"}</div>
              <div className="muted">Fetched at</div>
              <div>${linkDebugInfo.fetchedAt || "(n/a)"}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { news, setNews, loading, error } = useNews();
  const {
    notifications,
    setNotifications,
    loading: notificationsLoading,
  } = useNotifications();
  const { theme, setTheme, toggleLightDark } = useTheme();
  const { placement, setPlacement } = useNavPlacement();
  const { menuSide, setMenuSide } = useMenuSide();
  const { mobileNavStyle, setMobileNavStyle } = useMobileNavStyle();
  const { logoSide, setLogoSide } = useLogoSide();
  const { mobileLogoStyle, setMobileLogoStyle } = useMobileLogoStyle();
  const { showMobileIsland, setShowMobileIsland } = useMobileIsland();
  const { desktopStickyStyle, setDesktopStickyStyle } = useDesktopStickyStyle();
  const { desktopStickyWide, setDesktopStickyWide } = useDesktopStickyWide();
  const { desktopStickyLogoStyle, setDesktopStickyLogoStyle } = useDesktopStickyLogoStyle();
  const { uiFlashEnabled, setUiFlashEnabled } = useUiFlash();
  const { toastShape, setToastShape } = useToastShape();
  const [active, setActive] = useState("home");
  const [hideLogo, setHideLogo] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { user } = useUser();
  const { getToken, isSignedIn, userId, isLoaded: isAuthLoaded } = useAuth();
  const { openSignIn, signOut } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationProfileOpen, setNotificationProfileOpen] = useState(false);
  const [notificationProfileUser, setNotificationProfileUser] = useState(null);
  const [notificationProfileInfoTab, setNotificationProfileInfoTab] = useState("badges");
  const [notificationProfileLoading, setNotificationProfileLoading] = useState(false);
  const [notificationProfileOwnedBadgesSaving, setNotificationProfileOwnedBadgesSaving] = useState(false);
  const [notificationProfileStaffBadgeSaving, setNotificationProfileStaffBadgeSaving] = useState(false);
  const [notificationProfileStaffBadgeIconSaving, setNotificationProfileStaffBadgeIconSaving] = useState(false);
  const [privateMessageOpen, setPrivateMessageOpen] = useState(false);
  const [privateMessageTarget, setPrivateMessageTarget] = useState(null);
  const [privateMessageThread, setPrivateMessageThread] = useState([]);
  const [privateMessageBody, setPrivateMessageBody] = useState("");
  const [privateMessageStatus, setPrivateMessageStatus] = useState("");
  const [privateMessageLoading, setPrivateMessageLoading] = useState(false);
  const [privateMessageSending, setPrivateMessageSending] = useState(false);
  const [profileTitleSaving, setProfileTitleSaving] = useState(false);
  const [drawerProfileSummary, setDrawerProfileSummary] = useState({
    rankLabel: "Unregistered",
    ownedRank: "Unregistered",
    staffRole: "",
    showAllOwnedRankBadges: true,
    selectedOwnedBadge: "",
    showStaffBadge: true,
    showStaffBadgeIcon: true,
  });
  const [showChangelog, setShowChangelog] = useState(false);
  const [showConnectHelp, setShowConnectHelp] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [toastErrorDetail, setToastErrorDetail] = useState(null);
  const [footerInView, setFooterInView] = useState(false);
  const [hoveredNav, setHoveredNav] = useState("");
  const [appHydrated, setAppHydrated] = useState(false);
  const [authTransitionLoading, setAuthTransitionLoading] = useState(false);
  const [criticalImagesReady, setCriticalImagesReady] = useState(false);
  const [loaderVariant, setLoaderVariant] = useState(LOADER_VARIANTS[0]);
  const [cart, setCart] = useState([]);
  const [cartPricing, setCartPricing] = useState(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartStatus, setCartStatus] = useState("");
  const [pendingItem, setPendingItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isLinkedAccount, setIsLinkedAccount] = useState(false);
  const [linkedPlayerUuid, setLinkedPlayerUuid] = useState("");
  const [avatarSource, setAvatarSource] = useState("clerk");
  const [customAvatarDataUrl, setCustomAvatarDataUrl] = useState("");
  const [hytaleAvatarUrl, setHytaleAvatarUrl] = useState("");
  const [avatarPanelOpen, setAvatarPanelOpen] = useState(false);
  const [avatarPanelStatus, setAvatarPanelStatus] = useState("");
  const avatarFileInputRef = useRef(null);
  const shellRef = useRef(null);
  const topbarRef = useRef(null);
  const playRef = useRef(null);
  const footerRef = useRef(null);
  const hideLogoRef = useRef(false);
  const scrollRafRef = useRef(0);
  const initialLoaderStartRef = useRef(Date.now());
  const previousSignedInRef = useRef(null);
  const toastTimersRef = useRef(new Map());
  const seenAchievementToastIdsRef = useRef(new Set());
  const liveNotificationBaselineReadyRef = useRef(false);
  const seenLiveNotificationToastIdsRef = useRef(new Set());
  const stripeFinalizeKeyRef = useRef("");
  const stripeMountRef = useRef(null);
  const stripeClientRef = useRef(null);
  const stripeElementsRef = useRef(null);
  const stripePaymentElementRef = useRef(null);
  const [stripeClientSecret, setStripeClientSecret] = useState("");
  const [stripePaymentIntentId, setStripePaymentIntentId] = useState("");
  const [stripeReady, setStripeReady] = useState(false);
  const [stripeInitializing, setStripeInitializing] = useState(false);
  const [stripeInlineError, setStripeInlineError] = useState("");
  const cartCount = useMemo(() => cart.length, [cart]);
  const cartSignature = useMemo(() => serializeCartItems(cart).join(","), [cart]);
  const sortedNews = useMemo(() => {
    const copy = [...news];
    copy.sort((a, b) => {
      const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDelta !== 0) return featuredDelta;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return copy;
  }, [news]);
  const sortedNotifications = useMemo(() => {
    const copy = [...notifications];
    copy.sort((a, b) => {
      const featuredDelta = Number(Boolean(b.featured)) - Number(Boolean(a.featured));
      if (featuredDelta !== 0) return featuredDelta;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    return copy;
  }, [notifications]);
  const stateBackgroundHref = normalizeInternalRoute(location?.state?.backgroundHref || "", "");
  const storedBackgroundHref = readLastNonLinkRoute();
  const linkBackgroundHref = stateBackgroundHref || storedBackgroundHref || "/";
  const [linkBackgroundPathname, linkBackgroundSearch] = linkBackgroundHref.split("?");
  const isLinkRoute = location.pathname === "/link" || location.pathname.startsWith("/link/");
  const routesLocation =
    isLinkRoute
      ? {
          ...location,
          pathname: normalizeInternalRoute(linkBackgroundPathname || "/", "/"),
          search: linkBackgroundSearch ? `?${linkBackgroundSearch}` : "",
        }
      : location;
  const visualPathname = routesLocation.pathname;
  const normalizedDrawerRank = String(drawerProfileSummary.rankLabel || "Unregistered");
  const normalizedDrawerOwnedRank = normalizeOwnedRankLabel(
    drawerProfileSummary.ownedRank || drawerProfileSummary.rankLabel || "Unregistered",
  );
  const drawerPrimaryOwnedBadge = resolvePrimaryOwnedBadge(
    normalizedDrawerOwnedRank,
    drawerProfileSummary.showAllOwnedRankBadges !== false,
    drawerProfileSummary.selectedOwnedBadge || "",
  );
  const drawerRankBadgeLabel =
    drawerPrimaryOwnedBadge !== "Unregistered"
      ? drawerPrimaryOwnedBadge
      : normalizedDrawerRank && !["Unregistered", "Unlinked"].includes(normalizedDrawerRank)
      ? normalizedDrawerRank
      : isLinkedAccount
      ? "Linked"
      : "Unlinked";
  const isStaffAccount =
    isStaffLabel(normalizedDrawerRank) || isStaffLabel(String(drawerProfileSummary.staffRole || ""));
  const isDonorRankAccount =
    normalizedDrawerRank === "Hero" ||
    normalizedDrawerRank === "Legend" ||
    normalizedDrawerRank === "Mythic";
  const canUploadOwnAvatar = Boolean(isStaffAccount || isDonorRankAccount);
  const canStartPrivateMessages = Boolean(
    isSignedIn &&
      (isLinkedAccount || normalizedDrawerOwnedRank !== "Unregistered" || isStaffAccount),
  );
  const resolvedOwnAvatar = useMemo(() => {
    const clerkAvatar = String(user?.imageUrl || "/assets/HardTale_H_GreyScale.png");
    if (avatarSource === "hytale" && hytaleAvatarUrl) return hytaleAvatarUrl;
    if (avatarSource === "upload" && canUploadOwnAvatar && customAvatarDataUrl) return customAvatarDataUrl;
    return clerkAvatar;
  }, [avatarSource, hytaleAvatarUrl, canUploadOwnAvatar, customAvatarDataUrl, user]);

  useEffect(() => {
    let alive = true;
    const uniqueSources = [...new Set(CRITICAL_IMAGE_SOURCES)];
    Promise.all(uniqueSources.map((src) => preloadImage(src))).then(() => {
      if (!alive) return;
      setCriticalImagesReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    let alive = true;
    async function loadRole() {
      if (!isAuthLoaded) return;
      if (!isSignedIn) {
        if (alive) {
          setIsAdmin(false);
          setIsStaff(false);
        }
        return;
      }
      try {
        const token = await getToken();
        const response = await fetch("/api/me", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!alive) return;
        if (!response.ok) {
          setIsAdmin(false);
          setIsStaff(false);
          return;
        }
        const data = await response.json();
        setIsAdmin(Boolean(data?.isAdmin));
        setIsStaff(Boolean(data?.isStaff));
      } catch {
        if (!alive) return;
        setIsAdmin(false);
        setIsStaff(false);
      }
    }
    loadRole();
    return () => {
      alive = false;
    };
  }, [isAuthLoaded, isSignedIn, userId, getToken]);

  useEffect(() => {
    function sparkle(x, y) {
      const sparkleEl = document.createElement("div");
      sparkleEl.className = "sparkle";
      sparkleEl.style.left = `${x - 3}px`;
      sparkleEl.style.top = `${y - 3}px`;
      sparkleEl.style.setProperty("--dx", `${Math.random() * 120 - 60}px`);
      sparkleEl.style.setProperty("--dy", `${Math.random() * 120 - 80}px`);
      document.body.appendChild(sparkleEl);
      setTimeout(() => sparkleEl.remove(), 950);
    }

    const lastSparkRef = { current: 0 };
    function onClick(event) {
      const now = Date.now();
      if (now - lastSparkRef.current < 900) return;
      lastSparkRef.current = now;
      for (let i = 0; i < 6; i += 1) {
        sparkle(event.clientX, event.clientY);
      }
    }

    window.addEventListener("click", onClick, { passive: true });
    return () => window.removeEventListener("click", onClick);
  }, []);


  useEffect(() => {
    const STICKY_ENTER_Y = 96;
    const STICKY_EXIT_Y = 56;

    function applyStickyState() {
      scrollRafRef.current = 0;
      const y = window.scrollY || 0;
      const nextHidden = hideLogoRef.current
        ? y > STICKY_EXIT_Y
        : y > STICKY_ENTER_Y;
      if (nextHidden !== hideLogoRef.current) {
        hideLogoRef.current = nextHidden;
        setHideLogo(nextHidden);
      }
    }

    function onScroll() {
      if (scrollRafRef.current) return;
      scrollRafRef.current = window.requestAnimationFrame(applyStickyState);
    }

    applyStickyState();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollRafRef.current) {
        window.cancelAnimationFrame(scrollRafRef.current);
        scrollRafRef.current = 0;
      }
    };
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setShowMobileNav(false);
    }
  }, [isMobile]);

  useEffect(() => {
    const target = footerRef.current;
    if (!target || typeof window === "undefined" || !("IntersectionObserver" in window)) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        setFooterInView(Boolean(entry?.isIntersecting));
      },
      { root: null, threshold: 0.18 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (appHydrated) return undefined;

    // Keep initial loader up until auth, news bootstrap, and critical images are ready.
    if (!isAuthLoaded || loading || !criticalImagesReady) {
      return undefined;
    }

    const nextVariant = LOADER_VARIANTS[Math.floor(Math.random() * LOADER_VARIANTS.length)];
    setLoaderVariant(nextVariant);
    const elapsed = Date.now() - initialLoaderStartRef.current;
    const remaining = Math.max(INITIAL_LOADER_MIN_MS - elapsed, 0);
    const timeout = setTimeout(() => setAppHydrated(true), remaining);
    return () => clearTimeout(timeout);
  }, [appHydrated, isAuthLoaded, loading, criticalImagesReady]);

  useEffect(() => {
    if (!appHydrated || !isAuthLoaded) return undefined;

    if (previousSignedInRef.current === null) {
      previousSignedInRef.current = isSignedIn;
      return undefined;
    }

    if (previousSignedInRef.current === isSignedIn) {
      return undefined;
    }

    previousSignedInRef.current = isSignedIn;
    const nextVariant = LOADER_VARIANTS[Math.floor(Math.random() * LOADER_VARIANTS.length)];
    setLoaderVariant(nextVariant);
    setAuthTransitionLoading(true);
    const timeout = setTimeout(
      () => setAuthTransitionLoading(false),
      AUTH_TRANSITION_LOADER_MS,
    );
    return () => clearTimeout(timeout);
  }, [appHydrated, isAuthLoaded, isSignedIn]);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 860px)");
    function onChange() {
      setIsMobile(media.matches);
    }
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  async function fetchHytaleAvatarUrlById(playerId) {
    const safeId = String(playerId || "").trim();
    if (!safeId) return "";
    try {
      const response = await fetch(`https://playerdb.co/api/player/hytale/${encodeURIComponent(safeId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return String(data?.avatar || data?.data?.player?.avatar || "").trim();
    } catch {
      return "";
    }
  }

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setAvatarSource("clerk");
      setCustomAvatarDataUrl("");
      setHytaleAvatarUrl("");
      return;
    }
    try {
      const raw = localStorage.getItem(`${AVATAR_PREF_KEY_PREFIX}:${userId}`);
      const parsed = raw ? JSON.parse(raw) : {};
      setAvatarSource(
        parsed?.source === "hytale" || parsed?.source === "upload" || parsed?.source === "clerk"
          ? parsed.source
          : "clerk",
      );
      setCustomAvatarDataUrl(String(parsed?.customAvatarDataUrl || ""));
      setHytaleAvatarUrl(String(parsed?.hytaleAvatarUrl || ""));
    } catch {
      setAvatarSource("clerk");
      setCustomAvatarDataUrl("");
      setHytaleAvatarUrl("");
    }
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    try {
      localStorage.setItem(
        `${AVATAR_PREF_KEY_PREFIX}:${userId}`,
        JSON.stringify({
          source: avatarSource,
          customAvatarDataUrl,
          hytaleAvatarUrl,
        }),
      );
    } catch {}
  }, [isSignedIn, userId, avatarSource, customAvatarDataUrl, hytaleAvatarUrl]);

  useEffect(() => {
    let alive = true;
    async function loadLinkedState() {
      if (!isAuthLoaded || !isSignedIn) {
        if (!alive) return;
        setIsLinkedAccount(false);
        setLinkedPlayerUuid("");
        return;
      }
      const onStoreRanksRoute = location.pathname === "/store/ranks";
      const onLinkRoute = location.pathname === "/link";
      if (isLinkedAccount && !onStoreRanksRoute && !onLinkRoute) {
        return;
      }
      try {
        const response = await apiFetchWithToken(getToken, true, "/api/link/status");
        const data = await response.json().catch(() => ({}));
        if (!alive || !response.ok) return;
        setIsLinkedAccount(Boolean(data?.linked));
        setLinkedPlayerUuid(String(data?.playerUuid || "").trim());
      } catch {
        if (!alive) return;
        setIsLinkedAccount(false);
        setLinkedPlayerUuid("");
      }
    }
    loadLinkedState();
    return () => {
      alive = false;
    };
  }, [isAuthLoaded, isSignedIn, userId, location.pathname, getToken, isLinkedAccount]);

  useEffect(() => {
    let alive = true;
    if (!isSignedIn || !linkedPlayerUuid || avatarSource !== "hytale" || hytaleAvatarUrl) return undefined;
    (async () => {
      const nextAvatar = await fetchHytaleAvatarUrlById(linkedPlayerUuid);
      if (!alive || !nextAvatar) return;
      setHytaleAvatarUrl(nextAvatar);
    })();
    return () => {
      alive = false;
    };
  }, [isSignedIn, linkedPlayerUuid, avatarSource, hytaleAvatarUrl]);

  useEffect(() => {
    let alive = true;
    async function loadDrawerProfileSummary() {
      if (!isSignedIn) {
        if (alive) {
          setDrawerProfileSummary({
            rankLabel: "Unregistered",
            ownedRank: "Unregistered",
            staffRole: "",
            showAllOwnedRankBadges: true,
            selectedOwnedBadge: "",
            showStaffBadge: true,
            showStaffBadgeIcon: true,
          });
        }
        return;
      }
      const metadataRank = String(
        user?.publicMetadata?.selectedTitle ||
          user?.publicMetadata?.rankLabel ||
          user?.unsafeMetadata?.selectedTitle ||
          "Unregistered",
      );
      const metadataOwnedRank = normalizeOwnedRankLabel(
        user?.publicMetadata?.ownedRank ||
          user?.unsafeMetadata?.ownedRank ||
          metadataRank,
      );
      const metadataStaffRole = String(
        user?.publicMetadata?.staffRole ||
          user?.unsafeMetadata?.staffRole ||
          "",
      );
      const metadataShowAllOwnedRankBadges = user?.publicMetadata?.showAllOwnedRankBadges !== false;
      const metadataSelectedOwnedBadge = normalizeOwnedRankLabel(
        user?.publicMetadata?.selectedOwnedBadge || user?.unsafeMetadata?.selectedOwnedBadge || "",
      );
      const metadataShowStaffBadge = user?.publicMetadata?.showStaffBadge !== false;
      const metadataShowStaffBadgeIcon = user?.publicMetadata?.showStaffBadgeIcon !== false;
      try {
        const response = await apiFetchWithToken(getToken, true, "/api/profile/settings");
        const data = response.ok ? await response.json().catch(() => ({})) : {};
        if (!alive) return;
        const selectedTitle = String(data?.selectedTitle || metadataRank || "Unregistered");
        const ownedRank = normalizeOwnedRankLabel(data?.ownedRank || metadataOwnedRank || selectedTitle);
        const staffRole = String(data?.staffRole || metadataStaffRole || "");
        const showAllOwnedRankBadges = data?.showAllOwnedRankBadges !== false;
        const selectedOwnedBadge = normalizeOwnedRankLabel(
          data?.selectedOwnedBadge || metadataSelectedOwnedBadge || "",
        );
        const showStaffBadge = data?.showStaffBadge !== false;
        const showStaffBadgeIcon = data?.showStaffBadgeIcon !== false;
        setDrawerProfileSummary({
          rankLabel: selectedTitle,
          ownedRank,
          staffRole,
          showAllOwnedRankBadges,
          selectedOwnedBadge,
          showStaffBadge,
          showStaffBadgeIcon,
        });
      } catch {
        if (!alive) return;
        setDrawerProfileSummary({
          rankLabel: metadataRank || "Unregistered",
          ownedRank: metadataOwnedRank || "Unregistered",
          staffRole: metadataStaffRole,
          showAllOwnedRankBadges: metadataShowAllOwnedRankBadges,
          selectedOwnedBadge: metadataSelectedOwnedBadge,
          showStaffBadge: metadataShowStaffBadge,
          showStaffBadgeIcon: metadataShowStaffBadgeIcon,
        });
      }
    }
    loadDrawerProfileSummary();
    return () => {
      alive = false;
    };
  }, [isSignedIn, user, getToken]);

  useEffect(() => {
    if (!isAuthLoaded || !isSignedIn || !userId || notificationsLoading) return;
    if (isLinkedAccount) {
      setNotifications((prev) => prev.filter((item) => !isLocalLinkReminderId(item?.id)));
      return;
    }
    const today = getLocalDateStamp();
    const lastShown = readLinkReminderStamp(userId);
    if (lastShown !== today) {
      writeLinkReminderStamp(userId, today);
    }
    const reminder = buildDailyLinkReminderNotification(userId);
    setNotifications((prev) => {
      const hasTodayReminder = prev.some((item) => String(item?.id || "") === reminder.id);
      if (hasTodayReminder) return prev;
      return [reminder, ...prev];
    });
  }, [
    isAuthLoaded,
    isSignedIn,
    userId,
    isLinkedAccount,
    notificationsLoading,
    setNotifications,
  ]);

  useEffect(() => {
    if (isLinkRoute) return;
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname, isLinkRoute]);

  useEffect(() => {
    if (visualPathname === "/" || visualPathname === "/home") {
      setActive("home");
    } else if (visualPathname === "/store" || visualPathname.startsWith("/store/")) {
      setActive("store");
    } else if (visualPathname === "/news") {
      setActive("news");
    } else if (visualPathname === "/vote") {
      setActive("vote");
    } else if (visualPathname === "/forum") {
      setActive("forum");
    } else if (visualPathname === "/support") {
      setActive("support");
    } else if (visualPathname === "/subscriptions") {
      setActive("subscriptions");
    } else if (isLinkRoute) {
      setActive("link");
    }
  }, [visualPathname, location.pathname, isLinkRoute]);

  useEffect(() => {
    if (isLinkRoute) return;
    setShowMobileNav(false);
  }, [location.pathname, isLinkRoute]);

  useEffect(() => {
    if (isLinkRoute) return;
    writeLastNonLinkRoute(`${location.pathname}${location.search || ""}`);
  }, [location.pathname, location.search, isLinkRoute]);

  useEffect(() => {
    if (!(location.pathname === "/store" || location.pathname === "/store/ranks")) return;
    const params = new URLSearchParams(location.search || "");
    const stripeState = String(params.get("stripe") || "").trim().toLowerCase();
    const sessionId = String(params.get("session_id") || "").trim();
    if (!stripeState) return;

    if (stripeState === "cancel") {
      pushToast({
        id: `stripe-cancel-${Date.now()}`,
        kind: "warning",
        title: "Checkout canceled",
        message: "Your Stripe checkout was canceled. Your cart is still saved.",
        duration: 4500,
      });
      navigate("/store/ranks", { replace: true });
      return;
    }

    if (stripeState !== "success" || !sessionId || !isSignedIn || !userId) return;
    const sessionKey = `${userId}:${sessionId}`;
    if (stripeFinalizeKeyRef.current === sessionKey) return;
    stripeFinalizeKeyRef.current = sessionKey;

    setCartStatus("Finalizing Stripe payment...");
    (async () => {
      try {
        const response = await apiFetchWithToken(getToken, true, "/api/payments/stripe/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(data?.error || "Failed to finalize Stripe checkout."));
        }
        setCart(buildCartFromIds(data?.cart?.items || []));
        setCartPricing(data?.pricing || null);
        const awardedRank = String(data?.awardedRank || "").trim();
        pushToast({
          id: `stripe-success-${sessionId}`,
          kind: "success",
          title: "Checkout complete",
          message: awardedRank
            ? `Stripe payment confirmed. Rank awarded: ${awardedRank}.`
            : "Stripe payment confirmed successfully.",
          duration: 7000,
        });
        setCartStatus("");
        setShowCart(false);
        navigate("/store/ranks", { replace: true });
      } catch (error) {
        setCartStatus("Stripe payment finalize failed.");
        pushToast({
          id: `stripe-error-${sessionId}`,
          kind: "error",
          title: "Stripe finalize failed",
          message: String(error?.message || "Please contact support if you were charged."),
          duration: 9000,
        });
        navigate("/store/ranks", { replace: true });
      }
    })();
  }, [location.pathname, location.search, isSignedIn, userId, getToken, navigate]);

  useEffect(() => {
    if (showCart) return;
    setStripeReady(false);
    setStripeInlineError("");
    setStripeClientSecret("");
    setStripePaymentIntentId("");
    if (stripePaymentElementRef.current) {
      try {
        stripePaymentElementRef.current.unmount();
      } catch {}
      stripePaymentElementRef.current = null;
    }
    stripeElementsRef.current = null;
  }, [showCart]);

  useEffect(() => {
    if (!showCart || !isSignedIn || !userId || cart.length === 0) return;
    if (!STRIPE_PUBLISHABLE_KEY) return;
    if (typeof window === "undefined" || typeof window.Stripe !== "function") {
      setStripeInlineError("Stripe payment UI failed to load. Please refresh and try again.");
      return;
    }
    let cancelled = false;
    setStripeInitializing(true);
    setStripeReady(false);
    setStripeInlineError("");
    setStripeClientSecret("");
    setStripePaymentIntentId("");
    (async () => {
      try {
        const response = await apiFetchWithToken(getToken, true, "/api/payments/stripe/create-payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
          throw new Error(String(data?.error || "Unable to start secure payment."));
        }
        if (cancelled) return;
        if (data?.pricing) setCartPricing(data.pricing);
        setStripeClientSecret(String(data?.clientSecret || ""));
        setStripePaymentIntentId(String(data?.paymentIntentId || ""));
      } catch (error) {
        if (cancelled) return;
        setStripeInlineError(String(error?.message || "Unable to start secure payment."));
      } finally {
        if (!cancelled) setStripeInitializing(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showCart, isSignedIn, userId, cartSignature, cart.length, getToken]);

  useEffect(() => {
    if (!showCart || !stripeClientSecret || !stripeMountRef.current) return;
    if (!STRIPE_PUBLISHABLE_KEY) return;
    if (typeof window === "undefined" || typeof window.Stripe !== "function") return;

    if (!stripeClientRef.current) {
      stripeClientRef.current = window.Stripe(STRIPE_PUBLISHABLE_KEY);
    }
    if (!stripeClientRef.current) return;

    if (stripePaymentElementRef.current) {
      try {
        stripePaymentElementRef.current.unmount();
      } catch {}
      stripePaymentElementRef.current = null;
    }

    const appearance = {
      theme: theme === "light" ? "stripe" : "night",
      variables: {
        colorPrimary: "#2aa3ff",
      },
    };
    const elements = stripeClientRef.current.elements({
      clientSecret: stripeClientSecret,
      appearance,
    });
    const paymentElement = elements.create("payment", {
      layout: { type: "tabs", defaultCollapsed: false },
    });
    paymentElement.mount(stripeMountRef.current);
    stripeElementsRef.current = elements;
    stripePaymentElementRef.current = paymentElement;
    setStripeReady(true);

    return () => {
      if (stripePaymentElementRef.current) {
        try {
          stripePaymentElementRef.current.unmount();
        } catch {}
        stripePaymentElementRef.current = null;
      }
      stripeElementsRef.current = null;
      setStripeReady(false);
    };
  }, [showCart, stripeClientSecret, theme]);

  useEffect(() => {
    if (notificationsLoading) return;
    if (!isSignedIn || !userId) {
      setUnread(0);
      return;
    }
    const count = sortedNotifications.filter((item) => item?.readByMe !== true).length;
    setUnread(count);
  }, [sortedNotifications, notificationsLoading, isSignedIn, userId]);

  useEffect(() => {
    let alive = true;
    let inFlight = false;

    async function refreshLiveFeeds() {
      if (!alive || inFlight) return;
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      inFlight = true;
      try {
        const [newsResult, notificationsResult] = await Promise.all([
          fetch("/api/news")
            .then((res) => res.json())
            .catch(() => ({ news: [] })),
          apiFetchWithToken(getToken, true, "/api/notifications")
            .then((res) => (res.ok ? res.json() : { notifications: [] }))
            .catch(() => ({ notifications: [] })),
        ]);
        if (!alive) return;
        setNews(Array.isArray(newsResult?.news) ? newsResult.news : []);
        setNotifications(
          Array.isArray(notificationsResult?.notifications)
            ? notificationsResult.notifications
            : [],
        );
      } finally {
        inFlight = false;
      }
    }

    const interval = setInterval(refreshLiveFeeds, 30000);
    const onVisibilityChange = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        refreshLiveFeeds();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", onVisibilityChange);
    }
    return () => {
      alive = false;
      clearInterval(interval);
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibilityChange);
      }
    };
  }, [setNews, setNotifications, getToken]);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!isSignedIn || !userId) {
      setCart([]);
      setCartPricing(null);
      setCartLoaded(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const response = await apiFetchWithToken(getToken, true, "/api/cart");
        if (!response.ok) {
          if (!cancelled) {
            setCart([]);
            setCartPricing(null);
            setCartLoaded(true);
          }
          return;
        }
        const data = await response.json();
        if (!cancelled) {
          setCart(buildCartFromIds(data?.items || []));
          setCartPricing(data?.pricing || null);
          setCartLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setCart([]);
          setCartPricing(null);
          setCartLoaded(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthLoaded, isSignedIn, userId, getToken]);

  useEffect(() => {
    if (!isAuthLoaded) return;
    let cancelled = false;
    (async () => {
      try {
        const response = await apiFetchWithToken(getToken, true, "/api/notifications");
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;
        setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
      } catch {
        // keep existing notifications if refresh fails
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthLoaded, isSignedIn, userId, getToken, setNotifications]);

  useEffect(() => {
    if (!isSignedIn || !userId || !cartLoaded || !isLinkedAccount) return;
    apiFetchWithToken(getToken, true, "/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: serializeCartItems(cart) }),
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (data?.pricing) setCartPricing(data.pricing);
      })
      .catch(() => {});
  }, [cart, isSignedIn, userId, cartLoaded, isLinkedAccount, getToken]);

  useEffect(() => {
    if (!pendingItem) return;
    if (!isSignedIn) return;
    if (!cartLoaded) return;
    if (!isLinkedAccount) {
      setPendingItem(null);
      return;
    }
    setCart((prev) => applyRankTierRules(prev, pendingItem));
    setPendingItem(null);
    setShowCart(true);
  }, [pendingItem, isSignedIn, cartLoaded, isLinkedAccount]);

  async function markNotificationsRead() {
    if (!isSignedIn || !userId) {
      setUnread(0);
      return;
    }
    const unreadIds = sortedNotifications
      .filter((item) => item?.readByMe !== true)
      .map((item) => String(item?.id || "").trim())
      .filter(Boolean);
    const localUnreadIds = unreadIds.filter((id) => isLocalLinkReminderId(id));
    const serverUnreadIds = unreadIds.filter((id) => !isLocalLinkReminderId(id));
    if (localUnreadIds.length > 0) {
      writeLinkReminderReadStamp(userId, getLocalDateStamp());
    }
    if (unreadIds.length === 0) {
      setUnread(0);
      return;
    }
    if (serverUnreadIds.length === 0) {
      setNotifications((prev) =>
        prev.map((item) =>
          unreadIds.includes(String(item?.id || "")) ? { ...item, readByMe: true } : item,
        ),
      );
      setUnread(0);
      return;
    }
    try {
      await apiFetchWithToken(getToken, true, "/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: serverUnreadIds }),
      });
      setNotifications((prev) =>
        prev.map((item) =>
          unreadIds.includes(String(item?.id || "")) ? { ...item, readByMe: true } : item,
        ),
      );
      setUnread(0);
    } catch {
      // Keep current unread state if mark-read fails.
    }
  }

  function handleLogoError(event) {
    event.currentTarget.style.display = "none";
  }

  function openHowModal() {
    setShowConnectHelp(true);
  }

  function scrollToSection(section) {
    if (section === "play" && playRef.current) {
      playRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      setActive("play");
    }
  }

  function openLinkModal() {
    const backgroundHref = `${location.pathname}${location.search || ""}`;
    navigate("/link", { state: { backgroundHref }, replace: false });
  }

  function closeLinkModal() {
    navigate(linkBackgroundHref || "/", { replace: true });
  }

  function addToCart(item) {
    if (!isSignedIn) {
      setPendingItem(item);
      if (openSignIn) openSignIn({});
      return;
    }
    if (!isLinkedAccount) {
      setCartStatus("Link your game account on /link before using the store.");
      openLinkModal();
      return;
    }
    setCartStatus("");
    setCart((prev) => applyRankTierRules(prev, item));
    setShowCart(true);
  }


  function total() {
    if (cartPricing && Number.isFinite(Number(cartPricing.total))) {
      return Number(cartPricing.total);
    }
    return cart.reduce((sum, item) => sum + item.price, 0);
  }

  function subtotal() {
    if (cartPricing && Number.isFinite(Number(cartPricing.subtotal))) {
      return Number(cartPricing.subtotal);
    }
    return cart.reduce((sum, item) => sum + item.price, 0);
  }

  function upgradeDiscountTotal() {
    if (cartPricing && Number.isFinite(Number(cartPricing.discount))) {
      return Number(cartPricing.discount);
    }
    return 0;
  }

  function getCartLinePricing(itemId) {
    const lines = Array.isArray(cartPricing?.lines) ? cartPricing.lines : [];
    return lines.find((line) => String(line?.id || "") === String(itemId || "")) || null;
  }

  function openNotifications() {
    setShowNotifications(true);
    markNotificationsRead();
  }

  function viewNotification(item) {
    const url = String(item?.readMoreUrl || "").trim();
    if (!url) return;
    setShowNotifications(false);
    navigate(url);
  }

  function sanitizeToastText(input, fallback = "An unexpected error occurred.") {
    const source = String(input || "").trim();
    if (!source) return fallback;
    const redacted = source
      .replace(/(authorization\s*:\s*bearer\s+)[^\s]+/gi, "$1[REDACTED]")
      .replace(/\b(sk|pk|rk|api|token|secret|key)[-_]?[a-z0-9]{8,}\b/gi, "[REDACTED]")
      .replace(/\b(password|pass|secret|token|api[_-]?key)\s*[=:]\s*([^\s,;]+)/gi, "$1=[REDACTED]")
      .replace(/\bhttps?:\/\/[^\s]+/gi, "[REDACTED_URL]")
      .replace(/[A-Za-z]:\\[^\s]+/g, "[REDACTED_PATH]")
      .replace(/\/(?:[\w.-]+\/)+[\w.-]*/g, "[REDACTED_PATH]");
    const safeLines = redacted
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .filter(
        (line) =>
          !/^at\s.+\(.+\)$/.test(line) &&
          !/mongodb|postgres|mysql|sqlite|redis|stack trace|exception/i.test(line),
      );
    const compact = safeLines.join("\n").trim();
    if (!compact) return fallback;
    return compact.slice(0, 500);
  }

  function dismissToast(id) {
    const key = String(id || "").trim();
    if (!key) return;
    const timer = toastTimersRef.current.get(key);
    if (timer) {
      clearTimeout(timer);
      toastTimersRef.current.delete(key);
    }
    setToasts((prev) => prev.filter((entry) => entry.id !== key));
  }

  function pushToast(payload) {
    const input = payload || {};
    const safeMessage = sanitizeToastText(
      input.message || input.body,
      input.kind === "error" ? "Request failed. Please try again." : "",
    );
    const safeFullMessage = sanitizeToastText(
      input.fullMessage || safeMessage,
      input.kind === "error" ? "Request failed. Please try again." : safeMessage,
    );
    const toast = createToastPayload({
      ...input,
      message: safeMessage,
      fullMessage: safeFullMessage,
    });
    setToasts((prev) => {
      const filtered = prev.filter((entry) => entry.id !== toast.id);
      return [...filtered.slice(-4), toast];
    });
    const existing = toastTimersRef.current.get(toast.id);
    if (existing) clearTimeout(existing);
    const timer = window.setTimeout(() => dismissToast(toast.id), toast.duration);
    toastTimersRef.current.set(toast.id, timer);
    return toast.id;
  }

  function openToastDetails(toast) {
    if (!toast || toast.kind !== "error") return;
    setToastErrorDetail({
      title: sanitizeToastText(toast.title || "System Error", "System Error"),
      message: sanitizeToastText(
        toast.fullMessage || toast.message,
        "Request failed. Please try again.",
      ),
      createdAt: toast.createdAt || new Date().toISOString(),
    });
  }

  async function copyNotificationProfileMetaValue(label, value) {
    const raw = String(value || "").trim();
    if (!raw || raw.toLowerCase() === "n/a") return;
    try {
      await navigator.clipboard.writeText(raw);
      pushToast({
        kind: "success",
        title: "Copied",
        message: `${label} copied to clipboard.`,
        duration: 2600,
      });
    } catch {
      pushToast({
        kind: "warning",
        title: "Copy failed",
        message: `Couldn't copy ${label}.`,
        duration: 3200,
      });
    }
  }

  async function loadPrivateMessageThread(targetUserId) {
    const safeTargetId = String(targetUserId || "").trim();
    if (!safeTargetId || !isSignedIn) {
      setPrivateMessageThread([]);
      return;
    }
    setPrivateMessageLoading(true);
    try {
      const response = await apiFetchWithToken(
        getToken,
        true,
        `/api/private-messages/thread/${encodeURIComponent(safeTargetId)}`,
      );
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      setPrivateMessageThread(Array.isArray(data?.messages) ? data.messages : []);
      setPrivateMessageStatus("");
    } catch {
      setPrivateMessageThread([]);
      setPrivateMessageStatus("Failed to load private messages.");
    } finally {
      setPrivateMessageLoading(false);
    }
  }

  function openPrivateMessageModal(targetUser) {
    const targetId = String(targetUser?.authorUserId || targetUser?.userId || "").trim();
    if (!targetId) return;
    if (!canStartPrivateMessages) {
      pushToast({
        kind: "warning",
        title: "Private Message Locked",
        message: "Link your account (or hold a rank) to use private messages.",
      });
      return;
    }
    setPrivateMessageTarget({
      userId: targetId,
      name: String(targetUser?.name || targetUser?.authorName || "User"),
      username: formatUsernameForDisplay(targetUser?.username || targetUser?.authorUsername || ""),
      image: String(targetUser?.image || targetUser?.authorImage || "/assets/HardTale_H_GreyScale.png"),
    });
    setPrivateMessageBody("");
    setPrivateMessageStatus("");
    setPrivateMessageThread([]);
    setPrivateMessageOpen(true);
    loadPrivateMessageThread(targetId);
  }

  async function sendPrivateMessage() {
    if (!privateMessageTarget?.userId || !privateMessageBody.trim() || privateMessageSending) return;
    setPrivateMessageSending(true);
    setPrivateMessageStatus("Sending...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/private-messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUserId: privateMessageTarget.userId,
          body: privateMessageBody.trim(),
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(String(data?.error || "Failed to send private message."));
      }
      setPrivateMessageBody("");
      setPrivateMessageStatus("Message sent.");
      await loadPrivateMessageThread(privateMessageTarget.userId);
    } catch (error) {
      setPrivateMessageStatus(String(error?.message || "Failed to send private message."));
    } finally {
      setPrivateMessageSending(false);
    }
  }

  useEffect(() => {
    function onToast(event) {
      const detail = event?.detail || {};
      pushToast(detail);
    }
    window.addEventListener(APP_TOAST_EVENT, onToast);
    return () => window.removeEventListener(APP_TOAST_EVENT, onToast);
  }, []);

  useEffect(() => {
    liveNotificationBaselineReadyRef.current = false;
    seenLiveNotificationToastIdsRef.current.clear();
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (notificationsLoading) return;
    if (!isSignedIn || !userId) return;
    const rows = Array.isArray(sortedNotifications) ? sortedNotifications : [];
    if (!liveNotificationBaselineReadyRef.current) {
      rows.forEach((item) => {
        const id = String(item?.id || "").trim();
        if (id) seenLiveNotificationToastIdsRef.current.add(id);
      });
      liveNotificationBaselineReadyRef.current = true;
      return;
    }
    const incoming = [];
    rows.forEach((item) => {
      const id = String(item?.id || "").trim();
      if (!id || seenLiveNotificationToastIdsRef.current.has(id)) return;
      seenLiveNotificationToastIdsRef.current.add(id);
      if (item?.readByMe === true) return;
      if (isLocalLinkReminderId(id)) return;
      const haystack = `${item?.title || ""} ${item?.message || ""}`.toLowerCase();
      if (/(achievement|badge unlocked|title unlocked|unlocked achievement)/i.test(haystack)) return;
      incoming.push(item);
    });
    if (incoming.length === 0) return;
    incoming
      .slice()
      .reverse()
      .slice(0, 4)
      .forEach((item) => {
        pushToast({
          id: `notif-live-${String(item?.id || "").trim()}`,
          kind: "warning",
          title: String(item?.title || "New Notification"),
          message: String(item?.message || "").trim(),
          icon: NOTIFICATIONS_ICON_SVG,
          duration: 6400,
        });
      });
  }, [sortedNotifications, notificationsLoading, isSignedIn, userId]);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    const storageKey = `${ACHIEVEMENT_TOAST_SEEN_PREFIX}:${userId}`;
    let persistedSeen = new Set();
    try {
      const parsed = JSON.parse(localStorage.getItem(storageKey) || "[]");
      if (Array.isArray(parsed)) {
        persistedSeen = new Set(parsed.map((entry) => String(entry || "").trim()).filter(Boolean));
      }
    } catch {}
    let changed = false;
    sortedNotifications.forEach((item) => {
      const id = String(item?.id || "").trim();
      if (!id || seenAchievementToastIdsRef.current.has(id) || persistedSeen.has(id)) return;
      if (item?.readByMe === true) return;
      seenAchievementToastIdsRef.current.add(id);
      const haystack = `${item?.title || ""} ${item?.message || ""}`.toLowerCase();
      if (!/(achievement|badge unlocked|title unlocked|unlocked achievement)/i.test(haystack)) return;
      persistedSeen.add(id);
      changed = true;
      pushToast({
        id: `achv-${id}`,
        kind: "success",
        title: String(item?.title || "Achievement unlocked"),
        message: String(item?.message || "").trim(),
        icon: ACHIEVEMENT_STAR_ICON_SVG,
        duration: 7000,
      });
    });
    if (changed) {
      try {
        const compact = Array.from(persistedSeen).slice(-300);
        localStorage.setItem(storageKey, JSON.stringify(compact));
      } catch {}
    }
  }, [sortedNotifications, isSignedIn, userId]);

  useEffect(
    () => () => {
      toastTimersRef.current.forEach((timer) => clearTimeout(timer));
      toastTimersRef.current.clear();
    },
    [],
  );

  async function loadLayoutProfileLinkStatus(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return { linked: false, playerName: "N/A", playerUuid: "N/A" };
    try {
      const response = await fetch(`/api/profile/link-status/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return {
        linked: Boolean(data?.linked),
        playerName: String(data?.playerName || "").trim() || "N/A",
        playerUuid: String(data?.playerUuid || "").trim() || "N/A",
      };
    } catch {
      return { linked: false, playerName: "N/A", playerUuid: "N/A" };
    }
  }

  async function loadLayoutProfileAchievements(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return [];
    try {
      const response = await fetch(`/api/profile/achievements/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return Array.isArray(data?.achievements) ? data.achievements : [];
    } catch {
      return [];
    }
  }

  async function loadLayoutProfileGroups(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return [];
    try {
      const response = await fetch(`/api/profile/groups/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return Array.isArray(data?.groups) ? data.groups : [];
    } catch {
      return [];
    }
  }

  async function loadLayoutProfileForumActivity(targetUserId) {
    const safeUserId = String(targetUserId || "").trim();
    if (!safeUserId) return null;
    try {
      const response = await fetch(`/api/profile/forum-activity/${encodeURIComponent(safeUserId)}`);
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return data?.activity && typeof data.activity === "object" ? data.activity : null;
    } catch {
      return null;
    }
  }

  async function loadOwnProfileTitleSettings() {
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/title");
      if (!response.ok) throw new Error("Failed");
      const data = await response.json().catch(() => ({}));
      return {
        staffRole: String(data?.staffRole || ""),
        canPreviewStaffRole: Boolean(data?.canPreviewStaffRole),
        staffRolePreview: String(data?.staffRolePreview || ""),
        staffRolePreviewOptions: Array.isArray(data?.staffRolePreviewOptions)
          ? data.staffRolePreviewOptions
          : [],
        ownedRank: normalizeOwnedRankLabel(data?.ownedRank || "Unregistered"),
        canToggleOwnedBadges: Boolean(data?.canToggleOwnedBadges),
        showAllOwnedRankBadges: data?.showAllOwnedRankBadges !== false,
        selectedOwnedBadge: normalizeOwnedRankLabel(data?.selectedOwnedBadge || ""),
        ownedBadgeOptions: Array.isArray(data?.ownedBadgeOptions) ? data.ownedBadgeOptions : [],
        canToggleStaffBadge: Boolean(data?.canToggleStaffBadge),
        showStaffBadge: data?.showStaffBadge !== false,
        showStaffBadgeIcon: data?.showStaffBadgeIcon !== false,
      };
    } catch {
      return null;
    }
  }

  async function openNotificationProfile(item) {
    if (!item) return;
    setNotificationProfileOpen(true);
    setNotificationProfileUser(null);
    setNotificationProfileLoading(true);
    try {
    const name = String(item.authorName || item.author || "User");
    const username = formatUsernameForDisplay(item.authorUsername);
    const rankLabel = String(item.authorRank || "Unregistered");
    const staff =
      Boolean(item?.authorIsStaff) ||
      isStaffLabel(item?.authorStaffRole || "") ||
      isStaffLabel(name) ||
      isStaffLabel(username) ||
      isStaffLabel(rankLabel);
    const authorUserId = String(item.authorUserId || "").trim();
    const isOwn = Boolean(isSignedIn && userId && authorUserId && String(userId) === authorUserId);
    let canPreviewStaffRole = false;
    let staffRolePreview = "";
    let staffRolePreviewOptions = [];
    let ownedRank = normalizeOwnedRankLabel(item.authorOwnedRank || rankLabel);
    let canToggleOwnedBadges = false;
    let showAllOwnedRankBadges = true;
    let selectedOwnedBadge = "";
    let ownedBadgeOptions = buildOwnedRankBadges(ownedRank, false, { showAllOwnedRankBadges: true });
    let canToggleStaffBadge = false;
    let showStaffBadge = item?.authorShowStaffBadge !== false;
    let showStaffBadgeIcon = item?.authorShowStaffBadgeIcon !== false;
    let staffRole = String(item?.authorStaffRole || "");
    if (isOwn && isSignedIn) {
      const settings = await loadOwnProfileTitleSettings();
      if (settings) {
        staffRole = String(settings.staffRole || staffRole);
        canPreviewStaffRole = Boolean(settings.canPreviewStaffRole);
        staffRolePreview = String(settings.staffRolePreview || "");
        staffRolePreviewOptions = Array.isArray(settings.staffRolePreviewOptions)
          ? settings.staffRolePreviewOptions
          : [];
        ownedRank = normalizeOwnedRankLabel(settings.ownedRank || ownedRank);
        canToggleOwnedBadges = Boolean(settings.canToggleOwnedBadges);
        showAllOwnedRankBadges = settings.showAllOwnedRankBadges !== false;
        selectedOwnedBadge = normalizeOwnedRankLabel(settings.selectedOwnedBadge || "");
        ownedBadgeOptions = Array.isArray(settings.ownedBadgeOptions)
          ? settings.ownedBadgeOptions.filter((rank) => OWNED_RANK_ORDER.includes(String(rank)))
          : ownedBadgeOptions;
        canToggleStaffBadge = Boolean(settings.canToggleStaffBadge);
        showStaffBadge = settings.showStaffBadge !== false;
        showStaffBadgeIcon = settings.showStaffBadgeIcon !== false;
      }
    }
    const [linkStatus, achievements, groups, forumActivity] = await Promise.all([
      loadLayoutProfileLinkStatus(authorUserId),
      loadLayoutProfileAchievements(authorUserId),
      loadLayoutProfileGroups(authorUserId),
      loadLayoutProfileForumActivity(authorUserId),
    ]);
    setNotificationProfileInfoTab("badges");
    setNotificationProfileUser({
      name,
      username,
      image: isOwn
        ? resolvedOwnAvatar
        : String(item.authorImage || "/assets/HardTale_H_GreyScale.png"),
      rankLabel,
      ownedRank,
      canToggleOwnedBadges,
      showAllOwnedRankBadges,
      selectedOwnedBadge,
      ownedBadgeOptions,
      staff,
      staffRole,
      isStaffUser: staff,
      canToggleStaffBadge,
      showStaffBadge,
      showStaffBadgeIcon,
      showStaffGradient: item?.authorShowStaffGradient !== false,
      useRankFont: item?.authorUseRankFont === true,
      showDonorGradient: item?.authorShowDonorGradient !== false,
      authorUserId,
      isOwn,
      canPreviewStaffRole,
      staffRolePreview,
      staffRolePreviewOptions,
      hytalePlayerName: linkStatus.playerName,
      hytalePlayerUuid: linkStatus.playerUuid,
      linkedAccount: linkStatus.linked,
      achievements,
      groups,
      forumActivity,
    });
    } finally {
      setNotificationProfileLoading(false);
    }
  }

  async function updateOwnNotificationStaffRolePreview(nextRole) {
    if (!notificationProfileUser?.isOwn || !notificationProfileUser?.canPreviewStaffRole || !nextRole) return;
    const current = String(
      notificationProfileUser.staffRolePreview || notificationProfileUser.staffRole || "",
    );
    if (nextRole === current) return;
    setProfileTitleSaving(true);
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-role-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffRolePreview: nextRole }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save staff group.");
      }
      const data = await response.json();
      const staffRole = String(data?.staffRole || nextRole);
      const options = Array.isArray(data?.staffRolePreviewOptions) ? data.staffRolePreviewOptions : [];
      setNotificationProfileUser((prev) =>
        prev
          ? {
              ...prev,
              staffRole,
              staffRolePreview: String(data?.staffRolePreview || staffRole),
              staffRolePreviewOptions: options.length > 0 ? options : prev.staffRolePreviewOptions,
            }
          : prev,
      );
      setNotifications((prev) =>
        prev.map((row) => {
          const rowUserId = String(row?.authorUserId || "");
          return rowUserId && rowUserId === String(userId || "")
            ? { ...row, authorStaffRole: staffRole }
            : row;
        }),
      );
    } catch (error) {
      emitAppToast({
        kind: "error",
        title: "Group Save Failed",
        message: error?.message || "Unable to update staff group.",
      });
    } finally {
      setProfileTitleSaving(false);
    }
  }

  async function updateOwnNotificationStaffBadgeVisibility(nextVisible) {
    if (!notificationProfileUser?.isOwn || !notificationProfileUser?.canToggleStaffBadge || notificationProfileStaffBadgeSaving) return false;
    setNotificationProfileStaffBadgeSaving(true);
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-badge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showStaffBadge: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save staff badge visibility.");
      }
      const data = await response.json();
      const showStaffBadge = data?.showStaffBadge !== false;
      setNotificationProfileUser((prev) => (prev ? { ...prev, showStaffBadge } : prev));
      setNotifications((prev) =>
        prev.map((row) => {
          const rowUserId = String(row?.authorUserId || "");
          return rowUserId && rowUserId === String(userId || "")
            ? { ...row, authorShowStaffBadge: showStaffBadge }
            : row;
        }),
      );
      return true;
    } catch (error) {
      emitAppToast({
        kind: "error",
        title: "Badge Save Failed",
        message: error?.message || "Unable to update staff badge visibility.",
      });
      return false;
    } finally {
      setNotificationProfileStaffBadgeSaving(false);
    }
  }

  async function updateOwnNotificationStaffBadgeIconVisibility(nextVisible) {
    if (!notificationProfileUser?.isOwn || !notificationProfileUser?.canToggleStaffBadge || notificationProfileStaffBadgeIconSaving) return false;
    setNotificationProfileStaffBadgeIconSaving(true);
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/staff-badge-icon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ showStaffBadgeIcon: Boolean(nextVisible) }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save staff badge icon style.");
      }
      const data = await response.json();
      const showStaffBadgeIcon = data?.showStaffBadgeIcon !== false;
      setNotificationProfileUser((prev) => (prev ? { ...prev, showStaffBadgeIcon } : prev));
      setNotifications((prev) =>
        prev.map((row) => {
          const rowUserId = String(row?.authorUserId || "");
          return rowUserId && rowUserId === String(userId || "")
            ? { ...row, authorShowStaffBadgeIcon: showStaffBadgeIcon }
            : row;
        }),
      );
      return true;
    } catch (error) {
      emitAppToast({
        kind: "error",
        title: "Badge Save Failed",
        message: error?.message || "Unable to update staff badge icon style.",
      });
      return false;
    } finally {
      setNotificationProfileStaffBadgeIconSaving(false);
    }
  }

  async function updateOwnNotificationStaffBadgeMode(nextMode) {
    const mode = String(nextMode || "").trim().toLowerCase();
    let success = false;
    if (mode === "hidden") {
      success = await updateOwnNotificationStaffBadgeVisibility(false);
    } else if (mode === "label") {
      const badgeSaved = await updateOwnNotificationStaffBadgeVisibility(true);
      const iconSaved = await updateOwnNotificationStaffBadgeIconVisibility(false);
      success = badgeSaved && iconSaved;
    } else {
      const badgeSaved = await updateOwnNotificationStaffBadgeVisibility(true);
      const iconSaved = await updateOwnNotificationStaffBadgeIconVisibility(true);
      success = badgeSaved && iconSaved;
    }
    emitAppToast({
      kind: success ? "success" : "error",
      title: success ? "Staff Badge Updated" : "Staff Badge Update Failed",
      message: success
        ? mode === "hidden"
          ? "Staff badge is now hidden."
          : mode === "label"
          ? "Staff badge now uses text style."
          : "Staff badge now uses icon style."
        : "Unable to update staff badge mode right now.",
    });
  }

  async function updateOwnNotificationOwnedBadgeDisplaySettings(nextShowAll, nextSelectedBadge = "") {
    if (!notificationProfileUser?.isOwn || !notificationProfileUser?.canToggleOwnedBadges || notificationProfileOwnedBadgesSaving) return false;
    setNotificationProfileOwnedBadgesSaving(true);
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/profile/owned-badges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          showAllOwnedRankBadges: Boolean(nextShowAll),
          selectedOwnedBadge: String(nextSelectedBadge || ""),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to save badge display settings.");
      }
      const data = await response.json();
      const showAllOwnedRankBadges = data?.showAllOwnedRankBadges !== false;
      const selectedOwnedBadge = String(data?.selectedOwnedBadge || "");
      const ownedBadgeOptions = Array.isArray(data?.ownedBadgeOptions)
        ? data.ownedBadgeOptions.filter((rank) => OWNED_RANK_ORDER.includes(String(rank)))
        : [];
      setNotificationProfileUser((prev) =>
        prev
          ? {
              ...prev,
              showAllOwnedRankBadges,
              selectedOwnedBadge,
              ownedBadgeOptions: ownedBadgeOptions.length ? ownedBadgeOptions : prev.ownedBadgeOptions,
            }
          : prev,
      );
      return true;
    } catch (error) {
      emitAppToast({
        kind: "error",
        title: "Badge Save Failed",
        message: error?.message || "Unable to update donor badge display.",
      });
      return false;
    } finally {
      setNotificationProfileOwnedBadgesSaving(false);
    }
  }

  async function updateOwnNotificationDonorBadgeSelection(nextBadgeOrAll) {
    const next = String(nextBadgeOrAll || "").trim();
    const success =
      next === "__all__"
        ? await updateOwnNotificationOwnedBadgeDisplaySettings(true, "")
        : await updateOwnNotificationOwnedBadgeDisplaySettings(false, next);
    emitAppToast({
      kind: success ? "success" : "error",
      title: success ? "Donor Badge Updated" : "Donor Badge Update Failed",
      message: success
        ? next === "__all__"
          ? "Displaying all owned donor badges."
          : `Now displaying ${getRankDisplayLabel(next)} as your donor badge.`
        : "Unable to update donor badge display right now.",
    });
  }

  useEffect(() => {
    if (notificationProfileOpen) return;
    setAvatarPanelOpen(false);
    setAvatarPanelStatus("");
  }, [notificationProfileOpen]);

  async function handleAccountLogout() {
    try {
      await signOut();
    } catch {
      emitAppToast({
        kind: "error",
        title: "Logout Failed",
        message: "Unable to sign out right now. Please try again.",
      });
    }
  }

  async function useHytaleAvatar() {
    if (!isSignedIn) return;
    const sourceId =
      String(notificationProfileUser?.hytalePlayerUuid || "").trim() || String(linkedPlayerUuid || "").trim();
    if (!sourceId) {
      setAvatarPanelStatus("No linked Hytale UUID found.");
      return;
    }
    setAvatarPanelStatus("Loading Hytale avatar...");
    const fetchedAvatar = await fetchHytaleAvatarUrlById(sourceId);
    if (!fetchedAvatar) {
      setAvatarPanelStatus("Unable to fetch Hytale avatar.");
      return;
    }
    setHytaleAvatarUrl(fetchedAvatar);
    setAvatarSource("hytale");
    setAvatarPanelOpen(false);
    setAvatarPanelStatus("");
    setNotificationProfileUser((prev) => (prev?.isOwn ? { ...prev, image: fetchedAvatar } : prev));
  }

  function chooseCustomAvatarFile() {
    if (!canUploadOwnAvatar) {
      setAvatarPanelStatus("Custom uploads are unlocked for Hero, Legend, Mythic, or Staff.");
      return;
    }
    avatarFileInputRef.current?.click();
  }

  function onCustomAvatarSelected(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    if (!canUploadOwnAvatar) {
      setAvatarPanelStatus("Custom uploads are unlocked for Hero, Legend, Mythic, or Staff.");
      event.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result || "");
      if (!dataUrl) return;
      setCustomAvatarDataUrl(dataUrl);
      setAvatarSource("upload");
      setAvatarPanelOpen(false);
      setAvatarPanelStatus("");
      setNotificationProfileUser((prev) => (prev?.isOwn ? { ...prev, image: dataUrl } : prev));
    };
    reader.onerror = () => setAvatarPanelStatus("Could not read the selected image.");
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  function openDrawerSelfProfileCard() {
    if (!isSignedIn || !userId) return;
    openNotificationProfile({
      authorName: displayName,
      authorUsername: user?.username || "",
      authorImage: resolvedOwnAvatar,
      authorUserId: userId,
      authorRank: drawerRankBadgeLabel,
      authorOwnedRank: normalizedDrawerOwnedRank,
      authorStaffRole: drawerProfileSummary.staffRole || "",
      authorShowStaffBadge: drawerProfileSummary.showStaffBadge !== false,
      authorShowStaffBadgeIcon: drawerProfileSummary.showStaffBadgeIcon !== false,
      showAllOwnedRankBadges: drawerProfileSummary.showAllOwnedRankBadges !== false,
      selectedOwnedBadge: drawerProfileSummary.selectedOwnedBadge || "",
    });
  }

  function removeItem(id) {
    setCartStatus("");
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  async function checkout() {
    if (!isSignedIn || cart.length === 0) return;
    const stripeAvailable =
      Boolean(STRIPE_PUBLISHABLE_KEY) &&
      typeof window !== "undefined" &&
      typeof window.Stripe === "function";

    if (stripeAvailable) {
      if (stripeInitializing) {
        setCartStatus("Loading secure payment fields...");
        return;
      }
      if (!stripeReady || !stripeElementsRef.current || !stripeClientRef.current) {
        setCartStatus("Secure payment form is not ready yet.");
        return;
      }
      setCartStatus("Processing secure payment...");
      try {
        const result = await stripeClientRef.current.confirmPayment({
          elements: stripeElementsRef.current,
          redirect: "if_required",
        });
        if (result?.error) {
          throw new Error(String(result.error.message || "Payment failed."));
        }
        const intent = result?.paymentIntent || null;
        const intentId = String(intent?.id || stripePaymentIntentId || "").trim();
        if (!intentId) {
          throw new Error("Payment reference missing after confirmation.");
        }
        if (String(intent?.status || "").toLowerCase() !== "succeeded") {
          setCartStatus("Payment is processing. Please wait a moment and try again.");
          return;
        }
        const finalizeResponse = await apiFetchWithToken(
          getToken,
          true,
          "/api/payments/stripe/finalize-intent",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paymentIntentId: intentId }),
          },
        );
        const finalizeData = await finalizeResponse.json().catch(() => ({}));
        if (!finalizeResponse.ok) {
          throw new Error(String(finalizeData?.error || "Failed to finalize payment."));
        }
        setCart(buildCartFromIds(finalizeData?.cart?.items || []));
        setCartPricing(finalizeData?.pricing || null);
        const awardedRank = String(finalizeData?.awardedRank || "").trim();
        setCartStatus(awardedRank ? `Checkout complete. Rank awarded: ${awardedRank}` : "Checkout complete.");
        setTimeout(() => {
          setShowCart(false);
          setCartStatus("");
        }, 900);
        return;
      } catch (error) {
        setCartStatus(String(error?.message || "Secure checkout failed. Please try again."));
        return;
      }
    }

    setCartStatus("Processing checkout...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Checkout failed");
      const data = await response.json();
      setCart(buildCartFromIds(data?.cart?.items || []));
      setCartPricing(data?.pricing || null);
      const awardedRank = String(data?.awardedRank || "").trim();
      setCartStatus(awardedRank ? `Checkout complete. Rank awarded: ${awardedRank}` : "Checkout complete.");
      setTimeout(() => {
        setShowCart(false);
        setCartStatus("");
      }, 900);
    } catch (error) {
      setCartStatus("Checkout failed. Please try again.");
    }
  }

  function openCart() {
    if (!isSignedIn) {
      if (openSignIn) openSignIn({});
      return;
    }
    setCartStatus("");
    setShowCart(true);
  }

  const notificationCount = isSignedIn ? unread : sortedNotifications.length;
  const year = new Date().getFullYear();
  const displayName = getUserDisplayName(user);
  const showLoader = !appHydrated || authTransitionLoading;
  const desktopStickyVisible = !isMobile && hideLogo;
  const stickyTransparentActive =
    desktopStickyVisible && desktopStickyStyle === "transparent" && !isMobile;
  const lockedNavHover = stickyTransparentActive && showNotifications;
  const navActive = showConnectHelp ? "play" : active;
  const desktopStickyLogoVisible = desktopStickyStyle === "solid";
  const desktopStickyLogoSrc = desktopStickyWide
    ? DESKTOP_LOGO_MAP[desktopStickyLogoStyle] || LOGO_SRC
    : LOGO_SRC;
  const desktopStickyLogoClass = desktopStickyWide
    ? desktopStickyLogoStyle.startsWith("icon")
      ? `icon ${desktopStickyLogoStyle === "icon-ht" ? "ht" : ""}`.trim()
      : "logo"
    : "island";

  useEffect(() => {
    if (lockedNavHover) {
      setHoveredNav(navActive);
      return;
    }
    setHoveredNav("");
  }, [lockedNavHover, navActive]);

  function handleDesktopNavEnter(id) {
    if (!lockedNavHover) return;
    setHoveredNav(id);
  }

  async function runAdminFakePurchase(itemId = "") {
    if (!isSignedIn || !(isAdmin || isStaff)) {
      return { ok: false, error: "Staff sign-in required." };
    }
    const forcedItemId = String(itemId || "").trim();
    if (!forcedItemId && cart.length === 0) {
      return { ok: false, error: "Cart is empty." };
    }
    const response = await apiFetchWithToken(getToken, true, "/api/admin/store/fake-purchase", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(forcedItemId ? { itemId: forcedItemId } : {}),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return { ok: false, error: String(data?.error || "Fake purchase failed.") };
    }
    setCart(buildCartFromIds(data?.cart?.items || []));
    return {
      ok: true,
      purchaseId: String(data?.purchaseId || ""),
      awardedRank: String(data?.awardedRank || ""),
    };
  }

  function DesktopNavShell() {
    const navItems = [
      { id: "home", label: "Home", onClick: () => navigate("/") },
      { id: "news", label: "News", onClick: () => navigate("/news") },
      { id: "store", label: "Store", onClick: () => navigate("/store") },
      { id: "vote", label: "Vote", onClick: () => navigate("/vote") },
      { id: "forum", label: "Forum", onClick: () => navigate("/forum") },
      { id: "play", label: "Play", onClick: openHowModal },
    ];
    return html`
      <div className=${`nav-shell ${placement === "left" ? "left" : placement === "right" ? "right" : ""}`}>
        <nav className="nav">
          ${navItems.map(
            (item) => html`<${DesktopNavLinkButton}
              key=${item.id}
              id=${item.id}
              label=${item.label}
              navActive=${navActive}
              lockedNavHover=${lockedNavHover}
              hoveredNav=${hoveredNav}
              onClick=${item.onClick}
              onEnter=${() => handleDesktopNavEnter(item.id)}
              onLeave=${() => {
                if (lockedNavHover) setHoveredNav(navActive);
              }}
            />`,
          )}
        </nav>
      </div>
    `;
  }

  function DesktopAuthButtonsBlock() {
    return html`
      <${DesktopAuthButtons}
        SettingsMenu=${SettingsMenu}
        NotificationsButton=${NotificationsButton}
        CartButton=${CartButton}
        ClerkLoading=${ClerkLoading}
        ClerkLoaded=${ClerkLoaded}
        SignedOut=${SignedOut}
        SignedIn=${SignedIn}
        SignUpButton=${SignUpButton}
        SignInButton=${SignInButton}
        UserButton=${UserButton}
        theme=${theme}
        setTheme=${setTheme}
        toggleLightDark=${toggleLightDark}
        placement=${placement}
        setPlacement=${setPlacement}
        menuSide=${menuSide}
        setMenuSide=${setMenuSide}
        mobileNavStyle=${mobileNavStyle}
        setMobileNavStyle=${setMobileNavStyle}
        logoSide=${logoSide}
        setLogoSide=${setLogoSide}
        mobileLogoStyle=${mobileLogoStyle}
        setMobileLogoStyle=${setMobileLogoStyle}
        showMobileIsland=${showMobileIsland}
        setShowMobileIsland=${setShowMobileIsland}
        desktopStickyStyle=${desktopStickyStyle}
        setDesktopStickyStyle=${setDesktopStickyStyle}
        desktopStickyWide=${desktopStickyWide}
        setDesktopStickyWide=${setDesktopStickyWide}
        desktopStickyLogoStyle=${desktopStickyLogoStyle}
        setDesktopStickyLogoStyle=${setDesktopStickyLogoStyle}
        uiFlashEnabled=${uiFlashEnabled}
        setUiFlashEnabled=${setUiFlashEnabled}
        toastShape=${toastShape}
        setToastShape=${setToastShape}
        setSettingsOpen=${setSettingsOpen}
        settingsOpen=${settingsOpen}
        isMobile=${isMobile}
        notificationCount=${notificationCount}
        openNotifications=${openNotifications}
        cartCount=${cartCount}
        openCart=${openCart}
        profileName=${displayName}
        profileAvatar=${resolvedOwnAvatar}
        openProfilePanel=${openDrawerSelfProfileCard}
        onLogout=${handleAccountLogout}
        logoutIconSrc=${LOGOUT_ICON_SVG}
      />
    `;
  }

  function DesktopStickyBar() {
    return html`
      <div
        className=${`desktop-sticky ${desktopStickyStyle} ${desktopStickyWide ? "wide" : ""} ${desktopStickyVisible ? "show" : ""} ${logoSide === "right" ? "logo-right" : ""}`}
        aria-hidden=${!desktopStickyVisible}
      >
        <div className="desktop-sticky-inner">
          ${desktopStickyLogoVisible
            ? html`<img
                className=${`desktop-sticky-logo ${desktopStickyLogoClass} ${desktopStickyWide ? "" : "island-float"}`}
                src=${desktopStickyLogoSrc}
                alt="Hardtale"
              />`
            : html``}
          ${LOCAL_DEV_MODE ? html`<span className="dev-mode-pill">DEV MODE</span>` : html``}
          <${DesktopNavShell} />
          <${DesktopAuthButtonsBlock} />
        </div>
      </div>
    `;
  }

  function MobileSettingsButton() {
    return html`<${SettingsMenu}
      theme=${theme}
      setTheme=${setTheme}
      toggleLightDark=${toggleLightDark}
      placement=${placement}
      setPlacement=${setPlacement}
      menuSide=${menuSide}
      setMenuSide=${setMenuSide}
      mobileNavStyle=${mobileNavStyle}
      setMobileNavStyle=${setMobileNavStyle}
      logoSide=${logoSide}
      setLogoSide=${setLogoSide}
      mobileLogoStyle=${mobileLogoStyle}
      setMobileLogoStyle=${setMobileLogoStyle}
      showMobileIsland=${showMobileIsland}
      setShowMobileIsland=${setShowMobileIsland}
      desktopStickyStyle=${desktopStickyStyle}
      setDesktopStickyStyle=${setDesktopStickyStyle}
      desktopStickyWide=${desktopStickyWide}
      setDesktopStickyWide=${setDesktopStickyWide}
      desktopStickyLogoStyle=${desktopStickyLogoStyle}
      setDesktopStickyLogoStyle=${setDesktopStickyLogoStyle}
      uiFlashEnabled=${uiFlashEnabled}
      setUiFlashEnabled=${setUiFlashEnabled}
      toastShape=${toastShape}
      setToastShape=${setToastShape}
      openState=${settingsOpen}
      setOpenState=${setSettingsOpen}
      onOpenChange=${setSettingsOpen}
      isMobile=${isMobile}
    />`;
  }

  return html`
    <div className=${`page ${showMobileNav ? "drawer-open" : ""} ${mobileNavStyle === "solid" ? "nav-solid" : "nav-transparent"} ${isMobile && !showMobileIsland ? "hide-mobile-island" : ""}`}>
      <${CustomScrollbar} />
      <${SeoManager}
        pathname=${visualPathname}
        search=${routesLocation.search || ""}
      />
      <${LoadingScreen} show=${showLoader} variant=${loaderVariant} />
        ${isMobile
          ? html`<div
              className=${`mobile-nav-bar ${mobileNavStyle === "solid" ? "nav-solid" : "nav-transparent"} ${menuSide === "left" ? "nav-left" : "nav-right"} ${mobileNavStyle === "solid" ? "with-mini-logo" : ""}`}
            >
              ${mobileNavStyle === "solid"
                ? html`<div className=${`mobile-nav-logo-wrap ${menuSide === "left" ? "logo-right" : ""}`}>
                    <img
                      className=${`mobile-nav-logo ${
                        mobileLogoStyle.startsWith("icon")
                          ? `icon ${mobileLogoStyle === "icon-ht" ? "ht" : ""}`.trim()
                          : "logo"
                      }`}
                      src=${MOBILE_LOGO_MAP[mobileLogoStyle] || MOBILE_LOGO_MAP["logo-greyscale"]}
                      alt="Hardtale"
                    />
                  </div>`
                : html``}
              ${LOCAL_DEV_MODE ? html`<span className="dev-mode-pill mobile">DEV MODE</span>` : html``}
              <div className=${`mobile-top-actions ${menuSide === "left" ? "menu-left" : "menu-right"}`}>
                ${menuSide === "left"
                  ? html`
                      <button
                        className="settings-button mobile-menu"
                        title="Menu"
                        onClick=${() => setShowMobileNav(true)}
                      >
                        <span
                          className="mobile-menu-icon-mask"
                          aria-hidden="true"
                          style=${{ "--menu-icon": `url(${DRAWER_MENU_ICON_SVG})` }}
                        ></span>
                      </button>
                      <${CartButton} onClick=${openCart} count=${cartCount} />
                    `
                  : html`
                      <${CartButton} onClick=${openCart} count=${cartCount} />
                      <button
                        className="settings-button mobile-menu"
                        title="Menu"
                        onClick=${() => setShowMobileNav(true)}
                      >
                        <span
                          className="mobile-menu-icon-mask"
                          aria-hidden="true"
                          style=${{ "--menu-icon": `url(${DRAWER_MENU_ICON_SVG})` }}
                        ></span>
                      </button>
                    `}
              </div>
            </div>`
          : html``}
        ${desktopStickyVisible ? html`<${DesktopStickyBar} />` : html``}
      <div className="glow"></div>
      <div className="sparks"></div>
      <div className="shell" ref=${shellRef}>
        <header
          className=${`topbar fade-in ${hideLogo ? "logo-hidden" : ""} ${
            !isMobile && logoSide === "right" ? "logo-right" : ""
          } ${desktopStickyVisible ? "desktop-sticky-active" : ""}`}
          ref=${topbarRef}
        >
          <${Link}
            className=${`logo island-logo ${hideLogo ? "logo-hidden" : ""}`}
            to="/"
            onClick=${() => setActive("home")}
          >
            <img
              className="logo-image"
              src=${LOGO_SRC}
              alt="Hardtale logo"
              onError=${handleLogoError}
            />
          <//>
          ${LOCAL_DEV_MODE ? html`<span className="dev-mode-pill">DEV MODE</span>` : html``}
          ${desktopStickyVisible
            ? html``
            : html`
                <${DesktopNavShell} />
                <${DesktopAuthButtonsBlock} />
              `}
        </header>

        <${AppRoutes}
          Routes=${Routes}
          Route=${Route}
          routesLocation=${routesLocation}
          HomePage=${HomePage}
          AboutUsPage=${AboutUsPage}
          NewsPage=${NewsPage}
          StoreGatewayPage=${StoreGatewayPage}
          StorePage=${StorePage}
          VotePage=${VotePage}
          ForumPage=${ForumPage}
          SubscriptionsPage=${SubscriptionsPage}
          NotFoundPage=${NotFoundPage}
          sortedNews=${sortedNews}
          loading=${loading}
          error=${error}
          playRef=${playRef}
          openHowModal=${openHowModal}
          navigate=${navigate}
          isAdmin=${isAdmin}
          isStaff=${isStaff}
          sortedNotifications=${sortedNotifications}
          setNews=${setNews}
          setNotifications=${setNotifications}
          addToCart=${addToCart}
          removeFromCart=${removeItem}
          isLinkedAccount=${isLinkedAccount}
          cart=${cart}
          onLinkClick=${openLinkModal}
          onAdminFakePurchase=${runAdminFakePurchase}
          isSignedIn=${isSignedIn}
          profileAvatar=${resolvedOwnAvatar}
          profileRankLabel=${drawerProfileSummary.rankLabel}
          profileOwnedRank=${normalizedDrawerOwnedRank}
          profileStaffRole=${drawerProfileSummary.staffRole}
        />

        <${SiteFooter}
          footerRef=${footerRef}
          footerInView=${footerInView}
          onOpenChangelog=${() => setShowChangelog(true)}
          version=${VERSION}
          year=${year}
          copyrightIconSrc=${COPYRIGHT_ICON_SVG}
        />
      </div>
      ${isLinkRoute
        ? html`<div className="popup-overlay link-modal-overlay" onClick=${closeLinkModal}>
            <div className="popup link-modal-shell" onClick=${(event) => event.stopPropagation()}>
              <${LinkPage} onClose=${closeLinkModal} isLinkedAccount=${isLinkedAccount} />
            </div>
          </div>`
        : html``}

      ${isMobile
        ? html`<div className=${`mobile-drawer ${menuSide === "left" ? "drawer-left" : "drawer-right"} ${showMobileNav ? "open" : ""}`}>
        <div className="mobile-drawer-backdrop" onClick=${() => setShowMobileNav(false)}></div>
        <div className="mobile-drawer-panel">
          <div className="mobile-drawer-header">
            <div className="section-title">Menu</div>
            <div className=${`drawer-header-actions ${menuSide === "left" ? "left" : "right"}`}>
              ${menuSide === "left"
                ? html`
                    <button
                      className="signature-close"
                      aria-label="Close menu"
                      onClick=${() => setShowMobileNav(false)}
                    >
                      X
                    </button>
                    <${SignedIn}>
                      <${NotificationsButton} count=${notificationCount} onClick=${openNotifications} flashEnabled=${uiFlashEnabled} />
                    <//>
                  `
                : html`
                    <${SignedIn}>
                      <${NotificationsButton} count=${notificationCount} onClick=${openNotifications} flashEnabled=${uiFlashEnabled} />
                    <//>
                    <button
                      className="signature-close"
                      aria-label="Close menu"
                      onClick=${() => setShowMobileNav(false)}
                    >
                      X
                    </button>
                  `}
            </div>
          </div>
          <${MobileDrawerLinks}
            navigate=${navigate}
            closeMenu=${() => setShowMobileNav(false)}
            openPlayHelp=${() => setShowConnectHelp(true)}
            activeId=${navActive}
          />
          <div className="mobile-drawer-footer">
            <${SignedOut}>
              <div className="drawer-auth">
                <${SignInButton} mode="modal">
                  <button className="button">Sign in</button>
                <//>
                <${SignUpButton} mode="modal">
                  <button className="button primary">Sign up</button>
                <//>
              </div>
            <//>
            <${SignedIn}>
              <div className="drawer-user">
                <${MobileDrawerProfilePreview}
                  className="drawer-profile-preview"
                  onClick=${openDrawerSelfProfileCard}
                  title="Open profile card"
                  avatar=${resolvedOwnAvatar}
                  name=${displayName}
                  username=${formatUsernameForDisplay(user?.username)}
                  linkedLabel=${isLinkedAccount ? "Linked" : "Unlinked"}
                  displayedBadge=${drawerPrimaryOwnedBadge !== "Unregistered" ? drawerPrimaryOwnedBadge : drawerRankBadgeLabel}
                  showStaffBadge=${isStaffAccount && drawerProfileSummary.showStaffBadge !== false}
                  staffLabel=${toStaffPillTitle(drawerProfileSummary.staffRole || "") || "Staff"}
                  staffRoleClass=${resolveStaffRoleClass({
                    staffRole: drawerProfileSummary.staffRole || "",
                  })}
                />
              </div>
              <div className=${`drawer-settings-row ${menuSide === "left" ? "left" : "right"}`.trim()}>
                <${MobileSettingsButton} />
                <${AccountActionButton}
                  className="drawer-logout-button"
                  label="Logout"
                  iconSrc=${LOGOUT_ICON_SVG}
                  onClick=${handleAccountLogout}
                />
              </div>
            <//>
          </div>
        </div>
      </div>
      `
        : html``}

      <${PopUp} show=${showCart} onClose=${() => setShowCart(false)} title="Checkout" className="checkout-overlay">
        ${cart.length === 0
          ? html`<p className="muted">Your cart is empty.</p>`
          : html`<${GradientScrollArea} className="cart-list">
              ${cart.map(
                (item) => html`<div key=${item.id} className="cart-row">
                  <div className="cart-info">
                    <div className="cart-rank">${item.name}</div>
                    <div className="cart-name">Rank package</div>
                    ${item.blurb
                      ? html`<ul className="cart-perks">
                          ${perkBullets(item.blurb).map(
                            (perk) => html`<li>
                              ${perk.toLowerCase().includes("bold badge")
                                ? html`<strong>${capitalizePerk(perk)}</strong>`
                                : capitalizePerk(perk)}
                            </li>`,
                          )}
                        </ul>`
                      : html``}
                  </div>
                  <div className="cart-actions">
                    <span>$${item.price.toFixed(2)}</span>
                    <button className="ghost-btn icon-only" onClick=${() => removeItem(item.id)} aria-label="Remove item">
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M9 3h6l1 2h4v2H4V5h4l1-2zm1 6h2v9h-2V9zm4 0h2v9h-2V9zM7 9h2v9H7V9z" />
                      </svg>
                    </button>
                  </div>
                </div>`,
              )}
              <div className="cart-row total">
                <span>Total</span>
                <span>$${total().toFixed(2)}</span>
              </div>
            <//>`}
        ${cart.length > 0 && STRIPE_PUBLISHABLE_KEY
          ? html`<div className="stripe-inline-panel">
              <div className="stripe-inline-title">Secure Card Payment</div>
              <div className="muted stripe-inline-hint">
                Pay securely without leaving this checkout popup.
              </div>
              <div className="stripe-inline-element" ref=${stripeMountRef}></div>
              ${stripeInlineError ? html`<div className="muted">${stripeInlineError}</div>` : html``}
            </div>`
          : html``}
        ${cartStatus ? html`<div className="muted">${cartStatus}</div>` : html``}
        ${isSignedIn && (isAdmin || isStaff)
          ? html`<div className="cart-admin-fake-row">
              <button
                type="button"
                className="button ghost-btn"
                onClick=${async () => {
                  const result = await runAdminFakePurchase("rank-hero");
                  setCartStatus(
                    result?.ok
                      ? `Fake Hero purchase queued${result?.purchaseId ? ` (${result.purchaseId})` : ""}.`
                      : String(result?.error || "Fake Hero purchase failed."),
                  );
                }}
              >
                Fake Hero
              </button>
              <button
                type="button"
                className="button ghost-btn"
                onClick=${async () => {
                  const result = await runAdminFakePurchase("rank-legend");
                  setCartStatus(
                    result?.ok
                      ? `Fake Legend purchase queued${result?.purchaseId ? ` (${result.purchaseId})` : ""}.`
                      : String(result?.error || "Fake Legend purchase failed."),
                  );
                }}
              >
                Fake Legend
              </button>
              <button
                type="button"
                className="button ghost-btn"
                onClick=${async () => {
                  const result = await runAdminFakePurchase("rank-mythic");
                  setCartStatus(
                    result?.ok
                      ? `Fake Mythic purchase queued${result?.purchaseId ? ` (${result.purchaseId})` : ""}.`
                      : String(result?.error || "Fake Mythic purchase failed."),
                  );
                }}
              >
                Fake Mythic
              </button>
            </div>`
          : html``}
        <button
          className="button primary"
          onClick=${checkout}
          disabled=${cart.length === 0 || (Boolean(STRIPE_PUBLISHABLE_KEY) && stripeInitializing)}
        >
          ${STRIPE_PUBLISHABLE_KEY ? "Pay now" : "Checkout"}
        </button>
      <//>

      <${PopUp}
        show=${showNotifications}
        onClose=${() => setShowNotifications(false)}
        title="Notifications"
      >
        <${NotificationsPanel}
          notifications=${sortedNotifications}
          onView=${viewNotification}
          onOpenProfile=${openNotificationProfile}
          formatTimestamp=${formatTimestamp}
          isStaffLabel=${isStaffLabel}
          featuredIconSrc=${FEATURED_BADGE_ICON_SVG}
        />
      <//>
      <${PopUp}
        show=${notificationProfileOpen}
        onClose=${() => setNotificationProfileOpen(false)}
        title=${(() => {
          const username = String(notificationProfileUser?.username || "").replace(/^@+/, "");
          const display = username || notificationProfileUser?.name || "User";
          return `${display}'s Profile`;
        })()}
        className="profile-card-overlay"
        headerBelow=${notificationProfileUser?.isOwn
          ? html`<div className="profile-modal-header-actions">
              <button
                type="button"
                className="copy-action-btn subtle profile-copy-action account-management-pill"
                onClick=${() => {
                  setNotificationProfileOpen(false);
                  if (openUserProfile) openUserProfile({});
                }}
                title="Account Management"
              >
                <span>Account Management</span>
              </button>
            </div>`
          : isSignedIn
          ? html`<div className="profile-modal-header-actions">
              <button
                type="button"
                className="copy-action-btn subtle profile-copy-action account-management-pill"
                onClick=${() =>
                  emitAppToast({
                    kind: "info",
                    title: "Friends Feature Planned",
                    message: `Friend requests are planned. @${notificationProfileUser?.username || notificationProfileUser?.name || "user"} support is coming soon.`,
                  })}
                title="Add Friend (planned)"
              >
                <img src=${ADD_FRIEND_ICON_SVG} alt="" aria-hidden="true" className="profile-action-icon-img" />
                <span>Add Friend</span>
              </button>
            </div>`
          : html``}
      >
        ${notificationProfileLoading
          ? html`<div className="profile-modal-inline-loader" role="status" aria-live="polite">
              <${HardtaleLoader} variant=${loaderVariant} />
            </div>`
          : notificationProfileUser
          ? html`<${ProfileCardLayout}
              avatarClassName=${`profile-card-avatar avatar-rank-${String(
                notificationProfileUser.rankLabel || "Unregistered",
              )
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`.trim()}
              avatarSrc=${notificationProfileUser.image}
              avatarAlt=${notificationProfileUser.name}
              onAvatarClick=${notificationProfileUser?.isOwn
                ? () => {
                    setAvatarPanelOpen((prev) => !prev);
                    setAvatarPanelStatus("");
                  }
                : null}
              avatarButtonTitle=${notificationProfileUser?.isOwn
                ? "Avatar options"
                : "Profile avatar"}
              nameClassName=${`profile-card-name ${
                notificationProfileUser.useRankFont === true ? "rank-font-on" : "rank-font-off"
              } ${
                notificationProfileUser.showDonorGradient === false
                  ? "donor-gradient-off"
                  : "donor-gradient-on"
              } rank-${String(
                notificationProfileUser.rankLabel || "Unregistered",
              )
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")}`.trim()}
              name=${notificationProfileUser.name}
              badgeNode=${renderStaffBadge(notificationProfileUser)}
              username=${notificationProfileUser.username}
              metaRows=${[
                {
                  label: "Hytale Username:",
                  value: notificationProfileUser.hytalePlayerName || "N/A",
                  copyValue: notificationProfileUser.hytalePlayerName || "",
                },
                {
                  label: "UUID:",
                  value: notificationProfileUser.hytalePlayerUuid || "N/A",
                  copyValue: notificationProfileUser.hytalePlayerUuid || "",
                },
                ...(!notificationProfileUser?.isOwn
                  ? [
                      {
                        label: "",
                        value: "Private Message",
                        onClick: () => openPrivateMessageModal(notificationProfileUser),
                        title: canStartPrivateMessages
                          ? "Open private message"
                          : "Link your account (or hold a rank) to unlock private messages",
                        className: "account-management-pill",
                      },
                    ]
                  : []),
              ]}
              onMetaRowClick=${copyNotificationProfileMetaValue}
              rankNode=${html`<div
                className=${`comment-rank ${
                  notificationProfileUser.staff
                    ? `staff ${resolveStaffRoleClass(notificationProfileUser)}`.trim()
                    : ""
                } ${
                  notificationProfileUser.staff && notificationProfileUser.showStaffGradient === false
                    ? "staff-static"
                    : ""
                } profile-card-rank ${
                  notificationProfileUser.showDonorGradient === false
                    ? "donor-gradient-off"
                    : "donor-gradient-on"
                } rank-${String(
                  notificationProfileUser.rankLabel || "Unregistered",
                )
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`.trim()}
              >
                ${(() => {
                  const iconType = getRankIconType(notificationProfileUser.rankLabel || "");
                  return html`${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                    <span>${getRankDisplayLabel(notificationProfileUser.rankLabel || "Unregistered")}</span>`;
                })()}
              </div>`}
            >
              ${notificationProfileUser?.isOwn
                ? html`<div className="avatar-source-shell">
                    <input
                      ref=${avatarFileInputRef}
                      className="avatar-file-input"
                      type="file"
                      accept="image/*"
                      onChange=${onCustomAvatarSelected}
                    />
                    ${avatarPanelOpen
                      ? html`<div className="avatar-source-menu">
                          <button
                            type="button"
                            className=${`avatar-source-item ${avatarSource === "hytale" ? "active" : ""}`.trim()}
                            onClick=${useHytaleAvatar}
                          >
                            Use Hytale Avatar
                          </button>
                          <button
                            type="button"
                            className=${`avatar-source-item ${avatarSource === "upload" ? "active" : ""}`.trim()}
                            onClick=${chooseCustomAvatarFile}
                            disabled=${!canUploadOwnAvatar}
                            title=${canUploadOwnAvatar
                              ? "Upload a custom avatar"
                              : "Unlocked for Hero, Legend, Mythic, or Staff"}
                          >
                            Upload Your Own
                          </button>
                        </div>`
                      : html``}
                    ${avatarPanelStatus
                      ? html`<div className="avatar-source-status muted">${avatarPanelStatus}</div>`
                      : html``}
                  </div>`
                : html``}
              <${ProfileInfoTabs}
                activeTab=${notificationProfileInfoTab}
                onTabChange=${setNotificationProfileInfoTab}
                renderBadges=${() =>
                  html`${renderOwnedRankBadges(notificationProfileUser, {
                    onSelectDonorBadge: updateOwnNotificationDonorBadgeSelection,
                    onSelectStaffBadgeMode: updateOwnNotificationStaffBadgeMode,
                    donorSaving: notificationProfileOwnedBadgesSaving,
                    staffSaving:
                      notificationProfileStaffBadgeSaving ||
                      notificationProfileStaffBadgeIconSaving,
                  })}`}
                renderGroups=${() =>
                  html`${renderProfileGroupsCard(notificationProfileUser, {
                    isSaving: profileTitleSaving,
                    onStaffRoleChange: updateOwnNotificationStaffRolePreview,
                  })}`}
                renderAchievements=${() =>
                  html`<${ProfileAchievementsPanel}
                    achievements=${notificationProfileUser?.achievements || []}
                  />`}
                renderForumActivity=${() =>
                  html`${renderProfileForumActivityCard(notificationProfileUser, formatTimestamp)}`}
              />
              ${notificationProfileUser?.isOwn
                ? html`<div className="profile-account-footer">
                    <${AccountActionButton}
                      className="account-panel-logout-link"
                      label="Sign-Out"
                      textOnly=${true}
                      onClick=${handleAccountLogout}
                    />
                  </div>`
                : html``}
            <//>`
          : html``}
      <//>
      <${PopUp}
        show=${privateMessageOpen}
        onClose=${() => {
          setPrivateMessageOpen(false);
          setPrivateMessageTarget(null);
          setPrivateMessageThread([]);
          setPrivateMessageBody("");
          setPrivateMessageStatus("");
        }}
        title=${privateMessageTarget?.username
          ? `Private Message - @${privateMessageTarget.username}`
          : "Private Message"}
        className="private-message-overlay"
      >
        ${!privateMessageTarget
          ? html`<p className="muted">No recipient selected.</p>`
          : html`<div className="private-message-panel">
              <div className="private-message-target">
                <img
                  className="comment-avatar small"
                  src=${privateMessageTarget.image || "/assets/HardTale_H_GreyScale.png"}
                  alt=${privateMessageTarget.name || "User"}
                />
                <div>
                  <div className="comment-author">${privateMessageTarget.name || "User"}</div>
                  <div className="muted">
                    ${privateMessageTarget.username ? `@${privateMessageTarget.username}` : ""}
                  </div>
                </div>
              </div>
              <div className="private-message-thread">
                ${privateMessageLoading
                  ? html`<p className="muted">Loading conversation...</p>`
                  : privateMessageThread.length === 0
                  ? html`<p className="muted">No private messages yet.</p>`
                  : privateMessageThread.map((entry) => html`<div
                        key=${entry.id}
                        className=${`private-message-item ${
                          String(entry?.fromUserId || "") === String(userId || "") ? "outgoing" : "incoming"
                        }`.trim()}
                      >
                        <div className="private-message-item-header">
                          <span className="comment-author">${entry?.fromName || "User"}</span>
                          <span className="muted">${formatTimestamp(entry?.createdAt)}</span>
                        </div>
                        <div className="private-message-item-body">${entry?.body || ""}</div>
                      </div>`)}
              </div>
              <textarea
                className="private-message-input"
                rows="4"
                maxLength="1200"
                placeholder="Write a private message..."
                value=${privateMessageBody}
                onInput=${(event) => setPrivateMessageBody(event.target.value)}
              ></textarea>
              <div className="comment-actions right">
                <button
                  className="button primary"
                  type="button"
                  onClick=${sendPrivateMessage}
                  disabled=${privateMessageSending || !privateMessageBody.trim()}
                >
                  ${privateMessageSending ? "Sending..." : "Send"}
                </button>
              </div>
              ${privateMessageStatus ? html`<div className="muted">${privateMessageStatus}</div>` : html``}
            </div>`}
      <//>
      <${PopUp}
        show=${showConnectHelp}
        onClose=${() => setShowConnectHelp(false)}
        title="Join via Direct Connect"
        className="connect-overlay"
      >
        <div className="connect-help">
          <div className="connect-step">
            <div className="connect-step-title">Step 1: Servers</div>
            <p className="muted">
              Open Hytale and select <strong>Servers</strong>.
            </p>
          </div>
          <div className="connect-step">
            <div className="connect-step-title">Step 2: Add Server</div>
            <p className="muted">
              In <strong>Servers</strong>, click <strong>Add Server</strong>,
              then enter the IP below.
            </p>
            <p className="muted connect-tip">Use <strong>CTRL+V</strong> to paste quickly.</p>
          </div>
          <div className="connect-ip">
            <span className="connect-ip-value">${SERVER_IP}</span>
            <${CopyAction}
              className="connect-ip-copy"
              mode="icon"
              hoverGradient=${true}
              label="Copy IP"
              valueToCopy=${SERVER_IP}
              toastEnabled=${true}
              toastMessage=${`${SERVER_IP} copied to clipboard.`}
              title="Copy IP"
            />
          </div>
        </div>
      <//>
      <${PopUp}
        show=${showChangelog}
        onClose=${() => setShowChangelog(false)}
        title="Changelog"
      >
        <${ChangelogPanel} isAdmin=${isAdmin} />
      <//>
      <${PopUp}
        show=${Boolean(toastErrorDetail)}
        onClose=${() => setToastErrorDetail(null)}
        title="System Notification"
      >
        ${toastErrorDetail
          ? html`<div className="notif-card toast-error-detail-card">
              <div className="notif-title">${toastErrorDetail.title}</div>
              <div className="notif-body">${toastErrorDetail.message}</div>
              <div className="notif-author-row">
                <div className="notif-author">
                  <div className="notif-author-line">
                    <span className="notif-author-prefix">Sent by</span>
                    <span className="notif-author-name-static">System</span>
                  </div>
                  <${TimestampText} value=${toastErrorDetail.createdAt} formatTimestamp=${formatTimestamp} />
                </div>
              </div>
              <div className="comment-actions right">
                <button
                  className="button ghost-btn"
                  type="button"
                  onClick=${() => {
                    const errorId = addSupportErrorContext(toastErrorDetail);
                    setToastErrorDetail(null);
                    if (errorId) {
                      navigate(`/support?attachError=${encodeURIComponent(errorId)}`);
                    } else {
                      navigate("/support");
                    }
                  }}
                >
                  Attach to Support Ticket
                </button>
              </div>
            </div>`
          : html``}
      <//>
      <${ToastSystem}
        toasts=${toasts}
        onDismiss=${dismissToast}
        onOpenDetails=${openToastDetails}
        shape=${toastShape}
      />
    </div>
  `;
}

function App() {
  return html`
    <${BrowserRouter}>
      <${Layout} />
    <//>
  `;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  html`<${ClerkProvider} publishableKey=${PUBLISHABLE_KEY}>
    <${App} />
  <//>`
);
