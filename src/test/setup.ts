import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import { polyfillDialog } from "./dialogPolyfill";

polyfillDialog();

afterEach(() => {
  cleanup();
  // Every test starts on the Home: drop the hash a test may have navigated to.
  // (Node-environment tests, like test/theme.test.ts, have no window.)
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", window.location.pathname + window.location.search);
  }
});
