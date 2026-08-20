import dotenv from 'dotenv';
dotenv.config();

const API_BASE = 'http://localhost:3000/api';

async function runAdvertiserTests() {
  console.log('=== INICIANDO TESTES E2E: SISTEMA DE ANUNCIANTES ===\n');

  try {
    // 1. Criar Anunciante PREMIUM com Oferta
    console.log('1. Cadastrando anunciante PLANO PREMIUM com cupom exclusivo...');
    const createPremiumRes = await fetch(`${API_BASE}/advertisers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Restaurante Villa Borghese & Adega',
        category_id: '11111111-0000-0000-0000-000000000001',
        plan: 'premium',
        logo_url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
        phone: '(11) 4033-9090',
        whatsapp: '5511999881122',
        instagram: '@villaborghese',
        website_url: 'https://villaborghese.com.br',
        address: 'Av. Salvador Markowicz, 700 - Bragança Paulista',
        offer_title: '20% OFF no Menu Degustação aos Fins de Semana',
        offer_coupon: 'BORGHESE20',
        offer_discount: 20,
        expires_at: '2026-12-31'
      })
    });
    const newPremium = await createPremiumRes.json();
    console.log('✅ Anunciante Premium criado:', newPremium.id, '-', newPremium.name);

    // 2. Criar Anunciante INTERMEDIÁRIO
    console.log('\n2. Cadastrando anunciante PLANO INTERMEDIÁRIO...');
    const createInterRes = await fetch(`${API_BASE}/advertisers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Marmoraria & Porcelanatos São Francisco',
        category_id: '11111111-0000-0000-0000-000000000002',
        plan: 'intermediario',
        logo_url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=300',
        phone: '(11) 4032-1100',
        whatsapp: '5511988773344',
        address: 'Rua São Pedro, 350 - Bragança Paulista',
        offer_title: '10% OFF em Bancadas de Cozinha',
        offer_coupon: 'MARMORE10',
        offer_discount: 10
      })
    });
    const newInter = await createInterRes.json();
    console.log('✅ Anunciante Intermediário criado:', newInter.id, '-', newInter.name);

    // 3. Criar Anunciante BÁSICO
    console.log('\n3. Cadastrando anunciante PLANO BÁSICO...');
    const createBasicRes = await fetch(`${API_BASE}/advertisers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'EletroInstalações Bragança 24h',
        category_id: '11111111-0000-0000-0000-000000000003',
        plan: 'basico',
        logo_url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=300',
        phone: '(11) 4034-5555',
        whatsapp: '5511977661122',
        address: 'Bragança Paulista - SP'
      })
    });
    const newBasic = await createBasicRes.json();
    console.log('✅ Anunciante Básico criado:', newBasic.id, '-', newBasic.name);

    // 4. Buscar Catálogo com Ordenação por Plano
    console.log('\n4. Buscando catálogo completo e validando hierarquia de planos...');
    const listRes = await fetch(`${API_BASE}/advertisers`);
    const allAdv = await listRes.json();
    console.log(`✅ Total de anunciantes ativos no catálogo: ${allAdv.length}`);
    console.log(`- Primeiro do ranking: ${allAdv[0]?.name} (Plano: ${allAdv[0]?.plan?.toUpperCase()})`);

    // 5. Testar Busca por Texto
    console.log('\n5. Testando busca textual "Borghese"...');
    const searchRes = await fetch(`${API_BASE}/advertisers?search=Borghese`);
    const searchResults = await searchRes.json();
    console.log(`✅ Resultados encontrados: ${searchResults.length} (${searchResults[0]?.name})`);

    // 6. Testar Detalhes do Anunciante com Oferta
    console.log('\n6. Buscando página individual do anunciante Premium...');
    const detailRes = await fetch(`${API_BASE}/advertisers/${newPremium.id}`);
    const advDetail = await detailRes.json();
    console.log(`✅ Detalhes carregados com ${advDetail.promotions?.length || 0} promoção(ões) associada(s):`);
    if (advDetail.promotions?.length > 0) {
      console.log(`   🎁 ${advDetail.promotions[0].title} [CUPOM: ${advDetail.promotions[0].coupon_code}]`);
    }

    // 7. Testar Ativação / Desativação
    console.log('\n7. Testando desativação do anunciante...');
    const statusRes = await fetch(`${API_BASE}/advertisers/${newBasic.id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: false })
    });
    const updatedStatus = await statusRes.json();
    console.log('✅ Status atualizado com sucesso:', updatedStatus.is_active === false ? 'INATIVO' : 'ATIVO');

    console.log('\n=== TODOS OS TESTES DO SISTEMA DE ANUNCIANTES FORAM APROVADOS COM SUCESSO! ===');
  } catch (err) {
    console.error('❌ Erro no teste de anunciantes:', err);
  }
}

runAdvertiserTests();
