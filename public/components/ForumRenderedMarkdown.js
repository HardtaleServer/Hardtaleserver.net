import React, { useMemo } from "react";
import htm from "htm";
import { markdownToSafeHtml } from "./forumMarkdown.js";

const html = htm.bind(React.createElement);

export default function ForumRenderedMarkdown({ value = "", className = "" }) {
  const htmlValue = useMemo(() => markdownToSafeHtml(value), [value]);
  return html`<div className=${`forum-markdown-render ${className}`.trim()} dangerouslySetInnerHTML=${{ __html: htmlValue }} />`;
}
