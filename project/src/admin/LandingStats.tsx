import { useEffect, useState, useCallback } from 'react';
import { getStats } from './api';
import { BarChart, LineChart, DonutChart, HorizontalBar, ScrollFunnel } from './Charts';
import Heatmap from './Heatmap';

interface Landing { slug: string; name: string; url: string; }
interface Props    { token: string; landing: Landing; }

const DEVICE_COLORS = ['#f5c518', '#e8a818', '#c07808'];
const REF_COLORS    = ['#f5c518','#e8a818','#d4900f','#c07808','#a86006','#8c4e04','#703c02','#542a00'];

const SECTION_LABELS: Record<string, string> = {
  hero:              'Hero — Portada principal',
  'section-features':'Características del producto',
  features:          'Características del producto',
  'section-usecases':'Casos de uso',
  usecases:          'Casos de uso',
  'section-trust':   'Confianza y garantías',
  trust:             'Confianza y garantías',
  'section-reviews': 'Reseñas de compradores',
  reviews:           'Reseñas de compradores',
  'section-urgency': 'Urgencia / CTA final',
  urgency:           'Urgencia / CTA final',
  'section-angles':  'Ángulos del producto',
  angles:            'Ángulos del producto',
  'section-gallery': 'Galería de imágenes',
  gallery:           'Galería de imágenes',
  footer:            'Footer / Pie de página',
  faq:               'Preguntas frecuentes',
  'section-faq':     'Preguntas frecuentes',
  'sec-tecnologia':  'Tecnología del producto',
  'sec-caracteristicas': 'Características',
  'sec-para-quien':  'Para quién es',
  'sec-kit':         'Contenido del kit',
  'sec-reviews':     'Reseñas de compradores',
  'sec-final':       'Cierre / CTA final',
};

function fmt(sec: number) {
  if (sec < 60)  return `${sec}s`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return `${m}m ${s}s`;
}

function fmtDate(iso: string) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });
}

/* ─────────────────────────────────────────────
   Reusable paginated + searchable data grid
───────────────────────────────────────────── */
interface Col {
  key: string;
  label: string;
  render?: (v: unknown, row: Record<string, unknown>) => React.ReactNode;
}

function DataGrid({ rows, cols, searchFields, pageSize = 20 }: {
  rows: Record<string, unknown>[];
  cols: Col[];
  searchFields: string[];
  pageSize?: number;
}) {
  const [query,   setQuery]   = useState('');
  const [page,    setPage]    = useState(0);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = query.trim()
    ? rows.filter(r => searchFields.some(f => String(r[f] ?? '').toLowerCase().includes(query.toLowerCase())))
    : rows;

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = a[sortKey] ?? ''; const bv = b[sortKey] ?? '';
        const cmp = String(av).localeCompare(String(bv), 'es', { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages - 1);
  const slice      = sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function handleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  }

  return (
    <div className="dg-wrap">
      <div className="dg-toolbar">
        <input
          className="dg-search"
          placeholder="Buscar..."
          value={query}
          onChange={e => { setQuery(e.target.value); setPage(0); }}
        />
        <span className="dg-count">{sorted.length} registro{sorted.length !== 1 ? 's' : ''}</span>
      </div>
      <div className="dg-table-wrap">
        <table className="dg-table">
          <thead>
            <tr>
              {cols.map(c => (
                <th key={c.key} className="dg-th-sortable" onClick={() => handleSort(c.key)}>
                  {c.label}
                  <span className="dg-sort-icon">
                    {sortKey === c.key ? (sortDir === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr><td colSpan={cols.length} className="dg-empty">Sin registros</td></tr>
            ) : slice.map((row, i) => (
              <tr key={i}>
                {cols.map(c => (
                  <td key={c.key}>
                    {c.render ? c.render(row[c.key], row) : String(row[c.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="dg-pagination">
          <button
            className="dg-page-btn"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={safePage === 0}
          >← Anterior</button>
          <span className="dg-page-info">
            Página {safePage + 1} de {totalPages}
          </span>
          <button
            className="dg-page-btn"
            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
            disabled={safePage >= totalPages - 1}
          >Siguiente →</button>
        </div>
      )}
    </div>
  );
}

function DeviceBadge({ type }: { type: string }) {
  const t = String(type || '').toLowerCase();
  const color = t === 'mobile' ? '#22c55e' : t === 'tablet' ? '#f59e0b' : '#60a5fa';
  const icon  = t === 'mobile' ? '📱' : t === 'tablet' ? '⬛' : '🖥';
  return <span style={{ color, fontSize: '.7rem', fontWeight: 700 }}>{icon} {type || '—'}</span>;
}

function ConvertedBadge({ converted }: { converted: unknown }) {
  return converted
    ? <span className="badge-yes">Compró</span>
    : <span className="badge-no">Abandonó</span>;
}

function PosBadge({ pos }: { pos: unknown }) {
  const p = String(pos || '').toLowerCase();
  if (p === 'header')   return <span className="badge-header">Header</span>;
  if (p === 'footer')   return <span className="badge-footer">Footer</span>;
  if (p === 'floating') return <span className="badge-floating">Flotante</span>;
  return <span className="badge-other">{String(pos || '—')}</span>;
}

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function LandingStats({ token, landing }: Props) {
  const [stats, setStats]     = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [range, setRange]     = useState('30');
  const [tab, setTab]         = useState<'overview' | 'behavior' | 'heatmap' | 'sections' | 'seo'>('overview');

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const from = new Date(Date.now() - parseInt(range) * 86400000).toISOString();
      const data = await getStats(token, landing.slug, from);
      setStats(data);
    } catch (e) { setError(e instanceof Error ? e.message : 'Error'); }
    finally { setLoading(false); }
  }, [token, landing.slug, range]);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="stats-loading">
      <div className="stats-spinner" />
      <span>Cargando estadísticas...</span>
    </div>
  );

  if (error) return (
    <div className="stats-error">
      <span>Error: {error}</span>
      <button onClick={load} className="admin-btn-sm">Reintentar</button>
    </div>
  );

  if (!stats) return null;

  const pv             = stats.pageviews as number;
  const sessions       = stats.uniqueSessions as number;
  const cta            = stats.ctaClicks as number;
  const waClicks       = (stats.waClicks as number) || 0;
  const rage           = stats.rageClicks as number;
  const abandonedCount = (stats.abandonedCount as number) || 0;
  const conv           = stats.conversionRate as string;
  const avgTime        = stats.avgTimeSec as number;
  const scrollDist     = stats.scrollDist as Record<string, number>;
  const sectionDwell   = stats.sectionDwell as { section: string; avg_ms: number; views: number }[];
  const heatmap        = stats.heatmapPoints as { x: number; y: number; label: string }[];
  const topCtas        = stats.topCtas as { label: string; clicks: number }[];
  const referrers      = stats.referrers as { source: string; visits: number }[];
  const utmCamps       = stats.utmCampaigns as { campaign: string; visits: number }[];
  const pvTimeline     = stats.pvTimeline as { date: string; views: number }[];
  const devices        = stats.deviceBreakdown as { device: string; count: number }[];

  const abandonedVisitors = (stats.abandonedVisitors as Record<string, unknown>[]) || [];
  const visitorsGrid      = (stats.visitorsGrid      as Record<string, unknown>[]) || [];
  const ctaGrid           = (stats.ctaGrid           as Record<string, unknown>[]) || [];
  const waGrid            = (stats.waGrid            as Record<string, unknown>[]) || [];

  const kpis = [
    { label: 'Visitas totales',   value: pv.toLocaleString(),             icon: '👁',  sub: `Últimos ${range} días` },
    { label: 'Sesiones únicas',   value: sessions.toLocaleString(),       icon: '👤',  sub: 'Visitantes distintos' },
    { label: 'Clicks Comprar',    value: cta.toLocaleString(),            icon: '🛒',  sub: 'Botón de compra' },
    { label: 'Clicks WhatsApp',   value: waClicks.toLocaleString(),       icon: '💬',  sub: 'Botón de WA' },
    { label: 'Conversión',        value: `${conv}%`,                      icon: '⚡',  sub: 'Sesiones → CTA' },
    { label: 'Tiempo promedio',   value: fmt(avgTime),                    icon: '⏱',  sub: 'Por sesión' },
    { label: 'Abandonos',         value: abandonedCount.toLocaleString(), icon: '🚪',  sub: 'Sin clic de compra' },
    { label: 'Rage clicks',       value: rage.toLocaleString(),           icon: '😤',  sub: 'Frustración detectada' },
  ];

  /* ── column definitions ── */
  const abandonCols: Col[] = [
    { key: 'created_at',  label: 'Fecha',       render: v => fmtDate(String(v)) },
    { key: 'ip',          label: 'IP' },
    { key: 'country',     label: 'País' },
    { key: 'city',        label: 'Ciudad' },
    { key: 'region',      label: 'Región' },
    { key: 'device_type', label: 'Dispositivo', render: v => <DeviceBadge type={String(v)} /> },
    { key: 'os',          label: 'OS' },
    { key: 'browser',     label: 'Navegador' },
  ];

  const visitorCols: Col[] = [
    { key: 'created_at',  label: 'Fecha',       render: v => fmtDate(String(v)) },
    { key: 'ip',          label: 'IP' },
    { key: 'country',     label: 'País' },
    { key: 'city',        label: 'Ciudad' },
    { key: 'device_type', label: 'Dispositivo', render: v => <DeviceBadge type={String(v)} /> },
    { key: 'os',          label: 'OS' },
    { key: 'browser',     label: 'Navegador' },
    { key: 'converted',   label: 'Acción',      render: v => <ConvertedBadge converted={v} /> },
  ];

  const ctaCols: Col[] = [
    { key: 'created_at',   label: 'Fecha',    render: v => fmtDate(String(v)) },
    { key: 'sid',          label: 'Sesión',   render: v => <code style={{fontSize:'.65rem',opacity:.5}}>{String(v).slice(0,14)}…</code> },
    { key: 'label',        label: 'Botón' },
    { key: 'btn_position', label: 'Posición', render: v => <PosBadge pos={v} /> },
  ];

  const waCols: Col[] = [
    { key: 'created_at',  label: 'Fecha',       render: v => fmtDate(String(v)) },
    { key: 'ip',          label: 'IP' },
    { key: 'country',     label: 'País' },
    { key: 'city',        label: 'Ciudad' },
    { key: 'device_type', label: 'Dispositivo', render: v => <DeviceBadge type={String(v)} /> },
    { key: 'os',          label: 'OS' },
    { key: 'browser',     label: 'Navegador' },
  ];

  return (
    <div className="landing-stats">
      {/* header */}
      <div className="stats-header">
        <div>
          <h2 className="stats-title">{landing.name}</h2>
          <a href={landing.url} target="_blank" rel="noopener" className="stats-url">
            {landing.url}
          </a>
        </div>
        <div className="stats-controls">
          <select value={range} onChange={e => setRange(e.target.value)} className="admin-select">
            <option value="7">Últimos 7 días</option>
            <option value="14">Últimos 14 días</option>
            <option value="30">Últimos 30 días</option>
            <option value="90">Últimos 90 días</option>
          </select>
          <button onClick={load} className="admin-btn-sm">↻ Actualizar</button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="kpi-grid">
        {kpis.map(k => (
          <div key={k.label} className="kpi-card">
            <div className="kpi-icon">{k.icon}</div>
            <div className="kpi-body">
              <div className="kpi-value">{k.value}</div>
              <div className="kpi-label">{k.label}</div>
              <div className="kpi-sub">{k.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* tabs */}
      <div className="stats-tabs">
        {(['overview','behavior','heatmap','sections','seo'] as const).map(t => (
          <button
            key={t} onClick={() => setTab(t)}
            className={`stats-tab ${tab === t ? 'active' : ''}`}
          >
            { t === 'overview'  ? '📊 Visión general'
            : t === 'behavior'  ? '🚪 Comportamiento'
            : t === 'heatmap'   ? '🔥 Mapa de calor'
            : t === 'sections'  ? '⏱ Secciones'
            : '🔍 SEO & Tráfico' }
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {tab === 'overview' && (
        <div className="tab-content">
          <div className="charts-row">
            <div className="chart-card wide">
              <div className="chart-title">Visitas por día</div>
              <LineChart data={pvTimeline} />
            </div>
          </div>
          <div className="charts-row two-col">
            <div className="chart-card">
              <div className="chart-title">Dispositivos</div>
              <DonutChart data={devices.map((d, i) => ({ label: d.device, value: d.count, color: DEVICE_COLORS[i] || '#888' }))} />
            </div>
            <div className="chart-card">
              <div className="chart-title">Profundidad de scroll</div>
              <ScrollFunnel data={scrollDist} total={sessions} />
            </div>
          </div>
          <div className="charts-row">
            <div className="chart-card wide">
              <div className="chart-title">Botones CTA más clickeados</div>
              <HorizontalBar data={topCtas.map(c => ({ label: c.label, value: c.clicks }))} />
            </div>
          </div>
        </div>
      )}

      {/* ── COMPORTAMIENTO ── */}
      {tab === 'behavior' && (
        <div className="tab-content">

          <div className="chart-card wide">
            <div className="chart-title">🚪 Abandonos — usuarios que no compraron</div>
            <div className="chart-subtitle">
              {abandonedCount} sesión{abandonedCount !== 1 ? 'es' : ''} navegaron el sitio sin hacer clic en ningún botón de compra ni WhatsApp
              {sessions > 0 ? ` (${((abandonedCount / sessions) * 100).toFixed(1)}% del total de sesiones)` : ''}.
              Buscá por IP, país, ciudad o dispositivo.
            </div>
            <DataGrid
              rows={abandonedVisitors}
              cols={abandonCols}
              searchFields={['ip','country','city','region','os','browser','device_type']}
            />
          </div>

          <div className="chart-card wide">
            <div className="chart-title">🌎 Todos los visitantes — geolocalización y dispositivo</div>
            <div className="chart-subtitle">
              Cada visita con IP, ubicación, dispositivo y si terminó comprando o abandonando.
            </div>
            <DataGrid
              rows={visitorsGrid}
              cols={visitorCols}
              searchFields={['ip','country','city','device_type','os','browser']}
            />
          </div>

          <div className="chart-card wide">
            <div className="chart-title">🛒 Clicks en botón Comprar — Header vs Footer</div>
            <div className="chart-subtitle">
              Cada clic en un botón de compra con la posición exacta (header, footer o flotante).
            </div>
            <DataGrid
              rows={ctaGrid}
              cols={ctaCols}
              searchFields={['label','btn_position','sid']}
            />
          </div>

          <div className="chart-card wide">
            <div className="chart-title">💬 Clicks en botón WhatsApp</div>
            <div className="chart-subtitle">
              Registro de cada visitante que hizo clic en el botón de WhatsApp.
            </div>
            <DataGrid
              rows={waGrid}
              cols={waCols}
              searchFields={['ip','country','city','device_type','os','browser']}
            />
          </div>

        </div>
      )}

      {/* ── HEATMAP ── */}
      {tab === 'heatmap' && (
        <div className="tab-content">
          <div className="chart-card wide">
            <div className="chart-title">Mapa de calor de clicks</div>
            <div className="chart-subtitle">
              Distribución de clicks sobre el viewport. Cuanto más dorado/rojo, mayor concentración.
            </div>
            <Heatmap points={heatmap} landingUrl={landing.url} />
          </div>
          <div className="chart-card wide">
            <div className="chart-title">Top clicks por elemento</div>
            <HorizontalBar data={topCtas.map(c => ({ label: c.label, value: c.clicks }))} color="#e8a818" />
          </div>
          {rage > 0 && (
            <div className="admin-alert warning">
              <strong>⚠ {rage} rage click{rage > 1 ? 's' : ''} detectado{rage > 1 ? 's' : ''}</strong>
              — Hay usuarios que clickearon varias veces seguidas en el mismo lugar.
            </div>
          )}
        </div>
      )}

      {/* ── SECTIONS ── */}
      {tab === 'sections' && (
        <div className="tab-content">
          <div className="chart-card wide">
            <div className="chart-title">Tiempo promedio por sección (segundos)</div>
            <div className="chart-subtitle">Cuánto tiempo permaneció visible cada sección.</div>
            <BarChart
              data={sectionDwell.map(s => ({
                label: s.section.replace('section-','').replace('section_','').replace('sec-','').replace('block_','B'),
                value: Math.round(s.avg_ms / 1000),
              }))}
              height={160}
            />
          </div>

          {/* Visual section cards with iframe preview */}
          <div className="chart-card wide">
            <div className="chart-title">Secciones detectadas — vista previa</div>
            <div className="chart-subtitle">
              Cada sección con su tiempo de atención. Hacé click en "Ver" para abrir la sección en la landing real.
            </div>
            <div className="section-preview-grid">
              {sectionDwell.map((s, idx) => {
                const cleanName = s.section
                  .replace('section-','').replace('section_','')
                  .replace('sec-','').replace('block_','');
                const avgSec = Math.round(s.avg_ms / 1000);
                const maxAvg = Math.max(...sectionDwell.map(x => x.avg_ms));
                const heat   = s.avg_ms / maxAvg; // 0-1 relative heat
                const heatColor = heat > .75 ? '#ff4400' : heat > .45 ? '#f5c518' : '#00bfff';
                const sectionLabel = SECTION_LABELS[s.section] || SECTION_LABELS[cleanName] || cleanName;
                const anchorUrl = landing.url.replace(/\/$/, '') + '#' + s.section;
                return (
                  <div key={s.section} className="section-preview-card">
                    {/* Iframe preview clipped to show only that section's approximate position */}
                    <div className="section-preview-thumb">
                      <iframe
                        src={landing.url}
                        className="section-preview-iframe"
                        style={{
                          transform: `translateY(-${(idx / Math.max(sectionDwell.length, 1)) * 60}%)`,
                        }}
                        title={cleanName}
                        tabIndex={-1}
                      />
                      <div className="section-preview-overlay">
                        <span className="section-preview-rank">#{idx + 1}</span>
                      </div>
                    </div>
                    {/* Info */}
                    <div className="section-preview-info">
                      <div className="section-preview-name">{sectionLabel}</div>
                      <div className="section-preview-id">{s.section}</div>
                      <div className="section-preview-stats">
                        <span className="section-preview-time" style={{ color: heatColor }}>
                          {fmt(avgSec)}
                        </span>
                        <span className="section-preview-views">{s.views} vistas</span>
                      </div>
                      <div className="section-preview-bar-wrap">
                        <div
                          className="section-preview-bar-fill"
                          style={{ width: `${Math.round(heat * 100)}%`, background: heatColor }}
                        />
                      </div>
                      <a
                        href={anchorUrl}
                        target="_blank"
                        rel="noopener"
                        className="section-preview-link"
                      >
                        Ver en landing →
                      </a>
                    </div>
                  </div>
                );
              })}
              {!sectionDwell.length && (
                <div className="chart-empty">Sin datos de secciones aún</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SEO ── */}
      {tab === 'seo' && (
        <div className="tab-content">
          <div className="charts-row two-col">
            <div className="chart-card">
              <div className="chart-title">Fuentes de tráfico</div>
              <DonutChart data={referrers.map((r, i) => ({ label: r.source, value: r.visits, color: REF_COLORS[i] || '#555' }))} />
            </div>
            <div className="chart-card">
              <div className="chart-title">Campañas UTM</div>
              {utmCamps.length ? (
                <HorizontalBar data={utmCamps.map(c => ({ label: c.campaign, value: c.visits }))} color="#c07808" />
              ) : (
                <div className="chart-empty">
                  Sin campañas UTM registradas.<br/>
                  <small>Agregá <code>?utm_campaign=nombre</code> a tus links.</small>
                </div>
              )}
            </div>
          </div>
          <div className="chart-card wide">
            <div className="chart-title">Fuentes detalladas</div>
            <HorizontalBar data={referrers.map(r => ({ label: r.source, value: r.visits }))} color="#f5c518" />
          </div>
          <div className="chart-card wide">
            <div className="chart-title">Checklist SEO de la landing</div>
            <div className="seo-checklist">
              {[
                ['Title tag optimizado con palabras clave', true],
                ['Meta description (< 160 chars)', true],
                ['Open Graph completo (Facebook/WhatsApp)', true],
                ['Twitter Card', true],
                ['JSON-LD Product Schema', true],
                ['JSON-LD BreadcrumbList', true],
                ['JSON-LD Organization', true],
                ['JSON-LD FAQPage (rich snippets)', true],
                ['Canonical URL definida', true],
                ['hreflang es-AR', true],
                ['Sitemap XML con image sitemap', true],
                ['robots.txt correcto', true],
                ['Imágenes con alt text', true],
                ['Responsive design', true],
                ['Core Web Vitals — sin JS bloqueante', true],
              ].map(([label, ok]) => (
                <div key={String(label)} className="seo-item">
                  <span className={`seo-check ${ok ? 'ok' : 'warn'}`}>{ok ? '✔' : '⚠'}</span>
                  <span>{String(label)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
