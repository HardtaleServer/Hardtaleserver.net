import React, { useEffect, useRef, useState } from "react";
import htm from "htm";
import AccountActionButton from "./AccountActionButton.js";

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
  settingsOpen,
  isMobile,
  notificationCount,
  openNotifications,
  cartCount,
  openCart,
  profileName,
  profileAvatar,
  openProfilePanel,
  onLogout,
  logoutIconSrc = "/Images/SVGs/Logout.svg",
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState("");
  const menuRootRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    function handlePointerDown(event) {
      const root = menuRootRef.current;
      if (!root || root.contains(event.target)) return;
      setMenuOpen(false);
    }
    function handleEscape(event) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  function openAccountPanel() {
    setMenuOpen(false);
    if (typeof openProfilePanel === "function") openProfilePanel();
  }

  async function logoutNow() {
    setMenuOpen(false);
    if (typeof onLogout === "function") {
      await onLogout();
    }
  }

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
        openState=${settingsOpen}
        setOpenState=${setSettingsOpen}
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
          <${CartButton} onClick=${openCart} count=${cartCount} />
          <span className="user-button desktop-user-menu" ref=${menuRootRef}>
            <button
              className="user-button-trigger"
              type="button"
              title="Account options"
              aria-expanded=${menuOpen}
              onClick=${() => setMenuOpen((prev) => !prev)}
            >
              <img className="user-button-avatar" src=${profileAvatar} alt=${profileName} />
            </button>
            ${menuOpen
              ? html`<div className="desktop-account-menu" role="menu" aria-label="Profile options">
                  <${AccountActionButton}
                    className="desktop-account-menu-item"
                    role="menuitem"
                    textOnly=${true}
                    label=${hoveredItem === "account" ? "Open Account Panel" : "Account Panel"}
                    onMouseEnter=${() => setHoveredItem("account")}
                    onMouseLeave=${() => setHoveredItem("")}
                    onClick=${openAccountPanel}
                  />
                  <${AccountActionButton}
                    className="desktop-account-menu-item logout"
                    role="menuitem"
                    label=${hoveredItem === "logout" ? "Sign-Out Now" : "Sign-Out"}
                    iconSrc=${logoutIconSrc}
                    onMouseEnter=${() => setHoveredItem("logout")}
                    onMouseLeave=${() => setHoveredItem("")}
                    onClick=${logoutNow}
                  />
                </div>`
              : html``}
          </span>
        <//>
      <//>
    </div>
  `;
}
