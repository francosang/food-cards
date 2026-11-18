import { useSyncExternalStore, type MouseEvent } from "react";

/**
 * Screens are addressed by the URL hash, so GitHub Pages serves every screen from
 * `index.html` and the browser's back button moves between them.
 */
export type Route = "home" | "history";

export const HISTORY_HASH = "#/historial";

/** Marks the browser history entry of a Historial opened from the Home. */
const FROM_HOME = "food-cards:from-home";

const listeners = new Set<() => void>();

function currentRoute(): Route {
  return window.location.hash === HISTORY_HASH ? "history" : "home";
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  window.addEventListener("hashchange", onChange);
  window.addEventListener("popstate", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("hashchange", onChange);
    window.removeEventListener("popstate", onChange);
  };
}

function changed() {
  for (const listener of listeners) listener();
}

/** The screen the URL points to, kept up to date. */
export function useRoute(): Route {
  return useSyncExternalStore(subscribe, currentRoute);
}

/**
 * Click handler for links to the Historial: opens it in a new history entry marked as
 * coming from the Home, so `goHome` can step back instead of piling up entries.
 * Modified clicks (new tab, etc.) keep the link's default behaviour.
 */
export function openHistory(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  window.history.pushState({ [FROM_HOME]: true }, "", HISTORY_HASH);
  changed();
}

/** Back to the Home: like the browser's back button when the Historial was opened from it. */
export function goHome() {
  const state: unknown = window.history.state;
  if (typeof state === "object" && state !== null && FROM_HOME in state) {
    window.history.back();
    return;
  }
  // Opened directly (a bookmark, a reload): replace the entry, there is no Home to go back to.
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
  changed();
}
