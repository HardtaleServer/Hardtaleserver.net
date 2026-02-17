import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function ProfileOptionsActions({
  onViewProfile,
  onViewClerk,
  profileLabel = "View profile card",
  clerkLabel = "View Clerk card",
}) {
  return html`
    <div className="comment-actions right">
      <button className="button primary" type="button" onClick=${onViewProfile}>
        ${profileLabel}
      </button>
      <button className="button ghost-btn" type="button" onClick=${onViewClerk}>
        ${clerkLabel}
      </button>
    </div>
  `;
}
