import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Listings.css";
import { formatPrice, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";

const getDescriptionPreview = (description) => {
  const trimmedDescription = String(description ?? "").trim();

  if (!trimmedDescription) {
    return "A warm, comfortable stay with better spacing, cleaner visuals, and room to settle in.";
  }

  return trimmedDescription.length > 105
    ? `${trimmedDescription.slice(0, 102)}...`
    : trimmedDescription;
};

function Listings() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3030/listings")
      .then((res) => {
        if (Array.isArray(res.data)) {
          setListings(res.data);
          setError("");
        } else {
          setListings([]);
          setError("Unexpected response from the server.");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setListings([]);
        setError("Unable to load listings. Make sure the backend is running on http://localhost:3030.");
        setLoading(false);
      });
  }, []);

  const listingCountLabel = listings.length === 1 ? "1 stay ready to explore" : `${listings.length} stays ready to explore`;

  if (loading) {
    return (
      <div className="listings-page">
        <div className="listings-state-card">Loading listings...</div>
      </div>
    );
  }

  return (
    <div className="listings-page">
      <section className="listings-hero">
        <div className="listings-intro">
          <p className="listings-eyebrow">Curated stays</p>
          <h1 className="listings-title">Find a place that feels calmer before you even book it.</h1>
          <p className="listings-subtitle">
            The listings view now uses a warmer background, cleaner cards, and more readable spacing so browsing feels intentional instead of crowded.
          </p>

          <div className="listings-chip-row">
            <span className="listings-chip">Editorial card layout</span>
            <span className="listings-chip">Softer glass background</span>
            <span className="listings-chip">Cleaner listing details</span>
          </div>
        </div>

        <aside className="listings-highlight">
          <div>
            <p className="listings-highlight-label">Available now</p>
            <strong className="listings-highlight-value">{listings.length}</strong>
            <p className="listings-highlight-copy">
              Every listing uses the same refreshed card style, so this page feels consistent from top to bottom.
            </p>
          </div>

          <div className="listings-status-row">
            <div className="listings-status-card">
              <span>Layout</span>
              <strong>Clean grid</strong>
            </div>
            <div className="listings-status-card">
              <span>Detail view</span>
              <strong>Upgraded</strong>
            </div>
          </div>
        </aside>
      </section>

      {error && <div className="listings-error">{error}</div>}

      <div className="listings-section-bar">
        <div>
          <p className="listings-section-label">Browse stays</p>
          <h2 className="listings-section-title">{listingCountLabel}</h2>
        </div>
        <p className="listings-section-note">Tap any card to open its detail page.</p>
      </div>

      {!error && listings.length === 0 && (
        <div className="listings-state-card">
          No listings yet. Add your first stay and it will appear here in the new layout.
        </div>
      )}

      <div className="listings-grid">
        {listings.map((listing, index) => {
          const imageUrl = getListingImage(listing);
          const locationLabel = getListingLocation(listing);
          const badgeLabel = listing.country || (index % 2 === 0 ? "StayNest pick" : "Featured stay");

          return (
            <button
              key={listing._id}
              type="button"
              onClick={() => navigate(`/listings/${listing._id}`)}
              className="listing-card"
              aria-label={`Open ${listing.title}`}
            >
              <div className="listing-media">
                <img
                  src={imageUrl}
                  alt={listing.title}
                  className="listing-image"
                  onError={(event) => {
                    event.target.src = PLACEHOLDER_IMAGE;
                  }}
                />
                <span className="listing-badge">{badgeLabel}</span>
              </div>

              <div className="listing-card-body">
                <div className="listing-card-meta">
                  <p className="listing-location">{locationLabel}</p>
                  <span className="listing-card-status">Open now</span>
                </div>

                <h3 className="listing-card-title">{listing.title}</h3>
                <p className="listing-description">{getDescriptionPreview(listing.description)}</p>

                <div className="listing-card-footer">
                  <p className="listing-price">
                    <span className="listing-price-value">{formatPrice(listing.price)}</span> / night
                  </p>
                  <span className="listing-cta">View stay</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Listings;
