import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function MobileDrawerLinks({
  navigate,
  closeMenu,
  openPlayHelp,
  activeId = "",
}) {
  function go(path) {
    if (!navigate) return;
    navigate(path);
    if (closeMenu) closeMenu();
  }

  function linkClass(id) {
    return `drawer-link ${activeId === id ? "active" : ""}`.trim();
  }

  return html`
    <div className="mobile-drawer-links">
      <button className=${linkClass("home")} onClick=${() => go("/")}>Home</button>
      <button className=${linkClass("news")} onClick=${() => go("/news")}>News</button>
      <button className=${linkClass("store")} onClick=${() => go("/store")}>Store</button>
      <button className=${linkClass("vote")} onClick=${() => go("/vote")}>Vote</button>
      <button className=${linkClass("forum")} onClick=${() => go("/forum")}>Forum</button>
      <button className=${linkClass("support")} onClick=${() => go("/support")}>Support</button>
      <button className=${linkClass("subscriptions")} onClick=${() => go("/subscriptions")}>Subscriptions</button>
      <button
        className=${linkClass("play")}
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
