import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function ForumSectionList({ sections = [], onNavigateSection }) {
  return html`
    <section className="card forum-section-list">
      ${sections.map(
        (section) => html`<article key=${section.id} className="forum-section-card">
          <div className="forum-section-stat">${section.stat}</div>
          <div className="forum-section-body">
            <div className="forum-section-title">${section.title}</div>
            <p className="muted">${section.description}</p>
          </div>
          <button
            type="button"
            className="button ghost-btn"
            onClick=${() => onNavigateSection && onNavigateSection(section.id)}
          >
            View Section
          </button>
        </article>`,
      )}
    </section>
  `;
}
