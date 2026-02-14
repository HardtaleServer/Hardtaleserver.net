import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function SupportHero() {
  return html`
    <div className="news-hero">
      <div>
        <div className="news-eyebrow">Support</div>
        <h1 className="news-title">Player Support</h1>
        <p className="news-copy">
          Open a private ticket to contact staff for account issues, appeals, bug help, or warnings.
        </p>
      </div>
      <div className="news-callout">
        <div className="news-callout-label">Status</div>
        <div className="news-callout-title">Live Ticket Inbox</div>
        <div className="news-callout-copy">1:1 staff messaging with status updates and full history.</div>
        <div className="news-callout-title">Forum Sections</div>
        <div className="news-callout-copy">
          Public categories are now in Forum. Use Support for private help cases.
        </div>
      </div>
    </div>
  `;
}
