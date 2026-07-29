import React from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Navbar from "../components/common/Navbar";

const categories = [
  { label: "Headphones", value: "Headphones" },
  { label: "Smartphones", value: "Smartphone" },
  { label: "Laptops", value: "Laptop" },
  { label: "Smart Watches", value: "Smartwatch" },
  { label: "Tablets", value: "Tablet" },
  { label: "Cameras", value: "Camera" },
];

const Categories: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Navbar />
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-md shadow-indigo-300/50">
            <Sparkles className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Categories</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() => navigate(`/categories/${encodeURIComponent(category.value)}`)}
              className="group flex min-h-36 flex-col justify-end rounded-2xl border border-slate-200 bg-white/80 p-5 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/60"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-indigo-500">Shop category</p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">{category.label}</h2>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;
