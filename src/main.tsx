import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import AnimatedRoutes from "./components/layout/AnimatedRoutes.tsx";
import BottomBar from "./components/layout/BottomBar.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AnimatedRoutes />
      <BottomBar />
      {/* One toaster for the whole app: top-right, just under the 64px navbar. */}
      <Toaster position="top-right" containerStyle={{ top: 72, right: 16, left: 16 }} gutter={8} />
    </BrowserRouter>
  </StrictMode>
);
