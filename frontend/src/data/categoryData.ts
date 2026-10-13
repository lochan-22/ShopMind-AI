/**
 * ShopMind AI — 3-level category hierarchy.
 *
 * Level 1: Main categories
 * Level 2: Subcategories per main category
 * Level 3: Live products fetched from SerpApi when a subcategory is selected.
 */

export interface SubCategory {
  /** URL-safe slug used in the route. */
  slug: string;
  /** Human-readable label shown in the UI. */
  label: string;
  /** Query sent to SerpApi/Google Shopping. */
  searchQuery: string;
}

export interface MainCategory {
  /** URL-safe slug used in the route: /categories/:slug */
  slug: string;
  /** Human-readable label. */
  label: string;
  /** Emoji displayed alongside the label. */
  emoji: string;
  /** Short description shown on the main categories page. */
  description: string;
  subcategories: SubCategory[];
}

export const MAIN_CATEGORIES: MainCategory[] = [
  {
    slug: "electronics",
    label: "Electronics & Technology",
    emoji: "🖥️",
    description: "Phones, laptops, audio, cameras and more",
    subcategories: [
      { slug: "smartphones",          label: "Smartphones",          searchQuery: "smartphones India" },
      { slug: "laptops",              label: "Laptops",              searchQuery: "laptops India" },
      { slug: "computers",            label: "Computers",            searchQuery: "desktop computers India" },
      { slug: "tablets",              label: "Tablets",              searchQuery: "tablets India" },
      { slug: "headphones",           label: "Headphones",           searchQuery: "headphones India" },
      { slug: "earbuds",              label: "Earbuds",              searchQuery: "wireless earbuds India" },
      { slug: "tvs",                  label: "TVs",                  searchQuery: "smart TVs India" },
      { slug: "cameras",              label: "Cameras",              searchQuery: "digital cameras India" },
      { slug: "gaming",               label: "Gaming",               searchQuery: "gaming consoles India" },
      { slug: "computer-accessories", label: "Computer Accessories", searchQuery: "computer accessories India" },
      { slug: "smart-watches",        label: "Smart Watches",        searchQuery: "smartwatches India" },
      { slug: "wearables",            label: "Wearables",            searchQuery: "wearable fitness tracker India" },
      { slug: "printers",             label: "Printers",             searchQuery: "printers India" },
      { slug: "networking",           label: "Networking",           searchQuery: "wifi routers India" },
      { slug: "storage",              label: "Storage",              searchQuery: "external hard drives SSD India" },
      { slug: "monitors",             label: "Monitors",             searchQuery: "computer monitors India" },
      { slug: "projectors",           label: "Projectors",           searchQuery: "projectors India" },
    ],
  },
  {
    slug: "fashion",
    label: "Fashion",
    emoji: "👕",
    description: "Clothing, shoes, bags, jewellery & accessories",
    subcategories: [
      { slug: "mens-clothing",   label: "Men's Clothing",   searchQuery: "men's clothing India" },
      { slug: "womens-clothing", label: "Women's Clothing", searchQuery: "women's clothing India" },
      { slug: "kids-clothing",   label: "Kids' Clothing",   searchQuery: "kids clothing India" },
      { slug: "shoes",           label: "Shoes",            searchQuery: "shoes India" },
      { slug: "sneakers",        label: "Sneakers",         searchQuery: "sneakers India" },
      { slug: "sandals",         label: "Sandals",          searchQuery: "sandals India" },
      { slug: "bags",            label: "Bags",             searchQuery: "bags handbags India" },
      { slug: "watches",         label: "Watches",          searchQuery: "fashion watches India" },
      { slug: "jewellery",       label: "Jewellery",        searchQuery: "jewellery India" },
      { slug: "accessories",     label: "Accessories",      searchQuery: "fashion accessories India" },
      { slug: "sportswear",      label: "Sportswear",       searchQuery: "sportswear India" },
      { slug: "ethnic-wear",     label: "Ethnic Wear",      searchQuery: "ethnic wear kurta India" },
    ],
  },
  {
    slug: "home-kitchen",
    label: "Home & Living",
    emoji: "🏠",
    description: "Furniture, cookware, décor, bedding & more",
    subcategories: [
      { slug: "furniture",          label: "Furniture",          searchQuery: "furniture India" },
      { slug: "kitchen-appliances", label: "Kitchen Appliances", searchQuery: "kitchen appliances India" },
      { slug: "home-appliances",    label: "Home Appliances",    searchQuery: "home appliances India" },
      { slug: "cookware",           label: "Cookware",           searchQuery: "cookware pots pans India" },
      { slug: "home-decor",         label: "Home Decor",         searchQuery: "home decor India" },
      { slug: "bedding",            label: "Bedding",            searchQuery: "bedding bed sheets India" },
      { slug: "lighting",           label: "Lighting",           searchQuery: "home lighting India" },
      { slug: "storage",            label: "Storage",            searchQuery: "storage organizers India" },
      { slug: "cleaning",           label: "Cleaning",           searchQuery: "home cleaning products India" },
      { slug: "bathroom",           label: "Bathroom",           searchQuery: "bathroom accessories India" },
      { slug: "garden",             label: "Garden",             searchQuery: "garden tools plants India" },
    ],
  },
  {
    slug: "footwear",
    label: "Footwear",
    emoji: "👟",
    description: "Sneakers, running shoes, formal shoes, sandals & boots",
    subcategories: [
      { slug: "sneakers",         label: "Sneakers",         searchQuery: "sneakers India" },
      { slug: "running-shoes",    label: "Running Shoes",    searchQuery: "running shoes India" },
      { slug: "casual-shoes",     label: "Casual Shoes",     searchQuery: "casual shoes men women India" },
      { slug: "formal-shoes",     label: "Formal Shoes",     searchQuery: "formal shoes India" },
      { slug: "sports-shoes",     label: "Sports Shoes",     searchQuery: "sports athletic training shoes India" },
      { slug: "sandals-slippers", label: "Sandals & Slippers", searchQuery: "sandals slippers footwear India" },
      { slug: "boots",            label: "Boots",            searchQuery: "boots footwear India" },
      { slug: "heels-flats",      label: "Heels & Flats",    searchQuery: "women heels flats shoes India" },
    ],
  },
  {
    slug: "appliances",
    label: "Appliances",
    emoji: "🍳",
    description: "Refrigerators, washing machines, ACs & more",
    subcategories: [
      { slug: "refrigerators",   label: "Refrigerators",    searchQuery: "refrigerators India" },
      { slug: "washing-machines", label: "Washing Machines", searchQuery: "washing machines India" },
      { slug: "air-conditioners", label: "Air Conditioners", searchQuery: "air conditioners India" },
      { slug: "air-coolers",     label: "Air Coolers",      searchQuery: "air coolers India" },
      { slug: "microwave-ovens", label: "Microwave Ovens",  searchQuery: "microwave ovens India" },
      { slug: "air-fryers",      label: "Air Fryers",       searchQuery: "air fryers India" },
      { slug: "vacuum-cleaners", label: "Vacuum Cleaners",  searchQuery: "vacuum cleaners India" },
      { slug: "water-purifiers", label: "Water Purifiers",  searchQuery: "water purifiers RO India" },
      { slug: "geysers",         label: "Geysers",          searchQuery: "water heaters geysers India" },
      { slug: "fans",            label: "Fans",             searchQuery: "ceiling fans table fans India" },
    ],
  },
  {
    slug: "beauty",
    label: "Beauty & Personal Care",
    emoji: "💄",
    description: "Skincare, haircare, makeup & grooming",
    subcategories: [
      { slug: "skincare",      label: "Skincare",      searchQuery: "skincare products India" },
      { slug: "haircare",      label: "Haircare",      searchQuery: "haircare products India" },
      { slug: "makeup",        label: "Makeup",        searchQuery: "makeup cosmetics India" },
      { slug: "fragrances",    label: "Fragrances",    searchQuery: "perfumes fragrances India" },
      { slug: "grooming",      label: "Grooming",      searchQuery: "men grooming products India" },
      { slug: "personal-care", label: "Personal Care", searchQuery: "personal care products India" },
      { slug: "beauty-tools",  label: "Beauty Tools",  searchQuery: "beauty tools hair dryer India" },
    ],
  },
  {
    slug: "sports",
    label: "Sports & Fitness",
    emoji: "🏋️",
    description: "Gym equipment, running, cycling & outdoor sports",
    subcategories: [
      { slug: "fitness-equipment", label: "Fitness Equipment", searchQuery: "fitness equipment India" },
      { slug: "running",           label: "Running",           searchQuery: "running shoes gear India" },
      { slug: "cycling",           label: "Cycling",           searchQuery: "cycling bicycles India" },
      { slug: "outdoor",           label: "Outdoor",           searchQuery: "outdoor sports equipment India" },
      { slug: "sports-shoes",      label: "Sports Shoes",      searchQuery: "sports shoes India" },
      { slug: "gym-equipment",     label: "Gym Equipment",     searchQuery: "gym equipment dumbbells India" },
      { slug: "yoga",              label: "Yoga",              searchQuery: "yoga mat accessories India" },
      { slug: "team-sports",       label: "Team Sports",       searchQuery: "cricket football sports India" },
    ],
  },
  {
    slug: "baby-kids",
    label: "Baby & Kids",
    emoji: "🧸",
    description: "Baby gear, toys, clothing & school supplies",
    subcategories: [
      { slug: "baby-clothing",   label: "Baby Clothing",   searchQuery: "baby clothing India" },
      { slug: "toys",            label: "Toys",            searchQuery: "toys for kids India" },
      { slug: "baby-gear",       label: "Baby Gear",       searchQuery: "baby gear products India" },
      { slug: "strollers",       label: "Strollers",       searchQuery: "baby strollers prams India" },
      { slug: "school-supplies", label: "School Supplies", searchQuery: "school supplies stationery India" },
      { slug: "kids-shoes",      label: "Kids' Shoes",     searchQuery: "kids shoes India" },
    ],
  },
  {
    slug: "automotive",
    label: "Automotive",
    emoji: "🚗",
    description: "Car & bike accessories, electronics & maintenance",
    subcategories: [
      { slug: "car-accessories",  label: "Car Accessories",  searchQuery: "car accessories India" },
      { slug: "bike-accessories", label: "Bike Accessories", searchQuery: "bike motorcycle accessories India" },
      { slug: "car-electronics",  label: "Car Electronics",  searchQuery: "car electronics dash cam India" },
      { slug: "tools",            label: "Tools",            searchQuery: "automotive tools India" },
      { slug: "maintenance",      label: "Maintenance",      searchQuery: "car maintenance products India" },
      { slug: "riding-gear",      label: "Riding Gear",      searchQuery: "riding gear helmets India" },
    ],
  },
  {
    slug: "books",
    label: "Books & Education",
    emoji: "📚",
    description: "Books, stationery, office supplies & instruments",
    subcategories: [
      { slug: "books",                label: "Books",                searchQuery: "books India" },
      { slug: "educational-products", label: "Educational Products", searchQuery: "educational toys learning products India" },
      { slug: "stationery",           label: "Stationery",           searchQuery: "stationery office supplies India" },
      { slug: "office-supplies",      label: "Office Supplies",      searchQuery: "office supplies India" },
      { slug: "musical-instruments",  label: "Musical Instruments",  searchQuery: "musical instruments India" },
    ],
  },
  {
    slug: "pets",
    label: "Pet Supplies",
    emoji: "🐕",
    description: "Food, accessories & grooming for your pets",
    subcategories: [
      { slug: "dog-supplies",    label: "Dog Supplies",    searchQuery: "dog supplies accessories India" },
      { slug: "cat-supplies",    label: "Cat Supplies",    searchQuery: "cat supplies accessories India" },
      { slug: "pet-food",        label: "Pet Food",        searchQuery: "pet food dog cat India" },
      { slug: "pet-accessories", label: "Pet Accessories", searchQuery: "pet accessories India" },
      { slug: "pet-grooming",    label: "Grooming",        searchQuery: "pet grooming products India" },
    ],
  },
  {
    slug: "smart-tech",
    label: "Smart Tech & Toys",
    emoji: "🤖",
    description: "Smart home devices, smartwatches, drones, robotics & STEM toys",
    subcategories: [
      { slug: "smart-home",       label: "Smart Home Devices", searchQuery: "smart home devices India" },
      { slug: "smart-watches",    label: "Smart Watches",     searchQuery: "smartwatches India" },
      { slug: "drones-robotics",  label: "Drones & Robotics", searchQuery: "drones robotics India" },
      { slug: "stem-toys",        label: "STEM & Learning Toys", searchQuery: "stem learning toys India" },
      { slug: "rc-action-toys",   label: "RC & Action Toys",  searchQuery: "remote control toys India" },
      { slug: "smart-audio",      label: "Smart Audio & Speakers", searchQuery: "smart speakers voice assistants India" },
    ],
  },
  {
    slug: "groceries",
    label: "Groceries & Food",
    emoji: "🛒",
    description: "Snacks, beverages, cooking essentials & more",
    subcategories: [
      { slug: "snacks",               label: "Snacks",               searchQuery: "snacks chips biscuits India" },
      { slug: "beverages",            label: "Beverages",            searchQuery: "beverages drinks India" },
      { slug: "packaged-food",        label: "Packaged Food",        searchQuery: "packaged food India" },
      { slug: "cooking-essentials",   label: "Cooking Essentials",   searchQuery: "cooking essentials spices India" },
      { slug: "household-essentials", label: "Household Essentials", searchQuery: "household essentials India" },
    ],
  },
];

/**
 * Common slug aliases to prevent broken URLs if hyphenated or alternate names are requested.
 */
export const SLUG_ALIASES: Record<string, string> = {
  "beauty-personal-care": "beauty",
  "sports-fitness": "sports",
  "books-education": "books",
  "pet-supplies": "pets",
  "home-living": "home-kitchen",
  "smart-tech-toys": "smart-tech",
};

/** Normalize category slug (lowercased, trimmed, hyphenated, alias-resolved) */
export const normalizeCategorySlug = (raw: string): string => {
  if (!raw) return "";
  const cleaned = raw.toLowerCase().trim().replace(/_/g, "-");
  return SLUG_ALIASES[cleaned] ?? cleaned;
};

/** Look up a main category by its slug or alias. Returns undefined if not found. */
export const findMainCategory = (slug: string): MainCategory | undefined => {
  if (!slug) return undefined;
  const normalized = normalizeCategorySlug(slug);
  return MAIN_CATEGORIES.find(
    (cat) => cat.slug.toLowerCase() === normalized || cat.slug.toLowerCase() === slug.toLowerCase().trim()
  );
};

/** Look up a subcategory within a main category by both slugs. */
export const findSubCategory = (
  mainSlug: string,
  subSlug: string,
): SubCategory | undefined => {
  const main = findMainCategory(mainSlug);
  if (!main) return undefined;
  const normalizedSub = subSlug?.toLowerCase().trim();
  return main.subcategories.find((s) => s.slug.toLowerCase() === normalizedSub);
};
