import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { CartProvider } from "./contexts/CartContext";

const App: React.FC = () => <CartProvider><AppRoutes /></CartProvider>;

export default App;
