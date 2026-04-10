// src/components/Navbar.jsx
import { useState, useEffect, useRef } from "react";
import { NavLink, Link } from "react-router-dom";

/* ─────────────────────────────────────────
   ICONS
───────────────────────────────────────── */
const ChevDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

/* ─────────────────────────────────────────
   NAVIGATION DATA (no Account item)
───────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: "Programs",
    path: "/programs",
    children: [
      { label: "Strength & Conditioning", desc: "Build raw power", path: "/programs/strength" },
      { label: "HIIT & Cardio", desc: "Fat-burning workouts", path: "/programs/hiit" },
      { label: "Yoga & Flexibility", desc: "Restore balance", path: "/programs/yoga" },
      { label: "Boxing & Combat", desc: "Fight conditioning", path: "/programs/boxing" },
      { label: "Personal Training", desc: "1-on-1 coaching", path: "/programs/personal-training" },
    ],
  },
  {
    label: "Membership",
    path: "/membership",
    children: [
      { label: "Starter Plan", desc: "Equipment access", path: "/membership#starter" },
      { label: "Pro Plan", desc: "Unlimited classes", path: "/membership#pro" },
      { label: "Elite Plan", desc: "Full premium access", path: "/membership#elite" },
      { label: "Corporate", desc: "Team memberships", path: "/membership#corporate" },
    ],
  },
  {
    label: "About Us",
    path: "/about",
    children: [
      { label: "Our Story", desc: "15 years of champions", path: "/about#story" },
      { label: "Our Trainers", desc: "World-class coaches", path: "/trainers" },
      { label: "Locations", desc: "200+ gyms worldwide", path: "/locations" },
      { label: "Press", desc: "News & media", path: "/press" },
    ],
  },
  { label: "Schedule", path: "/schedule", children: null },
  { label: "Contact Us", path: "/contact", children: null },
  // "Account" removed – now handled by the user pill
];

// Mock user data – replace with real auth context later
const MOCK_USER = {
  firstName: "Jordan",
  lastName: "Wells",
  avatar: "JW",
  membership: "Pro Member",
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const closeTimer = useRef(null);

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

  return (
    <nav className={`navbar${scrolled ? " navbar--scrolled" : ""}`}>
      <div className="navbar-inner">
        {/* Logo – clickable link to home */}
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

        {/* User pill – clickable button to account page */}
        <Link to="/account" className="nav-user-pill">
          <div className="nav-user-avatar">{MOCK_USER.avatar}</div>
          <div className="nav-user-info">
            <span className="nav-user-name">{MOCK_USER.firstName}</span>
            <span className="nav-user-badge">{MOCK_USER.membership}</span>
          </div>
        </Link>

        {/* Action buttons */}
        <div className="nav-actions">
          <NavLink to="/login" className="nav-btn-ghost">Sign In</NavLink>
          <NavLink to="/login" className="nav-btn-solid">Join Now</NavLink>
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
            <NavLink to="/login" className="nav-btn-ghost">Sign In</NavLink>
            <NavLink to="/login" className="nav-btn-solid">Join Now</NavLink>
          </div>
        </div>
      )}
    </nav>
  );
}