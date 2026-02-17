import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function CountBadge({
  count = 0,
  max = 99,
  className = "",
  title = "",
}) {
  const value = Math.max(0, Number(count || 0));
  const safeMax = Math.max(1, Number(max || 99));
  const display = value > safeMax ? `${safeMax}+` : String(value);
  const resolvedTitle = title || `${value}`;

  return html`<span className=${`count-badge ${className}`.trim()} title=${resolvedTitle}>${display}</span>`;
}

export default React.memo(CountBadge);
