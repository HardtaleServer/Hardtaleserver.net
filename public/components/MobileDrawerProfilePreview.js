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
  showStaffBadge = false,
  staffLabel = "Staff",
  staffRoleClass = "",
  className = "",
}) {
  const hasDisplayedBadge =
    String(displayedBadge || "").trim() &&
    !["Unregistered", "Unlinked"].includes(String(displayedBadge || "").trim());
  const normalizedLinkedLabel = String(linkedLabel || "Unlinked").trim() || "Unlinked";
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
        ${username ? html`<div className="mobile-drawer-profile-username">@${username}</div>` : html``}
        <div className="mobile-drawer-profile-badges">
          <${RankBadge} label=${normalizedLinkedLabel} className="store-owned-badge" />
          ${showStaffBadge
            ? html`<span className=${`profile-owned-badge staff-owned-badge ${staffRoleClass}`.trim()}>
                <span>${staffLabel}</span>
              </span>`
            : html``}
          ${hasDisplayedBadge
            ? html`<${RankBadge} label=${displayedBadge} className="store-owned-badge" />`
            : html``}
        </div>
      </div>
    </button>
  `;
}

export default React.memo(MobileDrawerProfilePreview);
