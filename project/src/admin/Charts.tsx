/* Lightweight SVG charts — zero external deps */

/* ── BAR CHART ── */
interface BarItem { label: string; value: number; }
interface BarProps { data: BarItem[]; color?: string; height?: number; }

export function BarChart({ data, color = '#f5c518', height = 180 }: BarProps) {
  if (!data.length) return <div className="chart-empty">Sin datos</div>;
  const max     = Math.max(...data.map(d => d.value), 1);
  const barW    = 48;
  const gap     = 14;
  const labelH  = 36;   /* space below bars for rotated labels */
  const valueH  = 20;   /* space above bars for value text */
  const chartH  = height - labelH - valueH;
  const totalW  = data.length * (barW + gap) + gap;

  return (
    <div className="bar-chart" style={{ overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${totalW} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        style={{ width: Math.max(totalW, 300), height, display: 'block', minWidth: '100%' }}
      >
        {data.map((d, i) => {
          const barH = Math.max((d.value / max) * chartH, d.value > 0 ? 2 : 0);
          const x    = gap + i * (barW + gap);
          const y    = valueH + chartH - barH;
          const cx   = x + barW / 2;

          return (
            <g key={i}>
              {/* bar */}
              <rect
                x={x} y={y} width={barW} height={barH}
                fill={color} rx={5}
                opacity={0.9}
              />
              {/* value above bar */}
              {d.value > 0 && (
                <text
                  x={cx} y={y - 6}
                  textAnchor="middle"
                  fontSize="12" fontWeight="800" fill={color}
                  style={{ fontFamily: 'Inter,sans-serif' }}
                >
                  {d.value}
                </text>
              )}
              {/* label below bar — rotated -35° so it fits */}
              <text
                x={cx}
                y={valueH + chartH + 6}
                textAnchor="end"
                fontSize="11"
                fill="rgba(255,255,255,.55)"
                style={{ fontFamily: 'Inter,sans-serif' }}
                transform={`rotate(-35, ${cx}, ${valueH + chartH + 6})`}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

/* ── LINE CHART ── */
interface LineItem { date: string; views: number; }
interface LineProps { data: LineItem[]; }

export function LineChart({ data }: LineProps) {
  if (!data.length) return <div className="chart-empty">Sin datos</div>;
  const W = 600; const H = 140; const PAD = 30;
  const max = Math.max(...data.map(d => d.views), 1);

  const pts = data.map((d, i) => ({
    x: PAD + (i / Math.max(data.length - 1, 1)) * (W - PAD * 2),
    y: H - PAD - (d.views / max) * (H - PAD * 2),
    ...d,
  }));

  const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const area = `${path} L${pts[pts.length-1].x.toFixed(1)},${H-PAD} L${pts[0].x.toFixed(1)},${H-PAD} Z`;

  /* show only a few labels to avoid clutter */
  const showEvery = Math.ceil(data.length / 6);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 140 }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#f5c518" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#f5c518" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* grid lines */}
      {[0.25,0.5,0.75,1].map(t => {
        const y = H - PAD - t * (H - PAD * 2);
        return (
          <g key={t}>
            <line x1={PAD} y1={y} x2={W-PAD} y2={y} stroke="rgba(255,255,255,.06)" strokeWidth="1" />
            <text x={PAD - 4} y={y + 3} textAnchor="end" fontSize="8" fill="rgba(255,255,255,.3)"
                  style={{ fontFamily: 'Inter,sans-serif' }}>
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}
      <path d={area} fill="url(#lineGrad)" />
      <path d={path} fill="none" stroke="#f5c518" strokeWidth="2" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={3} fill="#f5c518" />
          {i % showEvery === 0 && (
            <text x={p.x} y={H - 2} textAnchor="middle" fontSize="7.5" fill="rgba(255,255,255,.4)"
                  style={{ fontFamily: 'Inter,sans-serif' }}>
              {p.date.slice(5)}
            </text>
          )}
        </g>
      ))}
    </svg>
  );
}

/* ── DONUT CHART ── */
interface DonutItem { label: string; value: number; color: string; }
interface DonutProps { data: DonutItem[]; }

export function DonutChart({ data }: DonutProps) {
  if (!data.length) return <div className="chart-empty">Sin datos</div>;
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 48; const CX = 60; const CY = 60;
  let startAngle = -Math.PI / 2;

  const slices = data.map(d => {
    const angle = (d.value / total) * Math.PI * 2;
    const x1 = CX + R * Math.cos(startAngle);
    const y1 = CY + R * Math.sin(startAngle);
    startAngle += angle;
    const x2 = CX + R * Math.cos(startAngle);
    const y2 = CY + R * Math.sin(startAngle);
    const large = angle > Math.PI ? 1 : 0;
    return { ...d, x1, y1, x2, y2, large, pct: Math.round(d.value / total * 100) };
  });

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, flexShrink: 0 }}>
        {slices.map((s, i) => (
          <path key={i}
            d={`M${CX},${CY} L${s.x1.toFixed(2)},${s.y1.toFixed(2)} A${R},${R} 0 ${s.large},1 ${s.x2.toFixed(2)},${s.y2.toFixed(2)} Z`}
            fill={s.color} opacity={0.9}
          />
        ))}
        <circle cx={CX} cy={CY} r={28} fill="#0f0b00" />
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="13" fontWeight="900" fill="#f5c518"
              style={{ fontFamily: 'Inter,sans-serif' }}>
          {total}
        </text>
        <text x={CX} y={CY + 10} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,.4)"
              style={{ fontFamily: 'Inter,sans-serif' }}>
          total
        </text>
      </svg>
      <div className="donut-legend">
        {slices.map((s, i) => (
          <div key={i} className="donut-item">
            <span className="donut-dot" style={{ background: s.color }} />
            <span className="donut-lbl">{s.label}</span>
            <span className="donut-val">{s.value} <em>({s.pct}%)</em></span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── HORIZONTAL BAR ── */
interface HBarItem { label: string; value: number; }
interface HBarProps { data: HBarItem[]; color?: string; }

export function HorizontalBar({ data, color = '#f5c518' }: HBarProps) {
  if (!data.length) return <div className="chart-empty">Sin datos</div>;
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="hbar-list">
      {data.map((d, i) => (
        <div key={i} className="hbar-row">
          <div className="hbar-label" title={d.label}>{d.label}</div>
          <div className="hbar-track">
            <div
              className="hbar-fill"
              style={{ width: `${(d.value / max) * 100}%`, background: color }}
            />
          </div>
          <div className="hbar-val">{d.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ── SCROLL FUNNEL ── */
interface FunnelProps { data: Record<string, number>; total: number; }

export function ScrollFunnel({ data, total }: FunnelProps) {
  const steps = [
    { pct: '25',  label: '25% del scroll', color: '#f5c518' },
    { pct: '50',  label: '50% del scroll', color: '#e8a818' },
    { pct: '75',  label: '75% del scroll', color: '#d4900f' },
    { pct: '100', label: 'Llegó al final', color: '#c07808' },
  ];
  const base = total || 1;
  return (
    <div className="funnel-wrap">
      {steps.map(s => {
        const val = data[s.pct] || 0;
        const w   = Math.round((val / base) * 100);
        return (
          <div key={s.pct} className="funnel-step">
            <div className="funnel-meta">
              <span className="funnel-label">{s.label}</span>
              <span className="funnel-count">{val} <em>({w}%)</em></span>
            </div>
            <div className="funnel-track">
              <div className="funnel-fill" style={{ width: `${w}%`, background: s.color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
