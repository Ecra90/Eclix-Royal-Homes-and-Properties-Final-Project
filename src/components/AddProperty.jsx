import React, { useState, useRef } from "react";

// Bootstrap loaded via CDN — add to your index.html:
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
// <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css" rel="stylesheet">

const INITIAL_FORM = {
  property_name: "",
  property_location: "",
  property_price: "",
  property_description: "",
  property_size: "",
  property_bath: "",
  property_beds: "",
  property_photo: null,
  property_featured: false,
  property_for_sale: true,
};

export default function AddProperty() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState(null); // { type: "success"|"error", text }
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef();

  /* ── handlers ── */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const applyFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    setForm((f) => ({ ...f, property_photo: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleFileChange = (e) => applyFile(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    applyFile(e.dataTransfer.files[0]);
  };

  const removePhoto = () => {
    setForm((f) => ({ ...f, property_photo: null }));
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const formData = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === "property_photo") {
        if (val) formData.append("property_photo", val);
      } else if (key === "property_featured" || key === "property_for_sale") {
        formData.append(key, val ? 1 : 0);
      } else {
        formData.append(key, val);
      }
    });

    try {
      const res = await fetch("/api/properties", {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ type: "error", text: data.error || "Something went wrong." });
      } else {
        setMessage({ type: "success", text: "✓ Property listed successfully!" });
        setForm(INITIAL_FORM);
        setPreview(null);
      }
    } catch {
      setMessage({ type: "error", text: "Server error — check your connection." });
    } finally {
      setLoading(false);
    }
  };

  /* ── render ── */
  return (
    <>
      <style>{css}</style>

      <div className="erh-wrap">
        {/* ── left panel ── */}
        <aside className="erh-side">
          <div className="erh-logo">⬡</div>
          <h1 className="erh-brand">Eclix<br /><span>Royal Homes</span></h1>
          <p className="erh-tagline">Add a new luxury listing to our curated portfolio.</p>

          <ul className="erh-checklist">
            {["Complete all required fields", "Upload a high-quality photo", "Set price in KES or USD", "Mark featured for homepage"].map((t) => (
              <li key={t}><i className="bi bi-check-circle-fill" /> {t}</li>
            ))}
          </ul>

          <div className="erh-side-footer">
            <span>© 2026 Eclix Royal Homes</span>
          </div>
        </aside>

        {/* ── main form ── */}
        <main className="erh-main">
          <div className="erh-header">
            <h2>New Property Listing</h2>
            <p>Fill in the details below to publish a property on the platform.</p>
          </div>

          {/* alert */}
          {message && (
            <div className={`alert erh-alert ${message.type === "success" ? "alert-success" : "alert-danger"} d-flex align-items-center gap-2`}>
              <i className={`bi ${message.type === "success" ? "bi-check-circle-fill" : "bi-exclamation-triangle-fill"}`} />
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* ── Section: Basic Info ── */}
            <div className="erh-section">
              <div className="erh-section-label">
                <span className="erh-step">01</span> Basic Information
              </div>

              <div className="row g-3">
                <div className="col-12">
                  <label className="erh-label">Property Name <span className="erh-req">*</span></label>
                  <div className="input-group erh-input-group">
                    <span className="input-group-text"><i className="bi bi-building" /></span>
                    <input
                      className="form-control erh-input"
                      type="text"
                      name="property_name"
                      placeholder="e.g. Ocean View Villa"
                      value={form.property_name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-12">
                  <label className="erh-label">Location <span className="erh-req">*</span></label>
                  <div className="input-group erh-input-group">
                    <span className="input-group-text"><i className="bi bi-geo-alt" /></span>
                    <input
                      className="form-control erh-input"
                      type="text"
                      name="property_location"
                      placeholder="e.g. Karen, Nairobi"
                      value={form.property_location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="erh-label">Price (KES) <span className="erh-req">*</span></label>
                  <div className="input-group erh-input-group">
                    <span className="input-group-text">KES</span>
                    <input
                      className="form-control erh-input"
                      type="number"
                      name="property_price"
                      placeholder="e.g. 85000000"
                      value={form.property_price}
                      onChange={handleChange}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="erh-label">Size (m²)</label>
                  <div className="input-group erh-input-group">
                    <span className="input-group-text"><i className="bi bi-aspect-ratio" /></span>
                    <input
                      className="form-control erh-input"
                      type="number"
                      name="property_size"
                      placeholder="e.g. 450"
                      value={form.property_size}
                      onChange={handleChange}
                      min="0"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section: Rooms ── */}
            <div className="erh-section">
              <div className="erh-section-label">
                <span className="erh-step">02</span> Rooms & Bathrooms
              </div>

              <div className="row g-3">
                <div className="col-6">
                  <label className="erh-label">Bedrooms</label>
                  <div className="erh-counter">
                    <button type="button" className="erh-counter-btn"
                      onClick={() => setForm(f => ({ ...f, property_beds: Math.max(0, Number(f.property_beds) - 1) }))}>
                      <i className="bi bi-dash" />
                    </button>
                    <span className="erh-counter-val">{form.property_beds || 0}</span>
                    <button type="button" className="erh-counter-btn"
                      onClick={() => setForm(f => ({ ...f, property_beds: Number(f.property_beds) + 1 }))}>
                      <i className="bi bi-plus" />
                    </button>
                    <i className="bi bi-door-closed erh-counter-icon" />
                  </div>
                </div>

                <div className="col-6">
                  <label className="erh-label">Bathrooms</label>
                  <div className="erh-counter">
                    <button type="button" className="erh-counter-btn"
                      onClick={() => setForm(f => ({ ...f, property_bath: Math.max(0, Number(f.property_bath) - 1) }))}>
                      <i className="bi bi-dash" />
                    </button>
                    <span className="erh-counter-val">{form.property_bath || 0}</span>
                    <button type="button" className="erh-counter-btn"
                      onClick={() => setForm(f => ({ ...f, property_bath: Number(f.property_bath) + 1 }))}>
                      <i className="bi bi-plus" />
                    </button>
                    <i className="bi bi-droplet erh-counter-icon" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section: Description ── */}
            <div className="erh-section">
              <div className="erh-section-label">
                <span className="erh-step">03</span> Description
              </div>
              <textarea
                className="form-control erh-input erh-textarea"
                name="property_description"
                placeholder="Describe the property — highlights, features, surroundings…"
                value={form.property_description}
                onChange={handleChange}
                rows={4}
              />
            </div>

            {/* ── Section: Photo ── */}
            <div className="erh-section">
              <div className="erh-section-label">
                <span className="erh-step">04</span> Property Photo
              </div>

              {preview ? (
                <div className="erh-preview-wrap">
                  <img src={preview} alt="Preview" className="erh-preview-img" />
                  <div className="erh-preview-overlay">
                    <button type="button" className="erh-remove-btn" onClick={removePhoto}>
                      <i className="bi bi-trash3" /> Remove
                    </button>
                  </div>
                  <div className="erh-preview-name">
                    <i className="bi bi-image" /> {form.property_photo?.name}
                  </div>
                </div>
              ) : (
                <div
                  className={`erh-dropzone ${dragOver ? "erh-dropzone--active" : ""}`}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileRef.current?.click()}
                >
                  <i className="bi bi-cloud-arrow-up erh-drop-icon" />
                  <p className="erh-drop-text">Drag & drop or <span>browse</span></p>
                  <p className="erh-drop-hint">JPG, PNG, WEBP — max 10 MB</p>
                  <input
                    ref={fileRef}
                    type="file"
                    name="property_photo"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </div>
              )}
            </div>

            {/* ── Section: Flags ── */}
            <div className="erh-section">
              <div className="erh-section-label">
                <span className="erh-step">05</span> Listing Flags
              </div>

              <div className="d-flex gap-3 flex-wrap">
                <label className="erh-toggle">
                  <input
                    type="checkbox"
                    name="property_featured"
                    checked={form.property_featured}
                    onChange={handleChange}
                  />
                  <span className="erh-toggle-track">
                    <span className="erh-toggle-thumb" />
                  </span>
                  <span className="erh-toggle-label">
                    <i className="bi bi-star-fill" /> Featured on Homepage
                  </span>
                </label>

                <label className="erh-toggle">
                  <input
                    type="checkbox"
                    name="property_for_sale"
                    checked={form.property_for_sale}
                    onChange={handleChange}
                  />
                  <span className="erh-toggle-track">
                    <span className="erh-toggle-thumb" />
                  </span>
                  <span className="erh-toggle-label">
                    <i className="bi bi-tag-fill" /> Available For Sale
                  </span>
                </label>
              </div>
            </div>

            {/* ── Submit ── */}
            <button type="submit" className="erh-submit" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2" />Publishing…</>
              ) : (
                <><i className="bi bi-send-fill me-2" />Publish Property</>
              )}
            </button>
          </form>
        </main>
      </div>
    </>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --gold: #c9a84c;
    --gold-light: #e4c97e;
    --gold-dim: rgba(201,168,76,0.15);
    --dark: #0b0f1c;
    --dark2: #131929;
    --dark3: #1c2438;
    --border: rgba(201,168,76,0.18);
    --text: #e8e4d8;
    --muted: #7a8099;
    --radius: 12px;
  }

  .erh-wrap {
    display: flex;
    min-height: 100vh;
    font-family: 'DM Sans', sans-serif;
    background: var(--dark);
    color: var(--text);
  }

  /* ── side panel ── */
  .erh-side {
    width: 300px;
    flex-shrink: 0;
    background: var(--dark2);
    border-right: 1px solid var(--border);
    padding: 48px 32px;
    display: flex;
    flex-direction: column;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  }
  .erh-logo {
    font-size: 2.6rem;
    color: var(--gold);
    line-height: 1;
    margin-bottom: 12px;
  }
  .erh-brand {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    color: var(--text);
    margin: 0 0 12px;
    line-height: 1.2;
  }
  .erh-brand span { color: var(--gold); }
  .erh-tagline { color: var(--muted); font-size: 0.83rem; line-height: 1.6; margin-bottom: 36px; }

  .erh-checklist { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
  .erh-checklist li {
    display: flex; align-items: center; gap: 10px;
    color: var(--muted); font-size: 0.82rem;
  }
  .erh-checklist li i { color: var(--gold); font-size: 0.9rem; }

  .erh-side-footer { margin-top: auto; color: var(--muted); font-size: 0.75rem; }

  /* ── main ── */
  .erh-main {
    flex: 1;
    padding: 48px 5%;
    max-width: 760px;
    margin: 0 auto;
    width: 100%;
  }

  .erh-header { margin-bottom: 32px; }
  .erh-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem; color: var(--text); margin: 0 0 6px;
  }
  .erh-header p { color: var(--muted); margin: 0; font-size: 0.9rem; }

  /* alert */
  .erh-alert {
    border-radius: var(--radius);
    font-size: 0.88rem;
    border: none;
    margin-bottom: 28px;
  }
  .alert-success { background: rgba(34,197,94,0.1); color: #86efac; }
  .alert-danger  { background: rgba(239,68,68,0.1);  color: #fca5a5; }

  /* sections */
  .erh-section {
    background: var(--dark2);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 28px;
    margin-bottom: 20px;
  }
  .erh-section-label {
    display: flex; align-items: center; gap: 12px;
    font-size: 0.72rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 20px;
  }
  .erh-step {
    background: var(--gold-dim); color: var(--gold);
    border-radius: 6px; padding: 2px 8px;
    font-size: 0.78rem; font-weight: 700;
  }

  /* inputs */
  .erh-label {
    display: block; font-size: 0.78rem;
    letter-spacing: 0.06em; text-transform: uppercase;
    color: var(--muted); margin-bottom: 7px; font-weight: 500;
  }
  .erh-req { color: var(--gold); }

  .erh-input-group .input-group-text {
    background: var(--dark3);
    border: 1px solid var(--border);
    border-right: none;
    color: var(--gold);
    font-size: 0.85rem;
    padding: 0 14px;
  }
  .erh-input {
    background: var(--dark3) !important;
    border: 1px solid var(--border) !important;
    color: var(--text) !important;
    border-radius: 8px !important;
    padding: 11px 16px !important;
    font-size: 0.9rem !important;
    transition: border-color 0.2s, box-shadow 0.2s !important;
  }
  .erh-input-group .erh-input { border-left: none !important; border-radius: 0 8px 8px 0 !important; }
  .erh-input:focus {
    border-color: var(--gold) !important;
    box-shadow: 0 0 0 3px rgba(201,168,76,0.12) !important;
    outline: none !important;
  }
  .erh-input::placeholder { color: var(--muted) !important; }
  .erh-textarea { resize: vertical; min-height: 110px; }

  /* counter */
  .erh-counter {
    display: flex; align-items: center; gap: 0;
    background: var(--dark3); border: 1px solid var(--border);
    border-radius: 8px; overflow: hidden; height: 44px;
  }
  .erh-counter-btn {
    background: none; border: none; color: var(--gold);
    width: 40px; height: 100%; font-size: 1.1rem;
    cursor: pointer; transition: background 0.15s;
    display: flex; align-items: center; justify-content: center;
  }
  .erh-counter-btn:hover { background: var(--gold-dim); }
  .erh-counter-val {
    flex: 1; text-align: center; font-size: 1.1rem;
    font-weight: 600; color: var(--text);
  }
  .erh-counter-icon { color: var(--muted); font-size: 0.9rem; margin-right: 14px; }

  /* dropzone */
  .erh-dropzone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    padding: 48px 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.2s, background 0.2s;
  }
  .erh-dropzone:hover, .erh-dropzone--active {
    border-color: var(--gold);
    background: var(--gold-dim);
  }
  .erh-drop-icon { font-size: 2.5rem; color: var(--gold); display: block; margin-bottom: 12px; }
  .erh-drop-text { color: var(--text); margin: 0 0 6px; font-size: 0.95rem; }
  .erh-drop-text span { color: var(--gold); text-decoration: underline; }
  .erh-drop-hint { color: var(--muted); font-size: 0.78rem; margin: 0; }

  /* preview */
  .erh-preview-wrap {
    position: relative; border-radius: var(--radius); overflow: hidden;
    border: 1px solid var(--border);
  }
  .erh-preview-img { width: 100%; height: 260px; object-fit: cover; display: block; }
  .erh-preview-overlay {
    position: absolute; inset: 0;
    background: rgba(11,15,28,0.5);
    display: flex; align-items: center; justify-content: center;
    opacity: 0; transition: opacity 0.2s;
  }
  .erh-preview-wrap:hover .erh-preview-overlay { opacity: 1; }
  .erh-remove-btn {
    background: rgba(239,68,68,0.9); color: white; border: none;
    border-radius: 8px; padding: 10px 20px; cursor: pointer;
    font-size: 0.85rem; font-weight: 600; display: flex; align-items: center; gap: 8px;
  }
  .erh-preview-name {
    padding: 10px 16px; color: var(--muted);
    font-size: 0.8rem; background: var(--dark3);
    display: flex; align-items: center; gap: 8px;
  }

  /* toggles */
  .erh-toggle {
    display: flex; align-items: center; gap: 12px;
    cursor: pointer; user-select: none;
    background: var(--dark3); border: 1px solid var(--border);
    border-radius: 10px; padding: 14px 18px; flex: 1; min-width: 200px;
    transition: border-color 0.2s;
  }
  .erh-toggle:hover { border-color: var(--gold); }
  .erh-toggle input { display: none; }

  .erh-toggle-track {
    width: 42px; height: 24px; border-radius: 12px;
    background: var(--dark); border: 1px solid var(--border);
    position: relative; flex-shrink: 0; transition: background 0.2s;
  }
  .erh-toggle input:checked ~ .erh-toggle-track { background: var(--gold); border-color: var(--gold); }
  .erh-toggle-thumb {
    position: absolute; top: 3px; left: 3px;
    width: 16px; height: 16px; border-radius: 50%;
    background: var(--muted); transition: transform 0.2s, background 0.2s;
  }
  .erh-toggle input:checked ~ .erh-toggle-track .erh-toggle-thumb {
    transform: translateX(18px); background: var(--dark);
  }
  .erh-toggle-label { color: var(--text); font-size: 0.88rem; display: flex; align-items: center; gap: 7px; }
  .erh-toggle-label i { color: var(--gold); }

  /* submit */
  .erh-submit {
    width: 100%; padding: 16px;
    background: var(--gold);
    color: #0b0f1c;
    border: none; border-radius: var(--radius);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.95rem; font-weight: 700;
    letter-spacing: 0.06em;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    display: flex; align-items: center; justify-content: center;
    margin-top: 8px;
  }
  .erh-submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
  .erh-submit:disabled { opacity: 0.6; cursor: not-allowed; }

  /* responsive */
  @media (max-width: 768px) {
    .erh-wrap { flex-direction: column; }
    .erh-side { width: 100%; height: auto; position: static; flex-direction: row; flex-wrap: wrap; gap: 16px; padding: 24px 20px; }
    .erh-checklist { display: none; }
    .erh-side-footer { display: none; }
    .erh-main { padding: 24px 16px; }
  }
`;