import React, { useState } from "react";

function AddProperty() {
  const [form, setForm] = useState({
    property_name: "",
    property_location: "",
    property_price: "",
    property_description: "",
    property_photo: null,
    property_featured: false,
    property_for_sale: true,
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setForm({
      ...form,
      property_photo: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("property_name", form.property_name);
    formData.append("property_location", form.property_location);
    formData.append("property_price", form.property_price);
    formData.append("property_description", form.property_description);
    formData.append("property_featured", form.property_featured ? 1 : 0);
    formData.append("property_for_sale", form.property_for_sale ? 1 : 0);

    if (form.property_photo) {
      formData.append("property_photo", form.property_photo);
    }

    try {
      const res = await fetch("http://127.0.0.1:5000/api/properties", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || "Something went wrong");
        return;
      }

      setMessage("Property added successfully!");

      setForm({
        property_name: "",
        property_location: "",
        property_price: "",
        property_description: "",
        property_photo: null,
        property_featured: false,
        property_for_sale: true,
      });
    } catch (err) {
      setMessage("Server error");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto" }}>
      <h2>Add Property</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="property_name"
          placeholder="Property Name"
          value={form.property_name}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="property_location"
          placeholder="Location"
          value={form.property_location}
          onChange={handleChange}
          required
        />

        <input
          type="number"
          name="property_price"
          placeholder="Price"
          value={form.property_price}
          onChange={handleChange}
          required
        />

        <textarea
          name="property_description"
          placeholder="Description"
          value={form.property_description}
          onChange={handleChange}
        />

        {/* FILE UPLOAD */}
        <input
          type="file"
          name="property_photo"
          accept="image/*"
          onChange={handleFileChange}
        />

        <label>
          <input
            type="checkbox"
            name="property_featured"
            checked={form.property_featured}
            onChange={handleChange}
          />
          Featured
        </label>

        <label>
          <input
            type="checkbox"
            name="property_for_sale"
            checked={form.property_for_sale}
            onChange={handleChange}
          />
          For Sale
        </label>

        <button type="submit">Add Property</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}

export default AddProperty;