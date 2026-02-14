import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function ForumHero({ onOpenSupport }) {
  return html`
    <div className="news-hero">
      <div>
        <div className="news-eyebrow">Forum</div>
        <h1 className="news-title">Community Sections</h1>
        <p className="news-copy">
          Devforum-inspired structure with focused sections for updates, reports, and player feedback.
        </p>
      </div>
      <div className="news-callout">
        <div className="news-callout-label">Need Private Help?</div>
        <div className="news-callout-title">Use Support Tickets</div>
        <div className="news-callout-copy">
          Appeals and account-specific issues should be opened in Support, not public posts.
        </div>
        <button className="button primary" type="button" onClick=${onOpenSupport}>
          Open Support
        </button>
      </div>
    </div>
  `;
}
