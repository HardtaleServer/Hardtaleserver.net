import React from "react";
import htm from "htm";
import AuthorName from "./AuthorName.js";
import TimestampText from "./TimestampText.js";
import { getRankDisplayLabel } from "./rankConfig.js";

const html = htm.bind(React.createElement);
const NOTIFICATION_RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

function formatExpiryCountdown(remainingMs) {
  if (!Number.isFinite(Number(remainingMs))) return "";
  const safeMs = Math.max(0, Number(remainingMs));
  const totalSeconds = Math.ceil(safeMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export default function NotificationsPanel({
  notifications = [],
  onView,
  onOpenProfile,
  onDelete,
  deletingId = "",
  formatTimestamp,
  isStaffLabel,
  featuredIconSrc = "/Images/SVGs/ui/Featured.svg",
}) {
  const [nowMs, setNowMs] = React.useState(() => Date.now());

  React.useEffect(() => {
    if (!notifications.length) return undefined;
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [notifications.length]);

  if (!notifications.length) {
    return html`<p className="muted">No notifications yet.</p>`;
  }

  return html`
    <div className="notif-list">
      ${notifications.map((item) => {
        const authorLabel = String(item?.authorName || item?.author || "System");
        const authorRank = getRankDisplayLabel(item?.authorRank || "Registered");
        const authorRankSlug = String(authorRank || "Registered")
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-");
        const authorImage = String(item?.authorImage || "/assets/HardTale_H_GreyScale.png");
        const authorUserId = String(item?.authorUserId || "").trim();
        const isSystemAuthor = /^system$/i.test(authorLabel) || authorUserId === "";
        const canOpenProfile =
          typeof onOpenProfile === "function" &&
          !isSystemAuthor &&
          Boolean(authorUserId);
        const createdAtMs = new Date(item?.createdAt || "").getTime();
        const expiresInMs = Number.isFinite(createdAtMs)
          ? createdAtMs + NOTIFICATION_RETENTION_MS - nowMs
          : NaN;
        const countdownLabel = formatExpiryCountdown(expiresInMs);
        const canDeleteForMe = typeof onDelete === "function" && item?.readByMe === true;
        const deleting = String(deletingId || "") === String(item?.id || "");
        return html`<div key=${item.id} className="notif-card">
          <div className="notif-title">
            ${item.featured
              ? html`<span className="news-star mini" title="Featured" aria-label="Featured">
                  <img className="news-badge-icon" src=${featuredIconSrc} alt="" aria-hidden="true" />
                </span>`
              : html``}
            ${item.title}
          </div>
          <div className="notif-body">${item.message}</div>
          <div className="notif-author-row">
            <div className="notif-author">
              <div className="notif-author-line">
                <span className="notif-author-prefix">Sent by</span>
                ${canOpenProfile
                  ? html`<button
                      className="notif-profile-peek"
                      type="button"
                      onClick=${() => onOpenProfile(item)}
                      title="Open profile card"
                      aria-label="Open profile card"
                    >
                      <img className="notif-profile-avatar" src=${authorImage} alt=${authorLabel} />
                    </button>`
                  : html`<span className="notif-profile-peek static" aria-hidden="true">
                      <img className="notif-profile-avatar" src=${authorImage} alt=${authorLabel} />
                    </span>`}
                ${canOpenProfile
                  ? html`<button
                      className="notif-author-name-btn"
                      type="button"
                      onClick=${() => onOpenProfile(item)}
                      title="Open profile card"
                    >
                      <${AuthorName} value=${authorLabel} isStaffLabel=${isStaffLabel} />
                    </button>`
                  : html`<span className="notif-author-name-static">
                      <${AuthorName} value=${authorLabel} isStaffLabel=${isStaffLabel} />
                    </span>`}
                ${isSystemAuthor
                  ? html``
                  : html`<span className=${`profile-owned-badge notif-rank-pill rank-${authorRankSlug}`.trim()}>
                      <span>${authorRank}</span>
                    </span>`}
              </div>
              <${TimestampText} value=${item.createdAt} formatTimestamp=${formatTimestamp} />
              <div className="notif-meta-row">
                ${countdownLabel
                  ? html`<span className="notif-expiry-countdown">Deletes in ${countdownLabel}</span>`
                  : html``}
                ${canDeleteForMe
                  ? html`<button
                      type="button"
                      className="notif-delete-btn"
                      onClick=${() => onDelete(item)}
                      disabled=${deleting}
                      title="Delete this notification for me"
                      aria-label="Delete this notification"
                    >
                      ${deleting ? "..." : "🗑"}
                    </button>`
                  : html``}
              </div>
            </div>
          </div>
          ${item.readMoreUrl
            ? html`<div className="notif-actions">
                <button className="ghost-btn" type="button" onClick=${() => onView(item)}>
                  View
                </button>
              </div>`
            : html``}
        </div>`;
      })}
    </div>
  `;
}
