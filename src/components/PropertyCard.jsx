import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ============================================================
// CONFIG
// ============================================================

const API_URL = "https://eclixroyalhomesbackendapi.vercel.app";
const FAVS_KEY = "eclix_favourites";

// ============================================================
// FAVOURITES HELPERS
// ============================================================

function getFavourites() {
  try {
    const saved = localStorage.getItem(FAVS_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    // Always store IDs as numbers
    return parsed
      .map(Number)
      .filter((id) => !Number.isNaN(id));
  } catch (error) {
    console.error("Could not read favourites:", error);
    return [];
  }
}

function isFavourite(propertyId) {
  const id = Number(propertyId);

  return getFavourites().includes(id);
}

function addFavourite(propertyId) {
  const id = Number(propertyId);

  if (Number.isNaN(id)) {
    return;
  }

  const favourites = getFavourites();

  if (!favourites.includes(id)) {
    localStorage.setItem(
      FAVS_KEY,
      JSON.stringify([...favourites, id])
    );
  }
}

function removeFavourite(propertyId) {
  const id = Number(propertyId);

  const favourites = getFavourites().filter(
    (favouriteId) => favouriteId !== id
  );

  localStorage.setItem(
    FAVS_KEY,
    JSON.stringify(favourites)
  );
}

export {
  getFavourites,
  isFavourite,
  addFavourite,
  removeFavourite,
};

// ============================================================
// PROPERTY CARD
// ============================================================

export default function PropertyCard({
  property,
  onFavToggle,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ----------------------------------------------------------
  // Safety check
  // ----------------------------------------------------------

  if (!property) {
    return null;
  }

  const propertyId = Number(property.property_id);

  // ----------------------------------------------------------
  // Favourite state
  // ----------------------------------------------------------

  const [fav, setFav] = useState(() =>
    isFavourite(propertyId)
  );

const getImageUrl = () => {
  const photo = property.property_photo;

  // No photo
  if (!photo || typeof photo !== "string") {
    return "/placeholder-property.jpg";
  }

  const cleanPhoto = photo.trim();

  if (!cleanPhoto) {
    return "/placeholder-property.jpg";
  }

  // Cloudinary or any complete online image URL
  if (
    cleanPhoto.startsWith("https://") ||
    cleanPhoto.startsWith("http://")
  ) {
    return cleanPhoto;
  }

  // If backend returns only a Cloudinary public ID
  if (cleanPhoto.includes("cloudinary")) {
    return cleanPhoto;
  }

  // Old/local images
  return `${API_URL}/static/uploads/${encodeURIComponent(cleanPhoto)}`;
};  


  // ==========================================================
  // PRICE
  // ==========================================================

  const formatPrice = (price) => {
    if (
      price === null ||
      price === undefined ||
      price === ""
    ) {
      return "Price on request";
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice)) {
      return "Price on request";
    }

    /*
     * Your old code divided the price by 100.
     *
     * That is only correct if your database stores
     * prices in cents.
     *
     * For a normal property database such as:
     *
     * 15000000
     *
     * we display:
     *
     * KSh 15,000,000
     */

    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0,
    }).format(numericPrice);
  };

  // ==========================================================
  // FAVOURITE
  // ==========================================================

  const handleFav = (event) => {
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!propertyId || Number.isNaN(propertyId)) {
      console.error(
        "Invalid property ID:",
        property.property_id
      );
      return;
    }

    const newFavState = !fav;

    if (newFavState) {
      addFavourite(propertyId);
    } else {
      removeFavourite(propertyId);
    }

    setFav(newFavState);

    if (typeof onFavToggle === "function") {
      onFavToggle(
        propertyId,
        newFavState
      );
    }
  };

  // ==========================================================
  // BOOKING
  // ==========================================================

  const handleBook = (event) => {
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    if (!propertyId || Number.isNaN(propertyId)) {
      console.error(
        "Invalid property ID:",
        property.property_id
      );
      return;
    }

    navigate(
      `/listings/${propertyId}/book`
    );
  };

  // ==========================================================
  // PROPERTY DETAILS
  // ==========================================================

  const handleCardClick = () => {
    if (!propertyId || Number.isNaN(propertyId)) {
      console.error(
        "Invalid property ID:",
        property.property_id
      );
      return;
    }

    navigate(
      `/listings/${propertyId}`
    );
  };

  // ==========================================================
  // DESCRIPTION
  // ==========================================================

  const description =
    property.property_description?.trim() ||
    "Luxury property available through Eclix Royal Homes & Properties.";

  const shortDescription =
    description.length > 100
      ? `${description.substring(0, 100)}...`
      : description;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <article
      style={styles.card}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          handleCardClick();
        }
      }}
    >
      {/* =====================================================
          IMAGE
      ====================================================== */}

      <div style={styles.imgWrap}>
        <img
          src={getImageUrl()}
          alt={
            property.property_name ||
            "Eclix Royal property"
          }
          style={styles.img}
          loading="lazy"
          onError={(event) => {
            if (
              event.currentTarget.src.includes(
                "placeholder-property.jpg"
              )
            ) {
              return;
            }

            console.error(
              "Property image failed:",
              getImageUrl()
            );

            event.currentTarget.onerror = null;

            event.currentTarget.src =
              "/placeholder-property.jpg";
          }}
        />

        {/* Image overlay */}
        <div style={styles.overlay} />

        {/* =================================================
            PROPERTY STATUS
        ================================================== */}

        <div style={styles.badges}>
          {Number(
            property.property_featured
          ) === 1 && (
            <span style={styles.featuredBadge}>
              Featured
            </span>
          )}

          {Number(
            property.property_for_sale
          ) === 1 && (
            <span style={styles.saleBadge}>
              For Sale
            </span>
          )}
        </div>

        {/* =================================================
            FAVOURITE BUTTON
        ================================================== */}

        <button
          type="button"
          style={{
            ...styles.favBtn,
            ...(fav ? styles.favActive : {}),
          }}
          onClick={handleFav}
          aria-label={
            fav
              ? "Remove property from favourites"
              : "Add property to favourites"
          }
          title={
            fav
              ? "Remove from favourites"
              : "Save to favourites"
          }
        >
          <span
            style={{
              fontSize: "18px",
              lineHeight: 1,
            }}
          >
            {fav ? "♥" : "♡"}
          </span>
        </button>
      </div>

      {/* =====================================================
          INFORMATION
      ====================================================== */}

      <div style={styles.info}>

        {/* Location */}
        <div style={styles.location}>
          <span style={styles.locationIcon}>
            📍
          </span>

          <span>
            {property.property_location ||
              "Location unavailable"}
          </span>
        </div>

        {/* Name */}
        <h3 style={styles.name}>
          {property.property_name ||
            "Unnamed Property"}
        </h3>

        {/* Description */}
        <p style={styles.desc}>
          {shortDescription}
        </p>

        {/* =================================================
            PROPERTY SPECS
        ================================================== */}

        <div style={styles.specs}>

          <span style={styles.spec}>
            <span style={styles.specIcon}>
              🛏
            </span>

            {property.property_beds ||
              0}{" "}
            beds
          </span>

          <span style={styles.spec}>
            <span style={styles.specIcon}>
              🚿
            </span>

            {property.property_bath ||
              0}{" "}
            baths
          </span>

          {property.property_size && (
            <span style={styles.spec}>
              <span style={styles.specIcon}>
                📐
              </span>

              {property.property_size} m²
            </span>
          )}
        </div>

        {/* =================================================
            FOOTER
        ================================================== */}

        <div style={styles.footer}>

          {/* Price */}
          <div>
            <div style={styles.priceLabel}>
              Price
            </div>

            <span style={styles.price}>
              {formatPrice(
                property.property_price
              )}
            </span>
          </div>

          {/* Booking */}
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
    </article>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = {
  card: {
    background: "#111827",
    borderRadius: "18px",
    overflow: "hidden",
    cursor: "pointer",
    border:
      "1px solid rgba(212, 175, 55, 0.12)",
    transition:
      "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
    boxShadow:
      "0 8px 25px rgba(0, 0, 0, 0.18)",
    width: "100%",
  },

  imgWrap: {
    position: "relative",
    height: "230px",
    overflow: "hidden",
    background: "#0a0e1a",
  },

  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
    transition:
      "transform 0.5s ease",
  },

  overlay: {
    position: "absolute",
    inset: 0,
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.05) 25%, rgba(10,14,26,0.8) 100%)",
    pointerEvents: "none",
  },

  badges: {
    position: "absolute",
    top: "14px",
    left: "14px",
    display: "flex",
    alignItems: "center",
    gap: "7px",
    flexWrap: "wrap",
  },

  featuredBadge: {
    background: "#d4af37",
    color: "#0a0e1a",
    fontSize: "0.68rem",
    fontWeight: 800,
    letterSpacing: "0.08em",
    padding: "5px 10px",
    borderRadius: "20px",
    textTransform: "uppercase",
  },

  saleBadge: {
    background:
      "rgba(17, 24, 39, 0.88)",
    color: "#f8f4e8",
    border:
      "1px solid rgba(212,175,55,0.3)",
    fontSize: "0.68rem",
    fontWeight: 700,
    letterSpacing: "0.06em",
    padding: "5px 10px",
    borderRadius: "20px",
    textTransform: "uppercase",
    backdropFilter: "blur(5px)",
  },

  favBtn: {
    position: "absolute",
    top: "12px",
    right: "12px",
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    border:
      "1px solid rgba(255,255,255,0.12)",
    background:
      "rgba(0,0,0,0.55)",
    color: "#ffffff",
    backdropFilter: "blur(6px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition:
      "all 0.2s ease",
    zIndex: 5,
  },

  favActive: {
    background:
      "rgba(212,175,55,0.22)",
    border:
      "1px solid rgba(212,175,55,0.5)",
    color: "#d4af37",
  },

  info: {
    padding: "18px 20px 20px",
  },

  location: {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    color: "#9ca3af",
    fontSize: "0.76rem",
    letterSpacing: "0.04em",
    marginBottom: "7px",
    minHeight: "18px",
  },

  locationIcon: {
    fontSize: "13px",
  },

  name: {
    margin: "0 0 8px",
    color: "#f8f4e8",
    fontFamily:
      "'Playfair Display', serif",
    fontSize: "1.15rem",
    lineHeight: 1.3,
    fontWeight: 700,
  },

  desc: {
    color: "#9ca3af",
    fontSize: "0.82rem",
    lineHeight: 1.55,
    margin: "0 0 15px",
    minHeight: "38px",
  },

  specs: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "17px",
    flexWrap: "wrap",
  },

  spec: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "#9ca3af",
    fontSize: "0.76rem",
    whiteSpace: "nowrap",
  },

  specIcon: {
    fontSize: "13px",
  },

  footer: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: "12px",
    paddingTop: "14px",
    borderTop:
      "1px solid rgba(255,255,255,0.06)",
  },

  priceLabel: {
    color: "#6b7280",
    fontSize: "0.67rem",
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    marginBottom: "2px",
  },

  price: {
    color: "#d4af37",
    fontFamily:
      "'Playfair Display', serif",
    fontSize: "1.08rem",
    fontWeight: 700,
    lineHeight: 1.2,
  },

  bookBtn: {
    background: "#d4af37",
    color: "#0a0e1a",
    border: "none",
    borderRadius: "9px",
    padding: "9px 14px",
    fontSize: "0.74rem",
    fontWeight: 800,
    letterSpacing: "0.04em",
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition:
      "opacity 0.2s ease, transform 0.2s ease",
  },
};