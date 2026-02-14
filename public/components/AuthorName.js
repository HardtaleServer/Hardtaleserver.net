import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function AuthorName({ value, isStaffLabel, className = "author-name" }) {
  const text = String(value || "");
  const classes = `${className}${isStaffLabel && isStaffLabel(text) ? " staff" : ""}`;
  return html`<span className=${classes}>${text}</span>`;
}
