import { beforeEach, describe, expect, it, vi } from "vitest";

const { fetchMock } = vi.hoisted(() => {
  const fetchMock = vi.fn();

  return {
    fetchMock,
  };
});

import { POST } from "@/app/api/enquiries/route";
import { validateBookingEnquiry } from "@/app/lib/booking-enquiries";

beforeEach(() => {
  fetchMock.mockReset();
  vi.stubGlobal("fetch", fetchMock);
  process.env.ZOHO_CLIENT_ID = "zoho_client_id";
  process.env.ZOHO_CLIENT_SECRET = "zoho_client_secret";
  process.env.ZOHO_REFRESH_TOKEN = "zoho_refresh_token";
  process.env.ZOHO_ACCOUNT_ID = "8258833000000002002";
  process.env.BOOKING_EMAIL_TO = "info@skaraceilidh.com";
  delete process.env.ZOHO_FROM_EMAIL;
});

describe("booking enquiry validation", () => {
  it("rejects invalid email addresses", () => {
    expect(
      validateBookingEnquiry({
        name: "Test User",
        email: "not-an-email",
        date: "2026-06-12",
      })
    ).toEqual({
      ok: false,
      error: "Enter a valid email address.",
    });
  });

  it("accepts valid payloads", () => {
    expect(
      validateBookingEnquiry({
        name: "Test User",
        email: "test@example.com",
        phone: "123",
        date: "2026-06-12",
        eventType: "Wedding",
        location: "Glasgow",
        message: "Hello",
      })
    ).toEqual({
      ok: true,
      data: {
        name: "Test User",
        email: "test@example.com",
        phone: "123",
        date: "2026-06-12",
        eventType: "Wedding",
        location: "Glasgow",
        message: "Hello",
        botField: "",
        source: "website",
      },
    });
  });
});

describe("booking enquiries route", () => {
  it("rejects malformed JSON", async () => {
    const request = new Request("https://example.com/api/enquiries", {
      method: "POST",
      body: "{bad-json",
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid request body. Please submit valid JSON.",
    });
  });

  it("sends a valid enquiry by email", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: "zoho_access_token" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ status: { code: 200, description: "success" } }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );

    const request = new Request("https://example.com/api/enquiries", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        date: "2026-06-12",
        phone: "+44 7000",
        eventType: "Wedding",
        location: "Edinburgh",
        message: "Need a ceilidh band",
        source: "contact-faq-section",
      }),
      headers: {
        "content-type": "application/json",
        "user-agent": "Vitest",
        "cf-connecting-ip": "203.0.113.7",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://accounts.zoho.eu/oauth/v2/token",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/x-www-form-urlencoded",
        }),
      })
    );
    const [, tokenInit] = fetchMock.mock.calls[0];
    expect(String(tokenInit?.body)).toContain("grant_type=refresh_token");
    expect(String(tokenInit?.body)).toContain("client_id=zoho_client_id");
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://mail.zoho.eu/api/accounts/8258833000000002002/messages",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          Authorization: "Zoho-oauthtoken zoho_access_token",
        }),
      })
    );
    const [, sendInit] = fetchMock.mock.calls[1];
    expect(JSON.parse(String(sendInit?.body))).toMatchObject({
      fromAddress: "info@skaraceilidh.com",
      toAddress: "info@skaraceilidh.com",
      subject: "New booking enquiry from Test User",
      mailFormat: "html",
    });
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("silently accepts honeypot submissions without sending email", async () => {
    const request = new Request("https://example.com/api/enquiries", {
      method: "POST",
      body: JSON.stringify({
        name: "Bot",
        email: "bot@example.com",
        date: "2026-06-12",
        botField: "spam",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it("returns a configuration error when email env vars are missing", async () => {
    delete process.env.ZOHO_CLIENT_ID;

    const request = new Request("https://example.com/api/enquiries", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        date: "2026-06-12",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(503);
    expect(fetchMock).not.toHaveBeenCalled();
    await expect(response.json()).resolves.toEqual({
      error: "Form handling is not configured yet. Please email us directly for now.",
    });
  });

  it("returns an error when the email provider rejects the send", async () => {
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ access_token: "zoho_access_token" }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      })
    );
    fetchMock.mockResolvedValueOnce(
      new Response(JSON.stringify({ message: "bad request" }), {
        status: 400,
        headers: {
          "content-type": "application/json",
        },
      })
    );

    const request = new Request("https://example.com/api/enquiries", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        date: "2026-06-12",
      }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await POST(request);

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      error: "We could not send that enquiry. Please try again or email us directly.",
    });
  });
});
