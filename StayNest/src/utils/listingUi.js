const currencyFormatter = new Intl.NumberFormat("en-IN");

export const PLACEHOLDER_IMAGE = "https://placehold.co/1200x900?text=StayNest";

export function formatPrice(price) {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "Price on request";
  }

  return `₹${currencyFormatter.format(numericPrice)}`;
}

export function getListingImage(listing) {
  const imageUrl = String(listing?.image?.url ?? "").trim();
  return imageUrl || PLACEHOLDER_IMAGE;
}

export function getListingLocation(listing) {
  const parts = [listing?.location, listing?.country]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Location coming soon";
}
