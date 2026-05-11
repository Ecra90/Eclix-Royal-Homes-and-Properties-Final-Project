import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";

const SLIDES = [
  "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1600",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1600",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600",
];

export default function Home() {
  const [slide, setSlide] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const t = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetch("/api/properties?featured=1", { credentials: "include" })
      .then(r => r.json())
      .then(d => setFeatured(d.properties || []));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/listings?search=${encodeURIComponent(search)}`);
  };

  return (
    <div style={styles.page}>
      {/* ── HERO ── */}
      <section style={{ ...styles.hero, backgroundImage: `url(${SLIDES[slide]})` }}>
        <div style={styles.heroOverlay}>
          <p style={styles.heroEyebrow}>Kenya's Premier Luxury Real Estate</p>
          <h1 style={styles.heroTitle}>
            Discover Estates<br />
            <span style={styles.heroGold}>Beyond Compare</span>
          </h1>
          <p style={styles.heroSub}>
            Curating the world's most prestigious properties for discerning clients.
          </p>
          <form style={styles.searchBar} onSubmit={handleSearch}>
            <input
              style={styles.searchInput}
              placeholder="Search by location, name, or type…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit" style={styles.searchBtn}>Search</button>
          </form>
          <div style={styles.slideIndicators}>
            {SLIDES.map((_, i) => (
              <button
                key={i}
                style={{ ...styles.dot, ...(i === slide ? styles.dotActive : {}) }}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={styles.stats}>
        {[["500+", "Luxury Properties"], ["$2B+", "Transactions Closed"], ["15+", "Years of Excellence"], ["50+", "Countries Served"]].map(([n, l]) => (
          <div key={l} style={styles.stat}>
            <span style={styles.statNum}>{n}</span>
            <span style={styles.statLabel}>{l}</span>
          </div>
        ))}
      </section>

      {/* ── FEATURED ── */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.eyebrow}>Handpicked Exclusives</p>
          <h2 style={styles.sectionTitle}>Featured Properties</h2>
        </div>
        <div style={styles.grid}>
          {featured.map(p => (
            <PropertyCard key={p.property_id} property={p} isFav={false} />
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button style={styles.ctaBtn} onClick={() => navigate("/listings")}>
            View All Listings →
          </button>
        </div>
      </section>

      {/* ── INSIGHTS ── */}
      <section style={styles.insights}>
        <div style={styles.sectionHeader}>
          <p style={styles.eyebrow}>Market Intelligence</p>
          <h2 style={styles.sectionTitle}>Luxury Market Insights</h2>
        </div>
        <div style={styles.insightGrid}>
          {[
            { icon: "📈", title: "Market Trends", text: "Luxury property demand is surging in Nairobi, Mombasa, and Diani—driven by diaspora investment and infrastructure growth." },
            { icon: "💡", title: "Investment Advice", text: "Waterfront and gated-community properties consistently outperform the market, delivering 12–18% annual returns." },
            { icon: "📍", title: "Top Locations", text: "Karen, Runda, Muthaiga, and the Diani Coast remain Kenya's most coveted addresses for ultra-high-net-worth buyers." },
          ].map(c => (
            <div key={c.title} style={styles.insightCard}>
              <span style={styles.insightIcon}>{c.icon}</span>
              <h3 style={styles.insightTitle}>{c.title}</h3>
              <p style={styles.insightText}>{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section style={styles.testimonialSection}>
        <div style={styles.testimonial}>
          <p style={styles.quote}>"Eclix Royal Homes found us our dream villa in Karen — the discretion, speed and white-glove service was unmatched anywhere in the world."</p>
          <p style={styles.author}>— James & Amara Osei, Accra / Nairobi</p>
        </div>
      </section>

      {/* ── AGENTS ── */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <p style={styles.eyebrow}>Our Specialists</p>
          <h2 style={styles.sectionTitle}>Meet the Experts</h2>
        </div>
        <div style={styles.agentGrid}>
          {[
            { name: "Amara Wanjiku", role: "Senior Property Specialist", img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400" },
            { name: "David Kamau", role: "Investment Advisor", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
            { name: "Sophia Odhiambo", role: "Interior & Staging Consultant", img: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=400" },
          ].map(a => (
            <div key={a.name} style={styles.agentCard}>
              <img src={a.img} alt={a.name} style={styles.agentImg} />
              <h3 style={styles.agentName}>{a.name}</h3>
              <p style={styles.agentRole}>{a.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

const styles = {
  page: { background: "#0a0e1a", minHeight: "100vh", paddingTop: "70px" },
  // HERO
  hero: {
    height: "100vh", backgroundSize: "cover", backgroundPosition: "center",
    transition: "background-image 1s ease",
    display: "flex", alignItems: "center",
  },
  heroOverlay: {
    width: "100%", height: "100%",
    background: "linear-gradient(135deg, rgba(10,14,26,0.85) 0%, rgba(10,14,26,0.4) 100%)",
    display: "flex", flexDirection: "column", alignItems: "flex-start",
    justifyContent: "center", padding: "0 8%",
  },
  heroEyebrow: {
    color: "#d4af37", letterSpacing: "0.2em", fontSize: "0.75rem",
    textTransform: "uppercase", marginBottom: "16px",
    fontFamily: "'Cormorant Garamond', serif",
  },
  heroTitle: {
    fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(2.5rem, 6vw, 5rem)",
    color: "#f8f4e8", lineHeight: 1.1,
    margin: "0 0 20px",
  },
  heroGold: { color: "#d4af37" },
  heroSub: { color: "#c9c5b8", fontSize: "1.1rem", maxWidth: "480px", marginBottom: "36px", lineHeight: 1.6 },
  searchBar: { display: "flex", gap: "0", maxWidth: "520px", width: "100%", marginBottom: "32px" },
  searchInput: {
    flex: 1, padding: "14px 20px", border: "none",
    borderRadius: "8px 0 0 8px", background: "rgba(255,255,255,0.95)",
    color: "#111", fontSize: "0.9rem", outline: "none",
  },
  searchBtn: {
    background: "#d4af37", color: "#0a0e1a",
    border: "none", padding: "14px 24px", borderRadius: "0 8px 8px 0",
    fontWeight: 800, fontSize: "0.85rem", cursor: "pointer",
    letterSpacing: "0.08em",
  },
  slideIndicators: { display: "flex", gap: "8px" },
  dot: {
    width: "8px", height: "8px", borderRadius: "50%",
    background: "rgba(255,255,255,0.3)", border: "none", cursor: "pointer",
  },
  dotActive: { background: "#d4af37", width: "24px", borderRadius: "4px" },
  // STATS
  stats: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    borderTop: "1px solid rgba(212,175,55,0.15)",
    borderBottom: "1px solid rgba(212,175,55,0.15)",
  },
  stat: {
    display: "flex", flexDirection: "column", alignItems: "center",
    padding: "30px 20px",
    borderRight: "1px solid rgba(212,175,55,0.1)",
  },
  statNum: { color: "#d4af37", fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 700 },
  statLabel: { color: "#6b7280", fontSize: "0.78rem", letterSpacing: "0.08em", marginTop: "4px" },
  // SECTIONS
  section: { padding: "80px 5%" },
  sectionHeader: { textAlign: "center", marginBottom: "48px" },
  eyebrow: { color: "#d4af37", letterSpacing: "0.2em", fontSize: "0.72rem", textTransform: "uppercase", marginBottom: "10px" },
  sectionTitle: {
    color: "#f8f4e8", fontFamily: "'Playfair Display', serif",
    fontSize: "clamp(1.8rem, 3vw, 2.6rem)", margin: 0,
  },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" },
  ctaBtn: {
    background: "transparent", color: "#d4af37",
    border: "1px solid rgba(212,175,55,0.5)",
    padding: "14px 32px", borderRadius: "8px",
    fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem",
    cursor: "pointer", letterSpacing: "0.08em",
    transition: "all 0.3s",
  },
  // INSIGHTS
  insights: { background: "rgba(212,175,55,0.03)", padding: "80px 5%", borderTop: "1px solid rgba(212,175,55,0.1)" },
  insightGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px" },
  insightCard: {
    background: "#111827", padding: "32px",
    borderRadius: "16px", border: "1px solid rgba(212,175,55,0.1)",
  },
  insightIcon: { fontSize: "2rem", display: "block", marginBottom: "14px" },
  insightTitle: { color: "#d4af37", fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", margin: "0 0 10px" },
  insightText: { color: "#9ca3af", lineHeight: 1.6, margin: 0, fontSize: "0.88rem" },
  // TESTIMONIAL
  testimonialSection: { padding: "60px 10%", borderTop: "1px solid rgba(212,175,55,0.1)" },
  testimonial: {
    borderLeft: "4px solid #d4af37", paddingLeft: "28px", maxWidth: "700px", margin: "0 auto",
  },
  quote: { color: "#c9c5b8", fontFamily: "'Cormorant Garamond', serif", fontSize: "1.3rem", fontStyle: "italic", lineHeight: 1.6 },
  author: { color: "#d4af37", fontSize: "0.85rem", marginTop: "14px" },
  // AGENTS
  agentGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "24px" },
  agentCard: { textAlign: "center" },
  agentImg: { width: "140px", height: "140px", borderRadius: "50%", objectFit: "cover", border: "2px solid rgba(212,175,55,0.4)", marginBottom: "14px" },
  agentName: { color: "#f8f4e8", fontFamily: "'Playfair Display', serif", margin: "0 0 6px" },
  agentRole: { color: "#6b7280", fontSize: "0.82rem" },
};
