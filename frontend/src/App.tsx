import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./contexts/CartContext";
import { CompareProvider } from "./contexts/CompareContext";
import { AgentProvider } from "./agent/AgentProvider";

const App = () => (
  <CartProvider>
    <CompareProvider>
      <AgentProvider>
        <AppRoutes />
      </AgentProvider>
    </CompareProvider>
  </CartProvider>
);

export default App;
