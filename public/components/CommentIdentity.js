import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function CommentIdentity({ entry, rank, authorSizeClass }) {
  const name = String(entry?.authorName || "User");
  const sizeClass = authorSizeClass ? authorSizeClass(name) : "";
  const staffClass = rank?.staff ? "staff" : "";
  return html`
    <div className="comment-identity">
      <div className=${`comment-author ${sizeClass} ${staffClass}`.trim()}>${name}</div>
      <div className=${`comment-rank ${staffClass}`.trim()}>${rank?.label || "Registered"}</div>
    </div>
  `;
}
