import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export const APP_TOAST_EVENT = "hardtale:toast";
const DEFAULT_ICON_BY_KIND = {
  success: "/Images/SVGs/toasts/Success.svg",
  warning: "/Images/SVGs/toasts/Warning.svg",
  error: "/Images/SVGs/toasts/Error.svg",
};

function normalizeToastKind(value) {
  const kind = String(value || "success").trim().toLowerCase();
  if (kind === "warning" || kind === "error") return kind;
  return "success";
}

export function emitAppToast(detail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(APP_TOAST_EVENT, { detail: detail || {} }));
}

export function createToastPayload(input = {}) {
  const kind = normalizeToastKind(input.kind || input.type);
  const message = String(input.message || input.body || "").trim();
  return {
    id:
      String(input.id || "").trim() ||
      `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    kind,
    title: String(input.title || "").trim() || (kind === "error" ? "Error" : kind === "warning" ? "Warning" : "Success"),
    message,
    fullMessage: String(input.fullMessage || message).trim(),
    createdAt: String(input.createdAt || new Date().toISOString()),
    duration: Math.max(1800, Math.min(12000, Number(input.duration) || 5200)),
    icon: String(input.icon || DEFAULT_ICON_BY_KIND[kind] || DEFAULT_ICON_BY_KIND.success).trim(),
  };
}

export default function ToastSystem({ toasts = [], onDismiss, onOpenDetails, shape = "block" }) {
  if (!Array.isArray(toasts) || toasts.length === 0) return null;
  const shapeClass = shape === "rounded" ? "rounded" : "block";
  return html`
    <div className="toast-stack" role="region" aria-label="System notifications" aria-live="polite">
      ${toasts.map((toast) => {
        const isError = toast.kind === "error";
        return html`<article
          key=${toast.id}
          className=${`toast-card toast-${toast.kind} ${shapeClass} ${isError ? "is-clickable" : ""}`.trim()}
          onClick=${() => {
            if (!isError || !onOpenDetails) return;
            onOpenDetails(toast);
          }}
        >
        <div className="toast-main">
          <span className="toast-icon-wrap" aria-hidden="true">
            <img className="toast-icon" src=${toast.icon} alt="" />
          </span>
          <div className="toast-content">
            <div className="toast-title">${toast.title}</div>
            ${toast.message ? html`<div className="toast-message">${toast.message}</div>` : html``}
          </div>
          <button
            className="toast-close"
            type="button"
            onClick=${(event) => {
              event.stopPropagation();
              if (onDismiss) onDismiss(toast.id);
            }}
            aria-label="Dismiss notification"
            title="Dismiss"
          >
            X
          </button>
        </div>
        <div className="toast-progress-track">
          <span className="toast-progress-bar" style=${{ animationDuration: `${toast.duration}ms` }}></span>
        </div>
      </article>`;
      })}
    </div>
  `;
}
