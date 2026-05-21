export const reviewTouchedDefaults = {
  rating: false,
  comment: false,
  photos: false,
};

const reviewFieldLabels = {
  rating: "Rating",
  comment: "Comment",
  photos: "Photos",
};

function getPhotoUrls(value) {
  if (Array.isArray(value)) {
    return value.map((url) => String(url).trim()).filter(Boolean);
  }

  return String(value)
    .split(/\n|,/)
    .map((url) => url.trim())
    .filter(Boolean);
}

export function getReviewFieldValue(formData, name) {
  return formData[name];
}

export function getReviewPhotoUrls(value) {
  return getPhotoUrls(value).slice(0, 4);
}

export function validateReviewField(name, value) {
  const trimmedValue = String(value).trim();

  if (name === "rating") {
    const rating = Number(value);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return "Please select a rating between 1 and 5 stars.";
    }

    return "";
  }

  if (name === "comment") {
    if (!trimmedValue) {
      return `Please fill the ${reviewFieldLabels[name]} field.`;
    }

    if (trimmedValue.length < 12) {
      return "Please write at least 12 characters for your review.";
    }

    if (trimmedValue.length > 500) {
      return "Please keep your review under 500 characters.";
    }

    return "";
  }

  if (name === "photos") {
    const photoUrls = getPhotoUrls(value);

    if (photoUrls.length > 4) {
      return "Please add up to 4 photo links only.";
    }

    for (const photoUrl of photoUrls) {
      if (photoUrl.startsWith("data:image/")) {
        continue;
      }

      try {
        new URL(photoUrl);
      } catch {
        return "Please upload photos or enter valid photo URLs separated by commas.";
      }
    }
  }

  return "";
}

export function validateReviewForm(formData) {
  const nextErrors = {};

  Object.keys(reviewTouchedDefaults).forEach((fieldName) => {
    const errorMessage = validateReviewField(
      fieldName,
      getReviewFieldValue(formData, fieldName)
    );

    if (errorMessage) {
      nextErrors[fieldName] = errorMessage;
    }
  });

  return nextErrors;
}
