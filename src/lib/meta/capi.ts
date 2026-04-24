import "server-only";
import crypto from "node:crypto";

import { logger } from "@/lib/logger";

const GRAPH_API_VERSION = "v21.0";

export type MetaUserData = {
  email?: string;
  phone?: string;
  ip?: string;
  userAgent?: string;
  fbp?: string;
  fbc?: string;
};

export type MetaCustomData = {
  value?: number;
  currency?: string;
};

export type MetaLeadEventInput = {
  eventId: string;
  eventSourceUrl: string;
  user: MetaUserData;
  custom?: MetaCustomData;
};

function sha256(value: string): string {
  return crypto
    .createHash("sha256")
    .update(value.trim().toLowerCase())
    .digest("hex");
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("82")) return digits;
  if (digits.startsWith("0")) return `82${digits.slice(1)}`;
  return digits;
}

function buildUserData(user: MetaUserData): Record<string, string> {
  const data: Record<string, string> = {};
  if (user.email) data.em = sha256(user.email);
  if (user.phone) data.ph = sha256(normalizePhone(user.phone));
  if (user.ip) data.client_ip_address = user.ip;
  if (user.userAgent) data.client_user_agent = user.userAgent;
  if (user.fbp) data.fbp = user.fbp;
  if (user.fbc) data.fbc = user.fbc;
  return data;
}

export async function sendMetaLeadEvent(
  input: MetaLeadEventInput
): Promise<void> {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const accessToken = process.env.META_CAPI_ACCESS_TOKEN;
  const testEventCode = process.env.META_CAPI_TEST_EVENT_CODE;

  if (!pixelId || !accessToken) {
    logger.debug(
      "Meta CAPI skipped: NEXT_PUBLIC_META_PIXEL_ID 또는 META_CAPI_ACCESS_TOKEN 누락",
      { context: "meta-capi" }
    );
    return;
  }

  const payload = {
    data: [
      {
        event_name: "Lead",
        event_time: Math.floor(Date.now() / 1000),
        event_id: input.eventId,
        event_source_url: input.eventSourceUrl,
        action_source: "website",
        user_data: buildUserData(input.user),
        ...(input.custom ? { custom_data: input.custom } : {}),
      },
    ],
    ...(testEventCode ? { test_event_code: testEventCode } : {}),
    access_token: accessToken,
  };

  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      logger.error("Meta CAPI 요청 실패", {
        context: "meta-capi",
        data: { status: response.status, body: errorText },
      });
    }
  } catch (error) {
    logger.exception(error, "meta-capi");
  }
}

export function extractFbpFbcFromCookieHeader(
  cookieHeader: string | null | undefined
): { fbp?: string; fbc?: string } {
  if (!cookieHeader) return {};
  const result: { fbp?: string; fbc?: string } = {};
  for (const part of cookieHeader.split(";")) {
    const [rawKey, ...rest] = part.split("=");
    const key = rawKey?.trim();
    const value = rest.join("=").trim();
    if (!key || !value) continue;
    if (key === "_fbp") result.fbp = value;
    else if (key === "_fbc") result.fbc = value;
  }
  return result;
}
