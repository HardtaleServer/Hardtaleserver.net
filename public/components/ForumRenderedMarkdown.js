import React, { useMemo } from "react";
import htm from "htm";
import { markdownToSafeHtml } from "./forumMarkdown.js";

const html = htm.bind(React.createElement);

export default function ForumRenderedMarkdown({
  value = "",
  className = "",
  onMentionClick = null,
  onMentionHover = null,
  onMentionLeave = null,
}) {
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
      onMentionClick(mention, trigger);
    }}
    onMouseOver=${(event) => {
      if (typeof onMentionHover !== "function") return;
      const trigger = event?.target?.closest?.("[data-mention]");
      if (!trigger) return;
      const related = event?.relatedTarget;
      if (related && trigger.contains(related)) return;
      const mention = String(trigger.getAttribute("data-mention") || "").trim();
      if (!mention) return;
      onMentionHover(mention, trigger);
    }}
    onMouseOut=${(event) => {
      if (typeof onMentionLeave !== "function") return;
      const trigger = event?.target?.closest?.("[data-mention]");
      if (!trigger) return;
      const related = event?.relatedTarget;
      if (related && trigger.contains(related)) return;
      const mention = String(trigger.getAttribute("data-mention") || "").trim();
      if (!mention) return;
      onMentionLeave(mention, trigger);
    }}
    dangerouslySetInnerHTML=${{ __html: htmlValue }}
  />`;
}
