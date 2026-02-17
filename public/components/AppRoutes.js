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
  sortedNotifications,
  setNews,
  setNotifications,
  addToCart,
  isLinkedAccount,
  cart,
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
        element=${html`<${StorePage}
          onAdd=${addToCart}
          isLinkedAccount=${isLinkedAccount}
          cart=${cart}
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
