// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const ChevDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="21" r="1" />
    <circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

/* ─────────────────────────────────────────
   NAVIGATION DATA (no Account link)
───────────────────────────────────────── */
const NAV_ITEMS = [

   
  { label: "Home", path: "/", children: null },
  
  {
    label: "Membership",
    path: "/membership",
    children: [
      { label: "Kids Programme", desc: "Equipment access", path: "/membership#starter" },
      { label: "Group Training", desc: "Unlimited classes", path: "/membership#plan-card" },
      { label: "Single Training", desc: "Full premium access", path: "/membership#elite" },
      { label: "Specialized Training", desc: "Team memberships", path: "/membership#corporate" },
    ],
  },

  { label: "Consultation", path: "/consultation", children: null },

{
    label: "Excursions",
    path: "/excursions",
    children: [
      { label: "Strength & Conditioning", desc: "Build raw power", path: "/programs/strength" },
      { label: "HIIT & Cardio", desc: "Fat-burning workouts", path: "/programs/hiit" },
      { label: "Yoga & Flexibility", desc: "Restore balance", path: "/programs/yoga" },
      { label: "Boxing & Combat", desc: "Fight conditioning", path: "/programs/boxing" },
      { label: "Personal Training", desc: "1-on-1 coaching", path: "/programs/personal-training" },
    ],
  },


  {
    label: "About",
    path: "/about",
    children: [
      { label: "Our Story", desc: "55 years of champions", path: "/about#story" },
      { label: "Our Trainers", desc: "World-class coaches", path: "/trainers" },
      { label: "Press", desc: "News & media", path: "/press" },
    ],
  }
];

export default function Navbar() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

  // Mock cart item count – replace with actual cart context later
  const [cartItemCount, setCartItemCount] = useState(2);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleMouseEnter = (label) => {
    clearTimeout(closeTimer.current);
    setActiveMenu(label);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 180);
  };

  // Get user display data
  const displayName = user?.firstName || user?.name || (user?.email ? user.email.split('@')[0] : 'User');
  const userAvatar = user?.avatar || displayName.charAt(0).toUpperCase();
  const membershipType = user?.membership || "Member";

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        {/* Logo links to home */}
        <NavLink to="/" className="nav-logo">
          <div className="nav-logo-hex">
            <div className="nlh-bg" />
            <div className="nlh-inner" />
            <span className="nlh-letter">G</span>
          </div>
          <span className="nav-logo-name">GYMPRO</span>
        </NavLink>

        {/* Desktop navigation links */}
        <ul className="nav-links">
          {NAV_ITEMS.map((item) => (
            <li
              key={item.label}
              className="nav-item"
              onMouseEnter={() => item.children && handleMouseEnter(item.label)}
              onMouseLeave={handleMouseLeave}
            >
              <NavLink
                to={item.path || "#"}
                className={({ isActive }) =>
                  `nav-link${isActive ? " nav-link--active" : ""}${activeMenu === item.label ? " nav-link--active" : ""}`
                }
                end
              >
                {item.label}
                {item.children && <ChevDown />}
              </NavLink>

              {item.children && activeMenu === item.label && (
                <div
                  className="nav-dropdown"
                  onMouseEnter={() => clearTimeout(closeTimer.current)}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="nav-dropdown-inner">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.label}
                        to={child.path || "#"}
                        className="nav-dropdown-item"
                      >
                        <span className="ndi-label">{child.label}</span>
                        <span className="ndi-desc">{child.desc}</span>
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Right side: conditional user pill OR sign-in buttons, plus cart icon */}
        <div className="nav-right-group">
          {isLoggedIn ? (
            <Link to="/account" className="nav-user-pill">
              <div className="nav-user-avatar">{userAvatar}</div>
              <div className="nav-user-info">
                <span className="nav-user-name">{displayName}</span>
                <span className="nav-user-badge">{membershipType}</span>
              </div>
            </Link>
          ) : (
            <div className="nav-actions">
              <NavLink to="/login" className="nav-btn-ghost">Sign In</NavLink>
              <NavLink to="/login" className="nav-btn-solid">Join Now</NavLink>
            </div>
          )}

          {/* Shopping cart icon with badge */}
          <Link to="/shop" className="nav-cart-icon">
            <CartIcon />
            {cartItemCount > 0 && (
              <span className="nav-cart-badge">{cartItemCount}</span>
            )}
          </Link>
        </div>

        {/* Hamburger (mobile) */}
        <button className="nav-hamburger" onClick={() => setMobileOpen((o) => !o)} aria-label="Menu">
          <span className={mobileOpen ? "ham-open" : ""} />
          <span className={mobileOpen ? "ham-open" : ""} />
          <span className={mobileOpen ? "ham-open" : ""} />
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="nav-mobile">
          {NAV_ITEMS.map((item) => (
            <div key={item.label} className="nav-mobile-item">
              <NavLink to={item.path || "#"} className="nav-mobile-label">
                {item.label}
              </NavLink>
              {item.children && (
                <div className="nav-mobile-children">
                  {item.children.map((child) => (
                    <NavLink key={child.label} to={child.path || "#"} className="nav-mobile-child">
                      {child.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="nav-mobile-actions">
            {!isLoggedIn && (
              <>
                <NavLink to="/login" className="nav-btn-ghost">Sign In</NavLink>
                <NavLink to="/login" className="nav-btn-solid">Join Now</NavLink>
              </>
            )}
            {isLoggedIn && (
              <Link to="/account" className="nav-btn-solid">My Account</Link>
            )}
            <Link to="/shop" className="nav-btn-solid nav-cart-mobile">
              Cart {cartItemCount > 0 && `(${cartItemCount})`}
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}