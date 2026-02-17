import React, { useEffect } from "react";

const SITE_URL = "https://hardtaleserver.net";
const DEFAULT_IMAGE = `${SITE_URL}/Images/IslandLogo/Hero_Island_Logo.png`;
const TITLE_SUFFIX = " | Hardtale";

function ensureMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    document.head.appendChild(el);
  }
  return el;
}

function ensureCanonical() {
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  return link;
}

function ensureStructuredData() {
  const id = "hardtale-seo-jsonld";
  let script = document.getElementById(id);
  if (!script) {
    script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = id;
    document.head.appendChild(script);
  }
  return script;
}

function getSeoForRoute(pathname, search) {
  const params = new URLSearchParams(search || "");
  const section = String(params.get("section") || "").trim();
  const hasPost = Boolean(String(params.get("post") || "").trim());
  const normalizedPath = String(pathname || "/").toLowerCase();

  if (normalizedPath === "/" || normalizedPath === "/home") {
    return {
      title: "Hardtale | Hytale Vanilla+ RPG SMP | play.hardtale.net",
      description:
        "Hardtale is a Hytale Vanilla+ RPG SMP focused on immersive progression, balanced systems, and community-first gameplay.",
      robots: "index,follow",
    };
  }
  if (normalizedPath === "/news") {
    return {
      title: `News${TITLE_SUFFIX}`,
      description: "Official Hardtale updates, patch notes, announcements, and server news.",
      robots: "index,follow",
    };
  }
  if (normalizedPath === "/store") {
    return {
      title: `Store${TITLE_SUFFIX}`,
      description:
        "Browse Hardtale rank packages and supporter perks with secure checkout and in-game reward delivery.",
      robots: "index,follow",
    };
  }
  if (normalizedPath === "/vote") {
    return {
      title: `Vote${TITLE_SUFFIX}`,
      description: "Support Hardtale by voting on listing sites and help grow the community.",
      robots: "index,follow",
    };
  }
  if (normalizedPath === "/forum") {
    const title = section ? `Forum - ${section.replace(/-/g, " ")}${TITLE_SUFFIX}` : `Forum${TITLE_SUFFIX}`;
    const description = hasPost
      ? "Read and discuss Hardtale forum posts, updates, feedback, and community topics."
      : "Join Hardtale forum discussions for updates, bug reports, suggestions, and support.";
    return { title, description, robots: "index,follow" };
  }
  if (normalizedPath === "/about-us") {
    return {
      title: `About Us${TITLE_SUFFIX}`,
      description:
        "Learn Hardtale's direction: performance-first design, Vanilla+ gameplay, and long-term community focus.",
      robots: "index,follow",
    };
  }
  if (normalizedPath === "/subscriptions") {
    return {
      title: `Subscriptions${TITLE_SUFFIX}`,
      description: "Manage your Hardtale subscriptions and account-linked supporter benefits.",
      robots: "noindex,follow",
    };
  }
  if (normalizedPath === "/link") {
    return {
      title: `Link Account${TITLE_SUFFIX}`,
      description: "Link your website profile to your in-game UUID to unlock linked account features.",
      robots: "noindex,follow",
    };
  }
  return {
    title: `Hardtale`,
    description:
      "Hardtale is a Hytale Vanilla+ RPG SMP focused on balanced systems, progression, and community play.",
    robots: "index,follow",
  };
}

export default function SeoManager({ pathname = "/", search = "" }) {
  useEffect(() => {
    const seo = getSeoForRoute(pathname, search);
    const canonicalHref = `${SITE_URL}${pathname || "/"}${search || ""}`;

    document.title = seo.title;

    const description = ensureMeta('meta[name="description"]', { name: "description" });
    description.setAttribute("content", seo.description);

    const robots = ensureMeta('meta[name="robots"]', { name: "robots" });
    robots.setAttribute("content", seo.robots);

    const ogType = ensureMeta('meta[property="og:type"]', { property: "og:type" });
    ogType.setAttribute("content", "website");

    const ogSite = ensureMeta('meta[property="og:site_name"]', { property: "og:site_name" });
    ogSite.setAttribute("content", "Hardtale");

    const ogTitle = ensureMeta('meta[property="og:title"]', { property: "og:title" });
    ogTitle.setAttribute("content", seo.title);

    const ogDescription = ensureMeta('meta[property="og:description"]', { property: "og:description" });
    ogDescription.setAttribute("content", seo.description);

    const ogUrl = ensureMeta('meta[property="og:url"]', { property: "og:url" });
    ogUrl.setAttribute("content", canonicalHref);

    const ogImage = ensureMeta('meta[property="og:image"]', { property: "og:image" });
    ogImage.setAttribute("content", DEFAULT_IMAGE);

    const twitterCard = ensureMeta('meta[name="twitter:card"]', { name: "twitter:card" });
    twitterCard.setAttribute("content", "summary_large_image");

    const twitterTitle = ensureMeta('meta[name="twitter:title"]', { name: "twitter:title" });
    twitterTitle.setAttribute("content", seo.title);

    const twitterDescription = ensureMeta('meta[name="twitter:description"]', { name: "twitter:description" });
    twitterDescription.setAttribute("content", seo.description);

    const twitterImage = ensureMeta('meta[name="twitter:image"]', { name: "twitter:image" });
    twitterImage.setAttribute("content", DEFAULT_IMAGE);

    const canonical = ensureCanonical();
    canonical.setAttribute("href", canonicalHref);

    const ldJson = ensureStructuredData();
    ldJson.textContent = JSON.stringify(
      {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name: "Hardtale",
        url: SITE_URL,
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/forum?section={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      null,
      0,
    );
  }, [pathname, search]);

  return null;
}
