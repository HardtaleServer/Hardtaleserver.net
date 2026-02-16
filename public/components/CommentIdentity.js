import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function CommentIdentity({ entry, rank, authorSizeClass }) {
  const name = String(entry?.authorName || "User");
  const sizeClass = authorSizeClass ? authorSizeClass(name) : "";
  const staffClass = rank?.staff ? "staff" : "";
  const rankClass = `rank-${String(rank?.label || "Registered")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
  return html`
    <div className="comment-identity">
      <div className=${`comment-author ${sizeClass} ${staffClass}`.trim()}>${name}</div>
      <div className=${`comment-rank ${staffClass} ${rankClass}`.trim()}>${rank?.label || "Registered"}</div>
    </div>
  `;
}
