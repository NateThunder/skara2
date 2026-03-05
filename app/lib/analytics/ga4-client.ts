import { createSign } from "node:crypto";
import { readFile } from "node:fs/promises";
import {
  ANALYTICS_PLACEHOLDERS,
  type WidgetErrorResponse,
} from "@/app/lib/analytics/contracts";

export type GoogleMetric = {
  name: string;
};

export type GoogleDimension = {
  name: string;
};

export type GoogleFilterExpression = {
  filter?: {
    fieldName: string;
    stringFilter?: {
      value: string;
      matchType?: "EXACT" | "CONTAINS" | "FULL_REGEXP";
      caseSensitive?: boolean;
    };
    inListFilter?: {
      values: string[];
      caseSensitive?: boolean;
    };
  };
  andGroup?: {
    expressions: GoogleFilterExpression[];
  };
};

export type RunReportRequest = {
  dateRanges: Array<{
    startDate: string;
    endDate: string;
  }>;
  metrics: GoogleMetric[];
  dimensions?: GoogleDimension[];
  orderBys?: Array<{
    metric?: {
      metricName: string;
    };
    dimension?: {
      dimensionName: string;
    };
    desc?: boolean;
  }>;
  dimensionFilter?: GoogleFilterExpression;
  limit?: number;
};

export type RunReportResponse = {
  metricHeaders?: Array<{ name?: string }>;
  dimensionHeaders?: Array<{ name?: string }>;
  rows?: Array<{
    metricValues?: Array<{ value?: string }>;
    dimensionValues?: Array<{ value?: string }>;
  }>;
};

type ResolvedGoogleCredentials = {
  clientEmail: string;
  privateKey: string;
};

export type Ga4Client = {
  propertyId: string;
  keyEvents: string[];
  runReport: (payload: RunReportRequest) => Promise<RunReportResponse>;
};

type AccessTokenCache = {
  token: string;
  expiresAt: number;
};

let tokenCache: AccessTokenCache | null = null;

function toBase64Url(value: string): string {
  return Buffer.from(value)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function createServiceJwt(clientEmail: string, privateKey: string): string {
  const now = Math.floor(Date.now() / 1000);
  const header = toBase64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = toBase64Url(
    JSON.stringify({
      iss: clientEmail,
      sub: clientEmail,
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
      scope: "https://www.googleapis.com/auth/analytics.readonly",
    })
  );

  const unsignedToken = `${header}.${payload}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const signature = signer.sign(privateKey, "base64url");

  return `${unsignedToken}.${signature}`;
}

async function getGoogleAccessToken(credentials: ResolvedGoogleCredentials): Promise<string> {
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now) {
    return tokenCache.token;
  }

  const assertion = createServiceJwt(credentials.clientEmail, credentials.privateKey);
  const body = new URLSearchParams({
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    assertion,
  });

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    throw new Error(`Token request failed: ${errorText}`);
  }

  const tokenJson = (await tokenResponse.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!tokenJson.access_token) {
    throw new Error("Google token response did not include access_token.");
  }

  const ttlMs = Math.max((tokenJson.expires_in ?? 3600) - 120, 60) * 1000;
  tokenCache = {
    token: tokenJson.access_token,
    expiresAt: Date.now() + ttlMs,
  };

  return tokenJson.access_token;
}

async function loadCredentialsFromServiceAccountFile(
  filePath: string
): Promise<ResolvedGoogleCredentials> {
  const rawCredentials = await readFile(filePath, "utf8");
  const parsed = JSON.parse(rawCredentials) as {
    client_email?: string;
    private_key?: string;
  };

  if (!parsed.client_email || !parsed.private_key) {
    throw new Error(
      "Service account JSON is missing client_email/private_key. Recreate the key and try again."
    );
  }

  return {
    clientEmail: parsed.client_email,
    privateKey: parsed.private_key,
  };
}

async function resolveGoogleCredentials(): Promise<ResolvedGoogleCredentials | null> {
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKeyRaw = process.env.GOOGLE_PRIVATE_KEY;

  if (clientEmail && privateKeyRaw) {
    return {
      clientEmail,
      privateKey: privateKeyRaw.replace(/\\n/g, "\n"),
    };
  }

  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (!serviceAccountPath) {
    return null;
  }

  return loadCredentialsFromServiceAccountFile(serviceAccountPath);
}

function resolveKeyEvents(): string[] {
  const raw = process.env.GA4_KEY_EVENTS ?? "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

function createConfigurationError(message: string): WidgetErrorResponse {
  return {
    configured: false,
    error: message,
    placeholders: ANALYTICS_PLACEHOLDERS,
  };
}

export async function createGa4Client(): Promise<
  { configured: true; client: Ga4Client } | WidgetErrorResponse
> {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID;
  if (!propertyId) {
    return createConfigurationError(
      "GA4 Data API is not configured. Set GOOGLE_ANALYTICS_PROPERTY_ID with your client property ID."
    );
  }

  let credentials: ResolvedGoogleCredentials | null = null;
  try {
    credentials = await resolveGoogleCredentials();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read GA4 credentials.";
    return createConfigurationError(`GA4 credentials could not be loaded. ${message}`);
  }

  if (!credentials) {
    return createConfigurationError(
      "GA4 credentials are missing. Configure GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_CLIENT_EMAIL + GOOGLE_PRIVATE_KEY."
    );
  }

  return {
    configured: true,
    client: {
      propertyId,
      keyEvents: resolveKeyEvents(),
      runReport: async (payload: RunReportRequest) => {
        const accessToken = await getGoogleAccessToken(credentials);
        const response = await fetch(
          `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const text = await response.text();
          throw new Error(`Analytics request failed: ${text}`);
        }

        return (await response.json()) as RunReportResponse;
      },
    },
  };
}

export function toWidgetErrorResponse(error: unknown): WidgetErrorResponse {
  const message = error instanceof Error ? error.message : "Failed to fetch GA4 data.";
  return {
    configured: false,
    error: message,
    placeholders: ANALYTICS_PLACEHOLDERS,
  };
}
