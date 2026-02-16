import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { createPortal } from "react-dom";
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
import PageHero from "./components/PageHero.js";
import SupportTicketForm from "./components/SupportTicketForm.js";
import SupportTicketThread from "./components/SupportTicketThread.js";
import AppRoutes from "./components/AppRoutes.js";
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
const LOGO_SRC = "/Images/IslandLogo/Hero_Island_Logo.png";
const THEME_KEY = "hardtale-theme";
const NAV_KEY = "hardtale-nav";
const MENU_SIDE_KEY = "hardtale-menu-side";
const MOBILE_NAV_STYLE_KEY = "hardtale-mobile-nav-style";
const TICKET_COOLDOWN_KEY = "hardtale-ticket-cooldown";
const TICKET_COOLDOWN_MS = 60 * 60 * 1000;
const LOGO_SIDE_KEY = "hardtale-logo-side";
const MOBILE_LOGO_STYLE_KEY = "hardtale-mobile-logo-style";
const MOBILE_ISLAND_KEY = "hardtale-mobile-island";
const DESKTOP_STICKY_STYLE_KEY = "hardtale-desktop-sticky-style";
const DESKTOP_STICKY_WIDE_KEY = "hardtale-desktop-sticky-wide";
const DESKTOP_STICKY_LOGO_STYLE_KEY = "hardtale-desktop-sticky-logo-style";
const COMMENTS_TOKEN_TEMPLATE = "hardtale-api-comments";
const UI_FLASH_KEY = "hardtale-ui-flash";
const VERSION = "1.3.26";
const INK_PEN_ICON = "/Images/SVGs/Ink_Pen.svg";
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
};
const DESKTOP_LOGO_MAP = MOBILE_LOGO_MAP;
const CRITICAL_IMAGE_SOURCES = [
  LOGO_SRC,
  "/Images/SVGs/SETTINGS_SVG.svg",
  "/assets/HardTale_H_Fiery.png",
  "/assets/HardTale_H_Golden.png",
  "/assets/HardTale_H_GreyScale.png",
  "/assets/HardTale_H_Icey.png",
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
      "10% passive XP boost, daily 15-min XP boost, weekly kit (small XP potion + minor utility potions), 1 extra /home, cosmetic chat prefix, slight auction/listing boost, no raw damage bonuses, bold badge",
    icon: "star",
  },
  {
    id: "rank-legend",
    name: "Legend Rank",
    price: 14.0,
    blurb:
      "20% passive XP boost, daily 30-min XP boost, weekly kit (medium XP potions + resource bundle), 2 extra /home, 1 monthly global boost (30 min), reduced teleport cooldown, priority queue, bold badge",
    icon: "crown",
  },
  {
    id: "rank-mythic",
    name: "Mythic Rank",
    price: 24.0,
    blurb:
      "30% passive XP boost, daily 1hr XP boost, weekly kit (large XP potions + rare crafting materials), 3 extra /home, 2 monthly global boosts, special cosmetic title glow, particle aura cosmetic, guild banner cosmetic, bold badge",
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
  if (STAFF_EMAILS.has(text)) return true;
  const key = text.replace(/[\s_-]+/g, "");
  return STAFF_USERNAME_KEYS.has(key);
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
    const token = await getToken({ template: COMMENTS_TOKEN_TEMPLATE });
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  const response = await fetch(url, { ...options, headers });
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
          ${item.featured ? html`<span className="news-star" title="Featured">*</span>` : html``}
          <h3>${item.title}</h3>
        </div>
      </div>
      <div className="news-body">
        ${hasLongDescription && !expandedDescription
          ? html`<p className="news-body-paragraph">${visibleDescription}</p>`
          : renderNewsRichText(visibleDescription)}
      </div>
      ${hasLongDescription
        ? html`<button
            type="button"
            className="ghost-btn news-read-more-btn"
            onClick=${() => setExpandedDescription((prev) => !prev)}
          >
            ${expandedDescription ? "Show less" : "Read more"}
          </button>`
        : html``}
      <div className="news-meta">
        <span>
          By <${AuthorName} value=${item.author} isStaffLabel=${isStaffLabel} />
        </span>
        <${TimestampText} value=${item.createdAt} formatTimestamp=${formatTimestamp} />
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
  const { openSignIn } = useClerk();
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
  const [profileTitleStatus, setProfileTitleStatus] = useState("");
  const [profileTitleSaving, setProfileTitleSaving] = useState(false);
  const [profileStaffGradientSaving, setProfileStaffGradientSaving] = useState(false);
  const [profileRankEffectsSaving, setProfileRankEffectsSaving] = useState(false);
  const [profileAvatarVfxSaving, setProfileAvatarVfxSaving] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [replyTargets, setReplyTargets] = useState({});
  const focusAppliedRef = useRef(false);
  const isForumThread = String(newsId || "").startsWith("forum:");

  async function loadComments() {
    try {
      const response = await fetch(`/api/comments?newsId=${encodeURIComponent(newsId)}`);
      if (!response.ok) return;
      const data = await response.json();
      const next = Array.isArray(data.comments) ? data.comments : [];
      setComments(next);
      setCommentCount(next.length);
    } catch {}
  }

  useEffect(() => {
    loadComments();
  }, [newsId]);

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
    const staffIdentity = STAFF_EMAILS.has(email) || isStaffLabel(username) || isStaffLabel(authorName);
    const showStaffGradient = comment?.authorShowStaffGradient !== false;
    if (staffIdentity && showStaffGradient) {
      return { label: "STAFF", staff: true };
    }
    const rank = comment.authorRank || "Unregistered";
    return { label: rank, staff: false };
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

  function isOriginalPoster(entry) {
    if (!isForumThread || !threadOwnerUserId || !entry?.userId) return false;
    return String(entry.userId) === String(threadOwnerUserId);
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
        availableTitles: availableTitles.length > 0 ? availableTitles : fallbackTitles,
        selectedTitle: selectedTitle || ownedRank || "Unregistered",
        canToggleStaffGradient: Boolean(data?.canToggleStaffGradient),
        showStaffGradient: data?.showStaffGradient !== false,
        canToggleRankEffects: Boolean(data?.canToggleRankEffects),
        showRankEffects: data?.showRankEffects !== false,
        canToggleAvatarVfx: Boolean(data?.canToggleAvatarVfx),
        showAvatarVfx: data?.showAvatarVfx !== false,
      };
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
      const availableRaw = Array.isArray(data?.availableTitles) ? data.availableTitles : [];
      const availableTitles = PROFILE_DISPLAY_TITLES.filter((title) => availableRaw.includes(title));
      setProfileUser((prev) =>
        prev
          ? {
              ...prev,
              rankLabel: selectedTitle,
              availableTitles: availableTitles.length > 0 ? availableTitles : prev.availableTitles,
            }
          : prev,
      );
      setComments((prev) =>
        prev.map((comment) => {
          if (!comment) return comment;
          const nextComment =
            comment.userId === userId ? { ...comment, authorRank: selectedTitle } : comment;
          const replies = Array.isArray(nextComment.replies) ? nextComment.replies : [];
          if (replies.length === 0) return nextComment;
          return {
            ...nextComment,
            replies: replies.map((reply) =>
              reply?.userId === userId ? { ...reply, authorRank: selectedTitle } : reply,
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
              showStaffBadge: showStaffGradient,
              staff: prev.isStaffUser && showStaffGradient,
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
                  authorShowStaffBadge: showStaffGradient,
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
                    authorShowStaffBadge: showStaffGradient,
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
    const rank = resolveRank(entry);
    const isOwn = Boolean(userId && entry.userId && entry.userId === userId);
    const email = String(entry.authorEmail || "").toLowerCase();
    const username = String(entry.authorUsername || "").toLowerCase();
    const authorName = String(entry.authorName || "").toLowerCase();
    const isStaffUser = STAFF_EMAILS.has(email) || isStaffLabel(username) || isStaffLabel(authorName);
    let availableTitles = [];
    let selectedTitle = rank.label;
    let canToggleStaffGradient = false;
    let showStaffGradient = entry?.authorShowStaffGradient !== false;
    let canToggleRankEffects = false;
    let showRankEffects = entry?.authorShowRankEffects !== false;
    let canToggleAvatarVfx = false;
    let showAvatarVfx = entry?.authorShowAvatarVfx !== false;
    if (isOwn && isSignedIn) {
      const settings = await loadOwnProfileTitleSettings();
      if (settings) {
        availableTitles = settings.availableTitles;
        selectedTitle = settings.selectedTitle || rank.label;
        canToggleStaffGradient = Boolean(settings.canToggleStaffGradient);
        showStaffGradient = settings.showStaffGradient !== false;
        canToggleRankEffects = Boolean(settings.canToggleRankEffects);
        showRankEffects = settings.showRankEffects !== false;
        canToggleAvatarVfx = Boolean(settings.canToggleAvatarVfx);
        showAvatarVfx = settings.showAvatarVfx !== false;
      }
    }
    if (isOwn && availableTitles.length === 0 && selectedTitle) {
      availableTitles = [selectedTitle];
    }
    setProfileTitleStatus("");
    setProfileUser({
      name: String(entry.authorName || "User"),
      image: String(entry.authorImage || "/assets/HardTale_H_GreyScale.png"),
      rankLabel: selectedTitle,
      staff: isStaffUser && showStaffGradient,
      username: formatUsernameForDisplay(entry.authorUsername),
      isOwn,
      isStaffUser,
      availableTitles,
      canToggleStaffGradient,
      showStaffGradient,
      showStaffBadge: showStaffGradient,
      canToggleRankEffects,
      showRankEffects,
      canToggleAvatarVfx,
      showAvatarVfx,
    });
    setProfileOpen(true);
  }

  return html`
    <div className="comment-thread">
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
                        onClick=${() => openProfileCard(comment)}
                        title="Open profile card"
                      >
                        <img
                          className=${avatarClassName(comment, false)}
                          src=${comment.authorImage || "/assets/HardTale_H_GreyScale.png"}
                          alt=${comment.authorName}
                        />
                      </button>
                      <${CommentIdentity}
                        entry=${comment}
                        rank=${resolveRank(comment)}
                        authorSizeClass=${authorSizeClass}
                        showOpBadge=${isOriginalPoster(comment)}
                      />
                      <${CommentMeta}
                        entry=${comment}
                        formatTimestamp=${formatTimestamp}
                        variant="mobile"
                      />
                    </div>
                    <div className="comment-right">
                      <div className="comment-header-desktop">
                        <div className="comment-header-main">
                          <${CommentIdentity}
                            entry=${comment}
                            rank=${resolveRank(comment)}
                            authorSizeClass=${authorSizeClass}
                            showOpBadge=${isOriginalPoster(comment)}
                          />
                        </div>
                        ${isForumThread
                          ? html`<button
                              className="comment-profile-peek"
                              type="button"
                              onClick=${() => openProfileCard(comment)}
                              title="Open profile card"
                              aria-label="Open profile card"
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  fill="currentColor"
                                  d="M12 3a5 5 0 100 10 5 5 0 000-10zm0 12c-4.2 0-7.5 2.2-8.6 5.4-.2.6.3 1.1.9 1.1h15.4c.6 0 1.1-.6.9-1.1C19.5 17.2 16.2 15 12 15z"
                                />
                              </svg>
                            </button>`
                          : html``}
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
                        : html`<p className=${`comment-text ${resolveRank(comment).staff ? "staff" : ""}`}>
                            ${comment.body}
                          </p>`}
                      ${actionStatusByComment[comment.id]
                        ? html`<div className="muted comment-inline-status">
                            ${actionStatusByComment[comment.id]}
                          </div>`
                        : html``}
                      ${(editingId !== comment.id && (comment.userId === userId || (isSignedIn && !commentsLocked)))
                        ? html`<div className="comment-controls right">
                            ${comment.userId === userId
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
                                  className="ghost-btn"
                                  type="button"
                                  onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                                  onClick=${() => deleteComment(comment.id)}
                                >
                                  Delete
                                </button>`
                              : html``}
                            ${isSignedIn && !commentsLocked
                              ? html`<button
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
                                        onClick=${() => openProfileCard(reply)}
                                        title="Open profile card"
                                      >
                                        <img
                                          className=${avatarClassName(reply, true)}
                                          src=${reply.authorImage || "/assets/HardTale_H_GreyScale.png"}
                                          alt=${reply.authorName}
                                        />
                                      </button>
                                      <${CommentIdentity}
                                        entry=${reply}
                                        rank=${resolveRank(reply)}
                                        authorSizeClass=${authorSizeClass}
                                        showOpBadge=${isOriginalPoster(reply)}
                                      />
                                      <${CommentMeta}
                                        entry=${reply}
                                        formatTimestamp=${formatTimestamp}
                                        variant="mobile"
                                      />
                                    </div>
                                    <div className="comment-right">
                                      <div className="comment-header-desktop">
                                        <div className="comment-header-main">
                                          <${CommentIdentity}
                                            entry=${reply}
                                            rank=${resolveRank(reply)}
                                            authorSizeClass=${authorSizeClass}
                                            showOpBadge=${isOriginalPoster(reply)}
                                          />
                                        </div>
                                        ${isForumThread
                                          ? html`<button
                                              className="comment-profile-peek"
                                              type="button"
                                              onClick=${() => openProfileCard(reply)}
                                              title="Open profile card"
                                              aria-label="Open profile card"
                                            >
                                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path
                                                  fill="currentColor"
                                                  d="M12 3a5 5 0 100 10 5 5 0 000-10zm0 12c-4.2 0-7.5 2.2-8.6 5.4-.2.6.3 1.1.9 1.1h15.4c.6 0 1.1-.6.9-1.1C19.5 17.2 16.2 15 12 15z"
                                                />
                                              </svg>
                                            </button>`
                                          : html``}
                                      </div>
                                      <${CommentMeta}
                                        entry=${reply}
                                        formatTimestamp=${formatTimestamp}
                                        variant="desktop"
                                      />
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
                                            <p className=${`comment-text ${resolveRank(reply).staff ? "staff" : ""}`}>
                                              ${reply.body}
                                            </p>
                                          </div>`}
                                      ${(editingReplyKey !== `${comment.id}:${reply.id}` &&
                                      (reply.userId === userId || (isSignedIn && !commentsLocked)))
                                        ? html`<div className="comment-controls right">
                                            ${reply.userId === userId
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
                                                  className="ghost-btn"
                                                  type="button"
                                                  onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                                                  onClick=${() => deleteReply(comment.id, reply.id)}
                                                >
                                                  Delete
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
        title="Profile Card"
      >
        ${profileUser
          ? html`<div className="profile-card">
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
                } rank-${String(profileUser.rankLabel || "Unregistered")
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`.trim()}
              >
                ${profileUser.name}
              </div>
              ${profileUser.username
                ? html`<div className="profile-card-username">@${profileUser.username}</div>`
                : html``}
              <div
                className=${`comment-rank ${
                  profileUser.staff ? "staff" : ""
                } profile-card-rank ${
                  profileUser.showRankEffects === false ? "rank-effects-off" : ""
                } rank-${String(profileUser.rankLabel || "Unregistered")
                  .trim()
                  .toLowerCase()
                  .replace(/[^a-z0-9]+/g, "-")}`.trim()}
              >
                ${(() => {
                  const iconType = getRankIconType(profileUser.rankLabel || "");
                  return html`
                    ${iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
                    <span>${profileUser.rankLabel}</span>
                  `;
                })()}
              </div>
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
                      ).map((title) => html`<option value=${title}>${title}</option>`)}
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
              ${profileUser.isOwn && profileUser.canToggleStaffGradient
                ? html`<label className="profile-card-toggle">
                    <input
                      type="checkbox"
                      checked=${profileUser.showStaffGradient !== false}
                      disabled=${profileStaffGradientSaving}
                      onChange=${(event) => updateOwnStaffGradientVisibility(event.target.checked)}
                    />
                    <span>Enable staff gradient</span>
                  </label>`
                : html``}
              ${profileTitleStatus && profileUser.isOwn
                ? html`<div className="muted profile-card-title-status">${profileTitleStatus}</div>`
                : html``}
              ${profileUser.isStaffUser && profileUser.showStaffGradient !== false
                ? html`<div className="profile-card-badge">Hardtale Staff Member</div>`
                : html``}
            </div>`
          : html``}
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
                      <div className="muted">${formatTimestamp(entry.createdAt)}</div>
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
      alert("Failed to delete news.");
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
      alert("Failed to update featured status.");
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
      alert("Failed to update comment lock.");
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
      alert("Failed to delete notification.");
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
      alert("Failed to update featured status.");
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
                    ${item.featured
                      ? html`<span className="news-star" title="Featured">â˜…</span>`
                      : html``}
                    <h3>${item.title}</h3>
                  </div>
                  <button
                    className="ghost-btn"
                    type="button"
                    onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                    onClick=${() => deleteNews(item.id)}
                  >
                    Delete
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
                    ${item.featured
                      ? html`<span className="news-star" title="Featured">â˜…</span>`
                      : html``}
                    <h3>${item.title}</h3>
                  </div>
                  <button
                    className="ghost-btn"
                    type="button"
                    onMouseDown=${(event) => triggerFlash(event.currentTarget)}
                    onClick=${() => deleteNotification(item.id)}
                  >
                    Delete
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
  onOpenChange,
  isMobile,
}) {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const [showDesktopLogoPicker, setShowDesktopLogoPicker] = useState(false);
  const menuRef = useRef(null);
  const isMobileView =
    typeof window !== "undefined"
      ? isMobile || window.matchMedia("(max-width: 860px)").matches
      : isMobile;

  useEffect(() => {
    function onDocClick(event) {
      if (!open) return;
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
        if (onOpenChange) onOpenChange(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

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
    <div className="settings" ref=${menuRef}>
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
        <img className="settings-icon" src="/Images/SVGs/SETTINGS_SVG.svg" alt="" />
      </button>
      ${open
        ? html`<div className=${`settings-menu ${!isMobileView && placement === "right" ? "menu-right" : ""} ${!isMobileView && desktopStickyWide ? "menu-short" : ""}`}>
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
                        onClick=${() => setUiFlashEnabled(!uiFlashEnabled)}
                        title="Toggle click flash"
                      ></button>
                    </div>
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
                      onClick=${() => setShowMobileIsland(!showMobileIsland)}
                      title="Toggle floating island"
                    ></button>
                  </div>
                </div>`
              : html``}
          </div>`
        : html``}
    </div>
  `;
}

function CartButton({ onClick, count }) {
  return html`
    <button
      className=${`settings-button cart-button ${count > 0 ? "cart-pop" : ""}`}
      title="Cart"
      onClick=${onClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM6.2 6h15.1l-1.6 8.1a2 2 0 0 1-2 1.6H8.1a2 2 0 0 1-2-1.6L4.4 3H2V1h3a1 1 0 0 1 1 .8L6.2 6z" />
      </svg>
      ${count > 0 ? html`<span className="cart-badge" key=${count}>${count}</span>` : html``}
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
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22a2.5 2.5 0 0 0 2.4-2H9.6A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 1 0-14 0v5L3 18v1h18v-1l-2-2z" />
      </svg>
      ${count > 0 ? html`<span className="cart-badge notif-badge">${count}</span>` : html``}
    </button>
  `;
}

function PopUp({ show, onClose, title, children, className = "" }) {
  if (!show) return null;
  return createPortal(html`
    <div className=${`popup-overlay ${className}`} onClick=${onClose}>
      <div className="popup" onClick=${(event) => event.stopPropagation()}>
        <div className="popup-header">
          <div className="section-title">${title}</div>
          <button className="popup-close" onClick=${onClose} aria-label="Close">
            X
          </button>
        </div>
        ${children}
      </div>
    </div>
  `, document.body);
}

function LoadingScreen({ show, variant }) {
  if (!show) return null;
  return html`
    <div className="hardtale-loader-overlay" role="status" aria-live="polite">
      <${HardtaleLoader} variant=${variant} />
    </div>
  `;
}

function StorePage({ onAdd }) {
  const [showTicket, setShowTicket] = useState(false);
  const [message, setMessage] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownLeft, setCooldownLeft] = useState(0);
  const [ticketSent, setTicketSent] = useState(false);
  const location = useLocation();
  const { user } = useUser();
  const email = getUserEmail(user);

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

  return html`
    <section className="card fade-in">
      <div className="section-title">Hardtale Store</div>
      <div className="store-grid">
        ${SAMPLE_STORE.map(
          (item) => html`<div key=${item.id} className="store-card">
            <div className="store-icon">
              ${renderStoreIcon(item.icon)}
            </div>
            <div className="store-name">${item.name}</div>
            <div className="store-desc">
              <div className="store-perks">
                ${perkBullets(item.blurb).map(
                  (perk) => html`<div>${capitalizePerk(perk)}</div>`,
                )}
              </div>
            </div>
            <div className="store-price">$${item.price.toFixed(2)}</div>
            <button className="button store-cta" onClick=${() => onAdd(item)}>
              Add to cart
            </button>
          </div>`,
        )}
      </div>
      <p className="muted store-support-note">
        Support the server and become a local Hero, Legend, or Mythic by giving global boosts to the entire server.
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
  const { openSignIn } = useClerk();
  const navigate = useNavigate();
  const [showTicketModal, setShowTicketModal] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [selectedTicketId, setSelectedTicketId] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCategory, setNewCategory] = useState("support");
  const [newBody, setNewBody] = useState("");
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

  async function submitTicket(event) {
    event.preventDefault();
    if (!isSignedIn) return;
    if (!newSubject.trim() || !newBody.trim()) return;
    setStatus("Creating ticket...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/forum/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          body: newBody,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const created = data.ticket;
      setNewSubject("");
      setNewCategory("support");
      setNewBody("");
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

function ForumPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, getToken } = useAuth();
  const { openSignIn } = useClerk();
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
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostBody, setNewPostBody] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [selectedPostLoading, setSelectedPostLoading] = useState(false);

  function getForumPreviewText(body, limit = 220) {
    const text = String(body || "").trim();
    if (!text) return "";
    if (text.length <= limit) return text;
    return `${text.slice(0, limit).trimEnd()}...`;
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
    if (!newPostTitle.trim() || !newPostBody.trim()) return;
    setCreateStatus("Posting...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/forum/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          section: selectedSectionId,
          title: newPostTitle,
          body: newPostBody,
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
                    <img
                      className="forum-post-author-avatar"
                      src=${selectedPost.authorImage || "/assets/HardTale_H_GreyScale.png"}
                      alt=${selectedPost.authorName || "User"}
                    />
                    <span className="muted">By</span>
                    <${AuthorName} value=${selectedPost.authorName || "User"} isStaffLabel=${isStaffLabel} />
                    <span className="forum-post-op">OP</span>
                    <${TimestampText} value=${selectedPost.createdAt} formatTimestamp=${formatTimestamp} />
                  </div>
                  <div className="forum-post-header-divider"></div>
                  <div className="news-header">
                    <div className="news-title-row">
                      <h3>${selectedPost.title}</h3>
                    </div>
                  </div>
                  <p className="news-body-paragraph">${selectedPost.body}</p>
                  <${CommentThread}
                    newsId=${`forum:${selectedPost.id}`}
                    autoOpen=${true}
                    threadOwnerUserId=${selectedPost.createdBy || selectedPost.authorUserId || ""}
                  />
                </article>`}
          </section>
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
          <div className="section-title">Posts in ${selectedSection.title}</div>
          ${postsLoading
            ? html`<p className="muted">Loading posts...</p>`
            : posts.length === 0
            ? html`<p className="muted">No posts yet. Be the first to start this section.</p>`
            : html`<div className="news-list">
                ${posts.map(
                  (post) => html`<article key=${post.id} className="news-card forum-post-card">
                    <${Link}
                      className="forum-post-link"
                      to=${`/forum?section=${encodeURIComponent(selectedSectionId)}&post=${encodeURIComponent(post.id)}`}
                    >
                      <div className="forum-post-author-row">
                        <img
                          className="forum-post-author-avatar"
                          src=${post.authorImage || "/assets/HardTale_H_GreyScale.png"}
                          alt=${post.authorName || "User"}
                        />
                        <span className="muted">By</span>
                        <${AuthorName} value=${post.authorName || "User"} isStaffLabel=${isStaffLabel} />
                        <span className="forum-post-op">OP</span>
                        <${TimestampText} value=${post.createdAt} formatTimestamp=${formatTimestamp} />
                      </div>
                      <div className="forum-post-header-divider"></div>
                      <div className="news-header">
                        <div className="news-title-row">
                          <h3>${post.title}</h3>
                        </div>
                      </div>
                      <p className="news-body-paragraph forum-post-preview">${getForumPreviewText(post.body)}</p>
                    </${Link}>
                  </article>`,
                )}
              </div>`}
          ${postsStatus ? html`<div className="muted">${postsStatus}</div>` : html``}
        </section>

        <${PopUp}
          show=${showCreateModal}
          onClose=${() => setShowCreateModal(false)}
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
            <textarea
              rows="5"
              placeholder="Write your post..."
              value=${newPostBody}
              onInput=${(event) => setNewPostBody(event.target.value)}
              maxLength="4000"
              required
            ></textarea>
            <div className="comment-actions right">
              <span className="muted">Posting as ${getUserDisplayName(user)}</span>
              <button className="button primary" type="submit">Post</button>
            </div>
            ${createStatus ? html`<div className="muted">${createStatus}</div>` : html``}
          </form>
        <//>
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

function ChangelogPanel() {
  return html`
    <div className="changelog-list">
      ${CHANGELOG_ENTRIES.map(
        (entry) => html`<div key=${entry.version} className="changelog-entry">
          <div className="changelog-header">
            <div className="changelog-version">v${entry.version}</div>
            <div className="changelog-date">${entry.date}</div>
          </div>
          <ul className="changelog-items">
            ${entry.items.map(
              (item, index) => html`<li key=${`${entry.version}-${index}`}>${item}</li>`,
            )}
          </ul>
          <${ReactionBar} itemType="changelog" itemId=${entry.version} />
        </div>`,
      )}
    </div>
  `;
}

function SubscriptionsPage() {
  const [showPortal, setShowPortal] = useState(false);

  return html`
    <section className="subscriptions-page fade-in">
      <div className="subscriptions-hero card">
        <div>
          <div className="subscriptions-eyebrow">Subscription Portal</div>
          <h1>Manage your plan</h1>
          <p className="muted">
            Keep your membership active, change tiers, or update billing in one secure place.
          </p>
        </div>
        <div className="subscriptions-hero-actions">
          <button className="button primary" onClick=${() => setShowPortal(true)}>Open Portal</button>
          <button className="button ghost-btn">View Invoice History</button>
        </div>
      </div>

      <div className="subscriptions-grid">
        <section className="card subscription-card">
          <div className="subscription-badge">Active</div>
          <div className="subscription-title">Legend Membership</div>
          <div className="subscription-price">$14.99 / month</div>
          <div className="subscription-meta muted">Renews on Mar 11, 2026</div>
          <div className="subscription-actions">
            <button className="button">Change Plan</button>
            <button className="button ghost-btn">Pause</button>
          </div>
        </section>

        <section className="card subscription-card">
          <div className="subscription-title">Billing</div>
          <div className="billing-row">
            <span className="muted">Payment method</span>
            <span>Visa â€¢â€¢â€¢â€¢ 2384</span>
          </div>
          <div className="billing-row">
            <span className="muted">Billing email</span>
            <span>hardtaleserver@gmail.com</span>
          </div>
          <div className="billing-row">
            <span className="muted">Next charge</span>
            <span>$14.99</span>
          </div>
          <button className="button">Update Billing</button>
        </section>

        <section className="card subscription-card">
          <div className="subscription-title">Perks & Access</div>
          <ul className="subscription-perks">
            <li>Weekly cosmetics drop</li>
            <li>Priority login queue</li>
            <li>Exclusive Discord role</li>
            <li>Monthly kit refresh</li>
          </ul>
          <button className="button ghost-btn">View Perk Details</button>
        </section>
      </div>
    </section>

    <${PopUp} show=${showPortal} onClose=${() => setShowPortal(false)} title="Subscription Portal">
      <div className="portal-modal">
        <div className="portal-section">
          <div className="portal-title">Secure Dashboard</div>
          <p className="muted">
            This is a mock portal preview. Connect your billing provider to launch the live
            subscription dashboard.
          </p>
        </div>
        <div className="portal-grid">
          <div className="portal-card">
            <div className="portal-card-title">Plan controls</div>
            <div className="muted">Upgrade, downgrade, pause, or cancel.</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-title">Billing updates</div>
            <div className="muted">Edit cards, billing email, and address.</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-title">Invoice history</div>
            <div className="muted">Download receipts and tax invoices.</div>
          </div>
        </div>
        <div className="portal-actions">
          <button className="button primary">Launch Live Portal</button>
          <button className="button ghost-btn" onClick=${() => setShowPortal(false)}>Close</button>
        </div>
      </div>
    <//>
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
  const { openSignIn } = useClerk();
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
      alert("Clipboard blocked. Copy manually.");
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
    setTicketStatus("Creating ticket...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/forum/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: newSubject,
          category: newCategory,
          body: newBody,
        }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      const created = data.ticket;
      setNewSubject("");
      setNewCategory("support");
      setNewBody("");
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
              <button className="button primary" onClick=${() => navigate("/")}>
                Return to Spawn
              </button>
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
  const gradientId = `store-icon-gradient-${type}`;
  const gradient = html`<defs>
    <linearGradient id=${gradientId} x1="100%" y1="50%" x2="0%" y2="50%">
      <stop offset="0%" stop-color="var(--accent-2)" />
      <stop offset="100%" stop-color="var(--accent)" />
    </linearGradient>
  </defs>`;
  switch (type) {
    case "crown":
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        ${gradient}
        <path fill=${`url(#${gradientId})`} d="M3 7l4 3 5-6 5 6 4-3-2 12H5L3 7zm4 12h10l.3-2H6.7l.3 2z" />
      </svg>`;
    case "shield":
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        ${gradient}
        <path
          fill=${`url(#${gradientId})`}
          d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3zm0 4.1L7 7.8V11c0 3.6 2.2 6.8 5 8 2.8-1.2 5-4.4 5-8V7.8l-5-1.7z"
        />
      </svg>`;
    case "star":
    default:
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        ${gradient}
        <path fill=${`url(#${gradientId})`} d="M12 2l2.5 6.2 6.7.6-5.1 4.3 1.6 6.5-5.7-3.6-5.7 3.6 1.6-6.5-5.1-4.3 6.7-.6L12 2z" />
      </svg>`;
  }
}

function getRankIconType(label) {
  const normalized = String(label || "").trim().toLowerCase();
  if (normalized === "hero") return "star";
  if (normalized === "legend") return "crown";
  if (normalized === "mythic") return "shield";
  return "";
}

function renderRankIcon(type) {
  switch (type) {
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
    default:
      return html``;
  }
}

function NotificationsPanel({ notifications, onView }) {
  if (!notifications.length) {
    return html`<p className="muted">No notifications yet.</p>`;
  }

  return html`
    <div className="notif-list">
      ${notifications.map(
        (item) => html`<div key=${item.id} className="notif-card">
          <div className="notif-title">
            ${item.featured ? html`<span className="news-star mini" title="Featured">â˜…</span>` : html``}
            ${item.title}
          </div>
          <div className="notif-body">${item.message}</div>
          <div className="notif-author">
            <${TimestampText} value=${item.createdAt} formatTimestamp=${formatTimestamp} />
            <span>
              Sent by <${AuthorName} value=${item.author} isStaffLabel=${isStaffLabel} />
            </span>
          </div>
          ${item.readMoreUrl
            ? html`<div className="notif-actions">
                <button className="ghost-btn" type="button" onClick=${() => onView(item)}>
                  View
                </button>
              </div>`
            : html``}
        </div>`,
      )}
    </div>
  `;
}

function HomePage({
  news,
  loading,
  error,
  playRef,
  onPlayClick,
  onNewsClick,
  onHowClick,
}) {
  const navigate = useNavigate();
  const [forumPreview, setForumPreview] = useState([]);
  const [forumLoading, setForumLoading] = useState(true);

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
          <div className="ip">${SERVER_IP}</div>
          <div className="join-row">
            <strong>Join now</strong>
            <button
              className="button ghost-btn how-btn"
              type="button"
              onClick=${onHowClick}
            >
              How?
            </button>
            <button
              className="button primary copy-ip-btn hero-action-btn"
              onClick=${() => navigator.clipboard.writeText(SERVER_IP)}
            >
              Copy IP
            </button>
          </div>
          <div className="server-pill">
            <span className="server-status"><span className="dot"></span> Server online</span>
            <span className="server-players">Active Players: ${PLAYER_COUNT}</span>
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

      <section className="grid fade-in">
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

      <section className="home-split fade-in">
        <div className="card news-sidebar">
          <div className="section-title">News & Updates</div>
          ${loading
            ? html`<p className="muted">Loading latest news...</p>`
            : error
            ? html`<p className="muted">${error}</p>`
            : news.length === 0
            ? html`<p className="muted">No news yet. Check back soon.</p>`
            : html`<div className="news-mini">
                ${news.slice(0, 3).map(
                  (item) => html`<div key=${item.id} className="news-mini-row">
                    <div className="mini-row-head">
                      <div className="news-mini-title">
                        ${item.featured ? html`<span className="news-star mini" title="Featured">*</span>` : html``}
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
                  </div>`,
                )}
              </div>`}
          <button className="button ghost-btn" onClick=${onNewsClick}>
            View all news
          </button>
        </div>

        <div className="card news-sidebar">
          <div className="section-title">Forum Highlights</div>
          ${forumLoading
            ? html`<p className="muted">Loading forum highlights...</p>`
            : forumPreview.length === 0
            ? html`<p className="muted">No forum posts yet. Be the first to post.</p>`
            : html`<div className="news-mini">
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
                  </div>`,
                )}
              </div>`}
          <button className="button ghost-btn" type="button" onClick=${() => navigate("/forum")}>
            View forum
          </button>
          <div className="home-leaderstats-note">
            <div className="muted"><strong>Leaderstats</strong> (MMO Trees) integration coming soon.</div>
            <div className="muted">Top player and progression highlights will appear here.</div>
          </div>
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
                Manage
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

function LinkPage() {
  const location = useLocation();
  const { getToken, isSignedIn, isLoaded: isAuthLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const LINK_CODE_LENGTH = 8;
  const LINK_CODE_REGEX = new RegExp(`^[A-Z0-9]{${LINK_CODE_LENGTH}}$`);
  const EMPTY_CODE_ARRAY = useMemo(
    () => Array.from({ length: LINK_CODE_LENGTH }, () => ""),
    [LINK_CODE_LENGTH],
  );
  const inputRefs = useRef([]);

  function normalizeCode(value) {
    return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  function extractCodeFromSearch(search) {
    const rawSearch = String(search || "").replace(/^\?/, "");
    if (!rawSearch) return "";

    let decoded = rawSearch;
    try {
      decoded = decodeURIComponent(rawSearch);
    } catch {}

    const params = new URLSearchParams(rawSearch);
    const candidates = [rawSearch, decoded];
    for (const [key, value] of params.entries()) {
      candidates.push(key, value);
    }
    candidates.push(...rawSearch.split(/[&=]/g), ...decoded.split(/[&=]/g));

    for (const candidate of candidates) {
      const normalized = normalizeCode(candidate);
      if (normalized.length === LINK_CODE_LENGTH && LINK_CODE_REGEX.test(normalized)) {
        return normalized;
      }
      const match = normalized.match(new RegExp(`[A-Z0-9]{${LINK_CODE_LENGTH}}`));
      if (match?.[0]) {
        return match[0];
      }
    }

    return "";
  }

  const [digits, setDigits] = useState(() => {
    const initialCode = extractCodeFromSearch(location.search);
    return initialCode ? initialCode.split("") : [...EMPTY_CODE_ARRAY];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [linkingEnabled, setLinkingEnabled] = useState(true);
  const [linkMode, setLinkMode] = useState("live");
  const [linkedInfo, setLinkedInfo] = useState({
    linked: false,
    maskedPlayerUuid: "",
    playerName: "",
  });
  const fullCode = digits.join("");
  const isComplete = fullCode.length === LINK_CODE_LENGTH && LINK_CODE_REGEX.test(fullCode);

  useEffect(() => {
    const parsedCode = extractCodeFromSearch(location.search);
    if (!parsedCode) return;
    setDigits(parsedCode.split(""));
  }, [location.search, LINK_CODE_LENGTH]);

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
      }
    }
    loadStatus();
    return () => {
      cancelled = true;
    };
  }, [isAuthLoaded, isSignedIn, getToken]);

  function setDigitAt(index, value) {
    const next = [...digits];
    next[index] = value;
    setDigits(next);
  }

  function onInput(index, event) {
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
    if (!isSignedIn) {
      setStatusType("error");
      setStatusMessage("Sign in first to link your game account.");
      if (openSignIn) openSignIn({});
      return;
    }
    if (!isComplete || isSubmitting) return;
    setIsSubmitting(true);
    setStatusType("");
    setStatusMessage("");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/link/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        const errorCode = String(data?.code || "").toUpperCase();
        if (errorCode === "INVALID_CODE" || errorCode === "EXPIRED_CODE") {
          setStatusType("error");
          setStatusMessage("Invalid or expired code. Run /link in-game again for a fresh code.");
          return;
        }
        if (errorCode === "ALREADY_USED" || errorCode === "ALREADY_LINKED") {
          setStatusType("error");
          setStatusMessage("This code or game account was already used for linking.");
          return;
        }
        if (errorCode === "RATE_LIMITED" || response.status === 429) {
          setStatusType("error");
          setStatusMessage("Too many attempts. Please wait and try again.");
          return;
        }
        if (errorCode === "SERVER_UNAVAILABLE" || response.status >= 500) {
          setStatusType("error");
          setStatusMessage("Link service is unavailable right now. Try again later.");
          return;
        }
        setStatusType("error");
        setStatusMessage(String(data?.error || "Link failed. Try again."));
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
      setStatusMessage(
        nextMode === "mock"
          ? "Mock link succeeded. This is a simulated result until live server integration is enabled."
          : "Your game account is linked.",
      );
    } catch {
      setStatusType("error");
      setStatusMessage("Link failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return html`
    <section className="link-page fade-in">
      <div className="card link-card">
        <div className="link-eyebrow">Account Linking</div>
        <h1 className="link-title">Link Hardtale UUID to Clerk</h1>
        <p className="link-copy">
          Enter your 8-character link code. This page is prepared for the upcoming HardtaleNetwork plugin auth flow.
        </p>
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
              value=${digit}
              aria-label=${`Link code character ${index + 1}`}
              onInput=${(event) => onInput(index, event)}
              onKeyDown=${(event) => onKeyDown(index, event)}
              onFocus=${(event) => event.target.select()}
            />`,
          )}
        </div>
        <div className="link-actions">
          <button
            className="button primary"
            type="button"
            disabled=${!isComplete || isSubmitting}
            onClick=${onVerifyClick}
          >
            ${isSubmitting ? (linkMode === "mock" ? "Simulating..." : "Linking...") : linkMode === "mock" ? "Simulate Link Code" : "Verify Link Code"}
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
  const [active, setActive] = useState("home");
  const [hideLogo, setHideLogo] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const { user } = useUser();
  const { getToken, isSignedIn, userId, isLoaded: isAuthLoaded } = useAuth();
  const { openSignIn } = useClerk();
  const [isAdmin, setIsAdmin] = useState(false);
  const [unread, setUnread] = useState(0);
  const [showCart, setShowCart] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [showConnectHelp, setShowConnectHelp] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState("");
  const [appHydrated, setAppHydrated] = useState(false);
  const [authTransitionLoading, setAuthTransitionLoading] = useState(false);
  const [criticalImagesReady, setCriticalImagesReady] = useState(false);
  const [loaderVariant, setLoaderVariant] = useState(LOADER_VARIANTS[0]);
  const [cart, setCart] = useState([]);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [cartStatus, setCartStatus] = useState("");
  const [pendingItem, setPendingItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const shellRef = useRef(null);
  const topbarRef = useRef(null);
  const playRef = useRef(null);
  const initialLoaderStartRef = useRef(Date.now());
  const previousSignedInRef = useRef(null);
  const cartCount = useMemo(() => cart.length, [cart]);
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
        if (alive) setIsAdmin(false);
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
          return;
        }
        const data = await response.json();
        setIsAdmin(Boolean(data?.isAdmin));
      } catch {
        if (!alive) return;
        setIsAdmin(false);
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
    function onScroll() {
      setHideLogo(window.scrollY > 80);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
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

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/" || location.pathname === "/home") {
      setActive("home");
    } else if (location.pathname === "/store") {
      setActive("store");
    } else if (location.pathname === "/news") {
      setActive("news");
    } else if (location.pathname === "/vote") {
      setActive("vote");
    } else if (location.pathname === "/forum") {
      setActive("forum");
    } else if (location.pathname === "/support") {
      setActive("support");
    } else if (location.pathname === "/link") {
      setActive("link");
    }
  }, [location.pathname]);

  useEffect(() => {
    setShowMobileNav(false);
  }, [location.pathname]);

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
    const interval = setInterval(() => {
      fetch("/api/news")
        .then((res) => res.json())
        .then((data) => {
          setNews(Array.isArray(data.news) ? data.news : []);
        })
        .catch(() => {});
      apiFetchWithToken(getToken, true, "/api/notifications")
        .then((res) => (res.ok ? res.json() : { notifications: [] }))
        .then((data) => {
          setNotifications(Array.isArray(data.notifications) ? data.notifications : []);
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [setNews, setNotifications, getToken]);

  useEffect(() => {
    if (!isAuthLoaded) return;
    if (!isSignedIn || !userId) {
      setCart([]);
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
            setCartLoaded(true);
          }
          return;
        }
        const data = await response.json();
        if (!cancelled) {
          setCart(buildCartFromIds(data?.items || []));
          setCartLoaded(true);
        }
      } catch (err) {
        if (!cancelled) {
          setCart([]);
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
    if (!isSignedIn || !userId || !cartLoaded) return;
    apiFetchWithToken(getToken, true, "/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: serializeCartItems(cart) }),
    }).catch(() => {});
  }, [cart, isSignedIn, userId, cartLoaded, getToken]);

  useEffect(() => {
    if (!pendingItem) return;
    if (!isSignedIn) return;
    if (!cartLoaded) return;
    setCart((prev) => applyRankTierRules(prev, pendingItem));
    setPendingItem(null);
    setShowCart(true);
  }, [pendingItem, isSignedIn, cartLoaded]);

  async function markNotificationsRead() {
    if (!isSignedIn || !userId) {
      setUnread(0);
      return;
    }
    const unreadIds = sortedNotifications
      .filter((item) => item?.readByMe !== true)
      .map((item) => String(item?.id || "").trim())
      .filter(Boolean);
    if (unreadIds.length === 0) {
      setUnread(0);
      return;
    }
    try {
      await apiFetchWithToken(getToken, true, "/api/notifications/read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: unreadIds }),
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

  function addToCart(item) {
    if (!isSignedIn) {
      setPendingItem(item);
      if (openSignIn) openSignIn({});
      return;
    }
    setCartStatus("");
    setCart((prev) => applyRankTierRules(prev, item));
    setShowCart(true);
  }


  function total() {
    return cart.reduce((sum, item) => sum + item.price, 0);
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

  function removeItem(id) {
    setCartStatus("");
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  async function checkout() {
    if (!isSignedIn || cart.length === 0) return;
    setCartStatus("Processing checkout...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/cart/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Checkout failed");
      const data = await response.json();
      setCart(buildCartFromIds(data?.cart?.items || []));
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
  const navActive = stickyTransparentActive && showConnectHelp ? "play" : active;
  const desktopStickyLogoVisible = desktopStickyStyle === "solid";
  const desktopStickyLogoSrc = desktopStickyWide
    ? DESKTOP_LOGO_MAP[desktopStickyLogoStyle] || LOGO_SRC
    : LOGO_SRC;
  const desktopStickyLogoClass = desktopStickyWide
    ? desktopStickyLogoStyle.startsWith("icon")
      ? "icon"
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
    if (lockedNavHover) return;
    setHoveredNav(id);
  }

  function DesktopNavShell() {
    const navItems = [
      { id: "home", label: "Home", onClick: () => navigate("/") },
      { id: "news", label: "News & Updates", onClick: () => navigate("/news") },
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
                if (!lockedNavHover) setHoveredNav("");
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
        setSettingsOpen=${setSettingsOpen}
        isMobile=${isMobile}
        notificationCount=${notificationCount}
        openNotifications=${openNotifications}
        cartCount=${cartCount}
        openCart=${openCart}
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
          <${DesktopNavShell} />
          <${DesktopAuthButtonsBlock} />
        </div>
      </div>
    `;
  }

  return html`
    <div className=${`page ${showMobileNav ? "drawer-open" : ""} ${mobileNavStyle === "solid" ? "nav-solid" : "nav-transparent"} ${isMobile && !showMobileIsland ? "hide-mobile-island" : ""}`}>
      <${LoadingScreen} show=${showLoader} variant=${loaderVariant} />
        <div
          className=${`mobile-nav-bar ${mobileNavStyle === "solid" ? "nav-solid" : "nav-transparent"} ${menuSide === "left" ? "nav-left" : "nav-right"} ${mobileNavStyle === "solid" ? "with-mini-logo" : ""}`}
          aria-hidden="true"
        >
          ${mobileNavStyle === "solid"
            ? html`<div className=${`mobile-nav-logo-wrap ${menuSide === "left" ? "logo-right" : ""}`}>
                <img
                  className=${`mobile-nav-logo ${mobileLogoStyle.startsWith("icon") ? "icon" : "logo"}`}
                  src=${MOBILE_LOGO_MAP[mobileLogoStyle] || MOBILE_LOGO_MAP["logo-greyscale"]}
                  alt="Hardtale"
                />
              </div>`
            : html``}
          <div className=${`mobile-top-actions ${menuSide === "left" ? "menu-left" : "menu-right"}`}>
            ${menuSide === "left"
              ? html`
                  <button
                    className="settings-button mobile-menu"
                    title="Menu"
                    onClick=${() => setShowMobileNav(true)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                    </svg>
                  </button>
                  ${cartCount > 0 ? html`<${CartButton} onClick=${openCart} count=${cartCount} />` : html``}
                `
              : html`
                  ${cartCount > 0 ? html`<${CartButton} onClick=${openCart} count=${cartCount} />` : html``}
                  <button
                    className="settings-button mobile-menu"
                    title="Menu"
                    onClick=${() => setShowMobileNav(true)}
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z" />
                    </svg>
                  </button>
                `}
          </div>
        </div>
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
          <${DesktopNavShell} />
          <${DesktopAuthButtonsBlock} />
        </header>

        <${AppRoutes}
          Routes=${Routes}
          Route=${Route}
          HomePage=${HomePage}
          NewsPage=${NewsPage}
          StorePage=${StorePage}
          VotePage=${VotePage}
          ForumPage=${ForumPage}
          SubscriptionsPage=${SubscriptionsPage}
          LinkPage=${LinkPage}
          NotFoundPage=${NotFoundPage}
          sortedNews=${sortedNews}
          loading=${loading}
          error=${error}
          playRef=${playRef}
          openHowModal=${openHowModal}
          navigate=${navigate}
          isAdmin=${isAdmin}
          sortedNotifications=${sortedNotifications}
          setNews=${setNews}
          setNotifications=${setNotifications}
          addToCart=${addToCart}
        />

        <footer className="footer">
          <div className="footer-top">
            <button className="footer-link" type="button" onClick=${() => setShowChangelog(true)}>
              Version ${VERSION}
            </button>
            <span>${`Â© ${year} Hardtale.net`}</span>
          </div>
          <div className="footer-links">
            <${Link} className="footer-link" to="/">Home</${Link}>
            <${Link} className="footer-link" to="/news">News</${Link}>
            <${Link} className="footer-link" to="/store">Store</${Link}>
            <${Link} className="footer-link" to="/vote">Vote</${Link}>
            <${Link} className="footer-link" to="/support">Support</${Link}>
            <${Link} className="footer-link" to="/subscriptions">Subscriptions</${Link}>
          </div>
        </footer>
      </div>

      <div className=${`mobile-drawer ${menuSide === "left" ? "drawer-left" : "drawer-right"} ${showMobileNav ? "open" : ""}`}>
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
                <${SettingsMenu}
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
                  onOpenChange=${setSettingsOpen}
                  isMobile=${isMobile}
                />
                      <${NotificationsButton} count=${notificationCount} onClick=${openNotifications} flashEnabled=${uiFlashEnabled} />
                    <//>
                  `
                : html`
                    <${SignedIn}>
                      <${NotificationsButton} count=${notificationCount} onClick=${openNotifications} flashEnabled=${uiFlashEnabled} />
                      <${SettingsMenu}
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
                        onOpenChange=${setSettingsOpen}
                        isMobile=${isMobile}
                      />
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
                <span className="muted">${displayName}</span>
                <div className="drawer-user-right">
                  <${UserButton} />
                </div>
              </div>
            <//>
          </div>
        </div>
      </div>

      <${PopUp} show=${showCart} onClose=${() => setShowCart(false)} title="Checkout">
        ${cart.length === 0
          ? html`<p className="muted">Your cart is empty.</p>`
          : html`<div className="cart-list">
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
            </div>`}
        ${cartStatus ? html`<div className="muted">${cartStatus}</div>` : html``}
        <button className="button primary" onClick=${checkout} disabled=${cart.length === 0}>
          Checkout
        </button>
      <//>

      <${PopUp}
        show=${showNotifications}
        onClose=${() => setShowNotifications(false)}
        title="Notifications"
      >
        <${NotificationsPanel} notifications=${sortedNotifications} onView=${viewNotification} />
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
            <span>${SERVER_IP}</span>
            <button
              className="button primary"
              onClick=${() => navigator.clipboard.writeText(SERVER_IP)}
            >
              Copy IP
            </button>
          </div>
        </div>
      <//>
      <${PopUp}
        show=${showChangelog}
        onClose=${() => setShowChangelog(false)}
        title="Changelog"
      >
        <${ChangelogPanel} />
      <//>
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



