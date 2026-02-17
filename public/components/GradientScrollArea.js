import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

function GradientScrollArea({ className = "", children }) {
  return html`<div className=${`gradient-scroll-area ${className}`.trim()}>${children}</div>`;
}

export default React.memo(GradientScrollArea);
