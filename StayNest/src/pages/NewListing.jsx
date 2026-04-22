import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ListingForm.css";
import { touchedDefaults, getFieldValue, validateField, validateForm } from "../utils/listingFormValidation";
import { formatPrice, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";

function NewListing() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: { url: "", filename: "listingimage" },
    price: "",
    location: "",
    country: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState(touchedDefaults);
  const [showFormAlert, setShowFormAlert] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const nextFormData = name === "image"
      ? { ...formData, image: { url: value, filename: "listingimage" } }
      : { ...formData, [name]: value };

    setFormData(nextFormData);
    setSubmitError("");

    if (showFormAlert) {
      const nextErrors = validateForm(nextFormData);
      setErrors(nextErrors);
      setShowFormAlert(Object.keys(nextErrors).length > 0);
      return;
    }

    if (touched[name]) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        [name]: validateField(name, name === "image" ? value : nextFormData[name]),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    const fieldValue = getFieldValue(formData, name);

    setTouched((prevTouched) => ({ ...prevTouched, [name]: true }));
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: validateField(name, fieldValue),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm(formData);

    setErrors(nextErrors);
    setTouched({
      title: true,
      price: true,
      location: true,
      country: true,
      image: true,
      description: true,
    });

    if (Object.keys(nextErrors).length > 0) {
      setShowFormAlert(true);
      return;
    }

    setShowFormAlert(false);
    try {
      await axios.post("http://localhost:3030/listings", formData);
      navigate("/listings");
    } catch (err) {
      console.log(err);
      setSubmitError("Unable to create the listing right now. Please try again.");
    }
  };

  const previewTitle = String(formData.title ?? "").trim() || "Your next standout stay";
  const previewDescription = String(formData.description ?? "").trim()
    || "Write a short description and it will appear here as a live preview.";
  const previewPrice = String(formData.price ?? "").trim()
    ? formatPrice(formData.price)
    : "Add a price";
  const previewLocation = getListingLocation(formData);
  const previewImage = getListingImage(formData);

  return (
    <div className="listing-form-page">
      <div className="listing-form-shell">
        <div className="listing-form-header">
          <button
            onClick={() => navigate("/listings")}
            className="listing-form-back"
            type="button"
          >
            ← Back to listings
          </button>
          <span className="listing-form-badge">Create stay</span>
        </div>

        <div className="listing-form-grid">
          <section className="listing-form-panel">
            <p className="listing-form-kicker">Host dashboard</p>
            <h1 className="listing-form-title">Create a listing with a cleaner first impression.</h1>
            <p className="listing-form-copy">
              The form now has more breathing room, clearer validation, and a live preview so you can see the card style before you publish.
            </p>

            {showFormAlert && (
              <div className="listing-form-alert">
                Please fill all the required details before creating the listing.
              </div>
            )}

            {submitError && <div className="listing-form-alert danger">{submitError}</div>}

            <form onSubmit={handleSubmit} className="listing-form">
              {[
                { label: "Title", name: "title", type: "text" },
                { label: "Price per night (₹)", name: "price", type: "number" },
                { label: "Location", name: "location", type: "text" },
                { label: "Country", name: "country", type: "text" },
                { label: "Image URL", name: "image", type: "text" },
              ].map(({ label, name, type }) => (
                <label className="listing-field" key={name}>
                  <span className="listing-label">
                    {label} <span>*</span>
                  </span>
                  <input
                    name={name}
                    type={type}
                    value={name === "image" ? formData.image.url : formData[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className={`listing-input${errors[name] && touched[name] ? " has-error" : ""}`}
                    aria-invalid={Boolean(errors[name])}
                    aria-describedby={`${name}-error`}
                  />
                  {errors[name] && touched[name] && (
                    <span id={`${name}-error`} className="listing-error-text">
                      {errors[name]}
                    </span>
                  )}
                </label>
              ))}

              <label className="listing-field listing-field-full">
                <span className="listing-label">
                  Description <span>*</span>
                </span>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`listing-input listing-textarea${errors.description && touched.description ? " has-error" : ""}`}
                  aria-invalid={Boolean(errors.description)}
                  aria-describedby="description-error"
                />
                {errors.description && touched.description && (
                  <span id="description-error" className="listing-error-text">
                    {errors.description}
                  </span>
                )}
              </label>

              <button type="submit" className="listing-submit-button">
                Create listing
              </button>
            </form>
          </section>

          <aside className="listing-preview-card">
            <div className="listing-preview-media">
              <img
                src={previewImage}
                alt={previewTitle}
                className="listing-preview-image"
                onError={(event) => {
                  event.target.src = PLACEHOLDER_IMAGE;
                }}
              />
              <span className="listing-preview-pill">Live preview</span>
            </div>

            <div className="listing-preview-body">
              <p className="listing-preview-location">{previewLocation}</p>
              <h2 className="listing-preview-title">{previewTitle}</h2>
              <p className="listing-preview-price">
                {previewPrice} <span>/ night</span>
              </p>
              <p className="listing-preview-description">{previewDescription}</p>

              <div className="listing-preview-meta">
                <div className="listing-preview-meta-item">
                  <span>Style</span>
                  <strong>Warm editorial</strong>
                </div>
                <div className="listing-preview-meta-item">
                  <span>Card feel</span>
                  <strong>Cleaner spacing</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default NewListing;
