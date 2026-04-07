import { kv } from "@vercel/kv";

const MAX_FREE_PROPOSALS = 3;

/**
 * Get the real client IP from Vercel request headers.
 */
export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket?.remoteAddress || "unknown";
}

/**
 * Check and increment the IP-based rate limit.
 * Returns { allowed: true } if the request can proceed.
 * Returns { allowed: false, used, max } if the limit has been reached.
 * Falls through (allowed: true) if KV is not configured.
 */
export async function checkRateLimit(ip) {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) {
    console.warn("[rate-limit] Vercel KV not configured — skipping rate limit check.");
    return { allowed: true };
  }

  const key = `proposals:ip:${ip}`;

  try {
    const used = (await kv.get(key)) || 0;

    if (used >= MAX_FREE_PROPOSALS) {
      return { allowed: false, used, max: MAX_FREE_PROPOSALS };
    }

    return { allowed: true, used, max: MAX_FREE_PROPOSALS };
  } catch (err) {
    console.error("[rate-limit] KV error — falling through:", err.message);
    return { allowed: true };
  }
}

/**
 * Increment the usage count for this IP after a successful generation.
 */
export async function incrementUsage(ip) {
  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;

  if (!kvUrl || !kvToken) return;

  const key = `proposals:ip:${ip}`;
  try {
    await kv.incr(key);
  } catch (err) {
    console.error("[rate-limit] Failed to increment usage:", err.message);
  }
}
