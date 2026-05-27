import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function geoIp(ip: string): Promise<{ country: string; city: string; region: string }> {
  if (!ip) return { country: "", city: "", region: "" };
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,regionName,city`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (res.ok) {
      const d = await res.json() as Record<string, unknown>;
      if (d.status === "success") {
        return {
          country: String(d.country || ""),
          city:    String(d.city || ""),
          region:  String(d.regionName || ""),
        };
      }
    }
  } catch { /* fall through */ }

  try {
    const res = await fetch(`https://ipwho.is/${ip}`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const d = await res.json() as Record<string, unknown>;
      if (d.success !== false) {
        return {
          country: String(d.country || ""),
          city:    String(d.city || ""),
          region:  String(d.region || ""),
        };
      }
    }
  } catch { /* fall through */ }

  return { country: "", city: "", region: "" };
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get all distinct IPs that have no geo data yet
    const { data: rows } = await supabase
      .from("analytics_events")
      .select("ip")
      .neq("ip", "")
      .eq("country", "")
      .not("ip", "is", null);

    const uniqueIps = [...new Set((rows || []).map((r: { ip: string }) => r.ip).filter(Boolean))];
    const results: Record<string, string> = {};

    for (const ip of uniqueIps) {
      const geo = await geoIp(ip);
      if (geo.country) {
        results[ip] = `${geo.country} / ${geo.city}`;
        // Update all rows with this IP
        await supabase
          .from("analytics_events")
          .update({ country: geo.country, city: geo.city, region: geo.region })
          .eq("ip", ip)
          .eq("country", "");
      }
      // Small delay to respect rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    return new Response(JSON.stringify({ processed: uniqueIps.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error(e);
    return new Response("Error", { status: 500, headers: corsHeaders });
  }
});
