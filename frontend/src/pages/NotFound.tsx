import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SearchCommand } from "../components/search/SearchCommand";
import { Accent } from "../components/ui/SectionHeading";
import { buttonClasses } from "../components/ui/Button";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const NotFound = () => {
  useDocumentTitle("Page not found");
  const navigate = useNavigate();
  return (
    <div className="container-x flex min-h-[80vh] flex-col items-center justify-center pb-24 pt-32 text-center">
      <p className="rise-in font-display text-[7rem] italic leading-none text-aurora sm:text-[10rem]">404</p>
      <h1 className="rise-in mt-4 text-[2rem] font-semibold tracking-[-0.03em] text-ink sm:text-[2.6rem]" style={{ ["--rise-index" as string]: 1 }}>
        This page is <Accent>off the shelf</Accent>
      </h1>
      <p className="rise-in mt-3 max-w-md text-[15px] text-muted" style={{ ["--rise-index" as string]: 2 }}>
        The link may be old or mistyped. Tell us what you were looking for instead.
      </p>
      <SearchCommand className="rise-in mt-10 w-full max-w-xl text-left" onSubmit={(query) => navigate(`/search?q=${encodeURIComponent(query)}`)} />
      <Link to="/" className={buttonClasses("ghost", "md", "mt-6")}>
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
    </div>
  );
};

export default NotFound;
