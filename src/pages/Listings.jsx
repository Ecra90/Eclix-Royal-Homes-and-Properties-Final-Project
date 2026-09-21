import { useState, useEffect, useCallback } from "react";
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

  /*
   * Safely read JSON from the backend.
   * This prevents the application from crashing when
   * Vercel/Flask returns HTML instead of JSON.
   */
  const getResponseData = async (response) => {
    const contentType =
      response.headers.get("content-type") || "";

    const text = await response.text();

    console.log("=================================");
    console.log("API STATUS:", response.status);
    console.log("API CONTENT TYPE:", contentType);
    console.log("API RESPONSE:", text);
    console.log("=================================");

    if (!text.trim()) {
      throw new Error(
        `Server returned an empty response (${response.status}).`
      );
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      console.error(
        "❌ Backend returned invalid JSON:",
        text
      );

      if (
        text.trim().startsWith("<!DOCTYPE") ||
        text.trim().startsWith("<html")
      ) {
        throw new Error(
          `Backend returned an HTML page instead of JSON (HTTP ${response.status}).`
        );
      }

      throw new Error(
        `Backend returned invalid JSON (HTTP ${response.status}).`
      );
    }
  };

  /*
   * LOAD FAVOURITES
   */
  const loadFavourites = useCallback(async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/favourites`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        }
      );

      /*
       * A user who isn't logged in may receive 401.
       * That should NOT prevent the listings from loading.
       */
      if (response.status === 401) {
        setFavIds([]);
        return;
      }

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Failed to load favourites (${response.status})`
        );
      }

      setFavIds(
        Array.isArray(data?.favourites)
          ? data.favourites.map(
              (favourite) => favourite.property_id
            )
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load favourites:",
        error
      );

      setFavIds([]);
    }
  }, []);

  /*
   * LOAD PROPERTIES
   */
  const loadProperties = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const url = query
        ? `${API_URL}/api/properties?search=${encodeURIComponent(
            query
          )}`
        : `${API_URL}/api/properties`;

      console.log("Loading properties from:", url);

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await getResponseData(response);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            data?.message ||
            `Failed to load properties (${response.status})`
        );
      }

      if (!Array.isArray(data?.properties)) {
        console.warn(
          "Backend response does not contain a properties array:",
          data
        );

        setProperties([]);
        return;
      }

      setProperties(data.properties);
    } catch (error) {
      console.error(
        "❌ Properties error:",
        error
      );

      setProperties([]);

      setError(
        error.message ||
          "Unable to load properties."
      );
    } finally {
      setLoading(false);
    }
  }, [query]);

  /*
   * Load favourites once.
   */
  useEffect(() => {
    loadFavourites();
  }, [loadFavourites]);

  /*
   * Load properties whenever the search query changes.
   */
  useEffect(() => {
    loadProperties();
  }, [loadProperties]);

  /*
   * SEARCH
   */
  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
  };

  /*
   * RETRY
   */
  const handleRetry = () => {
    loadProperties();
    loadFavourites();
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <p style={styles.eyebrow}>
          Exclusive Collection
        </p>

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
            onChange={(e) =>
              setSearch(e.target.value)
            }
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
          <p style={{ fontSize: "3rem" }}>
            ⚠️
          </p>

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
            onClick={handleRetry}
          >
            Try Again
          </button>
        </div>
      ) : properties.length === 0 ? (
        /* NO PROPERTIES */
        <div style={styles.empty}>
          <p style={{ fontSize: "3rem" }}>
            🏚
          </p>

          <p
            style={{
              color: "#9ca3af",
            }}
          >
            No properties found matching your
            search.
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
                    ? ids.includes(id)
                      ? ids
                      : [...ids, id]
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