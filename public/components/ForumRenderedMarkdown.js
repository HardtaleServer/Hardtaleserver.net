import React, { useMemo, useRef } from "react";
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
  const lastTouchRef = useRef({
    mention: "",
    x: 0,
    y: 0,
    at: 0,
  });

  function toPointerPayload(trigger, x, y) {
    const rect = trigger?.getBoundingClientRect?.() || null;
    const payload = {
      anchorRect: rect,
    };
    if (Number.isFinite(x) && Number.isFinite(y)) {
      payload.anchorPoint = { x: Number(x), y: Number(y) };
    }
    return payload;
  }

  return html`<div
    className=${`forum-markdown-render ${className}`.trim()}
    onTouchStart=${(event) => {
      const trigger = event?.target?.closest?.("[data-mention]");
      if (!trigger) return;
      const mention = String(trigger.getAttribute("data-mention") || "").trim();
      if (!mention) return;
      const touch = event?.touches?.[0] || event?.changedTouches?.[0] || null;
      if (!touch) return;
      lastTouchRef.current = {
        mention,
        x: Number(touch.clientX || 0),
        y: Number(touch.clientY || 0),
        at: Date.now(),
      };
    }}
    onClick=${(event) => {
      if (typeof onMentionClick !== "function") return;
      const trigger = event?.target?.closest?.("[data-mention]");
      if (!trigger) return;
      event.preventDefault();
      const mention = String(trigger.getAttribute("data-mention") || "").trim();
      if (!mention) return;
      const now = Date.now();
      const recentTouch = lastTouchRef.current;
      const touchMatch =
        recentTouch.mention &&
        recentTouch.mention.toLowerCase() === mention.toLowerCase() &&
        now - Number(recentTouch.at || 0) < 1200;
      const fallbackX = Number(event?.clientX);
      const fallbackY = Number(event?.clientY);
      const pointX = touchMatch ? Number(recentTouch.x) : fallbackX;
      const pointY = touchMatch ? Number(recentTouch.y) : fallbackY;
      onMentionClick(mention, trigger, toPointerPayload(trigger, pointX, pointY));
    }}
    onMouseOver=${(event) => {
      if (typeof onMentionHover !== "function") return;
      const trigger = event?.target?.closest?.("[data-mention]");
      if (!trigger) return;
      const related = event?.relatedTarget;
      if (related && trigger.contains(related)) return;
      const mention = String(trigger.getAttribute("data-mention") || "").trim();
      if (!mention) return;
      onMentionHover(mention, trigger, toPointerPayload(trigger, event?.clientX, event?.clientY));
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
