﻿import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import htm from "htm";
import HardtaleLoader from "./components/HardtaleLoader.js";
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
const NOTIFICATIONS_SEEN_KEY = "hardtale-notifications-seen";
const CART_KEY_PREFIX = "hardtale-cart";
const PURCHASE_KEY_PREFIX = "hardtale-purchases";
const TICKET_COOLDOWN_KEY = "hardtale-ticket-cooldown";
const TICKET_COOLDOWN_MS = 60 * 60 * 1000;
const LOGO_SIDE_KEY = "hardtale-logo-side";
const MOBILE_LOGO_STYLE_KEY = "hardtale-mobile-logo-style";
const MOBILE_ISLAND_KEY = "hardtale-mobile-island";
const DESKTOP_STICKY_STYLE_KEY = "hardtale-desktop-sticky-style";
const DESKTOP_STICKY_WIDE_KEY = "hardtale-desktop-sticky-wide";
const DESKTOP_STICKY_LOGO_STYLE_KEY = "hardtale-desktop-sticky-logo-style";
const COMMENTS_TOKEN_TEMPLATE = "hardtale-api-comments";
const VERSION = "1.3.7";
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
    const normalized = MOBILE_LOGO_MAP[mobileLogoStyle]
      ? mobileLogoStyle
      : "logo-greyscale";
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
    const normalized = DESKTOP_LOGO_MAP[desktopStickyLogoStyle]
      ? desktopStickyLogoStyle
      : "logo-greyscale";
    if (normalized !== desktopStickyLogoStyle) {
      setDesktopStickyLogoStyle(normalized);
      return;
    }
    localStorage.setItem(DESKTOP_STICKY_LOGO_STYLE_KEY, normalized);
  }, [desktopStickyLogoStyle]);

  return { desktopStickyLogoStyle, setDesktopStickyLogoStyle };
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

function getUserDisplayName(user) {
  return user?.fullName || getUserEmail(user) || "User";
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

function NewsCard({ item, onDelete, onToggleFeatured, canDelete }) {
  return html`
    <article className="news-card">
      ${item.imageUrl
        ? html`<div className="news-photo" style=${{ backgroundImage: `url(${item.imageUrl})` }}></div>`
        : html``}
      <div className="news-header">
        <div className="news-title-row">
          ${item.featured ? html`<span className="news-star" title="Featured">★</span>` : html``}
          <h3>${item.title}</h3>
        </div>
        ${canDelete
          ? html`<button className="ghost-btn" onClick=${() => onDelete(item.id)}>
              Delete
            </button>`
          : html``}
      </div>
      <p>${item.description}</p>
      <div className="news-meta">
        <span>By ${item.author} · ${formatTimestamp(item.createdAt)}</span>
        ${item.readMoreUrl
          ? html`<a href=${item.readMoreUrl} target="_blank" rel="noreferrer">
              Read me
            </a>`
          : html`<span></span>`}
      </div>
      ${canDelete
        ? html`<button
            className="ghost-btn news-toggle"
            onClick=${() => onToggleFeatured(item.id, !item.featured)}
          >
            ${item.featured ? "Remove featured" : "Feature this"}
          </button>`
        : html``}
      <${ReactionBar} itemType="news" itemId=${item.id} />
      <${CommentThread} newsId=${item.id} />
    </article>
  `;
}

function ReactionBar({ itemType, itemId }) {
  const { getToken, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const [reactions, setReactions] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [error, setError] = useState("");
  const [EmojiPickerComponent, setEmojiPickerComponent] = useState(null);

  useEffect(() => {
    let alive = true;
    async function loadPicker() {
      try {
        const mod = await import("https://esm.sh/frimousse@0.3.0?bundle");
        if (!alive) return;
        setEmojiPickerComponent(() => mod.EmojiPicker || mod.default || null);
      } catch {}
    }
    loadPicker();
    return () => {
      alive = false;
    };
  }, []);

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
      ${showPicker
        ? html`<div className="reaction-picker">
            ${EmojiPickerComponent
              ? html`<${EmojiPickerComponent.Root} className="reaction-picker-panel">
                  <${EmojiPickerComponent.Search} className="reaction-picker-search" />
                  <${EmojiPickerComponent.Viewport} className="reaction-picker-viewport">
                    <${EmojiPickerComponent.Loading} className="reaction-picker-state">
                      Loading
                    <//>
                    <${EmojiPickerComponent.Empty} className="reaction-picker-state">
                      No emoji found.
                    <//>
                    <${EmojiPickerComponent.List}
                      className="reaction-picker-list"
                      components=${{
                        CategoryHeader: ({ category, ...props }) =>
                          html`<div className="reaction-picker-category" ...${props}>
                            ${category.label}
                          </div>`,
                        Row: ({ children, ...props }) =>
                          html`<div className="reaction-picker-row" ...${props}>${children}</div>`,
                        Emoji: ({ emoji, ...props }) =>
                          html`<button
                            className="reaction-picker-emoji"
                            type="button"
                            ...${props}
                            onClick=${() => {
                              toggleReaction(emoji.emoji);
                              setShowPicker(false);
                            }}
                          >
                            ${emoji.emoji}
                          </button>`,
                      }}
                    />
                  <//>
                <//>`
              : html`<div className="muted">Loading emojis...</div>`}
          </div>`
        : html``}
      ${error ? html`<div className="reaction-error">${error}</div>` : html``}
    </div>
  `;
}

function CommentThread({ newsId }) {
  const { getToken, isSignedIn, userId } = useAuth();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);

  async function loadComments() {
    try {
      const response = await fetch(`/api/comments?newsId=${encodeURIComponent(newsId)}`);
      if (!response.ok) return;
      const data = await response.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch {}
  }

  useEffect(() => {
    if (open) {
      loadComments();
    }
  }, [open, newsId]);

  async function submitComment(event) {
    event.preventDefault();
    if (!isSignedIn) return;
    if (!draft.trim()) return;
    setStatus("Posting...");
    try {
      const response = await apiFetchWithToken(getToken, true, "/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId, text: draft }),
      });
      if (!response.ok) throw new Error("Failed");
      const data = await response.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
      setDraft("");
      setStatus("");
    } catch {
      setStatus("Failed to post.");
    }
  }

  function startEdit(comment) {
    setEditingId(comment.id);
    setEditingText(comment.body);
  }

  async function saveEdit(commentId) {
    if (!editingText.trim()) return;
    setStatus("Saving...");
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
      setStatus("");
    } catch {
      setStatus("Edit failed.");
    }
  }

  async function deleteComment(commentId) {
    setStatus("Deleting...");
    try {
      const response = await apiFetchWithToken(getToken, true, `/api/comments/${commentId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed");
      setComments((prev) => prev.filter((entry) => entry.id !== commentId));
      setStatus("");
    } catch {
      setStatus("Delete failed.");
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

  return html`
    <div className="comment-thread">
      <button className="comment-toggle" type="button" onClick=${() => setOpen(!open)}>
        Comments (${comments.length})
      </button>
      ${open
        ? html`<div className="comment-panel">
            ${isSignedIn
              ? html`<form className="comment-form" onSubmit=${submitComment}>
                  <textarea
                    rows="3"
                    placeholder="Write a comment..."
                    value=${draft}
                    onInput=${(event) => setDraft(event.target.value)}
                  ></textarea>
                  <div className="comment-actions">
                    <button className="button primary" type="submit">Post</button>
                    ${status ? html`<span className="muted">${status}</span>` : html``}
                  </div>
                </form>`
              : html`<div className="comment-signin">
                  <p className="muted">Sign in to join the discussion.</p>
                  <${SignInButton} mode="modal">
                    <button className="button primary">Sign in</button>
                  <//>
                </div>`}
            ${comments.length === 0
              ? html`<p className="muted">No comments yet.</p>`
              : comments.map(
                  (comment) => html`<div key=${comment.id} className="comment-item">
                    <img
                      className="comment-avatar"
                      src=${comment.authorImage || "/assets/HardTale_H_GreyScale.png"}
                      alt=${comment.authorName}
                    />
                    <div className="comment-body">
                      <div className="comment-meta">
                        <span className="comment-author">${comment.authorName}</span>
                        <span className="comment-time">${formatTimestamp(comment.createdAt)}</span>
                        ${comment.editCount > 0
                          ? html`<button
                              className="comment-history-btn"
                              type="button"
                              onClick=${() => openHistory(comment.id)}
                              title="View edits"
                            >
                              ✎ ${comment.editCount}
                            </button>`
                          : html``}
                        ${comment.editCount > 0
                          ? html`<span className="comment-edited">
                              Edited ${formatTimestamp(comment.updatedAt)}
                            </span>`
                          : html``}
                      </div>
                      ${editingId === comment.id
                        ? html`<div className="comment-editor">
                            <textarea
                              rows="3"
                              value=${editingText}
                              onInput=${(event) => setEditingText(event.target.value)}
                            ></textarea>
                            <div className="comment-actions">
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
                        : html`<p className="comment-text">${comment.body}</p>`}
                      ${comment.userId === userId && editingId !== comment.id
                        ? html`<div className="comment-controls">
                            <button className="ghost-btn" type="button" onClick=${() => startEdit(comment)}>
                              Edit
                            </button>
                            <button className="ghost-btn" type="button" onClick=${() => deleteComment(comment.id)}>
                              Delete
                            </button>
                          </div>`
                        : html``}
                    </div>
                  </div>`,
                )}
          </div>`
        : html``}
      <${PopUp}
        show=${historyOpen}
        onClose=${() => setHistoryOpen(false)}
        title="Edit History"
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
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to post");
      }

      const data = await response.json();
      onNewsUpdate(Array.isArray(data.news) ? data.news : []);
      setNewsTitle("");
      setNewsDescription("");
      setNewsReadMoreUrl("");
      setNewsImageUrl("");
      setNewsFeatured(false);
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

  async function deleteNotification(id) {
    try {
      const token = await getToken();
      const response = await fetch(`/api/notifications/${id}`, {
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
      <button className="button primary" type="submit">Post News</button>
      <div className="muted">${newsStatus}</div>
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
                      ? html`<span className="news-star" title="Featured">★</span>`
                      : html``}
                    <h3>${item.title}</h3>
                  </div>
                  <button className="ghost-btn" type="button" onClick=${() => deleteNotification(item.id)}>
                    Delete
                  </button>
                </div>
                <p>${item.message}</p>
                <div className="news-meta">
                  <span>By ${item.author}</span>
                  <span className="notification-timestamp">
                    ${formatTimestamp(item.createdAt)}
                  </span>
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
  isMobile,
}) {
  const [open, setOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [showLogoPicker, setShowLogoPicker] = useState(false);
  const [showDesktopLogoPicker, setShowDesktopLogoPicker] = useState(false);
  const isSystem = theme === "system";
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
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return html`
    <div className="settings" ref=${menuRef}>
      <button
        className=${`settings-button ${spinning ? "spin" : ""}`}
        title="Settings"
        onClick=${() => {
          setOpen(!open);
          setSpinning(true);
          setTimeout(() => setSpinning(false), 420);
        }}
      >
        <img className="settings-icon" src="/Images/SVGs/SETTINGS_SVG.svg" alt="" />
      </button>
      ${open
        ? html`<div className="settings-menu">
            ${!isMobileView
              ? html`
                  <div className="settings-row">
                    <label>Navigation placement</label>
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
                    <label>Desktop sticky style</label>
                    <select
                      value=${desktopStickyStyle}
                      onChange=${(event) => setDesktopStickyStyle(event.target.value)}
                    >
                      <option value="solid">Solid</option>
                      <option value="transparent">Transparent</option>
                    </select>
                  </div>
                  <div className="settings-row">
                    <label>Desktop sticky width</label>
                    <select
                      value=${desktopStickyWide ? "wide" : "normal"}
                      onChange=${(event) =>
                        setDesktopStickyWide(event.target.value === "wide")}
                    >
                      <option value="normal">Normal</option>
                      <option value="wide">Wide</option>
                    </select>
                    <div className="muted">Normal uses the island logo.</div>
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
                    <label>Mobile navbar style</label>
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
                          <label>Mobile logo</label>
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
                    <label>Logo side</label>
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
              <label>Theme</label>
              <select
                value=${theme}
                onChange=${(event) => setTheme(event.target.value)}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="settings-row">
              <label>Quick toggle</label>
              <div className="toggle">
                <span>${theme === "light" ? "Light" : "Dark"}</span>
                <button
                  className=${`switch ${theme === "dark" ? "on" : ""}`}
                  onClick=${toggleLightDark}
                  disabled=${isSystem}
                  title=${isSystem ? "Disable system to toggle" : "Toggle light/dark"}
                ></button>
              </div>
              <div className="muted">System uses device settings (best for mobile).</div>
            </div>
            ${isMobileView
              ? html`<div className="settings-row">
                  <label>Floating island</label>
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

function NotificationsButton({ count, onClick }) {
  return html`
    <button className="settings-button notif" title="Notifications" onClick=${onClick}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22a2.5 2.5 0 0 0 2.4-2H9.6A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 1 0-14 0v5L3 18v1h18v-1l-2-2z" />
      </svg>
      ${count > 0 ? html`<span className="cart-badge notif-badge">${count}</span>` : html``}
    </button>
  `;
}

function PopUp({ show, onClose, title, children, className = "" }) {
  if (!show) return null;
  return html`
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
            <div className="store-desc">${item.blurb}</div>
            <div className="store-price">$${item.price.toFixed(2)}</div>
            <button className="button" onClick=${() => onAdd(item)}>
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
            <span>Visa •••• 2384</span>
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
  notifications,
  onNewsUpdate,
  onNotificationsUpdate,
}) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [timeLabel, setTimeLabel] = useState("");
  const [copyLabel, setCopyLabel] = useState("Copy Crash Log");
  const [command, setCommand] = useState("");
  const [commandStatus, setCommandStatus] = useState("");
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

  function runCommand(value) {
    const next = (value || command).trim();
    if (!next) return;
    if (next === "/support") {
      navigate("/store#ticket");
      return;
    }
    if (next === "/warp spawn") {
      navigate("/");
      return;
    }
    setCommandStatus("Unknown command. Try /support.");
  }

  return html`
    <section className="not-found-world">
      <div className="not-found-wrap">
        <main className="not-found-card" role="main" aria-label="404 error">
          <section className="not-found-left">
            <div className="not-found-badge">
              <span className="not-found-dot"></span>
              WORLDGEN ERROR - CHUNK_NOT_FOUND
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
        ${isAdmin
          ? html`<div className="fade-in">
              <${AdminPanel}
                onNewsUpdate=${onNewsUpdate}
                onNotificationsUpdate=${onNotificationsUpdate}
                notifications=${notifications}
                isAdmin=${isAdmin}
              />
            </div>`
          : html``}
      </div>
    </section>
  `;
}

function renderStoreIcon(type) {
  switch (type) {
    case "crown":
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M3 7l4 3 5-6 5 6 4-3-2 12H5L3 7zm4 12h10l.3-2H6.7l.3 2z" />
      </svg>`;
    case "shield":
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5l8-3zm0 4.1L7 7.8V11c0 3.6 2.2 6.8 5 8 2.8-1.2 5-4.4 5-8V7.8l-5-1.7z" />
      </svg>`;
    case "star":
    default:
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 2l2.5 6.2 6.7.6-5.1 4.3 1.6 6.5-5.7-3.6-5.7 3.6 1.6-6.5-5.1-4.3 6.7-.6L12 2z" />
      </svg>`;
  }
}

function NotificationsPanel({ notifications }) {
  if (!notifications.length) {
    return html`<p className="muted">No notifications yet.</p>`;
  }

  return html`
    <div className="notif-list">
      ${notifications.map(
        (item) => html`<div key=${item.id} className="notif-card">
          <div className="notif-title">
            ${item.featured ? html`<span className="news-star mini" title="Featured">★</span>` : html``}
            ${item.title}
          </div>
          <div className="notif-body">${item.message}</div>
          <div className="notif-author">
            Sent by ${item.author} · ${formatTimestamp(item.createdAt)}
          </div>
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
            <button className="button primary" onClick=${onPlayClick}>
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
              className="button primary copy-ip-btn"
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
              <a className="button primary" href="#" role="button">Join Discord</a>
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
          <div className="section-title">Performance first</div>
          <p className="muted">
            A smooth, lag-free realm with persistent progression across adventures.
          </p>
        </div>
        <div className="card">
          <div className="section-title">True to the game</div>
          <p className="muted">
            Vanilla+ RPG systems that respect the core Hytale experience.
          </p>
        </div>
        <div className="card">
          <div className="section-title">Who we are</div>
          <p className="muted">
            A dedicated team of designers and builders crafting the best RPG SMP.
          </p>
        </div>
      </section>

      <section className="home-split fade-in">
        <div className="card news-sidebar full">
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
                    <div className="news-mini-title">
                      ${item.featured ? html`<span className="news-star mini" title="Featured">★</span>` : html``}
                      ${item.title}
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
      </section>
    </section>
  `;
}

function NewsPage({
  news,
  loading,
  error,
  onDelete,
  onToggleFeatured,
  canDelete,
}) {
  const featuredItem = news.find((item) => item.featured);
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
        </div>
        <div className="news-callout">
          <div className="news-callout-label">Featured</div>
          ${featuredItem
            ? html`<div className="news-callout-title">${featuredItem.title}</div>
                <div className="news-callout-copy">${featuredItem.description}</div>
                ${canDelete
                  ? html`<div className="news-callout-actions">
                      <button
                        className="ghost-btn"
                        onClick=${() => onToggleFeatured(featuredItem.id, false)}
                      >
                        Remove featured
                      </button>
                      <button
                        className="ghost-btn"
                        onClick=${() => onDelete(featuredItem.id)}
                      >
                        Delete
                      </button>
                    </div>`
                  : html``}`
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
                  onDelete=${onDelete}
                  onToggleFeatured=${onToggleFeatured}
                  canDelete=${canDelete}
                />`,
              )}
            </div>`}
      </section>
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
  const [appHydrated, setAppHydrated] = useState(false);
  const [authTransitionLoading, setAuthTransitionLoading] = useState(false);
  const [criticalImagesReady, setCriticalImagesReady] = useState(false);
  const [loaderVariant, setLoaderVariant] = useState(LOADER_VARIANTS[0]);
  const [cart, setCart] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [pendingItem, setPendingItem] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const shellRef = useRef(null);
  const topbarRef = useRef(null);
  const playRef = useRef(null);
  const initialLoaderStartRef = useRef(Date.now());
  const previousSignedInRef = useRef(null);
  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [cart],
  );
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
    }
  }, [location.pathname]);

  useEffect(() => {
    setShowMobileNav(false);
  }, [location.pathname]);

  useEffect(() => {
    if (notificationsLoading) return;
    const lastSeen = localStorage.getItem(NOTIFICATIONS_SEEN_KEY);
    const newest = sortedNotifications[0]?.createdAt;
    if (!newest) {
      setUnread(0);
      return;
    }

    if (!lastSeen || new Date(newest) > new Date(lastSeen)) {
      const count = sortedNotifications.filter(
        (item) => !lastSeen || new Date(item.createdAt) > new Date(lastSeen),
      ).length;
      setUnread(count);
    } else {
      setUnread(0);
    }
  }, [sortedNotifications, notificationsLoading]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("/api/news")
        .then((res) => res.json())
        .then((data) => {
          setNews(Array.isArray(data.news) ? data.news : []);
        })
        .catch(() => {});
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((data) => {
          setNotifications(
            Array.isArray(data.notifications) ? data.notifications : [],
          );
        })
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [setNews, setNotifications]);

  useEffect(() => {
    if (!isSignedIn || !userId) {
      setCart([]);
      setPurchases([]);
      return;
    }
    const stored = localStorage.getItem(`${CART_KEY_PREFIX}:${userId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCart(Array.isArray(parsed) ? parsed : []);
      } catch (err) {
        setCart([]);
      }
    } else {
      setCart([]);
    }
    const storedPurchases = localStorage.getItem(`${PURCHASE_KEY_PREFIX}:${userId}`);
    if (storedPurchases) {
      try {
        const parsedPurchases = JSON.parse(storedPurchases);
        setPurchases(Array.isArray(parsedPurchases) ? parsedPurchases : []);
      } catch (err) {
        setPurchases([]);
      }
    } else {
      setPurchases([]);
    }
  }, [isSignedIn, userId]);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    localStorage.setItem(`${CART_KEY_PREFIX}:${userId}`, JSON.stringify(cart));
  }, [cart, isSignedIn, userId]);

  useEffect(() => {
    if (!isSignedIn || !userId) return;
    localStorage.setItem(`${PURCHASE_KEY_PREFIX}:${userId}`, JSON.stringify(purchases));
  }, [purchases, isSignedIn, userId]);

  useEffect(() => {
    if (!pendingItem) return;
    if (!isSignedIn) return;
    setCart((prev) => [...prev, pendingItem]);
    setPendingItem(null);
    setShowCart(true);
  }, [pendingItem, isSignedIn]);

  function markNotificationsRead() {
    const newest = sortedNotifications[0]?.createdAt;
    if (newest) {
      localStorage.setItem(NOTIFICATIONS_SEEN_KEY, newest);
      setUnread(0);
    }
  }

  async function deleteNews(id) {
    try {
      const token = await getToken();
      const response = await fetch(`/api/news/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Delete failed");
      }

      const data = await response.json();
      setNews(Array.isArray(data.news) ? data.news : []);
    } catch (err) {
      alert("Failed to delete post.");
    }
  }

  function handleLogoError(event) {
    event.currentTarget.style.display = "none";
  }

  function openHowModal() {
    setShowConnectHelp(true);
  }

  async function toggleFeatured(id, featured) {
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

      if (!response.ok) {
        throw new Error("Feature update failed");
      }

      const data = await response.json();
      setNews(Array.isArray(data.news) ? data.news : []);
    } catch (err) {
      alert("Failed to update featured status.");
    }
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
    setCart((prev) => {
      const existingIndex = prev.findIndex((entry) => entry.id === item.id);
      if (existingIndex === -1) {
        return [...prev, { ...item, quantity: 1 }];
      }
      const next = [...prev];
      const current = next[existingIndex];
      next[existingIndex] = { ...current, quantity: (current.quantity || 1) + 1 };
      return next;
    });
    setShowCart(true);
  }


  function total() {
    return cart.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0,
    );
  }

  function openNotifications() {
    setShowNotifications(true);
    markNotificationsRead();
  }

  function incrementItem(id) {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: (item.quantity || 1) + 1 }
          : item,
      ),
    );
  }

  function decrementItem(id) {
    setCart((prev) =>
      prev.flatMap((item) => {
        if (item.id !== id) return [item];
        const nextQuantity = (item.quantity || 1) - 1;
        if (nextQuantity < 1) return [];
        return [{ ...item, quantity: nextQuantity }];
      }),
    );
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  function checkout() {
    if (!isSignedIn || cart.length === 0) return;
    const purchase = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      total: total(),
      title: cart.map((item) => `${item.name} x${item.quantity || 1}`).join(", "),
      items: cart,
    };
    setPurchases((prev) => [purchase, ...prev].slice(0, 20));
    setCart([]);
    setShowCart(false);
  }

  function openCart() {
    if (!isSignedIn) {
      if (openSignIn) openSignIn({});
      return;
    }
    setShowCart(true);
  }

  const notificationCount = unread > 0 ? unread : sortedNotifications.length;
  const year = new Date().getFullYear();
  const displayName = getUserDisplayName(user);
  const showLoader = !appHydrated || authTransitionLoading;
  const desktopStickyVisible = !isMobile && hideLogo;
  const desktopStickyLogoVisible = desktopStickyStyle === "solid";
  const desktopStickyLogoSrc = desktopStickyWide
    ? DESKTOP_LOGO_MAP[desktopStickyLogoStyle] || LOGO_SRC
    : LOGO_SRC;
  const desktopStickyLogoClass = desktopStickyWide
    ? desktopStickyLogoStyle.startsWith("icon")
      ? "icon"
      : "logo"
    : "island";

  function DesktopNavShell() {
    return html`
      <div className=${`nav-shell ${placement === "left" ? "left" : placement === "right" ? "right" : ""}`}>
        <nav className="nav">
          <button
            className=${`nav-link ${active === "home" ? "active" : ""}`}
            onClick=${() => navigate("/")}
          >
            Home
          </button>
          <button
            className=${`nav-link ${active === "news" ? "active" : ""}`}
            onClick=${() => navigate("/news")}
          >
            News & Updates
          </button>
          <button
            className=${`nav-link ${active === "store" ? "active" : ""}`}
            onClick=${() => navigate("/store")}
          >
            Store
          </button>
          <button
            className=${`nav-link ${active === "vote" ? "active" : ""}`}
            onClick=${() => navigate("/vote")}
          >
            Vote
          </button>
          <button
            className=${`nav-link ${active === "play" ? "active" : ""}`}
            onClick=${openHowModal}
          >
            Play
          </button>
        </nav>
      </div>
    `;
  }

  function DesktopAuthButtons() {
    return html`
      <div className="auth-buttons">
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
          isMobile=${isMobile}
        />
        <${ClerkLoading}>
          <button className="button" disabled>Loading auth...</button>
        <//>
        <${ClerkLoaded}>
          <${SignedOut}>
            <${SignUpButton} mode="modal">
              <button className="button primary">Sign up</button>
            <//>
            <${SignInButton} mode="modal">
              <button className="button">Sign in</button>
            <//>
          <//>
          <${SignedIn}>
            <${NotificationsButton} count=${notificationCount} onClick=${openNotifications} />
            ${cartCount > 0 ? html`<${CartButton} onClick=${openCart} count=${cartCount} />` : html``}
            <span className="user-button">
              <${UserButton} />
            </span>
          <//>
        <//>
      </div>
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
          <${DesktopAuthButtons} />
        </div>
      </div>
    `;
  }

  return html`
    <div className=${`page ${showMobileNav ? "drawer-open" : ""} ${mobileNavStyle === "solid" ? "nav-solid" : "nav-transparent"} ${!showMobileIsland ? "hide-mobile-island" : ""}`}>
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
        <${DesktopStickyBar} />
      <div className="glow"></div>
      <div className="sparks"></div>
      <div className="shell" ref=${shellRef}>
        <header className=${`topbar fade-in ${hideLogo ? "logo-hidden" : ""} ${desktopStickyVisible && desktopStickyStyle === "transparent" ? "desktop-sticky-active" : ""} ${!isMobile && logoSide === "right" ? "logo-right" : ""}`} ref=${topbarRef}>
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
          <${DesktopAuthButtons} />
        </header>

        <${Routes}>
          <${Route}
            path="/"
            element=${html`<${HomePage}
              news=${sortedNews}
              loading=${loading}
              error=${error}
              playRef=${playRef}
              onPlayClick=${openHowModal}
              onNewsClick=${() => navigate("/news")}
              onHowClick=${() => setShowConnectHelp(true)}
            />`}
          />
          <${Route}
            path="/home"
            element=${html`<${HomePage}
              news=${sortedNews}
              loading=${loading}
              error=${error}
              playRef=${playRef}
              onPlayClick=${openHowModal}
              onNewsClick=${() => navigate("/news")}
              onHowClick=${() => setShowConnectHelp(true)}
            />`}
          />
          <${Route}
            path="/news"
            element=${html`<${NewsPage}
              news=${sortedNews}
              loading=${loading}
              error=${error}
              onDelete=${deleteNews}
              onToggleFeatured=${toggleFeatured}
              canDelete=${isAdmin}
            />`}
          />
          <${Route}
            path="/store"
            element=${html`<${StorePage} onAdd=${addToCart} />`}
          />
          <${Route}
            path="/vote"
            element=${html`<${VotePage} />`}
          />
          <${Route}
            path="/subscriptions"
            element=${html`<${SubscriptionsPage} />`}
          />
          <${Route}
            path="*"
            element=${html`<${NotFoundPage}
              isAdmin=${isAdmin}
              notifications=${sortedNotifications}
              onNewsUpdate=${setNews}
              onNotificationsUpdate=${setNotifications}
            />`}
          />
        <//>

        <footer className="footer">
          <div className="footer-top">
            <button className="footer-link" type="button" onClick=${() => setShowChangelog(true)}>
              Version ${VERSION}
            </button>
            <span>${`© ${year} Hardtale.net`}</span>
          </div>
          <div className="footer-links">
            <${Link} className="footer-link" to="/">Home</${Link}>
            <${Link} className="footer-link" to="/news">News</${Link}>
            <${Link} className="footer-link" to="/store">Store</${Link}>
            <${Link} className="footer-link" to="/vote">Vote</${Link}>
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
                      ✕
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
                  isMobile=${isMobile}
                />
                      <${NotificationsButton} count=${notificationCount} onClick=${openNotifications} />
                      ${cartCount > 0 ? html`<${CartButton} onClick=${openCart} count=${cartCount} />` : html``}
                    <//>
                  `
                : html`
                    <${SignedIn}>
                      ${cartCount > 0 ? html`<${CartButton} onClick=${openCart} count=${cartCount} />` : html``}
                      <${NotificationsButton} count=${notificationCount} onClick=${openNotifications} />
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
                        isMobile=${isMobile}
                      />
                    <//>
                    <button
                      className="signature-close"
                      aria-label="Close menu"
                      onClick=${() => setShowMobileNav(false)}
                    >
                      ✕
                    </button>
                  `}
            </div>
          </div>
          <div className="mobile-drawer-links">
            <button className="drawer-link" onClick=${() => {
              navigate("/");
              setShowMobileNav(false);
            }}>
              Home
            </button>
            <button className="drawer-link" onClick=${() => {
              navigate("/news");
              setShowMobileNav(false);
            }}>
              News & Updates
            </button>
            <button className="drawer-link" onClick=${() => {
              navigate("/store");
              setShowMobileNav(false);
            }}>
              Store
            </button>
            <button className="drawer-link" onClick=${() => {
              navigate("/vote");
              setShowMobileNav(false);
            }}>
              Vote
            </button>
            <button className="drawer-link" onClick=${() => {
              navigate("/subscriptions");
              setShowMobileNav(false);
            }}>
              Subscriptions
            </button>
            <button className="drawer-link" onClick=${() => {
              setShowConnectHelp(true);
              setShowMobileNav(false);
            }}>
              Play
            </button>
          </div>
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
                    <div className="cart-name">${item.name}</div>
                    ${item.blurb
                      ? html`<ul className="cart-perks">
                          ${perkBullets(item.blurb).map(
                            (perk) => html`<li>
                              ${perk.toLowerCase().includes("bold badge")
                                ? html`<strong>${perk}</strong>`
                                : perk}
                            </li>`,
                          )}
                        </ul>`
                      : html``}
                  </div>
                  <div className="cart-qty">
                    <button className="ghost-btn" onClick=${() => decrementItem(item.id)}>-</button>
                    <span>${item.quantity || 1}</span>
                    <button className="ghost-btn" onClick=${() => incrementItem(item.id)}>+</button>
                  </div>
                  <div className="cart-actions">
                    <span>$${(item.price * (item.quantity || 1)).toFixed(2)}</span>
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
        <button className="button primary" disabled=${cart.length === 0}>
          Checkout
        </button>
      <//>

      <${PopUp}
        show=${showNotifications}
        onClose=${() => setShowNotifications(false)}
        title="Notifications"
      >
        <${NotificationsPanel} notifications=${sortedNotifications} />
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




