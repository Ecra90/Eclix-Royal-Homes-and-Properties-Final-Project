import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const links = [
    { to: "/", label: "Home" },
    { to: "/listings", label: "Listings" },
    { to: "/properties", label: "Properties" },
    { to: "/interiors", label: "Interiors" },
    { to: "/favourites", label: "Favourites" },
    { to: "/about", label: "About" },
    { to: "/contact", label: "Contact" },
  ];

  const isActive = (to) => location.pathname === to;

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <span style={styles.brandIcon}>⬡</span>
        <span>Eclix <span style={styles.brandAccent}>Royal Homes</span></span>
      </Link>

      {/* Desktop links */}
      <div style={styles.links}>
        {links.map(l => (
          <Link
            key={l.to}
            to={l.to}
            style={{ ...styles.link, ...(isActive(l.to) ? styles.activeLink : {}) }}
          >
            {l.label}
          </Link>
        ))}
      </div>

      {/* Auth buttons */}
      <div style={styles.authArea}>
        {user ? (
          <div style={styles.userArea}>
            <span style={styles.username}>👤 {user.username}</span>
            <Link to="/dashboard" style={styles.dashBtn}>Dashboard</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </div>
        ) : (
          <div style={styles.authBtns}>
            <Link to="/login" style={styles.loginBtn}>Login</Link>
            <Link to="/register" style={styles.registerBtn}>Register</Link>
          </div>
        )}
      </div>

      {/* Mobile hamburger */}
      <button style={styles.hamburger} onClick={() => setMenuOpen(o => !o)}>
        {menuOpen ? "✕" : "☰"}
      </button>

      {menuOpen && (
        <div style={styles.mobileMenu}>
          {links.map(l => (
            <Link key={l.to} to={l.to} style={styles.mobileLink} onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          {user ? (
            <>
              <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={styles.mobileLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}

const styles = {
  nav: {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "0 5%", height: "70px",
    background: "rgba(10,14,26,0.95)",
    backdropFilter: "blur(12px)",
    borderBottom: "1px solid rgba(212,175,55,0.2)",
    flexWrap: "wrap",
  },
  brand: {
    display: "flex", alignItems: "center", gap: "10px",
    color: "#f8f4e8", textDecoration: "none",
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.2rem", fontWeight: 700, letterSpacing: "0.05em",
    whiteSpace: "nowrap",
  },
  brandIcon: { color: "#d4af37", fontSize: "1.4rem" },
  brandAccent: { color: "#d4af37" },
  links: {
    display: "flex", gap: "8px", alignItems: "center",
    "@media(max-width:768px)": { display: "none" },
  },
  link: {
    color: "#c9c5b8", textDecoration: "none",
    fontSize: "0.82rem", letterSpacing: "0.08em", textTransform: "uppercase",
    padding: "6px 10px", borderRadius: "4px",
    transition: "color 0.2s",
    fontFamily: "'Cormorant Garamond', serif",
    fontWeight: 600,
  },
  activeLink: { color: "#d4af37", borderBottom: "1px solid #d4af37" },
  authArea: { display: "flex", alignItems: "center" },
  userArea: { display: "flex", alignItems: "center", gap: "10px" },
  username: { color: "#d4af37", fontSize: "0.85rem", fontFamily: "'Cormorant Garamond', serif" },
  dashBtn: {
    color: "#0a0e1a", background: "#d4af37", textDecoration: "none",
    padding: "6px 14px", borderRadius: "4px", fontSize: "0.8rem", fontWeight: 700,
  },
  logoutBtn: {
    background: "transparent", border: "1px solid rgba(212,175,55,0.4)",
    color: "#c9c5b8", padding: "6px 12px", borderRadius: "4px",
    cursor: "pointer", fontSize: "0.8rem",
  },
  authBtns: { display: "flex", gap: "10px" },
  loginBtn: {
    color: "#d4af37", textDecoration: "none", fontSize: "0.85rem",
    padding: "6px 14px", border: "1px solid rgba(212,175,55,0.4)",
    borderRadius: "4px", letterSpacing: "0.06em",
  },
  registerBtn: {
    color: "#0a0e1a", background: "#d4af37", textDecoration: "none",
    fontSize: "0.85rem", padding: "7px 16px", borderRadius: "4px",
    fontWeight: 700, letterSpacing: "0.06em",
  },
  hamburger: {
    display: "none", background: "none", border: "none",
    color: "#d4af37", fontSize: "1.5rem", cursor: "pointer",
    "@media(max-width:900px)": { display: "block" },
  },
  mobileMenu: {
    position: "fixed", top: "70px", left: 0, right: 0,
    background: "rgba(10,14,26,0.98)", backdropFilter: "blur(12px)",
    display: "flex", flexDirection: "column", padding: "20px 5%",
    borderBottom: "1px solid rgba(212,175,55,0.2)", zIndex: 999,
  },
  mobileLink: {
    color: "#c9c5b8", textDecoration: "none", padding: "12px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
    fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem",
  },
  mobileLogout: {
    background: "none", border: "none", color: "#c9c5b8",
    padding: "12px 0", cursor: "pointer", textAlign: "left",
    fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem",
  },
};
