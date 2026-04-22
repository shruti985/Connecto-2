// src/services/placesService.js
// Uses Overpass API (OpenStreetMap) — 100% free, no API key required

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";

// NIT Kurukshetra coordinates
const BASE_LAT = 29.9457;
const BASE_LNG = 76.8181;

export const CATEGORY_QUERIES = {
  cafes: {
    tags: ['["amenity"="cafe"]', '["amenity"="coffee_shop"]'],
    radius: 5000,
    label: "Nearby Cafes",
    icon: "☕",
    description: "Best cafes near campus for study sessions",
    unsplashKeyword: "cafe coffee shop",
  },
  getaways: {
    tags: [
      '["tourism"="attraction"]',
      '["tourism"="viewpoint"]',
      '["historic"]',
    ],
    radius: 100000,
    label: "Weekend Getaways",
    icon: "⛰️",
    description: "Popular spots within 100km",
    unsplashKeyword: "travel nature scenic",
  },
  food: {
    tags: [
      '["amenity"="restaurant"]',
      '["amenity"="fast_food"]',
      '["amenity"="food_court"]',
    ],
    radius: 5000,
    label: "Food Spots",
    icon: "🍽️",
    description: "Must-try restaurants and street food",
    unsplashKeyword: "restaurant food indian",
  },
  campus: {
    tags: [
      '["tourism"="museum"]',
      '["amenity"="place_of_worship"]',
      '["tourism"="attraction"]',
      '["leisure"="park"]',
    ],
    radius: 10000,
    label: "Campus Places",
    icon: "📍",
    description: "Hidden gems around campus",
    unsplashKeyword: "temple park india landmark",
  },
};

// Unsplash random image — free, no API key needed
// Uses a seed based on place name so each place always gets the same image
function getUnsplashImage(placeName, keyword) {
  const seed = encodeURIComponent(placeName.toLowerCase().replace(/\s+/g, "-"));
  return `https://source.unsplash.com/400x220/?${encodeURIComponent(keyword)}&sig=${seed}`;
}

// Build Overpass QL query
function buildQuery(tags, lat, lng, radius) {
  const unions = tags.map(
    (tag) => `
    node${tag}(around:${radius},${lat},${lng});
    way${tag}(around:${radius},${lat},${lng});
  `,
  );
  return `
    [out:json][timeout:25];
    (
      ${unions.join("")}
    );
    out center 20;
  `;
}

export async function fetchPlaces(category) {
  const config = CATEGORY_QUERIES[category];
  if (!config) throw new Error(`Unknown category: ${category}`);

  const query = buildQuery(config.tags, BASE_LAT, BASE_LNG, config.radius);

  const response = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();
  const elements = data.elements || [];

  return elements
    .filter((el) => el.tags?.name)
    .slice(0, 8)
    .map((el) => formatPlace(el, config.unsplashKeyword));
}

function formatPlace(element, unsplashKeyword) {
  const tags = element.tags || {};

  const lat = element.lat ?? element.center?.lat ?? null;
  const lng = element.lon ?? element.center?.lon ?? null;

  const location =
    [tags["addr:street"], tags["addr:city"] || "Kurukshetra"]
      .filter(Boolean)
      .join(", ") || "Kurukshetra";

  return {
    id: `${element.type}/${element.id}`,
    name: tags.name,
    location,
    rating: null,
    totalRatings: 0,
    isOpen: null,
    photo: getUnsplashImage(tags.name, unsplashKeyword),
    types: [tags.amenity || tags.tourism || tags.leisure || "place"].filter(
      Boolean,
    ),
    priceLevel: parsePriceLevel(tags.fee || tags["price:level"]),
    lat,
    lng,
    website: tags.website || null,
    phone: tags.phone || tags["contact:phone"] || null,
  };
}

function parsePriceLevel(value) {
  if (!value) return null;
  if (value === "no" || value === "free") return 0;
  if (value === "yes") return 1;
  const num = parseInt(value);
  return isNaN(num) ? null : num;
}

export function getStars(rating) {
  if (!rating) return "No ratings yet";
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return "★".repeat(full) + (half ? "½" : "") + "☆".repeat(empty);
}

export function getPriceLabel(level) {
  const labels = { 0: "Free", 1: "₹", 2: "₹₹", 3: "₹₹₹", 4: "₹₹₹₹" };
  return level !== null ? (labels[level] ?? "") : "";
}

export function openInMaps(place) {
  if (place.lat && place.lng) {
    window.open(
      `https://www.openstreetmap.org/?mlat=${place.lat}&mlon=${place.lng}&zoom=17`,
      "_blank",
    );
  } else {
    window.open(
      `https://www.openstreetmap.org/search?query=${encodeURIComponent(place.name + " Kurukshetra")}`,
      "_blank",
    );
  }
}
