// hotels.ts
// This file exports a sample HOTELS array and filter options. Replace with real data as needed.

export const HOTELS = [
  {
    id: 1,
    name: "Hotel Sunshine",
    city: "Goa",
    state: "Goa",
    vibe: "Beach",
    stars: 4,
    amenities: ["Pool", "WiFi", "Breakfast"],
    reviewCount: 120,
    rating: 4.5,
    tagline: "A beautiful hotel near the beach with all amenities.",
    images: ["/images/hotel-sunshine.jpg"],
    pricePerNight: 3500
  },
  {
    id: 2,
    name: "Mountain View Resort",
    city: "Manali",
    state: "Himachal Pradesh",
    vibe: "Mountain",
    stars: 5,
    amenities: ["Spa", "WiFi", "Breakfast"],
    reviewCount: 80,
    rating: 4.7,
    tagline: "Enjoy the scenic mountain views and fresh air.",
    images: ["/images/mountain-view.jpg"],
    pricePerNight: 4200
  },
  // Add more hotel objects as needed
];

export const ALL_AMENITIES = [
  "Pool",
  "WiFi",
  "Breakfast",
  "Spa",
  "Parking",
  "Gym",
  "Bar",
  "Restaurant",
  "Pet Friendly",
];

export const ALL_VIBES = [
  "Beach",
  "Mountain",
  "City",
  "Countryside",
  "Luxury",
  "Boutique",
  "Family",
  "Romantic",
];
