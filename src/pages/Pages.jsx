import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PropertyCard, { getFavourites } from "../components/PropertyCard";

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetch("/api/bookings", { credentials: "include" })
      .then(r => r.json())
      .then(d => { setBookings(d.bookings || []); setLoading(false); });
  }, [user, navigate]);

  const formatPrice = (p) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p / 100);

  const statusColor = (s) => s === "confirmed" ? "#86efac" : s === "cancelled" ? "#f87171" : "#d4af37";

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.profileHeader}>
          <div style={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</div>
          <div>
            <h1 style={styles.title}>Welcome, {user?.username}</h1>
            <p style={styles.sub}>{user?.email}</p>
          </div>
          <button style={styles.logoutBtn} onClick={async () => { await logout(); navigate("/"); }}>
            Sign Out
          </button>
        </div>

        <div style={styles.quickLinks}>
          {[["Browse Listings", "/listings"], ["Favourites", "/favourites"]].map(([l, t]) => (
            <button key={t} style={styles.quickBtn} onClick={() => navigate(t)}>{l}</button>
          ))}
        </div>

        <h2 style={styles.sectionTitle}>My Bookings</h2>
        {loading ? (
          <div style={styles.spinner} />
        ) : bookings.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "3rem" }}>📋</p>
            <p style={{ color: "#9ca3af" }}>No bookings yet. Browse listings to get started.</p>
            <button style={styles.btn} onClick={() => navigate("/listings")}>Browse Listings</button>
          </div>
        ) : (
          <div style={styles.bookingList}>
            {bookings.map(b => (
              <div key={b.booking_id} style={styles.bookingCard}>
                <img
                  src={b.property_photo}
                  alt={b.property_name}
                  style={styles.bookingImg}
                  onError={e => { e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400"; }}
                />
                <div style={styles.bookingInfo}>
                  <h3 style={styles.bookingName}>{b.property_name}</h3>
                  <p style={styles.bookingLoc}>📍 {b.property_location}</p>
                  <p style={styles.bookingPrice}>{formatPrice(b.property_price)}</p>
                  <div style={styles.bookingMeta}>
                    <span style={styles.bookingType}>{b.booking_type === "viewing" ? "🏠 Viewing" : "💼 Purchase"}</span>
                    {b.booking_date && <span style={styles.bookingDate}>📅 {new Date(b.booking_date).toLocaleDateString()}</span>}
                  </div>
                </div>
                <span style={{ ...styles.statusBadge, color: statusColor(b.status), borderColor: statusColor(b.status) }}>
                  {b.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FAVOURITES ───────────────────────────────────────────────────────────────
export function Favourites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favs, setFavs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }

    // 1. Get saved property IDs from localStorage
    const savedIds = getFavourites();

    if (savedIds.length === 0) {
      setFavs([]);
      setLoading(false);
      return;
    }

    // 2. Fetch all properties, then filter to only the saved ones
    fetch("/api/properties", { credentials: "include" })
      .then(r => r.json())
      .then(d => {
        const allProperties = d.properties || [];
        const saved = allProperties.filter(p =>
          savedIds.includes(p.property_id)
        );
        setFavs(saved);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, navigate]);

  // When user un-hearts a card, remove it from the displayed list
  const handleFavToggle = (propertyId, isNowFav) => {
    if (!isNowFav) {
      setFavs(fs => fs.filter(f => f.property_id !== propertyId));
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <p style={styles.eyebrow}>Saved Collection</p>
        <h1 style={styles.title}>Your Favourite Properties</h1>

        {loading ? (
          <div style={styles.spinner} />
        ) : favs.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: "3rem" }}>💔</p>
            <p style={{ color: "#9ca3af" }}>No saved properties yet. Explore listings and heart the ones you love.</p>
            <button style={styles.btn} onClick={() => navigate("/listings")}>Browse Listings</button>
          </div>
        ) : (
          <div style={styles.grid}>
            {favs.map(p => (
              <PropertyCard
                key={p.property_id}
                property={p}
                onFavToggle={handleFavToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ABOUT ────────────────────────────────────────────────────────────────────
export function About() {
  return (
    <div style={styles.page}>
      <div style={styles.heroSection}>
        <p style={styles.eyebrow}>Our Story</p>
        <h1 style={styles.title}>About Eclix Royal Homes</h1>
        <p style={{ color: "#9ca3af", maxWidth: "620px", margin: "0 auto", lineHeight: 1.7, fontSize: "1.05rem" }}>
          Founded on the principles of excellence and discretion, Eclix Royal Homes is Kenya's premier
          luxury real estate boutique—dedicated to connecting global icons with extraordinary properties.
        </p>
      </div>

      <div style={{ ...styles.container, paddingTop: "60px" }}>
        <div style={styles.valuesGrid}>
          {[
            { icon: "🏆", title: "Excellence", text: "Every property we list meets our rigorous standards for quality, location, and investment potential." },
            { icon: "🔒", title: "Discretion", text: "We handle every transaction with complete confidentiality and respect for your privacy." },
            { icon: "🌍", title: "Global Reach", text: "Our network spans 50+ countries, connecting Kenyan luxury real estate with global investors." },
            { icon: "🤝", title: "White-Glove Service", text: "From first viewing to final handover, we guide you every step of the journey." },
          ].map(v => (
            <div key={v.title} style={styles.valueCard}>
              <span style={{ fontSize: "2.5rem" }}>{v.icon}</span>
              <h3 style={styles.valueTitle}>{v.title}</h3>
              <p style={{ color: "#9ca3af", lineHeight: 1.6, margin: 0, fontSize: "0.88rem" }}>{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CONTACT ─────────────────────────────────────────────────────────────────
export function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);

  return (
    <div style={styles.page}>
      <div style={styles.heroSection}>
        <p style={styles.eyebrow}>Get In Touch</p>
        <h1 style={styles.title}>Contact Us</h1>
      </div>
      <div style={{ ...styles.container, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", paddingTop: "60px" }}>
        <div>
          <h2 style={styles.sectionTitle}>Our Details</h2>
          {[["📧 Email", "info@eclixroyalhomes.com"], ["📞 Phone", "+254 724 091 668"], ["📍 Office", "Nairobi, Kenya"], ["🕒 Hours", "Mon–Sat, 8am–6pm EAT"]].map(([l, v]) => (
            <div key={l} style={styles.contactRow}>
              <p style={styles.contactLabel}>{l}</p>
              <p style={styles.contactValue}>{v}</p>
            </div>
          ))}
        </div>
        <div style={styles.formCard}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <p style={{ fontSize: "3rem" }}>✉️</p>
              <h3 style={{ color: "#d4af37", fontFamily: "'Playfair Display', serif" }}>Message Sent!</h3>
              <p style={{ color: "#9ca3af" }}>We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <>
              <h2 style={styles.sectionTitle}>Send a Message</h2>
              {[["name", "Full Name", "text"], ["email", "Email", "email"]].map(([k, l, t]) => (
                <div key={k}>
                  <label style={styles.label}>{l}</label>
                  <input style={styles.input} type={t} value={form[k]}
                    onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} />
                </div>
              ))}
              <label style={styles.label}>Message</label>
              <textarea style={{ ...styles.input, height: "120px", resize: "vertical" }}
                value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
              <button style={styles.btn} onClick={() => { if (form.name && form.email) setSent(true); }}>
                Send Message
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── INTERIORS (static showcase) ─────────────────────────────────────────────
export function Interiors() {
  const interiors = [
    { title: "Marble Entrance Hall", img: "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800", desc: "Grand double-height entrance with Italian Carrara marble flooring." },
    { title: "Open Plan Living", img: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800", desc: "Seamless indoor-outdoor flow with floor-to-ceiling glazing." },
    { title: "Chef's Kitchen", img: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", desc: "Professional-grade appliances, butler's pantry, and island dining." },
    { title: "Master Suite", img: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800", desc: "Sanctuary-style suite with spa bathroom and private terrace." },
    { title: "Home Cinema", img: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800", desc: "4K Dolby Atmos private screening room with custom acoustic panels." },
    { title: "Infinity Pool", img: "https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=800", desc: "Heated infinity-edge pool with sunset views over the city." },
  ];

  return (
    <div style={styles.page}>
      <div style={styles.heroSection}>
        <p style={styles.eyebrow}>Design Excellence</p>
        <h1 style={styles.title}>New Interiors</h1>
        <p style={{ color: "#9ca3af", maxWidth: "480px", margin: "0 auto" }}>
          A curated collection of interior spaces that define modern luxury living.
        </p>
      </div>
      <div style={{ ...styles.grid, padding: "60px 5%" }}>
        {interiors.map(i => (
          <div key={i.title} style={styles.interiorCard}>
            <img src={i.img} alt={i.title} style={styles.interiorImg}
              onError={e => { e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"; }} />
            <div style={styles.interiorInfo}>
              <h3 style={styles.interiorTitle}>{i.title}</h3>
              <p style={{ color: "#9ca3af", fontSize: "0.85rem", margin: 0 }}>{i.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0a0e1a", minHeight: "100vh", paddingTop: "70px" },
  heroSection: { textAlign: "center", padding: "70px 5% 20px", borderBottom: "1px solid rgba(212,175,55,0.1)" },
  container: { maxWidth: "1100px", margin: "0 auto", padding: "0 5% 60px" },
  eyebrow: { color: "#d4af37", letterSpacing: "0.2em", fontSize: "0.72rem", textTransform: "uppercase", marginBottom: "10px" },
  title: { color: "#f8f4e8", fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 4vw, 3rem)", margin: "0 0 16px" },
  sub: { color: "#6b7280", fontSize: "0.85rem", marginBottom: "0" },
  sectionTitle: { color: "#f8f4e8", fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", margin: "0 0 24px" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" },
  empty: { textAlign: "center", padding: "80px 0" },
  spinner: {
    width: "40px", height: "40px", borderRadius: "50%",
    border: "3px solid rgba(212,175,55,0.2)", borderTopColor: "#d4af37",
    margin: "60px auto",
  },
  btn: {
    display: "inline-block", padding: "12px 28px",
    background: "#d4af37", color: "#0a0e1a",
    border: "none", borderRadius: "8px",
    fontWeight: 800, fontSize: "0.85rem", cursor: "pointer", marginTop: "16px",
  },
  profileHeader: {
    display: "flex", alignItems: "center", gap: "20px",
    background: "#111827", borderRadius: "16px",
    padding: "28px", marginBottom: "28px",
    border: "1px solid rgba(212,175,55,0.1)",
    flexWrap: "wrap",
  },
  avatar: {
    width: "60px", height: "60px", borderRadius: "50%",
    background: "#d4af37", color: "#0a0e1a",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: "1.5rem", fontWeight: 800, flexShrink: 0,
  },
  logoutBtn: {
    marginLeft: "auto", background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)", color: "#6b7280",
    padding: "8px 16px", borderRadius: "8px", cursor: "pointer",
  },
  quickLinks: { display: "flex", gap: "12px", marginBottom: "32px" },
  quickBtn: {
    padding: "10px 20px", background: "#111827",
    border: "1px solid rgba(212,175,55,0.2)", color: "#d4af37",
    borderRadius: "8px", cursor: "pointer", fontSize: "0.85rem",
  },
  bookingList: { display: "flex", flexDirection: "column", gap: "16px" },
  bookingCard: {
    display: "flex", alignItems: "center", gap: "20px",
    background: "#111827", borderRadius: "12px", overflow: "hidden",
    border: "1px solid rgba(212,175,55,0.1)", flexWrap: "wrap",
  },
  bookingImg: { width: "120px", height: "90px", objectFit: "cover", flexShrink: 0 },
  bookingInfo: { flex: 1, padding: "16px 0" },
  bookingName: { color: "#f8f4e8", fontFamily: "'Playfair Display', serif", margin: "0 0 4px", fontSize: "1rem" },
  bookingLoc: { color: "#6b7280", fontSize: "0.8rem", margin: "0 0 4px" },
  bookingPrice: { color: "#d4af37", fontSize: "0.9rem", fontWeight: 700, margin: "0 0 8px" },
  bookingMeta: { display: "flex", gap: "16px" },
  bookingType: { color: "#9ca3af", fontSize: "0.78rem" },
  bookingDate: { color: "#9ca3af", fontSize: "0.78rem" },
  statusBadge: {
    border: "1px solid", padding: "4px 12px", borderRadius: "20px",
    fontSize: "0.7rem", letterSpacing: "0.1em", margin: "16px",
  },
  valuesGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" },
  valueCard: {
    background: "#111827", padding: "32px",
    borderRadius: "16px", border: "1px solid rgba(212,175,55,0.1)",
    display: "flex", flexDirection: "column", gap: "12px",
  },
  valueTitle: { color: "#d4af37", fontFamily: "'Playfair Display', serif", margin: 0 },
  contactRow: { marginBottom: "20px" },
  contactLabel: { color: "#6b7280", fontSize: "0.75rem", letterSpacing: "0.08em", margin: "0 0 4px" },
  contactValue: { color: "#f8f4e8", fontSize: "0.95rem", margin: 0 },
  formCard: { background: "#111827", borderRadius: "16px", padding: "32px", border: "1px solid rgba(212,175,55,0.1)" },
  label: { display: "block", color: "#9ca3af", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" },
  input: {
    display: "block", width: "100%", padding: "12px 16px",
    borderRadius: "8px", border: "1px solid rgba(212,175,55,0.15)",
    background: "#0a0e1a", color: "#f8f4e8", fontSize: "0.9rem",
    marginBottom: "20px", boxSizing: "border-box", outline: "none",
  },
  interiorCard: { background: "#111827", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(212,175,55,0.1)" },
  interiorImg: { width: "100%", height: "220px", objectFit: "cover" },
  interiorInfo: { padding: "20px" },
  interiorTitle: { color: "#f8f4e8", fontFamily: "'Playfair Display', serif", margin: "0 0 8px" },
};