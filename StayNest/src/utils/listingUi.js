const currencyFormatter = new Intl.NumberFormat("en-IN");

export const PLACEHOLDER_IMAGE = "https://placehold.co/1200x900?text=StayNest";

const GALLERY_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560185007-c5ca9d2c0862?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448075-bb485b067938?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1c24240f38?q=80&w=1400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1400&auto=format&fit=crop",
];

export function formatPrice(price) {
  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice)) {
    return "Price on request";
  }

  return `Rs. ${currencyFormatter.format(numericPrice)}`;
}

export function getListingImage(listing) {
  const imageUrl = String(listing?.image?.url ?? "").trim();
  return imageUrl || PLACEHOLDER_IMAGE;
}

function getImageUrl(value) {
  if (typeof value === "string") {
    return value.trim();
  }

  return String(value?.url ?? "").trim();
}

function getGallerySeed(listing) {
  return [listing?.title, listing?.location, listing?.country]
    .join("|")
    .split("")
    .reduce((sum, char) => sum + char.charCodeAt(0), 0);
}

export function getListingGallery(listing, targetCount = 5) {
  const providedImages = [
    listing?.image,
    ...(Array.isArray(listing?.images) ? listing.images : []),
    ...(Array.isArray(listing?.gallery) ? listing.gallery : []),
    ...(Array.isArray(listing?.photos) ? listing.photos : []),
  ]
    .map(getImageUrl)
    .filter(Boolean);

  const uniqueImages = [...new Set(providedImages)];
  const seed = getGallerySeed(listing);
  const fallbackImages = Array.from({ length: GALLERY_FALLBACK_IMAGES.length }, (_, index) =>
    GALLERY_FALLBACK_IMAGES[(seed + index * 3) % GALLERY_FALLBACK_IMAGES.length]
  );

  return [...new Set([...uniqueImages, ...fallbackImages])]
    .filter(Boolean)
    .slice(0, targetCount);
}

export function getListingLocation(listing) {
  const parts = [listing?.location, listing?.country]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : "Location coming soon";
}
