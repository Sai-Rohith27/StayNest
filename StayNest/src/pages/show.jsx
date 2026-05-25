import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./Show.css";
import { formatPrice, getListingGallery, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";
import { buildListingReviewData, createStoredReview, createSubmittedReview, mergeReviewData } from "../utils/reviewUi";
import {
  reviewTouchedDefaults,
  validateReviewField,
  validateReviewForm,
} from "../utils/reviewFormValidation";
import { isLoginRequiredError, showLoginRequired } from "../utils/authUi";
import { readImageFiles } from "../utils/imageUpload";
import Map from "../components/map";

function StarRating({ rating, className = "" }) {
  const filledStars = Math.max(0, Math.min(5, Math.round(rating)));
  const emptyStars = 5 - filledStars;

  return (
    <span
      className={`show-review-stars ${className}`.trim()}
      aria-label={`${rating} out of 5 stars`}
      title={`${rating} out of 5 stars`}
    >
      <span>{"★".repeat(filledStars)}</span>
      <span className="show-review-stars-empty">{"☆".repeat(emptyStars)}</span>
    </span>
  );
}

function ReviewStarInput({ value, onChange }) {
  return (
    <div className="show-review-star-input" aria-label="Choose a rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          className={star <= value ? "active" : ""}
          key={star}
          type="button"
          onClick={() => onChange(star)}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

function Show() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [submittedReviews, setSubmittedReviews] = useState([]);
  const [hiddenReviewIds, setHiddenReviewIds] = useState([]);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
    photos: "",
  });
  const [uploadedReviewPhotos, setUploadedReviewPhotos] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState("");
  const [reviewTouched, setReviewTouched] = useState(reviewTouchedDefaults);
  const [reviewErrors, setReviewErrors] = useState({});
  const [reviewMessage, setReviewMessage] = useState("");

  // --- MAP STATES ---
  const [coordinates, setCoordinates] = useState(null);
  const [mapLoading, setMapLoading] = useState(true);

  const getReviewPhotoLinkValues = (value) =>
    String(value)
      .split(/\n|,/)
      .map((url) => url.trim())
      .filter(Boolean);

  // FETCH LISTING
  useEffect(() => {
    axios.get(`http://localhost:3030/listings/${id}`)
      .then((res) => {
        setListing(res.data);
        setSubmittedReviews(
          Array.isArray(res.data.reviews)
            ? res.data.reviews.map((review) => createStoredReview(review))
            : []
        );
        setHiddenReviewIds([]);
        setError("");
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setError("Unable to load this listing right now.");
        setLoading(false);
      });
  }, [id]);

  // FETCH CURRENT USER
  useEffect(() => {
    axios.get("http://localhost:3030/me", { withCredentials: true })
      .then((res) => {
        setCurrentUser({
          username: res.data.user,
          id: res.data.userId,
        });
      })
      .catch(() => {
        setCurrentUser(null);
      });
  }, []);

  // --- GEOCODING ALGORITHM FOR MAP ---
  useEffect(() => {
    const storedLat = Number(listing?.coordinates?.lat);
    const storedLng = Number(listing?.coordinates?.lng);

    if (Number.isFinite(storedLat) && Number.isFinite(storedLng)) {
      setCoordinates([storedLat, storedLng]);
      setMapLoading(false);
      return;
    }

    if (listing?._id && listing?.location) {
      const geocodeAndStoreCoordinates = async () => {
        setMapLoading(true);
        const searchQuery = `${listing.location}, ${listing.country || ""}`;

        try {
          const res = await axios.get("https://nominatim.openstreetmap.org/search", {
            params: {
              format: "json",
              limit: 1,
              q: searchQuery,
            },
          });

          if (res.data && res.data.length > 0) {
            const nextCoordinates = [
              parseFloat(res.data[0].lat),
              parseFloat(res.data[0].lon),
            ];
            setCoordinates(nextCoordinates);

            const savedListing = await axios.patch(
              `http://localhost:3030/listings/${listing._id}/coordinates`,
              { lat: nextCoordinates[0], lng: nextCoordinates[1] }
            );
            setListing(savedListing.data);
          } else {
            setCoordinates([20.5937, 78.9629]); // Fallback map location
          }
        } catch (err) {
          console.error("Geocoding error:", err);
          setCoordinates([20.5937, 78.9629]);
        } finally {
          setMapLoading(false);
        }
      };

      geocodeAndStoreCoordinates();
    }
  }, [listing?._id, listing?.location, listing?.country, listing?.coordinates?.lat, listing?.coordinates?.lng]);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }
    try {
      setIsDeleting(true);
      await axios.delete(`http://localhost:3030/listings/${id}`, {
        withCredentials: true,
      });
      toast.success("Listing deleted successfully.");
      navigate("/listings");
    } catch (err) {
      console.log(err);
      if (isLoginRequiredError(err)) {
        showLoginRequired(navigate, "Please login first to delete this listing.");
        setError("Please login first to delete this listing.");
        setIsDeleting(false);
        return;
      }

      if (err.response?.status === 403) {
        const message = err.response?.data?.error || "You are not allowed to delete this listing.";
        toast.error(message);
        setError(message);
        setIsDeleting(false);
        return;
      }

      const message = err.response?.data?.error || "Unable to delete this listing right now.";
      toast.error(message);
      setError(message);
      setIsDeleting(false);
    }
  };

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const uploadedPhotoUrls = uploadedReviewPhotos.map((photo) => photo.url);
    const linkedPhotoUrls = getReviewPhotoLinkValues(reviewForm.photos);
    const nextErrors = validateReviewForm({
      ...reviewForm,
      photos: [
        ...uploadedPhotoUrls,
        ...linkedPhotoUrls,
      ],
    });

    setReviewTouched({
      rating: true,
      comment: true,
      photos: true,
    });
    setReviewErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the highlighted review fields.");
      setReviewMessage("Please fix the highlighted review fields.");
      return;
    }

    setIsSubmittingReview(true);

    try {
      const reviewPayload = new FormData();
      reviewPayload.append("rating", reviewForm.rating);
      reviewPayload.append("comment", reviewForm.comment.trim());
      uploadedReviewPhotos.forEach((photo) => {
        reviewPayload.append("photos", photo.file);
      });
      linkedPhotoUrls.slice(0, Math.max(0, 4 - uploadedReviewPhotos.length)).forEach((photoUrl) => {
        reviewPayload.append("photoUrls", photoUrl);
      });

      const { data: savedReview } = await axios.post(
        `http://localhost:3030/listings/${id}/reviews`,
        reviewPayload,
        { withCredentials: true }
      );

      const newReview = createSubmittedReview({
        id: savedReview._id,
        rating: savedReview.rating,
        comment: savedReview.comment,
        photoUrls: savedReview.photoUrls || [],
        author: savedReview.author?.username || currentUser?.username || "You",
        authorId: savedReview.author?._id || currentUser?.id || "",
      });

      setSubmittedReviews((currentReviews) => [newReview, ...currentReviews]);
      setReviewForm({ rating: 5, comment: "", photos: "" });
      setUploadedReviewPhotos([]);
      setReviewTouched(reviewTouchedDefaults);
      setReviewErrors({});
      toast.success("Review submitted successfully.");
      setReviewMessage("Your review has been saved.");
    } catch (err) {
      console.log(err);
      if (isLoginRequiredError(err)) {
        showLoginRequired(navigate, "Please login first to write a review.");
        setReviewMessage("Please login first to write a review.");
        return;
      }

      const message = err.response?.data?.error || "Unable to save your review right now.";
      toast.error(message);
      setReviewMessage(message);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleReviewDelete = async (review) => {
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    setDeletingReviewId(review.id);
    setReviewMessage("");

    try {
      if (review.isStored) {
        await axios.delete(`http://localhost:3030/listings/${id}/reviews/${review.id}`, {
          withCredentials: true,
        });
        setSubmittedReviews((currentReviews) =>
          currentReviews.filter((currentReview) => currentReview.id !== review.id)
        );
      } else {
        setHiddenReviewIds((currentIds) => [...currentIds, review.id]);
      }

      toast.success("Review deleted successfully.");
      setReviewMessage("Review deleted.");
    } catch (err) {
      console.log(err);
      if (isLoginRequiredError(err)) {
        showLoginRequired(navigate, "Please login first to delete a review.");
        setReviewMessage("Please login first to delete a review.");
        return;
      }

      const message = err.response?.data?.error || "Unable to delete this review right now.";
      toast.error(message);
      setReviewMessage(message);
    } finally {
      setDeletingReviewId("");
    }
  };

  const updateReviewField = (name, value) => {
    setReviewForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
    setReviewErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      const fieldValue = name === "photos"
        ? [...uploadedReviewPhotos.map((photo) => photo.url), ...getReviewPhotoLinkValues(value)]
        : value;
      const errorMessage = validateReviewField(name, fieldValue);

      if (errorMessage) {
        nextErrors[name] = errorMessage;
      } else {
        delete nextErrors[name];
      }

      return nextErrors;
    });
    setReviewMessage("");
  };

  const handleReviewPhotoUpload = async (event) => {
    const files = event.target.files;

    if (!files?.length) {
      return;
    }

    try {
      const uploadedPhotos = await readImageFiles(files, 4);
      const photoLinks = getReviewPhotoLinkValues(reviewForm.photos);
      const availableSlots = Math.max(0, 4 - photoLinks.length);
      const nextPhotos = uploadedPhotos.slice(0, availableSlots);

      if (availableSlots === 0) {
        toast.error("Please keep reviews to 4 photos total.");
      } else if (uploadedPhotos.length > availableSlots) {
        toast.info(`Added ${availableSlots} photo${availableSlots === 1 ? "" : "s"} so the review stays within the 4 photo limit.`);
      }

      setUploadedReviewPhotos(nextPhotos);
      setReviewTouched((currentTouched) => ({ ...currentTouched, photos: true }));
      setReviewErrors((currentErrors) => {
        const nextErrors = { ...currentErrors };
        const combinedPhotos = [...nextPhotos.map((photo) => photo.url), ...photoLinks];
        const errorMessage = validateReviewField("photos", combinedPhotos);

        if (errorMessage) {
          nextErrors.photos = errorMessage;
        } else {
          delete nextErrors.photos;
        }

        return nextErrors;
      });
      setReviewMessage("");
    } catch (err) {
      const message = err.message || "Unable to upload these photos.";
      toast.error(message);
      setReviewErrors((currentErrors) => ({ ...currentErrors, photos: message }));
      setReviewTouched((currentTouched) => ({ ...currentTouched, photos: true }));
    }
  };

  const markReviewFieldTouched = (name) => {
    setReviewTouched((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
    setReviewErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      const fieldValue = name === "photos"
        ? [...uploadedReviewPhotos.map((photo) => photo.url), ...getReviewPhotoLinkValues(reviewForm[name])]
        : reviewForm[name];
      const errorMessage = validateReviewField(name, fieldValue);

      if (errorMessage) {
        nextErrors[name] = errorMessage;
      } else {
        delete nextErrors[name];
      }

      return nextErrors;
    });
  };

  if (loading) {
    return (
      <div className="show-page">
        <div className="show-state-card">Loading listings in the menu...</div>
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
  const galleryImages = getListingGallery(listing);
  const locationLabel = getListingLocation(listing);
  const hasCustomImage = imageUrl !== PLACEHOLDER_IMAGE;
  const ownerId = typeof listing.owner === "object" ? listing.owner?._id : listing.owner;
  const isListingOwner = Boolean(currentUser?.id && ownerId && currentUser.id === ownerId);
  const reviewData = mergeReviewData(
    buildListingReviewData(listing, id),
    submittedReviews,
    hiddenReviewIds
  );

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
          <div className="show-media-card show-gallery-card">
            <div className="show-gallery-grid">
              {galleryImages.map((photoUrl, photoIndex) => (
                <figure
                  className={`show-gallery-item show-gallery-item-${photoIndex + 1}`}
                  key={`${photoUrl}-${photoIndex}`}
                >
                  <img
                    src={photoUrl}
                    alt={`${listing.title} photo ${photoIndex + 1}`}
                    onError={(event) => {
                      event.target.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </figure>
              ))}
            </div>
            <div className="show-image-overlay">
              <span className="show-badge">StayNest pick</span>
              <p className="show-overlay-location">{locationLabel}</p>
            </div>
            <button className="show-gallery-button" type="button">
              Show all photos
            </button>
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
            {isListingOwner && (
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
            )}
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

        {/* --- THE NEW MAP SECTION --- */}
        <section className="show-panel" style={{ marginTop: "24px", marginBottom: "24px", padding: "34px" }}>
          <p className="show-panel-label">Neighborhood</p>
          <h2 className="show-panel-title">Where you'll be</h2>
          <p className="show-location" style={{ marginBottom: "24px", marginTop: "8px", fontSize: "1.05rem" }}>
            {locationLabel}
          </p>
          
          {mapLoading ? (
            <div style={{ height: "450px", background: "rgba(255, 241, 229, 0.4)", borderRadius: "24px", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-600)" }}>
              Loading neighborhood map...
            </div>
          ) : (
            <Map coordinates={coordinates} locationName={locationLabel} />
          )}
        </section>
        {/* -------------------------------- */}

        <section className="show-review-grid">
          <article className="show-panel show-review-panel">
            <div className="show-review-top-row">
              <div>
                <p className="show-panel-label">Guest feedback</p>
                <h2 className="show-panel-title">Reviews</h2>
              </div>

              <div className="show-review-top-score">
                <strong>{reviewData.averageRating.toFixed(1)}</strong>
                <StarRating rating={reviewData.averageRating} />
                <span>{reviewData.totalReviewsLabel}</span>
              </div>
            </div>

            <div className="show-review-summary">
              <div className="show-review-score-card">
                <strong className="show-review-score-value">
                  {reviewData.averageRating.toFixed(1)}
                </strong>
                <StarRating
                  rating={reviewData.averageRating}
                  className="large"
                />
                <span className="show-review-score-copy">
                  Guests consistently rate this stay highly for comfort, calm
                  pacing, and an easy arrival experience.
                </span>
              </div>

              <div className="show-review-bars">
                {reviewData.distribution.map((item) => (
                  <div className="show-review-bar-row" key={item.stars}>
                    <span className="show-review-bar-label">
                      {item.stars} star
                    </span>
                    <div className="show-review-bar-track">
                      <div
                        className="show-review-bar-fill"
                        style={{ width: item.barWidth }}
                      />
                    </div>
                    <span className="show-review-bar-count">
                      {item.countLabel}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="show-review-category-row">
              {reviewData.categories.map((category) => (
                <div className="show-review-category-chip" key={category.label}>
                  <strong>{category.score}</strong>
                  <span>{category.label}</span>
                </div>
              ))}
            </div>

            <form className="show-review-form" onSubmit={handleReviewSubmit}>
              <div className="show-review-form-head">
                <div>
                  <p className="show-panel-label">Share your stay</p>
                  <h3 className="show-review-form-title">Write a review</h3>
                </div>

                <ReviewStarInput
                  value={reviewForm.rating}
                  onChange={(rating) => {
                    updateReviewField("rating", rating);
                    setReviewTouched((currentTouched) => ({
                      ...currentTouched,
                      rating: true,
                    }));
                  }}
                />
              </div>
              {reviewTouched.rating && reviewErrors.rating && (
                <p className="show-review-field-error">{reviewErrors.rating}</p>
              )}

              <label className="show-review-field">
                <span>Your comment</span>
                <textarea
                  value={reviewForm.comment}
                  onChange={(event) => {
                    updateReviewField("comment", event.target.value);
                  }}
                  onBlur={() => markReviewFieldTouched("comment")}
                  placeholder="Tell future guests what made this stay memorable."
                  rows="4"
                  aria-invalid={Boolean(reviewTouched.comment && reviewErrors.comment)}
                />
                {reviewTouched.comment && reviewErrors.comment && (
                  <p className="show-review-field-error">{reviewErrors.comment}</p>
                )}
              </label>

              <label className="show-review-field">
                <span>Upload photos</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleReviewPhotoUpload}
                  aria-invalid={Boolean(reviewTouched.photos && reviewErrors.photos)}
                />
              </label>

              {uploadedReviewPhotos.length > 0 && (
                <div className="show-review-upload-preview">
                  {uploadedReviewPhotos.map((photo, photoIndex) => (
                    <figure className="show-review-thumb small" key={`${photo.name}-${photoIndex}`}>
                      <img
                        src={photo.url}
                        alt={`Uploaded review photo ${photoIndex + 1}`}
                        onError={(event) => {
                          event.target.src = PLACEHOLDER_IMAGE;
                        }}
                      />
                      <figcaption>{photo.name || `Photo ${photoIndex + 1}`}</figcaption>
                    </figure>
                  ))}
                </div>
              )}

              <label className="show-review-field">
                <span>Photo links</span>
                <input
                  type="text"
                  value={reviewForm.photos}
                  onChange={(event) => {
                    updateReviewField("photos", event.target.value);
                  }}
                  onBlur={() => markReviewFieldTouched("photos")}
                  placeholder="Paste image URLs, separated by commas"
                  aria-invalid={Boolean(reviewTouched.photos && reviewErrors.photos)}
                />
                {reviewTouched.photos && reviewErrors.photos && (
                  <p className="show-review-field-error">{reviewErrors.photos}</p>
                )}
              </label>

              <div className="show-review-form-actions">
                <button
                  className="show-action-button primary"
                  type="submit"
                  disabled={isSubmittingReview}
                >
                  {isSubmittingReview ? "Submitting..." : "Submit review"}
                </button>
                {reviewMessage && (
                  <span className="show-review-form-message">{reviewMessage}</span>
                )}
              </div>
            </form>

            <div className="show-review-list">
              {reviewData.reviews.map((review) => (
                <article className="show-review-card" key={review.id}>
                  <div className="show-review-card-head">
                    <div className="show-review-author">
                      <span className="show-review-avatar">
                        {review.initials}
                      </span>
                      <div className="show-review-author-meta">
                        <strong>{review.author}</strong>
                        <span>{review.timeAgo}</span>
                      </div>
                    </div>

                    <div className="show-review-rating-box">
                      <strong>{review.rating.toFixed(1)}</strong>
                      <StarRating rating={review.rating} />
                      {review.isStored && currentUser?.id === review.authorId && (
                        <button
                          className="show-review-delete-button"
                          type="button"
                          onClick={() => handleReviewDelete(review)}
                          disabled={deletingReviewId === review.id}
                        >
                          {deletingReviewId === review.id ? "Deleting..." : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="show-review-body">{review.comment}</p>

                  {review.photoLabels.length > 0 && (
                    <div className="show-review-photo-row">
                      {review.photoLabels.map((label, photoIndex) => (
                        <figure className="show-review-thumb" key={label}>
                          <img
                            src={review.photoUrls?.[photoIndex] || galleryImages[photoIndex % galleryImages.length] || imageUrl}
                            alt={`${listing.title} ${label}`}
                            onError={(event) => {
                              event.target.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                          <figcaption>{label}</figcaption>
                        </figure>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </article>

          <aside className="show-panel show-review-aside">
            <p className="show-panel-label">Review snapshot</p>
            <h2 className="show-panel-title">What guests noticed</h2>

            <div className="show-review-aside-score">
              <strong>{reviewData.averageRating.toFixed(1)}</strong>
              <div className="show-review-aside-stars">
                <StarRating rating={reviewData.averageRating} />
                <span>{reviewData.totalReviewsLabel}</span>
              </div>
            </div>

            <div className="show-review-bars compact">
              {reviewData.distribution.map((item) => (
                <div className="show-review-bar-row compact" key={item.stars}>
                  <span className="show-review-bar-label">{item.stars}</span>
                  <div className="show-review-bar-track">
                    <div
                      className="show-review-bar-fill"
                      style={{ width: item.barWidth }}
                    />
                  </div>
                  <span className="show-review-bar-count">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>

            <div className="show-review-aside-categories">
              {reviewData.categories.map((category) => (
                <div className="show-review-aside-category" key={category.label}>
                  <strong>{category.score}</strong>
                  <span>{category.label}</span>
                </div>
              ))}
            </div>

            <article className="show-review-spotlight">
              <div className="show-review-card-head">
                <div className="show-review-author">
                  <span className="show-review-avatar">
                    {reviewData.spotlight.initials}
                  </span>
                  <div className="show-review-author-meta">
                    <strong>{reviewData.spotlight.author}</strong>
                    <span>{reviewData.spotlight.timeAgo}</span>
                  </div>
                </div>

                <div className="show-review-rating-box">
                  <strong>{reviewData.spotlight.rating.toFixed(1)}</strong>
                  <StarRating rating={reviewData.spotlight.rating} />
                </div>
              </div>

              <p className="show-review-body">{reviewData.spotlight.comment}</p>

              <div className="show-review-photo-row compact">
                {reviewData.spotlight.photoLabels.slice(0, 4).map((label, photoIndex) => (
                  <figure className="show-review-thumb small" key={label}>
                    <img
                      src={reviewData.spotlight.photoUrls?.[photoIndex] || galleryImages[photoIndex % galleryImages.length] || imageUrl}
                      alt={`${listing.title} ${label}`}
                      onError={(event) => {
                        event.target.src = PLACEHOLDER_IMAGE;
                      }}
                    />
                    <figcaption>{label}</figcaption>
                  </figure>
                ))}
              </div>
            </article>
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
