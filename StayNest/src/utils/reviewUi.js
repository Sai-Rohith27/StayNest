const reviewerPool = [
  "Aarav Mehta",
  "Ira Sharma",
  "Kabir Nair",
  "Anaya Das",
  "Rohan Kapoor",
  "Meera Joshi",
  "Vihaan Sethi",
  "Tara Bansal",
  "Arjun Malhotra",
  "Naina Verma",
];

const reviewTemplates = [
  (listing) =>
    `The stay felt exactly like the photos and the overall setup around ${listing.location} made the check-in experience easy from the first hour.`,
  (listing) =>
    `We booked ${listing.title} for a quiet reset and the space delivered on comfort, good flow, and a very relaxed evening atmosphere.`,
  (listing) =>
    `The room details were thoughtfully handled and the location in ${listing.country} made it simple to plan the rest of the trip without extra stress.`,
  () =>
    `Everything felt polished, from the first impression to the final morning. It is the kind of listing that makes a short stay feel longer in the best way.`,
  () =>
    `The place balanced value and comfort really well. The host-side setup felt clear, the stay was smooth, and the overall vibe stayed warm throughout.`,
];

const photoLabelPool = [
  "Arrival",
  "Living space",
  "Breakfast spot",
  "Evening light",
  "Balcony",
  "View",
  "Details",
  "Corner seat",
];

const timePool = [
  "5 days ago",
  "2 weeks ago",
  "3 weeks ago",
  "1 month ago",
  "2 months ago",
];

const countFormatter = new Intl.NumberFormat("en-IN");

function hashString(value) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }

  return hash;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function buildRatingCounts(totalReviews, seed) {
  const rawWeights = [
    0.48 + ((seed % 14) / 100),
    0.24 + (((seed >> 2) % 8) / 100),
    0.13 + (((seed >> 4) % 5) / 100),
    0.08 + (((seed >> 6) % 4) / 100),
    0.04 + (((seed >> 8) % 3) / 100),
  ];

  const totalWeight = rawWeights.reduce((sum, weight) => sum + weight, 0);
  const normalizedWeights = rawWeights.map((weight) => weight / totalWeight);
  const counts = normalizedWeights.map((weight) => Math.round(totalReviews * weight));

  const countedReviews = counts.reduce((sum, count) => sum + count, 0);
  const difference = totalReviews - countedReviews;

  counts[0] += difference;

  return [
    { stars: 5, count: counts[0] },
    { stars: 4, count: counts[1] },
    { stars: 3, count: counts[2] },
    { stars: 2, count: counts[3] },
    { stars: 1, count: counts[4] },
  ];
}

function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function buildDistributionFromReviews(reviews) {
  const counts = [5, 4, 3, 2, 1].map((stars) => ({
    stars,
    count: reviews.filter((review) => Math.round(review.rating) === stars).length,
  }));
  const maxCount = Math.max(...counts.map((item) => item.count), 1);

  return counts.map((item) => ({
    ...item,
    barWidth: `${Math.max((item.count / maxCount) * 100, item.count > 0 ? 8 : 0)}%`,
    countLabel: `${countFormatter.format(item.count)} reviews`,
  }));
}

function buildCategoriesFromRating(averageRating) {
  return [
    { label: "Cleanliness", score: clamp(averageRating + 0.4, 4.1, 5).toFixed(1) },
    { label: "Hospitality", score: clamp(averageRating + 0.2, 4, 5).toFixed(1) },
    { label: "Comfort", score: clamp(averageRating + 0.1, 4, 5).toFixed(1) },
    { label: "Location", score: clamp(averageRating - 0.2, 3.8, 4.9).toFixed(1) },
    { label: "Value", score: clamp(averageRating - 0.1, 3.9, 4.9).toFixed(1) },
  ];
}

export function buildListingReviewData(listing, listingId) {
  const seedSource = [
    listingId,
    listing?.title ?? "",
    listing?.location ?? "",
    listing?.country ?? "",
  ].join("|");
  const seed = hashString(seedSource);

  const totalReviews = 96 + (seed % 182);
  const distribution = buildRatingCounts(totalReviews, seed);
  const maxCount = distribution[0]?.count ?? 1;
  const weightedTotal = distribution.reduce(
    (sum, item) => sum + item.stars * item.count,
    0
  );
  const averageRating = Number((weightedTotal / totalReviews).toFixed(1));

  const categories = buildCategoriesFromRating(averageRating);

  const reviews = Array.from({ length: 3 }, (_, index) => {
    const author = reviewerPool[(seed + index * 3) % reviewerPool.length];
    const reviewTemplate =
      reviewTemplates[(seed + index * 5) % reviewTemplates.length];
    const rating = Number(
      clamp(averageRating + 0.35 - index * 0.2, 4, 5).toFixed(1)
    );

    return {
      id: `${listingId}-review-${index + 1}`,
      author,
      initials: getInitials(author),
      timeAgo: timePool[(seed + index * 2) % timePool.length],
      rating,
      comment: reviewTemplate(listing),
      isStored: false,
      photoUrls: [],
      photoLabels:
        index === 0
          ? photoLabelPool.slice((seed + index) % 3, ((seed + index) % 3) + 4)
          : [],
    };
  });

  return {
    averageRating,
    totalReviews,
    totalReviewsLabel: `${countFormatter.format(totalReviews)} ratings`,
    distribution: distribution.map((item) => ({
      ...item,
      barWidth: `${Math.max((item.count / maxCount) * 100, 8)}%`,
      countLabel: `${countFormatter.format(item.count)} reviews`,
    })),
    categories,
    reviews,
    spotlight: reviews[0],
  };
}

export function createSubmittedReview({ id, rating, comment, photoUrls, author, authorId }) {
  const displayAuthor = author || "You";

  return {
    id: id || `submitted-review-${Date.now()}`,
    author: displayAuthor,
    authorId,
    initials: getInitials(displayAuthor),
    timeAgo: "Just now",
    rating: Number(rating),
    comment: comment.trim(),
    isStored: Boolean(id),
    photoUrls,
    photoLabels: photoUrls.map((_, index) => `Photo ${index + 1}`),
  };
}

export function createStoredReview(review) {
  const photoUrls = Array.isArray(review?.photoUrls) ? review.photoUrls : [];
  const createdDate = review?.createdAt ? new Date(review.createdAt) : null;
  const author = typeof review?.author === "object" ? review.author : null;
  const authorName = author?.username || "Guest";
  const authorId = author?._id || review?.author || "";

  return {
    id: review?._id || `stored-review-${Date.now()}`,
    author: authorName,
    authorId,
    initials: getInitials(authorName),
    timeAgo: createdDate && !Number.isNaN(createdDate.getTime())
      ? createdDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Saved review",
    rating: Number(review?.rating || 5),
    comment: String(review?.comment || "").trim(),
    isStored: Boolean(review?._id),
    photoUrls,
    photoLabels: photoUrls.map((_, index) => `Photo ${index + 1}`),
  };
}

export function mergeReviewData(baseReviewData, submittedReviews, hiddenReviewIds = []) {
  const hiddenReviewIdSet = new Set(hiddenReviewIds);

  if (submittedReviews.length === 0 && hiddenReviewIds.length === 0) {
    return baseReviewData;
  }

  const reviews = [...submittedReviews, ...baseReviewData.reviews].filter(
    (review) => !hiddenReviewIdSet.has(review.id)
  );
  const visibleSubmittedReviews = submittedReviews.filter(
    (review) => !hiddenReviewIdSet.has(review.id)
  );
  const totalReviews = Math.max(
    reviews.length,
    baseReviewData.totalReviews + visibleSubmittedReviews.length - hiddenReviewIds.length
  );
  const submittedTotal = visibleSubmittedReviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );
  const baseTotal = baseReviewData.averageRating * baseReviewData.totalReviews;
  const averageRating = Number(((baseTotal + submittedTotal) / totalReviews).toFixed(1));

  return {
    ...baseReviewData,
    averageRating,
    totalReviews,
    totalReviewsLabel: `${countFormatter.format(totalReviews)} ratings`,
    distribution: buildDistributionFromReviews(reviews),
    categories: buildCategoriesFromRating(averageRating),
    reviews,
    spotlight: reviews[0] || baseReviewData.spotlight,
  };
}
