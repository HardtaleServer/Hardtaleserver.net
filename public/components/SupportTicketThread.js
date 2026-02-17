import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);
const ERROR_MARKER_START = "[ATTACHED_ERROR_CONTEXT]";
const ERROR_MARKER_END = "[/ATTACHED_ERROR_CONTEXT]";

function parseMessageErrorContext(bodyValue) {
  const body = String(bodyValue || "");
  const start = body.indexOf(ERROR_MARKER_START);
  const end = body.indexOf(ERROR_MARKER_END);
  if (start < 0 || end < 0 || end <= start) {
    return { cleanBody: body.trim(), errorContext: null };
  }
  const markerContent = body
    .slice(start + ERROR_MARKER_START.length, end)
    .trim();
  const cleanBody = `${body.slice(0, start)} ${body.slice(end + ERROR_MARKER_END.length)}`
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const lines = markerContent.split(/\r?\n/);
  const titleLine = lines.find((line) => line.startsWith("Title:"));
  const whenLine = lines.find((line) => line.startsWith("When:"));
  const detailsIndex = lines.findIndex((line) => line.trim() === "Details:");
  const detailLines = detailsIndex >= 0 ? lines.slice(detailsIndex + 1) : [];
  return {
    cleanBody,
    errorContext: {
      title: titleLine ? titleLine.replace(/^Title:\s*/i, "").trim() : "System Error",
      when: whenLine ? whenLine.replace(/^When:\s*/i, "").trim() : "",
      details: detailLines.join("\n").trim(),
    },
  };
}

export default function SupportTicketThread({
  selectedTicket,
  isAdmin,
  nextStatus,
  setNextStatus,
  updateTicketStatus,
  formatTimestamp,
  chatDraft,
  setChatDraft,
  sendMessage,
}) {
  if (!selectedTicket) return html``;

  return html`
    <div className="card">
      <div className="section-title">${selectedTicket.subject}</div>
      <div className="muted">
        ${selectedTicket.category.toUpperCase()} - ${selectedTicket.status.toUpperCase()}
      </div>
      ${isAdmin
        ? html`<div className="comment-actions right">
            <select value=${nextStatus} onChange=${(event) => setNextStatus(event.target.value)}>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
              <option value="open">Open</option>
            </select>
            <button className="button ghost-btn" type="button" onClick=${updateTicketStatus}>
              Update Status
            </button>
          </div>`
        : html``}
      <div className="changelog-list">
        ${(selectedTicket.messages || []).map((message) => {
          const parsed = parseMessageErrorContext(message.body);
          return html`<div key=${message.id} className="changelog-entry">
            <div className="changelog-header">
              <div className="changelog-version">${message.authorName}</div>
              <div className="changelog-date">${formatTimestamp(message.createdAt)}</div>
            </div>
            <div className="muted">${message.role.toUpperCase()}</div>
            <p>${parsed.cleanBody}</p>
            ${isAdmin && parsed.errorContext
              ? html`<div className="ticket-error-context">
                  <div className="ticket-error-context-title">Attached Error Context</div>
                  <div className="muted">
                    ${parsed.errorContext.title}${parsed.errorContext.when ? ` - ${formatTimestamp(parsed.errorContext.when)}` : ""}
                  </div>
                  <pre>${parsed.errorContext.details || "No details provided."}</pre>
                </div>`
              : html``}
          </div>`;
        })}
      </div>
      <div className="comment-reply-form">
        <textarea
          rows="3"
          placeholder="Write a reply..."
          value=${chatDraft}
          onInput=${(event) => setChatDraft(event.target.value)}
        ></textarea>
        <div className="comment-actions right">
          <button className="button primary" type="button" onClick=${sendMessage}>
            Send Message
          </button>
        </div>
      </div>
    </div>
  `;
}
