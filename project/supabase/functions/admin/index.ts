import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const sb = () =>
  createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

const SECRET = Deno.env.get("ADMIN_SECRET") || "lovienteo_admin_2025";

async function signToken(username: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw", enc.encode(SECRET), { name: "HMAC", hash: "SHA-256" }, false, ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(username + ":admin"));
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2,"0")).join("");
  return btoa(username + ":" + hex);
}

async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = atob(token);
    const colon   = decoded.indexOf(":");
    const username = decoded.slice(0, colon);
    const expected = await signToken(username);
    return expected === token ? username : null;
  } catch { return null; }
}

async function hashPassword(pw: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(pw + SECRET));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,"0")).join("");
}

Deno.serve(async (req: Request) => {
  try {
    if (req.method === "OPTIONS") return new Response(null, { status: 200, headers: corsHeaders });

    const url      = new URL(req.url);
    const pathname = url.pathname.replace(/^\/admin/, "");

    /* ══ POST /admin/login ══ */
    if (req.method === "POST" && pathname === "/login") {
      const { username, password } = await req.json();
      const client = sb();
      const { data: user } = await client
        .from("admin_users")
        .select("id, username, role, password_hash")
        .eq("username", username)
        .maybeSingle();

      if (!user) return err("Credenciales inválidas", 401);

      const hash = await hashPassword(password);
      if (hash !== user.password_hash) return err("Credenciales inválidas", 401);

      const token = await signToken(user.username);
      return json({ token, username: user.username, role: user.role });
    }

    /* ── all routes below require auth ── */
    const authHeader = req.headers.get("Authorization") || "";
    const token      = authHeader.replace("Bearer ", "");
    const username   = await verifyToken(token);
    if (!username) return err("No autorizado", 401);

    const client = sb();

    /* ══ GET /admin/landings ══ */
    if (req.method === "GET" && pathname === "/landings") {
      const { data } = await client
        .from("landings")
        .select("*")
        .order("created_at", { ascending: false });
      return json(data || []);
    }

    /* ══ POST /admin/landings ══ */
    if (req.method === "POST" && pathname === "/landings") {
      const body = await req.json();
      const { data, error } = await client.from("landings").insert(body).select().maybeSingle();
      if (error) return err(error.message, 500);
      return json(data, 201);
    }

    /* ══ GET /admin/stats?slug=xxx&from=ISO&to=ISO ══ */
    if (req.method === "GET" && pathname === "/stats") {
      const slug = url.searchParams.get("slug") || "";
      const from = url.searchParams.get("from") || new Date(Date.now() - 30 * 86400000).toISOString();
      const to   = url.searchParams.get("to")   || new Date().toISOString();

      /* total pageviews */
      const { count: pageviews } = await client
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("page", slug).eq("type", "pageview")
        .gte("created_at", from).lte("created_at", to);

      /* unique sessions */
      const { data: sessions } = await client
        .from("analytics_events")
        .select("sid")
        .eq("page", slug).eq("type", "pageview")
        .gte("created_at", from).lte("created_at", to);
      const uniqueSessions = new Set((sessions || []).map((r: { sid: string }) => r.sid)).size;

      /* CTA clicks */
      const { count: ctaClicks } = await client
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("page", slug).eq("type", "cta_click")
        .gte("created_at", from).lte("created_at", to);

      /* rage clicks */
      const { count: rageClicks } = await client
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("page", slug).eq("type", "rage_click")
        .gte("created_at", from).lte("created_at", to);

      /* whatsapp clicks */
      const { count: waClicks } = await client
        .from("analytics_events")
        .select("*", { count: "exact", head: true })
        .eq("page", slug).eq("type", "whatsapp_click")
        .gte("created_at", from).lte("created_at", to);

      /* scroll depth distribution */
      const { data: scrollRows } = await client
        .from("analytics_events")
        .select("payload")
        .eq("page", slug).eq("type", "scroll_depth")
        .gte("created_at", from).lte("created_at", to);

      const scrollDist: Record<string, number> = { "25": 0, "50": 0, "75": 0, "100": 0 };
      (scrollRows || []).forEach((r: { payload: { pct?: number } }) => {
        const p = String(r.payload?.pct || "");
        if (scrollDist[p] !== undefined) scrollDist[p]++;
      });

      /* section dwell */
      const { data: dwellRows } = await client
        .from("analytics_events")
        .select("payload")
        .eq("page", slug).eq("type", "section_dwell")
        .gte("created_at", from).lte("created_at", to);

      const dwellMap: Record<string, { total: number; count: number }> = {};
      (dwellRows || []).forEach((r: { payload: { section?: string; ms?: number } }) => {
        const s = r.payload?.section || "unknown";
        if (!dwellMap[s]) dwellMap[s] = { total: 0, count: 0 };
        dwellMap[s].total += r.payload?.ms || 0;
        dwellMap[s].count++;
      });
      const sectionDwell = Object.entries(dwellMap).map(([section, v]) => ({
        section,
        avg_ms: Math.round(v.total / v.count),
        views: v.count,
      })).sort((a, b) => b.avg_ms - a.avg_ms);

      /* click heatmap — event type is "heatmap", fields are x/y (0-100 pct) */
      const { data: clickRows } = await client
        .from("analytics_events")
        .select("payload")
        .eq("page", slug).eq("type", "heatmap")
        .gte("created_at", from).lte("created_at", to)
        .limit(2000);

      const heatmapPoints = (clickRows || []).map((r: { payload: { x?: number; y?: number; x_pct?: number; y_pct?: number; label?: string } }) => ({
        x: r.payload?.x ?? r.payload?.x_pct ?? 0,
        y: r.payload?.y ?? r.payload?.y_pct ?? 0,
        label: r.payload?.label || "",
      }));

      /* top CTA labels */
      const { data: ctaRows } = await client
        .from("analytics_events")
        .select("payload, btn_position, created_at, sid")
        .eq("page", slug).eq("type", "cta_click")
        .gte("created_at", from).lte("created_at", to)
        .order("created_at", { ascending: false });

      const ctaMap: Record<string, number> = {};
      (ctaRows || []).forEach((r: { payload: { label?: string } }) => {
        const l = r.payload?.label || "CTA";
        ctaMap[l] = (ctaMap[l] || 0) + 1;
      });
      const topCtas = Object.entries(ctaMap).map(([label, clicks]) => ({ label, clicks }))
        .sort((a, b) => b.clicks - a.clicks).slice(0, 10);

      /* referrers */
      const { data: refRows } = await client
        .from("analytics_events")
        .select("payload, ref, ip, country, city, region, device_type, os, browser, ua, sid, created_at")
        .eq("page", slug).eq("type", "pageview")
        .gte("created_at", from).lte("created_at", to);

      const refMap: Record<string, number> = {};
      (refRows || []).forEach((r: { ref?: string; payload?: { ref?: string } }) => {
        const refVal = r.ref || r.payload?.ref || "direct";
        let key = "Directo";
        try {
          if (refVal && refVal !== "direct") {
            if (refVal.includes("google")) key = "Google";
            else if (refVal.includes("facebook") || refVal.includes("fb.")) key = "Facebook";
            else if (refVal.includes("instagram")) key = "Instagram";
            else if (refVal.includes("tiktok")) key = "TikTok";
            else if (refVal.includes("mercadolibre") || refVal.includes("meli")) key = "MercadoLibre";
            else key = new URL(refVal).hostname.replace("www.", "");
          }
        } catch { key = refVal.slice(0, 30); }
        refMap[key] = (refMap[key] || 0) + 1;
      });
      const referrers = Object.entries(refMap).map(([source, visits]) => ({ source, visits }))
        .sort((a, b) => b.visits - a.visits).slice(0, 8);

      /* UTM campaigns */
      const utmMap: Record<string, number> = {};
      (refRows || []).forEach((r: { payload?: { utm_campaign?: string } }) => {
        const c = r.payload?.utm_campaign;
        if (c) utmMap[c] = (utmMap[c] || 0) + 1;
      });
      const utmCampaigns = Object.entries(utmMap).map(([campaign, visits]) => ({ campaign, visits }))
        .sort((a, b) => b.visits - a.visits).slice(0, 8);

      /* pageviews by day */
      const { data: pvDays } = await client
        .from("analytics_events")
        .select("created_at")
        .eq("page", slug).eq("type", "pageview")
        .gte("created_at", from).lte("created_at", to)
        .order("created_at");

      const dayMap: Record<string, number> = {};
      (pvDays || []).forEach((r: { created_at: string }) => {
        const d = r.created_at.slice(0, 10);
        dayMap[d] = (dayMap[d] || 0) + 1;
      });
      const pvTimeline = Object.entries(dayMap).map(([date, views]) => ({ date, views }));

      /* avg time on page — landing sends "time_on_page" with {seconds: N} */
      const { data: exitRows } = await client
        .from("analytics_events")
        .select("payload, sid, created_at")
        .in("type", ["time_on_page", "exit", "session_end"])
        .eq("page", slug)
        .gte("created_at", from).lte("created_at", to);

      const avgTimeMs = exitRows && exitRows.length > 0
        ? Math.round(exitRows.reduce((s: number, r: { payload: { seconds?: number; time_ms?: number; time_sec?: number } }) => {
            const ms = (r.payload?.seconds != null)  ? r.payload.seconds * 1000
                     : (r.payload?.time_sec != null) ? r.payload.time_sec * 1000
                     : (r.payload?.time_ms  != null) ? r.payload.time_ms
                     : 0;
            return s + ms;
          }, 0) / exitRows.length)
        : 0;

      /* device breakdown from new column */
      const deviceMap: Record<string, number> = { mobile: 0, tablet: 0, desktop: 0 };
      (refRows || []).forEach((r: { device_type?: string; payload?: { w?: number } }) => {
        const dt = (r.device_type || "").toLowerCase();
        if (dt === "mobile") deviceMap.mobile++;
        else if (dt === "tablet") deviceMap.tablet++;
        else if (dt === "desktop") deviceMap.desktop++;
        else {
          // fallback to screen width
          const w = r.payload?.w || 0;
          if (w < 768) deviceMap.mobile++;
          else if (w < 1024) deviceMap.tablet++;
          else deviceMap.desktop++;
        }
      });

      /* ── ABANDONMENT: sessions that never clicked CTA or WA ── */
      const { data: ctaSids } = await client
        .from("analytics_events")
        .select("sid")
        .eq("page", slug)
        .in("type", ["cta_click", "whatsapp_click"])
        .gte("created_at", from).lte("created_at", to);

      const convertedSids = new Set((ctaSids || []).map((r: { sid: string }) => r.sid));
      const allSids = Array.from(new Set((sessions || []).map((r: { sid: string }) => r.sid)));
      const abandonedSids = allSids.filter(s => !convertedSids.has(s));

      /* for abandoned sessions, get their pageview rows for the grid */
      const slicedAbandonSids = abandonedSids.slice(0, 200);
      const abandonRows: Record<string, unknown>[] = [];
      if (slicedAbandonSids.length > 0) {
        const { data: _ar } = await client
          .from("analytics_events")
          .select("sid, ip, country, city, region, device_type, os, browser, ua, ref, created_at")
          .eq("page", slug).eq("type", "pageview")
          .in("sid", slicedAbandonSids)
          .gte("created_at", from).lte("created_at", to)
          .order("created_at", { ascending: false });
        if (_ar) abandonRows.push(..._ar);
      }

      /* deduplicate by sid, keep latest */
      const abandonMap: Record<string, unknown> = {};
      (abandonRows || []).forEach((r: Record<string, unknown>) => {
        const s = r.sid as string;
        if (!abandonMap[s]) abandonMap[s] = r;
      });
      const abandonedVisitors = Object.values(abandonMap).slice(0, 500);

      /* ── ALL VISITORS grid ── */
      const visitorsGrid = (refRows || []).map((r: Record<string, unknown>) => ({
        sid:         r.sid,
        ip:          r.ip || "",
        country:     r.country || "",
        city:        r.city || "",
        region:      r.region || "",
        device_type: r.device_type || "",
        os:          r.os || "",
        browser:     r.browser || "",
        ua:          r.ua || "",
        ref:         r.ref || (r.payload as Record<string,unknown>)?.ref || "direct",
        created_at:  r.created_at,
        converted:   convertedSids.has(r.sid as string),
      }));

      /* ── CTA CLICKS grid ── */
      const ctaGrid = (ctaRows || []).map((r: Record<string, unknown>) => ({
        sid:          r.sid,
        btn_position: r.btn_position || (r.payload as Record<string,unknown>)?.position || "",
        label:        (r.payload as Record<string,unknown>)?.label || "CTA",
        created_at:   r.created_at,
      }));

      /* ── WHATSAPP CLICKS grid ── */
      const { data: waRows } = await client
        .from("analytics_events")
        .select("sid, ip, country, city, device_type, os, browser, created_at, payload")
        .eq("page", slug).eq("type", "whatsapp_click")
        .gte("created_at", from).lte("created_at", to)
        .order("created_at", { ascending: false });

      const waGrid = (waRows || []).map((r: Record<string, unknown>) => ({
        sid:         r.sid,
        ip:          r.ip || "",
        country:     r.country || "",
        city:        r.city || "",
        device_type: r.device_type || "",
        os:          r.os || "",
        browser:     r.browser || "",
        created_at:  r.created_at,
      }));

      return json({
        pageviews:     pageviews || 0,
        uniqueSessions,
        ctaClicks:     ctaClicks || 0,
        waClicks:      waClicks || 0,
        rageClicks:    rageClicks || 0,
        abandonedCount: abandonedSids.length,
        conversionRate: uniqueSessions > 0 ? ((ctaClicks || 0) / uniqueSessions * 100).toFixed(1) : "0.0",
        avgTimeSec:    Math.round(avgTimeMs / 1000),
        scrollDist,
        sectionDwell,
        heatmapPoints,
        topCtas,
        referrers,
        utmCampaigns,
        pvTimeline,
        deviceBreakdown: Object.entries(deviceMap).map(([device, count]) => ({
          device: device.charAt(0).toUpperCase() + device.slice(1), count,
        })),
        /* new grids */
        abandonedVisitors,
        visitorsGrid,
        ctaGrid,
        waGrid,
      });
    }

    /* ══ GET /admin/overview?from=ISO&to=ISO ══ */
    if (req.method === "GET" && pathname === "/overview") {
      const from = url.searchParams.get("from") || new Date(Date.now() - 30 * 86400000).toISOString();
      const to   = url.searchParams.get("to")   || new Date().toISOString();

      const { data: landings } = await client
        .from("landings")
        .select("id, slug, name, url, active")
        .order("created_at", { ascending: false });

      const slugs = (landings || []).map((l: { slug: string }) => l.slug);

      if (!slugs.length) return json({ landings: [], totals: { pageviews: 0, sessions: 0, ctaClicks: 0, waClicks: 0 }, pvTimeline: [] });

      /* pageviews per slug */
      const { data: pvRows } = await client
        .from("analytics_events")
        .select("page, sid, created_at")
        .in("page", slugs).eq("type", "pageview")
        .gte("created_at", from).lte("created_at", to);

      /* cta clicks per slug */
      const { data: ctaRows } = await client
        .from("analytics_events")
        .select("page, sid")
        .in("page", slugs).eq("type", "cta_click")
        .gte("created_at", from).lte("created_at", to);

      /* wa clicks per slug */
      const { data: waRows2 } = await client
        .from("analytics_events")
        .select("page, sid")
        .in("page", slugs).eq("type", "whatsapp_click")
        .gte("created_at", from).lte("created_at", to);

      /* avg time per slug — covers time_on_page, exit, session_end variants */
      const { data: exitRows2 } = await client
        .from("analytics_events")
        .select("page, payload")
        .in("page", slugs).in("type", ["time_on_page", "exit", "session_end"])
        .gte("created_at", from).lte("created_at", to);

      /* aggregate per landing */
      type LandingAgg = {
        pageviews: number;
        sessions: Set<string>;
        ctaClicks: number;
        waSids: Set<string>;
        exitMs: number[];
      };
      const agg: Record<string, LandingAgg> = {};
      for (const s of slugs) agg[s] = { pageviews: 0, sessions: new Set(), ctaClicks: 0, waSids: new Set(), exitMs: [] };

      (pvRows || []).forEach((r: { page: string; sid: string }) => {
        if (agg[r.page]) { agg[r.page].pageviews++; agg[r.page].sessions.add(r.sid); }
      });
      (ctaRows || []).forEach((r: { page: string; sid: string }) => {
        if (agg[r.page]) agg[r.page].ctaClicks++;
      });
      (waRows2 || []).forEach((r: { page: string; sid: string }) => {
        if (agg[r.page]) agg[r.page].waSids.add(r.sid);
      });
      (exitRows2 || []).forEach((r: { page: string; payload: { seconds?: number; time_ms?: number; time_sec?: number } }) => {
        const ms = (r.payload?.seconds != null)  ? r.payload.seconds * 1000
                 : (r.payload?.time_sec != null) ? r.payload.time_sec * 1000
                 : (r.payload?.time_ms  != null) ? r.payload.time_ms
                 : 0;
        if (agg[r.page]) agg[r.page].exitMs.push(ms);
      });

      const landingStats = (landings || []).map((l: { id: string; slug: string; name: string; url: string; active: boolean }) => {
        const a = agg[l.slug];
        const sessions = a.sessions.size;
        const ctaClicks = a.ctaClicks;
        const waClicks = a.waSids.size;
        const avgTimeSec = a.exitMs.length ? Math.round(a.exitMs.reduce((s, v) => s + v, 0) / a.exitMs.length / 1000) : 0;
        const conversionRate = sessions > 0 ? +((ctaClicks / sessions) * 100).toFixed(1) : 0;
        return {
          id: l.id, slug: l.slug, name: l.name, url: l.url, active: l.active,
          pageviews: a.pageviews, sessions, ctaClicks, waClicks, avgTimeSec, conversionRate,
        };
      }).sort((a: { pageviews: number }, b: { pageviews: number }) => b.pageviews - a.pageviews);

      /* global totals */
      const totals = landingStats.reduce(
        (acc: { pageviews: number; sessions: number; ctaClicks: number; waClicks: number }, l: { pageviews: number; sessions: number; ctaClicks: number; waClicks: number }) => ({
          pageviews: acc.pageviews + l.pageviews,
          sessions:  acc.sessions  + l.sessions,
          ctaClicks: acc.ctaClicks + l.ctaClicks,
          waClicks:  acc.waClicks  + l.waClicks,
        }),
        { pageviews: 0, sessions: 0, ctaClicks: 0, waClicks: 0 },
      );

      /* global pageviews timeline */
      const dayMap: Record<string, number> = {};
      (pvRows || []).forEach((r: { created_at: string }) => {
        const d = r.created_at.slice(0, 10);
        dayMap[d] = (dayMap[d] || 0) + 1;
      });
      const pvTimeline = Object.entries(dayMap).sort(([a], [b]) => a.localeCompare(b))
        .map(([date, views]) => ({ date, views }));

      return json({ landings: landingStats, totals, pvTimeline });
    }

    return err("Not found", 404);
  } catch (e) {
    console.error(e);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
