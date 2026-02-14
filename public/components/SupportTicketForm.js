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
      <button className="button primary" type="submit">Create Ticket</button>
      ${status ? html`<div className="muted">${status}</div>` : html``}
    </form>
  `;
}
