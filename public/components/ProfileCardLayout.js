import React from "react";
import htm from "htm";
import CopyAction from "./CopyAction.js";

const html = htm.bind(React.createElement);

function ProfileCardLayout({
  className = "",
  avatarClassName = "profile-card-avatar",
  avatarSrc = "",
  avatarAlt = "",
  nameClassName = "profile-card-name",
  name = "",
  username = "",
  metaRows = [],
  onMetaRowClick = null,
  rankNode = null,
  badgeNode = null,
  onAvatarClick = null,
  avatarButtonTitle = "Change avatar",
  children,
}) {
  const safeRows = Array.isArray(metaRows) ? metaRows : [];
  return html`
    <div className=${`profile-card ${className}`.trim()}>
      ${safeRows.map(
        (row, index) => html`<div key=${`profile-row-${index}`} className="profile-card-link-meta">
          <span className="muted">${row?.label || ""}</span>
          ${row?.copyValue
            ? html`<${CopyAction}
                label=${row?.value || "N/A"}
                valueToCopy=${row?.copyValue || ""}
                subtle=${true}
                className="profile-copy-action"
                title=${`Copy ${row?.label || "value"}`}
                onCopied=${() => {
                  if (typeof onMetaRowClick === "function") {
                    onMetaRowClick(row.label || "Value", row.copyValue);
                  }
                }}
              />`
            : typeof row?.onClick === "function"
            ? html`<button
                type="button"
                className=${`copy-action-btn subtle profile-copy-action ${row?.className || ""}`.trim()}
                onClick=${row.onClick}
                title=${row?.title || row?.value || "Open"}
              >
                <span>${row?.value || "Open"}</span>
              </button>`
            : html`<span>${row?.value || "N/A"}</span>`}
        </div>`,
      )}
      ${typeof onAvatarClick === "function"
        ? html`<button
            type="button"
            className="profile-card-avatar-button"
            onClick=${onAvatarClick}
            title=${avatarButtonTitle}
          >
            <img className=${avatarClassName} src=${avatarSrc} alt=${avatarAlt || name || "User"} />
          </button>`
        : html`<img className=${avatarClassName} src=${avatarSrc} alt=${avatarAlt || name || "User"} />`}
      <div className=${nameClassName}>${name}</div>
      ${badgeNode || html``}
      ${username ? html`<div className="profile-card-username">@${username}</div>` : html``}
      ${rankNode || html``}
      ${children}
    </div>
  `;
}

export default React.memo(ProfileCardLayout);
