import { LegalPage } from "../components/layout/LegalPage";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const PrivacyPolicy = () => {
  useDocumentTitle("Privacy Policy");
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="November 2026"
      intro="ShopMind AI is built to help you shop without handing over personal data. You don't need an account, and we don't track you across the web."
    >
      <h2>1. Information we process</h2>
      <p>
        No account is required. When you search or chat, the text you enter is sent to the ShopMind backend so it can find and analyse products. We
        don't ask for your name, email address or payment details.
      </p>

      <h2>2. Third-party services</h2>
      <ul>
        <li>
          <strong>Google Shopping via SerpApi</strong> — your search terms are used to retrieve live product listings, prices and retailer links.
        </li>
        <li>
          <strong>OpenRouter</strong> — your request and the retrieved listings may be sent to a language model to write shopping analysis and chat
          replies.
        </li>
        <li>
          <strong>Retailers</strong> — when you open an offer, you leave ShopMind and the retailer's own privacy policy applies.
        </li>
      </ul>

      <h2>3. Storage on your device</h2>
      <p>
        Your browser's local storage keeps your cart between visits. Session storage briefly keeps recent search results and your comparison
        selection so navigating back is instant. Voice input, if you use it, is handled by your browser; ShopMind only receives the final text.
      </p>
      <p>ShopMind does not use advertising or behavioural tracking cookies.</p>

      <h2>4. Retention and security</h2>
      <p>
        The backend may briefly cache product listings to keep results fast and reduce repeated lookups. API keys for third-party services are kept
        on the server and are never sent to your browser.
      </p>

      <h2>5. Questions</h2>
      <p>
        For privacy questions, email <a href="mailto:lochanap2005@gmail.com?subject=ShopMind%20AI%20Privacy" className="text-jade-700 underline underline-offset-4">lochanap2005@gmail.com</a>.
      </p>
    </LegalPage>
  );
};

export default PrivacyPolicy;
