import React, { useState } from "react";

const API_URL = "https://eclixroyalhomesbackendapi.vercel.app";

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

  const [preview, setPreview] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // ─────────────────────────────────────
  // Handle normal inputs
  // ─────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ─────────────────────────────────────
  // Handle photo
  // ─────────────────────────────────────
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      setForm((prev) => ({
        ...prev,
        property_photo: null,
      }));

      setPreview(null);
      return;
    }

    // Only images
    if (!file.type.startsWith("image/")) {
      setMessage("Please select a valid image.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      property_photo: file,
    }));

    // Preview before uploading
    setPreview(URL.createObjectURL(file));
    setMessage("");
  };

  // ─────────────────────────────────────
  // Submit property
  // ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    const formData = new FormData();

    formData.append(
      "property_name",
      form.property_name
    );

    formData.append(
      "property_location",
      form.property_location
    );

    formData.append(
      "property_price",
      form.property_price
    );

    formData.append(
      "property_description",
      form.property_description
    );

    formData.append(
      "property_size",
      form.property_size
    );

    formData.append(
      "property_bath",
      form.property_bath
    );

    formData.append(
      "property_beds",
      form.property_beds
    );

    formData.append(
      "property_featured",
      form.property_featured ? "1" : "0"
    );

    formData.append(
      "property_for_sale",
      form.property_for_sale ? "1" : "0"
    );

    if (form.property_photo) {
      formData.append(
        "property_photo",
        form.property_photo
      );
    }

    try {
      const res = await fetch(
        `${API_URL}/api/properties`,
        {
          method: "POST",
          credentials: "include",
          body: formData,
        }
      );

      const text = await res.text();

      console.log(
        "ADD PROPERTY STATUS:",
        res.status
      );

      console.log(
        "ADD PROPERTY RESPONSE:",
        text
      );

      let data;

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        throw new Error(
          "The server returned an invalid response."
        );
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            `Unable to add property (${res.status})`
        );
      }

      setMessage(
        "Property added successfully! 🎉"
      );

      // Reset form
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

      setPreview(null);

      // Reset file input
      const fileInput =
        document.querySelector(
          'input[name="property_photo"]'
        );

      if (fileInput) {
        fileInput.value = "";
      }
    } catch (err) {
      console.error(
        "ADD PROPERTY ERROR:",
        err
      );

      setMessage(
        err.message ||
          "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "80px auto",
        padding: "30px",
      }}
    >
      <h2>Add Property</h2>

      <form onSubmit={handleSubmit}>
        {/* PROPERTY NAME */}
        <input
          type="text"
          name="property_name"
          placeholder="Property Name"
          value={form.property_name}
          onChange={handleChange}
          required
        />

        {/* LOCATION */}
        <input
          type="text"
          name="property_location"
          placeholder="Location"
          value={form.property_location}
          onChange={handleChange}
          required
        />

        {/* PRICE */}
        <input
          type="number"
          name="property_price"
          placeholder="Price"
          value={form.property_price}
          onChange={handleChange}
          required
        />

        {/* BEDS */}
        <input
          type="number"
          name="property_beds"
          placeholder="Number of beds"
          value={form.property_beds}
          onChange={handleChange}
        />

        {/* BATHS */}
        <input
          type="number"
          name="property_bath"
          placeholder="Number of baths"
          value={form.property_bath}
          onChange={handleChange}
        />

        {/* SIZE */}
        <input
          type="text"
          name="property_size"
          placeholder="Property size e.g. 250"
          value={form.property_size}
          onChange={handleChange}
        />

        {/* DESCRIPTION */}
        <textarea
          name="property_description"
          placeholder="Description"
          value={form.property_description}
          onChange={handleChange}
        />

        {/* PHOTO */}
        <input
          type="file"
          name="property_photo"
          accept="image/*"
          onChange={handleFileChange}
        />

        {/* PHOTO PREVIEW */}
        {preview && (
          <div style={{ marginTop: "15px" }}>
            <p>Photo preview:</p>

            <img
              src={preview}
              alt="Property preview"
              style={{
                width: "100%",
                maxHeight: "300px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />
          </div>
        )}

        {/* FEATURED */}
        <label>
          <input
            type="checkbox"
            name="property_featured"
            checked={form.property_featured}
            onChange={handleChange}
          />
          Featured
        </label>

        {/* FOR SALE */}
        <label>
          <input
            type="checkbox"
            name="property_for_sale"
            checked={form.property_for_sale}
            onChange={handleChange}
          />
          For Sale
        </label>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Uploading..."
            : "Add Property"}
        </button>
      </form>

      {message && (
        <p style={{ marginTop: "20px" }}>
          {message}
        </p>
      )}
    </div>
  );
}

export default AddProperty;