import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import AdminLogin from './AdminLogin';
import LandingStats from './LandingStats';
import OverviewDashboard from './OverviewDashboard';
import { getLandings, addLanding } from './api';
import './admin.css';

interface Landing { id: string; slug: string; name: string; url: string; active: boolean; }

export default function AdminApp() {
  const { token, username, loading, error, login, logout, isAuthenticated } = useAuth();
  const [landings, setLandings]             = useState<Landing[]>([]);
  const [activeLanding, setActiveLanding]   = useState<Landing | null>(null);
  const [showOverview, setShowOverview]     = useState(true);
  const [landingsLoading, setLandingsLoading] = useState(false);
  const [showAddForm, setShowAddForm]       = useState(false);
  const [newLanding, setNewLanding]         = useState({ slug: '', name: '', url: '' });
  const [addError, setAddError]             = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen]       = useState(false);

  const fetchLandings = useCallback(async () => {
    if (!token) return;
    setLandingsLoading(true);
    try {
      const data = await getLandings(token);
      setLandings(data);
    } catch { /* ignore */ }
    finally { setLandingsLoading(false); }
  }, [token]);

  useEffect(() => { if (isAuthenticated) fetchLandings(); }, [isAuthenticated, fetchLandings]);

  if (!isAuthenticated) {
    return <AdminLogin onLogin={login} loading={loading} error={error} />;
  }

  function selectLanding(l: Landing) {
    setActiveLanding(l);
    setShowOverview(false);
    setSidebarOpen(false);
  }

  function selectBySlug(slug: string) {
    const l = landings.find(x => x.slug === slug);
    if (l) selectLanding(l);
  }

  function goOverview() {
    setShowOverview(true);
    setActiveLanding(null);
    setSidebarOpen(false);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setAddError(null);
    if (!token) return;
    try {
      const created = await addLanding(token, newLanding);
      setLandings(prev => [created, ...prev]);
      selectLanding(created);
      setShowAddForm(false);
      setNewLanding({ slug: '', name: '', url: '' });
    } catch (err) {
      setAddError(err instanceof Error ? err.message : 'Error');
    }
  }

  const topbarTitle = showOverview ? 'Dashboard General' : (activeLanding?.name ?? 'Panel');

  return (
    <div className="admin-layout">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img
            src="/freepik_saca-el-logo-de-mercado-l_2860292403.png"
            alt="Lo Vi En Teo"
          />
          <div className="sidebar-brand-text">
            <span className="brand-name">Lo Vi En Teo</span>
            <span className="brand-sub">Panel Analytics</span>
          </div>
        </div>

        {/* Overview nav item */}
        <nav className="sidebar-nav" style={{ marginBottom: 0 }}>
          <button
            className={`sidebar-item overview-item ${showOverview ? 'active' : ''}`}
            onClick={goOverview}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            <span className="sidebar-item-name">Dashboard General</span>
          </button>
        </nav>

        <div className="sidebar-section-label">Landings activas</div>

        {landingsLoading ? (
          <div className="sidebar-loading">Cargando...</div>
        ) : (
          <nav className="sidebar-nav">
            {landings.map(l => (
              <button
                key={l.id}
                className={`sidebar-item ${!showOverview && activeLanding?.id === l.id ? 'active' : ''}`}
                onClick={() => selectLanding(l)}
              >
                <span className={`sidebar-dot ${l.active ? 'green' : 'gray'}`} />
                <span className="sidebar-item-name">{l.name}</span>
              </button>
            ))}
          </nav>
        )}

        <button className="sidebar-add" onClick={() => setShowAddForm(v => !v)}>
          + Nueva landing
        </button>

        {showAddForm && (
          <form onSubmit={handleAdd} className="sidebar-add-form">
            {addError && <div className="admin-alert small">{addError}</div>}
            <input
              placeholder="Slug (ej: aspiradora-x)"
              value={newLanding.slug}
              onChange={e => setNewLanding(p => ({ ...p, slug: e.target.value }))}
              required
            />
            <input
              placeholder="Nombre visible"
              value={newLanding.name}
              onChange={e => setNewLanding(p => ({ ...p, name: e.target.value }))}
              required
            />
            <input
              placeholder="URL pública"
              value={newLanding.url}
              onChange={e => setNewLanding(p => ({ ...p, url: e.target.value }))}
              required
            />
            <button type="submit" className="admin-btn-primary small">Guardar</button>
          </form>
        )}

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <span className="sidebar-user-icon">👤</span>
            <div>
              <div className="sidebar-user-name">{username}</div>
              <div className="sidebar-user-role">Super Admin</div>
            </div>
          </div>
          <button onClick={logout} className="sidebar-logout" title="Cerrar sesión">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </aside>

      {/* MOBILE OVERLAY */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      {/* MAIN */}
      <main className="admin-main">
        {/* topbar */}
        <div className="admin-topbar">
          <button className="admin-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Menú">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="3" y1="6"  x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          <div className="admin-topbar-title">{topbarTitle}</div>
          <div className="admin-topbar-right">
            <span className="admin-badge">SuperAdmin</span>
          </div>
        </div>

        {/* content */}
        <div className="admin-content">
          {showOverview ? (
            <OverviewDashboard token={token!} onSelectLanding={selectBySlug} />
          ) : activeLanding ? (
            <LandingStats key={activeLanding.id} token={token!} landing={activeLanding} />
          ) : (
            <div className="admin-empty">
              <div className="admin-empty-icon">📊</div>
              <div className="admin-empty-title">No hay landings todavía</div>
              <div className="admin-empty-sub">
                Hacé click en <strong>+ Nueva landing</strong> en el menú izquierdo para agregar una.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
