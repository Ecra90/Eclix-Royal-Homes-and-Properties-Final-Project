import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <span style={styles.icon}>⬡</span>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.sub}>Sign in to your Eclix Royal Homes account</p>
        </div>
        <div style={styles.divider} />
        {error && <div style={styles.error}>{error}</div>}
        <div>
          <label style={styles.label}>Email Address</label>
          <input
            style={styles.input}
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          />
          <label style={styles.label}>Password</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Your password"
            value={form.password}
            onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
          />
          <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
        <p style={styles.switch}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", email: "", password: "", phone: "", location: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const field = (key, label, type = "text", placeholder = "") => (
    <div key={key}>
      <label style={styles.label}>{label}</label>
      <input
        style={styles.input} type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div style={styles.page}>
      <div style={{ ...styles.card, maxWidth: "480px" }}>
        <div style={styles.cardHeader}>
          <span style={styles.icon}>⬡</span>
          <h1 style={styles.title}>Join Eclix</h1>
          <p style={styles.sub}>Create your account to access exclusive listings</p>
        </div>
        <div style={styles.divider} />
        {error && <div style={styles.error}>{error}</div>}
        <div>
          {field("username", "Full Name", "text", "John Doe")}
          {field("email", "Email Address", "email", "you@example.com")}
          {field("password", "Password", "password", "Minimum 8 characters")}
          {field("phone", "Phone Number", "tel", "+254 700 000 000")}
          {field("location", "Location / City", "text", "Nairobi, Kenya")}
          <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </div>
        <p style={styles.switch}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    background: "#0a0e1a", minHeight: "100vh", paddingTop: "70px",
    display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 20px",
  },
  card: {
    background: "#111827", borderRadius: "20px",
    border: "1px solid rgba(212,175,55,0.15)",
    padding: "48px", width: "100%", maxWidth: "420px",
    boxShadow: "0 25px 80px rgba(0,0,0,0.5)",
  },
  cardHeader: { textAlign: "center", marginBottom: "24px" },
  icon: { color: "#d4af37", fontSize: "2.5rem", display: "block", marginBottom: "12px" },
  title: {
    color: "#f8f4e8", fontFamily: "'Playfair Display', serif",
    fontSize: "1.8rem", margin: "0 0 8px",
  },
  sub: { color: "#6b7280", fontSize: "0.85rem", margin: 0 },
  divider: { height: "1px", background: "rgba(212,175,55,0.1)", marginBottom: "28px" },
  error: {
    background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
    color: "#f87171", borderRadius: "8px", padding: "12px 16px",
    fontSize: "0.85rem", marginBottom: "20px",
  },
  label: { display: "block", color: "#9ca3af", fontSize: "0.78rem", letterSpacing: "0.08em", marginBottom: "6px", textTransform: "uppercase" },
  input: {
    display: "block", width: "100%", padding: "12px 16px",
    borderRadius: "8px", border: "1px solid rgba(212,175,55,0.15)",
    background: "#0a0e1a", color: "#f8f4e8",
    fontSize: "0.9rem", marginBottom: "20px",
    boxSizing: "border-box", outline: "none",
    transition: "border-color 0.2s",
  },
  btn: {
    display: "block", width: "100%", padding: "14px",
    background: "#d4af37", color: "#0a0e1a",
    border: "none", borderRadius: "8px",
    fontWeight: 800, fontSize: "0.9rem", letterSpacing: "0.06em",
    cursor: "pointer", marginTop: "8px",
  },
  switch: { color: "#6b7280", textAlign: "center", fontSize: "0.85rem", marginTop: "20px" },
  link: { color: "#d4af37", textDecoration: "none" },
};
