import React, { useMemo } from "react";
import htm from "htm";
import { markdownToSafeHtml } from "./forumMarkdown.js";

const html = htm.bind(React.createElement);

export default function ForumRenderedMarkdown({ value = "", className = "", onMentionClick = null }) {
  const htmlValue = useMemo(() => markdownToSafeHtml(value), [value]);
  return html`<div
    className=${`forum-markdown-render ${className}`.trim()}
    onClick=${(event) => {
      if (typeof onMentionClick !== "function") return;
      const trigger = event?.target?.closest?.("[data-mention]");
      if (!trigger) return;
      event.preventDefault();
      const mention = String(trigger.getAttribute("data-mention") || "").trim();
      if (!mention) return;
      onMentionClick(mention);
    }}
    dangerouslySetInnerHTML=${{ __html: htmlValue }}
  />`;
}
