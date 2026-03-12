import { validateBookingEnquiry } from "@/app/lib/booking-enquiries";
import {
  buildBookingEmailHtml,
  getBookingEmailConfig,
  missingBookingEmailEnvMessage,
} from "@/app/lib/booking-email";

function json(body: unknown, init?: ResponseInit): Response {
  return Response.json(body, init);
}

async function getZohoAccessToken(config: ReturnType<typeof getBookingEmailConfig>): Promise<string> {
  const tokenResponse = await fetch("https://accounts.zoho.eu/oauth/v2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: config.zohoClientId,
      client_secret: config.zohoClientSecret,
      refresh_token: config.zohoRefreshToken,
    }),
  });

  if (!tokenResponse.ok) {
    const responseText = await tokenResponse.text();
    throw new Error(`Zoho token refresh failed: ${responseText}`);
  }

  const tokenBody = (await tokenResponse.json().catch(() => null)) as { access_token?: string } | null;
  if (!tokenBody?.access_token) {
    throw new Error("Zoho token refresh failed: missing access token.");
  }

  return tokenBody.access_token;
}

export async function POST(request: Request): Promise<Response> {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return json(
      { error: "Invalid request body. Please submit valid JSON." },
      { status: 400 }
    );
  }

  if (!payload || typeof payload !== "object") {
    return json(
      { error: "Invalid request body. Please submit valid JSON." },
      { status: 400 }
    );
  }

  const validation = validateBookingEnquiry(payload);
  if (!validation.ok) {
    return json({ error: validation.error }, { status: 400 });
  }

  if (validation.data.botField) {
    return json({ ok: true }, { status: 200 });
  }

  try {
    const forwardedFor =
      request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for");
    const userAgent = request.headers.get("user-agent") ?? "";
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : "";
    const config = getBookingEmailConfig();
    const accessToken = await getZohoAccessToken(config);

    const emailResponse = await fetch(`https://mail.zoho.eu/api/accounts/${config.zohoAccountId}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Zoho-oauthtoken ${accessToken}`,
      },
      body: JSON.stringify({
        fromAddress: config.fromEmail,
        toAddress: config.toEmail,
        subject: `New booking enquiry from ${validation.data.name}`,
        content: buildBookingEmailHtml(validation.data, {
          ipAddress,
          userAgent,
        }),
        mailFormat: "html",
      }),
    });

    if (!emailResponse.ok) {
      const responseText = await emailResponse.text();
      console.error("Failed to send booking enquiry email", responseText);
      return json(
        { error: "We could not send that enquiry. Please try again or email us directly." },
        { status: 500 }
      );
    }

    await emailResponse.text().catch(() => null);

    return json({ ok: true }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === missingBookingEmailEnvMessage) {
      return json(
        { error: "Form handling is not configured yet. Please email us directly for now." },
        { status: 503 }
      );
    }

    console.error("Unexpected booking enquiry failure", error);
    return json(
      { error: "We could not send that enquiry. Please try again or email us directly." },
      { status: 500 }
    );
  }
}
