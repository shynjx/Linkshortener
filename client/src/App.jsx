import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Check,
  CircleHelp,
  Clipboard,
  ExternalLink,
  Globe2,
  Link2,
  LogOut,
  Menu,
  MousePointerClick,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  X,
  Zap,
} from 'lucide-react'
import './App.css'

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '')
const TOKEN_KEY = 'linkshortener_token'
const USER_KEY = 'linkshortener_user'

async function apiRequest(path, { token, ...options } = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data.message || 'Não foi possível concluir a solicitação.')
  }
  return data
}

function formatNumber(value = 0) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getShortUrl(shortCode) {
  return `${API_URL}/${shortCode}`
}

function getDomain(value = '') {
  try {
    return new URL(value).hostname.replace(/^www\./, '')
  } catch {
    return value
  }
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setLoading(true)

    try {
      if (mode === 'register') {
        await apiRequest('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        })
        setMode('login')
        setNotice('Conta criada! Agora entre com seu e-mail e senha.')
        setPassword('')
      } else {
        const data = await apiRequest('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email: email.trim(), password }),
        })
        onLogin(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-glow auth-glow-one" />
      <div className="auth-glow auth-glow-two" />
      <a className="brand auth-brand" href="/" aria-label="Linkora início">
        <span className="brand-mark"><Link2 size={21} /></span>
        <span>linkora<span className="brand-dot">.</span></span>
      </a>

      <section className="auth-card">
        <div className="auth-icon"><Zap size={23} fill="currentColor" /></div>
        <span className="eyebrow">SEUS LINKS, SEM LIMITES</span>
        <h1>{mode === 'login' ? 'Bom ter você de volta.' : 'Crie sua conta.'}</h1>
        <p className="auth-subtitle">
          {mode === 'login'
            ? 'Entre para organizar seus links e acompanhar seus resultados.'
            : 'Comece a encurtar links e acompanhar cada clique.'}
        </p>

        <div className="auth-tabs">
          <button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setError(''); setNotice('') }} type="button">Entrar</button>
          <button className={mode === 'register' ? 'active' : ''} onClick={() => { setMode('register'); setError(''); setNotice('') }} type="button">Criar conta</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'register' && (
            <label>
              Nome
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Como podemos te chamar?" autoComplete="name" required />
            </label>
          )}
          <label>
            E-mail
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="voce@exemplo.com" autoComplete="email" required />
          </label>
          <label>
            Senha
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="Mínimo de 6 caracteres" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={6} required />
          </label>
          {error && <div className="form-message error-message">{error}</div>}
          {notice && <div className="form-message success-message">{notice}</div>}
          <button className="primary-button auth-submit" type="submit" disabled={loading}>
            {loading ? 'Aguarde...' : mode === 'login' ? 'Entrar na plataforma' : 'Criar minha conta'}
            {!loading && <ArrowUpRight size={17} />}
          </button>
        </form>
        <div className="auth-security"><ShieldCheck size={15} /> Seus dados são protegidos por autenticação.</div>
      </section>
      <p className="auth-footer">LINKORA © {new Date().getFullYear()} <span>•</span> SIMPLES ASSIM.</p>
    </main>
  )
}

function Sidebar({ user, onLogout, mobileOpen, setMobileOpen, activeView, setActiveView }) {
  return (
    <>
      {mobileOpen && <button className="sidebar-scrim" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-top">
          <a className="brand" href="/" aria-label="Linkora início">
            <span className="brand-mark"><Link2 size={20} /></span>
            <span>linkora<span className="brand-dot">.</span></span>
          </a>
          <button className="icon-button sidebar-close" onClick={() => setMobileOpen(false)} aria-label="Fechar menu"><X size={19} /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="side-nav">
          <button className={activeView === 'overview' ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveView('overview'); setMobileOpen(false) }}>
            <BarChart3 size={18} /> Visão geral
          </button>
          <button className={activeView === 'links' ? 'nav-item active' : 'nav-item'} onClick={() => { setActiveView('links'); setMobileOpen(false) }}>
            <Link2 size={18} /> Meus links
          </button>
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon"><CircleHelp size={18} /></div>
            <strong>Precisa de ajuda?</strong>
            <span>Estamos aqui para ajudar você.</span>
            <a href="mailto:suporte@linkora.app">Falar com suporte <ArrowUpRight size={13} /></a>
          </div>
          <div className="profile-row">
            <div className="avatar">{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</div>
            <div className="profile-copy">
              <strong>{user?.name || 'Sua conta'}</strong>
              <span>{user?.email || 'Conta Linkora'}</span>
            </div>
            <button className="icon-button logout-button" onClick={onLogout} title="Sair" aria-label="Sair"><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
    </>
  )
}

function StatCard({ label, value, detail, icon: Icon, tone }) {
  return (
    <article className="stat-card">
      <div className="stat-topline">
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}><Icon size={18} /></span>
      </div>
      <strong className="stat-value">{formatNumber(value)}</strong>
      <span className="stat-detail">{detail}</span>
    </article>
  )
}

function LinkRow({ item, onCopy, copied }) {
  const shortUrl = getShortUrl(item.shortCode)
  return (
    <tr>
      <td>
        <div className="link-cell">
          <span className="link-favicon"><Globe2 size={16} /></span>
          <div className="link-info">
            <strong>{getDomain(item.originalUrl)}</strong>
            <span title={item.originalUrl}>{item.originalUrl}</span>
          </div>
        </div>
      </td>
      <td>
        <button className="short-link" onClick={() => onCopy(shortUrl)} title="Copiar link curto">
          <span>{shortUrl.replace(/^https?:\/\//, '')}</span>
          {copied ? <Check size={15} /> : <Clipboard size={15} />}
        </button>
      </td>
      <td><span className="click-count"><MousePointerClick size={14} /> {formatNumber(item.clicks)}</span></td>
      <td className="date-cell">{formatDate(item.createdAt)}</td>
      <td><a className="external-link" href={shortUrl} target="_blank" rel="noreferrer" aria-label="Abrir link curto"><ExternalLink size={16} /></a></td>
    </tr>
  )
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null') } catch { return null }
  })
  const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, topLinks: [], recentLinks: [] })
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_KEY)))
  const [refreshing, setRefreshing] = useState(false)
  const [url, setUrl] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdLink, setCreatedLink] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [copied, setCopied] = useState('')
  const [search, setSearch] = useState('')
  const [activeView, setActiveView] = useState('overview')
  const [mobileOpen, setMobileOpen] = useState(false)

  const loadStats = useCallback(async (activeToken, quiet = false) => {
    if (!quiet) setRefreshing(true)
    try {
      const data = await apiRequest('/api/urls/stats', { token: activeToken })
      setStats({
        totalLinks: data.totalLinks ?? 0,
        totalClicks: data.totalClicks ?? 0,
        topLinks: data.topLinks ?? [],
        recentLinks: data.recentLinks ?? [],
      })
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }, [])

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setStats({ totalLinks: 0, totalClicks: 0, topLinks: [], recentLinks: [] })
    setLoading(false)
  }, [])

  useEffect(() => {
    if (!token) return
    let cancelled = false
    async function validateSession() {
      try {
        await apiRequest('/api/auth/profile', { token })
        if (!cancelled) await loadStats(token, true)
      } catch {
        if (!cancelled) handleLogout()
      }
    }
    validateSession()
    return () => { cancelled = true }
  }, [token, loadStats, handleLogout])

  function handleLogin(data) {
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setToken(data.token)
    setUser(data.user)
    setLoading(true)
  }

  async function handleCreate(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    setCreatedLink(null)

    let normalizedUrl = url.trim()
    if (!/^https?:\/\//i.test(normalizedUrl)) normalizedUrl = `https://${normalizedUrl}`

    try {
      new URL(normalizedUrl)
    } catch {
      setError('Digite um endereço válido, como https://exemplo.com')
      return
    }

    setCreating(true)
    try {
      const data = await apiRequest('/api/urls', {
        method: 'POST',
        token,
        body: JSON.stringify({ originalUrl: normalizedUrl }),
      })
      const link = { ...data, shortUrl: getShortUrl(data.shortCode) }
      setCreatedLink(link)
      setUrl('')
      setNotice('Seu link foi criado e já está pronto para compartilhar.')
      await loadStats(token, true)
    } catch (err) {
      setError(err.message)
    } finally {
      setCreating(false)
    }
  }

  async function copyLink(value) {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(value)
      window.setTimeout(() => setCopied(''), 1800)
    } catch {
      setError('Não foi possível copiar automaticamente. Selecione e copie o link.')
    }
  }

  const allLinks = useMemo(() => {
    const unique = new Map()
    ;[...stats.recentLinks, ...stats.topLinks].forEach((item) => unique.set(item._id || item.shortCode, item))
    return [...unique.values()]
  }, [stats])

  const filteredLinks = allLinks.filter((item) => {
    const term = search.toLowerCase()
    return !term || item.originalUrl?.toLowerCase().includes(term) || item.shortCode?.toLowerCase().includes(term)
  })

  if (!token) return <AuthScreen onLogin={handleLogin} />
  if (loading) return <div className="loading-screen"><div className="loading-mark"><Link2 size={24} /></div><span>Preparando seu espaço...</span></div>

  return (
    <div className="app-shell">
      <Sidebar user={user} onLogout={handleLogout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} activeView={activeView} setActiveView={setActiveView} />

      <main className="main-content">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Abrir menu"><Menu size={21} /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>{activeView === 'links' ? 'Meus links' : 'Visão geral'}</strong></div>
          <div className="topbar-actions">
            <span className="status-pill"><span /> Todos os sistemas operacionais</span>
            <button className="icon-button" title="Atualizar dados" onClick={() => loadStats(token)} disabled={refreshing}><Activity size={18} className={refreshing ? 'spin' : ''} /></button>
            <div className="top-avatar">{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</div>
          </div>
        </header>

        <div className="page-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><Sparkles size={13} /> SEU PAINEL</div>
              <h1>{activeView === 'links' ? 'Seus links.' : `Olá, ${(user?.name || 'por aí').split(' ')[0]}.`}</h1>
              <p>{activeView === 'links' ? 'Gerencie e acompanhe os links que você criou.' : 'Aqui está um resumo do desempenho dos seus links.'}</p>
            </div>
            <div className="welcome-date"><span>HOJE</span><strong>{new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())}</strong></div>
          </section>

          {activeView === 'overview' && (
            <>
              <section className="create-card">
                <div className="create-card-copy">
                  <div className="create-icon"><WandSparkles size={19} /></div>
                  <div>
                    <h2>Encurte um novo link</h2>
                    <p>Transforme uma URL gigante em um link simples de compartilhar.</p>
                  </div>
                </div>
                <form className="create-form" onSubmit={handleCreate}>
                  <div className="url-input-wrap"><Globe2 size={18} /><input value={url} onChange={(event) => setUrl(event.target.value)} type="text" placeholder="Cole sua URL aqui (ex: https://seusite.com/pagina)" aria-label="URL para encurtar" required /></div>
                  <button className="primary-button" type="submit" disabled={creating || !url.trim()}>{creating ? 'Encurtando...' : <><Plus size={17} /> Encurtar link</>}</button>
                </form>
                {error && <div className="inline-message error-message">{error}</div>}
                {notice && <div className="inline-message success-message"><Check size={15} /> {notice}</div>}
                {createdLink && (
                  <div className="created-result">
                    <div className="created-check"><Check size={17} /></div>
                    <div className="created-copy"><span>SEU NOVO LINK</span><strong>{createdLink.shortUrl}</strong><small title={createdLink.originalUrl}>{createdLink.originalUrl}</small></div>
                    <button className="copy-button" onClick={() => copyLink(createdLink.shortUrl)}>{copied === createdLink.shortUrl ? <Check size={16} /> : <Clipboard size={16} />} {copied === createdLink.shortUrl ? 'Copiado' : 'Copiar'}</button>
                  </div>
                )}
              </section>

              <section className="stats-grid">
                <StatCard label="Links criados" value={stats.totalLinks} detail="Total na sua conta" icon={Link2} tone="purple" />
                <StatCard label="Cliques recebidos" value={stats.totalClicks} detail="Acessos acumulados" icon={MousePointerClick} tone="blue" />
                <StatCard label="Média por link" value={stats.totalLinks ? Math.round(stats.totalClicks / stats.totalLinks) : 0} detail="Cliques por link criado" icon={BarChart3} tone="green" />
              </section>

              <section className="content-grid">
                <div className="panel links-panel">
                  <div className="panel-heading">
                    <div><h2>Links recentes</h2><p>Os últimos links que você criou</p></div>
                    <button className="text-button" onClick={() => setActiveView('links')}>Ver todos <ArrowUpRight size={15} /></button>
                  </div>
                  {stats.recentLinks.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead><tr><th>LINK ORIGINAL</th><th>LINK ENCURTADO</th><th>CLIQUES</th><th>CRIADO EM</th><th /></tr></thead>
                        <tbody>{stats.recentLinks.map((item) => <LinkRow key={item._id || item.shortCode} item={item} onCopy={copyLink} copied={copied === getShortUrl(item.shortCode)} />)}</tbody>
                      </table>
                    </div>
                  ) : <EmptyState title="Nenhum link por aqui ainda" description="Seu primeiro link encurtado vai aparecer aqui." />}
                </div>

                <aside className="panel popular-panel">
                  <div className="panel-heading"><div><h2>Mais acessados</h2><p>Seus links em destaque</p></div><span className="panel-heading-icon"><Zap size={17} /></span></div>
                  {stats.topLinks.length ? (
                    <div className="popular-list">
                      {stats.topLinks.slice(0, 5).map((item, index) => (
                        <div className="popular-item" key={item._id || item.shortCode}>
                          <span className="popular-rank">{String(index + 1).padStart(2, '0')}</span>
                          <div className="popular-info"><strong>{getDomain(item.originalUrl)}</strong><span>/{item.shortCode}</span></div>
                          <span className="popular-clicks">{formatNumber(item.clicks)} <MousePointerClick size={13} /></span>
                        </div>
                      ))}
                    </div>
                  ) : <EmptyState title="Sem dados ainda" description="Os links mais acessados aparecerão aqui." compact />}
                  <div className="popular-footer"><span><ArrowUpRight size={14} /> Atualizado agora</span><span>LINKORA ANALYTICS</span></div>
                </aside>
              </section>
            </>
          )}

          {activeView === 'links' && (
            <section className="panel all-links-panel">
              <div className="panel-heading all-links-heading">
                <div><h2>Links disponíveis</h2><p>Pesquise entre os links recentes e mais acessados retornados pela API.</p></div>
                <div className="search-box"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar link..." /></div>
              </div>
              {filteredLinks.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>LINK ORIGINAL</th><th>LINK ENCURTADO</th><th>CLIQUES</th><th>CRIADO EM</th><th /></tr></thead>
                    <tbody>{filteredLinks.map((item) => <LinkRow key={item._id || item.shortCode} item={item} onCopy={copyLink} copied={copied === getShortUrl(item.shortCode)} />)}</tbody>
                  </table>
                </div>
              ) : <EmptyState title={search ? 'Nenhum resultado encontrado' : 'Você ainda não criou links'} description={search ? 'Tente buscar por outro endereço ou código.' : 'Volte para a visão geral e crie seu primeiro link.'} />}
              <div className="api-note"><CircleHelp size={15} /> A API atual retorna até 5 links recentes e 5 mais acessados. A listagem completa exige uma rota de paginação no backend.</div>
            </section>
          )}

          <footer className="page-footer"><span>Feito para compartilhar melhor. <b>linkora.</b></span><span>VERSÃO 1.0 <i>•</i> SEU LINK, SEU ALCANCE.</span></footer>
        </div>
      </main>
    </div>
  )
}

function EmptyState({ title, description, compact = false }) {
  return (
    <div className={`empty-state ${compact ? 'compact' : ''}`}>
      <div className="empty-icon"><QrCode size={22} /></div>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  )
}

export default App
