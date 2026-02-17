import test from "node:test";
import assert from "node:assert/strict";
import {
  applyWrap,
  applyLinePrefix,
  saveDraft,
  loadDraft,
  buildDraftStorageKey,
} from "../public/components/forumEditorUtils.js";
import { markdownToSafeHtml } from "../public/components/forumMarkdown.js";

test("toolbar wrap formatting applies bold around selection", () => {
  const result = applyWrap("hello world", 6, 11, "**");
  assert.equal(result.value, "hello **world**");
});

test("toolbar line prefix applies list markers to selected lines", () => {
  const text = "first\nsecond";
  const result = applyLinePrefix(text, 0, text.length, "- ");
  assert.equal(result.value, "- first\n- second");
});

test("autosave helpers persist and restore draft text", () => {
  const storage = new Map();
  const mockStorage = {
    setItem(key, value) {
      storage.set(key, String(value));
    },
    getItem(key) {
      return storage.get(key) || "";
    },
  };
  const key = buildDraftStorageKey("forum-editor-draft", "create:updates");
  assert.equal(saveDraft(mockStorage, key, "draft body"), true);
  assert.equal(loadDraft(mockStorage, key), "draft body");
});

test("markdown renderer outputs safe html and blocks unsafe script/link payloads", () => {
  const html = markdownToSafeHtml(
    `# Title\n<script>alert(1)</script>\n[bad](javascript:alert(2))\n[ok](https://example.com)`,
  );
  assert.equal(html.includes("<script>"), false);
  assert.equal(html.includes("javascript:"), false);
  assert.equal(html.includes("https://example.com"), true);
});
