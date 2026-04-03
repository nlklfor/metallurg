import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import WelcomeGate from "./pages/WelcomeGate.tsx";
import Shop from "./pages/Shop";
import Contact from "./pages/Contact";
import Orders from "./pages/Orders";
import ProductDetails from "./pages/ProductDetails.tsx";
import Cart from "./pages/Cart.tsx";
import About from "./pages/About.tsx";
import Protocol from "./pages/Protocol.tsx";
import NotFound from "./pages/NotFound.tsx";
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/gate/mtl-ch-ua" element={<WelcomeGate />} />
        <Route path="/inventory" element={<Shop />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/loadout" element={<Cart />} />
        <Route path="/cart" element={<Navigate to="/loadout" replace />} />
        <Route path="/product/:slug" element={<ProductDetails />} />
        <Route path="/protocol" element={<Protocol />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
