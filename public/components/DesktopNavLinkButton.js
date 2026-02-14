import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function DesktopNavLinkButton({
  id,
  label,
  navActive,
  lockedNavHover,
  hoveredNav,
  onClick,
  onEnter,
  onLeave,
}) {
  const classes = `nav-link ${navActive === id ? "active" : ""} ${
    lockedNavHover && hoveredNav === id ? "hover-locked" : ""
  }`;
  return html`
    <button
      className=${classes.trim()}
      onClick=${onClick}
      onMouseEnter=${onEnter}
      onMouseLeave=${onLeave}
    >
      ${label}
    </button>
  `;
}
