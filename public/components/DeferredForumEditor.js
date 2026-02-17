import React, { Suspense } from "react";

const ForumRichEditor = React.lazy(() => import("./ForumRichEditor.js"));

export default function DeferredForumEditor(props) {
  return React.createElement(
    Suspense,
    { fallback: React.createElement("div", { className: "muted" }, "Loading editor...") },
    React.createElement(ForumRichEditor, props),
  );
}
