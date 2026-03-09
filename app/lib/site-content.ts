import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "@/app/lib/supabase/env";
import { getSupabaseServerClient } from "@/app/lib/supabase/server";

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

export type NavLayoutMode = "full" | "hamburger";

export type SiteContent = {
  about: AboutContent;
  mentions: Mention[];
  navLayoutMode: NavLayoutMode;
  updatedAt: string;
};

const SITE_CONTENT_ROW_ID = 1;

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
  navLayoutMode: "hamburger",
  updatedAt: new Date(0).toISOString(),
};

type SiteContentRow = {
  about_eyebrow: string | null;
  about_heading: string | null;
  about_text: string | null;
  nav_layout_mode: string | null;
  updated_at: string | null;
};

type LegacySiteContentRow = {
  about_eyebrow: string | null;
  about_heading: string | null;
  about_text: string | null;
  updated_at: string | null;
};

type SiteMentionRow = {
  id: string | null;
  quote: string | null;
  source: string | null;
  url: string | null;
};

let publicClient: SupabaseClient | null = null;

function normalizeString(value: unknown, fallback = ""): string {
  if (typeof value !== "string") {
    return fallback;
  }
  return value.trim();
}

function normalizeNavLayoutMode(value: unknown): NavLayoutMode {
  return value === "full" ? "full" : "hamburger";
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
  const mentionsById = new Map<string, Mention>();

  for (const mention of normalizedMentions) {
    if (!mentionsById.has(mention.id)) {
      mentionsById.set(mention.id, mention);
    }
  }

  return {
    about: {
      eyebrow: normalizeString((about as Partial<AboutContent>).eyebrow, fallbackContent.about.eyebrow),
      heading: normalizeString((about as Partial<AboutContent>).heading, fallbackContent.about.heading),
      text: normalizeString((about as Partial<AboutContent>).text, fallbackContent.about.text),
    },
    mentions: mentionsProvided ? Array.from(mentionsById.values()) : fallbackContent.mentions,
    navLayoutMode: normalizeNavLayoutMode(value.navLayoutMode),
    updatedAt: normalizeString(value.updatedAt, fallbackContent.updatedAt),
  };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getSupabasePublicClient(): SupabaseClient {
  if (publicClient) {
    return publicClient;
  }

  const { supabaseUrl, supabaseAnonKey } = getSupabaseEnv();
  publicClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
  return publicClient;
}

function isMissingNavLayoutColumnError(error: { message?: string } | null | undefined): boolean {
  const message = error?.message;
  if (typeof message !== "string") {
    return false;
  }

  return message.includes("nav_layout_mode") && message.includes("does not exist");
}

function toSiteContent(contentRow: SiteContentRow | null, mentionRows: SiteMentionRow[]): SiteContent {
  if (!contentRow && mentionRows.length === 0) {
    return fallbackContent;
  }

  const normalizedMentions = mentionRows
    .map((row, index) =>
      normalizeMention(
        {
          id: row.id ?? "",
          quote: row.quote ?? "",
          source: row.source ?? "",
          url: row.url ?? "",
        },
        index
      )
    )
    .filter((mention): mention is Mention => Boolean(mention));

  return {
    about: {
      eyebrow: normalizeString(contentRow?.about_eyebrow, fallbackContent.about.eyebrow),
      heading: normalizeString(contentRow?.about_heading, fallbackContent.about.heading),
      text: normalizeString(contentRow?.about_text, fallbackContent.about.text),
    },
    mentions: normalizedMentions,
    navLayoutMode: normalizeNavLayoutMode(contentRow?.nav_layout_mode),
    updatedAt: normalizeString(contentRow?.updated_at, fallbackContent.updatedAt),
  };
}

async function fetchSiteContent(client: SupabaseClient): Promise<SiteContent> {
  const [mentionsResponse, contentRow] = await Promise.all([
    client
      .from("site_mentions")
      .select("id, quote, source, url")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true }),
    (async (): Promise<SiteContentRow | null> => {
      const contentResponse = await client
        .from("site_content")
        .select("about_eyebrow, about_heading, about_text, nav_layout_mode, updated_at")
        .eq("id", SITE_CONTENT_ROW_ID)
        .maybeSingle();

      if (!contentResponse.error) {
        return (contentResponse.data ?? null) as SiteContentRow | null;
      }

      if (!isMissingNavLayoutColumnError(contentResponse.error)) {
        throw new Error(contentResponse.error.message);
      }

      const legacyResponse = await client
        .from("site_content")
        .select("about_eyebrow, about_heading, about_text, updated_at")
        .eq("id", SITE_CONTENT_ROW_ID)
        .maybeSingle();

      if (legacyResponse.error) {
        throw new Error(legacyResponse.error.message);
      }

      const legacyRow = (legacyResponse.data ?? null) as LegacySiteContentRow | null;
      if (!legacyRow) {
        return null;
      }

      return {
        ...legacyRow,
        nav_layout_mode: fallbackContent.navLayoutMode,
      };
    })(),
  ]);

  if (mentionsResponse.error) {
    throw new Error(mentionsResponse.error.message);
  }

  const mentionRows = (mentionsResponse.data ?? []) as SiteMentionRow[];
  return toSiteContent(contentRow, mentionRows);
}

export async function getSiteContent(): Promise<SiteContent> {
  try {
    const client = getSupabasePublicClient();
    return await fetchSiteContent(client);
  } catch (error) {
    console.error("Failed to load site content from Supabase:", getErrorMessage(error, "Unknown error"));
    return fallbackContent;
  }
}

export async function saveSiteContent(payload: unknown): Promise<SiteContent> {
  const normalized = normalizeSiteContent(payload);
  const client = await getSupabaseServerClient();

  let upsertContent = await client.from("site_content").upsert(
    {
      id: SITE_CONTENT_ROW_ID,
      about_eyebrow: normalized.about.eyebrow,
      about_heading: normalized.about.heading,
      about_text: normalized.about.text,
      nav_layout_mode: normalized.navLayoutMode,
    },
    {
      onConflict: "id",
    }
  );

  if (upsertContent.error && isMissingNavLayoutColumnError(upsertContent.error)) {
    upsertContent = await client.from("site_content").upsert(
      {
        id: SITE_CONTENT_ROW_ID,
        about_eyebrow: normalized.about.eyebrow,
        about_heading: normalized.about.heading,
        about_text: normalized.about.text,
      },
      {
        onConflict: "id",
      }
    );
  }

  if (upsertContent.error) {
    throw new Error(upsertContent.error.message);
  }

  const deleteMentions = await client.from("site_mentions").delete().neq("id", "");
  if (deleteMentions.error) {
    throw new Error(deleteMentions.error.message);
  }

  if (normalized.mentions.length > 0) {
    const mentionsToInsert = normalized.mentions.map((mention, index) => ({
      id: mention.id,
      quote: mention.quote,
      source: mention.source,
      url: mention.url,
      sort_order: index,
    }));

    const insertMentions = await client.from("site_mentions").insert(mentionsToInsert);
    if (insertMentions.error) {
      throw new Error(insertMentions.error.message);
    }
  }

  return fetchSiteContent(client);
}

export async function getSiteNavLayoutMode(): Promise<NavLayoutMode> {
  const content = await getSiteContent();
  return content.navLayoutMode;
}

export async function saveSiteNavLayoutMode(nextMode: NavLayoutMode): Promise<NavLayoutMode> {
  const client = await getSupabaseServerClient();
  const upsertResponse = await client.from("site_content").upsert(
    {
      id: SITE_CONTENT_ROW_ID,
      nav_layout_mode: normalizeNavLayoutMode(nextMode),
    },
    {
      onConflict: "id",
    }
  );

  if (upsertResponse.error) {
    if (isMissingNavLayoutColumnError(upsertResponse.error)) {
      throw new Error(
        "Missing site_content.nav_layout_mode column. Run supabase/content-schema.sql first."
      );
    }
    throw new Error(upsertResponse.error.message);
  }

  return normalizeNavLayoutMode(nextMode);
}
