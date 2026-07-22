import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, Compass, Sparkles } from "lucide-react";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-white to-rose-50 flex items-center justify-center px-4 py-12">
      {/* Decorative background elements */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-rose-200/30 blur-3xl" />
        <div className="absolute top-1/3 -right-24 h-80 w-80 rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-xl">
        <div className="rounded-3xl border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-xl shadow-slate-200/50 px-6 py-10 sm:px-10 sm:py-14 flex flex-col items-center text-center">
          {/* Illustration placeholder */}
          <div className="relative mb-6">
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 blur-2xl opacity-25" />
            <div className="relative flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-full bg-gradient-to-tr from-rose-500 to-orange-500 shadow-lg shadow-rose-300/50">
              <Compass className="h-11 w-11 sm:h-14 sm:w-14 text-white" strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md ring-1 ring-slate-100">
              <Sparkles className="h-4 w-4 text-rose-500" strokeWidth={2} />
            </div>
          </div>

          {/* Large 404 */}
          <p className="bg-gradient-to-r from-rose-600 to-orange-500 bg-clip-text text-6xl sm:text-8xl font-extrabold tracking-tight text-transparent">
            404
          </p>

          {/* Title */}
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Page Not Found
          </h1>

          {/* Subtitle */}
          <p className="mt-4 max-w-md text-base sm:text-lg leading-relaxed text-slate-500">
            The page you're looking for doesn't exist. Return to the homepage.
          </p>

          {/* Divider */}
          <div className="my-8 h-px w-full max-w-xs bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          {/* Go Home button */}
          <button
            type="button"
            onClick={handleGoHome}
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 px-6 py-3 text-sm sm:text-base font-medium text-white shadow-lg shadow-rose-300/40 transition-all duration-200 hover:shadow-xl hover:shadow-rose-300/50 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          >
            <Home className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
            Go Home
          </button>
        </div>

        {/* Footer hint */}
        <p className="mt-6 text-center text-xs sm:text-sm text-slate-400">
          Error code: 404 — lost in the shopping aisles of the internet.
        </p>
      </div>
    </div>
  );
};

export default NotFound;