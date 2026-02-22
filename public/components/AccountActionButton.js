import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function AccountActionButton({
  label = "",
  title = "",
  iconSrc = "",
  className = "",
  textOnly = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
  role,
  disabled = false,
}) {
  return html`
    <button
      type="button"
      className=${`account-action-btn ${textOnly ? "text-only" : ""} ${className}`.trim()}
      onClick=${onClick}
      onMouseEnter=${onMouseEnter}
      onMouseLeave=${onMouseLeave}
      title=${title || label}
      role=${role || null}
      disabled=${disabled}
    >
      ${!textOnly && iconSrc
        ? html`<span
            className="account-action-icon logout-icon-mask"
            aria-hidden="true"
            style=${{ "--logout-icon": `url(${iconSrc})` }}
          ></span>`
        : html``}
      <span className="account-action-label">${label}</span>
    </button>
  `;
}

export default React.memo(AccountActionButton);
