import { useState } from 'react';

interface Props { onLogin: (u: string, p: string) => void; loading: boolean; error: string | null; }

export default function AdminLogin({ onLogin, loading, error }: Props) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');

  return (
    <div className="admin-login-wrap">
      <div className="admin-login-card">
        <div className="admin-login-logo">
          <img
            src="/freepik_saca-el-logo-de-mercado-l_2860292403.png"
            alt="Lo Vi En Teo"
          />
        </div>
        <h1 className="admin-login-title">Panel de Control</h1>
        <p className="admin-login-sub">Lo Vi En Teo &mdash; Analytics</p>

        {error && <div className="admin-alert">{error}</div>}

        <form
          onSubmit={e => { e.preventDefault(); onLogin(u, p); }}
          className="admin-login-form"
        >
          <div className="admin-field">
            <label>Usuario</label>
            <input
              type="text" value={u} onChange={e => setU(e.target.value)}
              placeholder="Lovienteo" autoFocus required
            />
          </div>
          <div className="admin-field">
            <label>Contraseña</label>
            <input
              type="password" value={p} onChange={e => setP(e.target.value)}
              placeholder="••••••••••" required
            />
          </div>
          <button type="submit" disabled={loading} className="admin-btn-primary">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
