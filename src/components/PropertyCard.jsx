import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ============================================================
// CONFIG
// ============================================================

const API_URL =
  "https://eclixroyalhomesbackendapi.vercel.app";

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

    return parsed
      .map(Number)
      .filter((id) => !Number.isNaN(id));
  } catch (error) {
    console.error(
      "Could not read favourites:",
      error
    );

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
      JSON.stringify([
        ...favourites,
        id,
      ])
    );
  }
}

function removeFavourite(propertyId) {
  const id = Number(propertyId);

  const favourites =
    getFavourites().filter(
      (favouriteId) =>
        favouriteId !== id
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

  // IMPORTANT:
  // Hooks MUST be called before any conditional return.

  const [fav, setFav] = useState(() =>
    property
      ? isFavourite(
          Number(property.property_id)
        )
      : false
  );

  const [showPromote, setShowPromote] =
    useState(false);

  const [selectedPackage, setSelectedPackage] =
    useState("featured_7");

  const [phone, setPhone] =
    useState("");

  const [paymentLoading, setPaymentLoading] =
    useState(false);

  const [paymentMessage, setPaymentMessage] =
    useState("");

  const [paymentError, setPaymentError] =
    useState("");

  // ----------------------------------------------------------
  // SAFETY CHECK
  // ----------------------------------------------------------

  if (!property) {
    return null;
  }

  const propertyId = Number(
    property.property_id
  );

  // ==========================================================
  // IMAGE
  // ==========================================================

  const getImageUrl = () => {
    const photo =
      property.property_photo;

    if (
      !photo ||
      typeof photo !== "string"
    ) {
      return "/placeholder-property.jpg";
    }

    const cleanPhoto =
      photo.trim();

    if (!cleanPhoto) {
      return "/placeholder-property.jpg";
    }

    if (
      cleanPhoto.startsWith("https://") ||
      cleanPhoto.startsWith("http://")
    ) {
      return cleanPhoto;
    }

    if (
      cleanPhoto.includes("cloudinary")
    ) {
      return cleanPhoto;
    }

    return `${API_URL}/static/uploads/${encodeURIComponent(
      cleanPhoto
    )}`;
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

    return new Intl.NumberFormat(
      "en-KE",
      {
        style: "currency",
        currency: "KES",
        maximumFractionDigits: 0,
      }
    ).format(numericPrice);
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

    if (
      !propertyId ||
      Number.isNaN(propertyId)
    ) {
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

    if (
      typeof onFavToggle === "function"
    ) {
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

    if (
      !propertyId ||
      Number.isNaN(propertyId)
    ) {
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
  // PROMOTE PROPERTY
  // ==========================================================

  const handlePromoteClick = (event) => {
    event.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    setPaymentMessage("");
    setPaymentError("");
    setShowPromote(true);
  };

  // ==========================================================
  // START MPESA PAYMENT
  // ==========================================================

  const handleMpesaPayment = async (
    event
  ) => {
    event.preventDefault();
    event.stopPropagation();

    setPaymentError("");
    setPaymentMessage("");

    if (!user) {
      navigate("/login");
      return;
    }

    if (
      !propertyId ||
      Number.isNaN(propertyId)
    ) {
      setPaymentError(
        "Invalid property."
      );

      return;
    }

    const cleanPhone =
      phone.trim();

    if (!cleanPhone) {
      setPaymentError(
        "Please enter your M-Pesa phone number."
      );

      return;
    }

    setPaymentLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/payments/property-promote`,
        {
          method: "POST",

          credentials: "include",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            property_id: propertyId,
            package:
              selectedPackage,
            phone: cleanPhone,
          }),
        }
      );

      const text =
        await response.text();

      let data = {};

      try {
        data = text
          ? JSON.parse(text)
          : {};
      } catch {
        throw new Error(
          "The payment server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.details ||
            "Could not start M-Pesa payment."
        );
      }

      setPaymentMessage(
        data.message ||
          "M-Pesa prompt sent. Check your phone and enter your M-Pesa PIN."
      );

      setPhone("");

    } catch (error) {
      console.error(
        "M-Pesa payment error:",
        error
      );

      setPaymentError(
        error.message ||
          "Payment could not be started."
      );
    } finally {
      setPaymentLoading(false);
    }
  };

  // ==========================================================
  // PROPERTY DETAILS
  // ==========================================================

  const handleCardClick = () => {
    if (
      !propertyId ||
      Number.isNaN(propertyId)
    ) {
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
      ? `${description.substring(
          0,
          100
        )}...`
      : description;

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <>
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
        {/* ===================================================
            IMAGE
        ==================================================== */}

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

              event.currentTarget.onerror =
                null;

              event.currentTarget.src =
                "/placeholder-property.jpg";
            }}
          />

          <div style={styles.overlay} />

          {/* PROPERTY STATUS */}

          <div style={styles.badges}>
            {Number(
              property.property_featured
            ) === 1 && (
              <span
                style={
                  styles.featuredBadge
                }
              >
                ⭐ Featured
              </span>
            )}

            {Number(
              property.property_for_sale
            ) === 1 && (
              <span
                style={
                  styles.saleBadge
                }
              >
                For Sale
              </span>
            )}
          </div>

          {/* FAVOURITE */}

          <button
            type="button"
            style={{
              ...styles.favBtn,
              ...(fav
                ? styles.favActive
                : {}),
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

        {/* ===================================================
            INFORMATION
        ==================================================== */}

        <div style={styles.info}>
          <div style={styles.location}>
            <span
              style={
                styles.locationIcon
              }
            >
              📍
            </span>

            <span>
              {property.property_location ||
                "Location unavailable"}
            </span>
          </div>

          <h3 style={styles.name}>
            {property.property_name ||
              "Unnamed Property"}
          </h3>

          <p style={styles.desc}>
            {shortDescription}
          </p>

          {/* PROPERTY SPECS */}

          <div style={styles.specs}>
            <span style={styles.spec}>
              <span
                style={
                  styles.specIcon
                }
              >
                🛏
              </span>

              {property.property_beds ||
                0}{" "}
              beds
            </span>

            <span style={styles.spec}>
              <span
                style={
                  styles.specIcon
                }
              >
                🚿
              </span>

              {property.property_bath ||
                0}{" "}
              baths
            </span>

            {property.property_size && (
              <span style={styles.spec}>
                <span
                  style={
                    styles.specIcon
                  }
                >
                  📐
                </span>

                {property.property_size}{" "}
                m²
              </span>
            )}
          </div>

          {/* =================================================
              FOOTER
          ================================================== */}

          <div style={styles.footer}>
            <div>
              <div
                style={
                  styles.priceLabel
                }
              >
                Price
              </div>

              <span style={styles.price}>
                {formatPrice(
                  property.property_price
                )}
              </span>
            </div>

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

          {/* =================================================
              PROMOTE BUTTON
          ================================================== */}

          {user && (
            <button
              type="button"
              style={
                styles.promoteBtn
              }
              onClick={
                handlePromoteClick
              }
            >
              ⭐ Promote Property
            </button>
          )}
        </div>
      </article>

      {/* =====================================================
          PROMOTION MODAL
      ====================================================== */}

      {showPromote && (
        <div
          style={styles.modalBackdrop}
          onClick={() =>
            setShowPromote(false)
          }
        >
          <div
            style={styles.modal}
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* CLOSE */}

            <button
              type="button"
              style={styles.closeBtn}
              onClick={() =>
                setShowPromote(false)
              }
            >
              ×
            </button>

            <div
              style={
                styles.modalEyebrow
              }
            >
              ECLIX ROYAL HOMES
            </div>

            <h2
              style={
                styles.modalTitle
              }
            >
              Promote Your Property
            </h2>

            <p
              style={
                styles.modalSubtitle
              }
            >
              Get your property featured
              and give it greater
              visibility.
            </p>

            {/* PROPERTY */}

            <div
              style={
                styles.propertyPreview
              }
            >
              <strong>
                {property.property_name ||
                  "Property"}
              </strong>

              <span>
                {property.property_location ||
                  ""}
              </span>
            </div>

            {/* PACKAGES */}

            <div
              style={
                styles.packageGrid
              }
            >
              <button
                type="button"
                style={{
                  ...styles.package,
                  ...(selectedPackage ===
                  "featured_7"
                    ? styles.packageActive
                    : {}),
                }}
                onClick={() =>
                  setSelectedPackage(
                    "featured_7"
                  )
                }
              >
                <span
                  style={
                    styles.packageDays
                  }
                >
                  7 DAYS
                </span>

                <strong>
                  KSh 500
                </strong>
              </button>

              <button
                type="button"
                style={{
                  ...styles.package,
                  ...(selectedPackage ===
                  "featured_14"
                    ? styles.packageActive
                    : {}),
                }}
                onClick={() =>
                  setSelectedPackage(
                    "featured_14"
                  )
                }
              >
                <span
                  style={
                    styles.packageDays
                  }
                >
                  14 DAYS
                </span>

                <strong>
                  KSh 1,000
                </strong>
              </button>

              <button
                type="button"
                style={{
                  ...styles.package,
                  ...(selectedPackage ===
                  "featured_30"
                    ? styles.packageActive
                    : {}),
                }}
                onClick={() =>
                  setSelectedPackage(
                    "featured_30"
                  )
                }
              >
                <span
                  style={
                    styles.packageDays
                  }
                >
                  30 DAYS
                </span>

                <strong>
                  KSh 2,000
                </strong>
              </button>
            </div>

            {/* PHONE */}

            <form
              onSubmit={
                handleMpesaPayment
              }
            >
              <label
                style={
                  styles.phoneLabel
                }
              >
                M-Pesa Phone Number
              </label>

              <input
                type="tel"
                value={phone}
                onChange={(event) =>
                  setPhone(
                    event.target.value
                  )
                }
                placeholder="07XXXXXXXX"
                style={styles.phoneInput}
                autoComplete="tel"
              />

              {paymentError && (
                <div
                  style={
                    styles.errorMessage
                  }
                >
                  {paymentError}
                </div>
              )}

              {paymentMessage && (
                <div
                  style={
                    styles.successMessage
                  }
                >
                  {paymentMessage}
                </div>
              )}

              <button
                type="submit"
                disabled={
                  paymentLoading
                }
                style={{
                  ...styles.payBtn,
                  ...(paymentLoading
                    ? styles.payBtnDisabled
                    : {}),
                }}
              >
                {paymentLoading
                  ? "Sending M-Pesa Prompt..."
                  : "💳 Pay with M-Pesa"}
              </button>
            </form>

            <p
              style={
                styles.secureText
              }
            >
              🔒 Secure payment through
              M-Pesa
            </p>
          </div>
        </div>
      )}
    </>
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
  },

  // ==========================================================
  // PROMOTE BUTTON
  // ==========================================================

  promoteBtn: {
    width: "100%",
    marginTop: "12px",
    background:
      "linear-gradient(135deg, #d4af37, #b8941f)",
    color: "#0a0e1a",
    border: "none",
    borderRadius: "10px",
    padding: "11px 14px",
    fontSize: "0.78rem",
    fontWeight: 900,
    letterSpacing: "0.05em",
    cursor: "pointer",
  },

  // ==========================================================
  // MODAL
  // ==========================================================

  modalBackdrop: {
    position: "fixed",
    inset: 0,
    background:
      "rgba(0, 0, 0, 0.78)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 9999,
  },

  modal: {
    position: "relative",
    width: "100%",
    maxWidth: "520px",
    maxHeight: "90vh",
    overflowY: "auto",
    background: "#111827",
    border:
      "1px solid rgba(212,175,55,0.3)",
    borderRadius: "20px",
    padding: "30px",
    boxShadow:
      "0 25px 80px rgba(0,0,0,0.5)",
  },

  closeBtn: {
    position: "absolute",
    top: "15px",
    right: "15px",
    width: "35px",
    height: "35px",
    borderRadius: "50%",
    border:
      "1px solid rgba(255,255,255,0.1)",
    background:
      "rgba(255,255,255,0.05)",
    color: "#fff",
    fontSize: "24px",
    cursor: "pointer",
    lineHeight: "30px",
  },

  modalEyebrow: {
    color: "#d4af37",
    fontSize: "0.68rem",
    letterSpacing: "0.18em",
    fontWeight: 800,
    marginBottom: "8px",
  },

  modalTitle: {
    color: "#f8f4e8",
    fontFamily:
      "'Playfair Display', serif",
    fontSize: "1.8rem",
    margin: "0 0 8px",
  },

  modalSubtitle: {
    color: "#9ca3af",
    fontSize: "0.85rem",
    lineHeight: 1.5,
    marginBottom: "20px",
  },

  propertyPreview: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    padding: "13px 15px",
    background: "#0a0e1a",
    borderRadius: "10px",
    marginBottom: "18px",
    border:
      "1px solid rgba(255,255,255,0.06)",
  },

  packageGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, 1fr)",
    gap: "10px",
    marginBottom: "20px",
  },

  package: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
    alignItems: "center",
    padding: "15px 8px",
    borderRadius: "12px",
    border:
      "1px solid rgba(212,175,55,0.18)",
    background: "#0a0e1a",
    color: "#f8f4e8",
    cursor: "pointer",
    fontSize: "0.85rem",
  },

  packageActive: {
    border:
      "2px solid #d4af37",
    background:
      "rgba(212,175,55,0.1)",
  },

  packageDays: {
    color: "#9ca3af",
    fontSize: "0.65rem",
    letterSpacing: "0.08em",
  },

  phoneLabel: {
    display: "block",
    color: "#f8f4e8",
    fontSize: "0.78rem",
    fontWeight: 700,
    marginBottom: "7px",
  },

  phoneInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "13px 15px",
    borderRadius: "10px",
    border:
      "1px solid rgba(212,175,55,0.2)",
    background: "#0a0e1a",
    color: "#f8f4e8",
    fontSize: "0.9rem",
    outline: "none",
    marginBottom: "12px",
  },

  payBtn: {
    width: "100%",
    padding: "14px",
    border: "none",
    borderRadius: "10px",
    background: "#d4af37",
    color: "#0a0e1a",
    fontSize: "0.85rem",
    fontWeight: 900,
    cursor: "pointer",
  },

  payBtnDisabled: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  errorMessage: {
    padding: "10px 12px",
    borderRadius: "8px",
    background:
      "rgba(239,68,68,0.1)",
    border:
      "1px solid rgba(239,68,68,0.25)",
    color: "#fca5a5",
    fontSize: "0.78rem",
    marginBottom: "12px",
  },

  successMessage: {
    padding: "10px 12px",
    borderRadius: "8px",
    background:
      "rgba(34,197,94,0.1)",
    border:
      "1px solid rgba(34,197,94,0.25)",
    color: "#86efac",
    fontSize: "0.78rem",
    marginBottom: "12px",
    lineHeight: 1.5,
  },

  secureText: {
    textAlign: "center",
    color: "#6b7280",
    fontSize: "0.7rem",
    marginTop: "15px",
    marginBottom: 0,
  },
};