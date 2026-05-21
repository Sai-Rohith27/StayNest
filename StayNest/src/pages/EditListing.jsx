import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "./ListingForm.css";
import { touchedDefaults, getFieldValue, validateField, validateForm } from "../utils/listingFormValidation";
import { formatPrice, getListingImage, getListingLocation, PLACEHOLDER_IMAGE } from "../utils/listingUi";
import { isLoginRequiredError, showLoginRequired } from "../utils/authUi";
import { readImageFile } from "../utils/imageUpload";
function EditListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    axios.get(`http://localhost:3030/listings/${id}`)
      .then((res) => {
        setFormData(res.data);
        setPageError("");
        setLoading(false);
      })
      .catch((err) => {
        console.log(err);
        setPageError("Unable to load this listing for editing.");
        setLoading(false);
      });
  }, [id]);

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

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    try {
      const uploadedImage = await readImageFile(file);
      const nextFormData = {
        ...formData,
        image: {
          url: uploadedImage.url,
          filename: uploadedImage.name || "listingimage",
        },
      };

      setFormData(nextFormData);
      setTouched((prevTouched) => ({ ...prevTouched, image: true }));
      setErrors((prevErrors) => ({ ...prevErrors, image: "" }));
      setSubmitError("");
    } catch (err) {
      const message = err.message || "Unable to upload this image.";
      toast.error(message);
      setErrors((prevErrors) => ({ ...prevErrors, image: message }));
      setTouched((prevTouched) => ({ ...prevTouched, image: true }));
    }
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
      toast.error("Please fix the required fields before saving.");
      return;
    }

    setShowFormAlert(false);
    setIsSubmitting(true);
    try {
      await axios.put(`http://localhost:3030/listings/${id}`, formData, {
        withCredentials: true,
      });
      toast.success("Listing updated successfully.");
      navigate(`/listings/${id}`);
    } catch (err) {
      console.log(err);
      if (isLoginRequiredError(err)) {
        showLoginRequired(navigate);
        setSubmitError("Please login first to edit this listing.");
        return;
      }

      if (err.response?.status === 403) {
        const message = err.response?.data?.error || "You are not allowed to edit this listing.";
        toast.error(message);
        setSubmitError(message);
        return;
      }

      const message = err.response?.data?.error || "Unable to save changes right now. Please try again.";
      toast.error(message);
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewTitle = String(formData.title ?? "").trim() || "Listing title";
  const previewDescription = String(formData.description ?? "").trim()
    || "Your updated description will appear here as you edit.";
  const previewPrice = String(formData.price ?? "").trim()
    ? formatPrice(formData.price)
    : "Add a price";
  const previewLocation = getListingLocation(formData);
  const previewImage = getListingImage(formData);

  if (loading) {
    return (
      <div className="listing-form-page">
        <div className="listing-form-shell">
          <div className="listing-form-state">Loading listing editor...</div>
        </div>
      </div>
    );
  }
  return (
    <div className="listing-form-page">
      <div className="listing-form-shell">
        <div className="listing-form-header">
          <button
            onClick={() => navigate(`/listings/${id}`)}
            className="listing-form-back"
            type="button"
          >
            ← Back to listing
          </button>
          <span className="listing-form-badge">Edit stay</span>
        </div>

        <div className="listing-form-grid">
          <section className="listing-form-panel">
            <p className="listing-form-kicker">Listing editor</p>
            <h1 className="listing-form-title">Refine the listing without the page feeling cramped.</h1>
            <p className="listing-form-copy">
              This editor now matches the refreshed listing and detail pages, so the full flow feels like one product instead of separate screens.
            </p>

            {pageError && <div className="listing-form-alert danger">{pageError}</div>}
            {showFormAlert && (
              <div className="listing-form-alert">
                Please fix the required fields before saving your changes.
              </div>
            )}
            {submitError && <div className="listing-form-alert danger">{submitError}</div>}

            <form onSubmit={handleSubmit} className="listing-form">
              {[
                { label: "Title", name: "title", type: "text" },
                { label: "Price per night (₹)", name: "price", type: "number" },
                { label: "Location", name: "location", type: "text" },
                { label: "Country", name: "country", type: "text" },
              ].map(({ label, name, type }) => (
                <label className="listing-field" key={name}>
                  <span className="listing-label">
                    {label} <span>*</span>
                  </span>
                  <input
                    name={name}
                    type={type}
                    value={name === "image" ? formData.image?.url || "" : formData[name] || ""}
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
                  Listing image <span>*</span>
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="listing-input listing-file-input"
                />
                <input
                  name="image"
                  type="text"
                  value={formData.image?.url || ""}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={`listing-input${errors.image && touched.image ? " has-error" : ""}`}
                  aria-invalid={Boolean(errors.image)}
                  aria-describedby="image-error"
                  placeholder="Or paste an image URL"
                />
                {errors.image && touched.image && (
                  <span id="image-error" className="listing-error-text">
                    {errors.image}
                  </span>
                )}
              </label>

              <label className="listing-field listing-field-full">
                <span className="listing-label">
                  Description <span>*</span>
                </span>
                <textarea
                  name="description"
                  rows={6}
                  value={formData.description || ""}
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

              <button type="submit" className="listing-submit-button" disabled={isSubmitting}>
                {isSubmitting ? "Saving changes..." : "Save changes"}
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
              <span className="listing-preview-pill">Updated preview</span>
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
                  <span>Editing mode</span>
                  <strong>Polished layout</strong>
                </div>
                <div className="listing-preview-meta-item">
                  <span>Flow status</span>
                  <strong>Consistent UI</strong>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
export default EditListing;
