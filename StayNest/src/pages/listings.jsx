import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3030/listings")
      .then((res) => { setListings(res.data); setLoading(false); })
      .catch((err) => { console.log(err); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ textAlign: "center", padding: "80px", fontSize: "18px", color: "#888" }}>
      Loading listings...
    </div>
  );

  return (
    <div style={{ padding: "32px 40px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "28px", marginBottom: "8px" }}>Explore Stays</h1>
      <p style={{ color: "#888", marginBottom: "32px" }}>
        {listings.length} listings available
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "28px"
      }}>
        {listings.map((listing) => {
          const imageUrl = listing.image?.url || "https://placehold.co/800x600?text=No+Image";

          return (
            <div
              key={listing._id}
              onClick={() => navigate(`/listings/${listing._id}`)}
              style={{
                borderRadius: "16px", overflow: "hidden",
                cursor: "pointer", background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-6px)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
              }}
            >
              <div style={{ position: "relative", overflow: "hidden" }}>
                <img
                  src={imageUrl}
                  alt={listing.title}
                  style={{
                    width: "100%", height: "220px",
                    objectFit: "cover",
                    transition: "transform 0.4s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  onError={(e) => { e.target.src = "https://placehold.co/800x600?text=No+Image"; }}
                />
                <div style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: "white", borderRadius: "50%",
                  padding: "6px", cursor: "pointer", fontSize: "18px"
                }}>♡</div>
              </div>

              <div style={{ padding: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "600" }}>
                    {listing.title}
                  </h3>
                  <span style={{ color: "#ff385c", fontWeight: "700", fontSize: "15px" }}>
                    ★ 4.8
                  </span>
                </div>
                <p style={{ color: "#717171", fontSize: "14px", margin: "0 0 10px" }}>
                  {listing.location}, {listing.country}
                </p>
                <p style={{ margin: 0 }}>
                  <span style={{ fontWeight: "700", fontSize: "15px" }}>
                    ₹{listing.price}
                  </span>
                  <span style={{ color: "#717171", fontSize: "14px" }}> / night</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Listings;