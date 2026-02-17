import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function ProfileInfoTabs({
  activeTab = "badges",
  onTabChange,
  badgesNode = null,
  groupsNode = null,
}) {
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
    ${activeTab === "groups" ? groupsNode : badgesNode}
  `;
}
