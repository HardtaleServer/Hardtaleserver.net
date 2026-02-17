import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function ProfileInfoTabs({
  activeTab = "badges",
  onTabChange,
  renderBadges,
  renderGroups,
}) {
  const content = activeTab === "groups"
    ? (typeof renderGroups === "function" ? renderGroups() : null)
    : (typeof renderBadges === "function" ? renderBadges() : null);
  return html`
    <div className="profile-card-subtabs" role="tablist" aria-label="Profile details">
      <button
        type="button"
        className=${`profile-card-subtab ${activeTab === "badges" ? "active" : ""}`.trim()}
        onClick=${() => onTabChange && onTabChange("badges")}
      >
        Badges
      </button>
      <button
        type="button"
        className=${`profile-card-subtab ${activeTab === "groups" ? "active" : ""}`.trim()}
        onClick=${() => onTabChange && onTabChange("groups")}
      >
        Groups
      </button>
    </div>
    ${content}
  `;
}

export default React.memo(ProfileInfoTabs);
