import React from "react";
import {
  Smartphone,
  Laptop,
  Monitor,
  Tablet,
  Headphones,
  Radio,
  Tv,
  Camera,
  Gamepad2,
  Keyboard,
  Watch,
  Activity,
  Printer,
  Wifi,
  HardDrive,
  Projector,
  Shirt,
  Sparkles,
  Smile,
  Footprints,
  ShoppingBag,
  Gem,
  Glasses,
  Dumbbell,
  Armchair,
  UtensilsCrossed,
  Home,
  ChefHat,
  Paintbrush,
  Bed,
  Lightbulb,
  Package,
  Bath,
  Flower2,
  Zap,
  Briefcase,
  Bot,
  BookOpen,
  Bike,
  Car,
  Wrench,
  Shield,
  Heart,
  Plane,
  Baby,
  type LucideIcon,
} from "lucide-react";

interface SubcategoryIconProps {
  slug: string;
  categorySlug?: string;
  className?: string;
}

const ICON_MAP: Record<string, LucideIcon> = {
  // Electronics & Technology
  smartphones: Smartphone,
  laptops: Laptop,
  computers: Monitor,
  tablets: Tablet,
  headphones: Headphones,
  earbuds: Radio,
  tvs: Tv,
  cameras: Camera,
  gaming: Gamepad2,
  "computer-accessories": Keyboard,
  "smart-watches": Watch,
  wearables: Activity,
  printers: Printer,
  networking: Wifi,
  storage: HardDrive,
  monitors: Monitor,
  projectors: Projector,

  // Fashion & Apparel
  "mens-clothing": Shirt,
  "womens-clothing": Sparkles,
  "kids-clothing": Smile,
  shoes: Footprints,
  sneakers: Footprints,
  sandals: Footprints,
  bags: ShoppingBag,
  watches: Watch,
  jewellery: Gem,
  accessories: Glasses,
  sportswear: Dumbbell,
  "ethnic-wear": Shirt,

  // Home & Living
  furniture: Armchair,
  "kitchen-appliances": UtensilsCrossed,
  "home-appliances": Home,
  cookware: ChefHat,
  "home-decor": Paintbrush,
  bedding: Bed,
  lighting: Lightbulb,
  cleaning: Sparkles,
  bathroom: Bath,
  garden: Flower2,

  // Footwear
  "running-shoes": Zap,
  "casual-shoes": Footprints,
  "formal-shoes": Briefcase,
  "sandals-floaters": Footprints,
  boots: Footprints,
  "sports-shoes": Activity,
  "slippers-flipflops": Footprints,

  // Smart Tech & Toys
  drones: Plane,
  "smart-home": Home,
  "action-cameras": Camera,
  robotics: Bot,
  "vr-headsets": Glasses,
  "e-readers": BookOpen,
  toys: Baby,

  // Beauty & Wellness
  skincare: Sparkles,
  haircare: Heart,
  makeup: Sparkles,
  fragrances: Heart,
  wellness: Activity,

  // Books & Hobbies
  books: BookOpen,
  fiction: BookOpen,
  "non-fiction": BookOpen,

  // Sports & Outdoors
  fitness: Dumbbell,
  cycling: Bike,

  // Automotive
  automotive: Car,
  "car-accessories": Car,
  "bike-accessories": Wrench,
  helmets: Shield,
};

export const SubcategoryIcon: React.FC<SubcategoryIconProps> = ({
  slug,
  categorySlug,
  className = "h-5 w-5",
}) => {
  const normalizedSlug = slug.toLowerCase().trim();
  const IconComponent =
    ICON_MAP[normalizedSlug] ||
    (categorySlug ? ICON_MAP[categorySlug.toLowerCase().trim()] : null) ||
    Package;

  return <IconComponent className={className} strokeWidth={2} aria-hidden="true" />;
};

export default SubcategoryIcon;

