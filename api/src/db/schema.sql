-- ==============================================================================
-- SCHEMA DDL: PORTAL BRAGANÇA / PLATAFORMA DING (MULTI-CONDOMÍNIO)
-- PostgreSQL / Supabase - V3 (Auditoria de Segurança, Multi-Tenant & RLS Rigoroso)
-- ==============================================================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TIPOS ENUM
DO $$ BEGIN
    CREATE TYPE admin_role AS ENUM ('sindico', 'porteiro', 'admin_condo', 'admin_ding');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. TABELAS PRINCIPAIS MULTI-TENANT E CORE

-- Condomínios cadastrados na plataforma DING
CREATE TABLE IF NOT EXISTS condominiums (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    cnpj VARCHAR(18),
    address TEXT,
    city VARCHAR(100) DEFAULT 'Bragança Paulista',
    state VARCHAR(2) DEFAULT 'SP',
    logo_url TEXT,
    banner_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#1E3A8A',
    secondary_color VARCHAR(7) DEFAULT '#3B82F6',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configurações específicas de cada condomínio
CREATE TABLE IF NOT EXISTS configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(condominium_id, key)
);

-- Usuários base (vinculado ao auth.users do Supabase)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Perfis base do usuário
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 3. CONTROLE DE ACESSO E PAPÉIS

-- Moradores (Vincula o usuário a um condomínio e unidade)
CREATE TABLE IF NOT EXISTS residents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    block VARCHAR(50),
    unit_number VARCHAR(50) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, condominium_id, block, unit_number)
);

-- Administradores (Síndico, Porteiro, Admin Condo, Admin DING)
CREATE TABLE IF NOT EXISTS administrators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE, -- NULL se for admin_ding (global)
    role admin_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, condominium_id, role)
);

-- 4. COMUNICAÇÃO, MURAL E CONTEÚDO

-- Categorias (para notícias e anunciantes)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE, -- NULL se for global (DING)
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'news', 'advertiser', 'occurrence'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mural de Avisos
CREATE TABLE IF NOT EXISTS notices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- 'normal', 'importante', 'urgente'
    expires_at TIMESTAMP WITH TIME ZONE,
    is_pinned BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notícias
CREATE TABLE IF NOT EXISTS news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    cover_image_url TEXT,
    is_published BOOLEAN DEFAULT TRUE,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Banners (Destaques da Home)
CREATE TABLE IF NOT EXISTS banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    link_url TEXT,
    order_index INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Revista Digital
CREATE TABLE IF NOT EXISTS magazines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    edition_number INT NOT NULL,
    publication_date DATE NOT NULL,
    cover_image_url TEXT NOT NULL,
    pdf_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dispositivos móveis registrados para Push
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    expo_push_token TEXT NOT NULL,
    platform VARCHAR(20) DEFAULT 'android',
    device_name VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, expo_push_token)
);

-- Notificações
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID NOT NULL REFERENCES condominiums(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'aviso', 'noticia', 'manutencao', 'comunicado', 'revista', 'promocao'
    reference_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CLUBE DING (ANUNCIANTES E OFERTAS)

-- Planos de Anunciantes
CREATE TABLE IF NOT EXISTS advertiser_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly NUMERIC(10,2) DEFAULT 0.00,
    max_promotions INT DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Anunciantes
CREATE TABLE IF NOT EXISTS advertisers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    condominium_id UUID REFERENCES condominiums(id) ON DELETE CASCADE, -- NULL se for anunciante global DING
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    plan_id UUID REFERENCES advertiser_plans(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    phone VARCHAR(20),
    whatsapp VARCHAR(20),
    instagram VARCHAR(100),
    website_url TEXT,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Promoções/Ofertas
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    advertiser_id UUID NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    discount_percentage INT,
    coupon_code VARCHAR(50),
    banner_url TEXT,
    valid_until DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- FUNÇÕES AUXILIARES DE SEGURANÇA E RLS (SECURITY DEFINER)
-- ==============================================================================

-- Verifica se o usuário atual é Administrador Global DING
CREATE OR REPLACE FUNCTION is_admin_ding()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM administrators 
        WHERE user_id = auth.uid() 
          AND role = 'admin_ding' 
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica se o usuário atual é Administrador/Síndico de um determinado condomínio (ou Admin DING)
CREATE OR REPLACE FUNCTION is_condo_admin(target_condo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF is_admin_ding() THEN
        RETURN TRUE;
    END IF;

    RETURN EXISTS (
        SELECT 1 FROM administrators 
        WHERE user_id = auth.uid() 
          AND condominium_id = target_condo_id 
          AND role IN ('sindico', 'admin_condo') 
          AND is_active = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Verifica se o usuário pertence a um condomínio (seja como morador, porteiro, síndico ou admin)
CREATE OR REPLACE FUNCTION is_condo_member(target_condo_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF is_admin_ding() THEN
        RETURN TRUE;
    END IF;

    RETURN (
        EXISTS (
            SELECT 1 FROM residents 
            WHERE user_id = auth.uid() 
              AND condominium_id = target_condo_id 
              AND is_active = true
        )
        OR
        EXISTS (
            SELECT 1 FROM administrators 
            WHERE user_id = auth.uid() 
              AND condominium_id = target_condo_id 
              AND is_active = true
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE condominiums ENABLE ROW LEVEL SECURITY;
ALTER TABLE configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE residents ENABLE ROW LEVEL SECURITY;
ALTER TABLE administrators ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE magazines ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;

-- 1. Condomínios: Leitura pública dos ativos; Modificação restrita ao Admin DING
CREATE POLICY "Public can view active condominiums" ON condominiums FOR SELECT 
    USING (is_active = true);
CREATE POLICY "Admin DING can manage condominiums" ON condominiums FOR ALL 
    USING (is_admin_ding());

-- 2. Configurações: Apenas membros do próprio condomínio podem ler; Síndicos/Admin DING podem alterar
CREATE POLICY "Members can view condo configurations" ON configurations FOR SELECT 
    USING (is_condo_member(condominium_id));
CREATE POLICY "Admins can manage condo configurations" ON configurations FOR ALL 
    USING (is_condo_admin(condominium_id));

-- 3. Perfis e Usuários: Usuário acessa seu próprio registro; Staff do condomínio ou Admin DING podem ver
CREATE POLICY "Users can manage own profile" ON profiles FOR ALL 
    USING (user_id = auth.uid());
CREATE POLICY "Staff can view resident profiles in their condo" ON profiles FOR SELECT 
    USING (
        EXISTS (
            SELECT 1 FROM residents r 
            WHERE r.user_id = profiles.user_id 
              AND is_condo_member(r.condominium_id)
        )
        OR is_admin_ding()
    );

-- 4. Moradores: Moradores e Staff veem moradores do mesmo condomínio; Modificação restrita a Síndico/Admin
CREATE POLICY "Members can view residents in same condo" ON residents FOR SELECT 
    USING (is_condo_member(condominium_id));
CREATE POLICY "Admins can manage residents" ON residents FOR ALL 
    USING (is_condo_admin(condominium_id));

-- 5. Administradores: Apenas Admin DING ou Síndico do condomínio podem ver/gerenciar
CREATE POLICY "Admins can view condo administrators" ON administrators FOR SELECT 
    USING (condominium_id IS NULL OR is_condo_member(condominium_id));
CREATE POLICY "Admin DING can manage administrators" ON administrators FOR ALL 
    USING (is_admin_ding());

-- 6. Categorias: Leitura para categorias globais ou do condomínio do usuário
CREATE POLICY "Users can view relevant categories" ON categories FOR SELECT 
    USING (condominium_id IS NULL OR is_condo_member(condominium_id));
CREATE POLICY "Admins can manage categories" ON categories FOR ALL 
    USING (condominium_id IS NULL AND is_admin_ding() OR is_condo_admin(condominium_id));

-- 7. Avisos (Notices): Isolamento total por condomínio
CREATE POLICY "Members can view condo notices" ON notices FOR SELECT 
    USING (is_condo_member(condominium_id));
CREATE POLICY "Admins can manage condo notices" ON notices FOR ALL 
    USING (is_condo_admin(condominium_id));

-- 8. Notícias (News): Isolamento total por condomínio
CREATE POLICY "Members can view published condo news" ON news FOR SELECT 
    USING (is_condo_member(condominium_id) AND (is_published = true OR is_condo_admin(condominium_id)));
CREATE POLICY "Admins can manage condo news" ON news FOR ALL 
    USING (is_condo_admin(condominium_id));

-- 9. Banners: Isolamento total por condomínio
CREATE POLICY "Members can view condo banners" ON banners FOR SELECT 
    USING (is_condo_member(condominium_id));
CREATE POLICY "Admins can manage condo banners" ON banners FOR ALL 
    USING (is_condo_admin(condominium_id));

-- 10. Revistas Digitais (Magazines): Isolamento total por condomínio
CREATE POLICY "Members can view condo magazines" ON magazines FOR SELECT 
    USING (is_condo_member(condominium_id));
CREATE POLICY "Admins can manage condo magazines" ON magazines FOR ALL 
    USING (is_condo_admin(condominium_id));

-- 11. Dispositivos e Notificações: Apenas o próprio usuário acessa seus dispositivos/notificações
CREATE POLICY "Users can manage own devices" ON devices FOR ALL 
    USING (user_id = auth.uid());

CREATE POLICY "Users can view and update own notifications" ON notifications FOR SELECT 
    USING (user_id = auth.uid());
CREATE POLICY "Users can mark own notifications as read" ON notifications FOR UPDATE 
    USING (user_id = auth.uid());
CREATE POLICY "Admins can send notifications" ON notifications FOR INSERT 
    WITH CHECK (is_condo_admin(condominium_id));
CREATE POLICY "Admins can delete notifications" ON notifications FOR DELETE 
    USING (is_condo_admin(condominium_id) OR user_id = auth.uid());

-- 12. Anunciantes e Promoções: Anunciantes globais ou locais
CREATE POLICY "Public can view plans" ON advertiser_plans FOR SELECT USING (true);
CREATE POLICY "Admin DING can manage plans" ON advertiser_plans FOR ALL USING (is_admin_ding());

CREATE POLICY "Members can view relevant advertisers" ON advertisers FOR SELECT 
    USING (is_active = true AND (condominium_id IS NULL OR is_condo_member(condominium_id)));
CREATE POLICY "Admins can manage advertisers" ON advertisers FOR ALL 
    USING (condominium_id IS NULL AND is_admin_ding() OR is_condo_admin(condominium_id));

CREATE POLICY "Members can view active promotions" ON promotions FOR SELECT 
    USING (
        is_active = true AND EXISTS (
            SELECT 1 FROM advertisers a 
            WHERE a.id = promotions.advertiser_id 
              AND (a.condominium_id IS NULL OR is_condo_member(a.condominium_id))
        )
    );
CREATE POLICY "Admins can manage promotions" ON promotions FOR ALL 
    USING (
        EXISTS (
            SELECT 1 FROM advertisers a 
            WHERE a.id = promotions.advertiser_id 
              AND (a.condominium_id IS NULL AND is_admin_ding() OR is_condo_admin(a.condominium_id))
        )
    );

-- ==============================================================================
-- CONFIGURAÇÃO DE BUCKETS E POLÍTICAS DE SUPABASE STORAGE
-- ==============================================================================

-- Inserir os dois buckets segregados (public-assets e private-documents) caso não existam
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('public-assets', 'public-assets', true),
    ('private-documents', 'private-documents', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Política de Storage: Leitura pública apenas para public-assets
CREATE POLICY "Public can view public-assets" ON storage.objects FOR SELECT 
    USING (bucket_id = 'public-assets');

-- Política de Storage: Upload e gerenciamento em public-assets requer autenticação
CREATE POLICY "Authenticated users can upload to public-assets" ON storage.objects FOR INSERT 
    WITH CHECK (bucket_id = 'public-assets' AND auth.role() = 'authenticated');

CREATE POLICY "Admins can manage public-assets" ON storage.objects FOR ALL 
    USING (bucket_id = 'public-assets' AND auth.role() = 'authenticated');

-- Política de Storage: Acesso estritamente privado em private-documents
CREATE POLICY "Restricted access to private-documents" ON storage.objects FOR ALL 
    USING (bucket_id = 'private-documents' AND auth.role() = 'authenticated');

-- ==============================================================================
-- FIM DO ARQUIVO
-- ==============================================================================
