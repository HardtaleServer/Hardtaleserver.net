import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function AppRoutes({
  Routes,
  Route,
  routesLocation,
  HomePage,
  AboutUsPage,
  NewsPage,
  StoreGatewayPage,
  StorePage,
  VotePage,
  ForumPage,
  SubscriptionsPage,
  NotFoundPage,
  sortedNews,
  loading,
  error,
  playRef,
  openHowModal,
  navigate,
  isAdmin,
  isStaff,
  sortedNotifications,
  setNews,
  setNotifications,
  addToCart,
  removeFromCart,
  isLinkedAccount,
  cart,
  onLinkClick,
  onAdminFakePurchase,
  isSignedIn,
  profileAvatar,
  profileRankLabel,
  profileOwnedRank,
  profileStaffRole,
}) {
  return html`
    <${Routes} location=${routesLocation}>
      <${Route}
        path="/"
        element=${html`<${HomePage}
          news=${sortedNews}
          loading=${loading}
          error=${error}
          playRef=${playRef}
          onPlayClick=${openHowModal}
          onNewsClick=${() => navigate("/news")}
          onHowClick=${() => openHowModal()}
          onLinkClick=${onLinkClick}
          isLinkedAccount=${isLinkedAccount}
          isSignedIn=${isSignedIn}
        />`}
      />
      <${Route}
        path="/home"
        element=${html`<${HomePage}
          news=${sortedNews}
          loading=${loading}
          error=${error}
          playRef=${playRef}
          onPlayClick=${openHowModal}
          onNewsClick=${() => navigate("/news")}
          onHowClick=${() => openHowModal()}
          onLinkClick=${onLinkClick}
          isLinkedAccount=${isLinkedAccount}
          isSignedIn=${isSignedIn}
        />`}
      />
      <${Route}
        path="/news"
        element=${html`<${NewsPage}
          news=${sortedNews}
          loading=${loading}
          error=${error}
          isAdmin=${isAdmin}
          notifications=${sortedNotifications}
          onNewsUpdate=${setNews}
          onNotificationsUpdate=${setNotifications}
        />`}
      />
      <${Route} path="/about-us" element=${html`<${AboutUsPage} />`} />
      <${Route}
        path="/store"
        element=${html`<${StoreGatewayPage} />`}
      />
      <${Route}
        path="/store/ranks"
        element=${html`<${StorePage}
          onAdd=${addToCart}
          onRemove=${removeFromCart}
          isLinkedAccount=${isLinkedAccount}
          isAdmin=${isAdmin}
          isStaff=${isStaff}
          cart=${cart}
          onAdminFakePurchase=${onAdminFakePurchase}
          profileAvatar=${profileAvatar}
          profileRankLabel=${profileRankLabel}
          profileOwnedRank=${profileOwnedRank}
          profileStaffRole=${profileStaffRole}
          section="ranks"
        />`}
      />
      <${Route}
        path="/store/gold"
        element=${html`<${StorePage}
          onAdd=${addToCart}
          onRemove=${removeFromCart}
          isLinkedAccount=${isLinkedAccount}
          isAdmin=${isAdmin}
          isStaff=${isStaff}
          cart=${cart}
          onAdminFakePurchase=${onAdminFakePurchase}
          profileAvatar=${profileAvatar}
          profileRankLabel=${profileRankLabel}
          profileOwnedRank=${profileOwnedRank}
          profileStaffRole=${profileStaffRole}
          section="gold"
        />`}
      />
      <${Route}
        path="/store/currency"
        element=${html`<${StorePage}
          onAdd=${addToCart}
          onRemove=${removeFromCart}
          isLinkedAccount=${isLinkedAccount}
          isAdmin=${isAdmin}
          isStaff=${isStaff}
          cart=${cart}
          onAdminFakePurchase=${onAdminFakePurchase}
          profileAvatar=${profileAvatar}
          profileRankLabel=${profileRankLabel}
          profileOwnedRank=${profileOwnedRank}
          profileStaffRole=${profileStaffRole}
          section="currency"
        />`}
      />
      <${Route} path="/vote" element=${html`<${VotePage} />`} />
      <${Route} path="/forum" element=${html`<${ForumPage} isAdmin=${isAdmin} />`} />
      <${Route} path="/subscriptions" element=${html`<${SubscriptionsPage} />`} />
      <${Route}
        path="/link"
        element=${html`<${HomePage}
          news=${sortedNews}
          loading=${loading}
          error=${error}
          playRef=${playRef}
          onPlayClick=${openHowModal}
          onNewsClick=${() => navigate("/news")}
          onHowClick=${() => openHowModal()}
          onLinkClick=${onLinkClick}
          isLinkedAccount=${isLinkedAccount}
          isSignedIn=${isSignedIn}
        />`}
      />
      <${Route}
        path="/link/:code"
        element=${html`<${HomePage}
          news=${sortedNews}
          loading=${loading}
          error=${error}
          playRef=${playRef}
          onPlayClick=${openHowModal}
          onNewsClick=${() => navigate("/news")}
          onHowClick=${() => openHowModal()}
          onLinkClick=${onLinkClick}
          isLinkedAccount=${isLinkedAccount}
          isSignedIn=${isSignedIn}
        />`}
      />
      <${Route}
        path="*"
        element=${html`<${NotFoundPage}
          isAdmin=${isAdmin}
          news=${sortedNews}
          notifications=${sortedNotifications}
          onNewsUpdate=${setNews}
          onNotificationsUpdate=${setNotifications}
        />`}
      />
    <//>
  `;
}
