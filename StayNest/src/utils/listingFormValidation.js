export const touchedDefaults = {
  title: false,
  price: false,
  location: false,
  country: false,
  image: false,
  description: false,
};

const fieldLabels = {
  title: "Title",
  price: "Price per night",
  location: "Location",
  country: "Country",
  image: "Listing image",
  description: "Description",
};

export function getFieldValue(formData, name) {
  if (name === "image") {
    return formData.image.url;
  }

  return formData[name];
}

export function validateField(name, value) {
  const trimmedValue = String(value).trim();

  if (!trimmedValue) {
    return `Please fill the ${fieldLabels[name]} field.`;
  }

  if (name === "price" && (Number(trimmedValue) <= 0 || Number.isNaN(Number(trimmedValue)))) {
    return "Please enter a valid price greater than 0.";
  }

  if (name === "image") {
    if (trimmedValue.startsWith("data:image/")) {
      return "";
    }

    try {
      new URL(trimmedValue);
    } catch {
      return "Please upload an image or enter a valid image URL.";
    }
  }

  return "";
}

export function validateForm(formData) {
  const nextErrors = {};

  Object.keys(touchedDefaults).forEach((fieldName) => {
    const errorMessage = validateField(fieldName, getFieldValue(formData, fieldName));

    if (errorMessage) {
      nextErrors[fieldName] = errorMessage;
    }
  });

  return nextErrors;
}
