import React, { useState } from "react";
import htm from "htm";
import PopUp from "./PopUp.js";

const html = htm.bind(React.createElement);

export default function SubscriptionsPage() {
  const [showPortal, setShowPortal] = useState(false);

  return html`
    <section className="subscriptions-page fade-in">
      <div className="subscriptions-hero card">
        <div>
          <div className="subscriptions-eyebrow">Subscription Portal</div>
          <h1>Manage your plan</h1>
          <p className="muted">
            Keep your membership active, change tiers, or update billing in one secure place.
          </p>
        </div>
        <div className="subscriptions-hero-actions">
          <button className="button primary" onClick=${() => setShowPortal(true)}>Open Portal</button>
          <button className="button ghost-btn">View Invoice History</button>
        </div>
      </div>

      <div className="subscriptions-grid">
        <section className="card subscription-card">
          <div className="subscription-badge">Active</div>
          <div className="subscription-title">Legend Membership</div>
          <div className="subscription-price">$14.99 / month</div>
          <div className="subscription-meta muted">Renews on Mar 11, 2026</div>
          <div className="subscription-actions">
            <button className="button">Change Plan</button>
            <button className="button ghost-btn">Pause</button>
          </div>
        </section>

        <section className="card subscription-card">
          <div className="subscription-title">Billing</div>
          <div className="billing-row">
            <span className="muted">Payment method</span>
            <span>Visa •••• 2384</span>
          </div>
          <div className="billing-row">
            <span className="muted">Billing email</span>
            <span>hardtaleserver@gmail.com</span>
          </div>
          <div className="billing-row">
            <span className="muted">Next charge</span>
            <span>$14.99</span>
          </div>
          <button className="button">Update Billing</button>
        </section>

        <section className="card subscription-card">
          <div className="subscription-title">Perks & Access</div>
          <ul className="subscription-perks">
            <li>Weekly cosmetics drop</li>
            <li>Priority login queue</li>
            <li>Exclusive Discord role</li>
            <li>Monthly kit refresh</li>
          </ul>
          <button className="button ghost-btn">View Perk Details</button>
        </section>
      </div>
    </section>

    <${PopUp} show=${showPortal} onClose=${() => setShowPortal(false)} title="Subscription Portal">
      <div className="portal-modal">
        <div className="portal-section">
          <div className="portal-title">Secure Dashboard</div>
          <p className="muted">
            This is a mock portal preview. Connect your billing provider to launch the live
            subscription dashboard.
          </p>
        </div>
        <div className="portal-grid">
          <div className="portal-card">
            <div className="portal-card-title">Plan controls</div>
            <div className="muted">Upgrade, downgrade, pause, or cancel.</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-title">Billing updates</div>
            <div className="muted">Edit cards, billing email, and address.</div>
          </div>
          <div className="portal-card">
            <div className="portal-card-title">Invoice history</div>
            <div className="muted">Download receipts and tax invoices.</div>
          </div>
        </div>
        <div className="portal-actions">
          <button className="button primary">Launch Live Portal</button>
          <button className="button ghost-btn" onClick=${() => setShowPortal(false)}>Close</button>
        </div>
      </div>
    <//>
  `;
}

