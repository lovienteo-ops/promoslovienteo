import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ALLOWED_TYPES = new Set([
  "pageview", "cta_click", "section_dwell", "scroll_depth",
  "click", "rage_click", "exit", "whatsapp_click",
  "time_on_page", "heatmap", "section_view",
]);

function parseDevice(ua: string): { device_type: string; os: string; browser: string } {
  const u = ua.toLowerCase();

  let device_type = "desktop";
  // iPad must be checked before generic "mobile" because modern iPad UAs contain "Mobile/15E148"
  if (/ipad|android(?!.*mobile)|tablet/.test(u)) device_type = "tablet";
  else if (/mobile|iphone|ipod|blackberry|windows phone/.test(u)) device_type = "mobile";

  let os = "Other";
  if (/windows/.test(u)) os = "Windows";
  else if (/android/.test(u)) os = "Android";
  else if (/iphone|ipad|ipod/.test(u)) os = "iOS";
  else if (/mac os x|macintosh/.test(u)) os = "macOS";
  else if (/linux/.test(u)) os = "Linux";

  let browser = "Other";
  if (/edg\//.test(u)) browser = "Edge";
  else if (/opr\/|opera/.test(u)) browser = "Opera";
  else if (/chrome/.test(u)) browser = "Chrome";
  else if (/safari/.test(u)) browser = "Safari";
  else if (/firefox/.test(u)) browser = "Firefox";

  return { device_type, os, browser };
}

async function getGeo(ip: string): Promise<{ country: string; city: string; region: string }> {
  // Try ip-api.com first (works from server, generous free tier)
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city`,
      { signal: AbortSignal.timeout(4000) },
    );
    if (res.ok) {
      const data = await res.json() as Record<string, unknown>;
      if (data.status === "success") {
        return {
          country: String(data.country || ""),
          city:    String(data.city || ""),
          region:  String(data.regionName || ""),
        };
      }
    }
  } catch { /* fall through */ }

  // Fallback: ipwho.is (HTTPS, no key needed)
  try {
    const res = await fetch(`https://ipwho.is/${ip}`, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json() as Record<string, unknown>;
      if (data.success !== false) {
        return {
          country: String(data.country || ""),
          city:    String(data.city || ""),
          region:  String(data.region || ""),
        };
      }
    }
  } catch { /* fall through */ }

  return { country: "", city: "", region: "" };
}

function getClientIp(req: Request): string {
  return (
    req.headers.get("cf-connecting-ip") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    ""
  );
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: corsHeaders });
    }

    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return new Response("Bad JSON", { status: 400, headers: corsHeaders });
    }

    const b = body as Record<string, unknown>;

    // Accept both {type, page} (new) and {event, slug} (legacy landing pages)
    const type         = (b.type || b.event) as string | undefined;
    const page         = (b.page || b.slug)  as string | undefined;
    const sid          = b.sid          as string | undefined;
    const ts           = b.ts           as number | undefined;
    const clientUa     = b.ua           as string | undefined;
    const clientRef    = b.ref          as string | undefined;
    const btn_position = b.btn_position as string | undefined;

    // Remove known top-level keys so rest only contains payload extras
    const { type: _t, event: _e, page: _p, slug: _s, sid: _sid, ts: _ts,
            ua: _ua, ref: _ref, btn_position: _bp, url: _url, ...rest } = b;
    void _t; void _e; void _p; void _s; void _sid; void _ts;
    void _ua; void _ref; void _bp; void _url;

    if (!type || !ALLOWED_TYPES.has(type)) {
      return new Response("Invalid type", { status: 400, headers: corsHeaders });
    }

    const ip = getClientIp(req);
    const ua = clientUa || req.headers.get("user-agent") || "";
    const { device_type, os, browser } = parseDevice(ua);

    // Only geolocate on pageview to avoid rate limits and latency
    let country = "", city = "", region = "";
    if (type === "pageview" && ip) {
      const geo = await getGeo(ip);
      country = geo.country;
      city    = geo.city;
      region  = geo.region;
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase
      .from("analytics_events")
      .insert({
        type,
        page:         (page  || "").slice(0, 100),
        sid:          (sid   || "").slice(0, 80),
        ts:           typeof ts === "number" ? ts : Date.now(),
        payload:      rest,
        ip:           ip.slice(0, 50),
        country:      country.slice(0, 80),
        city:         city.slice(0, 80),
        region:       region.slice(0, 80),
        device_type:  device_type.slice(0, 20),
        os:           os.slice(0, 40),
        browser:      browser.slice(0, 40),
        ua:           ua.slice(0, 300),
        ref:          (clientRef || "").slice(0, 200),
        btn_position: (btn_position || "").slice(0, 20),
      });

    if (error) {
      console.error("DB insert error:", error.message);
      return new Response("DB error", { status: 500, headers: corsHeaders });
    }

    return new Response(null, { status: 204, headers: corsHeaders });
  } catch (err) {
    console.error("Unhandled error:", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
