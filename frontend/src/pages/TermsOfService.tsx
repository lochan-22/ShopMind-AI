import { LegalPage } from "../components/layout/LegalPage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const TermsOfService = () => {
  useDocumentTitle("Terms of Service");
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="November 2026"
      intro="ShopMind AI is an informational shopping assistant. By using it, you agree to these terms."
    >
      <h2>1. Purpose of the service</h2>
      <p>ShopMind helps you find, understand and compare products sold by third-party retailers. ShopMind does not sell products itself.</p>

      <h2>2. Market data and price changes</h2>
      <p>
        Prices, availability, ratings and specifications come from live third-party listings and can change at any time. Always confirm the
        details on the retailer's page before you buy.
      </p>

      <h2>3. Recommendations are informational</h2>
      <p>
        Rankings, scores and buying insights are produced by automated analysis — by a language model when one is available, otherwise by
        rule-based evaluation. They are guidance, not professional advice or a guarantee of suitability.
      </p>

      <h2>4. Purchases happen on retailer sites</h2>
      <p>
        When you choose an offer you are taken to the retailer. Payment, delivery, returns and warranties are between you and that retailer. The
        ShopMind cart is a saved list and does not place orders.
      </p>

      <h2>5. Acceptable use</h2>
      <ul>
        <li>Don't use automated tools to scrape or overload the service.</li>
        <li>Don't attempt to access the backend, its keys or other users' data.</li>
        <li>Product names, images and trademarks belong to their respective owners.</li>
      </ul>
    </LegalPage>
  );
};

export default TermsOfService;
