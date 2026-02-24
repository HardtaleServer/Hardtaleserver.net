import React from "react";
import htm from "htm";
import RankBadge from "./RankBadge.js";

const html = htm.bind(React.createElement);

function MobileDrawerProfilePreview({
  onClick,
  title = "Open profile preview",
  avatar,
  name,
  username = "",
  linkedLabel = "Unlinked",
  displayedBadge = "Unregistered",
  showLinkedBadge = true,
  processingLabel = "",
  showStaffBadge = false,
  staffLabel = "Staff",
  staffRoleClass = "",
  className = "",
}) {
  const normalizedLinkedLabel = String(linkedLabel || "Unlinked").trim() || "Unlinked";
  const normalizedDisplayedBadge = String(displayedBadge || "").trim() || "Unregistered";
  const normalizedStaffLabelRaw = String(staffLabel || "").trim() || "Staff";
  const hasDisplayedBadge =
    normalizedDisplayedBadge &&
    !["Unregistered", "Unlinked"].includes(normalizedDisplayedBadge) &&
    normalizedDisplayedBadge.toLowerCase() !== normalizedLinkedLabel.toLowerCase();
  const normalizedStaffLabel =
    normalizedStaffLabelRaw &&
    normalizedStaffLabelRaw.toLowerCase() === normalizedDisplayedBadge.toLowerCase()
      ? "Staff"
      : normalizedStaffLabelRaw;
  const normalizedProcessingLabel = String(processingLabel || "").trim();
  return html`
    <button
      type="button"
      className=${`mobile-drawer-profile-preview ${className}`.trim()}
      onClick=${onClick}
      title=${title}
    >
      <img className="mobile-drawer-profile-avatar" src=${avatar} alt=${name} />
      <div className="mobile-drawer-profile-meta">
        <div className="mobile-drawer-profile-name">${name}</div>
        ${username
          ? html`<div className="mobile-drawer-profile-username">@${username}</div>`
          : html``}
        <div className="mobile-drawer-profile-badges">
          ${showLinkedBadge ? html`<${RankBadge} label=${normalizedLinkedLabel} className="store-owned-badge" />` : html``}
          ${hasDisplayedBadge
            ? html`<${RankBadge} label=${normalizedDisplayedBadge} className="store-owned-badge" />`
            : html``}
          ${showStaffBadge
            ? html`<span className=${`profile-owned-badge staff-owned-badge ${staffRoleClass}`.trim()}>
                <span>${normalizedStaffLabel}</span>
              </span>`
            : html``}
        </div>
        ${normalizedProcessingLabel
          ? html`<div className="muted mobile-drawer-profile-processing">${normalizedProcessingLabel}</div>`
          : html``}
      </div>
    </button>
  `;
}

export default React.memo(MobileDrawerProfilePreview);
