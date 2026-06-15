const NO_STORE = {"Cache-Control": "no-store"};

/**
 * Cloudflare Pages Function — per-page hit counter backed by env.HITS KV.
 * GET  /api/hits?key=<url-encoded page path>  → { count } (read-only)
 * POST /api/hits?key=...                      → increment, return { count }
 */
export async function onRequest(context) {
  const {request, env} = context;
  const url = new URL(request.url);
  const key = url.searchParams.get("key");

  if (!key) {
    return json({error: "missing key"}, 400);
  }

  const kvKey = `hits:${key}`;

  if (request.method === "GET") {
    const count = await readCount(env.HITS, kvKey);
    return json({count});
  }

  if (request.method === "POST") {
    const current = await readCount(env.HITS, kvKey);
    const next = current + 1;
    await env.HITS.put(kvKey, String(next));
    return json({count: next});
  }

  return json({error: "method not allowed"}, 405);
}

async function readCount(kv, kvKey) {
  const raw = await kv.get(kvKey);
  if (!raw) return 0;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? 0 : n;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...NO_STORE,
    },
  });
}
