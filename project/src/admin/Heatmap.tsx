import { useEffect, useRef, useState } from 'react';

interface Point { x: number; y: number; label: string; }
interface Props  { points: Point[]; landingUrl?: string; }

/* Full-page height: landing pages are typically 4000-6000px tall.
   Y coords from tracking are 0-100% of the full document height. */
const IFRAME_NATIVE_WIDTH = 1280;
const PAGE_HEIGHT = 5000;

function drawHeatmap(canvas: HTMLCanvasElement, points: Point[]) {
  const { width, height } = canvas;
  const ctx = canvas.getContext('2d');
  if (!ctx || !width || !height) return;

  ctx.clearRect(0, 0, width, height);
  if (!points.length) return;

  const radius = Math.max(width, 400) * 0.06;
  points.forEach(p => {
    const cx = (p.x / 100) * width;
    const cy = (p.y / 100) * height;
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    grad.addColorStop(0,   'rgba(255,255,255,0.30)');
    grad.addColorStop(0.4, 'rgba(255,255,255,0.12)');
    grad.addColorStop(1,   'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.fill();
  });

  const imgData = ctx.getImageData(0, 0, width, height);
  const data    = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] / 255;
    if (alpha === 0) continue;
    let r = 0, g = 0, b = 0;
    if (alpha < 0.25) {
      const t = alpha / 0.25;
      r = 0; g = Math.round(180 * t); b = Math.round(255 * (1 - t * 0.5));
    } else if (alpha < 0.5) {
      const t = (alpha - 0.25) / 0.25;
      r = Math.round(80 * t); g = Math.round(180 + 75 * t); b = Math.round(128 * (1 - t));
    } else if (alpha < 0.75) {
      const t = (alpha - 0.5) / 0.25;
      r = Math.round(80 + 175 * t); g = Math.round(255 - 60 * t); b = 0;
    } else {
      const t = (alpha - 0.75) / 0.25;
      r = 255; g = Math.round(195 - 195 * t); b = 0;
    }
    data[i]     = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = Math.round(alpha * 220);
  }
  ctx.putImageData(imgData, 0, 0);
}

export default function Heatmap({ points, landingUrl }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const innerRef   = useRef<HTMLDivElement>(null);
  const iframeRef  = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  function redraw() {
    const canvas = canvasRef.current;
    const inner  = innerRef.current;
    if (!canvas || !inner) return;
    const containerW = inner.clientWidth || 800;
    const scale = containerW / IFRAME_NATIVE_WIDTH;

    // Scale iframe to fill container width while keeping proportions
    if (iframeRef.current) {
      iframeRef.current.style.transform = `scale(${scale})`;
      iframeRef.current.style.height    = `${PAGE_HEIGHT / scale}px`;
    }
    // Adjust inner height to match scaled iframe
    inner.style.height = `${PAGE_HEIGHT}px`;

    canvas.width  = containerW;
    canvas.height = PAGE_HEIGHT;
    drawHeatmap(canvas, points);
    setReady(true);
  }

  useEffect(() => {
    redraw();
    const ro = new ResizeObserver(redraw);
    if (innerRef.current) ro.observe(innerRef.current);
    return () => ro.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points]);

  const hasData = points.length > 0;

  // Bucket points by Y zone for summary
  const zones = { top: 0, mid: 0, bot: 0 };
  points.forEach(p => {
    if (p.y < 33) zones.top++;
    else if (p.y < 66) zones.mid++;
    else zones.bot++;
  });

  return (
    <div className="heatmap-outer">

      {/* Stats bar */}
      <div className="heatmap-stats-bar">
        <span className="heatmap-stat">
          <strong>{points.length}</strong> clicks registrados
        </span>
        {hasData && (
          <>
            <span className="heatmap-stat-sep">·</span>
            <span className="heatmap-stat">
              Arriba <strong style={{color:'#f5c518'}}>{zones.top}</strong>
            </span>
            <span className="heatmap-stat-sep">·</span>
            <span className="heatmap-stat">
              Medio <strong style={{color:'#ff8800'}}>{zones.mid}</strong>
            </span>
            <span className="heatmap-stat-sep">·</span>
            <span className="heatmap-stat">
              Abajo <strong style={{color:'#ff2200'}}>{zones.bot}</strong>
            </span>
            <span className="heatmap-stat-sep">·</span>
            <span className="heatmap-stat heatmap-legend-inline">
              <span className="hm-dot cold" /> Frío
              <span className="hm-dot warm" /> Tibio
              <span className="hm-dot hot"  /> Caliente
            </span>
          </>
        )}
      </div>

      {/* Scrollable viewport: iframe behind + canvas overlay */}
      <div className="heatmap-scroll-wrap">
        <div ref={innerRef} className="heatmap-inner">
          {/* Landing preview — full-page iframe, scaled to container width */}
          {landingUrl ? (
            <iframe
              ref={iframeRef}
              src={landingUrl}
              className="heatmap-iframe-full"
              title="Landing preview"
            />
          ) : (
            <div className="heatmap-bg-fallback">
              <span>Vista previa no disponible</span>
            </div>
          )}

          {/* Heatmap overlay canvas — same dimensions as inner */}
          <canvas
            ref={canvasRef}
            className="heatmap-canvas-full"
            style={{ opacity: ready && hasData ? 1 : 0 }}
          />

          {!hasData && (
            <div className="heatmap-no-data">
              <div className="heatmap-no-data-icon">🔥</div>
              <div>Sin datos de clicks todavía</div>
              <div className="heatmap-no-data-sub">Los clicks de los visitantes aparecerán aquí</div>
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="heatmap-legend-bar">
        <span className="hm-legend-label">Sin actividad</span>
        <div className="heatmap-gradient-bar" />
        <span className="hm-legend-label">Alta actividad</span>
      </div>

      <div className="heatmap-note">
        Scroll vertical para ver toda la página. Los puntos reflejan la posición real de cada click (0–100% del largo total de la página).
      </div>
    </div>
  );
}
