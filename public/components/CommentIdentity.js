import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function CommentIdentity({ entry, rank, authorSizeClass }) {
  const name = String(entry?.authorName || "User");
  const sizeClass = authorSizeClass ? authorSizeClass(name) : "";
  const staffClass = rank?.staff ? "staff" : "";
  const rankEffectsClass = entry?.authorShowRankEffects === false ? "rank-effects-off" : "";
  const rankClass = `rank-${String(rank?.label || "Unregistered")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")}`;
  return html`
    <div className="comment-identity">
      <div className=${`comment-author ${sizeClass} ${staffClass} ${rankEffectsClass} ${rankClass}`.trim()}>${name}</div>
      <div className=${`comment-rank ${staffClass} ${rankEffectsClass} ${rankClass}`.trim()}>${rank?.label || "Unregistered"}</div>
    </div>
  `;
}
