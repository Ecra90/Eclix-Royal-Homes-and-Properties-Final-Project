import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Book() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({ booking_type: "viewing", booking_date: "", notes: "" });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    fetch(`/api/properties/${id}`, { credentials: "include" })
      .then(r => r.json())
      .then(d => setProperty(d.property));
  }, [id, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/bookings", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: parseInt(id), ...form }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok) {
      setStatus({ ok: true, msg: "✓ Booking confirmed! Our team will contact you within 24 hours." });
    } else {
      setStatus({ ok: false, msg: data.error });
    }
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p / 100);

  if (!property) return (
    <div style={{ ...styles.page, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={styles.spinner} />
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {/* Property summary */}
        <div style={styles.summary}>
          <img
            src={property.property_photo}
            alt={property.property_name}
            style={styles.summaryImg}
            onError={e => { e.target.src = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"; }}
          />
          <div style={styles.summaryInfo}>
            <p style={styles.eyebrow}>📍 {property.property_location}</p>
            <h2 style={styles.summaryTitle}>{property.property_name}</h2>
            <p style={styles.summaryPrice}>{formatPrice(property.property_price)}</p>
            <div style={styles.specs}>
              <span style={styles.spec}>🛏 {property.property_beds} beds</span>
              <span style={styles.spec}>🚿 {property.property_bath} baths</span>
              {property.property_size && <span style={styles.spec}>📐 {property.property_size}m²</span>}
            </div>
          </div>
        </div>

        {/* Form */}
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>Book This Property</h2>
          <p style={styles.formSub}>Logged in as <span style={{ color: "#d4af37" }}>{user.username}</span></p>

          {status ? (
            <div style={{ ...styles.statusBox, background: status.ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", borderColor: status.ok ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)" }}>
              <p style={{ color: status.ok ? "#86efac" : "#f87171", margin: 0 }}>{status.msg}</p>
              {status.ok && (
                <button style={styles.btn} onClick={() => navigate("/dashboard")} >
                  View My Bookings
                </button>
              )}
            </div>
          ) : (
            <div>
              <label style={styles.label}>Booking Type</label>
              <div style={styles.typeRow}>
                {["viewing", "purchase"].map(t => (
                  <button
                    key={t}
                    type="button"
                    style={{ ...styles.typeBtn, ...(form.booking_type === t ? styles.typeBtnActive : {}) }}
                    onClick={() => setForm(f => ({ ...f, booking_type: t }))}
                  >
                    {t === "viewing" ? "🏠 Schedule Viewing" : "💼 Express Purchase Interest"}
                  </button>
                ))}
              </div>

              <label style={styles.label}>Preferred Date</label>
              <input
                type="date"
                style={styles.input}
                value={form.booking_date}
                min={new Date().toISOString().split("T")[0]}
                onChange={e => setForm(f => ({ ...f, booking_date: e.target.value }))}
              />

              <label style={styles.label}>Additional Notes</label>
              <textarea
                style={{ ...styles.input, height: "100px", resize: "vertical" }}
                placeholder="Any special requests or questions…"
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              />

              <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting…" : "Confirm Booking"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { background: "#0a0e1a", minHeight: "100vh", paddingTop: "90px", padding: "90px 5% 60px" },
  container: { maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "32px" },
  summary: {
    display: "flex", gap: "24px", background: "#111827",
    borderRadius: "16px", overflow: "hidden",
    border: "1px solid rgba(212,175,55,0.1)",
  },
  summaryImg: { width: "280px", objectFit: "cover", flexShrink: 0 },
  summaryInfo: { padding: "28px", flex: 1 },
  eyebrow: { color: "#6b7280", fontSize: "0.8rem", margin: "0 0 8px" },
  summaryTitle: { color: "#f8f4e8", fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", margin: "0 0 10px" },
  summaryPrice: { color: "#d4af37", fontFamily: "'Playfair Display', serif", fontSize: "1.3rem", fontWeight: 700, margin: "0 0 14px" },
  specs: { display: "flex", gap: "16px" },
  spec: { color: "#6b7280", fontSize: "0.82rem" },
  formCard: {
    background: "#111827", borderRadius: "16px", padding: "40px",
    border: "1px solid rgba(212,175,55,0.1)",
  },
  formTitle: { color: "#f8f4e8", fontFamily: "'Playfair Display', serif", fontSize: "1.6rem", margin: "0 0 6px" },
  formSub: { color: "#6b7280", fontSize: "0.85rem", marginBottom: "28px" },
  label: { display: "block", color: "#9ca3af", fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" },
  input: {
    display: "block", width: "100%", padding: "12px 16px",
    borderRadius: "8px", border: "1px solid rgba(212,175,55,0.15)",
    background: "#0a0e1a", color: "#f8f4e8", fontSize: "0.9rem",
    marginBottom: "20px", boxSizing: "border-box", outline: "none",
  },
  typeRow: { display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" },
  typeBtn: {
    flex: 1, padding: "12px", borderRadius: "8px",
    border: "1px solid rgba(212,175,55,0.2)", background: "#0a0e1a",
    color: "#9ca3af", cursor: "pointer", fontSize: "0.85rem",
  },
  typeBtnActive: { background: "rgba(212,175,55,0.15)", color: "#d4af37", borderColor: "#d4af37" },
  btn: {
    display: "block", width: "100%", padding: "14px",
    background: "#d4af37", color: "#0a0e1a",
    border: "none", borderRadius: "8px",
    fontWeight: 800, fontSize: "0.9rem", cursor: "pointer", marginTop: "8px",
  },
  statusBox: {
    borderRadius: "12px", border: "1px solid",
    padding: "24px", textAlign: "center",
  },
  spinner: {
    width: "40px", height: "40px", borderRadius: "50%",
    border: "3px solid rgba(212,175,55,0.2)", borderTopColor: "#d4af37",
  },
};
