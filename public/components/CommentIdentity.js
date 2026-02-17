import React from "react";
import htm from "htm";
import { getRankDisplayLabel, getRankIconType } from "./rankConfig.js";

const html = htm.bind(React.createElement);
const LINKED_STATUS_ICON_SVG = "/Images/SVGs/LINKED.svg";
const UNLINKED_STATUS_ICON_SVG = "/Images/SVGs/UNLINKED.svg";

function toStaffPillTitle(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (!normalized) return "";
  if (normalized === "moderator" || normalized === "mod") return "Moderator";
  if (normalized === "developer" || normalized === "dev") return "Developer";
  if (normalized === "admin" || normalized === "administrator") return "Administrator";
  if (normalized === "helper") return "Helper";
  if (normalized === "staff") return "Staff";
  return "";
}

function normalizeStaffRoleKey(value = "") {
  const key = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (!key) return "";
  if (key === "developer" || key === "dev") return "dev";
  if (key === "admin" || key === "administrator") return "admin";
  if (key === "moderator" || key === "mod") return "mod";
  if (key === "helper") return "helper";
  if (key === "staff") return "staff";
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
    case "linked":
      return html`<img className="rank-icon-image" src=${LINKED_STATUS_ICON_SVG} alt="" aria-hidden="true" />`;
    case "unlinked":
      return html`<img className="rank-icon-image" src=${UNLINKED_STATUS_ICON_SVG} alt="" aria-hidden="true" />`;
    default:
      return html``;
  }
}

export default function CommentIdentity({
  entry,
  rank,
  authorSizeClass,
  showStaffPill = false,
  staffPillText = "Staff",
}) {
  const name = String(entry?.authorName || "User");
  const sizeClass = authorSizeClass ? authorSizeClass(name) : "";
  const staffClass = rank?.staff ? "staff" : "";
  const roleClass = rank?.staff ? `staff-role-${normalizeStaffRoleKey(entry?.authorStaffRole || entry?.authorRank || "staff")}` : "";
  const staffStaticClass = rank?.staff && rank?.animateStaffGradient === false ? "staff-static" : "";
  const rankEffectsClass = entry?.authorShowRankEffects === false ? "rank-effects-off" : "";
  const rankFontClass = entry?.authorUseRankFont === false ? "rank-font-off" : "rank-font-on";
  const rankLabel = rank?.label || "Unregistered";
  const rankIconType = getRankIconType(rankLabel);
  const useGradientPillText = entry?.authorShowStaffBadgeIcon !== false;
  const resolvedStaffPillText =
    staffPillText ||
    toStaffPillTitle(entry?.authorRole) ||
    toStaffPillTitle(entry?.authorStaffTitle) ||
    toStaffPillTitle(entry?.authorRank) ||
    "Staff";
  const rankClass = `rank-${String(rank?.label || "Unregistered")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
  const staffPillClass = `comment-staff-pill ${roleClass} ${useGradientPillText ? "gradient-text" : "text-only"} ${
    rank?.animateStaffGradient === false ? "staff-static" : ""
  }`.trim();
  return html`
    <div className="comment-identity">
      <div className=${`comment-author ${sizeClass} ${staffClass} ${roleClass} ${staffStaticClass} ${rankEffectsClass} ${rankFontClass} ${rankClass}`.trim()}>
        <span>${name}</span>
        ${showStaffPill
          ? html`<span className=${staffPillClass}>
              <span className=${useGradientPillText ? "staff-pill-label" : "staff-pill-text"}>
                ${resolvedStaffPillText}
              </span>
            </span>`
          : html``}
      </div>
      <div className=${`comment-rank ${staffClass} ${roleClass} ${staffStaticClass} ${rankEffectsClass} ${rankFontClass} ${rankClass}`.trim()}>
        ${rankIconType ? html`<span className="rank-icon">${renderRankIcon(rankIconType)}</span>` : html``}
        <span>${getRankDisplayLabel(rankLabel)}</span>
      </div>
    </div>
  `;
}
