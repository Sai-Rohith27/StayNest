import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "./Show.css";
import { formatPrice, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";
import { buildListingReviewData, createStoredReview, createSubmittedReview, mergeReviewData } from "../utils/reviewUi";
import {
  getReviewPhotoUrls,
  reviewTouchedDefaults,
  validateReviewField,
  validateReviewForm,
} from "../utils/reviewFormValidation";

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
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [deletingReviewId, setDeletingReviewId] = useState("");
  const [reviewTouched, setReviewTouched] = useState(reviewTouchedDefaults);
  const [reviewErrors, setReviewErrors] = useState({});
  const [reviewMessage, setReviewMessage] = useState("");

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

  const handleReviewSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = validateReviewForm(reviewForm);

    setReviewTouched({
      rating: true,
      comment: true,
      photos: true,
    });
    setReviewErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setReviewMessage("Please fix the highlighted review fields.");
      return;
    }

    const photoUrls = getReviewPhotoUrls(reviewForm.photos);
    setIsSubmittingReview(true);

    try {
      const { data: savedReview } = await axios.post(
        `http://localhost:3030/listings/${id}/reviews`,
        {
          rating: reviewForm.rating,
          comment: reviewForm.comment.trim(),
          photoUrls,
        }
      );

      const newReview = createSubmittedReview({
        id: savedReview._id,
        rating: savedReview.rating,
        comment: savedReview.comment,
        photoUrls: savedReview.photoUrls || [],
      });

      setSubmittedReviews((currentReviews) => [newReview, ...currentReviews]);
      setReviewForm({ rating: 5, comment: "", photos: "" });
      setReviewTouched(reviewTouchedDefaults);
      setReviewErrors({});
      setReviewMessage("Your review has been saved.");
    } catch (err) {
      console.log(err);
      setReviewMessage(
        err.response?.data?.error || "Unable to save your review right now."
      );
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
        await axios.delete(`http://localhost:3030/listings/${id}/reviews/${review.id}`);
        setSubmittedReviews((currentReviews) =>
          currentReviews.filter((currentReview) => currentReview.id !== review.id)
        );
      } else {
        setHiddenReviewIds((currentIds) => [...currentIds, review.id]);
      }

      setReviewMessage("Review deleted.");
    } catch (err) {
      console.log(err);
      setReviewMessage(
        err.response?.data?.error || "Unable to delete this review right now."
      );
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
      const errorMessage = validateReviewField(name, value);

      if (errorMessage) {
        nextErrors[name] = errorMessage;
      } else {
        delete nextErrors[name];
      }

      return nextErrors;
    });
    setReviewMessage("");
  };

  const markReviewFieldTouched = (name) => {
    setReviewTouched((currentTouched) => ({
      ...currentTouched,
      [name]: true,
    }));
    setReviewErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      const errorMessage = validateReviewField(name, reviewForm[name]);

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
  const locationLabel = getListingLocation(listing);
  const hasCustomImage = imageUrl !== PLACEHOLDER_IMAGE;
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
                      <button
                        className="show-review-delete-button"
                        type="button"
                        onClick={() => handleReviewDelete(review)}
                        disabled={deletingReviewId === review.id}
                      >
                        {deletingReviewId === review.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </div>

                  <p className="show-review-body">{review.comment}</p>

                  {review.photoLabels.length > 0 && (
                    <div className="show-review-photo-row">
                      {review.photoLabels.map((label, photoIndex) => (
                        <figure className="show-review-thumb" key={label}>
                          <img
                            src={review.photoUrls?.[photoIndex] || imageUrl}
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
                      src={reviewData.spotlight.photoUrls?.[photoIndex] || imageUrl}
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
