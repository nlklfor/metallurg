import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import App from "@/App.tsx";
import PageTransition from "@/components/layout/PageTransition";

// The landing page ships in the main bundle; every other page is its own
// chunk. The gate (3D logo, ~1 MB of three.js) is only loaded on /gate.
const loadShop = () => import("@/pages/Shop");
const loadProduct = () => import("@/pages/ProductDetails.tsx");
const loadCart = () => import("@/pages/Cart.tsx");
const loadOrders = () => import("@/pages/Orders");
const loadContact = () => import("@/pages/Contact");
const loadAbout = () => import("@/pages/About.tsx");
const loadProtocol = () => import("@/pages/Protocol.tsx");
const loadNotFound = () => import("@/pages/NotFound.tsx");

const WelcomeGate = lazy(() => import("@/pages/WelcomeGate.tsx"));
const Shop = lazy(loadShop);
const ProductDetails = lazy(loadProduct);
const Cart = lazy(loadCart);
const Orders = lazy(loadOrders);
const Contact = lazy(loadContact);
const About = lazy(loadAbout);
const Protocol = lazy(loadProtocol);
const NotFound = lazy(loadNotFound);

/** Once the first page is up, fetch the other page chunks in the background so
 *  navigating doesn't wait for the network. (The gate is left out.) */
function usePrefetchPages() {
  useEffect(() => {
    const run = () => {
      for (const load of [
        loadShop,
        loadProduct,
        loadCart,
        loadOrders,
        loadContact,
        loadAbout,
        loadProtocol,
        loadNotFound,
      ]) {
        load().catch(() => {});
      }
    };
    const w = window as Window & { requestIdleCallback?: (cb: () => void) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(run);
    else setTimeout(run, 2000);
  }, []);
}

/** Page wrapper: transition + a blank full-height placeholder while the chunk loads. */
function Page({ children }: { children: ReactNode }) {
  return (
    <PageTransition>
      <Suspense fallback={<div className="min-h-[100dvh]" />}>{children}</Suspense>
    </PageTransition>
  );
}

export default function AnimatedRoutes() {
  const location = useLocation();
  usePrefetchPages();

  // Each new page starts at the top: scroll once the old page has left.
  return (
    <AnimatePresence
      mode="wait"
      onExitComplete={() => window.scrollTo({ top: 0, left: 0, behavior: "instant" })}
    >
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <Page>
              <App />
            </Page>
          }
        />
        <Route
          path="/gate/mtl-ch-ua"
          element={
            <Page>
              <WelcomeGate />
            </Page>
          }
        />
        <Route
          path="/inventory"
          element={
            <Page>
              <Shop />
            </Page>
          }
        />
        <Route
          path="/contact"
          element={
            <Page>
              <Contact />
            </Page>
          }
        />
        <Route
          path="/about"
          element={
            <Page>
              <About />
            </Page>
          }
        />
        <Route
          path="/orders"
          element={
            <Page>
              <Orders />
            </Page>
          }
        />
        <Route
          path="/loadout"
          element={
            <Page>
              <Cart />
            </Page>
          }
        />
        <Route path="/cart" element={<Navigate to="/loadout" replace />} />
        <Route
          path="/product/:slug"
          element={
            <Page>
              <ProductDetails />
            </Page>
          }
        />
        <Route
          path="/protocol"
          element={
            <Page>
              <Protocol />
            </Page>
          }
        />
        <Route
          path="*"
          element={
            <Page>
              <NotFound />
            </Page>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}
