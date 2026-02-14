import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function TimestampText({
  value,
  formatTimestamp,
  className = "notification-timestamp",
}) {
  const text = formatTimestamp ? formatTimestamp(value) : String(value || "");
  return html`<span className=${className}>${text}</span>`;
}
