import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function getRankIconType(label) {
  const normalized = String(label || "").trim().toLowerCase();
  if (normalized === "staff") return "staff";
  if (normalized === "hero") return "star";
  if (normalized === "legend") return "crown";
  if (normalized === "mythic") return "shield";
  return "";
}

function renderRankIcon(type) {
  switch (type) {
    case "staff":
      return html`<img className="rank-icon-image" src="/Images/SVGs/ht_staff_badge.svg" alt="" aria-hidden="true" />`;
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

export default function CommentIdentity({ entry, rank, authorSizeClass, showOpBadge = false }) {
  const name = String(entry?.authorName || "User");
  const sizeClass = authorSizeClass ? authorSizeClass(name) : "";
  const staffClass = rank?.staff ? "staff" : "";
  const staffStaticClass = rank?.staff && rank?.animateStaffGradient === false ? "staff-static" : "";
  const rankEffectsClass = entry?.authorShowRankEffects === false ? "rank-effects-off" : "";
  const rankLabel = rank?.label || "Unregistered";
  const rankIconType = getRankIconType(rankLabel);
  const rankClass = `rank-${String(rank?.label || "Unregistered")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
  return html`
    <div className="comment-identity">
      <div className=${`comment-author ${sizeClass} ${staffClass} ${staffStaticClass} ${rankEffectsClass} ${rankClass}`.trim()}>
        <span>${name}</span>
        ${showOpBadge ? html`<span className="comment-op-badge">OP</span>` : html``}
      </div>
      <div className=${`comment-rank ${staffClass} ${staffStaticClass} ${rankEffectsClass} ${rankClass}`.trim()}>
        ${rankIconType ? html`<span className="rank-icon">${renderRankIcon(rankIconType)}</span>` : html``}
        <span>${rankLabel}</span>
      </div>
    </div>
  `;
}
