import React, { useState } from "react";

const API = "http://localhost:5000";

function AddProperty() {
  const [form, setForm] = useState({
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
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e) => {
    setForm((prev) => ({
      ...prev,
      property_photo: e.target.files[0],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const formData = new FormData();

    formData.append("property_name", form.property_name);
    formData.append("property_location", form.property_location);
    formData.append("property_price", form.property_price);
    formData.append("property_description", form.property_description);

    formData.append("property_size", form.property_size);
    formData.append("property_bath", form.property_bath);
    formData.append("property_beds", form.property_beds);

    formData.append("property_featured", form.property_featured ? 1 : 0);
    formData.append("property_for_sale", form.property_for_sale ? 1 : 0);

    if (form.property_photo) {
      formData.append("property_photo", form.property_photo);
    }

    try {
      const res = await fetch(`${API}/api/properties`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Failed to add property");
      } else {
        setMessage("Property added successfully!");

        setForm({
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
        });
      }
    } catch (err) {
      setMessage("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-7">

          <div className="card shadow-lg p-4 border-0">

            <h3 className="text-center mb-4">Add New Property</h3>

            {message && (
              <div className="alert alert-info text-center py-2">
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* NAME */}
              <input
                className="form-control mb-3"
                name="property_name"
                placeholder="Property Name"
                value={form.property_name}
                onChange={handleChange}
                required
              />

              {/* LOCATION */}
              <input
                className="form-control mb-3"
                name="property_location"
                placeholder="Location"
                value={form.property_location}
                onChange={handleChange}
                required
              />

              {/* PRICE */}
              <input
                className="form-control mb-3"
                type="number"
                name="property_price"
                placeholder="Price"
                value={form.property_price}
                onChange={handleChange}
                required
              />

              {/* SIZE */}
              <input
                className="form-control mb-3"
                type="number"
                name="property_size"
                placeholder="Size (sq ft)"
                value={form.property_size}
                onChange={handleChange}
                required
              />

              {/* BEDS + BATH */}
              <div className="row">
                <div className="col">
                  <input
                    className="form-control mb-3"
                    type="number"
                    name="property_beds"
                    placeholder="Beds"
                    value={form.property_beds}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col">
                  <input
                    className="form-control mb-3"
                    type="number"
                    name="property_bath"
                    placeholder="Baths"
                    value={form.property_bath}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <textarea
                className="form-control mb-3"
                name="property_description"
                placeholder="Description"
                value={form.property_description}
                onChange={handleChange}
              />

              {/* IMAGE */}
              <input
                className="form-control mb-3"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />

              {/* CHECKBOXES */}
              <div className="form-check mb-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="property_featured"
                  checked={form.property_featured}
                  onChange={handleChange}
                />
                <label className="form-check-label">Featured</label>
              </div>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  name="property_for_sale"
                  checked={form.property_for_sale}
                  onChange={handleChange}
                />
                <label className="form-check-label">For Sale</label>
              </div>

              {/* BUTTON */}
              <button
                className="btn btn-dark w-100"
                disabled={loading}
              >
                {loading ? "Adding Property..." : "Add Property"}
              </button>

            </form>

          </div>

        </div>
      </div>
    </div>
  );
}

export default AddProperty;