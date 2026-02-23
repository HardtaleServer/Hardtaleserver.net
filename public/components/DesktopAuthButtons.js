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
  const [guestMenuOpen, setGuestMenuOpen] = useState(false);
  const [hoveredItem, setHoveredItem] = useState("");
  const menuRootRef = useRef(null);
  const guestMenuRootRef = useRef(null);

  useEffect(() => {
    if (!menuOpen && !guestMenuOpen) return undefined;
    function handlePointerDown(event) {
      const root = menuRootRef.current;
      const guestRoot = guestMenuRootRef.current;
      if (root && root.contains(event.target)) return;
      if (guestRoot && guestRoot.contains(event.target)) return;
      setMenuOpen(false);
      setGuestMenuOpen(false);
    }
    function handleEscape(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setGuestMenuOpen(false);
      }
    }
    window.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen, guestMenuOpen]);

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
          <span className="user-button desktop-user-menu" ref=${guestMenuRootRef}>
            <button
              className="user-button-trigger user-button-trigger-guest"
              type="button"
              title="Account options"
              aria-expanded=${guestMenuOpen}
              onClick=${() => setGuestMenuOpen((prev) => !prev)}
            >
              <img
                className="user-button-avatar user-button-avatar-guest"
                src="/Images/SVGs/New_User_Image.svg"
                alt=""
                aria-hidden="true"
                onError=${(event) => {
                  const target = event.currentTarget;
                  target.onerror = null;
                  target.src = "/Images/SVGs/No_User_Img.svg";
                }}
              />
            </button>
            ${guestMenuOpen
              ? html`<div className="desktop-account-menu" role="menu" aria-label="Sign in options">
                  <${SignInButton} mode="modal">
                    <button
                      className="account-action-btn desktop-account-menu-item text-only"
                      role="menuitem"
                      type="button"
                      onClick=${() => setGuestMenuOpen(false)}
                    >
                      Sign in
                    </button>
                  <//>
                  <${SignUpButton} mode="modal">
                    <button
                      className="account-action-btn desktop-account-menu-item text-only"
                      role="menuitem"
                      type="button"
                      onClick=${() => setGuestMenuOpen(false)}
                    >
                      Sign up
                    </button>
                  <//>
                </div>`
              : html``}
          </span>
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
