export interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  aiScore: number;
  recommended: boolean;
  inStock: boolean;
}

export const products: Product[] = [
  {
    id: 1,
    name: "WH-1000XM5 Wireless Noise Cancelling Headphones",
    brand: "Sony",
    category: "Sony Headphones",
    price: 29990,
    originalPrice: 34990,
    rating: 4.7,
    reviews: 3245,
    image: "https://placehold.co/400x400",
    description:
      "Industry-leading noise cancellation with premium sound quality, 30-hour battery life, and crystal-clear hands-free calling.",
    aiScore: 96,
    recommended: true,
    inStock: true,
  },
  {
    id: 2,
    name: "WF-1000XM5 Wireless Earbuds",
    brand: "Sony",
    category: "Sony Headphones",
    price: 19990,
    originalPrice: 24990,
    rating: 4.6,
    reviews: 1987,
    image: "https://placehold.co/400x400",
    description:
      "Compact noise-cancelling earbuds with powerful bass, adaptive sound control, and up to 24 hours of total battery life.",
    aiScore: 93,
    recommended: true,
    inStock: true,
  },
  {
    id: 3,
    name: "WH-CH720N Wireless Headphones",
    brand: "Sony",
    category: "Sony Headphones",
    price: 7990,
    originalPrice: 9990,
    rating: 4.3,
    reviews: 852,
    image: "https://placehold.co/400x400",
    description:
      "Lightweight on-ear headphones with active noise cancellation and up to 35 hours of playback on a single charge.",
    aiScore: 87,
    recommended: false,
    inStock: true,
  },
  {
    id: 4,
    name: "ASUS ROG Strix G16 Gaming Laptop",
    brand: "ASUS",
    category: "Gaming Laptop",
    price: 134990,
    originalPrice: 149990,
    rating: 4.5,
    reviews: 674,
    image: "https://placehold.co/400x400",
    description:
      "Intel Core i9 13th Gen, RTX 4070, 16GB RAM, 1TB SSD, 16-inch QHD 165Hz display for immersive high-performance gaming.",
    aiScore: 94,
    recommended: true,
    inStock: true,
  },
  {
    id: 5,
    name: "Lenovo Legion 5 Pro Gaming Laptop",
    brand: "Lenovo",
    category: "Gaming Laptop",
    price: 119990,
    originalPrice: 134990,
    rating: 4.4,
    reviews: 512,
    image: "https://placehold.co/400x400",
    description:
      "AMD Ryzen 7 7745HX, RTX 4060, 16GB RAM, 512GB SSD with a 16-inch WQXGA 165Hz display built for serious gamers.",
    aiScore: 90,
    recommended: false,
    inStock: true,
  },
  {
    id: 6,
    name: "HP Omen 16 Gaming Laptop",
    brand: "HP",
    category: "Gaming Laptop",
    price: 109990,
    originalPrice: 124990,
    rating: 4.2,
    reviews: 389,
    image: "https://placehold.co/400x400",
    description:
      "Intel Core i7 13th Gen, RTX 4060, 16GB RAM, 1TB SSD with advanced thermal cooling and a 165Hz FHD display.",
    aiScore: 88,
    recommended: false,
    inStock: false,
  },
  {
    id: 7,
    name: "iPhone 15 Pro",
    brand: "Apple",
    category: "Smartphone",
    price: 134900,
    originalPrice: 139900,
    rating: 4.8,
    reviews: 5231,
    image: "https://placehold.co/400x400",
    description:
      "Titanium design with A17 Pro chip, 48MP main camera, Action button, and USB-C for pro-level performance.",
    aiScore: 98,
    recommended: true,
    inStock: true,
  },
  {
    id: 8,
    name: "Samsung Galaxy S24 Ultra",
    brand: "Samsung",
    category: "Smartphone",
    price: 129999,
    originalPrice: 139999,
    rating: 4.7,
    reviews: 4102,
    image: "https://placehold.co/400x400",
    description:
      "200MP camera, built-in S Pen, Snapdragon 8 Gen 3, and a stunning 6.8-inch Dynamic AMOLED 2X display with Galaxy AI.",
    aiScore: 97,
    recommended: true,
    inStock: true,
  },
  {
    id: 9,
    name: "OnePlus 12",
    brand: "OnePlus",
    category: "Smartphone",
    price: 64999,
    originalPrice: 69999,
    rating: 4.5,
    reviews: 2765,
    image: "https://placehold.co/400x400",
    description:
      "Snapdragon 8 Gen 3, Hasselblad camera system, 100W SuperVOOC fast charging, and a vivid 120Hz LTPO AMOLED display.",
    aiScore: 92,
    recommended: false,
    inStock: true,
  },
  {
    id: 10,
    name: "Apple Watch Series 9",
    brand: "Apple",
    category: "Smartwatch",
    price: 41900,
    originalPrice: 45900,
    rating: 4.6,
    reviews: 1893,
    image: "https://placehold.co/400x400",
    description:
      "Advanced health sensors, Double Tap gesture, brighter Retina display, and seamless integration with the Apple ecosystem.",
    aiScore: 95,
    recommended: true,
    inStock: true,
  },
  {
    id: 11,
    name: "Samsung Galaxy Watch 6",
    brand: "Samsung",
    category: "Smartwatch",
    price: 29999,
    originalPrice: 34999,
    rating: 4.4,
    reviews: 1456,
    image: "https://placehold.co/400x400",
    description:
      "Sleek design with advanced sleep coaching, body composition analysis, and a bright always-on Super AMOLED display.",
    aiScore: 91,
    recommended: false,
    inStock: true,
  },
  {
    id: 12,
    name: "Noise ColorFit Pro 5",
    brand: "Noise",
    category: "Smartwatch",
    price: 3999,
    originalPrice: 5999,
    rating: 4.1,
    reviews: 6789,
    image: "https://placehold.co/400x400",
    description:
      "1.85-inch AMOLED display, Bluetooth calling, built-in GPS, and 7-day battery life at a budget-friendly price.",
    aiScore: 82,
    recommended: false,
    inStock: true,
  },
];

export default products;