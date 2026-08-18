import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = "https://eclixroyalhomesbackendapi.vercel.app";

export default function Book() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [form, setForm] = useState({
    booking_type: "viewing",
    booking_date: "",
    notes: "",
  });

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [propertyLoading, setPropertyLoading] = useState(true);

  // ─────────────────────────────────────────
  // Check authentication and load property
  // ─────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login");
      return;
    }

    const loadProperty = async () => {
      try {
        setPropertyLoading(true);

        const res = await fetch(
          `${API_URL}/api/properties/${id}`,
          {
            method: "GET",
            credentials: "include",
          }
        );

        const text = await res.text();

        console.log(
          "PROPERTY STATUS:",
          res.status
        );

        console.log(
          "PROPERTY RESPONSE:",
          text
        );

        let data;

        try {
          data = text ? JSON.parse(text) : {};
        } catch {
          throw new Error(
            "The property server returned an invalid response."
          );
        }

        if (!res.ok) {
          throw new Error(
            data.error ||
              `Unable to load property (${res.status})`
          );
        }

        setProperty(data.property);
      } catch (error) {
        console.error(
          "PROPERTY LOAD ERROR:",
          error
        );

        setStatus({
          ok: false,
          msg:
            error.message ||
            "Unable to load this property.",
        });
      } finally {
        setPropertyLoading(false);
      }
    };

    loadProperty();
  }, [id, user, authLoading, navigate]);

  // ─────────────────────────────────────────
  // Submit booking
  // ─────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.booking_date) {
      setStatus({
        ok: false,
        msg: "Please select a preferred date.",
      });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const res = await fetch(
        `${API_URL}/api/bookings`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            property_id: Number(id),
            booking_type: form.booking_type,
            booking_date: form.booking_date,
            notes: form.notes,
          }),
        }
      );

      const text = await res.text();

      console.log(
        "BOOKING STATUS:",
        res.status
      );

      console.log(
        "BOOKING RESPONSE:",
        text
      );

      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "The booking server returned an invalid response."
        );
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            `Booking failed (${res.status})`
        );
      }

      setStatus({
        ok: true,
        msg:
          "✓ Booking confirmed! Our team will contact you within 24 hours.",
      });

      setForm({
        booking_type: "viewing",
        booking_date: "",
        notes: "",
      });
    } catch (error) {
      console.error(
        "BOOKING ERROR:",
        error
      );

      setStatus({
        ok: false,
        msg:
          error.message ||
          "Unable to create booking.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (p) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(Number(p || 0) / 100);

  // ─────────────────────────────────────────
  // Loading
  // ─────────────────────────────────────────
  if (authLoading || propertyLoading) {
    return (
      <div
        style={{
          ...styles.page,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={styles.spinner} />
      </div>
    );
  }

  // ─────────────────────────────────────────
  // Property failed to load
  // ─────────────────────────────────────────
  if (!property) {
    return (
      <div style={styles.page}>
        <div
          style={{
            maxWidth: "600px",
            margin: "0 auto",
            textAlign: "center",
            paddingTop: "100px",
          }}
        >
          <h2 style={{ color: "#f8f4e8" }}>
            Unable to load property
          </h2>

          {status && (
            <p style={{ color: "#f87171" }}>
              {status.msg}
            </p>
          )}

          <button
            style={styles.btn}
            onClick={() => navigate("/listings")}
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* PROPERTY SUMMARY */}
        <div style={styles.summary}>
          <img
            src={property.property_photo}
            alt={property.property_name}
            style={styles.summaryImg}
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800";
            }}
          />

          <div style={styles.summaryInfo}>
            <p style={styles.eyebrow}>
              📍 {property.property_location}
            </p>

            <h2 style={styles.summaryTitle}>
              {property.property_name}
            </h2>

            <p style={styles.summaryPrice}>
              {formatPrice(property.property_price)}
            </p>

            <div style={styles.specs}>
              <span style={styles.spec}>
                🛏 {property.property_beds || 0} beds
              </span>

              <span style={styles.spec}>
                🚿 {property.property_bath || 0} baths
              </span>

              {property.property_size && (
                <span style={styles.spec}>
                  📐 {property.property_size}m²
                </span>
              )}
            </div>
          </div>
        </div>

        {/* BOOKING FORM */}
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            Book This Property
          </h2>

          <p style={styles.formSub}>
            Logged in as{" "}
            <span style={{ color: "#d4af37" }}>
              {user?.username}
            </span>
          </p>

          {status ? (
            <div
              style={{
                ...styles.statusBox,
                background: status.ok
                  ? "rgba(34,197,94,0.1)"
                  : "rgba(239,68,68,0.1)",
                borderColor: status.ok
                  ? "rgba(34,197,94,0.3)"
                  : "rgba(239,68,68,0.3)",
              }}
            >
              <p
                style={{
                  color: status.ok
                    ? "#86efac"
                    : "#f87171",
                  margin: 0,
                }}
              >
                {status.msg}
              </p>

              {status.ok && (
                <button
                  style={styles.btn}
                  onClick={() =>
                    navigate("/dashboard")
                  }
                >
                  View My Bookings
                </button>
              )}

              {!status.ok && (
                <button
                  style={styles.btn}
                  onClick={() =>
                    setStatus(null)
                  }
                >
                  Try Again
                </button>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit}>

              {/* BOOKING TYPE */}
              <label style={styles.label}>
                Booking Type
              </label>

              <div style={styles.typeRow}>
                {["viewing", "purchase"].map(
                  (type) => (
                    <button
                      key={type}
                      type="button"
                      style={{
                        ...styles.typeBtn,
                        ...(form.booking_type === type
                          ? styles.typeBtnActive
                          : {}),
                      }}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          booking_type: type,
                        }))
                      }
                    >
                      {type === "viewing"
                        ? "🏠 Schedule Viewing"
                        : "💼 Express Purchase Interest"}
                    </button>
                  )
                )}
              </div>

              {/* DATE */}
              <label style={styles.label}>
                Preferred Date
              </label>

              <input
                type="date"
                style={styles.input}
                value={form.booking_date}
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    booking_date: e.target.value,
                  }))
                }
                required
              />

              {/* NOTES */}
              <label style={styles.label}>
                Additional Notes
              </label>

              <textarea
                style={{
                  ...styles.input,
                  height: "100px",
                  resize: "vertical",
                }}
                placeholder="Any special requests or questions…"
                value={form.notes}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
              />

              {/* SUBMIT */}
              <button
                type="submit"
                style={styles.btn}
                disabled={loading}
              >
                {loading
                  ? "Submitting…"
                  : "Confirm Booking"}
              </button>

            </form>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#0a0e1a",
    minHeight: "100vh",
    padding: "90px 5% 60px",
  },

  container: {
    maxWidth: "900px",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },

  summary: {
    display: "flex",
    gap: "24px",
    background: "#111827",
    borderRadius: "16px",
    overflow: "hidden",
    border: "1px solid rgba(212,175,55,0.1)",
  },

  summaryImg: {
    width: "280px",
    objectFit: "cover",
    flexShrink: 0,
  },

  summaryInfo: {
    padding: "28px",
    flex: 1,
  },

  eyebrow: {
    color: "#6b7280",
    fontSize: "0.8rem",
    margin: "0 0 8px",
  },

  summaryTitle: {
    color: "#f8f4e8",
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.5rem",
    margin: "0 0 10px",
  },

  summaryPrice: {
    color: "#d4af37",
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.3rem",
    fontWeight: 700,
    margin: "0 0 14px",
  },

  specs: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
  },

  spec: {
    color: "#6b7280",
    fontSize: "0.82rem",
  },

  formCard: {
    background: "#111827",
    borderRadius: "16px",
    padding: "40px",
    border: "1px solid rgba(212,175,55,0.1)",
  },

  formTitle: {
    color: "#f8f4e8",
    fontFamily: "'Playfair Display', serif",
    fontSize: "1.6rem",
    margin: "0 0 6px",
  },

  formSub: {
    color: "#6b7280",
    fontSize: "0.85rem",
    marginBottom: "28px",
  },

  label: {
    display: "block",
    color: "#9ca3af",
    fontSize: "0.75rem",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    marginBottom: "8px",
  },

  input: {
    display: "block",
    width: "100%",
    padding: "12px 16px",
    borderRadius: "8px",
    border: "1px solid rgba(212,175,55,0.15)",
    background: "#0a0e1a",
    color: "#f8f4e8",
    fontSize: "0.9rem",
    marginBottom: "20px",
    boxSizing: "border-box",
    outline: "none",
  },

  typeRow: {
    display: "flex",
    gap: "12px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },

  typeBtn: {
    flex: 1,
    padding: "12px",
    borderRadius: "8px",
    border: "1px solid rgba(212,175,55,0.2)",
    background: "#0a0e1a",
    color: "#9ca3af",
    cursor: "pointer",
    fontSize: "0.85rem",
  },

  typeBtnActive: {
    background: "rgba(212,175,55,0.15)",
    color: "#d4af37",
    borderColor: "#d4af37",
  },

  btn: {
    display: "block",
    width: "100%",
    padding: "14px",
    background: "#d4af37",
    color: "#0a0e1a",
    border: "none",
    borderRadius: "8px",
    fontWeight: 800,
    fontSize: "0.9rem",
    cursor: "pointer",
    marginTop: "8px",
  },

  statusBox: {
    borderRadius: "12px",
    border: "1px solid",
    padding: "24px",
    textAlign: "center",
  },

  spinner: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border:
      "3px solid rgba(212,175,55,0.2)",
    borderTopColor: "#d4af37",
    animation:
      "spin 0.8s linear infinite",
  },
};