import type {NextRequest} from "next/server";

type SupabaseJwtPayload = {
  sub?: string;
  exp?: number;
  app_metadata?: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type SupabaseMiddlewareUser = {
  id: string;
  app_metadata: Record<string, unknown>;
  payload: SupabaseJwtPayload;
};

const BASE64_LOOKUP = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

function extractProjectRef(url: string): string | null {
  try {
    const {hostname} = new URL(url);
    const match = hostname.match(/^([^.]+)\.supabase\.co$/i);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

function decodeBase64UrlSegment(segment: string): Uint8Array | null {
  const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");

  let buffer = 0;
  let bits = 0;
  let index = 0;
  let outputLength = (padded.length / 4) * 3;

  if (padded.endsWith("==")) {
    outputLength -= 2;
  } else if (padded.endsWith("=")) {
    outputLength -= 1;
  }

  const output = new Uint8Array(outputLength);

  for (const char of padded) {
    if (char === "=") {
      break;
    }

    const value = BASE64_LOOKUP.indexOf(char);

    if (value === -1) {
      return null;
    }

    buffer = (buffer << 6) | value;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output[index++] = (buffer >> bits) & 0xff;
    }
  }

  return output;
}

function decodeJwtPayload(token: string): SupabaseJwtPayload | null {
  const parts = token.split(".");

  if (parts.length < 2) {
    return null;
  }

  const payloadBytes = decodeBase64UrlSegment(parts[1]);

  if (!payloadBytes) {
    return null;
  }

  try {
    const json = new TextDecoder().decode(payloadBytes);
    return JSON.parse(json) as SupabaseJwtPayload;
  } catch {
    return null;
  }
}

function tryParseJson(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function extractAccessTokenFromValue(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  const parsed = tryParseJson(value);

  if (typeof parsed === "string") {
    return parsed;
  }

  if (parsed && typeof parsed === "object") {
    if (
      "access_token" in parsed &&
      typeof (parsed as Record<string, unknown>).access_token === "string"
    ) {
      return (parsed as Record<string, string>).access_token;
    }

    if (
      "currentSession" in parsed &&
      parsed.currentSession &&
      typeof (parsed.currentSession as Record<string, unknown>).access_token === "string"
    ) {
      return (parsed.currentSession as Record<string, string>).access_token;
    }

    if (Array.isArray(parsed)) {
      for (const item of parsed) {
        if (!item || typeof item !== "object") {
          continue;
        }

        const container = item as Record<string, unknown>;
        const token = container.access_token ?? (container.value as Record<string, unknown> | undefined)?.access_token;

        if (typeof token === "string") {
          return token;
        }
      }
    }
  }

  return value;
}

function resolveAccessToken(request: NextRequest, projectRef: string | null): string | null {
  const candidateNames = ["sb-access-token", "supabase-auth-token"];

  if (projectRef) {
    candidateNames.unshift(`sb-${projectRef}-access-token`, `sb-${projectRef}-auth-token`);
  }

  for (const name of candidateNames) {
    const cookieValue = request.cookies.get(name)?.value;
    const token = extractAccessTokenFromValue(cookieValue);

    if (token) {
      return token;
    }
  }

  return null;
}

export function getSupabaseUserFromRequest(request: NextRequest): SupabaseMiddlewareUser | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    throw new Error("MIDDLEWARE: Missing Supabase environment variables");
  }

  const projectRef = extractProjectRef(supabaseUrl);
  const accessToken = resolveAccessToken(request, projectRef);

  if (!accessToken) {
    return null;
  }

  const payload = decodeJwtPayload(accessToken);

  if (!payload) {
    return null;
  }

  const exp = typeof payload.exp === "number" ? payload.exp : null;

  if (exp && exp * 1000 <= Date.now()) {
    return null;
  }

  const id = typeof payload.sub === "string" ? payload.sub : null;

  if (!id) {
    return null;
  }

  const appMetadata =
    payload.app_metadata && typeof payload.app_metadata === "object"
      ? (payload.app_metadata as Record<string, unknown>)
      : {};

  return {
    id,
    app_metadata: appMetadata,
    payload,
  };
}
