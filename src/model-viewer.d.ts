import type React from "react";

declare module "*.glb?url" {
  const src: string;
  export default src;
}

declare module "*.glb" {
  const src: string;
  export default src;
}

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          src?: string;
          "auto-rotate"?: boolean;
          "disable-zoom"?: boolean;
          "camera-controls"?: string;
          "environment-image"?: string;
          "rotation-per-second"?: string;
          "shadow-intensity"?: string;
          "camera-orbit"?: string;
          "field-of-view"?: string;
          exposure?: string;
          alt?: string;
        },
        HTMLElement
      >;
    }
  }
}
