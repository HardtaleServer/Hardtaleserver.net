export function applyWrap(value, selectionStart, selectionEnd, open, close = open) {
  const text = String(value || "");
  const start = Math.max(0, Number(selectionStart || 0));
  const end = Math.max(start, Number(selectionEnd || start));
  const selected = text.slice(start, end);
  const next = `${text.slice(0, start)}${open}${selected}${close}${text.slice(end)}`;
  const cursorStart = start + open.length;
  const cursorEnd = cursorStart + selected.length;
  return { value: next, selectionStart: cursorStart, selectionEnd: cursorEnd };
}

export function applyLinePrefix(value, selectionStart, selectionEnd, prefix) {
  const text = String(value || "");
  const start = Math.max(0, Number(selectionStart || 0));
  const end = Math.max(start, Number(selectionEnd || start));
  const blockStart = text.lastIndexOf("\n", start - 1) + 1;
  const blockEndRaw = text.indexOf("\n", end);
  const blockEnd = blockEndRaw === -1 ? text.length : blockEndRaw;
  const block = text.slice(blockStart, blockEnd);
  const nextBlock = block
    .split("\n")
    .map((line) => `${prefix}${line}`)
    .join("\n");
  const next = `${text.slice(0, blockStart)}${nextBlock}${text.slice(blockEnd)}`;
  return { value: next, selectionStart: blockStart, selectionEnd: blockStart + nextBlock.length };
}

export function insertAtSelection(value, selectionStart, selectionEnd, insertText) {
  const text = String(value || "");
  const start = Math.max(0, Number(selectionStart || 0));
  const end = Math.max(start, Number(selectionEnd || start));
  const next = `${text.slice(0, start)}${insertText}${text.slice(end)}`;
  const cursor = start + String(insertText || "").length;
  return { value: next, selectionStart: cursor, selectionEnd: cursor };
}

export function clearMarkdownFormatting(value) {
  return String(value || "")
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, ""))
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/\*([^*\n]+)\*/g, "$1")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(/\+\+([^+]+)\+\+/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 $2")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    .replace(/^---$/gm, "");
}

export function buildDraftStorageKey(base, key) {
  const baseKey = String(base || "forum-draft").trim();
  const suffix = String(key || "").trim();
  return suffix ? `${baseKey}:${suffix}` : baseKey;
}

export function saveDraft(storage, key, value) {
  if (!storage || !key) return false;
  try {
    storage.setItem(key, String(value || ""));
    return true;
  } catch {
    return false;
  }
}

export function loadDraft(storage, key) {
  if (!storage || !key) return "";
  try {
    return String(storage.getItem(key) || "");
  } catch {
    return "";
  }
}
