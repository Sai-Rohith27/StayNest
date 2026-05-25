import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import "./Dashboard.css";
import { formatPrice, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";

export default function Wishlist() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWishlist = () => {
    axios.get("http://localhost:3030/wishlist", { withCredentials: true })
      .then((res) => setListings(Array.isArray(res.data) ? res.data : []))
      .catch(() => toast.error("Unable to load wishlist."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const removeSaved = async (listingId) => {
    try {
      await axios.post(`http://localhost:3030/wishlist/${listingId}`, {}, { withCredentials: true });
      toast.success("Removed from wishlist.");
      loadWishlist();
    } catch {
      toast.error("Unable to update wishlist.");
    }
  };

  return (
    <main className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Saved</p>
          <h1 className="dashboard-title">Wishlist</h1>
          <p className="dashboard-subtitle">Homes you saved for later.</p>
        </div>
        <Link className="dashboard-button primary" to="/listings">Browse stays</Link>
      </header>

      {loading && <div className="dashboard-state">Loading wishlist...</div>}
      {!loading && listings.length === 0 && <div className="dashboard-state">No saved stays yet.</div>}

      <section className="dashboard-grid">
        {listings.map((listing) => (
          <article className="dashboard-card" key={listing._id}>
            <div className="dashboard-card-media">
              <img
                src={getListingImage(listing)}
                alt={listing.title}
                onError={(event) => {
                  event.target.src = PLACEHOLDER_IMAGE;
                }}
              />
            </div>
            <div className="dashboard-card-body">
              <h3>{listing.title}</h3>
              <p>{getListingLocation(listing)}</p>
              <div className="dashboard-card-meta">
                <strong>{formatPrice(listing.price)}</strong>
                <span className="dashboard-status">saved</span>
              </div>
              <div className="dashboard-actions">
                <Link className="dashboard-button" to={`/listings/${listing._id}`}>View stay</Link>
                <button className="dashboard-button danger" type="button" onClick={() => removeSaved(listing._id)}>
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
