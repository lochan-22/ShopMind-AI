import React from "react";
import {
  Headphones,
  Smartphone,
  Laptop,
  Watch,
  Tablet,
  Camera,
  Gamepad2,
  Cable,
  type LucideIcon,
} from "lucide-react";
import { useInView } from "./useInView";

interface Category {
  icon: LucideIcon;
  label: string;
}

const categories: Category[] = [
  { icon: Headphones, label: "Headphones" },
  { icon: Smartphone, label: "Smartphones" },
  { icon: Laptop, label: "Laptops" },
  { icon: Watch, label: "Smart Watches" },
  { icon: Tablet, label: "Tablets" },
  { icon: Camera, label: "Cameras" },
  { icon: Gamepad2, label: "Gaming" },
  { icon: Cable, label: "Accessories" },
];

const Categories: React.FC = () => {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <section className="w-full bg-gradient-to-b from-white via-indigo-50/40 to-white py-20">
      <div ref={ref} className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div
          className={`mx-auto max-w-2xl text-center transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Supported Categories
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-500">
            ShopMind AI already knows its way around these categories.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {categories.map((category, index) => {
            const Icon = category.icon;
            return (
              <div
                key={category.label}
                style={{ transitionDelay: inView ? `${index * 60}ms` : "0ms" }}
                className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-8 text-center shadow-sm transition-all duration-700 ease-out hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-200/50 ${
                  inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-50 to-purple-50 transition-colors duration-300 group-hover:from-indigo-500 group-hover:to-purple-600">
                  <Icon
                    className="h-5 w-5 text-indigo-500 transition-colors duration-300 group-hover:text-white"
                    strokeWidth={1.75}
                  />
                </div>
                <span className="text-xs font-medium text-slate-700 sm:text-sm">
                  {category.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;