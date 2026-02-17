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

function applyWithSelection(textarea, value, onChange, transform) {
  if (!textarea || typeof onChange !== "function") return;
  const start = textarea.selectionStart || 0;
  const end = textarea.selectionEnd || start;
  const result = transform(String(value || ""), start, end);
  onChange(result.value);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(result.selectionStart, result.selectionEnd);
  });
}

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
  const [mode, setMode] = useState(initialMode);
  const [draftStatus, setDraftStatus] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [toolbarExpanded, setToolbarExpanded] = useState(false);
  const draftKey = useMemo(() => buildDraftStorageKey("forum-editor-draft", draftScope), [draftScope]);
  const count = String(value || "").length;
  const tooShort = count > 0 && count < minLength;

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

  function wrap(open, close = open) {
    applyWithSelection(textareaRef.current, value, onChange, (text, start, end) =>
      applyWrap(text, start, end, open, close),
    );
  }

  function prefix(prefixValue) {
    applyWithSelection(textareaRef.current, value, onChange, (text, start, end) =>
      applyLinePrefix(text, start, end, prefixValue),
    );
  }

  function insert(text) {
    applyWithSelection(textareaRef.current, value, onChange, (base, start, end) =>
      insertAtSelection(base, start, end, text),
    );
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
    }
  }

  function applyTemplate(valueKey) {
    if (!valueKey || !onChange) return;
    if (valueKey === "help") {
      onChange("## Help Request\n\n### Issue\nDescribe your issue.\n\n### Tried\n- Step 1\n- Step 2\n\n### Expected\nWhat should happen?");
    } else if (valueKey === "bug") {
      onChange("## Bug Report\n\n### Summary\nShort summary.\n\n### Steps to Reproduce\n1. First step\n2. Second step\n\n### Expected\n\n### Actual\n");
    } else if (valueKey === "appeal") {
      onChange("## Appeal\n\n### Context\nWhat happened?\n\n### Why Appeal\n\n### Additional Notes\n");
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
        <button type="button" className="ghost-btn" onClick=${() => onChange(clearMarkdownFormatting(value))}>Clear</button>
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
              onInput=${(event) => onChange(event.target.value)}
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
