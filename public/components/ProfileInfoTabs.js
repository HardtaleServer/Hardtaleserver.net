import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function ProfileInfoTabs({
  activeTab = "badges",
  onTabChange,
  renderBadges,
  renderGroups,
  renderAchievements,
  renderForumActivity,
}) {
  let content = typeof renderBadges === "function" ? renderBadges() : null;
  if (activeTab === "groups") {
    content = typeof renderGroups === "function" ? renderGroups() : null;
  }
  if (activeTab === "achievements") {
    content = typeof renderAchievements === "function" ? renderAchievements() : null;
  }
  if (activeTab === "forum-activity") {
    content = typeof renderForumActivity === "function" ? renderForumActivity() : null;
  }
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
      <button
        type="button"
        className=${`profile-card-subtab ${activeTab === "achievements" ? "active" : ""}`.trim()}
        onClick=${() => onTabChange && onTabChange("achievements")}
      >
        Achievements
      </button>
      ${typeof renderForumActivity === "function"
        ? html`<button
            type="button"
            className=${`profile-card-subtab ${activeTab === "forum-activity" ? "active" : ""}`.trim()}
            onClick=${() => onTabChange && onTabChange("forum-activity")}
          >
            Forum Activity
          </button>`
        : html``}
    </div>
    ${content}
  `;
}

export default React.memo(ProfileInfoTabs);
