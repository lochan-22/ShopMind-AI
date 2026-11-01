import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ArrowRight, Compass, Sparkles } from "lucide-react";
import { findMainCategory, MAIN_CATEGORIES } from "../data/categoryData";
import { getMainVisual, getSubIcon } from "../components/category/categoryVisuals";
import { Reveal } from "../components/ui/Reveal";
import { StateView } from "../components/ui/StateView";
import { buttonClasses } from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const SubCategories = () => {
  const { mainCategory = "" } = useParams<{ mainCategory: string }>();
  const navigate = useNavigate();
  const category = findMainCategory(mainCategory);
  useDocumentTitle(category?.label ?? "Collection");

  if (!category) {
    return (
      <div className="container-x pb-24 pt-32">
        <StateView
          icon={<Compass className="h-6 w-6" />}
          title="We couldn't find that collection"
          description="It may have moved. Every collection is listed on the collections page."
          actions={
            <Link to="/categories" className={buttonClasses()}>
              View all collections
            </Link>
          }
        />
      </div>
    );
  }

  const visual = getMainVisual(category.slug);
  const Icon = visual.icon;
  const others = MAIN_CATEGORIES.filter((item) => item.slug !== category.slug).slice(0, 6);

  return (
    <div className="pb-24">
      <section className="relative overflow-hidden pb-16 pt-28 sm:pt-32" style={{ background: `linear-gradient(160deg, ${visual.from}, ${visual.to} 70%, var(--color-paper))` }}>
        <div className="dot-grid pointer-events-none absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,#000,transparent)]" aria-hidden="true" />
        <Icon className="pointer-events-none absolute -right-10 top-16 h-80 w-80 text-ink/[0.07] sm:right-10" strokeWidth={0.75} aria-hidden="true" />
        <div className="container-x relative">
          <Link to="/categories" className="group inline-flex items-center gap-2 text-sm text-ink-2 hover:text-ink">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" /> All collections
          </Link>
          <div className="rise-in mt-10 max-w-2xl">
            <p className="eyebrow text-ink/50">Collection · {category.subcategories.length} aisles</p>
            <h1 className="mt-4 text-[2.5rem] font-semibold leading-[1.02] tracking-[-0.045em] text-ink sm:text-[4rem]">{category.label}</h1>
            <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">{category.description}</p>
          </div>
        </div>
      </section>

      <section className="container-x -mt-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
          {category.subcategories.map((sub, index) => {
            const SubIcon = getSubIcon(sub.slug, category.slug);
            return (
              <Reveal key={sub.slug} index={index % 8}>
                <Link
                  to={`/categories/${category.slug}/${sub.slug}`}
                  className="group card flex h-full flex-col p-5 transition-[transform,box-shadow,border-color] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1 hover:border-line-strong hover:shadow-lift sm:p-6"
                >
                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-2xl text-ink transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:-rotate-6 group-hover:scale-110"
                    style={{ background: `linear-gradient(140deg, ${visual.from}, ${visual.to})` }}
                  >
                    <SubIcon className="h-5 w-5" strokeWidth={1.6} />
                  </span>
                  <h2 className="mt-8 text-[15.5px] font-semibold tracking-tight text-ink">{sub.label}</h2>
                  <span className="mt-1 inline-flex items-center gap-1 text-[12.5px] text-muted transition-colors group-hover:text-jade-700">
                    Browse live listings <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>

        <Reveal className="mt-6 flex flex-col items-start gap-4 rounded-3xl bg-night p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <p className="text-lg font-medium tracking-tight">Not sure which aisle?</p>
            <p className="mt-1 text-sm text-white/55">Describe what you need and ShopMind will find the right products across {category.label.toLowerCase()}.</p>
          </div>
          <button type="button" onClick={() => navigate("/?focus=search")} className={buttonClasses("light", "md")}>
            <Sparkles className="h-4 w-4 text-jade-600" /> Ask ShopMind
          </button>
        </Reveal>
      </section>

      <section className="container-x mt-24">
        <p className="eyebrow text-muted">Other collections</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {others.map((item) => {
            const OtherIcon = getMainVisual(item.slug).icon;
            return (
              <Link key={item.slug} to={`/categories/${item.slug}`} className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-[13px] text-ink-2 transition-colors hover:border-ink hover:text-ink">
                <OtherIcon className="h-3.5 w-3.5" /> {item.label}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default SubCategories;
