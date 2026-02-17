import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function CopyAction({
  label = "Copy",
  valueToCopy = "",
  className = "button",
  iconSrc = "/Images/SVGs/ui/Copy.svg",
  subtle = false,
  onCopied,
  onCopyError,
  title = "",
}) {
  async function handleCopy(event) {
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    const raw = String(valueToCopy || "").trim();
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      if (typeof onCopied === "function") onCopied(raw);
    } catch (error) {
      if (typeof onCopyError === "function") onCopyError(error);
    }
  }

  return html`<button
    type="button"
    className=${`copy-action-btn ${subtle ? "subtle" : ""} ${className || ""}`.trim()}
    onClick=${handleCopy}
    title=${title || `Copy ${label}`}
  >
    <span
      className="copy-action-icon"
      style=${{ "--copy-icon": `url(${iconSrc})` }}
      aria-hidden="true"
    ></span>
    <span>${label}</span>
  </button>`;
}
