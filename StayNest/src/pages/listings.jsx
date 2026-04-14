import { useEffect, useState } from "react";
import axios from "axios";

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:3030/listings")
      .then((res) => {
        setListings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>All Listings</h1>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: "24px" 
      }}>
        {listings.map((listing) => {
          let imageUrl = "https://placehold.co/800x600?text=No+Image";

          if (listing.image && typeof listing.image === 'object' && listing.image.url) {
            imageUrl = listing.image.url;
          } else if (typeof listing.image === 'string') {
            imageUrl = listing.image;
          }

          return (
            <div 
              key={listing._id}
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                cursor: "pointer",
                transition: "all 0.35s ease",
                background: "#fff",
                boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
                position: "relative"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-8px) scale(1.03)";
                e.currentTarget.style.boxShadow = "0 20px 40px rgba(0,0,0,0.18)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0) scale(1)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.08)";
              }}
            >
              {/* Image container */}
              <div style={{ overflow: "hidden", position: "relative" }}>
                <img 
                  src={imageUrl} 
                  alt={listing.title}
                  style={{
                    width: "100%",
                    height: "220px",
                    objectFit: "cover",
                    transition: "transform 0.5s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.1)"}
                  onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                  onError={(e) => {
                    e.target.src = "https://placehold.co/800x600?text=Image+Error";
                  }}
                />

                {/* Gradient overlay on hover */}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    background: "linear-gradient(to top, rgba(0,0,0,0.5), transparent)",
                    opacity: 0,
                    transition: "opacity 0.3s ease"
                  }}
                  className="overlay"
                />
              </div>

              {/* Content */}
              <div style={{ padding: "14px" }}>
                <h3 style={{ margin: "6px 0" }}>{listing.title}</h3>
                <p style={{ color: "#555", fontSize: "14px" }}>
                  {listing.location}, {listing.country}
                </p>
                <p style={{ 
                  fontWeight: "bold", 
                  color: "#ff385c", 
                  marginTop: "8px",
                  fontSize: "16px"
                }}>
                  ₹{listing.price} / night
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
