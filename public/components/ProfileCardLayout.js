import React from "react";
import htm from "htm";

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
  children,
}) {
  const safeRows = Array.isArray(metaRows) ? metaRows : [];
  return html`
    <div className=${`profile-card ${className}`.trim()}>
      ${safeRows.map(
        (row, index) => html`<div key=${`profile-row-${index}`} className="profile-card-link-meta">
          <span className="muted">${row?.label || ""}</span>
          <span
            title=${row?.copyValue ? `Click to copy ${row?.label || "value"}` : ""}
            onClick=${() => {
              if (!row?.copyValue || typeof onMetaRowClick !== "function") return;
              onMetaRowClick(row.label || "Value", row.copyValue);
            }}
          >
            ${row?.value || "N/A"}
          </span>
        </div>`,
      )}
      <img className=${avatarClassName} src=${avatarSrc} alt=${avatarAlt || name || "User"} />
      <div className=${nameClassName}>${name}</div>
      ${username ? html`<div className="profile-card-username">@${username}</div>` : html``}
      ${rankNode || html``}
      ${children}
    </div>
  `;
}

export default React.memo(ProfileCardLayout);
