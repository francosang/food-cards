// @vitest-environment node
import { mkdtempSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build } from "vite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

/*
 * Seam: the production build output. GitHub Pages serves `dist/` under /food-cards/,
 * so what the browser sees is exactly these files.
 */

const BASE = "/food-cards/";
const root = resolve(import.meta.dirname, "..");
let outDir: string;

interface ManifestIcon {
  src: string;
  sizes: string;
  type?: string;
  purpose?: string;
}
interface Manifest {
  name: string;
  short_name: string;
  lang: string;
  start_url: string;
  scope: string;
  display: string;
  theme_color: string;
  background_color: string;
  icons: ManifestIcon[];
}

function read(path: string): string {
  return readFileSync(join(outDir, path), "utf8");
}

/** Maps a URL the page references (absolute under BASE or relative) to its file in dist. */
function fileFor(url: string): string {
  const path = url.startsWith(BASE) ? url.slice(BASE.length) : url;
  return join(outDir, path);
}

function pngSize(file: string): string {
  const bytes = readFileSync(file);
  expect(bytes.subarray(1, 4).toString("ascii")).toBe("PNG");
  return `${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`;
}

function linkHref(html: string, rel: string): string | undefined {
  const tag = html.match(new RegExp(`<link[^>]*rel="${rel}"[^>]*>`))?.[0];
  return tag?.match(/href="([^"]+)"/)?.[1];
}

beforeAll(async () => {
  outDir = mkdtempSync(join(tmpdir(), "food-cards-build-"));
  await build({ root, logLevel: "silent", build: { outDir, emptyOutDir: true } });
}, 120_000);

afterAll(() => {
  rmSync(outDir, { recursive: true, force: true });
});

describe("PWA build output", () => {
  function manifest(): Manifest {
    const href = linkHref(read("index.html"), "manifest");
    expect(href).toBeDefined();
    return JSON.parse(readFileSync(fileFor(href!), "utf8")) as Manifest;
  }

  it("links a Spanish manifest that installs the app under /food-cards/", () => {
    const m = manifest();
    expect(m.name).toBe("Tarjetas de comida");
    expect(m.short_name).toBe("Tarjetas");
    expect(m.lang).toBe("es");
    expect(m.start_url).toBe(BASE);
    expect(m.scope).toBe(BASE);
    expect(m.display).toBe("standalone");
    expect(m.theme_color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(m.background_color).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("ships the PNG icons Chrome needs to install it, at their declared sizes", () => {
    const icons = manifest().icons;
    const any = icons.filter((i) => !i.purpose || i.purpose.split(" ").includes("any"));
    const maskable = icons.filter((i) => i.purpose?.split(" ").includes("maskable"));

    expect(any.map((i) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));
    expect(maskable.map((i) => i.sizes)).toContain("512x512");
    for (const icon of icons) {
      expect(icon.type).toBe("image/png");
      // Icon srcs in the manifest are relative to the manifest, which sits at BASE.
      expect(pngSize(fileFor(icon.src))).toBe(icon.sizes);
    }
  });

  it("gives iOS an apple-touch-icon and a home-screen title", () => {
    const html = read("index.html");
    const href = linkHref(html, "apple-touch-icon");
    expect(href).toBeDefined();
    expect(pngSize(fileFor(href!))).toBe("180x180");
    expect(html).toMatch(/<meta name="apple-mobile-web-app-title" content="Tarjetas"/);
  });

  it("declares a theme colour for both light and dark system themes", () => {
    const html = read("index.html");
    expect(html).toMatch(/<meta name="theme-color" content="#[0-9a-f]{6}" media="\(prefers-color-scheme: light\)"/i);
    expect(html).toMatch(/<meta name="theme-color" content="#[0-9a-f]{6}" media="\(prefers-color-scheme: dark\)"/i);
  });

  it("has a service worker that precaches the page, its bundle, the icons and the manifest", () => {
    expect(existsSync(join(outDir, "sw.js"))).toBe(true);
    const sw = read("sw.js");
    const html = read("index.html");
    const assets = [...html.matchAll(/(?:src|href)="(\/food-cards\/assets\/[^"]+)"/g)].map((m) => m[1].slice(BASE.length));

    expect(assets.length).toBeGreaterThan(0);
    for (const url of ["index.html", "manifest.webmanifest", ...assets, ...manifest().icons.map((i) => i.src)]) {
      expect(sw, `precache entry for ${url}`).toContain(`"${url}"`);
    }
  });

  it("activates a new service worker as soon as a new version is published", () => {
    const sw = read("sw.js");
    expect(sw).toContain("skipWaiting");
    expect(sw).toContain("clientsClaim");
  });
});
