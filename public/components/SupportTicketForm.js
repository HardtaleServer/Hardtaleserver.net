import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function SupportTicketForm({
  submitTicket,
  newSubject,
  setNewSubject,
  newCategory,
  setNewCategory,
  newBody,
  setNewBody,
  errorContextOptions = [],
  selectedErrorContextId = "",
  setSelectedErrorContextId,
  status,
}) {
  return html`
    <form className="admin-panel" onSubmit=${submitTicket}>
      <div className="section-title">Create Support Ticket</div>
      <input
        placeholder="Subject"
        value=${newSubject}
        onInput=${(event) => setNewSubject(event.target.value)}
        required
      />
      <label className="settings-row">
        <span>Category</span>
        <select value=${newCategory} onChange=${(event) => setNewCategory(event.target.value)}>
          <option value="support">Support</option>
          <option value="appeal">Ban Appeal</option>
          <option value="warning">Warning Appeal</option>
          <option value="general">General</option>
        </select>
      </label>
      <textarea
        placeholder="Describe your issue..."
        value=${newBody}
        onInput=${(event) => setNewBody(event.target.value)}
        required
      ></textarea>
      ${Array.isArray(errorContextOptions) && errorContextOptions.length > 0
        ? html`<label className="settings-row">
            <span>Attach redacted error context</span>
            <select
              value=${selectedErrorContextId}
              onChange=${(event) =>
                setSelectedErrorContextId && setSelectedErrorContextId(event.target.value)}
            >
              <option value="">None</option>
              ${errorContextOptions.map(
                (entry) => html`<option key=${entry.id} value=${entry.id}>
                  ${entry.title} - ${new Date(entry.createdAt).toLocaleString([], {
                    month: "short",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </option>`,
              )}
            </select>
          </label>`
        : html``}
      <button className="button primary" type="submit">Create Ticket</button>
      ${status ? html`<div className="muted">${status}</div>` : html``}
    </form>
  `;
}
