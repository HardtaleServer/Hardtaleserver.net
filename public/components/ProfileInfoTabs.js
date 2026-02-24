import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function ProfileInfoTabs({
  activeTab = "badges",
  onTabChange,
  renderBadges,
  renderStaff,
  renderGuilds,
  renderAchievements,
  renderForumActivity,
  showStaffTab = false,
}) {
  const guildsRenderer = typeof renderGuilds === "function" ? renderGuilds : null;
  let content = typeof renderBadges === "function" ? renderBadges() : null;
  if (activeTab === "staff" && showStaffTab) {
    content = typeof renderStaff === "function" ? renderStaff() : null;
  }
  if (activeTab === "guilds") {
    content = guildsRenderer ? guildsRenderer() : null;
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
      ${showStaffTab
        ? html`<button
            type="button"
            className=${`profile-card-subtab ${activeTab === "staff" ? "active" : ""}`.trim()}
            onClick=${() => onTabChange && onTabChange("staff")}
          >
            Staff
          </button>`
        : html``}
      <button
        type="button"
        className=${`profile-card-subtab ${activeTab === "guilds" ? "active" : ""}`.trim()}
        onClick=${() => onTabChange && onTabChange("guilds")}
      >
        Guilds
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
