import { NextResponse } from "next/server";

const ALLOWED_HOSTS = new Set([
  "api.courtyard.io",
  "static.courtyard.io",
  "ipfs.io",
  "cloudflare-ipfs.com",
  "gateway.pinata.cloud",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid url parameter" }, { status: 400 });
  }

  if (!ALLOWED_HOSTS.has(target.hostname)) {
    return NextResponse.json({ error: "Host not allowed" }, { status: 403 });
  }

  try {
    // Simple retry for transient upstream errors
    const maxAttempts = 3;
    let attempt = 0;
    let res: Response | null = null;
    while (attempt < maxAttempts) {
      attempt++;
      res = await fetch(target.toString(), {
        method: "GET",
        cache: "no-store",
        // Send minimal headers
        headers: { Accept: "application/json" },
      });
      if (res.ok || (res.status >= 400 && res.status < 500)) break;
      // Backoff for 5xx/429
      await new Promise((r) => setTimeout(r, 200 * attempt));
    }

    if (!res) throw new Error("No response from upstream");

    // Build safe headers for NextResponse
    const safeHeaders = new Headers();
    const contentType = res.headers.get("content-type");
    if (contentType) safeHeaders.set("content-type", contentType);
    const cacheControl = res.headers.get("cache-control");
    if (cacheControl) safeHeaders.set("cache-control", cacheControl);
    const etag = res.headers.get("etag");
    if (etag) safeHeaders.set("etag", etag);

    const response = new NextResponse(res.body, {
      status: res.status,
      headers: safeHeaders,
    });
    response.headers.set("Access-Control-Allow-Origin", "*");
    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Upstream fetch failed" },
      { status: 502 },
    );
  }
}

export function OPTIONS() {
  const res = new NextResponse(null, { status: 204 });
  res.headers.set("Access-Control-Allow-Origin", "*");
  res.headers.set("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.headers.set("Access-Control-Allow-Headers", "Content-Type");
  return res;
}
