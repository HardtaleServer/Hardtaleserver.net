import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function ProfilePreviewButton({
  onClick,
  title = "Open profile preview",
  avatar,
  name,
  username = "",
  className = "",
  children,
}) {
  return html`
    <button
      type="button"
      className=${`store-profile-preview ${className}`.trim()}
      onClick=${onClick}
      title=${title}
    >
      <img className="store-profile-avatar" src=${avatar} alt=${name} />
      <div className="store-profile-meta">
        <div className="store-profile-name">${name}</div>
        ${username ? html`<div className="store-profile-username">@${username}</div>` : html``}
        <div className="store-badge-preview-row">${children}</div>
      </div>
    </button>
  `;
}

export default React.memo(ProfilePreviewButton);
