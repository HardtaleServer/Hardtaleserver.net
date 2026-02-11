import React from "https://esm.sh/react@18.2.0";
import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
} from "https://esm.sh/react-router-dom@6.22.3";

const serverIp = "play.hytale.net";

const navLinkClass = ({ isActive }) =>
  `nav-link${isActive ? " active" : ""}`;

function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <header className="brand">
          <div className="brand-left">
            <div className="logo">H</div>
            <div>
              <div className="title">Hytale Realm</div>
              <div className="sub">Official Community Hub</div>
            </div>
          </div>
          <nav className="nav">
            <NavLink to="/" className={navLinkClass} end>
              Home
            </NavLink>
            <NavLink to="/news" className={navLinkClass}>
              News & Updates
            </NavLink>
          </nav>
          <CopyIpButton className="pill" label="Copy IP" />
        </header>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<NewsPage />} />
        </Routes>

        <footer className="footer">
          <span>A Hytale Experience</span>
          <span>© 2026 Hardtale.net</span>
        </footer>
      </div>
    </BrowserRouter>
  );
}

function CopyIpButton({ className, label }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(serverIp);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button className={className} onClick={handleCopy} disabled={copied}>
      {copied ? "Copied!" : label}
    </button>
  );
}

function Home() {
  return (
    <div className="layout">
      <main className="main">
        <section className="hero">
          <h1>
            Join the adventure on <span>{serverIp}</span>
          </h1>
          <p>
            Explore epic biomes, master new skills, and build with friends on a
            server crafted for unforgettable stories.
          </p>
          <div className="cta-row">
            <a className="cta" href="#connect">
              Get Started
            </a>
            <a className="cta ghost" href="#events">
              Upcoming Events
            </a>
          </div>
        </section>

        <section id="connect" className="grid">
          <div className="card">
            <h2>Server Status</h2>
            <div className="status">
              <span className="dot"></span>
              <span>Online</span>
            </div>
            <p className="muted">Low latency regions · 24/7 moderation</p>
          </div>
          <div className="card">
            <h2>IP Address</h2>
            <div className="ip">{serverIp}</div>
            <CopyIpButton className="ghost-btn" label="Copy IP" />
          </div>
          <div className="card">
            <h2>Quick Links</h2>
            <ul className="links">
              <li>News & patch notes</li>
              <li>Community forums</li>
              <li>Support & rules</li>
            </ul>
          </div>
        </section>

        <section id="events" className="events">
          <div className="card wide">
            <h2>Season Launch Weekend</h2>
            <p>
              New quests, limited cosmetics, and double XP. Bring your party
              and claim your banner.
            </p>
            <div className="meta">Friday 7:00 PM UTC</div>
          </div>
          <div className="card wide">
            <h2>Builder Spotlight</h2>
            <p>Showcase your world on stream and win featured placement.</p>
            <div className="meta">Every Saturday</div>
          </div>
        </section>
      </main>

      <aside className="sidebar">
        <div className="card">
          <div className="sidebar-header">
            <h2>News & Updates</h2>
            <Link className="small-link" to="/news">
              View all
            </Link>
          </div>
          <div className="news-list">
            <article className="news-item">
              <div className="news-title">Patch 1.8: Skyreach Isles</div>
              <div className="news-meta">New biomes · Feb 9</div>
            </article>
            <article className="news-item">
              <div className="news-title">PvP Arenas Open</div>
              <div className="news-meta">Ranked ladders · Feb 6</div>
            </article>
            <article className="news-item">
              <div className="news-title">Community Build Jam</div>
              <div className="news-meta">Submissions live · Feb 2</div>
            </article>
          </div>
        </div>

        <div className="card stats-card">
          <h2>Performance Stats</h2>
          <div className="stats-grid">
            <div>
              <div className="stat-label">Avg Latency</div>
              <div className="stat-value">28 ms</div>
            </div>
            <div>
              <div className="stat-label">Uptime</div>
              <div className="stat-value">99.98%</div>
            </div>
            <div>
              <div className="stat-label">Peak Players</div>
              <div className="stat-value">4,216</div>
            </div>
            <div>
              <div className="stat-label">TPS</div>
              <div className="stat-value">20.0</div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

function NewsPage() {
  return (
    <section className="news-page">
      <div className="news-hero">
        <div>
          <div className="news-eyebrow">News & Updates</div>
          <h1>Latest from the Realm</h1>
          <p>
            Patch notes, community highlights, and major events. Catch up on
            everything you missed.
          </p>
        </div>
        <div className="news-callout">
          <div className="callout-title">Featured</div>
          <div className="callout-headline">Skyreach Isles is live</div>
          <div className="callout-copy">
            Explore floating ruins, new enemies, and treasure runs with your
            party.
          </div>
        </div>
      </div>

      <div className="news-grid">
        <article className="card news-card">
          <div className="news-tag">Patch Notes</div>
          <h2>1.8 Skyreach Isles</h2>
          <p>
            New zones, dynamic weather, and a crafting expansion for airships.
          </p>
          <div className="meta">Feb 9, 2026</div>
        </article>
        <article className="card news-card">
          <div className="news-tag">Competitive</div>
          <h2>PvP Arenas & Ranked</h2>
          <p>
            Climb the ladder, earn exclusive cosmetics, and join seasonal
            tournaments.
          </p>
          <div className="meta">Feb 6, 2026</div>
        </article>
        <article className="card news-card">
          <div className="news-tag">Community</div>
          <h2>Build Jam Winners</h2>
          <p>
            Congrats to the top builders. The showcase world is now open to all
            players.
          </p>
          <div className="meta">Feb 2, 2026</div>
        </article>
        <article className="card news-card">
          <div className="news-tag">Events</div>
          <h2>Season Launch Weekend</h2>
          <p>
            Double XP, loot drops, and daily quests to celebrate the new season.
          </p>
          <div className="meta">Feb 1, 2026</div>
        </article>
      </div>
    </section>
  );
}

createRoot(document.getElementById("root")).render(<App />);
