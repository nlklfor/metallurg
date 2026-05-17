import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import App from "@/App.tsx";
import WelcomeGate from "@/pages/WelcomeGate.tsx";
import Shop from "@/pages/Shop";
import Contact from "@/pages/Contact";
import Orders from "@/pages/Orders";
import ProductDetails from "@/pages/ProductDetails.tsx";
import Cart from "@/pages/Cart.tsx";
import About from "@/pages/About.tsx";
import Protocol from "@/pages/Protocol.tsx";
import NotFound from "@/pages/NotFound.tsx";
import PageTransition from "@/components/layout/PageTransition";

export default function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <PageTransition>
              <App />
            </PageTransition>
          }
        />
        <Route
          path="/gate/mtl-ch-ua"
          element={
            <PageTransition>
              <WelcomeGate />
            </PageTransition>
          }
        />
        <Route
          path="/inventory"
          element={
            <PageTransition>
              <Shop />
            </PageTransition>
          }
        />
        <Route
          path="/contact"
          element={
            <PageTransition>
              <Contact />
            </PageTransition>
          }
        />
        <Route
          path="/about"
          element={
            <PageTransition>
              <About />
            </PageTransition>
          }
        />
        <Route
          path="/orders"
          element={
            <PageTransition>
              <Orders />
            </PageTransition>
          }
        />
        <Route
          path="/loadout"
          element={
            <PageTransition>
              <Cart />
            </PageTransition>
          }
        />
        <Route path="/cart" element={<Navigate to="/loadout" replace />} />
        <Route
          path="/product/:slug"
          element={
            <PageTransition>
              <ProductDetails />
            </PageTransition>
          }
        />
        <Route
          path="/protocol"
          element={
            <PageTransition>
              <Protocol />
            </PageTransition>
          }
        />
        <Route
          path="*"
          element={
            <PageTransition>
              <NotFound />
            </PageTransition>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
