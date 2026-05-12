import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PropertyCard({ property, isFav, onFavToggle }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [fav, setFav] = useState(isFav);
  const [loading, setLoading] = useState(false);
  const imgurl = "https://ecraswala.alwaysdata.net/static/uploads/"

  const formatPrice = (p) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p / 100);

  const handleFav = async (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setLoading(true);
    const method = fav ? "DELETE" : "POST";
    await fetch(`/api/favourites/${property.property_id}`, {
      method, credentials: "include",
    });
    setFav(!fav);
    if (onFavToggle) onFavToggle(property.property_id, !fav);
    setLoading(false);
  };

  const handleBook = (e) => {
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    navigate(`/listings/${property.property_id}/book`);
  };

  return (
    <div style={styles.card} onClick={() => navigate(`/listings/${property.property_id}`)}>
      <div style={styles.imgWrap}>
        <img
          src={imgurl +property.property_photo}
          alt={property.property_name}
          style={styles.img}
        
        />
        <div style={styles.overlay} />
        {property.property_featured === 1 && (
          <span style={styles.badge}>Featured</span>
        )}
        <button
          style={{ ...styles.favBtn, ...(fav ? styles.favActive : {}) }}
          onClick={handleFav}
          disabled={loading}
          title={fav ? "Remove from favourites" : "Save to favourites"}
        >
          {fav ? "❤️" : "🤍"}
        </button>
      </div>

      <div style={styles.info}>
        <div style={styles.location}>📍 {property.property_location}</div>
        <h3 style={styles.name}>{property.property_name}</h3>
        <p style={styles.desc}>{property.property_description?.slice(0, 90)}...</p>

        <div style={styles.specs}>
          <span style={styles.spec}>🛏 {property.property_beds} beds</span>
          <span style={styles.spec}>🚿 {property.property_bath} baths</span>
          {property.property_size && <span style={styles.spec}>📐 {property.property_size}m²</span>}
        </div>

        <div style={styles.footer}>
          <span style={styles.price}>{formatPrice(property.property_price)}</span>
          <button style={styles.bookBtn} onClick={handleBook}>
            {user ? "Book Viewing" : "Login to Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: "#111827",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    border: "1px solid rgba(212,175,55,0.1)",
    ":hover": { transform: "translateY(-6px)" },
  },
  imgWrap: { position: "relative", height: "220px", overflow: "hidden" },
  img: { width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" },
  overlay: {
    position: "absolute", inset: 0,
    background: "linear-gradient(to bottom, transparent 40%, rgba(10,14,26,0.7))",
  },
  badge: {
    position: "absolute", top: "14px", left: "14px",
    background: "#d4af37", color: "#0a0e1a",
    fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em",
    padding: "4px 10px", borderRadius: "20px", textTransform: "uppercase",
  },
  favBtn: {
    position: "absolute", top: "12px", right: "12px",
    background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
    border: "none", borderRadius: "50%",
    width: "38px", height: "38px", fontSize: "16px",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transition: "transform 0.2s",
  },
  favActive: { background: "rgba(212,175,55,0.2)" },
  info: { padding: "18px 20px 20px" },
  location: { color: "#6b7280", fontSize: "0.78rem", letterSpacing: "0.06em", marginBottom: "6px" },
  name: {
    margin: "0 0 8px", color: "#f8f4e8",
    fontFamily: "'Playfair Display', serif", fontSize: "1.1rem",
  },
  desc: { color: "#9ca3af", fontSize: "0.82rem", lineHeight: 1.5, margin: "0 0 12px" },
  specs: { display: "flex", gap: "14px", margin: "0 0 16px" },
  spec: { color: "#6b7280", fontSize: "0.78rem" },
  footer: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  price: {
    color: "#d4af37", fontFamily: "'Playfair Display', serif",
    fontSize: "1.1rem", fontWeight: 700,
  },
  bookBtn: {
    background: "#d4af37", color: "#0a0e1a",
    border: "none", borderRadius: "8px",
    padding: "8px 16px", fontSize: "0.78rem",
    fontWeight: 800, letterSpacing: "0.06em", cursor: "pointer",
    transition: "opacity 0.2s",
  },
};
