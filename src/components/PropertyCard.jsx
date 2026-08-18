import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ─────────────────────────────────────────────
// localStorage helpers
// ─────────────────────────────────────────────

const FAVS_KEY = "eclix_favourites";

function getFavourites() {
  try {
    const saved = localStorage.getItem(FAVS_KEY);

    if (!saved) return [];

    const parsed = JSON.parse(saved);

    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Could not read favourites:", error);
    return [];
  }
}

function isFavourite(propertyId) {
  return getFavourites().includes(propertyId);
}

function addFavourite(propertyId) {
  const favs = getFavourites();

  if (!favs.includes(propertyId)) {
    localStorage.setItem(
      FAVS_KEY,
      JSON.stringify([...favs, propertyId])
    );
  }
}

function removeFavourite(propertyId) {
  const favs = getFavourites().filter(
    (id) => id !== propertyId
  );

  localStorage.setItem(
    FAVS_KEY,
    JSON.stringify(favs)
  );
}

export {
  getFavourites,
  isFavourite,
  addFavourite,
  removeFavourite,
};

// ─────────────────────────────────────────────
// Property Card
// ─────────────────────────────────────────────

export default function PropertyCard({
  property,
  onFavToggle,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [fav, setFav] = useState(() =>
    isFavourite(property.property_id)
  );

  // Your Flask backend
  const API_URL =
    "https://eclixroyalhomesbackendapi.vercel.app";

  // Property image
  const imageUrl = property.property_photo
    ? `${API_URL}/static/uploads/${encodeURIComponent(
        property.property_photo
      )}`
    : "/placeholder-property.jpg";

  // ─────────────────────────────────────────────
  // Format price
  // ─────────────────────────────────────────────

  const formatPrice = (price) => {
    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price on request";
    }

    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numericPrice / 100);
  };

  // ─────────────────────────────────────────────
  // Favourite
  // ─────────────────────────────────────────────

  const handleFav = (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    const newFavState = !fav;

    if (newFavState) {
      addFavourite(property.property_id);
    } else {
      removeFavourite(property.property_id);
    }

    setFav(newFavState);

    if (onFavToggle) {
      onFavToggle(
        property.property_id,
        newFavState
      );
    }
  };

  // ─────────────────────────────────────────────
  // Booking
  // ─────────────────────────────────────────────

  const handleBook = (e) => {
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    navigate(
      `/listings/${property.property_id}/book`
    );
  };

  // ─────────────────────────────────────────────
  // Open property
  // ─────────────────────────────────────────────

  const handleCardClick = () => {
    navigate(
      `/listings/${property.property_id}`
    );
  };

  return (
    <div
      style={styles.card}
      onClick={handleCardClick}
    >
      {/* IMAGE */}
      <div style={styles.imgWrap}>
        <img
          src={imageUrl}
          alt={
            property.property_name ||
            "Eclix property"
          }
          style={styles.img}
          onError={(e) => {
            e.currentTarget.src =
              "/placeholder-property.jpg";
          }}
        />

        <div style={styles.overlay} />

        {/* FEATURED */}
        {Number(property.property_featured) === 1 && (
          <span style={styles.badge}>
            Featured
          </span>
        )}

        {/* FAVOURITE */}
        <button
          type="button"
          style={{
            ...styles.favBtn,
            ...(fav ? styles.favActive : {}),
          }}
          onClick={handleFav}
          title={
            fav
              ? "Remove from favourites"
              : "Save to favourites"
          }
        >
          {fav ? "❤️" : "🤍"}
        </button>
      </div>

      {/* INFORMATION */}
      <div style={styles.info}>
        <div style={styles.location}>
          📍 {property.property_location || "Location unavailable"}
        </div>

        <h3 style={styles.name}>
          {property.property_name ||
            "Unnamed Property"}
        </h3>

        <p style={styles.desc}>
          {property.property_description
            ? property.property_description.slice(
                0,
                90
              ) + "..."
            : "Luxury property available through Eclix Royal Homes & Properties."}
        </p>

        {/* SPECS */}
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

        {/* FOOTER */}
        <div style={styles.footer}>
          <span style={styles.price}>
            {formatPrice(
              property.property_price
            )}
          </span>

          <button
            type="button"
            style={styles.bookBtn}
            onClick={handleBook}
          >
            {user
              ? "Book Viewing"
              : "Login to Book"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────

const styles = {
  card: {
    background: "#111827",
    borderRadius: "16px",
    overflow: "hidden",
    cursor: "pointer",
    transition:
      "transform 0.3s ease, box-shadow 0.3s ease",
    border:
      "1px solid rgba(212,175,55,0.1)",
  },

  imgWrap: {
    position: "relative",
    height: "220px",
    overflow: "hidden",
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition:
      "transform 0.5s ease",
    display: "block",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, transparent 40%, rgba(10,14,26,0.7))",
  },

  badge: {
    position: "absolute",
    top: "14px",
    left: "14px",
    background: "#d4af37",
    color: "#0a0e1a",
    fontSize: "0.7rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    padding: "4px 10px",
    borderRadius: "20px",
    textTransform: "uppercase",
  },

  favBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background:
      "rgba(0,0,0,0.5)",
    backdropFilter: "blur(4px)",
    border: "none",
    borderRadius: "50%",
    width: "38px",
    height: "38px",
    fontSize: "16px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition:
      "transform 0.2s",
  },

  favActive: {
    background:
      "rgba(212,175,55,0.2)",
  },

  info: {
    padding: "18px 20px 20px",
  },

  location: {
    color: "#6b7280",
    fontSize: "0.78rem",
    letterSpacing: "0.06em",
    marginBottom: "6px",
  },

  name: {
    margin: "0 0 8px",
    color: "#f8f4e8",
    fontFamily:
      "'Playfair Display', serif",
    fontSize: "1.1rem",
  },

  desc: {
    color: "#9ca3af",
    fontSize: "0.82rem",
    lineHeight: 1.5,
    margin: "0 0 12px",
  },

  specs: {
    display: "flex",
    gap: "14px",
    margin: "0 0 16px",
    flexWrap: "wrap",
  },

  spec: {
    color: "#6b7280",
    fontSize: "0.78rem",
  },

  footer: {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "space-between",
    gap: "10px",
  },

  price: {
    color: "#d4af37",
    fontFamily:
      "'Playfair Display', serif",
    fontSize: "1.1rem",
    fontWeight: 700,
  },

  bookBtn: {
    background: "#d4af37",
    color: "#0a0e1a",
    border: "none",
    borderRadius: "8px",
    padding: "8px 16px",
    fontSize: "0.78rem",
    fontWeight: 800,
    letterSpacing: "0.06em",
    cursor: "pointer",
    transition:
      "opacity 0.2s",
  },
};