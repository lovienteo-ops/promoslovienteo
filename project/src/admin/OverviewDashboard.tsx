import { useState, useEffect, useCallback } from 'react';
import { getOverview } from './api';
import { LineChart, BarChart } from './Charts';

interface LandingStat {
  id: string;
  slug: string;
  name: string;
  url: string;
  active: boolean;
  pageviews: number;
  sessions: number;
  ctaClicks: number;
  waClicks: number;
  avgTimeSec: number;
  conversionRate: number;
}

interface OverviewData {
  landings: LandingStat[];
  totals: { pageviews: number; sessions: number; ctaClicks: number; waClicks: number };
  pvTimeline: { date: string; views: number }[];
}

interface Props {
  token: string;
  onSelectLanding: (slug: string) => void;
}

const RANGES = [
  { label: '7d',  days: 7 },
  { label: '14d', days: 14 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
];

function kpiCard(label: string, value: string | number, sub?: string, color?: string) {
  return (
    <div className="ov-kpi">
      <div className="ov-kpi-val" style={color ? { color } : undefined}>{value}</div>
      <div className="ov-kpi-label">{label}</div>
      {sub && <div className="ov-kpi-sub">{sub}</div>}
    </div>
  );
}

function fmtTime(sec: number) {
  if (!sec) return '—';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function convColor(rate: number) {
  if (rate >= 5) return '#4ade80';
  if (rate >= 2) return '#fde68a';
  return '#f87171';
}

export default function OverviewDashboard({ token, onSelectLanding }: Props) {
  const [data, setData]       = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange]     = useState(30);
  const [sortBy, setSortBy]   = useState<keyof LandingStat>('pageviews');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const from = new Date(Date.now() - range * 86400000).toISOString();
      const res  = await getOverview(token, from);
      if (res && Array.isArray(res.landings) && Array.isArray(res.pvTimeline)) {
        setData(res);
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [token, range]);

  useEffect(() => { load(); }, [load]);

  function toggleSort(col: keyof LandingStat) {
    if (sortBy === col) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortBy(col); setSortDir('desc'); }
  }

  const sorted = data
    ? [...data.landings].sort((a, b) => {
        const av = a[sortBy] as number;
        const bv = b[sortBy] as number;
        return sortDir === 'desc' ? bv - av : av - bv;
      })
    : [];

  const overallCr = data && data.totals.sessions > 0
    ? ((data.totals.ctaClicks / data.totals.sessions) * 100).toFixed(1)
    : '0.0';

  const SortIcon = ({ col }: { col: keyof LandingStat }) => (
    <span className="ov-sort-icon">
      {sortBy === col ? (sortDir === 'desc' ? '↓' : '↑') : '↕'}
    </span>
  );

  return (
    <div className="ov-wrap">
      {/* Header */}
      <div className="ov-header">
        <div>
          <h1 className="ov-title">Dashboard General</h1>
          <p className="ov-subtitle">Rendimiento consolidado de todas las landings</p>
        </div>
        <div className="ov-controls">
          <div className="ov-range-group">
            {RANGES.map(r => (
              <button
                key={r.days}
                className={`ov-range-btn ${range === r.days ? 'active' : ''}`}
                onClick={() => setRange(r.days)}
              >{r.label}</button>
            ))}
          </div>
          <button className="ov-refresh" onClick={load} title="Actualizar">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"/>
              <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
            </svg>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="ov-loading">
          <div className="ov-spinner" />
          <span>Cargando datos...</span>
        </div>
      ) : !data ? (
        <div className="admin-empty">
          <div className="admin-empty-title">No se pudieron cargar los datos</div>
        </div>
      ) : (
        <>
          {/* Global KPIs */}
          <div className="ov-kpi-grid">
            {kpiCard('Pageviews totales', data.totals.pageviews.toLocaleString('es-AR'))}
            {kpiCard('Sesiones únicas', data.totals.sessions.toLocaleString('es-AR'))}
            {kpiCard('Clics en CTA', data.totals.ctaClicks.toLocaleString('es-AR'), undefined, '#f5c518')}
            {kpiCard('Clics en WhatsApp', data.totals.waClicks.toLocaleString('es-AR'), undefined, '#4ade80')}
            {kpiCard('Conv. global', `${overallCr}%`, 'CTA / sesiones', convColor(parseFloat(overallCr)))}
            {kpiCard('Landings activas', data.landings.filter(l => l.active).length, `de ${data.landings.length} totales`)}
          </div>

          {/* Charts row */}
          <div className="ov-charts-row">
            {/* Timeline */}
            <div className="ov-chart-card wide">
              <div className="ov-card-title">Visitas diarias (todas las landings)</div>
              {data.pvTimeline.length > 1 ? (
                <LineChart data={data.pvTimeline} />
              ) : (
                <div className="ov-no-data">Sin datos suficientes para el período</div>
              )}
            </div>

            {/* Top 5 landings bar */}
            <div className="ov-chart-card">
              <div className="ov-card-title">Top landings por pageviews</div>
              {sorted.length > 0 ? (
                <BarChart
                  data={sorted.slice(0, 6).map(l => ({ label: l.name, value: l.pageviews }))}
                  height={180}
                />
              ) : (
                <div className="ov-no-data">Sin datos</div>
              )}
            </div>
          </div>

          {/* Rankings table */}
          <div className="ov-table-card">
            <div className="ov-card-title">Ranking de landings</div>
            <div className="ov-table-wrap">
              <table className="ov-table">
                <thead>
                  <tr>
                    <th className="ov-th-name">Landing</th>
                    <th className="ov-th-num sortable" onClick={() => toggleSort('pageviews')}>
                      Pageviews <SortIcon col="pageviews" />
                    </th>
                    <th className="ov-th-num sortable" onClick={() => toggleSort('sessions')}>
                      Sesiones <SortIcon col="sessions" />
                    </th>
                    <th className="ov-th-num sortable" onClick={() => toggleSort('ctaClicks')}>
                      CTA <SortIcon col="ctaClicks" />
                    </th>
                    <th className="ov-th-num sortable" onClick={() => toggleSort('waClicks')}>
                      WhatsApp <SortIcon col="waClicks" />
                    </th>
                    <th className="ov-th-num sortable" onClick={() => toggleSort('conversionRate')}>
                      Conv. % <SortIcon col="conversionRate" />
                    </th>
                    <th className="ov-th-num sortable" onClick={() => toggleSort('avgTimeSec')}>
                      T. Promedio <SortIcon col="avgTimeSec" />
                    </th>
                    <th className="ov-th-act"></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((l, i) => (
                    <tr key={l.id} className="ov-tr" onClick={() => onSelectLanding(l.slug)}>
                      <td className="ov-td-name">
                        <div className="ov-td-rank">#{i + 1}</div>
                        <div className="ov-td-info">
                          <span className="ov-td-landing-name">{l.name}</span>
                          <span className="ov-td-slug">{l.slug}</span>
                        </div>
                        <span className={`ov-status-dot ${l.active ? 'active' : ''}`} />
                      </td>
                      <td className="ov-td-num">{l.pageviews.toLocaleString('es-AR')}</td>
                      <td className="ov-td-num">{l.sessions.toLocaleString('es-AR')}</td>
                      <td className="ov-td-num gold">{l.ctaClicks.toLocaleString('es-AR')}</td>
                      <td className="ov-td-num green">{l.waClicks.toLocaleString('es-AR')}</td>
                      <td className="ov-td-num">
                        <span className="ov-conv-badge" style={{ background: convColor(l.conversionRate) + '22', color: convColor(l.conversionRate) }}>
                          {l.conversionRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="ov-td-num muted">{fmtTime(l.avgTimeSec)}</td>
                      <td className="ov-td-act">
                        <button
                          className="ov-detail-btn"
                          onClick={e => { e.stopPropagation(); onSelectLanding(l.slug); }}
                        >Ver detalle →</button>
                      </td>
                    </tr>
                  ))}
                  {sorted.length === 0 && (
                    <tr><td colSpan={8} className="ov-empty-row">Sin datos para este período</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conv bar mini chart */}
          {sorted.length > 0 && (
            <div className="ov-conv-chart-card">
              <div className="ov-card-title">Tasa de conversión por landing (%)</div>
              <div className="ov-conv-bars">
                {sorted.map(l => (
                  <div key={l.id} className="ov-conv-row">
                    <div className="ov-conv-label" title={l.name}>{l.name}</div>
                    <div className="ov-conv-bar-wrap">
                      <div
                        className="ov-conv-bar-fill"
                        style={{
                          width: `${Math.min(l.conversionRate * 10, 100)}%`,
                          background: convColor(l.conversionRate),
                        }}
                      />
                    </div>
                    <div className="ov-conv-pct" style={{ color: convColor(l.conversionRate) }}>
                      {l.conversionRate.toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
