import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function PageHero({
  eyebrow,
  title,
  copy,
  calloutLabel,
  calloutItems = [],
  actionLabel = "",
  onAction,
}) {
  return html`
    <div className="news-hero">
      <div>
        <div className="news-eyebrow">${eyebrow}</div>
        <h1 className="news-title">${title}</h1>
        <p className="news-copy">${copy}</p>
      </div>
      <div className="news-callout">
        ${calloutLabel ? html`<div className="news-callout-label">${calloutLabel}</div>` : html``}
        ${calloutItems.map(
          (item, index) => html`<${React.Fragment} key=${`${item.title || "item"}-${index}`}>
            ${item.title ? html`<div className="news-callout-title">${item.title}</div>` : html``}
            ${item.copy ? html`<div className="news-callout-copy">${item.copy}</div>` : html``}
          <//>`,
        )}
        ${actionLabel
          ? html`<button className="button primary" type="button" onClick=${onAction}>${actionLabel}</button>`
          : html``}
      </div>
    </div>
  `;
}
