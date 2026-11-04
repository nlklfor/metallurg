import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
// Fonts are bundled with the site (no Google Fonts request), so localhost,
// preview and production always render the same IBM Plex Mono / Archivo Black.
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "@fontsource/ibm-plex-mono/600.css";
import "@fontsource/ibm-plex-mono/700.css";
import "@fontsource/archivo-black/400.css";
import "./index.css";
import AnimatedRoutes from "./components/layout/AnimatedRoutes.tsx";
import BottomBar from "./components/layout/BottomBar.tsx";
import LoadoutDrawer from "./components/cart/LoadoutDrawer.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AnimatedRoutes />
      <BottomBar />
      <LoadoutDrawer />
      {/* One toaster for the whole app: top-right, just under the 64px navbar. */}
      <Toaster position="top-right" containerStyle={{ top: 72, right: 16, left: 16 }} gutter={8} />
    </BrowserRouter>
  </StrictMode>
);
