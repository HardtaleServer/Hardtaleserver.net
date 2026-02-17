import React from "react";
import htm from "htm";
import { emitAppToast } from "./ToastSystem.js";

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
  mode = "button",
  toastEnabled = false,
  toastMessage = "",
  hoverGradient = false,
}) {
  async function handleCopy(event) {
    if (event && typeof event.preventDefault === "function") event.preventDefault();
    const raw = String(valueToCopy || "").trim();
    if (!raw) return;
    try {
      await navigator.clipboard.writeText(raw);
      if (typeof onCopied === "function") onCopied(raw);
      if (toastEnabled) {
        emitAppToast({
          kind: "success",
          title: "Copied",
          message: String(toastMessage || `${raw} copied to clipboard.`),
          duration: 2600,
        });
      }
    } catch (error) {
      if (typeof onCopyError === "function") onCopyError(error);
      if (toastEnabled) {
        emitAppToast({
          kind: "warning",
          title: "Copy failed",
          message: "Clipboard write failed.",
          duration: 2800,
        });
      }
    }
  }

  const iconOnly = mode === "icon";
  return html`<button
    type="button"
    className=${`copy-action-btn ${iconOnly ? "icon-only" : ""} ${hoverGradient ? "hover-staff-gradient" : ""} ${subtle ? "subtle" : ""} ${className || ""}`.trim()}
    onClick=${handleCopy}
    title=${title || `Copy ${label}`}
    aria-label=${title || `Copy ${label}`}
  >
    <span
      className="copy-action-icon"
      style=${{ "--copy-icon": `url(${iconSrc})` }}
      aria-hidden="true"
    ></span>
    ${iconOnly ? html`` : html`<span>${label}</span>`}
  </button>`;
}
