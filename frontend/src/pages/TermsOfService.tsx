import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, ShoppingBag, AlertCircle, ExternalLink, Cpu, Mail } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageBackground from "../components/common/PageBackground";

const TermsOfService: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageBackground>
      <Navbar />

      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Navigation back button */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 rounded-xl border border-[#E8E2D9] bg-white px-4 py-2 text-sm font-medium text-[#5A5248] shadow-sm transition-all duration-150 hover:-translate-y-px hover:border-purple-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* Page Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-purple-50/80 px-3.5 py-1 text-xs font-bold text-[#7C3AED]">
            <FileText className="h-3.5 w-3.5" />
            <span>Service Terms</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D0B1E]">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-[#7A7068]">
            Effective Date: October 2026 · Last Updated: October 2026
          </p>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#5A5248]">
            Please read these Terms of Service before using ShopMind AI. By accessing or searching through our application, you acknowledge and agree to the guidelines and notices outlined below.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-[#0D0B1E]">
          {/* Section 1 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <ShoppingBag className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">1. Purpose of the Service</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                ShopMind AI is an AI-powered shopping decision engine and product comparison platform created as an engineering project by Lochan P Anchalkar. It is designed to assist visitors with searching live consumer products, aggregating seller offers, extracting specifications, and evaluating best-value options.
              </p>
              <p>
                ShopMind AI operates strictly as a discovery and comparison tool. We do not sell items directly, warehouse inventory, collect customer payments, or deliver physical goods.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <AlertCircle className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">2. Third-Party Market Data & Price Fluctuations</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                Product listings, pricing, currency figures (₹ INR), merchant names, stock availability, and user ratings displayed on ShopMind AI are retrieved from third-party shopping engines (Google Shopping via SerpApi).
              </p>
              <p>
                Because online market conditions change continuously, prices, coupons, and stock availability on external retailer stores may differ from the information cached or displayed during your search session. We recommend always confirming final prices and terms on the retailer&apos;s site before making a purchase.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <Cpu className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">3. Informational AI Recommendations</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                Our AI Decision Engine evaluates features, customer criteria, seller deals, and specifications to generate curated Top 5 picks and comparison summaries. These analyses are generated algorithmically for informational decision support.
              </p>
              <p>
                AI recommendations do not constitute formal financial, technical, or endorsement advice. Users should evaluate their specific needs and review verified product specifications before buying.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <ExternalLink className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">4. Purchases Completed on External Retailers</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                When you click an outbound seller deal (such as Amazon, Flipkart, or a brand store), your checkout, payment, billing, shipping, return, and warranty policies are handled exclusively by that third-party retailer.
              </p>
              <p>
                ShopMind AI is not a party to transactions made between you and external merchants and holds no liability for order fulfillment, defective goods, or shipping delays.
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <FileText className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">5. Acceptable Use & Intellectual Property</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                You agree to use ShopMind AI for personal, non-commercial shopping research. You may not abuse the API, initiate denial-of-service attacks, or attempt to compromise backend infrastructure.
              </p>
              <p>
                Third-party brand names, logos, trademarks, and merchant names shown in product search results remain the property of their respective owners. Their presence indicates product origin and does not imply sponsorship or affiliation.
              </p>
            </div>
          </section>

          {/* Section 6 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">6. Questions & Contact</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                If you have questions regarding these terms, product information, or developer feedback, please contact:
              </p>
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/60 p-3.5 text-sm font-semibold text-[#7C3AED]">
                <Mail className="h-4 w-4" />
                <span>Contact Email:</span>
                <a
                  href="mailto:lochanap2005@gmail.com?subject=ShopMind%20AI%20Support"
                  title="Send email to lochanap2005@gmail.com"
                  className="underline hover:text-[#6D28D9] transition-colors"
                >
                  lochanap2005@gmail.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </PageBackground>
  );
};

export default TermsOfService;

