import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function TicketInboxList({
  loading = false,
  tickets = [],
  onSelectTicket,
}) {
  if (loading) {
    return html`<p className="muted">Loading tickets...</p>`;
  }
  if (!tickets.length) {
    return html`<p className="muted">No tickets yet.</p>`;
  }
  return html`
    <div className="news-list">
      ${tickets.map(
        (ticket) => html`<button
          key=${ticket.id}
          className="drawer-link"
          type="button"
          onClick=${() => onSelectTicket && onSelectTicket(ticket.id)}
        >
          ${ticket.subject} - ${ticket.status.toUpperCase()}
        </button>`,
      )}
    </div>
  `;
}
