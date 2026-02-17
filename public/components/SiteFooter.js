import React from "react";
import htm from "htm";
import { Link } from "react-router-dom";

const html = htm.bind(React.createElement);

export default function SiteFooter({
  footerRef,
  footerInView = false,
  onOpenChangelog,
  version = "",
  year = "",
  copyrightIconSrc = "/Images/SVGs/ui/Copyright.svg",
}) {
  return html`<footer ref=${footerRef} className=${`footer ${footerInView ? "fx-active" : "fx-paused"}`.trim()}>
    <div className="footer-top">
      <div className="footer-top-left">
        <button className="footer-link footer-version-trigger" type="button" onClick=${onOpenChangelog}>
          Version ${version}
        </button>
        <div className="footer-links">
          <${Link} className="footer-link" to="/">Home</${Link}>
          <${Link} className="footer-link" to="/about-us">About Us</${Link}>
          <${Link} className="footer-link" to="/news">News</${Link}>
          <${Link} className="footer-link" to="/store">Store</${Link}>
          <${Link} className="footer-link" to="/vote">Vote</${Link}>
          <${Link} className="footer-link" to="/support">Support</${Link}>
          <${Link} className="footer-link" to="/subscriptions">Subscriptions</${Link}>
        </div>
      </div>
      <span className="footer-copyright footer-emphasis">
        <img src=${copyrightIconSrc} alt="" aria-hidden="true" />
        <span>${`${year} Hardtale.net`}</span>
      </span>
    </div>
  </footer>`;
}

