function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeUrl(raw, mode = "link") {
  const value = String(raw || "").trim();
  if (!value) return "";
  const lower = value.toLowerCase();
  const isHttp = lower.startsWith("http://") || lower.startsWith("https://");
  if (mode === "image") {
    if (isHttp || lower.startsWith("data:image/")) return value;
    return "";
  }
  if (isHttp || lower.startsWith("mailto:")) return value;
  return "";
}

function applyInlineMarkdown(input) {
  let value = escapeHtml(input);
  const codeSpans = [];
  value = value.replace(/`([^`]+)`/g, (_, code) => {
    const token = `__CODE_SPAN_${codeSpans.length}__`;
    codeSpans.push(`<code>${escapeHtml(code)}</code>`);
    return token;
  });

  value = value.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) => {
    const safeUrl = sanitizeUrl(url, "image");
    if (!safeUrl) return "";
    return `<img src="${escapeHtml(safeUrl)}" alt="${escapeHtml(alt)}" loading="lazy" />`;
  });
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const safeUrl = sanitizeUrl(url, "link");
    if (!safeUrl) return escapeHtml(text);
    return `<a href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
  });
  value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  value = value.replace(/\*([^*\n]+)\*/g, "<em>$1</em>");
  value = value.replace(/_([^_\n]+)_/g, "<em>$1</em>");
  value = value.replace(/~~([^~]+)~~/g, "<s>$1</s>");
  value = value.replace(/\+\+([^+]+)\+\+/g, "<u>$1</u>");
  value = value.replace(
    /(^|[\s(>])@([a-zA-Z0-9][a-zA-Z0-9._-]{1,31})/g,
    (_, prefix, username) =>
      `${prefix}<button type="button" class="forum-mention-link" data-mention="${escapeHtml(username)}">@${escapeHtml(username)}</button>`,
  );

  codeSpans.forEach((snippet, index) => {
    value = value.replace(`__CODE_SPAN_${index}__`, snippet);
  });
  return value;
}

export function markdownToSafeHtml(markdown) {
  const normalizedMarkdown = String(markdown || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/\r\n/g, "\n");
  const lines = normalizedMarkdown.split("\n");
  const html = [];
  let i = 0;
  let inCodeBlock = false;
  let codeBuffer = [];
  let paragraphBuffer = [];

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    html.push(`<p>${applyInlineMarkdown(paragraphBuffer.join("<br />"))}</p>`);
    paragraphBuffer = [];
  }

  function flushCodeBlock() {
    if (!inCodeBlock) return;
    html.push(`<pre><code>${escapeHtml(codeBuffer.join("\n"))}</code></pre>`);
    codeBuffer = [];
    inCodeBlock = false;
  }

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      flushParagraph();
      if (inCodeBlock) flushCodeBlock();
      else inCodeBlock = true;
      i += 1;
      continue;
    }
    if (inCodeBlock) {
      codeBuffer.push(line);
      i += 1;
      continue;
    }
    if (!trimmed) {
      flushParagraph();
      i += 1;
      continue;
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushParagraph();
      html.push("<hr />");
      i += 1;
      continue;
    }
    if (/^#{1,3}\s+/.test(trimmed)) {
      flushParagraph();
      const level = Math.min(3, trimmed.match(/^#+/)[0].length);
      const text = trimmed.replace(/^#{1,3}\s+/, "");
      html.push(`<h${level}>${applyInlineMarkdown(text)}</h${level}>`);
      i += 1;
      continue;
    }
    if (/^>\s?/.test(trimmed)) {
      flushParagraph();
      const block = [];
      while (i < lines.length && /^>\s?/.test(lines[i].trim())) {
        block.push(lines[i].trim().replace(/^>\s?/, ""));
        i += 1;
      }
      html.push(`<blockquote>${applyInlineMarkdown(block.join("<br />"))}</blockquote>`);
      continue;
    }
    if (/^(\d+)\.\s+/.test(trimmed)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^(\d+)\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^(\d+)\.\s+/, ""));
        i += 1;
      }
      html.push(`<ol>${items.map((item) => `<li>${applyInlineMarkdown(item)}</li>`).join("")}</ol>`);
      continue;
    }
    if (/^[-*+]\s+/.test(trimmed)) {
      flushParagraph();
      const items = [];
      while (i < lines.length && /^[-*+]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*+]\s+/, ""));
        i += 1;
      }
      html.push(`<ul>${items.map((item) => `<li>${applyInlineMarkdown(item)}</li>`).join("")}</ul>`);
      continue;
    }
    paragraphBuffer.push(line);
    i += 1;
  }

  flushParagraph();
  flushCodeBlock();
  return html.join("\n");
}

export function markdownToPlainText(markdown) {
  const text = String(markdown || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/(\*\*|__|\*|_|~~|\+\+)/g, "")
    .replace(/\r\n/g, "\n");
  return text.trim();
}

export function markdownExcerpt(markdown, limit = 220) {
  const text = markdownToPlainText(markdown).replace(/\s+/g, " ").trim();
  if (!text) return "";
  if (text.length <= limit) return text;
  return `${text.slice(0, limit).trimEnd()}...`;
}
