import React from "react";
import { createPortal } from "react-dom";
import htm from "htm";

const html = htm.bind(React.createElement);

function PopUp({ show, onClose, title, children, className = "", headerBelow = null }) {
  if (!show) return null;
  return createPortal(html`
    <div className=${`popup-overlay ${className}`} onClick=${onClose}>
      <div className="popup" onClick=${(event) => event.stopPropagation()}>
        <div className="popup-header">
          <div className="section-title">${title}</div>
          <button className="popup-close" onClick=${onClose} aria-label="Close">
            X
          </button>
        </div>
        ${headerBelow}
        ${children}
      </div>
    </div>
  `, document.body);
}

export default React.memo(PopUp);
