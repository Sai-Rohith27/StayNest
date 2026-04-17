import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

function Show() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`http://localhost:3030/listings/${id}`)
      .then((res) => { setListing(res.data); setLoading(false); })
      .catch((err) => { console.log(err); setLoading(false); });
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      await axios.delete(`http://localhost:3030/listings/${id}`);
      navigate("/listings");
    }
  };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px", color: "#888" }}>
      Loading...
    </div>
  );

  if (!listing) return (
    <div style={{ textAlign: "center", padding: "80px", color: "#888" }}>
      Listing not found!
    </div>
  );

  const imageUrl = listing.image?.url || "https://placehold.co/800x600?text=No+Image";

  return (
    <div style={{ maxWidth: "900px", margin: "40px auto", padding: "0 20px" }}>
      <button
        onClick={() => navigate("/listings")}
        style={{
          background: "none", border: "1px solid #ddd",
          padding: "8px 16px", borderRadius: "24px",
          cursor: "pointer", marginBottom: "24px", fontSize: "14px"
        }}
      >
        ← Back to Listings
      </button>

      <img
        src={imageUrl}
        alt={listing.title}
        style={{ width: "100%", height: "420px", objectFit: "cover", borderRadius: "16px" }}
        onError={(e) => { e.target.src = "https://placehold.co/800x600?text=No+Image"; }}
      />

      <div style={{ marginTop: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <h1 style={{ fontSize: "28px", margin: "0 0 8px" }}>{listing.title}</h1>
          <span style={{ color: "#ff385c", fontWeight: "700", fontSize: "18px" }}>★ 4.8</span>
        </div>

        <p style={{ color: "#717171", fontSize: "16px", margin: "0 0 16px" }}>
          📍 {listing.location}, {listing.country}
        </p>

        <p style={{ fontSize: "22px", fontWeight: "700", margin: "0 0 24px" }}>
          ₹{listing.price} <span style={{ fontWeight: "400", fontSize: "16px", color: "#717171" }}>/ night</span>
        </p>

        <hr style={{ border: "none", borderTop: "1px solid #ebebeb", margin: "24px 0" }} />

        <p style={{ fontSize: "16px", lineHeight: "1.7", color: "#333" }}>
          {listing.description}
        </p>

        <hr style={{ border: "none", borderTop: "1px solid #ebebeb", margin: "24px 0" }} />

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => navigate(`/listings/${id}/edit`)}
            style={{
              padding: "12px 28px", borderRadius: "8px",
              border: "2px solid #222", background: "white",
              cursor: "pointer", fontWeight: "600", fontSize: "15px"
            }}
          >
            ✏️ Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              padding: "12px 28px", borderRadius: "8px",
              border: "none", background: "#ff385c",
              color: "white", cursor: "pointer",
              fontWeight: "600", fontSize: "15px"
            }}
          >
            🗑️ Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default Show;