import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Generates the app icons in public/ from public/icon.svg: `npm run icons`.
// Maskable and Apple icons are opaque, padded with the icon's own background.
const background = { background: "#1c1b19", fit: "contain" } as const;

export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    maskable: { sizes: [512], padding: 0.3, resizeOptions: background },
    apple: { sizes: [180], padding: 0.1, resizeOptions: background },
  },
  images: ["public/icon.svg"],
});
