import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function MobileDrawerLinks({ navigate, closeMenu, openPlayHelp }) {
  function go(path) {
    if (!navigate) return;
    navigate(path);
    if (closeMenu) closeMenu();
  }

  return html`
    <div className="mobile-drawer-links">
      <button className="drawer-link" onClick=${() => go("/")}>Home</button>
      <button className="drawer-link" onClick=${() => go("/news")}>News</button>
      <button className="drawer-link" onClick=${() => go("/store")}>Store</button>
      <button className="drawer-link" onClick=${() => go("/vote")}>Vote</button>
      <button className="drawer-link" onClick=${() => go("/forum")}>Forum</button>
      <button className="drawer-link" onClick=${() => go("/support")}>Support</button>
      <button className="drawer-link" onClick=${() => go("/subscriptions")}>Subscriptions</button>
      <button
        className="drawer-link"
        onClick=${() => {
          if (openPlayHelp) openPlayHelp();
          if (closeMenu) closeMenu();
        }}
      >
        Play
      </button>
    </div>
  `;
}
