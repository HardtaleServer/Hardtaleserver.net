import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function CommentMeta({
  entry,
  formatTimestamp,
  variant = "desktop",
  showOpBadge = false,
  showHistoryButton = false,
  onHistoryClick,
  onHistoryMouseDown,
  historyIcon,
}) {
  const wrapperClass =
    variant === "mobile" ? "comment-meta-mobile" : "comment-meta comment-meta-desktop";
  const created = formatTimestamp ? formatTimestamp(entry?.createdAt) : String(entry?.createdAt || "");
  const updated = formatTimestamp ? formatTimestamp(entry?.updatedAt) : String(entry?.updatedAt || "");
  const editCount = Number(entry?.editCount || 0);

  return html`
    <div className=${wrapperClass}>
      <div className="comment-meta-right">
        <span className="comment-time">${created}</span>
        ${editCount > 0
          ? html`<span className="comment-edited">Edited ${updated}</span>`
          : html``}
        ${showHistoryButton && editCount > 0
          ? html`<button
              className="comment-history-btn"
              type="button"
              onMouseDown=${onHistoryMouseDown}
              onClick=${onHistoryClick}
              title="View edits"
            >
              <img src=${historyIcon} alt="" aria-hidden="true" className="comment-action-icon" />
              <span>${editCount}</span>
            </button>`
          : html``}
        ${showOpBadge && showHistoryButton && editCount > 0
          ? html`<span className="comment-op-badge">OP</span>`
          : html``}
      </div>
    </div>
  `;
}
