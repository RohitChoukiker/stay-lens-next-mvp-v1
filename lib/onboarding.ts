// lib/onboarding.ts

export const ONBOARDING_QUESTIONS = [
 {
    key: "budget_range",
    title: "What's your usual budget per night?",
    helper: "Hum aapke liye stays curate karenge.",
    options: [
      { value: "under_5k", label: "Under ₹5,000", description: "Smart picks & boutique stays" },
      { value: "5k_15k", label: "₹5,000 – ₹15,000", description: "Mid-luxury and design hotels" },
      { value: "15k_40k", label: "₹15,000 – ₹40,000", description: "Premium 5-star properties" },
      { value: "40k_plus", label: "₹40,000+", description: "Iconic palaces & ultra-luxury" },
    ],
  },
  {
    key: "trip_type",
    title: "What's the nature of your trip?",
    helper: "We'll match the atmosphere to the purpose.",
    options: [
      { value: "vacation", label: "Vacation" },
      { value: "business", label: "Business" },
      { value: "honeymoon", label: "Honeymoon" },
      { value: "family", label: "Family Trip" },
    ],
  },
  {
    key: "location_vibe",
    title: "What's your ideal landscape?",
    helper: "City buzz, beach calm, or mountain quiet?",
    options: [
      { value: "city", label: "City", description: "Urban, walkable, alive" },
      { value: "beach", label: "Coastal", description: "Sea air and slow mornings" },
      { value: "mountain", label: "Mountain", description: "Forests, peaks, fireplaces" },
      { value: "heritage", label: "Heritage", description: "Palaces, havelis, history" },
    ],
  },
  {
    key: "preferred_amenities",
    title: "Which amenities matter to you?",
    helper: "Pick all that apply — or skip if you're easy.",
    multi: true,
    options: [
      { value: "Pool", label: "Pool" },
      { value: "Spa", label: "Spa" },
      { value: "Free Wi-Fi", label: "Wi-Fi" },
      { value: "Restaurant", label: "Restaurant" },
      { value: "Bar", label: "Bar" },
      { value: "Private Pool", label: "Private Pool" },
      { value: "Private Beach", label: "Private Beach" },
      { value: "Concierge", label: "Concierge" },
    ],
  },
  {
    key: "traveler_count",
    title: "Who's travelling?",
    helper: "Solo, duo, or a whole crew?",
    options: [
      { value: "solo", label: "Just me" },
      { value: "couple", label: "Two of us" },
      { value: "family", label: "Family (3–5)" },
      { value: "group", label: "Group (6+)" },
    ],
  },
  {
    key: "date_flexibility",
    title: "How flexible are your dates?",
    helper: "Flexibility unlocks better rates.",
    options: [
      { value: "fixed", label: "Fixed dates" },
      { value: "weekend", label: "Any weekend" },
      { value: "month", label: "Anytime this month" },
      { value: "open", label: "Whenever the deal is right" },
    ],
  },
  {
    key: "food_preference",
    title: "Food preferences?",
    helper: "We'll surface hotels with the right kitchen.",
    options: [
      { value: "no_pref", label: "No preference" },
      { value: "vegetarian", label: "Vegetarian" },
      { value: "vegan", label: "Vegan" },
      { value: "jain", label: "Jain" },
      { value: "halal", label: "Halal" },
    ],
  },
  {
    key: "room_type",
    title: "Preferred room style?",
    helper: "Last one — promise.",
    options: [
      { value: "standard", label: "Standard Room" },
      { value: "suite", label: "Suite" },
      { value: "villa", label: "Villa" },
      { value: "heritage_room", label: "Heritage Room" },
    ],
  },
];
