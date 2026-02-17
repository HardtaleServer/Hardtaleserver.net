import React from "react";
import htm from "htm";

const html = htm.bind(React.createElement);

export default function DesktopAuthButtons({
  SettingsMenu,
  NotificationsButton,
  CartButton,
  ClerkLoading,
  ClerkLoaded,
  SignedOut,
  SignedIn,
  SignUpButton,
  SignInButton,
  UserButton,
  theme,
  setTheme,
  toggleLightDark,
  placement,
  setPlacement,
  menuSide,
  setMenuSide,
  mobileNavStyle,
  setMobileNavStyle,
  logoSide,
  setLogoSide,
  mobileLogoStyle,
  setMobileLogoStyle,
  showMobileIsland,
  setShowMobileIsland,
  desktopStickyStyle,
  setDesktopStickyStyle,
  desktopStickyWide,
  setDesktopStickyWide,
  desktopStickyLogoStyle,
  setDesktopStickyLogoStyle,
  uiFlashEnabled,
  setUiFlashEnabled,
  toastShape,
  setToastShape,
  setSettingsOpen,
  isMobile,
  notificationCount,
  openNotifications,
  cartCount,
  openCart,
}) {
  return html`
    <div className="auth-buttons">
      <${SettingsMenu}
        theme=${theme}
        setTheme=${setTheme}
        toggleLightDark=${toggleLightDark}
        placement=${placement}
        setPlacement=${setPlacement}
        menuSide=${menuSide}
        setMenuSide=${setMenuSide}
        mobileNavStyle=${mobileNavStyle}
        setMobileNavStyle=${setMobileNavStyle}
        logoSide=${logoSide}
        setLogoSide=${setLogoSide}
        mobileLogoStyle=${mobileLogoStyle}
        setMobileLogoStyle=${setMobileLogoStyle}
        showMobileIsland=${showMobileIsland}
        setShowMobileIsland=${setShowMobileIsland}
        desktopStickyStyle=${desktopStickyStyle}
        setDesktopStickyStyle=${setDesktopStickyStyle}
        desktopStickyWide=${desktopStickyWide}
        setDesktopStickyWide=${setDesktopStickyWide}
        desktopStickyLogoStyle=${desktopStickyLogoStyle}
        setDesktopStickyLogoStyle=${setDesktopStickyLogoStyle}
        uiFlashEnabled=${uiFlashEnabled}
        setUiFlashEnabled=${setUiFlashEnabled}
        toastShape=${toastShape}
        setToastShape=${setToastShape}
        onOpenChange=${setSettingsOpen}
        isMobile=${isMobile}
      />
      <${ClerkLoading}>
        <button className="button" disabled>Loading auth...</button>
      <//>
      <${ClerkLoaded}>
        <${SignedOut}>
          <${SignUpButton} mode="modal">
            <button className="button primary">Sign up</button>
          <//>
          <${SignInButton} mode="modal">
            <button className="button">Sign in</button>
          <//>
        <//>
        <${SignedIn}>
          <${NotificationsButton} count=${notificationCount} onClick=${openNotifications} flashEnabled=${uiFlashEnabled} />
          ${cartCount > 0 ? html`<${CartButton} onClick=${openCart} count=${cartCount} />` : html``}
          <span className="user-button">
            <${UserButton} />
          </span>
        <//>
      <//>
    </div>
  `;
}
