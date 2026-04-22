import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Show.css";
import { formatPrice, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";

function Show() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3030/listings/${id}`)
      .then((res) => {
        setListing(res.data);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError("Unable to load this listing right now.");
        setLoading(false);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:3030/listings/${id}`);
      navigate("/listings");
    } catch (err) {
      console.log(err);
      setError("Unable to delete this listing right now.");
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="show-page">
        <div className="show-state-card">Loading listing...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="show-page">
        <div className="show-state-card">{error || "Listing not found."}</div>
      </div>
    );
  }

  const imageUrl = getListingImage(listing);
  const locationLabel = getListingLocation(listing);
  const hasCustomImage = imageUrl !== PLACEHOLDER_IMAGE;

  return (
    <div className="show-page">
      <div className="show-shell">
        <button
          onClick={() => navigate("/listings")}
          className="show-back-button"
          type="button"
        >
          ← Back to listings
        </button>

        {error && <div className="show-alert">{error}</div>}

        <section className="show-hero">
          <div className="show-media-card">
            <img
              src={imageUrl}
              alt={listing.title}
              className="show-image"
              onError={(event) => {
                event.target.src = PLACEHOLDER_IMAGE;
              }}
            />
            <div className="show-image-overlay">
              <span className="show-badge">StayNest pick</span>
              <p className="show-overlay-location">{locationLabel}</p>
            </div>
          </div>

          <aside className="show-summary-card">
            <p className="show-summary-kicker">Listing overview</p>
            <h1 className="show-title">{listing.title}</h1>
            <p className="show-location">{locationLabel}</p>

            <div className="show-price-row">
              <strong>{formatPrice(listing.price)}</strong>
              <span>per night</span>
            </div>

            <p className="show-summary-copy">
              The detail page now keeps the main information in one clear panel so the title, price, and actions are easier to scan at a glance.
            </p>

            <div className="show-summary-grid">
              <div className="show-summary-stat">
                <span>Country</span>
                <strong>{listing.country || "Not set"}</strong>
              </div>
              <div className="show-summary-stat">
                <span>Location</span>
                <strong>{listing.location || "Not set"}</strong>
              </div>
              <div className="show-summary-stat">
                <span>Image</span>
                <strong>{hasCustomImage ? "Host provided" : "Placeholder"}</strong>
              </div>
              <div className="show-summary-stat">
                <span>Status</span>
                <strong>Ready to edit</strong>
              </div>
            </div>

            <div className="show-action-row">
              <button
                onClick={() => navigate(`/listings/${id}/edit`)}
                className="show-action-button secondary"
                type="button"
              >
                Edit listing
              </button>
              <button
                onClick={handleDelete}
                className="show-action-button danger"
                type="button"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete listing"}
              </button>
            </div>
          </aside>
        </section>

        <section className="show-content-grid">
          <article className="show-panel">
            <p className="show-panel-label">About this stay</p>
            <h2 className="show-panel-title">Description</h2>
            <p className="show-description">
              {String(listing.description ?? "").trim() || "No description has been added for this listing yet."}
            </p>
          </article>

          <aside className="show-panel">
            <p className="show-panel-label">Quick details</p>
            <h2 className="show-panel-title">At a glance</h2>
            <div className="show-details-list">
              <div className="show-details-item">
                <span>Nightly price</span>
                <strong>{formatPrice(listing.price)}</strong>
              </div>
              <div className="show-details-item">
                <span>Location</span>
                <strong>{locationLabel}</strong>
              </div>
              <div className="show-details-item">
                <span>Listing id</span>
                <strong>#{String(id).slice(-6).toUpperCase()}</strong>
              </div>
            </div>
          </aside>
        </section>

        <div className="show-bottom-row">
          <button
            onClick={() => navigate("/listings")}
            className="show-action-button primary"
            type="button"
          >
            Browse more stays
          </button>
        </div>
      </div>
    </div>
  );
}

export default Show;
