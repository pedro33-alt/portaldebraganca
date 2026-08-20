-- ==============================================================================
-- SEED DATA: RESIDENCIAL PORTAL DE BRAGANÇA
-- V3 (Portal de Bragança - Oficial)
-- ==============================================================================

-- 1. Inserir Condomínio Principal
INSERT INTO condominiums (id, name, slug, cnpj, address, city, state, primary_color, secondary_color)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Residencial Portal de Bragança',
    'portal-de-braganca',
    '12.345.678/0001-90',
    'Avenida Salvador Markovicz, 1251 - Lagos de Santa Helena',
    'Bragança Paulista',
    'SP',
    '#0E3B2E',
    '#D4AF37'
) ON CONFLICT (id) DO NOTHING;

-- 2. Configurações
INSERT INTO configurations (condominium_id, key, value) VALUES
('00000000-0000-0000-0000-000000000001', 'reservation_rules', '{"min_advance_hours": 24, "max_advance_days": 30}'),
('00000000-0000-0000-0000-000000000001', 'support_contact', '{"email": "suporte@portalbraganca.com.br", "phone": "(11) 4033-2358"}')
ON CONFLICT DO NOTHING;

-- 3. Categorias (Globais e Locais)
INSERT INTO categories (id, name, type) VALUES
('11111111-0000-0000-0000-000000000001', 'Gastronomia', 'advertiser'),
('11111111-0000-0000-0000-000000000002', 'Arquitetura e Decoração', 'advertiser'),
('11111111-0000-0000-0000-000000000003', 'Veterinária e Pet Shop', 'advertiser'),
('11111111-0000-0000-0000-000000000004', 'Comunicados Oficiais', 'news'),
('11111111-0000-0000-0000-000000000005', 'Eventos', 'news')
ON CONFLICT (id) DO NOTHING;

-- 4. Planos de Anunciantes
INSERT INTO advertiser_plans (id, name, description, price_monthly, max_promotions, is_featured) VALUES
('22222222-0000-0000-0000-000000000001', 'Básico', 'Presença no app', 99.90, 1, false),
('22222222-0000-0000-0000-000000000002', 'Intermediário', 'Presença e Destaque', 199.90, 3, true),
('22222222-0000-0000-0000-000000000003', 'Premium', 'Destaque VIP e Push Notifications', 399.90, 10, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Inserir Usuários Base
INSERT INTO users (id, email) VALUES
('20000000-0000-0000-0000-000000000001', 'morador@portalbraganca.com.br'),
('20000000-0000-0000-0000-000000000002', 'sindico@portalbraganca.com.br'),
('20000000-0000-0000-0000-000000000003', 'porteiro@portalbraganca.com.br'),
('20000000-0000-0000-0000-000000000004', 'admin@portalbraganca.com.br'),
('20000000-0000-0000-0000-000000000005', 'admin@dingpublicidade.com.br')
ON CONFLICT (id) DO NOTHING;

-- 6. Inserir Perfis
INSERT INTO profiles (user_id, name, phone, avatar_url) VALUES
('20000000-0000-0000-0000-000000000001', 'Carlos Silva (Morador)', '(11) 98765-4321', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'),
('20000000-0000-0000-0000-000000000002', 'Ana Oliveira (Síndica)', '(11) 98765-1111', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('20000000-0000-0000-0000-000000000003', 'Roberto Santos (Portaria)', '(11) 98765-2222', 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150'),
('20000000-0000-0000-0000-000000000004', 'Administração Residencial', '(11) 4033-2358', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'),
('20000000-0000-0000-0000-000000000005', 'Equipe DING Publicidade', '(11) 99999-9999', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150')
ON CONFLICT DO NOTHING;

-- 7. Moradores e Administradores
INSERT INTO residents (user_id, condominium_id, block, unit_number, is_primary) VALUES
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Alameda dos Lagos', '101', true),
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'Alameda Principal', '202', true)
ON CONFLICT DO NOTHING;

INSERT INTO administrators (user_id, condominium_id, role) VALUES
('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'sindico'),
('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'porteiro'),
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'admin_condo'),
('20000000-0000-0000-0000-000000000005', NULL, 'admin_ding')
ON CONFLICT DO NOTHING;
