import { useState } from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");

  const subscribe = async () => {
    if (!email) return;
    const res = await fetch("/api/newsletter", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setMsg(data.message || data.error);
    setEmail("");
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.grid}>
        <div>
          <h2 style={styles.brand}>⬡ Eclix <span style={{ color: "#d4af37" }}>Royal Homes</span></h2>
          <p style={styles.p}>
            Curating the world's most prestigious real estate. Founded on excellence and discretion—
            we transform the search for a home into a seamless journey of discovery.
          </p>
          <div style={styles.social}>
            <a href="https://wa.me/254724091668" target="_blank" rel="noreferrer" style={styles.socialLink}>WhatsApp</a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialLink}>Instagram</a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" style={styles.socialLink}>Twitter</a>
          </div>
        </div>

        <div>
          <h3 style={styles.heading}>Quick Links</h3>
          {[["Home", "/"], ["Listings", "/listings"], ["Properties", "/properties"],
            ["Interiors", "/interiors"], ["About Us", "/about"], ["Contact", "/contact"]
          ].map(([label, to]) => (
            <Link key={to} to={to} style={styles.navLink}>{label}</Link>
          ))}
        </div>

        <div>
          <h3 style={styles.heading}>Contact</h3>
          <p style={styles.p}>📧 info@eclixroyalhomes.com</p>
          <p style={styles.p}>📞 +254 724 091 668</p>
          <p style={styles.p}>📍 Nairobi, Kenya</p>
          <div style={{ marginTop: "16px" }}>
            <p style={{ ...styles.p, fontSize: "0.75rem", color: "#6b7280" }}>✔ Confidential transactions</p>
            <p style={{ ...styles.p, fontSize: "0.75rem", color: "#6b7280" }}>✔ Verified luxury listings</p>
            <p style={{ ...styles.p, fontSize: "0.75rem", color: "#6b7280" }}>✔ Global investor network</p>
          </div>
        </div>

        <div>
          <h3 style={styles.heading}>VIP Newsletter</h3>
          <p style={styles.p}>Join our private list for off-market luxury properties.</p>
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            style={styles.input}
          />
          <button onClick={subscribe} style={styles.btn}>Subscribe</button>
          {msg && <p style={{ color: "#d4af37", fontSize: "0.8rem", marginTop: "8px" }}>{msg}</p>}
        </div>
      </div>

      <div style={styles.bottom}>
        <p style={{ color: "#4b5563", fontSize: "0.8rem" }}>
          © 2026 Eclix Royal Homes. All rights reserved..
        </p>
        <div style={{ display: "flex", gap: "20px" }}>
          <a href="tel:+254724091668" style={styles.contactBtn}>📞 Call Now</a>
          <a href="https://wa.me/254724091668" target="_blank" rel="noreferrer" style={{ ...styles.contactBtn, background: "#25D366" }}>
            💬 WhatsApp
          </a>
        </div>
      </div>

      {/* Fixed WhatsApp button */}
      <a href="https://wa.me/254724091668" target="_blank" rel="noreferrer" style={styles.whatsappFloat}>
        💬
      </a>
    </footer>
  );
}

const styles = {
  footer: {
    background: "#070b14",
    borderTop: "1px solid rgba(212,175,55,0.15)",
    padding: "60px 5% 0",
    position: "relative",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "40px",
    marginBottom: "40px",
  },
  brand: {
    color: "#f8f4e8",
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.3rem",
    marginBottom: "14px",
  },
  heading: {
    color: "#d4af37",
    fontFamily: "'Playfair Display', serif",
    fontSize: "1rem",
    marginBottom: "16px",
    letterSpacing: "0.06em",
  },
  p: { color: "#9ca3af", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "8px" },
  navLink: {
    display: "block", color: "#9ca3af", textDecoration: "none",
    fontSize: "0.85rem", marginBottom: "8px", transition: "color 0.2s",
  },
  social: { display: "flex", gap: "12px", marginTop: "16px" },
  socialLink: {
    color: "#d4af37", textDecoration: "none", fontSize: "0.82rem",
    padding: "5px 12px", border: "1px solid rgba(212,175,55,0.3)",
    borderRadius: "20px", transition: "background 0.2s",
  },
  input: {
    width: "100%", padding: "10px 14px", borderRadius: "8px",
    border: "1px solid rgba(212,175,55,0.2)", background: "#111827",
    color: "#f8f4e8", fontSize: "0.85rem", marginBottom: "10px",
    boxSizing: "border-box", outline: "none",
  },
  btn: {
    width: "100%", padding: "10px", borderRadius: "8px",
    background: "#d4af37", color: "#0a0e1a",
    border: "none", fontWeight: 800, fontSize: "0.85rem",
    cursor: "pointer", letterSpacing: "0.06em",
  },
  bottom: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    padding: "20px 0", flexWrap: "wrap", gap: "12px",
  },
  contactBtn: {
    color: "#0a0e1a", background: "#d4af37", textDecoration: "none",
    padding: "8px 16px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: 700,
  },
  whatsappFloat: {
    position: "fixed", bottom: "24px", right: "24px",
    background: "#25D366", width: "56px", height: "56px",
    borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "26px",
    textDecoration: "none", zIndex: 999,
    boxShadow: "0 4px 20px rgba(37,211,102,0.4)",
  },
};
