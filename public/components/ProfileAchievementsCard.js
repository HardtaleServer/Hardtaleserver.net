import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

const FALLBACK_ACHIEVEMENTS = [
  {
    id: "future-achievements",
    label: "Achievements",
    icon: "A",
    locked: true,
  },
];

export default function ProfileAchievementsCard({ achievements = [] }) {
  const source = Array.isArray(achievements) && achievements.length > 0 ? achievements : FALLBACK_ACHIEVEMENTS;
  const items = source.slice(0, 8).map((entry, index) => {
    const label = String(entry?.title || entry?.label || entry?.name || `Achievement ${index + 1}`).trim();
    const icon = String(entry?.icon || entry?.short || label.charAt(0) || "A")
      .trim()
      .slice(0, 3);
    const iconUrl = String(entry?.iconUrl || "").trim();
    const locked = Boolean(entry?.locked);
    const status = String(entry?.status || (locked ? "INCOMPLETE" : "COMPLETE"))
      .trim()
      .toUpperCase();
    return {
      id: String(entry?.id || entry?.key || `${label}-${index}`),
      label: label || `Achievement ${index + 1}`,
      icon: icon || "A",
      iconUrl,
      locked,
      status,
    };
  });

  return html`
    <div className="profile-achievements-card">
      <div className="profile-card-badges-title">Achievement Badges</div>
      <div className="muted profile-achievements-subtitle">
        Circular achievement badges. Planned API sync with Kyuubisoft Achievements/Titles/Rewards.
      </div>
      <div className="profile-achievements-row">
        ${items.map(
          (item) => html`<div key=${item.id} className=${`profile-achievement-chip ${item.locked ? "locked" : ""}`.trim()}>
            <span className="profile-achievement-circle">
              ${item.iconUrl
                ? html`<img src=${item.iconUrl} alt=${item.label} />`
                : html`<span>${item.icon}</span>`}
              ${item.locked ? html`<span className="profile-achievement-lock">🔒</span>` : html``}
            </span>
            <span className="profile-achievement-label">${item.label}</span>
            <span className=${`profile-achievement-status ${item.locked ? "incomplete" : "complete"}`.trim()}>
              ${item.status}
            </span>
          </div>`,
        )}
      </div>
    </div>
  `;
}
