const MAX_FREE_PROPOSALS = 3;

export function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

async function upstashGet(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  return data.result ? parseInt(data.result, 10) : 0;
}

async function upstashIncr(key) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  await fetch(`${url}/incr/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function checkRateLimit(ip) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[rate-limit] Upstash not configured — skipping.");
    return { allowed: true };
  }

  try {
    const key = `proposals:ip:${ip}`;
    const used = await upstashGet(key);
    if (used >= MAX_FREE_PROPOSALS) {
      return { allowed: false, used, max: MAX_FREE_PROPOSALS };
    }
    return { allowed: true, used, max: MAX_FREE_PROPOSALS };
  } catch (err) {
    console.error("[rate-limit] Error:", err.message);
    return { allowed: true };
  }
}

export async function incrementUsage(ip) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  try {
    await upstashIncr(`proposals:ip:${ip}`);
  } catch (err) {
    console.error("[rate-limit] Increment failed:", err.message);
  }
}
