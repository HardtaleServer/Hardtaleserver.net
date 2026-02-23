import React, { useEffect, useMemo, useRef, useState } from "react";
import htm from "htm";
import { markdownToSafeHtml } from "./forumMarkdown.js";
import {
  applyWrap,
  applyLinePrefix,
  insertAtSelection,
  clearMarkdownFormatting,
  buildDraftStorageKey,
  saveDraft,
  loadDraft,
} from "./forumEditorUtils.js";

const html = htm.bind(React.createElement);
const ADMIN_PANEL_ICON_SVG = "/Images/SVGs/ui/Admin_Panel.svg";
function ToolIcon({ name }) {
  if (name === "undo") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5a7 7 0 00-6.2 3.8L3 6v7h7l-2.7-2.7A5 5 0 1112 17h-1v2h1a7 7 0 000-14z"/></svg>`;
  }
  if (name === "redo") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5a7 7 0 016.2 3.8L21 6v7h-7l2.7-2.7A5 5 0 1012 17h1v2h-1a7 7 0 010-14z"/></svg>`;
  }
  if (name === "list") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 6h2v2H4V6zm4 0h12v2H8V6zm-4 5h2v2H4v-2zm4 0h12v2H8v-2zm-4 5h2v2H4v-2zm4 0h12v2H8v-2z"/></svg>`;
  }
  if (name === "numbered") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 6h2v2H5V6zm0 5h2v2H5v-2zm0 5h2v2H5v-2zM9 6h11v2H9V6zm0 5h11v2H9v-2zm0 5h11v2H9v-2z"/></svg>`;
  }
  if (name === "quote") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 7h5v5H9v3H7V7zm8 0h5v5h-3v3h-2V7z"/></svg>`;
  }
  if (name === "code") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M8.7 16.6L4.1 12l4.6-4.6 1.4 1.4L6.9 12l3.2 3.2-1.4 1.4zm6.6 0l-1.4-1.4 3.2-3.2-3.2-3.2 1.4-1.4 4.6 4.6-4.6 4.6z"/></svg>`;
  }
  if (name === "link") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3.9 12a5 5 0 015-5h3v2h-3a3 3 0 000 6h3v2h-3a5 5 0 01-5-5zm6.1 1h4v-2h-4v2zm5-6h3a5 5 0 010 10h-3v-2h3a3 3 0 000-6h-3V7z"/></svg>`;
  }
  if (name === "image") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 5h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V6a1 1 0 011-1zm1 11l3.5-4.5 2.5 3 3.5-4.5L19 16H5zm4-7a1.5 1.5 0 100 3 1.5 1.5 0 000-3z"/></svg>`;
  }
  if (name === "hr") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M4 11h16v2H4z"/></svg>`;
  }
  if (name === "emoji") {
    return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 100 20 10 10 0 000-20zm-4 8a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm8 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-7 4h6a3 3 0 01-6 0z"/></svg>`;
  }
  return html``;
}

function ForumRenderedMarkdown({ value = "", className = "", onMentionClick = null }) {
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

export default function ForumRichEditor({
  value = "",
  onChange,
  placeholder = "Write your post...",
  minLength = 30,
  maxLength = 4000,
  draftScope = "",
  autosaveEnabled = true,
  showTemplatePicker = true,
  templateOptions = null,
  initialMode = "edit",
  showModeTabs = true,
  mentionSuggestions = [],
}) {
  const textareaRef = useRef(null);
  const mentionPickerInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const historyLimitRef = useRef(200);
  const previousValueRef = useRef(String(value || ""));
  const [mode, setMode] = useState(initialMode);
  const [draftStatus, setDraftStatus] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [pickerLoaded, setPickerLoaded] = useState(false);
  const [pickerFailed, setPickerFailed] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(true);
  const [historyTick, setHistoryTick] = useState(0);
  const [mentionMenuOpen, setMentionMenuOpen] = useState(false);
  const [mentionMenuItems, setMentionMenuItems] = useState([]);
  const [mentionIndex, setMentionIndex] = useState(0);
  const [mentionPickerOpen, setMentionPickerOpen] = useState(false);
  const [mentionPickerQuery, setMentionPickerQuery] = useState("");
  const draftKey = useMemo(() => buildDraftStorageKey("forum-editor-draft", draftScope), [draftScope]);
  const count = String(value || "").length;
  const tooShort = count > 0 && count < minLength;
  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;
  const activeMode = showModeTabs ? mode : "edit";
  const normalizedMentionSuggestions = useMemo(() => {
    const byUsername = new Map();
    (Array.isArray(mentionSuggestions) ? mentionSuggestions : []).forEach((entry) => {
      const username = String(
        typeof entry === "string" ? entry : entry?.username || entry?.authorUsername || "",
      )
        .trim()
        .replace(/^@+/, "");
      if (!username) return;
      const key = username.toLowerCase();
      if (byUsername.has(key)) return;
      byUsername.set(key, {
        username,
        image: String(typeof entry === "object" ? entry?.image || entry?.authorImage || "" : ""),
      });
    });
    return Array.from(byUsername.values());
  }, [mentionSuggestions]);
  const mentionPickerItems = useMemo(() => {
    const query = String(mentionPickerQuery || "").trim().toLowerCase();
    const pool = normalizedMentionSuggestions;
    if (!query) return pool.slice(0, 12);
    return pool
      .filter((entry) => String(entry?.username || "").toLowerCase().includes(query))
      .slice(0, 12);
  }, [normalizedMentionSuggestions, mentionPickerQuery]);
  const templates = Array.isArray(templateOptions) && templateOptions.length > 0
    ? templateOptions
    : [
        {
          id: "help",
          label: "Help request",
          content:
            "## Help Request\n\n### Issue\nDescribe your issue.\n\n### Tried\n- Step 1\n- Step 2\n\n### Expected\nWhat should happen?",
        },
        {
          id: "bug",
          label: "Bug report",
          content:
            "## Bug Report\n\n### Summary\nShort summary.\n\n### Steps to Reproduce\n1. First step\n2. Second step\n\n### Expected\n\n### Actual\n",
        },
        {
          id: "appeal",
          label: "Appeal",
          content: "## Appeal\n\n### Context\nWhat happened?\n\n### Why Appeal\n\n### Additional Notes\n",
        },
      ];

  function touchHistory() {
    setHistoryTick((prev) => prev + 1);
  }

  function pushUndoSnapshot(snapshot) {
    const text = String(snapshot || "");
    const undo = undoStackRef.current;
    if (undo.length > 0 && undo[undo.length - 1] === text) return;
    undo.push(text);
    if (undo.length > historyLimitRef.current) undo.shift();
  }

  function applyEditorValue(nextValue, options = {}) {
    const current = String(value || "");
    const next = String(nextValue || "");
    if (next === current) return;
    const track = options.track !== false;
    if (track) {
      pushUndoSnapshot(current);
      redoStackRef.current = [];
      touchHistory();
    }
    previousValueRef.current = next;
    if (typeof onChange === "function") onChange(next);
    const selection = options.selection;
    if (selection && textareaRef.current) {
      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(selection.start, selection.end);
      });
    }
  }

  function undo() {
    if (undoStackRef.current.length === 0) return;
    const current = String(value || "");
    const previous = String(undoStackRef.current.pop() || "");
    redoStackRef.current.push(current);
    touchHistory();
    applyEditorValue(previous, { track: false });
  }

  function redo() {
    if (redoStackRef.current.length === 0) return;
    const current = String(value || "");
    const next = String(redoStackRef.current.pop() || "");
    undoStackRef.current.push(current);
    touchHistory();
    applyEditorValue(next, { track: false });
  }

  useEffect(() => {
    let alive = true;
    async function loadEmojiPicker() {
      try {
        await import("https://cdn.jsdelivr.net/npm/emoji-picker-element@1.21.3/index.js");
        if (!alive) return;
        setPickerLoaded(true);
      } catch {
        if (!alive) return;
        setPickerFailed(true);
      }
    }
    loadEmojiPicker();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!showEmoji || !pickerLoaded || !emojiPickerRef.current) return;
    const pickerEl = emojiPickerRef.current;
    function onEmojiClick(event) {
      const emoji = event?.detail?.unicode || event?.detail?.emoji;
      if (!emoji) return;
      insert(emoji);
    }
    pickerEl.addEventListener("emoji-click", onEmojiClick);
    return () => pickerEl.removeEventListener("emoji-click", onEmojiClick);
  }, [showEmoji, pickerLoaded, value]);

  useEffect(() => {
    if (!autosaveEnabled) return;
    if (String(value || "").trim()) return;
    const existing = loadDraft(window.localStorage, draftKey);
    if (existing && typeof onChange === "function") {
      onChange(existing);
      setDraftStatus("Draft restored");
    }
  }, [autosaveEnabled, draftKey]);

  useEffect(() => {
    if (!autosaveEnabled) return;
    const timer = setTimeout(() => {
      if (saveDraft(window.localStorage, draftKey, value)) {
        setDraftStatus("Draft saved");
        setTimeout(() => setDraftStatus(""), 1000);
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [value, autosaveEnabled, draftKey]);

  useEffect(() => {
    previousValueRef.current = String(value || "");
  }, [value, historyTick]);

  useEffect(() => {
    undoStackRef.current = [];
    redoStackRef.current = [];
    previousValueRef.current = String(value || "");
    touchHistory();
  }, [draftKey]);

  function wrap(open, close = open) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || start;
    const result = applyWrap(String(value || ""), start, end, open, close);
    applyEditorValue(result.value, {
      selection: { start: result.selectionStart, end: result.selectionEnd },
    });
  }

  function prefix(prefixValue) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || start;
    const result = applyLinePrefix(String(value || ""), start, end, prefixValue);
    applyEditorValue(result.value, {
      selection: { start: result.selectionStart, end: result.selectionEnd },
    });
  }

  function insert(text) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || start;
    const result = insertAtSelection(String(value || ""), start, end, text);
    applyEditorValue(result.value, {
      selection: { start: result.selectionStart, end: result.selectionEnd },
    });
  }

  function onKeyDown(event) {
    if (
      mentionMenuOpen &&
      mentionMenuItems.length > 0 &&
      (event.key === "Tab" || event.key === "Enter" || event.key === "ArrowDown" || event.key === "ArrowUp")
    ) {
      event.preventDefault();
      if (event.key === "ArrowDown") {
        setMentionIndex((prev) => (prev + 1) % mentionMenuItems.length);
        return;
      }
      if (event.key === "ArrowUp") {
        setMentionIndex((prev) => (prev - 1 + mentionMenuItems.length) % mentionMenuItems.length);
        return;
      }
      const selected = mentionMenuItems[mentionIndex] || mentionMenuItems[0] || null;
      if (selected) applyMentionSelection(selected);
      return;
    }

    if (!(event.ctrlKey || event.metaKey)) return;
    const key = String(event.key || "").toLowerCase();
    if (key === "b") {
      event.preventDefault();
      wrap("**");
    } else if (key === "i") {
      event.preventDefault();
      wrap("*");
    } else if (key === "u") {
      event.preventDefault();
      wrap("++");
    } else if (key === "k") {
      event.preventDefault();
      const url = window.prompt("Enter URL (https://...)");
      if (!url) return;
      const label = window.prompt("Display text", "Link") || "Link";
      insert(`[${label}](${url})`);
    } else if (key === "z" && event.shiftKey) {
      event.preventDefault();
      redo();
    } else if (key === "z") {
      event.preventDefault();
      undo();
    } else if (key === "y") {
      event.preventDefault();
      redo();
    }
  }

  function resolveMentionContext(textValue, caretIndex) {
    const caret = Math.max(0, Number(caretIndex || 0));
    const prefix = String(textValue || "").slice(0, caret);
    const match = prefix.match(/(^|\s)@([a-zA-Z0-9._-]{1,31})$/);
    if (!match) return null;
    return {
      query: String(match[2] || "").toLowerCase(),
      start: caret - String(match[2] || "").length - 1,
      end: caret,
    };
  }

  function updateMentionMenu(textValue, caretIndex) {
    const context = resolveMentionContext(textValue, caretIndex);
    if (!context) {
      setMentionMenuOpen(false);
      setMentionMenuItems([]);
      setMentionIndex(0);
      return;
    }
    const nextItems = normalizedMentionSuggestions
      .filter((entry) => String(entry?.username || "").toLowerCase().startsWith(context.query))
      .slice(0, 8);
    if (nextItems.length === 0) {
      setMentionMenuOpen(false);
      setMentionMenuItems([]);
      setMentionIndex(0);
      return;
    }
    setMentionMenuOpen(true);
    setMentionMenuItems(nextItems);
    setMentionIndex((prev) => Math.min(prev, Math.max(nextItems.length - 1, 0)));
  }

  function applyMentionSelection(mentionValue) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const username = String(
      typeof mentionValue === "string"
        ? mentionValue
        : mentionValue?.username || mentionValue?.authorUsername || "",
    )
      .trim()
      .replace(/^@+/, "");
    if (!username) return;
    const textValue = String(value || "");
    const start = textarea.selectionStart || 0;
    const end = textarea.selectionEnd || start;
    const context = resolveMentionContext(textValue, start);
    const replacement = `@${String(username || "").replace(/^@+/, "")} `;
    let nextValue = "";
    let nextCursor = 0;
    if (context) {
      nextValue = `${textValue.slice(0, context.start)}${replacement}${textValue.slice(context.end)}`;
      nextCursor = context.start + replacement.length;
    } else {
      const result = insertAtSelection(textValue, start, end, replacement);
      nextValue = result.value;
      nextCursor = result.selectionStart;
    }
    applyEditorValue(nextValue, {
      selection: { start: nextCursor, end: nextCursor },
    });
    setMentionMenuOpen(false);
    setMentionMenuItems([]);
    setMentionIndex(0);
    setMentionPickerOpen(false);
    setMentionPickerQuery("");
  }

  function applyTemplate(valueKey) {
    if (!valueKey || !onChange) return;
    const selected = templates.find((entry) => String(entry?.id || "") === valueKey);
    if (!selected) return;
    applyEditorValue(String(selected.content || ""));
  }

  return html`
    <div className="forum-editor">
      <div className="forum-editor-mode-row">
        ${showModeTabs
          ? html`<div className="forum-editor-mode-group" role="tablist" aria-label="Editor mode">
              <button type="button" className=${`ghost-btn ${mode === "edit" ? "active" : ""}`} onClick=${() => setMode("edit")}>Edit</button>
              <button type="button" className=${`ghost-btn ${mode === "preview" ? "active" : ""}`} onClick=${() => setMode("preview")}>Preview</button>
              <button type="button" className=${`ghost-btn ${mode === "split" ? "active" : ""}`} onClick=${() => setMode("split")}>Split</button>
            </div>`
          : html``}
        <button
          type="button"
          className="ghost-btn forum-editor-toolbar-toggle"
          onClick=${() => setToolbarExpanded((prev) => !prev)}
          aria-expanded=${toolbarExpanded ? "true" : "false"}
          title="Toggle tools"
        >
          <img className="forum-editor-tools-icon" src=${ADMIN_PANEL_ICON_SVG} alt="" aria-hidden="true" />
          <span>Markdown Tools</span>
        </button>
        <div className="forum-editor-status muted">${draftStatus}</div>
      </div>

      <div className=${`forum-editor-toolbar ${toolbarExpanded ? "expanded" : ""}`.trim()}>
        <button type="button" className="ghost-btn" onClick=${() => wrap("**")} title="Bold (Ctrl+B)"><strong>B</strong></button>
        <button type="button" className="ghost-btn" onClick=${() => wrap("*")} title="Italic (Ctrl+I)"><em>I</em></button>
        <button type="button" className="ghost-btn" onClick=${() => wrap("++")}>U</button>
        <button type="button" className="ghost-btn" onClick=${() => wrap("~~")}>S</button>
        <button type="button" className="ghost-btn" onClick=${() => prefix("# ")} title="Heading 1">H1</button>
        <button type="button" className="ghost-btn" onClick=${() => prefix("## ")} title="Heading 2">H2</button>
        <button type="button" className="ghost-btn" onClick=${() => prefix("### ")} title="Heading 3">H3</button>
        <button type="button" className="ghost-btn forum-editor-icon-btn" onClick=${() => prefix("- ")} title="Bulleted list"><${ToolIcon} name="list" /></button>
        <button type="button" className="ghost-btn forum-editor-icon-btn" onClick=${() => prefix("1. ")} title="Numbered list"><${ToolIcon} name="numbered" /></button>
        <button type="button" className="ghost-btn forum-editor-icon-btn" onClick=${() => prefix("> ")} title="Quote"><${ToolIcon} name="quote" /></button>
        <button type="button" className="ghost-btn forum-editor-icon-btn" onClick=${() => wrap("`")} title="Inline code"><${ToolIcon} name="code" /></button>
        <button type="button" className="ghost-btn" onClick=${() => insert("\n```\ncode\n```\n")}>Code Block</button>
        <button
          type="button"
          className="ghost-btn forum-editor-icon-btn"
          title="Insert link (Ctrl+K)"
          onClick=${() => {
            const url = window.prompt("Enter URL (https://...)");
            if (!url) return;
            const label = window.prompt("Display text", "Link") || "Link";
            insert(`[${label}](${url})`);
          }}
        ><${ToolIcon} name="link" /></button>
        <button
          type="button"
          className="ghost-btn forum-editor-icon-btn"
          title="Image URL"
          onClick=${() => {
            const url = window.prompt("Image URL (https://...)");
            if (!url) return;
            const alt = window.prompt("Alt text", "image") || "image";
            insert(`![${alt}](${url})`);
          }}
        ><${ToolIcon} name="image" /></button>
        <button type="button" className="ghost-btn forum-editor-icon-btn" onClick=${() => setShowEmoji((prev) => !prev)} title="Emoji"><${ToolIcon} name="emoji" /></button>
        <button
          type="button"
          className="ghost-btn"
          onClick=${() => {
            setMentionPickerOpen((prev) => !prev);
            setMentionPickerQuery("");
            requestAnimationFrame(() => mentionPickerInputRef.current?.focus());
          }}
        >
          @Someone
        </button>
        <button type="button" className="ghost-btn" onClick=${() => applyEditorValue(clearMarkdownFormatting(value))}>Clear</button>
      </div>

      ${showEmoji
        ? html`<div className="forum-editor-emoji-picker">
            ${pickerLoaded
              ? html`<emoji-picker class="reaction-picker-panel" ref=${emojiPickerRef}></emoji-picker>`
              : html`<div className="muted">Loading emojis...</div>`}
            ${pickerFailed ? html`<div className="reaction-error">Failed to load emoji picker.</div>` : html``}
          </div>`
        : html``}

      ${showTemplatePicker
        ? html`<label className="forum-editor-template">
            <span className="muted">Insert template</span>
            <select onChange=${(event) => applyTemplate(event.target.value)}>
              <option value="">Choose template</option>
              ${templates.map(
                (entry) => html`<option key=${entry.id} value=${entry.id}>${entry.label}</option>`,
              )}
            </select>
          </label>`
        : html``}
      ${mentionPickerOpen
        ? html`<div className="forum-editor-mention-picker">
            <label className="forum-editor-mention-search">
              <span className="muted">Mention a player</span>
              <input
                ref=${mentionPickerInputRef}
                type="text"
                value=${mentionPickerQuery}
                placeholder="@username"
                onInput=${(event) => setMentionPickerQuery(event.target.value)}
              />
            </label>
            <div className="forum-editor-mentions mention-picker-results">
              ${mentionPickerItems.length > 0
                ? mentionPickerItems.map(
                    (item, index) => html`<button
                      key=${`mention-picker-${item.username}-${index}`}
                      type="button"
                      className="forum-editor-mention-item"
                      onMouseDown=${(event) => {
                        event.preventDefault();
                        applyMentionSelection(item);
                      }}
                    >
                      <img
                        className="forum-editor-mention-avatar"
                        src=${item.image || "/assets/HardTale_H_GreyScale.png"}
                        alt=${item.username}
                      />
                      <span>@${item.username}</span>
                    </button>`,
                  )
                : html`<div className="muted forum-editor-mention-empty">No matching users.</div>`}
            </div>
          </div>`
        : html``}

      <div className=${`forum-editor-body mode-${activeMode}`.trim()}>
        ${(activeMode === "edit" || activeMode === "split")
          ? html`<textarea
              ref=${textareaRef}
              className="forum-editor-textarea"
              rows="8"
              placeholder=${placeholder}
              value=${value}
              maxLength=${maxLength}
              onKeyDown=${onKeyDown}
              onInput=${(event) => {
                const nextValue = event.target.value;
                const nextCaret = event.target.selectionStart || 0;
                applyEditorValue(nextValue);
                updateMentionMenu(nextValue, nextCaret);
              }}
            ></textarea>`
          : html``}
        ${(activeMode === "preview" || activeMode === "split")
          ? html`<div className="forum-editor-preview"><${ForumRenderedMarkdown} value=${value} /></div>`
          : html``}
      </div>
      ${mentionMenuOpen && mentionMenuItems.length > 0
        ? html`<div className="forum-editor-mentions">
            ${mentionMenuItems.map(
              (item, index) => html`<button
                key=${`mention-${item.username}-${index}`}
                type="button"
                className=${`forum-editor-mention-item ${mentionIndex === index ? "active" : ""}`.trim()}
                onMouseEnter=${() => setMentionIndex(index)}
                onMouseDown=${(event) => {
                  event.preventDefault();
                  applyMentionSelection(item);
                }}
              >
                <img
                  className="forum-editor-mention-avatar"
                  src=${item.image || "/assets/HardTale_H_GreyScale.png"}
                  alt=${item.username}
                />
                <span>@${item.username}</span>
              </button>`,
            )}
          </div>`
        : html``}
      <div className="forum-editor-footer">
        <div className="forum-editor-history-row">
          <button type="button" className="ghost-btn forum-editor-icon-btn" onClick=${undo} disabled=${!canUndo} title="Undo (Ctrl+Z)"><${ToolIcon} name="undo" /></button>
          <button type="button" className="ghost-btn forum-editor-icon-btn" onClick=${redo} disabled=${!canRedo} title="Redo (Ctrl+Y / Ctrl+Shift+Z)"><${ToolIcon} name="redo" /></button>
        </div>
        <span className="muted">${count}/${maxLength}</span>
        ${tooShort ? html`<span className="muted">Post body should be at least ${minLength} characters.</span>` : html``}
      </div>
    </div>
  `;
}

export { ForumRenderedMarkdown };

