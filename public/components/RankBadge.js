import React from "react";
import htm from "htm";
import { getRankDisplayLabel, getRankIconType } from "./rankConfig.js";

const html = htm.bind(React.createElement);
const LINKED_STATUS_ICON_SVG = "/Images/SVGs/link/LINKED.svg";
const UNLINKED_STATUS_ICON_SVG = "/Images/SVGs/link/UNLINKED.svg";
const HERO_RANK_ICON_SVG = "/Images/SVGs/ranks/RANK_HERO.svg";
const MOD_RANK_ICON_SVG = "/Images/SVGs/ranks/RANK_MOD.svg";

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
    case "star":
      return html`<svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M12 2l2.5 6.2 6.7.6-5.1 4.3 1.6 6.5-5.7-3.6-5.7 3.6 1.6-6.5-5.1-4.3 6.7-.6L12 2z" />
      </svg>`;
    case "linked":
      return html`<img className="rank-icon-image" src=${LINKED_STATUS_ICON_SVG} alt="" aria-hidden="true" />`;
    case "unlinked":
      return html`<img className="rank-icon-image" src=${UNLINKED_STATUS_ICON_SVG} alt="" aria-hidden="true" />`;
    default:
      return html``;
  }
}

function RankBadge({ label, className = "", showIcon = true }) {
  const rankLabel = String(label || "Unregistered");
  const slug = rankLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const iconType = getRankIconType(rankLabel);
  return html`<span className=${`profile-owned-badge rank-${slug} ${className}`.trim()}>
    ${showIcon && iconType ? html`<span className="rank-icon">${renderRankIcon(iconType)}</span>` : html``}
    <span>${getRankDisplayLabel(rankLabel)}</span>
  </span>`;
}

export default React.memo(RankBadge);
