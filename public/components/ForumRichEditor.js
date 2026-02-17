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
const EMOJI_SET = ["😀", "😅", "🔥", "✅", "🎉", "💡", "⚠️", "🛠️", "❤️", "🙏"];

function ForumRenderedMarkdown({ value = "", className = "" }) {
  const htmlValue = useMemo(() => markdownToSafeHtml(value), [value]);
  return html`<div className=${`forum-markdown-render ${className}`.trim()} dangerouslySetInnerHTML=${{ __html: htmlValue }} />`;
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
  initialMode = "edit",
}) {
  const textareaRef = useRef(null);
  const fileRef = useRef(null);
  const undoStackRef = useRef([]);
  const redoStackRef = useRef([]);
  const historyLimitRef = useRef(200);
  const previousValueRef = useRef(String(value || ""));
  const [mode, setMode] = useState(initialMode);
  const [draftStatus, setDraftStatus] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const [historyTick, setHistoryTick] = useState(0);
  const draftKey = useMemo(() => buildDraftStorageKey("forum-editor-draft", draftScope), [draftScope]);
  const count = String(value || "").length;
  const tooShort = count > 0 && count < minLength;
  const canUndo = undoStackRef.current.length > 0;
  const canRedo = redoStackRef.current.length > 0;

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
    if (!(event.ctrlKey || event.metaKey)) return;
    const key = String(event.key || "").toLowerCase();
    if (key === "b") {
      event.preventDefault();
      wrap("**");
    } else if (key === "i") {
      event.preventDefault();
      wrap("*");
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

  function applyTemplate(valueKey) {
    if (!valueKey || !onChange) return;
    if (valueKey === "help") {
      applyEditorValue(
        "## Help Request\n\n### Issue\nDescribe your issue.\n\n### Tried\n- Step 1\n- Step 2\n\n### Expected\nWhat should happen?",
      );
    } else if (valueKey === "bug") {
      applyEditorValue(
        "## Bug Report\n\n### Summary\nShort summary.\n\n### Steps to Reproduce\n1. First step\n2. Second step\n\n### Expected\n\n### Actual\n",
      );
    } else if (valueKey === "appeal") {
      applyEditorValue("## Appeal\n\n### Context\nWhat happened?\n\n### Why Appeal\n\n### Additional Notes\n");
    }
  }

  return html`
    <div className="forum-editor">
      <div className="forum-editor-mode-row">
        <div className="forum-editor-mode-group" role="tablist" aria-label="Editor mode">
          <button type="button" className=${`ghost-btn ${mode === "edit" ? "active" : ""}`} onClick=${() => setMode("edit")}>Edit</button>
          <button type="button" className=${`ghost-btn ${mode === "preview" ? "active" : ""}`} onClick=${() => setMode("preview")}>Preview</button>
          <button type="button" className=${`ghost-btn ${mode === "split" ? "active" : ""}`} onClick=${() => setMode("split")}>Split</button>
        </div>
        <div className="forum-editor-status muted">${draftStatus}</div>
      </div>

      <div className=${`forum-editor-toolbar ${toolbarExpanded ? "expanded" : ""}`.trim()}>
        <button type="button" className="ghost-btn forum-editor-toolbar-toggle" onClick=${() => setToolbarExpanded((prev) => !prev)}>Tools</button>
        <button type="button" className="ghost-btn" onClick=${undo} disabled=${!canUndo} title="Undo (Ctrl+Z)">Undo</button>
        <button type="button" className="ghost-btn" onClick=${redo} disabled=${!canRedo} title="Redo (Ctrl+Y)">Redo</button>
        <button type="button" className="ghost-btn" onClick=${() => wrap("**")}><strong>B</strong></button>
        <button type="button" className="ghost-btn" onClick=${() => wrap("*")}><em>I</em></button>
        <button type="button" className="ghost-btn" onClick=${() => wrap("++")}>U</button>
        <button type="button" className="ghost-btn" onClick=${() => wrap("~~")}>S</button>
        <button type="button" className="ghost-btn" onClick=${() => prefix("# ")}>H1</button>
        <button type="button" className="ghost-btn" onClick=${() => prefix("## ")}>H2</button>
        <button type="button" className="ghost-btn" onClick=${() => prefix("### ")}>H3</button>
        <button type="button" className="ghost-btn" onClick=${() => prefix("- ")}>List</button>
        <button type="button" className="ghost-btn" onClick=${() => prefix("1. ")}>1.</button>
        <button type="button" className="ghost-btn" onClick=${() => prefix("> ")}>Quote</button>
        <button type="button" className="ghost-btn" onClick=${() => wrap("`")}>Code</button>
        <button type="button" className="ghost-btn" onClick=${() => insert("\n```\ncode\n```\n")}>Code Block</button>
        <button
          type="button"
          className="ghost-btn"
          onClick=${() => {
            const url = window.prompt("Enter URL (https://...)");
            if (!url) return;
            const label = window.prompt("Display text", "Link") || "Link";
            insert(`[${label}](${url})`);
          }}
        >Link</button>
        <button
          type="button"
          className="ghost-btn"
          onClick=${() => {
            const url = window.prompt("Image URL (https://...)");
            if (!url) return;
            const alt = window.prompt("Alt text", "image") || "image";
            insert(`![${alt}](${url})`);
          }}
        >Image URL</button>
        <button type="button" className="ghost-btn" onClick=${() => fileRef.current && fileRef.current.click()}>Upload</button>
        <input
          ref=${fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange=${(event) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
              const result = String(reader.result || "");
              if (!result) return;
              insert(`![${file.name || "image"}](${result})`);
            };
            reader.readAsDataURL(file);
            event.target.value = "";
          }}
        />
        <button type="button" className="ghost-btn" onClick=${() => insert("\n---\n")}>HR</button>
        <button type="button" className="ghost-btn" onClick=${() => setShowEmoji((prev) => !prev)}>Emoji</button>
        <button type="button" className="ghost-btn" onClick=${() => applyEditorValue(clearMarkdownFormatting(value))}>Clear</button>
      </div>

      ${showEmoji
        ? html`<div className="forum-editor-emoji-row">
            ${EMOJI_SET.map((emoji) => html`<button type="button" className="ghost-btn" onClick=${() => insert(emoji)}>${emoji}</button>`)}
          </div>`
        : html``}

      ${showTemplatePicker
        ? html`<label className="forum-editor-template">
            <span className="muted">Insert template</span>
            <select onChange=${(event) => applyTemplate(event.target.value)}>
              <option value="">Choose template</option>
              <option value="help">Help request</option>
              <option value="bug">Bug report</option>
              <option value="appeal">Appeal</option>
            </select>
          </label>`
        : html``}

      <div className=${`forum-editor-body mode-${mode}`.trim()}>
        ${(mode === "edit" || mode === "split")
          ? html`<textarea
              ref=${textareaRef}
              className="forum-editor-textarea"
              rows="8"
              placeholder=${placeholder}
              value=${value}
              maxLength=${maxLength}
              onKeyDown=${onKeyDown}
              onInput=${(event) => applyEditorValue(event.target.value)}
            ></textarea>`
          : html``}
        ${(mode === "preview" || mode === "split")
          ? html`<div className="forum-editor-preview"><${ForumRenderedMarkdown} value=${value} /></div>`
          : html``}
      </div>
      <div className="forum-editor-footer">
        <span className="muted">${count}/${maxLength}</span>
        ${tooShort ? html`<span className="muted">Post body should be at least ${minLength} characters.</span>` : html``}
      </div>
    </div>
  `;
}

export { ForumRenderedMarkdown };

