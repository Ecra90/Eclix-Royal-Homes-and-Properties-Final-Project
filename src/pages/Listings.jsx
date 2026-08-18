import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";

const API_URL = "https://eclixroyalhomesbackendapi.vercel.app";

export default function Listings() {
  const [searchParams] = useSearchParams();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState(
    searchParams.get("search") || ""
  );

  const [query, setQuery] = useState(
    searchParams.get("search") || ""
  );

  const [favIds, setFavIds] = useState([]);

  // ─────────────────────────────────────────────
  // LOAD FAVOURITES
  // ─────────────────────────────────────────────
  useEffect(() => {
    fetch(`${API_URL}/api/favourites`, {
      method: "GET",
      credentials: "include",
    })
      .then(async (response) => {
        const text = await response.text();

        if (!text) {
          return { favourites: [] };
        }

        try {
          return JSON.parse(text);
        } catch {
          console.error("Invalid favourites response:", text);
          return { favourites: [] };
        }
      })
      .then((data) => {
        setFavIds(
          (data.favourites || []).map(
            (favourite) => favourite.property_id
          )
        );
      })
      .catch((error) => {
        console.error("Failed to load favourites:", error);
        setFavIds([]);
      });
  }, []);

  // ─────────────────────────────────────────────
  // LOAD PROPERTIES
  // ─────────────────────────────────────────────
  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      setError("");

      try {
        const url = query
          ? `${API_URL}/api/properties?search=${encodeURIComponent(query)}`
          : `${API_URL}/api/properties`;

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
        });

        const text = await response.text();

        console.log("PROPERTIES STATUS:", response.status);
        console.log("PROPERTIES RESPONSE:", text);

        if (!response.ok) {
          throw new Error(
            `Failed to load properties (${response.status})`
          );
        }

        if (!text) {
          throw new Error("The server returned an empty response.");
        }

        let data;

        try {
          data = JSON.parse(text);
        } catch {
          throw new Error("The server returned invalid JSON.");
        }

        setProperties(data.properties || []);
      } catch (error) {
        console.error("Properties error:", error);
        setProperties([]);
        setError(error.message || "Unable to load properties.");
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [query]);

  // ─────────────────────────────────────────────
  // SEARCH
  // ─────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search);
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>Exclusive Collection</p>

        <h1 style={styles.title}>
          Luxury Listings
        </h1>

        <p style={styles.sub}>
          Explore estates curated for elite living
        </p>

        <form
          style={styles.searchBar}
          onSubmit={handleSearch}
        >
          <input
            style={styles.input}
            placeholder="Search by name, location…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            type="submit"
            style={styles.searchBtn}
          >
            Search
          </button>

          {query && (
            <button
              type="button"
              style={styles.clearBtn}
              onClick={() => {
                setSearch("");
                setQuery("");
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* LOADING */}
      {loading ? (
        <div style={styles.loader}>
          <div style={styles.spinner} />

          <p
            style={{
              color: "#6b7280",
              marginTop: "16px",
            }}
          >
            Loading properties…
          </p>
        </div>

      ) : error ? (
        /* ERROR */
        <div style={styles.empty}>
          <p style={{ fontSize: "3rem" }}>⚠️</p>

          <p
            style={{
              color: "#ef4444",
              fontWeight: "600",
            }}
          >
            Unable to load properties
          </p>

          <p
            style={{
              color: "#9ca3af",
              marginTop: "8px",
            }}
          >
            {error}
          </p>

          <button
            style={styles.retryBtn}
            onClick={() => setQuery(query)}
          >
            Try Again
          </button>
        </div>

      ) : properties.length === 0 ? (
        /* NO PROPERTIES */
        <div style={styles.empty}>
          <p style={{ fontSize: "3rem" }}>🏚</p>

          <p
            style={{
              color: "#9ca3af",
            }}
          >
            No properties found matching your search.
          </p>
        </div>

      ) : (
        /* PROPERTIES */
        <div style={styles.grid}>
          {properties.map((property) => (
            <PropertyCard
              key={property.property_id}
              property={property}
              isFav={favIds.includes(
                property.property_id
              )}
              onFavToggle={(id, added) => {
                setFavIds((ids) =>
                  added
                    ? [...ids, id]
                    : ids.filter(
                        (existingId) =>
                          existingId !== id
                      )
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    background: "#0a0e1a",
    minHeight: "100vh",
    paddingTop: "70px",
  },

  header: {
    textAlign: "center",
    padding: "70px 5% 50px",
    background:
      "linear-gradient(to bottom, #070b14, #0a0e1a)",
    borderBottom:
      "1px solid rgba(212,175,55,0.1)",
  },

  eyebrow: {
    color: "#d4af37",
    letterSpacing: "0.2em",
    fontSize: "0.72rem",
    textTransform: "uppercase",
    marginBottom: "10px",
  },

  title: {
    color: "#f8f4e8",
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(2rem, 4vw, 3.5rem)",
    margin: "0 0 12px",
  },

  sub: {
    color: "#9ca3af",
    marginBottom: "32px",
  },

  searchBar: {
    display: "flex",
    gap: "8px",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  input: {
    padding: "12px 20px",
    borderRadius: "8px",
    border:
      "1px solid rgba(212,175,55,0.2)",
    background: "#111827",
    color: "#f8f4e8",
    fontSize: "0.9rem",
    width: "340px",
    outline: "none",
  },

  searchBtn: {
    background: "#d4af37",
    color: "#0a0e1a",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: 800,
    cursor: "pointer",
  },

  clearBtn: {
    background: "transparent",
    color: "#6b7280",
    border:
      "1px solid rgba(255,255,255,0.1)",
    padding: "12px 20px",
    borderRadius: "8px",
    cursor: "pointer",
  },

  retryBtn: {
    marginTop: "20px",
    background: "#d4af37",
    color: "#0a0e1a",
    border: "none",
    padding: "12px 24px",
    borderRadius: "8px",
    fontWeight: 800,
    cursor: "pointer",
  },

  grid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "24px",
    padding: "50px 5%",
  },

  loader: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "100px 0",
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

  empty: {
    textAlign: "center",
    padding: "100px 20px",
  },
};