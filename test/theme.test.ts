// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/*
 * Seam: the colour tokens in src/index.css, which every utility (`bg-surface`, `text-protein`...) reads.
 * jsdom can't evaluate `prefers-color-scheme`, so the tokens are read from the stylesheet itself.
 */

const css = readFileSync(resolve(import.meta.dirname, "../src/index.css"), "utf8");

type Tokens = Record<string, string>;

function tokensIn(block: string): Tokens {
  return Object.fromEntries([...block.matchAll(/--color-([\w-]+):\s*(#[0-9a-f]{6})\s*;/gi)].map((m) => [m[1], m[2]]));
}

function blockAfter(marker: RegExp): string {
  const start = css.search(marker);
  expect(start, `${marker} in index.css`).toBeGreaterThanOrEqual(0);
  return css.slice(start, css.indexOf("}", start));
}

const light = tokensIn(blockAfter(/@theme\s*\{/));
const dark = tokensIn(blockAfter(/@media \(prefers-color-scheme: dark\)\s*\{[^{]*\{/));

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

// Text token on background token, as the components use them.
const TEXT_PAIRS = [
  ["ink", "page"],
  ["ink", "surface"],
  ["muted", "page"],
  ["muted", "surface"],
  ["muted", "tag"],
  ["protein", "protein-soft"],
  ["carbs", "carbs-soft"],
  ["fat", "fat-soft"],
] as const;

describe("colour theme", () => {
  it("redefines every colour token for the dark system theme", () => {
    expect(Object.keys(light).length).toBeGreaterThan(0);
    expect(Object.keys(dark).sort()).toEqual(Object.keys(light).sort());
    expect(luminance(dark.page)).toBeLessThan(luminance(light.page));
    expect(luminance(dark.ink)).toBeGreaterThan(luminance(light.ink));
  });

  describe.each([
    ["light", light],
    ["dark", dark],
  ])("%s theme", (_name, tokens) => {
    it.each(TEXT_PAIRS)("%s text on %s meets WCAG AA (4.5:1)", (text, background) => {
      expect(contrast(tokens[text], tokens[background])).toBeGreaterThanOrEqual(4.5);
    });

    it.each(["page", "surface"])("the focus ring stands out on %s (3:1)", (background) => {
      expect(contrast(tokens.focus, tokens[background])).toBeGreaterThanOrEqual(3);
    });
  });
});
