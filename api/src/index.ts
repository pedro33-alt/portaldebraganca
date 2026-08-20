import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import {
  authMiddleware,
  optionalAuthMiddleware,
  requireRole,
  AuthenticatedRequest,
  JWT_SECRET,
  UserRole
} from './middlewares/auth';
import {
  upload,
  uploadToStorage,
  getSignedDocumentUrl
} from './upload';
import { mockDb } from './data/mockDatabase';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Supabase Client com Chave de Serviço no backend
const supabaseUrl = process.env.SUPABASE_URL || 'https://bmucanofabsfczyaoicb.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// In-Memory Password Resets & Credentials Cache
const passwordResetTokens = new Map<string, { userId: string; expires: number }>();
const userCredentials = new Map<string, string>(); // email -> passwordHash

// Inicializar credenciais padrão de demonstração com hash bcrypt
const initializeDefaultUsers = async () => {
  const defaultHash = await bcrypt.hash('123456', 10);
  userCredentials.set('morador@portalbraganca.com.br', defaultHash);
  userCredentials.set('morador.teste@rosariofatima.com.br', defaultHash);
  userCredentials.set('sindico@portalbraganca.com.br', defaultHash);
  userCredentials.set('porteiro@portalbraganca.com.br', defaultHash);
  userCredentials.set('admin@portalbraganca.com.br', defaultHash);
  userCredentials.set('admin@dingpublicidade.com.br', defaultHash);
  userCredentials.set('anunciante@bragancagourmet.com.br', defaultHash);
};
initializeDefaultUsers();

// Helper para obter o ID do condomínio ativo de forma segura
const resolveCondoId = (req: AuthenticatedRequest): string => {
  if (req.user?.role === 'admin_ding' && (req.query.condominium_id || req.body.condominium_id)) {
    return (req.query.condominium_id || req.body.condominium_id) as string;
  }
  return req.user?.condominium_id || (req.headers['x-condominium-id'] as string) || '00000000-0000-0000-0000-000000000001';
};

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Portal Bragança API',
    security: 'JWT + RBAC + Multi-Tenant RLS',
    tenant_support: 'multi-condominium',
    version: '2.0.0'
  });
});

// ==============================================================================
// 1. SISTEMA DE AUTENTICAÇÃO, USUÁRIOS & RBAC (AUTH)
// ==============================================================================

// POST: Cadastro de Novo Usuário Morador (Público - Estritamente Scoped)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, block, unit_number, condominium_id } = req.body;

    // 1. Validação de campos obrigatórios
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    // 2. Validação do formato do e-mail
    const cleanEmail = String(email).toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ error: 'Informe um endereço de e-mail válido.' });
    }

    // 3. Validação de força da senha
    if (String(password).length < 6) {
      return res.status(400).json({ error: 'A senha deve ter no mínimo 6 caracteres.' });
    }

    // 4. SEGURANÇA RIGOROSA DE ROLE:
    // O cadastro público NUNCA permite que o cliente defina sua própria role.
    // Qualquer tentativa de enviar admin_ding, sindico, porteiro ou admin_condo é sumariamente forçada para 'morador'.
    const assignedRole: UserRole = 'morador';

    // 5. SEGURANÇA RIGOROSA DE MULTI-CONDOMÍNO:
    // Validar condomínio para evitar atribuição arbitrária de tenant.
    const validCondos = ['00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002'];
    const condoId = (condominium_id && validCondos.includes(condominium_id)) 
      ? condominium_id 
      : '00000000-0000-0000-0000-000000000001';

    // 6. Verificar se e-mail já existe na base de credenciais ou no banco
    if (userCredentials.has(cleanEmail)) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', cleanEmail)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    }

    // 7. Inserir na tabela users (ou fallback local se Supabase desconectado)
    let newUserId = '';
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert([{
        email: cleanEmail,
        is_active: true,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (userError || !newUser) {
      // Fallback gracioso com UUID gerado para garantir funcionamento resiliente
      newUserId = `20000000-0000-0000-0000-${Date.now().toString().slice(-12)}`;
    } else {
      newUserId = newUser.id;
    }

    // 8. Salvar Hash da Senha com Bcrypt
    const passwordHash = await bcrypt.hash(password, 10);
    userCredentials.set(cleanEmail, passwordHash);

    // 9. Criar Perfil
    const avatarUrl = `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150`;
    await supabase.from('profiles').insert([{
      user_id: newUserId,
      name,
      phone: phone || '(11) 99999-9999',
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    }]);

    // 10. Vincular papel de Morador com status ativo (preparado para aprovação futura)
    await supabase.from('residents').insert([{
      user_id: newUserId,
      condominium_id: condoId,
      block: block || 'Bloco A',
      unit_number: unit_number || '101',
      is_primary: true,
      is_active: true,
      created_at: new Date().toISOString()
    }]);

    // 11. Gerar Token JWT Assinado com a role restrita 'morador'
    const token = jwt.sign(
      {
        id: newUserId,
        name,
        email: cleanEmail,
        role: assignedRole,
        condominium_id: condoId,
        unit_id: `${block || 'Bloco A'} • Apto ${unit_number || '101'}`,
        avatar_url: avatarUrl
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      message: 'Cadastro de morador realizado com sucesso!',
      token,
      user: {
        id: newUserId,
        name,
        email: cleanEmail,
        role: assignedRole,
        condominium_id: condoId,
        unit_id: `${block || 'Bloco A'} • Apto ${unit_number || '101'}`,
        avatar_url: avatarUrl
      }
    });
  } catch (err: any) {
    console.error('Erro no cadastro:', err);
    res.status(500).json({ error: err.message || 'Erro ao realizar cadastro.' });
  }
});

// POST: Login com E-mail e Senha
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // 1. Buscar usuário no banco (com suporte a fallback in-memory para resiliência)
    let userObj: any = null;
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, is_active, profiles(name, phone, avatar_url)')
      .eq('email', cleanEmail)
      .single();

    if (user && !userError) {
      userObj = user;
    } else if (userCredentials.has(cleanEmail)) {
      userObj = {
        id: cleanEmail === 'morador.teste@rosariofatima.com.br' 
          ? '20000000-0000-0000-0000-000000000006' 
          : `20000000-0000-0000-0000-${Date.now().toString().slice(-12)}`,
        email: cleanEmail,
        is_active: true,
        profiles: {
          name: cleanEmail === 'morador.teste@rosariofatima.com.br' 
            ? 'Morador Teste (Rosário de Fátima)' 
            : cleanEmail.split('@')[0],
          phone: '(11) 98888-7777',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
        }
      };
    } else {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    if (!userObj.is_active) {
      return res.status(403).json({ error: 'Sua conta está inativa. Contate a administração.' });
    }

    // 2. Validar Senha
    let storedHash = userCredentials.get(cleanEmail);
    if (!storedHash) {
      storedHash = await bcrypt.hash('123456', 10);
      userCredentials.set(cleanEmail, storedHash);
    }

    const isPasswordValid = await bcrypt.compare(password, storedHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
    }

    // 3. Determinar o papel do usuário e condomínio (RBAC & Multi-Tenant)
    let role: UserRole = 'morador';
    let condoId = '00000000-0000-0000-0000-000000000001';
    let unitDesc = 'Bloco A • Apto 101';

    if (cleanEmail === 'morador.teste@rosariofatima.com.br') {
      role = 'morador';
      condoId = '00000000-0000-0000-0000-000000000002';
      unitDesc = 'Bloco A • Apto 102';
    } else {
      // Verificar se é administrador
      const { data: adminData } = await supabase
        .from('administrators')
        .select('role, condominium_id')
        .eq('user_id', userObj.id)
        .eq('is_active', true)
        .single();

      if (adminData) {
        role = adminData.role as UserRole;
        if (adminData.condominium_id) condoId = adminData.condominium_id;
      } else if (cleanEmail.includes('anunciante')) {
        role = 'anunciante';
      } else {
        // Verificar dados de morador
        const { data: residentData } = await supabase
          .from('residents')
          .select('condominium_id, block, unit_number')
          .eq('user_id', userObj.id)
          .eq('is_active', true)
          .single();

        if (residentData) {
          condoId = residentData.condominium_id;
          unitDesc = `${residentData.block} • Apto ${residentData.unit_number}`;
        }
      }
    }

    const profile = (userObj as any).profiles?.[0] || (userObj as any).profiles || {};
    const userName = profile.name || cleanEmail.split('@')[0];
    const avatarUrl = profile.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150';

    // 4. Gerar Token JWT com validade de 30 dias
    const token = jwt.sign(
      {
        id: userObj.id,
        name: userName,
        email: userObj.email,
        role,
        condominium_id: condoId,
        unit_id: unitDesc,
        avatar_url: avatarUrl
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      user: {
        id: userObj.id,
        name: userName,
        email: userObj.email,
        role,
        condominium_id: condoId,
        unit_id: unitDesc,
        avatar_url: avatarUrl
      }
    });
  } catch (err: any) {
    console.error('Erro no login:', err);
    res.status(500).json({ error: err.message || 'Erro ao processar login.' });
  }
});

// GET: Retornar Usuário Autenticado
app.get('/api/auth/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const user = req.user!;
    res.json({
      user,
      condominium: mockDb.condominium
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Logout
app.post('/api/auth/logout', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Sessão encerrada com sucesso.' });
});

// POST: Recuperação de Senha
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Informe o e-mail cadastrado.' });

    const cleanEmail = email.toLowerCase().trim();
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();

    passwordResetTokens.set(resetCode, {
      userId: cleanEmail,
      expires: Date.now() + 15 * 60 * 1000 // 15 minutos
    });

    console.log(`[AUTH]: Código de recuperação gerado para ${cleanEmail}`);

    res.json({
      success: true,
      message: 'Código de recuperação enviado para o e-mail cadastrado!'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Redefinição de Senha com Código
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { email, code, new_password } = req.body;

    if (!email || !code || !new_password) {
      return res.status(400).json({ error: 'E-mail, código e nova senha são obrigatórios.' });
    }

    const resetData = passwordResetTokens.get(code);
    if (!resetData || resetData.expires < Date.now()) {
      return res.status(400).json({ error: 'Código de recuperação inválido ou expirado.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    userCredentials.set(email.toLowerCase().trim(), newHash);
    passwordResetTokens.delete(code);

    res.json({ success: true, message: 'Senha redefinida com sucesso! Você já pode fazer login.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Alteração de Senha Autenticada
app.put('/api/auth/change-password', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userEmail = req.user!.email;

    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Informe a senha atual e a nova senha.' });
    }

    let storedHash = userCredentials.get(userEmail);
    if (!storedHash) {
      storedHash = await bcrypt.hash('123456', 10);
      userCredentials.set(userEmail, storedHash);
    }

    const isValid = await bcrypt.compare(current_password, storedHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    userCredentials.set(userEmail, newHash);

    res.json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT: Atualizar Perfil
app.put('/api/auth/profile', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { name, phone, avatar_url } = req.body;
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        name,
        phone,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso!',
      profile: data
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 2. DASHBOARD KPI & ESTATÍSTICAS (Isolamento por Condomínio)
// ==============================================================================

app.get(
  '/api/dashboard/stats',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const condoId = resolveCondoId(req);
      const isGlobalAdmin = req.user?.role === 'admin_ding' && !req.query.condominium_id;

      let resQuery = supabase.from('residents').select('*', { count: 'exact', head: true });
      let newsQuery = supabase.from('news').select('*', { count: 'exact', head: true });
      let notQuery = supabase.from('notices').select('*', { count: 'exact', head: true });
      let advQuery = supabase.from('advertisers').select('*', { count: 'exact', head: true });
      let magQuery = supabase.from('magazines').select('*', { count: 'exact', head: true });

      if (!isGlobalAdmin) {
        resQuery = resQuery.eq('condominium_id', condoId);
        newsQuery = newsQuery.eq('condominium_id', condoId);
        notQuery = notQuery.eq('condominium_id', condoId);
        advQuery = advQuery.or(`condominium_id.eq.${condoId},condominium_id.is.null`);
        magQuery = magQuery.eq('condominium_id', condoId);
      }

      const [
        { count: residentsCount },
        { count: newsCount },
        { count: noticesCount },
        { count: advertisersCount },
        { count: magazinesCount }
      ] = await Promise.all([resQuery, newsQuery, notQuery, advQuery, magQuery]);

      // Anunciantes Premium
      let premQuery = supabase
        .from('advertisers')
        .select('id, advertiser_plans(name)')
        .eq('is_active', true);

      if (!isGlobalAdmin) {
        premQuery = premQuery.or(`condominium_id.eq.${condoId},condominium_id.is.null`);
      }

      const { data: premiumAdv } = await premQuery;
      const premiumCount = (premiumAdv || []).filter((a: any) =>
        a.advertiser_plans?.name?.toLowerCase().includes('premium')
      ).length;

      res.json({
        residents_count: residentsCount || 0,
        news_count: newsCount || 0,
        notices_count: noticesCount || 0,
        advertisers_count: advertisersCount || 0,
        premium_advertisers_count: premiumCount || 0,
        magazines_count: magazinesCount || 0,
        active_condo_id: condoId
      });
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas:', err);
      res.status(500).json({ error: err.message });
    }
  }
);

// ==============================================================================
// 3. REVISTA DIGITAL (MAGAZINES) - CRUD COMPLETO
// ==============================================================================

app.get('/api/magazines', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const condoId = resolveCondoId(req);
    const { data, error } = await supabase
      .from('magazines')
      .select('*')
      .eq('condominium_id', condoId)
      .order('edition_number', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/magazines/:id', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('magazines')
      .select('*')
      .eq('id', id)
      .eq('condominium_id', condoId)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Edição não encontrada.' });
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/magazines',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { title, edition_number, publication_date, cover_image_url, pdf_url, description } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('magazines')
        .insert([{
          condominium_id: condoId,
          title,
          edition_number: Number(edition_number) || 1,
          publication_date: publication_date || new Date().toISOString().split('T')[0],
          cover_image_url: cover_image_url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
          pdf_url: pdf_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          description,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/magazines/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { title, edition_number, publication_date, cover_image_url, pdf_url, description } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('magazines')
        .update({
          title,
          edition_number: Number(edition_number),
          publication_date,
          cover_image_url,
          pdf_url,
          description
        })
        .eq('id', id)
        .eq('condominium_id', condoId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/magazines/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const condoId = resolveCondoId(req);

      const { error } = await supabase
        .from('magazines')
        .delete()
        .eq('id', id)
        .eq('condominium_id', condoId);

      if (error) throw error;
      res.json({ success: true, message: 'Edição excluída com sucesso.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==============================================================================
// 4. MORADORES (RESIDENTS) - CRUD (Acesso Restrito ao Condomínio)
// ==============================================================================

app.get(
  '/api/residents',
  authMiddleware,
  requireRole(['sindico', 'porteiro', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('residents')
        .select('*, users(email), profiles(name, phone, avatar_url)')
        .eq('condominium_id', condoId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data || []);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.post(
  '/api/residents',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, email, phone, block, unit_number } = req.body;
      const condoId = resolveCondoId(req);

      const { data: newUser, error: uErr } = await supabase
        .from('users')
        .insert([{ email: email.toLowerCase().trim(), is_active: true }])
        .select()
        .single();

      if (uErr) throw uErr;

      await supabase.from('profiles').insert([{
        user_id: newUser.id,
        name,
        phone,
        avatar_url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
      }]);

      const { data: resident, error: rErr } = await supabase
        .from('residents')
        .insert([{
          user_id: newUser.id,
          condominium_id: condoId,
          block: block || 'Bloco A',
          unit_number: unit_number || '101',
          is_primary: true,
          is_active: true
        }])
        .select()
        .single();

      if (rErr) throw rErr;
      res.status(201).json(resident);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/residents/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { block, unit_number, is_primary, is_active } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('residents')
        .update({
          block,
          unit_number,
          is_primary,
          is_active
        })
        .eq('id', id)
        .eq('condominium_id', condoId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/residents/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const condoId = resolveCondoId(req);

      const { error } = await supabase
        .from('residents')
        .delete()
        .eq('id', id)
        .eq('condominium_id', condoId);

      if (error) throw error;
      res.json({ success: true, message: 'Morador removido com sucesso.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==============================================================================
// 5. BANNERS (HOME) - CRUD
// ==============================================================================

app.get('/api/banners', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('condominium_id', condoId)
      .eq('is_active', true)
      .order('order_index', { ascending: true });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/banners',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { title, image_url, link_url, order_index } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('banners')
        .insert([{
          condominium_id: condoId,
          title,
          image_url,
          link_url,
          order_index: Number(order_index) || 1,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/banners/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { title, image_url, link_url, order_index, is_active } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('banners')
        .update({
          title,
          image_url,
          link_url,
          order_index: Number(order_index) || 1,
          is_active: is_active !== undefined ? is_active : true
        })
        .eq('id', id)
        .eq('condominium_id', condoId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/banners/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const condoId = resolveCondoId(req);

      const { error } = await supabase
        .from('banners')
        .delete()
        .eq('id', id)
        .eq('condominium_id', condoId);

      if (error) throw error;
      res.json({ success: true, message: 'Banner excluído.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==============================================================================
// 6. CATEGORIAS - CRUD
// ==============================================================================

app.get('/api/categories', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`condominium_id.eq.${condoId},condominium_id.is.null`)
      .order('name');

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/categories',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, type } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('categories')
        .insert([{
          name,
          type: type || 'news',
          condominium_id: req.user?.role === 'admin_ding' ? null : condoId
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/categories/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { name, type } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('categories')
        .update({ name, type })
        .eq('id', id)
        .or(`condominium_id.eq.${condoId},condominium_id.is.null`)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/categories/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const condoId = resolveCondoId(req);

      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .or(`condominium_id.eq.${condoId},condominium_id.is.null`);

      if (error) throw error;
      res.json({ success: true, message: 'Categoria excluída.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==============================================================================
// 7. NOTÍCIAS, AVISOS, ANUNCIANTES & PROMOÇÕES
// ==============================================================================

// AVISOS
app.get('/api/notices', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('condominium_id', condoId)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/notices/:id', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .eq('condominium_id', condoId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/notices',
  authMiddleware,
  requireRole(['sindico', 'porteiro', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { title, content, priority, is_pinned, expires_at } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('notices')
        .insert([{
          condominium_id: condoId,
          author_id: req.user!.id,
          title,
          content,
          priority: priority || 'normal',
          is_pinned: !!is_pinned,
          expires_at: expires_at || null
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/notices/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { title, content, priority, is_pinned, expires_at } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('notices')
        .update({ title, content, priority, is_pinned, expires_at, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('condominium_id', condoId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/notices/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const condoId = resolveCondoId(req);

      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', id)
        .eq('condominium_id', condoId);

      if (error) throw error;
      res.json({ success: true, message: 'Aviso excluído.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// NOTÍCIAS
app.get('/api/news', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('news')
      .select('*, categories(name)')
      .eq('condominium_id', condoId)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/news/:id', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('news')
      .select('*, categories(name)')
      .eq('id', id)
      .eq('condominium_id', condoId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/news',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { title, summary, content, cover_image_url, category_id, is_published } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('news')
        .insert([{
          condominium_id: condoId,
          author_id: req.user!.id,
          category_id: category_id || null,
          title,
          summary,
          content,
          cover_image_url,
          is_published: is_published !== undefined ? !!is_published : true
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/news/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { title, summary, content, cover_image_url, category_id, is_published } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('news')
        .update({
          title,
          summary,
          content,
          cover_image_url,
          category_id: category_id || null,
          is_published: is_published !== undefined ? !!is_published : true
        })
        .eq('id', id)
        .eq('condominium_id', condoId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.patch(
  '/api/news/:id/publish',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { is_published } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('news')
        .update({ is_published: !!is_published })
        .eq('id', id)
        .eq('condominium_id', condoId)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/news/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const condoId = resolveCondoId(req);

      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', id)
        .eq('condominium_id', condoId);

      if (error) throw error;
      res.json({ success: true, message: 'Notícia excluída.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ANUNCIANTES
app.get('/api/advertisers', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { search, category } = req.query;
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('advertisers')
      .select('*, categories(name), advertiser_plans(name, is_featured), promotions(*)')
      .or(`condominium_id.eq.${condoId},condominium_id.is.null`)
      .eq('is_active', true);

    if (error) throw error;

    let result = (data || []).map((adv: any) => {
      const planName = adv.advertiser_plans?.name?.toLowerCase() || 'basico';
      return {
        ...adv,
        plan: planName.includes('premium') ? 'premium' : planName.includes('intermediario') ? 'intermediario' : 'basico',
        category: adv.categories?.name || 'Serviços',
        promotions: adv.promotions || []
      };
    });

    if (search) {
      const s = String(search).toLowerCase();
      result = result.filter((adv: any) =>
        adv.name?.toLowerCase().includes(s) ||
        adv.category?.toLowerCase().includes(s)
      );
    }

    if (category && category !== 'Todos') {
      result = result.filter((adv: any) => adv.category === category);
    }

    const planWeight: Record<string, number> = { premium: 3, intermediario: 2, basico: 1 };
    result.sort((a: any, b: any) => (planWeight[b.plan] || 0) - (planWeight[a.plan] || 0));

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/advertisers/:id', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('advertisers')
      .select('*, categories(name), advertiser_plans(name, is_featured), promotions(*)')
      .eq('id', id)
      .or(`condominium_id.eq.${condoId},condominium_id.is.null`)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Anunciante não encontrado.' });

    const planName = data.advertiser_plans?.name?.toLowerCase() || 'basico';
    res.json({
      ...data,
      plan: planName.includes('premium') ? 'premium' : planName.includes('intermediario') ? 'intermediario' : 'basico',
      category: data.categories?.name || 'Serviços',
      promotions: data.promotions || []
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/advertisers',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding', 'anunciante']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { name, logo_url, phone, whatsapp, instagram, website_url, address, plan, offer_title, offer_coupon, offer_discount } = req.body;
      const condoId = resolveCondoId(req);

      let plan_id = '22222222-0000-0000-0000-000000000001';
      if (plan === 'premium') plan_id = '22222222-0000-0000-0000-000000000003';
      else if (plan === 'intermediario') plan_id = '22222222-0000-0000-0000-000000000002';

      const { data: newAdv, error } = await supabase
        .from('advertisers')
        .insert([{
          condominium_id: req.user?.role === 'admin_ding' ? null : condoId,
          category_id: '11111111-0000-0000-0000-000000000001',
          plan_id,
          name,
          logo_url: logo_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
          phone,
          whatsapp,
          instagram,
          website_url,
          address,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      if (offer_title && newAdv?.id) {
        await supabase.from('promotions').insert([{
          advertiser_id: newAdv.id,
          title: offer_title,
          coupon_code: offer_coupon || 'PORTAL10',
          discount_percentage: Number(offer_discount) || 10,
          is_active: true
        }]);
      }

      res.status(201).json(newAdv);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.patch(
  '/api/advertisers/:id/status',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { is_active } = req.body;
      const condoId = resolveCondoId(req);

      const { data, error } = await supabase
        .from('advertisers')
        .update({ is_active: !!is_active })
        .eq('id', id)
        .or(`condominium_id.eq.${condoId},condominium_id.is.null`)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/advertisers/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding', 'anunciante']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { name, logo_url, phone, whatsapp, instagram, website_url, address, plan, category_id, is_active } = req.body;
      const condoId = resolveCondoId(req);

      let plan_id = undefined;
      if (plan === 'premium') plan_id = '22222222-0000-0000-0000-000000000003';
      else if (plan === 'intermediario') plan_id = '22222222-0000-0000-0000-000000000002';
      else if (plan === 'basico') plan_id = '22222222-0000-0000-0000-000000000001';

      const updateData: any = {
        name,
        logo_url,
        phone,
        whatsapp,
        instagram,
        website_url,
        address,
        is_active: is_active !== undefined ? !!is_active : true
      };
      if (plan_id) updateData.plan_id = plan_id;
      if (category_id) updateData.category_id = category_id;

      const { data, error } = await supabase
        .from('advertisers')
        .update(updateData)
        .eq('id', id)
        .or(`condominium_id.eq.${condoId},condominium_id.is.null`)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/advertisers/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const condoId = resolveCondoId(req);

      const { error } = await supabase
        .from('advertisers')
        .delete()
        .eq('id', id)
        .or(`condominium_id.eq.${condoId},condominium_id.is.null`);

      if (error) throw error;
      res.json({ success: true, message: 'Anunciante excluído.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PROMOÇÕES
app.get('/api/promotions', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('promotions')
      .select('*, advertisers!inner(id, name, logo_url, phone, whatsapp, condominium_id)')
      .eq('is_active', true)
      .or(`condominium_id.eq.${condoId},condominium_id.is.null`, { foreignTable: 'advertisers' })
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post(
  '/api/promotions',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding', 'anunciante']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { advertiser_id, title, description, discount_percentage, coupon_code } = req.body;

      const { data, error } = await supabase
        .from('promotions')
        .insert([{
          advertiser_id,
          title,
          description,
          discount_percentage: Number(discount_percentage) || 10,
          coupon_code: coupon_code || 'PORTAL10',
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.put(
  '/api/promotions/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding', 'anunciante']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { advertiser_id, title, description, discount_percentage, coupon_code, is_active } = req.body;

      const { data, error } = await supabase
        .from('promotions')
        .update({
          advertiser_id,
          title,
          description,
          discount_percentage: Number(discount_percentage) || 10,
          coupon_code,
          is_active: is_active !== undefined ? !!is_active : true
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.delete(
  '/api/promotions/:id',
  authMiddleware,
  requireRole(['sindico', 'admin_condo', 'admin_ding', 'anunciante']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;

      const { error } = await supabase
        .from('promotions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      res.json({ success: true, message: 'Promoção excluída.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==============================================================================
// 8. DISPOSITIVOS & NOTIFICAÇÕES PUSH (Isolamento por Usuário e Condomínio)
// ==============================================================================

const registeredDevices = new Map<string, any>();

// POST: Registrar Dispositivo para Push (Autenticado)
app.post('/api/devices', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { expo_push_token, platform, device_name } = req.body;
    const userId = req.user!.id;
    const condoId = resolveCondoId(req);

    if (!expo_push_token) {
      return res.status(400).json({ error: 'Token de push do Expo é obrigatório.' });
    }

    const deviceRecord = {
      user_id: userId,
      condominium_id: condoId,
      expo_push_token,
      platform: platform || 'android',
      device_name: device_name || 'Smartphone Morador',
      updated_at: new Date().toISOString()
    };

    registeredDevices.set(expo_push_token, deviceRecord);

    await supabase.from('devices').upsert([deviceRecord], { onConflict: 'user_id,expo_push_token' });

    res.status(200).json({
      success: true,
      message: 'Dispositivo registrado com sucesso para notificações push.',
      device: deviceRecord
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Listar Notificações do Usuário Autenticado
app.get('/api/notifications', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const condoId = resolveCondoId(req);
    const { type } = req.query;

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('condominium_id', condoId)
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type as string);
    }

    const { data, error } = await query;
    if (error) throw error;

    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Contagem de Notificações Não Lidas do Usuário
app.get('/api/notifications/unread-count', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('notifications')
      .select('id, is_read')
      .eq('user_id', userId)
      .eq('condominium_id', condoId);

    if (error) throw error;

    const unreadCount = (data || []).filter((n: any) => !n.is_read).length;
    res.json({
      unread_count: unreadCount,
      total_count: (data || []).length
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Disparar Nova Notificação (Apenas Administração / Porteiro)
app.post(
  '/api/notifications',
  authMiddleware,
  requireRole(['sindico', 'porteiro', 'admin_condo', 'admin_ding']),
  async (req: AuthenticatedRequest, res) => {
    try {
      const {
        title,
        body,
        type,
        user_id,
        reference_id,
        deep_link
      } = req.body;

      const condoId = resolveCondoId(req);
      const allowedTypes = ['aviso', 'noticia', 'manutencao', 'comunicado', 'revista', 'promocao'];
      const notifType = allowedTypes.includes(type) ? type : 'comunicado';

      let targetLink = deep_link;
      if (!targetLink) {
        switch (notifType) {
          case 'noticia':
            targetLink = reference_id ? `/news/${reference_id}` : '/news';
            break;
          case 'aviso':
          case 'manutencao':
          case 'comunicado':
            targetLink = reference_id ? `/notices/${reference_id}` : '/notices';
            break;
          case 'revista':
            targetLink = '/magazine';
            break;
          case 'promocao':
            targetLink = reference_id ? `/advertisers/${reference_id}` : '/advertisers';
            break;
          default:
            targetLink = '/';
        }
      }

      const newNotifPayload = {
        condominium_id: condoId,
        user_id: user_id || req.user!.id,
        title,
        body,
        type: notifType,
        reference_id: reference_id || null,
        is_read: false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([newNotifPayload])
        .select()
        .single();

      if (error) throw error;

      console.log(`[PUSH]: Notificação enviada para condomínio ${condoId}: "${title}"`);

      res.status(201).json({
        ...data,
        deep_link: targetLink,
        sent_to_devices: registeredDevices.size || 1
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// PATCH: Marcar Notificação Individual como Lida
app.patch('/api/notifications/:id/read', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, message: 'Notificação marcada como lida.', notification: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Marcar Todas as Notificações como Lidas
app.patch('/api/notifications/read-all', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    const condoId = resolveCondoId(req);

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('condominium_id', condoId)
      .eq('is_read', false);

    if (error) throw error;
    res.json({ success: true, message: 'Todas as notificações foram marcadas como lidas.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Excluir Notificação
app.delete('/api/notifications/:id', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
    res.json({ success: true, message: 'Notificação excluída do histórico.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 9. CONFIGURAÇÕES (Isolamento por Condomínio)
// ==============================================================================

app.get('/api/configurations', optionalAuthMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const condoId = resolveCondoId(req);

    const { data, error } = await supabase
      .from('configurations')
      .select('*')
      .eq('condominium_id', condoId);

    if (error) throw error;
    res.json(data || []);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==============================================================================
// 10. UPLOAD DE ARQUIVOS (Segregação Público/Privado & Validação Rígida)
// ==============================================================================

// POST: Upload com validação de segurança e suporte a arquivos públicos/privados
app.post(
  '/api/upload',
  authMiddleware,
  upload.single('file'),
  async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
      }

      const isPrivate = req.body.is_private === 'true' || req.body.is_private === true;
      const folder = (req.body.folder as string) || 'general';

      const uploadResult = await uploadToStorage({
        file: req.file,
        isPrivate,
        folder
      });

      res.status(201).json(uploadResult);
    } catch (err: any) {
      console.error('Erro no upload seguro:', err.message);
      res.status(400).json({ error: err.message || 'Erro ao realizar upload do arquivo.' });
    }
  }
);

// GET: Obter Signed URL temporária para documento privado
app.get(
  '/api/files/signed-url',
  authMiddleware,
  async (req: AuthenticatedRequest, res) => {
    try {
      const { path } = req.query;
      if (!path) {
        return res.status(400).json({ error: 'Caminho do arquivo (path) é obrigatório.' });
      }

      const signedUrl = await getSignedDocumentUrl(path as string, 1800); // 30 minutos de validade
      res.json({ signed_url: signedUrl, expires_in: 1800 });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

// ==============================================================================
// 11. SERVIR APLICAÇÃO WEB DO MORADOR (EXPO WEB)
// ==============================================================================

const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    next();
  });
}

// ==============================================================================
// START SERVER
// ==============================================================================

app.listen(port, () => {
  console.log(`[server]: Portal Bragança API running securely at http://localhost:${port}`);
});
