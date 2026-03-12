import { describe, expect, it } from "vitest";
import { normalizeSiteContent } from "@/app/lib/site-content";

describe("normalizeSiteContent adversarial payloads", () => {
  it("drops corrupt mentions, deduplicates ids, and normalizes invalid layout modes", () => {
    const normalized = normalizeSiteContent({
      about: {
        eyebrow: "  Fresh  ",
        heading: "  Heading  ",
        text: "  Copy  ",
      },
      mentions: [
        { id: "dup", quote: "First quote", source: "Source One", url: " https://example.com/one " },
        { id: "dup", quote: "Second quote", source: "Source Two", url: "https://example.com/two" },
        { id: "missing-quote", quote: " ", source: "Broken Source" },
        { source: "Slug Me", quote: "Valid without an id", url: " " },
        null,
      ],
      navLayoutMode: "sidebar",
      updatedAt: " 2026-03-09T00:00:00.000Z ",
    });

    expect(normalized.about).toEqual({
      eyebrow: "Fresh",
      heading: "Heading",
      text: "Copy",
    });
    expect(normalized.navLayoutMode).toBe("hamburger");
    expect(normalized.updatedAt).toBe("2026-03-09T00:00:00.000Z");
    expect(normalized.mentions).toEqual([
      {
        id: "dup",
        quote: "First quote",
        source: "Source One",
        url: "https://example.com/one",
      },
      {
        id: "slug-me",
        quote: "Valid without an id",
        source: "Slug Me",
        url: "",
      },
    ]);
  });

  it("falls back to safe defaults when the payload is not an object", () => {
    const normalized = normalizeSiteContent("break me");

    expect(normalized.about.eyebrow).toBe("About");
    expect(normalized.navLayoutMode).toBe("hamburger");
    expect(normalized.mentions).toHaveLength(3);
  });
});
