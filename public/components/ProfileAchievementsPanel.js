import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

const FALLBACK_ACHIEVEMENTS = [
  {
    id: "future-achievements",
    title: "More achievements coming soon",
    description: "Keep playing and linking systems as Hardtale grows to unlock new badges.",
    status: "INCOMPLETE",
    locked: true,
  },
];

function wittyText(entry) {
  const unlocked = Boolean(entry?.unlocked) || String(entry?.status || "").toUpperCase() === "COMPLETE";
  if (unlocked) return "Completed. Flex worthy.";
  return "Not unlocked yet. Your next grind target.";
}

export default function ProfileAchievementsPanel({ achievements = [] }) {
  const source =
    Array.isArray(achievements) && achievements.length > 0
      ? achievements
      : FALLBACK_ACHIEVEMENTS;
  const items = source.map((entry, index) => {
    const title = String(entry?.title || entry?.label || entry?.name || `Achievement ${index + 1}`).trim();
    const description = String(entry?.description || "No description yet.").trim();
    const status = String(entry?.status || (entry?.locked ? "INCOMPLETE" : "COMPLETE"))
      .trim()
      .toUpperCase();
    const unlockedAt = String(entry?.unlockedAt || "").trim();
    const unlocked = Boolean(entry?.unlocked) || status === "COMPLETE";
    return {
      id: String(entry?.id || entry?.key || `${title}-${index}`),
      title: title || `Achievement ${index + 1}`,
      description,
      status,
      unlocked,
      unlockedAt,
      witty: wittyText({ ...entry, unlocked, status }),
    };
  });

  return html`
    <div className="profile-achievements-panel">
      <div className="profile-card-badges-title">Achievements</div>
      <div className="muted profile-achievements-panel-subtitle">
        Scroll all achievements. Open Read more for unlock details and flavor text.
      </div>
      <div className="profile-achievements-panel-list">
        ${items.map(
          (item) => html`<article key=${item.id} className=${`profile-achievement-entry ${item.unlocked ? "complete" : "incomplete"}`.trim()}>
            <div className="profile-achievement-entry-head">
              <div className="profile-achievement-entry-title">${item.title}</div>
              <span className=${`profile-achievement-status ${item.unlocked ? "complete" : "incomplete"}`.trim()}>
                ${item.status}
              </span>
            </div>
            <details className="profile-achievement-readmore">
              <summary>
                Read more <span aria-hidden="true">></span>
              </summary>
              <p>${item.description}</p>
              <p className="muted">${item.witty}</p>
              ${item.unlockedAt
                ? html`<p className="muted">Unlocked: ${item.unlockedAt}</p>`
                : html``}
            </details>
          </article>`,
        )}
      </div>
    </div>
  `;
}
