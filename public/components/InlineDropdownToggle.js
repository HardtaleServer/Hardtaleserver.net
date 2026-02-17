import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function InlineDropdownToggle({
  label = "Items",
  count = 0,
  open = false,
  onToggle,
  className = "",
}) {
  return html`
    <button
      type="button"
      className=${`inline-dropdown-toggle ${open ? "open" : ""} ${className}`.trim()}
      onClick=${onToggle}
      aria-expanded=${open}
    >
      <span className="inline-dropdown-label">${label}</span>
      <span className="inline-count-pill">${String(count)}</span>
      <span className="inline-dropdown-arrow">${">"}</span>
    </button>
  `;
}

export default React.memo(InlineDropdownToggle);
