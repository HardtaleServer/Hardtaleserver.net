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
  rankNode = null,
  children,
}) {
  const safeRows = Array.isArray(metaRows) ? metaRows : [];
  return html`
    <div className=${`profile-card ${className}`.trim()}>
      <img className=${avatarClassName} src=${avatarSrc} alt=${avatarAlt || name || "User"} />
      <div className=${nameClassName}>${name}</div>
      ${username ? html`<div className="profile-card-username">@${username}</div>` : html``}
      ${safeRows.map(
        (row, index) => html`<div key=${`profile-row-${index}`} className="profile-card-link-meta">
          <span className="muted">${row?.label || ""}</span>
          <span>${row?.value || "N/A"}</span>
        </div>`,
      )}
      ${rankNode || html``}
      ${children}
    </div>
  `;
}

export default React.memo(ProfileCardLayout);
