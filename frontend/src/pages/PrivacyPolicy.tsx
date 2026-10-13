import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Database, Globe, Cookie, HelpCircle, Mail } from "lucide-react";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
import PageBackground from "../components/common/PageBackground";

const PrivacyPolicy: React.FC = () => {
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
            <Shield className="h-3.5 w-3.5" />
            <span>Transparency & Trust</span>
          </div>
          <h1 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight text-[#0D0B1E]">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-[#7A7068]">
            Effective Date: October 2026 · Last Updated: October 2026
          </p>
          <p className="mt-4 text-sm sm:text-base leading-relaxed text-[#5A5248]">
            Welcome to ShopMind AI. We believe in being transparent about how data is handled across our AI-powered shopping decision engine. This Privacy Policy explains our actual data handling practices in clear, straightforward language.
          </p>
        </div>

        {/* Content Sections */}
        <div className="space-y-8 text-[#0D0B1E]">
          {/* Section 1 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <Database className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">1. Information We Collect and Process</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                <strong>Search Queries:</strong> When you enter a natural language shopping query in our search bar (e.g., &ldquo;wireless headphones under ₹5,000&rdquo;), your query text is transmitted over secure HTTPS to our FastAPI backend server.
              </p>
              <p>
                <strong>Intent Extraction:</strong> Our shopping decision engine parses your search query in real time to detect category, brand preference, budget limits, and key decision criteria to match products effectively.
              </p>
              <p>
                <strong>No Account Creation Required:</strong> ShopMind AI does not currently require or collect user accounts, passwords, profile photos, or personal identity numbers to use the shopping search, comparison, and recommendation features.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <Globe className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">2. External APIs and Third-Party Services</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                <strong>Google Shopping via SerpApi:</strong> To retrieve live market pricing, product names, merchant links, and ratings from India&apos;s shopping market, our backend queries the SerpApi search service. Only the synthesized shopping query string is forwarded to retrieve public product results; no personal identifying information is transmitted.
              </p>
              <p>
                <strong>Outbound Retailer Links:</strong> When you click a &ldquo;View on Seller&rdquo; or merchant link, you leave ShopMind AI and navigate directly to the external retailer (e.g., Amazon, Flipkart, official brand store). Your interactions on merchant sites are governed exclusively by their respective privacy policies and terms.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <Cookie className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">3. Local Storage and Cookies</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                <strong>Client-Side LocalStorage:</strong> ShopMind AI uses your browser&apos;s native local storage solely to retain items in your saved shopping cart (<code>shopmind_cart</code>) across sessions on your own device. This data resides strictly inside your browser and is never uploaded to an analytics or advertising database.
              </p>
              <p>
                <strong>No Behavioral Tracking Cookies:</strong> We do not deploy third-party advertising cookies, cross-site trackers, or commercial data-mining beacons on this website.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <Lock className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">4. Data Retention and Security</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                Search queries are processed transiently in server memory during each request cycle to generate live recommendations and compare seller prices. We do not maintain a permanent user tracking database or sell shopping query records to third parties.
              </p>
              <p>
                All data transmission between your browser, our API, and external service providers occurs over encrypted Transport Layer Security (TLS/HTTPS).
              </p>
            </div>
          </section>

          {/* Section 5 */}
          <section className="rounded-2xl border border-[#E8E2D9] bg-white/90 p-6 sm:p-8 shadow-sm backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-[#7C3AED]">
                <HelpCircle className="h-4.5 w-4.5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold">5. Project Scope & Inquiries</h2>
            </div>
            <div className="space-y-3 text-sm leading-relaxed text-[#5A5248]">
              <p>
                ShopMind AI is an educational project and AI-powered shopping decision engine developed by Lochan P Anchalkar. It is created to demonstrate real-time shopping comparison, normalization, deduplication, and AI evaluation architectures.
              </p>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or your data, you can reach out directly:
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

export default PrivacyPolicy;

