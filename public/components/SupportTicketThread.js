import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

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
        ${(selectedTicket.messages || []).map(
          (message) => html`<div key=${message.id} className="changelog-entry">
            <div className="changelog-header">
              <div className="changelog-version">${message.authorName}</div>
              <div className="changelog-date">${formatTimestamp(message.createdAt)}</div>
            </div>
            <div className="muted">${message.role.toUpperCase()}</div>
            <p>${message.body}</p>
          </div>`,
        )}
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
