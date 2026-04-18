import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const inputStyle = {
  width: "100%", padding: "12px",
  borderRadius: "8px", border: "1px solid #ddd",
  fontSize: "15px", marginTop: "6px",
  boxSizing: "border-box", outline: "none"
};

const labelStyle = {
  fontSize: "14px", fontWeight: "600", color: "#333"
};

function NewListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "", description: "",
    image: { url: "", filename: "listingimage" },
    price: "", location: "", country: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: { url: value, filename: "listingimage" } });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:3030/listings", formData);
      navigate("/listings");
    } catch (err) {
      console.log(err);
    }
  };
  return (
    <div style={{ maxWidth: "620px", margin: "40px auto", padding: "0 20px" }}>
      <button
        onClick={() => navigate("/listings")}
        style={{
          background: "none", border: "1px solid #ddd",
          padding: "8px 16px", borderRadius: "24px",
          cursor: "pointer", marginBottom: "24px", fontSize: "14px"
        }}
      >
        ← Back
      </button>

      <h1 style={{ fontSize: "26px", marginBottom: "28px" }}>Create New Listing</h1>
      <form onSubmit={handleSubmit}>
        {[
          { label: "Title", name: "title", type: "text" },
          { label: "Price per night (₹)", name: "price", type: "number" },
          { label: "Location", name: "location", type: "text" },
          { label: "Country", name: "country", type: "text" },
          { label: "Image URL", name: "image", type: "text" },
        ].map(({ label, name, type }) => (
          <div key={name} style={{ marginBottom: "18px" }}>
            <label style={labelStyle}>{label}</label>
            <input
              name={name} type={type} required={name !== "image"}
              value={name === "image" ? formData.image.url : formData[name]}
              onChange={handleChange} style={inputStyle}
            />
          </div>
        ))}
        <div style={{ marginBottom: "24px" }}>
          <label style={labelStyle}>Description</label>
          <textarea
            name="description" rows={5}
            value={formData.description} onChange={handleChange}
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
        <button
          type="submit"
          style={{
            width: "100%", padding: "14px",
            background: "#ff385c", color: "white",
            border: "none", borderRadius: "8px",
            cursor: "pointer", fontWeight: "700",
            fontSize: "16px",
            }}
        >
          Create Listing
        </button>
      </form>
    </div>
  );
}

export default NewListing;