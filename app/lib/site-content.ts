import { promises as fs } from "node:fs";
import path from "node:path";

export type AboutContent = {
  eyebrow: string;
  heading: string;
  text: string;
};

export type Mention = {
  id: string;
  quote: string;
  source: string;
  url: string;
};

export type SiteContent = {
  about: AboutContent;
  mentions: Mention[];
  updatedAt: string;
};

const contentFilePath = path.join(process.cwd(), "data", "site-content.json");

const fallbackContent: SiteContent = {
  about: {
    eyebrow: "About",
    heading: "Traditional roots.\nModern lift.",
    text: "Skara is a four-piece ceilidh line-up blending fiddle, pipes, guitar and drums into a polished live sound that keeps dance floors moving.",
  },
  mentions: [
    {
      id: "siobhan-amy-photography",
      quote: "\"Kept them up and dancing for hours!\"",
      source: "Siobhan Amy Photography",
      url: "",
    },
    {
      id: "cluarantonn-scottish-digest",
      quote: "\"A really good ceilidh dance band.\"",
      source: "Cluarantonn (Scottish Digest)",
      url: "",
    },
    {
      id: "perth-racecourse-hogmanay-hoolie",
      quote: "\"Live ceilidh music ... to keep you dancing all night.\"",
      source: "Perth Racecourse (Hogmanay Hoolie)",
      url: "",
    },
  ],
  updatedAt: new Date(0).toISOString(),
};

function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim();
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 72);
}

function normalizeMention(raw: unknown, index: number): Mention | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const mention = raw as Partial<Mention>;
  const quote = normalizeString(mention.quote);
  const source = normalizeString(mention.source);

  if (!quote || !source) {
    return null;
  }

  const idCandidate = normalizeString(mention.id) || slugify(source) || `mention-${index + 1}`;
  const url = normalizeString(mention.url);

  return {
    id: idCandidate,
    quote,
    source,
    url,
  };
}

export function normalizeSiteContent(raw: unknown): SiteContent {
  if (!raw || typeof raw !== "object") {
    return fallbackContent;
  }

  const value = raw as Partial<SiteContent>;
  const about = value.about ?? {};
  const mentionsArray = Array.isArray(value.mentions) ? value.mentions : [];
  const mentionsProvided = Array.isArray(value.mentions);
  const normalizedMentions = mentionsArray
    .map((mention, index) => normalizeMention(mention, index))
    .filter((mention): mention is Mention => Boolean(mention));

  return {
    about: {
      eyebrow: normalizeString((about as Partial<AboutContent>).eyebrow, fallbackContent.about.eyebrow),
      heading: normalizeString((about as Partial<AboutContent>).heading, fallbackContent.about.heading),
      text: normalizeString((about as Partial<AboutContent>).text, fallbackContent.about.text),
    },
    mentions: mentionsProvided ? normalizedMentions : fallbackContent.mentions,
    updatedAt: normalizeString(value.updatedAt, fallbackContent.updatedAt),
  };
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const file = await fs.readFile(contentFilePath, "utf8");
    const parsed = JSON.parse(file) as unknown;
    return normalizeSiteContent(parsed);
  } catch {
    return fallbackContent;
  }
}

export async function saveSiteContent(payload: unknown): Promise<SiteContent> {
  const normalized = normalizeSiteContent(payload);
  const contentToWrite: SiteContent = {
    ...normalized,
    updatedAt: new Date().toISOString(),
  };

  await fs.mkdir(path.dirname(contentFilePath), { recursive: true });
  await fs.writeFile(contentFilePath, `${JSON.stringify(contentToWrite, null, 2)}\n`, "utf8");
  return contentToWrite;
}
