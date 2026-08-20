import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = import.meta.env.VITE_API_URL || 'https://portaldebraganca-production.up.railway.app/api';

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url?: string;
}

export default function App() {
  // Controle de Autenticação
  const [currentUser, setCurrentUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('portal_admin_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('portal_admin_token') || '');

  const [loginEmail, setLoginEmail] = useState('sindico@portalbraganca.com.br');
  const [loginPassword, setLoginPassword] = useState('123456');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Menu Ativo
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'residents' | 'news' | 'notices' | 'advertisers' | 'categories' | 'magazines' | 'banners' | 'promotions' | 'notifications' | 'configurations'
  >('dashboard');

  const [selectedCondo, setSelectedCondo] = useState('Residencial Portal de Bragança');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dados do Dashboard e Módulos
  const [stats, setStats] = useState<any>({
    residents_count: 142,
    news_count: 6,
    notices_count: 3,
    advertisers_count: 5,
    premium_advertisers_count: 2,
    magazines_count: 1
  });

  const [residents, setResidents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);
  const [newsList, setNewsList] = useState<any[]>([]);
  const [advertisers, setAdvertisers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [magazines, setMagazines] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Modais de Criação / Edição
  const [modalType, setModalType] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Carregar dados de estatísticas e entidades
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      const res = await fetch(`${API_BASE}/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      if (!res.ok) throw new Error('Falha no upload');
      const data = await res.json();
      return data.url;
    } catch (err) {
      alert('Erro ao enviar arquivo.');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      const [statsRes, resRes, notRes, newsRes, advRes, catRes, magRes, banRes, promRes, notifRes] = await Promise.all([
        fetch(`${API_BASE}/dashboard/stats`).then(r => r.json()),
        fetch(`${API_BASE}/residents`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/notices`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/news`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/advertisers`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/categories`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/magazines`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/banners`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/promotions`).then(r => r.json()).catch(() => []),
        fetch(`${API_BASE}/notifications`).then(r => r.json()).catch(() => [])
      ]);

      if (statsRes && !statsRes.error) setStats(statsRes);
      if (Array.isArray(resRes)) setResidents(resRes);
      if (Array.isArray(notRes)) setNotices(notRes);
      if (Array.isArray(newsRes)) setNewsList(newsRes);
      if (Array.isArray(advRes)) setAdvertisers(advRes);
      if (Array.isArray(catRes)) setCategories(catRes);
      if (Array.isArray(magRes)) setMagazines(magRes);
      if (Array.isArray(banRes)) setBanners(banRes);
      if (Array.isArray(promRes)) setPromotions(promRes);
      if (Array.isArray(notifRes)) setNotifications(notifRes);
    } catch (err) {
      console.error('Erro ao carregar dados do painel:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchDashboardData();
    }
  }, [currentUser]);

  // LOGIN & CONTROLE DE ACESSO
  const handleLogin = async (e?: React.FormEvent, directEmail?: string, directPass?: string) => {
    if (e) e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    const email = directEmail || loginEmail;
    const password = directPass || loginPassword;

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': "Bearer " },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setLoginError(data.error || 'Falha ao autenticar.');
        setLoginLoading(false);
        return;
      }

      // REGRA DE SEGURANÇA: Bloquear perfil morador no Painel Web
      if (data.user.role === 'morador') {
        setLoginError('⛔ Acesso Negado: Usuários com perfil "Morador" não têm permissão para acessar o Painel Administrativo. Utilize o aplicativo mobile.');
        setLoginLoading(false);
        return;
      }

      localStorage.setItem('portal_admin_user', JSON.stringify(data.user));
      localStorage.setItem('portal_admin_token', data.token);
      setCurrentUser(data.user);
      setToken(data.token);
    } catch (err) {
      setLoginError('Erro ao conectar ao servidor.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('portal_admin_user');
    localStorage.removeItem('portal_admin_token');
    setCurrentUser(null);
    setToken('');
  };

  // HANDLERS GENÉRICOS DE EXCLUSÃO E SALVAMENTO
  const handleDeleteItem = async (endpoint: string, id: string) => {
    if (!confirm('Deseja realmente excluir este registro?')) return;
    try {
      const res = await fetch(`${API_BASE}/${endpoint}/${id}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Falha na exclusão');
      fetchDashboardData();
    } catch (err) {
      alert('Erro ao excluir registro.');
    }
  };

  const handleSaveItem = async (endpoint: string, payload: any) => {
    const isEditing = !!payload.id;
    const url = isEditing ? `${API_BASE}/${endpoint}/${payload.id}` : `${API_BASE}/${endpoint}`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro ao salvar registro.');
      }
      setModalType(null);
      setFormData({});
      fetchDashboardData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar.');
    }
  };

  // SE NÃO ESTIVER AUTENTICADO: EXIBIR TELA DE LOGIN
  if (!currentUser) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <div className="login-header">
            <span className="login-badge">PORTAL BRAGANÇA • CLUBE DING</span>
            <h1 className="login-title">Painel Administrativo</h1>
            <p className="login-subtitle">Acesso restrito à Diretoria, Síndico e Administradores</p>
          </div>

          {loginError && (
            <div style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '12px', borderRadius: '10px', fontSize: '12px', fontWeight: '700', marginBottom: '16px' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>E-mail Corporativo:</label>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                placeholder="sindico@portalbraganca.com.br"
              />
            </div>

            <div className="form-group">
              <label>Senha de Acesso:</label>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                placeholder="••••••"
              />
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', marginTop: '10px' }} disabled={loginLoading}>
              {loginLoading ? 'Autenticando...' : 'Entrar no Painel →'}
            </button>
          </form>

          <div className="login-demo-box">
            <div className="login-demo-title">Atalhos de Teste de Permissões:</div>
            <div className="login-demo-btns">
              <button
                className="btn-demo"
                onClick={() => {
                  setLoginEmail('sindico@portalbraganca.com.br');
                  setLoginPassword('123456');
                  handleLogin(undefined, 'sindico@portalbraganca.com.br', '123456');
                }}
              >
                <span>🔑 Entrar como Síndica (Ana Oliveira)</span>
                <span style={{ color: '#059669', fontSize: '11px' }}>Permitido</span>
              </button>

              <button
                className="btn-demo"
                onClick={() => {
                  setLoginEmail('admin@dingpublicidade.com.br');
                  setLoginPassword('123456');
                  handleLogin(undefined, 'admin@dingpublicidade.com.br', '123456');
                }}
              >
                <span>🌐 Entrar como Admin DING (Global)</span>
                <span style={{ color: '#059669', fontSize: '11px' }}>Permitido</span>
              </button>

              <button
                className="btn-demo"
                onClick={() => {
                  setLoginEmail('morador@portalbraganca.com.br');
                  setLoginPassword('123456');
                  handleLogin(undefined, 'morador@portalbraganca.com.br', '123456');
                }}
              >
                <span>🚫 Testar com Morador (Carlos Silva)</span>
                <span style={{ color: '#DC2626', fontSize: '11px' }}>Bloqueio</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PAINEL ADMINISTRATIVO AUTENTICADO
  const handleTabClick = (tab: typeof activeTab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="admin-container">
      {/* Mobile Menu Backdrop */}
      {isMobileMenuOpen && (
        <div className="sidebar-backdrop" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* SIDEBAR COM OS 11 MENUS */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-ding">DING PLATFORM</span>
          <h2 className="brand-title">Portal Bragança</h2>
          <span className="brand-subtitle">Administração do Condomínio</span>
        </div>

        <div className="condo-selector-box">
          <label>CONDOMÍNIO SELECIONADO:</label>
          <select value={selectedCondo} onChange={e => setSelectedCondo(e.target.value)}>
            <option value="Residencial Portal de Bragança">Residencial Portal de Bragança</option>
            <option value="Condomínio Quinta da Baroneza">Condomínio Quinta da Baroneza</option>
          </select>
        </div>

        <nav className="nav-menu">
          <button className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => handleTabClick('dashboard')}>
            📊 Dashboard
          </button>
          <button className={`nav-item ${activeTab === 'residents' ? 'active' : ''}`} onClick={() => handleTabClick('residents')}>
            👥 Moradores
          </button>
          <button className={`nav-item ${activeTab === 'news' ? 'active' : ''}`} onClick={() => handleTabClick('news')}>
            📰 Notícias
          </button>
          <button className={`nav-item ${activeTab === 'notices' ? 'active' : ''}`} onClick={() => handleTabClick('notices')}>
            📢 Avisos Oficiais
          </button>
          <button className={`nav-item ${activeTab === 'advertisers' ? 'active' : ''}`} onClick={() => handleTabClick('advertisers')}>
            ⭐ Anunciantes
          </button>
          <button className={`nav-item ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => handleTabClick('categories')}>
            🏷️ Categorias
          </button>
          <button className={`nav-item ${activeTab === 'magazines' ? 'active' : ''}`} onClick={() => handleTabClick('magazines')}>
            📁 Revista Digital
          </button>
          <button className={`nav-item ${activeTab === 'banners' ? 'active' : ''}`} onClick={() => handleTabClick('banners')}>
            🖼️ Banners da Home
          </button>
          <button className={`nav-item ${activeTab === 'promotions' ? 'active' : ''}`} onClick={() => handleTabClick('promotions')}>
            🎁 Promoções / Cupons
          </button>
          <button className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => handleTabClick('notifications')}>
            🔔 Notificações Push
          </button>
          <button className={`nav-item ${activeTab === 'configurations' ? 'active' : ''}`} onClick={() => handleTabClick('configurations')}>
            ⚙️ Configurações
          </button>
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile">
            <img
              src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'}
              alt="Avatar"
              className="user-avatar"
            />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="user-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                {currentUser.name}
              </div>
              <div className="user-role">{currentUser.role.toUpperCase()}</div>
            </div>
          </div>
          <button className="btn-logout" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>Sair da Conta 🚪</button>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="main-content">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
            <div>
              <h1 className="page-heading">
                {activeTab === 'dashboard' && 'Visão Geral & Indicadores'}
                {activeTab === 'residents' && 'Gerenciamento de Moradores e Unidades'}
                {activeTab === 'news' && 'Notícias e Comunicados de Imprensa'}
                {activeTab === 'notices' && 'Mural de Avisos Oficiais'}
                {activeTab === 'advertisers' && 'Parceiros Comerciais & Planos DING'}
                {activeTab === 'categories' && 'Categorias Globais e Locais'}
                {activeTab === 'magazines' && 'Revista Digital do Condomínio'}
                {activeTab === 'banners' && 'Banners em Destaque no App'}
                {activeTab === 'promotions' && 'Clube de Benefícios & Cupons'}
                {activeTab === 'notifications' && 'Disparo de Notificações Push'}
                {activeTab === 'configurations' && 'Parâmetros e Regras do Condomínio'}
              </h1>
              <span className="page-subheading">{selectedCondo} • Painel Integrado ao Supabase</span>
            </div>
          </div>

          <div className="topbar-actions">
            {activeTab === 'news' && (
              <button className="btn-primary" onClick={() => { setFormData({ title: '', summary: '', content: '', category_id: categories.find(c => c.type === 'news')?.id || '', cover_image_url: '', is_published: true }); setModalType('news'); }}>
                + Nova Notícia
              </button>
            )}
            {activeTab === 'notices' && (
              <button className="btn-primary" onClick={() => { setFormData({ title: '', content: '', priority: 'normal', is_pinned: false }); setModalType('notice'); }}>
                + Novo Aviso Oficial
              </button>
            )}
            {activeTab === 'advertisers' && (
              <button className="btn-primary" onClick={() => { setFormData({ name: '', plan: 'premium', phone: '', whatsapp: '', instagram: '', website_url: '', address: '', logo_url: '', category_id: categories.find(c => c.type === 'advertiser')?.id || '', is_active: true }); setModalType('advertiser'); }}>
                + Novo Anunciante
              </button>
            )}
            {activeTab === 'promotions' && (
              <button className="btn-primary" onClick={() => { setFormData({ title: '', advertiser_id: advertisers[0]?.id || '', discount_percentage: 10, coupon_code: 'PORTAL10', description: '', is_active: true }); setModalType('promotion'); }}>
                + Nova Promoção / Cupom
              </button>
            )}
            {activeTab === 'magazines' && (
              <button className="btn-primary" onClick={() => { setFormData({ edition_number: (magazines.length + 1), title: '', cover_image_url: '', pdf_url: '', description: '' }); setModalType('magazine'); }}>
                + Nova Edição da Revista
              </button>
            )}
            {activeTab === 'banners' && (
              <button className="btn-primary" onClick={() => { setFormData({ title: '', image_url: '', link_url: '', order_index: (banners.length + 1) }); setModalType('banner'); }}>
                + Novo Banner
              </button>
            )}
            {activeTab === 'residents' && (
              <button className="btn-primary" onClick={() => { setFormData({ name: '', email: '', phone: '', block: 'Bloco A', unit_number: '' }); setModalType('resident'); }}>
                + Cadastrar Morador
              </button>
            )}
            {activeTab === 'categories' && (
              <button className="btn-primary" onClick={() => { setFormData({ name: '', type: 'news' }); setModalType('category'); }}>
                + Nova Categoria
              </button>
            )}
            {activeTab === 'notifications' && (
              <button className="btn-primary" onClick={() => { setFormData({ title: '', body: '', type: 'aviso' }); setModalType('notification'); }}>
                📢 Disparar Notificação
              </button>
            )}
          </div>
        </header>

        {/* 1. DASHBOARD COM 6 INDICADORES DINÂMICOS */}
        {activeTab === 'dashboard' && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-label">👥 Moradores Cadastrados</span>
                <span className="stat-val">{stats.residents_count}</span>
                <span className="stat-badge success">Ativos</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">📰 Notícias Publicadas</span>
                <span className="stat-val">{stats.news_count}</span>
                <span className="stat-badge info">Online</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">📢 Avisos Oficiais</span>
                <span className="stat-val">{stats.notices_count}</span>
                <span className="stat-badge warning">Mural Ativo</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">⭐ Anunciantes Totais</span>
                <span className="stat-val">{stats.advertisers_count}</span>
                <span className="stat-badge success">Parceiros</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">👑 Anunciantes Premium</span>
                <span className="stat-val">{stats.premium_advertisers_count}</span>
                <span className="stat-badge gold">Destaque VIP</span>
              </div>
              <div className="stat-card">
                <span className="stat-label">📁 Revistas Publicadas</span>
                <span className="stat-val">{stats.magazines_count}</span>
                <span className="stat-badge info">PDF Interativo</span>
              </div>
            </div>

            <div className="panel-card" style={{ padding: '24px', marginTop: '20px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '14px', color: '#0E3B2E' }}>
                🚀 Acesso Rápido às Operações
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                <button className="btn-demo" onClick={() => setActiveTab('magazines')}>
                  <span>📁 Publicar Nova Revista Digital</span> →
                </button>
                <button className="btn-demo" onClick={() => setActiveTab('residents')}>
                  <span>👥 Cadastrar Moradores / Unidades</span> →
                </button>
                <button className="btn-demo" onClick={() => setActiveTab('advertisers')}>
                  <span>⭐ Gerenciar Planos de Anunciantes</span> →
                </button>
                <button className="btn-demo" onClick={() => setActiveTab('notifications')}>
                  <span>🔔 Enviar Alerta Geral via Push</span> →
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MORADORES */}
        {activeTab === 'residents' && (
          <div className="panel-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome do Morador</th>
                  <th>E-mail</th>
                  <th>Telefone</th>
                  <th>Unidade / Bloco</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((r: any) => (
                  <tr key={r.id}>
                    <td><strong>{r.profiles?.name || 'Morador'}</strong></td>
                    <td>{r.users?.email || '-'}</td>
                    <td>{r.profiles?.phone || '-'}</td>
                    <td>{r.block} • Apto {r.unit_number}</td>
                    <td><span className="tag published">ATIVO</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-action edit" onClick={() => { setFormData({ id: r.id, name: r.profiles?.name || '', email: r.users?.email || '', phone: r.profiles?.phone || '', block: r.block, unit_number: r.unit_number }); setModalType('resident'); }}>✏️ Editar</button>
                        <button className="btn-action danger" onClick={() => handleDeleteItem('residents', r.id)}>🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 3. REVISTA DIGITAL */}
        {activeTab === 'magazines' && (
          <div className="panel-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Capa</th>
                  <th>Edição</th>
                  <th>Título</th>
                  <th>Data de Publicação</th>
                  <th>Arquivo PDF</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {magazines.map((m: any) => (
                  <tr key={m.id}>
                    <td>
                      <img src={m.cover_image_url} alt="Capa" style={{ width: 44, height: 60, borderRadius: 6, objectFit: 'cover' }} />
                    </td>
                    <td><strong>Edição #{m.edition_number}</strong></td>
                    <td>
                      <strong>{m.title}</strong>
                      <div style={{ fontSize: '11px', color: '#6B7280' }}>{m.description}</div>
                    </td>
                    <td>{m.publication_date ? new Date(m.publication_date).toLocaleDateString('pt-BR') : '-'}</td>
                    <td>
                      <a href={m.pdf_url} target="_blank" rel="noreferrer" style={{ color: '#2563EB', fontWeight: '700', fontSize: '11.5px' }}>
                        Visualizar PDF ↗
                      </a>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-action edit" onClick={() => { setFormData(m); setModalType('magazine'); }}>✏️ Editar</button>
                        <button className="btn-action danger" onClick={() => handleDeleteItem('magazines', m.id)}>🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. BANNERS DA HOME */}
        {activeTab === 'banners' && (
          <div className="panel-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Banner Preview</th>
                  <th>Título</th>
                  <th>Ordem</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {banners.map((b: any) => (
                  <tr key={b.id}>
                    <td><img src={b.image_url} alt="Banner" style={{ width: 120, height: 50, borderRadius: 6, objectFit: 'cover' }} /></td>
                    <td><strong>{b.title}</strong></td>
                    <td>#{b.order_index}</td>
                    <td><span className="tag published">ATIVO</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-action edit" onClick={() => { setFormData(b); setModalType('banner'); }}>✏️ Editar</button>
                        <button className="btn-action danger" onClick={() => handleDeleteItem('banners', b.id)}>🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. CATEGORIAS */}
        {activeTab === 'categories' && (
          <div className="panel-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Nome da Categoria</th>
                  <th>Tipo</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((c: any) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td><span className="tag normal">{c.type.toUpperCase()}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-action edit" onClick={() => { setFormData(c); setModalType('category'); }}>✏️ Editar</button>
                        <button className="btn-action danger" onClick={() => handleDeleteItem('categories', c.id)}>🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 6. NOTÍCIAS */}
        {activeTab === 'news' && (
          <div className="panel-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Notícia</th>
                  <th>Categoria</th>
                  <th>Status</th>
                  <th>Data</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {newsList.map((n: any) => (
                  <tr key={n.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {n.cover_image_url && (
                          <img src={n.cover_image_url} alt="Cover" style={{ width: 44, height: 44, borderRadius: 6, objectFit: 'cover' }} />
                        )}
                        <div>
                          <strong>{n.title}</strong>
                          <div style={{ fontSize: '11px', color: '#6B7280' }}>{n.summary}</div>
                        </div>
                      </div>
                    </td>
                    <td>{n.categories?.name || 'Geral'}</td>
                    <td><span className={`tag ${n.is_published ? 'published' : 'draft'}`}>{n.is_published ? 'PUBLICADO' : 'RASCUNHO'}</span></td>
                    <td>{new Date(n.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-action edit" onClick={() => { setFormData({ ...n, category_id: n.category_id || (n.categories?.id || '') }); setModalType('news'); }}>✏️ Editar</button>
                        <button className="btn-action danger" onClick={() => handleDeleteItem('news', n.id)}>🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 7. AVISOS OFICIAIS */}
        {activeTab === 'notices' && (
          <div className="panel-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Título do Aviso</th>
                  <th>Prioridade</th>
                  <th>Fixado</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {notices.map((n: any) => (
                  <tr key={n.id}>
                    <td><strong>{n.title}</strong></td>
                    <td><span className={`tag ${n.priority}`}>{n.priority.toUpperCase()}</span></td>
                    <td>{n.is_pinned ? '📌 Sim' : 'Não'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-action edit" onClick={() => { setFormData(n); setModalType('notice'); }}>✏️ Editar</button>
                        <button className="btn-action danger" onClick={() => handleDeleteItem('notices', n.id)}>🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 8. ANUNCIANTES */}
        {activeTab === 'advertisers' && (
          <div className="panel-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Anunciante</th>
                  <th>Categoria</th>
                  <th>Plano</th>
                  <th>WhatsApp / Fone</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {advertisers.map((a: any) => (
                  <tr key={a.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={a.logo_url} alt="Logo" style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'cover' }} />
                        <strong>{a.name}</strong>
                      </div>
                    </td>
                    <td>{a.category || a.categories?.name}</td>
                    <td><span className={`plan-tag ${a.plan}`}>{a.plan.toUpperCase()}</span></td>
                    <td style={{ fontSize: '12px' }}>{a.whatsapp || a.phone || '-'}</td>
                    <td><span className={`tag ${a.is_active ? 'published' : 'draft'}`}>{a.is_active ? 'ATIVO' : 'INATIVO'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-action edit" onClick={() => { setFormData(a); setModalType('advertiser'); }}>✏️ Editar</button>
                        <button className="btn-action danger" onClick={() => handleDeleteItem('advertisers', a.id)}>🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 9. PROMOÇÕES */}
        {activeTab === 'promotions' && (
          <div className="panel-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Oferta / Benefício</th>
                  <th>Anunciante</th>
                  <th>Desconto %</th>
                  <th>Cupom</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {promotions.map((p: any) => (
                  <tr key={p.id}>
                    <td><strong>{p.title}</strong></td>
                    <td>{p.advertisers?.name || 'Parceiro DING'}</td>
                    <td><span className="tag published">{p.discount_percentage}% OFF</span></td>
                    <td><span style={{ backgroundColor: '#D4AF37', color: '#0E3B2E', padding: '2px 8px', borderRadius: '4px', fontWeight: '900', fontSize: '11px' }}>{p.coupon_code}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn-action edit" onClick={() => { setFormData(p); setModalType('promotion'); }}>✏️ Editar</button>
                        <button className="btn-action danger" onClick={() => handleDeleteItem('promotions', p.id)}>🗑️ Excluir</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 10. NOTIFICAÇÕES */}
        {activeTab === 'notifications' && (
          <div className="panel-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Título do Push</th>
                  <th>Mensagem</th>
                  <th>Data de Envio</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notif: any) => (
                  <tr key={notif.id}>
                    <td>
                      <span className={`tag ${
                        notif.type === 'aviso' || notif.type === 'manutencao' ? 'urgente' :
                        notif.type === 'noticia' || notif.type === 'revista' ? 'info' :
                        notif.type === 'promocao' ? 'published' : 'normal'
                      }`}>
                        {notif.type?.toUpperCase()}
                      </span>
                    </td>
                    <td><strong>{notif.title}</strong></td>
                    <td style={{ maxWidth: '300px', fontSize: '12px' }}>{notif.body}</td>
                    <td style={{ fontSize: '11.5px' }}>{new Date(notif.created_at).toLocaleDateString('pt-BR')}</td>
                    <td>
                      <button className="btn-action danger" onClick={() => handleDeleteItem('notifications', notif.id)}>🗑️ Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 11. CONFIGURAÇÕES */}
        {activeTab === 'configurations' && (
          <div className="panel-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', marginBottom: '16px', color: '#0E3B2E' }}>
              Parâmetros do Condomínio (Portal de Bragança)
            </h3>
            <div className="form-group">
              <label>Nome do Condomínio:</label>
              <input type="text" value="Residencial Portal de Bragança" readOnly />
            </div>
            <div className="form-row">
              <div className="form-group" style={{ flex: 1 }}>
                <label>CNPJ:</label>
                <input type="text" value="12.345.678/0001-90" readOnly />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Cidade / UF:</label>
                <input type="text" value="Bragança Paulista - SP" readOnly />
              </div>
            </div>
            <div className="form-group">
              <label>E-mail de Suporte ao Condômino:</label>
              <input type="text" value="suporte@portalbraganca.com.br" readOnly />
            </div>
          </div>
        )}
      </main>

      {/* MODAIS DE CRIAÇÃO E EDIÇÃO */}

      {/* MODAL NOTÍCIA */}
      {modalType === 'news' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{formData.id ? '✏️ Editar Notícia' : '➕ Publicar Nova Notícia'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveItem('news', formData);
            }}>
              <div className="form-group">
                <label>Título da Notícia:</label>
                <input type="text" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Inauguração da Quadra de Areia" />
              </div>
              <div className="form-group">
                <label>Resumo / Subtítulo:</label>
                <input type="text" required value={formData.summary || ''} onChange={e => setFormData({ ...formData, summary: e.target.value })} placeholder="Breve introdução que aparece na listagem..." />
              </div>
              <div className="form-group">
                <label>Conteúdo Completo:</label>
                <textarea rows={5} required value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Escreva a notícia completa aqui..." />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Categoria:</label>
                  <select value={formData.category_id || ''} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                    <option value="">Geral</option>
                    {categories.filter(c => c.type === 'news').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Status de Publicação:</label>
                  <select value={formData.is_published ? 'true' : 'false'} onChange={e => setFormData({ ...formData, is_published: e.target.value === 'true' })}>
                    <option value="true">Publicado Imediatamente</option>
                    <option value="false">Rascunho (Oculto)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Foto de Capa (Upload de Arquivo):</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = await handleFileUpload(e.target.files[0]);
                    setFormData({ ...formData, cover_image_url: url });
                  }
                }} />
                {uploading && <small>Enviando foto...</small>}
                <input type="url" value={formData.cover_image_url || ''} onChange={e => setFormData({ ...formData, cover_image_url: e.target.value })} placeholder="Ou cole a URL da imagem (https://...)" style={{ marginTop: '6px' }} />
                {formData.cover_image_url && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={formData.cover_image_url} alt="Preview" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Salvar Alterações' : 'Publicar Notícia'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AVISO OFICIAL */}
      {modalType === 'notice' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{formData.id ? '✏️ Editar Aviso Oficial' : '➕ Publicar Aviso no Mural'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveItem('notices', formData);
            }}>
              <div className="form-group">
                <label>Título do Aviso:</label>
                <input type="text" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Manutenção na Rede Elétrica" />
              </div>
              <div className="form-group">
                <label>Conteúdo / Comunicado:</label>
                <textarea rows={4} required value={formData.content || ''} onChange={e => setFormData({ ...formData, content: e.target.value })} placeholder="Detalhes do aviso aos condôminos..." />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Prioridade:</label>
                  <select value={formData.priority || 'normal'} onChange={e => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="normal">Normal (Verde)</option>
                    <option value="importante">Importante (Amarelo)</option>
                    <option value="urgente">Urgente (Vermelho)</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Fixar no Topo:</label>
                  <select value={formData.is_pinned ? 'true' : 'false'} onChange={e => setFormData({ ...formData, is_pinned: e.target.value === 'true' })}>
                    <option value="false">Não</option>
                    <option value="true">📌 Sim (Destaque no topo)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Salvar Alterações' : 'Publicar Aviso'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ANUNCIANTE */}
      {modalType === 'advertiser' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{formData.id ? '✏️ Editar Anunciante' : '➕ Cadastrar Novo Anunciante Parceiro'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveItem('advertisers', formData);
            }}>
              <div className="form-group">
                <label>Nome da Empresa / Profissional:</label>
                <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Pizzaria Bragança Gourmet" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Plano DING:</label>
                  <select value={formData.plan || 'premium'} onChange={e => setFormData({ ...formData, plan: e.target.value })}>
                    <option value="premium">👑 Premium (Destaque VIP)</option>
                    <option value="intermediario">⭐ Intermediário</option>
                    <option value="basico">Básico</option>
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Categoria:</label>
                  <select value={formData.category_id || ''} onChange={e => setFormData({ ...formData, category_id: e.target.value })}>
                    <option value="">Serviços Gerais</option>
                    {categories.filter(c => c.type === 'advertiser').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>WhatsApp:</label>
                  <input type="text" value={formData.whatsapp || ''} onChange={e => setFormData({ ...formData, whatsapp: e.target.value })} placeholder="(11) 99999-8888" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Telefone / Fixo:</label>
                  <input type="text" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(11) 4033-0000" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Instagram (@perfil):</label>
                  <input type="text" value={formData.instagram || ''} onChange={e => setFormData({ ...formData, instagram: e.target.value })} placeholder="@pizzariabraganca" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Site / Link:</label>
                  <input type="url" value={formData.website_url || ''} onChange={e => setFormData({ ...formData, website_url: e.target.value })} placeholder="https://seusite.com.br" />
                </div>
              </div>
              <div className="form-group">
                <label>Endereço / Localização:</label>
                <input type="text" value={formData.address || ''} onChange={e => setFormData({ ...formData, address: e.target.value })} placeholder="Av. Salvador Markowicz, 120 - Bragança Paulista" />
              </div>
              <div className="form-group">
                <label>Logo / Foto da Empresa (Upload):</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = await handleFileUpload(e.target.files[0]);
                    setFormData({ ...formData, logo_url: url });
                  }
                }} />
                {uploading && <small>Enviando...</small>}
                <input type="url" value={formData.logo_url || ''} onChange={e => setFormData({ ...formData, logo_url: e.target.value })} placeholder="Ou URL da Logo" style={{ marginTop: '6px' }} />
                {formData.logo_url && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={formData.logo_url} alt="Logo Preview" style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Salvar Alterações' : 'Cadastrar Anunciante'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROMOÇÃO / CUPOM */}
      {modalType === 'promotion' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{formData.id ? '✏️ Editar Promoção' : '➕ Cadastrar Promoção / Benefício'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveItem('promotions', formData);
            }}>
              <div className="form-group">
                <label>Título da Oferta / Benefício:</label>
                <input type="text" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: 15% OFF em todo o cardápio" />
              </div>
              <div className="form-group">
                <label>Anunciante / Parceiro:</label>
                <select required value={formData.advertiser_id || ''} onChange={e => setFormData({ ...formData, advertiser_id: e.target.value })}>
                  <option value="">Selecione o parceiro...</option>
                  {advertisers.map(a => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Desconto (%):</label>
                  <input type="number" required value={formData.discount_percentage || 10} onChange={e => setFormData({ ...formData, discount_percentage: Number(e.target.value) })} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Código do Cupom:</label>
                  <input type="text" required value={formData.coupon_code || ''} onChange={e => setFormData({ ...formData, coupon_code: e.target.value.toUpperCase() })} placeholder="PORTAL15" />
                </div>
              </div>
              <div className="form-group">
                <label>Descrição / Regras de Uso:</label>
                <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Válido para pedidos acima de R$ 50,00..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Salvar Alterações' : 'Salvar Promoção'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REVISTA DIGITAL */}
      {modalType === 'magazine' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{formData.id ? '✏️ Editar Edição da Revista' : '➕ Publicar Nova Edição da Revista Digital'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveItem('magazines', formData);
            }}>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Número da Edição:</label>
                  <input type="number" required value={formData.edition_number || ''} onChange={e => setFormData({ ...formData, edition_number: Number(e.target.value) })} />
                </div>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Título da Revista:</label>
                  <input type="text" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Revista Portal Bragança - Edição Especial" />
                </div>
              </div>
              <div className="form-group">
                <label>Capa (Upload de Imagem):</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = await handleFileUpload(e.target.files[0]);
                    setFormData({ ...formData, cover_image_url: url });
                  }
                }} />
                {uploading && <small>Enviando...</small>}
                <input type="url" value={formData.cover_image_url || ''} onChange={e => setFormData({ ...formData, cover_image_url: e.target.value })} placeholder="Ou URL da imagem de capa" style={{ marginTop: '6px' }} />
                {formData.cover_image_url && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={formData.cover_image_url} alt="Capa Preview" style={{ width: 80, height: 110, objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Arquivo PDF da Revista (Upload):</label>
                <input type="file" accept="application/pdf" onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = await handleFileUpload(e.target.files[0]);
                    setFormData({ ...formData, pdf_url: url });
                  }
                }} />
                {uploading && <small>Enviando PDF...</small>}
                <input type="url" value={formData.pdf_url || ''} onChange={e => setFormData({ ...formData, pdf_url: e.target.value })} placeholder="Ou link direto do arquivo PDF" style={{ marginTop: '6px' }} />
              </div>
              <div className="form-group">
                <label>Resumo / Destaques da Edição:</label>
                <textarea rows={3} value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Principais matérias e destaques..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Salvar Alterações' : 'Publicar Edição'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MORADOR */}
      {modalType === 'resident' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{formData.id ? '✏️ Editar Morador' : '➕ Cadastrar Novo Morador'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveItem('residents', formData);
            }}>
              <div className="form-group">
                <label>Nome Completo:</label>
                <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Maria Fernandes" />
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>E-mail:</label>
                  <input type="email" required value={formData.email || ''} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="maria@email.com" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Telefone / WhatsApp:</label>
                  <input type="text" value={formData.phone || ''} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="(11) 98888-7777" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Bloco / Alameda:</label>
                  <input type="text" required value={formData.block || ''} onChange={e => setFormData({ ...formData, block: e.target.value })} placeholder="Bloco A" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Número da Unidade / Apto:</label>
                  <input type="text" required value={formData.unit_number || ''} onChange={e => setFormData({ ...formData, unit_number: e.target.value })} placeholder="102" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Salvar Alterações' : 'Salvar Morador'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL NOTIFICAÇÃO PUSH */}
      {modalType === 'notification' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>📢 Disparar Notificação Push Geral</h3>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveItem('notifications', formData);
            }}>
              <div className="form-group">
                <label>Tipo de Notificação:</label>
                <select value={formData.type || 'aviso'} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="aviso">📢 Aviso Geral</option>
                  <option value="noticia">📰 Nova Notícia</option>
                  <option value="manutencao">🛠️ Manutenção Programada</option>
                  <option value="comunicado">📋 Comunicado da Diretoria</option>
                  <option value="revista">📁 Nova Revista Digital</option>
                  <option value="promocao">🎁 Promoção Parceiro DING</option>
                </select>
              </div>
              <div className="form-group">
                <label>Título do Alerta:</label>
                <input type="text" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Aviso Importante sobre a Portaria" />
              </div>
              <div className="form-group">
                <label>Mensagem da Notificação:</label>
                <textarea rows={3} required value={formData.body || ''} onChange={e => setFormData({ ...formData, body: e.target.value })} placeholder="Texto que aparecerá na tela do celular dos moradores..." />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">Disparar Agora 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BANNER */}
      {modalType === 'banner' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{formData.id ? '✏️ Editar Banner' : '➕ Adicionar Novo Banner da Home'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveItem('banners', formData);
            }}>
              <div className="form-group">
                <label>Título do Banner:</label>
                <input type="text" required value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="Ex: Clube de Benefícios Portal Bragança" />
              </div>
              <div className="form-group">
                <label>Link de Destino ao Clicar (URL opcional):</label>
                <input type="text" value={formData.link_url || ''} onChange={e => setFormData({ ...formData, link_url: e.target.value })} placeholder="Ex: /advertisers ou https://..." />
              </div>
              <div className="form-group">
                <label>Imagem do Banner (Upload de Imagem):</label>
                <input type="file" accept="image/*" onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    const url = await handleFileUpload(e.target.files[0]);
                    setFormData({ ...formData, image_url: url });
                  }
                }} />
                {uploading && <small>Enviando...</small>}
                <input type="url" value={formData.image_url || ''} onChange={e => setFormData({ ...formData, image_url: e.target.value })} placeholder="Ou URL da imagem do banner" style={{ marginTop: '6px' }} />
                {formData.image_url && (
                  <div style={{ marginTop: '8px' }}>
                    <img src={formData.image_url} alt="Preview" style={{ width: '100%', maxHeight: 120, objectFit: 'cover', borderRadius: 8 }} />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Ordem de Exibição:</label>
                <input type="number" required value={formData.order_index || 1} onChange={e => setFormData({ ...formData, order_index: Number(e.target.value) })} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Salvar Alterações' : 'Salvar Banner'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CATEGORIA */}
      {modalType === 'category' && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{formData.id ? '✏️ Editar Categoria' : '➕ Criar Nova Categoria'}</h3>
              <button className="btn-close" onClick={() => setModalType(null)}>✕</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              await handleSaveItem('categories', formData);
            }}>
              <div className="form-group">
                <label>Nome da Categoria:</label>
                <input type="text" required value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Ex: Gastronomia" />
              </div>
              <div className="form-group">
                <label>Tipo (Módulo):</label>
                <select value={formData.type || 'news'} onChange={e => setFormData({ ...formData, type: e.target.value })}>
                  <option value="news">Notícias e Comunicados</option>
                  <option value="advertiser">Catálogo de Anunciantes</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setModalType(null)}>Cancelar</button>
                <button type="submit" className="btn-primary">{formData.id ? 'Salvar Alterações' : 'Salvar Categoria'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

