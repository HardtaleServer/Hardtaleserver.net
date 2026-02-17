import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function AuthorName({ value, isStaffLabel, className = "author-name" }) {
  const text = String(value || "");
  const classes = `${className}${isStaffLabel && isStaffLabel(text) ? " staff" : ""}`;
  return html`<span className=${classes}>${text}</span>`;
}

export default React.memo(AuthorName);
