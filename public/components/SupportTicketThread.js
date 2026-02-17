import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);
const ERROR_MARKER_START = "[ATTACHED_ERROR_CONTEXT]";
const ERROR_MARKER_END = "[/ATTACHED_ERROR_CONTEXT]";
const URL_PATTERN = /(https?:\/\/[^\s]+)/gi;

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

function renderLinkedText(text) {
  const value = String(text || "");
  const parts = [];
  let lastIndex = 0;
  let match;
  URL_PATTERN.lastIndex = 0;
  while ((match = URL_PATTERN.exec(value))) {
    const start = match.index;
    const end = start + match[0].length;
    if (start > lastIndex) {
      parts.push(value.slice(lastIndex, start));
    }
    parts.push(
      html`<a href=${match[0]} target="_blank" rel="noopener noreferrer">
        ${match[0]}
      </a>`,
    );
    lastIndex = end;
  }
  if (lastIndex < value.length) {
    parts.push(value.slice(lastIndex));
  }
  return parts;
}

function renderMultilineBody(bodyValue) {
  const lines = String(bodyValue || "").split(/\r?\n/);
  return lines.map((line, index) =>
    html`<span key=${`line-${index}`}>
      ${renderLinkedText(line)}
      ${index < lines.length - 1 ? html`<br />` : html``}
    </span>`,
  );
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
            <p>${renderMultilineBody(parsed.cleanBody)}</p>
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
